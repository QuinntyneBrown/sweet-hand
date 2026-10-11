import { ChangeDetectionStrategy, Component, computed, contentChild, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Icon } from '../icon/icon';
import { ChangedFlag } from '../description-list/changed-flag';
import type { QueueItemMedia } from './queue-item-media';

/**
 * One row of the review queue or the caterer records (docs/specs/components/queue-item.md,
 * `sh-queue-item`): a link whose name reads title, wait, kind and meta. The
 * host is the list item for assistive technology, as `sh-message` does, so the
 * `ul` only ever holds list items.
 */
@Component({
  selector: 'sh-queue-item',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents', role: 'listitem' },
  template: `
    <li role="none">
      <a [class]="cls()" [routerLink]="href()">
        @switch (media()) {
          @case ('photo') {
            @if (photo(); as p) {
              <span class="photo"><img [src]="p.src" alt="" [width]="p.width" [height]="p.height" loading="lazy" /></span>
            } @else {
              <span class="photo photo--placeholder"><svg shIcon="plate"></svg></span>
            }
          }
          @case ('placeholder') {
            <span class="photo photo--placeholder"><svg shIcon="plate"></svg></span>
          }
          @case ('report') {
            <span class="avatar" aria-hidden="true"><svg shIcon="flag"></svg></span>
          }
          @case ('review') {
            <span class="avatar" aria-hidden="true"><svg shIcon="star"></svg></span>
          }
        }
        @if (renamedTo()) {
          <span class="queue-item__title"
            >{{ title() }} <span aria-hidden="true">→</span><span class="visually-hidden">{{ renamedLabel() }}</span> {{ renamedTo() }}</span
          >
        } @else {
          <span class="queue-item__title">{{ title() }}</span>
        }
        <span [class]="waitCls()">{{ wait() }}<ng-content select="[slot=status]" /></span>
        <span class="queue-item__meta"
          >@if (kind()) {<span class="kind">{{ kind() }}</span>@if (meta()) {&ngsp;·&ngsp;}}{{ meta() }}@if (flag()) {&ngsp;·&ngsp;}<ng-content select="[slot=flag]"
        /></span>
      </a>
    </li>
  `,
})
export class QueueItem {
  readonly href = input.required<string>();
  readonly title = input.required<string>();
  readonly renamedTo = input<string | null>(null);
  readonly renamedLabel = input<string | null>(null);
  readonly media = input<QueueItemMedia>('photo');
  readonly photo = input<{ src: string; width: number; height: number } | null>(null);
  readonly wait = input<string | null>(null);
  readonly late = input(false);
  readonly kind = input<string | null>(null);
  readonly meta = input.required<string>();
  readonly stack = input(false);

  protected readonly flag = contentChild(ChangedFlag);
  protected readonly cls = computed(() => (this.stack() ? 'queue-item queue-item--stack' : 'queue-item'));
  protected readonly waitCls = computed(() => (this.late() ? 'queue-item__wait queue-item__wait--late' : 'queue-item__wait'));
}
