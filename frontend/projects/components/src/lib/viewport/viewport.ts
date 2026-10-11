import { Injectable, signal } from '@angular/core';
import type { ViewportClass } from './viewport-class';
import type { ViewportCounts } from './viewport-counts';

const QUERIES: [ViewportClass, string][] = [
  ['xl', '(min-width: 75rem)'],
  ['lg', '(min-width: 62rem)'],
  ['md', '(min-width: 48rem)'],
  ['sm', '(min-width: 36rem)'],
];

/** The current viewport class on the design-system breakpoints (L2 conventions). */
@Injectable({ providedIn: 'root' })
export class Viewport {
  private readonly lists = typeof matchMedia === 'function' ? QUERIES.map(([c, q]) => [c, matchMedia(q)] as const) : [];
  readonly current = signal<ViewportClass>(this.resolve());

  constructor() {
    for (const [, list] of this.lists) list.addEventListener('change', () => this.current.set(this.resolve()));
  }

  private resolve(): ViewportClass {
    return this.lists.find(([, list]) => list.matches)?.[0] ?? 'xs';
  }

  count(counts: ViewportCounts | number): number {
    if (typeof counts === 'number') return counts;
    const c = this.current();
    return c === 'xs' ? counts.xs : c === 'sm' || c === 'md' ? counts.sm : counts.lg;
  }
}
