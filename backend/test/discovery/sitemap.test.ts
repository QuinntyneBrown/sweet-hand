import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, startApi } from '../support/api.ts';

describe('sitemap (view-caterer-page design, L2-018.6)', () => {
  it('Given caterers in every status, when a search engine asks for the sitemap, then it lists the page of each published caterer and no others', async () => {
    const api = await startApi();
    const res = await fetch(`${api.url}/sitemap.xml`);
    assert.equal(res.status, 200);
    assert.match(res.headers.get('content-type') ?? '', /^application\/xml/);
    const xml = await res.text();
    assert.match(xml, /^<\?xml version="1.0" encoding="UTF-8"\?>\n<urlset xmlns="http:\/\/www.sitemaps.org\/schemas\/sitemap\/0.9">/);
    const listed = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
    const caterers = await documents(api, 'caterers');
    const published = caterers.filter((c) => c.status === 'Published');
    assert.equal(listed.length, published.length);
    for (const c of published) assert.ok(listed.includes(`${api.url}/caterers/${c.slug}`), c.slug);
    for (const c of caterers.filter((x) => x.status !== 'Published')) assert.equal(listed.some((l) => l.endsWith(`/caterers/${c.slug}`)), false, c.slug);
  });
});
