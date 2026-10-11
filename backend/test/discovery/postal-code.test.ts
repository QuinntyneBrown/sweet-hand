import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';

describe('search the listing by postal code (L2-012)', async () => {
  const api = await startApi();

  it('Given a forward sortation area, when the listing is asked for with it, then it shows the caterers serving that area (L2-012.1)', async () => {
    const byFsa = await api.client().get('/api/public/caterers?fsa=m1b');
    const byArea = await api.client().get('/api/public/caterers?area=scarborough');
    assert.equal(byFsa.status, 200);
    assert.equal(byFsa.body.total, byArea.body.total);
    assert.deepEqual(byFsa.body.items.map((c: { slug: string }) => c.slug), byArea.body.items.map((c: { slug: string }) => c.slug));
  });

  it('Given an FSA outside the GTA, when the listing is asked for with it, then the answer is 422 outside-service-area (L2-012.5)', async () => {
    const res = await api.client().get('/api/public/caterers?fsa=X9X');
    assert.equal(res.status, 422);
    assert.equal(res.body.type, 'outside-service-area');
    assert.equal(res.body.title, 'Sweet Hand currently serves Toronto and the GTA');
  });

  it('Given a malformed FSA, when the listing is asked for with it, then it is refused with the postal-code message (L2-012.4)', async () => {
    const res = await api.client().get('/api/public/caterers?fsa=12A');
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { postalCode: ['Enter a valid postal code, like M5V 2T6'] });
  });

  it('Given a full postal code from a form without script, when it is sent, then the answer redirects to its FSA alone (L2-012.6)', async () => {
    const res = await api.client().get('/api/public/caterers?postal=m1b%202k3&cuisine=jamaican');
    assert.equal(res.status, 302);
    assert.equal(res.headers.get('location'), '/api/public/caterers?cuisine=jamaican&fsa=M1B');
  });

  it('Given a full postal code in a lookup path, when the request is logged, then no more than the FSA is written (L2-012.6)', async () => {
    const lines: string[] = [];
    const log = console.log;
    console.log = (...args: unknown[]) => void lines.push(args.map(String).join(' '));
    try {
      const client = api.client();
      for (let i = 0; i < 302; i++) await client.get('/api/public/fsa/M1B2K3');
    } finally {
      console.log = log;
    }
    const blocks = lines.filter((l) => l.includes('rate-limit-block'));
    assert.ok(blocks.length > 0, 'the limit was reached and logged');
    assert.ok(blocks.every((l) => !l.includes('2K3')), blocks[0]);
  });
});
