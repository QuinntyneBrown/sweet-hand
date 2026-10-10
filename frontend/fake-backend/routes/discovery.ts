import type { Router } from '../lib/router.ts';
import { ok, notFound } from '../lib/http.ts';
import { torontoDate, type Store } from '../lib/store.ts';
import { photoView } from '../lib/views.ts';
import { FSA_TO_AREA, OCCASION_PHOTOS, OCCASIONS, slugify } from '../seed/taxonomy.ts';
import type { Caterer } from '../seed/caterers.ts';
import type { ListingPageView, OccasionTile, ServiceArea } from '../../projects/web/src/app/core/api/discovery.models.ts';

const PAGE_SIZE = 24;
/** On the mocks' "today" the listing keeps catalog order so tests read like the mocks. */
const CATALOG_DAY = '2026-10-10';

function hash(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) h = Math.imul(h ^ s.charCodeAt(i), 16777619);
  return h >>> 0;
}

/** Daily seeded order (L2-002.3, L2-002.4). */
function dailyOrder(store: Store, list: Caterer[]): Caterer[] {
  const day = torontoDate(store.now);
  if (day === CATALOG_DAY) return list;
  return [...list].sort((a, b) => hash(day + a.id) - hash(day + b.id));
}

function areasOfRegion(store: Store, regionId: string): string[] {
  return store.regions.find((r) => r.id === regionId)?.areas.map((a) => a.id) ?? [];
}

export function areaName(store: Store, id: string): string {
  for (const r of store.regions) for (const a of r.areas) if (a.id === id) return a.name;
  return id;
}

export function cuisineName(store: Store, id: string): string {
  return store.cuisines.find((c) => c.id === id)?.name ?? id;
}

interface Filter {
  cuisines: string[];
  places: string[];
  occasion?: string;
}

function matchesFilter(c: Caterer, f: Filter): boolean {
  if (f.cuisines.length && !c.cuisines.some((x) => f.cuisines.includes(x))) return false;
  if (f.places.length && !c.areas.some((x) => f.places.includes(x))) return false;
  if (f.occasion && !c.occasions.includes(f.occasion)) return false;
  return true;
}

export function registerDiscovery(r: Router<Store>): void {
  r.get('/api/public/caterers', (ctx) => {
    const store = ctx.store;
    const published = store.caterers.filter((c) => c.status === 'Published');
    const activeCuisines = store.cuisines.filter((c) => !c.retired);
    // Unknown values are ignored, not rejected (L2-003.3).
    const cuisines = ctx.query.getAll('cuisine').filter((id) => activeCuisines.some((c) => c.id === id));
    const regions = ctx.query.getAll('region').filter((id) => store.regions.some((rg) => rg.id === id));
    const areas = ctx.query.getAll('area').filter((id) => store.regions.some((rg) => rg.areas.some((a) => a.id === id)));
    const occasionParam = ctx.query.get('occasion') ?? undefined;
    const occasion = OCCASIONS.some((o) => o.id === occasionParam) ? occasionParam : undefined;
    const places = [...new Set([...areas, ...regions.flatMap((id) => areasOfRegion(store, id))])];

    const filter: Filter = { cuisines, places, occasion };
    const matching = dailyOrder(store, published.filter((c) => matchesFilter(c, filter)));
    const pageCount = Math.max(1, Math.ceil(matching.length / PAGE_SIZE));
    const requested = Number(ctx.query.get('page') ?? '1');
    const page = Number.isInteger(requested) && requested >= 1 && requested <= pageCount ? requested : 1;

    const count = (f: Filter) => published.filter((c) => matchesFilter(c, f)).length;
    const view: ListingPageView = {
      items: matching.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE).map((c) => ({
        slug: c.slug,
        name: c.name,
        primaryCuisine: cuisineName(store, c.cuisines[0]),
        primaryArea: areaName(store, c.areas[0]),
        cover: photoView(c.photos[0]),
      })),
      total: matching.length,
      page,
      pageSize: PAGE_SIZE,
      pageCount,
      // Ordered by how many published caterers offer each cuisine overall, so the
      // options keep their places when the other filters recount them (filter-list CRD).
      cuisines: activeCuisines
        .map((c) => ({ id: c.id, name: c.name, count: count({ ...filter, cuisines: [c.id] }), overall: count({ cuisines: [c.id], places: [] }) }))
        .sort((a, b) => b.overall - a.overall || a.name.localeCompare(b.name))
        .map(({ id, name, count }) => ({ id, name, count })),
      regions: store.regions.map((rg) => ({
        id: rg.id,
        name: rg.name,
        count: count({ ...filter, places: rg.areas.map((a) => a.id) }),
        areas: rg.areas.map((a) => ({ id: a.id, name: a.name, count: count({ ...filter, places: [a.id] }) })),
      })),
      occasions: OCCASIONS.map((o) => ({ ...o, count: count({ ...filter, occasion: o.id }) })),
    };
    return ok(view);
  });

  r.get('/api/public/service-areas', (ctx) => {
    const list: ServiceArea[] = ctx.store.regions.flatMap((rg) =>
      rg.areas.map((a) => ({ id: a.id, name: a.name, regionId: rg.id, regionName: rg.name })),
    );
    return ok(list);
  });

  /** The eight occasions with how many published caterers take each on (L2-021, docs/mocks/pages/occasions). */
  r.get('/api/public/occasions', (ctx) => {
    const published = ctx.store.caterers.filter((c) => c.status === 'Published');
    const tiles: OccasionTile[] = OCCASIONS.map((o) => ({
      ...o,
      count: published.filter((c) => c.occasions.includes(o.id)).length,
      photo: photoView({ id: o.id, file: `${OCCASION_PHOTOS[o.id]}.jpg`, caption: '' }),
    }));
    return ok(tiles);
  });

  r.get('/api/public/cuisines', (ctx) => ok(ctx.store.cuisines.filter((c) => !c.retired).map(({ id, name }) => ({ id, name }))));

  /** Resolves a forward sortation area; only the FSA ever reaches the server (L2-012.6). */
  r.get('/api/public/fsa/:fsa', (ctx) => {
    const id = FSA_TO_AREA[ctx.params['fsa'].toUpperCase()];
    if (!id) return notFound();
    return ok({ id, name: areaName(ctx.store, id) });
  });
}

/** The edge caterers of docs/mocks/pages/caterers/edge.html: long, accented and one-letter names; two photos that fail. */
const EDGE: [string, string, string, string | null][] = [
  ['The Original Auntie Philomena’s Roti, Doubles & Pholourie Kitchen', 'Trinidadian & Tobagonian', 'Whitchurch-Stouffville', 'pelau-house'],
  ['Ça Gou Kreyòl Kitchen', 'Haitian', 'Richmond Hill', 'ti-kay'],
  ['Salt Pond Provisions', 'Kittitian & Nevisian', 'East Gwillimbury', null],
  ['Dominique’s', 'Dominican (Dominican Republic)', 'Halton Hills', 'sorrel-and-spice'],
  ['O', 'Guyanese', 'York', 'cook-up'],
  ['Mangú & Mofongo Co.', 'Puerto Rican', 'Clarington', null],
];

function fictionalCaterer(template: Caterer, n: number, name: string, cuisine: string, area: string, photo: string | null): Caterer {
  const slug = slugify(name.replace(/[’']/g, ''));
  return {
    ...template,
    id: `cat-x${n}`,
    slug,
    name,
    ownerUserId: undefined,
    cuisines: [slugify(cuisine)],
    areas: [slugify(area)],
    // A file the media server does not have stands for a photo that fails to load (L2-006.5).
    photos: [{ id: `${slug}-photo-1`, file: photo ? `${photo}.jpg` : 'missing-photo.jpg', caption: `Food from ${name}` }],
    previousSlugs: [],
    certificate: undefined,
    businessEmail: undefined,
    businessPhone: undefined,
  };
}

/** Named store changes for discovery tests (`backend.scenario(name, args)`). */
export const discoveryScenarios: Record<string, (store: Store, args: any) => unknown> = {
  /** 1,284 published caterers, the edge caterers first (caterers edge mock). */
  'large-catalog': (store) => {
    const template = store.caterers[1];
    const edge = EDGE.map(([name, cuisine, area, photo], i) => fictionalCaterer(template, i + 1, name, cuisine, area, photo));
    const published = store.caterers.filter((c) => c.status === 'Published').length;
    const fillers = Array.from({ length: 1284 - published - edge.length }, (_, i) => {
      const like = store.caterers[i % 36];
      return fictionalCaterer(like, 100 + i, `Sample Kitchen ${i + 1}`, cuisineName(store, like.cuisines[0]), areaName(store, like.areas[0]), like.photos[0].file.replace('.jpg', ''));
    });
    store.caterers.unshift(...edge);
    store.caterers.push(...fillers);
  },
};
