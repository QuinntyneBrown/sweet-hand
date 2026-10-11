import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button, Icon } from '@sweet-hand/components';
import { IdentityApi } from '../../../core/api/identity-api';
import type { EmailVerified } from '../../../core/api/identity.models';
import { shortDate } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { Session } from '../../../core/session/session';
import { AuthPhotos } from '../auth-photos';

type View = { kind: 'loading' } | { kind: 'verified'; result: EmailVerified } | { kind: 'expired' } | { kind: 'failed'; reference: string | null };

/** The landing page of a verification link, /verify-email/:token (L2-077.3, L2-023.3). */
@Component({
  selector: 'app-verify-email-page',
  imports: [RouterLink, Alert, AuthPhotos, Button, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './verify-email.page.html',
  styles: `
    .verify__title-skeleton {
      width: 80%;
    }
    .verify__button-skeleton {
      height: var(--control-height-lg);
    }
  `,
})
export class VerifyEmailPage {
  private readonly api = inject(IdentityApi);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  readonly token = input.required<string>();

  protected readonly view = signal<View>({ kind: 'loading' });
  protected readonly verified = computed(() => {
    const v = this.view();
    return v.kind === 'verified' ? v.result : null;
  });
  protected readonly firstName = computed(() => this.verified()?.displayName.trim().split(/\s+/)[0] ?? '');
  protected readonly saved = computed(() => {
    const e = this.verified()?.savedEnquiry;
    if (!e) return null;
    const guests = e.guests === 1 ? $localize`:@@verify.oneGuest:1 guest` : $localize`:@@verify.guests:${e.guests}:count: guests`;
    return { ...e, when: `${shortDate(e.eventDate)} · ${guests}` };
  });

  constructor() {
    effect(() => {
      const token = this.token();
      untracked(() => void this.verify(token));
    });
  }

  protected async verify(token = this.token()): Promise<void> {
    this.view.set({ kind: 'loading' });
    try {
      const result = await firstValueFrom(this.api.verifyEmail(token));
      this.view.set({ kind: 'verified', result });
      void this.session.refresh();
    } catch (error) {
      const { status, problem } = problemOf(error);
      this.view.set(status === 410 ? { kind: 'expired' } : { kind: 'failed', reference: reference(problem) });
    }
  }

  protected async resend(): Promise<void> {
    await this.router.navigate(['/verify-email/sent'], { state: { token: this.token() } });
  }

  protected readonly failedText = computed(() => {
    const v = this.view();
    const ref = v.kind === 'failed' ? v.reference : null;
    return ref
      ? $localize`:@@verify.failedRef:Something went wrong on our side. Your link still works; try again in a moment. Reference ${ref}:reference:.`
      : $localize`:@@verify.failed:Something went wrong on our side. Your link still works; try again in a moment.`;
  });
}
