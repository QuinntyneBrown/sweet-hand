import { DestroyRef, Injectable, computed, inject, signal } from '@angular/core';
import { firstValueFrom } from 'rxjs';
import type { SessionView } from '../api/session.models';
import { SessionApi } from './session-api';

/** How often the header's unread and queue counts refresh (L2-029.3). */
export const SESSION_REFRESH_MS = 60_000;

const VISITOR: SessionView = { user: null, unread: 0, queueCount: 0 };

/** Who is signed in, and the counts the header shows. */
@Injectable({ providedIn: 'root' })
export class Session {
  private readonly api = inject(SessionApi);
  private readonly view = signal<SessionView>(VISITOR);
  private timer: ReturnType<typeof setInterval> | undefined;

  readonly user = computed(() => this.view().user);
  readonly role = computed(() => this.view().user?.role ?? 'Visitor');
  readonly unread = computed(() => this.view().unread);
  readonly queueCount = computed(() => this.view().queueCount);

  constructor() {
    inject(DestroyRef).onDestroy(() => clearInterval(this.timer));
  }

  /** Loads the session before the first page renders, then keeps the counts fresh. */
  async load(): Promise<void> {
    await this.refresh();
    clearInterval(this.timer);
    this.timer = setInterval(() => void this.refresh(), SESSION_REFRESH_MS);
  }

  async refresh(): Promise<void> {
    try {
      this.view.set(await firstValueFrom(this.api.current()));
    } catch {
      // Offline or failing: keep what we had; the next refresh tries again.
    }
  }

  async signOut(): Promise<void> {
    await firstValueFrom(this.api.signOut()).catch(() => undefined);
    this.view.set(VISITOR);
  }
}
