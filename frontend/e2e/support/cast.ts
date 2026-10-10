/** Fictional people from docs/mocks/README.md who can sign in to the fake backend. */
export const cast = {
  marcia: { email: 'marcia.t@example.com', name: 'Marcia Thompson', initials: 'MT' },
  andre: { email: 'andre.c@example.com', name: 'Andre Clarke', initials: 'AC' },
  jeanRobert: { email: 'jr.pierre@example.com', name: 'Jean-Robert Pierre', initials: 'JP' },
  devon: { email: 'devon.w@example.com', name: 'Devon Walters', initials: 'DW' },
  kendra: { email: 'kendra@pelauhouse.example', name: 'Kendra Baptiste', initials: 'KB' },
  leah: { email: 'leah@sweethand.example', name: 'Leah Mohammed', initials: 'LM' },
  tomas: { email: 'tomas@sweethand.example', name: 'Tomas Reyes', initials: 'TR' },
  // Caterer accounts behind the dashboard. Beverley exists once a test runs the 'beverley' scenario.
  beverley: { email: 'beverley@auntiebevs.example', name: 'Beverley Campbell', initials: 'BC' },
  sharon: { email: 'sharon@flyingfish.example', name: 'Sharon Best', initials: 'SB' },
  winston: { email: 'winston@coalpot.example', name: 'Winston Daley', initials: 'WD' },
  vishnu: { email: 'vishnu@maracasbay.example', name: 'Vishnu Ramlogan', initials: 'VR' },
  paulette: { email: 'paulette@blackcakeco.example', name: 'Paulette Morgan', initials: 'PM' },
  desmond: { email: 'desmond@coucou.example', name: 'Desmond Greaves', initials: 'DG' },
} as const;

export type CastMember = keyof typeof cast;

/** Every seeded account's password. */
export const SEED_PASSWORD = 'pepperpot-sunday-2026';

/** The code the fake backend accepts from an operator's authenticator app (L2-056.2). */
export const OPERATOR_CODE = '731905';
