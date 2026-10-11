import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { allScenarios } from '../../src/testing/scenarios/index.ts';

const LEAH = 'leah@sweethand.example';
const TOMAS = 'tomas@sweethand.example';
const NOW = '2026-10-10T14:00:00.000Z';

const scenario = (api: Api, name: string) => api.env.db.transaction((tx) => Promise.resolve(allScenarios[name]({ tx, now: api.env.clock.now(), env: api.env }, {})));
const stored = async (api: Api, id: string) => (await documents(api, 'reviews')).find((r) => r.id === id);
const rating = async (api: Api, slug: string) => (await api.client().get(`/api/public/caterers/${slug}`)).body.rating;
const pelauRating = (api: Api) => rating(api, 'pelau-house');

describe('moderate reviews (L2-059, L2-050.3)', () => {
  it('Given held reviews, when an operator lists them, then they come newest first with what the check matched', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get('/api/operator/reviews');

    assert.equal(res.status, 200);
    assert.equal(res.body.held, 2);
    assert.equal(res.body.hidden, 2);
    assert.deepEqual(res.body.reviews.map((r: { catererName: string }) => r.catererName), ['Sugar Dumplin', 'Cou-Cou']);
    const [priya, andre] = res.body.reviews;
    assert.equal(priya.id, 'review-priya-sugar-dumplin');
    assert.equal(priya.status, 'Held');
    assert.equal(priya.reviewer, 'Priya R.');
    assert.equal(priya.at, '2026-10-10T11:58:00.000Z');
    assert.equal(priya.hidden, null);
    assert.equal(priya.held.reason, 'phone');
    assert.deepEqual(priya.held.ranges.map((r: { start: number; end: number }) => priya.text.slice(r.start, r.end)), ['416-555-0187']);
    assert.equal(andre.held.reason, 'link');
    assert.deepEqual(andre.held.ranges.map((r: { start: number; end: number }) => andre.text.slice(r.start, r.end)), ['instagram.com/coucou.to']);
    assert.match(priya.catererPhoto, /^\/media\/.+\?w=400&fm=jpeg$/);
  });

  it('Given hidden reviews, when an operator lists them, then each says who hid it, how many reports and why', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get('/api/operator/reviews?status=hidden');

    assert.deepEqual(res.body.reviews.map((r: { catererName: string }) => r.catererName), ['Maracas Bay', 'Island Pot']);
    assert.deepEqual(res.body.reviews[0].hidden, { by: null, reports: 3, reason: '' });
    assert.equal(res.body.reviews[0].at, '2026-10-08T20:12:00.000Z');
    assert.deepEqual(res.body.reviews[1].hidden, { by: 'Tomas Reyes', reports: 0, reason: 'Personal details about staff' });
    assert.equal(res.body.reviews[1].held, null);
  });

  it('Given a search, when it is applied, then it matches the caterer or the reviewer (L2-067.5)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const names = async (q: string) => (await leah.get(`/api/operator/reviews?q=${encodeURIComponent(q)}`)).body.reviews.map((r: { reviewer: string }) => r.reviewer);

    assert.deepEqual(await names('priya'), ['Priya R.']);
    assert.deepEqual(await names('RAMDIAL'), ['Priya R.']);
    assert.deepEqual(await names('cou-cou'), ['Andre C.']);
    assert.deepEqual(await names('Lambie Lane'), []);
  });

  it('Given an operator approves a held review with a reason, when it is saved, then it is published and audited (L2-059.1)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const before = await rating(api, 'cou-cou');

    const res = await leah.post('/api/operator/reviews/review-andre-cou-cou/approve', { reason: 'The caterer’s own Instagram page.' });

    assert.equal(res.status, 204);
    assert.equal((await stored(api, 'review-andre-cou-cou')).status, 'Published');
    assert.equal((await rating(api, 'cou-cou')).count, before.count + 1);
    const entry = (await documents(api, 'audit')).find((e) => e.action === 'ApproveReview');
    assert.deepEqual(
      [entry.operatorId, entry.targetType, entry.targetId, entry.reason, entry.before, entry.after, entry.at],
      ['user-leah', 'review', 'review-andre-cou-cou', 'The caterer’s own Instagram page.', 'Held', 'Published', NOW],
    );
    assert.equal((await leah.get('/api/operator/reviews')).body.held, 1);
  });

  it('Given a published review, when an operator hides it, then it leaves the page, the average is recalculated and the author is emailed the reason (L2-059.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const before = await pelauRating(api);

    const res = await leah.post('/api/operator/reviews/review-nadia-pelau/hide', { reason: 'Names a member of staff.' });

    assert.equal(res.status, 204);
    const review = await stored(api, 'review-nadia-pelau');
    assert.equal(review.status, 'Hidden');
    assert.deepEqual(review.hidden, { by: 'user-leah', reports: 0, reason: 'Names a member of staff.', at: NOW });
    const after = await pelauRating(api);
    assert.equal(after.count, before.count - 1);
    assert.notEqual(after.average, before.average);
    const nadia = (await documents(api, 'users')).find((u) => u.id === 'user-nadia');
    const mail = (await outbox(api)).find((m) => m.kind === 'review-moderated');
    assert.equal(mail?.to, nadia.email);
    assert.equal(mail?.reason, 'Names a member of staff.');
    assert.equal(mail?.decision, 'hide');
    const listed = (await leah.get('/api/operator/reviews?status=hidden')).body.reviews[0];
    assert.deepEqual([listed.id, listed.hidden.by, listed.at], ['review-nadia-pelau', 'Leah Mohammed', NOW]);
  });

  it('Given a hidden review, when an operator restores it, then it reappears and counts again (L2-059.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    const before = await rating(api, 'island-pot');

    const res = await leah.post('/api/operator/reviews/review-kwame-island-pot/restore', { reason: 'Personal details removed.' });

    assert.equal(res.status, 204);
    const review = await stored(api, 'review-kwame-island-pot');
    assert.equal(review.status, 'Published');
    assert.equal(review.hidden, undefined);
    assert.equal((await rating(api, 'island-pot')).count, before.count + 1);
    const entry = (await documents(api, 'audit')).find((e) => e.action === 'RestoreReview');
    assert.deepEqual([entry.before, entry.after], ['Hidden', 'Published']);
  });

  it('Given an operator removes a review, when it is saved, then its text is gone, it cannot be restored and only the audit entry remains (L2-059.4)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/reviews/review-devon-maracas-hidden/remove', { reason: 'Personal attack, 3 reports.' });
    const restore = await leah.post('/api/operator/reviews/review-devon-maracas-hidden/restore', { reason: 'Changed my mind.' });

    assert.equal(res.status, 204);
    const review = await stored(api, 'review-devon-maracas-hidden');
    assert.equal(review.status, 'Removed');
    assert.equal(review.text, '');
    assert.equal(review.response, undefined);
    assert.equal(restore.status, 409);
    assert.deepEqual(restore.body, { title: 'This review has already been moderated', status: 'Removed' });
    const entries = (await documents(api, 'audit')).filter((e) => e.targetId === 'review-devon-maracas-hidden' && e.at === NOW);
    assert.deepEqual(entries.map((e) => [e.action, e.before, e.after]), [['RemoveReview', 'Hidden', 'Removed']]);
  });

  it('Given a decision without a reason, an unknown action or review, when it is sent, then it is refused and nothing changes', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const blank = await leah.post('/api/operator/reviews/review-priya-sugar-dumplin/hide', { reason: '  ' });
    const unknownAction = await leah.post('/api/operator/reviews/review-priya-sugar-dumplin/publish', { reason: 'x' });
    const unknownReview = await leah.post('/api/operator/reviews/review-nobody/hide', { reason: 'x' });
    const wrongState = await leah.post('/api/operator/reviews/review-marcia-pelau/approve', { reason: 'x' });

    assert.equal(blank.status, 400);
    assert.deepEqual(blank.body.errors, { reason: ['Add a reason for this decision'] });
    assert.equal(unknownAction.status, 404);
    assert.equal(unknownReview.status, 404);
    assert.equal(wrongState.status, 409);
    assert.equal((await stored(api, 'review-priya-sugar-dumplin')).status, 'Held');
  });

  it('Given nothing held or hidden, when an operator lists reviews, then both counts are zero', async () => {
    const api = await startApi();
    await scenario(api, 'no-reviews-to-moderate');
    const leah = await signedInClient(api, LEAH);

    const res = await leah.get('/api/operator/reviews');

    assert.deepEqual([res.body.held, res.body.hidden, res.body.reviews.length], [0, 0, 0]);
  });
});
