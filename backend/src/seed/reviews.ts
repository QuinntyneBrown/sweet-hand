import type { Review } from '../reviews/model.ts';

/**
 * A replied enquiry whose event has passed: what makes a customer eligible to
 * review (L2-049), until the enquiries seed carries these events.
 */
export interface ReviewableEvent {
  userId: string;
  catererId: string;
  enquiryId: string;
  eventDate: string;
  replied: boolean;
}

/**
 * Fictional reviews from docs/mocks/README.md ("Cast and catalog"). All people
 * are fictional. Pelau House has 23 published reviews averaging 4.7 (sum 108).
 */


export const REVIEWABLE_EVENTS: ReviewableEvent[] = [
  // Jean-Robert Pierre: replied enquiry to Pelau House for Sun 6 Sep (can-review).
  { userId: 'user-jean-robert', catererId: 'cat-001', enquiryId: 'enq-jean-robert-pelau', eventDate: '2026-09-06', replied: true },
  // Marcia Thompson's August event, which her review of Pelau House is about.
  { userId: 'user-marcia', catererId: 'cat-001', enquiryId: 'enq-marcia-pelau-aug', eventDate: '2026-08-05', replied: true },
];

const PELAU = 'cat-001';

/** [name, account, rating, event date, created, text] newest first, after Marcia, Andre and Nadia. */
const MORE_PELAU: [string, string | undefined, number, string, string, string][] = [
  ['Devon Walters', 'user-devon', 5, '2026-05-23', '2026-05-30', 'Forty plates of pelau for my son’s graduation and every one came back clean.'],
  ['Simone Alleyne', undefined, 5, '2026-05-09', '2026-05-16', 'The macaroni pie alone was worth it. Set-up was quick and tidy.'],
  ['Kwame Osei', undefined, 4, '2026-04-25', '2026-05-02', 'Lovely curry goat and very fair prices. Arrived twenty minutes late.'],
  ['Rhea Mahabir', undefined, 5, '2026-04-11', '2026-04-18', 'Doubles and aloo pie for a Diwali gathering. Tasted just like home.'],
  ['Leon Bramble', undefined, 5, '2026-03-28', '2026-04-04', 'Kendra helped us plan the whole menu for a christening of 120.'],
  ['Tara Singh', undefined, 4, '2026-03-14', '2026-03-21', 'Callaloo and buss up shut were excellent; the pelau was a touch salty.'],
  ['Camille Duncan', undefined, 5, '2026-02-28', '2026-03-07', 'Hot food, friendly team and not one pan left for us to wash.'],
  ['Marlon Gittens', undefined, 5, '2026-02-14', '2026-02-21', 'Valentine’s dinner for twenty friends. The sorrel went first.'],
  ['Shauna Phillip', undefined, 5, '2026-01-31', '2026-02-07', 'Stewed oxtail that fell off the bone. Everyone asked who cooked.'],
  ['Andrew Persad', undefined, 4, '2026-01-17', '2026-01-24', 'Good portions and good flavour. Would like more vegetarian choices.'],
  ['Keisha Lewis', undefined, 5, '2025-12-20', '2025-12-28', 'Black cake for our office party, soaked just right.'],
  ['Natalie Ramsaran', undefined, 5, '2025-12-06', '2025-12-13', 'Pholourie with tamarind sauce was a hit with the kids and the uncles.'],
  ['Omar Chin', undefined, 4, '2025-11-22', '2025-11-29', 'Tasty food for a big birthday. Communication could have been quicker.'],
  ['Gail Henry', undefined, 5, '2025-11-08', '2025-11-15', 'Our church harvest lunch for 150 went off without a hitch.'],
  ['Ryan Maharaj', undefined, 5, '2025-10-25', '2025-11-01', 'Curry channa and aloo, perfectly spiced. We will book again.'],
  ['Joy Edwards', undefined, 5, '2025-10-11', '2025-10-18', 'Sweet bread and coconut bake for a baby shower. So good.'],
  ['Patrice Noel', undefined, 4, '2025-09-27', '2025-10-04', 'Very good pelau. The chafing dishes ran low on fuel by the end.'],
  ['Wendell Hosein', undefined, 5, '2025-09-13', '2025-09-20', 'Saltfish buljol and fried bake for a Sunday brunch. Perfect.'],
  ['Alicia Charles', undefined, 5, '2025-08-30', '2025-09-06', 'Kendra remembered our nut allergy without being reminded.'],
  ['Brian Ali', undefined, 5, '2025-08-16', '2025-08-23', 'Big family reunion, big flavours. The paw paw chow was a surprise.'],
];

export const at = (date: string) => `${date}T14:00:00.000Z`;

/** Pelau House's public responses: every review but Andre C.'s has one (docs/mocks/pages/dashboard-reviews). */
const PELAU_RESPONSES: Record<string, string> = {
  'review-nadia-pelau': 'Noted, Nadia. Thicker callaloo next time, promise.',
  'review-pelau-4': 'Thank you, Devon. Congratulations to your son!',
  'review-pelau-5': 'Congratulations to you both!',
  'review-pelau-6': 'Sorry about the traffic on the 401, Kwame. Thanks for your patience.',
};

function withResponses(reviews: Review[]): Review[] {
  for (const r of reviews) {
    if (r.catererId !== PELAU || r.response || r.id === 'review-andre-pelau') continue;
    const first = r.authorName.split(' ')[0];
    const day = new Date(new Date(r.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString();
    r.response = { text: PELAU_RESPONSES[r.id] ?? `Thank you, ${first}. It was a pleasure to cook for you.`, createdAt: day };
  }
  return reviews;
}

export function seedReviews(): Review[] {
  return withResponses([
    {
      id: 'review-marcia-pelau',
      catererId: PELAU,
      authorUserId: 'user-marcia',
      authorName: 'Marcia Thompson',
      rating: 5,
      text: 'The pelau tasted like my aunt’s. Ninety people, not a grain left.',
      eventDate: '2026-08-05',
      createdAt: at('2026-09-20'),
      status: 'Published',
      response: { text: 'Thank you, Marcia. Give your aunt our regards!', createdAt: at('2026-09-21') },
    },
    {
      id: 'review-andre-pelau',
      catererId: PELAU,
      authorUserId: 'user-andre',
      authorName: 'Andre Clarke',
      rating: 5,
      text: 'Doubles for 60 at the office, hot and on time. Kendra answered every question the same day.',
      eventDate: '2026-07-05',
      createdAt: at('2026-08-03'),
      status: 'Published',
    },
    {
      id: 'review-nadia-pelau',
      catererId: PELAU,
      authorUserId: 'user-nadia',
      authorName: 'Nadia Joseph',
      rating: 4,
      text: 'Curry goat was the star. I’d ask for the callaloo a little thicker next time.',
      eventDate: '2026-06-04',
      createdAt: at('2026-06-10'),
      status: 'Published',
    },
    ...MORE_PELAU.map(([authorName, authorUserId, rating, eventDate, created, text], i): Review => ({
      id: `review-pelau-${i + 4}`,
      catererId: PELAU,
      authorUserId,
      authorName,
      rating,
      text,
      eventDate,
      createdAt: at(created),
      status: 'Published',
    })),
    // Devon W.'s review of Maracas Bay, the subject of report R-2041.
    {
      id: 'review-devon-maracas',
      catererId: 'cat-009',
      authorUserId: 'user-devon',
      authorName: 'Devon Walters',
      rating: 1,
      text: 'Food was cold and the owner is a crook. Everybody knows that family can’t cook. Avoid.',
      eventDate: '2026-09-12',
      createdAt: at('2026-09-26'),
      status: 'Published',
    },
    // Held and hidden reviews on the operator Reviews screen (docs/mocks/pages/admin-reviews).
    {
      id: 'review-priya-sugar-dumplin',
      catererId: 'cat-008',
      authorName: 'Priya Ramdial',
      rating: 5,
      text: 'The tamarind balls and sugar cake were gone in ten minutes. Call Ondine on 416-555-0187, she’s the best!',
      eventDate: '2026-09-12',
      createdAt: '2026-10-10T11:58:00.000Z',
      status: 'Held',
      holdReason: 'phone',
    },
    {
      id: 'review-andre-cou-cou',
      catererId: 'cat-002',
      authorName: 'Andre Clarke',
      rating: 4,
      text: 'Flying fish and cou-cou like in Oistins. Their photos at instagram.com/coucou.to don’t do it justice.',
      eventDate: '2026-08-22',
      createdAt: '2026-10-10T01:14:00.000Z',
      status: 'Held',
      holdReason: 'link',
    },
    {
      id: 'review-devon-maracas-hidden',
      catererId: 'cat-009',
      authorName: 'Devon Walters',
      rating: 1,
      text: 'Worst bake and shark I’ve had. The guy serving was rude and clearly didn’t want to be there.',
      eventDate: '2026-07-18',
      createdAt: '2026-07-25T14:00:00.000Z',
      status: 'Hidden',
      hidden: { by: null, reports: 3, reason: '', at: '2026-10-08T20:12:00.000Z' },
    },
    {
      id: 'review-kwame-island-pot',
      catererId: 'cat-018',
      authorName: 'Kwame Osei',
      rating: 2,
      text: 'Food was fine but I won’t name names, the cook’s husband was arguing on the phone the whole time.',
      eventDate: '2026-06-20',
      createdAt: '2026-06-27T14:00:00.000Z',
      status: 'Hidden',
      hidden: { by: 'user-tomas', reports: 0, reason: 'Personal details about staff', at: '2026-10-05T14:30:00.000Z' },
    },
  ]);
}
