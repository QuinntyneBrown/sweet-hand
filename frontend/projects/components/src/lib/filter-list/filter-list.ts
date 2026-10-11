import { ChangeDetectionStrategy, Component, inject, input, output } from '@angular/core';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import { type FilterOption, optionDisabled } from './filter-option';
import type { NavItem } from './nav-item';

/**
 * The plain text list: toggle options with counts, or navigation links with
 * `aria-current="page"` (docs/specs/components/filter-list.md, nav mode).
 */
@Component({
  selector: 'sh-filter-list',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  templateUrl: './filter-list.html',
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
