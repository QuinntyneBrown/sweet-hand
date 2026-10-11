import { caterers, slugify, type Caterer, type ProfileStatus } from '../../caterers/model.ts';
import { reviews } from '../../reviews/model.ts';
import { allCuisines, ALL_AREAS, areaName, OCCASIONS } from '../../discovery/taxonomy.ts';
import type { Scenarios } from '../scenario.ts';

/** The edge caterers of docs/mocks/pages/caterers/edge.html: long, accented and one-letter names; two photos that fail. */
const EDGE: [string, string, string, string | null][] = [
  ['The Original Auntie Philomena’s Roti, Doubles & Pholourie Kitchen', 'Trinidadian & Tobagonian', 'Whitchurch-Stouffville', 'pelau-house'],
  ['Ça Gou Kreyòl Kitchen', 'Haitian', 'Richmond Hill', 'ti-kay'],
  ['Salt Pond Provisions', 'Kittitian & Nevisian', 'East Gwillimbury', null],
  ['Dominique’s', 'Dominican (Dominican Republic)', 'Halton Hills', 'sorrel-and-spice'],
  ['O', 'Guyanese', 'York', 'cook-up'],
  ['Mangú & Mofongo Co.', 'Puerto Rican', 'Clarington', null],
];

function fictionalCaterer(template: Caterer, id: string, name: string, cuisine: string, area: string, photo: string | null): Caterer {
  const slug = slugify(name);
  return {
    ...template,
    id,
    slug,
    name,
    status: 'Published',
    ownerUserId: undefined,
    cuisines: [slugify(cuisine)],
    areas: [slugify(area)],
    // A file the media store does not have stands for a photo that fails to load (L2-006.5).
    photos: [{ id: `${slug}-photo-1`, file: photo ? `${photo}.jpg` : 'missing-photo.jpg', caption: `Food from ${name}` }],
    previousSlugs: [],
    certificate: undefined,
    businessEmail: undefined,
    businessPhone: undefined,
  };
}

export const discoveryScenarios: Scenarios = {
  'no-published-caterers': async ({ tx }) => {
    for (const c of await caterers(tx).find({ status: 'Published' })) await caterers(tx).put({ ...c, status: 'Draft' });
  },
  'set-caterer-status': async ({ tx }, { slug, status }: { slug: string; status: ProfileStatus }) => {
    const c = await caterers(tx).findOne({ slug });
    if (c) await caterers(tx).put({ ...c, status });
  },
  /** An approved business name change: new slug from the name, the old one redirects (L2-018.3). */
  'rename-caterer': async ({ tx }, { slug, name }: { slug: string; name: string }) => {
    const c = await caterers(tx).findOne({ slug });
    if (c) await caterers(tx).put({ ...c, name, slug: slugify(name), previousSlugs: [...c.previousSlugs, c.slug] });
  },
  /** A name change waiting for approval: the public page keeps the approved name (L2-014.3). */
  'request-name-change': async ({ tx }, { slug, name }: { slug: string; name: string }) => {
    const c = await caterers(tx).findOne({ slug });
    if (c) await caterers(tx).put({ ...c, pendingName: name });
  },
  /** The edge-case caterer of docs/mocks/pages/caterer/edge.html; returns its slug. */
  'add-edge-caterer': async ({ tx }) => {
    const name = 'Auntie Euphemia’s Kittitian & Nevisian Sunday Kitchen and Celebration Catering';
    const slug = slugify(name);
    const id = 'cat-950';
    await caterers(tx).put({
      id,
      slug,
      name,
      status: 'Published',
      cuisines: ['kittitian-and-nevisian', 'antiguan-and-barbudan', 'dominican-dominica', 'vincentian', 'pan-caribbean'],
      areas: ALL_AREAS.map((a) => a.id),
      minGuests: 50,
      maxGuests: 50,
      occasions: OCCASIONS.map((o) => o.id),
      description:
        'We write our own description. Some of us paste in things like <b>Best in town</b> or a link to www.example.com — it always shows exactly as typed, never as formatting or a live link.\n\nExactly fifty guests, every time, because that is how many plates Auntie owns.',
      photos: [
        ['souse-and-sorrel.jpg', 'Goat water stew with dumplings in a steel pot'],
        ['no-such-photo.jpg', 'Stewed saltfish with peppers over rice'],
        ['sea-moss-and-spice.jpg', 'Coconut dumplings and spiced rice'],
        ['lambie-lane.jpg', 'Rum cake topped with a single raspberry'],
      ].map(([file, caption], j) => ({ id: `${slug}-photo-${j + 1}`, file, caption })),
      dishes: [
        { id: `${slug}-dish-1`, name: 'Goat water', tags: [] },
        {
          id: `${slug}-dish-2`,
          name: 'Stewed saltfish, spicy plantain, coconut dumplings and seasoned breadfruit platter',
          description: 'A whole Saturday of cooking on one platter, enough for the full fifty with seconds for the uncles who say they are not hungry and then are.',
          tags: ['spicy', 'contains-shellfish', 'halal', 'dairy-free', 'gluten-free', 'vegan', 'vegetarian'],
          price: 'From $1,250 per 50 guests',
        },
        { id: `${slug}-dish-3`, name: 'Conkies', tags: [] },
      ],
      createdAt: '2026-09-01T13:00:00Z',
      publishedAt: '2026-09-08T13:00:00Z',
      previousSlugs: [],
    });
    await reviews(tx).put({
      id: 'review-anne-marie-edge',
      catererId: id,
      authorName: 'Anne-Marie Francis',
      rating: 3,
      text: 'Food was good. Someone typed <script>alert(1)</script> here to test us; it shows as plain text and nothing runs. Same for https://example.com — not a link.',
      eventDate: '2026-09-12',
      createdAt: '2026-09-19T14:00:00.000Z',
      status: 'Published',
    });
    return { slug };
  },
  /**
   * 1,284 published caterers, the edge caterers first (caterers edge mock).
   * Ids sort the edge caterers before the catalog and the fillers after it.
   */
  'large-catalog': async ({ tx }) => {
    const all = (await caterers(tx).all()).filter((c) => /^cat-\d{3}$/.test(c.id)).sort((a, b) => (a.id < b.id ? -1 : 1));
    const names = new Map((await allCuisines(tx)).map((c) => [c.id, c.name]));
    const template = all[1];
    const published = (await caterers(tx).find({ status: 'Published' })).length;
    for (const [i, [name, cuisine, area, photo]] of EDGE.entries()) await caterers(tx).put(fictionalCaterer(template, `cat-000-x${i + 1}`, name, cuisine, area, photo));
    const fillers = 1284 - published - EDGE.length;
    for (let i = 0; i < fillers; i++) {
      const like = all[i % 36];
      const n = String(i + 1).padStart(4, '0');
      await caterers(tx).put(
        fictionalCaterer(like, `cat-z${n}`, `Sample Kitchen ${i + 1}`, names.get(like.cuisines[0]) ?? like.cuisines[0], areaName(like.areas[0]), like.photos[0].file.replace('.jpg', '')),
      );
    }
  },
};
