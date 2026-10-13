# 0014 — The sprint board is published to its own Static Web App

- Status: Accepted; amends ADR 0013
- Date: 2026-10-13

## Context

ADR 0013 made the sprint board an internal Angular application beside the
product, generated from `docs/plans/launch-backlog.md`, with its state in the
browser and no deployment: `npm run start:board` on the founder's machine.
The launch sprints are run from more than one place, so the board needs to be
reachable from a phone and from any machine without a checkout, and it should
show the backlog as it is on `main`, not as it was when a local serve started.

The product's delivery (ADR 0012) is heavier than the board needs: a shared
Bicep template with a database, a container app, a Key Vault and an email
service, three environments and tag-based promotion. The board has no backend,
no database and no personal data; the backlog it shows is public in this
repository.

## Decision

- The board gets its own Azure resource group, `rg-sweethand-board`, holding
  one Free-tier Static Web App, `swa-sweethand-board`, defined in
  `infra/board.bicep`. It is not part of `infra/main.bicep` and no product
  environment knows about it.
- `.github/workflows/deploy-board.yml` publishes the board on every push to
  `main` (and on request): it regenerates `backlog.json` from that commit's
  backlog, builds the board, applies `infra/board.bicep`, uploads
  `dist/board/browser` and checks that the site answers and serves the
  backlog it just built. It does not wait for CI, because the board is not
  the product and a broken build fails the run itself; CI still lints and
  builds the board on every branch.
- The workflow signs in with workload identity federation as its own deployer,
  `github-sweethand-board`, Contributor on `rg-sweethand-board` and nothing
  else, through the `board` GitHub environment. `infra/new-board.ps1` creates
  the resource group, the Static Web App, the deployer and the environment
  once, as a subscription Owner. No secret is stored in GitHub: the deployment
  token is read from Azure on each run.
- The board is served at the Static Web App's default hostname, with
  `noindex` and the same security headers as the launch site, except that
  styles allow `unsafe-inline` because Angular injects component styles at
  runtime and Static Web Apps issues no nonces. No custom hostname, no
  password: the Free tier offers neither, the backlog is already public, and
  the board's state never leaves the browser.
- Everything else in ADR 0013 holds: one source of stories, state in
  `localStorage` with Export and Import, no backend, no i18n, ATDD with
  Playwright.

## Consequences

- Merging a backlog change updates the board within a few minutes. The
  release process in `docs/operations/environments.md` does not apply to it.
- State is still per browser. The board on a phone and the board on a laptop
  are two boards until an export is imported.
- The Free tier costs nothing and has no SLA, custom authentication or
  staging environments. If the board ever needs a password or
  `board.sweethand.ca`, change the SKU to Standard in `infra/board.bicep`
  and add the hostname step from `deliver.yml`.
- `ci.yml` builds `infra/board.bicep` with the other templates.
