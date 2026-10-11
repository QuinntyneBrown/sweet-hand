import { Injectable } from '@angular/core';

/**
 * The thread the person last opened, so the list can put focus back on its row
 * when they come back from it (inbox-row AC-10).
 */
@Injectable({ providedIn: 'root' })
export class LastThread {
  private id: string | null = null;

  remember(id: string): void {
    this.id = id;
  }

  /** The remembered id, once. */
  take(): string | null {
    const id = this.id;
    this.id = null;
    return id;
  }
}
