import pg from 'pg';
import type { Collection, Database, Document, Transaction } from './database.ts';

const SERIALIZATION_FAILURE = '40001';
const ATTEMPTS = 3;

/**
 * PostgreSQL adapter of the persistence port (ADR 0007). Every transaction is
 * SERIALIZABLE and retried on a serialisation failure. Parameterised queries
 * only (L2-080.2). Never runs during automated tests.
 */
export class PostgresDatabase implements Database {
  private readonly pool: pg.Pool;

  constructor(connectionString: string) {
    this.pool = new pg.Pool({ connectionString });
  }

  get connection(): pg.Pool {
    return this.pool;
  }

  async transaction<R>(work: (tx: Transaction) => Promise<R>): Promise<R> {
    for (let attempt = 1; ; attempt++) {
      const client = await this.pool.connect();
      try {
        await client.query('BEGIN ISOLATION LEVEL SERIALIZABLE');
        const result = await work(new PostgresTransaction(client));
        await client.query('COMMIT');
        return result;
      } catch (err) {
        await client.query('ROLLBACK').catch(() => undefined);
        if ((err as { code?: string }).code === SERIALIZATION_FAILURE && attempt < ATTEMPTS) continue;
        throw err;
      } finally {
        client.release();
      }
    }
  }

  async ping(): Promise<boolean> {
    try {
      await this.pool.query('SELECT 1');
      return true;
    } catch {
      return false;
    }
  }

  async close(): Promise<void> {
    await this.pool.end();
  }
}

class PostgresTransaction implements Transaction {
  private readonly client: pg.PoolClient;

  constructor(client: pg.PoolClient) {
    this.client = client;
  }

  collection<T extends Document>(name: string): Collection<T> {
    return new PostgresCollection<T>(this.client, name);
  }
}

class PostgresCollection<T extends Document> implements Collection<T> {
  private readonly client: pg.PoolClient;
  private readonly name: string;

  constructor(client: pg.PoolClient, name: string) {
    this.client = client;
    this.name = name;
  }

  async get(id: string): Promise<T | undefined> {
    const { rows } = await this.client.query('SELECT data FROM documents WHERE collection = $1 AND id = $2', [this.name, id]);
    return rows[0]?.data as T | undefined;
  }

  async find(where: Partial<T>): Promise<T[]> {
    const { rows } = await this.client.query('SELECT data FROM documents WHERE collection = $1 AND data @> $2::jsonb ORDER BY id', [
      this.name,
      JSON.stringify(where),
    ]);
    return rows.map((r) => r.data as T);
  }

  async findOne(where: Partial<T>): Promise<T | undefined> {
    return (await this.find(where))[0];
  }

  async all(): Promise<T[]> {
    const { rows } = await this.client.query('SELECT data FROM documents WHERE collection = $1 ORDER BY id', [this.name]);
    return rows.map((r) => r.data as T);
  }

  async put(doc: T): Promise<void> {
    await this.client.query(
      'INSERT INTO documents (collection, id, data) VALUES ($1, $2, $3::jsonb) ON CONFLICT (collection, id) DO UPDATE SET data = EXCLUDED.data',
      [this.name, doc.id, JSON.stringify(doc)],
    );
  }

  async delete(id: string): Promise<void> {
    await this.client.query('DELETE FROM documents WHERE collection = $1 AND id = $2', [this.name, id]);
  }
}
