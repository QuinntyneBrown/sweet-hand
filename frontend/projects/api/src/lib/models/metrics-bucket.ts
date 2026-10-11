/** One time bucket: a day, a Monday-to-Sunday week or a calendar month in Toronto. */
export interface MetricsBucket {
  /** YYYY-MM-DD: the day, the week's Monday or the month's first day. */
  start: string;
  /** Holds today: still running. */
  current: boolean;
}
