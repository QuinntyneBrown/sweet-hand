import type { Enquiry } from '../enquiries/model.ts';

/**
 * The answered enquiry whose event has passed that makes Jean-Robert eligible
 * to review Pelau House (L2-049): his church harvest lunch, closed
 * automatically after the event. The fixed id keeps `npm run seed`
 * idempotent. All people and text are fictional.
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
  ];
}
