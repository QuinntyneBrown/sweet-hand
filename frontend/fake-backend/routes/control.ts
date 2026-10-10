import type { Router } from '../lib/router.ts';
import { ok, noContent, notFound } from '../lib/http.ts';
import { resetStore, startSession, type Store } from '../lib/store.ts';
import { hanging } from '../lib/faults.ts';

/**
 * Test control API (ADR 0004). Only the Playwright fixture calls these; they
 * are not part of the product contract.
 */
export function registerControl(r: Router<Store>): void {
  r.post('/__fake/reset', (ctx) => {
    resetStore(ctx.params['session']);
    return noContent();
  });

  /** Apply a named mutation to the store: { name, args }. See routes/scenarios.ts. */
  r.post('/__fake/scenario', async (ctx) => {
    const { applyScenario } = await import('./scenarios.ts');
    const result = applyScenario(ctx.store, ctx.body.name, ctx.body.args ?? {});
    return ok(result ?? {});
  });

  /** Start a session for a seeded user by email; returns the cookie value. */
  r.post('/__fake/sign-in', (ctx) => {
    const user = ctx.store.users.find((u) => u.email === ctx.body.email);
    if (!user) return notFound();
    return ok({ cookie: startSession(ctx.store, user) });
  });

  r.post('/__fake/faults', (ctx) => {
    ctx.store.faults.push(ctx.body);
    return noContent();
  });

  r.delete('/__fake/faults', (ctx) => {
    ctx.store.faults.length = 0;
    return noContent();
  });

  r.post('/__fake/release', (ctx) => {
    for (const resolve of hanging.get(ctx.params['session']) ?? []) resolve();
    hanging.delete(ctx.params['session']);
    return noContent();
  });

  r.post('/__fake/clock', (ctx) => {
    ctx.store.now = new Date(ctx.body.now);
    return noContent();
  });

  r.get('/__fake/requests', (ctx) => ok(ctx.store.requests));

  /** Read part of the store, for assertions on what the frontend sent. */
  r.get('/__fake/state', (ctx) => ok(JSON.parse(JSON.stringify(ctx.store, (_k, v) => (v instanceof Map ? Object.fromEntries(v) : v)))));
}
