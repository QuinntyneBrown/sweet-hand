import { ChangeDetectionStrategy, Component, computed, inject, input, signal, viewChild } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert, Button } from '@sweet-hand/components';
import { TIME_ZONE } from '../../../core/format/format';
import { problemOf, reference } from '../../../core/forms/problem';
import { landingFor, safeReturnUrl } from '../../../core/session/guards';
import { Session } from '../../../core/session/session';
import { AuthPhotos } from '../auth-photos';
import { type PrivacyNotice, PrivacyService } from '@sweet-hand/api';

/** "1 November 2026" */
function dayMonthYear(date: string): string {
  const parts = new Intl.DateTimeFormat('en-CA', { timeZone: TIME_ZONE, day: 'numeric', month: 'long', year: 'numeric' }).formatToParts(new Date(`${date}T12:00:00-05:00`));
  const p = Object.fromEntries(parts.map((x) => [x.type, x.value]));
  return `${p['day']} ${p['month']} ${p['year']}`;
}

/** The changed privacy notice to accept after signing in, /privacy/accept (L2-070.4; consent design, PrivacyChangesScreen). */
@Component({
  selector: 'app-privacy-update-page',
  imports: [RouterLink, Alert, AuthPhotos, Button],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './privacy-update.page.html',
  styles: `
    .privacy-update__changes {
      padding-left: var(--space-5);
    }
  `,
})
export class PrivacyUpdatePage {
  private readonly api = inject(PrivacyService);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  readonly returnUrl = input<string>();

  protected readonly notice = signal<PrivacyNotice | null>(null);
  protected readonly effective = computed(() => {
    const n = this.notice();
    return n ? dayMonthYear(n.effectiveDate) : '';
  });
  protected readonly busy = signal(false);
  protected readonly failure = signal<{ reference: string | null } | null>(null);
  protected readonly saving = $localize`:@@privacyUpdate.busy:Saving your choice`;
  private readonly alert = viewChild(Alert);

  constructor() {
    void this.load();
  }

  private async load(): Promise<void> {
    try {
      this.notice.set(await firstValueFrom(this.api.currentNotice()));
    } catch (error) {
      this.failure.set({ reference: reference(problemOf(error).problem) });
    }
  }

  protected async accept(event: Event): Promise<void> {
    event.preventDefault();
    const notice = this.notice();
    if (this.busy() || !notice) return;
    this.busy.set(true);
    this.failure.set(null);
    try {
      await firstValueFrom(this.api.accept(notice.version));
      await this.session.refresh();
      await this.router.navigateByUrl(safeReturnUrl(this.returnUrl()) ?? landingFor(this.session.user()?.role ?? 'Customer'));
    } catch (error) {
      // Nothing is assumed: the person stays here until the acceptance is recorded.
      this.failure.set({ reference: reference(problemOf(error).problem) });
      queueMicrotask(() => this.alert()?.focusTitle());
    } finally {
      this.busy.set(false);
    }
  }

  protected async signOut(): Promise<void> {
    await this.session.signOut();
    await this.router.navigateByUrl('/caterers');
  }

  protected serverText(ref: string | null): string {
    return ref
      ? $localize`:@@privacyUpdate.serverErrorRef:Something went wrong on our side. Try again; until then you stay on this page. Reference ${ref}:reference:.`
      : $localize`:@@privacyUpdate.serverError:Something went wrong on our side. Try again; until then you stay on this page.`;
  }
}
