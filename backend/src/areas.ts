import type { Area } from './http/router.ts';
import { accountArea } from './account/routes.ts';
import { reportsArea } from './reports/routes.ts';
import { operatorSettingsArea } from './operator-settings/routes.ts';
import { catererProfileArea } from './caterer-profile/routes.ts';
import { moderationArea } from './moderation/routes.ts';

/** Every product feature area, in registration order. */
export const productAreas: Area[] = [
  accountArea,
  reportsArea,
  operatorSettingsArea,
  catererProfileArea,
  moderationArea,
];
