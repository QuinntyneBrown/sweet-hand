import { DOCUMENT, inject, Injectable, signal } from '@angular/core';

/** Whether the browser has a connection, kept up to date by its online and offline events. */
@Injectable({ providedIn: 'root' })
export class Connectivity {
  private readonly window = inject(DOCUMENT).defaultView;
  private readonly state = signal(this.window?.navigator.onLine ?? true);
  readonly online = this.state.asReadonly();

  constructor() {
    this.window?.addEventListener('online', () => this.state.set(true));
    this.window?.addEventListener('offline', () => this.state.set(false));
  }
}
