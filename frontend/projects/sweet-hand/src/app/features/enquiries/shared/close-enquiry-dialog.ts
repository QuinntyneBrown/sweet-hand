import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, Icon } from '@sweet-hand/components';
import { otherShortName } from '../thread-view';
import { ENQUIRIES_SERVICE, ThreadView } from '@sweet-hand/api';

/** "Close this enquiry?" (decline-or-close-enquiry design; docs/mocks/dialogs/close-enquiry). */
@Component({
  selector: 'app-close-enquiry-dialog',
  imports: [Button, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      [title]="title"
      [description]="description()"
      size="sm"
      tone="danger"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Keep it open"
      i18n-cancelLabel="@@close.keepOpen"
      initialFocus="cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage"
      [returnFocus]="returnFocus()"
      (dismissed)="dismissed.emit()"
    >
      <svg slot="icon" shIcon="warning"></svg>
      @if (failed()) {
        <div class="alert alert--danger" role="alert">
          <svg shIcon="danger"></svg>
          <div class="alert__body">
            <span class="alert__title" i18n="@@close.failedTitle">We couldn’t close the enquiry</span>&ngsp;<span i18n="@@close.failedText">It’s still open. Check your connection and try again.</span>
          </div>
        </div>
      }
      <sh-button slot="footer" variant="danger" [busy]="busy()" (activated)="confirm()">
        @if (failed()) {
          <ng-container i18n="@@common.tryAgain">Try again</ng-container>
        } @else {
          <ng-container i18n="@@thread.close">Close enquiry</ng-container>
        }
      </sh-button>
    </sh-dialog>
  `,
})
export class CloseEnquiryDialog {
  private readonly api = inject(ENQUIRIES_SERVICE);

  readonly open = input(false);
  readonly thread = input.required<ThreadView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly done = output<ThreadView>();
  readonly dismissed = output<void>();

  protected readonly title = $localize`:@@close.title:Close this enquiry?`;
  protected readonly busyMessage = $localize`:@@close.busy:Closing the enquiry`;
  protected readonly description = computed(
    () => $localize`:@@close.text:You and ${otherShortName(this.thread())}:name: won’t be able to send more messages. The conversation stays in your inbox.`,
  );
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);

  constructor() {
    effect(() => {
      if (this.open()) untracked(() => this.failed.set(false));
    });
  }

  protected async confirm(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      this.done.emit(await firstValueFrom(this.api.close(this.thread().id)));
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
