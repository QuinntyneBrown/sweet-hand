import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { ReportRequest } from './reports.models';

/**
 * Reports of a caterer or a review (ADR 0003). Anonymous by explicit choice:
 * anyone may report (L2-054). 409 means already reported, 429 too many.
 */
export abstract class ReportsApi {
  abstract submit(report: ReportRequest): Observable<{ id: string }>;
}

@Injectable()
export class HttpReportsApi extends ReportsApi {
  private readonly http = inject(HttpClient);

  submit(report: ReportRequest): Observable<{ id: string }> {
    return this.http.post<{ id: string }>('/api/reports', report);
  }
}
