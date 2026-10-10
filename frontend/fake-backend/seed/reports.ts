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
    // R-2041: Devon W.'s review of Maracas Bay.
    {
      id: 'R-2041',
      targetKind: 'Review',
      targetId: 'review-devon-maracas',
      reason: 'Inappropriate content',
      details: 'Reads like a competitor, not a customer.',
      reporterUserId: 'user-priya',
      createdAt: '2026-10-07T15:40:00.000Z',
      status: 'Open',
    },
    // R-2047: a food safety report about Island Pot from a visitor.
    {
      id: 'R-2047',
      targetKind: 'CatererProfile',
      targetId: 'cat-018',
      reason: 'Food safety concern',
      details: 'Several guests were ill the morning after our party.',
      createdAt: '2026-10-09T12:05:00.000Z',
      status: 'Open',
    },
  ];
}
