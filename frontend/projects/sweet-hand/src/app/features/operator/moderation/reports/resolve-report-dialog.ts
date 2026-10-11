import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Radio, RadioGroup, Textarea, type SummaryItem } from '@sweet-hand/components';
import { firstName } from '../moderation-text';
import { conflictText } from '../decisions/decision-text';
import { OperatorModerationService, type ReportGroupView, type ResolveAction } from '@sweet-hand/api';
import { FormDialogState } from '../../../../core/forms/form-dialog-state';
import { fieldError } from '../../../../core/forms/problem';

/**
 * "Resolve report": dismiss with a note, or take action on the reported
 * review or caterer with a reason sent to its author (handle-reports design;
 * docs/mocks/dialogs/resolve-report).
 */
@Component({
  selector: 'app-resolve-report-dialog',
  imports: [Alert, Dialog, FormField, FormSummary, Radio, RadioGroup, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './resolve-report-dialog.html',
})
export class ResolveReportDialog {
  private readonly api = inject(OperatorModerationService);

  readonly open = input(false);
  readonly group = input.required<ReportGroupView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly dismissed = output<void>();
  readonly done = output<ReportGroupView>();

  protected readonly decision = signal<string | null>('dismiss');
  protected readonly act = signal<string | null>('hide');
  protected readonly note = signal('');
  protected readonly conflict = signal<string | null>(null);
  protected readonly summaryTitle = $localize`:@@resolve.summary:Fix 1 thing to resolve the report`;

  protected readonly isReview = computed(() => this.group().target.kind === 'Review');
  /** Who hears the reason: the review's author or the caterer's owner. */
  private readonly recipient = computed(() => {
    const t = this.group().target;
    return t.kind === 'Review' ? t.author : firstName(t.owner);
  });
  protected readonly description = computed(() => {
    const g = this.group();
    const t = g.target;
    const about = t.kind === 'Review' ? $localize`:@@resolve.aboutReview:${t.author}:author:’s review of ${t.caterer.name}:caterer:` : t.name;
    return g.reports.length === 1
      ? $localize`:@@resolve.oneReport:1 report about ${about}:item:.`
      : $localize`:@@resolve.reports:${g.reports.length}:count: reports about ${about}:item:.`;
  });
  protected readonly actionHelp = computed(() =>
    this.isReview() ? $localize`:@@resolve.actionReview:Hide or remove the review.` : $localize`:@@resolve.actionCaterer:Suspend or remove the caterer.`,
  );
  protected readonly noteLabel = computed(() =>
    this.decision() === 'action' ? $localize`:@@resolve.reasonFor:Reason (sent to ${this.recipient()}:name:)` : $localize`:@@resolve.note:Note`,
  );
  protected readonly noteHelp = computed(() =>
    this.decision() === 'action'
      ? $localize`:@@resolve.reasonHelp:${firstName(this.recipient())}:name: gets an email with this reason.`
      : $localize`:@@resolve.noteHelp:Kept with the report and in the audit log. Not sent to anyone.`,
  );
  protected readonly submitLabel = computed(() => {
    if (this.decision() !== 'action') return $localize`:@@resolve.submitDismiss:Dismiss and resolve`;
    switch (this.act()) {
      case 'remove-review':
        return $localize`:@@resolve.submitRemoveReview:Remove review and resolve`;
      case 'suspend':
        return $localize`:@@resolve.submitSuspend:Suspend caterer and resolve`;
      case 'remove':
        return $localize`:@@resolve.submitRemove:Remove caterer and resolve`;
      default:
        return $localize`:@@resolve.submitHide:Hide review and resolve`;
    }
  });
  protected readonly busyMessage = computed(() => {
    if (this.decision() !== 'action') return $localize`:@@resolve.busyDismiss:Dismissing the report`;
    switch (this.act()) {
      case 'remove-review':
        return $localize`:@@resolve.busyRemoveReview:Removing the review and resolving the report`;
      case 'suspend':
        return $localize`:@@resolve.busySuspend:Suspending the caterer and resolving the report`;
      case 'remove':
        return $localize`:@@resolve.busyRemove:Removing the caterer and resolving the report`;
      default:
        return $localize`:@@resolve.busyHide:Hiding the review and resolving the report`;
    }
  });
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    return e ? [{ controlId: 'note', message: e }] : [];
  });

  protected readonly state = new FormDialogState<string | null>(this.open, {
    noErrors: null,
    reset: () => {
      this.decision.set('dismiss');
      this.act.set(this.isReview() ? 'hide' : 'suspend');
      this.note.set('');
      this.conflict.set(null);
    },
  });

  protected async resolve(): Promise<void> {
    if (this.state.busy() || this.conflict()) return;
    const dismiss = this.decision() !== 'action';
    const note = this.note().trim();
    const error = note
      ? null
      : dismiss
        ? $localize`:@@resolve.noteRequired:Add a note explaining your decision`
        : $localize`:@@decision.reasonRequired:Add a reason for this change`;
    if (!this.state.validate(error)) return;
    const request = dismiss ? { decision: 'dismiss' as const, note } : { decision: 'action' as const, action: this.act() as ResolveAction, note };
    await this.state.submit(
      async () => this.done.emit(await firstValueFrom(this.api.resolveReport(this.group().id, request))),
      (status, problem) => {
        const note = status === 400 && fieldError(problem, 'note');
        if (note) return this.state.reject(note);
        if (status !== 409) return false;
        const t = this.group().target;
        this.conflict.set(conflictText(t.kind === 'Review' ? t.caterer.name : t.name, problem));
        return true;
      },
    );
  }
}
