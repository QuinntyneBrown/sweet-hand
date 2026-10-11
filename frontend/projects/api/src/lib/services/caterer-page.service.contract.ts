import { InjectionToken } from '@angular/core';
import type { Observable } from 'rxjs';
import type { CatererPageView } from '../models/caterer-page.models';

/**
 * A caterer's public page (ADR 0003, docs/detailed-designs/discovery/view-caterer-page).
 * A retired slug answers 301 to the current one, which the browser follows;
 * a removed caterer answers 410 and any other unpublished one 404.
 */
export interface ICatererPageService {
  caterer(slug: string): Observable<CatererPageView>;
}

export const CATERER_PAGE_SERVICE = new InjectionToken<ICatererPageService>('CATERER_PAGE_SERVICE');
