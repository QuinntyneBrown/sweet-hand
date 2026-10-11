import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { Photo } from './photo';
import type { RowPhoto } from './row-photo';

/** A row of round photos: the decorative three above system pages, or the operator's strip (photo CRD). */
@Component({
  selector: 'sh-photo-row',
  imports: [Photo],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: block' },
  template: `
    @if (variant() === 'strip') {
      <div class="photo-row photo-row--strip" [attr.aria-hidden]="busy() ? 'true' : null">
        @if (busy()) {
          @for (i of skeletons(); track i) {
            <span class="photo"><span class="skeleton skeleton--circle"></span></span>
          }
        } @else {
          @for (p of photos(); track $index) {
            <sh-photo [src]="p.src" [alt]="p.alt" [width]="p.width" [height]="p.height" [failedLabel]="''" />
          }
        }
      </div>
    } @else {
      <div class="photo-row" aria-hidden="true">
        @for (p of photos(); track $index) {
          <sh-photo [src]="p.src" alt="" [width]="p.width" [height]="p.height" loading="eager" [failedLabel]="''" />
        }
      </div>
    }
  `,
})
export class PhotoRow {
  readonly variant = input<'decorative' | 'strip'>('decorative');
  readonly photos = input.required<readonly RowPhoto[]>();
  readonly busy = input(false);
  readonly skeletonCount = input(4);

  protected readonly skeletons = computed(() => Array.from({ length: this.skeletonCount() }, (_, i) => i));
}
