import { anonymous, type Area, type Request, type Reply } from '../http/router.ts';
import { notFound, ok } from '../http/problems.ts';
import type { OccasionTile } from '@contract/occasion-tile.ts';
import type { ServiceArea } from '@contract/service-area.ts';
import { caterers } from '../caterers/model.ts';
import { ALL_AREAS, allCuisines, areaName, FSA_TO_AREA, OCCASION_PHOTOS, OCCASIONS } from './taxonomy.ts';
import { listCaterers } from './listing.ts';
import { catererPage } from './caterer-page.ts';
import { listNotices } from './notices.ts';
import { photoView } from './photos.ts';

async function serviceAreas(): Promise<Reply> {
  return ok(ALL_AREAS.map(({ id, name, regionId, regionName }) => ({ id, name, regionId, regionName }) satisfies ServiceArea));
}

/** The eight occasions with how many published caterers take each on (L2-021). */
async function occasions(req: Request): Promise<Reply> {
  const published = await caterers(req.tx).find({ status: 'Published' });
  const tiles: OccasionTile[] = OCCASIONS.map((o) => ({
    ...o,
    count: published.filter((c) => c.occasions.includes(o.id)).length,
    photo: photoView({ file: `${OCCASION_PHOTOS[o.id]}.jpg`, caption: '' }),
  }));
  return ok(tiles);
}

async function activeCuisines(req: Request): Promise<Reply> {
  return ok((await allCuisines(req.tx)).filter((c) => !c.retired).map(({ id, name }) => ({ id, name })));
}

/** Resolves a forward sortation area; only the FSA ever reaches the server (L2-012.6). */
async function forwardSortationArea(req: Request): Promise<Reply> {
  const id = FSA_TO_AREA[req.params['fsa'].toUpperCase()];
  return id ? ok({ id, name: areaName(id) }) : notFound();
}

/** Public browsing, anonymous by explicit choice (L2-013). */
export const discoveryArea: Area = (r) => {
  r.get('/api/public/caterers', anonymous, listCaterers);
  r.get('/api/public/caterers/:slug', anonymous, catererPage);
  r.get('/api/public/service-areas', anonymous, serviceAreas);
  r.get('/api/public/occasions', anonymous, occasions);
  r.get('/api/public/cuisines', anonymous, activeCuisines);
  r.get('/api/public/fsa/:fsa', anonymous, forwardSortationArea);
  r.get('/api/public/notices', anonymous, listNotices);
};
