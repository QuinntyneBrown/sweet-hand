/** Process configuration from environment variables; secrets come from the platform's secret store (L2-083.2). */
export interface Config {
  port: number;
  /** Absent: an in-memory database, for local development only. */
  databaseUrl?: string;
  /** `Secure` on cookies; on everywhere except plain-HTTP local development. */
  secureCookies: boolean;
  /** Origins allowed to send state-changing requests (L2-081.4); empty allows any (local development). */
  allowedOrigins: string[];
  /** Trust `X-Forwarded-For` and `X-Correlation-ID` from the load balancer. */
  trustProxy: boolean;
  /** Mount the test-control API (ADR 0009). Refused with a real database. */
  testControl: boolean;
  /** Where uploaded media live when there is no database (local development). */
  mediaDir?: string;
  /** `off` is the operator's explicit, temporary choice before the Turnstile widget exists (L2-104.9). */
  botChallenge: 'turnstile' | 'off';
  turnstileSecret?: string;
  turnstileHostnames: string[];
  prelaunchMode: boolean;
  communicationEmailEndpoint?: string;
  communicationEmailSender?: string;
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
}

function botChallengeMode(value: string | undefined): Config['botChallenge'] {
  if (!value || value === 'turnstile') return 'turnstile';
  if (value === 'off') return 'off';
  throw new Error('BOT_CHALLENGE must be "turnstile" or "off"');
}

const flag = (name: string, fallback: boolean) => {
  const v = process.env[name];
  return v === undefined ? fallback : ['1', 'true', 'yes', 'on'].includes(v.toLowerCase());
};

export function loadConfig(): Config {
  const config: Config = {
    port: Number(process.env['PORT'] ?? 4300),
    databaseUrl: process.env['DATABASE_URL'] || undefined,
    secureCookies: flag('SECURE_COOKIES', !!process.env['DATABASE_URL']),
    allowedOrigins: (process.env['ALLOWED_ORIGINS'] ?? '').split(',').map((s) => s.trim()).filter(Boolean),
    trustProxy: flag('TRUST_PROXY', false),
    testControl: flag('TEST_CONTROL', false),
    mediaDir: process.env['MEDIA_DIR'] || undefined,
    botChallenge: botChallengeMode(process.env['BOT_CHALLENGE']),
    turnstileSecret: process.env['TURNSTILE_SECRET'] || undefined,
    turnstileHostnames: (process.env['TURNSTILE_HOSTNAMES'] ?? 'app.sweethand.ca').split(',').map((s) => s.trim()).filter(Boolean),
    prelaunchMode: flag('PRELAUNCH_MODE', false),
    communicationEmailEndpoint: process.env['ACS_EMAIL_ENDPOINT'] || undefined,
    communicationEmailSender: process.env['ACS_EMAIL_SENDER'] || undefined,
  };
  if (config.testControl && config.databaseUrl) throw new Error('TEST_CONTROL cannot be used with a real database');
  if (config.databaseUrl) {
    // A real deployment names the origins it accepts state changes from (L2-081.4)
    // and keys IP hashes with its own secret, never the built-in one.
    if (!config.allowedOrigins.length) throw new Error('ALLOWED_ORIGINS is not set');
    if (!process.env['IP_HASH_SECRET']) throw new Error('IP_HASH_SECRET is not set');
    if (config.botChallenge === 'turnstile' && !config.turnstileSecret) throw new Error('TURNSTILE_SECRET is not set');
    if (!config.communicationEmailEndpoint) throw new Error('ACS_EMAIL_ENDPOINT is not set');
    if (!config.communicationEmailSender) throw new Error('ACS_EMAIL_SENDER is not set');
  }
  return config;
}
