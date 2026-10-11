import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi } from '../support/api.ts';
import { putCastReports, scenario } from './support.ts';

describe('review queue (L2-047, L2-055.1)', async () => {
  const api = await startApi();
  await putCastReports(api);
  const leah = await signedInClient(api, 'leah@sweethand.example');

  it('Given profiles, reports, an expired certificate and held reviews, when an operator opens the queue, then they are listed oldest first with how long each waited (L2-047.1)', async () => {
    const res = await leah.get('/api/operator/queue');
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.items.map((i: any) => [i.kind, i.title, i.waitingSince, i.late]),
      [
        ['profile', 'Auntie Bev’s Kitchen', '2026-10-07T18:10:00Z', true],
        ['resubmitted', 'Breadfruit & Butter', '2026-10-08T13:15:00Z', false],
        ['reports', 'Review of Maracas Bay by Devon W.', '2026-10-08T20:12:00.000Z', false],
        ['reports', 'Pelau House', '2026-10-08T23:15:00.000Z', false],
        ['certificate', 'Flying Fish Kitchen', '2026-10-09T23:30:00.000Z', false],
        ['held-review', 'Review of Cou-Cou by Andre C.', '2026-10-10T01:14:00.000Z', false],
        ['reports', 'Island Pot', '2026-10-10T08:12:00.000Z', false],
        ['held-review', 'Review of Sugar Dumplin by Priya R.', '2026-10-10T11:58:00.000Z', false],
      ],
    );
    assert.equal(res.body.late, 1);
    assert.deepEqual(res.body.counts, { all: 8, profiles: 2, nameChanges: 0, certificates: 1, reports: 3, heldReviews: 2 });
    const bev = res.body.items[0];
    assert.equal(bev.cuisine, 'Jamaican');
    assert.equal(bev.area, 'Oshawa');
    assert.equal(bev.photo, '/media/green-fig-catering.jpg?w=400&fm=jpeg');
    assert.equal(bev.targetId, 'cat-910');
  });

  it('Given 2 reports about one review, when the queue lists them, then they are one item with a count and both reasons (L2-055.1)', async () => {
    const res = await leah.get('/api/operator/queue?kind=reports');
    const devon = res.body.items[0];
    assert.equal(devon.id, 'reports:R-2041');
    assert.equal(devon.targetId, 'R-2041');
    assert.equal(devon.count, 2);
    assert.deepEqual(devon.reasons, ['Fake or spam', 'Inappropriate content']);
    assert.equal(devon.photo, null);
    assert.deepEqual(res.body.items.map((i: any) => i.title), ['Review of Maracas Bay by Devon W.', 'Pelau House', 'Island Pot']);
    assert.equal(res.body.total, 3);
    assert.equal(res.body.counts.all, 8, 'counts ignore the filter');
  });

  it('Given a pending business-name change, when the queue is opened, then it waits as a name change since the caterer asked (L2-044.2)', async () => {
    await scenario(api, 'pelau-name-change-pending');
    const res = await leah.get('/api/operator/queue?kind=name-changes');
    assert.deepEqual(res.body.items, [
      {
        id: 'name:cat-001',
        targetId: 'cat-001',
        title: 'Pelau House',
        photo: '/media/pelau-house.jpg?w=400&fm=jpeg',
        waitingSince: '2026-10-09T22:20:00.000Z',
        late: false,
        kind: 'name-change',
        newName: 'Pelau House by Kendra',
        status: 'Published',
      },
    ]);
  });

  it('Given an expired certificate, when the queue lists it, then the caterer is still published (L2-040.3)', async () => {
    const res = await leah.get('/api/operator/queue?kind=certificates');
    assert.deepEqual(
      res.body.items.map((i: any) => [i.targetId, i.expired, i.status]),
      [['cat-024', '2026-09-30', 'Published']],
    );
  });

  it('Given a page past the end, when it is asked for, then the last page is returned', async () => {
    const res = await leah.get('/api/operator/queue?page=9');
    assert.equal(res.body.page, 1);
    assert.equal(res.body.pageCount, 1);
    assert.equal(res.body.pageSize, 20);
  });

  it('Given an operator, when the session view loads, then it carries the number of items waiting', async () => {
    const res = await leah.get('/api/session');
    assert.equal(res.body.queueCount, 9);
  });
});

describe('review queue arrangements for the Playwright suite (ADR 0008)', () => {
  it('Given the long queue, when an operator opens it, then 34 items wait in pages of 20 and 9 are late', async () => {
    const api = await startApi();
    await putCastReports(api);
    await scenario(api, 'long-review-queue');
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const first = await leah.get('/api/operator/queue');
    assert.deepEqual([first.body.total, first.body.items.length, first.body.late, first.body.pageCount], [34, 20, 9, 2]);
    assert.equal((await leah.get('/api/operator/queue?page=2')).body.items.length, 14);
  });

  it('Given nothing waiting, when an operator opens the queue, then it is empty', async () => {
    const api = await startApi();
    await putCastReports(api);
    await scenario(api, 'pelau-name-change-pending');
    await scenario(api, 'empty-review-queue');
    const res = await (await signedInClient(api, 'leah@sweethand.example')).get('/api/operator/queue');
    assert.equal(res.body.counts.all, 0);
  });

  it('Given a new report or a newly held review, when the queue is opened again, then each is there', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, 'leah@sweethand.example');
    const created = (await scenario(api, 'new-report', { caterer: 'sugar-dumplin', reason: 'Food safety concern' })) as { id: string };
    await scenario(api, 'hold-review', { caterer: 'cou-cou', author: 'Nadia Joseph', holdReason: 'phone' });
    const res = await leah.get('/api/operator/queue');
    const report = res.body.items.find((i: any) => i.kind === 'reports');
    assert.deepEqual([report.targetId, report.title, report.reasons], [created.id, 'Sugar Dumplin', ['Food safety concern']]);
    assert.ok(res.body.items.some((i: any) => i.kind === 'held-review' && i.title === 'Review of Cou-Cou by Nadia J.' && i.holdReason === 'phone'));
  });
});
