/** Fictional accounts from docs/mocks/README.md. Every seeded account uses SEED_PASSWORD. */
import type { User } from '../identity/model.ts';
import { hashPassword } from '../platform/secrets.ts';

export const SEED_PASSWORD = 'pepperpot-sunday-2026';

/** Leah's authenticator app secret (base32); fictional, for the seeded operator only. */
export const LEAH_TOTP_SECRET = 'JBSWY3DPEHPK3PXPSWEETHAND';

type SeedUser = Omit<User, 'passwordHash' | 'emailKey' | 'passwordChangedAt' | 'emailVerified' | 'createdAt' | 'acceptedPrivacyVersion' | 'acceptedPrivacyAt'> &
  Partial<Pick<User, 'passwordChangedAt' | 'emailVerified' | 'createdAt'>>;

const SEED: SeedUser[] = [
  { id: 'user-marcia', role: 'Customer', displayName: 'Marcia Thompson', email: 'marcia.t@example.com', phone: '+1 647 555 0187', createdAt: '2026-03-14T15:20:00Z' },
  { id: 'user-andre', role: 'Customer', displayName: 'Andre Clarke', email: 'andre.c@example.com' },
  { id: 'user-priya', role: 'Customer', displayName: 'Priya Ramdial', email: 'priya.r@example.com' },
  { id: 'user-nadia', role: 'Customer', displayName: 'Nadia Joseph', email: 'nadia.j@example.com' },
  { id: 'user-jean-robert', role: 'Customer', displayName: 'Jean-Robert Pierre', email: 'jr.pierre@example.com' },
  { id: 'user-devon', role: 'Customer', displayName: 'Devon Walters', email: 'devon.w@example.com' },
  {
    id: 'user-kendra',
    role: 'Caterer',
    displayName: 'Kendra Baptiste',
    email: 'kendra@pelauhouse.example',
    phone: '+1 416 555 0142',
    catererId: 'cat-001',
    createdAt: '2025-01-20T15:00:00Z',
    passwordChangedAt: '2026-08-02T16:00:00Z',
  },
  // Caterer accounts behind the dashboard (docs/mocks/README.md, "Other caterer accounts").
  { id: 'user-vishnu', role: 'Caterer', displayName: 'Vishnu Ramlogan', email: 'vishnu@maracasbay.example', phone: '+1 905 555 0171', catererId: 'cat-009', createdAt: '2025-06-02T14:00:00Z' },
  { id: 'user-paulette', role: 'Caterer', displayName: 'Paulette Morgan', email: 'paulette@blackcakeco.example', phone: '+1 905 555 0128', catererId: 'cat-005', createdAt: '2025-11-12T14:00:00Z' },
  { id: 'user-desmond', role: 'Caterer', displayName: 'Desmond Greaves', email: 'desmond@coucou.example', phone: '+1 416 555 0193', catererId: 'cat-002', createdAt: '2022-01-10T14:00:00Z' },
  { id: 'user-sharon', role: 'Caterer', displayName: 'Sharon Best', email: 'sharon@flyingfish.example', phone: '+1 905 555 0136', catererId: 'cat-024', createdAt: '2021-10-01T14:00:00Z' },
  { id: 'user-winston', role: 'Caterer', displayName: 'Winston Daley', email: 'winston@coalpot.example', phone: '+1 905 555 0157', catererId: 'cat-901', createdAt: '2026-08-05T13:00:00Z' },
  { id: 'user-leah', role: 'Operator', displayName: 'Leah Mohammed', email: 'leah@sweethand.example', admin: true, secondFactor: 'authenticator app', totpSecret: LEAH_TOTP_SECRET },
  { id: 'user-tomas', role: 'Operator', displayName: 'Tomas Reyes', email: 'tomas@sweethand.example', admin: false, secondFactor: 'security key' },
];

/** Each account's hash is computed once per process, each with its own salt. */
const hashes = new Map<string, Promise<string>>();
export function seedPasswordHash(key: string): Promise<string> {
  let h = hashes.get(key);
  if (!h) {
    h = hashPassword(SEED_PASSWORD);
    hashes.set(key, h);
  }
  return h;
}

export async function seedUser(p: SeedUser): Promise<User> {
  return {
    passwordChangedAt: '2026-03-14T15:20:00Z',
    emailVerified: true,
    createdAt: '2026-08-20T14:00:00Z',
    acceptedPrivacyVersion: '2026-03',
    acceptedPrivacyAt: '2026-03-14T15:20:00Z',
    ...p,
    emailKey: p.email.toLowerCase(),
    passwordHash: await seedPasswordHash(p.id),
  };
}

export const seedUsers = (): Promise<User[]> => Promise.all(SEED.map(seedUser));
