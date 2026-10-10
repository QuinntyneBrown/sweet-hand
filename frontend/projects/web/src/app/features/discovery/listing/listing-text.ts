import { count } from '../../../core/format/format';

/** Wording of the listing that depends on numbers (pagination and filter CRDs). */

/** "Showing 1–24 of 60" (pagination D-8). */
export function pageSummary(page: number, pageSize: number, total: number): string {
  const from = count((page - 1) * pageSize + 1);
  const to = count(Math.min(page * pageSize, total));
  return $localize`:@@listing.pageSummary:Showing ${from}:from:–${to}:to: of ${count(total)}:total:`;
}

/** "14 caterers", "1 caterer" (dropdown totals and checkbox counts). */
export function caterersCount(n: number): string {
  return n === 1 ? $localize`:@@listing.oneCaterer:1 caterer` : $localize`:@@listing.caterers:${count(n)}:count: caterers`;
}

export function pageLabel(page: number): string {
  return $localize`:@@pagination.page:Page ${page}:page:`;
}
