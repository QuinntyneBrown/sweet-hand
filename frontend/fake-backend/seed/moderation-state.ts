import type { Owner } from './owner.ts';
import type { StatusChange } from './status-change.ts';
import type { ProfileSnapshot } from './profile-snapshot.ts';
import type { ProfileEdit } from './profile-edit.ts';
import type { Enquiry } from './enquiry.ts';
import type { ModerationEmail } from './moderation-email.ts';

export interface ModerationState {
  owners: Record<string, Owner>;
  /** Oldest first, per caterer id. */
  history: Record<string, StatusChange[]>;
  /** The last "Changes requested" decision, per caterer id. */
  snapshots: Record<string, ProfileSnapshot>;
  /** When the caterer asked for the pending name, per caterer id. */
  nameRequestedAt: Record<string, string>;
  /** When the daily job found the certificate expired, and the reminders sent before (L2-040.2–3). */
  expiredCertificates: Record<string, { detectedAt: string; reminders: string[] }>;
  /** The last change to each record, for the caterer list's order. */
  updatedAt: Record<string, string>;
  edits: ProfileEdit[];
  /** Open enquiries closed by a suspension, per caterer id. */
  closedBySuspension: Record<string, number>;
  /** The enquiry a reviewed event came from, per review id: what a report about the review links to (L2-034.3). */
  reviewEnquiries: Record<string, Enquiry>;
  /** Time-limited certificate links (L2-040.4). */
  certificateLinks: Record<string, { catererId: string; expiresAt: string }>;
  emails: ModerationEmail[];
}
