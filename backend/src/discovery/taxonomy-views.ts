import type { Request, Reply } from '../http/router.ts';
import { notFound, ok } from '../http/problems.ts';
import type { OccasionTile } from '@contract/occasion-tile.ts';
import type { ServiceArea } from '@contract/service-area.ts';
import { caterers } from '../caterers/model.ts';
import { ALL_AREAS, allCuisines, areaName, FSA_TO_AREA, OCCASION_PHOTOS, OCCASIONS } from './taxonomy.ts';
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

export async function activeCuisines(req: Request): Promise<Reply> {
  return ok((await allCuisines(req.tx)).filter((c) => !c.retired).map(({ id, name }) => ({ id, name })));
}

/** Resolves a forward sortation area; only the FSA ever reaches the server (L2-012.6). */
export async function forwardSortationArea(req: Request): Promise<Reply> {
  const id = FSA_TO_AREA[req.params['fsa'].toUpperCase()];
  return id ? ok({ id, name: areaName(id) }) : notFound();
}
