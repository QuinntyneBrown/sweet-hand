export interface RatingSummaryView {
  /** Average of published reviews (L2-051.1); meaningless when `count` is 0. */
  average: number;
  count: number;
}
