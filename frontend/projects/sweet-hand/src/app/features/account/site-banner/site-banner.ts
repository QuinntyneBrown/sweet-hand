import { ChangeDetectionStrategy, Component, DestroyRef, computed, effect, inject, input, signal, untracked } from '@angular/core';
import { Router } from '@angular/router';
import { firstValueFrom } from 'rxjs';
import { Alert } from '@sweet-hand/components';
import { SESSION_REFRESH_MS, Session } from '../../../core/session/session';
import { duration, maintenanceWindow, pickBanner } from './site-banner-rules';
import { NoticesService, type SiteNotice } from '@sweet-hand/api';

const STORAGE_PREFIX = 'sh-dismissed-notice:';

function remembered(id: string): boolean {
  try {
    return localStorage.getItem(STORAGE_PREFIX + id) === '1';
  } catch {
    return false;
  }
}

function remember(id: string): void {
  try {
    localStorage.setItem(STORAGE_PREFIX + id, '1');
  } catch {
    // Private windows may refuse; the notice then returns on the next visit.
  }
}

/**
 * The site-wide banner under the header (docs/mocks/notifications/site-banner):
 * degraded service, a bouncing or unverified email, a just-verified email, or
 * scheduled maintenance, one at a time.
 */
@Component({
  selector: 'app-site-banner',
  imports: [Alert],
  host: { style: 'display: contents' },
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './site-banner.html',
})
export class SiteBanner {
  private readonly api = inject(NoticesService);
  private readonly session = inject(Session);
  private readonly router = inject(Router);

  /** The page shows the email conditions itself, or is mid sign-in: no email banners. */
  readonly quiet = input(false);

  private readonly notices = signal<SiteNotice[]>([]);
  private readonly dismissed = signal<ReadonlySet<string>>(new Set());
  private readonly justVerified = signal(false);

  protected readonly banner = computed(() =>
    pickBanner({ notices: this.notices(), user: this.session.user(), justVerified: this.justVerified(), dismissed: this.dismissed(), emailShownByPage: this.quiet() }),
  );
  protected readonly bouncedTitle = computed(() => {
    const b = this.banner();
    return b?.kind === 'bounced' ? $localize`:@@banner.bouncedTitle:We can’t deliver email to ${b.email}:email:` : '';
  });
  protected readonly unverifiedText = computed(() => {
    const b = this.banner();
    return b?.kind === 'unverified' ? $localize`:@@banner.verifyText:We sent a link to ${b.email}:email:.` : '';
  });
  protected readonly maintenanceText = computed(() => {
    const b = this.banner();
    if (b?.kind !== 'maintenance') return '';
    return $localize`:@@banner.maintenanceText:${maintenanceWindow(b.startsAt, b.endsAt)}:window: Sweet Hand may be unavailable for up to ${duration(b.startsAt, b.endsAt)}:duration:.`;
  });

  constructor() {
    void this.load();
    const timer = setInterval(() => void this.load(), SESSION_REFRESH_MS);
    inject(DestroyRef).onDestroy(() => clearInterval(timer));

    // An email verified while this page is open earns a success banner (L2-023).
    let wasVerified: boolean | null = null;
    effect(() => {
      const user = this.session.user();
      const verified = user ? user.emailVerified : null;
      untracked(() => {
        if (wasVerified === false && verified === true && !this.router.url.startsWith('/verify-email')) this.justVerified.set(true);
        wasVerified = verified;
      });
    });
  }

  private async load(): Promise<void> {
    try {
      const notices = await firstValueFrom(this.api.current());
      const gone = notices.filter((n) => n.kind === 'maintenance' && remembered(n.id)).map((n) => n.id);
      if (gone.length) this.dismissed.update((d) => new Set([...d, ...gone]));
      this.notices.set(notices);
    } catch {
      // Notices are a courtesy: keep the last ones.
    }
  }

  protected dismiss(key: string): void {
    this.dismissed.update((d) => new Set([...d, key]));
  }

  /** Dismissed per device (mocks: site-banner/info). */
  protected dismissMaintenance(): void {
    const b = this.banner();
    if (b?.kind !== 'maintenance') return;
    remember(b.id);
    this.dismiss(b.id);
  }

  protected async updateEmail(): Promise<void> {
    await this.router.navigate(['/account'], { queryParams: { edit: 'details' } });
  }

  protected async resend(): Promise<void> {
    await this.router.navigateByUrl('/verify-email/sent');
  }
}
