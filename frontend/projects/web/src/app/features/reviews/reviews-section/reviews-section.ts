import { ChangeDetectionStrategy, Component, effect, inject, input, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button, RatingSummary, Review, ReviewList } from '@sweet-hand/components';
import type { RatingSummaryView } from '../../../core/api/caterer-page.models';
import { ReviewsApi } from '../../../core/api/reviews-api';
import type { PublicReviewView } from '../../../core/api/reviews.models';
import { eventLabel, ratingLabel, responseLabel, reviewCount, reviewsShown } from './review-labels';

/**
 * The reviews section of a caterer page (docs/detailed-designs/reviews/show-reviews):
 * the summary, then published reviews newest first, 10 at a time (L2-051).
 */
@Component({
  selector: 'app-reviews-section',
  imports: [Button, RatingSummary, Review, ReviewList],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './reviews-section.html',
  styleUrl: './reviews-section.css',
})
export class ReviewsSection {
  readonly slug = input.required<string>();
  readonly catererName = input.required<string>();
  readonly rating = input.required<RatingSummaryView>();

  private readonly api = inject(ReviewsApi);

  protected readonly reviews = signal<PublicReviewView[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly page = signal(1);
  protected readonly pageCount = signal(1);
  protected readonly announcement = signal('');

  protected readonly countLabel = reviewCount;
  protected readonly eventLabel = eventLabel;
  protected readonly ratingLabel = ratingLabel;
  protected readonly responseLabel = responseLabel;
  /** Appended to the date line of an edited review (L2-053.1, review CRD D-3). */
  protected readonly editedText = $localize`:@@reviews.edited:Edited`;

  constructor() {
    // The first page loads with the page, and again whenever the summary changes.
    effect(() => {
      const slug = this.slug();
      this.rating();
      untracked(() => void this.loadFirst(slug));
    });
  }

  protected async showMore(): Promise<void> {
    if (this.loadingMore()) return;
    this.loadingMore.set(true);
    try {
      const next = await firstValueFrom(this.api.page(this.slug(), this.page() + 1));
      this.reviews.update((list) => [...list, ...next.items.filter((r) => !list.some((x) => x.id === r.id))]);
      this.page.set(next.page);
      this.pageCount.set(next.pageCount);
      this.announcement.set(reviewsShown(this.reviews().length, next.total));
    } finally {
      this.loadingMore.set(false);
    }
  }

  private async loadFirst(slug: string): Promise<void> {
    if (this.rating().count === 0) {
      this.reviews.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(true);
    try {
      const first = await firstValueFrom(this.api.page(slug, 1));
      this.reviews.set(first.items);
      this.page.set(first.page);
      this.pageCount.set(first.pageCount);
      this.announcement.set('');
    } catch {
      this.reviews.set([]);
    } finally {
      this.loading.set(false);
    }
  }
}
