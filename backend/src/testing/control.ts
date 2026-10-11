/**
 * The test-control API (ADR 0008), mounted only when TEST_CONTROL is on and
 * the database is the in-memory fake. Each `x-test-session` header value gets
 * its own environment: database, clock and media store, seeded with the cast.
 */
import type { IncomingMessage, ServerResponse } from 'node:http';
import { randomUUID } from 'node:crypto';
import type { Environments } from '../http/nest/options.ts';
import { testEnvironment, type TestEnvironment } from '../environment.ts';
import { findUserByEmail, sessions } from '../identity/model.ts';
import { randomToken, sha256 } from '../platform/secrets.ts';
import { allScenarios } from './scenarios/index.ts';

export const SESSION_HEADER = 'x-test-session';

export class TestEnvironments implements Environments {
  private readonly envs = new Map<string, Promise<TestEnvironment>>();

  private key(req: IncomingMessage): string {
    return String(req.headers[SESSION_HEADER] ?? 'default');
  }

  resolve(req: IncomingMessage): Promise<TestEnvironment> {
    return this.forKey(this.key(req));
  }

  forKey(key: string): Promise<TestEnvironment> {
    let env = this.envs.get(key);
    if (!env) {
      env = testEnvironment();
      this.envs.set(key, env);
    }
    return env;
  }

  reset(key: string): Promise<TestEnvironment> {
    const env = testEnvironment();
    this.envs.set(key, env);
    return env;
  }
}

async function readJson(req: IncomingMessage): Promise<any> {
  const chunks: Buffer[] = [];
  for await (const c of req) chunks.push(c as Buffer);
  return chunks.length ? JSON.parse(Buffer.concat(chunks).toString('utf8')) : {};
}

function send(res: ServerResponse, status: number, body?: unknown): true {
  res.writeHead(status, body === undefined ? {} : { 'content-type': 'application/json' }).end(body === undefined ? undefined : JSON.stringify(body));
  return true;
}

/** Handles `/__test/*`; returns false for every other path. */
export function testControl(envs: TestEnvironments): (req: IncomingMessage, res: ServerResponse) => Promise<boolean> {
  return async (req, res) => {
    const url = new URL(req.url ?? '/', 'http://localhost');
    if (!url.pathname.startsWith('/__test/')) return false;
    const key = String(req.headers[SESSION_HEADER] ?? 'default');
    const route = `${req.method} ${url.pathname.slice('/__test'.length)}`;
    try {
      switch (route) {
        case 'POST /reset':
          await envs.reset(key);
          return send(res, 204);
        case 'POST /scenario': {
          const { name, args } = await readJson(req);
          const scenario = allScenarios[name];
          if (!scenario) return send(res, 404, { title: `Unknown scenario "${name}"` });
          const env = await envs.forKey(key);
          const result = await env.db.transaction((tx) => Promise.resolve(scenario({ tx, now: env.clock.now(), env }, args ?? {})));
          return send(res, 200, result ?? {});
        }
        case 'POST /sign-in': {
          // A complete session for a seeded account, second factor included; the browser's first request names its device.
          const { email } = await readJson(req);
          const env = await envs.forKey(key);
          const token = await env.db.transaction(async (tx) => {
            const user = await findUserByEmail(tx, email);
            if (!user) return undefined;
            const token = randomToken();
            const now = env.clock.now().toISOString();
            await sessions(tx).put({ id: `ses-${randomUUID()}`, tokenHash: sha256(token), userId: user.id, device: '', createdAt: now, lastActiveAt: now });
            return token;
          });
          return token ? send(res, 200, { cookie: token }) : send(res, 404, { title: 'No such account' });
        }
        case 'POST /clock': {
          const { now } = await readJson(req);
          (await envs.forKey(key)).clock.set(now);
          return send(res, 204);
        }
        case 'GET /state': {
          // Every collection of the session's database, for assertions on what the frontend caused.
          const env = await envs.forKey(key);
          return send(res, 200, await env.db.snapshot());
        }
        default:
          return send(res, 404, { title: 'Unknown control route' });
      }
    } catch (err) {
      console.error(err);
      return send(res, 500, { title: (err as Error).message });
    }
  };
}
