import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

/** The ruled list of inbox rows and its loading skeletons (docs/specs/components/inbox-row.md). */
@Component({
  selector: 'sh-inbox-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul class="inbox-list" [attr.aria-label]="busy() ? loadingLabel() : label()" [attr.aria-busy]="busy() ? 'true' : null">
      @if (busy()) {
        @for (i of skeletons(); track i) {
          <li class="inbox-skeleton-row" aria-hidden="true">
            <span class="skeleton skeleton--circle"></span><span class="skeleton skeleton--text" style="width: 50%"></span
            ><span class="skeleton skeleton--text" style="width: 3rem"></span><span class="skeleton skeleton--text" style="width: 70%"></span
            ><span class="skeleton skeleton--text" style="width: 4rem"></span>
          </li>
        }
      } @else {
        <ng-content />
      }
    </ul>
  `,
})
export class InboxList {
  readonly label = input.required<string>();
  readonly busy = input(false);
  readonly loadingLabel = input('');
  readonly skeletonCount = input(4);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
