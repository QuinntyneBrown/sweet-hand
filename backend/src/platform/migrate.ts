/**
 * Applies pending SQL migrations (ADR 0007). Run explicitly with
 * `npm run migrate`; the application never migrates on startup.
 */
import { readdir, readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { PostgresDatabase } from './postgres-database.ts';
import { requiredEnv } from './config.ts';

const dir = join(dirname(fileURLToPath(import.meta.url)), 'migrations');
const db = new PostgresDatabase(requiredEnv('DATABASE_URL'));
const pool = db.connection;

try {
  await pool.query('CREATE TABLE IF NOT EXISTS schema_migrations (name text PRIMARY KEY, applied_at timestamptz NOT NULL DEFAULT now())');
  const applied = new Set((await pool.query('SELECT name FROM schema_migrations')).rows.map((r) => r.name as string));
  for (const name of (await readdir(dir)).filter((f) => f.endsWith('.sql')).sort()) {
    if (applied.has(name)) continue;
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
      await client.query(await readFile(join(dir, name), 'utf8'));
      await client.query('INSERT INTO schema_migrations (name) VALUES ($1)', [name]);
      await client.query('COMMIT');
      console.log(`applied ${name}`);
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  }
} finally {
  await db.close();
}
