/**
 * Operator console state (audit log, recent changes, breaches, invitations).
 * The moderation part (review queue, decisions, recent changes, report
 * handling) lives under `moderation`. All people are fictional
 * (docs/mocks/README.md, "Other caterer accounts" and "Operators").
 */
import { randomUUID } from 'node:crypto';
import type { Enquiry } from './enquiries.ts';
import type { ProfileStatus } from './caterers.ts';
import type { ChangedField, ChangeValue } from '../../projects/web/src/app/core/api/operator-moderation.models.ts';

export interface OperatorState {
  moderation: ModerationState;
}

export function seedOperator(): OperatorState {
  return { moderation: seedModeration() };
}

// ---------------------------------------------------------------------------
// Moderation (docs/detailed-designs/moderation)
// ---------------------------------------------------------------------------

/** A caterer's contact details as operators see them (L2-014: never public). */
export interface Owner {
  name: string;
  email: string;
  phone: string | null;
}

/** One status change (L2-046.4). Entries are only ever appended. */
export interface StatusChange {
  at: string;
  status: ProfileStatus;
  by: string;
  step: 'created' | 'submitted' | 'resubmitted' | 'approved' | 'changes-requested' | 'suspended' | 'reinstated' | 'removed';
  reason?: string;
}

/** The profile as it was when an operator requested changes (L2-047.3). */
export interface ProfileSnapshot {
  description: string;
  photoFiles: string[];
  dishNames: string[];
  minGuests: number;
  maxGuests: number;
  occasions: string[];
  areas: string[];
  cuisines: string[];
}

/** One caterer edit to a published profile (L2-044.1), for the recent-changes feed. */
export interface ProfileEdit {
  id: string;
  catererId: string;
  field: ChangedField;
  by: string;
  at: string;
  old: ChangeValue | null;
  new: ChangeValue | null;
  reverted?: { by: string; at: string };
}

/** An email the platform would have sent; tests read these instead of a mailbox. */
export interface ModerationEmail {
  to: string;
  kind: string;
  at: string;
  reason?: string;
  link?: string;
}

export interface ModerationState {
  owners: Record<string, Owner>;
  /** Oldest first, per caterer id. */
  history: Record<string, StatusChange[]>;
  /** The last "Changes requested" decision, per caterer id. */
  snapshots: Record<string, ProfileSnapshot>;
  /** When the caterer asked for the pending name, per caterer id. */
  nameRequestedAt: Record<string, string>;
  /** When the daily job found the certificate expired, and the reminders sent before (L2-040.2–3). */
  expiredCertificates: Record<string, { detectedAt: string; reminders: string[] }>;
  /** The last change to each record, for the caterer list's order. */
  updatedAt: Record<string, string>;
  edits: ProfileEdit[];
  /** Open enquiries closed by a suspension, per caterer id. */
  closedBySuspension: Record<string, number>;
  /** The enquiry a reviewed event came from, per review id: what a report about the review links to (L2-034.3). */
  reviewEnquiries: Record<string, Enquiry>;
  /** Time-limited certificate links (L2-040.4). */
  certificateLinks: Record<string, { catererId: string; expiresAt: string }>;
  emails: ModerationEmail[];
}

const LEAH = 'Leah Mohammed';
const TOMAS = 'Tomas Reyes';

/** Owners named in the mocks, by caterer slug: [name, email, phone]. */
const NAMED_OWNERS: Record<string, [string, string, string]> = {
  'island-pot': ['Garfield Brown', 'garfield@islandpot.example', '+1 416 555 0151'],
  'flying-fish-kitchen': ['Sharon Best', 'wendell@flyingfish.example', '+1 905 555 0177'],
  'maracas-bay': ['Vishnu Ramlogan', 'vishnu@maracasbay.example', '+1 905 555 0133'],
  'sugar-dumplin': ['Ondine Samuel', 'ondine@sugardumplin.example', '+1 905 555 0128'],
  'ti-kay': ['Fabienne Étienne', 'fabienne@tikay.example', '+1 416 555 0175'],
  'demerara-kitchen': ['Rohan Persaud', 'rohan@demerarakitchen.example', '+1 905 555 0119'],
  'cou-cou': ['Desmond Greaves', 'desmond@coucou.example', '+1 416 555 0166'],
  'sorrel-and-spice': ['Celestine Charles', 'celestine@sorrelandspice.example', '+1 416 555 0102'],
  'scotch-bonnet-social': ['Tanisha Reid', 'tanisha@scotchbonnet.example', '+1 905 555 0114'],
  'black-cake-co': ['Paulette Morgan', 'paulette@blackcake.example', '+1 905 555 0190'],
  'sunday-pot': ['Marcus Alexander', 'marcus@sundaypot.example', '+1 905 555 0157'],
  'green-fig-catering': ['Marie-Claire Augustin', 'marieclaire@greenfig.example', '+1 905 555 0139'],
  'coal-pot-kitchen': ['Winston Daley', 'winston@coalpot.example', '+1 905 555 0172'],
  'auntie-bevs-kitchen': ['Beverley Campbell', 'beverley@auntiebevs.example', '+1 905 555 0164'],
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

/** Every caterer has an owner; those the mocks do not name get a fictional one. */
export function ownerFor(state: ModerationState, catererId: string, slug: string, index: number): Owner {
  const known = state.owners[catererId];
  if (known) return known;
  const named = NAMED_OWNERS[slug];
  if (named) return { name: named[0], email: named[1], phone: named[2] };
  return {
    name: `${FIRST[index % FIRST.length]} ${LAST[(index * 7) % LAST.length]}`,
    email: `owner@${slug}.example`,
    phone: `+1 416 555 ${String(200 + index).padStart(4, '0')}`,
  };
}

const h = (at: string, status: ProfileStatus, by: string, step: StatusChange['step'], reason?: string): StatusChange => ({ at, status, by, step, ...(reason ? { reason } : {}) });

const BREADFRUIT_REQUEST = 'The description lists a phone number, and photo 3 is a stock image. Please remove the number and upload a photo of your own food.';

/** [caterer id, field, by, at, old, new, reverted?] newest first: the 24 edits of the last 30 days, and one older. */
function seedEdits(): ProfileEdit[] {
  const text = (t: string): ChangeValue => ({ kind: 'text', text: t });
  const guests = (min: number, max: number): ChangeValue => ({ kind: 'guests', min, max });
  const list = (...items: string[]): ChangeValue => ({ kind: 'list', items });
  const photo = (file: string, alt: string): ChangeValue => ({ kind: 'photo', src: `/media/${file}?w=400&fm=jpeg`, alt });
  const edits: Omit<ProfileEdit, 'id'>[] = [
    {
      catererId: 'cat-001',
      field: 'description',
      by: 'Kendra Baptiste',
      at: '2026-10-10T12:15:00.000Z',
      old: text('Everything is cooked the morning of your event and arrives hot, with chafing dishes.'),
      new: text('Everything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons. Doubles and aloo pie are made to order for groups of 40 or more.'),
    },
    { catererId: 'cat-002', field: 'guests', by: 'Desmond Greaves', at: '2026-10-09T22:40:00.000Z', old: guests(20, 150), new: guests(20, 200) },
    {
      catererId: 'cat-003',
      field: 'menu',
      by: 'Tanisha Reid',
      at: '2026-10-08T18:05:00.000Z',
      old: null,
      new: { kind: 'dish', name: 'Escovitch fish', price: 'From $19 per person', tags: ['gluten-free'] },
    },
    {
      catererId: 'cat-004',
      field: 'cover-photo',
      by: 'Fabienne Étienne',
      at: '2026-10-07T23:30:00.000Z',
      old: photo('griot-and-pikliz.jpg', 'Fried rice with egg and vegetables'),
      new: photo('ti-kay.jpg', 'Shrimp arranged in a heart on a mound of tomato rice'),
    },
    {
      catererId: 'cat-009',
      field: 'description',
      by: 'Vishnu Ramlogan',
      at: '2026-10-06T15:20:00.000Z',
      old: text('Doubles, bake and shark and curry crab for any crowd.'),
      new: text('Doubles, bake and shark and curry crab for any crowd. WhatsApp us on 647-555-0133 for a better price.'),
      reverted: { by: LEAH, at: '2026-10-06T17:02:00.000Z' },
    },
    { catererId: 'cat-006', field: 'areas', by: 'Rohan Persaud', at: '2026-10-05T13:02:00.000Z', old: list('Brampton', 'Mississauga'), new: list('Brampton') },
  ];
  // Eighteen more guest-range edits, one every 20 hours back to mid-September.
  for (let i = 0; i < 18; i++) {
    const n = 20 + i;
    const at = new Date(Date.parse('2026-10-04T20:00:00.000Z') - i * 20 * 3600_000).toISOString();
    const min = 10 + (n % 4) * 5;
    const max = 100 + (n % 5) * 50;
    edits.push({ catererId: `cat-0${n}`, field: 'guests', by: '', at, old: guests(min, max - 25), new: guests(min, max) });
  }
  // Older than 30 days: never in the feed.
  edits.push({ catererId: 'cat-005', field: 'guests', by: 'Paulette Morgan', at: '2026-09-01T14:00:00.000Z', old: guests(20, 100), new: guests(20, 150) });
  return edits.map((e, i) => ({ id: `edit-${String(i + 1).padStart(3, '0')}`, ...e }));
}

function seedModeration(): ModerationState {
  const pelauHistory = [
    h('2025-03-05T00:30:00Z', 'Draft', 'Kendra Baptiste', 'created'),
    h('2025-03-08T14:12:00Z', 'Pending review', 'Kendra Baptiste', 'submitted'),
    h('2025-03-10T18:40:00Z', 'Changes requested', LEAH, 'changes-requested', 'Photo 4 is blurry. Please replace it with a sharper one.'),
    h('2025-03-13T00:05:00Z', 'Pending review', 'Kendra Baptiste', 'resubmitted'),
    h('2025-03-14T15:20:00Z', 'Published', TOMAS, 'approved'),
  ];
  return {
    owners: {},
    history: {
      'cat-001': pelauHistory,
      'cat-024': [
        h('2024-09-01T14:02:00Z', 'Draft', 'Sharon Best', 'created'),
        h('2024-09-05T22:48:00Z', 'Pending review', 'Sharon Best', 'submitted'),
        h('2024-09-09T19:15:00Z', 'Published', LEAH, 'approved'),
      ],
      'cat-910': [h('2026-09-29T00:47:00Z', 'Draft', 'Beverley Campbell', 'created'), h('2026-10-07T18:10:00Z', 'Pending review', 'Beverley Campbell', 'submitted')],
      'cat-911': [
        h('2026-09-22T22:15:00Z', 'Draft', 'Jolene Ollivierre', 'created'),
        h('2026-10-02T23:02:00Z', 'Pending review', 'Jolene Ollivierre', 'submitted'),
        h('2026-10-05T19:30:00Z', 'Changes requested', TOMAS, 'changes-requested', BREADFRUIT_REQUEST),
        h('2026-10-08T13:15:00Z', 'Pending review', 'Jolene Ollivierre', 'resubmitted'),
      ],
      'cat-912': [
        h('2026-09-20T15:00:00Z', 'Draft', 'Anil Maharaj', 'created'),
        h('2026-10-01T15:00:00Z', 'Pending review', 'Anil Maharaj', 'submitted'),
        h('2026-10-05T14:00:00Z', 'Changes requested', LEAH, 'changes-requested', 'Add at least three photos of your own food, each with a caption.'),
      ],
      'cat-916': [
        h('2026-08-12T15:00:00Z', 'Draft', 'Sharon Bailey', 'created'),
        h('2026-08-17T15:00:00Z', 'Pending review', 'Sharon Bailey', 'submitted'),
        h('2026-08-20T15:00:00Z', 'Published', TOMAS, 'approved'),
        h('2026-10-06T16:20:00Z', 'Suspended', LEAH, 'suspended', 'Photos copied from another caterer’s page. Upload photos of your own food and we’ll look again.'),
      ],
      'cat-917': [
        h('2026-08-04T15:00:00Z', 'Draft', 'Clive Dennis', 'created'),
        h('2026-08-08T15:00:00Z', 'Pending review', 'Clive Dennis', 'submitted'),
        h('2026-08-11T15:00:00Z', 'Published', LEAH, 'approved'),
        h('2026-09-28T17:00:00Z', 'Removed', LEAH, 'removed', 'Owner confirmed the business has closed.'),
      ],
      'cat-901': [
        h('2026-08-05T13:00:00Z', 'Draft', 'Winston Daley', 'created'),
        h('2026-08-09T13:00:00Z', 'Pending review', 'Winston Daley', 'submitted'),
        h('2026-08-12T13:00:00Z', 'Published', TOMAS, 'approved'),
        h('2026-09-28T15:00:00Z', 'Removed', LEAH, 'removed', 'Repeated food safety concerns from customers, confirmed by our team.'),
      ],
    },
    snapshots: {
      'cat-911': {
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
    },
    nameRequestedAt: { 'cat-001': '2026-10-09T22:20:00.000Z' },
    expiredCertificates: { 'cat-024': { detectedAt: '2026-10-09T23:30:00.000Z', reminders: ['2026-08-31T13:00:00.000Z', '2026-09-23T13:00:00.000Z'] } },
    updatedAt: {
      'cat-001': '2026-10-10T12:15:00.000Z',
      'cat-018': '2026-10-10T08:12:00.000Z',
      'cat-911': '2026-10-08T13:15:00.000Z',
      'cat-910': '2026-10-07T18:10:00.000Z',
      'cat-024': '2026-10-07T13:00:00.000Z',
      'cat-916': '2026-10-06T16:20:00.000Z',
      'cat-912': '2026-10-05T14:00:00.000Z',
      'cat-913': '2026-10-04T15:00:00.000Z',
      'cat-009': '2026-10-03T15:00:00.000Z',
      'cat-008': '2026-10-02T15:00:00.000Z',
      'cat-914': '2026-10-01T15:00:00.000Z',
      'cat-004': '2026-09-30T15:00:00.000Z',
      'cat-917': '2026-09-28T17:00:00.000Z',
      'cat-901': '2026-09-28T15:00:00.000Z',
      'cat-006': '2026-09-27T15:00:00.000Z',
      'cat-002': '2026-09-25T15:00:00.000Z',
      'cat-915': '2026-09-24T15:00:00.000Z',
      'cat-011': '2026-09-22T15:00:00.000Z',
      'cat-003': '2026-09-20T15:00:00.000Z',
      'cat-005': '2026-09-18T15:00:00.000Z',
      'cat-012': '2026-09-16T15:00:00.000Z',
    },
    edits: seedEdits(),
    closedBySuspension: { 'cat-916': 2 },
    reviewEnquiries: {
      // Devon W.'s replied enquiry to Maracas Bay, which his review is about (report R-2041).
      'review-devon-maracas': {
        id: randomUUID(),
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
          { id: randomUUID(), kind: 'reply', by: 'caterer', at: '2026-08-20T19:40:00.000Z', text: 'Hi Devon, yes, we deliver to Mississauga. For 35 that comes to about $700 before tax. Shall I hold the date?' },
          { id: randomUUID(), kind: 'reply', by: 'customer', at: '2026-08-21T12:10:00.000Z', text: 'Yes please, hold it.' },
        ],
        readAt: {},
      },
    },
    certificateLinks: {},
    emails: [],
  };
}
