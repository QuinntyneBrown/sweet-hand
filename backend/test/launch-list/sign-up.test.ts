import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, startApi, type Api } from '../support/api.ts';

const marcia = { role: 'customer', email: 'marcia.t@example.com', consent: true, challengeToken: 'local:launch-sign-up:1' };
const kendra = { role: 'caterer', email: 'kendra@pelauhouse.example', businessName: 'Pelau House', consent: true, challengeToken: 'local:launch-sign-up:2' };
const HOUR = 60 * 60_000;

const signUp = (api: Api, body: unknown, headers?: Record<string, string>) => api.client().post('/api/launch-list/sign-ups', body, headers);
const entries = (api: Api) => documents(api, 'launchList');
const tokenFrom = (link: unknown, name: string) => new URL(String(link), 'https://sweethand.example').searchParams.get(name)!;

describe('joining the launch list (L2-095, L2-096, L2-098, L2-103)', () => {
  it('Given the launch list is open, when a visitor asks for its status, then it reports open and sets the CSRF cookie only (L2-103.5)', async () => {
    const api = await startApi();
    const client = api.client();
    client.cookies.clear();
    const res = await fetch(`${api.url}/api/public/launch-list`);
    assert.equal(res.status, 200);
    assert.deepEqual(await res.json(), { open: true });
    assert.deepEqual(res.headers.getSetCookie().map((c) => c.split('=')[0]), ['XSRF-TOKEN']);
  });

  it('Given a new address, when a visitor signs up, then a Pending entry with its consent record is stored and a confirmation email is queued (L2-098, L2-103.1, L2-103.2)', async () => {
    const api = await startApi();
    const res = await signUp(api, { ...kendra, email: '  Kendra@PelauHouse.example ' }, { referer: 'https://sweethand.example/' });
    assert.equal(res.status, 202);
    assert.deepEqual(res.body, {});
    const [entry] = await entries(api);
    assert.deepEqual(Object.keys(entry).sort(), ['confirmationsSent', 'consent', 'createdAt', 'email', 'emailKey', 'id', 'businessName', 'role', 'status', 'updatedAt'].sort());
    assert.equal(entry.status, 'Pending');
    assert.equal(entry.email, 'Kendra@PelauHouse.example');
    assert.equal(entry.emailKey, 'kendra@pelauhouse.example');
    assert.equal(entry.businessName, 'Pelau House');
    assert.deepEqual(entry.consent, {
      wording: ['Email me when Sweet Hand opens', 'One email, nothing else.'],
      noticeVersion: '2026-03',
      pageUrl: 'https://sweethand.example/',
      signedUpAt: '2026-10-10T14:00:00.000Z',
    });
    const [mail] = await outbox(api);
    assert.equal(mail.kind, 'launch-confirm');
    assert.equal(mail.to, 'Kendra@PelauHouse.example');
    assert.match(tokenFrom(mail.link, 'confirmed'), /^[0-9a-f]{64}$/, 'a 256-bit token (L2-104.2)');
    const removal = tokenFrom(mail.removalLink, 'token');
    assert.match(removal, /^[0-9a-f]{64}$/);
    const headers = mail.headers as Record<string, string>;
    assert.match(headers['List-Unsubscribe'], /^<https:\/\/.+\/api\/launch-list\/unsubscribe\?token=[0-9a-f]{64}>$/);
    assert.equal(headers['List-Unsubscribe-Post'], 'List-Unsubscribe=One-Click');
    const tokens = await documents(api, 'launchListTokens');
    assert.deepEqual(tokens.map((t) => t.kind).sort(), ['confirm', 'remove']);
    assert.ok(tokens.every((t) => !JSON.stringify(t).includes(removal)), 'only hashes are stored');
  });

  it('Given invalid fields, when they reach the API, then it answers 400 field by field and stores nothing (L2-096.5)', async () => {
    const api = await startApi();
    const res = await signUp(api, { role: 'operator', email: 'marcia.t@example', consent: false, challengeToken: 'local:launch-sign-up:1' });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { role: ['Choose one'], email: ['Enter an email like name@example.com'], consent: ['Tick the box to get the email'] });
    const cases: unknown[] = [
      { ...marcia, email: `${'a'.repeat(245)}@example.com` },
      { ...kendra, businessName: 'x'.repeat(61) },
      { ...marcia, businessName: 'Pelau House' },
      { ...kendra, businessName: 'Pelau\r\nBcc: someone@example.com' },
      { ...marcia, email: 'marcia.t@example.com\n' + 'x' },
      { ...marcia, consent: 'true' },
      { ...marcia, role: undefined },
    ];
    for (const body of cases) assert.equal((await signUp(api, body)).status, 400, JSON.stringify(body));
    assert.equal((await entries(api)).length, 0);
    assert.equal((await outbox(api)).length, 0);
  });

  it('Given no valid bot-protection token, when a sign-up arrives, then it is refused with 400 and nothing is stored (L2-104.4)', async () => {
    const api = await startApi();
    const res = await signUp(api, { ...marcia, challengeToken: 'forged' });
    assert.equal(res.status, 400);
    assert.equal((await entries(api)).length, 0);
  });

  it('Given a body over 4 KB, when it arrives, then it is refused with 413 (L2-104.6)', async () => {
    const api = await startApi();
    const res = await signUp(api, { ...marcia, padding: 'x'.repeat(5000) });
    assert.equal(res.status, 413);
  });

  it('Given no CSRF token, when a sign-up arrives, then it is refused with 403 (L2-104.3)', async () => {
    const api = await startApi();
    const res = await fetch(`${api.url}/api/launch-list/sign-ups`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(marcia) });
    assert.equal(res.status, 403);
  });

  it('Given a new, a pending and a confirmed address, when each signs up, then the replies are identical (L2-098.2)', async () => {
    const api = await startApi();
    const strip = (r: { status: number; headers: Headers; body: unknown }) => {
      const headers = Object.fromEntries([...r.headers].filter(([k]) => !['date', 'x-correlation-id', 'set-cookie', 'etag'].includes(k)));
      return { status: r.status, headers, body: r.body };
    };
    const first = await signUp(api, marcia);
    const pending = await signUp(api, marcia);
    const [mail] = await outbox(api);
    await api.client().post('/api/launch-list/confirmations', { token: tokenFrom(mail.link, 'confirmed') });
    const confirmed = await signUp(api, marcia);
    assert.deepEqual(strip(pending), strip(first));
    assert.deepEqual(strip(confirmed), strip(first));
  });

  it('Given a Pending address, when it signs up again, then its details are replaced and earlier confirmation links stop working (L2-098, L2-098.4)', async () => {
    const api = await startApi();
    await signUp(api, marcia);
    await signUp(api, { ...kendra, email: 'MARCIA.T@example.com' });
    const all = await entries(api);
    assert.equal(all.length, 1);
    assert.equal(all[0].role, 'caterer');
    assert.equal(all[0].businessName, 'Pelau House');
    const mails = (await outbox(api)).filter((m) => m.kind === 'launch-confirm');
    assert.equal(mails.length, 2);
    const old = await api.client().post('/api/launch-list/confirmations', { token: tokenFrom(mails[0].link, 'confirmed') });
    assert.equal(old.status, 410);
    const fresh = await api.client().post('/api/launch-list/confirmations', { token: tokenFrom(mails[1].link, 'confirmed') });
    assert.equal(fresh.status, 200);
  });

  it('Given a Pending address with a business name, when it signs up again as someone planning an event, then the business name is dropped', async () => {
    const api = await startApi();
    await signUp(api, kendra);
    await signUp(api, { ...marcia, email: kendra.email });
    const [entry] = await entries(api);
    assert.equal(entry.role, 'customer');
    assert.equal(entry.businessName, undefined);
  });

  it('Given a Confirmed address, when it signs up again, then nothing changes and one "already on the list" email goes out per 24 hours (L2-098)', async () => {
    const api = await startApi();
    await signUp(api, marcia);
    const [mail] = await outbox(api);
    await api.client().post('/api/launch-list/confirmations', { token: tokenFrom(mail.link, 'confirmed') });
    const before = await entries(api);
    await signUp(api, { ...kendra, email: marcia.email });
    await signUp(api, marcia);
    const [after] = await entries(api);
    const { alreadyListedSentAt, ...unchanged } = after;
    assert.deepEqual(unchanged, before[0], 'role, business name and consent stay as confirmed');
    assert.ok(alreadyListedSentAt);
    const listed = (await outbox(api)).filter((m) => m.kind === 'launch-already-listed');
    assert.equal(listed.length, 1);
    assert.match(String(listed[0].removalLink), /\/api\/launch-list\/unsubscribe\?token=/);
    advanceClock(api, 24 * HOUR + 1000);
    await signUp(api, marcia);
    assert.equal((await outbox(api)).filter((m) => m.kind === 'launch-already-listed').length, 2);
  });

  it('Given one address signed up 3 times in 24 hours, when it signs up again, then it still succeeds but no further email is sent (L2-098.5)', async () => {
    const api = await startApi();
    for (let i = 0; i < 5; i++) assert.equal((await signUp(api, marcia)).status, 202);
    assert.equal((await outbox(api)).filter((m) => m.kind === 'launch-confirm').length, 3);
  });

  it('Given one IP sent 10 sign-ups in an hour, when the next arrives, then it gets 429 with Retry-After (L2-104.5)', async () => {
    const api = await startApi();
    for (let i = 0; i < 10; i++) assert.equal((await signUp(api, { ...marcia, email: `person${i}@example.com` })).status, 202);
    const res = await signUp(api, { ...marcia, email: 'person10@example.com' });
    assert.equal(res.status, 429);
    assert.ok(Number(res.headers.get('retry-after')) > 0);
    assert.equal((await entries(api)).length, 10);
  });
});
