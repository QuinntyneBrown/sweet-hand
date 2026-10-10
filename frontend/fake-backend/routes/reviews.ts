import type { Router } from '../lib/router.ts';
import { conflict, forbidden, invalid, noContent, notFound, ok, unauthorized } from '../lib/http.ts';
import { currentUser, newId, torontoDate, type Store } from '../lib/store.ts';
import type { Review } from '../seed/reviews.ts';
import type { RatingSummaryView } from '../../projects/web/src/app/core/api/caterer-page.models.ts';
import type { PublicReviewView, ReviewEligibility, ReviewPageView, ReviewRequest, ReviewResult } from '../../projects/web/src/app/core/api/reviews.models.ts';

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

const DAY_MS = 24 * 60 * 60 * 1000;
/** Authors may edit for 30 × 24 hours after first posting (L2-053, edit-or-delete-review). */
const EDIT_WINDOW_MS = 30 * DAY_MS;
/** A URL, an email address or a phone number holds a review for a quick check (L2-050.3). */
const CONTACT = [/\bwww\.|https?:\/\/|\b[a-z0-9-]+\.(com|ca|net|org)\b/i, /[^\s@]+@[^\s@]+\.[^\s@]+/, /\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/];

export function editableUntil(r: Review): string {
  return new Date(new Date(r.createdAt).getTime() + EDIT_WINDOW_MS).toISOString();
}

function canEdit(store: Store, r: Review): boolean {
  return (r.status === 'Published' || r.status === 'Held') && store.now.getTime() < new Date(editableUntil(r)).getTime();
}

/**
 * A replied enquiry whose event is before today and no more than 90 days ago
 * (L2-049): one the caterer answered, whatever its status is now.
 */
function eligibleEvent(store: Store, userId: string, catererId: string): { eventDate: string } | undefined {
  const today = torontoDate(store.now);
  return store.enquiries
    .filter((e) => e.customerId === userId && e.catererId === catererId && e.eventDate < today)
    .filter((e) => e.events.some((ev) => ev.kind === 'reply' && ev.by === 'caterer'))
    .filter((e) => Math.round((new Date(`${today}T12:00:00Z`).getTime() - new Date(`${e.eventDate}T12:00:00Z`).getTime()) / DAY_MS) <= 90)
    .sort((a, b) => b.eventDate.localeCompare(a.eventDate))[0];
}

function ownReview(store: Store, userId: string, catererId: string): Review | undefined {
  return store.reviews.find((x) => x.authorUserId === userId && x.catererId === catererId && x.status !== 'Removed');
}

function reviewErrors(body: Partial<ReviewRequest>): Record<string, string[]> {
  const errors: Record<string, string[]> = {};
  if (!Number.isInteger(body.rating) || body.rating! < 1 || body.rating! > 5) errors['rating'] = ['Choose a rating from 1 to 5 stars'];
  const text = (body.text ?? '').trim();
  if (text.length < 20) errors['text'] = ['Write at least 20 characters'];
  else if (text.length > 2000) errors['text'] = ['Write no more than 2,000 characters'];
  return errors;
}

const screened = (text: string): Review['status'] => (CONTACT.some((re) => re.test(text)) ? 'Held' : 'Published');

/** Fake endpoints of the reviews area. */
export function registerReviews(r: Router<Store>): void {
  /** What the signed-in customer may do about reviewing this caterer (L2-049, L2-053). */
  r.get('/api/me/caterers/:slug/review-eligibility', (ctx) => {
    const user = currentUser(ctx.store, ctx.cookies);
    if (!user) return unauthorized();
    const c = publishedCaterer(ctx.store, ctx.params['slug']);
    if (!c) return notFound();
    let view: ReviewEligibility = { status: 'NotEligible' };
    const own = user.role === 'Customer' ? ownReview(ctx.store, user.id, c.id) : undefined;
    if (own) {
      view = { status: 'AlreadyReviewed', review: publicReview(own), canEdit: canEdit(ctx.store, own), canDelete: true, editableUntil: canEdit(ctx.store, own) ? editableUntil(own) : null };
    } else if (user.role === 'Customer') {
      const event = eligibleEvent(ctx.store, user.id, c.id);
      if (event) view = { status: 'Eligible', eventDate: event.eventDate, reviewerLabel: reviewerLabel(user.displayName) };
    }
    return ok(view);
  });

  r.post('/api/me/caterers/:slug/reviews', (ctx) => {
    const store = ctx.store;
    const user = currentUser(store, ctx.cookies);
    if (!user) return unauthorized();
    const c = publishedCaterer(store, ctx.params['slug']);
    if (!c) return notFound();
    // Caterers and operators never review (L2-049.5).
    if (user.role !== 'Customer') return forbidden();
    if (ownReview(store, user.id, c.id)) return conflict('You have already reviewed this caterer');
    const event = eligibleEvent(store, user.id, c.id);
    if (!event) return forbidden();
    const body = (ctx.body ?? {}) as Partial<ReviewRequest>;
    const errors = reviewErrors(body);
    if (Object.keys(errors).length) return invalid(errors);
    const text = body.text!.trim();
    const review: Review = {
      id: `review-${newId()}`,
      catererId: c.id,
      authorUserId: user.id,
      authorName: user.displayName,
      rating: body.rating!,
      text,
      eventDate: event.eventDate,
      createdAt: store.now.toISOString(),
      status: screened(text),
    };
    store.reviews.push(review);
    const result: ReviewResult = { status: review.status === 'Held' ? 'Held' : 'Published', editableUntil: editableUntil(review) };
    return ok(result, 201);
  });

  /** The author edits within 30 days; the text is screened again (L2-053, L2-050.3). */
  r.put('/api/me/reviews/:id', (ctx) => {
    const store = ctx.store;
    const user = currentUser(store, ctx.cookies);
    if (!user) return unauthorized();
    const review = store.reviews.find((x) => x.id === ctx.params['id'] && x.status !== 'Removed');
    if (!review) return notFound();
    if (review.authorUserId !== user.id || !canEdit(store, review)) return forbidden();
    const body = (ctx.body ?? {}) as Partial<ReviewRequest>;
    const errors = reviewErrors(body);
    if (Object.keys(errors).length) return invalid(errors);
    review.rating = body.rating!;
    review.text = body.text!.trim();
    review.editedAt = store.now.toISOString();
    review.status = screened(review.text);
    const result: ReviewResult = { status: review.status === 'Held' ? 'Held' : 'Published', editableUntil: editableUntil(review) };
    return ok(result);
  });

  /** The author deletes at any time; the caterer's response goes with it (L2-053.3). */
  r.delete('/api/me/reviews/:id', (ctx) => {
    const store = ctx.store;
    const user = currentUser(store, ctx.cookies);
    if (!user) return unauthorized();
    const review = store.reviews.find((x) => x.id === ctx.params['id'] && x.status !== 'Removed');
    if (!review) return notFound();
    if (review.authorUserId !== user.id) return forbidden();
    store.reviews.splice(store.reviews.indexOf(review), 1);
    return noContent();
  });

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
