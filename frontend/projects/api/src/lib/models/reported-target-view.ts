import type { ProfileStatus } from './profile-status';
import type { ReviewCertificateView } from './review-certificate-view';

export type ReportedTargetView =
  | {
      kind: 'Review';
      reviewId: string;
      caterer: { name: string; photo: string | null };
      author: string;
      rating: number;
      text: string;
      eventDate: string;
      status: 'Published' | 'Held' | 'Hidden' | 'Removed';
      /** Why a hidden review is hidden. */
      hiddenBy: 'reports' | 'operator' | null;
      hiddenAt: string | null;
    }
  | {
      kind: 'CatererProfile';
      catererId: string;
      name: string;
      photo: string | null;
      cuisine: string;
      area: string;
      owner: string;
      status: ProfileStatus;
      certificate: ReviewCertificateView | null;
    };
