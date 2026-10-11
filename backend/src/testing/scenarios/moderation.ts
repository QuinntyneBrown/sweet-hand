import { caterers } from '../../caterers/model.ts';
import { profileEdits } from '../../moderation/model.ts';
import { hiddenReview, shownReview } from '../../moderation/report-handling.ts';
import { enquiries } from '../../enquiries/model.ts';
import { reports } from '../../reports/model.ts';
import { reviews } from '../../reviews/model.ts';
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
  /** No caterer edited a published profile in the last 30 days (admin-changes/empty). */
  'no-recent-changes': async ({ tx }) => {
    for (const e of await profileEdits(tx).all()) await profileEdits(tx).delete(e.id);
  },
  /** A third report in 7 days hides Devon W.'s review automatically (L2-055.2; admin-report/auto-hidden). */
  'third-report': async ({ tx }) => {
    const at = '2026-10-10T12:05:00.000Z';
    await reports(tx).put({
      id: 'R-2049',
      targetKind: 'Review',
      targetId: 'review-devon-maracas',
      reason: 'Fake or spam',
      details: 'Copy-paste review. I’ve seen it on other pages.',
      reporterUserId: 'user-andre',
      createdAt: at,
      status: 'Open',
    });
    const review = await reviews(tx).get('review-devon-maracas');
    if (review) await reviews(tx).put(hiddenReview(review, null, '', new Date(at), 3));
  },
  /** Devon's review no longer links to an enquiry (L2-034.4). */
  'unlink-review-enquiry': async ({ tx }) => {
    for (const e of await enquiries(tx).find({ customerId: 'user-devon', catererId: 'cat-009' })) await enquiries(tx).delete(e.id);
  },
  /** docs/mocks/pages/admin-reviews/empty.html: nothing held, nothing hidden. */
  'no-reviews-to-moderate': async ({ tx }) => {
    for (const r of await reviews(tx).all()) if (r.status === 'Held' || r.status === 'Hidden') await reviews(tx).put(shownReview(r));
  },
};
