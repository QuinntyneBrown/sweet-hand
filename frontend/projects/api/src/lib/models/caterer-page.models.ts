/** Wire types for a caterer's public page (ADR 0003). Shared with the fake backend; keep import-free. */

/** The fixed dietary list of L2-017.3, in its canonical order. */
export type DietaryTag = 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' | 'halal' | 'contains-nuts' | 'contains-shellfish' | 'spicy';

export interface CatererPhotoView {
  /** The caterer's caption: the photo's text alternative (L2-068.1). */
  caption: string;
  /** The 800 px rendition. */
  src: string;
  /** Renditions at 400, 800 and 1200 px. */
  srcset: string;
  width: number;
  height: number;
  /** The rendition the full-screen viewer loads. */
  viewerSrc: string;
}

export interface CatererDishView {
  name: string;
  description: string | null;
  /** Price guidance as the caterer wrote it ("From $16 per person"). */
  price: string | null;
  tags: DietaryTag[];
}

export interface CatererRegionView {
  name: string;
  /** Area names in the caterer's order. */
  areas: string[];
}

export interface RatingSummaryView {
  /** Average of published reviews (L2-051.1); meaningless when `count` is 0. */
  average: number;
  count: number;
}

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

/** HTTP 410 body for a removed caterer (L2-018.5). Carries nothing about the old profile. */
export interface CatererGoneView {
  title: string;
  /** Published caterers, for "There are 60 other caterers…". */
  publishedCount: number;
}
