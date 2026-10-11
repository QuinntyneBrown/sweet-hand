import type { Document, Transaction } from '../platform/database.ts';
import type { ReportReason } from '@contract/report-reason.ts';

export type ReportTargetKind = 'CatererProfile' | 'Review';

/** A report about a caterer profile or a review (L2-054, L2-055). */
export interface Report extends Document {
  targetKind: ReportTargetKind;
  /** The caterer's id or the review's id. */
  targetId: string;
  reason: ReportReason;
  details?: string;
  /** Empty for a visitor who was not signed in (L2-054). Never in public responses (L2-054.5). */
  reporterUserId?: string;
  /** Keyed hash of the connection that sent it, for the hourly limit (L2-054.3). */
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

export const reports = (tx: Transaction) => tx.collection<Report>('reports');
