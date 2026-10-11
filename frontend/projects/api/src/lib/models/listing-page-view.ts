import type { ListingCardView } from './listing-card-view';
import type { FacetOption } from './facet-option';
import type { RegionFacet } from './region-facet';

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
