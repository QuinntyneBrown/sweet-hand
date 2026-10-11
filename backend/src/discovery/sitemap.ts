import type { Request, Reply } from '../http/endpoint.ts';
import { caterers } from '../caterers/model.ts';

const escapeXml = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

/** GET /sitemap.xml (SitemapEndpoint): the page of every published caterer and no others (L2-018.6). */
export async function sitemap(req: Request): Promise<Reply> {
  const proto = req.headers['x-forwarded-proto'] === 'https' ? 'https' : 'http';
  const origin = `${proto}://${req.headers.host ?? 'localhost'}`;
  const published = (await caterers(req.tx).find({ status: 'Published' })).sort((a, b) => a.slug.localeCompare(b.slug));
  const urls = published.map((c) => `  <url><loc>${escapeXml(`${origin}/caterers/${c.slug}`)}</loc></url>`);
  return {
    status: 200,
    raw: ['<?xml version="1.0" encoding="UTF-8"?>', '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">', ...urls, '</urlset>', ''].join('\n'),
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=300' },
  };
}
