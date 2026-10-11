/**
 * Acceptance-test harness: the real HTTP API on an ephemeral port, backed by
 * the in-memory fake database (ADR 0007). No database server runs.
 */
import { after } from 'node:test';
import type { AddressInfo } from 'node:net';
import type { Server } from 'node:http';
import { createApiApp, type ApiAppOptions } from '../../src/api-app.ts';
import { testEnvironment, type TestEnvironment } from '../../src/environment.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';
import { totp } from '../../src/identity/totp.ts';

export interface Api {
  url: string;
  env: TestEnvironment;
  /** A browser-like client with its own cookie jar; sends the CSRF header like Angular. */
  client(): Client;
}

export interface Response<T = any> {
  status: number;
  headers: Headers;
  body: T;
}

export class Client {
  readonly cookies = new Map<string, string>();

  private readonly base: string;

  constructor(base: string) {
    this.base = base;
  }

  async request<T = any>(method: string, path: string, body?: unknown, headers: Record<string, string> = {}): Promise<Response<T>> {
    if (!this.cookies.has('XSRF-TOKEN')) this.cookies.set('XSRF-TOKEN', 'test-csrf-token');
    const res = await fetch(this.base + path, {
      method,
      headers: {
        cookie: [...this.cookies].map(([k, v]) => `${k}=${v}`).join('; '),
        'x-xsrf-token': this.cookies.get('XSRF-TOKEN')!,
        ...(body === undefined ? {} : { 'content-type': 'application/json' }),
        ...headers,
      },
      body: body === undefined ? undefined : typeof body === 'string' ? body : JSON.stringify(body),
      redirect: 'manual',
    });
    for (const line of res.headers.getSetCookie()) {
      const [pair, ...attrs] = line.split(';');
      const i = pair.indexOf('=');
      const name = pair.slice(0, i).trim();
      const value = pair.slice(i + 1).trim();
      if (attrs.some((a) => /max-age=0/i.test(a.trim())) || value === '') this.cookies.delete(name);
      else this.cookies.set(name, value);
    }
    const text = await res.text();
    const type = res.headers.get('content-type') ?? '';
    return { status: res.status, headers: res.headers, body: type.includes('json') && text ? JSON.parse(text) : text };
  }

  get<T = any>(path: string, headers?: Record<string, string>) {
    return this.request<T>('GET', path, undefined, headers);
  }
  post<T = any>(path: string, body?: unknown, headers?: Record<string, string>) {
    return this.request<T>('POST', path, body ?? {}, headers);
  }
  put<T = any>(path: string, body?: unknown) {
    return this.request<T>('PUT', path, body ?? {});
  }
  patch<T = any>(path: string, body?: unknown) {
    return this.request<T>('PATCH', path, body ?? {});
  }
  delete<T = any>(path: string) {
    return this.request<T>('DELETE', path);
  }
}

/** Starts the API for one test file; it stops when the file's tests finish. */
export async function startApi(options: Partial<Omit<ApiAppOptions, 'environments'>> & { env?: TestEnvironment } = {}): Promise<Api> {
  const env = options.env ?? (await testEnvironment());
  const app = await createApiApp({ ...options, environments: { resolve: () => env } });
  await app.listen(0, '127.0.0.1');
  after(() => app.close());
  const url = `http://127.0.0.1:${((app.getHttpServer() as Server).address() as AddressInfo).port}`;
  return { url, env, client: () => new Client(url) };
}

/** Every document of a collection in the test's fake database. */
export function documents<T = any>(api: Api, collection: string): Promise<T[]> {
  return api.env.db.transaction((tx) => tx.collection<any>(collection).all()) as Promise<T[]>;
}

/** Emails the platform queued, oldest first. */
export async function outbox(api: Api): Promise<{ to: string; kind: string; at: string; link?: string; [k: string]: unknown }[]> {
  return (await documents<any>(api, 'outbox')).sort((a, b) => a.seq - b.seq);
}

/** Moves the test environment's clock. */
export function advanceClock(api: Api, ms: number): void {
  api.env.clock.advance(ms);
}

/** A client signed in as a seeded account; operators complete their second factor. */
export async function signedInClient(api: Api, email: string): Promise<Client> {
  const client = api.client();
  const res = await client.post('/api/identity/sign-in', { email, password: SEED_PASSWORD });
  if (res.status !== 200) throw new Error(`Sign-in as ${email} failed: ${res.status} ${JSON.stringify(res.body)}`);
  if (res.body.secondFactorRequired) {
    const user = (await documents(api, 'users')).find((u) => u.emailKey === email.toLowerCase());
    const second = user.totpSecret
      ? { method: 'authenticator app', code: totp(user.totpSecret, api.env.clock.now()) }
      : { method: 'security key', assertion: 'local-key:test' };
    const done = await client.post('/api/identity/second-factor', second);
    if (done.status !== 200) throw new Error(`Second factor for ${email} failed: ${done.status}`);
  }
  return client;
}
