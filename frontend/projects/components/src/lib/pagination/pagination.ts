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
  templateUrl: './pagination.html',
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
