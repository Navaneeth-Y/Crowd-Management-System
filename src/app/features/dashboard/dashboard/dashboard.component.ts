
import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin, Subscription } from 'rxjs';

import { AnalyticsApiService } from '../services/analytics-api.service';
import {
  DemographicsResponse,
  DwellResponse,
  FootfallResponse,
  OccupancyResponse,
  Site
} from '../models/analytics.model';

import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';
import { AuthService } from '../../../core/services/auth.service';
import {
  SocketService,
  LiveOccupancyEvent,
  CrowdAlertEvent
} from '../../../core/services/socket.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    LoadingSpinnerComponent,
    ErrorMessageComponent
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly subscriptions = new Subscription();

  sites: Site[] = [];
  selectedSiteId = '';
  fromDate = '';
  toDate = '';

  loading = false;
  siteLoading = true;
  errorMessage = '';

  footfall: FootfallResponse | null = null;
  dwell: DwellResponse | null = null;
  occupancy: OccupancyResponse | null = null;
  demographics: DemographicsResponse | null = null;

  liveOccupancy: LiveOccupancyEvent | null = null;
  alerts: CrowdAlertEvent[] = [];

  constructor(
    private readonly api: AnalyticsApiService,
    private readonly auth: AuthService,
    private readonly socket: SocketService
  ) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);

    this.fromDate = this.toInput(start);
    this.toDate = this.toInput(now);
  }

  ngOnInit(): void {
    this.subscriptions.add(
      this.api.getSites().subscribe({
        next: (sites) => {
          this.sites = sites;
          this.siteLoading = false;

          if (sites.length > 0) {
            this.selectedSiteId = sites[0].siteId;
            this.loadAnalytics();
          }
        },
        error: () => {
          this.siteLoading = false;
          this.errorMessage =
            'Could not load sites. Check API access and your login session.';
        }
      })
    );

    const token = this.auth.getToken();

    if (token) {
      this.socket.connect(token);
    } else {
      console.warn(
        '[Dashboard] No authentication token available for Socket.IO.'
      );
    }

    this.subscriptions.add(
      this.socket.occupancy$.subscribe((event) => {
        if (!event) {
          return;
        }

        // Ignore events for sites other than the selected site.
        if (event.siteId !== this.selectedSiteId) {
          return;
        }

        this.liveOccupancy = event;
      })
    );

    this.subscriptions.add(
      this.socket.alerts$.subscribe((event) => {
        if (!event) {
          return;
        }

        // Filter alerts by site when the event provides a siteId.
        if (
          event.siteId &&
          event.siteId !== this.selectedSiteId
        ) {
          return;
        }

        this.alerts = [event, ...this.alerts].slice(0, 5);
      })
    );
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();

    // Do not disconnect the root-provided socket here:
    // other components may share the same service.
  }

  get selectedSite(): Site | undefined {
    return this.sites.find(
      (site) => site.siteId === this.selectedSiteId
    );
  }

  
get liveZoneName(): string {
  const event = this.liveOccupancy;

  if (!event) {
    return 'Waiting for live occupancy data';
  }

  // Use the readable name supplied by the live event, if available.
  if (event.zoneName?.trim()) {
    return event.zoneName;
  }

  // Otherwise, look up the zone ID in the selected site's zones.
  const zone = this.selectedSite?.zones?.find(
    (item) => item.zoneId === event.zoneId
  );

  return zone?.name || 'Zone name unavailable';
}


  get occupancyValues(): number[] {
    return this.occupancy?.buckets.map(
      (bucket) => bucket.avg
    ) ?? [];
  }

  get demographicsMaxValues(): number[] {
    return this.demographics?.buckets.map(
      (bucket) => Math.max(bucket.male, bucket.female)
    ) ?? [];
  }

  onSiteChange(): void {
    this.liveOccupancy = null;
    this.alerts = [];

    this.loadAnalytics();
  }

  loadAnalytics(): void {
    if (
      !this.selectedSiteId ||
      !this.fromDate ||
      !this.toDate
    ) {
      return;
    }

    const from = new Date(this.fromDate).getTime();
    const to = new Date(this.toDate).getTime();

    if (
      !Number.isFinite(from) ||
      !Number.isFinite(to) ||
      from > to
    ) {
      this.errorMessage =
        'Choose a valid date range. The start must not be after the end.';
      return;
    }

    this.errorMessage = '';
    this.loading = true;

    const request = {
      siteId: this.selectedSiteId,
      fromUtc: from,
      toUtc: to
    };

    this.subscriptions.add(
      forkJoin({
        footfall: this.api.getFootfall(request),
        dwell: this.api.getDwell(request),
        occupancy: this.api.getOccupancy(request),
        demographics: this.api.getDemographics(request)
      }).subscribe({
        next: (result) => {
          this.footfall = result.footfall;
          this.dwell = result.dwell;
          this.occupancy = result.occupancy;
          this.demographics = result.demographics;
          this.loading = false;
        },
        error: (error: unknown) => {
          const candidate = error as {
            error?: {
              errorMessage?: string;
              message?: string;
            };
          };

          this.errorMessage =
            candidate.error?.errorMessage ||
            candidate.error?.message ||
            'Unable to load analytics. Confirm the API is reachable and the selected date range contains data.';

          this.loading = false;
        }
      })
    );
  }

  barHeight(value: number, values: number[]): number {
    const max = Math.max(...values, 1);
    return Math.max(4, Math.round((value / max) * 100));
  }

  private toInput(date: Date): string {
    const local = new Date(
      date.getTime() - date.getTimezoneOffset() * 60000
    );

    return local.toISOString().slice(0, 16);
  }
}
