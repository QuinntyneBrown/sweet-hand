import type { Request, Reply } from '../http/router.ts';
import { conflict, created, fail, forbidden, invalid, notFound, ok } from '../http/problems.ts';
import type { OwnReviewPageView } from '@contract/own-review-page-view.ts';
import type { OwnReviewView } from '@contract/own-review-view.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { liveUser } from '../identity/model.ts';
import { length, text } from '../identity/registration.ts';
import { queueEmail } from '../platform/outbox.ts';
import { reviews, type Review } from './model.ts';
import { newestFirst, reviewerLabel } from './views.ts';

const PAGE_SIZE = 10;

function ownReviewView(r: Review): OwnReviewView {
  return {
    id: r.id,
    author: reviewerLabel(r.authorName),
    eventMonth: r.eventDate.slice(0, 7),
    postedAt: r.createdAt,
    rating: r.rating,
    text: r.text,
    response: r.response ? { text: r.response.text, createdAt: r.response.createdAt } : null,
  };
}

/** The session's own caterer profile, never one named in the request (L2-079). */
async function ownCaterer(req: Request): Promise<Caterer> {
  const user = await liveUser(req.tx, req.actor!.userId);
  const caterer = user?.catererId ? await caterers(req.tx).get(user.catererId) : undefined;
  return caterer ?? fail(notFound());
}

/** A published review of the caller's business; another caterer's is 403 (L2-052.3). */
async function reviewToAnswer(req: Request): Promise<{ caterer: Caterer; review: Review }> {
  const caterer = await ownCaterer(req);
  const review = await reviews(req.tx).get(req.params['id']);
  if (!review || review.status !== 'Published') return fail(notFound());
  if (review.catererId !== caterer.id) return fail(forbidden());
  if (caterer.status === 'Suspended' || caterer.status === 'Removed') return fail(conflict('Your profile can’t be changed right now'));
  return { caterer, review };
}

/** 1 to 1,000 characters of plain text (L2-052). */
function responseText(body: unknown): string {
  const t = text((body as { text?: unknown } | undefined)?.text);
  if (length(t) < 1 || length(t) > 1000) return fail(invalid({ text: ['Write a response, up to 1,000 characters'] }));
  return t;
}

/** GET /api/caterer/reviews: published reviews of the caller's business, newest first (respond-to-review design). */
export async function listOwnReviews(req: Request): Promise<Reply> {
  const caterer = await ownCaterer(req);
  const published = (await reviews(req.tx).find({ catererId: caterer.id, status: 'Published' })).sort(newestFirst);
  const pageCount = Math.max(1, Math.ceil(published.length / PAGE_SIZE));
  const page = Math.min(Math.max(1, Number(req.query.get('page')) || 1), pageCount);
  const view: OwnReviewPageView = {
    items: published.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(ownReviewView),
    page,
    pageCount,
    total: published.length,
    average: published.length ? published.reduce((sum, r) => sum + r.rating, 0) / published.length : 0,
    unanswered: published.filter((r) => !r.response).length,
  };
  return ok(view);
}

/** POST /api/caterer/reviews/:id/response: one public response per review; the reviewer is emailed (L2-052.1, .2, .4). */
export async function postResponse(req: Request): Promise<Reply> {
  const { caterer, review } = await reviewToAnswer(req);
  if (review.response) return conflict('This review already has your response', { response: ownReviewView(review).response });
  const answered: Review = { ...review, response: { text: responseText(req.body), createdAt: req.now.toISOString() } };
  await reviews(req.tx).put(answered);
  const reviewer = await liveUser(req.tx, review.authorUserId);
  if (reviewer) await queueEmail(req.tx, req.now, { to: reviewer.email, kind: 'review-response', link: `/caterers/${caterer.slug}#reviews` });
  return created(ownReviewView(answered));
}

/** PUT /api/caterer/reviews/:id/response: edit at any time; the response keeps its date. */
export async function editResponse(req: Request): Promise<Reply> {
  const { review } = await reviewToAnswer(req);
  if (!review.response) return notFound();
  const edited: Review = { ...review, response: { ...review.response, text: responseText(req.body) } };
  await reviews(req.tx).put(edited);
  return ok(ownReviewView(edited));
}

/** DELETE /api/caterer/reviews/:id/response: delete at any time. */
export async function deleteResponse(req: Request): Promise<Reply> {
  const { review } = await reviewToAnswer(req);
  if (!review.response) return notFound();
  const { response: _gone, ...rest } = review;
  const unanswered: Review = rest;
  await reviews(req.tx).put(unanswered);
  return ok(ownReviewView(unanswered));
}
