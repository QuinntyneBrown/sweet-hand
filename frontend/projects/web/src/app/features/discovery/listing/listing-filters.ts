import type { FilterOption } from '@sweet-hand/components';
import type { ListingPageView, ListingQuery } from '../../../core/api/discovery.models';

/**
 * Filter options of the listing (filter-by-cuisine and filter-by-area designs):
 * cuisines in the server's order with their counts, and for areas the chosen
 * areas first, then the five regions (filter-list CRD, Content).
 */

export type AreaValue = `region:${string}` | `area:${string}`;

export function cuisineOptions(view: ListingPageView, q: ListingQuery): FilterOption[] {
  return view.cuisines.map((c) => ({ value: c.id, label: c.name, count: c.count, pressed: q.cuisines.includes(c.id) }));
}

export function areaOptions(view: ListingPageView, q: ListingQuery): FilterOption[] {
  const chosen = view.regions
    .flatMap((r) => r.areas)
    .filter((a) => q.areas.includes(a.id))
    .map((a) => ({ value: `area:${a.id}`, label: a.name, count: a.count, pressed: true }));
  const regions = view.regions.map((r) => ({ value: `region:${r.id}`, label: r.name, count: r.count, pressed: q.regions.includes(r.id) }));
  return [...chosen, ...regions];
}

export function parseAreaValue(value: string): { kind: 'region' | 'area'; id: string } {
  const [kind, id] = value.split(':');
  return { kind: kind === 'region' ? 'region' : 'area', id };
}

/** " caterers" after a count, read but not shown (filter-list D-2). */
export function caterersNoun(n: number): string {
  return n === 1 ? $localize`:@@filters.caterer: caterer` : $localize`:@@filters.caterers: caterers`;
}

export function moreCuisines(hidden: number): string {
  return $localize`:@@filters.moreCuisines:More cuisines (${hidden}:count:)`;
}
