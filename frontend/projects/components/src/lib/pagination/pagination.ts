import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import { Icon } from '../icon/icon';
import { cells } from './pagination-arrangement';

/**
 * Numbered pages under a long list (docs/specs/components/pagination.md).
 * Every item is a plain link built by `hrefFor`, so the router and the Back
 * button keep the page in the URL (L2-003); a single page renders nothing (D-2).
 */
@Component({
  selector: 'sh-pagination',
  imports: [RouterLink, Icon],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { style: 'display: contents' },
  template: `
    @if (pageCount() > 1) {
      <nav class="load-more" [attr.aria-label]="label()">
        @if (summary()) {
          <p class="result-count">{{ summary() }}</p>
        }
        <ul class="pagination">
          <li>
            @if (canOpen(page() - 1)) {
              <a [routerLink]="tree(page() - 1)" [attr.aria-label]="previousLabel()"><svg shIcon="chevron-left"></svg></a>
            } @else {
              <a role="link" aria-disabled="true" [attr.aria-label]="previousLabel()"><svg shIcon="chevron-left"></svg></a>
            }
          </li>
          @for (cell of items(); track cell.kind + (cell.kind === 'page' ? cell.page : cell.after)) {
            <li [class]="cell.only ? 'pagination__' + cell.only : null">
              @if (cell.kind === 'gap') {
                <span class="pagination__gap" aria-hidden="true">…</span>
              } @else if (cell.page === page()) {
                <a [routerLink]="tree(cell.page)" aria-current="page" [attr.aria-label]="pageLabel()(cell.page)">{{ cell.page }}</a>
              } @else if (canOpen(cell.page)) {
                <a [routerLink]="tree(cell.page)" [attr.aria-label]="pageLabel()(cell.page)">{{ cell.page }}</a>
              } @else {
                <a role="link" aria-disabled="true" [attr.aria-label]="pageLabel()(cell.page)">{{ cell.page }}</a>
              }
            </li>
          }
          <li>
            @if (canOpen(page() + 1)) {
              <a [routerLink]="tree(page() + 1)" [attr.aria-label]="nextLabel()"><svg shIcon="chevron-right"></svg></a>
            } @else {
              <a role="link" aria-disabled="true" [attr.aria-label]="nextLabel()"><svg shIcon="chevron-right"></svg></a>
            }
          </li>
        </ul>
      </nav>
    }
  `,
})
export class Pagination {
  readonly page = input.required<number>();
  readonly pageCount = input.required<number>();
  readonly hrefFor = input.required<(page: number) => string>();
  readonly label = input.required<string>();
  readonly summary = input<string | null>(null);
  readonly previousLabel = input.required<string>();
  readonly nextLabel = input.required<string>();
  readonly pageLabel = input.required<(page: number) => string>();
  readonly compact = input(false);
  readonly unavailablePages = input<number[]>([]);

  private readonly router = inject(Router);
  protected readonly items = computed(() => cells(this.page(), this.pageCount(), this.compact()));

  protected canOpen(p: number): boolean {
    return p >= 1 && p <= this.pageCount() && !this.unavailablePages().includes(p);
  }

  protected tree(p: number): UrlTree {
    return this.router.parseUrl(this.hrefFor()(p));
  }
}
