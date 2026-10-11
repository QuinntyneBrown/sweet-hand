import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** The grid of photo tiles in public order (photo-tile CRD, `sh-photo-manager`). */
@Component({
  selector: 'sh-photo-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './photo-manager.html',
})
export class PhotoManager {
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly skeletonCount = input(6);
  readonly announcement = input<string | null>(null);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(30, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
