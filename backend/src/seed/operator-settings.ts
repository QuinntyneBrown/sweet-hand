/**
 * Operator console settings and metrics state from docs/mocks/README.md: the
 * breach register. Every person and record is fictional.
 */
import type { Breach, OperatorActivity } from '../operator-settings/model.ts';
import type { AuditEntry } from '../platform/audit.ts';

type Change = [action: string, targetType: string, targetId: string, reason: string, before: string | null, after: string | null];

/** The audit log as of today (docs/mocks/pages/admin-audit/default.html), oldest first. */
export function seedAudit(): AuditEntry[] {
  const history: [string, string, string, ...Change][] = [
    ['aud-0991', '2026-09-28T15:42:00Z', 'user-leah', 'HideReview', 'review', 'review-kwame-island-pot', 'Contains a home address', 'Published', 'Hidden'],
    ['aud-0992', '2026-09-30T13:00:00Z', 'user-leah', 'Approve', 'caterer', 'cat-004', 'Meets every check', 'Pending review', 'Published'],
    ['aud-1001', '2026-10-05T13:00:00Z', 'user-leah', 'CreateOperator', 'operator', 'user-tomas', 'New operator for weekend coverage', null, 'Operator'],
    ['aud-1002', '2026-10-05T18:15:00Z', 'user-leah', 'DismissReports', 'report', 'R-2033', 'Dismissed: photos match the caterer’s own kitchen', 'Open', 'Dismissed'],
    ['aud-1003', '2026-10-05T19:15:00Z', 'user-leah', 'RequestChanges', 'caterer', 'cat-breadfruit-and-butter', 'Photos 3 and 4 show another business’s logo', 'Pending review', 'Changes requested'],
    ['aud-1004', '2026-10-06T15:42:00Z', 'user-leah', 'Revert', 'caterer', 'cat-009', 'Description asked customers to pay off the platform', 'Edited', 'previous text'],
    ['aud-1005', '2026-10-07T14:00:00Z', 'user-leah', 'Edit', 'caterer', 'cat-002', 'Removed phone number from description', '“…call 416-555-0170…”', '“…”'],
    ['aud-1006', '2026-10-09T15:05:00Z', 'user-tomas', 'Approve', 'caterer', 'cat-020', 'Meets every check; certificate verified', 'Pending review', 'Published'],
    ['aud-1007', '2026-10-09T20:30:00Z', 'user-leah', 'Suspend', 'caterer', 'cat-024', 'Food handler certificate expired on 30 Sep 2026', 'Published', 'Suspended'],
    ['aud-1008', '2026-10-10T12:47:00Z', 'user-leah', 'EnquiryAccess', 'enquiry', 'enq-island-pot-r2047', 'Checking a reported request for off-platform payment', null, null],
    ['aud-1009', '2026-10-10T13:12:00Z', 'user-tomas', 'HideReview', 'review', 'review-devon-maracas-hidden', 'Personal attack on staff, 3 reports', 'Published', 'Hidden'],
  ];
  return history.map(([id, at, operatorId, action, targetType, targetId, reason, before, after], i) => ({
    id,
    at: new Date(at).toISOString(),
    seq: i + 1,
    operatorId,
    action,
    targetType,
    targetId,
    reason,
    before,
    after,
  }));
}

/** 1,284 entries over the year before `now` (docs/mocks/pages/admin-audit/long.html), oldest first. */
export function longAudit(now: Date): AuditEntry[] {
  const kinds: Change[] = [
    ['Approve', 'caterer', 'cat-004', 'Meets every check', 'Pending review', 'Published'],
    ['HideReview', 'review', 'review-kwame-island-pot', 'Contains a home address', 'Published', 'Hidden'],
    ['Edit', 'caterer', 'cat-014', 'Removed an email address', 'Changed description', 'Changed description'],
    ['DismissReports', 'report', 'R-2033', 'Report not supported by the photos', 'Open', 'Dismissed'],
    ['RequestChanges', 'caterer', 'cat-024', 'Menu has fewer than 3 dishes with names', 'Pending review', 'Changes requested'],
  ];
  return Array.from({ length: 1284 }, (_, i) => {
    const [action, targetType, targetId, reason, before, after] = kinds[i % kinds.length];
    const at = new Date(now.getTime() - (1284 - i) * 6.8 * 3600_000).toISOString();
    return { id: `aud-l${String(i).padStart(4, '0')}`, at, seq: i + 1, operatorId: i % 2 ? 'user-tomas' : 'user-leah', action, targetType, targetId, reason, before, after };
  });
}

/** Tomas last used the console this morning (docs/mocks/pages/admin-operators). */
export const seedOperatorActivity = (): OperatorActivity[] => [{ id: 'user-tomas', lastActiveAt: '2026-10-10T12:15:00.000Z' }];

export const seedBreaches = (): Breach[] => [
  {
    id: 'br-2025-01',
    title: 'Team laptop stolen from a car',
    confirmedOn: '2025-03-11',
    recordedAt: '2025-03-11T19:00:00.000Z',
    recordedBy: 'Leah Mohammed',
    recordedById: 'user-leah',
    information: 'None confirmed. The laptop held no customer data and was fully encrypted.',
    peopleAffected: 0,
    riskAssessment: 'Low. Disk encryption on, wiped remotely within 2 hours.',
    notificationDecision: 'Not reportable. Kept on the register for the record.',
  },
  {
    id: 'br-2026-01',
    title: 'Enquiry email sent to the wrong caterer',
    confirmedOn: '2026-09-17',
    recordedAt: '2026-09-17T20:00:00.000Z',
    recordedBy: 'Leah Mohammed',
    recordedById: 'user-leah',
    information: 'A customer’s display name and event details (date, guests, area). No email or phone.',
    peopleAffected: 1,
    riskAssessment: 'Low. The other caterer confirmed they deleted the email the same day.',
    notificationDecision: 'Not reported to the Privacy Commissioner: no real risk of significant harm. The customer was told on Fri 18 Sep.',
  },
];
