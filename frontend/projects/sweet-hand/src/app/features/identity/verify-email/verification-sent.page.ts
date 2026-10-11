import { ChangeDetectionStrategy, Component, DestroyRef, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Button } from '@sweet-hand/components';
import { AuthPhotos } from '../auth-photos';
import { IdentityService, type ResendVerificationRequest } from '@sweet-hand/api';
import { paths } from '../../../core/routing/paths';

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
  templateUrl: './verification-sent.page.html',
})
export class VerificationSentPage {
  protected readonly paths = paths;
  private readonly api = inject(IdentityService);
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
