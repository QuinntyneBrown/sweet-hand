import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CuisineRef, ListingPageView, ListingQuery, OccasionTile, ServiceArea } from '../models/discovery.models';
import { DiscoveryService } from './discovery.service';

@Injectable()
export class HttpDiscoveryService extends DiscoveryService {
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

  occasions(): Observable<OccasionTile[]> {
    return this.http.get<OccasionTile[]>('/api/public/occasions');
  }

  cuisines(): Observable<CuisineRef[]> {
    return this.http.get<CuisineRef[]>('/api/public/cuisines');
  }

  serviceAreas(): Observable<ServiceArea[]> {
    return this.http.get<ServiceArea[]>('/api/public/service-areas');
  }

  resolveFsa(fsa: string): Observable<{ id: string; name: string }> {
    return this.http.get<{ id: string; name: string }>(`/api/public/fsa/${encodeURIComponent(fsa)}`);
  }
}
