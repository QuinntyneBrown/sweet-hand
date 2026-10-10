import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Check, type CheckStatusLabels } from '../checklist/checklist';
import { Icon } from '../icon/icon';

export interface SideNavItem {
  /** "Enquiries", from the resource files. */
  label: string;
  /** "/dashboard/enquiries" */
  href: string;
  /** Renders aria-current="page". At most one item in all groups. */
  current?: boolean;
  /** Visible count text, already formatted: "2 unread", "7". */
  count?: string;
  /** Spoken instead of a bare number: "7 waiting" (D-2). */
  countLabel?: string;
}

export interface SectionLinkItem {
  title: string;
  href: string;
  meta?: string;
  status?: 'missing' | 'done' | 'attention' | null;
}

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

/** The dashboard's sections as tall linked rows with a status mark (side-nav CRD, `sh-section-list`). */
@Component({
  selector: 'sh-section-list',
  imports: [RouterLink, Check, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    <ul class="section-list">
      @for (item of items(); track $index) {
        <li>
          <a class="section-link" [routerLink]="item.href">
            @if (item.status) {
              <sh-check [status]="item.status" />
            }
            <span class="section-link__body">
              <span class="section-link__title"
                >@if (item.status && statusLabels()) {<span class="visually-hidden">{{ statusLabels()![item.status] }}</span>}{{ item.title }}</span
              >
              @if (item.meta) {
                <span [class]="item.status === 'attention' ? 'section-link__meta section-link__meta--error' : 'section-link__meta'">{{ item.meta }}</span>
              }
            </span>
            <svg shIcon="chevron-right"></svg>
          </a>
        </li>
      }
    </ul>
  `,
})
export class SectionList {
  readonly items = input.required<readonly SectionLinkItem[]>();
  readonly statusLabels = input<CheckStatusLabels | null>(null);
}
