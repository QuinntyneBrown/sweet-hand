import type { Store } from '../lib/store.ts';
import { accountScenarios } from './account.ts';
import { catererProfileScenarios } from './caterer-profile.ts';
import { enquiriesScenarios } from './enquiries.ts';
import { operatorScenarios } from './operator.ts';
import { reportsScenarios } from './reports.ts';
import { reviewsScenarios } from './reviews.ts';

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
  'set-unread': (store, { email, count }: { email: string; count: number }) => {
    const user = store.users.find((u) => u.email === email);
    if (user) store.unread[user.id] = count;
  },
};

const ALL: Record<string, (store: Store, args: any) => unknown> = {
  ...SCENARIOS,
  ...accountScenarios,
  ...catererProfileScenarios,
  ...enquiriesScenarios,
  ...operatorScenarios,
  ...reportsScenarios,
  ...reviewsScenarios,
};

export function applyScenario(store: Store, name: string, args: unknown): unknown {
  const fn = ALL[name];
  if (!fn) throw new Error(`Unknown scenario "${name}"`);
  return fn(store, args);
}
