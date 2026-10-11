/**
 * Acceptance-test harness: the real HTTP API on an ephemeral port, backed by
 * the in-memory fake database (ADR 0007). No database server runs.
 */
import { after } from 'node:test';
import type { AddressInfo } from 'node:net';
import { createServer, type Server } from 'node:http';
import { createApp, type AppOptions } from '../../src/app.ts';
import { testEnvironment, type Environment } from '../../src/environment.ts';
import { productOptions } from '../../src/product.ts';

export interface Api {
  url: string;
  env: Environment;
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
export async function startApi(options: Partial<AppOptions> & { env?: Environment } = {}): Promise<Api> {
  const env = options.env ?? (await testEnvironment());
  const app = createApp({ ...productOptions(), environments: { resolve: () => env }, ...options });
  const server: Server = createServer(app);
  await new Promise<void>((resolve) => server.listen(0, '127.0.0.1', resolve));
  after(() => new Promise<void>((resolve) => server.close(() => resolve())));
  const url = `http://127.0.0.1:${(server.address() as AddressInfo).port}`;
  return { url, env, client: () => new Client(url) };
}
