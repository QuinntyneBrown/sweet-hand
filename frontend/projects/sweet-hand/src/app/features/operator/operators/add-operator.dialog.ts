import { ChangeDetectionStrategy, Component, computed, effect, inject, input, output, signal, untracked } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { type OperatorAccount, OperatorSettingsService } from '@sweet-hand/api';
import type { Field } from './field';

const CONTROL: Record<Field, string> = { name: 'op-name', email: 'op-email' };
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Add operator (docs/mocks/dialogs/add-operator; CreateOperatorDialog, L2-056). */
@Component({
  selector: 'app-add-operator-dialog',
  imports: [ReactiveFormsModule, Alert, Button, Dialog, FormField, FormSummary, Radio, RadioGroup, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <sh-dialog
      [open]="open()"
      [form]="true"
      title="Add operator"
      i18n-title="@@addOperator.title"
      description="Invite someone from the Sweet Hand team."
      i18n-description="@@addOperator.description"
      closeLabel="Close"
      i18n-closeLabel="@@common.close"
      cancelLabel="Cancel"
      i18n-cancelLabel="@@common.cancel"
      [busy]="busy()"
      [busyMessage]="sending"
      [returnFocus]="returnFocus()"
      (dismissed)="closed.emit()"
      (submitted)="send()"
    >
      @if (failed()) {
        <sh-alert tone="danger" live="assertive" title="We couldn’t send the invitation" i18n-title="@@addOperator.failedTitle"
          ><ng-container i18n="@@addOperator.failedText">No account was created. Your entries are kept; try again.</ng-container></sh-alert
        >
      }
      <sh-form-summary [heading]="summaryTitle()" [headingLevel]="3" [items]="summary()" [attempt]="attempt()" summaryId="add-operator-summary" />
      <sh-form-field label="Full name" i18n-label="@@addOperator.name" controlId="op-name" [error]="errors().name ?? null">
        <sh-text-field [formControl]="name" name="name" autocomplete="off" [required]="true" [readonly]="busy()" [autofocus]="true" />
      </sh-form-field>
      <sh-form-field label="Work email" i18n-label="@@addOperator.email" controlId="op-email" [error]="errors().email ?? null">
        <sh-text-field [formControl]="email" type="email" name="email" autocomplete="off" [spellcheck]="false" [required]="true" [readonly]="busy()" />
      </sh-form-field>
      <sh-radio-group name="role" [(value)]="role" [disabled]="busy()">
        <span slot="legend" i18n="@@addOperator.role">Role</span>
        <sh-radio value="operator" inputId="role-operator" description="Reviews profiles, reviews and reports" i18n-description="@@addOperator.operatorHelp" i18n="@@addOperator.operator"
          >Operator</sh-radio
        >
        <sh-radio value="admin" inputId="role-admin" description="Also manages operators and the full audit log" i18n-description="@@addOperator.adminHelp" i18n="@@addOperator.admin"
          >Admin</sh-radio
        >
      </sh-radio-group>
      <p class="private-note" i18n="@@addOperator.note">They set a password and a second step (authenticator app or security key) the first time they sign in.</p>
      <sh-button slot="footer" type="submit" variant="primary" [busy]="busy()"><ng-container i18n="@@addOperator.submit">Send invitation</ng-container></sh-button>
    </sh-dialog>
  `,
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
  protected readonly errors = signal<Partial<Record<Field, string>>>({});
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failed = signal(false);
  protected readonly sending = $localize`:@@addOperator.busy:Sending the invitation`;
  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return (['name', 'email'] as const).filter((f) => e[f]).map((f) => ({ controlId: CONTROL[f], message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@addOperator.action:send the invitation`));

  constructor() {
    effect(() => {
      if (this.open())
        untracked(() => {
          this.name.reset();
          this.email.reset();
          this.role.set('operator');
          this.errors.set({});
          this.failed.set(false);
          this.attempt.set(0);
        });
    });
  }

  protected async send(): Promise<void> {
    if (this.busy()) return;
    const name = this.name.value.replace(/\s+/g, ' ').trim();
    const email = this.email.value.trim();
    const errors: Partial<Record<Field, string>> = {};
    if (!name) errors.name = $localize`:@@addOperator.nameRequired:Enter their full name`;
    if (!email) errors.email = $localize`:@@addOperator.emailRequired:Enter their work email`;
    else if (!EMAIL.test(email)) errors.email = $localize`:@@validation.emailFormat:Enter an email address like name@example.com`;
    this.failed.set(false);
    this.errors.set(errors);
    if (errors.name || errors.email) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      this.added.emit(await firstValueFrom(this.api.addOperator({ name, email, role: this.role() === 'admin' ? 'admin' : 'operator' })));
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['email']) {
        this.errors.set({ email: $localize`:@@addOperator.emailTaken:This email already has a Sweet Hand account` });
        this.attempt.update((n) => n + 1);
      } else {
        this.failed.set(true);
      }
    } finally {
      this.busy.set(false);
    }
  }
}
