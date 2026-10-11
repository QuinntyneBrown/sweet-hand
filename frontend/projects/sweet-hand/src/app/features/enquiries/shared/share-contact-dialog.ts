import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Button, Dialog, Icon } from '@sweet-hand/components';
import { otherShortName } from '../thread-view';
import { EnquiriesService, type ThreadView } from '@sweet-hand/api';

/** "Share your contact details?" (share-contact-details design; docs/mocks/dialogs/share-contact). */
@Component({
  selector: 'app-share-contact-dialog',
  imports: [Button, Dialog, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './share-contact-dialog.html',
})
export class ShareContactDialog {
  private readonly api = inject(EnquiriesService);

  readonly open = input(false);
  readonly thread = input.required<ThreadView>();
  readonly returnFocus = input<HTMLElement | null>(null);
  readonly done = output<ThreadView>();
  readonly dismissed = output<void>();

  protected readonly title = $localize`:@@share.title:Share your contact details?`;
  protected readonly busyMessage = $localize`:@@share.busy:Sharing your contact details`;
  protected readonly description = computed(() => {
    const t = this.thread();
    const name = otherShortName(t);
    return t.viewer === 'customer'
      ? $localize`:@@share.text:Your email and phone will show to ${name}:name: in this enquiry only. Other caterers and other enquiries stay private. You can’t take this back.`
      : $localize`:@@share.textCaterer:Your business email and phone will show to ${name}:name: in this enquiry only. Your other enquiries stay private. You can’t take this back.`;
  });
  protected readonly willSee = computed(() => $localize`:@@share.willSee:${otherShortName(this.thread())}:name: will see`);
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
      this.done.emit(await firstValueFrom(this.api.shareContactDetails(this.thread().id)));
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
