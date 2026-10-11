
export type LoadState = { kind: 'loading' } | { kind: 'error'; reference: string | null } | { kind: 'ready' };
