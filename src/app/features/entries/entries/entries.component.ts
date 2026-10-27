import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { AnalyticsApiService } from '../../dashboard/services/analytics-api.service';
import { Site } from '../../dashboard/models/analytics.model';
import { EntriesApiService } from '../services/entries-api.service';
import { EntryRecord, EntryExitResponse } from '../entry.model';
import { LoadingSpinnerComponent } from '../../../shared/components/loading-spinner/loading-spinner.component';
import { ErrorMessageComponent } from '../../../shared/components/error-message/error-message.component';

@Component({
  selector: 'app-entries',
  standalone: true,
  imports: [CommonModule, FormsModule, LoadingSpinnerComponent, ErrorMessageComponent],
  templateUrl: './entries.component.html',
  styleUrl: './entries.component.scss'
})
export class EntriesComponent implements OnInit {
  sites: Site[] = [];
  selectedSiteId = '';
  fromDate = '';
  toDate = '';
  searchTerm = '';
  pageSize = 10;
  pageNumber = 1;
  loading = false;
  errorMessage = '';
  result: EntryExitResponse | null = null;

  constructor(private readonly analytics: AnalyticsApiService, private readonly entriesApi: EntriesApiService) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    this.fromDate = this.toInput(start);
    this.toDate = this.toInput(now);
  }

  ngOnInit(): void {
    this.analytics.getSites().subscribe({
      next: (sites) => {
        this.sites = sites;
        if (sites.length) {
          this.selectedSiteId = sites[0].siteId;
          this.load();
        }
      },
      error: () => this.errorMessage = 'Could not load sites. Check API access and your login session.'
    });
  }

  get filteredRecords(): EntryRecord[] {
    const records = this.result?.records ?? [];
    const term = this.searchTerm.trim().toLowerCase();
    return term ? records.filter((record) => record.personName.toLowerCase().includes(term)) : records;
  }

  load(): void {
    if (!this.selectedSiteId || !this.fromDate || !this.toDate) return;
    const fromUtc = new Date(this.fromDate).getTime();
    const toUtc = new Date(this.toDate).getTime();
    if (!Number.isFinite(fromUtc) || !Number.isFinite(toUtc) || fromUtc > toUtc) {
      this.errorMessage = 'Choose a valid date range.';
      return;
    }
    this.loading = true;
    this.errorMessage = '';
    this.entriesApi.getEntries({
      siteId: this.selectedSiteId, fromUtc, toUtc,
      pageSize: this.pageSize, pageNumber: this.pageNumber
    }).subscribe({
      next: (result) => { this.result = result; this.loading = false; },
      error: () => { this.errorMessage = 'Unable to load entry/exit records for this date range.'; this.loading = false; }
    });
  }

  changePage(nextPage: number): void {
    if (!this.result || nextPage < 1 || nextPage > this.result.totalPages) return;
    this.pageNumber = nextPage;
    this.load();
  }

  severityClass(severity: string): string {
    const normalized = severity.toLowerCase();
    if (normalized.includes('high') || normalized.includes('critical')) return 'high';
    if (normalized.includes('medium') || normalized.includes('warning')) return 'medium';
    return 'low';
  }

  private toInput(date: Date): string {
    const local = new Date(date.getTime() - date.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }
}
