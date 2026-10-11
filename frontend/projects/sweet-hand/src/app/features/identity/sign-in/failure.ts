
export type Failure = { kind: 'server'; reference: string | null } | { kind: 'locked'; until: string } | null;
