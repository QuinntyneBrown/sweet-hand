import type { Observable } from 'rxjs';
import type { CatererPageView } from '../models/caterer-page-view';

/**
 * A caterer's public page (ADR 0003, docs/detailed-designs/discovery/view-caterer-page).
 * A retired slug answers 301 to the current one, which the browser follows;
 * a removed caterer answers 410 and any other unpublished one 404.
 */
export abstract class CatererPageService {
  abstract caterer(slug: string): Observable<CatererPageView>;
}
