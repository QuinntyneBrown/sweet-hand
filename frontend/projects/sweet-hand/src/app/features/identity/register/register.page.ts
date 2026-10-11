import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Checkbox, FormField, FormSummary, LabelAction, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { AuthPhotos } from '../auth-photos';
import { displayNameError, newPasswordError } from '../rules';
import { BotChallengeService, IdentityService } from '@sweet-hand/api';
import type { Errors } from './errors';

const NO_ERRORS: Errors = { name: null, email: null, password: null, consent: null };

/** Create a customer account, /register (docs/detailed-designs/identity-and-security/register-customer). */
@Component({
  selector: 'app-register-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, AuthPhotos, Button, Checkbox, FormField, FormSummary, LabelAction, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.page.html',
})
export class RegisterPage {
  private readonly api = inject(IdentityService);
  private readonly bots = inject(BotChallengeService);
  private readonly router = inject(Router);

  protected readonly form = new FormGroup({
    name: new FormControl('', { nonNullable: true }),
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
    consent: new FormControl(false, { nonNullable: true }),
  });
  protected readonly errors = signal<Errors>(NO_ERRORS);
  /** Summary lines that are shorter than the field's message ("This password is too common"). */
  private readonly summaryText = signal<Partial<Errors>>({});
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly revealed = signal(false);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  /** The address the verification link went to; set once the account is created. */
  protected readonly sentTo = signal<string | null>(null);
  protected readonly creating = $localize`:@@register.busy:Creating your account`;
  private readonly alert = viewChild(Alert);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    const short = this.summaryText();
    return (['name', 'email', 'password', 'consent'] as const)
      .filter((f) => e[f])
      .map((f) => ({ controlId: f, message: short[f] ?? e[f]! }));
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@register.action:create your account`));

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const { name, email, password, consent } = this.form.getRawValue();
    const errors: Errors = {
      name: displayNameError(name),
      email: emailError(email),
      password: newPasswordError(password),
      consent: consent ? null : $localize`:@@register.consentRequired:Tick the box to agree to the privacy notice`,
    };
    this.failure.set(null);
    this.summaryText.set({});
    this.errors.set(errors);
    if (Object.values(errors).some(Boolean)) {
      this.attempt.update((n) => n + 1);
      return;
    }

    this.busy.set(true);
    try {
      const challengeToken = await this.bots.token('register');
      await firstValueFrom(this.api.register({ displayName: name.trim(), email: email.trim(), password, consent, challengeToken }));
      this.sentTo.set(email.trim());
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400 && problem.errors?.['password']) {
        // The only rule the form cannot check itself: the breached-password list (L2-076.1).
        this.errors.set({
          ...NO_ERRORS,
          password: $localize`:@@register.passwordCommon:This password is too common. Choose one that’s harder to guess, at least 12 characters.`,
        });
        this.summaryText.set({ password: $localize`:@@register.passwordCommonShort:This password is too common` });
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

  protected startAgain(event: Event): void {
    event.preventDefault();
    this.form.reset();
    this.errors.set(NO_ERRORS);
    this.attempt.set(0);
    this.sentTo.set(null);
  }

  protected async resend(): Promise<void> {
    // The "Check your email" page sends the new link when it opens.
    await this.router.navigate(['/verify-email/sent'], { state: { email: this.sentTo() } });
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@register.serverErrorRef:Something went wrong on our side. Your details are still here; enter your password again and retry. Reference ${ref}:reference:.`
      : $localize`:@@register.serverError:Something went wrong on our side. Your details are still here; enter your password again and retry.`;
  }
}
