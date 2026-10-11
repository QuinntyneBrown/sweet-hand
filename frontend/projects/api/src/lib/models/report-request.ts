import type { ReportReason } from './report-reason';

export interface ReportRequest {
  targetKind: 'CatererProfile' | 'Review';
  /** The caterer's slug or the review's id. */
  targetId: string;
  reason: ReportReason;
  /** Up to 1,000 characters; required for "Other" (L2-054.2). */
  details: string;
  /** From the bot-protection widget (ADR 0003, L2-082.2). */
  challengeToken: string;
}
