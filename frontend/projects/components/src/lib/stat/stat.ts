import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Icon } from '../icon/icon';
import { StatGrid } from './stat-grid';

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
