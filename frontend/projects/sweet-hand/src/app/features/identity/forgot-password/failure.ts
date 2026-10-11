
export type Failure = { kind: 'server'; reference: string | null } | { kind: 'rate-limited'; minutes: number } | null;
