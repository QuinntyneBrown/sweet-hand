import type { Request, Reply } from '../http/endpoint.ts';
import { ok, problem } from '../http/problems.ts';
import { areaOfFsa, invalidPostalCode, isFsa, OUTSIDE_SERVICE_AREA } from './postal-code.ts';
import type { OccasionTile } from '@contract/occasion-tile.ts';
import type { ServiceArea } from '@contract/service-area.ts';
import { caterers } from '../caterers/model.ts';
import { ALL_AREAS, allCuisines, areaName, OCCASION_PHOTOS, OCCASIONS } from './taxonomy.ts';
import { photoView } from './photos.ts';

/** Every service area with its region (L2-010). */
export async function serviceAreas(): Promise<Reply> {
  return ok(ALL_AREAS.map(({ id, name, regionId, regionName }) => ({ id, name, regionId, regionName }) satisfies ServiceArea));
}

/** The eight occasions with how many published caterers take each on (L2-021). */
export async function occasions(req: Request): Promise<Reply> {
  const published = await caterers(req.tx).find({ status: 'Published' });
  const tiles: OccasionTile[] = OCCASIONS.map((o) => ({
    ...o,
    count: published.filter((c) => c.occasions.includes(o.id)).length,
    photo: photoView({ file: `${OCCASION_PHOTOS[o.id]}.jpg`, caption: '' }),
  }));
  return ok(tiles);
}

/** The active cuisines, A to Z (L2-007.1). */
export async function activeCuisines(req: Request): Promise<Reply> {
  const active = (await allCuisines(req.tx)).filter((c) => !c.retired).sort((a, b) => a.name.localeCompare(b.name, 'en-CA'));
  return ok(active.map(({ id, name }) => ({ id, name })));
}

/** Resolves a forward sortation area; only the FSA ever reaches the server (L2-012.6). */
export async function forwardSortationArea(req: Request): Promise<Reply> {
  const fsa = req.params['fsa'];
  if (!isFsa(fsa)) return invalidPostalCode();
  const id = areaOfFsa(fsa);
  // 404, not 422: the frontend's search reads 404 as "outside the GTA" (L2-012.5).
  return id ? ok({ id, name: areaName(id) }) : problem(404, OUTSIDE_SERVICE_AREA, { type: 'outside-service-area' });
}
