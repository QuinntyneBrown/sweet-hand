import { Injectable } from '@angular/core';
import { type ListingPageView, type ListingQuery } from '@sweet-hand/api';
import type { SavedListing } from './saved-listing';

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
