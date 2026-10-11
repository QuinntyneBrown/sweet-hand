/**
 * Verifies an operator's security-key assertion (L2-056.2). WebAuthn options
 * and enrolment are `<TO SUPPLY>` in the sign-in design: until they are, the
 * frontend's `LocalSecurityKey` sends `local-key:<nonce>` and this verifier
 * accepts exactly that (ADR 0008).
 */
export function validSecurityKeyAssertion(assertion: unknown): boolean {
  return typeof assertion === 'string' && assertion.startsWith('local-key:') && assertion.length <= 200;
}
