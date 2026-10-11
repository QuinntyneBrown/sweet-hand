import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { ReportRequest } from '../models/reports.models';

/**
 * Reports of a caterer or a review (ADR 0003). Anonymous by explicit choice:
 * anyone may report (L2-054). 409 means already reported, 429 too many.
 */
export interface IReportsService {
  submit(report: ReportRequest): Observable<{ id: string }>;
}

export const REPORTS_SERVICE = new InjectionToken<IReportsService>('REPORTS_SERVICE');
