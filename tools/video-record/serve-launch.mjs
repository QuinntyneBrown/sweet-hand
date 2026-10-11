// Serves the production launch build (frontend/dist/launch/browser) the way the
// static host does (serve-launch-site design, "Hosting"): prerendered files,
// with /api/ forwarded to the Sweet Hand API on the same origin.
//
//   node tools/video-record/serve-launch.mjs [--port 4201] [--api http://localhost:4300]
import { createServer, request } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const args = process.argv.slice(2);
const opt = (name, fallback) => {
  const i = args.indexOf(`--${name}`);
  return i >= 0 ? args[i + 1] : fallback;
};
const port = Number(opt('port', 4201));
const api = new URL(opt('api', 'http://localhost:4300'));
const root = resolve(fileURLToPath(new URL('../../frontend/dist/launch/browser', import.meta.url)));
const types = {
  '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.webp': 'image/webp',
  '.jpg': 'image/jpeg', '.png': 'image/png', '.ico': 'image/x-icon', '.svg': 'image/svg+xml', '.txt': 'text/plain',
};

async function file(path) {
  const full = normalize(join(root, path));
  if (!full.startsWith(root)) return undefined;
  for (const candidate of [full, join(full, 'index.html')]) {
    try {
      if ((await stat(candidate)).isFile()) return candidate;
    } catch { /* next */ }
  }
  return undefined;
}

createServer(async (req, res) => {
  const url = new URL(req.url, 'http://localhost');
  if (url.pathname.startsWith('/api/')) {
    const upstream = request(
      { host: api.hostname, port: api.port, method: req.method, path: req.url, headers: { ...req.headers, host: `${api.hostname}:${api.port}` } },
      (r) => { res.writeHead(r.statusCode, r.headers); r.pipe(res); },
    );
    upstream.on('error', () => { res.writeHead(502, { 'content-type': 'text/plain' }); res.end('API unavailable'); });
    req.pipe(upstream);
    return;
  }
  const found = await file(decodeURIComponent(url.pathname));
  if (!found) { res.writeHead(404); res.end('Not found'); return; }
  const hashed = /-[A-Z0-9]{8}\.(js|css)$/.test(found);
  res.writeHead(200, {
    'content-type': types[extname(found)] ?? 'application/octet-stream',
    'cache-control': hashed ? 'public, max-age=31536000, immutable' : 'public, max-age=300',
  });
  res.end(await readFile(found));
}).listen(port, () => console.log(`Launch site on http://localhost:${port} (API ${api.origin})`));
