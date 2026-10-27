import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';
import { EntryExitResponse } from '../entry.model';

@Injectable({ providedIn: 'root' })
export class EntriesApiService {
  constructor(private readonly http: HttpClient) {}

  getEntries(request: { siteId: string; fromUtc: number; toUtc: number; pageSize: number; pageNumber: number }): Observable<EntryExitResponse> {
    return this.http.post<EntryExitResponse>(`${environment.apiBaseUrl}/api/analytics/entry-exit`, request);
  }
}
