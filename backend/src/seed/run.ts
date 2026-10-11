/** `npm run seed`: loads the fictional cast into DATABASE_URL. Safe to re-run. */
import { PostgresDatabase } from '../platform/postgres-database.ts';
import { requiredEnv } from '../platform/config.ts';
import { seedDatabase } from './index.ts';

const db = new PostgresDatabase(requiredEnv('DATABASE_URL'));
try {
  console.log(`seeded ${await seedDatabase(db)} new documents`);
} finally {
  await db.close();
}
