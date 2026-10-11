import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';

describe('the caterer’s own reviews (respond-to-review design)', async () => {
  const api = await startApi();

  it('Given Pelau House has 23 published reviews, when Kendra opens her reviews, then she sees the newest 10, the average and how many await a response', async () => {
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');

    const res = await kendra.get('/api/caterer/reviews?page=1');

    assert.equal(res.status, 200);
    assert.equal(res.body.total, 23);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.pageCount, 3);
    const published = (await documents(api, 'reviews')).filter((r) => r.catererId === 'cat-001' && r.status === 'Published');
    assert.equal(res.body.average, published.reduce((s, r) => s + r.rating, 0) / published.length);
    assert.equal(res.body.unanswered, 1);
    assert.equal(res.body.items.length, 10);
    const posted = res.body.items.map((r: { postedAt: string }) => r.postedAt);
    assert.deepEqual(posted, [...posted].sort().reverse());
    const marcia = res.body.items.find((r: { id: string }) => r.id === 'review-marcia-pelau');
    assert.equal(marcia.author, 'Marcia T.');
    assert.equal(marcia.eventMonth.length, 7);
    assert.deepEqual(Object.keys(marcia).sort(), ['author', 'eventMonth', 'id', 'postedAt', 'rating', 'response', 'text']);
  });

  it('Given a page past the end or not a number, when asked for, then the nearest page comes back', async () => {
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');

    assert.equal((await kendra.get('/api/caterer/reviews?page=9')).body.page, 3);
    assert.equal((await kendra.get('/api/caterer/reviews?page=3')).body.items.length, 3);
    assert.equal((await kendra.get('/api/caterer/reviews?page=abc')).body.page, 1);
  });

  it('Given a caterer with no reviews, when they open their reviews, then the page is empty with an average of 0', async () => {
    const paulette = await signedInClient(api, 'paulette@blackcakeco.example');

    const res = await paulette.get('/api/caterer/reviews');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { items: [], page: 1, pageCount: 1, total: 0, average: 0, unanswered: 0 });
  });
});
