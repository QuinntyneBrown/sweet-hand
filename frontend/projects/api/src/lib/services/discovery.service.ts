import type { Observable } from 'rxjs';
import type { CuisineRef, ListingPageView, ListingQuery, OccasionTile, ServiceArea } from '../models/discovery.models';

/** Public browsing contract (ADR 0003): listing, taxonomies and postal code lookup. */
export abstract class DiscoveryService {
  abstract listing(query: ListingQuery): Observable<ListingPageView>;
  abstract serviceAreas(): Observable<ServiceArea[]>;
  /** The active cuisines, A to Z (L2-007). */
  abstract cuisines(): Observable<CuisineRef[]>;
  /** The eight occasions with how many published caterers take each on (L2-021). */
  abstract occasions(): Observable<OccasionTile[]>;
  /** Resolves a forward sortation area; only the FSA is ever sent (L2-012.6). */
  abstract resolveFsa(fsa: string): Observable<{ id: string; name: string }>;
}
