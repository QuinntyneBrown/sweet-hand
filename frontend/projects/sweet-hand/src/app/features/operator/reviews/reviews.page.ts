import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button, EmptyState, Icon, Review, ReviewList, Segmented, TextField, ToastNotifier, type SegmentedItem } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { eventLabel, ratingLabel } from '../../reviews/reviews-section/review-labels';
import { ModerateReviewDialog } from './moderate-review.dialog';
import { actionsFor, decisionToast, moderationStatus, moderationSubtitle, searchCount } from './reviews-view';
import { type ModeratedReview, type ModerationAction, type ModerationList, type ModerationStatus, OperatorSettingsService } from '@sweet-hand/api';

const ACTION_LABEL: Record<ModerationAction, () => string> = {
  approve: () => $localize`:@@reviewsAdmin.approve:Approve`,
  hide: () => $localize`:@@reviewsAdmin.keepHidden:Keep hidden`,
  restore: () => $localize`:@@reviewsAdmin.restore:Restore`,
  remove: () => $localize`:@@reviewsAdmin.remove:Remove`,
};

/** Held and hidden reviews, /admin/reviews (docs/mocks/pages/admin-reviews; ReviewModerationScreen, L2-050.3, L2-059). */
@Component({
  selector: 'app-reviews-page',
  imports: [ReactiveFormsModule, RouterLink, Button, EmptyState, Icon, ModerateReviewDialog, Review, ReviewList, Segmented, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.page.html',
  styleUrl: './reviews.page.css',
})
export class ReviewsPage {
  private readonly api = inject(OperatorSettingsService);
  private readonly router = inject(Router);
  private readonly toasts = inject(ToastNotifier);

  // From the address (withComponentInputBinding): ?status=hidden&q=…
  readonly status = input<string>();
  readonly q = input<string>();

  protected readonly tab = computed<ModerationStatus>(() => (this.status() === 'hidden' ? 'Hidden' : 'Held'));
  protected readonly query = computed(() => (this.q() ?? '').trim());
  protected readonly searchText = new FormControl('', { nonNullable: true });
  protected readonly list = signal<ModerationList | null>(null);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly deciding = signal<{ review: ModeratedReview; action: ModerationAction } | null>(null);
  protected readonly dialogOpen = signal(false);
  protected readonly opener = signal<HTMLElement | null>(null);

  protected readonly subtitle = computed(() => moderationSubtitle(this.list()!));
  protected readonly statusTitle = computed(() =>
    this.tab() === 'Held' ? $localize`:@@reviewsAdmin.heldTitle:Held for a check` : $localize`:@@reviewsAdmin.hiddenTitle:Hidden reviews`,
  );
  protected readonly tabs = computed<SegmentedItem[]>(() => {
    const l = this.list();
    return [
      { value: 'Held', label: $localize`:@@reviewsAdmin.held:Held`, count: l ? l.held : null, href: '/admin/reviews' },
      { value: 'Hidden', label: $localize`:@@reviewsAdmin.hiddenTab:Hidden`, count: l ? l.hidden : null, href: '/admin/reviews?status=hidden' },
    ];
  });
  protected readonly countText = computed(() => searchCount(this.tab(), this.list()?.reviews.length ?? 0, this.query()));
  protected readonly noMatchTitle = computed(() =>
    this.tab() === 'Held'
      ? $localize`:@@reviewsAdmin.noHeldFor:No held reviews for ${this.query()}:q:`
      : $localize`:@@reviewsAdmin.noHiddenFor:No hidden reviews for ${this.query()}:q:`,
  );
  protected readonly noMatchText = computed(() =>
    this.tab() === 'Held'
      ? $localize`:@@reviewsAdmin.noHeldText:Try the reviewer’s name, or look under Hidden.`
      : $localize`:@@reviewsAdmin.noHiddenText:Try the reviewer’s name, or look under Held.`,
  );
  protected readonly emptyTabTitle = computed(() =>
    this.tab() === 'Held' ? $localize`:@@reviewsAdmin.noneHeld:No reviews are held for a check` : $localize`:@@reviewsAdmin.noneHidden:No reviews are hidden`,
  );
  protected readonly rows = computed(() =>
    (this.list()?.reviews ?? []).map((r) => ({
      ...r,
      byline: $localize`:@@reviewsAdmin.by:by ${r.reviewer}:reviewer:`,
      event: eventLabel(r.eventDate.slice(0, 7)),
      ratingText: ratingLabel(r.rating),
      moderation: moderationStatus(r),
      actions: actionsFor(r.status).map((action) => ({
        action,
        label: ACTION_LABEL[action](),
        icon: action === 'remove' ? ('trash' as const) : action === 'hide' ? ('lock' as const) : ('success' as const),
        hidden: $localize`:@@reviewsAdmin.actionTarget: review by ${r.reviewer}:reviewer: of ${r.catererName}:caterer:`,
      })),
    })),
  );

  constructor() {
    effect(() => {
      const status = this.tab();
      const q = this.query();
      untracked(() => {
        this.searchText.setValue(q);
        void this.load(status, q);
      });
    });
  }

  protected async load(status = this.tab(), q = this.query()): Promise<void> {
    this.failure.set(null);
    this.list.set(null);
    this.searchText.disable();
    try {
      this.list.set(await firstValueFrom(this.api.moderation(status, q)));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    } finally {
      this.searchText.enable();
    }
  }

  protected search(): void {
    void this.router.navigate([], { queryParams: { status: this.tab() === 'Hidden' ? 'hidden' : null, q: this.searchText.value.trim() || null } });
  }

  protected moderate(review: ModeratedReview, action: ModerationAction, event: MouseEvent): void {
    this.opener.set(event.currentTarget as HTMLElement);
    this.deciding.set({ review, action });
    this.dialogOpen.set(true);
  }

  /** The review leaves this list; counts and the list reload from the server. */
  protected async decided(event: { review: ModeratedReview; action: ModerationAction }): Promise<void> {
    this.opener.set(document.getElementById('reviews-title'));
    this.dialogOpen.set(false);
    this.toasts.show({ tone: 'success', ...decisionToast(event.action, event.review) });
    try {
      this.list.set(await firstValueFrom(this.api.moderation(this.tab(), this.query())));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
  }
}
