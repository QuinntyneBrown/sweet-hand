import { type Observable } from 'rxjs';
import type { EnquiryMetrics, MetricsQuery, MetricsReport } from '../models/metrics.models';

/**
 * The operator metrics dashboard and its CSV export (view-metrics-dashboard,
 * export-metrics). A range over 24 months answers 400 with `errors.from`.
 */
export abstract class MetricsService {
  abstract report(query: MetricsQuery): Observable<MetricsReport>;
  abstract enquiries(query: MetricsQuery): Observable<EnquiryMetrics>;
  /** The CSV file and the name the server gave it (L2-063.1). */
  abstract exportCsv(query: MetricsQuery): Observable<{ filename: string; file: Blob }>;
}
