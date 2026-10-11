import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';

const CHROME = 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/141.0 Safari/537.36';
const SAFARI = 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1';
const GOOGLEBOT = 'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)';
const BINGBOT = 'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)';
const DAY = 24 * 60 * 60 * 1000;

describe('count visits (L2-062)', () => {
  it('Given a page load, when its visit is recorded, then the store holds only the daily hash, page type, caterer and time (L2-062.2)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    const res = await marcia.post('/api/visits', { pageType: 'CatererPage', catererId: 'cat-001', userId: 'user-marcia' }, { 'user-agent': CHROME });

    assert.equal(res.status, 204);
    const [visit] = await documents(api, 'visits');
    assert.deepEqual(Object.keys(visit).sort(), ['catererId', 'dailyHash', 'id', 'occurredAt', 'pageType']);
    assert.equal(visit.pageType, 'CatererPage');
    assert.equal(visit.catererId, 'cat-001');
    assert.equal(visit.occurredAt, '2026-10-10T14:00:00.000Z');
    assert.match(visit.dailyHash, /^[0-9a-f]{64}$/);
    const stored = JSON.stringify(visit);
    assert.equal(stored.includes('127.0.0.1'), false);
    assert.equal(stored.includes('Chrome'), false);
    assert.equal(stored.includes('user-marcia'), false);
  });

  it('Given a known crawler, when it loads a page, then no visit is counted, and the answer does not say so (L2-062.3)', async () => {
    const api = await startApi();
    const client = api.client();

    const google = await client.post('/api/visits', { pageType: 'CatererPage', catererId: 'cat-001' }, { 'user-agent': GOOGLEBOT });
    const bing = await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': BINGBOT });

    assert.equal(google.status, 204);
    assert.equal(bing.status, 204);
    assert.equal((await documents(api, 'visits')).length, 0);
  });

  it('Given an unknown page type or a caterer that is not published, when it is reported, then nothing is counted', async () => {
    const api = await startApi();
    const client = api.client();

    assert.equal((await client.post('/api/visits', { pageType: 'Dashboard' }, { 'user-agent': CHROME })).status, 204);
    assert.equal((await client.post('/api/visits', { pageType: 'CatererPage', catererId: 'cat-nobody' }, { 'user-agent': CHROME })).status, 204);
    assert.equal((await client.post('/api/visits', { pageType: 'CatererPage' }, { 'user-agent': CHROME })).status, 204);
    assert.equal((await documents(api, 'visits')).length, 0);
  });

  it('Given the same browser on two days, when unique visitors are counted, then it counts once each day and the days cannot be linked (L2-062.4)', async () => {
    const api = await startApi();
    const client = api.client();
    await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': CHROME });
    await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': CHROME });
    await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': SAFARI });

    advanceClock(api, DAY);
    await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': CHROME });

    const visits = await documents(api, 'visits');
    const nextDay = visits.find((v) => v.occurredAt.startsWith('2026-10-11'));
    const today = visits.filter((v) => v.occurredAt.startsWith('2026-10-10'));
    assert.equal(new Set(today.map((v) => v.dailyHash)).size, 2);
    assert.equal(visits.length, 4);
    assert.equal(today.some((v) => v.dailyHash === nextDay.dailyHash), false);
    const salts = await documents(api, 'visitSalts');
    assert.deepEqual(salts.map((s) => s.id), ['2026-10-11']);
  });

  it('Given visits today, when an operator views the dashboard, then they are counted straight away (L2-061.3)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, 'tomas@sweethand.example');
    const query = '/api/operator/metrics?from=2026-10-10&to=2026-10-10&granularity=day';
    const before = (await tomas.get(query)).body;
    const client = api.client();

    await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': CHROME });
    await client.post('/api/visits', { pageType: 'CatererPage', catererId: 'cat-001' }, { 'user-agent': CHROME });
    await client.post('/api/visits', { pageType: 'Listing' }, { 'user-agent': SAFARI });

    const after = (await tomas.get(query)).body;
    assert.equal(after.listingVisits[0], before.listingVisits[0] + 2);
    assert.equal(after.catererVisits[0], before.catererVisits[0] + 1);
    assert.equal(after.uniqueVisitors[0], before.uniqueVisitors[0] + 2);
  });
});
