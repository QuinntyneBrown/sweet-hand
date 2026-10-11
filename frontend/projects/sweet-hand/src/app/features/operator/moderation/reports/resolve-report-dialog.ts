import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Radio, RadioGroup, Textarea, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../../core/forms/problem';
import { firstName } from '../moderation-text';
import { conflictText } from '../decisions/decision-text';
import { OPERATOR_MODERATION_SERVICE } from '@sweet-hand/api';

/**
 * "Resolve report": dismiss with a note, or take action on the reported
 * review or caterer with a reason sent to its author (handle-reports design;
 * docs/mocks/dialogs/resolve-report).
 */
@Component({
  selector: 'app-resolve-report-dialog',
  imports: [Alert, Dialog, FormField, FormSummary, Radio, RadioGroup, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      title="Resolve report"
      i18n-title="@@resolve.title"
      [description]="description()"
      [form]="true"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage()"
      [returnFocus]="returnFocus()"
      (dismissed)="dismissed.emit()"
      (submitted)="resolve()"
    >
      @if (conflict(); as c) {
        <sh-alert tone="warning" live="assertive" title="This report changed while you were looking" i18n-title="@@resolve.conflictTitle">{{ c }}</sh-alert>
      } @else if (failed()) {
        <sh-alert tone="danger" live="assertive" title="We couldn’t resolve this report" i18n-title="@@resolve.failedTitle"
          ><ng-container i18n="@@decision.failedKept">Nothing has changed. Check your connection and try again; your reason is kept.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryTitle" [headingLevel]="3" summaryId="dlg-summary" [items]="summary()" [attempt]="attempt()" />
      <sh-radio-group name="decision" [(value)]="decision" [disabled]="busy()" [autofocus]="true">
        <span slot="legend" i18n="@@resolve.decision">Decision</span>
        <sh-radio value="dismiss" description="Nothing breaks the rules. Any automatic hiding is undone." i18n-description="@@resolve.dismissHelp"
          ><ng-container i18n="@@resolve.dismiss">Dismiss</ng-container></sh-radio
        >
        <sh-radio value="action" [description]="actionHelp()"><ng-container i18n="@@resolve.takeAction">Take action</ng-container></sh-radio>
      </sh-radio-group>
      @if (decision() === 'action') {
        <sh-radio-group name="act" [(value)]="act" [disabled]="busy()">
          <span slot="legend" i18n="@@resolve.action">Action</span>
          @if (isReview()) {
            <sh-radio value="hide" description="Reversible. It leaves the page and the rating within a minute." i18n-description="@@resolve.hideHelp"
              ><ng-container i18n="@@resolve.hide">Hide the review</ng-container></sh-radio
            >
            <sh-radio value="remove-review" description="Permanent. Only the audit entry remains." i18n-description="@@resolve.removeReviewHelp"
              ><ng-container i18n="@@resolve.removeReview">Remove the review</ng-container></sh-radio
            >
          } @else {
            <sh-radio value="suspend" description="Hidden from the listing until reinstated." i18n-description="@@resolve.suspendHelp"
              ><ng-container i18n="@@resolve.suspend">Suspend the caterer</ng-container></sh-radio
            >
            <sh-radio value="remove" description="Permanent. The page returns “gone”." i18n-description="@@resolve.removeHelp"
              ><ng-container i18n="@@resolve.remove">Remove the caterer</ng-container></sh-radio
            >
          }
        </sh-radio-group>
      }
      <sh-form-field [label]="noteLabel()" controlId="note" [help]="noteHelp()" [error]="error()">
        <sh-textarea name="note" [rows]="2" [required]="true" [(value)]="note" [readonly]="busy()" />
      </sh-form-field>
      <p class="text-caption" i18n="@@resolve.caption">The signed-in reporter is emailed that their report was reviewed. The email doesn’t say what you decided.</p>
      <button slot="footer" class="btn btn--primary" type="submit" [attr.aria-busy]="busy() ? 'true' : null" [attr.aria-disabled]="busy() ? 'true' : null">
        {{ submitLabel() }}
      </button>
    </sh-dialog>
  `,
})
export class ResolveReportDialog {
  private readonly api = inject(OPERATOR_MODERATION_SERVICE);

  readonly open = input(false);
  readonly group = input.required<ReportGroupView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly dismissed = output<void>();
  readonly done = output<ReportGroupView>();

  protected readonly decision = signal<string | null>('dismiss');
  protected readonly act = signal<string | null>('hide');
  protected readonly note = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
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
    const e = this.error();
    return e ? [{ controlId: 'note', message: e }] : [];
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.decision.set('dismiss');
        this.act.set(this.isReview() ? 'hide' : 'suspend');
        this.note.set('');
        this.error.set(null);
        this.failed.set(false);
        this.conflict.set(null);
        this.attempt.set(0);
      });
    });
  }

  protected async resolve(): Promise<void> {
    if (this.busy() || this.conflict()) return;
    const dismiss = this.decision() !== 'action';
    const note = this.note().trim();
    const error = note
      ? null
      : dismiss
        ? $localize`:@@resolve.noteRequired:Add a note explaining your decision`
        : $localize`:@@decision.reasonRequired:Add a reason for this change`;
    this.error.set(error);
    this.failed.set(false);
    if (error) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      const request = dismiss ? { decision: 'dismiss' as const, note } : { decision: 'action' as const, action: this.act() as ResolveAction, note };
      this.done.emit(await firstValueFrom(this.api.resolveReport(this.group().id, request)));
    } catch (e) {
      const { status, problem } = problemOf(e);
      if (status === 400 && problem.errors?.['note']) {
        this.error.set(problem.errors['note'][0]);
        this.attempt.update((n) => n + 1);
      } else if (status === 409) {
        const t = this.group().target;
        this.conflict.set(conflictText(t.kind === 'Review' ? t.caterer.name : t.name, problem));
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
