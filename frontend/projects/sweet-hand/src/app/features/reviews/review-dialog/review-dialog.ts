import { ChangeDetectionStrategy, Component, Injector, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, Icon, StarInput, Textarea, graphemeLength } from '@sweet-hand/components';
import { count, monthYear, shortDate } from '../../../core/format/format';
import { summaryFrom, summaryHeading } from '../../../core/forms/validation';
import { Session } from '../../../core/session/session';
import { STAR_LABELS, TEXT_MAX, reviewErrors, type ReviewErrors } from './review-rules';
import { type ReviewResult, ReviewsService } from '@sweet-hand/api';
import type { ReviewDialogSubject } from './review-dialog-subject';
import type { ReviewDialogOutcome } from './review-dialog-outcome';
import type { Step } from './step';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { applyProblem } from '../../../core/forms/problem';

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
  protected readonly result = signal<ReviewResult | null>(null);
  // Each opening starts from the subject: empty to write, prefilled to edit.
  protected readonly state = new FormDialogState<ReviewErrors, ReviewDialogSubject | null>(this.open, {
    noErrors: { rating: null, text: null },
    from: this.subject,
    reset: (s) => {
      this.step.set('form');
      this.result.set(null);
      this.rating.set(s?.mode === 'edit' ? (s.rating as 1 | 2 | 3 | 4 | 5) : null);
      this.text.set(s?.mode === 'edit' ? s.text : '');
    },
  });

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
  protected readonly summary = computed(() => summaryFrom(this.state.errors(), { rating: 'star-1', text: 'text' }));
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

  protected async submit(): Promise<void> {
    const s = this.subject();
    if (this.state.busy() || !s) return;
    if (!this.state.validate(reviewErrors(this.rating(), this.length()))) return;
    await this.state.submit(
      async () => {
        const body = { rating: this.rating()!, text: this.text().trim() };
        const result = await firstValueFrom(s.mode === 'edit' ? this.api.update(s.reviewId, body) : this.api.create(s.slug, body));
        this.result.set(result);
        this.saved.emit(result);
        if (result.status === 'Held') this.show('held');
        else if (s.mode === 'edit') this.closed.emit('saved');
        else this.show('live');
      },
      (status, problem) => {
        if (applyProblem(this.state, status, problem, ['rating', 'text'])) return true;
        if (status !== 409) return false;
        // Already reviewed (L2-049.4): the page refreshes and offers Edit on the existing review.
        this.closed.emit('saved');
        return true;
      },
    );
  }

  protected finish(): void {
    this.closed.emit(this.step() === 'live' ? 'see-review' : 'saved');
  }

  private show(step: Step): void {
    this.step.set(step);
    afterNextRender(() => this.outcomeButton()?.focus(), { injector: this.injector });
  }
}
