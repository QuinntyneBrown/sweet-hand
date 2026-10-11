/**
 * The persistence port (ADR 0007). The application sees collections of JSON
 * documents keyed by `id`; PostgreSQL implements it in production and an
 * in-memory fake in every automated test.
 */

export interface Document {
  id: string;
}

export interface Collection<T extends Document> {
  get(id: string): Promise<T | undefined>;
  /** Documents whose top-level scalar fields (string, number, boolean, null) equal every field of `where`. */
  find(where: Partial<T>): Promise<T[]>; // ordered by id
  /** The first document matching `where`, if any. */
  findOne(where: Partial<T>): Promise<T | undefined>;
  /** Every document, ordered by id. */
  all(): Promise<T[]>;
  /** Insert or replace. */
  put(doc: T): Promise<void>;
  delete(id: string): Promise<void>;
}

export interface Transaction {
  collection<T extends Document>(name: string): Collection<T>;
}

export interface Database {
  /**
   * Runs `work` in one transaction: all of its writes commit together when it
   * resolves, and none do if it throws.
   */
  transaction<R>(work: (tx: Transaction) => Promise<R>): Promise<R>;
  /** True when the store can serve requests (health checks, L2-088.3). */
  ping(): Promise<boolean>;
  close(): Promise<void>;
}

/** Field equality on top-level fields, with JSON semantics (the meaning of `data @> where` for scalars). */
export function matches(doc: object, where: object): boolean {
  for (const [key, value] of Object.entries(where)) {
    if (value === undefined) continue;
    if (JSON.stringify((doc as Record<string, unknown>)[key]) !== JSON.stringify(value)) return false;
  }
  return true;
}
