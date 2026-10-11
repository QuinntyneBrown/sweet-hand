/** The forms that need a bot-protection token (L2-082.2). */
export type ProtectedAction = 'sign-in' | 'register' | 'register-caterer' | 'password-reset' | 'enquiry' | 'report';

/**
 * Privacy-respecting bot protection (ADR 0003, L2-082.2). Protected forms ask
 * for a token when they submit and send it as `challengeToken`. Where the form
 * shows the "I'm a person, not a bot" check, it asks only once that is ticked.
 */
export abstract class BotChallengeService {
  abstract token(action: ProtectedAction): Promise<string>;
}
