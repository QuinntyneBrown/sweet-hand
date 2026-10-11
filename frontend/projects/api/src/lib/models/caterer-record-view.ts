import type { ProfileStatus } from './profile-status';
import type { OwnerView } from './owner-view';
import type { ReviewCertificateView } from './review-certificate-view';
import type { StatusChangeView } from './status-change-view';

export interface CatererRecordView {
  id: string;
  name: string;
  slug: string;
  status: ProfileStatus;
  photo: string | null;
  pendingName: string | null;
  owner: OwnerView;
  profile: {
    photos: { id: string; src: string; alt: string }[];
    /** Primary first. */
    cuisines: string[];
    /** Primary first. */
    areas: string[];
    minGuests: number;
    maxGuests: number;
    occasions: string[];
    dishes: { id: string; name: string }[];
    description: string;
  };
  certificate: ReviewCertificateView | null;
  /** When the expiry reminders went out (L2-040.2). */
  certificateReminders: string[];
  activity: { enquiries: number; openEnquiries: number; rating: { average: number; count: number }; openReports: number };
  /** Newest first. */
  history: StatusChangeView[];
  /** Set while suspended. */
  suspension: { at: string; closedEnquiries: number } | null;
  /** Set once removed. */
  removal: { at: string } | null;
}
