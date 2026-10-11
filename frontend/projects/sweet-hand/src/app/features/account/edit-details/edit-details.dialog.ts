import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { displayNameError, normalisePhone, phoneError } from '../../identity/rules';
import { AccountService, type AccountView } from '@sweet-hand/api';

type Field = 'name' | 'email' | 'phone';
type Errors = Record<Field, string | null>;
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
  template: `
    <sh-dialog
      [open]="open()"
      size="form"
      [form]="true"
      title="Edit your details"
      i18n-title="@@editDetails.title"
      description="Name, email and phone for your Sweet Hand account."
      i18n-description="@@editDetails.description"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="saving"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
      (submitted)="save()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="Your details weren’t saved" i18n-title="@@editDetails.failedTitle"
          ><ng-container i18n="@@editDetails.failedText">We couldn’t reach Sweet Hand. Your changes are still here; try again.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryTitle()" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="details-summary" />
      <div [formGroup]="form" style="display: contents">
        <sh-form-field [label]="nameLabel()" controlId="name" [error]="errors().name" help="2 to 50 characters. Caterers see this name." i18n-help="@@editDetails.nameHelp">
          <sh-text-field formControlName="name" name="name" autocomplete="name" [maxlength]="50" [readonly]="busy()" />
        </sh-form-field>
        <sh-form-field label="Email" i18n-label="@@field.email" controlId="email" [error]="errors().email" help="Changing it sends a verification link to the new address." i18n-help="@@editDetails.emailHelp">
          <sh-text-field formControlName="email" type="email" name="email" autocomplete="email" [spellcheck]="false" [readonly]="busy()" />
        </sh-form-field>
        <sh-form-field label="Phone" i18n-label="@@field.phone" optionalMarker="(optional)" i18n-optionalMarker="@@field.optional" controlId="phone" [error]="errors().phone" help="Private. Shared only in a thread when you choose." i18n-help="@@editDetails.phoneHelp">
          <sh-text-field formControlName="phone" type="tel" name="phone" autocomplete="tel" inputmode="tel" [readonly]="busy()" />
        </sh-form-field>
      </div>
      <sh-button slot="footer" type="submit" variant="primary" [busy]="busy()"><ng-container i18n="@@editDetails.save">Save details</ng-container></sh-button>
    </sh-dialog>
  `,
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
