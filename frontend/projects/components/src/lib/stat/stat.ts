import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icon } from '../icon/icon';

/**
 * A row of large figures (docs/specs/components/stat.md, `sh-stat-grid`).
 * The stats are `div[sh-stat]` children so the `dl` keeps valid children.
 */
@Component({
  selector: 'sh-stat-grid',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (busy()) {
      <p class="visually-hidden" role="status">{{ busyLabel() }}</p>
      <div class="stat-grid" aria-busy="true">
        @for (i of skeletons(); track i) {
          <div class="stat" aria-hidden="true">
            <span class="skeleton skeleton--text"></span><span class="skeleton skeleton--title"></span>
            @if (skeletonDelta()) {
              <span class="skeleton skeleton--text"></span>
            }
          </div>
        }
      </div>
    } @else {
      <dl class="stat-grid"><ng-content /></dl>
    }
  `,
})
export class StatGrid {
  readonly busy = input(false);
  readonly busyLabel = input('');
  readonly skeletonCount = input(4);
  readonly skeletonDelta = input(false);

  protected readonly skeletons = computed(() => Array.from({ length: Math.min(8, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}

/**
 * One labelled figure (stat CRD, `sh-stat`), used as `<div sh-stat>`: inside a
 * grid its parts are `dt`/`dd`, alone they are spans. Zero is a value; `null`
 * renders the dash with `missingLabel` (D-4).
 */
@Component({
  // eslint-disable-next-line @angular-eslint/component-selector
  selector: 'div[sh-stat]',
  imports: [Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'stat' },
  template: `
    @if (inGrid) {
      <dt class="stat__label">{{ label() }}</dt>
      <dd class="stat__value">
        @if (value() === null) {
          <span aria-hidden="true">–</span><span class="visually-hidden">{{ missingLabel() }}</span>
        } @else {
          {{ value() }}@if (valueContext()) {<span class="visually-hidden">{{ valueContext() }}</span>}
        }
      </dd>
      @if (value() === null) {
        <dd class="text-caption" aria-hidden="true">{{ missingLabel() }}</dd>
      }
      @if (delta()) {
        <dd [class]="deltaClass()">@if (direction()) {<svg class="icon--sm" [shIcon]="direction() === 'up' ? 'arrow-up' : 'arrow-down'"></svg>}{{ delta() }}</dd>
      }
    } @else {
      <span class="stat__label">{{ label() }}</span>
      <span class="stat__value">
        @if (value() === null) {
          <span aria-hidden="true">–</span><span class="visually-hidden">{{ missingLabel() }}</span>
        } @else {
          {{ value() }}@if (valueContext()) {<span class="visually-hidden">{{ valueContext() }}</span>}
        }
      </span>
      @if (delta()) {
        <span [class]="deltaClass()">@if (direction()) {<svg class="icon--sm" [shIcon]="direction() === 'up' ? 'arrow-up' : 'arrow-down'"></svg>}{{ delta() }}</span>
      }
    }
  `,
})
export class Stat {
  readonly label = input.required<string>();
  readonly value = input.required<string | null>();
  readonly valueContext = input<string | null>(null);
  readonly missingLabel = input('');
  readonly delta = input<string | null>(null);
  readonly direction = input<'up' | 'down' | null>(null);
  readonly sentiment = input<'good' | 'bad' | null>(null);

  protected readonly inGrid = !!inject(StatGrid, { optional: true });
  protected readonly deltaClass = computed(() =>
    ['stat__delta', this.sentiment() === 'good' && 'stat__delta--up', this.sentiment() === 'bad' && 'stat__delta--down'].filter(Boolean).join(' '),
  );
}
