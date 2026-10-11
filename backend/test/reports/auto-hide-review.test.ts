import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi, type Api } from '../support/api.ts';

const REVIEW = 'review-andre-pelau';
const report = (api: Api, email: string | null) =>
  (email ? signedInClient(api, email) : Promise.resolve(api.client())).then((c) =>
    c.post('/api/reports', { targetKind: 'Review', targetId: REVIEW, reason: 'Fake or spam', details: '', challengeToken: 'local:report:x' }),
  );
const status = async (api: Api) => (await documents(api, 'reviews')).find((r) => r.id === REVIEW);

describe('hiding a review automatically after reports (L2-055.2)', () => {
  it('Given a review reported by 3 different signed-in users within 7 days, when the third report is created, then the review is hidden from the public page', async () => {
    const api = await startApi();
    assert.equal((await report(api, 'nadia.j@example.com')).status, 201);
    advanceClock(api, 2 * 24 * 3600_000);
    assert.equal((await report(api, 'priya.r@example.com')).status, 201);
    assert.equal((await status(api)).status, 'Published', 'two reports do not hide it');
    advanceClock(api, 4 * 24 * 3600_000);
    assert.equal((await report(api, 'jr.pierre@example.com')).status, 201);

    const hidden = await status(api);
    assert.equal(hidden.status, 'Hidden');
    assert.equal(hidden.hiddenBy, 'reports');
    assert.equal(hidden.hiddenAt, '2026-10-16T14:00:00.000Z');
    assert.deepEqual(hidden.hidden, { by: null, reports: 3, reason: '', at: '2026-10-16T14:00:00.000Z' });
    const list = await api.client().get('/api/public/caterers/pelau-house/reviews');
    assert.equal(list.body.items.some((r: { id: string }) => r.id === REVIEW), false);
  });

  it('Given reports from visitors who were not signed in, or older than 7 days, when a third report arrives, then they do not count and the review stays', async () => {
    const api = await startApi();
    await report(api, 'nadia.j@example.com');
    advanceClock(api, 8 * 24 * 3600_000);
    await report(api, null);
    await report(api, 'priya.r@example.com');
    await report(api, 'jr.pierre@example.com');
    assert.equal((await status(api)).status, 'Published');
  });
});
