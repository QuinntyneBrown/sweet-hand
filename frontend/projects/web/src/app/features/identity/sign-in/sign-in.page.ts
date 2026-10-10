import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, FormField, FormSummary, LabelAction, TextField, type SummaryItem } from '@sweet-hand/components';
import { IdentityApi } from '../../../core/api/identity-api';
import { problemOf, reference } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { landingFor, safeReturnUrl } from '../../../core/session/guards';
import { Session } from '../../../core/session/session';

type Failure = { kind: 'server'; reference: string | null } | null;

/** Sign in, /sign-in (docs/detailed-designs/identity-and-security/sign-in). */
@Component({
  selector: 'app-sign-in-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, Button, FormField, FormSummary, LabelAction, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './sign-in.page.html',
})
export class SignInPage {
  private readonly api = inject(IdentityApi);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly form = new FormGroup({
    email: new FormControl('', { nonNullable: true }),
    password: new FormControl('', { nonNullable: true }),
  });
  protected readonly errors = signal<{ email: string | null; password: string | null }>({ email: null, password: null });
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly revealed = signal(false);
  protected readonly failure = signal<Failure>(null);
  protected readonly signingIn = $localize`:@@signIn.busy:Signing in`;
  private readonly alert = viewChild(Alert);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.errors();
    const items: SummaryItem[] = [];
    if (e.email) items.push({ controlId: 'email', message: e.email });
    if (e.password) items.push({ controlId: 'password', message: e.password });
    return items;
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@signIn.action:sign in`));

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const { email, password } = this.form.getRawValue();
    const errors = {
      email: emailError(email),
      password: password ? null : $localize`:@@signIn.passwordRequired:Enter your password`,
    };
    this.failure.set(null);
    this.errors.set(errors);
    if (errors.email || errors.password) {
      this.attempt.update((n) => n + 1);
      return;
    }

    this.busy.set(true);
    try {
      const result = await firstValueFrom(this.api.signIn({ email: email.trim(), password }));
      await this.session.refresh();
      const user = this.session.user();
      if (result.secondFactorRequired) {
        await this.router.navigate(['/sign-in/verify'], { queryParams: { returnUrl: safeReturnUrl(this.returnUrl()) } });
      } else if (result.privacyUpdateRequired) {
        await this.router.navigate(['/privacy/accept'], { queryParams: { returnUrl: safeReturnUrl(this.returnUrl()) } });
      } else {
        await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()) ?? landingFor(user?.role ?? 'Customer'));
      }
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 401 || status === 400) {
        // The same message whatever was wrong, so the form never reveals who has an account (L2-076.3).
        this.form.controls.password.setValue('');
        this.errors.set({ email: null, password: $localize`:@@signIn.incorrect:Email or password is incorrect` });
        this.attempt.update((n) => n + 1);
      } else {
        this.failure.set({ kind: 'server', reference: reference(problem) });
        queueMicrotask(() => this.alert()?.focusTitle());
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@signIn.serverErrorRef:Something went wrong on our side. Your email is still here; try again in a moment. Reference ${ref}:reference:.`
      : $localize`:@@signIn.serverError:Something went wrong on our side. Your email is still here; try again in a moment.`;
  }
}
