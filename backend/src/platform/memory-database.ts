import { matches, type Collection, type Database, type Document, type Transaction } from './database.ts';

type Tables = Map<string, Map<string, string>>;

/**
 * The fake database (ADR 0007): documents are kept as JSON text so no caller
 * can alias stored state. Transactions are serialised and copy-on-write:
 * writes land in an overlay that replaces the tables only on success.
 */
export class MemoryDatabase implements Database {
  private tables: Tables = new Map();
  private queue: Promise<unknown> = Promise.resolve();

  async transaction<R>(work: (tx: Transaction) => Promise<R>): Promise<R> {
    const run = this.queue.then(async () => {
      const overlay = new MemoryTransaction(this.tables);
      const result = await work(overlay);
      this.tables = overlay.commit();
      return result;
    });
    this.queue = run.catch(() => undefined);
    return run;
  }

  async ping(): Promise<boolean> {
    return true;
  }

  async close(): Promise<void> {}
}

class MemoryTransaction implements Transaction {
  private readonly written = new Map<string, Map<string, string>>();
  private readonly base: Tables;

  constructor(base: Tables) {
    this.base = base;
  }

  collection<T extends Document>(name: string): Collection<T> {
    return new MemoryCollection<T>(this.table(name));
  }

  private table(name: string): Map<string, string> {
    let t = this.written.get(name);
    if (!t) {
      t = new Map(this.base.get(name) ?? []);
      this.written.set(name, t);
    }
    return t;
  }

  commit(): Tables {
    const next = new Map(this.base);
    for (const [name, rows] of this.written) next.set(name, rows);
    return next;
  }
}

class MemoryCollection<T extends Document> implements Collection<T> {
  private readonly rows: Map<string, string>;

  constructor(rows: Map<string, string>) {
    this.rows = rows;
  }

  async get(id: string): Promise<T | undefined> {
    const json = this.rows.get(id);
    return json === undefined ? undefined : (JSON.parse(json) as T);
  }

  async find(where: Partial<T>): Promise<T[]> {
    return (await this.all()).filter((doc) => matches(doc, where));
  }

  async findOne(where: Partial<T>): Promise<T | undefined> {
    return (await this.find(where))[0];
  }

  /** Ordered by id, as the PostgreSQL adapter orders them; callers sort by meaning. */
  async all(): Promise<T[]> {
    return [...this.rows.keys()].sort().map((id) => JSON.parse(this.rows.get(id)!) as T);
  }

  async put(doc: T): Promise<void> {
    this.rows.set(doc.id, JSON.stringify(doc));
  }

  async delete(id: string): Promise<void> {
    this.rows.delete(id);
  }
}
