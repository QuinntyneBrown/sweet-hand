import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { NavigationStart, Router } from '@angular/router';
import { filter } from 'rxjs';
import { firstValueFrom } from 'rxjs';
import { SESSION_SERVICE, SessionView } from '@sweet-hand/api';

/** How often the header's unread and queue counts refresh (L2-029.3). */
export const SESSION_REFRESH_MS = 60_000;

const VISITOR: SessionView = { user: null, unread: 0, queueCount: 0 };

/** Who is signed in, and the counts the header shows. */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly api = inject(SESSION_SERVICE);
  private readonly router = inject(Router);
  private readonly view = signal<SessionView>(VISITOR);
  private readonly expiredAs = signal<{ email: string } | null>(null);
  private timer: ReturnType<typeof setInterval> | undefined;

  readonly user = computed(() => this.view().user);
  readonly role = computed(() => this.view().user?.role ?? 'Visitor');
  readonly unread = computed(() => this.view().unread);
  readonly queueCount = computed(() => this.view().queueCount);
  /** Set while an operator still owes the second step (L2-056.2). */
  readonly pendingSecondFactor = computed(() => this.view().pendingSecondFactor ?? null);
  /** Who was signed out for being idle, until they sign in again (L2-078.3). */
  readonly expired = this.expiredAs.asReadonly();
  /** The signed-in account owes acceptance of a changed privacy notice (L2-070.4). */
  readonly privacyUpdateRequired = computed(() => !!this.view().user && !!this.view().privacyUpdateRequired);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
    // Until a changed notice is accepted, every page but the notice itself leads to it (L2-070.4).
    this.router.events.pipe(filter((e) => e instanceof NavigationStart)).subscribe((e) => {
      const path = e.url.split(/[?#]/)[0];
      if (this.privacyUpdateRequired() && path !== '/privacy/accept' && path !== '/privacy') {
        void this.router.navigate(['/privacy/accept'], { queryParams: { returnUrl: e.url } });
      }
    });
  }

  /** Loads the session before the first page renders, then keeps the counts fresh. */
  async load(): Promise<void> {
    await this.refresh();
    clearInterval(this.timer);
    this.timer = setInterval(() => void this.refresh(), SESSION_REFRESH_MS);
  }

  async refresh(): Promise<void> {
    let next: SessionView;
    try {
      next = await firstValueFrom(this.api.current());
    } catch {
      // Offline or failing: keep what we had; the next refresh tries again.
      return;
    }
    const wasSignedIn = !!this.view().user;
    this.view.set(next);
    if (next.user) this.expiredAs.set(null);
    if (next.expired) {
      this.expiredAs.set(next.expired);
      // Signed out while on a page: sign in again and come back to it (L2-078.3).
      if (wasSignedIn) await this.router.navigate(['/sign-in'], { queryParams: { returnUrl: this.router.url } });
    }
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.api.signOut()).catch(() => undefined);
    this.view.set(VISITOR);
    this.expiredAs.set(null);
  }
}
