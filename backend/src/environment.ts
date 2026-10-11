import type { Clock } from './platform/clock.ts';
import { FixedClock } from './platform/clock.ts';
import type { Database } from './platform/database.ts';
import { MemoryDatabase } from './platform/memory-database.ts';
import { seedDatabase } from './seed/index.ts';

/**
 * Everything a request runs against. Production has one; the test-control API
 * (ADR 0008) keeps one per test session so tests never share state.
 */
export interface Environment {
  db: Database;
  clock: Clock;
}

/** A fresh environment on the fake database with the cast's clock (ADR 0007), seeded with the cast unless asked not to. */
export type TestEnvironment = Environment & { clock: FixedClock; db: MemoryDatabase };

export async function testEnvironment(options: { seed?: boolean } = {}): Promise<TestEnvironment> {
  const env = { db: new MemoryDatabase(), clock: new FixedClock() };
  if (options.seed !== false) await seedDatabase(env.db);
  return env;
}
