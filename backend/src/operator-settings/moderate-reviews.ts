import type { Request, Reply } from '../http/router.ts';
import { conflict, invalid, noContent, notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { recordAudit } from '../platform/audit.ts';
import { queueEmail } from '../platform/outbox.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { liveUser, users } from '../identity/model.ts';
import { reviews, type Review, type ReviewStatus } from '../reviews/model.ts';
import type { ModeratedReview } from '@contract/moderated-review.ts';
import type { ModerateReviewRequest } from '@contract/moderate-review-request.ts';
import type { ModerationAction } from '@contract/moderation-action.ts';
import type { ModerationList } from '@contract/moderation-list.ts';
import type { ModerationStatus } from '@contract/moderation-status.ts';
import { fold } from './text.ts';

/** moderate-reviews: approve, hide, restore or remove a review, each with a reason (L2-059). */

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

/** "Devon W." */
function shortName(full: string): string {
  const [first, ...rest] = full.split(/\s+/);
  const last = rest.at(-1);
  return last ? `${first} ${last[0]}.` : first;
}

async function moderatedView(tx: Transaction, review: Review, caterer: Caterer | undefined): Promise<ModeratedReview> {
  const hider = review.hidden?.by ? await users(tx).get(review.hidden.by) : undefined;
  return {
    id: review.id,
    status: review.status as ModerationStatus,
    catererName: caterer?.name ?? review.catererId,
    catererSlug: caterer?.slug ?? '',
    catererPhoto: `/media/${caterer?.photos[0]?.file ?? 'pelau-house.jpg'}?w=400&fm=jpeg`,
    reviewer: shortName(review.authorName),
    rating: review.rating,
    text: review.text,
    eventDate: review.eventDate,
    held: review.status === 'Held' ? heldFor(review.text) : null,
    hidden: review.status === 'Hidden' ? { by: hider?.displayName ?? null, reports: review.hidden?.reports ?? 0, reason: review.hidden?.reason ?? '' } : null,
    at: review.status === 'Hidden' ? (review.hidden?.at ?? review.createdAt) : review.createdAt,
  };
}

/** Held reviews, or hidden ones with `status=hidden`, newest first; `q` matches the caterer or the reviewer. */
export async function listModeratedReviews(req: Request): Promise<Reply> {
  const status: ModerationStatus = req.query.get('status') === 'hidden' ? 'Hidden' : 'Held';
  const q = fold(req.query.get('q') ?? '');
  const held = await reviews(req.tx).find({ status: 'Held' });
  const hidden = await reviews(req.tx).find({ status: 'Hidden' });
  const shown = status === 'Held' ? held : hidden;
  const views = await Promise.all(
    shown.map(async (r) => ({ review: r, view: await moderatedView(req.tx, r, await caterers(req.tx).get(r.catererId)) })),
  );
  const body: ModerationList = {
    held: held.length,
    hidden: hidden.length,
    reviews: views
      .filter(({ review, view }) => !q || fold(view.catererName).includes(q) || fold(view.reviewer).includes(q) || fold(review.authorName).includes(q))
      .map(({ view }) => view)
      .sort((a, b) => b.at.localeCompare(a.at)),
  };
  return ok(body);
}

const TRANSITIONS: Record<ModerationAction, { from: ReviewStatus[]; to: ReviewStatus; action: string }> = {
  approve: { from: ['Held'], to: 'Published', action: 'ApproveReview' },
  hide: { from: ['Held', 'Published'], to: 'Hidden', action: 'HideReview' },
  restore: { from: ['Hidden'], to: 'Published', action: 'RestoreReview' },
  remove: { from: ['Held', 'Published', 'Hidden'], to: 'Removed', action: 'RemoveReview' },
};

export async function moderateReview(req: Request): Promise<Reply> {
  const action = req.params['action'] as ModerationAction;
  const transition = Object.hasOwn(TRANSITIONS, action) ? TRANSITIONS[action] : undefined;
  const review = await reviews(req.tx).get(req.params['id']);
  if (!transition || !review) return notFound();
  const reason = String((req.body as Partial<ModerateReviewRequest> | undefined)?.reason ?? '').trim();
  if (!reason) return invalid({ reason: ['Add a reason for this decision'] });
  if (!transition.from.includes(review.status)) return conflict('This review has already been moderated', { status: review.status });

  const operatorId = req.actor!.userId;
  const { hidden: _hidden, holdReason: _held, hiddenBy: _by, hiddenAt: _at, ...rest } = review;
  const next: Review = { ...rest, status: transition.to };
  if (transition.to === 'Hidden') next.hidden = { by: operatorId, reports: 0, reason, at: req.now.toISOString() };
  if (transition.to === 'Removed') {
    // Removal is permanent: only the audit entry keeps the decision (L2-059.4).
    next.text = '';
    delete next.response;
  }
  await reviews(req.tx).put(next);
  await recordAudit(req.tx, req.now, { operatorId, action: transition.action, targetType: 'review', targetId: review.id, reason, before: review.status, after: transition.to });
  // The author is told, with the reason (L2-059).
  const author = await liveUser(req.tx, review.authorUserId);
  if (author) await queueEmail(req.tx, req.now, { to: author.email, kind: 'review-moderated', decision: action, reason, reviewId: review.id, catererId: review.catererId });
  return noContent();
}
