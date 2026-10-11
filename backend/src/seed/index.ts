/**
 * The fictional cast from docs/mocks/README.md, as documents per collection.
 * Never real people, businesses or addresses (AGENTS.md).
 */
import type { Database, Document } from '../platform/database.ts';
import { seedUsers } from './users.ts';
import { seedPrivacyNotice, seedSessions } from './account.ts';
import { seedCaterers } from './caterers.ts';
import { seedReviews } from './reviews.ts';
import { seedCuisines } from '../discovery/taxonomy.ts';
import { withModerationCast } from './moderation.ts';

export async function castDocuments(): Promise<Record<string, Document[]>> {
  return withModerationCast({
    users: await seedUsers(),
    sessions: seedSessions(),
    settings: [seedPrivacyNotice()],
    caterers: seedCaterers(),
    cuisines: seedCuisines(),
    reviews: seedReviews(),
  });
}

/** Idempotent: inserts only documents whose id is not there yet, so it is safe to re-run. */
export async function seedDatabase(db: Database): Promise<number> {
  const docs = await castDocuments();
  return db.transaction(async (tx) => {
    let inserted = 0;
    for (const [name, list] of Object.entries(docs)) {
      const collection = tx.collection(name);
      for (const doc of list) {
        if (await collection.get(doc.id)) continue;
        await collection.put(doc);
        inserted++;
      }
    }
    return inserted;
  });
}
