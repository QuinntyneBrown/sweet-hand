import type { Request, Reply } from '../http/router.ts';
import { notFound, ok } from '../http/problems.ts';
import type { Transaction } from '../platform/database.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import { ratingSummary } from '../reviews/rating.ts';
import type { CatererGoneView } from '@contract/caterer-gone-view.ts';
import type { CatererPageView } from '@contract/caterer-page-view.ts';
import type { DietaryTag } from '@contract/dietary-tag.ts';
import { allCuisines, areaName, occasionName, REGION_LIST } from './taxonomy.ts';
import { catererPhotoView } from './photos.ts';

/** The allow-listed public view (L2-014): only approved display fields, never contact details or the certificate. */
export async function catererPageView(tx: Transaction, c: Caterer): Promise<CatererPageView> {
  const names = new Map((await allCuisines(tx)).map((x) => [x.id, x.name]));
  return {
    slug: c.slug,
    name: c.name,
    cuisines: c.cuisines.map((id) => names.get(id) ?? id),
    description: c.description,
    minGuests: c.minGuests,
    maxGuests: c.maxGuests,
    occasions: c.occasions.map(occasionName),
    photos: c.photos.map(catererPhotoView),
    dishes: c.dishes.map((d) => ({ name: d.name, description: d.description ?? null, price: d.price ?? null, tags: d.tags as DietaryTag[] })),
    regions: REGION_LIST.map((rg) => ({ name: rg.name, areas: c.areas.filter((id) => rg.areas.some((a) => a.id === id)).map(areaName) })).filter(
      (rg) => rg.areas.length > 0,
    ),
    rating: await ratingSummary(tx, c.id),
  };
}

/** GET /api/public/caterers/:slug, anonymous by explicit choice (L2-013). */
export async function catererPage(req: Request): Promise<Reply> {
  const slug = req.params['slug'];
  const all = await caterers(req.tx).all();
  const renamed = all.find((c) => c.previousSlugs.includes(slug) && c.status === 'Published');
  if (renamed) return { status: 301, headers: { location: `/api/public/caterers/${renamed.slug}` } };
  const c = all.find((x) => x.slug === slug);
  if (c?.status === 'Removed') {
    const gone: CatererGoneView = { title: 'Gone', publishedCount: all.filter((x) => x.status === 'Published').length };
    return { status: 410, body: gone };
  }
  // One identical body for every other non-published status and unknown slugs (L2-014.2).
  if (!c || c.status !== 'Published') return notFound();
  return ok(await catererPageView(req.tx, c));
}
