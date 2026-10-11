import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';
import { loadConfig } from '../../src/platform/config.ts';

const MARCIA = 'marcia.t@example.com';
const DAY = 24 * 60 * 60_000;

function withEnv<T>(vars: Record<string, string | undefined>, run: () => T): T {
  const saved = Object.fromEntries(Object.keys(vars).map((k) => [k, process.env[k]]));
  for (const [k, v] of Object.entries(vars)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  try {
    return run();
  } finally {
    for (const [k, v] of Object.entries(saved)) v === undefined ? delete process.env[k] : (process.env[k] = v);
  }
}

describe('identity and transport hardening (identity-and-security designs)', () => {
  it('Given a session that timed out on another device, when the customer lists their sessions, then it is not shown (L2-078.5)', async () => {
    const api = await startApi();
    await signedInClient(api, MARCIA);
    advanceClock(api, 15 * DAY);
    const marcia = await signedInClient(api, MARCIA);
    const list = (await marcia.get('/api/me/sessions')).body;
    assert.equal(list.length, 1);
    assert.equal(list[0].current, true);
  });

  it('Given 5 reset requests from one network in an hour, when a 6th is refused, then the block is in the security log (L2-082.3, L2-084.1)', async () => {
    const api = await startApi();
    const client = api.client();
    for (let i = 0; i < 6; i++) await client.post('/api/identity/password-reset-requests', { email: MARCIA, challengeToken: 'local:password-reset:1' });
    const blocks = (await documents(api, 'securityEvents')).filter((e) => e.type === 'rate-limit-block');
    assert.equal(blocks.length, 1);
    assert.equal(blocks[0].path, '/api/identity/password-reset-requests');
  });

  it('Given one network asks for verification emails again and again, when it passes 5 in an hour, then it is refused with 429 and logged (verify-email design)', async () => {
    const api = await startApi();
    const client = api.client();
    const statuses = [];
    for (let i = 0; i < 6; i++) statuses.push((await client.post('/api/identity/email-verifications/resend', { email: 'someone@example.com' })).status);
    assert.deepEqual(statuses, [202, 202, 202, 202, 202, 429]);
    assert.equal((await documents(api, 'securityEvents')).filter((e) => e.type === 'rate-limit-block').length, 1);
  });

  it('Given an anonymous read outside /api/public, when one address passes 300 a minute, then it is limited too (L2-082.1)', async () => {
    const api = await startApi();
    const client = api.client();
    let last = 0;
    for (let i = 0; i < 301; i++) last = (await client.get('/api/identity/password-resets/no-such-token')).status;
    assert.equal(last, 429);
  });

  it('Given a real database, when the API starts without an origin allow-list or an IP hash secret, then it refuses to start (L2-081.4, secure-build-pipeline design)', () => {
    const db = { DATABASE_URL: 'postgres://localhost/sweethand', TEST_CONTROL: undefined };
    assert.throws(() => withEnv({ ...db, ALLOWED_ORIGINS: undefined, IP_HASH_SECRET: 'k' }, loadConfig), /ALLOWED_ORIGINS/);
    assert.throws(() => withEnv({ ...db, ALLOWED_ORIGINS: 'https://sweethand.example', IP_HASH_SECRET: undefined }, loadConfig), /IP_HASH_SECRET/);
    assert.equal(withEnv({ ...db, ALLOWED_ORIGINS: 'https://sweethand.example', IP_HASH_SECRET: 'k' }, loadConfig).allowedOrigins[0], 'https://sweethand.example');
  });

  it('Given the API behind a TLS proxy, when a request arrives over plain HTTP, then it is redirected to HTTPS with 301 (L2-081.1)', async () => {
    const api = await startApi({ config: { secureCookies: true, allowedOrigins: [], trustProxy: true } });
    const res = await api.client().get('/api/public/cuisines?x=1', { 'x-forwarded-proto': 'http' });
    assert.equal(res.status, 301);
    assert.equal(res.headers.get('location'), `${api.url.replace('http://', 'https://')}/api/public/cuisines?x=1`);
  });

  it('Given an unexpected error whose message holds a postal code and a token, when it is logged, then only the FSA is kept and the token is dropped (L2-084.2)', async () => {
    const { redactLogEntry } = await import('../../src/platform/log-redactor.ts');
    const entry = redactLogEntry({ level: 'error', message: 'failed for M5V 2T6 with 9f'.concat('a'.repeat(62)), password: 'secret', sessionId: 's', nested: { token: 't', text: 'hello' } });
    assert.deepEqual(entry, { level: 'error', message: 'failed for M5V with [redacted]', nested: {} });
  });
});
