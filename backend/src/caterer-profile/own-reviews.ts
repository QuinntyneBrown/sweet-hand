import type { Reply, Request } from '../http/router.ts';
import { ok } from '../http/problems.ts';
import { reviews, type Review } from '../reviews/model.ts';
import type { OwnReviewPageView } from '@contract/own-review-page-view.ts';
import type { OwnReviewView } from '@contract/own-review-view.ts';
import { loadOwn } from './own.ts';

const PAGE = 10;

/** "Marcia Thompson" → "Marcia T." (L2-051.3). */
function reviewerLabel(name: string): string {
  const words = name.trim().split(/\s+/);
  return words.length > 1 ? `${words[0]} ${words[words.length - 1][0]}.` : words[0];
}

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

/** `GET /api/caterer/reviews?page=`: the caller's published reviews, newest first, 10 a page. */
export async function ownReviews(req: Request): Promise<Reply> {
  const { caterer } = await loadOwn(req);
  const published = (await reviews(req.tx).find({ catererId: caterer.id, status: 'Published' })).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id));
  const pageCount = Math.max(1, Math.ceil(published.length / PAGE));
  const page = Math.min(Math.max(1, Math.trunc(Number(req.query.get('page'))) || 1), pageCount);
  const view: OwnReviewPageView = {
    items: published.slice((page - 1) * PAGE, page * PAGE).map(ownReviewView),
    page,
    pageCount,
    total: published.length,
    average: published.length ? published.reduce((s, x) => s + x.rating, 0) / published.length : 0,
    unanswered: published.filter((x) => !x.response).length,
  };
  return ok(view);
}
