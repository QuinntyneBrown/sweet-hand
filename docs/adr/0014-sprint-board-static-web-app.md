# 0014 — The sprint board is published to a Static Web App

- Status: Accepted; amends ADR 0013
- Date: 2026-10-13

## Context

ADR 0013 made the sprint board an internal Angular application beside the
product, generated from `docs/plans/launch-backlog.md`, with its state in the
browser and no deployment: `npm run start:board` on the founder's machine.
The board should be reachable from a phone and from any machine without a
checkout, showing the backlog as it is on `main`, and merging the change
that adds this must be all it takes.

The board has no backend, no database and no personal data; the backlog it
shows is public in this repository. It needs none of the product's delivery
(ADR 0012).

## Decision

- `.github/workflows/deploy-board.yml` publishes the board on every push to
  `main` (and on request): it regenerates `backlog.json` from that commit's
  backlog, builds the board and uploads `dist/board/browser` to a Free-tier
  Azure Static Web App, `swa-sweethand-board`.
- Nothing is set up by hand. The workflow signs in as the staging deployer
  that already exists (the `staging` GitHub environment, Contributor on
  `rg-sweethand-staging`), creates the app in that resource group the first
  time with the Azure CLI, and reads its deployment token on every run. The
  app is not in `infra/main.bicep`; the Bicep template keeps describing the
  product only.
- The board is public at the app's default hostname: no password, no
  sign-in, no custom domain and no extra headers. Its state never leaves the
  browser, and the backlog is already public.
- It does not wait for CI, because the board is not the product and a broken
  build fails the run itself; CI still lints and builds the board on every
  branch.
- Everything else in ADR 0013 holds: one source of stories, state in
  `localStorage` with Export and Import, no backend, no i18n, ATDD with
  Playwright.

## Consequences

- Merging a backlog change updates the board within a few minutes. Tags,
  approvals and the release process in `docs/operations/environments.md` do
  not apply to it.
- State is still per browser. The board on a phone and the board on a laptop
  are two boards until an export is imported.
- The app lives beside staging's resources and is created by the workflow,
  not by Bicep. Deleting the staging resource group deletes the board too;
  the next push to `main` creates it again.
- Azure allows ten Free static sites per subscription. The first run hit
  that limit; the workflow then names the command that lists them so one can
  be deleted and the run repeated.
- The Free tier has no SLA. If the board ever needs a password or
  `board.sweethand.ca`, that is a plan change on the app, not a change to the
  product's templates.
