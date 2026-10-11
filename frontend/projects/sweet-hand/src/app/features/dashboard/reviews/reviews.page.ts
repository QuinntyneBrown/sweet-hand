import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button, EMPTY_STATE, Icon, Review, ReviewList, ToastNotifier } from '@sweet-hand/components';
import { monthYear, shortDate } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { DashboardLayout } from '../shared/dashboard-layout';
import { ProfileBanner } from '../shared/profile-banner';
import { ReviewResponseDialog } from './review-response.dialog';
import { CATERER_PROFILE_SERVICE, OwnProfileView, OwnReviewPageView, OwnReviewView } from '@sweet-hand/api';

type ViewState = { kind: 'loading' } | { kind: 'error'; reference: string | null } | { kind: 'ready' };

/** The caterer's reviews, /dashboard/reviews (docs/mocks/pages/dashboard-reviews; respond-to-review, CatererReviewsScreen, L2-052). */
@Component({
  selector: 'app-reviews-page',
  imports: [RouterLink, Button, EMPTY_STATE, Icon, Review, ReviewList, DashboardLayout, ProfileBanner, ReviewResponseDialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './reviews.page.html',
})
export class ReviewsPage {
  private readonly api = inject(CATERER_PROFILE_SERVICE);
  private readonly session = inject(Session);
  private readonly toasts = inject(ToastNotifier);
  private readonly injector = inject(Injector);
  private readonly host = inject<ElementRef<HTMLElement>>(ElementRef);

  protected readonly state = signal<ViewState>({ kind: 'loading' });
  protected readonly page = signal<OwnReviewPageView | null>(null);
  protected readonly profile = signal<OwnProfileView | null>(null);
  protected readonly items = signal<OwnReviewView[]>([]);
  protected readonly loadingMore = signal(false);
  protected readonly responding = signal<string | null>(null);

  protected readonly business = computed(() => this.session.user()?.caterer?.name ?? '');
  protected readonly errorReference = computed(() => {
    const s = this.state();
    return s.kind === 'error' ? s.reference : null;
  });
  protected readonly hasMore = computed(() => {
    const p = this.page();
    return !!p && p.page < p.pageCount;
  });
  protected readonly subtitle = computed(() => {
    const p = this.page();
    if (!p || !p.total) return $localize`:@@reviews.none:No reviews yet`;
    const count = p.total === 1 ? $localize`:@@count.review:1 review` : $localize`:@@count.reviews:${p.total}:count: reviews`;
    const head = `${p.average.toFixed(1)} · ${count}`;
    return p.unanswered ? `${head} · ${$localize`:@@section.unanswered:${p.unanswered}:count: without a response`}` : head;
  });
  protected readonly selected = computed(() => this.items().find((r) => r.id === this.responding()) ?? null);
  protected readonly rows = computed(() =>
    this.items().map((r) => ({
      review: r,
      event: $localize`:@@review.eventIn:Event in ${monthYear(`${r.eventMonth}-15`)}:month:`,
      posted: $localize`:@@review.posted:Posted ${shortDate(r.postedAt)}:date:`,
      ratingLabel: $localize`:@@review.rating:${r.rating}:rating: out of 5`,
      response: r.response ? { label: $localize`:@@review.responseFrom:Response from ${this.business()}:business:`, body: r.response.text } : null,
    })),
  );

  constructor() {
    void this.load();
  }

  protected async load(): Promise<void> {
    this.state.set({ kind: 'loading' });
    try {
      const [page, profile] = await Promise.all([firstValueFrom(this.api.reviews(1)), firstValueFrom(this.api.profile())]);
      this.page.set(page);
      this.profile.set(profile);
      this.items.set(page.items);
      this.state.set({ kind: 'ready' });
    } catch (error) {
      this.state.set({ kind: 'error', reference: reference(problemOf(error).problem) });
    }
  }

  protected async more(): Promise<void> {
    const p = this.page();
    if (!p || this.loadingMore()) return;
    this.loadingMore.set(true);
    try {
      const next = await firstValueFrom(this.api.reviews(p.page + 1));
      this.page.set(next);
      this.items.update((items) => [...items, ...next.items]);
    } finally {
      this.loadingMore.set(false);
    }
  }

  private replace(review: OwnReviewView): void {
    const before = this.items().find((r) => r.id === review.id);
    this.items.update((items) => items.map((r) => (r.id === review.id ? review : r)));
    const p = this.page();
    if (p && before) {
      const delta = (before.response ? 0 : 1) - (review.response ? 0 : 1);
      this.page.set({ ...p, unanswered: p.unanswered - delta });
    }
  }

  /** After the dialog: focus the review's action, which changed from Respond to Edit response or back. */
  private focusAction(id: string): void {
    const index = this.items().findIndex((r) => r.id === id);
    afterNextRender(() => this.host.nativeElement.querySelectorAll<HTMLElement>('.review-list > .review')[index]?.querySelector<HTMLElement>('.review__actions button')?.focus(), {
      injector: this.injector,
    });
  }

  protected done(outcome: { kind: 'saved'; review: OwnReviewView } | { kind: 'deleted'; review: OwnReviewView; text: string }): void {
    this.replace(outcome.review);
    this.responding.set(null);
    this.focusAction(outcome.review.id);
    if (outcome.kind === 'deleted') {
      this.toasts.show({
        tone: 'success',
        title: $localize`:@@response.deleted:Response deleted`,
        text: $localize`:@@response.deletedText:It’s gone from your page.`,
        action: {
          label: $localize`:@@common.undo:Undo`,
          run: () =>
            void firstValueFrom(this.api.respond(outcome.review.id, outcome.text))
              .then((review) => this.replace(review))
              .catch(() => undefined),
        },
      });
    }
  }
}
