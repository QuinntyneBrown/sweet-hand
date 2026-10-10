import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { ListingPageView, ListingQuery, ServiceArea } from './discovery.models';

/** Public browsing contract (ADR 0003): listing, taxonomies and postal code lookup. */
export abstract class DiscoveryApi {
  abstract listing(query: ListingQuery): Observable<ListingPageView>;
  abstract serviceAreas(): Observable<ServiceArea[]>;
  /** Resolves a forward sortation area; only the FSA is ever sent (L2-012.6). */
  abstract resolveFsa(fsa: string): Observable<{ id: string; name: string }>;
}

@Injectable()
export class HttpDiscoveryApi extends DiscoveryApi {
  private readonly http = inject(HttpClient);

  listing(query: ListingQuery): Observable<ListingPageView> {
    let params = new HttpParams();
    for (const c of query.cuisines) params = params.append('cuisine', c);
    for (const r of query.regions) params = params.append('region', r);
    for (const a of query.areas) params = params.append('area', a);
    if (query.occasion) params = params.set('occasion', query.occasion);
    if (query.page > 1) params = params.set('page', query.page);
    return this.http.get<ListingPageView>('/api/public/caterers', { params });
  }

  serviceAreas(): Observable<ServiceArea[]> {
    return this.http.get<ServiceArea[]>('/api/public/service-areas');
  }

  resolveFsa(fsa: string): Observable<{ id: string; name: string }> {
    return this.http.get<{ id: string; name: string }>(`/api/public/fsa/${encodeURIComponent(fsa)}`);
  }
}
