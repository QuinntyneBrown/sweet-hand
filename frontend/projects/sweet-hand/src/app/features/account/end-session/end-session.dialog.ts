import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog } from '@sweet-hand/components';
import { whenActive } from '../account-view';
import { AccountService, type ActiveSession } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

/** Sign out of another device (docs/mocks/dialogs/end-session; L2-078.4, L2-078.5). */
@Component({
  selector: 'app-end-session-dialog',
  imports: [Alert, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './end-session.dialog.html',
})
export class EndSessionDialog {
  private readonly api = inject(AccountService);

  readonly open = input(false);
  readonly session = input<ActiveSession | null>(null);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly signedOut = output<ActiveSession>();

  protected readonly state = new FormDialogState(this.open, { noErrors: null });
  protected readonly title = computed(() => $localize`:@@endSession.title:Sign out of ${this.session()?.device ?? ''}:device:?`);
  protected readonly busyMessage = computed(() => $localize`:@@endSession.busy:Signing out ${this.session()?.device ?? ''}:device:`);
  protected readonly lastActive = computed(() => {
    const s = this.session();
    if (!s) return '';
    const when = whenActive(s.lastActiveAt);
    return when.charAt(0).toUpperCase() + when.slice(1);
  });

  protected async end(): Promise<void> {
    const s = this.session();
    if (this.state.busy() || !s) return;
    await this.state.submit(async () => {
      await firstValueFrom(this.api.endSession(s.id));
      this.signedOut.emit(s);
    });
  }
}
