import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** The grid of photo tiles in public order (photo-tile CRD, `sh-photo-manager`). */
@Component({
  selector: 'sh-photo-manager',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul class="photo-manager" [attr.aria-label]="label()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        @for (i of skeletons(); track i) {
          <li class="photo-tile photo-tile--skeleton" aria-hidden="true">
            <span class="photo"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text"></span>
          </li>
        }
      } @else {
        <ng-content />
      }
    </ul>
    <p class="visually-hidden" role="status" aria-live="polite">{{ announcement() }}</p>
  `,
})
export class PhotoManager {
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly skeletonCount = input(6);
  readonly announcement = input<string | null>(null);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(30, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
