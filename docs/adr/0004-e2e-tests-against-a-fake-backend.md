# 0004 — Frontend acceptance tests run in Playwright against a fake backend

- Status: Accepted
- Date: 2026-10-10

## Context

AGENTS.md mandates ATDD with Playwright and the Page Object Model for the
frontend, Chromium only. The backend is not built, and the frontend must still
be fully tested.

## Decision

- `frontend/fake-backend/` is a small Node HTTP server (TypeScript run by
  Node's type stripping, no framework) that implements the HTTP contract of
  ADR 0003 with in-memory state seeded from the fictional cast in
  `docs/mocks/README.md`. It also serves the mock photos as `/media/…`.
- Each Playwright test gets its own isolated backend state: the test fixture
  sends an `x-fake-session` header on every browser request and the server
  keeps one store per header value.
- Tests arrange state and failures through the `backend` fixture, which talks
  to a control API under `/__fake/` (reset, seed variants, sign in as a cast
  member, fail or delay the next matching request). Tests never call
  `page.route` directly and never contain selectors.
- One page object per screen (`e2e/pages/`), one component object per shared
  overlay where several screens use it. Page objects own every locator and
  prefer roles and accessible names, falling back to the mocks' class names.
- The browser clock is fixed to Saturday 10 October 2026, 10:00
  `America/Toronto`, matching the mocks' cast; the fake backend uses the same
  date.
- Accessibility: page objects expose an axe-core check (WCAG 2.1 A/AA tags)
  that acceptance tests call for the states they cover (L2-066).
- Chromium only. No visual regression snapshots are recorded, so no snapshot
  policy is needed yet.

## Consequences

- The suite proves frontend behaviour end to end through real HTTP, but not
  the real backend's rules; backend integration tests cover those later.
- The fake backend must be kept in step with the API contract.
