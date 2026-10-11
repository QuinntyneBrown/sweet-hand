import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi } from '../support/api.ts';
import { onlyEnquiries, putCastReports, scenario } from './support.ts';

describe('caterer list and record (L2-046, L2-014, L2-058)', async () => {
  const api = await startApi();
  await putCastReports(api);
  const leah = await signedInClient(api, 'leah@sweethand.example');

  it('Given caterers in every status, when an operator lists them, then all are shown most recently changed first with counts per status (L2-046)', async () => {
    await scenario(api, 'pelau-name-change-pending');
    const res = await leah.get('/api/operator/caterers');
    assert.equal(res.status, 200);
    assert.equal(res.body.total, 69);
    assert.deepEqual(res.body.counts, { all: 69, draft: 3, pending: 2, changes: 1, published: 60, suspended: 1, removed: 2 });
    assert.equal(res.body.items.length, 20);
    assert.deepEqual(res.body.items.slice(0, 3).map((r: any) => [r.name, r.flag]), [
      ['Pelau House', 'name-change'],
      ['Island Pot', 'open-reports'],
      ['Breadfruit & Butter', 'resubmitted'],
    ]);
    assert.deepEqual(res.body.items[0], {
      id: 'cat-001',
      name: 'Pelau House',
      status: 'Published',
      photo: '/media/pelau-house.jpg?w=400&fm=jpeg',
      cuisine: 'Trinidadian & Tobagonian',
      area: 'Scarborough',
      owner: 'Kendra Baptiste',
      updatedAt: '2026-10-10T12:15:00.000Z',
      flag: 'name-change',
      openReports: 1,
    });
    const hibiscus = (await leah.get('/api/operator/caterers?status=suspended')).body.items[0];
    assert.deepEqual([hibiscus.name, hibiscus.owner, hibiscus.photo, hibiscus.updatedAt], ['Hibiscus Hut', 'Sharon Bailey', null, '2026-10-06T16:20:00.000Z']);
    const flyingFish = (await leah.get('/api/operator/caterers?q=flying')).body.items[0];
    assert.equal(flyingFish.flag, 'certificate-expired');
  });

  it('Given a status filter, a search by owner or a search with no match, when the list is asked for, then it narrows and says where the caterer is', async () => {
    const removed = await leah.get('/api/operator/caterers?status=removed');
    assert.deepEqual(removed.body.items.map((r: any) => r.name), ['Rum Shop Catering', 'Coal Pot Kitchen']);
    assert.equal(removed.body.counts.all, 69, 'counts ignore the filters');
    const kendra = await leah.get('/api/operator/caterers?q=KENDRA');
    assert.deepEqual(kendra.body.items.map((r: any) => r.name), ['Pelau House']);
    const none = await leah.get('/api/operator/caterers?status=suspended&q=Pelau');
    assert.deepEqual(none.body.items, []);
    assert.deepEqual(none.body.otherMatch, { name: 'Pelau House', status: 'Published' });
  });

  it('Given a published caterer, when an operator opens its record, then the owner, profile, certificate, activity and history are shown (L2-014, L2-046.4)', async () => {
    await onlyEnquiries(api, 'cat-001', {
      id: 'enq-test-pelau',
      customerId: 'user-marcia',
      catererId: 'cat-001',
      eventDate: '2026-11-21',
      guests: 80,
      area: 'scarborough',
      fsa: null,
      occasion: 'birthdays',
      message: 'Curry goat for 80.',
      createdAt: '2026-10-01T14:00:00.000Z',
      status: 'Open',
      events: [],
      readAt: {},
    } as any);
    const res = await leah.get('/api/operator/caterers/cat-001');
    assert.equal(res.status, 200);
    const v = res.body;
    assert.equal(v.pendingName, 'Pelau House by Kendra');
    assert.deepEqual(v.owner, { name: 'Kendra Baptiste', email: 'kendra@pelauhouse.example', emailVerified: true, phone: '+1 416 555 0142', since: '2025-03-14T15:20:00Z' });
    assert.equal(v.profile.photos.length, 6);
    assert.deepEqual(v.profile.photos[0], { id: 'pelau-house-photo-1', src: '/media/pelau-house.jpg?w=400&fm=jpeg', alt: 'Chicken pelau in a steel pot with lime and cucumber chutney' });
    assert.deepEqual(v.profile.cuisines, ['Trinidadian & Tobagonian', 'Guyanese']);
    assert.deepEqual(v.profile.areas, ['Scarborough', 'East York', 'North York', 'Pickering', 'Ajax']);
    assert.equal(v.profile.dishes.length, 18);
    assert.equal(v.certificate.expired, false);
    assert.deepEqual(v.activity.enquiries, 1);
    assert.deepEqual(v.activity.openEnquiries, 1);
    assert.equal(v.activity.rating.count, 23);
    assert.equal(v.activity.openReports, 1);
    assert.deepEqual(v.history.map((h: any) => [h.status, h.by, h.step, h.reason]), [
      ['Published', 'Tomas Reyes', 'approved', null],
      ['Pending review', 'Kendra Baptiste', 'resubmitted', null],
      ['Changes requested', 'Leah Mohammed', 'changes-requested', 'Photo 4 is blurry. Please replace it with a sharper one.'],
      ['Pending review', 'Kendra Baptiste', 'submitted', null],
      ['Draft', 'Kendra Baptiste', 'created', null],
    ]);
    assert.equal(v.suspension, null);
    assert.equal(v.removal, null);
  });

  it('Given an expired certificate, a suspension and a removal, when their records are opened, then the reminders, closed enquiries and removal date are shown (L2-040.3, L2-058)', async () => {
    const flyingFish = (await leah.get('/api/operator/caterers/cat-024')).body;
    assert.equal(flyingFish.certificate.expired, true);
    assert.deepEqual(flyingFish.certificateReminders, ['2026-08-31T13:00:00.000Z', '2026-09-23T13:00:00.000Z']);
    assert.equal(flyingFish.owner.since, '2024-09-09T19:15:00Z');
    const hibiscus = (await leah.get('/api/operator/caterers/cat-916')).body;
    assert.deepEqual(hibiscus.suspension, { at: '2026-10-06T16:20:00Z', closedEnquiries: 2 });
    assert.equal(hibiscus.certificate, null);
    const coalPot = (await leah.get('/api/operator/caterers/cat-901')).body;
    assert.deepEqual(coalPot.removal, { at: '2026-09-28T15:00:00Z' });
    assert.equal((await leah.get('/api/operator/caterers/cat-nope')).status, 404);
  });

  it('Given no caterer has registered, when the list is asked for, then it is empty', async () => {
    const empty = await startApi();
    await scenario(empty, 'no-caterers');
    const res = await (await signedInClient(empty, 'tomas@sweethand.example')).get('/api/operator/caterers');
    assert.equal(res.body.total, 0);
    assert.equal(res.body.counts.all, 0);
  });
});
