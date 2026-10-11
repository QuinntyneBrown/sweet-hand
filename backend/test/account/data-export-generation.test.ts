import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, signedInClient, startApi } from '../support/api.ts';
import { generateDataExports } from '../../src/account/data-export.ts';

const DAY = 24 * 60 * 60_000;

describe('export personal data (export-personal-data design, L2-071)', () => {
  it('Given a customer’s export request, when the job runs, then the export is ready for 7 days, the link is emailed and only its owner can download the JSON (L2-071.1, L2-071.3)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    assert.equal((await marcia.post('/api/me/data-exports', {})).status, 202);

    await generateDataExports(api.env);

    const [exp] = (await documents(api, 'dataExports')).filter((x) => x.userId === 'user-marcia');
    assert.equal(exp.status, 'Ready');
    assert.equal(exp.readyAt, api.env.clock.now().toISOString());
    assert.equal(exp.expiresAt, new Date(api.env.clock.now().getTime() + 7 * DAY).toISOString());
    const mail = (await outbox(api)).find((m) => m.kind === 'data-export-ready');
    assert.equal(mail?.to, 'marcia.t@example.com');
    assert.equal(mail?.link, `/account/data-exports/${exp.id}`);

    const res = await marcia.get(`/api/me/data-exports/${exp.id}/download`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    assert.match(res.headers.get('content-disposition') ?? '', /^attachment; filename="sweet-hand-data-/);
    const data = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    assert.equal(data.account.email, 'marcia.t@example.com');
    assert.ok(Array.isArray(data.consents) && data.consents.length > 0);
    assert.ok(data.enquiries.length > 0);
    assert.ok(Array.isArray(data.reviews) && Array.isArray(data.reports));
    assert.equal(data.caterer, undefined);
    // Another party's address appears only where they shared it in the thread (L2-071.4).
    for (const e of data.enquiries) {
      const shared = e.entries.filter((x: { kind: string; by: string }) => x.kind === 'shared' && x.by === 'caterer');
      if (!shared.length) assert.equal(JSON.stringify(e).includes('@pelauhouse.example'), false);
    }

    const andre = await signedInClient(api, 'andre.c@example.com');
    assert.equal((await andre.get(`/api/me/data-exports/${exp.id}/download`)).status, 404);
    advanceClock(api, 7 * DAY + 1);
    assert.equal((await marcia.get(`/api/me/data-exports/${exp.id}/download`)).status, 404);
  });

  it('Given a caterer’s export, when it is generated, then it holds their profile, menu, certificate details and enquiries (L2-071.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    await kendra.post('/api/me/data-exports', {});
    await generateDataExports(api.env);
    const [exp] = (await documents(api, 'dataExports')).filter((x) => x.userId === 'user-kendra');
    const res = await kendra.get(`/api/me/data-exports/${exp.id}/download`);
    const data = typeof res.body === 'string' ? JSON.parse(res.body) : res.body;
    assert.equal(data.caterer.name, 'Pelau House');
    assert.ok(data.caterer.dishes.length > 0);
    assert.ok(Array.isArray(data.caterer.photos));
    assert.ok(data.enquiries.length > 0);
  });

  it('Given an export that cannot be built, when the job runs, then it is marked failed and the people on call are alerted', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    await marcia.post('/api/me/data-exports', {});
    const put = api.env.media.put.bind(api.env.media);
    api.env.media.put = async () => {
      throw new Error('storage unavailable');
    };
    await generateDataExports(api.env);
    api.env.media.put = put;
    const [exp] = (await documents(api, 'dataExports')).filter((x) => x.userId === 'user-marcia');
    assert.equal(exp.status, 'Failed');
    assert.ok((await documents(api, 'alerts')).some((a) => a.kind === 'data-export-failed'));
  });
});
