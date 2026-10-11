import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import type { TimelineForm } from './timeline-form';

/**
 * An ordered list of what happened or what happens next
 * (docs/specs/components/timeline.md, `sh-timeline`). One entry form per list.
 */
@Component({
  selector: 'sh-timeline',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './timeline.html',
})
export class Timeline {
  readonly label = input.required<string>();
  readonly form = input<TimelineForm>('event');
  readonly busy = input(false);
  readonly busyLabel = input('');
  readonly skeletonCount = input(2);

  protected readonly skeletons = computed(() => Array.from({ length: Math.max(1, this.skeletonCount()) }, (_, i) => i));
}

