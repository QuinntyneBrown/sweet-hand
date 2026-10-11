import type { Area } from './http/router.ts';
import { catererProfileArea } from './caterer-profile/routes.ts';
import { moderationArea } from './moderation/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [
  catererProfileArea,
  moderationArea,
];
