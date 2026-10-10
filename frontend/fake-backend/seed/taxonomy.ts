/** Fixed lists from L2-007 (cuisines), L2-010 (service areas), L2-021 (occasions) and L2-017 (dietary tags). */

export const slugify = (s: string): string =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

export interface Cuisine {
  id: string;
  name: string;
  retired: boolean;
  addedAt: string;
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
  CUISINE_NAMES.map((name) => ({ id: slugify(name), name, retired: false, addedAt: '2026-08-03T13:00:00Z' }));

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

export const seedRegions = (): Region[] =>
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

/** Forward sortation areas (first 3 characters of a postal code) the fake can resolve. */
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
