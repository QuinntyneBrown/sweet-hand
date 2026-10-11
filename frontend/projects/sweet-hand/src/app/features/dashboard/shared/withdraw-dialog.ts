import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog } from '@sweet-hand/components';
import { Session } from '../../../core/session/session';
import { CATERER_PROFILE_SERVICE, OwnProfileView } from '@sweet-hand/api';

/** Withdraw your submission? (docs/mocks/dialogs/withdraw-submission; submit-profile-for-review, WithdrawSubmissionDialog). */
@Component({
  selector: 'app-withdraw-dialog',
  imports: [Alert, Button, Dialog],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      size="sm"
      title="Withdraw your submission?"
      i18n-title="@@withdraw.title"
      [description]="description()"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Keep it in review"
      i18n-cancelLabel="@@withdraw.keep"
      initialFocus="cancel"
      [busy]="busy()"
      [busyMessage]="busyMessage"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="Your submission wasn’t withdrawn" i18n-title="@@withdraw.failedTitle"
          ><ng-container i18n="@@withdraw.failedText">We couldn’t reach Sweet Hand. Your profile is still in review; try again.</ng-container></sh-alert
        >
      }
      <sh-button slot="footer" variant="primary" [busy]="busy()" (activated)="withdraw()"><ng-container i18n="@@withdraw.action">Withdraw submission</ng-container></sh-button>
    </sh-dialog>
  `,
})
export class WithdrawDialog {
  private readonly api = inject(CATERER_PROFILE_SERVICE);
  private readonly session = inject(Session);

  readonly open = input(false);
  readonly business = input.required<string>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly withdrawn = output<OwnProfileView>();

  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly busyMessage = $localize`:@@withdraw.busy:Withdrawing your submission`;
  protected readonly description = computed(
    () => $localize`:@@withdraw.description:${this.business()}:business: goes back to draft so you can edit it. When you submit again, the 3-day review starts over.`,
  );

  constructor() {
    effect(() => {
      if (this.open()) untracked(() => this.failed.set(false));
    });
  }

  protected async withdraw(): Promise<void> {
    if (this.busy()) return;
    this.busy.set(true);
    this.failed.set(false);
    try {
      const profile = await firstValueFrom(this.api.withdraw());
      void this.session.refresh();
      this.withdrawn.emit(profile);
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
