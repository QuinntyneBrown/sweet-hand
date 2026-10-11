import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, Icon } from '@sweet-hand/components';
import { otherShortName } from '../thread-view';
import { EnquiriesService, type ThreadView } from '@sweet-hand/api';

/** "Close this enquiry?" (decline-or-close-enquiry design; docs/mocks/dialogs/close-enquiry). */
@Component({
  selector: 'app-close-enquiry-dialog',
  imports: [Button, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './close-enquiry-dialog.html',
})
export class CloseEnquiryDialog {
  private readonly api = inject(EnquiriesService);

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
