import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Photo } from './photo';
import type { RowPhoto } from './row-photo';

/** A row of round photos: the decorative three above system pages, or the operator's strip (photo CRD). */
@Component({
  selector: 'sh-photo-row',
  imports: [Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  templateUrl: './photo-row.html',
})
export class PhotoRow {
  readonly variant = input<'decorative' | 'strip'>('decorative');
  readonly photos = input.required<readonly RowPhoto[]>();
  readonly busy = input(false);
  readonly skeletonCount = input(4);

  protected readonly skeletons = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));
}
