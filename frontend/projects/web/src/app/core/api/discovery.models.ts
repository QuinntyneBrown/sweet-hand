/** Wire types for public browsing (ADR 0003). Shared with the fake backend; keep import-free. */

export interface PhotoView {
  /** The caterer's caption for the photo (L2-006.4, L2-068.1). */
  alt: string;
  /** The 800 px rendition, the fallback `src`. */
  src: string;
  /** AVIF renditions at 400, 800 and 1200 px (L2-006.1, L2-006.2). */
  srcset: string;
  /** Intrinsic size of `src`; reserves the square before the image arrives (L2-006.5). */
  width: number;
  height: number;
}

export interface ListingCardView {
  slug: string;
  name: string;
  primaryCuisine: string;
  primaryArea: string;
  cover: PhotoView;
}

export interface FacetOption {
  id: string;
  name: string;
  /** Published caterers that match this option combined with the other active filters (L2-008.3). */
  count: number;
}

export interface RegionFacet extends FacetOption {
  areas: FacetOption[];
}

export interface ListingQuery {
  cuisines: string[];
  regions: string[];
  areas: string[];
  occasion?: string;
  page: number;
}

export interface ListingPageView {
  items: ListingCardView[];
  total: number;
  /** The page actually shown: out-of-range requests fall back to 1 (L2-002.5). */
  page: number;
  pageSize: number;
  pageCount: number;
  cuisines: FacetOption[];
  regions: RegionFacet[];
  occasions: FacetOption[];
}

export interface ServiceArea {
  id: string;
  name: string;
  regionId: string;
  regionName: string;
}

export interface CuisineRef {
  id: string;
  name: string;
}

export interface Occasion {
  id: string;
  name: string;
}

export interface OccasionTile extends Occasion {
  count: number;
  photo: PhotoView;
}
