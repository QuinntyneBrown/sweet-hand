import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, PrivateNote, TextField } from '@sweet-hand/components';
import { summaryFrom, summaryHeading } from '../../../core/forms/validation';
import { newPasswordError } from '../../identity/rules';
import { AccountService } from '@sweet-hand/api';
import type { Errors } from './errors';
import { FormDialogState } from '../../../core/forms/form-dialog-state';
import { fieldError } from '../../../core/forms/problem';

const NO_ERRORS: Errors = { current: null, new: null, confirm: null };

/** Change password (docs/mocks/dialogs/change-password). Other sessions end; this one stays. */
@Component({
  selector: 'app-change-password-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Dialog, FormField, FormSummary, PrivateNote, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './change-password.dialog.html',
})
export class ChangePasswordDialog {
  private readonly api = inject(AccountService);

  readonly open = input(false);
  /** "Last changed Sat 14 Mar." */
  readonly lastChanged = input.required<string>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly changed = output<void>();

  protected readonly form = new FormGroup({
    current: new FormControl('', { nonNullable: true }),
    new: new FormControl('', { nonNullable: true }),
    confirm: new FormControl('', { nonNullable: true }),
  });
  protected readonly state = new FormDialogState(this.open, { noErrors: NO_ERRORS, reset: () => this.form.reset() });
  protected readonly changing = $localize`:@@changePassword.busy:Changing your password`;

  protected readonly summary = computed(() => summaryFrom(this.state.errors(), ['current', 'new', 'confirm']));
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@changePassword.action:change your password`));

  protected async change(): Promise<void> {
    if (this.state.busy()) return;
    const v = this.form.getRawValue();
    const errors: Errors = {
      current: v.current ? null : $localize`:@@changePassword.currentRequired:Enter your current password`,
      new: newPasswordError(v.new),
      confirm: v.confirm === v.new ? null : $localize`:@@changePassword.mismatch:The passwords don’t match`,
    };
    if (!this.state.validate(errors)) return;
    await this.state.submit(
      async () => {
        await firstValueFrom(this.api.changePassword({ currentPassword: v.current, newPassword: v.new }));
        this.changed.emit();
      },
      (status, problem) =>
        status === 400 &&
        !!(fieldError(problem, 'currentPassword') || fieldError(problem, 'newPassword')) &&
        this.state.reject({
          ...NO_ERRORS,
          current: fieldError(problem, 'currentPassword') ? $localize`:@@changePassword.wrongCurrent:That password isn’t right. Try again.` : null,
          new: fieldError(problem, 'newPassword') ? $localize`:@@changePassword.breached:This password appears in lists of breached passwords. Choose a different one.` : null,
        }),
    );
  }
}
