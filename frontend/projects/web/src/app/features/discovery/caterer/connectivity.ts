import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

/** How long "Back online" stays after the connection returns (docs/mocks/pages/caterer/offline.html). */
export const BACK_ONLINE_MS = 4000;

/**
 * Whether the browser has a connection (L2-091): the page stays readable
 * offline while sending is held until it returns.
 */
@Injectable()
export class Connectivity {
  private readonly window = inject(DOCUMENT).defaultView!;
  readonly online = signal(this.window.navigator.onLine);
  /** True for a few seconds after the connection returns. */
  readonly backOnline = signal(false);

  constructor() {
    let timer: ReturnType<typeof setTimeout> | undefined;
    const offline = () => {
      clearTimeout(timer);
      this.backOnline.set(false);
      this.online.set(false);
    };
    const online = () => {
      this.online.set(true);
      this.backOnline.set(true);
      clearTimeout(timer);
      timer = setTimeout(() => this.backOnline.set(false), BACK_ONLINE_MS);
    };
    this.window.addEventListener('offline', offline);
    this.window.addEventListener('online', online);
    inject(DestroyRef).onDestroy(() => {
      clearTimeout(timer);
      this.window.removeEventListener('offline', offline);
      this.window.removeEventListener('online', online);
    });
  }
}
