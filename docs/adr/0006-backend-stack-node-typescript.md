# 0006 — Backend stack: TypeScript on Node.js, no web framework

- Status: Accepted
- Date: 2026-10-11

## Context

The detailed designs leave every backend technology `<TO SUPPLY>`. The
frontend already defines the HTTP contract (ADR 0003) as import-free wire
types in `frontend/projects/web/src/app/core/api/*.models.ts`, and the fake
backend (ADR 0004) proved that contract with a small Node server. AGENTS.md
asks for business rules in the domain/application layer, authentication by
default, and acceptance tests against the API.

## Decision

- The API is a TypeScript application in `backend/`, run directly by Node.js
  22 with type stripping (erasable TypeScript only: no enums, no parameter
  properties, `.ts` extensions in relative imports). `tsc --noEmit` checks it.
- Responses are typed with the frontend's wire types through `import type`
  from `frontend/projects/web/src/app/core/api/`, so the compiler catches
  contract drift on both sides. Imports are type-only and erased at run time.
- HTTP uses `node:http` with a small router of our own. Bodies are JSON
  (uploads are base64 in JSON, per the contract), so no framework is needed.
- The code is organised by feature area: `src/<area>/` holds the area's
  domain rules and use cases (plain functions over the persistence ports) and
  a `routes.ts` that only maps HTTP to them. Cross-cutting pieces live in
  `src/platform/` (persistence, clock, ids, email outbox, security) and
  `src/http/` (router, pipeline, cookies, problems).
- Every route declares an **endpoint policy**: the roles allowed, or
  `anonymous` by explicit choice. A route without one cannot be registered
  (authorise-requests design).
- Dependencies are kept small: `pg` for PostgreSQL and `@node-rs/argon2` for
  password hashing (Argon2id, L2-076.2).
- Tests use Node's built-in test runner (`node --test`) and call the API over
  HTTP on an ephemeral port (ADR 0007).

## Consequences

- One language across the stack; the wire types are shared without a code
  generator.
- No framework means we own request parsing limits, security headers and
  error handling; they live in `src/http/` and are covered by tests.
- The backend depends on the frontend tree for types only. Moving the wire
  types to a shared package is a later, mechanical change.
