import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog } from '@sweet-hand/components';
import { whenActive } from '../account-view';
import { ACCOUNT_SERVICE, ActiveSession } from '@sweet-hand/api';

/** Sign out of another device (docs/mocks/dialogs/end-session; L2-078.4, L2-078.5). */
@Component({
  selector: 'app-end-session-dialog',
  imports: [Alert, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (session(); as s) {
      <sh-dialog
        [open]="open()"
        size="form"
        [form]="true"
        [title]="title()"
        description="Anyone using Sweet Hand on that device will need to sign in again."
        i18n-description="@@endSession.description"
        closeLabel="Close"
        i18n-closeLabel="@@common.close"
        cancelLabel="Cancel"
        i18n-cancelLabel="@@common.cancel"
        [busy]="busy()"
        [busyMessage]="busyMessage()"
        [returnFocus]="returnFocus()"
        (dismissed)="closed.emit()"
        (submitted)="end()"
      >
        @if (failed()) {
          <sh-alert tone="danger" live="assertive" title="That device is still signed in" i18n-title="@@endSession.failedTitle"
            ><ng-container i18n="@@endSession.failedText">Something went wrong on our side. Try again in a moment.</ng-container></sh-alert
          >
        }
        <dl class="kv">
          <dt i18n="@@endSession.device">Device</dt>
          <dd>{{ s.device }}</dd>
          <dt i18n="@@endSession.lastActive">Last active</dt>
          <dd>{{ lastActive() }}</dd>
        </dl>
        <button
          slot="footer"
          class="btn btn--primary"
          type="submit"
          autofocus
          [attr.aria-busy]="busy() ? 'true' : null"
          [attr.aria-disabled]="busy() ? 'true' : null"
          i18n="@@endSession.submit"
        >
          Sign out device
        </button>
      </sh-dialog>
    }
  `,
})
export class EndSessionDialog {
  private readonly api = inject(ACCOUNT_SERVICE);

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
