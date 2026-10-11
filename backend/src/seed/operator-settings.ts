/**
 * Operator console settings and metrics state from docs/mocks/README.md: the
 * breach register. Every person and record is fictional.
 */
import type { Breach } from '../operator-settings/model.ts';

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
