import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Dialog, FormField, FormSummary, Icon, TextField, type SummaryItem } from '@sweet-hand/components';
import { AccountApi } from '../../../core/api/account-api';
import type { AccountView } from '../../../core/api/account.models';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';

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
  template: `
    <sh-dialog
      [open]="open()"
      size="form"
      [form]="true"
      tone="danger"
      [title]="title()"
      [description]="description()"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="deleting"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
      (submitted)="delete()"
    >
      <svg slot="icon" shIcon="trash"></svg>
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="Your account wasn’t deleted" i18n-title="@@delete.failedTitle"
          ><ng-container i18n="@@delete.failedText">Nothing has been deleted. Try again, or email privacy&#64;sweethand.example.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryTitle()" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="delete-summary" />
      <div>
        <p class="field__label" i18n="@@delete.whatsDeleted">What’s deleted</p>
        <ul class="delete-account__list">
          @for (line of lines(); track $index) {
            <li>{{ line }}</li>
          }
        </ul>
      </div>
      @if (account().business) {
        <p class="text-muted" i18n="@@delete.keptCaterer">Customers keep the messages in their threads. Backups age out within 35 days.</p>
      } @else {
        <p class="text-muted" i18n="@@delete.keptCustomer">Caterers keep your messages in their threads, signed “Former Sweet Hand user”. Everything is gone from our systems within 30 days and from backups within 35.</p>
      }
      <sh-form-field [label]="passwordLabel()" controlId="delete-password" [error]="error()">
        <sh-text-field [formControl]="password" type="password" name="password" autocomplete="current-password" [readonly]="busy()" />
      </sh-form-field>
      <button
        slot="footer"
        class="btn btn--danger"
        type="submit"
        [attr.aria-busy]="busy() ? 'true' : null"
        [attr.aria-disabled]="busy() ? 'true' : null"
        i18n="@@delete.submit"
      >
        Delete my account
      </button>
    </sh-dialog>
  `,
  styles: `
    .delete-account__list {
      padding-left: var(--space-5);
      margin-top: var(--space-2);
    }
  `,
})
export class DeleteAccountDialog {
  private readonly api = inject(AccountApi);

  readonly open = input(false);
  readonly account = input.required<AccountView>();
  readonly returnFocus = input<HTMLElement | null>(null);

  readonly closed = output<void>();
  readonly deleted = output<void>();

  protected readonly password = new FormControl('', { nonNullable: true });
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
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
    const e = this.error();
    return e ? [{ controlId: 'delete-password', message: e }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@delete.action:delete your account`));

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          this.password.reset();
          this.error.set(null);
          this.failed.set(false);
          this.attempt.set(0);
        });
    });
  }

  protected async delete(): Promise<void> {
    if (this.busy()) return;
    const password = this.password.value;
    this.failed.set(false);
    if (!password) {
      // Enter in an empty field never deletes anything.
      this.error.set($localize`:@@delete.passwordRequired:Enter your password`);
      return;
    }
    this.error.set(null);
    this.busy.set(true);
    try {
      await firstValueFrom(this.api.deleteAccount({ password }));
      this.deleted.emit();
    } catch (error) {
      if (problemOf(error).status === 400) {
        this.error.set($localize`:@@delete.wrongPassword:That password isn’t right. Try again.`);
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
