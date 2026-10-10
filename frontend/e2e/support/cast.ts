/** Fictional people from docs/mocks/README.md who can sign in to the fake backend. */
export const cast = {
  marcia: { email: 'marcia.t@example.com', name: 'Marcia Thompson', initials: 'MT' },
  andre: { email: 'andre.c@example.com', name: 'Andre Clarke', initials: 'AC' },
  jeanRobert: { email: 'jr.pierre@example.com', name: 'Jean-Robert Pierre', initials: 'JP' },
  devon: { email: 'devon.w@example.com', name: 'Devon Walters', initials: 'DW' },
  kendra: { email: 'kendra@pelauhouse.example', name: 'Kendra Baptiste', initials: 'KB' },
  leah: { email: 'leah@sweethand.example', name: 'Leah Mohammed', initials: 'LM' },
  tomas: { email: 'tomas@sweethand.example', name: 'Tomas Reyes', initials: 'TR' },
} as const;

export type CastMember = keyof typeof cast;

/** Every seeded account's password. */
export const SEED_PASSWORD = 'pepperpot-sunday-2026';
