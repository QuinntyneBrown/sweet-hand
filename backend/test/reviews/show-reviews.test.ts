import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';
import { reviews } from '../../src/reviews/model.ts';

describe('showing reviews on the caterer page (L2-051)', async () => {
  const api = await startApi();

  it('Given 23 published reviews, when a visitor asks for the first page, then the 10 newest come with name and initial, event month, rating, text and response (L2-051.3, L2-051.4)', async () => {
    const res = await api.client().get('/api/public/caterers/pelau-house/reviews');
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 23);
    assert.equal(res.body.page, 1);
    assert.equal(res.body.pageCount, 3);
    assert.equal(res.body.items.length, 10);
    assert.deepEqual(res.body.items[0], {
      id: 'review-marcia-pelau',
      author: 'Marcia T.',
      eventMonth: '2026-08',
      rating: 5,
      text: 'The pelau tasted like my aunt’s. Ninety people, not a grain left.',
      edited: false,
      response: { text: 'Thank you, Marcia. Give your aunt our regards!' },
    });
    assert.equal(res.body.items[1].author, 'Andre C.');
    assert.equal(res.body.items[1].response, null);
    assert.equal(JSON.stringify(res.body).includes('user-marcia'), false, 'no account ids');
  });

  it('Given 23 published reviews, when the third page is asked for, then the last 3 come; an out-of-range page gives the first', async () => {
    const third = await api.client().get('/api/public/caterers/pelau-house/reviews?page=3');
    assert.equal(third.body.page, 3);
    assert.equal(third.body.items.length, 3);
    const silly = await api.client().get('/api/public/caterers/pelau-house/reviews?page=9');
    assert.equal(silly.body.page, 1);
  });

  it('Given a caterer that is not published, when its reviews are asked for, then the answer is 404', async () => {
    const res = await api.client().get('/api/public/caterers/hibiscus-hut/reviews');
    assert.equal(res.status, 404);
  });

  it('Given a held review, when the reviews are listed, then it is left out of the list and the count (L2-051.5)', async () => {
    const env = await startApi();
    await env.env.db.transaction(async (tx) => {
      const r = (await reviews(tx).get('review-marcia-pelau'))!;
      await reviews(tx).put({ ...r, status: 'Held' });
    });
    const res = await env.client().get('/api/public/caterers/pelau-house/reviews');
    assert.equal(res.body.total, 22);
    assert.equal(res.body.items[0].author, 'Andre C.');
  });
});
