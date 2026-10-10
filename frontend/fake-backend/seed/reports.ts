/** Fictional reports from docs/mocks/README.md ("Cast and catalog"). All people are fictional. */

export type ReportTargetKind = 'CatererProfile' | 'Review';

export interface Report {
  id: string;
  targetKind: ReportTargetKind;
  /** The caterer's id or the review's id. */
  targetId: string;
  reason: 'Inaccurate information' | 'Inappropriate content' | 'Fake or spam' | 'Food safety concern' | 'Other';
  details?: string;
  /** Empty for a visitor who was not signed in (L2-054). Never in public responses (L2-054.5). */
  reporterUserId?: string;
  /** Which connection sent it, for the hourly limit (L2-054.3); a hash in the real system. */
  connection?: string;
  createdAt: string;
  status: 'Open' | 'Resolved';
  /** Set when an operator resolves it (L2-055.3–4). */
  resolution?: {
    at: string;
    byUserId: string;
    outcome: 'dismissed' | 'hidden' | 'review-removed' | 'suspended' | 'removed';
    note: string;
    auditId: string;
  };
}

export function seedReports(): Report[] {
  return [
    // Marcia's open report on Pelau House from Thu 8 Oct (dialogs/report/duplicate).
    {
      id: 'R-2052',
      targetKind: 'CatererProfile',
      targetId: 'cat-001',
      reason: 'Inaccurate information',
      details: 'The areas list Ajax but they told us they don’t go east of Pickering.',
      reporterUserId: 'user-marcia',
      createdAt: '2026-10-08T23:15:00.000Z',
      status: 'Open',
    },
    // R-2041: Devon W.'s review of Maracas Bay, reported twice (docs/mocks/pages/admin-report/default).
    {
      id: 'R-2041',
      targetKind: 'Review',
      targetId: 'review-devon-maracas',
      reason: 'Fake or spam',
      details: 'This person never booked them. The same words were posted about two other caterers.',
      reporterUserId: 'user-priya',
      createdAt: '2026-10-08T20:12:00.000Z',
      status: 'Open',
    },
    {
      id: 'R-2044',
      targetKind: 'Review',
      targetId: 'review-devon-maracas',
      reason: 'Inappropriate content',
      details: 'It insults the owner’s family, not the food.',
      createdAt: '2026-10-09T15:30:00.000Z',
      status: 'Open',
    },
    // R-2047: a food safety report about Island Pot from a visitor, at 4:12 a.m. today.
    {
      id: 'R-2047',
      targetKind: 'CatererProfile',
      targetId: 'cat-018',
      reason: 'Food safety concern',
      details: 'Several guests at our church harvest supper on Sat 26 Sep were sick the next day. We all ate the curry goat.',
      createdAt: '2026-10-10T08:12:00.000Z',
      status: 'Open',
    },
  ];
}
