/** Moderating reviews: approve, hide, restore or remove, each with a reason (moderate-reviews design, L2-059, L2-050.3). */
import type { Request, Reply } from '../http/router.ts';
import { conflict, invalid, noContent, notFound, ok } from '../http/problems.ts';
import { recordAudit } from '../platform/audit.ts';
import { queueEmail } from '../platform/outbox.ts';
import { caterers } from '../caterers/model.ts';
import { liveUser, users } from '../identity/model.ts';
import { reviews, type Review, type ReviewStatus } from '../reviews/model.ts';
import { hiddenReview, shownReview } from './report-handling.ts';
import { reviewerLabel, trimmed } from './views.ts';
import type { ModeratedReview } from '@contract/moderated-review.ts';
import type { ModerationAction } from '@contract/moderation-action.ts';
import type { ModerationList } from '@contract/moderation-list.ts';
import type { ModerationStatus } from '@contract/moderation-status.ts';

const PHONE = /(?:\+?1[\s.-]?)?\(?\d{3}\)?[\s.-]\d{3}[\s.-]\d{4}/g;
const MAIL = /[^\s@]+@[^\s@]+\.[a-z]{2,}/gi;
const LINK = /\b(?:https?:\/\/|www\.)\S+|\b[a-z0-9-]+\.(?:com|ca|net|org|io|to|co)(?:\/\S*)?/gi;

/** What the L2-050 check matched, in reading order. */
function heldFor(text: string): NonNullable<ModeratedReview['held']> {
  const find = (re: RegExp) => [...text.matchAll(re)].map((m) => ({ start: m.index!, end: m.index! + m[0].replace(/[.,!?)]+$/, '').length }));
  const phones = find(PHONE);
  const mails = find(MAIL);
  const links = find(LINK).filter((l) => !mails.some((m) => l.start < m.end && m.start < l.end));
  const reason = phones.length ? 'phone' : mails.length ? 'email' : 'link';
  return { reason, ranges: [...phones, ...mails, ...links].sort((a, b) => a.start - b.start) };
}

/** Case- and accent-insensitive comparison key, so "HAÏTIAN" matches "Haitian". */
const fold = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .trim();

/** GET /api/operator/reviews?status=held|hidden&q= */
export async function reviewsToModerate(req: Request): Promise<Reply> {
  const status: ModerationStatus = req.query.get('status') === 'hidden' ? 'Hidden' : 'Held';
  const q = fold(req.query.get('q') ?? '');
  const waiting = [...(await reviews(req.tx).find({ status: 'Held' })), ...(await reviews(req.tx).find({ status: 'Hidden' }))];
  const views: (ModeratedReview & { author: string })[] = [];
  for (const r of waiting) {
    const c = await caterers(req.tx).get(r.catererId);
    const hiddenBy = r.hidden?.by ? ((await users(req.tx).get(r.hidden.by))?.displayName ?? null) : null;
    views.push({
      id: r.id,
      status: r.status as ModerationStatus,
      catererName: c?.name ?? r.catererId,
      catererSlug: c?.slug ?? '',
      catererPhoto: `/media/${c?.photos[0]?.file ?? 'pelau-house.jpg'}?w=400&fm=jpeg`,
      reviewer: reviewerLabel(r.authorName),
      rating: r.rating,
      text: r.text,
      eventDate: r.eventDate,
      held: r.status === 'Held' ? heldFor(r.text) : null,
      hidden: r.status === 'Hidden' ? { by: hiddenBy, reports: r.hidden?.reports ?? 0, reason: r.hidden?.reason ?? '' } : null,
      at: r.status === 'Hidden' ? (r.hidden?.at ?? r.hiddenAt ?? r.createdAt) : r.createdAt,
      author: fold(r.authorName),
    });
  }
  const list = views
    .filter((v) => v.status === status)
    .filter((v) => !q || fold(v.catererName).includes(q) || fold(v.reviewer).includes(q) || v.author.includes(q))
    .sort((a, b) => Date.parse(b.at) - Date.parse(a.at) || a.id.localeCompare(b.id))
    .map(({ author: _author, ...view }) => view);
  const body: ModerationList = { held: views.filter((v) => v.status === 'Held').length, hidden: views.filter((v) => v.status === 'Hidden').length, reviews: list };
  return ok(body);
}

const TRANSITIONS: Record<ModerationAction, { from: ReviewStatus[]; to: ReviewStatus; action: string; email: string }> = {
  approve: { from: ['Held'], to: 'Published', action: 'ApproveReview', email: 'review-approved' },
  hide: { from: ['Held', 'Published'], to: 'Hidden', action: 'HideReview', email: 'review-hidden' },
  restore: { from: ['Hidden'], to: 'Published', action: 'RestoreReview', email: 'review-restored' },
  remove: { from: ['Held', 'Published', 'Hidden'], to: 'Removed', action: 'RemoveReview', email: 'review-removed' },
};

/** POST /api/operator/reviews/:id/:action — { reason }; the author is emailed the reason (L2-059). */
export async function moderateReview(req: Request): Promise<Reply> {
  const transition = Object.hasOwn(TRANSITIONS, req.params['action']) ? TRANSITIONS[req.params['action'] as ModerationAction] : undefined;
  const review = await reviews(req.tx).get(req.params['id']);
  if (!transition || !review) return notFound();
  const reason = trimmed(req.body?.reason);
  if (!reason) return invalid({ reason: ['Add a reason for this decision'] });
  if (!transition.from.includes(review.status)) return conflict('This review has already been moderated', { status: review.status });
  const operatorId = req.actor!.userId;
  let next: Review;
  if (transition.to === 'Hidden') next = hiddenReview(review, operatorId, reason, req.now);
  else if (transition.to === 'Removed') next = { ...review, status: 'Removed', text: '', response: undefined, hidden: undefined, hiddenBy: undefined, hiddenAt: undefined };
  else next = shownReview(review);
  await reviews(req.tx).put(next);
  await recordAudit(req.tx, req.now, { operatorId, action: transition.action, targetType: 'review', targetId: review.id, reason, before: review.status, after: transition.to });
  const author = await liveUser(req.tx, review.authorUserId);
  if (author) await queueEmail(req.tx, req.now, { to: author.email, kind: transition.email, reason });
  return noContent();
}
