import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * A row of large figures (docs/specs/components/stat.md, `sh-stat-grid`).
 * The stats are `div[sh-stat]` children so the `dl` keeps valid children.
 */
@Component({
  selector: 'sh-stat-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './stat-grid.html',
})
export class StatGrid {
  readonly busy = input(false);
  readonly busyLabel = input('');
  readonly skeletonCount = input(4);
  readonly skeletonDelta = input(false);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(8, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
