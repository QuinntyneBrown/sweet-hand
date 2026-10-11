import type { Area } from './http/router.ts';
import { identityArea } from './identity/routes.ts';
import { discoveryArea } from './discovery/routes.ts';
import { mediaArea } from './discovery/media-routes.ts';
import { accountArea } from './account/routes.ts';
import { enquiriesArea } from './enquiries/routes.ts';
import { reviewsArea } from './reviews/routes.ts';
import { reportsArea } from './reports/routes.ts';
import { operatorSettingsArea } from './operator-settings/routes.ts';
import { catererProfileArea } from './caterer-profile/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [
  identityArea,
  discoveryArea,
  mediaArea,
  accountArea,
  enquiriesArea,
  reviewsArea,
  reportsArea,
  operatorSettingsArea,
  catererProfileArea,
];
