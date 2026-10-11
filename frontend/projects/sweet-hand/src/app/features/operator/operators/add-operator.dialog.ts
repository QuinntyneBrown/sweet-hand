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
