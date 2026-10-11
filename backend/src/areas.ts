import type { Area } from './http/router.ts';
import { moderationArea } from './moderation/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [
  moderationArea,
];
