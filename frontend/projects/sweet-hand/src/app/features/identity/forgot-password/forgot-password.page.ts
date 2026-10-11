import { ChangeDetectionStrategy, Component, computed, inject, signal, viewChild } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, FormField, FormSummary, TextField, type SummaryItem } from '@sweet-hand/components';
import { problemOf, reference } from '../../../core/forms/problem';
import { emailError, summaryHeading } from '../../../core/forms/validation';
import { AuthPhotos } from '../auth-photos';
import { BotChallengeService, IdentityService } from '@sweet-hand/api';
import type { Failure } from './failure';
import { paths } from '../../../core/routing/paths';

/** Forgot password, /forgot-password (docs/detailed-designs/identity-and-security/verify-email-and-reset-password). */
@Component({
  selector: 'app-forgot-password-page',
  imports: [ReactiveFormsModule, RouterLink, Alert, AuthPhotos, Button, FormField, FormSummary, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './forgot-password.page.html',
})
export class ForgotPasswordPage {
  protected readonly paths = paths;
  private readonly api = inject(IdentityService);
  private readonly bots = inject(BotChallengeService);

  protected readonly form = new FormGroup({ email: new FormControl('', { nonNullable: true }) });
  protected readonly error = signal<string | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failure = signal<Failure>(null);
  /** The same confirmation for every address, registered or not (L2-077.1). */
  protected readonly sent = signal(false);
  protected readonly sending = $localize`:@@forgot.busy:Sending the reset link`;
  private readonly alert = viewChild(Alert);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: 'email', message: e }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@forgot.action:send the reset link`));

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const { email } = this.form.getRawValue();
    this.failure.set(null);
    this.error.set(emailError(email));
    if (this.error()) {
      this.attempt.update((n) => n + 1);
      return;
    }
    this.busy.set(true);
    try {
      const challengeToken = await this.bots.token('password-reset');
      await firstValueFrom(this.api.requestPasswordReset({ email: email.trim(), challengeToken }));
      this.sent.set(true);
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 429) {
        // More than 5 requests from one network in an hour (L2-082.3).
        const header = error instanceof HttpErrorResponse ? error.headers.get('Retry-After') : null;
        const seconds = Number(header) || 3600;
        this.failure.set({ kind: 'rate-limited', minutes: Math.max(1, Math.ceil(seconds / 60)) });
      } else {
        this.failure.set({ kind: 'server', reference: reference(problem) });
      }
      queueMicrotask(() => this.alert()?.focusTitle());
    } finally {
      this.busy.set(false);
    }
  }

  protected tryAnother(event: Event): void {
    event.preventDefault();
    this.form.reset();
    this.attempt.set(0);
    this.sent.set(false);
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@forgot.serverErrorRef:Something went wrong on our side. Your email is still here; try again in a moment. Reference ${ref}:reference:.`
      : $localize`:@@forgot.serverError:Something went wrong on our side. Your email is still here; try again in a moment.`;
  }

  protected rateLimitedText(minutes: number): string {
    return minutes === 1
      ? $localize`:@@forgot.rateLimitedOne:We’ve had several requests from your network in the last hour. Try again in 1 minute.`
      : $localize`:@@forgot.rateLimited:We’ve had several requests from your network in the last hour. Try again in ${minutes}:minutes: minutes.`;
  }
}
