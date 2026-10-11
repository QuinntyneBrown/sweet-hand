import type { ProfileStatus } from './profile-status';
import type { ReviewHistoryView } from './review-history-view';

export interface NameChangeReviewView {
  kind: 'name-change';
  id: string;
  name: string;
  newName: string;
  status: ProfileStatus;
  slug: string;
  newSlug: string;
  requestedAt: string;
  requestedBy: string;
  owner: string;
  card: { photo: string; alt: string; cuisine: string; area: string };
  history: ReviewHistoryView[];
}
