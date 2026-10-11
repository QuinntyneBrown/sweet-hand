import type { OwnProfileStatus } from './own-profile-status';
import type { OwnPhotoView } from './own-photo-view';
import type { OwnDishView } from './own-dish-view';
import type { CertificateView } from './certificate-view';
import type { ChecklistItemView } from './checklist-item-view';
import type { AttentionView } from './attention-view';
import type { PhotoRendition } from './photo-rendition';

/** The signed-in caterer's own profile as the editor sees it (set-up-profile design). */
export interface OwnProfileView {
  id: string;
  /** The public name; a pending change waits in `pendingName` (L2-044.2). */
  name: string;
  slug: string;
  status: OwnProfileStatus;
  /** When the status last changed: submitted, changes requested, suspended or removed. */
  statusChangedAt: string | null;
  /** The operator's words for changes requested, suspension or removal. */
  statusReason: string | null;
  /** When the profile was last approved (Published only). */
  publishedAt: string | null;
  pendingName: { name: string; requestedAt: string } | null;
  contactName: string;
  email: string;
  emailVerified: boolean;
  description: string;
  /** Cuisine ids; `primaryCuisine` is one of them. */
  cuisines: string[];
  primaryCuisine: string | null;
  /** Service area ids; `primaryArea` is one of them. */
  areas: string[];
  primaryArea: string | null;
  minGuests: number | null;
  maxGuests: number | null;
  /** Occasion ids. */
  occasions: string[];
  photos: OwnPhotoView[];
  dishes: OwnDishView[];
  certificate: CertificateView | null;
  checklist: ChecklistItemView[];
  attention: AttentionView[];
  /** The listing card's photo: the cover (photo 1), when ready. */
  cover: { alt: string; image: PhotoRendition } | null;
}
