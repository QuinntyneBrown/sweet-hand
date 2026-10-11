import type { Request, Reply } from '../http/endpoint.ts';
import { notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import type { ReviewPageView } from '@contract/review-page-view.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { reviews } from './model.ts';
import { newestFirst, pageOf, publicReview } from './views.ts';

/** The caterer behind a public slug, only while it is published. */
export async function publishedCaterer(tx: Transaction, slug: string): Promise<Caterer | undefined> {
  const c = await caterers(tx).findOne({ slug });
  return c?.status === 'Published' ? c : undefined;
}

/** GET /api/public/caterers/:slug/reviews: published reviews only, newest first, 10 per page (L2-051). */
export async function listPublicReviews(req: Request): Promise<Reply> {
  const c = await publishedCaterer(req.tx, req.params['slug']);
  if (!c) return notFound();
  const published = (await reviews(req.tx).find({ catererId: c.id, status: 'Published' })).sort(newestFirst);
  const page = pageOf(published, req.query.get('page'));
  const view: ReviewPageView = { ...page, items: page.items.map(publicReview) };
  return ok(view);
}
