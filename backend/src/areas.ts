import type { Area } from './http/router.ts';
import { identityArea } from './identity/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [identityArea];
