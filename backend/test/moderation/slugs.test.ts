import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { put } from './support.ts';

const caterer = async (api: Api, id: string) => (await documents(api, 'caterers')).find((c) => c.id === id);
const LEAH = 'leah@sweethand.example';

async function withPendingName(api: Api, id: string, pendingName: string, extra: Record<string, unknown> = {}) {
  await put(api, 'caterers', { ...(await caterer(api, id)), pendingName, pendingNameAt: '2026-10-09T14:00:00.000Z', ...extra });
}

describe('caterer addresses (L2-018.1–3, edit-published-profile SlugService)', () => {
  it('Given a name another caterer already uses, when the name change is approved, then the address gets a numeric suffix (L2-018.2)', async () => {
    const api = await startApi();
    const maracas = await caterer(api, 'cat-009');
    await withPendingName(api, 'cat-001', maracas.name);
    const res = await (await signedInClient(api, LEAH)).post('/api/operator/profiles/cat-001/name/approve');
    assert.equal(res.body.slug, `${maracas.slug}-2`);
    assert.equal((await api.client().get(`/api/public/caterers/${maracas.slug}`)).body.name, maracas.name, 'the other caterer keeps its address');
  });

  it('Given a name whose address another caterer holds as a redirect, when it is approved, then the address gets a suffix (L2-018.2)', async () => {
    const api = await startApi();
    await put(api, 'caterers', { ...(await caterer(api, 'cat-009')), previousSlugs: ['island-pot'] });
    await withPendingName(api, 'cat-001', 'Island Pot');
    const res = await (await signedInClient(api, LEAH)).post('/api/operator/profiles/cat-001/name/approve');
    assert.equal(res.body.slug, 'island-pot-2');
  });

  it('Given a caterer renamed back to an earlier name, when it is approved, then the earlier address serves the page instead of redirecting to itself (L2-018.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);
    await withPendingName(api, 'cat-001', 'Pelau House by Kendra');
    await leah.post('/api/operator/profiles/cat-001/name/approve');
    await withPendingName(api, 'cat-001', 'Pelau House');
    assert.equal((await leah.post('/api/operator/profiles/cat-001/name/approve')).body.slug, 'pelau-house');
    assert.deepEqual((await caterer(api, 'cat-001')).previousSlugs, ['pelau-house-by-kendra']);
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).status, 200);
    const old = await api.client().get('/api/public/caterers/pelau-house-by-kendra');
    assert.equal(old.status, 301);
    assert.equal(old.headers.get('location'), '/api/public/caterers/pelau-house');
  });

  it('Given a draft renamed after registration, when the profile is first published, then its address comes from the name it is published under (L2-018.1)', async () => {
    const api = await startApi();
    await put(api, 'caterers', { ...(await caterer(api, 'cat-910')), name: 'Bev’s Oshawa Kitchen' });
    const res = await (await signedInClient(api, LEAH)).post('/api/operator/profiles/cat-910/approve');
    assert.equal(res.status, 200);
    assert.equal((await caterer(api, 'cat-910')).slug, 'bevs-oshawa-kitchen');
    assert.equal((await api.client().get('/api/public/caterers/bevs-oshawa-kitchen')).status, 200);
  });

  it('Given an operator edits a name to one another caterer uses, when it is saved, then the address gets a suffix (L2-018.2)', async () => {
    const api = await startApi();
    const maracas = await caterer(api, 'cat-009');
    const res = await (await signedInClient(api, LEAH)).patch('/api/operator/profiles/cat-001', { field: 'name', value: maracas.name, reason: 'Matching the certificate name' });
    assert.equal(res.status, 200, JSON.stringify(res.body));
    assert.equal((await caterer(api, 'cat-001')).slug, `${maracas.slug}-2`);
  });
});
