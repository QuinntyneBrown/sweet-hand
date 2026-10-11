import type { Reply, Request } from '../http/endpoint.ts';
import { ok } from '../http/problems.ts';
import { allCuisines, OCCASIONS, REGION_LIST } from '../discovery/taxonomy.ts';
import type { ReferenceDataView } from '@contract/reference-data-view.ts';
import { loadOwn, type Own } from './own.ts';
import { profileView } from './view.ts';

/** The owner's profile view of `own`, as every editing endpoint answers. */
export const ownProfileReply = (req: Request, own: Own, status = 200): Reply => ok(profileView(own.caterer, own.user, req.now), status);

export async function ownProfile(req: Request): Promise<Reply> {
  return ownProfileReply(req, await loadOwn(req));
}

/** Active cuisines alphabetically plus retired ones the caterer still holds, the regions and the occasions (L2-007, L2-010, L2-021). */
export async function referenceData(req: Request): Promise<Reply> {
  const { caterer } = await loadOwn(req);
  const view: ReferenceDataView = {
    cuisines: (await allCuisines(req.tx))
      .filter((x) => !x.retired || caterer.cuisines.includes(x.id))
      .map(({ id, name }) => ({ id, name }))
      .sort((a, b) => a.name.localeCompare(b.name, 'en-CA')),
    regions: REGION_LIST.map((rg) => ({ id: rg.id, name: rg.name, areas: rg.areas.map((a) => ({ ...a })) })),
    occasions: OCCASIONS.map((o) => ({ ...o })),
  };
  return ok(view);
}
