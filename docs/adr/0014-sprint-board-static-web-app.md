# 0014 — The sprint board is published to a Static Web App

- Status: Accepted; amends ADR 0013
- Date: 2026-10-13

## Context

ADR 0013 made the sprint board an internal Angular application beside the
product, generated from `docs/plans/launch-backlog.md`, with its state in the
browser and no deployment: `npm run start:board` on the founder's machine.
The board should be reachable from a phone and from any machine without a
checkout, showing the backlog as it is on `main`.

The product's delivery (ADR 0012) is far heavier than the board needs. The
board has no backend, no database and no personal data; the backlog it shows
is public in this repository.

## Decision

- The board is published to one Free-tier Azure Static Web App, created once
  in the Azure portal. It is public at the app's default hostname, with no
  password and no custom domain.
- `.github/workflows/deploy-board.yml` publishes it on every push to `main`
  (and on request): it regenerates `backlog.json` from that commit's backlog,
  builds the board and uploads `dist/board/browser` with the Static Web Apps
  deploy action. It does not wait for CI, because the board is not the
  product and a broken build fails the run itself; CI still lints and builds
  the board on every branch.
- The only configuration is the app's deployment token, stored as the
  repository secret `AZURE_STATIC_WEB_APPS_API_TOKEN_BOARD`. No Bicep, no
  Azure sign-in, no GitHub environment: the product's infrastructure code and
  its environments know nothing about the board.
- `projects/board/public/staticwebapp.config.json` sets the board's security
  headers (with `noindex`) and caching: hashed assets for a year, `index.html`
  and `backlog.json` not at all. Styles allow `unsafe-inline` because Angular
  injects component styles at runtime and Static Web Apps issues no nonces.
- Everything else in ADR 0013 holds: one source of stories, state in
  `localStorage` with Export and Import, no backend, no i18n, ATDD with
  Playwright.

## Consequences

- Merging a backlog change updates the board within a few minutes. The
  release process in `docs/operations/environments.md` does not apply to it.
- State is still per browser. The board on a phone and the board on a laptop
  are two boards until an export is imported.
- The Static Web App exists outside the Bicep templates. If it is deleted,
  create it again in the portal and replace the secret.
- The Free tier has no SLA, password protection or custom authentication. If
  the board ever needs a password or `board.sweethand.ca`, that is a change
  to the app's plan in the portal, not to this repository.
