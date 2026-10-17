# 0008 — Persistence as implemented: document collections on PostgreSQL, faked in memory for tests

- Status: Accepted for the current implementation; **conflicts with ADR 0006
  (data access through Drizzle ORM, files in S3-compatible object storage,
  pg-boss queue) and ADR 0007 (one repository port per aggregate)**. Those
  ADRs were recorded while this backend was being built on another branch.
  Which way to reconcile, migrating the code to Drizzle repositories or
  amending ADRs 0006 and 0007, is an open decision.
- Date: 2026-10-11

## Context

The backend needs a durable store with transactions and Canadian hosting
(L2-075, L2-090). Acceptance tests must run without a database server: the
user asked that acceptance tests fake the database and that the real
database never runs during tests. Whatever code only runs against the real
database is therefore never exercised by the automated suite, so that code
must be as small and as generic as possible.

## Decision

- Production data lives in **PostgreSQL**. Each aggregate type is a
  *collection* of JSON documents, stored in one table
  `documents (collection, id, data jsonb)` keyed by `(collection, id)` with a
  GIN index on `data`. Uploaded media live in a `media` table (`bytea`).
- The application talks to a persistence **port** (`src/platform/database.ts`):
  `Database.transaction(work)` gives a `Transaction` with
  `collection(name).get / find(where) / all / put / delete`. `find` matches on
  top-level scalar fields only (`data @> $1` in SQL), so every query the application
  needs is expressible in both adapters with identical semantics.
- Two adapters implement the port:
  - `PostgresDatabase` — each request runs in one `SERIALIZABLE` transaction,
    retried on serialisation failure; parameterised queries only (L2-080).
  - `MemoryDatabase` — the fake used by every automated test: copy-on-write
    transactions over in-memory maps, serialised by a lock, with documents
    stored as JSON so callers can never alias stored state.
- All selection, sorting, paging and business rules run in the application
  layer over documents returned by the port, so they are covered by the
  acceptance tests whichever adapter is used.
- Schema changes are SQL files in `src/platform/migrations/`, applied only by
  the explicit `npm run migrate` command, never on startup. Seeding is the
  explicit, idempotent `npm run seed` command (insert-if-absent by id), with
  the fictional cast only.

## Consequences

- Tests are fast and hermetic; no database server, container or network.
- The SQL surface is a few generic statements, checked by hand against a
  local PostgreSQL when the adapter changes.
- Listing queries load the published caterers and filter in the
  application. At the planned 5,000 caterers (L2-086) this is a few
  megabytes per request; a read model or SQL pushdown for the listing is the
  first optimisation if load tests miss the latency budget.
- **Deferred: the database does not enforce the append-only audit log
  (L2-060 AC2, second sentence).** Audit entries are the `audit` collection
  in the shared `documents` table, and the API and the retention job connect
  with one `DATABASE_URL`, so no grant can withhold UPDATE and DELETE on audit
  entries alone. The `sweethand_app` and `sweethand_retention` roles of ADR
  0006 do not exist. The application side holds: the log is written only
  through `recordAudit`, no endpoint edits or deletes an entry, and only the
  retention job deletes entries, after 7 years. Closing this needs a separate
  audit table with role grants and a second connection for retention, and is
  decided with the reconciliation above.
