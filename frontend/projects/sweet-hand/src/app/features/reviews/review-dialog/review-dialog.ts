import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, Icon, StarInput, Textarea, graphemeLength, type SummaryItem } from '@sweet-hand/components';
import { count, monthYear, shortDate } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { Session } from '../../../core/session/session';
import { STAR_LABELS, TEXT_MAX, reviewErrors, type ReviewErrors } from './review-rules';
import { type ReviewResult, ReviewsService } from '@sweet-hand/api';
import type { ReviewDialogSubject } from './review-dialog-subject';
import type { ReviewDialogOutcome } from './review-dialog-outcome';
import type { Step } from './step';

/**
 * Write or edit a review (docs/detailed-designs/reviews/write-review and
 * edit-or-delete-review, docs/mocks/dialogs/review).
 */
@Component({
  selector: 'app-review-dialog',
  imports: [Alert, Button, Dialog, FormField, FormSummary, Icon, StarInput, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './review-dialog.html',
})
export class ReviewDialog {
  readonly open = input(false);
  readonly subject = input.required<ReviewDialogSubject | null>();
  readonly returnFocus = input<HTMLElement | null>(null);
  /** Saving changed the reviews, whatever the dialog does next. */
  readonly saved = output<ReviewResult>();
  readonly closed = output<ReviewDialogOutcome>();

  private readonly api = inject(ReviewsService);
  private readonly session = inject(Session);
  private readonly injector = inject(Injector);

  protected readonly starLabels = STAR_LABELS;
  protected readonly step = signal<Step>('form');
  protected readonly rating = signal<1 | 2 | 3 | 4 | 5 | null>(null);
  protected readonly text = signal('');
  protected readonly errors = signal<ReviewErrors>({ rating: null, text: null });
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly result = signal<ReviewResult | null>(null);

  protected readonly editing = computed(() => this.subject()?.mode === 'edit');
  protected readonly title = computed(() => (this.editing() ? $localize`:@@review.editTitle:Edit your review` : $localize`:@@review.writeTitle:Write a review`));
  protected readonly description = computed(() => {
    const s = this.subject();
    if (!s) return '';
    return s.mode === 'edit'
      ? $localize`:@@review.editDesc:${s.catererName}:name: · you can edit until ${shortDate(s.editableUntil)}:date:`
      : $localize`:@@review.writeDesc:${s.catererName}:name: · your event on ${shortDate(s.eventDate)}:date:`;
  });
  protected readonly help = computed(() => {
    const s = this.subject();
    if (!s) return '';
    const month = monthYear(s.mode === 'edit' ? `${s.eventMonth}-15` : s.eventDate);
    return $localize`:@@review.help:20 to 2,000 characters. Shown as ${s.reviewerLabel}:label:, event in ${month}:month:.`;
  });
  protected readonly length = computed(() => graphemeLength(this.text()));
  protected readonly counter = computed(() => `${count(this.length())} / ${count(TEXT_MAX)}`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return [e.rating && { controlId: 'star-1', message: e.rating }, e.text && { controlId: 'text', message: e.text }].filter(Boolean) as SummaryItem[];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@review.action:post your review`));
  protected readonly busyMessage = computed(() => (this.editing() ? $localize`:@@review.saving:Saving your review` : $localize`:@@review.posting:Posting your review`));
  protected readonly liveTitle = computed(() => {
    const first = (this.session.user()?.displayName ?? '').split(/\s+/)[0];
    return $localize`:@@review.liveTitle:Thanks, ${first}:name:. Your review is live.`;
  });
  protected readonly liveText = computed(() => {
    const s = this.subject();
    const until = this.result()?.editableUntil;
    return s && until ? $localize`:@@review.liveText:It’s on ${s.catererName}:name:’s page now. You can edit it until ${shortDate(until)}:date:, or delete it any time.` : '';
  });
  protected readonly cancelText = $localize`:@@common.cancel:Cancel`;
  protected readonly notPostedTitle = $localize`:@@review.failedTitle:Your review wasn’t posted`;
  protected readonly notSavedTitle = $localize`:@@review.failedEditTitle:Your changes weren’t saved`;

  private readonly outcomeButton = viewChild('outcome', { read: Button });

  constructor() {
    // Each opening starts from the subject: empty to write, prefilled to edit.
    effect(() => {
      const open = this.open();
      const s = this.subject();
      untracked(() => {
        if (!open) return;
        this.step.set('form');
        this.errors.set({ rating: null, text: null });
        this.attempt.set(0);
        this.failed.set(false);
        this.result.set(null);
        this.rating.set(s?.mode === 'edit' ? (s.rating as 1 | 2 | 3 | 4 | 5) : null);
        this.text.set(s?.mode === 'edit' ? s.text : '');
      });
    });
  }

  protected async submit(): Promise<void> {
    const s = this.subject();
    if (this.busy() || !s) return;
    this.failed.set(false);
    const errors = reviewErrors(this.rating(), this.length());
    this.errors.set(errors);
    if (errors.rating || errors.text) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      const body = { rating: this.rating()!, text: this.text().trim() };
      const result = await firstValueFrom(s.mode === 'edit' ? this.api.update(s.reviewId, body) : this.api.create(s.slug, body));
      this.result.set(result);
      this.saved.emit(result);
      if (result.status === 'Held') this.show('held');
      else if (s.mode === 'edit') this.closed.emit('saved');
      else this.show('live');
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors) {
        this.errors.set({ rating: problem.errors['rating']?.[0] ?? null, text: problem.errors['text']?.[0] ?? null });
        this.attempt.update((n) => n + 1);
      } else if (status === 409) {
        // Already reviewed (L2-049.4): the page refreshes and offers Edit on the existing review.
        this.closed.emit('saved');
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected finish(): void {
    this.closed.emit(this.step() === 'live' ? 'see-review' : 'saved');
  }

  private show(step: Step): void {
    this.step.set(step);
    afterNextRender(() => this.outcomeButton()?.focus(), { injector: this.injector });
  }
}
