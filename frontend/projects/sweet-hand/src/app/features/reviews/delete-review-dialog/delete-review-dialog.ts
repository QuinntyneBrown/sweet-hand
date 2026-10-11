import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, Icon } from '@sweet-hand/components';
import { REVIEWS_SERVICE } from '@sweet-hand/api';

/**
 * "Delete your review?" (docs/detailed-designs/reviews/edit-or-delete-review,
 * docs/mocks/dialogs/delete-review). Focus starts on "Keep review", the safe choice.
 */
@Component({
  selector: 'app-delete-review-dialog',
  imports: [Alert, Button, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      title="Delete your review?"
      i18n-title="@@deleteReview.title"
      [description]="description()"
      size="sm"
      tone="danger"
      initialFocus="cancel"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Keep review"
      i18n-cancelLabel="@@deleteReview.keep"
      [busy]="busy()"
      [busyMessage]="deleting"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit(false)"
    >
      <svg slot="icon" shIcon="trash"></svg>
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="Your review wasn’t deleted" i18n-title="@@deleteReview.failedTitle"
          ><ng-container i18n="@@deleteReview.failedText">Something went wrong on our side. Try again.</ng-container></sh-alert
        >
      }
      <sh-button slot="footer" variant="danger" [busy]="busy()" (activated)="confirm()"
        >@if (failed()) {<ng-container i18n="@@common.tryAgain">Try again</ng-container>} @else {<ng-container i18n="@@deleteReview.confirm">Delete review</ng-container>}</sh-button
      >
    </sh-dialog>
  `,
})
export class DeleteReviewDialog {
  readonly open = input(false);
  readonly reviewId = input<string | null>(null);
  readonly catererName = input('');
  /** Whether the caterer responded; the response goes with the review (L2-053.3). */
  readonly hasResponse = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);
  /** `true` once the review is deleted. */
  readonly closed = output<boolean>();

  private readonly api = inject(REVIEWS_SERVICE);

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly deleting = $localize`:@@deleteReview.busy:Deleting your review`;
  protected readonly description = computed(() =>
    this.hasResponse()
      ? $localize`:@@deleteReview.descResponse:Your review of ${this.catererName()}:name: and ${this.catererName()}:name:’s response will be removed. This can’t be undone.`
      : $localize`:@@deleteReview.desc:Your review of ${this.catererName()}:name: will be removed. This can’t be undone.`,
  );

  constructor() {
    effect(() => {
      if (this.open()) untracked(() => this.failed.set(false));
    });
  }

  protected async confirm(): Promise<void> {
    const id = this.reviewId();
    if (this.busy() || !id) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      await firstValueFrom(this.api.remove(id));
      this.busy.set(false);
      this.closed.emit(true);
    } catch {
      this.busy.set(false);
      this.failed.set(true);
    }
  }
}
