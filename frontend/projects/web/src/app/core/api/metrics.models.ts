/** Wire types of the operator metrics dashboard and export (ADR 0003). Shared with the fake backend; keep import-free. */

export type Granularity = 'day' | 'week' | 'month';

export interface MetricsQuery {
  /** YYYY-MM-DD in Toronto, inclusive. */
  from: string;
  to: string;
  granularity: Granularity;
}

/** One time bucket: a day, a Monday-to-Sunday week or a calendar month in Toronto. */
export interface MetricsBucket {
  /** YYYY-MM-DD: the day, the week's Monday or the month's first day. */
  start: string;
  /** Holds today: still running. */
  current: boolean;
}

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

/** Enquiries and replies for the same range, served separately so visits still show if these fail. */
export interface EnquiryMetrics {
  buckets: MetricsBucket[];
  enquiries: number[];
  /** Share replied within 48 hours, 0–100, or null when no enquiry in the bucket is 48 hours old yet. */
  repliedShare: (number | null)[];
  repliedOverall: number | null;
}
