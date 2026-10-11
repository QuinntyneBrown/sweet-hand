export type View =
  | { kind: 'loading' }
  | { kind: 'load-failed' }
  | { kind: 'form'; email: string }
  | { kind: 'expired' }
  | { kind: 'done' };
