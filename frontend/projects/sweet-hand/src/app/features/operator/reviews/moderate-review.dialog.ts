import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Checkbox, Dialog, FormField, FormSummary, Icon, Stars, Textarea, Well, type SummaryItem } from '@sweet-hand/components';
import { summaryHeading } from '../../../core/forms/validation';
import { ratingLabel } from '../../reviews/reviews-section/review-labels';
import { type ModeratedReview, type ModerationAction, OperatorSettingsService } from '@sweet-hand/api';
import type { Tone } from './tone';

/** Approve, keep hidden, restore or remove a review, with a reason (docs/mocks/dialogs/moderate-review; ModerateReviewDialog, L2-059). */
@Component({
  selector: 'app-moderate-review-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Checkbox, Dialog, FormField, FormSummary, Icon, Stars, Textarea, Well],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './moderate-review.dialog.html',
  styleUrl: './moderate-review.dialog.css',
})
export class ModerateReviewDialog {
  private readonly api = inject(OperatorSettingsService);

  readonly open = input(false);
  readonly review = input.required<ModeratedReview>();
  readonly action = input.required<ModerationAction>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly decided = output<{ review: ModeratedReview; action: ModerationAction }>();

  protected readonly reason = new FormControl('', { nonNullable: true });
  protected readonly understood = signal(false);
  protected readonly errors = signal<{ reason?: string; understand?: string }>({});
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly saving = $localize`:@@moderate.busy:Saving your decision`;
  protected readonly retryLabel = $localize`:@@common.tryAgain:Try again`;

  protected readonly tone = computed<Tone>(() => ({ approve: 'success', hide: 'info', restore: 'success', remove: 'danger' })[this.action()] as Tone);
  protected readonly byline = computed(() => $localize`:@@reviewsAdmin.by:by ${this.review().reviewer}:reviewer:`);
  protected readonly stars = computed(() => ratingLabel(this.review().rating));
  protected readonly title = computed(() => {
    const who = this.review().reviewer;
    switch (this.action()) {
      case 'approve':
        return $localize`:@@moderate.approveTitle:Approve ${who}:reviewer:’s review?`;
      case 'hide':
        return $localize`:@@moderate.hideTitle:Keep ${who}:reviewer:’s review hidden?`;
      case 'restore':
        return $localize`:@@moderate.restoreTitle:Restore ${who}:reviewer:’s review?`;
      case 'remove':
        return $localize`:@@moderate.removeTitle:Remove ${who}:reviewer:’s review permanently?`;
    }
  });
  protected readonly description = computed(() => {
    const { reviewer: who, catererName: caterer } = this.review();
    switch (this.action()) {
      case 'approve':
        return $localize`:@@moderate.approveText:It appears on ${caterer}:caterer:’s page within a minute and counts toward the average.`;
      case 'hide':
        return $localize`:@@moderate.hideText:It stays off ${caterer}:caterer:’s page and out of the average. ${who}:reviewer: is emailed your reason. You can restore it later.`;
      case 'restore':
        return $localize`:@@moderate.restoreText:It reappears on ${caterer}:caterer:’s page within a minute and counts toward the average again. ${who}:reviewer: is emailed your reason.`;
      case 'remove':
        return $localize`:@@moderate.removeText:It can’t be restored. Only the audit entry is kept. ${who}:reviewer: is emailed your reason.`;
    }
  });
  protected readonly submitLabel = computed(() => {
    switch (this.action()) {
      case 'approve':
        return $localize`:@@moderate.approveSubmit:Approve and publish`;
      case 'hide':
        return $localize`:@@reviewsAdmin.keepHidden:Keep hidden`;
      case 'restore':
        return $localize`:@@moderate.restoreSubmit:Restore review`;
      case 'remove':
        return $localize`:@@moderate.removeSubmit:Remove permanently`;
    }
  });
  /** The review text with what the check matched marked, as on the list. */
  protected readonly parts = computed(() => {
    const { text, held } = this.review();
    const out: { text: string; mark: boolean }[] = [];
    let at = 0;
    for (const { start, end } of [...(held?.ranges ?? [])].sort((a, b) => a.start - b.start)) {
      if (start > at) out.push({ text: text.slice(at, start), mark: false });
      out.push({ text: text.slice(Math.max(start, at), end), mark: true });
      at = Math.max(at, end);
    }
    if (at < text.length) out.push({ text: text.slice(at), mark: false });
    return out;
  });
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return [e.reason ? { controlId: 'reason', message: e.reason } : null, e.understand ? { controlId: 'understand', message: e.understand } : null].filter(
      (x): x is SummaryItem => !!x,
    );
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@moderate.action:save your decision`));

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          this.reason.reset();
          this.understood.set(false);
          this.errors.set({});
          this.failed.set(false);
          this.attempt.set(0);
        });
    });
  }

  protected async decide(): Promise<void> {
    if (this.busy()) return;
    const reason = this.reason.value.trim();
    const errors: { reason?: string; understand?: string } = {};
    if (!reason) errors.reason = $localize`:@@moderate.reasonRequired:Add a reason for this decision`;
    if (this.action() === 'remove' && !this.understood()) errors.understand = $localize`:@@moderate.understandRequired:Confirm you understand the review can’t be restored`;
    this.errors.set(errors);
    if (errors.reason || errors.understand) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.failed.set(false);
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.moderate(this.review().id, this.action(), { reason }));
      this.decided.emit({ review: this.review(), action: this.action() });
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
