import { ChangeDetectionStrategy, Component, ElementRef, Injector, afterNextRender, computed, effect, inject, input, output, signal, untracked, viewChild } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Icon, Stars, Textarea, Well, type SummaryItem } from '@sweet-hand/components';
import { count, monthYear, shortDate } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { CatererProfileService, type OwnReviewView } from '@sweet-hand/api';

type Outcome = { kind: 'saved'; review: OwnReviewView } | { kind: 'deleted'; review: OwnReviewView; text: string };

/** Respond to a review and Edit your response (docs/mocks/dialogs/review-response; respond-to-review, L2-052). */
@Component({
  selector: 'app-review-response-dialog',
  imports: [Alert, Dialog, FormField, FormSummary, Icon, Stars, Textarea, Well],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      size="form"
      [form]="true"
      [title]="title()"
      [description]="description()"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy() !== null"
      [busyMessage]="busyMessage()"
      (dismissed)="closed.emit()"
      (submitted)="save()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" [title]="failedTitle()"
          ><ng-container i18n="@@response.failedText">We couldn’t reach Sweet Hand. Your text is still here; try again.</ng-container></sh-alert
        >
      } @else if (conflicted()) {
        <sh-alert live="polite" title="You’ve already responded to this review" i18n-title="@@response.conflictTitle"
          ><ng-container i18n="@@response.conflictText">Edit your response below instead.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryHeading()" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="response-summary" />
      @if (review(); as r) {
        <sh-well as="figure">
          <div class="review__head">
            <span class="review__author">{{ r.author }}</span><span class="review__date">{{ eventLabel() }}</span>
            <sh-stars [value]="r.rating" [label]="ratingLabel()" />
          </div>
          <blockquote class="review__body" style="margin: var(--space-2) 0 0">{{ r.text }}</blockquote>
        </sh-well>
      }
      <sh-form-field label="Your response" i18n-label="@@response.label" controlId="response" [error]="error()" [help]="help()" [counter]="counter()" [counterOver]="text().trim().length > 1000">
        <sh-textarea name="response" [rows]="4" [required]="true" [autofocus]="true" [readonly]="busy() !== null" [value]="text()" (valueChange)="text.set($event)" />
      </sh-form-field>
      @if (editing()) {
        <button
          #deleteButton
          slot="footer-start"
          class="btn btn--ghost push-start"
          type="button"
          [disabled]="busy() !== null"
          [attr.aria-busy]="busy() === 'delete' ? 'true' : null"
          (click)="deleteResponse()"
        >
          <svg shIcon="trash"></svg>{{ confirming() ? confirmLabel : deleteLabel }}
        </button>
      }
      <button slot="footer" class="btn btn--primary" type="submit" [attr.aria-busy]="busy() === 'save' ? 'true' : null" [attr.aria-disabled]="busy() ? 'true' : null">
        {{ submitLabel() }}
      </button>
    </sh-dialog>
  `,
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
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal<'save' | 'delete' | null>(null);
  protected readonly failed = signal(false);
  protected readonly confirming = signal(false);
  /** The existing response found when posting a second one (L2-052.2). */
  protected readonly conflicted = signal<{ text: string; createdAt: string } | null>(null);
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
    this.error() ? null : $localize`:@@response.help:Public on your page as “Response from ${this.business()}:business:”. ${this.firstName()}:name: gets an email.`,
  );
  protected readonly counter = computed(() => $localize`:@@response.counter:${count(this.text().trim().length)}:count: / 1,000`);
  protected readonly eventLabel = computed(() => (this.review() ? $localize`:@@review.eventIn:Event in ${monthYear(`${this.review()!.eventMonth}-15`)}:month:` : ''));
  protected readonly ratingLabel = computed(() => $localize`:@@review.rating:${this.review()?.rating ?? 0}:rating: out of 5`);
  protected readonly summary = computed<SummaryItem[]>(() => (this.error() ? [{ controlId: 'response', message: this.error()! }] : []));
  protected readonly summaryHeading = computed(() =>
    this.editing() ? $localize`:@@response.fixSave:Fix 1 thing to save your response` : $localize`:@@response.fixPost:Fix 1 thing to post your response`,
  );
  protected readonly submitLabel = computed(() => {
    if (this.failed()) return $localize`:@@common.tryAgain:Try again`;
    return this.editing() ? $localize`:@@response.save:Save response` : $localize`:@@response.post:Post response`;
  });
  protected readonly busyMessage = computed(() => {
    if (this.busy() === 'delete') return $localize`:@@response.deleting:Deleting your response`;
    return this.editing() ? $localize`:@@response.saving:Saving your response` : $localize`:@@response.posting:Posting your response`;
  });
  protected readonly failedTitle = computed(() =>
    this.editing() ? $localize`:@@response.saveFailed:Your response wasn’t saved` : $localize`:@@response.postFailed:Your response wasn’t posted`,
  );

  constructor() {
    effect(() => {
      if (!this.open()) return;
      const r = this.review();
      untracked(() => {
        this.text.set(r?.response?.text ?? '');
        this.error.set(null);
        this.failed.set(false);
        this.confirming.set(false);
        this.conflicted.set(null);
        this.attempt.set(0);
      });
    });
  }

  /** 1 to 1,000 characters of plain text (L2-052). */
  protected async save(): Promise<void> {
    const r = this.review();
    if (!r || this.busy()) return;
    const text = this.text().trim();
    if (text.length < 1 || text.length > 1000) {
      this.error.set($localize`:@@response.error:Write a response, up to 1,000 characters`);
      this.attempt.update((n) => n + 1);
      return;
    }
    this.error.set(null);
    this.failed.set(false);
    this.busy.set('save');
    try {
      const review = await firstValueFrom(this.editing() ? this.api.editResponse(r.id, text) : this.api.respond(r.id, text));
      this.done.emit({ kind: 'saved', review });
    } catch (error) {
      const { status, problem } = problemOf(error);
      const existing = problem['response'] as { text: string; createdAt: string } | undefined;
      if (status === 409 && existing) {
        // A response already exists: offer to edit it instead (L2-052.2).
        this.conflicted.set(existing);
        this.text.set(existing.text);
      } else if (status === 400) {
        this.error.set(problem.errors?.['text']?.[0] ?? $localize`:@@response.error:Write a response, up to 1,000 characters`);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(null);
    }
  }

  /** Delete asks once in place: the button turns into "Delete for good?" (mock note). */
  protected async deleteResponse(): Promise<void> {
    const r = this.review();
    if (!r || this.busy()) return;
    if (!this.confirming()) {
      this.confirming.set(true);
      afterNextRender(() => this.deleteButton()?.nativeElement.focus(), { injector: this.injector });
      return;
    }
    const text = this.existing()?.text ?? '';
    this.busy.set('delete');
    this.failed.set(false);
    try {
      const review = await firstValueFrom(this.api.deleteResponse(r.id));
      this.done.emit({ kind: 'deleted', review, text });
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(null);
    }
  }
}
