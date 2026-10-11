import type { Granularity } from './granularity';
import type { MetricsBucket } from './metrics-bucket';

/** Visits and caterers for a range (view-metrics-dashboard, L2-061). */
export interface MetricsReport {
  from: string;
  to: string;
  granularity: Granularity;
  /** First day with figures. */
  countingSince: string;
  /** False when the whole range is before counting started. */
  hasData: boolean;
  buckets: MetricsBucket[];
  listingVisits: number[];
  catererVisits: number[];
  uniqueVisitors: number[];
  newPublished: number[];
  /** Caterers by status at the end of the range, Published first. */
  statuses: { status: string; count: number }[];
}
