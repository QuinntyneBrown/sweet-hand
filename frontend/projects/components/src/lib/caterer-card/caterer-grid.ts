import { ChangeDetectionStrategy, Component, computed, contentChildren, effect, inject, input } from '@angular/core';
import { Viewport } from '../viewport/viewport';
import type { ViewportCounts } from '../viewport/viewport-counts';
import { CatererCard } from './caterer-card';

/**
 * The listing and occasions grid (caterer-card CRD, `sh-caterer-grid`).
 * Projects `li > sh-caterer-card` items; shows skeletons while busy and gives
 * the first cards of the first viewport eager loading (L2-006.3).
 */
@Component({
  selector: 'sh-caterer-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul [class]="variant() === 'occasions' ? 'occasion-grid' : 'caterer-grid'" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        @for (i of skeletons(); track i) {
          <li class="caterer-card caterer-card--skeleton" aria-hidden="true">
            <span class="photo"><span class="skeleton skeleton--circle"></span></span>
            <span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span>
          </li>
        }
      } @else {
        <ng-content />
      }
    </ul>
  `,
})
export class CatererGrid {
  readonly variant = input<'caterers' | 'occasions'>('caterers');
  readonly busy = input(false);
  readonly skeletonCount = input<ViewportCounts | number>({ xs: 3, sm: 6, lg: 9 });
  readonly eagerCount = input<ViewportCounts | number>({ xs: 2, sm: 4, lg: 6 });

  private readonly viewport = inject(Viewport);
  private readonly cards = contentChildren(CatererCard, { descendants: true });
  protected readonly skeletons = computed(() => Array.from({ length: this.viewport.count(this.skeletonCount()) }, (_, i) => i));

  constructor() {
    effect(() => {
      const eager = this.viewport.count(this.eagerCount());
      this.cards().forEach((card, i) => {
        if (card.gridLoading() === null) card.gridLoading.set(i < eager ? 'eager' : 'lazy');
      });
    });
  }
}
