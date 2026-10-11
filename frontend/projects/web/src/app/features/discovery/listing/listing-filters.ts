import type { FilterOption } from '@sweet-hand/components';
import type { CuisineRef, ListingPageView, ListingQuery, ServiceArea } from '../../../core/api/discovery.models';

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

/** Before the first results arrive (loading, error) the column lists names without counts. */
export function uncountedCuisineOptions(cuisines: readonly CuisineRef[], q: ListingQuery): FilterOption[] {
  return cuisines.map((c) => ({ value: c.id, label: c.name, count: null, pressed: q.cuisines.includes(c.id) }));
}

export function uncountedAreaOptions(areas: readonly ServiceArea[], q: ListingQuery): FilterOption[] {
  const chosen = areas.filter((a) => q.areas.includes(a.id)).map((a) => ({ value: `area:${a.id}`, label: a.name, count: null, pressed: true }));
  const regions = [...new Map(areas.map((a) => [a.regionId, a.regionName])).entries()].map(([id, name]) => ({
    value: `region:${id}`,
    label: name,
    count: null,
    pressed: q.regions.includes(id),
  }));
  return [...chosen, ...regions];
}

export function parseAreaValue(value: string): { kind: 'region' | 'area'; id: string } {
  const [kind, id] = value.split(':');
  return { kind: kind === 'region' ? 'region' : 'area', id };
}

export type ChipValue = `cuisine:${string}` | `region:${string}` | `area:${string}` | `occasion:${string}`;

/** One chip per active filter the listing knows, cuisines first (filter-list CRD, `sh-active-filters`). */
export function activeChips(view: ListingPageView, q: ListingQuery): { value: ChipValue; label: string }[] {
  const areas = view.regions.flatMap((r) => r.areas);
  return [
    ...view.cuisines.filter((c) => q.cuisines.includes(c.id)).map((c) => ({ value: `cuisine:${c.id}` as ChipValue, label: c.name })),
    ...view.regions.filter((r) => q.regions.includes(r.id)).map((r) => ({ value: `region:${r.id}` as ChipValue, label: r.name })),
    ...areas.filter((a) => q.areas.includes(a.id)).map((a) => ({ value: `area:${a.id}` as ChipValue, label: a.name })),
    ...view.occasions.filter((o) => o.id === q.occasion).map((o) => ({ value: `occasion:${o.id}` as ChipValue, label: o.name })),
  ];
}

/** The query without the filter a chip stands for; back to page 1. */
export function withoutChip(q: ListingQuery, value: string): ListingQuery {
  const [kind, id] = value.split(':');
  return {
    cuisines: kind === 'cuisine' ? q.cuisines.filter((v) => v !== id) : q.cuisines,
    regions: kind === 'region' ? q.regions.filter((v) => v !== id) : q.regions,
    areas: kind === 'area' ? q.areas.filter((v) => v !== id) : q.areas,
    occasion: kind === 'occasion' ? undefined : q.occasion,
    page: 1,
  };
}

export function removeFilterLabel(label: string): string {
  return $localize`:@@filters.remove:Remove ${label}:value: filter`;
}

/** What the no-results state suggests (L2-001.4). */
export function noResultsText(view: ListingPageView, q: ListingQuery): string {
  const chips = activeChips(view, q);
  const cuisines = chips.filter((c) => c.value.startsWith('cuisine:'));
  const places = chips.filter((c) => c.value.startsWith('region:') || c.value.startsWith('area:'));
  if (chips.length === 2 && cuisines.length === 1 && places.length === 1) {
    return $localize`:@@listing.noResults.one:No ${cuisines[0].label}:cuisine: caterers list ${places[0].label}:place: yet. Try a nearby area, or clear the filters.`;
  }
  return $localize`:@@listing.noResults.many:Try removing a filter, or clear the filters.`;
}

/** " caterers" after a count, read but not shown (filter-list D-2). */
export function caterersNoun(n: number): string {
  return n === 1 ? $localize`:@@filters.caterer: caterer` : $localize`:@@filters.caterers: caterers`;
}

export function moreCuisines(hidden: number): string {
  return $localize`:@@filters.moreCuisines:More cuisines (${hidden}:count:)`;
}
