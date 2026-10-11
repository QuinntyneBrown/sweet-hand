import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { SideNavItem } from './side-nav-item';

/**
 * The dashboard and operator side navigation from 62rem
 * (docs/specs/components/side-nav.md, `sh-side-nav`). Items are data.
 */
@Component({
  selector: 'sh-side-nav',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <nav class="side-nav" [attr.aria-label]="label()">
      @for (group of nonEmpty(); track $index) {
        <ul class="filter-list">
          @for (item of group; track item.href) {
            <li>
              <a class="filter-list__item" [routerLink]="item.href" [attr.aria-current]="item.current ? 'page' : null"
                >{{ item.label }}@if (item.count) {&ngsp;<span class="filter-list__count"
                    >@if (item.countLabel) {<span aria-hidden="true">{{ item.count }}</span><span class="visually-hidden">{{ item.countLabel }}</span>} @else {<ng-container>{{ item.count }}</ng-container>}</span
                  >}</a
              >
            </li>
          }
        </ul>
      }
    </nav>
  `,
})
export class SideNav {
  readonly label = input.required<string>();
  readonly groups = input.required<readonly (readonly SideNavItem[])[]>();

  protected readonly nonEmpty = computed(() => this.groups().filter((g) => g.length));
}

