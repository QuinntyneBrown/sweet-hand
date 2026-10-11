import { ChangeDetectionStrategy, Component, computed, inject, input, output, signal } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField } from '@sweet-hand/components';
import { summaryFrom, summaryHeading } from '../../../core/forms/validation';
import { type OperatorAccount, OperatorSettingsService } from '@sweet-hand/api';
import type { Field } from './field';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { fieldError } from '../../../core/forms/problem';

const CONTROL: Record<Field, string> = { name: 'op-name', email: 'op-email' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Add operator (docs/mocks/dialogs/add-operator; CreateOperatorDialog, L2-056). */
@Component({
  selector: 'app-add-operator-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './add-operator.dialog.html',
})
export class AddOperatorDialog {
  private readonly api = inject(OperatorSettingsService);

  readonly open = input(false);
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly added = output<OperatorAccount>();

  protected readonly name = new FormControl('', { nonNullable: true });
  protected readonly email = new FormControl('', { nonNullable: true });
  /** Starts on Operator, the least privilege, so it is never empty. */
  protected readonly role = signal<string | null>('operator');
  protected readonly state = new FormDialogState<Partial<Record<Field, string>>>(this.open, {
    noErrors: {},
    reset: () => {
      this.name.reset();
      this.email.reset();
      this.role.set('operator');
    },
  });
  protected readonly sending = $localize`:@@addOperator.busy:Sending the invitation`;
  protected readonly summary = computed(() => summaryFrom(this.state.errors(), CONTROL));
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@addOperator.action:send the invitation`));

  protected async send(): Promise<void> {
    if (this.state.busy()) return;
    const name = this.name.value.replace(/\s+/g, ' ').trim();
    const email = this.email.value.trim();
    const errors: Partial<Record<Field, string>> = {};
    if (!name) errors.name = $localize`:@@addOperator.nameRequired:Enter their full name`;
    if (!email) errors.email = $localize`:@@addOperator.emailRequired:Enter their work email`;
    else if (!EMAIL.test(email)) errors.email = $localize`:@@validation.emailFormat:Enter an email address like name@example.com`;
    if (!this.state.validate(errors)) return;
    await this.state.submit(
      async () => this.added.emit(await firstValueFrom(this.api.addOperator({ name, email, role: this.role() === 'admin' ? 'admin' : 'operator' }))),
      (status, problem) =>
        status === 400 && !!fieldError(problem, 'email') && this.state.reject({ email: $localize`:@@addOperator.emailTaken:This email already has a Sweet Hand account` }),
    );
  }
}
