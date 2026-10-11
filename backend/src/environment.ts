import type { Clock } from './platform/clock.ts';
import { CAST_NOW, FixedClock } from './platform/clock.ts';
import type { Database } from './platform/database.ts';
import { MemoryDatabase } from './platform/memory-database.ts';
import { MemoryMediaStore, type MediaStore } from './platform/media.ts';
import { seedDatabase } from './seed/index.ts';
import { PassThroughImageProcessing, type ImageProcessing } from './platform/image-processing.ts';
import { SignatureScanner, type MalwareScanner } from './platform/malware-scanner.ts';
import { LocalChallengeVerifier, type ChallengeVerifier } from './platform/bot-challenge.ts';

/**
 * Everything a request runs against. Production has one; the test-control API
 * (ADR 0009) keeps one per test session so tests never share state.
 */
export interface Environment {
  db: Database;
  clock: Clock;
  media: MediaStore;
  /** The image service that checks and re-encodes uploaded photos (L2-041). */
  images: ImageProcessing;
  /** Scans uploads before they are stored (L2-041.6). */
  scanner: MalwareScanner;
  /** Verifies provider-bound tokens before abuse-prone anonymous actions. */
  challenges: ChallengeVerifier;
  /**
   * A Toronto date (YYYY-MM-DD) on which the listing keeps catalog order
   * instead of the daily seeded order, so test environments read like the
   * mocks on the cast's "today". Never set in production.
   */
  catalogDay?: string;
}

/** A fresh environment on the fake database with the cast's clock (ADR 0008), seeded with the cast unless asked not to. */
export type TestEnvironment = Environment & { clock: FixedClock; db: MemoryDatabase; media: MemoryMediaStore; images: PassThroughImageProcessing };

export async function testEnvironment(options: { seed?: boolean } = {}): Promise<TestEnvironment> {
  const env = { db: new MemoryDatabase(), clock: new FixedClock(), media: new MemoryMediaStore(), images: new PassThroughImageProcessing(), scanner: new SignatureScanner(), challenges: new LocalChallengeVerifier(), catalogDay: CAST_NOW.slice(0, 10) };
  if (options.seed !== false) await seedDatabase(env.db);
  return env;
}
