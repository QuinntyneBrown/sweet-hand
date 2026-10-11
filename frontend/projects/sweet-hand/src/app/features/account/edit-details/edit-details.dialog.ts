import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { displayNameError, normalisePhone, phoneError } from '../../identity/rules';
import { AccountService, type AccountView } from '@sweet-hand/api';
import type { Errors } from './errors';

const NO_ERRORS: Errors = { name: null, email: null, phone: null };

/** "+1 647 555 0123" from "+16475550123". */
export function displayPhone(normalised: string): string {
  const d = normalised.slice(2);
  return `+1 ${d.slice(0, 3)} ${d.slice(3, 6)} ${d.slice(6)}`;
}

/** Edit your details (docs/mocks/dialogs/edit-details): name, email and phone. */
@Component({
  selector: 'app-edit-details-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Dialog, FormField, FormSummary, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './edit-details.dialog.html',
})
export class EditDetailsDialog {
  private readonly api = inject(AccountService);

  readonly open = input(false);
  readonly account = input.required<AccountView>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  /** The updated account and the sentence for the "Details saved" toast. */
  readonly saved = output<{ account: AccountView; message: string }>();

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
  });
  protected readonly errors = signal<Errors>(NO_ERRORS);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly saving = $localize`:@@editDetails.busy:Saving your details`;
  protected readonly nameLabel = computed(() =>
    this.account().role === 'Caterer' ? $localize`:@@account.contactName:Contact name` : $localize`:@@account.displayName:Display name`,
  );

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return (['name', 'email', 'phone'] as const).filter((f) => e[f]).map((f) => ({ controlId: f, message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@editDetails.action:save your details`));

  constructor() {
    // Each time the dialog opens it starts from the saved values.
    effect(() => {
      if (!this.open()) return;
      const a = this.account();
      untracked(() => {
        this.form.setValue({ name: a.displayName, email: a.email, phone: a.phone ?? '' });
        this.errors.set(NO_ERRORS);
        this.failed.set(false);
        this.attempt.set(0);
      });
    });
  }

  protected async save(): Promise<void> {
    if (this.busy()) return;
    const { name, email, phone } = this.form.getRawValue();
    const errors: Errors = { name: displayNameError(name), email: emailError(email), phone: phone.trim() ? phoneError(phone) : null };
    this.failed.set(false);
    this.errors.set(errors);
    if (errors.name || errors.email || errors.phone) {
      this.attempt.update((n) => n + 1);
      return;
    }
    const before = this.account();
    const request = { displayName: name.trim(), email: email.trim(), phone: phone.trim() ? displayPhone(normalisePhone(phone)!) : null };
    this.busy.set(true);
    try {
      const account = await firstValueFrom(this.api.updateDetails(request));
      this.saved.emit({ account, message: this.message(before, account) });
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['email']) {
        this.errors.set({ ...NO_ERRORS, email: $localize`:@@editDetails.emailTaken:Use a different email address` });
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }

  private message(before: AccountView, after: AccountView): string {
    if (before.email !== after.email) return $localize`:@@editDetails.savedEmail:We sent a verification link to ${after.email}:email:.`;
    if (before.phone !== after.phone) {
      return after.phone ? $localize`:@@editDetails.savedPhone:Your phone number is now ${after.phone}:phone:.` : $localize`:@@editDetails.savedNoPhone:Your phone number is removed.`;
    }
    if (before.displayName !== after.displayName) return $localize`:@@editDetails.savedName:Your name is now ${after.displayName}:name:.`;
    return $localize`:@@editDetails.savedNothing:Nothing changed.`;
  }
}
