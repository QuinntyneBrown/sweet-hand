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
  template: `
    @if (busy()) {
      <p class="visually-hidden" role="status">{{ busyLabel() }}</p>
      <ul class="queue" aria-busy="true" [attr.aria-label]="label()">
        @for (i of skeletons(); track i) {
          <li [class]="stack() ? 'queue-item queue-item--stack queue-item--skeleton' : 'queue-item queue-item--skeleton'" aria-hidden="true">
            <span class="skeleton skeleton--circle"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span>
          </li>
        }
      </ul>
    } @else {
      <ul class="queue" [attr.aria-label]="label()"><ng-content /></ul>
    }
  `,
})
export class Queue {
  readonly label = input<string | null>(null);
  readonly busy = input(false);
  readonly busyLabel = input<string | null>(null);
  readonly skeletonCount = input(7);
  readonly stack = input(false);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(20, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
