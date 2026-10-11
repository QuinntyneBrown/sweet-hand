import type { Config } from './config.ts';

/** The forms protected by a bot challenge (L2-082, L2-104). */
export type ProtectedAction = 'sign-in' | 'register' | 'register-caterer' | 'password-reset' | 'enquiry' | 'report' | 'launch-sign-up';

export interface ChallengeVerifier {
  verify(token: unknown, action: ProtectedAction): Promise<boolean>;
}

/** Development and test verifier. Production composition never selects it. */
export class LocalChallengeVerifier implements ChallengeVerifier {
  async verify(token: unknown, action: ProtectedAction): Promise<boolean> {
    return typeof token === 'string' && token.startsWith(`local:${action}:`) && token.length <= 200;
  }
}

/**
 * Production verifies with Turnstile; only the operator's explicit `BOT_CHALLENGE=off`
 * keeps the local stand-in in use until the widget exists (L2-104.9). Development
 * and tests, which have no database, always use the local verifier.
 */
export function createChallengeVerifier(config: Pick<Config, 'databaseUrl' | 'botChallenge' | 'turnstileSecret' | 'turnstileHostnames'>): ChallengeVerifier {
  if (!config.databaseUrl || config.botChallenge === 'off') return new LocalChallengeVerifier();
  if (!config.turnstileSecret) throw new Error('TURNSTILE_SECRET is not set');
  return new TurnstileChallengeVerifier(config.turnstileSecret, config.turnstileHostnames);
}

interface TurnstileResponse {
  success?: boolean;
  action?: string;
  hostname?: string;
}

/** Cloudflare Siteverify adapter. Tokens fail closed and are bound to their action and public hostname. */
export class TurnstileChallengeVerifier implements ChallengeVerifier {
  constructor(
    private readonly secret: string,
    private readonly hostnames: readonly string[],
    private readonly fetcher: typeof fetch = fetch,
  ) {}

  async verify(token: unknown, action: ProtectedAction): Promise<boolean> {
    if (typeof token !== 'string' || !token || token.length > 2048 || token.startsWith('local:')) return false;
    try {
      const body = new URLSearchParams({ secret: this.secret, response: token });
      const response = await this.fetcher('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
        method: 'POST',
        headers: { 'content-type': 'application/x-www-form-urlencoded' },
        body,
        signal: AbortSignal.timeout(5000),
      });
      if (!response.ok) return false;
      const result = (await response.json()) as TurnstileResponse;
      return result.success === true && result.action === action && typeof result.hostname === 'string' && this.hostnames.includes(result.hostname);
    } catch {
      return false;
    }
  }
}
