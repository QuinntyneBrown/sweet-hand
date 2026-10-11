/** Wire types for reporting content (ADR 0003, docs/detailed-designs/moderation/report-content). Keep import-free. */

/** The fixed reasons of L2-054. */
export type ReportReason = 'Inaccurate information' | 'Inappropriate content' | 'Fake or spam' | 'Food safety concern' | 'Other';

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

/** HTTP 409 body when the signed-in reporter's earlier report is still open (L2-054.4). */
export interface ReportDuplicate {
  title: string;
  reportedAt: string;
}
