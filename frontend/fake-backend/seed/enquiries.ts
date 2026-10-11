/**
 * Fictional enquiries from docs/mocks/README.md ("Enquiries"): Marcia's four
 * and the six Pelau House has received. Ids are random UUIDs (L2-034.2), new
 * for every store, so tests look them up instead of hard-coding them.
 */
import { randomUUID } from 'node:crypto';
import type { Party } from '../../projects/api/src/lib/models/party.ts';
import type { Enquiry } from './enquiry.ts';

export interface EnquiryEvent {
  id: string;
  kind: 'reply' | 'declined' | 'closed' | 'shared';
  /** Who acted; `system` only for automatic closing. */
  by: Party | 'system';
  at: string;
  text?: string;
  note?: string | null;
}

const t = (local: string) => new Date(local).toISOString();

function enquiry(p: Omit<Enquiry, 'id' | 'events' | 'readAt' | 'status' | 'fsa'> & Partial<Enquiry>): Enquiry {
  return { id: randomUUID(), status: 'Open', fsa: null, events: [], readAt: {}, ...p };
}

function event(p: Omit<EnquiryEvent, 'id'>): EnquiryEvent {
  return { id: randomUUID(), ...p };
}

const MARCIA_EVENT = { eventDate: '2026-11-21', guests: 120, area: 'scarborough', fsa: 'M1E', occasion: 'family-gatherings' };

export function seedEnquiries(): Enquiry[] {
  return [
    // Marcia's inbox.
    enquiry({
      customerId: 'user-marcia',
      catererId: 'cat-001',
      ...MARCIA_EVENT,
      message:
        'Hi Kendra, we’re planning my parents’ 40th anniversary at a hall on Ellesmere Road. We’d love pelau, curry goat, macaroni pie and callaloo for about 120 people, served buffet style around 6 p.m. Do you bring chafing dishes?',
      createdAt: t('2026-10-08T19:15:00-04:00'),
      status: 'Replied',
      events: [
        event({
          kind: 'reply',
          by: 'caterer',
          at: t('2026-10-10T09:42:00-04:00'),
          text: 'Hi Marcia, congratulations to your parents! Yes, chafing dishes and serving spoons are included. For 120 the four dishes come to about $2,600 before tax. Shall I hold the date?',
        }),
      ],
      readAt: { customer: t('2026-10-08T19:15:00-04:00'), caterer: t('2026-10-10T09:42:00-04:00') },
    }),
    enquiry({
      customerId: 'user-marcia',
      catererId: 'cat-008',
      ...MARCIA_EVENT,
      message:
        'Hi! We’re having my parents’ 40th anniversary on 21 November, about 120 guests. Could you do sugar dumplins and coconut tarts for dessert, boxed so people can take some home?',
      createdAt: t('2026-10-08T19:32:00-04:00'),
      readAt: { customer: t('2026-10-08T19:32:00-04:00') },
    }),
    enquiry({
      customerId: 'user-marcia',
      catererId: 'cat-006',
      ...MARCIA_EVENT,
      message: 'Hello, we’d love pepperpot, cook-up rice and chow mein for 120 on 21 November in Scarborough. Are you free that evening?',
      createdAt: t('2026-10-05T20:10:00-04:00'),
      status: 'Declined',
      events: [
        event({ kind: 'declined', by: 'caterer', at: t('2026-10-06T11:20:00-04:00'), note: 'Fully booked that weekend. Sorry, and congratulations to your parents.' }),
      ],
      readAt: { customer: t('2026-10-06T12:00:00-04:00') },
    }),
    enquiry({
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
        event({ kind: 'reply', by: 'caterer', at: t('2026-08-03T21:30:00-04:00'), text: 'Bonswa Marcia! Yes, we can. Griot for 45 with pikliz and djon djon rice is $1,150.' }),
        event({ kind: 'reply', by: 'customer', at: t('2026-08-04T07:12:00-04:00'), text: 'Wonderful, let’s book it.' }),
        event({ kind: 'closed', by: 'customer', at: t('2026-09-05T08:00:00-04:00') }),
      ],
      readAt: { customer: t('2026-09-05T08:00:00-04:00'), caterer: t('2026-09-05T09:00:00-04:00') },
    }),

    // Pelau House's other enquiries (Marcia's is the first above).
    enquiry({
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
    enquiry({
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
    enquiry({
      customerId: 'user-nadia',
      catererId: 'cat-001',
      eventDate: '2026-10-17',
      guests: 40,
      area: 'pickering',
      occasion: 'birthdays',
      message: 'Hi! Could you cater my daughter’s 16th birthday for 40 people? Doubles, pholourie and something sweet would be perfect.',
      createdAt: t('2026-10-04T11:20:00-04:00'),
      status: 'Declined',
      events: [event({ kind: 'declined', by: 'caterer', at: t('2026-10-05T07:58:00-04:00'), note: 'Fully booked that weekend.' })],
      readAt: { caterer: t('2026-10-05T07:58:00-04:00') },
    }),
    enquiry({
      customerId: 'user-jean-robert',
      catererId: 'cat-001',
      eventDate: '2026-09-06',
      guests: 80,
      area: 'scarborough',
      occasion: 'religious-and-cultural-celebrations',
      message: 'Bonjou! Our church is hosting a harvest lunch for about 80 people. Could you do pelau and curry channa, with a vegan option?',
      createdAt: t('2026-08-17T18:40:00-04:00'),
      status: 'Closed',
      events: [
        event({ kind: 'reply', by: 'caterer', at: t('2026-08-18T09:05:00-04:00'), text: 'Happy to help. Pelau, curry channa and callaloo (vegan) for 80 is $1,450 before tax, delivered hot at 12:30.' }),
        event({ kind: 'reply', by: 'customer', at: t('2026-08-18T12:14:00-04:00'), text: 'Perfect, please book us in. Mèsi anpil!' }),
        event({ kind: 'closed', by: 'system', at: t('2026-10-06T03:00:00-04:00') }),
      ],
      readAt: { customer: t('2026-10-06T08:00:00-04:00'), caterer: t('2026-10-06T08:00:00-04:00') },
    }),
    enquiry({
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
        event({ kind: 'reply', by: 'caterer', at: t('2026-09-12T10:31:00-04:00'), text: 'We can do that for $780 before tax. Black cake needs a week’s notice.' }),
        event({ kind: 'reply', by: 'customer', at: t('2026-09-22T18:02:00-04:00'), text: 'Thanks, I’ll confirm by Tuesday.' }),
      ],
      readAt: { caterer: t('2026-09-22T19:00:00-04:00') },
    }),
  ];
}
