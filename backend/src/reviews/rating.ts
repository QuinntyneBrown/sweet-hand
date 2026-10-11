import type { Transaction } from '../platform/database.ts';
import type { RatingSummaryView } from '@contract/rating-summary-view.ts';
import { reviews } from './model.ts';

/** Average and count of a caterer's published reviews (L2-051.1). */
export async function ratingSummary(tx: Transaction, catererId: string): Promise<RatingSummaryView> {
  const published = await reviews(tx).find({ catererId, status: 'Published' });
  const total = published.reduce((sum, r) => sum + r.rating, 0);
  return { average: published.length ? total / published.length : 0, count: published.length };
}
