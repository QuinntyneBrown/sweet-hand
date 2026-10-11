import type { ReportTargetKind } from './reports.ts';

export interface Report {
  id: string;
  targetKind: ReportTargetKind;
  /** The caterer's id or the review's id. */
  targetId: string;
  reason: 'Inaccurate information' | 'Inappropriate content' | 'Fake or spam' | 'Food safety concern' | 'Other';
  details?: string;
  /** Empty for a visitor who was not signed in (L2-054). Never in public responses (L2-054.5). */
  reporterUserId?: string;
  /** Which connection sent it, for the hourly limit (L2-054.3); a hash in the real system. */
  connection?: string;
  createdAt: string;
  status: 'Open' | 'Resolved';
  /** Set when an operator resolves it (L2-055.3–4). */
  resolution?: {
    at: string;
    byUserId: string;
    outcome: 'dismissed' | 'hidden' | 'review-removed' | 'suspended' | 'removed';
    note: string;
    auditId: string;
  };
}
