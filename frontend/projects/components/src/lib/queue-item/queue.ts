import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/**
 * The review queue and caterer-records list (docs/specs/components/queue-item.md,
 * `sh-queue`): `ul.queue` with its rows, or skeleton rows and a status line
 * while it loads. Rows are `sh-queue-item` children.
 */
@Component({
  selector: 'sh-queue',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  templateUrl: './queue.html',
})
export class Queue {
  readonly label = input<string | null>(null);
  readonly busy = input(false);
  readonly busyLabel = input<string | null>(null);
  readonly skeletonCount = input(7);
  readonly stack = input(false);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
