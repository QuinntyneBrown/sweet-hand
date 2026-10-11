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
  template: `
    <div class="page-intro">
      <h1 id="reviews-title" tabindex="-1" i18n="@@reviewsAdmin.title">Reviews</h1>
      @if (list()) {
        <p class="subtitle">{{ subtitle() }}</p>
      } @else if (failure()) {
        <p class="subtitle">{{ statusTitle() }}</p>
      } @else {
        <p class="subtitle"><span class="skeleton skeleton--text" style="width: 40%" aria-hidden="true"></span></p>
      }
    </div>
    <sh-segmented ariaLabel="Review status" i18n-ariaLabel="@@reviewsAdmin.tabs" [items]="tabs()" [selected]="tab()" />
    @if (list()?.held === 0 && list()?.hidden === 0 && !query()) {
      <sh-empty-state
        heading="No reviews to check"
        i18n-heading="@@reviewsAdmin.emptyTitle"
        text="Reviews that contain a link, email address or phone number are held here before they go live. Hidden reviews appear under Hidden."
        i18n-text="@@reviewsAdmin.emptyText"
      >
        <svg slot="icon" shIcon="success"></svg>
        <a slot="actions" class="btn btn--primary" routerLink="/admin/queue" i18n="@@operator.goToQueue">Go to the review queue</a>
      </sh-empty-state>
    } @else if (failure(); as f) {
      <sh-empty-state
        tone="error"
        heading="We couldn’t load reviews"
        i18n-heading="@@reviewsAdmin.errorTitle"
        text="Nothing has been changed. Check your connection and try again."
        i18n-text="@@reviewsAdmin.errorText"
        [reference]="f.reference"
        referenceLabel="Reference"
        i18n-referenceLabel="@@common.reference"
      >
        <svg slot="icon" shIcon="danger"></svg>
        <ng-container slot="actions">
          <button class="btn btn--primary" type="button" (click)="load()"><svg shIcon="refresh"></svg><ng-container i18n="@@common.tryAgain">Try again</ng-container></button>
          <a class="btn" routerLink="/admin/queue" i18n="@@operator.backToTheQueue">Back to the queue</a>
        </ng-container>
      </sh-empty-state>
    } @else {
      <form role="search" class="reviews-search" (ngSubmit)="search()">
        <div class="field">
          <label class="visually-hidden" for="rq" i18n="@@reviewsAdmin.searchLabel">Caterer or reviewer</label>
          <sh-text-field
            inputId="rq"
            [formControl]="searchText"
            type="search"
            variant="search"
            name="q"
            placeholder="Caterer or reviewer"
            i18n-placeholder="@@reviewsAdmin.searchLabel"
            autocomplete="off"
          />
        </div>
      </form>
      @if (list(); as l) {
        @if (query()) {
          <p class="result-count" role="status">{{ countText() }}</p>
        }
        @if (l.reviews.length === 0 && query()) {
          <sh-empty-state [heading]="noMatchTitle()" [text]="noMatchText()">
            <svg slot="icon" shIcon="search"></svg>
            <a slot="actions" class="btn btn--primary" [routerLink]="[]" [queryParams]="{ status: tab() === 'Hidden' ? 'hidden' : null }" i18n="@@reviewsAdmin.clearSearch"
              >Clear search</a
            >
          </sh-empty-state>
        } @else if (l.reviews.length === 0) {
          <sh-empty-state [heading]="emptyTabTitle()" size="compact" />
        } @else {
          <sh-review-list>
            @for (r of rows(); track r.id) {
              <sh-review
                variant="operator"
                [author]="r.catererName"
                [reviewer]="r.byline"
                [eventLabel]="r.event"
                [rating]="r.rating"
                [ratingLabel]="r.ratingText"
                [body]="r.text"
                [highlights]="r.held?.ranges ?? []"
                [moderation]="r.moderation"
                [catererPhoto]="{ src: r.catererPhoto, width: 40, height: 40 }"
              >
                @for (a of r.actions; track a.action) {
                  <sh-button slot="actions" size="sm" [variant]="a.action === 'remove' ? 'ghost' : 'secondary'" haspopup="dialog" (activated)="moderate(r, a.action, $event)"
                    ><svg [shIcon]="a.icon"></svg>{{ a.label }}<span class="visually-hidden">{{ a.hidden }}</span></sh-button
                  >
                }
              </sh-review>
            }
          </sh-review-list>
        }
      } @else {
        <p class="visually-hidden" role="status" i18n="@@reviewsAdmin.loading">Loading reviews</p>
        <sh-review-list [busy]="true" [skeletonVariant]="'operator'" />
      }
    }
    @if (deciding(); as d) {
      <app-moderate-review-dialog [open]="dialogOpen()" [review]="d.review" [action]="d.action" [returnFocus]="opener()" (closed)="dialogOpen.set(false)" (decided)="decided($event)" />
    }
  `,
  styles: `
    .reviews-search {
      max-width: var(--layout-panel-width);
      margin-bottom: var(--space-6);
    }
  `,
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
