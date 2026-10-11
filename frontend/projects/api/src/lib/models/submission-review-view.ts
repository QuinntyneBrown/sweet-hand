import type { ProfileStatus } from './profile-status';
import type { PublicProfileView } from './public-profile-view';
import type { OwnerView } from './owner-view';
import type { ReviewCertificateView } from './review-certificate-view';
import type { SubmissionChecks } from './submission-checks';
import type { ReviewHistoryView } from './review-history-view';

export interface SubmissionReviewView {
  kind: 'submission';
  id: string;
  name: string;
  status: ProfileStatus;
  cover: string | null;
  submittedAt: string;
  resubmitted: boolean;
  /** The decision the caterer answered, for a resubmission. */
  changesRequested: { by: string; at: string; reason: string } | null;
  /** How many fields changed since that decision. */
  changedFields: number;
  descriptionChanged: boolean;
  profile: PublicProfileView;
  contact: OwnerView;
  certificate: ReviewCertificateView | null;
  checks: SubmissionChecks;
  history: ReviewHistoryView[];
}
