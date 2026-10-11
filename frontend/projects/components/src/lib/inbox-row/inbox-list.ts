import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** The ruled list of inbox rows and its loading skeletons (docs/specs/components/inbox-row.md). */
@Component({
  selector: 'sh-inbox-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './inbox-list.html',
})
export class InboxList {
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly loadingLabel = input('');
  readonly skeletonCount = input(4);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
