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
  /** Mount the test-control API (ADR 0008). Refused with a real database. */
  testControl: boolean;
  /** Where uploaded media live when there is no database (local development). */
  mediaDir?: string;
}

export function requiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) throw new Error(`${name} is not set`);
  return value;
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
  };
  if (config.testControl && config.databaseUrl) throw new Error('TEST_CONTROL cannot be used with a real database');
  return config;
}
