import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A row of large figures (docs/specs/components/stat.md, `sh-stat-grid`).
 * The stats are `div[sh-stat]` children so the `dl` keeps valid children.
 */
@Component({
  selector: 'sh-stat-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (busy()) {
      <p class="visually-hidden" role="status">{{ busyLabel() }}</p>
      <div class="stat-grid" aria-busy="true">
        @for (i of skeletons(); track i) {
          <div class="stat" aria-hidden="true">
            <span class="skeleton skeleton--text"></span><span class="skeleton skeleton--title"></span>
            @if (skeletonDelta()) {
              <span class="skeleton skeleton--text"></span>
            }
          </div>
        }
      </div>
    } @else {
      <dl class="stat-grid"><ng-content /></dl>
    }
  `,
})
export class StatGrid {
  readonly busy = input(false);
  readonly busyLabel = input('');
  readonly skeletonCount = input(4);
  readonly skeletonDelta = input(false);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(8, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
