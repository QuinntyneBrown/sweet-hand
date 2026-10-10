import type { Router } from '../lib/router.ts';
import { notFound, ok } from '../lib/http.ts';
import type { Store } from '../lib/store.ts';
import type { Review } from '../seed/reviews.ts';
import type { RatingSummaryView } from '../../projects/web/src/app/core/api/caterer-page.models.ts';
import type { PublicReviewView, ReviewPageView } from '../../projects/web/src/app/core/api/reviews.models.ts';

const PAGE_SIZE = 10;

/** Average and count of a caterer's published reviews; held, hidden and removed ones are left out (L2-051.5). */
export function ratingSummary(store: Store, catererId: string): RatingSummaryView {
  const published = store.reviews.filter((r) => r.catererId === catererId && r.status === 'Published');
  const total = published.reduce((sum, r) => sum + r.rating, 0);
  return { average: published.length ? total / published.length : 0, count: published.length };
}

/** "Marcia Thompson" → "Marcia T." (L2-051.3). */
export function reviewerLabel(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  return words.length > 1 ? `${words[0]} ${words[words.length - 1][0]}.` : words[0];
}

export function publicReview(r: Review): PublicReviewView {
  return {
    id: r.id,
    author: reviewerLabel(r.authorName),
    eventMonth: r.eventDate.slice(0, 7),
    rating: r.rating,
    text: r.text,
    edited: !!r.editedAt,
    response: r.response ? { text: r.response.text } : null,
  };
}

function publishedCaterer(store: Store, slug: string) {
  const c = store.caterers.find((x) => x.slug === slug);
  return c && c.status === 'Published' ? c : undefined;
}

/** Fake endpoints of the reviews area. */
export function registerReviews(r: Router<Store>): void {
  /** Anonymous by explicit choice (L2-013): published reviews, newest first, 10 per page (L2-051). */
  r.get('/api/public/caterers/:slug/reviews', (ctx) => {
    const c = publishedCaterer(ctx.store, ctx.params['slug']);
    if (!c) return notFound();
    const published = ctx.store.reviews
      .filter((x) => x.catererId === c.id && x.status === 'Published')
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
    const pageCount = Math.max(1, Math.ceil(published.length / PAGE_SIZE));
    const requested = Number(ctx.query.get('page') ?? '1');
    const page = Number.isInteger(requested) && requested >= 1 && requested <= pageCount ? requested : 1;
    const view: ReviewPageView = {
      items: published.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map(publicReview),
      page,
      pageCount,
      total: published.length,
    };
    return ok(view);
  });
}

/** Named store changes tests can ask for (`backend.scenario(name, args)`). */
export const reviewsScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** Hold, hide or remove a review by its author's name: { caterer: slug, author: 'Marcia Thompson', status }. */
  'set-review-status': (store, { caterer, author, status }: { caterer: string; author: string; status: Review['status'] }) => {
    const c = store.caterers.find((x) => x.slug === caterer);
    const review = store.reviews.find((x) => x.catererId === c?.id && x.authorName === author);
    if (review) review.status = status;
  },
};
