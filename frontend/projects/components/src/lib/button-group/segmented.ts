import { ChangeDetectionStrategy, Component, computed, inject, input, output } from '@angular/core';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import type { SegmentedItem } from './segmented-item';

/**
 * Pick one from a short, always visible row: links kept in the URL or
 * in-place toggles (docs/specs/components/button-group.md, `sh-segmented`).
 * Every item is its own tab stop (D-4).
 */
@Component({
  selector: 'sh-segmented',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (loading()) {
      <ul class="segmented" aria-hidden="true">
        @for (i of skeletons(); track i) {
          <li><span class="skeleton skeleton--text" style="width: 4rem"></span></li>
        }
      </ul>
    } @else {
      <ul class="segmented" [attr.aria-label]="ariaLabel()">
        @for (item of rendered(); track item.value) {
          <li>
            @if (mode() === 'link') {
              <a [routerLink]="item.tree" [attr.aria-current]="item.value === selected() ? 'page' : null" (click)="followed.emit({ value: item.value, event: $event })"
                >{{ item.label }}@if (item.count !== null) {&ngsp;<span class="filter-list__count">{{ item.countText }}</span>}@if (item.hiddenSuffix) {<span class="visually-hidden">{{ item.hiddenSuffix }}</span>}</a
              >
            } @else {
              <button type="button" [attr.aria-pressed]="item.value === selected() ? 'true' : 'false'" [disabled]="!!item.disabled" (click)="press(item.value)"
                >{{ item.label }}@if (item.count !== null) {&ngsp;<span class="filter-list__count">{{ item.countText }}</span>}@if (item.hiddenSuffix) {<span class="visually-hidden">{{ item.hiddenSuffix }}</span>}</button
              >
            }
          </li>
        }
      </ul>
    }
  `,
})
export class Segmented {
  readonly ariaLabel = input.required<string>();
  readonly mode = input<'link' | 'toggle'>('link');
  readonly items = input.required<readonly SegmentedItem[]>();
  readonly selected = input.required<string>();
  readonly loading = input(false);

  readonly selectedChange = output<string>();
  readonly followed = output<{ value: string; event: MouseEvent }>();

  private readonly router = inject(Router);
  private readonly format = new Intl.NumberFormat('en-CA');

  protected readonly rendered = computed(() =>
    this.items().map((item) => ({
      ...item,
      count: item.count ?? null,
      countText: item.count == null ? '' : this.format.format(item.count),
      tree: (item.href ? this.router.parseUrl(item.href) : null) as UrlTree | null,
    })),
  );
  protected readonly skeletons = computed(() => Array.from({ length: this.items().length || 5 }, (_, i) => i));

  protected press(value: string): void {
    if (value !== this.selected()) this.selectedChange.emit(value);
  }
}
