/** `npm run seed`: loads the fictional cast and its photos into DATABASE_URL. Safe to re-run. */
import { readdir } from 'node:fs/promises';
import { PostgresDatabase } from '../platform/postgres-database.ts';
import { requiredEnv } from '../platform/config.ts';
import { CAST_MEDIA_DIR, PostgresMediaStore, castMedia } from '../platform/media.ts';
import { seedDatabase } from './index.ts';

const db = new PostgresDatabase(requiredEnv('DATABASE_URL'));
try {
  console.log(`seeded ${await seedDatabase(db)} new documents`);
  const media = new PostgresMediaStore(db.connection);
  let photos = 0;
  for (const file of await readdir(CAST_MEDIA_DIR)) {
    if (await media.get(file)) continue;
    const object = await castMedia(file);
    if (!object) continue;
    await media.put(file, object);
    photos++;
  }
  console.log(`seeded ${photos} new photos`);
} finally {
  await db.close();
}
