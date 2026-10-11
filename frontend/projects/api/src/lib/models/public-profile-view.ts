import type { ReviewPhotoView } from './review-photo-view';
import type { ReviewDishView } from './review-dish-view';

/** How the profile will appear publicly (L2-047.2): the public fields only. */
export interface PublicProfileView {
  name: string;
  cuisines: string[];
  /** Paragraphs, as written. */
  description: string[];
  /** Paragraphs the resubmission removed (L2-047.3). */
  removedParagraphs: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  photos: ReviewPhotoView[];
  dishes: ReviewDishView[];
  regions: { name: string; areas: string[] }[];
}
