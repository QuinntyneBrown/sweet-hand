import type { Session } from '../identity/model.ts';
import type { PrivacyNoticeVersion } from '../identity/privacy.ts';
import { PRIVACY_NOTICE_ID } from '../identity/privacy.ts';
import { sha256 } from '../platform/secrets.ts';

/** Marcia's and Kendra's other devices (docs/mocks/pages/account). No browser holds these tokens. */
export const seedSessions = (): Session[] => [
  { id: 'ses-marcia-iphone', tokenHash: sha256('seed-marcia-iphone'), userId: 'user-marcia', device: 'Safari on iPhone', createdAt: '2026-09-12T13:00:00Z', lastActiveAt: '2026-10-10T12:15:00Z' },
  { id: 'ses-marcia-android', tokenHash: sha256('seed-marcia-android'), userId: 'user-marcia', device: 'Samsung Internet on Android', createdAt: '2026-09-12T16:00:00Z', lastActiveAt: '2026-09-28T22:40:00Z' },
  { id: 'ses-kendra-mac', tokenHash: sha256('seed-kendra-mac'), userId: 'user-kendra', device: 'Chrome on Mac', createdAt: '2026-09-20T13:00:00Z', lastActiveAt: '2026-10-10T01:03:00Z' },
];

export const seedPrivacyNotice = (): PrivacyNoticeVersion => ({
  id: PRIVACY_NOTICE_ID,
  version: '2026-03',
  effectiveDate: '2026-03-01',
  substantialChange: false,
  changes: [],
});
