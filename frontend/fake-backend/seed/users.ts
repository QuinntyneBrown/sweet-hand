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
  emailVerified: boolean;
  emailBounced?: boolean;
  /** Operators only. */
  admin?: boolean;
  /** Caterers only: the profile they own. */
  catererId?: string;
  createdAt: string;
  deleted?: boolean;
  /** Privacy notice version the user accepted (L2-070). */
  acceptedPrivacyVersion: string;
  failedSignIns?: number;
  /** When each recent failed sign-in happened (L2-076.4). */
  failedSignInsAt?: string[];
  lockedUntil?: string;
}

const u = (p: Partial<User> & Pick<User, 'id' | 'role' | 'displayName' | 'email'>): User => ({
  password: SEED_PASSWORD,
  emailVerified: true,
  createdAt: '2026-08-20T14:00:00Z',
  acceptedPrivacyVersion: '1.0',
  ...p,
});

export const seedUsers = (): User[] => [
  u({ id: 'user-marcia', role: 'Customer', displayName: 'Marcia Thompson', email: 'marcia.t@example.com', phone: '+1 647 555 0187' }),
  u({ id: 'user-andre', role: 'Customer', displayName: 'Andre Clarke', email: 'andre.c@example.com' }),
  u({ id: 'user-priya', role: 'Customer', displayName: 'Priya Ramdial', email: 'priya.r@example.com' }),
  u({ id: 'user-nadia', role: 'Customer', displayName: 'Nadia Joseph', email: 'nadia.j@example.com' }),
  u({ id: 'user-jean-robert', role: 'Customer', displayName: 'Jean-Robert Pierre', email: 'jr.pierre@example.com' }),
  u({ id: 'user-devon', role: 'Customer', displayName: 'Devon Walters', email: 'devon.w@example.com' }),
  u({ id: 'user-kendra', role: 'Caterer', displayName: 'Kendra Baptiste', email: 'kendra@pelauhouse.example', phone: '+1 416 555 0142', catererId: 'cat-001' }),
  u({ id: 'user-leah', role: 'Operator', displayName: 'Leah Mohammed', email: 'leah@sweethand.example', admin: true }),
  u({ id: 'user-tomas', role: 'Operator', displayName: 'Tomas Reyes', email: 'tomas@sweethand.example', admin: false }),
];
