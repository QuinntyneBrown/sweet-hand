/** A single-use email verification or password reset token (L2-077). */
export interface AccountToken {
  kind: 'verify' | 'reset';
  token: string;
  userId: string;
  issuedAt: string;
  consumedAt?: string;
}
