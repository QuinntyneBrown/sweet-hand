import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { users } from '../../src/identity/model.ts';

const MARCIA = 'marcia.t@example.com';
const HOUR = 60 * 60_000;
const VALUES = {
  eventDate: '2026-12-12',
  guests: '120',
  area: 'scarborough',
  postalCode: 'M1E 4R8',
  occasion: 'family-gatherings',
  message: 'We’d love pelau, curry goat and macaroni pie for about 120 people.',
};

async function unverify(api: Api, id: string): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    const u = (await users(tx).get(id))!;
    await users(tx).put({ ...u, emailVerified: false });
  });
}

describe('enquiry drafts (L2-023.3)', () => {
  it('Given a saved draft, when the customer comes back within 24 hours, then every value is still there', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    assert.equal((await marcia.get('/api/enquiries/drafts/pelau-house')).status, 204);
    const saved = await marcia.put('/api/enquiries/drafts/pelau-house', { ...VALUES, ownerId: 'someone-else' });
    assert.equal(saved.status, 204);
    advanceClock(api, 23 * HOUR);
    const res = await marcia.get('/api/enquiries/drafts/pelau-house');
    assert.equal(res.status, 200);
    assert.deepEqual(res.body, { values: VALUES, savedAt: '2026-10-10T14:00:00.000Z' });
  });

  it('Given a draft older than 24 hours, when the customer comes back, then it is gone', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    await marcia.put('/api/enquiries/drafts/pelau-house', VALUES);
    advanceClock(api, 24 * HOUR + 1);
    assert.equal((await marcia.get('/api/enquiries/drafts/pelau-house')).status, 204);
  });

  it('Given one customer’s draft, when another customer asks for that caterer’s draft, then they get nothing', async () => {
    const api = await startApi();
    await (await signedInClient(api, MARCIA)).put('/api/enquiries/drafts/pelau-house', VALUES);
    const devon = await signedInClient(api, 'devon.w@example.com');
    assert.equal((await devon.get('/api/enquiries/drafts/pelau-house')).status, 204);
  });

  it('Given an unknown caterer, when a draft is saved for it, then it is not found; other roles cannot keep drafts', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    assert.equal((await marcia.put('/api/enquiries/drafts/atlantis-kitchen', VALUES)).status, 404);
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    assert.equal((await kendra.put('/api/enquiries/drafts/cou-cou', VALUES)).status, 403);
  });

  it('Given an unverified customer saves a draft, when they verify their email, then the verification page names the saved enquiry', async () => {
    const api = await startApi();
    await unverify(api, 'user-marcia');
    const marcia = await signedInClient(api, MARCIA);
    await marcia.put('/api/enquiries/drafts/pelau-house', VALUES);
    const saved = (await documents(api, 'savedEnquiries')).find((s) => s.id === 'user-marcia');
    assert.deepEqual(saved, { id: 'user-marcia', catererSlug: 'pelau-house', eventDate: '2026-12-12', guests: 120 });
  });

  it('Given a draft, when the enquiry is sent, then the draft is gone', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    await marcia.put('/api/enquiries/drafts/pelau-house', VALUES);
    const sent = await marcia.post('/api/enquiries', { ...VALUES, catererSlug: 'pelau-house', challengeToken: 'local:enquiry:test' });
    assert.equal(sent.status, 201);
    assert.equal((await marcia.get('/api/enquiries/drafts/pelau-house')).status, 204);
  });
});
