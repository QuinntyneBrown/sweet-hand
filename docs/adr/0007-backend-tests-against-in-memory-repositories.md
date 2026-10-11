# 0007 — Backend tests drive the API over HTTP against in-memory repositories

- Status: Accepted
- Date: 2026-10-11

## Context

AGENTS.md requires integration tests against the API for the backend, ATDD
slice by slice, and no architecture tests. ADR 0006 puts all state in
PostgreSQL through Drizzle ORM. Slices must prove behaviour quickly and
without infrastructure. The frontend already separates contracts from
implementations (`abstract class FooService` / `HttpFooService`, ADR 0003).

## Decision

- Every persistence need has a repository port in the application layer: an
  abstract class such as `EnquiryRepository` in `enquiry.repository.ts`, which
  is also its NestJS dependency-injection token. The same pattern covers
  `SessionStore`, `RateLimitStore`, `JobQueue`, `ObjectStore`, `EmailGateway`,
  `MalwareScanner`, `BotChallengeVerifier` and `Clock`.
- Each port has two implementations: `InMemoryEnquiryRepository` for tests
  and `DrizzleEnquiryRepository` for production, registered by module
  (`{ provide: EnquiryRepository, useClass: ... }`). Handlers inject the
  abstract class, never an implementation.
- Every automated backend test bootstraps the NestJS application in-process
  (`Test.createTestingModule`, `app.init()`) with the in-memory
  implementations and drives it over HTTP against `app.getHttpServer()`,
  asserting on the status codes and bodies of the ADR 0003 contract. Tests
  never call handlers or repositories directly.
- No test starts PostgreSQL, object storage or any external service. In-memory
  fakes of external ports record calls so tests can assert, for example, that
  a notification job was enqueued.
- The test `Clock` is fixed to Saturday 10 October 2026, 10:00
  `America/Toronto`, and test data is the fictional cast in
  `docs/mocks/README.md`, matching ADR 0004.
- `frontend/fake-backend/` stays as it is: it serves the frontend's Playwright
  suite. The in-memory repositories serve the backend suite.

## Consequences

- `npm test` in `backend/` runs without containers or services, so each ATDD
  slice stays fast; AGENTS.md's "integration tests against the API" holds.
- `Drizzle…Repository` classes and migrations are not exercised by the
  automated suite; whether a scheduled or manual check runs them against
  PostgreSQL is `<TO SUPPLY>`.
