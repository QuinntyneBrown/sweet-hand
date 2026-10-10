/** Fictional accounts from docs/mocks/README.md. Every seeded account uses SEED_PASSWORD. */
export const SEED_PASSWORD = 'pepperpot-sunday-2026';

export type Role = 'Customer' | 'Caterer' | 'Operator';

export interface User {
  id: string;
  role: Role;
  displayName: string;
  email: string;
  phone?: string;
  password: string;
  passwordChangedAt: string;
  emailVerified: boolean;
  /** When the latest verification link was sent (L2-023.2). */
  verificationSentAt?: string;
  emailBounced?: boolean;
  /** Operators only. */
  admin?: boolean;
  /** Operators only: how they complete the second step (L2-056.2). */
  secondFactor?: 'authenticator app' | 'security key';
  /** Caterers only: the profile they own. */
  catererId?: string;
  createdAt: string;
  deleted?: boolean;
  /** Privacy notice version the user accepted, and when (L2-070.3). */
  acceptedPrivacyVersion: string;
  acceptedPrivacyAt: string;
  failedSignIns?: number;
  /** When each recent failed sign-in happened (L2-076.4). */
  failedSignInsAt?: string[];
  lockedUntil?: string;
}

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
  u({ id: 'user-leah', role: 'Operator', displayName: 'Leah Mohammed', email: 'leah@sweethand.example', admin: true, secondFactor: 'authenticator app' }),
  u({ id: 'user-tomas', role: 'Operator', displayName: 'Tomas Reyes', email: 'tomas@sweethand.example', admin: false, secondFactor: 'security key' }),
];
