import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import { parseCookies, serializeCookie } from './http/cookies.ts';
import { ProblemError, forbidden, notFound, problem, unauthorized } from './http/problems.ts';
import { Router, type Actor, type Area, type Policy, type Reply, type Request } from './http/router.ts';
import type { Config } from './platform/config.ts';
import type { Environment } from './environment.ts';
import { RateLimiter } from './platform/rate-limit.ts';
import { hashIp } from './platform/secrets.ts';

const MB = 1024 * 1024;
/** Public reads allowed per address per minute (L2-082.1). */
const PUBLIC_READS_PER_MINUTE = 300;
const isPublicRead = (method: string, path: string) => method === 'GET' && (path.startsWith('/api/public/') || path.startsWith('/media/'));
const SAFE_METHODS = new Set(['GET', 'HEAD']);

export interface Environments {
  resolve(req: IncomingMessage): Environment | Promise<Environment>;
}

/** Resolves the signed-in caller from the request (identity area); may set cookies. */
export type Authenticator = (req: Request) => Promise<Actor | undefined>;

/** Called when a caller is refused by an endpoint policy (security log, L2-079.4). */
export type DenialRecorder = (req: Request, status: 401 | 403) => Promise<void>;

export interface AppOptions {
  environments: Environments;
  areas: Area[];
  authenticate?: Authenticator;
  onDenied?: DenialRecorder;
  config?: Partial<Config>;
  /** Extra non-product handler tried first (the test-control API, ADR 0008). */
  control?: (req: IncomingMessage, res: ServerResponse) => Promise<boolean>;
}

const SECURITY_HEADERS: Record<string, string> = {
  'x-content-type-options': 'nosniff',
  'referrer-policy': 'strict-origin-when-cross-origin',
  'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  'content-security-policy': "default-src 'none'; frame-ancestors 'none'",
  'cache-control': 'no-store',
};

class BodyTooLarge extends Error {}
class BadJson extends Error {}

async function readBody(req: IncomingMessage, limit: number): Promise<unknown> {
  const declared = Number(req.headers['content-length'] ?? 0);
  if (declared > limit) throw new BodyTooLarge();
  const chunks: Buffer[] = [];
  let size = 0;
  for await (const chunk of req) {
    size += (chunk as Buffer).length;
    if (size > limit) throw new BodyTooLarge();
    chunks.push(chunk as Buffer);
  }
  if (!size) return undefined;
  const type = req.headers['content-type'] ?? '';
  if (!type.includes('application/json')) return undefined;
  let text: string;
  try {
    text = new TextDecoder('utf-8', { fatal: true }).decode(Buffer.concat(chunks));
  } catch {
    throw new BadJson();
  }
  try {
    return sanitize(JSON.parse(text));
  } catch {
    throw new BadJson();
  }
}

/** Control characters other than tab and newline are removed from every string (L2-080.4). */
// eslint-disable-next-line no-control-regex
const CONTROL = /[\u0000-\u0008\u000B-\u001F\u007F]/g;

function sanitize(value: unknown): unknown {
  if (typeof value === 'string') return value.replace(CONTROL, '');
  if (Array.isArray(value)) return value.map(sanitize);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (k !== '__proto__') out[k] = sanitize(v);
    return out;
  }
  return value;
}

function permits(policy: Policy, actor: Actor | undefined): 200 | 401 | 403 {
  if (policy.kind === 'anonymous') return 200;
  if (!actor) return 401;
  if (!policy.roles.includes(actor.role)) return 403;
  if (policy.admin && !actor.admin) return 403;
  return 200;
}

/** The HTTP request listener: correlation ID, CSRF, body limits, endpoint policy, one transaction per request. */
export function createApp(options: AppOptions): (req: IncomingMessage, res: ServerResponse) => void {
  const router = new Router();
  for (const area of options.areas) area(router);
  const config = { secureCookies: false, allowedOrigins: [], trustProxy: false, ...options.config };
  // One limiter per environment, so test sessions never share counts.
  const limiters = new WeakMap<Environment, RateLimiter>();

  return (req, res) => {
    void handle(req, res).catch((err) => {
      console.error(err);
      if (!res.headersSent) res.writeHead(500).end();
    });
  };

  async function handle(req: IncomingMessage, res: ServerResponse): Promise<void> {
    const upstream = config.trustProxy ? String(req.headers['x-correlation-id'] ?? '') : '';
    const correlationId = /^[\w-]{8,64}$/.test(upstream) ? upstream : randomUUID();
    const cookies = parseCookies(req.headers.cookie);
    const cookiesOut: string[] = [];
    // Every response carries the CSRF token cookie; Angular echoes it as X-XSRF-TOKEN (ADR 0003).
    if (!cookies['XSRF-TOKEN']) cookiesOut.push(serializeCookie('XSRF-TOKEN', randomUUID(), { secure: config.secureCookies }));

    const send = (reply: Reply) => {
      const headers: Record<string, string | string[]> = { ...SECURITY_HEADERS, 'x-correlation-id': correlationId, ...reply.headers };
      if (config.secureCookies) headers['strict-transport-security'] = 'max-age=31536000; includeSubDomains';
      if (cookiesOut.length) headers['set-cookie'] = cookiesOut;
      if (reply.raw !== undefined) {
        res.writeHead(reply.status, headers).end(reply.raw);
      } else if (reply.body === undefined) {
        res.writeHead(reply.status, headers).end();
      } else {
        headers['content-type'] = reply.status >= 400 ? 'application/problem+json' : 'application/json';
        res.writeHead(reply.status, headers).end(JSON.stringify(reply.body));
      }
    };

    try {
      if (options.control && (await options.control(req, res))) return;
      const env = await options.environments.resolve(req);
      const url = new URL(req.url ?? '/', 'http://localhost');
      const method = req.method ?? 'GET';

      if (url.pathname === '/health/live') return send({ status: 200, body: { status: 'live' } });
      if (url.pathname === '/health/ready') {
        return (await env.db.ping()) ? send({ status: 200, body: { status: 'ready' } }) : send(problem(503, 'Not ready'));
      }

      const match = router.match(method, url.pathname);
      if (!match) return send(notFound());

      const forwarded = config.trustProxy ? String(req.headers['x-forwarded-for'] ?? '').split(',')[0].trim() : '';
      const ip = forwarded || req.socket.remoteAddress || 'unknown';
      if (isPublicRead(method, url.pathname)) {
        let limiter = limiters.get(env);
        if (!limiter) limiters.set(env, (limiter = new RateLimiter(PUBLIC_READS_PER_MINUTE)));
        const wait = limiter.take(ip, env.clock.now());
        if (wait !== null) {
          console.log(JSON.stringify({ level: 'security', type: 'rate-limit-block', path: url.pathname, ipHash: hashIp(ip), at: env.clock.now().toISOString(), correlationId }));
          return send({ ...problem(429, 'Too many requests'), headers: { 'retry-after': String(wait) } });
        }
      }

      if (!SAFE_METHODS.has(method)) {
        const token = req.headers['x-xsrf-token'];
        const origin = req.headers.origin;
        const badOrigin = origin && config.allowedOrigins.length > 0 && !config.allowedOrigins.includes(origin);
        if (!cookies['XSRF-TOKEN'] || token !== cookies['XSRF-TOKEN'] || badOrigin) {
          return send(problem(403, 'Missing or invalid CSRF token'));
        }
      }

      let body: unknown;
      try {
        body = await readBody(req, match.route.options.maxBodyBytes ?? MB);
      } catch (err) {
        if (err instanceof BodyTooLarge) return send(problem(413, 'The request is too large'));
        if (err instanceof BadJson) return send(problem(400, 'The request body is not valid JSON'));
        throw err;
      }

      const reply = await env.db
        .transaction(async (tx) => {
          const request: Request = {
            method,
            path: url.pathname,
            params: match.params,
            query: url.searchParams,
            body,
            headers: req.headers,
            cookies,
            ip,
            correlationId,
            env,
            tx,
            now: env.clock.now(),
            cookiesOut,
            locals: {},
          };
          request.actor = await options.authenticate?.(request);
          const verdict = permits(match.route.policy, request.actor);
          if (verdict !== 200) {
            await options.onDenied?.(request, verdict);
            return verdict === 401 ? unauthorized() : forbidden();
          }
          return match.route.handler(request);
        })
        .catch((err) => {
          if (err instanceof ProblemError) return err.reply;
          throw err;
        });
      return send(reply);
    } catch (err) {
      console.error(JSON.stringify({ level: 'error', correlationId, message: (err as Error).message, stack: (err as Error).stack }));
      return send(problem(500, 'Something went wrong', { correlationId }));
    }
  }
}
