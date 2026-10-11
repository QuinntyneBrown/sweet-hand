/** The forms that need a bot-protection token (L2-082.2). */
export type ProtectedAction = 'sign-in' | 'register' | 'register-caterer' | 'password-reset' | 'enquiry' | 'report';

/**
 * Verifies the frontend's bot-protection token (rate-limit-and-challenge
 * design). The provider is still `<TO SUPPLY>`: until one is chosen the
 * frontend's `LocalBotChallenge` issues `local:<action>:<nonce>` tokens and
 * this verifier accepts exactly those (ADR 0009).
 */
export function validChallenge(token: unknown, action: ProtectedAction): boolean {
  return typeof token === 'string' && token.startsWith(`local:${action}:`) && token.length <= 200;
}
