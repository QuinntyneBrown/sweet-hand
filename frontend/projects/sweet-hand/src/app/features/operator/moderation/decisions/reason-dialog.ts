import { ChangeDetectionStrategy, Component, computed, input, output, signal } from '@angular/core';
import { firstValueFrom, type Observable } from 'rxjs';
import { Alert, ButtonAnchor, Dialog, FormField, FormSummary, Icon, Textarea, type IconName, type SummaryItem } from '@sweet-hand/components';
import { conflictText } from './decision-text';
import { FormDialogState } from '../../../../core/forms/form-dialog-state';
import { paths } from '../../../../core/routing/paths';
import { fieldError } from '../../../../core/forms/problem';

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
  templateUrl: './reason-dialog.html',
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
  readonly conflictHref = input<string>(paths.admin.queue);
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
  protected readonly conflict = signal<string | null>(null);
  protected readonly refused = signal(false);
  protected readonly state = new FormDialogState<string | null>(this.open, {
    noErrors: null,
    reset: () => {
      this.reason.set(this.initialReason());
      this.conflict.set(null);
      this.refused.set(false);
    },
  });
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    return e ? [{ controlId: this.controlId(), message: e }] : [];
  });

  protected async submit(): Promise<void> {
    if (this.state.busy() || this.conflict()) return;
    const reason = this.reason();
    this.refused.set(false);
    if (!this.state.validate(this.validate()(reason))) return;
    await this.state.submit(
      async () => {
        const result = await firstValueFrom(this.action()(reason.trim()));
        this.done.emit({ result, reason: reason.trim() });
      },
      (status, problem) => {
        const message = fieldError(problem, [this.controlId(), 'reason']);
        if (status === 400 && message) return this.state.reject(message);
        if (status === 409) this.conflict.set(conflictText(this.name(), problem));
        else if (status === 403 && this.forbiddenTitle()) this.refused.set(true);
        // No answer from the API: the connection dropped, or a proxy gave up on it.
        else if (this.toastWhenUnreachable() && (status === 0 || (status >= 500 && !problem.title))) this.unreachable.emit(reason);
        else return false;
        return true;
      },
    );
  }
}
