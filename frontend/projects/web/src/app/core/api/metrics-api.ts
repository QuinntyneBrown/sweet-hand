import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, type Observable } from 'rxjs';
import type { EnquiryMetrics, MetricsQuery, MetricsReport } from './metrics.models';

/**
 * The operator metrics dashboard and its CSV export (view-metrics-dashboard,
 * export-metrics). A range over 24 months answers 400 with `errors.from`.
 */
export abstract class MetricsApi {
  abstract report(query: MetricsQuery): Observable<MetricsReport>;
  abstract enquiries(query: MetricsQuery): Observable<EnquiryMetrics>;
  /** The CSV file and the name the server gave it (L2-063.1). */
  abstract exportCsv(query: MetricsQuery): Observable<{ filename: string; file: Blob }>;
}

const params = (q: MetricsQuery) => new HttpParams().set('from', q.from).set('to', q.to).set('granularity', q.granularity);

@Injectable()
export class HttpMetricsApi extends MetricsApi {
  private readonly http = inject(HttpClient);

  report(query: MetricsQuery): Observable<MetricsReport> {
    return this.http.get<MetricsReport>('/api/operator/metrics', { params: params(query) });
  }

  enquiries(query: MetricsQuery): Observable<EnquiryMetrics> {
    return this.http.get<EnquiryMetrics>('/api/operator/metrics/enquiries', { params: params(query) });
  }

  exportCsv(query: MetricsQuery): Observable<{ filename: string; file: Blob }> {
    return this.http.get('/api/operator/metrics/export.csv', { params: params(query), responseType: 'blob', observe: 'response' }).pipe(
      map((res) => ({
        filename: /filename="?([^";]+)"?/.exec(res.headers.get('content-disposition') ?? '')?.[1] ?? 'sweet-hand-metrics.csv',
        file: res.body ?? new Blob([], { type: 'text/csv' }),
      })),
    );
  }
}
