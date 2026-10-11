import { caterers } from '../../caterers/model.ts';
import { profileEdits, statusHistory } from '../../moderation/model.ts';
import { queueItems } from '../../moderation/queue.ts';
import { torontoDate } from '../../discovery/listing.ts';
import { hiddenReview } from '../../moderation/report-handling.ts';
import { enquiries } from '../../enquiries/model.ts';
import { reports, type Report } from '../../reports/model.ts';
import { reviews } from '../../reviews/model.ts';
import type { Scenarios } from '../scenario.ts';

const hoursAgo = (now: Date, hours: number) => new Date(now.getTime() - hours * 3600_000).toISOString();

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
  /** Nothing waits for a decision (admin-queue/empty). */
  'empty-review-queue': async ({ tx, now }) => {
    const today = torontoDate(now);
    for (const c of await caterers(tx).all()) {
      const expired = c.certificate && c.certificate.expires < today;
      if (c.status !== 'Pending review' && !c.pendingName && !expired) continue;
      await caterers(tx).put({
        ...c,
        status: c.status === 'Pending review' ? 'Draft' : c.status,
        pendingName: undefined,
        pendingNameAt: undefined,
        certificate: expired ? { ...c.certificate!, expires: '2030-01-01' } : c.certificate,
      });
    }
    for (const r of await reports(tx).find({ status: 'Open' })) await reports(tx).put({ ...r, status: 'Resolved' });
    for (const r of await reviews(tx).find({ status: 'Held' })) await reviews(tx).put({ ...r, status: 'Published' });
  },
  /** 34 items: the queue topped up with new profiles, 8 of them waiting 4 to 11 days (admin-queue/long). */
  'long-review-queue': async ({ tx, now }) => {
    const all = await caterers(tx).all();
    const template = all.find((c) => c.slug === 'auntie-bevs-kitchen')!;
    const more = 34 - (await queueItems(tx, now)).length;
    for (let i = 0; i < more; i++) {
      const id = `cat-l${String(i + 1).padStart(2, '0')}`;
      const like = all[i % 36];
      await caterers(tx).put({
        ...template,
        id,
        slug: `sample-kitchen-${i + 1}`,
        name: `Sample Kitchen ${i + 1}`,
        cuisines: like.cuisines,
        areas: like.areas,
        photos: [{ ...like.photos[0], id: `${id}-photo-1` }],
        previousSlugs: [],
      });
      const at = i < 8 ? hoursAgo(now, (11 - i) * 24) : hoursAgo(now, 1 + i);
      await statusHistory(tx).put({ id: `status-${id}-submitted`, catererId: id, at, seq: 1, status: 'Pending review', by: 'Sample Owner', step: 'submitted' });
    }
  },
  /** A review held back by the automatic checks (L2-050.3): { caterer, author, holdReason }. */
  'hold-review': async ({ tx, now }, { caterer, author, holdReason }: { caterer: string; author: string; holdReason: 'phone' | 'email' | 'link' }) => {
    const c = (await caterers(tx).findOne({ slug: caterer }))!;
    await reviews(tx).put({
      id: `review-held-${(await reviews(tx).all()).length + 1}`,
      catererId: c.id,
      authorName: author,
      rating: 5,
      text: 'Lovely food. Call me on 416-555-0199 if you want the recipe.',
      eventDate: '2026-09-26',
      createdAt: hoursAgo(now, 2),
      status: 'Held',
      holdReason,
    });
  },
  /** A visitor reports a caterer now: { caterer, reason }. Returns the report id. */
  'new-report': async ({ tx, now }, { caterer, reason }: { caterer: string; reason: Report['reason'] }) => {
    const c = (await caterers(tx).findOne({ slug: caterer }))!;
    const id = `R-${2100 + (await reports(tx).all()).length}`;
    await reports(tx).put({ id, targetKind: 'CatererProfile', targetId: c.id, reason, details: 'Two guests were unwell the next day.', createdAt: now.toISOString(), status: 'Open' });
    return { id };
  },
};
