import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { firstValueFrom } from 'rxjs';
import { Button, Icon, RatingSummary, Review, ReviewList } from '@sweet-hand/components';
import { shortDate } from '../../../core/format/format';
import { Session } from '../../../core/session/session';
import { ReviewDialog, type ReviewDialogOutcome, type ReviewDialogSubject } from '../review-dialog/review-dialog';
import { DeleteReviewDialog } from '../delete-review-dialog/delete-review-dialog';
import { eventLabel, ratingLabel, responseLabel, reviewCount, reviewsShown } from './review-labels';
import { type PublicReviewView, type RatingSummaryView, type ReviewEligibility, ReviewsService } from '@sweet-hand/api';

/**
 * The reviews section of a caterer page (docs/detailed-designs/reviews): the
 * summary, the signed-in author's own review first, then published reviews
 * newest first, 10 at a time (L2-051); "Write a review" when eligible (L2-049).
 */
@Component({
  selector: 'app-reviews-section',
  imports: [NgTemplateOutlet, Button, Icon, RatingSummary, Review, ReviewList, ReviewDialog, DeleteReviewDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './reviews-section.html',
  styleUrl: './reviews-section.css',
})
export class ReviewsSection {
  readonly slug = input.required<string>();
  readonly catererName = input.required<string>();
  readonly rating = input.required<RatingSummaryView>();
  /** Reviews changed: the page reloads its summary. */
  readonly changed = output<void>();

  private readonly api = inject(ReviewsService);
  private readonly session = inject(Session);
  private readonly injector = inject(Injector);

  protected readonly reviews = signal<PublicReviewView[]>([]);
  protected readonly loading = signal(true);
  protected readonly loadingMore = signal(false);
  protected readonly page = signal(1);
  protected readonly pageCount = signal(1);
  protected readonly total = signal(0);
  protected readonly announcement = signal('');
  protected readonly eligibility = signal<ReviewEligibility>({ status: 'NotEligible' });
  private readonly refresh = signal(0);

  protected readonly countLabel = reviewCount;
  protected readonly eventLabel = eventLabel;
  protected readonly ratingLabel = ratingLabel;
  protected readonly responseLabel = responseLabel;
  /** Appended to the date line of an edited review (L2-053.1, review CRD D-3). */
  protected readonly editedText = $localize`:@@reviews.edited:Edited`;
  protected readonly ownLabel = $localize`:@@reviews.own:Your review`;

  /** The author's review, shown first with its actions (L2-053). */
  protected readonly own = computed(() => {
    const e = this.eligibility();
    return e.status === 'AlreadyReviewed' ? e : null;
  });
  protected readonly others = computed(() => this.reviews().filter((r) => r.id !== this.own()?.review.id));
  protected readonly invite = computed(() => {
    const e = this.eligibility();
    return e.status === 'Eligible' ? $localize`:@@reviews.invite:How was ${shortDate(e.eventDate)}:date:? Your review helps the next family decide.` : null;
  });
  protected readonly editWindow = computed(() => {
    const until = this.own()?.editableUntil;
    return until ? $localize`:@@reviews.editWindow:You can edit this review until ${shortDate(until)}:date:.` : null;
  });

  protected readonly dialogSubject = signal<ReviewDialogSubject | null>(null);
  protected readonly dialogFrom = signal<HTMLElement | null>(null);
  private readonly ownEdit = viewChild('ownEdit', { read: Button });

  constructor() {
    // The first page and the reader's standing load with the page, and again after any change.
    effect(() => {
      const slug = this.slug();
      this.rating();
      this.refresh();
      const user = this.session.user();
      untracked(() => {
        void this.loadFirst(slug);
        void this.loadEligibility(slug, user?.role === 'Customer');
      });
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

  protected write(event: MouseEvent): void {
    const e = this.eligibility();
    if (e.status !== 'Eligible') return;
    this.openDialog(event, { mode: 'write', slug: this.slug(), catererName: this.catererName(), eventDate: e.eventDate, reviewerLabel: e.reviewerLabel });
  }

  protected edit(event: MouseEvent): void {
    const own = this.own();
    if (!own?.editableUntil) return;
    const r = own.review;
    this.openDialog(event, {
      mode: 'edit',
      reviewId: r.id,
      catererName: this.catererName(),
      eventMonth: r.eventMonth,
      reviewerLabel: r.author,
      rating: r.rating,
      text: r.text,
      editableUntil: own.editableUntil,
    });
  }

  protected onSaved(): void {
    this.refresh.update((n) => n + 1);
    this.changed.emit();
  }

  protected onClosed(outcome: ReviewDialogOutcome): void {
    const from = this.dialogFrom();
    this.dialogSubject.set(null);
    this.dialogFrom.set(null);
    // "See your review" and a saved edit land on the author's review, now or once it has reloaded.
    if (outcome === 'see-review' || (outcome === 'saved' && from && !from.isConnected)) {
      if (this.own()) this.focusOwnEdit();
      else this.focusOwnAfterLoad = true;
    }
  }

  private focusOwnEdit(): void {
    afterNextRender(() => this.ownEdit()?.focus(), { injector: this.injector });
  }

  private focusOwnAfterLoad = false;

  /** The Delete button, while its confirmation is open. */
  protected readonly deleteFrom = signal<HTMLElement | null>(null);
  private readonly heading = viewChild<ElementRef<HTMLElement>>('heading');

  protected askToDelete(event: MouseEvent): void {
    this.deleteFrom.set((event.target as HTMLElement).closest('button'));
  }

  /** After a deletion the Delete button is gone: focus moves to the section heading. */
  protected onDeleteClosed(deleted: boolean): void {
    this.deleteFrom.set(null);
    if (!deleted) return;
    this.eligibility.set({ status: 'NotEligible' });
    this.onSaved();
    afterNextRender(() => this.heading()?.nativeElement.focus(), { injector: this.injector });
  }

  private openDialog(event: MouseEvent, subject: ReviewDialogSubject): void {
    this.dialogFrom.set((event.target as HTMLElement).closest('button'));
    this.dialogSubject.set(subject);
  }

  private async loadFirst(slug: string): Promise<void> {
    if (this.rating().count === 0) {
      this.reviews.set([]);
      this.loading.set(false);
      return;
    }
    this.loading.set(this.reviews().length === 0);
    try {
      const first = await firstValueFrom(this.api.page(slug, 1));
      this.reviews.set(first.items);
      this.page.set(first.page);
      this.pageCount.set(first.pageCount);
      this.total.set(first.total);
      this.announcement.set('');
    } catch {
      this.reviews.set([]);
    } finally {
      this.loading.set(false);
    }
  }

  private async loadEligibility(slug: string, customer: boolean): Promise<void> {
    if (!customer) {
      this.eligibility.set({ status: 'NotEligible' });
      return;
    }
    try {
      this.eligibility.set(await firstValueFrom(this.api.eligibility(slug)));
    } catch {
      this.eligibility.set({ status: 'NotEligible' });
    }
    if (this.focusOwnAfterLoad) {
      this.focusOwnAfterLoad = false;
      this.focusOwnEdit();
    }
  }
}
