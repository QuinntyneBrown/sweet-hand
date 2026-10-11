import { DOCUMENT, Injectable, inject, signal } from '@angular/core';
import type { ListingPageView, ListingQuery } from '../../../core/api/discovery.models';

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

export interface SavedListing {
  view: ListingPageView;
  savedAt: Date;
}

const keyOf = (q: ListingQuery) => JSON.stringify([[...q.cuisines].sort(), [...q.regions].sort(), [...q.areas].sort(), q.occasion ?? null, q.page]);

/**
 * The listing pages seen in this visit, so they can still be shown when the
 * connection drops (caterers offline mock, L2-091).
 */
@Injectable({ providedIn: 'root' })
export class ListingCache {
  private readonly pages = new Map<string, SavedListing>();

  save(q: ListingQuery, view: ListingPageView): SavedListing {
    const saved = { view, savedAt: new Date() };
    this.pages.set(keyOf(q), saved);
    return saved;
  }

  get(q: ListingQuery): SavedListing | undefined {
    return this.pages.get(keyOf(q));
  }

  has(q: ListingQuery): boolean {
    return this.pages.has(keyOf(q));
  }
}
