/**
 * Sweet Hand fake backend (ADR 0004). Implements the frontend's HTTP contract
 * with in-memory data for development and Playwright acceptance tests.
 *
 *   node fake-backend/server.ts          # http://localhost:4300
 *
 * Every request may carry `x-fake-session`; each value has its own store.
 * Tests drive it through the control API under /__fake/ (see routes/control.ts).
 */
import { createServer, type ServerResponse } from 'node:http';
import { readFile } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import { join, dirname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCookies, readBody, type Ctx, type Reply } from './lib/http.ts';
import { Router } from './lib/router.ts';
import { hanging, matches } from './lib/faults.ts';
import { storeFor, type Store } from './lib/store.ts';
import { registerControl } from './routes/control.ts';
import { registerRoutes } from './routes/index.ts';

const here = dirname(fileURLToPath(import.meta.url));
const MEDIA_DIR = join(here, '..', '..', 'docs', 'mocks', 'assets', 'img');
const PORT = Number(process.env['PORT'] ?? 4300);

const api = new Router<Store>();
registerRoutes(api);
const control = new Router<Store>();
registerControl(control);

function send(res: ServerResponse, reply: Reply): void {
  const headers: Record<string, string | string[]> = { 'cache-control': 'no-store', ...(reply.headers ?? {}) };
  if (reply.raw !== undefined) {
    res.writeHead(reply.status, headers);
    res.end(reply.raw);
    return;
  }
  if (reply.body === undefined) {
    res.writeHead(reply.status, headers);
    res.end();
    return;
  }
  const isProblem = reply.status >= 400;
  headers['content-type'] = isProblem ? 'application/problem+json' : 'application/json';
  res.writeHead(reply.status, headers);
  res.end(JSON.stringify(reply.body));
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', 'http://localhost');
  const method = req.method ?? 'GET';
  const sessionId = String(req.headers['x-fake-session'] ?? url.searchParams.get('__session') ?? 'default');
  const store = storeFor(sessionId);
  const path = url.pathname;

  try {
    if (path.startsWith('/media/')) {
      const file = normalize(path.slice('/media/'.length)).replace(/^(\.\.[/\\])+/, '');
      // A slow image: hold or delay it (the photo viewer's loading state), counting `times`.
      const slow = store.faults.find((f) => matches(f, method, path) && (f.hang || f.delayMs));
      if (slow) {
        if (slow.times !== undefined && --slow.times <= 0) store.faults.splice(store.faults.indexOf(slow), 1);
        if (slow.hang) await new Promise<void>((resolve) => hanging.set(sessionId, [...(hanging.get(sessionId) ?? []), resolve]));
        if (slow.delayMs) await new Promise((r) => setTimeout(r, slow.delayMs));
      }
      for (const fault of store.faults) {
        if (matches(fault, method, path) && fault.status) return send(res, { status: fault.status });
      }
      const data = await readFile(join(MEDIA_DIR, file)).catch(() => undefined);
      if (!data) return send(res, { status: 404 });
      return send(res, { status: 200, raw: data, headers: { 'content-type': 'image/jpeg', 'cache-control': 'public, max-age=3600' } });
    }

    const body = await readBody(req);
    const cookies = parseCookies(req.headers.cookie);

    if (path.startsWith('/__fake/')) {
      const m = control.match(method, path);
      if (!m) return send(res, { status: 404, body: { title: 'Unknown control route' } });
      const ctx: Ctx<Store> = { method, path, params: { ...m.params, session: sessionId }, query: url.searchParams, body, headers: req.headers, cookies, store, req, res };
      return send(res, await m.handler(ctx));
    }

    if (!path.startsWith('/api/')) return send(res, { status: 404, body: { title: 'Not found' } });

    store.requests.push({ method, path, query: url.search, body });

    const fault = store.faults.find((f) => matches(f, method, path));
    if (fault) {
      if (fault.times !== undefined) {
        fault.times -= 1;
        if (fault.times <= 0) store.faults.splice(store.faults.indexOf(fault), 1);
      }
      if (fault.hang) {
        await new Promise<void>((resolve) => {
          const list = hanging.get(sessionId) ?? [];
          list.push(resolve);
          hanging.set(sessionId, list);
        });
      }
      if (fault.delayMs) await new Promise((r) => setTimeout(r, fault.delayMs));
      if (fault.network) {
        req.socket.destroy();
        return;
      }
      if (fault.status) return send(res, { status: fault.status, body: fault.body ?? { title: 'Fault injected' }, headers: fault.headers });
    }

    // CSRF (ADR 0003): every response carries the token cookie; state changes must echo it.
    const csrf = cookies['XSRF-TOKEN'] ?? randomUUID();
    const csrfCookie = `XSRF-TOKEN=${csrf}; Path=/; SameSite=Lax`;
    if (!['GET', 'HEAD'].includes(method) && req.headers['x-xsrf-token'] !== cookies['XSRF-TOKEN']) {
      return send(res, { status: 403, body: { title: 'Missing or invalid CSRF token' }, headers: { 'set-cookie': csrfCookie } });
    }

    const m = api.match(method, path);
    if (!m) return send(res, { status: 404, body: { title: 'Not found' }, headers: { 'set-cookie': csrfCookie } });
    const ctx: Ctx<Store> = { method, path, params: m.params, query: url.searchParams, body, headers: req.headers, cookies, store, req, res };
    const reply = await m.handler(ctx);
    const setCookie = reply.headers?.['set-cookie'];
    const cookiesOut = [csrfCookie, ...(Array.isArray(setCookie) ? setCookie : setCookie ? [setCookie] : [])];
    return send(res, { ...reply, headers: { ...(reply.headers ?? {}), 'set-cookie': cookiesOut } });
  } catch (err) {
    console.error(err);
    return send(res, { status: 500, body: { title: 'Something went wrong', correlationId: randomUUID() } });
  }
});

server.listen(PORT, () => console.log(`Sweet Hand fake backend on http://localhost:${PORT}`));
