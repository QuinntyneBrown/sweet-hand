# 0013 — The sprint board is an internal tool beside the product

- Status: Accepted
- Date: 2026-10-12

## Context

The launch runs as four two-week sprints, planned in
`docs/plans/launch-backlog.md`. The founder needs a board to move stories
through To do, In progress, Review and Done, tick tasks, and see a burndown
for each sprint. A one-off page built for Sprint 1 proved the layout; it has
the stories pasted in by hand, so it drifts from the backlog.

The board is for the founder, not for makers or eaters. It is not part of
the product, holds no personal data and is not deployed. AGENTS.md asks every
production behaviour change for an L1/L2, a detailed design and a mock first.

## Decision

- A third Angular application, `frontend/projects/board/`, with no router, no
  backend and no server rendering. It doesn't import `@sweet-hand/components`
  or `@sweet-hand/api`. It reads the design-system tokens by role for colour
  and type.
- `docs/plans/launch-backlog.md` is the only source of stories.
  `frontend/scripts/backlog-to-board.mjs` turns it into
  `projects/board/public/backlog.json` (gitignored) before each serve, build
  and Playwright run. The app fetches that file at startup.
- Board state (each card's column, done date and task ticks, and the lane
  filter) lives in the browser's `localStorage`. Export and Import move it
  between browsers as JSON.
- The board is internal tooling, so it is outside the product's
  requirements, design and mock process: this ADR is its record, and the
  Sprint 1 page is its mock. It still follows ATDD: each slice starts with a
  failing Playwright spec (Chromium only, page object in
  `e2e/pages/board.page.ts`) against a fictional backlog fixture.
- Its text is not marked for i18n; it is not user-facing product.
- The board is never deployed. `npm run start:board` serves it locally.

## Consequences

- The backlog stays the single source of truth: renaming a story or moving it
  to another sprint in the markdown changes the board on the next start.
- State is per browser. Clearing site data loses it unless it was exported.
- CI lints and builds the board, and the Playwright `board` project runs with
  the rest of the suite.
- If the board ever needs to be shared or reached from a phone, that is a new
  decision: a backend store means endpoints, an admin-only policy and backend
  tests.
