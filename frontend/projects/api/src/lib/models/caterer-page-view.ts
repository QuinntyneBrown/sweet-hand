import type { CatererPhotoView } from './caterer-photo-view';
import type { CatererDishView } from './caterer-dish-view';
import type { CatererRegionView } from './caterer-region-view';
import type { RatingSummaryView } from './rating-summary-view';

/**
 * The allow-listed public view of one published caterer (L2-014): no contact
 * details, certificate, notes, status or unapproved edits.
 */
export interface CatererPageView {
  slug: string;
  name: string;
  /** Cuisine names, primary first. */
  cuisines: string[];
  description: string;
  minGuests: number;
  maxGuests: number;
  /** Occasion names in the caterer's order. */
  occasions: string[];
  /** In the caterer's order, cover first (L2-016.1). */
  photos: CatererPhotoView[];
  dishes: CatererDishView[];
  regions: CatererRegionView[];
  rating: RatingSummaryView;
}
