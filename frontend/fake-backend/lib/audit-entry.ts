/** One operator action (L2-060.1): who, what, on which record, when (UTC), why, and the values before and after. */
export interface AuditEntry {
  id: string;
  at: string;
  operatorId: string;
  action: string;
  targetType: string;
  targetId: string;
  reason: string | null;
  before: unknown;
  after: unknown;
}
