/** Fixed lists from L2-007 (cuisines), L2-010 (service areas), L2-021 (occasions) and L2-017 (dietary tags). */

import type { Document, Transaction } from '../platform/database.ts';
import { slugify } from '../caterers/model.ts';

export interface Cuisine extends Document {
  name: string;
  retired: boolean;
  addedAt: string;
  /** Display order: the seeded list, then additions in the order they were made. */
  position: number;
  /** The operator (user id) who added it after launch (L2-007.4). */
  addedBy?: string;
  /** When an operator retired it (L2-007.5). */
  retiredAt?: string;
}

export const CUISINE_NAMES = [
  'Antiguan & Barbudan',
  'Bahamian',
  'Barbadian (Bajan)',
  'Belizean',
  'Cuban',
  'Dominican (Dominica)',
  'Dominican (Dominican Republic)',
  'Grenadian',
  'Guyanese',
  'Haitian',
  'Jamaican',
  'Kittitian & Nevisian',
  'Puerto Rican',
  'St. Lucian',
  'Surinamese',
  'Trinidadian & Tobagonian',
  'Vincentian',
  'Pan-Caribbean',
];

export const seedCuisines = (): Cuisine[] =>
  CUISINE_NAMES.map((name, position) => ({ id: slugify(name), name, retired: false, addedAt: '2026-08-03T13:00:00Z', position }));

/** The fixed service-area model of L2-010: regions and the areas in each. */
export interface Region {
  id: string;
  name: string;
  areas: { id: string; name: string }[];
}

const REGIONS: [string, string[]][] = [
  ['City of Toronto', ['Downtown Toronto', 'East York', 'Etobicoke', 'North York', 'Scarborough', 'York']],
  ['Peel', ['Brampton', 'Caledon', 'Mississauga']],
  [
    'York Region',
    ['Aurora', 'East Gwillimbury', 'Georgina', 'King', 'Markham', 'Newmarket', 'Richmond Hill', 'Vaughan', 'Whitchurch-Stouffville'],
  ],
  ['Durham', ['Ajax', 'Brock', 'Clarington', 'Oshawa', 'Pickering', 'Scugog', 'Uxbridge', 'Whitby']],
  ['Halton', ['Burlington', 'Halton Hills', 'Milton', 'Oakville']],
];

export const REGION_LIST: Region[] =
  REGIONS.map(([name, areas]) => ({
    id: slugify(name),
    name,
    areas: areas.map((a) => ({ id: slugify(a), name: a })),
  }));

export const OCCASIONS = [
  'Weddings',
  'Birthdays',
  'Corporate events',
  'Funerals and repasts',
  'Religious and cultural celebrations',
  'Family gatherings',
  'Private dinners',
  'Community events',
].map((name) => ({ id: slugify(name), name }));

/**
 * Occasions of catalog caterer `n` (1–60), giving the occasion counts in
 * docs/mocks/README.md: Weddings 23, Birthdays 41, Corporate events 28,
 * Funerals and repasts 17, Religious and cultural celebrations 26, Family
 * gatherings 47, Private dinners 12, Community events 19 (Pelau House, #1,
 * keeps its own list).
 */
export function seedOccasions(n: number): string[] {
  const rules: [string, boolean][] = [
    ['weddings', n <= 23],
    ['birthdays', n <= 41],
    ['corporate-events', n % 2 === 0 && n <= 54],
    ['funerals-and-repasts', n % 3 === 0 && n <= 51],
    ['religious-and-cultural-celebrations', n % 2 === 1 && n >= 3 && n <= 51],
    ['family-gatherings', n <= 43],
    ['private-dinners', n % 5 === 0],
    ['community-events', n % 3 === 1 && n >= 4 && n <= 58],
  ];
  const chosen = rules.filter(([, on]) => on).map(([id]) => id);
  return chosen.length ? chosen : ['family-gatherings'];
}

/** The photo on each occasion tile (docs/mocks/pages/occasions). */
export const OCCASION_PHOTOS: Record<string, string> = {
  weddings: 'sorrel-and-spice',
  birthdays: 'black-cake-co',
  'corporate-events': 'cou-cou',
  'funerals-and-repasts': 'sunday-pot',
  'religious-and-cultural-celebrations': 'pelau-house',
  'family-gatherings': 'cook-up',
  'private-dinners': 'ti-kay',
  'community-events': 'demerara-kitchen',
};

export const DIETARY_TAGS = [
  'Vegetarian',
  'Vegan',
  'Gluten-free',
  'Dairy-free',
  'Halal',
  'Contains nuts',
  'Contains shellfish',
  'Spicy',
].map((name) => ({ id: slugify(name), name }));

/** Forward sortation areas (first 3 characters of a postal code) and the service area each falls in (L2-012). */
export const FSA_TO_AREA: Record<string, string> = {
  M1B: 'scarborough', M1C: 'scarborough', M1E: 'scarborough', M1P: 'scarborough', M1S: 'scarborough',
  M4C: 'east-york', M4G: 'east-york',
  M5V: 'downtown-toronto', M5A: 'downtown-toronto', M5H: 'downtown-toronto',
  M2N: 'north-york', M3C: 'north-york',
  M9W: 'etobicoke', M8V: 'etobicoke',
  M6M: 'york', M6E: 'york',
  L6P: 'brampton', L6Y: 'brampton',
  L5B: 'mississauga', L4T: 'mississauga',
  L3R: 'markham', L4C: 'richmond-hill', L4K: 'vaughan',
  L1V: 'pickering', L1S: 'ajax', L1H: 'oshawa', L1N: 'whitby',
  L6J: 'oakville', L9T: 'milton', L7L: 'burlington',
};

export const cuisines = (tx: Transaction) => tx.collection<Cuisine>('cuisines');

/** Every cuisine, retired ones included, in display order. */
export async function allCuisines(tx: Transaction): Promise<Cuisine[]> {
  return (await cuisines(tx).all()).sort((a, b) => a.position - b.position);
}

export const ALL_AREAS = REGION_LIST.flatMap((rg) => rg.areas.map((a) => ({ ...a, regionId: rg.id, regionName: rg.name })));

export function areaName(id: string): string {
  return ALL_AREAS.find((a) => a.id === id)?.name ?? id;
}

export function areasOfRegion(regionId: string): string[] {
  return REGION_LIST.find((r) => r.id === regionId)?.areas.map((a) => a.id) ?? [];
}

export function occasionName(id: string): string {
  return OCCASIONS.find((o) => o.id === id)?.name ?? id;
}
