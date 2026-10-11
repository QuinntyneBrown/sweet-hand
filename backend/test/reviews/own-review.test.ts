import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';
import { reviews } from '../../src/reviews/model.ts';

const MARCIA = 'marcia.t@example.com';
const MINE = '/api/me/reviews/review-marcia-pelau';
const EDITED = 'The pelau tasted like my aunt’s. Ninety people, not a grain left, and the macaroni pie too.';

describe('the author editing and deleting their review (L2-053)', () => {
  it('Given a review posted 20 days ago, when its author edits it, then the change is saved and labelled "Edited" (L2-053.1)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, MARCIA)).put(MINE, { rating: 4, text: EDITED });
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'Published', editableUntil: '2026-10-20T14:00:00.000Z' });
    const shown = (await api.client().get('/api/public/caterers/pelau-house/reviews')).body.items[0];
    assert.equal(shown.text, EDITED);
    assert.equal(shown.rating, 4);
    assert.equal(shown.edited, true);
    const stored = (await documents(api, 'reviews')).find((r) => r.id === 'review-marcia-pelau');
    assert.equal(stored.editedAt, '2026-10-10T14:00:00.000Z');
    assert.equal(stored.createdAt, '2026-09-20T14:00:00.000Z');
  });

  it('Given an edit that adds a phone number, when it is saved, then the review is held for a quick check again (L2-050.3)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, MARCIA)).put(MINE, { rating: 5, text: 'Ninety people, not a grain left. Call me on 647-555-0187 for details.' });
    assert.equal(res.body.status, 'Held');
    assert.equal((await api.client().get('/api/public/caterers/pelau-house/reviews')).body.total, 22);
  });

  it('Given an edit with no rating, when it is saved, then the field gets its message', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, MARCIA)).put(MINE, { text: EDITED });
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { rating: ['Choose a rating from 1 to 5 stars'] });
  });

  it('Given a review posted 31 days ago, when its author tries to edit it, then it is refused with 403 (L2-053.2)', async () => {
    const api = await startApi();
    api.env.clock.set('2026-10-21T14:00:00Z');
    const marcia = await signedInClient(api, MARCIA);
    assert.equal((await marcia.put(MINE, { rating: 4, text: EDITED })).status, 403);
    const eligibility = await marcia.get('/api/me/caterers/pelau-house/review-eligibility');
    assert.equal(eligibility.body.canEdit, false);
    assert.equal(eligibility.body.editableUntil, null);
  });

  it('Given another customer or a caterer, when they edit or delete a review they did not write, then it is refused with 403 (L2-053.4)', async () => {
    const api = await startApi();
    for (const email of ['andre.c@example.com', 'kendra@pelauhouse.example']) {
      const other = await signedInClient(api, email);
      assert.equal((await other.put(MINE, { rating: 1, text: EDITED })).status, 403, email);
      assert.equal((await other.delete(MINE)).status, 403, email);
    }
    assert.equal((await documents(api, 'reviews')).find((r) => r.id === 'review-marcia-pelau').text, 'The pelau tasted like my aunt’s. Ninety people, not a grain left.');
  });

  it('Given the author deletes their review, when it is confirmed, then it and the caterer’s response are gone and the count is recalculated (L2-053.3)', async () => {
    const api = await startApi();
    // Any time: well after the edit window.
    api.env.clock.set('2026-12-01T14:00:00Z');
    const fresh = await signedInClient(api, MARCIA);
    const res = await fresh.delete(MINE);
    assert.equal(res.status, 204);
    assert.equal((await documents(api, 'reviews')).some((r) => r.id === 'review-marcia-pelau'), false);
    const caterer = await api.client().get('/api/public/caterers/pelau-house');
    assert.equal(caterer.body.rating.count, 22);
    assert.equal((await fresh.delete(MINE)).status, 404);
  });

  it('Given a review an operator removed, when the author edits or deletes it, then the answer is 404', async () => {
    const api = await startApi();
    await api.env.db.transaction(async (tx) => {
      const r = (await reviews(tx).get('review-marcia-pelau'))!;
      await reviews(tx).put({ ...r, status: 'Removed' });
    });
    const marcia = await signedInClient(api, MARCIA);
    assert.equal((await marcia.put(MINE, { rating: 4, text: EDITED })).status, 404);
    assert.equal((await marcia.delete(MINE)).status, 404);
  });
});
