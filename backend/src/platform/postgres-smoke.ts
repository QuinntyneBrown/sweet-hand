/**
 * Hand check of the PostgreSQL adapter (ADR 0007): runs the same operations on
 * PostgreSQL and on the in-memory fake and compares the results. Not part of
 * the automated suite, which never starts a database.
 *
 *   DATABASE_URL=postgres://… npm run migrate && DATABASE_URL=postgres://… npm run smoke:postgres
 */
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import type { Database } from './database.ts';
import { MemoryDatabase } from './memory-database.ts';
import { PostgresDatabase } from './postgres-database.ts';
import { requiredEnv } from './config.ts';

interface Thing {
  id: string;
  kind: string;
  n: number;
  flag: boolean;
  tags: string[];
  note?: string | null;
}

async function exercise(db: Database, collection: string): Promise<unknown[]> {
  const out: unknown[] = [];
  await db.transaction(async (tx) => {
    const c = tx.collection<Thing>(collection);
    await c.put({ id: 'b', kind: 'x', n: 2, flag: true, tags: ['a'], note: null });
    await c.put({ id: 'a', kind: 'y', n: 1, flag: false, tags: [] });
    await c.put({ id: 'c', kind: 'x', n: 3, flag: false, tags: ['b'], note: 'it’s <b>' });
  });
  await db
    .transaction(async (tx) => {
      await tx.collection<Thing>(collection).put({ id: 'd', kind: 'x', n: 4, flag: true, tags: [] });
      throw new Error('roll back');
    })
    .catch(() => undefined);
  await db.transaction(async (tx) => {
    const c = tx.collection<Thing>(collection);
    out.push(await c.all());
    out.push(await c.find({ kind: 'x' }));
    out.push(await c.find({ kind: 'x', flag: false }));
    out.push(await c.find({ note: null }));
    out.push(await c.findOne({ n: 1 }));
    out.push(await c.get('missing'));
    await c.put({ id: 'a', kind: 'z', n: 9, flag: true, tags: ['q'] });
    await c.delete('b');
    out.push(await c.all());
  });
  return out;
}

const pg = new PostgresDatabase(requiredEnv('DATABASE_URL'));
const collection = `smoke-${randomUUID()}`;
try {
  assert.equal(await pg.ping(), true);
  const expected = await exercise(new MemoryDatabase(), collection);
  const actual = await exercise(pg, collection);
  assert.deepEqual(actual, expected);
  console.log('PostgreSQL adapter matches the in-memory fake');
} finally {
  await pg.connection.query('DELETE FROM documents WHERE collection = $1', [collection]);
  await pg.close();
}
