import type { Loaded } from './loaded';

export type ViewState = { kind: 'loading' } | { kind: 'error'; reference: string | null } | ({ kind: 'ready' } & Loaded);
