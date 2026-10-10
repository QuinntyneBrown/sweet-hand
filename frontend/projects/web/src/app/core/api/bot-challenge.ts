import { Injectable } from '@angular/core';

/**
 * Bot protection for anonymous forms (ADR 0003, L2-082.2): yields the token a
 * protected request sends as `challengeToken`. The provider is not chosen yet;
 * the default stands in for an invisible, privacy-respecting check.
 */
@Injectable({ providedIn: 'root', useFactory: () => new InvisibleBotChallenge() })
export abstract class BotChallenge {
  abstract token(): Promise<string>;
}

export class InvisibleBotChallenge extends BotChallenge {
  token(): Promise<string> {
    return Promise.resolve('invisible-challenge-passed');
  }
}
