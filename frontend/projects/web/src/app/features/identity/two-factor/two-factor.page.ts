import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, FormField, FormSummary, Icon, TextField, type SummaryItem } from '@sweet-hand/components';
import { IdentityApi } from '../../../core/api/identity-api';
import type { SecondFactorRequest } from '../../../core/api/identity.models';
import { SecurityKey } from '../../../core/api/security-key';
import { problemOf, reference } from '../../../core/forms/problem';
import { summaryHeading } from '../../../core/forms/validation';
import { landingFor, safeReturnUrl } from '../../../core/session/guards';
import { Session } from '../../../core/session/session';
import { AuthPhotos } from '../auth-photos';

/** Two-step verification for operators, /sign-in/verify (L2-056.2; sign-in design, SecondFactorPage). */
@Component({
  selector: 'app-two-factor-page',
  imports: [ReactiveFormsModule, Alert, AuthPhotos, Button, FormField, FormSummary, Icon, TextField],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './two-factor.page.html',
})
export class TwoFactorPage {
  private readonly api = inject(IdentityApi);
  private readonly keys = inject(SecurityKey);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly email = computed(() => this.session.pendingSecondFactor()?.email ?? '');
  protected readonly form = new FormGroup({ code: new FormControl('', { nonNullable: true }) });
  protected readonly error = signal<{ field: string; summary: string } | null>(null);
  protected readonly attempt = signal(0);
  protected readonly busy = signal(false);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly checking = $localize`:@@twoFactor.busy:Checking the code`;
  private readonly alert = viewChild(Alert);

  protected readonly summary = computed<SummaryItem[]>(() => {
    const e = this.error();
    return e ? [{ controlId: 'code', message: e.summary }] : [];
  });
  protected readonly summaryTitle = computed(() => summaryHeading(this.summary().length, $localize`:@@twoFactor.action:continue signing in`));

  protected async submit(): Promise<void> {
    if (this.busy()) return;
    const code = this.form.getRawValue().code.replace(/\s/g, '');
    this.failure.set(null);
    if (!/^\d{6}$/.test(code)) {
      const message = $localize`:@@twoFactor.codeRequired:Enter the 6-digit code from your app`;
      this.error.set({ field: message, summary: message });
      this.attempt.update((n) => n + 1);
      return;
    }
    this.error.set(null);
    await this.complete(() => Promise.resolve({ method: 'authenticator app', code }));
  }

  protected async useSecurityKey(): Promise<void> {
    if (this.busy()) return;
    this.error.set(null);
    this.failure.set(null);
    await this.complete(async () => ({ method: 'security key', assertion: await this.keys.assert() }));
  }

  private async complete(request: () => Promise<SecondFactorRequest>): Promise<void> {
    this.busy.set(true);
    try {
      const result = await firstValueFrom(this.api.completeSecondFactor(await request()));
      await this.session.refresh();
      const returnUrl = safeReturnUrl(this.returnUrl());
      if (result.privacyUpdateRequired) {
        await this.router.navigate(['/privacy/accept'], { queryParams: { returnUrl } });
      } else {
        await this.router.navigateByUrl(returnUrl ?? landingFor('Operator'));
      }
    } catch (error) {
      const { status, problem } = problemOf(error);
      if (status === 400) {
        this.error.set({
          field: $localize`:@@twoFactor.wrongCode:That code didn’t work. Enter the newest code from your app.`,
          summary: $localize`:@@twoFactor.wrongCodeShort:That code didn’t work`,
        });
        this.attempt.update((n) => n + 1);
      } else if (status === 401) {
        await this.router.navigateByUrl('/sign-in');
      } else {
        this.failure.set({ reference: reference(problem) });
        queueMicrotask(() => this.alert()?.focusTitle());
      }
    } finally {
      this.busy.set(false);
    }
  }

  protected async notYou(event: Event): Promise<void> {
    event.preventDefault();
    await this.session.signOut();
    await this.router.navigateByUrl('/sign-in');
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@twoFactor.serverErrorRef:Something went wrong on our side. Wait for a new code in your app and try again. Reference ${ref}:reference:.`
      : $localize`:@@twoFactor.serverError:Something went wrong on our side. Wait for a new code in your app and try again.`;
  }
}
