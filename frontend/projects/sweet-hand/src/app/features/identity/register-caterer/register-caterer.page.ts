import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import {
  Alert,
  Button,
  Checkbox,
  Checklist,
  ChecklistItem,
  FormField,
  FormSummary,
  LabelAction,
  TextField,
  type CheckStatusLabels,
  type SummaryItem,
} from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { Session } from '../../../core/session/session';
import { AuthPhotos } from '../auth-photos';
import { businessNameError, contactNameError, newPasswordError, normalisePhone, phoneError } from '../rules';
import { BOT_CHALLENGE_SERVICE, IDENTITY_SERVICE } from '@sweet-hand/api';

const FIELDS = ['business', 'contact', 'email', 'phone', 'password', 'sells', 'terms'] as const;
type Field = (typeof FIELDS)[number];
type Errors = Record<Field, string | null>;
const NO_ERRORS: Errors = { business: null, contact: null, email: null, phone: null, password: null, sells: null, terms: null };

export const STATUS_WORDS: CheckStatusLabels = {
  missing: $localize`:@@checklist.toDo:To do: `,
  done: $localize`:@@checklist.done:Done: `,
  attention: $localize`:@@checklist.attention:Needs attention: `,
};

/** Cater with Sweet Hand, /join (docs/detailed-designs/caterer-profiles/register-caterer). */
@Component({
  selector: 'app-register-caterer-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, AuthPhotos, Button, Checkbox, Checklist, ChecklistItem, FormField, FormSummary, LabelAction, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register-caterer.page.html',
})
export class RegisterCatererPage {
  private readonly api = inject(IDENTITY_SERVICE);
  private readonly bots = inject(BOT_CHALLENGE_SERVICE);
  private readonly session = inject(Session);

  protected readonly form = new FormGroup({
    business: new FormControl('', { nonNullable: true }),
    contact: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    phone: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    sells: new FormControl(false, { nonNullable: true }),
    terms: new FormControl(false, { nonNullable: true }),
  });
  protected readonly errors = signal<Errors>(NO_ERRORS);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly revealed = signal(false);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly done = signal<{ firstName: string; business: string; email: string } | null>(null);
  protected readonly statusWords = STATUS_WORDS;
  protected readonly creating = $localize`:@@registerCaterer.busy:Creating your caterer account`;
  private readonly alert = viewChild(Alert);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    return FIELDS.filter((f) => e[f]).map((f) => ({ controlId: f, message: e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@registerCaterer.action:create your caterer account`));

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const v = this.form.getRawValue();
    const errors: Errors = {
      business: businessNameError(v.business),
      contact: contactNameError(v.contact),
      email: emailError(v.email),
      phone: phoneError(v.phone),
      password: newPasswordError(v.password),
      sells: v.sells ? null : $localize`:@@registerCaterer.sellsRequired:Confirm that you sell Caribbean food in Toronto or the GTA`,
      terms: v.terms ? null : $localize`:@@registerCaterer.termsRequired:Accept the caterer terms and privacy notice to continue`,
    };
    this.failure.set(null);
    this.errors.set(errors);
    if (Object.values(errors).some(Boolean)) {
      this.attempt.update((n) => n + 1);
      return;
    }

    this.busy.set(true);
    try {
      const challengeToken = await this.bots.token('register-caterer');
      await firstValueFrom(
        this.api.registerCaterer({
          businessName: v.business.trim(),
          contactName: v.contact.trim(),
          email: v.email.trim(),
          phone: normalisePhone(v.phone)!,
          password: v.password,
          sellsCaribbeanFoodInGta: v.sells,
          acceptsTermsAndPrivacyNotice: v.terms,
          challengeToken,
        }),
      );
      await this.session.refresh();
      this.done.set({ firstName: v.contact.trim().split(/\s+/)[0], business: v.business.trim(), email: v.email.trim() });
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['password']) {
        this.errors.set({
          ...NO_ERRORS,
          password: $localize`:@@register.passwordCommon:This password is too common. Choose one that’s harder to guess, at least 12 characters.`,
        });
        this.attempt.update((n) => n + 1);
      } else {
        this.form.controls.password.setValue('');
        this.failure.set({ reference: reference(problem) });
        queueMicrotask(() => this.alert()?.focusTitle());
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@register.serverErrorRef:Something went wrong on our side. Your details are still here; enter your password again and retry. Reference ${ref}:reference:.`
      : $localize`:@@register.serverError:Something went wrong on our side. Your details are still here; enter your password again and retry.`;
  }
}
