import type { ReportedTargetView } from './reported-target-view';
import type { ReportEntryView } from './report-entry-view';
import type { ReportOutcome } from './report-outcome';

export interface ReportGroupView {
  /** The first report's id ("R-2041"). */
  id: string;
  status: 'Open' | 'Resolved';
  since: string;
  target: ReportedTargetView;
  reports: ReportEntryView[];
  linkedEnquiry: { customer: string; caterer: string; eventDate: string; guests: number; status: string } | null;
  resolution: { at: string; by: string; outcome: ReportOutcome; note: string; auditId: string; reporterEmailed: boolean } | null;
}
