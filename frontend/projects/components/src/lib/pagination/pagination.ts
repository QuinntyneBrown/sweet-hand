import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { Router, RouterLink, type UrlTree } from '@angular/router';
import { Icon } from '../icon/icon';

type Item = number | 'gap';

/** Pages shown in one arrangement; `narrow` drops the neighbours of the current page (pagination CRD). */
export function arrangement(page: number, count: number, narrow: boolean): Item[] {
  const shown = new Set([1, count, page, ...(narrow ? [] : [page - 1, page + 1])].filter((p) => p >= 1 && p <= count));
  const sorted = [...shown].sort((a, b) => a - b);
  const out: Item[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    const fill = !narrow || sorted.length === 2;
    if (prev !== undefined && p - prev === 2 && fill) out.push(prev + 1);
    if (prev !== undefined && p - prev > (fill ? 2 : 1)) out.push('gap');
    out.push(p);
  });
  return out;
}

interface Cell {
  key: string;
  page: number | null;
  /** The page a gap follows. */
  after: number;
  only: 'wide' | 'narrow' | null;
}

/** Union of the wide and narrow arrangements in page order, each item marked with where it shows. */
function cells(page: number, count: number, compact: boolean): Cell[] {
  const keyOf = (items: Item[]) =>
    items.map((item, i) => (item === 'gap' ? `gap-${items[i - 1]}` : `p-${item}`));
  const narrow = arrangement(page, count, true);
  if (compact) return keyOf(narrow).map((key, i) => toCell(key, narrow, i, null));
  const wide = arrangement(page, count, false);
  const wideKeys = keyOf(wide);
  const narrowKeys = keyOf(narrow);
  const all = new Map<string, Cell>();
  wideKeys.forEach((k, i) => all.set(k, toCell(k, wide, i, narrowKeys.includes(k) ? null : 'wide')));
  narrowKeys.forEach((k, i) => {
    if (!all.has(k)) all.set(k, toCell(k, narrow, i, 'narrow'));
  });
  return [...all.values()].sort((a, b) => (a.page ?? a.after + 0.5) - (b.page ?? b.after + 0.5) || (a.only === 'narrow' ? -1 : 1));
}

function toCell(key: string, items: Item[], i: number, only: Cell['only']): Cell {
  const item = items[i];
  return item === 'gap' ? { key, page: null, after: items[i - 1] as number, only } : { key, page: item, after: item, only };
}

/**
 * A row of page links under a long list (docs/specs/components/pagination.md).
 * Every item is a real link; the router navigates.
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
            @if (page() > 1) {
              <a [routerLink]="tree(page() - 1)" [attr.aria-label]="previousLabel()"><svg shIcon="chevron-left"></svg></a>
            } @else {
              <a role="link" aria-disabled="true" [attr.aria-label]="previousLabel()"><svg shIcon="chevron-left"></svg></a>
            }
          </li>
          @for (c of cells(); track c.key) {
            <li [class]="c.only === 'wide' ? 'pagination__wide' : c.only === 'narrow' ? 'pagination__narrow' : null">
              @if (c.page === null) {
                <span class="pagination__gap" aria-hidden="true">…</span>
              } @else if (c.page !== page() && unavailablePages().includes(c.page)) {
                <a role="link" aria-disabled="true" [attr.aria-label]="pageLabel()(c.page)">{{ c.page }}</a>
              } @else {
                <a [routerLink]="tree(c.page)" [attr.aria-current]="c.page === page() ? 'page' : null" [attr.aria-label]="pageLabel()(c.page)">{{ c.page }}</a>
              }
            </li>
          }
          <li>
            @if (page() < pageCount()) {
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

  protected readonly cells = computed(() => cells(this.page(), this.pageCount(), this.compact()));

  protected tree(page: number): UrlTree {
    return this.router.parseUrl(this.hrefFor()(page));
  }
}
