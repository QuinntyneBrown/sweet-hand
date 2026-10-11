import { DOCUMENT, DestroyRef, Injectable, inject, signal } from '@angular/core';

/** Whether the browser is online, kept up to date from the `online` and `offline` events. */
@Injectable({ providedIn: 'root' })
export class Connection {
  private readonly window = inject(DOCUMENT).defaultView;
  readonly online = signal(this.window?.navigator.onLine ?? true);

  constructor() {
    const update = () => this.online.set(this.window?.navigator.onLine ?? true);
    this.window?.addEventListener('online', update);
    this.window?.addEventListener('offline', update);
    inject(DestroyRef).onDestroy(() => {
      this.window?.removeEventListener('online', update);
      this.window?.removeEventListener('offline', update);
    });
  }
}
