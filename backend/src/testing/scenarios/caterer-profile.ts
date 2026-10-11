import { caterers, slugify, type Caterer, type Dish } from '../../caterers/model.ts';
import { users } from '../../identity/model.ts';
import { allCuisines, cuisines } from '../../discovery/taxonomy.ts';
import { seedUser } from '../../seed/users.ts';
import type { Scenarios } from '../scenario.ts';

/** Beverley Campbell's Auntie Bev's Kitchen at each step of setup (docs/mocks/pages/dashboard). */
type BevState = 'new' | 'draft' | 'ready' | 'pending' | 'changes-requested' | 'published';

const BEV_ID = 'cat-bev';
const BEV_USER = 'user-beverley';
const BEV_DESCRIPTION =
  'Beverley Campbell has cooked Sunday dinner for half of her Oshawa street for twenty years: curry goat, rice and peas, escovitch fish and festival, made the way her mother made them in Linstead.\n\nShe caters christenings, nine-nights and family reunions of up to 150 people across Durham.';
const BEV_PHOTOS: [string, string][] = [
  ['green-fig-catering', 'Curry goat and rice in my steel pot'],
  ['brown-stew-kitchen', 'Brown stew chicken, seen from above'],
  ['bammy-bros', 'Curry chicken with white rice'],
  ['fungee-and-pepperpot', 'Escovitch chicken with peppers over rice'],
  ['lambie-lane', 'Christmas black cake with a raspberry on top'],
];
const BEV_DISHES: Omit<Dish, 'id'>[] = [
  { name: 'Curry goat', description: 'Bone-in, with potato and pimento.', tags: ['gluten-free', 'halal', 'spicy'], price: 'From $19 per person' },
  { name: 'Brown stew chicken', tags: ['gluten-free'], price: 'From $15 per person' },
  { name: 'Rice and peas', description: 'Kidney beans, coconut milk, thyme.', tags: ['vegan', 'gluten-free'] },
  { name: 'Festival', tags: ['vegetarian'], price: '$2 each' },
  { name: 'Escovitch fish', description: 'Fried snapper under pickled peppers and onion.', tags: ['gluten-free', 'dairy-free', 'spicy'] },
];

function bevCaterer(state: BevState, now: Date): Caterer {
  const fresh = state === 'new';
  const complete = !fresh && state !== 'draft';
  const caterer: Caterer = {
    id: BEV_ID,
    slug: 'auntie-bevs-kitchen',
    name: 'Auntie Bev’s Kitchen',
    status: 'Draft',
    ownerUserId: BEV_USER,
    cuisines: fresh ? [] : ['jamaican'],
    areas: fresh ? [] : ['oshawa', 'ajax', 'clarington', 'pickering', 'whitby'],
    minGuests: fresh ? 0 : 10,
    maxGuests: fresh ? 0 : 150,
    occasions: fresh ? [] : ['birthdays', 'funerals-and-repasts', 'religious-and-cultural-celebrations', 'family-gatherings'],
    description: fresh ? '' : BEV_DESCRIPTION,
    photos: (fresh ? [] : BEV_PHOTOS.slice(0, complete ? 5 : 2)).map(([file, caption], i) => ({ id: `bev-photo-${i + 1}`, file: `${file}.jpg`, caption })),
    dishes: fresh ? [] : BEV_DISHES.map((d, i) => ({ ...d, id: `bev-dish-${i + 1}` })),
    ...(complete
      ? { certificate: { holder: 'Beverley Campbell', issuer: 'Durham Region Health Department', number: 'FH-2025-204517', expires: '2030-01-22', savedAt: '2026-10-05T14:00:00Z' } }
      : {}),
    createdAt: '2026-10-01T14:00:00Z',
    previousSlugs: [],
  };
  if (state === 'pending') Object.assign(caterer, { status: 'Pending review', statusChangedAt: '2026-10-07T15:00:00Z' });
  if (state === 'changes-requested') {
    Object.assign(caterer, {
      status: 'Changes requested',
      statusChangedAt: '2026-10-09T15:00:00Z',
      statusReason: 'Photos 2 and 5 look like stock images. Please upload photos of your own food.',
      attention: [{ key: 'photos', note: 'Replace photos 2 and 5' }],
    });
  }
  if (state === 'published') Object.assign(caterer, { status: 'Published', statusChangedAt: now.toISOString(), publishedAt: now.toISOString() });
  return caterer;
}

/** Caterer-profile scenarios the dashboard specs ask for (ADR 0008); names and arguments match the fake backend's. */
export const catererProfileScenarios: Scenarios = {
  /** Beverley's account (fictional) and her profile at the given step of setup. */
  beverley: async ({ tx, now }, { state }: { state: BevState }) => {
    const user = await seedUser({
      id: BEV_USER,
      role: 'Caterer',
      displayName: 'Beverley Campbell',
      email: 'beverley@auntiebevs.example',
      phone: '+1 905 555 0164',
      catererId: BEV_ID,
      createdAt: '2026-10-01T14:00:00Z',
      passwordChangedAt: '2026-10-01T14:00:00Z',
    });
    await users(tx).put({ ...user, emailVerified: state !== 'new', acceptedPrivacyAt: '2026-10-01T14:00:00Z' });
    await caterers(tx).put(bevCaterer(state, now));
  },

  /** Sharon Best's Flying Fish Kitchen, suspended on Thu 8 Oct for its expired certificate (L2-044.4). */
  'flying-fish-suspended': async ({ tx }) => {
    const c = await caterers(tx).findOne({ slug: 'flying-fish-kitchen' });
    if (!c) return;
    await caterers(tx).put({
      ...c,
      status: 'Suspended',
      statusChangedAt: '2026-10-08T14:00:00Z',
      statusReason: 'Your food handler certificate expired on 30 Sep 2026. Upload a current certificate and we’ll review it within 3 business days.',
      cuisines: ['barbadian-bajan'],
      areas: ['oshawa', 'ajax', 'whitby', 'clarington'],
      minGuests: 15,
      maxGuests: 200,
      description:
        'Sharon Best brings Bridgetown to Durham: flying fish and cou-cou, macaroni pie, fish cakes with Bajan pepper sauce, and conkies every November.\n\nSmall weddings, church anniversaries and office lunches from 15 to 200 guests.',
    });
  },

  /** Kendra asked at 6:20 p.m. on Fri 9 Oct to rename Pelau House (L2-044.2); it waits in the operator review queue. */
  'pelau-name-change-pending': async ({ tx }) => {
    const c = await caterers(tx).findOne({ slug: 'pelau-house' });
    if (c) await caterers(tx).put({ ...c, pendingName: 'Pelau House by Kendra', pendingNameAt: '2026-10-09T22:20:00.000Z' });
  },

  /** The image service is down: uploads are kept and stay "Processing" (L2-091.2). */
  'image-processing-down': ({ env }) => {
    env.images.available = false;
  },

  /** The image service is back: processing photos finish on the next read. */
  'image-processing-recovers': ({ env }) => {
    env.images.available = true;
  },

  /** An operator added a cuisine to the list (L2-007.4). */
  'cuisine-added': async ({ tx, now }, { name }: { name: string }) => {
    const all = await allCuisines(tx);
    await cuisines(tx).put({ id: slugify(name), name, retired: false, addedAt: now.toISOString(), position: Math.max(-1, ...all.map((c) => c.position)) + 1 });
  },
};
