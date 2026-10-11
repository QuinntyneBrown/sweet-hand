import type { Enquiry } from '../enquiries/model.ts';

/**
 * The two answered enquiries whose events have passed that the review cast
 * needs (L2-049): Jean-Robert may write a review of Pelau House, and Marcia's
 * review of Pelau House is about her August event. Fixed ids keep `npm run
 * seed` idempotent. All people and text are fictional.
 */
export function seedReviewEnquiries(): Enquiry[] {
  return [
    {
      id: 'enq-jean-robert-pelau',
      customerId: 'user-jean-robert',
      catererId: 'cat-001',
      eventDate: '2026-09-06',
      guests: 80,
      area: 'scarborough',
      fsa: null,
      occasion: 'religious-and-cultural-celebrations',
      message: 'Bonjou! Our church is hosting a harvest lunch for about 80 people. Could you do pelau and curry channa, with a vegan option?',
      createdAt: '2026-08-17T22:40:00.000Z',
      status: 'Closed',
      events: [
        {
          id: 'enq-jean-robert-pelau-1',
          kind: 'reply',
          by: 'caterer',
          at: '2026-08-18T13:05:00.000Z',
          text: 'Happy to help. Pelau, curry channa and callaloo (vegan) for 80 is $1,450 before tax, delivered hot at 12:30.',
        },
        { id: 'enq-jean-robert-pelau-2', kind: 'reply', by: 'customer', at: '2026-08-18T16:14:00.000Z', text: 'Perfect, please book us in. Mèsi anpil!' },
        { id: 'enq-jean-robert-pelau-3', kind: 'closed', by: 'system', at: '2026-10-06T07:00:00.000Z' },
      ],
      readAt: { customer: '2026-10-06T12:00:00.000Z', caterer: '2026-10-06T12:00:00.000Z' },
    },
    {
      id: 'enq-marcia-pelau-aug',
      customerId: 'user-marcia',
      catererId: 'cat-001',
      eventDate: '2026-08-05',
      guests: 90,
      area: 'scarborough',
      fsa: 'M1E',
      occasion: 'family-gatherings',
      message: 'Hi Kendra, my aunt turns 80 in August and we expect about 90 family members at a hall in Scarborough. Could you do pelau, macaroni pie and stewed chicken?',
      createdAt: '2026-07-10T23:20:00.000Z',
      status: 'Replied',
      events: [
        {
          id: 'enq-marcia-pelau-aug-1',
          kind: 'reply',
          by: 'caterer',
          at: '2026-07-11T14:10:00.000Z',
          text: 'Happy birthday to your aunt! We can do all three for 90 guests for about $1,900 before tax, set up by 5 p.m.',
        },
        { id: 'enq-marcia-pelau-aug-2', kind: 'reply', by: 'customer', at: '2026-07-11T18:45:00.000Z', text: 'Wonderful, please hold the date.' },
      ],
      readAt: { customer: '2026-07-11T18:45:00.000Z', caterer: '2026-07-12T13:00:00.000Z' },
    },
  ];
}
