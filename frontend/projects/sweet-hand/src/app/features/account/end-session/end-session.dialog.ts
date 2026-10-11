import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog } from '@sweet-hand/components';
import { whenActive } from '../account-view';
import { AccountService, type ActiveSession } from '@sweet-hand/api';

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

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly title = computed(() => $localize`:@@endSession.title:Sign out of ${this.session()?.device ?? ''}:device:?`);
  protected readonly busyMessage = computed(() => $localize`:@@endSession.busy:Signing out ${this.session()?.device ?? ''}:device:`);
  protected readonly lastActive = computed(() => {
    const s = this.session();
    if (!s) return '';
    const when = whenActive(s.lastActiveAt);
    return when.charAt(0).toUpperCase() + when.slice(1);
  });

  constructor() {
    effect(() => {
      if (this.open()) untracked(() => this.failed.set(false));
    });
  }

  protected async end(): Promise<void> {
    const s = this.session();
    if (this.busy() || !s) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      await firstValueFrom(this.api.endSession(s.id));
      this.signedOut.emit(s);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
