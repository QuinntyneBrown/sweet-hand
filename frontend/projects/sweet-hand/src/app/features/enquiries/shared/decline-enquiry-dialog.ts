import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, FormField, FormSummary, Icon, Textarea, graphemeLength, type SummaryItem } from '@sweet-hand/components';
import { count } from '../../../core/format/format';
import { problemOf } from '../../../core/forms/problem';
import { NOTE_MAX, noteError, otherShortName } from '../thread-view';
import { ENQUIRIES_SERVICE, ThreadView } from '@sweet-hand/api';

/**
 * "Decline Priya’s enquiry?" with an optional note of up to 500 characters
 * (decline-or-close-enquiry design; docs/mocks/dialogs/decline-enquiry).
 */
@Component({
  selector: 'app-decline-enquiry-dialog',
  imports: [Button, Dialog, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      [title]="title()"
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
      (submitted)="confirm()"
    >
      @if (conflict()) {
        <div class="alert alert--warning">
          <svg shIcon="warning"></svg>
          <div class="alert__body">
            <p class="alert__title">{{ conflictTitle() }}</p>
            <p>{{ conflictText() }}</p>
          </div>
        </div>
      } @else {
        @if (failed()) {
          <div class="alert alert--danger" role="alert">
            <svg shIcon="danger"></svg>
            <div class="alert__body">
              <p class="alert__title" i18n="@@decline.failedTitle">We couldn’t decline the enquiry</p>
              <p>{{ failedText() }}</p>
            </div>
          </div>
        }
        <sh-form-summary heading="Check your note" i18n-heading="@@decline.summary" [headingLevel]="3" summaryId="summary" [items]="summary()" [attempt]="attempt()" />
        <sh-form-field
          [label]="noteLabel()"
          controlId="note"
          optionalMarker="(optional)"
          i18n-optionalMarker="@@field.optional"
          [help]="help()"
          [error]="error()"
          [counter]="counter()"
          [counterOver]="over()"
        >
          <sh-textarea name="note" [rows]="3" [(value)]="note" [readonly]="busy()" />
        </sh-form-field>
      }
      @if (conflict()) {
        <sh-button slot="footer" variant="primary" (activated)="closeInstead.emit()"><ng-container i18n="@@decline.closeInstead">Close enquiry instead</ng-container></sh-button>
      } @else {
        <sh-button slot="footer" type="submit" variant="danger" [busy]="busy()"><ng-container i18n="@@decline.confirm">Decline enquiry</ng-container></sh-button>
      }
    </sh-dialog>
  `,
})
export class DeclineEnquiryDialog {
  private readonly api = inject(ENQUIRIES_SERVICE);

  readonly open = input(false);
  readonly thread = input.required<ThreadView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly done = output<ThreadView>();
  /** The enquiry changed elsewhere (409): the thread as it is now, while the dialog explains. */
  readonly updated = output<ThreadView>();
  readonly closeInstead = output<void>();
  readonly dismissed = output<void>();

  private readonly name = computed(() => otherShortName(this.thread()));
  protected readonly title = computed(() => $localize`:@@decline.title:Decline ${this.name()}:name:’s enquiry?`);
  protected readonly description = computed(() => $localize`:@@decline.text:${this.name()}:name: gets an email saying you can’t take on the event. This can’t be undone.`);
  protected readonly noteLabel = computed(() => $localize`:@@decline.noteLabel:Note to ${this.name()}:name:`);
  protected readonly help = computed(() => $localize`:@@decline.noteHelp:Shown to ${this.name()}:name: in the email and the enquiry`);
  protected readonly busyMessage = computed(() => $localize`:@@decline.busy:Declining ${this.name()}:name:’s enquiry`);
  protected readonly failedText = computed(() => $localize`:@@decline.failedText:Check your connection and try again. ${this.name()}:name: hasn’t been told anything yet.`);
  protected readonly conflictTitle = computed(() => $localize`:@@decline.conflictTitle:You’ve already replied to ${this.name()}:name:`);
  protected readonly conflictText = computed(
    () => $localize`:@@decline.conflictText:An enquiry can only be declined before the first reply. You can close it instead, and ${this.name()}:name: will be told.`,
  );

  protected readonly note = signal('');
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly conflict = signal(false);
  protected readonly over = computed(() => graphemeLength(this.note()) > NOTE_MAX);
  protected readonly counter = computed(() => `${count(graphemeLength(this.note()))} / ${count(NOTE_MAX)}`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: 'note', message: e }] : [];
  });

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.note.set('');
        this.error.set(null);
        this.failed.set(false);
        this.conflict.set(false);
      });
    });
  }

  protected async confirm(): Promise<void> {
    if (this.busy() || this.conflict()) return;
    const error = noteError(this.note());
    this.error.set(error);
    this.failed.set(false);
    if (error) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      this.done.emit(await firstValueFrom(this.api.decline(this.thread().id, this.note().trim())));
    } catch (e) {
      const { status, problem } = problemOf(e);
      if (status === 409) {
        this.conflict.set(true);
        const fresh = await firstValueFrom(this.api.thread(this.thread().id, { markRead: false })).catch(() => null);
        if (fresh) this.updated.emit(fresh);
      } else if (status === 400) {
        this.error.set(problem.errors?.['note']?.[0] ?? null);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
