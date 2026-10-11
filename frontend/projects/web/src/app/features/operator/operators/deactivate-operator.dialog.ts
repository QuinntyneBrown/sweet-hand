import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, Icon, TextField } from '@sweet-hand/components';
import { OperatorSettingsApi } from '../../../core/api/operator-settings-api';
import type { OperatorAccount } from '../../../core/api/operator-settings.models';
import { firstName } from './operators-view';

/** The typed name matches, ignoring case and spacing (docs/mocks/dialogs/deactivate-operator). */
export const confirms = (typed: string, name: string) => typed.replace(/\s+/g, ' ').trim().toLocaleLowerCase('en-CA') === name.toLocaleLowerCase('en-CA');

/** Deactivate operator (docs/mocks/dialogs/deactivate-operator; DeactivateOperatorDialog, L2-056.4). */
@Component({
  selector: 'app-deactivate-operator-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Dialog, FormField, Icon, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (account(); as a) {
      <sh-dialog
        [open]="open()"
        tone="danger"
        [title]="title()"
        [description]="description()"
        closeLabel="Close"
        i18n-closeLabel="@@common.close"
        cancelLabel="Cancel"
        i18n-cancelLabel="@@common.cancel"
        [busy]="busy()"
        [busyMessage]="busyText()"
        [returnFocus]="returnFocus()"
        (dismissed)="closed.emit()"
      >
        <svg slot="icon" shIcon="warning"></svg>
        @if (failed()) {
          <sh-alert tone="danger" live="assertive" [title]="failedTitle()"
            ><ng-container i18n="@@deactivateOperator.failedText">Their account is still active. Try again in a moment.</ng-container></sh-alert
          >
        }
        <p i18n="@@deactivateOperator.audit">Their past actions stay in the audit log.</p>
        <sh-form-field [label]="confirmLabel()" controlId="confirm-name">
          <sh-text-field [formControl]="typed" name="confirm" autocomplete="off" [spellcheck]="false" [readonly]="busy()" />
        </sh-form-field>
        <sh-button slot="footer" variant="danger" [busy]="busy()" [disabled]="!matches()" [disabledFocusable]="true" (activated)="deactivate()"
          ><ng-container i18n="@@deactivateOperator.submit">Deactivate</ng-container></sh-button
        >
      </sh-dialog>
    }
  `,
})
export class DeactivateOperatorDialog {
  private readonly api = inject(OperatorSettingsApi);

  readonly open = input(false);
  readonly account = input<OperatorAccount | null>(null);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly deactivated = output<OperatorAccount>();

  protected readonly typed = new FormControl('', { nonNullable: true });
  private readonly typedValue = toSignal(this.typed.valueChanges, { initialValue: '' });
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  private readonly name = computed(() => this.account()?.name ?? '');
  protected readonly matches = computed(() => confirms(this.typedValue(), this.name()));
  protected readonly title = computed(() => $localize`:@@deactivateOperator.title:Deactivate ${this.name()}:name:?`);
  protected readonly description = computed(
    () => $localize`:@@deactivateOperator.description:${firstName(this.name())}:first: is signed out everywhere within 60 seconds and can’t sign in again.`,
  );
  protected readonly confirmLabel = computed(() => $localize`:@@deactivateOperator.confirm:Type ${this.name()}:name: to confirm`);
  protected readonly busyText = computed(() => $localize`:@@deactivateOperator.busy:Deactivating ${this.name()}:name:`);
  protected readonly failedTitle = computed(() => $localize`:@@deactivateOperator.failedTitle:We couldn’t deactivate ${this.name()}:name:`);

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          this.typed.reset();
          this.failed.set(false);
        });
    });
  }

  protected async deactivate(): Promise<void> {
    const account = this.account();
    if (this.busy() || !account || !this.matches()) return;
    this.failed.set(false);
    this.busy.set(true);
    try {
      this.deactivated.emit(await firstValueFrom(this.api.deactivateOperator(account.id)));
    } catch {
      this.failed.set(true);
    } finally {
      this.busy.set(false);
    }
  }
}
