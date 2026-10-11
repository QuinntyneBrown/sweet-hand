# Sweet Hand backend

The HTTP API: NestJS on Node.js 22, TypeScript run through SWC (ADRs 0006,
0010), PostgreSQL in production and an in-memory fake database in every
automated test (ADR 0008; it differs from ADRs 0006 and 0007 on data access,
see ADR 0008's status). The frontend's Playwright suite runs against this
API in test mode (ADR 0009).

## Commands

Run from `backend/` (Node 22.18+).

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm start` | API on `PORT` (4300). PostgreSQL when `DATABASE_URL` is set, otherwise an in-memory database seeded with the fictional cast |
| `npm test` | Acceptance tests against the API, on the in-memory database (no database server runs) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run migrate` | Apply SQL migrations to `DATABASE_URL`; never done on startup |
| `npm run seed` | Load the fictional cast and its photos into `DATABASE_URL`; safe to re-run |
| `npm run smoke:postgres` | Hand check that the PostgreSQL adapter behaves like the in-memory fake |

Environment: `PORT`, `DATABASE_URL`, `SECURE_COOKIES` (default on with a
database), `ALLOWED_ORIGINS` (comma-separated, for the CSRF origin check),
`TRUST_PROXY`, `IP_HASH_SECRET`, `TEST_CONTROL` (test mode, refused with a
database).

## Layout

```
src/
  main.ts            composition root
  api-app.ts         the NestJS application, shared by main.ts and the tests
  product.ts         every area's controller, authentication and denial logging
  http/endpoint.ts   request context, reply, endpoint policies; http/problems.ts, http/cookies.ts
  http/nest/         the request pipeline: context middleware; rate-limit, CSRF, body and
                     endpoint-policy guards; the transaction interceptor; the problem filter
  platform/          persistence port and adapters, clock, outbox, audit log, security log, throttles, media, secrets
  <area>/            model.ts (documents and collections), use cases, <area>.controller.ts
  seed/              the fictional cast, as documents per collection
  testing/           test mode only: per-session environments, /__test/ control API, scenarios/<area>.ts
test/
  support/api.ts     harness: the API on an ephemeral port with a fresh seeded in-memory environment
  <area>/*.test.ts   Given/When/Then acceptance tests against the HTTP API
```

## Conventions

- **Business rules live in use cases and domain functions** under
  `src/<area>/`, never in the controller. A controller method only maps a
  route to a use case: `@Post('api/…') @UsePolicy(…) name(@Ctx() req: Request)
  { return useCase(req); }`. Use cases take the framework-free `Request`
  context and return a `Reply` (status, body, headers); the transaction
  interceptor writes it.
- **Every route declares an endpoint policy** with `@UsePolicy(...)`:
  `anonymous` (an explicit, commented choice), `roles(...)`, `signedIn` or
  `admins`. A route without one is refused. The authorisation test reads every
  controller's routes and checks each protected one returns 401 to visitors
  and 403 to roles it does not allow (L2-079.3). `@Refusal(fn)` gives a 403 a
  specific body (Admin-only routes name the Admins to ask, L2-056.5); the
  guard still makes the decision and logs it. `@MaxBody(bytes)` raises the
  1 MB body limit for uploads. `@WithoutDatabase()` is for health checks only.
- **Register a new controller** in `productControllers` (`src/product.ts`).
  Routes match in declaration order, so declare `items/order` before
  `items/:id`.
- **Records are scoped to the caller.** A record the caller may not see is a
  404 identical to a missing one. Bodies are read field by field into
  commands, so fields such as `status` or `ownerId` are ignored (L2-079.2).
- **Persistence** goes through `tx.collection<T>(name)` (`get`, `find` on
  top-level scalar fields, `findOne`, `all`, `put`, `delete`). Collections
  return documents ordered by id; sort by meaning in the use case. Each area
  exports typed accessors from its `model.ts`. Never depend on insertion order.
- **Time** comes from `req.now` (the environment's clock), never `new Date()`.
- **Emails** are queued with `queueEmail(tx, now, { to, kind, link?, ... })`
  in the same transaction as the change. **Operator actions** are recorded
  with `recordAudit`. **Security events** with `recordSecurityEvent`.
- **Validation errors** are `invalid({ field: ['message'] })` (HTTP 400,
  `{ title, errors }`), field names matching the frontend's form controls;
  other problems use the helpers in `http/problems.ts`. Throw
  `fail(reply)` from deep in a use case to answer and roll back.
- **Wire types** come from the frontend: `import type { X } from
  '@contract/x.ts'` (one type per file in `frontend/projects/api/src/lib/models`).
- **Seed data is fictional and deterministic**: fixed ids, so `npm run seed`
  stays idempotent. Never real people, businesses or addresses.
- TypeScript runs through SWC with decorators and their metadata
  (`node --import @swc-node/register/esm-register`); there is no build output.
  Use `.ts` extensions in relative imports. Avoid enums.

## How a change is made (ATDD)

Follow the `implementing-incrementally` skill, one thin slice at a time:

1. Read the L2 requirement and the detailed design in `docs/detailed-designs/`.
2. Write the slice's Given/When/Then acceptance tests in
   `test/<area>/*.test.ts` against the HTTP API (name the L2 criterion).
3. Run them (`node --test test/<area>/<file>.test.ts`) and see them fail for
   the expected reason.
4. Implement just enough. Run `npm test` and `npm run typecheck`.
5. Commit. Next slice.

The frontend's Playwright suite is the end-to-end check. Run an area's specs
against this API with
`cd ../frontend && npx playwright test e2e/specs/<area>`.
Scenarios the specs ask for live in `src/testing/scenarios/<area>.ts`.
