import type { Request, Reply } from '../http/endpoint.ts';
import { ok } from '../http/problems.ts';
import { caterers, type Caterer } from '../caterers/model.ts';
import type { ListingPageView } from '@contract/listing-page-view.ts';
import { allCuisines, areaName, areasOfRegion, OCCASIONS, REGION_LIST } from './taxonomy.ts';
import { photoView } from './photos.ts';

const PAGE_SIZE = 24;

/** Today's date in America/Toronto as YYYY-MM-DD. */
export function torontoDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/**
 * The pseudo-random order seeded by the Toronto date (L2-002): stable within a
 * day, different the next. Test environments may name a day that keeps
 * catalog (id) order instead.
 */
export function dailyOrder(list: Caterer[], now: Date, catalogDay?: string): Caterer[] {
  const day = torontoDate(now);
  if (day === catalogDay) return [...list].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0));
  return [...list].sort((a, b) => hash(day + a.id) - hash(day + b.id) || (a.id < b.id ? -1 : 1));
}

interface Filter {
  cuisines: string[];
  places: string[];
  occasion?: string;
}

function matches(c: Caterer, f: Filter): boolean {
  if (f.cuisines.length && !c.cuisines.some((x) => f.cuisines.includes(x))) return false;
  if (f.places.length && !c.areas.some((x) => f.places.includes(x))) return false;
  if (f.occasion && !c.occasions.includes(f.occasion)) return false;
  return true;
}

/** GET /api/public/caterers (browse-listing, filter-by-cuisine and filter-by-area designs). */
export async function listCaterers(req: Request): Promise<Reply> {
  const published = await caterers(req.tx).find({ status: 'Published' });
  const cuisineList = await allCuisines(req.tx);
  const active = cuisineList.filter((c) => !c.retired);
  const names = new Map(cuisineList.map((c) => [c.id, c.name]));
  const allAreas = new Set(REGION_LIST.flatMap((rg) => rg.areas.map((a) => a.id)));

  // Unknown values are ignored, not rejected (L2-003.3).
  const cuisinesWanted = req.query.getAll('cuisine').filter((id) => active.some((c) => c.id === id));
  const regionsWanted = req.query.getAll('region').filter((id) => REGION_LIST.some((rg) => rg.id === id));
  const areasWanted = req.query.getAll('area').filter((id) => allAreas.has(id));
  const occasionParam = req.query.get('occasion') ?? undefined;
  const occasion = OCCASIONS.some((o) => o.id === occasionParam) ? occasionParam : undefined;
  const places = [...new Set([...areasWanted, ...regionsWanted.flatMap(areasOfRegion)])];

  const filter: Filter = { cuisines: cuisinesWanted, places, occasion };
  const matching = dailyOrder(published.filter((c) => matches(c, filter)), req.now, req.env.catalogDay);
  const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
  const raw = req.query.get('page') ?? '1';
  const requested = /^\d+$/.test(raw) ? Number(raw) : NaN;
  const page = requested >= 1 && requested <= pageCount ? requested : 1;

  const count = (f: Filter) => published.filter((c) => matches(c, f)).length;
  const view: ListingPageView = {
    items: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => ({
      slug: c.slug,
      name: c.name,
      primaryCuisine: names.get(c.cuisines[0]) ?? c.cuisines[0],
      primaryArea: areaName(c.areas[0]),
      cover: photoView(c.photos[0] ?? { file: 'missing-photo.jpg', caption: c.name }),
    })),
    total: matching.length,
    page,
    pageSize: PAGE_SIZE,
    pageCount,
    // Ordered by how many published caterers offer each cuisine overall, so the
    // options keep their places when the other filters recount them (filter-list CRD).
    cuisines: active
      .map((c) => ({ id: c.id, name: c.name, count: count({ ...filter, cuisines: [c.id] }), overall: count({ cuisines: [c.id], places: [] }) }))
      .sort((a, b) => b.overall - a.overall || a.name.localeCompare(b.name))
      .map(({ id, name, count }) => ({ id, name, count })),
    regions: REGION_LIST.map((rg) => ({
      id: rg.id,
      name: rg.name,
      count: count({ ...filter, places: rg.areas.map((a) => a.id) }),
      areas: rg.areas.map((a) => ({ id: a.id, name: a.name, count: count({ ...filter, places: [a.id] }) })),
    })),
    occasions: OCCASIONS.map((o) => ({ ...o, count: count({ ...filter, occasion: o.id }) })),
  };
  return ok(view);
}
