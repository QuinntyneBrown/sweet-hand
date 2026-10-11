import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, ButtonAnchor, Checklist, ChecklistItem, Dialog, FormField, FormSummary, Icon, Textarea, type CheckStatusLabels, type SummaryItem } from '@sweet-hand/components';
import { count } from '../../../../core/format/format';
import { problemOf } from '../../../../core/forms/problem';
import { summaryHeading } from '../../../../core/forms/validation';
import { firstName } from '../moderation-text';
import { conflictText, reasonError } from './decision-text';
import { type CatererRecordView, type DecisionResult, OperatorModerationService } from '@sweet-hand/api';

/**
 * "Remove Pelau House permanently?" with a reason and the business name typed
 * to confirm (suspend-reinstate-remove-profile design; docs/mocks/dialogs/remove-caterer).
 * The button stays aria-disabled until the name matches; pressing it still says what is missing.
 */
@Component({
  selector: 'app-remove-dialog',
  imports: [Alert, ButtonAnchor, Checklist, ChecklistItem, Dialog, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      [title]="title()"
      description="This can’t be undone. To hide it for now, suspend it instead."
      i18n-description="@@remove.description"
      tone="danger"
      [form]="true"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage()"
      [returnFocus]="returnFocus()"
      (dismissed)="dismissed.emit()"
      (submitted)="remove()"
    >
      <svg slot="icon" shIcon="trash"></svg>
      @if (conflict(); as c) {
        <sh-alert tone="warning" live="assertive" title="This profile changed while you were looking" i18n-title="@@decision.conflictTitle">{{ c }}</sh-alert>
      } @else if (failed()) {
        <sh-alert tone="danger" live="assertive" [title]="failedTitle()"
          ><ng-container i18n="@@decision.failedKept">Nothing has changed. Check your connection and try again; your reason is kept.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryTitle()" [headingLevel]="3" summaryId="dlg-summary" [items]="summary()" [attempt]="attempt()" />
      <sh-checklist [statusLabels]="noLabels">
        @for (line of lines(); track $index) {
          <li sh-checklist-item [status]="null">{{ line }}</li>
        }
      </sh-checklist>
      <sh-form-field [label]="reasonLabel()" controlId="reason" help="Kept in the audit log for 7 years." i18n-help="@@remove.reasonHelp" [error]="reasonErr()">
        <sh-textarea name="reason" [rows]="2" [required]="true" [(value)]="reason" [readonly]="busy()" [autofocus]="true" />
      </sh-form-field>
      <div class="field">
        <label class="field__label" for="confirm-name" i18n="@@remove.confirmLabel">Type <strong>{{ record().name }}</strong> to confirm</label>
        <input
          class="input"
          id="confirm-name"
          name="confirm"
          type="text"
          autocomplete="off"
          spellcheck="false"
          [value]="confirm()"
          [readOnly]="busy()"
          [attr.aria-invalid]="confirmErr() ? 'true' : null"
          [attr.aria-describedby]="confirmErr() ? 'confirm-name-error confirm-help' : 'confirm-help'"
          (input)="confirm.set($any($event.target).value)"
        />
        @if (confirmErr()) {
          <span class="field__error" id="confirm-name-error">{{ confirmErr() }}</span>
        }
        <span class="field__help" id="confirm-help" i18n="@@remove.confirmHelp">The button stays off until the name matches.</span>
      </div>
      @if (conflict()) {
        <sh-button-anchor slot="footer" variant="primary" href="/admin/caterers"><ng-container i18n="@@record.backToCaterers">Back to caterers</ng-container></sh-button-anchor>
      } @else {
        <button
          slot="footer"
          class="btn btn--danger"
          type="submit"
          [attr.aria-busy]="busy() ? 'true' : null"
          [attr.aria-disabled]="busy() || !matches() ? 'true' : null"
          i18n="@@remove.submit"
        >
          Remove permanently
        </button>
      }
    </sh-dialog>
  `,
})
export class RemoveDialog {
  private readonly api = inject(OperatorModerationService);

  readonly open = input(false);
  readonly record = input.required<CatererRecordView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly dismissed = output<void>();
  readonly done = output<DecisionResult>();

  protected readonly reason = signal('');
  protected readonly confirm = signal('');
  protected readonly reasonErr = signal<string | null>(null);
  protected readonly confirmErr = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly conflict = signal<string | null>(null);
  protected readonly noLabels: CheckStatusLabels = { done: '', missing: '', attention: '' };

  protected readonly matches = computed(() => this.confirm() === this.record().name);
  protected readonly title = computed(() => $localize`:@@remove.title:Remove ${this.record().name}:name: permanently?`);
  protected readonly reasonLabel = computed(() => $localize`:@@decision.reasonFor:Reason (sent to ${firstName(this.record().owner.name)}:name:)`);
  protected readonly busyMessage = computed(() => $localize`:@@remove.busy:Removing ${this.record().name}:name:`);
  protected readonly failedTitle = computed(() => $localize`:@@remove.failedTitle:We couldn’t remove ${this.record().name}:name:`);
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@remove.action:remove ${this.record().name}:name:`));
  protected readonly summary = computed<SummaryItem[]>(() => {
    const items: SummaryItem[] = [];
    const r = this.reasonErr();
    const c = this.confirmErr();
    if (r) items.push({ controlId: 'reason', message: r });
    if (c) items.push({ controlId: 'confirm-name', message: c });
    return items;
  });
  protected readonly lines = computed(() => {
    const r = this.record();
    const reviews = r.activity.rating.count;
    const photos = r.profile.photos.length;
    const open = r.activity.openEnquiries;
    const lines = [$localize`:@@remove.lineGone:Its page returns “gone” and links back to the listing.`];
    if (reviews || photos) {
      const rv = reviews === 1 ? $localize`:@@remove.oneReview:1 review` : $localize`:@@remove.reviews:${count(reviews)}:count: reviews`;
      const ph = photos === 1 ? $localize`:@@remove.onePhoto:1 photo` : $localize`:@@remove.photos:${count(photos)}:count: photos`;
      lines.push($localize`:@@remove.lineShown:${rv}:reviews: and ${ph}:photos: stop showing within a minute.`);
    }
    if (open === 1) lines.push($localize`:@@remove.lineOneEnquiry:1 open enquiry closes; that customer is emailed.`);
    else if (open > 1) lines.push($localize`:@@remove.lineEnquiries:${open}:count: open enquiries close; those customers are emailed.`);
    lines.push($localize`:@@remove.lineExport:${firstName(r.owner.name)}:name: can still sign in to export their enquiry history.`);
    return lines;
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.reason.set('');
        this.confirm.set('');
        this.reasonErr.set(null);
        this.confirmErr.set(null);
        this.failed.set(false);
        this.conflict.set(null);
        this.attempt.set(0);
      });
    });
  }

  protected async remove(): Promise<void> {
    if (this.busy() || this.conflict()) return;
    const name = this.record().name;
    this.reasonErr.set(reasonError(this.reason()));
    this.confirmErr.set(this.matches() ? null : $localize`:@@remove.nameMismatch:Type the business name exactly: ${name}:name:`);
    this.failed.set(false);
    if (this.summary().length) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      this.done.emit(await firstValueFrom(this.api.remove(this.record().id, this.reason().trim(), this.confirm())));
    } catch (e) {
      const { status, problem } = problemOf(e);
      if (status === 400 && problem.errors) {
        this.reasonErr.set(problem.errors['reason']?.[0] ?? null);
        this.confirmErr.set(problem.errors['confirm']?.[0] ?? null);
        this.attempt.update((n) => n + 1);
      } else if (status === 409) {
        this.conflict.set(conflictText(name, problem));
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
