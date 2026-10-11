import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { put, scenario } from './support.ts';

const auditOf = async (api: Api) => (await documents(api, 'audit')).sort((a, b) => a.seq - b.seq);
const review = async (api: Api, id: string) => (await documents(api, 'reviews')).find((r) => r.id === id);

describe('moderating reviews (L2-059, L2-050.3)', () => {
  it('Given held and hidden reviews, when an operator lists them, then held ones come first newest first, with what the check matched (L2-050.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const res = await leah.get('/api/operator/reviews');
    assert.equal(res.status, 200);
    assert.equal(res.body.held, 2);
    assert.equal(res.body.hidden, 2);
    assert.deepEqual(res.body.reviews.map((r: any) => r.catererName), ['Sugar Dumplin', 'Cou-Cou']);
    const priya = res.body.reviews[0];
    assert.deepEqual(priya, {
      id: 'review-priya-sugar-dumplin',
      status: 'Held',
      catererName: 'Sugar Dumplin',
      catererSlug: 'sugar-dumplin',
      catererPhoto: '/media/sugar-dumplin.jpg?w=400&fm=jpeg',
      reviewer: 'Priya R.',
      rating: 5,
      text: priya.text,
      eventDate: '2026-09-12',
      held: { reason: 'phone', ranges: [{ start: priya.text.indexOf('416-555-0187'), end: priya.text.indexOf('416-555-0187') + 12 }] },
      hidden: null,
      at: '2026-10-10T11:58:00.000Z',
    });
    const andre = res.body.reviews[1];
    assert.deepEqual(andre.held.reason, 'link');
    assert.equal(andre.text.slice(andre.held.ranges[0].start, andre.held.ranges[0].end), 'instagram.com/coucou.to');

    const hidden = await leah.get('/api/operator/reviews?status=hidden');
    assert.deepEqual(hidden.body.reviews.map((r: any) => [r.catererName, r.hidden]), [
      ['Maracas Bay', { by: null, reports: 3, reason: '' }],
      ['Island Pot', { by: 'Tomas Reyes', reports: 0, reason: 'Personal details about staff' }],
    ]);
    assert.deepEqual((await leah.get('/api/operator/reviews?q=PRIYA')).body.reviews.map((r: any) => r.id), ['review-priya-sugar-dumplin']);
    assert.deepEqual((await leah.get('/api/operator/reviews?q=Lambie%20Lane')).body.reviews, []);
  });

  it('Given a held review, when an operator approves it with a reason, then it is published and audited (L2-059.1)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.deepEqual((await leah.post('/api/operator/reviews/review-andre-cou-cou/approve', { reason: ' ' })).body.errors, { reason: ['Add a reason for this decision'] });
    const reason = 'The link is the caterer’s own public Instagram page, not spam.';
    assert.equal((await leah.post('/api/operator/reviews/review-andre-cou-cou/approve', { reason })).status, 204);
    assert.equal((await review(api, 'review-andre-cou-cou')).status, 'Published');
    assert.deepEqual((await auditOf(api)).map((a) => [a.operatorId, a.action, a.targetType, a.targetId, a.reason, a.before, a.after]), [
      ['user-leah', 'ApproveReview', 'review', 'review-andre-cou-cou', reason, 'Held', 'Published'],
    ]);
    const again = await leah.post('/api/operator/reviews/review-andre-cou-cou/approve', { reason });
    assert.equal(again.status, 409);
    assert.deepEqual(again.body, { title: 'This review has already been moderated', status: 'Published' });
  });

  it('Given a published review by a customer, when an operator hides it with a reason, then it leaves the rating and the author is emailed the reason (L2-059.2)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const before = (await api.client().get('/api/public/caterers/pelau-house')).body.rating.count;
    const reason = 'A phone number in a review can identify the caterer’s family.';
    assert.equal((await leah.post('/api/operator/reviews/review-marcia-pelau/hide', { reason })).status, 204);
    const hidden = await review(api, 'review-marcia-pelau');
    assert.equal(hidden.status, 'Hidden');
    assert.deepEqual(hidden.hidden, { by: 'user-leah', reports: 0, reason, at: '2026-10-10T14:00:00.000Z' });
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).body.rating.count, before - 1);
    assert.ok((await outbox(api)).some((e) => e.to === 'marcia.t@example.com' && e.kind === 'review-hidden' && e.reason === reason));
    const list = await leah.get('/api/operator/reviews?status=hidden');
    assert.deepEqual(list.body.reviews[0].hidden, { by: 'Leah Mohammed', reports: 0, reason });
  });

  it('Given a hidden review, when an operator restores it, then it is published again (L2-059.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    assert.equal((await leah.post('/api/operator/reviews/review-kwame-island-pot/restore', { reason: 'Edited out the personal details.' })).status, 204);
    const restored = await review(api, 'review-kwame-island-pot');
    assert.equal(restored.status, 'Published');
    assert.equal(restored.hidden, undefined);
    assert.equal((await auditOf(api))[0].action, 'RestoreReview');
  });

  it('Given a review, when an operator removes it, then its text is gone and it cannot be restored (L2-059.4)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const reason = 'Personal attack on a named member of staff, confirmed by 3 reports.';
    assert.equal((await leah.post('/api/operator/reviews/review-devon-maracas-hidden/remove', { reason })).status, 204);
    const removed = await review(api, 'review-devon-maracas-hidden');
    assert.deepEqual([removed.status, removed.text], ['Removed', '']);
    assert.deepEqual((await auditOf(api)).map((a) => [a.action, a.before, a.after]), [['RemoveReview', 'Hidden', 'Removed']]);
    assert.equal((await leah.post('/api/operator/reviews/review-devon-maracas-hidden/restore', { reason })).status, 409);
    assert.equal((await leah.post('/api/operator/reviews/review-devon-maracas-hidden/publish', { reason })).status, 404, 'an unknown action');
    assert.equal((await leah.post('/api/operator/reviews/review-nope/remove', { reason })).status, 404);
  });

  it('Given nothing held or hidden, when the list is opened, then it is empty', async () => {
    const api = await startApi();
    await scenario(api, 'no-reviews-to-moderate');
    const res = await (await signedInClient(api, 'tomas@sweethand.example')).get('/api/operator/reviews');
    assert.deepEqual(res.body, { held: 0, hidden: 0, reviews: [] });
  });

  it('Given a held review with an email address, when it is listed, then the address is what the check matched', async () => {
    const api = await startApi();
    await put(api, 'reviews', { id: 'review-test-mail', catererId: 'cat-002', authorName: 'Nadia Joseph', rating: 5, text: 'Write to desmond@coucou.example for bookings.', eventDate: '2026-09-01', createdAt: '2026-10-10T09:00:00.000Z', status: 'Held', holdReason: 'email' } as any);
    const res = await (await signedInClient(api, 'leah@sweethand.example')).get('/api/operator/reviews');
    const nadia = res.body.reviews.find((r: any) => r.id === 'review-test-mail');
    assert.equal(nadia.held.reason, 'email');
    assert.deepEqual(nadia.held.ranges.map((r: any) => nadia.text.slice(r.start, r.end)), ['desmond@coucou.example']);
  });
});
