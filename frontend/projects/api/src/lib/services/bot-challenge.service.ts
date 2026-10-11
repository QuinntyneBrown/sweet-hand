import { Injectable } from '@angular/core';
import type { IBotChallengeService, ProtectedAction } from './bot-challenge.service.contract';

/**
 * Stands in for the provider until one is chosen (rate-limit-and-challenge
 * design: provider `<TO SUPPLY>`). It sets no cookie and calls no third party;
 * the fake backend accepts its tokens.
 */
@Injectable()
export class BotChallengeService implements IBotChallengeService {
  token(action: ProtectedAction): Promise<string> {
    return Promise.resolve(`local:${action}:${crypto.randomUUID()}`);
  }
}
