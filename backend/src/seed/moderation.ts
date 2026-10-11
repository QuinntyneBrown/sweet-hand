/**
 * The operator moderation cast (docs/mocks/README.md, "Other caterer accounts"
 * and "Operators"): the caterers' owner accounts, status histories, the edits
 * of the recent-changes feed, the snapshot behind a resubmission, certificate
 * reminders and the enquiry a reported review came from. All people are
 * fictional; ids are fixed so `npm run seed` stays idempotent.
 */
import type { Document } from '../platform/database.ts';
import type { Caterer, ProfileStatus } from '../caterers/model.ts';
import type { User } from '../identity/model.ts';
import type { Enquiry } from '../enquiries/model.ts';
import type { CertificateExpiry, ProfileEdit, ProfileSnapshot, RecordChange, StatusChange } from '../moderation/model.ts';
import type { ChangeValue } from '@contract/change-value.ts';
import { seedUser } from './users.ts';

const LEAH = 'user-leah';
const TOMAS = 'user-tomas';

/** Owners named in the mocks, by caterer slug: [name, email, phone]. */
const NAMED_OWNERS: Record<string, [string, string, string]> = {
  'island-pot': ['Garfield Brown', 'garfield@islandpot.example', '+1 416 555 0151'],
  'sugar-dumplin': ['Ondine Samuel', 'ondine@sugardumplin.example', '+1 905 555 0128'],
  'ti-kay': ['Fabienne Étienne', 'fabienne@tikay.example', '+1 416 555 0175'],
  'demerara-kitchen': ['Rohan Persaud', 'rohan@demerarakitchen.example', '+1 905 555 0119'],
  'sorrel-and-spice': ['Celestine Charles', 'celestine@sorrelandspice.example', '+1 416 555 0102'],
  'scotch-bonnet-social': ['Tanisha Reid', 'tanisha@scotchbonnet.example', '+1 905 555 0114'],
  'sunday-pot': ['Marcus Alexander', 'marcus@sundaypot.example', '+1 905 555 0157'],
  'green-fig-catering': ['Marie-Claire Augustin', 'marieclaire@greenfig.example', '+1 905 555 0139'],
  'breadfruit-and-butter': ['Jolene Ollivierre', 'jolene@breadfruitandbutter.example', '+1 647 555 0119'],
  'tamarind-tree': ['Anil Maharaj', 'anil@tamarindtree.example', '+1 905 555 0181'],
  'callaloo-corner': ['Josephine Noel', 'josephine@callaloocorner.example', '+1 905 555 0123'],
  'doubles-duo': ['Ravi Persad', 'ravi@doublesduo.example', '+1 905 555 0146'],
  'plantain-plate': ['Mireille Joseph', 'mireille@plantainplate.example', '+1 416 555 0108'],
  'hibiscus-hut': ['Sharon Bailey', 'sharon@hibiscushut.example', '+1 905 555 0193'],
  'rum-shop-catering': ['Clive Dennis', 'clive@rumshop.example', '+1 905 555 0111'],
};

const FIRST = ['Andrea', 'Curtis', 'Donna', 'Errol', 'Gloria', 'Hyacinth', 'Ian', 'Janelle', 'Keith', 'Lorna', 'Maxine', 'Neville', 'Olive', 'Patrick', 'Rosalind', 'Sean'];
const LAST = ['Baptiste', 'Charles', 'Douglas', 'Edwards', 'Francis', 'Gordon', 'Harris', 'James', 'King', 'Lewis', 'Mitchell', 'Nelson', 'Phillips', 'Roberts', 'Samuels', 'Thomas', 'Walker'];

/**
 * Auntie Bev's Kitchen has no account in the seed: Beverley Campbell registers
 * in the sign-up specs and the caterer-profile scenarios create her account.
 */
const WITHOUT_ACCOUNT = new Set(['cat-910']);

/** Every caterer has an owner account; those the mocks do not name get a fictional one. */
async function ownerAccounts(caterers: Caterer[], users: User[]): Promise<User[]> {
  const owned = new Set(users.filter((u) => u.catererId).map((u) => u.catererId));
  const accounts = caterers.flatMap((c, index) => {
    if (owned.has(c.id) || c.ownerUserId || WITHOUT_ACCOUNT.has(c.id)) return [];
    const [name, email, phone] = NAMED_OWNERS[c.slug] ?? [
      `${FIRST[index % FIRST.length]} ${LAST[(index * 7) % LAST.length]}`,
      `owner@${c.slug}.example`,
      `+1 416 555 ${String(200 + index).padStart(4, '0')}`,
    ];
    return [seedUser({ id: ownerId(c.id), role: 'Caterer', displayName: name, email, phone, catererId: c.id, createdAt: c.createdAt })];
  });
  return Promise.all(accounts);
}

const ownerId = (catererId: string) => `user-owner-${catererId}`;

let seq = 0;
const h = (catererId: string, at: string, status: ProfileStatus, by: string, step: StatusChange['step'], reason?: string, extra: Partial<StatusChange> = {}): StatusChange => ({
  id: `status-${catererId}-${String(++seq).padStart(3, '0')}`,
  catererId,
  at,
  seq,
  status,
  by,
  step,
  ...(reason ? { reason } : {}),
  ...extra,
});

const BREADFRUIT_REQUEST = 'The description lists a phone number, and photo 3 is a stock image. Please remove the number and upload a photo of your own food.';

function statusHistories(): StatusChange[] {
  seq = 0;
  return [
    h('cat-001', '2025-03-05T00:30:00Z', 'Draft', 'user-kendra', 'created'),
    h('cat-001', '2025-03-08T14:12:00Z', 'Pending review', 'user-kendra', 'submitted'),
    h('cat-001', '2025-03-10T18:40:00Z', 'Changes requested', LEAH, 'changes-requested', 'Photo 4 is blurry. Please replace it with a sharper one.'),
    h('cat-001', '2025-03-13T00:05:00Z', 'Pending review', 'user-kendra', 'resubmitted'),
    h('cat-001', '2025-03-14T15:20:00Z', 'Published', TOMAS, 'approved'),
    h('cat-024', '2024-09-01T14:02:00Z', 'Draft', 'user-sharon', 'created'),
    h('cat-024', '2024-09-05T22:48:00Z', 'Pending review', 'user-sharon', 'submitted'),
    h('cat-024', '2024-09-09T19:15:00Z', 'Published', LEAH, 'approved'),
    // Beverley has no account in the seed, so her entries name her.
    h('cat-910', '2026-09-29T00:47:00Z', 'Draft', 'Beverley Campbell', 'created'),
    h('cat-910', '2026-10-07T18:10:00Z', 'Pending review', 'Beverley Campbell', 'submitted'),
    h('cat-911', '2026-09-22T22:15:00Z', 'Draft', ownerId('cat-911'), 'created'),
    h('cat-911', '2026-10-02T23:02:00Z', 'Pending review', ownerId('cat-911'), 'submitted'),
    h('cat-911', '2026-10-05T19:30:00Z', 'Changes requested', TOMAS, 'changes-requested', BREADFRUIT_REQUEST),
    h('cat-911', '2026-10-08T13:15:00Z', 'Pending review', ownerId('cat-911'), 'resubmitted'),
    h('cat-912', '2026-09-20T15:00:00Z', 'Draft', ownerId('cat-912'), 'created'),
    h('cat-912', '2026-10-01T15:00:00Z', 'Pending review', ownerId('cat-912'), 'submitted'),
    h('cat-912', '2026-10-05T14:00:00Z', 'Changes requested', LEAH, 'changes-requested', 'Add at least three photos of your own food, each with a caption.'),
    h('cat-916', '2026-08-12T15:00:00Z', 'Draft', ownerId('cat-916'), 'created'),
    h('cat-916', '2026-08-17T15:00:00Z', 'Pending review', ownerId('cat-916'), 'submitted'),
    h('cat-916', '2026-08-20T15:00:00Z', 'Published', TOMAS, 'approved'),
    h('cat-916', '2026-10-06T16:20:00Z', 'Suspended', LEAH, 'suspended', 'Photos copied from another caterer’s page. Upload photos of your own food and we’ll look again.', { closedEnquiries: 2 }),
    h('cat-917', '2026-08-04T15:00:00Z', 'Draft', ownerId('cat-917'), 'created'),
    h('cat-917', '2026-08-08T15:00:00Z', 'Pending review', ownerId('cat-917'), 'submitted'),
    h('cat-917', '2026-08-11T15:00:00Z', 'Published', LEAH, 'approved'),
    h('cat-917', '2026-09-28T17:00:00Z', 'Removed', LEAH, 'removed', 'Owner confirmed the business has closed.'),
    h('cat-901', '2026-08-05T13:00:00Z', 'Draft', 'user-winston', 'created'),
    h('cat-901', '2026-08-09T13:00:00Z', 'Pending review', 'user-winston', 'submitted'),
    h('cat-901', '2026-08-12T13:00:00Z', 'Published', TOMAS, 'approved'),
    h('cat-901', '2026-09-28T15:00:00Z', 'Removed', LEAH, 'removed', 'Repeated food safety concerns from customers, confirmed by our team.'),
  ];
}

/** The 24 edits of the last 30 days, newest first, and one older. */
function profileEditsCast(owner: (catererId: string) => string): ProfileEdit[] {
  const text = (t: string): ChangeValue => ({ kind: 'text', text: t });
  const guests = (min: number, max: number): ChangeValue => ({ kind: 'guests', min, max });
  const list = (...items: string[]): ChangeValue => ({ kind: 'list', items });
  const photo = (file: string, alt: string): ChangeValue => ({ kind: 'photo', src: `/media/${file}?w=400&fm=jpeg`, alt });
  const edits: Omit<ProfileEdit, 'id' | 'seq'>[] = [
    {
      catererId: 'cat-001',
      field: 'description',
      by: 'user-kendra',
      at: '2026-10-10T12:15:00.000Z',
      old: text('Everything is cooked the morning of your event and arrives hot, with chafing dishes.'),
      new: text('Everything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons. Doubles and aloo pie are made to order for groups of 40 or more.'),
    },
    { catererId: 'cat-002', field: 'guests', by: 'user-desmond', at: '2026-10-09T22:40:00.000Z', old: guests(20, 150), new: guests(20, 200) },
    {
      catererId: 'cat-003',
      field: 'menu',
      by: owner('cat-003'),
      at: '2026-10-08T18:05:00.000Z',
      old: null,
      new: { kind: 'dish', name: 'Escovitch fish', price: 'From $19 per person', tags: ['gluten-free'] },
    },
    {
      catererId: 'cat-004',
      field: 'cover-photo',
      by: owner('cat-004'),
      at: '2026-10-07T23:30:00.000Z',
      old: photo('griot-and-pikliz.jpg', 'Fried rice with egg and vegetables'),
      new: photo('ti-kay.jpg', 'Shrimp arranged in a heart on a mound of tomato rice'),
    },
    {
      catererId: 'cat-009',
      field: 'description',
      by: 'user-vishnu',
      at: '2026-10-06T15:20:00.000Z',
      old: text('Doubles, bake and shark and curry crab for any crowd.'),
      new: text('Doubles, bake and shark and curry crab for any crowd. WhatsApp us on 647-555-0133 for a better price.'),
      reverted: { by: LEAH, at: '2026-10-06T17:02:00.000Z' },
    },
    { catererId: 'cat-006', field: 'areas', by: owner('cat-006'), at: '2026-10-05T13:02:00.000Z', old: list('Brampton', 'Mississauga'), new: list('Brampton') },
  ];
  // Eighteen more guest-range edits, one every 20 hours back to mid-September.
  for (let i = 0; i < 18; i++) {
    const n = 20 + i;
    const at = new Date(Date.parse('2026-10-04T20:00:00.000Z') - i * 20 * 3600_000).toISOString();
    const min = 10 + (n % 4) * 5;
    const max = 100 + (n % 5) * 50;
    edits.push({ catererId: `cat-0${n}`, field: 'guests', by: owner(`cat-0${n}`), at, old: guests(min, max - 25), new: guests(min, max) });
  }
  // Older than 30 days: never in the feed.
  edits.push({ catererId: 'cat-005', field: 'guests', by: 'user-paulette', at: '2026-09-01T14:00:00.000Z', old: guests(20, 100), new: guests(20, 150) });
  return edits.map((e, i) => ({ id: `edit-${String(i + 1).padStart(3, '0')}`, seq: i + 1, ...e }));
}

/** Breadfruit & Butter as it was when Tomas asked for changes on Mon 5 Oct (L2-047.3). */
const SNAPSHOTS: ProfileSnapshot[] = [
  {
    id: 'cat-911',
    description:
      'Call or text Jolene at 647-555-0119 to book.\n\nJolene Ollivierre roasts breadfruit over coals the way it’s done on Sundays in Kingstown, served with fried jackfish and saltfish butter.\n\nSmall parties, big flavour: from 15 to 80 guests across Peel and the west end.',
    photoFiles: ['auntie-merles-table.jpg', 'mauby-and-co.jpg', 'stock-pelau.jpg', 'roti-road.jpg', 'sea-moss-and-spice.jpg'],
    dishNames: ['Roasted breadfruit and fried jackfish', 'Saltfish butter', 'Buljol', 'Callaloo soup', 'Coconut turnovers'],
    minGuests: 15,
    maxGuests: 80,
    occasions: ['birthdays', 'private-dinners', 'family-gatherings'],
    areas: ['brampton', 'mississauga', 'etobicoke'],
    cuisines: ['vincentian'],
  },
];

/** Flying Fish Kitchen's certificate expired on Wed 30 Sep; the daily job found it on Fri 9 Oct (L2-040.2–3). */
const CERTIFICATE_EXPIRIES: CertificateExpiry[] = [
  { id: 'cat-024', detectedAt: '2026-10-09T23:30:00.000Z', reminders: ['2026-08-31T13:00:00.000Z', '2026-09-23T13:00:00.000Z'] },
];

/** The last change to each record, for the caterer list's order. */
const RECORD_CHANGES: [string, string][] = [
  ['cat-001', '2026-10-10T12:15:00.000Z'],
  ['cat-018', '2026-10-10T08:12:00.000Z'],
  ['cat-911', '2026-10-08T13:15:00.000Z'],
  ['cat-910', '2026-10-07T18:10:00.000Z'],
  ['cat-024', '2026-10-07T13:00:00.000Z'],
  ['cat-916', '2026-10-06T16:20:00.000Z'],
  ['cat-912', '2026-10-05T14:00:00.000Z'],
  ['cat-913', '2026-10-04T15:00:00.000Z'],
  ['cat-009', '2026-10-03T15:00:00.000Z'],
  ['cat-008', '2026-10-02T15:00:00.000Z'],
  ['cat-914', '2026-10-01T15:00:00.000Z'],
  ['cat-004', '2026-09-30T15:00:00.000Z'],
  ['cat-917', '2026-09-28T17:00:00.000Z'],
  ['cat-901', '2026-09-28T15:00:00.000Z'],
  ['cat-006', '2026-09-27T15:00:00.000Z'],
  ['cat-002', '2026-09-25T15:00:00.000Z'],
  ['cat-915', '2026-09-24T15:00:00.000Z'],
  ['cat-011', '2026-09-22T15:00:00.000Z'],
  ['cat-003', '2026-09-20T15:00:00.000Z'],
  ['cat-005', '2026-09-18T15:00:00.000Z'],
  ['cat-012', '2026-09-16T15:00:00.000Z'],
];

/** Devon W.'s replied enquiry to Maracas Bay, which his reported review is about (L2-034.3). */
const DEVON_MARACAS: Enquiry = {
  id: 'enq-devon-maracas',
  customerId: 'user-devon',
  catererId: 'cat-009',
  eventDate: '2026-09-12',
  guests: 35,
  area: 'mississauga',
  fsa: null,
  occasion: 'birthdays',
  message: 'Hi, we need curry duck, buss up shut and macaroni pie for 35 at my mother’s birthday on Sat 12 Sep, around 2 p.m. in Mississauga. Can you deliver?',
  createdAt: '2026-08-20T16:05:00.000Z',
  status: 'Replied',
  events: [
    { id: 'enq-devon-maracas-event-1', kind: 'reply', by: 'caterer', at: '2026-08-20T19:40:00.000Z', text: 'Hi Devon, yes, we deliver to Mississauga. For 35 that comes to about $700 before tax. Shall I hold the date?' },
    { id: 'enq-devon-maracas-event-2', kind: 'reply', by: 'customer', at: '2026-08-21T12:10:00.000Z', text: 'Yes please, hold it.' },
  ],
  readAt: { customer: '2026-08-21T12:10:00.000Z', caterer: '2026-08-21T12:10:00.000Z' },
};

/** Adds the moderation cast to the other areas' documents (collections are concatenated). */
export async function withModerationCast(docs: Record<string, Document[]>): Promise<Record<string, Document[]>> {
  const caterers = (docs['caterers'] ?? []) as Caterer[];
  const users = (docs['users'] ?? []) as User[];
  const owners = await ownerAccounts(caterers, users);
  const ownerOf = (catererId: string) => [...users, ...owners].find((u) => u.catererId === catererId)?.id ?? ownerId(catererId);
  const add: Record<string, Document[]> = {
    users: owners,
    statusHistory: statusHistories(),
    profileEdits: profileEditsCast(ownerOf),
    profileSnapshots: SNAPSHOTS,
    certificateExpiries: CERTIFICATE_EXPIRIES,
    recordChanges: RECORD_CHANGES.map(([id, at]): RecordChange => ({ id, at })),
    enquiries: [DEVON_MARACAS],
  };
  const all = { ...docs };
  for (const [name, list] of Object.entries(add)) all[name] = [...(all[name] ?? []), ...list];
  return all;
}
