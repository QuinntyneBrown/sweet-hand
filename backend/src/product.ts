import type { AppOptions } from './app.ts';
import { productAreas } from './areas.ts';
import { authenticate } from './identity/sessions.ts';

/** The product's routes and request hooks, shared by main.ts and the acceptance tests. */
export function productOptions(): Pick<AppOptions, 'areas' | 'authenticate' | 'onDenied'> {
  return { areas: productAreas, authenticate };
}
