import { Injectable } from '@angular/core';

/** The forms that need a bot-protection token (L2-082.2). */
export type ProtectedAction = 'sign-in' | 'register' | 'register-caterer' | 'password-reset' | 'enquiry' | 'report';

/**
 * Privacy-respecting bot protection (ADR 0003, L2-082.2). Protected forms ask
 * for a token when they submit and send it as `challengeToken`. Where the form
 * shows the "I'm a person, not a bot" check, it asks only once that is ticked.
 */
@Injectable({ providedIn: 'root', useFactory: () => new LocalBotChallenge() })
export abstract class BotChallenge {
  abstract token(action: ProtectedAction): Promise<string>;
}

/**
 * Stands in for the provider until one is chosen (rate-limit-and-challenge
 * design: provider `<TO SUPPLY>`). It sets no cookie and calls no third party;
 * the fake backend accepts its tokens.
 */
@Injectable()
export class LocalBotChallenge extends BotChallenge {
  token(action: ProtectedAction): Promise<string> {
    return Promise.resolve(`local:${action}:${crypto.randomUUID()}`);
  }
}
