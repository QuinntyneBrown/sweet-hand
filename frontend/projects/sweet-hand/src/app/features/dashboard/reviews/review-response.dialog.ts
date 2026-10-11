import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, inject, input, output, signal, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Icon, Stars, Textarea, Well, type SummaryItem } from '@sweet-hand/components';
import { count, monthYear, shortDate } from '../../../core/format/format';
import { CatererProfileService, type OwnReviewView } from '@sweet-hand/api';
import type { Outcome } from './outcome';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { fieldError } from '../../../core/forms/problem';

/** Respond to a review and Edit your response (docs/mocks/dialogs/review-response; respond-to-review, L2-052). */
@Component({
  selector: 'app-review-response-dialog',
  imports: [Alert, Dialog, FormField, FormSummary, Icon, Stars, Textarea, Well],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './review-response.dialog.html',
})
export class ReviewResponseDialog {
  private readonly api = inject(CatererProfileService);
  private readonly injector = inject(Injector);

  readonly open = input(false);
  readonly review = input<OwnReviewView | null>(null);
  readonly business = input.required<string>();

  readonly closed = output<void>();
  readonly done = output<Outcome>();

  private readonly deleteButton = viewChild<ElementRef<HTMLButtonElement>>('deleteButton');

  protected readonly text = signal('');
  protected readonly confirming = signal(false);
  /** The existing response found when posting a second one (L2-052.2). */
  protected readonly conflicted = signal<{ text: string; createdAt: string } | null>(null);
  protected readonly state = new FormDialogState<string | null, OwnReviewView | null>(this.open, {
    noErrors: null,
    from: this.review,
    reset: (r) => {
      this.text.set(r?.response?.text ?? '');
      this.confirming.set(false);
      this.conflicted.set(null);
    },
  });
  /** The request in flight deletes the response rather than saving it. */
  protected readonly deleting = signal(false);
  protected readonly deleteLabel = $localize`:@@response.delete:Delete response`;
  protected readonly confirmLabel = $localize`:@@response.confirmDelete:Delete for good?`;

  protected readonly existing = computed(() => this.conflicted() ?? this.review()?.response ?? null);
  protected readonly editing = computed(() => !!this.existing());
  protected readonly firstName = computed(() => (this.review()?.author ?? '').split(' ')[0]);
  protected readonly title = computed(() =>
    this.editing() ? $localize`:@@response.editTitle:Edit your response` : $localize`:@@response.title:Respond to ${this.review()?.author ?? ''}:author:`,
  );
  protected readonly description = computed(() => {
    const e = this.existing();
    return e
      ? $localize`:@@response.editDesc:Posted ${shortDate(e.createdAt)}:date:. You can edit or delete it any time.`
      : $localize`:@@response.desc:One public response per review.`;
  });
  protected readonly help = computed(() =>
    this.state.errors() ? null : $localize`:@@response.help:Public on your page as “Response from ${this.business()}:business:”. ${this.firstName()}:name: gets an email.`,
  );
  protected readonly counter = computed(() => $localize`:@@response.counter:${count(this.text().trim().length)}:count: / 1,000`);
  protected readonly eventLabel = computed(() => (this.review() ? $localize`:@@review.eventIn:Event in ${monthYear(`${this.review()!.eventMonth}-15`)}:month:` : ''));
  protected readonly ratingLabel = computed(() => $localize`:@@review.rating:${this.review()?.rating ?? 0}:rating: out of 5`);
  protected readonly summary = computed<SummaryItem[]>(() => (this.state.errors() ? [{ controlId: 'response', message: this.state.errors()! }] : []));
  protected readonly summaryHeading = computed(() =>
    this.editing() ? $localize`:@@response.fixSave:Fix 1 thing to save your response` : $localize`:@@response.fixPost:Fix 1 thing to post your response`,
  );
  protected readonly submitLabel = computed(() => {
    if (this.state.failed()) return $localize`:@@common.tryAgain:Try again`;
    return this.editing() ? $localize`:@@response.save:Save response` : $localize`:@@response.post:Post response`;
  });
  protected readonly busyMessage = computed(() => {
    if (this.deleting()) return $localize`:@@response.deleting:Deleting your response`;
    return this.editing() ? $localize`:@@response.saving:Saving your response` : $localize`:@@response.posting:Posting your response`;
  });
  protected readonly failedTitle = computed(() =>
    this.editing() ? $localize`:@@response.saveFailed:Your response wasn’t saved` : $localize`:@@response.postFailed:Your response wasn’t posted`,
  );

  /** 1 to 1,000 characters of plain text (L2-052). */
  protected async save(): Promise<void> {
    const r = this.review();
    if (!r || this.state.busy()) return;
    const text = this.text().trim();
    const tooLong = $localize`:@@response.error:Write a response, up to 1,000 characters`;
    if (!this.state.validate(text.length < 1 || text.length > 1000 ? tooLong : null)) return;
    this.deleting.set(false);
    await this.state.submit(
      async () => {
        const review = await firstValueFrom(this.editing() ? this.api.editResponse(r.id, text) : this.api.respond(r.id, text));
        this.done.emit({ kind: 'saved', review });
      },
      (status, problem) => {
        const existing = problem['response'] as { text: string; createdAt: string } | undefined;
        if (status === 400) return this.state.reject(fieldError(problem, 'text') ?? tooLong);
        if (status !== 409 || !existing) return false;
        // A response already exists: offer to edit it instead (L2-052.2).
        this.conflicted.set(existing);
        this.text.set(existing.text);
        return true;
      },
    );
  }

  /** Delete asks once in place: the button turns into "Delete for good?" (mock note). */
  protected async deleteResponse(): Promise<void> {
    const r = this.review();
    if (!r || this.state.busy()) return;
    if (!this.confirming()) {
      this.confirming.set(true);
      afterNextRender(() => this.deleteButton()?.nativeElement.focus(), { injector: this.injector });
      return;
    }
    const text = this.existing()?.text ?? '';
    this.deleting.set(true);
    await this.state.submit(async () => {
      const review = await firstValueFrom(this.api.deleteResponse(r.id));
      this.done.emit({ kind: 'deleted', review, text });
    });
  }
}
