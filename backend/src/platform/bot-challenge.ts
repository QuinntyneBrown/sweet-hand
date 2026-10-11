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
