import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';

const JEAN_ROBERT = 'jr.pierre@example.com';
const POST = '/api/me/caterers/pelau-house/reviews';
const TEXT = 'We had Pelau House for our church harvest lunch, 80 people. The curry channa and pelau were perfect.';

describe('writing a review (L2-049, L2-050)', () => {
  it('Given an eligible customer, when they post a rating and 20 to 2,000 characters, then the review is live at once, first on the page and counted (L2-050.1)', async () => {
    const api = await startApi();
    const jr = await signedInClient(api, JEAN_ROBERT);
    const res = await jr.post(POST, { rating: 5, text: `  ${TEXT}  `, status: 'Published', authorName: 'Someone Else' });
    assert.equal(res.status, 201);
    assert.deepEqual(res.body, { status: 'Published', editableUntil: '2026-11-09T14:00:00.000Z' });

    const page = await api.client().get('/api/public/caterers/pelau-house/reviews');
    assert.equal(page.body.total, 24);
    assert.equal(page.body.items[0].author, 'Jean-Robert P.');
    assert.equal(page.body.items[0].eventMonth, '2026-09');
    assert.equal(page.body.items[0].text, TEXT);
    const caterer = await api.client().get('/api/public/caterers/pelau-house');
    assert.equal(caterer.body.rating.count, 24);

    const stored = (await documents(api, 'reviews')).find((r) => r.authorUserId === 'user-jean-robert');
    assert.equal(stored.authorName, 'Jean-Robert Pierre');
    assert.equal(stored.createdAt, '2026-10-10T14:00:00.000Z');
    const again = await jr.get('/api/me/caterers/pelau-house/review-eligibility');
    assert.equal(again.body.status, 'AlreadyReviewed');
  });

  for (const [what, text, reason] of [
    ['a link', 'Lovely food for 80 people. See more at www.example.com, truly great.', 'link'],
    ['an email address', 'Lovely food for 80 people. Write to someone@example.com for the menu.', 'email'],
    ['a phone number', 'Lovely food for 80 people. Call Kendra on 416-555-0199, she is the best!', 'phone'],
  ] as const) {
    it(`Given text with ${what}, when it is posted, then it is held for a quick check and not shown (L2-050.3)`, async () => {
      const api = await startApi();
      const res = await (await signedInClient(api, JEAN_ROBERT)).post(POST, { rating: 5, text });
      assert.equal(res.status, 201);
      assert.equal(res.body.status, 'Held');
      const stored = (await documents(api, 'reviews')).find((r) => r.authorUserId === 'user-jean-robert');
      assert.equal(stored.status, 'Held');
      assert.equal(stored.holdReason, reason);
      assert.equal((await api.client().get('/api/public/caterers/pelau-house/reviews')).body.total, 23);
    });
  }

  it('Given a rating of 0, 6 or 3.5, or text under 20 or over 2,000 characters, when it is posted, then each field gets its message and nothing is stored (L2-050.2)', async () => {
    const api = await startApi();
    const jr = await signedInClient(api, JEAN_ROBERT);
    for (const rating of [0, 6, 3.5, undefined]) {
      const res = await jr.post(POST, { rating, text: TEXT });
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { rating: ['Choose a rating from 1 to 5 stars'] });
    }
    assert.deepEqual((await jr.post(POST, { rating: 4, text: 'Great food!!' })).body.errors, { text: ['Write at least 20 characters'] });
    assert.deepEqual((await jr.post(POST, { rating: 4, text: 'x'.repeat(2001) })).body.errors, { text: ['Write no more than 2,000 characters'] });
    assert.equal((await documents(api, 'reviews')).some((r) => r.authorUserId === 'user-jean-robert'), false);
  });

  it('Given a customer with no answered past enquiry here, when they post a review directly, then it is refused with 403 (L2-049.2)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, 'priya.r@example.com')).post(POST, { rating: 5, text: TEXT });
    assert.equal(res.status, 403);
  });

  it('Given the eligible event was 91 days ago, when the customer posts, then it is refused with 403 (L2-049.3)', async () => {
    const api = await startApi();
    api.env.clock.set('2026-12-06T15:00:00Z');
    const res = await (await signedInClient(api, JEAN_ROBERT)).post(POST, { rating: 5, text: TEXT });
    assert.equal(res.status, 403);
  });

  it('Given a customer already reviewed the caterer, when they post a second, then it is refused with 409 (L2-049.4)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, 'marcia.t@example.com')).post(POST, { rating: 5, text: TEXT });
    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'You have already reviewed this caterer');
  });

  it('Given a caterer account, when it posts a review of its own business, then it is refused with 403 (L2-049.5)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, 'kendra@pelauhouse.example')).post(POST, { rating: 5, text: TEXT });
    assert.equal(res.status, 403);
  });

  it('Given a caterer that is not published, when a review is posted, then the answer is 404', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, JEAN_ROBERT)).post('/api/me/caterers/hibiscus-hut/reviews', { rating: 5, text: TEXT });
    assert.equal(res.status, 404);
  });
});
