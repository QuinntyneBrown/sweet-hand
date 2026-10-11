import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import type { Observable } from 'rxjs';
import type { CatererPageView } from './caterer-page.models';

/**
 * A caterer's public page (ADR 0003, docs/detailed-designs/discovery/view-caterer-page).
 * A retired slug answers 301 to the current one, which the browser follows;
 * a removed caterer answers 410 and any other unpublished one 404.
 */
export abstract class CatererPageApi {
  abstract caterer(slug: string): Observable<CatererPageView>;
}

@Injectable()
export class HttpCatererPageApi extends CatererPageApi {
  private readonly http = inject(HttpClient);

  caterer(slug: string): Observable<CatererPageView> {
    return this.http.get<CatererPageView>(`/api/public/caterers/${encodeURIComponent(slug)}`);
  }
}
