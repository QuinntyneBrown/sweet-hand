import type { Granularity } from './granularity';

export interface MetricsQuery {
  /** YYYY-MM-DD in Toronto, inclusive. */
  from: string;
  to: string;
  granularity: Granularity;
}
