import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import {
  AnalyticsRequest, DemographicsResponse, DwellResponse, EntryExitRequest,
  EntryExitResponse, FootfallResponse, OccupancyResponse, Site
} from '../models/analytics.model';

@Injectable({ providedIn: 'root' })
export class AnalyticsApiService {
  private readonly baseUrl = environment.apiBaseUrl;

  constructor(private readonly http: HttpClient) {}

  getSites(): Observable<Site[]> {
    return this.http.get<Site[]>(`${this.baseUrl}/api/sites`);
  }

  getFootfall(request: AnalyticsRequest): Observable<FootfallResponse> {
    return this.http.post<FootfallResponse>(`${this.baseUrl}/api/analytics/footfall`, request);
  }

  getDwell(request: AnalyticsRequest): Observable<DwellResponse> {
    return this.http.post<DwellResponse>(`${this.baseUrl}/api/analytics/dwell`, request);
  }

  getOccupancy(request: AnalyticsRequest): Observable<OccupancyResponse> {
    return this.http.post<OccupancyResponse>(`${this.baseUrl}/api/analytics/occupancy`, request);
  }

  getDemographics(request: AnalyticsRequest): Observable<DemographicsResponse> {
    return this.http.post<DemographicsResponse>(`${this.baseUrl}/api/analytics/demographics`, request);
  }

  getEntryExit(request: EntryExitRequest): Observable<EntryExitResponse> {
    return this.http.post<EntryExitResponse>(`${this.baseUrl}/api/analytics/entry-exit`, request);
  }
}
