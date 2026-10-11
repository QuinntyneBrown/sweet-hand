import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button } from '@sweet-hand/components';
import { AuthPhotos } from '../auth-photos';
import { IDENTITY_SERVICE, ResendVerificationRequest } from '@sweet-hand/api';

/** How long "Resend email" stays paused after a link was sent. */
export const RESEND_PAUSE_MS = 60_000;

/**
 * "Check your email", /verify-email/sent (docs/mocks/pages/verify-email/sent).
 * Arriving here sends a new link: to the address or expired link passed in
 * the navigation state, or to the signed-in account (L2-023.2, L2-077.3).
 */
@Component({
  selector: 'app-verification-sent-page',
  imports: [RouterLink, AuthPhotos, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="auth">
      <div class="auth__head">
        <app-auth-photos [photos]="['sugar-dumplin', 'black-cake-co', 'cou-cou']" />
        <h1 i18n="@@verifySent.title">Check your email</h1>
        @if (email(); as address) {
          <p class="subtitle" i18n="@@verifySent.subtitle">We sent a new link to <strong>{{ address }}</strong>. It works for 24 hours.</p>
        } @else {
          <p class="subtitle" i18n="@@verifySent.subtitleNoEmail">We sent a new link to your email address. It works for 24 hours.</p>
        }
      </div>
      <div class="stack">
        <a class="btn btn--primary btn--lg btn--block" routerLink="/caterers" i18n="@@verify.browse">Browse caterers</a>
        <sh-button size="lg" [block]="true" [disabled]="paused()" describedBy="resend-help" (activated)="send()"
          ><ng-container i18n="@@register.success.resend">Resend email</ng-container></sh-button
        >
        <span class="field__help" id="resend-help" i18n="@@verifySent.help">You can resend in 60 seconds. Check your spam folder too.</span>
      </div>
    </div>
  `,
})
export class VerificationSentPage {
  private readonly api = inject(IDENTITY_SERVICE);
  private readonly from: ResendVerificationRequest;
  private timer: ReturnType<typeof setTimeout> | undefined;

  protected readonly email = signal<string | null>(null);
  protected readonly paused = signal(true);

  constructor() {
    const state = (inject(Router).currentNavigation()?.extras.state ?? history.state ?? {}) as ResendVerificationRequest;
    this.from = { email: state.email ?? null, token: state.token ?? null };
    this.email.set(this.from.email ?? null);
    inject(DestroyRef).onDestroy(() => clearTimeout(this.timer));
    void this.send();
  }

  protected async send(): Promise<void> {
    this.paused.set(true);
    clearTimeout(this.timer);
    this.timer = setTimeout(() => this.paused.set(false), RESEND_PAUSE_MS);
    try {
      const sent = await firstValueFrom(this.api.resendVerification(this.from));
      if (sent.email) this.email.set(sent.email);
    } catch {
      // The person can send again once the pause is over.
    }
  }
}
