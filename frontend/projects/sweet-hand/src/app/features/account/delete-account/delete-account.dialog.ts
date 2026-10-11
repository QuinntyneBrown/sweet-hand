import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Icon, TextField, type SummaryItem } from '@sweet-hand/components';
import { summaryHeading } from '../../../core/forms/validation';
import { AccountService, type AccountView } from '@sweet-hand/api';
import { FormDialogState } from '../../../core/forms/form-dialog-state';

/** "Priya, Andre and Marcia" */
const listOf = (names: string[]) => new Intl.ListFormat('en-CA', { style: 'long', type: 'conjunction' }).format(names);

/** What deleting removes, for a customer or a caterer (L2-072.1-4). */
export function deletionLines(account: AccountView): string[] {
  const d = account.deletion;
  if (account.business) {
    const name = account.business.name;
    const lines = [
      $localize`:@@delete.catererOff:${name}:business: comes off Sweet Hand straight away`,
      $localize`:@@delete.catererFiles:Your photos, menu and food handler certificate are deleted within 30 days`,
    ];
    if (d.openEnquiries === 1) lines.push($localize`:@@delete.catererEnquiry:Your open enquiry is closed, and ${listOf(d.customersToTell)}:names: is told`);
    else if (d.openEnquiries > 1) lines.push($localize`:@@delete.catererEnquiries:Your ${d.openEnquiries}:count: open enquiries are closed, and ${listOf(d.customersToTell)}:names: are told`);
    if (d.reviews === 1) lines.push($localize`:@@delete.catererReview:Your review and your response are removed`);
    else if (d.reviews > 1) lines.push($localize`:@@delete.catererReviews:Your ${d.reviews}:count: reviews and your responses are removed`);
    return lines;
  }
  const lines = [$localize`:@@delete.customerDetails:Your name, email and phone`];
  if (d.reviews === 1) lines.push($localize`:@@delete.customerReview:Your review (the caterer’s rating is recalculated)`);
  else if (d.reviews > 1) lines.push($localize`:@@delete.customerReviews:Your ${d.reviews}:count: reviews (the caterers’ ratings are recalculated)`);
  lines.push($localize`:@@delete.customerSignIn:Your sign-in and saved devices`);
  return lines;
}

/** Delete my account (docs/mocks/dialogs/delete-account; delete-account design, DeleteAccountDialog). */
@Component({
  selector: 'app-delete-account-dialog',
  imports: [ReactiveFormsModule, Alert, Dialog, FormField, FormSummary, Icon, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './delete-account.dialog.html',
  styleUrl: './delete-account.dialog.css',
})
export class DeleteAccountDialog {
  private readonly api = inject(AccountService);

  readonly open = input(false);
  readonly account = input.required<AccountView>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly deleted = output<void>();

  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly state = new FormDialogState<string | null>(this.open, { noErrors: null, reset: () => this.password.reset() });
  protected readonly deleting = $localize`:@@delete.busy:Deleting your account`;
  protected readonly lines = computed(() => deletionLines(this.account()));
  protected readonly title = computed(() => {
    const business = this.account().business;
    return business ? $localize`:@@delete.titleCaterer:Delete ${business.name}:business: and your account?` : $localize`:@@delete.title:Delete your account?`;
  });
  protected readonly description = computed(() =>
    this.account().business
      ? $localize`:@@delete.descriptionCaterer:This can’t be undone. You’ll be signed out.`
      : $localize`:@@delete.description:This can’t be undone. You’ll be signed out and get a confirmation email.`,
  );
  protected readonly passwordLabel = computed(() => $localize`:@@delete.passwordLabel:Enter your password for ${this.account().email}:email:`);
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.state.errors();
    return e ? [{ controlId: 'delete-password', message: e }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@delete.action:delete your account`));

  protected async delete(): Promise<void> {
    if (this.state.busy()) return;
    const password = this.password.value;
    this.state.failed.set(false);
    if (!password) {
      // Enter in an empty field never deletes anything.
      this.state.errors.set($localize`:@@delete.passwordRequired:Enter your password`);
      return;
    }
    this.state.errors.set(null);
    await this.state.submit(
      async () => {
        await firstValueFrom(this.api.deleteAccount({ password }));
        this.deleted.emit();
      },
      (status) => status === 400 && this.state.reject($localize`:@@delete.wrongPassword:That password isn’t right. Try again.`),
    );
  }
}
