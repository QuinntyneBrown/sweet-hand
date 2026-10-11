import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi } from '../support/api.ts';
import { scenario } from './support.ts';

describe('profile review (L2-047.2, L2-047.3, L2-044.2)', async () => {
  const api = await startApi();
  const leah = await signedInClient(api, 'leah@sweethand.example');

  it('Given a submitted profile, when an operator opens it, then it shows as it will appear publicly with the private contact, certificate and checks (L2-047.2)', async () => {
    const res = await leah.get('/api/operator/queue/profiles/cat-910');
    assert.equal(res.status, 200);
    const v = res.body;
    assert.equal(v.kind, 'submission');
    assert.equal(v.name, 'Auntie Bev’s Kitchen');
    assert.equal(v.submittedAt, '2026-10-07T18:10:00Z');
    assert.equal(v.resubmitted, false);
    assert.equal(v.changesRequested, null);
    assert.deepEqual(v.profile.cuisines, ['Jamaican']);
    assert.match(v.profile.description[0], /^Beverley Campbell has cooked for every christening/);
    assert.equal(v.profile.description.length, 2);
    assert.deepEqual(v.profile.occasions, ['Birthdays', 'Funerals and repasts', 'Family gatherings', 'Community events']);
    assert.deepEqual(v.profile.regions, [{ name: 'Durham', areas: ['Oshawa', 'Whitby', 'Clarington', 'Ajax'] }]);
    assert.deepEqual(v.profile.photos[0], { id: 'auntie-bevs-kitchen-photo-1', src: '/media/green-fig-catering.jpg?w=400&fm=jpeg', caption: 'Brown stew chicken with rice and peas in a steel pot', cover: true, isNew: false });
    assert.deepEqual(v.profile.dishes[0], { name: 'Brown stew chicken', description: 'Browned, then simmered with thyme and pimento.', price: 'From $15 per person', tags: ['gluten-free', 'dairy-free'] });
    assert.deepEqual(v.contact, { name: 'Beverley Campbell', email: 'beverley@auntiebevs.example', emailVerified: true, phone: '+1 905 555 0164', since: '2026-09-29T00:47:00Z' });
    assert.deepEqual(v.certificate, { holder: 'Beverley Campbell', issuer: 'Durham Region Health Department', number: 'FH-2025-204517', expires: '2030-01-22', expired: false, fileName: 'food-handler-certificate.pdf', fileSize: 1258291 });
    assert.deepEqual(v.checks, { emailVerified: true, photos: 5, photosComplete: true, dishes: 6, detailsComplete: true, certificateValid: true });
    assert.deepEqual(v.history, [
      { at: '2026-10-07T18:10:00Z', step: 'submitted', by: 'Beverley Campbell', reason: null },
      { at: '2026-09-29T00:47:00Z', step: 'created', by: null, reason: null },
    ]);
  });

  it('Given a resubmitted profile, when an operator opens it, then the request is restated and what changed since is flagged (L2-047.3)', async () => {
    const res = await leah.get('/api/operator/queue/profiles/cat-911');
    const v = res.body;
    assert.equal(v.resubmitted, true);
    assert.deepEqual(v.changesRequested, {
      by: 'Tomas Reyes',
      at: '2026-10-05T19:30:00Z',
      reason: 'The description lists a phone number, and photo 3 is a stock image. Please remove the number and upload a photo of your own food.',
    });
    assert.equal(v.changedFields, 2);
    assert.equal(v.descriptionChanged, true);
    assert.deepEqual(v.profile.removedParagraphs, ['Call or text Jolene at 647-555-0119 to book.']);
    assert.deepEqual(v.profile.photos.filter((p: any) => p.isNew).map((p: any) => p.caption), ['Pelau with pigeon peas in a red pot']);
    assert.equal(v.history.length, 4);
    assert.equal(v.history[1].by, 'Tomas Reyes');
    assert.equal(v.contact.name, 'Jolene Ollivierre');
  });

  it('Given a pending business-name change, when an operator opens it, then old and new names, addresses and the card are shown (L2-044.2)', async () => {
    await scenario(api, 'pelau-name-change-pending');
    const res = await leah.get('/api/operator/queue/profiles/cat-001');
    assert.deepEqual(res.body, {
      kind: 'name-change',
      id: 'cat-001',
      name: 'Pelau House',
      newName: 'Pelau House by Kendra',
      status: 'Published',
      slug: 'pelau-house',
      newSlug: 'pelau-house-by-kendra',
      requestedAt: '2026-10-09T22:20:00.000Z',
      requestedBy: 'Kendra Baptiste',
      owner: 'Kendra Baptiste',
      card: { photo: '/media/pelau-house.jpg?w=400&fm=jpeg', alt: 'Chicken pelau in a steel pot with lime and cucumber chutney', cuisine: 'Trinidadian & Tobagonian', area: 'Scarborough' },
      history: [
        { at: '2026-10-09T22:20:00.000Z', step: 'name-change-requested', by: 'Kendra Baptiste', reason: null },
        { at: '2025-03-14T15:20:00Z', step: 'published', by: 'Tomas Reyes', reason: null },
      ],
    });
  });

  it('Given a profile not waiting for a decision, when it is opened for review, then it is not found (L2-046)', async () => {
    assert.equal((await leah.get('/api/operator/queue/profiles/cat-002')).status, 404);
    assert.equal((await leah.get('/api/operator/queue/profiles/cat-nope')).status, 404);
  });

  it('Given a certificate copy, when an operator opens it, then they are sent to a link that stops working after 5 minutes, and only its hash is stored (L2-040.4)', async () => {
    const res = await leah.get('/api/operator/profiles/cat-910/certificate-file');
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('cache-control'), 'no-store');
    const location = res.headers.get('location')!;
    const m = /^\/api\/operator\/certificate-files\/([0-9a-f]{32})\?expires=(.+)$/.exec(location);
    assert.ok(m, location);
    assert.equal(decodeURIComponent(m[2]), '2026-10-10T14:05:00.000Z');
    assert.equal(JSON.stringify(await documents(api, 'certificateLinks')).includes(m[1]), false, 'the token itself is never stored');

    const file = await leah.get(location);
    assert.equal(file.status, 200);
    assert.equal(file.headers.get('content-type'), 'application/pdf');
    assert.equal(file.headers.get('cache-control'), 'no-store');

    assert.equal((await leah.get('/api/operator/certificate-files/0123456789abcdef0123456789abcdef')).status, 404, 'an unknown link');
    assert.equal((await api.client().get(location)).status, 401, 'a visitor');
    advanceClock(api, 5 * 60_000 + 1000);
    assert.equal((await leah.get(location)).status, 404, 'an expired link');
  });

  it('Given a caterer without a certificate file, when its copy is asked for, then it is not found', async () => {
    assert.equal((await leah.get('/api/operator/profiles/cat-003/certificate-file')).status, 404);
  });
});
