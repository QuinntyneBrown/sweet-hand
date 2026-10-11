# 0008 — Acceptance tests run against the real backend in test mode

- Status: Accepted (supersedes the fake-backend parts of ADR 0004)
- Date: 2026-10-11

## Context

ADR 0004 ran the Playwright suite against a fake backend in `frontend/` because
no backend existed. The real backend now exists (ADR 0006). Acceptance tests
must fake the database and never run a real one (ADR 0007), and each test
needs isolated state, a fixed clock and named arrangements ("scenarios").

## Decision

- The Playwright suite runs against `backend/` started with `TEST_CONTROL=1`
  and no `DATABASE_URL`. The process refuses `TEST_CONTROL` together with a
  real database.
- In test mode every `x-test-session` header value gets its own environment:
  an in-memory database seeded with the fictional cast, a clock fixed at
  Saturday 10 October 2026 10:00 a.m. Toronto, and an in-memory media store.
  The listing keeps catalog order on that day so tests read like the mocks;
  every other day uses the production daily order.
- The test-control API lives under `/__test/` and exists only in test mode:
  `reset`, `scenario` (named arrangements from
  `backend/src/testing/scenarios/<area>.ts`), `sign-in` (a complete session
  for a cast member), `clock` and `state` (every collection, for assertions).
- Network faults (fail, delay, hang, drop) and the log of requests the
  browser sent are kept in the Playwright `backend` fixture, on the browser
  context's network, not in the backend. Tests still never call `page.route`
  themselves and never contain selectors.
- Specs assert on emails through `backend.emails()` and on the audit log
  through `backend.watchAudit()`, not on collection layouts.
- Providers that are still `<TO SUPPLY>` in the designs have local stand-ins
  behind ports, matching the frontend's: the bot-protection verifier accepts
  `local:<action>:<nonce>` tokens and the security-key verifier accepts
  `local-key:<nonce>` assertions. Emails are written to a transactional
  outbox; delivery to a provider is a separate dispatcher.

## Consequences

- One suite proves the frontend and the real backend together; backend rules
  are also covered by the backend's own API tests (`backend/test/`).
- Test-only code (`src/testing/`) ships in the backend but is unreachable
  unless the process is started in test mode with the in-memory database.
- Authenticator codes are real RFC 6238 codes: specs compute the code for the
  backend clock's current time.
