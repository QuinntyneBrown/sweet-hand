import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import { optionDisabled, type FilterOption, type NavItem } from './filter-option';

/**
 * The plain text list: toggle options with counts, or navigation links with
 * `aria-current="page"` (docs/specs/components/filter-list.md, nav mode).
 */
@Component({
  selector: 'sh-filter-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul class="filter-list">
      @if (mode() === 'nav') {
        @for (item of navItems(); track item.href) {
          <li>
            <a class="filter-list__item" [routerLink]="tree(item.href)" [attr.aria-current]="item.current ? 'page' : null">
              {{ item.label }}
              @if (item.badge) {
                <span class="badge badge--count" aria-hidden="true">{{ item.badge.text }}</span><span class="visually-hidden">, {{ item.badge.label }}</span>
              } @else if (item.count) {
                <span class="filter-list__count">{{ item.count }}</span>
              }
            </a>
          </li>
        }
      } @else {
        @for (o of toggleItems(); track o.value) {
          <li>
            <button class="filter-list__item" type="button" [attr.aria-pressed]="o.pressed" [disabled]="isDisabled(o)" (click)="toggled.emit({ value: o.value, pressed: !o.pressed })">
              {{ o.label }}
              @if (o.count !== null) {
                <span class="filter-list__count">{{ o.count }}<span class="visually-hidden">{{ countNoun()?.(o.count) }}</span></span>
              }
            </button>
          </li>
        }
      }
    </ul>
  `,
})
export class FilterList {
  readonly mode = input<'toggle' | 'nav'>('toggle');
  readonly items = input.required<FilterOption[] | NavItem[]>();
  readonly countNoun = input<((count: number) => string) | null>(null);
  readonly disabled = input(false);

  readonly toggled = output<{ value: string; pressed: boolean }>();

  private readonly router = inject(Router);

  protected navItems(): NavItem[] {
    return this.items() as NavItem[];
  }

  protected toggleItems(): FilterOption[] {
    return this.items() as FilterOption[];
  }

  protected isDisabled(o: FilterOption): boolean {
    return optionDisabled(o, this.disabled());
  }

  protected tree(href: string): UrlTree {
    return this.router.parseUrl(href);
  }
}
