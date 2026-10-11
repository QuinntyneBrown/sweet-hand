import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, PrivateNote, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { newPasswordError } from '../../identity/rules';
import { AccountService } from '@sweet-hand/api';
import type { Errors } from './errors';

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
  protected readonly errors = signal<Errors>(NO_ERRORS);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly changing = $localize`:@@changePassword.busy:Changing your password`;

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return (['current', 'new', 'confirm'] as const).filter((f) => e[f]).map((f) => ({ controlId: f, message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@changePassword.action:change your password`));

  constructor() {
    effect(() => {
      if (!this.open()) return;
      untracked(() => {
        this.form.reset();
        this.errors.set(NO_ERRORS);
        this.failed.set(false);
        this.attempt.set(0);
      });
    });
  }

  protected async change(): Promise<void> {
    if (this.busy()) return;
    const v = this.form.getRawValue();
    const errors: Errors = {
      current: v.current ? null : $localize`:@@changePassword.currentRequired:Enter your current password`,
      new: newPasswordError(v.new),
      confirm: v.confirm === v.new ? null : $localize`:@@changePassword.mismatch:The passwords don’t match`,
    };
    this.failed.set(false);
    this.errors.set(errors);
    if (errors.current || errors.new || errors.confirm) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.changePassword({ currentPassword: v.current, newPassword: v.new }));
      this.changed.emit();
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && (problem.errors?.['currentPassword'] || problem.errors?.['newPassword'])) {
        this.errors.set({
          ...NO_ERRORS,
          current: problem.errors?.['currentPassword'] ? $localize`:@@changePassword.wrongCurrent:That password isn’t right. Try again.` : null,
          new: problem.errors?.['newPassword'] ? $localize`:@@changePassword.breached:This password appears in lists of breached passwords. Choose a different one.` : null,
        });
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
