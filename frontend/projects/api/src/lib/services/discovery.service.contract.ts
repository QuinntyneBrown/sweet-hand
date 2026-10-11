import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CuisineRef, ListingPageView, ListingQuery, OccasionTile, ServiceArea } from '../models/discovery.models';

/** Public browsing contract (ADR 0003): listing, taxonomies and postal code lookup. */
export interface IDiscoveryService {
  listing(query: ListingQuery): Observable<ListingPageView>;
  serviceAreas(): Observable<ServiceArea[]>;
  /** The active cuisines, A to Z (L2-007). */
  cuisines(): Observable<CuisineRef[]>;
  /** The eight occasions with how many published caterers take each on (L2-021). */
  occasions(): Observable<OccasionTile[]>;
  /** Resolves a forward sortation area; only the FSA is ever sent (L2-012.6). */
  resolveFsa(fsa: string): Observable<{ id: string; name: string }>;
}

export const DISCOVERY_SERVICE = new InjectionToken<IDiscoveryService>('DISCOVERY_SERVICE');
