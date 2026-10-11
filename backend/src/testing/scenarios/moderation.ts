import { caterers } from '../../caterers/model.ts';
import type { Scenarios } from '../scenario.ts';

/** Named arrangements of the operator moderation specs (frontend/e2e/specs/operator/moderation). */
export const moderationScenarios: Scenarios = {
  /**
   * Kendra asked at 6:20 p.m. on Fri 9 Oct to rename Pelau House (L2-044.2).
   * Shared with the caterer-profile area, which may define it too.
   */
  'pelau-name-change-pending': async ({ tx }) => {
    const c = await caterers(tx).findOne({ slug: 'pelau-house' });
    if (c) await caterers(tx).put({ ...c, pendingName: 'Pelau House by Kendra', pendingNameAt: '2026-10-09T22:20:00.000Z' });
  },
  /** First run: no caterer has registered (admin-caterers/empty). */
  'no-caterers': async ({ tx }) => {
    for (const c of await caterers(tx).all()) await caterers(tx).delete(c.id);
  },
};
