import type { Request, Reply } from '../http/endpoint.ts';
import { notFound, ok } from '../http/problems.ts';
import type { ReviewEligibility } from '@contract/review-eligibility.ts';
import { liveUser } from '../identity/model.ts';
import { publishedCaterer } from './public-reviews.ts';
import { canEdit, editableUntil, eligibleEvent, ownReview } from './rules.ts';
import { publicReview, reviewerLabel } from './views.ts';

/** GET /api/me/caterers/:slug/review-eligibility: write one, edit or delete theirs, or nothing (L2-049, L2-053). */
export async function reviewEligibility(req: Request): Promise<Reply> {
  const c = await publishedCaterer(req.tx, req.params['slug']);
  if (!c) return notFound();
  const actor = req.actor!;
  // Caterers and operators never review (L2-049.5).
  if (actor.role !== 'Customer') return ok({ status: 'NotEligible' } satisfies ReviewEligibility);
  const own = await ownReview(req.tx, actor.userId, c.id);
  if (own) {
    const editable = canEdit(own, req.now);
    const view: ReviewEligibility = { status: 'AlreadyReviewed', review: publicReview(own), canEdit: editable, canDelete: true, editableUntil: editable ? editableUntil(own) : null };
    return ok(view);
  }
  const event = await eligibleEvent(req.tx, req.now, actor.userId, c.id);
  const user = await liveUser(req.tx, actor.userId);
  if (!event || !user) return ok({ status: 'NotEligible' } satisfies ReviewEligibility);
  return ok({ status: 'Eligible', eventDate: event.eventDate, reviewerLabel: reviewerLabel(user.displayName) } satisfies ReviewEligibility);
}
