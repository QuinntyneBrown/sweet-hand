import type { Clock } from './platform/clock.ts';
import { FixedClock } from './platform/clock.ts';
import type { Database } from './platform/database.ts';
import { MemoryDatabase } from './platform/memory-database.ts';

/**
 * Everything a request runs against. Production has one; the test-control API
 * (ADR 0008) keeps one per test session so tests never share state.
 */
export interface Environment {
  db: Database;
  clock: Clock;
}

/** A fresh environment on the fake database with the cast's clock (ADR 0007). */
export async function testEnvironment(): Promise<Environment & { clock: FixedClock }> {
  return { db: new MemoryDatabase(), clock: new FixedClock() };
}
