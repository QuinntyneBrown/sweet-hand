import { InjectionToken } from '@angular/core';
import { type Observable } from 'rxjs';
import type { EnquiryMetrics, MetricsQuery, MetricsReport } from '../models/metrics.models';

/**
 * The operator metrics dashboard and its CSV export (view-metrics-dashboard,
 * export-metrics). A range over 24 months answers 400 with `errors.from`.
 */
export interface IMetricsService {
  report(query: MetricsQuery): Observable<MetricsReport>;
  enquiries(query: MetricsQuery): Observable<EnquiryMetrics>;
  /** The CSV file and the name the server gave it (L2-063.1). */
  exportCsv(query: MetricsQuery): Observable<{ filename: string; file: Blob }>;
}

export const METRICS_SERVICE = new InjectionToken<IMetricsService>('METRICS_SERVICE');
