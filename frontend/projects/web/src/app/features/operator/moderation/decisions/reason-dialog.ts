import { ChangeDetectionStrategy, Component, computed, effect, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom, type Observable } from 'rxjs';
import { Alert, ButtonAnchor, Dialog, FormField, FormSummary, Icon, Textarea, type IconName, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../../core/forms/problem';
import { conflictText } from './decision-text';

/**
 * The shared shape of an operator decision that needs a written reason
 * (docs/mocks/dialogs/{request-changes,suspend-caterer,reinstate-caterer,
 * revert-change,resolve-report,open-enquiry}): consequences, the reason, and
 * the invalid, busy, failed and conflict states. `[slot=before]` and
 * `[slot=after]` place content around the reason field.
 */
@Component({
  selector: 'app-reason-dialog',
  imports: [Alert, ButtonAnchor, Dialog, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <sh-dialog
      [open]="open()"
      [title]="title()"
      [description]="description()"
      [photo]="photo()"
      [tone]="tone()"
      [form]="true"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage()"
      [returnFocus]="returnFocus()"
      (dismissed)="dismissed.emit()"
      (submitted)="submit()"
    >
      @if (icon(); as i) {
        <svg slot="icon" [shIcon]="i"></svg>
      }
      @if (conflict(); as c) {
        <sh-alert tone="warning" live="assertive" title="This profile changed while you were looking" i18n-title="@@decision.conflictTitle">{{ c }}</sh-alert>
      } @else if (refused() && forbiddenTitle()) {
        <sh-alert tone="danger" live="assertive" [title]="forbiddenTitle()!">{{ forbiddenText() }}</sh-alert>
      } @else if (failed()) {
        <sh-alert tone="danger" live="assertive" [title]="failedTitle()">{{ failedText() }}</sh-alert>
      }
      <sh-form-summary [heading]="summaryHeading()" [headingLevel]="3" summaryId="dlg-summary" [items]="summary()" [attempt]="attempt()" />
      <ng-content select="[slot=before]" />
      <sh-form-field [label]="label()" [controlId]="controlId()" [help]="help()" [error]="error()">
        <sh-textarea [name]="controlId()" [rows]="rows()" [required]="true" [(value)]="reason" [readonly]="busy()" [autofocus]="true" />
      </sh-form-field>
      <ng-content select="[slot=after]" />
      @if (conflict()) {
        <sh-button-anchor slot="footer" variant="primary" [href]="conflictHref()">{{ conflictLink() }}</sh-button-anchor>
      } @else {
        <button
          slot="footer"
          [class]="submitVariant() === 'danger' ? 'btn btn--danger' : 'btn btn--primary'"
          type="submit"
          [attr.aria-busy]="busy() ? 'true' : null"
          [attr.aria-disabled]="busy() ? 'true' : null"
        >
          {{ failed() && retryLabel() ? retryLabel() : submitLabel() }}
        </button>
      }
    </sh-dialog>
  `,
})
export class ReasonDialog<T = unknown> {
  readonly open = input(false);
  readonly title = input.required<string>();
  readonly description = input<string | null>(null);
  readonly photo = input<string | null>(null);
  readonly tone = input<'info' | 'warning' | 'danger' | 'success' | null>(null);
  readonly icon = input<IconName | null>(null);
  /** The record's name, for the conflict message. */
  readonly name = input('');
  readonly label = input.required<string>();
  readonly help = input<string | null>(null);
  readonly controlId = input('reason');
  readonly rows = input(3);
  readonly initialReason = input('');
  readonly submitLabel = input.required<string>();
  /** Shown instead of the submit label after a failure, when the mock says "Try again". */
  readonly retryLabel = input<string | null>(null);
  readonly submitVariant = input<'primary' | 'danger'>('primary');
  readonly busyMessage = input.required<string>();
  readonly failedTitle = input.required<string>();
  readonly failedText = input.required<string>();
  readonly summaryHeading = input.required<string>();
  readonly validate = input.required<(reason: string) => string | null>();
  readonly action = input.required<(reason: string) => Observable<T>>();
  readonly conflictHref = input('/admin/queue');
  readonly conflictLink = input($localize`:@@review.backToQueue:Back to review queue`);
  readonly returnFocus = input<HTMLElement | null>(null);
  /** What a 403 means for this decision, when it can happen (L2-034.4). */
  readonly forbiddenTitle = input<string | null>(null);
  readonly forbiddenText = input<string | null>(null);
  /** When the server cannot be reached, close and let the page raise a toast instead of the in-dialog error (admin-toast/danger). */
  readonly toastWhenUnreachable = input(false);

  readonly dismissed = output<void>();
  /** The server did not respond; the reason the operator wrote, to keep for Try again. */
  readonly unreachable = output<string>();
  readonly done = output<{ result: T; reason: string }>();

  protected readonly reason = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly conflict = signal<string | null>(null);
  protected readonly refused = signal(false);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: this.controlId(), message: e }] : [];
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.reason.set(this.initialReason());
        this.error.set(null);
        this.failed.set(false);
        this.conflict.set(null);
        this.refused.set(false);
        this.attempt.set(0);
      });
    });
  }

  protected async submit(): Promise<void> {
    if (this.busy() || this.conflict()) return;
    const reason = this.reason();
    const error = this.validate()(reason);
    this.error.set(error);
    this.failed.set(false);
    this.refused.set(false);
    if (error) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      const result = await firstValueFrom(this.action()(reason.trim()));
      this.done.emit({ result, reason: reason.trim() });
    } catch (e) {
      const { status, problem } = problemOf(e);
      const fieldError = problem.errors?.[this.controlId()]?.[0] ?? problem.errors?.['reason']?.[0];
      if (status === 400 && fieldError) {
        this.error.set(fieldError);
        this.attempt.update((n) => n + 1);
      } else if (status === 409) {
        this.conflict.set(conflictText(this.name(), problem));
      } else if (status === 403 && this.forbiddenTitle()) {
        this.refused.set(true);
      } else if (this.toastWhenUnreachable() && (status === 0 || (status >= 500 && !problem.title))) {
        // No answer from the API: the connection dropped, or a proxy gave up on it.
        this.unreachable.emit(reason);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
