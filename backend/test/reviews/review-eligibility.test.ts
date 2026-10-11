import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi } from '../support/api.ts';
import { enquiries } from '../../src/enquiries/model.ts';

const JEAN_ROBERT = 'jr.pierre@example.com';
const MARCIA = 'marcia.t@example.com';
const KENDRA = 'kendra@pelauhouse.example';
const ELIGIBILITY = '/api/me/caterers/pelau-house/review-eligibility';

describe('who can review (L2-049)', () => {
  it('Given a customer whose enquiry the caterer replied to and whose event has passed, when they ask, then they may write a review signed "Jean-Robert P." (L2-049.1)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, JEAN_ROBERT)).get(ELIGIBILITY);
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { status: 'Eligible', eventDate: '2026-09-06', reviewerLabel: 'Jean-Robert P.' });
  });

  it('Given the only enquiry was never answered by the caterer, when the customer asks, then they are not eligible (L2-049.2)', async () => {
    const api = await startApi();
    await api.env.db.transaction(async (tx) => {
      const e = (await enquiries(tx).get('enq-jean-robert-pelau'))!;
      await enquiries(tx).put({ ...e, status: 'Open', events: e.events.filter((ev) => ev.by !== 'caterer') });
    });
    const res = await (await signedInClient(api, JEAN_ROBERT)).get(ELIGIBILITY);
    assert.deepEqual(res.body, { status: 'NotEligible' });
  });

  it('Given the event is still to come, when the customer asks, then they are not eligible (L2-049)', async () => {
    const api = await startApi();
    await api.env.db.transaction(async (tx) => {
      const e = (await enquiries(tx).get('enq-jean-robert-pelau'))!;
      await enquiries(tx).put({ ...e, eventDate: '2026-10-24' });
    });
    const res = await (await signedInClient(api, JEAN_ROBERT)).get(ELIGIBILITY);
    assert.deepEqual(res.body, { status: 'NotEligible' });
  });

  it('Given the event was 90 days ago, the customer is still eligible; 91 days after it, they are not (L2-049.3)', async () => {
    const api = await startApi();
    api.env.clock.set('2026-12-05T15:00:00Z');
    assert.equal((await (await signedInClient(api, JEAN_ROBERT)).get(ELIGIBILITY)).body.status, 'Eligible');
    api.env.clock.set('2026-12-06T15:00:00Z');
    assert.deepEqual((await (await signedInClient(api, JEAN_ROBERT)).get(ELIGIBILITY)).body, { status: 'NotEligible' });
  });

  it('Given a customer who already reviewed the caterer, when they ask, then they get their review with Edit until 30 days after posting and Delete (L2-053)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, MARCIA)).get(ELIGIBILITY);
    assert.equal(res.body.status, 'AlreadyReviewed');
    assert.equal(res.body.review.id, 'review-marcia-pelau');
    assert.equal(res.body.review.author, 'Marcia T.');
    assert.equal(res.body.canEdit, true);
    assert.equal(res.body.canDelete, true);
    assert.equal(res.body.editableUntil, '2026-10-20T14:00:00.000Z');
  });

  it('Given a caterer account, when it asks about its own business, then it is never eligible (L2-049.5)', async () => {
    const api = await startApi();
    const res = await (await signedInClient(api, KENDRA)).get(ELIGIBILITY);
    assert.deepEqual(res.body, { status: 'NotEligible' });
  });

  it('Given a caterer that is not published, when a customer asks, then the answer is 404; a visitor gets 401', async () => {
    const api = await startApi();
    assert.equal((await (await signedInClient(api, JEAN_ROBERT)).get('/api/me/caterers/hibiscus-hut/review-eligibility')).status, 404);
    assert.equal((await api.client().get(ELIGIBILITY)).status, 401);
  });
});
