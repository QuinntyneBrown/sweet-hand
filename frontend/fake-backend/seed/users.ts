import type { User } from './user.ts';

/** Fictional accounts from docs/mocks/README.md. Every seeded account uses SEED_PASSWORD. */
export const SEED_PASSWORD = 'pepperpot-sunday-2026';

export type Role = 'Customer' | 'Caterer' | 'Operator';

const u = (p: Partial<User> & Pick<User, 'id' | 'role' | 'displayName' | 'email'>): User => ({
  password: SEED_PASSWORD,
  passwordChangedAt: '2026-03-14T15:20:00Z',
  emailVerified: true,
  createdAt: '2026-08-20T14:00:00Z',
  acceptedPrivacyVersion: '2026-03',
  acceptedPrivacyAt: '2026-03-14T15:20:00Z',
  ...p,
});

export const seedUsers = (): User[] => [
  u({ id: 'user-marcia', role: 'Customer', displayName: 'Marcia Thompson', email: 'marcia.t@example.com', phone: '+1 647 555 0187', createdAt: '2026-03-14T15:20:00Z' }),
  u({ id: 'user-andre', role: 'Customer', displayName: 'Andre Clarke', email: 'andre.c@example.com' }),
  u({ id: 'user-priya', role: 'Customer', displayName: 'Priya Ramdial', email: 'priya.r@example.com' }),
  u({ id: 'user-nadia', role: 'Customer', displayName: 'Nadia Joseph', email: 'nadia.j@example.com' }),
  u({ id: 'user-jean-robert', role: 'Customer', displayName: 'Jean-Robert Pierre', email: 'jr.pierre@example.com' }),
  u({ id: 'user-devon', role: 'Customer', displayName: 'Devon Walters', email: 'devon.w@example.com' }),
  u({
    id: 'user-kendra',
    role: 'Caterer',
    displayName: 'Kendra Baptiste',
    email: 'kendra@pelauhouse.example',
    phone: '+1 416 555 0142',
    catererId: 'cat-001',
    createdAt: '2025-01-20T15:00:00Z',
    passwordChangedAt: '2026-08-02T16:00:00Z',
  }),
  // Caterer accounts behind the dashboard (docs/mocks/README.md, "Other caterer accounts").
  u({ id: 'user-vishnu', role: 'Caterer', displayName: 'Vishnu Ramlogan', email: 'vishnu@maracasbay.example', phone: '+1 905 555 0171', catererId: 'cat-009', createdAt: '2025-06-02T14:00:00Z' }),
  u({ id: 'user-paulette', role: 'Caterer', displayName: 'Paulette Morgan', email: 'paulette@blackcakeco.example', phone: '+1 905 555 0128', catererId: 'cat-005', createdAt: '2025-11-12T14:00:00Z' }),
  u({ id: 'user-desmond', role: 'Caterer', displayName: 'Desmond Greaves', email: 'desmond@coucou.example', phone: '+1 416 555 0193', catererId: 'cat-002', createdAt: '2022-01-10T14:00:00Z' }),
  u({ id: 'user-sharon', role: 'Caterer', displayName: 'Sharon Best', email: 'sharon@flyingfish.example', phone: '+1 905 555 0136', catererId: 'cat-024', createdAt: '2021-10-01T14:00:00Z' }),
  u({ id: 'user-winston', role: 'Caterer', displayName: 'Winston Daley', email: 'winston@coalpot.example', phone: '+1 905 555 0157', catererId: 'cat-901', createdAt: '2026-08-05T13:00:00Z' }),
  u({ id: 'user-leah', role: 'Operator', displayName: 'Leah Mohammed', email: 'leah@sweethand.example', admin: true, secondFactor: 'authenticator app' }),
  u({ id: 'user-tomas', role: 'Operator', displayName: 'Tomas Reyes', email: 'tomas@sweethand.example', admin: false, secondFactor: 'security key' }),
];
