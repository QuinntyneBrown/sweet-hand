import { Injectable } from '@angular/core';
import { BotChallengeService } from './bot-challenge.service';
import { ProtectedAction } from './protected-action';

/**
 * Stands in for the provider until one is chosen (rate-limit-and-challenge
 * design: provider `<TO SUPPLY>`). It sets no cookie and calls no third party;
 * the backend's local verifier accepts its tokens (ADR 0008).
 */
@Injectable()
export class LocalBotChallengeService extends BotChallengeService {
  token(action: ProtectedAction): Promise<string> {
    return Promise.resolve(`local:${action}:${crypto.randomUUID()}`);
  }
}
