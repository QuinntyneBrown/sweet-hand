import type { Area } from './http/router.ts';
import { identityArea } from './identity/routes.ts';
import { accountArea } from './account/routes.ts';
import { enquiriesArea } from './enquiries/routes.ts';
import { reviewsArea } from './reviews/routes.ts';
import { reportsArea } from './reports/routes.ts';
import { operatorSettingsArea } from './operator-settings/routes.ts';
import { catererProfileArea } from './caterer-profile/routes.ts';
import { moderationArea } from './moderation/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [
  identityArea,
  accountArea,
  enquiriesArea,
  reviewsArea,
  reportsArea,
  operatorSettingsArea,
  catererProfileArea,
  moderationArea,
];
