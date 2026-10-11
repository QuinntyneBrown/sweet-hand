import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, FormField, FormSummary, Icon, Textarea, graphemeLength, type SummaryItem } from '@sweet-hand/components';
import { count } from '../../../core/format/format';
import { NOTE_MAX, noteError, otherShortName } from '../thread-view';
import { EnquiriesService, type ThreadView } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

/**
 * "Decline Priya’s enquiry?" with an optional note of up to 500 characters
 * (decline-or-close-enquiry design; docs/mocks/dialogs/decline-enquiry).
 */
@Component({
  selector: 'app-decline-enquiry-dialog',
  imports: [Button, Dialog, FormField, FormSummary, Icon, Textarea],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './decline-enquiry-dialog.html',
})
export class DeclineEnquiryDialog {
  private readonly api = inject(EnquiriesService);

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
  protected readonly conflict = signal(false);
  protected readonly state = new FormDialogState<string | null>(this.open, {
    noErrors: null,
    reset: () => {
      this.note.set('');
      this.conflict.set(false);
    },
  });
  protected readonly over = computed(() => graphemeLength(this.note()) > NOTE_MAX);
  protected readonly counter = computed(() => `${count(graphemeLength(this.note()))} / ${count(NOTE_MAX)}`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    return e ? [{ controlId: 'note', message: e }] : [];
  });

  protected async confirm(): Promise<void> {
    if (this.state.busy() || this.conflict()) return;
    if (!this.state.validate(noteError(this.note()))) return;
    await this.state.submit(
      async () => this.done.emit(await firstValueFrom(this.api.decline(this.thread().id, this.note().trim()))),
      async (status, problem) => {
        if (status === 400) return this.state.reject(problem.errors?.['note']?.[0] ?? null);
        if (status !== 409) return false;
        this.conflict.set(true);
        const fresh = await firstValueFrom(this.api.thread(this.thread().id, { markRead: false })).catch(() => null);
        if (fresh) this.updated.emit(fresh);
        return true;
      },
    );
  }
}
