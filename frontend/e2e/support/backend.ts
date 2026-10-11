import type { APIRequestContext, BrowserContext, Request, Route } from '@playwright/test';
import { cast, type CastMember } from './cast';
import { API_URL, BACKEND, WEB_URL } from './ports';
import type { FaultOptions } from './fault-options';

const CONTROL = BACKEND === 'real' ? `${API_URL}/__test` : `${API_URL}/__fake`;
export const SESSION_HEADER = BACKEND === 'real' ? 'x-test-session' : 'x-fake-session';

/** `GET /api/public/caterers*` style patterns: method or `*`, then a path with `*` globs. */
function matches(fault: { method: string; path: string }, method: string, path: string): boolean {
  if (fault.method !== '*' && fault.method !== method) return false;
  const pattern = new RegExp('^' + fault.path.split('*').map((s) => s.replace(/[.+?^${}()|[\]\\]/g, '\\$&')).join('.*') + '$');
  return pattern.test(path);
}

const isBackendPath = (path: string) => path.startsWith('/api/') || path.startsWith('/media/');

/**
 * The test's handle on its own isolated backend (ADR 0004, ADR 0008). Tests
 * arrange state and failures through intent-named methods; they never touch
 * routes. State lives in the backend's test session; faults and the request
 * log live here, on the browser context's network.
 */
export class Backend {
  private readonly faults: ({ method: string; path: string } & FaultOptions)[] = [];
  private readonly held: (() => void)[] = [];
  private readonly sent: { method: string; path: string; query: string; body?: unknown }[] = [];
  private routing = false;

  constructor(
    private readonly request: APIRequestContext,
    private readonly context: BrowserContext,
    readonly session: string,
  ) {
    context.on('request', (req) => this.record(req));
  }

  private record(req: Request): void {
    const url = new URL(req.url());
    if (!url.pathname.startsWith('/api/')) return;
    let body: unknown;
    try {
      body = req.postDataJSON() ?? undefined;
    } catch {
      body = req.postData() ?? undefined;
    }
    this.sent.push({ method: req.method(), path: url.pathname, query: url.search, body });
  }

  private async call(method: 'GET' | 'POST' | 'DELETE', path: string, data?: unknown) {
    const res = await this.request.fetch(`${CONTROL}${path}`, {
      method,
      data,
      headers: { [SESSION_HEADER]: this.session },
    });
    if (!res.ok()) throw new Error(`Backend ${method} ${path} failed: ${res.status()} ${await res.text()}`);
    return res.status() === 204 ? undefined : res.json();
  }

  reset() {
    return this.call('POST', '/reset');
  }

  /** Apply a named state change (backend/src/testing/scenarios/). */
  scenario(name: string, args: Record<string, unknown> = {}) {
    return this.call('POST', '/scenario', { name, args });
  }

  async signInAs(who: CastMember) {
    const { cookie } = await this.call('POST', '/sign-in', { email: cast[who].email });
    await this.context.addCookies([{ name: 'sh_session', value: cookie, url: WEB_URL, httpOnly: true, sameSite: 'Lax' }]);
  }

  /** Make requests matching `METHOD /path*` fail, stall or drop. */
  async fail(route: string, options: FaultOptions = { status: 500 }) {
    const [method, path] = route.split(' ');
    this.faults.push({ method, path, ...options });
    if (!this.routing) {
      this.routing = true;
      await this.context.route((url) => isBackendPath(url.pathname), (r) => this.intercept(r));
    }
  }

  private async intercept(route: Route): Promise<void> {
    const req = route.request();
    const path = new URL(req.url()).pathname;
    const fault = this.faults.find((f) => matches(f, req.method(), path));
    if (!fault) return route.fallback();
    if (fault.times !== undefined && --fault.times <= 0) this.faults.splice(this.faults.indexOf(fault), 1);
    try {
      if (fault.hang) await new Promise<void>((resolve) => this.held.push(resolve));
      if (fault.delayMs) await new Promise((r) => setTimeout(r, fault.delayMs));
      if (fault.network) return await route.abort('connectionreset');
      if (fault.status) {
        const problem = fault.status >= 400;
        return await route.fulfill({
          status: fault.status,
          headers: { 'content-type': problem ? 'application/problem+json' : 'application/json', ...(fault.headers ?? {}) },
          body: JSON.stringify(fault.body ?? { title: 'Fault injected' }),
        });
      }
      return await route.fallback();
    } catch {
      // The page went away while the request was held; nothing to answer.
    }
  }

  /** Hold matching requests open until `release()`, to observe loading states. */
  hold(route: string, times = 1) {
    return this.fail(route, { hang: true, times });
  }

  async release() {
    for (const resolve of this.held.splice(0)) resolve();
  }

  async clearFaults() {
    this.faults.length = 0;
  }

  setNow(iso: string) {
    return this.call('POST', '/clock', { now: iso });
  }

  /** Requests the frontend sent, oldest first. */
  async requests(): Promise<{ method: string; path: string; query: string; body?: unknown }[]> {
    return [...this.sent];
  }

  state(): Promise<any> {
    return this.call('GET', '/state');
  }

  /** Emails the platform queued, oldest first: each has `to`, `kind`, and a `link` or `reason` where the email carries one. */
  async emails(): Promise<any[]> {
    const state = await this.state();
    if (BACKEND === 'real') return [...(state.outbox ?? [])].sort((a: { seq: number }, b: { seq: number }) => a.seq - b.seq);
    return [...(state.account?.outbox ?? []), ...(state.operator?.moderation?.emails ?? []), ...(state.outbox ?? [])];
  }

  /**
   * Start watching the audit log once the test is arranged. The log is seeded
   * with history (L2-060), so `appended()` returns only the entries added after
   * this call, oldest first: the ones the test's own actions produced.
   */
  async watchAudit(): Promise<{ appended(): Promise<any[]> }> {
    const audit = async () => (((await this.state()).audit ?? []) as { id: string; at: string; seq?: number }[]).sort((a, b) => a.at.localeCompare(b.at) || (a.seq ?? 0) - (b.seq ?? 0));
    const seen = new Set((await audit()).map((e) => e.id));
    return {
      appended: async () => (await audit()).filter((e) => !seen.has(e.id)),
    };
  }
}
