import { breaches } from '../../operator-settings/model.ts';
import type { Scenarios } from '../scenario.ts';

/** Named state changes for the operator settings specs (the fake's `operatorSettingsScenarios`). */
export const operatorSettingsScenarios: Scenarios = {
  /** docs/mocks/pages/admin-breaches/empty.html */
  'no-breaches': async ({ tx }) => {
    for (const b of await breaches(tx).all()) await breaches(tx).delete(b.id);
  },
};
