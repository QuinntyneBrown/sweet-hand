import type { AuditEntry } from './audit-entry';

/** An audit entry with the names an Admin reads. */
export interface AuditEntryView extends AuditEntry {
  operatorName: string;
  targetLabel: string;
}
