import { randomUUID } from 'node:crypto';
import type { Fault } from './faults.ts';
import { seedCaterers, type Caterer } from '../seed/caterers.ts';
import { seedCuisines, seedRegions, type Cuisine, type Region } from '../seed/taxonomy.ts';
import { seedUsers, type User } from '../seed/users.ts';
import { seedEnquiries, type Enquiry } from '../seed/enquiries.ts';
import { seedReviews, type Review } from '../seed/reviews.ts';
import { seedReports, type Report } from '../seed/reports.ts';
import { seedOperator, type OperatorState } from '../seed/operator.ts';
import { seedAccount, type AccountState } from '../seed/account.ts';

/** Saturday 10 October 2026, 10:00 a.m. in Toronto (UTC−4): "today" in the mocks' cast. */
export const DEFAULT_NOW = '2026-10-10T14:00:00.000Z';

/**
 * Everything one test can see and change. Each `x-fake-session` header value
 * gets its own store, created fresh from the seed (ADR 0004).
 */
export interface Store {
  now: Date;
  caterers: Caterer[];
  cuisines: Cuisine[];
  regions: Region[];
  users: User[];
  enquiries: Enquiry[];
  reviews: Review[];
  reports: Report[];
  operator: OperatorState;
  account: AccountState;
  /** Items in the operator review queue until the moderation area computes them. */
  queueCount: number;
  /** Session cookie value → user id. */
  sessions: Map<string, string>;
  faults: Fault[];
  /** Requests the backend received, for tests that assert what was (not) sent. */
  requests: { method: string; path: string; query: string; body?: unknown }[];
}

export function createStore(): Store {
  return {
    now: new Date(DEFAULT_NOW),
    caterers: seedCaterers(),
    cuisines: seedCuisines(),
    regions: seedRegions(),
    users: seedUsers(),
    enquiries: seedEnquiries(),
    reviews: seedReviews(),
    reports: seedReports(),
    operator: seedOperator(),
    account: seedAccount(),
    queueCount: 7,
    sessions: new Map(),
    faults: [],
    requests: [],
  };
}

const stores = new Map<string, Store>();

export function storeFor(id: string): Store {
  let s = stores.get(id);
  if (!s) {
    s = createStore();
    stores.set(id, s);
  }
  return s;
}

export function resetStore(id: string): Store {
  const s = createStore();
  stores.set(id, s);
  return s;
}

export const newId = (): string => randomUUID();

/** Today's date in America/Toronto as YYYY-MM-DD. */
export function torontoDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Toronto', year: 'numeric', month: '2-digit', day: '2-digit' }).format(now);
}

export function currentUser(store: Store, cookies: Record<string, string>): User | undefined {
  const id = store.sessions.get(cookies['sh_session'] ?? '');
  const user = id ? store.users.find((u) => u.id === id) : undefined;
  return user && !user.deleted ? user : undefined;
}

export function startSession(store: Store, user: User): string {
  const token = randomUUID().replace(/-/g, '');
  store.sessions.set(token, user.id);
  return token;
}
