import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/router.ts';
import { conflict, created, forbidden, invalid, notFound } from '../http/problems.ts';
import type { ReviewRequest } from '@contract/review-request.ts';
import type { ReviewResult } from '@contract/review-result.ts';
import { liveUser } from '../identity/model.ts';
import { length, text } from '../identity/registration.ts';
import { reviews, type Review } from './model.ts';
import { publishedCaterer } from './public-reviews.ts';
import { editableUntil, eligibleEvent, ownReview } from './rules.ts';

/** A rating and text read field by field from the body; anything else in it is ignored (L2-079.2). */
export interface ReviewCommand {
  rating: number;
  text: string;
}

/** Rating 1–5 whole stars, text 20–2,000 characters (L2-050.2). */
export function readReview(body: unknown): ReviewCommand | Record<string, string[]> {
  const b = (body ?? {}) as Partial<ReviewRequest>;
  const errors: Record<string, string[]> = {};
  const rating = b.rating;
  if (typeof rating !== 'number' || !Number.isInteger(rating) || rating < 1 || rating > 5) errors['rating'] = ['Choose a rating from 1 to 5 stars'];
  const words = text(b.text);
  if (length(words) < 20) errors['text'] = ['Write at least 20 characters'];
  else if (length(words) > 2000) errors['text'] = ['Write no more than 2,000 characters'];
  return Object.keys(errors).length ? errors : { rating: rating as number, text: words };
}

export const isCommand = (x: ReviewCommand | Record<string, string[]>): x is ReviewCommand => typeof (x as ReviewCommand).text === 'string';

/** An email address, a link or a phone number holds a review for a quick check (L2-050.3); email first, since an address also looks like a link. */
const CONTACT: [NonNullable<Review['holdReason']>, RegExp][] = [
  ['email', /[^\s@]+@[^\s@]+\.[^\s@]+/],
  ['link', /\bwww\.|https?:\/\/|\b[a-z0-9-]+\.(com|ca|net|org)\b/i],
  ['phone', /\(?\b\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/],
];

/** Published at once, or held with the reason it was held. */
export function screen(words: string): Pick<Review, 'status' | 'holdReason'> {
  const hit = CONTACT.find(([, re]) => re.test(words));
  return hit ? { status: 'Held', holdReason: hit[0] } : { status: 'Published', holdReason: undefined };
}

export const result = (r: Review): ReviewResult => ({ status: r.status === 'Held' ? 'Held' : 'Published', editableUntil: editableUntil(r) });

/** POST /api/me/caterers/:slug/reviews (write-review design). */
export async function writeReview(req: Request): Promise<Reply> {
  const c = await publishedCaterer(req.tx, req.params['slug']);
  if (!c) return notFound();
  const actor = req.actor!;
  if (await ownReview(req.tx, actor.userId, c.id)) return conflict('You have already reviewed this caterer');
  const event = await eligibleEvent(req.tx, req.now, actor.userId, c.id);
  const user = await liveUser(req.tx, actor.userId);
  if (!event || !user) return forbidden();
  const command = readReview(req.body);
  if (!isCommand(command)) return invalid(command);
  const review: Review = {
    id: `review-${randomUUID()}`,
    catererId: c.id,
    authorUserId: user.id,
    authorName: user.displayName,
    rating: command.rating,
    text: command.text,
    eventDate: event.eventDate,
    createdAt: req.now.toISOString(),
    ...screen(command.text),
  };
  await reviews(req.tx).put(review);
  return created(result(review));
}
