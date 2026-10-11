import type { MetricsBucket } from './metrics-bucket';

/** Enquiries and replies for the same range, served separately so visits still show if these fail. */
export interface EnquiryMetrics {
  buckets: MetricsBucket[];
  enquiries: number[];
  /** Share replied within 48 hours, 0–100, or null when no enquiry in the bucket is 48 hours old yet. */
  repliedShare: (number | null)[];
  repliedOverall: number | null;
}
