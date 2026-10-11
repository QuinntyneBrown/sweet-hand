import type { Request, Reply } from '../http/endpoint.ts';
import { fail, forbidden, invalid, noContent, notFound, ok, refused } from '../http/problems.ts';
import { reviews, type Review } from './model.ts';
import { canEdit } from './rules.ts';
import { isCommand, readReview, result, screen } from './write.ts';

/** The review named in the path; another person's is 403 (L2-053.4), a removed one is as missing. */
async function authorsReview(req: Request): Promise<Review> {
  const review = await reviews(req.tx).get(req.params['id']);
  if (!review || review.status === 'Removed') return fail(notFound());
  if (review.authorUserId !== req.actor!.userId) return fail(refused(review.id));
  return review;
}

/** PUT /api/me/reviews/:id: within 30 days of first posting; the text is screened again (L2-053.1–2, L2-050.3). */
export async function editReview(req: Request): Promise<Reply> {
  const review = await authorsReview(req);
  if (!canEdit(review, req.now)) return forbidden();
  const command = readReview(req.body);
  if (!isCommand(command)) return invalid(command);
  const edited: Review = { ...review, rating: command.rating, text: command.text, editedAt: req.now.toISOString(), ...screen(command.text) };
  await reviews(req.tx).put(edited);
  return ok(result(edited));
}

/** DELETE /api/me/reviews/:id: at any time; the caterer's response goes with it (L2-053.3). */
export async function deleteReview(req: Request): Promise<Reply> {
  const review = await authorsReview(req);
  await reviews(req.tx).delete(review.id);
  return noContent();
}
