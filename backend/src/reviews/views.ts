import type { PublicReviewView } from '@contract/public-review-view.ts';
import type { Review } from './model.ts';

/** "Marcia Thompson" → "Marcia T." (L2-051.3). */
export function reviewerLabel(displayName: string): string {
  const words = displayName.trim().split(/\s+/);
  return words.length > 1 ? `${words[0]} ${words[words.length - 1][0]}.` : words[0];
}

/** One review as anyone may see it: never the author's account, email or the review's status (L2-014, L2-054.5). */
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

/** Newest first; the id breaks ties so the order never depends on storage. */
export const newestFirst = (a: Review, b: Review): number => b.createdAt.localeCompare(a.createdAt) || a.id.localeCompare(b.id);

/** Page `requested` (1-based) of `items`, 10 per page; an invalid page gives the first (L2-051.4). */
export function pageOf<T>(items: T[], requested: string | null, size = 10): { items: T[]; page: number; pageCount: number; total: number } {
  const pageCount = Math.max(1, Math.ceil(items.length / size));
  const n = Number(requested ?? '1');
  const page = Number.isInteger(n) && n >= 1 && n <= pageCount ? n : 1;
  return { items: items.slice((page - 1) * size, page * size), page, pageCount, total: items.length };
}
