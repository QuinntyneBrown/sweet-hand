import type { Area } from './http/router.ts';
import { identityArea } from './identity/routes.ts';
import { discoveryArea } from './discovery/routes.ts';
import { mediaArea } from './discovery/media-routes.ts';
import { moderationArea } from './moderation/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [identityArea, discoveryArea, mediaArea, moderationArea];
