import type { Store } from '../lib/store.ts';

/**
 * Named store mutations a test can ask for (`backend.scenario(name, args)`),
 * so tests state intent ("no caterers are published") instead of poking data.
 * Feature areas add their own entries.
 */
const SCENARIOS: Record<string, (store: Store, args: any) => unknown> = {
  'no-published-caterers': (store) => {
    for (const c of store.caterers) c.status = 'Draft';
  },
  'set-caterer-status': (store, { slug, status }: { slug: string; status: string }) => {
    const c = store.caterers.find((x) => x.slug === slug);
    if (c) c.status = status as typeof c.status;
  },
};

export function applyScenario(store: Store, name: string, args: unknown): unknown {
  const fn = SCENARIOS[name];
  if (!fn) throw new Error(`Unknown scenario "${name}"`);
  return fn(store, args);
}
