import type { ParamMap, Params } from '@angular/router';
import type { ListingPageView, ListingQuery } from '../../../core/api/discovery.models';

/**
 * The listing state kept in the URL query string (L2-003): `cuisine`, `region`
 * and `area` repeat, `occasion` and `page` appear once. Values the server does
 * not know are ignored by it (L2-003.3).
 */
export function readListingQuery(params: ParamMap): ListingQuery {
  const page = Number(params.get('page') ?? '1');
  return {
    cuisines: params.getAll('cuisine'),
    regions: params.getAll('region'),
    areas: params.getAll('area'),
    occasion: params.get('occasion') ?? undefined,
    page: Number.isInteger(page) && page > 0 ? page : 1,
  };
}

export function toQueryParams(q: ListingQuery): Params {
  return {
    cuisine: q.cuisines.length ? q.cuisines : null,
    region: q.regions.length ? q.regions : null,
    area: q.areas.length ? q.areas : null,
    occasion: q.occasion ?? null,
    page: q.page > 1 ? q.page : null,
  };
}

export function activeFilterCount(q: ListingQuery): number {
  return q.cuisines.length + q.regions.length + q.areas.length + (q.occasion ? 1 : 0);
}

/** The query with only the values the listing knows, so unknown ones drop out of new URLs (L2-003.3). */
export function knownQuery(q: ListingQuery, view: ListingPageView | undefined): ListingQuery {
  if (!view) return q;
  const areaIds = view.regions.flatMap((r) => r.areas.map((a) => a.id));
  return {
    cuisines: q.cuisines.filter((id) => view.cuisines.some((c) => c.id === id)),
    regions: q.regions.filter((id) => view.regions.some((r) => r.id === id)),
    areas: q.areas.filter((id) => areaIds.includes(id)),
    occasion: view.occasions.some((o) => o.id === q.occasion) ? q.occasion : undefined,
    page: q.page,
  };
}

/** Whether two queries select the same caterers, whatever the order of values and the page. */
export function sameFilters(a: ListingQuery, b: ListingQuery): boolean {
  const same = (x: string[], y: string[]) => x.length === y.length && x.every((v) => y.includes(v));
  return same(a.cuisines, b.cuisines) && same(a.regions, b.regions) && same(a.areas, b.areas) && (a.occasion ?? null) === (b.occasion ?? null);
}

const toggled =(list: string[], value: string, on: boolean) => (on ? [...new Set([...list, value])] : list.filter((v) => v !== value));

/** A filter change always goes back to page 1. */
export function withCuisine(q: ListingQuery, id: string, on: boolean): ListingQuery {
  return { ...q, cuisines: toggled(q.cuisines, id, on), page: 1 };
}

export function withRegion(q: ListingQuery, id: string, on: boolean): ListingQuery {
  return { ...q, regions: toggled(q.regions, id, on), page: 1 };
}

export function withArea(q: ListingQuery, id: string, on: boolean): ListingQuery {
  return { ...q, areas: toggled(q.areas, id, on), page: 1 };
}

export function withoutCuisines(q: ListingQuery): ListingQuery {
  return { ...q, cuisines: [], page: 1 };
}
