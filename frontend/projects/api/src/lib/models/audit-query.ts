export interface AuditQuery {
  operator?: string;
  /** Comma-separated action keys. */
  action?: string;
  target?: string;
  from?: string;
  to?: string;
  page?: number;
}
