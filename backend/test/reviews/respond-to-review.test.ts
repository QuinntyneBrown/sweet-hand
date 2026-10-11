import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { outbox, signedInClient, startApi } from '../support/api.ts';
import { caterers } from '../../src/caterers/model.ts';

const KENDRA = 'kendra@pelauhouse.example';
const ANDRE_RESPONSE = '/api/caterer/reviews/review-andre-pelau/response';
const THANKS = 'Thanks, Andre! Feeding your team was a pleasure. Doubles anytime.';

describe('the caterer responding to reviews (L2-052)', () => {
  it('Given a caterer with 23 published reviews, when they open their reviews, then the 10 newest come with average, unanswered count and responses', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, KENDRA)).get('/api/caterer/reviews');
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 23);
    assert.equal(res.body.pageCount, 3);
    assert.equal(res.body.unanswered, 1);
    assert.equal(Math.round(res.body.average * 10) / 10, 4.7);
    assert.equal(res.body.items.length, 10);
    assert.deepEqual(res.body.items[0], {
      id: 'review-marcia-pelau',
      author: 'Marcia T.',
      eventMonth: '2026-08',
      postedAt: '2026-09-20T14:00:00.000Z',
      rating: 5,
      text: 'The pelau tasted like my aunt’s. Ninety people, not a grain left.',
      response: { text: 'Thank you, Marcia. Give your aunt our regards!', createdAt: '2026-09-21T14:00:00.000Z' },
    });
    assert.equal(res.body.items[1].response, null);
    const last = await (await signedInClient(api, KENDRA)).get('/api/caterer/reviews?page=7');
    assert.equal(last.body.page, 3);
    assert.equal(last.body.items.length, 3);
  });

  it('Given a review with no response, when the caterer posts one, then it shows under the review and the reviewer is emailed (L2-052.1, L2-052.4)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, KENDRA)).post(ANDRE_RESPONSE, { text: `  ${THANKS} ` });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body.response, { text: THANKS, createdAt: '2026-10-10T14:00:00.000Z' });
    const shown = (await api.client().get('/api/public/caterers/pelau-house/reviews')).body.items[1];
    assert.deepEqual(shown.response, { text: THANKS });
    const mail = (await outbox(api)).filter((m) => m.kind === 'review-response');
    assert.equal(mail.length, 1);
    assert.equal(mail[0].to, 'andre.c@example.com');
    assert.equal(mail[0].caterer, 'Pelau House', 'the email names the caterer');
  });

  it('Given a response to a review that is later held, when the caterer edits or deletes the response, then it is allowed at any time (L2-052)', async () => {
    const api = await startApi();
    await api.env.db.transaction(async (tx) => {
      const r = await tx.collection<any>('reviews').get('review-marcia-pelau');
      await tx.collection<any>('reviews').put({ ...r, status: 'Held' });
    });
    const kendra = await signedInClient(api, KENDRA);
    const edited = await kendra.put('/api/caterer/reviews/review-marcia-pelau/response', { text: 'Thank you, Marcia.' });
    assert.equal(edited.status, 200);
    assert.equal(edited.body.response.text, 'Thank you, Marcia.');
    const stored = (await api.env.db.transaction((tx) => tx.collection<any>('reviews').get('review-marcia-pelau')))!;
    assert.equal(stored.response.updatedAt, '2026-10-10T14:00:00.000Z', 'the edit time is recorded');
    assert.equal((await kendra.delete('/api/caterer/reviews/review-marcia-pelau/response')).status, 200);
    assert.equal((await kendra.post('/api/caterer/reviews/review-marcia-pelau/response', { text: THANKS })).status, 404, 'posting still needs a published review');
  });

  it('Given an empty or over-long response, when it is posted, then it is refused with the field message', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    for (const text of ['   ', 'x'.repeat(1001), undefined]) {
      const res = await kendra.post(ANDRE_RESPONSE, { text });
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { text: ['Write a response, up to 1,000 characters'] });
    }
  });

  it('Given a review that already has a response, when the caterer posts a second, then it is refused with 409 and the existing one (L2-052.2)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, KENDRA)).post('/api/caterer/reviews/review-marcia-pelau/response', { text: THANKS });
    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'This review already has your response');
    assert.deepEqual(res.body.response, { text: 'Thank you, Marcia. Give your aunt our regards!', createdAt: '2026-09-21T14:00:00.000Z' });
  });

  it('Given caterer Y, when Y responds to a review of caterer X, then it is refused with 403 (L2-052.3)', async () => {
    const api = await startApi();
    const vishnu = await signedInClient(api, 'vishnu@maracasbay.example');
    assert.equal((await vishnu.post(ANDRE_RESPONSE, { text: THANKS })).status, 403);
    assert.equal((await vishnu.put('/api/caterer/reviews/review-marcia-pelau/response', { text: THANKS })).status, 403);
    assert.equal((await vishnu.delete('/api/caterer/reviews/review-marcia-pelau/response')).status, 403);
    assert.equal((await outbox(api)).some((m) => m.kind === 'review-response'), false);
  });

  it('Given a response, when the caterer edits it, then the text changes and it keeps its date; deleting it leaves the review unanswered', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const edited = await kendra.put('/api/caterer/reviews/review-marcia-pelau/response', { text: 'Thank you, Marcia. Give your aunt our warmest regards!' });
    assert.equal(edited.status, 200);
    assert.deepEqual(edited.body.response, { text: 'Thank you, Marcia. Give your aunt our warmest regards!', createdAt: '2026-09-21T14:00:00.000Z' });
    const deleted = await kendra.delete('/api/caterer/reviews/review-marcia-pelau/response');
    assert.equal(deleted.status, 200);
    assert.equal(deleted.body.response, null);
    assert.equal((await kendra.get('/api/caterer/reviews')).body.unanswered, 2);
    assert.equal((await kendra.put('/api/caterer/reviews/review-marcia-pelau/response', { text: THANKS })).status, 404);
    assert.equal((await kendra.delete('/api/caterer/reviews/review-marcia-pelau/response')).status, 404);
  });

  it('Given a review that is not published or does not exist, when the caterer responds, then the answer is 404', async () => {
    const api = await startApi();
    const desmond = await signedInClient(api, 'desmond@coucou.example');
    assert.equal((await desmond.post('/api/caterer/reviews/review-andre-cou-cou/response', { text: THANKS })).status, 404);
    assert.equal((await desmond.post('/api/caterer/reviews/no-such-review/response', { text: THANKS })).status, 404);
  });

  it('Given a suspended profile, when its caterer responds, then the response is refused with 409', async () => {
    const api = await startApi();
    await api.env.db.transaction(async (tx) => {
      const c = (await caterers(tx).get('cat-001'))!;
      await caterers(tx).put({ ...c, status: 'Suspended' });
    });
    const res = await (await signedInClient(api, KENDRA)).post(ANDRE_RESPONSE, { text: THANKS });
    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'Your profile can’t be changed right now');
  });
});
