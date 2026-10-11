/**
 * The fictional caterers from docs/mocks/README.md ("Cast and catalog").
 * All people, businesses and addresses are fictional.
 */
import { seedOccasions } from '../discovery/taxonomy.ts';
import { slugify, type Caterer, type Certificate, type Dish, type Photo } from '../caterers/model.ts';

type CastCaterer = Pick<Caterer, 'id' | 'name' | 'status' | 'cuisines' | 'areas' | 'createdAt'> &
  Partial<Omit<Caterer, 'photos' | 'dishes'>> & { photos?: Omit<Photo, 'id'>[]; dishes?: Omit<Dish, 'id'>[] };

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
      fileType: 'PDF',
      savedAt: '2026-09-02T14:00:00Z',
      fileUploadedAt: '2026-09-02T14:00:00Z',
    },
    businessEmail: 'hello@pelauhouse.example',
    businessPhone: '+1 416 555 0142',
  });
  applyCatererPageCast(all);
  applyDashboardCast(all);
  applyModerationCast(all);
  return all;
}

// ---------------------------------------------------------------------------
// Caterer page cast (docs/mocks/README.md, "Other caterer accounts")
// ---------------------------------------------------------------------------

const MARACAS_DISHES = [
  'Curry duck', 'Curry crab and dumpling', 'Buss up shut', 'Dhalpuri roti', 'Curry channa and aloo', 'Pumpkin talkari', 'Bodi and aloo', 'Curry mango',
  'Kurma', 'Sahina', 'Pholourie', 'Aloo pie', 'Doubles', 'Corn soup', 'Callaloo', 'Macaroni pie', 'Stewed chicken', 'Pelau', 'Bake and shark',
  'Accra', 'Fried bake', 'Saltfish buljol', 'Smoked herring', 'Coconut bake', 'Sada roti', 'Baigan choka', 'Tomato choka', 'Curry goat',
  'Oil down', 'Stewed oxtail', 'Geera pork', 'Geera chicken', 'Chow mein', 'Fried rice', 'Paw paw chow', 'Mango chow', 'Pineapple chow',
  'Kuchela', 'Tamarind sauce', 'Pepper sauce', 'Sorrel', 'Mauby', 'Peanut punch', 'Sweet bread', 'Black cake', 'Coconut drops', 'Tamarind balls',
  'Toolum', 'Pone', 'Red mango',
];

function applyCatererPageCast(all: Caterer[]): void {
  // Vishnu Ramlogan's Maracas Bay: the "full" example, 30 photos and 50 dishes.
  const maracas = all.find((c) => c.slug === 'maracas-bay')!;
  const files = [maracas.photos[0], ...CATALOG.filter(([, file]) => file !== 'maracas-bay').map(([, file, , , caption]) => ({ file: `${file}.jpg`, caption }))].slice(0, 30);
  maracas.photos = files.map((p, j) => ({ id: `maracas-bay-photo-${j + 1}`, file: p.file, caption: p.caption }));
  maracas.dishes = MARACAS_DISHES.map((name, j) => ({ id: `maracas-bay-dish-${j + 1}`, name, tags: j % 3 === 0 ? ['vegan'] : [], price: j % 4 === 0 ? 'From $14 per person' : undefined }));

  // Marie-Claire Augustin's Green Fig Catering: new, 3 photos, 8 dishes, no reviews (caterer/no-reviews).
  // Areas, occasions and the cover caption stay as in the listing catalog so its counts hold.
  const greenFig = all.find((c) => c.slug === 'green-fig-catering')!;
  Object.assign(greenFig, {
    minGuests: 15,
    maxGuests: 120,
    description:
      'Marie-Claire Augustin cooks the Sunday food of Castries: green fig and saltfish, bouyon thick with dumplings, and accra still crackling from the pot.\n\nGreen Fig is new to Sweet Hand this autumn. Small family gatherings are the sweet spot.',
    photos: [
      greenFig.photos[0],
      { id: 'green-fig-catering-photo-2', file: 'oil-down-kitchen.jpg', caption: 'Bouyon with dumplings and provisions in a red pot' },
      { id: 'green-fig-catering-photo-3', file: 'lakay-kitchen.jpg', caption: 'Lambi curry on a mound of red rice' },
    ],
    dishes: (
      [
        { name: 'Green fig and saltfish', description: 'St. Lucia’s national dish, with cucumber salad.', tags: ['dairy-free'], price: 'From $15 per person' },
        { name: 'Bouyon', description: 'Red beans, provisions and dumplings.', tags: ['dairy-free'] },
        { name: 'Accra', description: 'Saltfish fritters.', tags: [], price: '$1.50 each' },
        { name: 'Lambi curry', tags: ['gluten-free', 'contains-shellfish'], price: 'From $24 per person' },
        { name: 'Bakes', tags: ['vegan'] },
        { name: 'Callaloo soup', tags: ['vegan', 'gluten-free'] },
        { name: 'Banana bread', tags: ['vegetarian', 'contains-nuts'] },
        { name: 'Cocoa tea', description: 'Grated cocoa stick, nutmeg and bay leaf.', tags: ['vegetarian'], price: '$12 per litre' },
      ] as Omit<Dish, 'id'>[]
    ).map((d, j) => ({ ...d, id: `green-fig-catering-dish-${j + 1}` })),
  });

  // Paulette Morgan's Black Cake Co.: exactly 3 photos and 3 dishes.
  const blackCake = all.find((c) => c.slug === 'black-cake-co')!;
  blackCake.dishes = [
    { id: 'black-cake-co-dish-1', name: 'Black cake', description: 'Fruit soaked in rum and port since last Christmas.', tags: ['contains-nuts'], price: '$65 per cake' },
    { id: 'black-cake-co-dish-2', name: 'Sorrel', tags: ['vegan'], price: '$14 per litre' },
    { id: 'black-cake-co-dish-3', name: 'Coconut drops', tags: ['vegan', 'gluten-free'], price: '$2 each' },
  ];

  // Winston Daley's Coal Pot Kitchen: the removed example (Mon 28 Sep).
  all.push({
    id: 'cat-901',
    slug: 'coal-pot-kitchen',
    name: 'Coal Pot Kitchen',
    status: 'Removed',
    cuisines: ['jamaican'],
    areas: ['brampton'],
    minGuests: 20,
    maxGuests: 150,
    occasions: ['birthdays', 'family-gatherings'],
    description: 'Coal Pot Kitchen cooks Jamaican food for gatherings in Brampton.',
    photos: ['brown-stew-kitchen', 'bammy-bros', 'island-pot'].map((file, j) => ({ id: `coal-pot-kitchen-photo-${j + 1}`, file: `${file}.jpg`, caption: CATALOG.find(([, f]) => f === file)![4] })),
    dishes: GENERIC_DISHES.map((d, j) => ({ ...d, id: `coal-pot-kitchen-dish-${j + 1}` })),
    createdAt: '2026-08-05T13:00:00Z',
    publishedAt: '2026-08-12T13:00:00Z',
    previousSlugs: [],
    statusReason: 'Repeated food safety concerns from customers, confirmed by our team.',
  });
}

// ---------------------------------------------------------------------------
// Caterer accounts behind the dashboard (docs/mocks/README.md, "Other caterer
// accounts"). Owners and certificates are private; the public data is unchanged.
// ---------------------------------------------------------------------------

function applyDashboardCast(all: Caterer[]): void {
  const bySlug = (slug: string) => all.find((c) => c.slug === slug)!;
  const cert = (holder: string, issuer: string, number: string, expires: string, savedAt: string, file?: [string, number]): Certificate => ({
    holder,
    issuer,
    number,
    expires,
    savedAt,
    ...(file ? { fileName: file[0], fileSize: file[1], fileType: 'PDF' as const, fileUploadedAt: savedAt } : {}),
  });
  // Vishnu Ramlogan's Maracas Bay: the full example (30 photos, 50 dishes).
  Object.assign(bySlug('maracas-bay'), {
    ownerUserId: 'user-vishnu',
    certificate: cert('Vishnu Ramlogan', 'Peel Public Health', 'FH-2023-410266', '2028-06-30', '2026-06-30T14:00:00Z'),
  });
  // Paulette Morgan's Black Cake Co.: exactly 3 photos and 3 dishes.
  Object.assign(bySlug('black-cake-co'), {
    ownerUserId: 'user-paulette',
    certificate: cert('Paulette Morgan', 'Durham Region Health Department', 'FH-2024-301558', '2029-01-31', '2026-01-31T14:00:00Z'),
  });
  // Desmond Greaves's Cou-Cou: the certificate expires Mon 9 Nov 2026, 30 days from today.
  Object.assign(bySlug('cou-cou'), {
    ownerUserId: 'user-desmond',
    certificate: cert('Desmond Greaves', 'Toronto Public Health', 'FH-2021-093317', '2026-11-09', '2022-01-14T15:00:00Z', ['certificate-2021.pdf', 838861]),
  });
  // Sharon Best's Flying Fish Kitchen: its certificate expired on 30 Sep 2026 (suspended by the 'flying-fish-suspended' scenario).
  Object.assign(bySlug('flying-fish-kitchen'), {
    ownerUserId: 'user-sharon',
    certificate: cert('Sharon Best', 'Durham Region Health Department', 'FH-2021-337102', '2026-09-30', '2021-10-04T14:00:00Z'),
  });
  // Winston Daley's Coal Pot Kitchen: removed Mon 28 Sep.
  Object.assign(bySlug('coal-pot-kitchen'), { ownerUserId: 'user-winston', statusChangedAt: '2026-09-28T14:00:00Z' });
}

// ---------------------------------------------------------------------------
// Operator moderation cast (docs/mocks/README.md, "Other caterer accounts" and
// "Operator-only totals"): profiles waiting for review, drafts, a suspended
// and a removed caterer, an expired certificate, a pending name change and a
// dish added this week. Owners' contact details and the moderation history
// live in seed/operator.ts. Self-contained block, ids cat-910 to cat-917.
// ---------------------------------------------------------------------------

const dish = (name: string, tags: string[], price?: string, description?: string): Omit<Dish, 'id'> => ({ name, tags, price, description });

function moderationCaterer(p: CastCaterer): Caterer {
  const slug = slugify(p.name.replace(/[’']/g, ''));
  return {
    slug,
    minGuests: 20,
    maxGuests: 100,
    occasions: ['family-gatherings'],
    description: '',
    previousSlugs: [],
    ...p,
    photos: (p.photos ?? []).map((ph, j) => ({ ...ph, id: `${slug}-photo-${j + 1}` })),
    dishes: (p.dishes ?? []).map((x, j) => ({ ...x, id: `${slug}-dish-${j + 1}` })),
  };
}

function applyModerationCast(all: Caterer[]): void {
  // Flying Fish Kitchen's certificate expired on Wed 30 Sep 2026; it stays published until an operator acts (L2-040.3).
  all.find((c) => c.slug === 'flying-fish-kitchen')!.certificate ??= {
    holder: 'Sharon Best',
    issuer: 'Durham Region Health',
    number: 'FH-2021-337102',
    expires: '2026-09-30',
    fileName: 'food-handler-certificate.pdf',
    fileSize: 1258291,
  };
  // Island Pot, the subject of food safety report R-2047.
  all.find((c) => c.slug === 'island-pot')!.certificate = {
    holder: 'Garfield Brown',
    issuer: 'Toronto Public Health',
    number: 'FH-2023-552019',
    expires: '2027-02-02',
    fileName: 'food-handler-certificate.pdf',
    fileSize: 1258291,
  };
  // Tanisha Reid added a dish on Thu 8 Oct (recent changes).
  const scotch = all.find((c) => c.slug === 'scotch-bonnet-social')!;
  scotch.dishes.push({ id: 'scotch-bonnet-social-dish-escovitch', name: 'Escovitch fish', tags: ['gluten-free'], price: 'From $19 per person' });

  all.push(
    moderationCaterer({
      id: 'cat-910',
      name: 'Auntie Bev’s Kitchen',
      status: 'Pending review',
      cuisines: ['jamaican'],
      areas: ['oshawa', 'whitby', 'clarington', 'ajax'],
      minGuests: 30,
      maxGuests: 150,
      occasions: ['birthdays', 'funerals-and-repasts', 'family-gatherings', 'community-events'],
      description:
        'Beverley Campbell has cooked for every christening, nine-night and graduation on her street in Oshawa for thirty years. Her brown stew chicken and curry goat are cooked low and slow, the way her mother did it in Mandeville.\n\nFood arrives hot in foil trays with serving spoons. For repasts, Bev can cook the day before and deliver by 10 a.m.',
      photos: [
        { file: 'green-fig-catering.jpg', caption: 'Brown stew chicken with rice and peas in a steel pot' },
        { file: 'oil-down-kitchen.jpg', caption: 'Rice and peas with stewed chicken in a red pot' },
        { file: 'bammy-bros.jpg', caption: 'Curry goat over white rice' },
        { file: 'coconut-drops-bakery.jpg', caption: 'Fried dumplings dusted with sugar' },
        { file: 'auntie-merles-table.jpg', caption: 'Escovitch-style peppers over rice' },
      ],
      dishes: [
        dish('Brown stew chicken', ['gluten-free', 'dairy-free'], 'From $15 per person', 'Browned, then simmered with thyme and pimento.'),
        dish('Curry goat', ['halal', 'spicy'], 'From $18 per person'),
        dish('Rice and peas', ['vegan', 'gluten-free'], 'From $4 per person', 'Kidney beans, coconut milk, scallion.'),
        dish('Escovitch fish', ['spicy'], 'From $16 per person', 'Fried snapper with pickled peppers and onions.'),
        dish('Fried dumplings', ['vegetarian'], '$1.50 each'),
        dish('Gizzada', ['vegetarian', 'contains-nuts'], '$3 each', 'Coconut tarts with nutmeg.'),
      ],
      certificate: {
        holder: 'Beverley Campbell',
        issuer: 'Durham Region Health Department',
        number: 'FH-2025-204517',
        expires: '2030-01-22',
        fileName: 'food-handler-certificate.pdf',
        fileSize: 1258291,
      },
      businessEmail: 'beverley@auntiebevs.example',
      businessPhone: '+1 905 555 0164',
      createdAt: '2026-09-29T00:47:00Z',
    }),
    moderationCaterer({
      id: 'cat-911',
      name: 'Breadfruit & Butter',
      status: 'Pending review',
      cuisines: ['vincentian'],
      areas: ['brampton', 'mississauga', 'etobicoke'],
      minGuests: 15,
      maxGuests: 80,
      occasions: ['birthdays', 'private-dinners', 'family-gatherings'],
      description:
        'Jolene Ollivierre roasts breadfruit over coals the way it’s done on Sundays in Kingstown, served with fried jackfish and saltfish butter.\n\nSmall parties, big flavour: from 15 to 80 guests across Peel and the west end.',
      photos: [
        { file: 'auntie-merles-table.jpg', caption: 'Roasted breadfruit and saltfish with peppers' },
        { file: 'mauby-and-co.jpg', caption: 'Coconut cake topped with berries' },
        { file: 'oil-down-kitchen.jpg', caption: 'Pelau with pigeon peas in a red pot' },
        { file: 'roti-road.jpg', caption: 'Curry chicken and rice beside folded roti' },
        { file: 'sea-moss-and-spice.jpg', caption: 'Rice with peas and stewed chicken' },
      ],
      dishes: [
        dish('Roasted breadfruit and fried jackfish', ['gluten-free'], 'From $19 per person', 'The national dish of St. Vincent and the Grenadines.'),
        dish('Saltfish butter', ['dairy-free']),
        dish('Buljol', ['gluten-free']),
        dish('Callaloo soup', ['vegan'], 'From $6 per person'),
        dish('Coconut turnovers', ['vegetarian', 'contains-nuts'], '$3 each'),
      ],
      certificate: {
        holder: 'Jolene Ollivierre',
        issuer: 'Peel Public Health',
        number: 'FH-2026-031882',
        expires: '2031-05-09',
        fileName: 'certificate-scan.jpg',
        fileSize: 2516582,
      },
      businessEmail: 'jolene@breadfruitandbutter.example',
      businessPhone: '+1 647 555 0119',
      createdAt: '2026-09-22T22:15:00Z',
    }),
    moderationCaterer({ id: 'cat-912', name: 'Tamarind Tree', status: 'Changes requested', cuisines: ['trinidadian-and-tobagonian'], areas: ['whitby'], createdAt: '2026-09-20T15:00:00Z' }),
    moderationCaterer({ id: 'cat-913', name: 'Callaloo Corner', status: 'Draft', cuisines: ['grenadian'], areas: ['markham'], createdAt: '2026-10-04T15:00:00Z' }),
    moderationCaterer({ id: 'cat-914', name: 'Doubles Duo', status: 'Draft', cuisines: ['trinidadian-and-tobagonian'], areas: ['ajax'], createdAt: '2026-10-01T15:00:00Z' }),
    moderationCaterer({ id: 'cat-915', name: 'Plantain Plate', status: 'Draft', cuisines: ['haitian'], areas: ['north-york'], createdAt: '2026-09-24T15:00:00Z' }),
    moderationCaterer({
      id: 'cat-916',
      name: 'Hibiscus Hut',
      status: 'Suspended',
      cuisines: ['jamaican'],
      areas: ['brampton'],
      createdAt: '2026-08-12T15:00:00Z',
      publishedAt: '2026-08-20T15:00:00Z',
      statusReason: 'Photos copied from another caterer’s page. Upload photos of your own food and we’ll look again.',
    }),
    moderationCaterer({
      id: 'cat-917',
      name: 'Rum Shop Catering',
      status: 'Removed',
      cuisines: ['pan-caribbean'],
      areas: ['oshawa'],
      createdAt: '2026-08-04T15:00:00Z',
      publishedAt: '2026-08-11T15:00:00Z',
      statusReason: 'Owner confirmed the business has closed.',
    }),
  );
}
