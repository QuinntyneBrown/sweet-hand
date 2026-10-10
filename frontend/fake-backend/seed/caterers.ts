/**
 * The fictional caterers from docs/mocks/README.md ("Cast and catalog").
 * All people, businesses and addresses are fictional.
 */
import { seedOccasions, slugify } from './taxonomy.ts';

export type ProfileStatus = 'Draft' | 'Pending review' | 'Changes requested' | 'Published' | 'Suspended' | 'Removed';

export interface Photo {
  id: string;
  /** File name under docs/mocks/assets/img, served as /media/<file>. */
  file: string;
  caption: string;
  processing?: boolean;
}

export interface Dish {
  id: string;
  name: string;
  description?: string;
  tags: string[];
  price?: string;
}

export interface Certificate {
  holder: string;
  issuer: string;
  number: string;
  expires: string;
  fileName?: string;
  fileSize?: number;
}

export interface Caterer {
  id: string;
  slug: string;
  name: string;
  status: ProfileStatus;
  ownerUserId?: string;
  /** Cuisine ids; the first is primary. */
  cuisines: string[];
  /** Service area ids; the first is primary. */
  areas: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  description: string;
  photos: Photo[];
  dishes: Dish[];
  certificate?: Certificate;
  businessEmail?: string;
  businessPhone?: string;
  createdAt: string;
  publishedAt?: string;
  /** Old slugs that redirect (L2-018.3). */
  previousSlugs: string[];
  statusReason?: string;
  pendingName?: string;
}

/** [name, file, primary cuisine, primary area, caption] in catalog order (#1–36). */
const CATALOG: [string, string, string, string, string][] = [
  ['Pelau House', 'pelau-house', 'Trinidadian & Tobagonian', 'Scarborough', 'Chicken pelau in a steel pot with lime and cucumber chutney'],
  ['Cou-Cou', 'cou-cou', 'Barbadian (Bajan)', 'North York', 'Sesame chicken with sweet peppers and broccoli over brown rice'],
  ['Scotch Bonnet Social', 'scotch-bonnet-social', 'Jamaican', 'Pickering', 'Curry chicken scattered with coriander over white rice'],
  ['Ti Kay', 'ti-kay', 'Haitian', 'Etobicoke', 'Shrimp arranged in a heart on a mound of tomato rice'],
  ['Black Cake Co.', 'black-cake-co', 'Jamaican', 'Ajax', 'Dark rum cake dusted with icing sugar and topped with a raspberry'],
  ['Demerara Kitchen', 'demerara-kitchen', 'Guyanese', 'Brampton', 'Fried rice with chicken, peas, carrots and egg in a serving dish'],
  ['Pimento & Thyme', 'pimento-and-thyme', 'Jamaican', 'York', 'Chicken curry with white rice and roti'],
  ['Sugar Dumplin', 'sugar-dumplin', 'Antiguan & Barbudan', 'Vaughan', 'Sugar-dusted dumplings, one split open to show a jam centre'],
  ['Maracas Bay', 'maracas-bay', 'Trinidadian & Tobagonian', 'Mississauga', 'Chicken curry with rice and roti in a steel karahi'],
  ['Cook-Up', 'cook-up', 'Guyanese', 'Etobicoke', 'Cook-up rice with chicken, peas and carrots in a red pot'],
  ['Sorrel & Spice', 'sorrel-and-spice', 'Grenadian', 'Downtown Toronto', 'Sponge-finger cake crowned with strawberries and berries'],
  ['Sunday Pot', 'sunday-pot', 'St. Lucian', 'Mississauga', 'Spiced rice with chicken lifted from a blue cast-iron pot'],
  ['Green Fig Catering', 'green-fig-catering', 'St. Lucian', 'Pickering', 'Rice and stewed meat in a steel pot, seen from above'],
  ["Auntie Merle's Table", 'auntie-merles-table', 'Jamaican', 'Markham', 'Peppers, broccoli and chicken over rice on a white plate'],
  ['Pepperpot Parlour', 'pepperpot-parlour', 'Guyanese', 'Scarborough', 'Curry chicken with coriander over rice'],
  ['Lakay Kitchen', 'lakay-kitchen', 'Haitian', 'Richmond Hill', 'Shrimp on tomato rice'],
  ['Bajan Breeze', 'bajan-breeze', 'Barbadian (Bajan)', 'Whitby', 'Chocolate rum cake dusted with icing sugar'],
  ['Island Pot', 'island-pot', 'Jamaican', 'Scarborough', 'Chicken fried rice with mixed vegetables'],
  ['Belmopan Kitchen', 'belmopan-kitchen', 'Belizean', 'Milton', 'Stewed chicken with white rice and flatbread'],
  ['Coconut Drops Bakery', 'coconut-drops-bakery', 'Jamaican', 'Oakville', 'Sugared dumplings with a jam filling'],
  ['Roti Road', 'roti-road', 'Trinidadian & Tobagonian', 'Brampton', 'Curry chicken and rice beside folded roti'],
  ['Oil Down Kitchen', 'oil-down-kitchen', 'Grenadian', 'Ajax', 'Rice with chicken and vegetables in a red pot'],
  ['Mauby & Co.', 'mauby-and-co', 'Pan-Caribbean', 'Downtown Toronto', 'Berry-topped celebration cake tied with ribbon'],
  ['Flying Fish Kitchen', 'flying-fish-kitchen', 'Barbadian (Bajan)', 'Oshawa', 'Golden rice served from a cast-iron pot'],
  ['Brown Stew Kitchen', 'brown-stew-kitchen', 'Jamaican', 'Brampton', 'Rice and stewed meat in a steel pot'],
  ['Fungee & Pepperpot', 'fungee-and-pepperpot', 'Antiguan & Barbudan', 'Scarborough', 'Chicken and vegetables over rice'],
  ['Bammy Bros.', 'bammy-bros', 'Jamaican', 'North York', 'Curry chicken over white rice'],
  ['Garlic Pork Co.', 'garlic-pork-co', 'Guyanese', 'Markham', 'Shrimp and red rice'],
  ['Lambie Lane', 'lambie-lane', 'Grenadian', 'Etobicoke', 'Rum cake with a raspberry on top'],
  ['Griot & Pikliz', 'griot-and-pikliz', 'Haitian', 'Downtown Toronto', 'Fried rice with egg and vegetables'],
  ['Conkie Corner', 'conkie-corner', 'Barbadian (Bajan)', 'Mississauga', 'Curry with rice and flatbread'],
  ['Paramaribo Pot', 'paramaribo-pot', 'Surinamese', 'Vaughan', 'Sugared dumplings on a board'],
  ['Souse & Sorrel', 'souse-and-sorrel', 'Vincentian', 'York', 'Curry and rice in a steel pot'],
  ['Sea Moss & Spice', 'sea-moss-and-spice', 'Pan-Caribbean', 'Whitby', 'Rice with peas and chicken'],
  ['Cassava Pone Co.', 'cassava-pone-co', 'Guyanese', 'Richmond Hill', 'Strawberry and berry sponge cake'],
  ['Accra & Floats', 'accra-and-floats', 'Trinidadian & Tobagonian', 'Oakville', 'Spiced rice from a blue pot'],
];

/** The other 24 published caterers (#37–60), so the listing holds 60 with the README's cuisine counts. */
const MORE: [string, string, string][] = [
  ['Ackee Tree Catering', 'Jamaican', 'Brampton'],
  ['Festival & Fry', 'Jamaican', 'Mississauga'],
  ['Blue Mountain Kitchen', 'Jamaican', 'Downtown Toronto'],
  ['Run Down Kitchen', 'Jamaican', 'Oshawa'],
  ['Escovitch & Co.', 'Jamaican', 'Vaughan'],
  ['Bulla Bakehouse', 'Jamaican', 'York'],
  ['Buss Up Shut', 'Trinidadian & Tobagonian', 'Etobicoke'],
  ['Shado Beni Kitchen', 'Trinidadian & Tobagonian', 'North York'],
  ['Sada Roti House', 'Trinidadian & Tobagonian', 'Brampton'],
  ['Aloo Pie Co.', 'Trinidadian & Tobagonian', 'Downtown Toronto'],
  ['Chow Chow Kitchen', 'Trinidadian & Tobagonian', 'Mississauga'],
  ['Kurma & Co.', 'Trinidadian & Tobagonian', 'East York'],
  ['Sahina Kitchen', 'Trinidadian & Tobagonian', 'Ajax'],
  ['Metemgee Kitchen', 'Guyanese', 'Etobicoke'],
  ['Pine Tart Co.', 'Guyanese', 'North York'],
  ['Essequibo Eats', 'Guyanese', 'Brampton'],
  ['Berbice Pot', 'Guyanese', 'Downtown Toronto'],
  ['Pudding & Souse', 'Barbadian (Bajan)', 'East York'],
  ['Cutters Kitchen', 'Barbadian (Bajan)', 'York'],
  ['Diri Djon Djon', 'Haitian', 'North York'],
  ['Pen Patat Co.', 'Haitian', 'Mississauga'],
  ['Nutmeg & Mace', 'Grenadian', 'Downtown Toronto'],
  ['Bouyon Kitchen', 'St. Lucian', 'Etobicoke'],
  ['Kingstown Kitchen', 'Vincentian', 'Brampton'],
];

const GENERIC_DISHES: Omit<Dish, 'id'>[] = [
  { name: 'Curry chicken', description: 'Bone-in, slow-cooked with green seasoning.', tags: ['gluten-free'], price: 'From $15 per person' },
  { name: 'Rice and peas', tags: ['vegan', 'gluten-free'] },
  { name: 'Fried plantain', tags: ['vegan'] },
  { name: 'Coconut bake', tags: ['vegan'], price: '$2 each' },
];

const PELAU_DISHES: Omit<Dish, 'id'>[] = [
  { name: 'Chicken pelau', description: 'Browned in burnt sugar, cooked down with pigeon peas, rice and coconut milk.', tags: ['gluten-free', 'dairy-free'], price: 'From $16 per person' },
  { name: 'Curry goat', description: 'Slow-cooked with scotch bonnet.', tags: ['gluten-free', 'halal', 'spicy'], price: 'From $18 per person' },
  { name: 'Macaroni pie', description: 'Baked with old cheddar and a little pepper.', tags: ['vegetarian'], price: 'From $6 per person' },
  { name: 'Callaloo', description: 'Dasheen bush, okra and coconut, swizzled smooth.', tags: ['vegan', 'gluten-free'] },
  { name: 'Doubles', description: 'Bara and curry channa with tamarind and cucumber chutney.', tags: ['vegan', 'spicy'], price: '$3 each, 40 minimum' },
  { name: 'Aloo pie', tags: ['vegan'] },
  { name: 'Stewed oxtail', description: 'With butter beans.', tags: ['gluten-free'], price: 'From $22 per person' },
  { name: 'Curry channa and aloo', tags: ['vegan', 'gluten-free'] },
  { name: 'Buss up shut', description: 'Paratha roti, torn soft.', tags: ['vegan'], price: '$4 each' },
  { name: 'Pholourie', description: 'Split-pea fritters with tamarind sauce.', tags: ['vegan'] },
  { name: 'Shrimp fried rice', tags: ['contains-shellfish'] },
  { name: 'Black cake', description: 'Fruit soaked since last Christmas.', tags: ['contains-nuts'], price: '$65 per cake' },
  { name: 'Coconut bake', tags: ['vegan'], price: '$2 each' },
  { name: 'Sweet bread', tags: ['contains-nuts'] },
  { name: 'Sorrel', tags: ['vegan'], price: '$14 per litre' },
  { name: 'Saltfish buljol', tags: ['dairy-free'] },
  { name: 'Fried bake', tags: ['vegan'] },
  { name: 'Paw paw chow', tags: ['vegan', 'gluten-free', 'spicy'] },
];

const PELAU_PHOTOS: [string, string][] = [
  ['pelau-house', 'Chicken pelau in a steel pot with lime and cucumber chutney'],
  ['maracas-bay', 'Curry chicken with rice and buss up shut in a steel karahi'],
  ['sunday-pot', 'Spiced rice lifted from a blue cast-iron pot'],
  ['scotch-bonnet-social', 'Curry chicken scattered with shado beni over white rice'],
  ['black-cake-co', 'Rum-soaked black cake dusted with icing sugar'],
  ['cook-up', 'Macaroni pie and rice with peas in a red serving pot'],
];

/** Extra areas each caterer serves beyond the primary, keyed by catalog number. */
const EXTRA_AREAS: Record<number, string[]> = {
  1: ['east-york', 'north-york', 'pickering', 'ajax'],
  14: ['scarborough'],
  9: ['brampton', 'etobicoke'],
};

export function seedCaterers(): Caterer[] {
  const all: Caterer[] = [];
  const rows: [string, string, string, string, string][] = [
    ...CATALOG,
    ...MORE.map(([name, cuisine, area], i): [string, string, string, string, string] => {
      const photo = CATALOG[i % CATALOG.length];
      return [name, photo[1], cuisine, area, photo[4]];
    }),
  ];
  rows.forEach(([name, file, cuisine, area, caption], i) => {
    const n = i + 1;
    const slug = slugify(name.replace(/'/g, ''));
    const occasions = seedOccasions(n);
    const generic = GENERIC_DISHES.map((d, j) => ({ ...d, id: `${slug}-dish-${j + 1}` }));
    const photos: Photo[] = [
      [file, caption],
      [CATALOG[(i + 7) % CATALOG.length][1], CATALOG[(i + 7) % CATALOG.length][4]],
      [CATALOG[(i + 14) % CATALOG.length][1], CATALOG[(i + 14) % CATALOG.length][4]],
    ].map(([f, c], j) => ({ id: `${slug}-photo-${j + 1}`, file: `${f}.jpg`, caption: c }));
    all.push({
      id: `cat-${String(n).padStart(3, '0')}`,
      slug,
      name,
      status: 'Published',
      cuisines: [slugify(cuisine)],
      areas: [slugify(area), ...(EXTRA_AREAS[n] ?? [])],
      minGuests: 10 + (n % 4) * 5,
      maxGuests: 100 + (n % 5) * 50,
      occasions,
      description: `${name} cooks ${cuisine} food for gatherings across Toronto and the GTA.\n\nEverything is cooked the morning of your event.`,
      photos,
      dishes: generic,
      createdAt: '2026-08-03T13:00:00Z',
      publishedAt: '2026-08-10T13:00:00Z',
      previousSlugs: [],
    });
  });

  const pelau = all[0];
  Object.assign(pelau, {
    ownerUserId: 'user-kendra',
    cuisines: ['trinidadian-and-tobagonian', 'guyanese'],
    minGuests: 20,
    maxGuests: 300,
    occasions: ['weddings', 'birthdays', 'family-gatherings', 'corporate-events', 'religious-and-cultural-celebrations'],
    description:
      'Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva. Today she cooks the same one-pot pelau, curry goat and macaroni pie for weddings, christenings and big family Sundays across the east end.\n\nEverything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons. Doubles and aloo pie are made to order for groups of 40 or more.',
    photos: PELAU_PHOTOS.map(([file, caption], j) => ({ id: `pelau-house-photo-${j + 1}`, file: `${file}.jpg`, caption })),
    dishes: PELAU_DISHES.map((d, j) => ({ ...d, id: `pelau-house-dish-${j + 1}` })),
    certificate: {
      holder: 'Kendra Baptiste',
      issuer: 'Toronto Public Health',
      number: 'FH-2024-118734',
      expires: '2029-03-14',
      fileName: 'food-handler-certificate.pdf',
      fileSize: 1258291,
    },
    businessEmail: 'hello@pelauhouse.example',
    businessPhone: '+1 416 555 0142',
  });
  return all;
}
