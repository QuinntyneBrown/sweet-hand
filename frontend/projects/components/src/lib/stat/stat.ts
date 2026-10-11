import { ChangeDetectionStrategy, Component, InjectionToken, TemplateRef, computed, contentChildren, inject, input, viewChild } from '@angular/core';
import { NgTemplateOutlet } from '@angular/common';
import { Icon } from '../icon/icon';

const STAT_GRID = new InjectionToken<true>('STAT_GRID');

/**
 * One figure with its label and an optional change (docs/specs/components/stat.md,
 * `sh-stat`). Inside a `sh-stat-grid` the grid places its `div.stat` of `dt`/`dd`
 * directly in the `dl`; on its own it renders spans where it stands.
 */
@Component({
  selector: 'sh-stat',
  imports: [NgTemplateOutlet, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (!inGrid) {
      <div class="stat">
        <span class="stat__label">{{ label() }}</span>
        <span class="stat__value"><ng-container *ngTemplateOutlet="valueTpl" /></span>
        @if (value() === null) {
          <span class="text-caption" aria-hidden="true">{{ missingLabel() }}</span>
        } @else if (delta()) {
          <span [class]="deltaClass()"><ng-container *ngTemplateOutlet="deltaTpl" /></span>
        }
      </div>
    }
    <ng-template #item>
      <div class="stat">
        <dt class="stat__label">{{ label() }}</dt>
        <dd class="stat__value"><ng-container *ngTemplateOutlet="valueTpl" /></dd>
        @if (value() === null) {
          <dd class="text-caption" aria-hidden="true">{{ missingLabel() }}</dd>
        } @else if (delta()) {
          <dd [class]="deltaClass()"><ng-container *ngTemplateOutlet="deltaTpl" /></dd>
        }
      </div>
    </ng-template>
    <ng-template #valueTpl>
      @if (value() === null) {
        <span aria-hidden="true">–</span><span class="visually-hidden">{{ missingLabel() }}</span>
      } @else {
        <ng-container>{{ value() }}</ng-container>
        @if (valueContext()) {
          <span class="visually-hidden">{{ valueContext() }}</span>
        }
      }
    </ng-template>
    <ng-template #deltaTpl
      >@if (direction()) {<svg class="icon--sm" [shIcon]="direction() === 'down' ? 'arrow-down' : 'arrow-up'"></svg>}{{ delta() }}</ng-template
    >
  `,
})
export class Stat {
  readonly label = input.required<string>();
  readonly value = input.required<string | null>();
  readonly valueContext = input<string | null>(null);
  readonly missingLabel = input<string>('');
  readonly delta = input<string | null>(null);
  readonly direction = input<'up' | 'down' | null>(null);
  readonly sentiment = input<'good' | 'bad' | null>(null);

  /** The `div.stat`, placed in the `dl` by the grid. */
  readonly item = viewChild.required<TemplateRef<unknown>>('item');
  protected readonly inGrid = inject(STAT_GRID, { optional: true }) !== null;
  protected readonly deltaClass = computed(() =>
    ['stat__delta', this.sentiment() === 'good' && 'stat__delta--up', this.sentiment() === 'bad' && 'stat__delta--down'].filter(Boolean).join(' '),
  );
}

/** Headline figures in a row of two or four (stat CRD, `sh-stat-grid`). */
@Component({
  selector: 'sh-stat-grid',
  imports: [NgTemplateOutlet],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  providers: [{ provide: STAT_GRID, useValue: true }],
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
      <dl class="stat-grid">
        @for (s of stats(); track s) {
          <ng-container *ngTemplateOutlet="s.item()" />
        }
      </dl>
    }
    <ng-content />
  `,
})
export class StatGrid {
  readonly busy = input(false);
  readonly busyLabel = input<string>('');
  readonly skeletonCount = input(4);
  readonly skeletonDelta = input(false);

  protected readonly stats = contentChildren(Stat);
  protected readonly skeletons = computed(() => Array.from({ length: Math.min(8, Math.max(1, Math.round(this.skeletonCount()))) }, (_, i) => i));
}
