import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';

const KENDRA = 'kendra@pelauhouse.example';
const MARKUP = ['<img src=x onerror=alert(1)>', '"><script>alert(1)</script>', 'javascript:alert(1)'];
const SQL = ["' OR '1'='1", '1; DROP TABLE caterers--'];

describe('input handling (validate-input-and-secure-transport design, L2-080)', () => {
  it('Given markup payloads in a text field, when they are saved, then they are stored as given and served as JSON text, never as a page (L2-080.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    for (const payload of MARKUP) {
      const res = await kendra.post('/api/caterer/profile/menu-items', { name: `Doubles ${payload}`, description: payload, tags: [], price: '' });
      assert.equal(res.status, 201);
    }

    const page = await api.client().get('/api/public/caterers/pelau-house');
    assert.match(page.headers.get('content-type') ?? '', /^application\/json/);
    assert.match(page.headers.get('content-security-policy') ?? '', /default-src 'none'/);
    const descriptions = page.body.dishes.map((d: { description?: string }) => d.description);
    for (const payload of MARKUP) assert.ok(descriptions.includes(payload), payload);
  });

  it('Given SQL injection payloads in query, filter and path parameters, when they are requested, then each gets a validation error or a normal answer and the data is unchanged (L2-080.2)', async () => {
    const api = await startApi();
    const visitor = api.client();
    const before = JSON.stringify(await documents(api, 'caterers'));
    const total = (await visitor.get('/api/public/caterers')).body.total;

    for (const payload of SQL) {
      const value = encodeURIComponent(payload);
      for (const name of ['cuisine', 'region', 'area', 'occasion', 'page', 'fsa', 'postal']) {
        const res = await visitor.get(`/api/public/caterers?${name}=${value}`);
        if (res.status === 200) assert.equal(res.body.total, total, `${name}=${payload}`);
        else assert.equal(res.status, 400, `${name}=${payload}`);
      }
      assert.equal((await visitor.get(`/api/public/caterers/${value}`)).status, 404);
    }

    assert.equal(JSON.stringify(await documents(api, 'caterers')), before);
    assert.equal((await visitor.get('/api/public/caterers')).body.total, total);
  });
});
