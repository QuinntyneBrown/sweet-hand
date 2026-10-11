import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi } from '../support/api.ts';

describe('own caterer profile (set-up-profile design)', async () => {
  const api = await startApi();

  it('Given Kendra is signed in, when she opens her profile, then she sees Pelau House as the editor shows it, with the checklist and cover (L2-038.3)', async () => {
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');

    const res = await kendra.get('/api/caterer/profile');

    assert.equal(res.status, 200);
    const p = res.body;
    assert.equal(p.id, 'cat-001');
    assert.equal(p.name, 'Pelau House');
    assert.equal(p.slug, 'pelau-house');
    assert.equal(p.status, 'Published');
    assert.equal(p.publishedAt, '2026-08-10T13:00:00Z');
    assert.equal(p.pendingName, null);
    assert.equal(p.contactName, 'Kendra Baptiste');
    assert.equal(p.email, 'kendra@pelauhouse.example');
    assert.equal(p.emailVerified, true);
    assert.deepEqual(p.cuisines, ['trinidadian-and-tobagonian', 'guyanese']);
    assert.equal(p.primaryCuisine, 'trinidadian-and-tobagonian');
    assert.equal(p.primaryArea, 'scarborough');
    assert.equal(p.minGuests, 20);
    assert.equal(p.maxGuests, 300);
    assert.equal(p.photos.length, 6);
    assert.deepEqual(p.photos[0], {
      id: 'pelau-house-photo-1',
      caption: 'Chicken pelau in a steel pot with lime and cucumber chutney',
      fileName: null,
      state: 'Ready',
      image: {
        src: '/media/pelau-house.jpg?w=400&fm=jpeg',
        srcset: '/media/pelau-house.jpg?w=400&fm=avif 400w, /media/pelau-house.jpg?w=800&fm=avif 800w',
        width: 160,
        height: 160,
      },
    });
    assert.equal(p.dishes.length, 18);
    assert.deepEqual(p.dishes[5], { id: 'pelau-house-dish-6', name: 'Aloo pie', description: null, tags: ['vegan'], price: null });
    assert.deepEqual(p.certificate, {
      holder: 'Kendra Baptiste',
      issuer: 'Toronto Public Health',
      number: 'FH-2024-118734',
      expires: '2029-03-14',
      savedAt: '2026-09-02T14:00:00Z',
      file: { name: 'food-handler-certificate.pdf', size: 1258291, type: 'PDF', uploadedAt: '2026-09-02T14:00:00Z' },
    });
    assert.deepEqual(
      p.checklist.map((i: { key: string; done: boolean }) => `${i.key}:${i.done}`),
      ['email', 'name', 'description', 'cuisines', 'areas', 'guests', 'occasions', 'photos', 'menu', 'certificate'].map((k) => `${k}:true`),
    );
    assert.deepEqual(p.attention, []);
    assert.equal(p.cover.alt, 'Chicken pelau in a steel pot with lime and cucumber chutney');
    assert.equal(p.cover.image.width, 280);
  });

  it('Given a caterer, when they ask for the reference data, then cuisines are alphabetical and regions and occasions are the fixed lists', async () => {
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');

    const res = await kendra.get('/api/caterer/profile/reference-data');

    assert.equal(res.status, 200);
    const names = res.body.cuisines.map((c: { name: string }) => c.name);
    assert.deepEqual(names, [...names].sort((a: string, b: string) => a.localeCompare(b, 'en-CA')));
    assert.ok(res.body.cuisines.some((c: { id: string }) => c.id === 'jamaican'));
    assert.deepEqual(res.body.regions.map((r: { id: string }) => r.id), ['city-of-toronto', 'peel', 'york-region', 'durham', 'halton']);
    assert.equal(res.body.occasions.length, 8);
  });

  it('Given a customer, when they ask for a caterer profile, then the answer is 403 (L2-079.1)', async () => {
    const marcia = await signedInClient(api, 'marcia.t@example.com');

    assert.equal((await marcia.get('/api/caterer/profile')).status, 403);
  });
});
