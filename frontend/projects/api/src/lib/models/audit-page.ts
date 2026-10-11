import type { AuditEntryView } from './audit-entry-view';

export interface AuditPage {
  entries: AuditEntryView[];
  total: number;
  page: number;
  pageSize: number;
  /** False only while the log holds no entries at all. */
  anyEntries: boolean;
  operators: { id: string; name: string }[];
}
