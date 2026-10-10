import type { ParamMap, Params } from '@angular/router';
import type { ListingQuery } from '../../../core/api/discovery.models';

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
