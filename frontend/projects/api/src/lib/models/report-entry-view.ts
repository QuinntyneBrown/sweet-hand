import type { ReportReason } from './report-reason';

export interface ReportEntryView {
  reason: ReportReason;
  details: string | null;
  at: string;
  /** Whether a signed-in customer sent it; reporters are never named (L2-054.5). */
  signedIn: boolean;
}
