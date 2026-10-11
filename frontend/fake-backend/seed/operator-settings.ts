/**
 * Operator console settings and metrics state: cuisine history, the breach
 * register, operator invitations and activity, and the daily metrics
 * aggregates (docs/mocks/README.md: metrics start 3 Aug 2026; 12 enquiries in
 * the week of 28 Sep 2026). Every person and record is fictional.
 */
import type { AuditEntry } from '../../projects/api/src/lib/models/audit-entry.ts';
import type { BreachRecord } from '../../projects/api/src/lib/models/breach-record.ts';
import type { OperatorSettingsState } from './operator-settings-state.ts';

export interface DailyMetrics {
  /** YYYY-MM-DD in Toronto. */
  date: string;
  listing: number;
  caterer: number;
  unique: number;
  enquiries: number;
  replied: number;
  published: number;
}

/** Targets that live in other areas' data, for audit entries about them. */
export const KNOWN_TARGETS: Record<string, string> = {
  'cat-breadfruit-and-butter': 'Breadfruit & Butter',
  'enq-island-pot-r2047': 'Enquiry with Island Pot',
  'R-2033': 'Report on Sugar Dumplin',
};

export const at = (iso: string) => new Date(iso).toISOString();

/** The audit log as of today (docs/mocks/pages/admin-audit/default.html), oldest first. */
export function seedAudit(): AuditEntry[] {
  const e = (id: string, when: string, operatorId: string, action: string, targetType: string, targetId: string, reason: string, before: string | null, after: string | null): AuditEntry => ({
    id,
    at: at(when),
    operatorId,
    action,
    targetType,
    targetId,
    reason,
    before,
    after,
  });
  return [
    e('aud-0991', '2026-09-28T15:42:00Z', 'user-leah', 'HideReview', 'review', 'review-kwame-island-pot', 'Contains a home address', 'Published', 'Hidden'),
    e('aud-0992', '2026-09-30T13:00:00Z', 'user-leah', 'Approve', 'caterer', 'cat-004', 'Meets every check', 'Pending review', 'Published'),
    e('aud-1001', '2026-10-05T13:00:00Z', 'user-leah', 'CreateOperator', 'operator', 'user-tomas', 'New operator for weekend coverage', null, 'Operator'),
    e('aud-1002', '2026-10-05T18:15:00Z', 'user-leah', 'DismissReports', 'report', 'R-2033', 'Dismissed: photos match the caterer’s own kitchen', 'Open', 'Dismissed'),
    e('aud-1003', '2026-10-05T19:15:00Z', 'user-leah', 'RequestChanges', 'caterer', 'cat-breadfruit-and-butter', 'Photos 3 and 4 show another business’s logo', 'Pending review', 'Changes requested'),
    e('aud-1004', '2026-10-06T15:42:00Z', 'user-leah', 'Revert', 'caterer', 'cat-009', 'Description asked customers to pay off the platform', 'Edited', 'previous text'),
    e('aud-1005', '2026-10-07T14:00:00Z', 'user-leah', 'Edit', 'caterer', 'cat-002', 'Removed phone number from description', '“…call 416-555-0170…”', '“…”'),
    e('aud-1006', '2026-10-09T15:05:00Z', 'user-tomas', 'Approve', 'caterer', 'cat-020', 'Meets every check; certificate verified', 'Pending review', 'Published'),
    e('aud-1007', '2026-10-09T20:30:00Z', 'user-leah', 'Suspend', 'caterer', 'cat-024', 'Food handler certificate expired on 30 Sep 2026', 'Published', 'Suspended'),
    e('aud-1008', '2026-10-10T12:47:00Z', 'user-leah', 'EnquiryAccess', 'enquiry', 'enq-island-pot-r2047', 'Checking a reported request for off-platform payment', null, null),
    e('aud-1009', '2026-10-10T13:12:00Z', 'user-tomas', 'HideReview', 'review', 'review-devon-maracas-hidden', 'Personal attack on staff, 3 reports', 'Published', 'Hidden'),
  ];
}

/** 1,284 entries over the past year (docs/mocks/pages/admin-audit/long.html), oldest first. */
export function longAudit(now: Date): AuditEntry[] {
  const kinds: [string, string, string, string, string | null, string | null][] = [
    ['Approve', 'caterer', 'cat-004', 'Meets every check', 'Pending review', 'Published'],
    ['HideReview', 'review', 'review-kwame-island-pot', 'Contains a home address', 'Published', 'Hidden'],
    ['Edit', 'caterer', 'cat-014', 'Removed an email address', 'Changed description', 'Changed description'],
    ['DismissReports', 'report', 'R-2033', 'Report not supported by the photos', 'Open', 'Dismissed'],
    ['RequestChanges', 'caterer', 'cat-024', 'Menu has fewer than 3 dishes with names', 'Pending review', 'Changes requested'],
  ];
  const out: AuditEntry[] = [];
  for (let i = 0; i < 1284; i++) {
    const [action, targetType, targetId, reason, before, after] = kinds[i % kinds.length];
    const when = new Date(now.getTime() - (1284 - i) * 6.8 * 60 * 60 * 1000);
    out.push({ id: `aud-l${i}`, at: when.toISOString(), operatorId: i % 2 ? 'user-tomas' : 'user-leah', action, targetType, targetId, reason, before, after });
  }
  return out;
}

const BREACHES: BreachRecord[] = [
  {
    id: 'br-2025-01',
    title: 'Team laptop stolen from a car',
    confirmedOn: '2025-03-11',
    recordedAt: '2025-03-11T19:00:00.000Z',
    recordedBy: 'Leah Mohammed',
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
    information: 'A customer’s display name and event details (date, guests, area). No email or phone.',
    peopleAffected: 1,
    riskAssessment: 'Low. The other caterer confirmed they deleted the email the same day.',
    notificationDecision: 'Not reported to the Privacy Commissioner: no real risk of significant harm. The customer was told on Fri 18 Sep.',
  },
];

/**
 * Weekly figures, Monday to Sunday, from 3 Aug 2026; the last week runs to
 * Saturday 10 Oct. Weeks from 31 Aug match docs/mocks/pages/admin-metrics.
 * [enquiries per day, replied within 48 hours per day, listing, caterer, unique, published per day]
 */
const WEEKS: [number[], number[], number, number, number, number[]][] = [
  [[0, 1, 0, 1, 0, 1, 0], [0, 1, 0, 1, 0, 0, 0], 1850, 3020, 1410, [0, 0, 0, 0, 0, 0, 0]],
  [[1, 0, 1, 1, 0, 1, 1], [1, 0, 1, 1, 0, 1, 0], 2240, 3860, 1690, [2, 0, 0, 0, 0, 0, 0]],
  [[1, 1, 0, 1, 1, 1, 1], [1, 1, 0, 1, 1, 1, 0], 2610, 4390, 1880, [0, 0, 0, 0, 0, 0, 0]],
  [[1, 1, 1, 1, 1, 1, 1], [1, 1, 1, 1, 1, 0, 0], 2890, 5020, 2050, [0, 0, 1, 0, 0, 0, 0]],
  [[1, 1, 2, 1, 1, 1, 1], [1, 1, 2, 1, 1, 0, 0], 3120, 5610, 2210, [0, 1, 0, 0, 0, 0, 0]],
  [[2, 1, 2, 1, 2, 2, 1], [2, 1, 2, 1, 1, 1, 1], 3480, 6020, 2390, [0, 0, 0, 0, 0, 0, 0]],
  [[2, 2, 3, 2, 2, 2, 2], [2, 2, 2, 2, 2, 1, 1], 4050, 7140, 2760, [0, 1, 0, 1, 0, 0, 0]],
  [[2, 2, 2, 2, 2, 2, 1], [2, 2, 2, 2, 1, 1, 1], 3910, 6880, 2640, [0, 0, 0, 0, 0, 0, 0]],
  [[2, 2, 2, 2, 1, 2, 1], [2, 2, 2, 1, 1, 1, 1], 4240, 7350, 2890, [0, 0, 0, 1, 0, 0, 0]],
  [[3, 3, 2, 2, 1, 1], [3, 2, 2, 0, 0, 0], 3870, 6700, 2580, [0, 0, 0, 0, 0, 0]],
];

/** Splits a weekly total over its days so the parts add up exactly. */
function split(total: number, days: number): number[] {
  const base = Math.floor(total / days);
  return Array.from({ length: days }, (_, i) => base + (i < total - base * days ? 1 : 0));
}

function addDays(date: string, n: number): string {
  const d = new Date(`${date}T12:00:00Z`);
  d.setUTCDate(d.getUTCDate() + n);
  return d.toISOString().slice(0, 10);
}

export function seedMetrics(): DailyMetrics[] {
  const out: DailyMetrics[] = [];
  WEEKS.forEach(([enquiries, replied, listing, caterer, unique, published], w) => {
    const days = enquiries.length;
    const [l, c, u] = [split(listing, days), split(caterer, days), split(unique, days)];
    for (let d = 0; d < days; d++) {
      out.push({ date: addDays('2026-08-03', w * 7 + d), listing: l[d], caterer: c[d], unique: u[d], enquiries: enquiries[d], replied: replied[d], published: published[d] });
    }
  });
  return out;
}

export function seedOperatorSettings(): OperatorSettingsState {
  return {
    cuisineAddedBy: {},
    cuisineRetiredAt: {},
    breaches: BREACHES.map((b) => ({ ...b })),
    invitations: [],
    deactivated: {},
    lastActive: { 'user-tomas': '2026-10-10T12:15:00.000Z' },
    securityEvents: [],
    metricsStart: '2026-08-03',
    metrics: seedMetrics(),
    otherStatuses: [
      { status: 'Pending review', count: 3 },
      { status: 'Changes requested', count: 1 },
      { status: 'Draft', count: 9 },
      { status: 'Suspended', count: 1 },
      { status: 'Removed', count: 2 },
    ],
    publishedToday: 60,
  };
}
