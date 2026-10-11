import type { APIRequestContext, BrowserContext } from '@playwright/test';
import { cast, type CastMember } from './cast';
import { API_URL, WEB_URL } from './ports';

const CONTROL = `${API_URL}/__fake`;

export interface FaultOptions {
  status?: number;
  body?: unknown;
  delayMs?: number;
  network?: boolean;
  hang?: boolean;
  times?: number;
  headers?: Record<string, string>;
}

/**
 * The test's handle on its own isolated fake backend (ADR 0004). Tests arrange
 * state and failures through intent-named methods; they never touch routes.
 */
export class Backend {
  constructor(
    private readonly request: APIRequestContext,
    private readonly context: BrowserContext,
    readonly session: string,
  ) {}

  private async call(method: 'GET' | 'POST' | 'DELETE', path: string, data?: unknown) {
    const res = await this.request.fetch(`${CONTROL}${path}`, {
      method,
      data,
      headers: { 'x-fake-session': this.session },
    });
    if (!res.ok()) throw new Error(`Fake backend ${method} ${path} failed: ${res.status()} ${await res.text()}`);
    return res.status() === 204 ? undefined : res.json();
  }

  reset() {
    return this.call('POST', '/reset');
  }

  /** Apply a named state change defined in fake-backend/routes/scenarios.ts. */
  scenario(name: string, args: Record<string, unknown> = {}) {
    return this.call('POST', '/scenario', { name, args });
  }

  async signInAs(who: CastMember) {
    const { cookie } = await this.call('POST', '/sign-in', { email: cast[who].email });
    await this.context.addCookies([{ name: 'sh_session', value: cookie, url: WEB_URL, httpOnly: true, sameSite: 'Lax' }]);
  }

  /** Make requests matching `METHOD /path*` fail, stall or drop. */
  fail(route: string, options: FaultOptions = { status: 500 }) {
    const [method, path] = route.split(' ');
    return this.call('POST', '/faults', { method, path, ...options });
  }

  /** Hold matching requests open until `release()`, to observe loading states. */
  hold(route: string, times = 1) {
    return this.fail(route, { hang: true, times });
  }

  release() {
    return this.call('POST', '/release');
  }

  clearFaults() {
    return this.call('DELETE', '/faults');
  }

  setNow(iso: string) {
    return this.call('POST', '/clock', { now: iso });
  }

  /** Requests the frontend sent, oldest first. */
  requests(): Promise<{ method: string; path: string; query: string; body?: unknown }[]> {
    return this.call('GET', '/requests');
  }

  state(): Promise<any> {
    return this.call('GET', '/state');
  }

  /**
   * Start watching the audit log once the test is arranged. The log is seeded
   * with history (L2-060), so `appended()` returns only the entries added after
   * this call, oldest first: the ones the test's own actions produced.
   */
  async watchAudit(): Promise<{ appended(): Promise<any[]> }> {
    const seen = new Set((await this.state()).audit.map((e: { id: string }) => e.id));
    return {
      appended: async () => (await this.state()).audit.filter((e: { id: string }) => !seen.has(e.id)),
    };
  }
}
