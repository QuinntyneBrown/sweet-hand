import type { EmailVerified } from '@sweet-hand/api';

export type View = { kind: 'loading' } | { kind: 'verified'; result: EmailVerified } | { kind: 'expired' } | { kind: 'failed'; reference: string | null };
