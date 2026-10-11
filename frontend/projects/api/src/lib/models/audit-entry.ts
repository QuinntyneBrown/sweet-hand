/** One audit entry as stored (query-audit-log): append-only. */
export interface AuditEntry {
  id: string;
  /** UTC. */
  at: string;
  operatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string;
  before: string | null;
  after: string | null;
}
