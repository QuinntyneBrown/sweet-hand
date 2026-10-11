/**
 * Fictional enquiries from docs/mocks/README.md ("Enquiries"): Marcia's four
 * and the others Pelau House has received. Ids are UUID-shaped like every
 * enquiry id (L2-034.2) but derived from a fixed name, so `npm run seed`
 * stays idempotent.
 *
 * Jean-Robert Pierre's closed harvest-lunch enquiry to Pelau House is seeded
 * by the reviews area as `enq-jean-robert-pelau`, since it is what makes him
 * eligible to review (L2-049).
 */
import type { Enquiry, EnquiryEvent } from '../enquiries/model.ts';
import { stableUuid } from '../enquiries/model.ts';

const t = (local: string) => new Date(local).toISOString();

function enquiry(key: string, p: Omit<Enquiry, 'id' | 'events' | 'readAt' | 'status' | 'fsa'> & Partial<Omit<Enquiry, 'events'>> & { events?: Omit<EnquiryEvent, 'id'>[] }): Enquiry {
  const { events = [], ...rest } = p;
  return {
    id: stableUuid(`enquiry:${key}`),
    status: 'Open',
    fsa: null,
    readAt: {},
    ...rest,
    events: events.map((e, i) => ({ id: stableUuid(`enquiry:${key}:event:${i}`), ...e })),
  };
}

const MARCIA_EVENT = { eventDate: '2026-11-21', guests: 120, area: 'scarborough', fsa: 'M1E', occasion: 'family-gatherings' };

export function seedEnquiries(): Enquiry[] {
  return [
    // Marcia's inbox.
    enquiry('marcia-pelau-house', {
      customerId: 'user-marcia',
      catererId: 'cat-001',
      ...MARCIA_EVENT,
      message:
        'Hi Kendra, we’re planning my parents’ 40th anniversary at a hall on Ellesmere Road. We’d love pelau, curry goat, macaroni pie and callaloo for about 120 people, served buffet style around 6 p.m. Do you bring chafing dishes?',
      createdAt: t('2026-10-08T19:15:00-04:00'),
      status: 'Replied',
      events: [
        {
          kind: 'reply',
          by: 'caterer',
          at: t('2026-10-10T09:42:00-04:00'),
          text: 'Hi Marcia, congratulations to your parents! Yes, chafing dishes and serving spoons are included. For 120 the four dishes come to about $2,600 before tax. Shall I hold the date?',
        },
      ],
      readAt: { customer: t('2026-10-08T19:15:00-04:00'), caterer: t('2026-10-10T09:42:00-04:00') },
    }),
    enquiry('marcia-sugar-dumplin', {
      customerId: 'user-marcia',
      catererId: 'cat-008',
      ...MARCIA_EVENT,
      message:
        'Hi! We’re having my parents’ 40th anniversary on 21 November, about 120 guests. Could you do sugar dumplins and coconut tarts for dessert, boxed so people can take some home?',
      createdAt: t('2026-10-08T19:32:00-04:00'),
      readAt: { customer: t('2026-10-08T19:32:00-04:00') },
    }),
    enquiry('marcia-demerara-kitchen', {
      customerId: 'user-marcia',
      catererId: 'cat-006',
      ...MARCIA_EVENT,
      message: 'Hello, we’d love pepperpot, cook-up rice and chow mein for 120 on 21 November in Scarborough. Are you free that evening?',
      createdAt: t('2026-10-05T20:10:00-04:00'),
      status: 'Declined',
      events: [{ kind: 'declined', by: 'caterer', at: t('2026-10-06T11:20:00-04:00'), note: 'Fully booked that weekend. Sorry, and congratulations to your parents.' }],
      readAt: { customer: t('2026-10-06T12:00:00-04:00') },
    }),
    enquiry('marcia-ti-kay', {
      customerId: 'user-marcia',
      catererId: 'cat-004',
      eventDate: '2026-08-23',
      guests: 45,
      area: 'etobicoke',
      occasion: 'birthdays',
      message: 'Bonjou! It’s my sister’s 50th. Could you do griot, pikliz and diri ak djon djon for 45?',
      createdAt: t('2026-08-03T18:05:00-04:00'),
      status: 'Closed',
      events: [
        { kind: 'reply', by: 'caterer', at: t('2026-08-03T21:30:00-04:00'), text: 'Bonswa Marcia! Yes, we can. Griot for 45 with pikliz and djon djon rice is $1,150.' },
        { kind: 'reply', by: 'customer', at: t('2026-08-04T07:12:00-04:00'), text: 'Wonderful, let’s book it.' },
        { kind: 'closed', by: 'customer', at: t('2026-09-05T08:00:00-04:00') },
      ],
      readAt: { customer: t('2026-09-05T08:00:00-04:00'), caterer: t('2026-09-05T09:00:00-04:00') },
    }),

    // Pelau House's other enquiries (Marcia's is the first above).
    enquiry('priya-pelau-house', {
      customerId: 'user-priya',
      catererId: 'cat-001',
      eventDate: '2026-11-05',
      guests: 60,
      area: 'downtown-toronto',
      fsa: 'M5V',
      occasion: 'corporate-events',
      message:
        'Hello! We’re hosting a lunch for our team of 60 near King and Spadina on Thursday 5 November, around noon. Could you do doubles, aloo pie, curry channa and one more vegan dish? A few people avoid gluten.',
      createdAt: t('2026-10-09T16:15:00-04:00'),
      readAt: { customer: t('2026-10-09T16:15:00-04:00') },
    }),
    enquiry('andre-pelau-house', {
      customerId: 'user-andre',
      catererId: 'cat-001',
      eventDate: '2027-06-12',
      guests: 250,
      area: 'brampton',
      fsa: 'L6P',
      occasion: 'weddings',
      message: 'Good morning! We’re getting married on 12 June next year, about 250 guests at a banquet hall in Brampton. Could you quote for pelau, curry goat, buss up shut and macaroni pie?',
      createdAt: t('2026-10-08T11:30:00-04:00'),
      readAt: { customer: t('2026-10-08T11:30:00-04:00') },
    }),
    enquiry('nadia-pelau-house', {
      customerId: 'user-nadia',
      catererId: 'cat-001',
      eventDate: '2026-10-17',
      guests: 40,
      area: 'pickering',
      occasion: 'birthdays',
      message: 'Hi! Could you cater my daughter’s 16th birthday for 40 people? Doubles, pholourie and something sweet would be perfect.',
      createdAt: t('2026-10-04T11:20:00-04:00'),
      status: 'Declined',
      events: [{ kind: 'declined', by: 'caterer', at: t('2026-10-05T07:58:00-04:00'), note: 'Fully booked that weekend.' }],
      readAt: { caterer: t('2026-10-05T07:58:00-04:00') },
    }),
    enquiry('former-customer-pelau-house', {
      // A customer who has since deleted their account (L2-072.2).
      customerId: 'user-deleted-0917',
      catererId: 'cat-001',
      eventDate: '2026-09-26',
      guests: 35,
      area: 'east-york',
      occasion: 'birthdays',
      message: 'Looking for a small birthday spread for 35: pelau, macaroni pie and black cake.',
      createdAt: t('2026-09-11T19:12:00-04:00'),
      status: 'Replied',
      events: [
        { kind: 'reply', by: 'caterer', at: t('2026-09-12T10:31:00-04:00'), text: 'We can do that for $780 before tax. Black cake needs a week’s notice.' },
        { kind: 'reply', by: 'customer', at: t('2026-09-22T18:02:00-04:00'), text: 'Thanks, I’ll confirm by Tuesday.' },
      ],
      readAt: { caterer: t('2026-09-22T19:00:00-04:00') },
    }),
  ];
}
