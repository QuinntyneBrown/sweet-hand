# Environments, promotion and hotfixes

How a change travels from a developer's machine to `app.sweethand.ca`, and how an urgent fix
skips the queue without skipping the checks. ADR 0012 records the decision; L2-109 holds the
acceptance criteria. `azure-production.md` stays the production runbook.

## The four environments

| | Development | Staging | UAT | Production |
|---|---|---|---|---|
| Purpose | Build and test a change | See `main` running on Azure, every commit | Accept a release candidate before it ships | The real site |
| Address | `localhost` | `staging.sweethand.ca` | `uat.sweethand.ca` | `app.sweethand.ca` |
| Marketing page (`marketing/`, ADR 0016) | `node tools/marketing-server.mjs` | The marketing app's default hostname | The marketing app's default hostname | `www.sweethand.ca`, `sweethand.ca` |
| What runs there | Any branch | Every green commit on `main` | A tag `vX.Y.Z-rc.N` | A tag `vX.Y.Z` that passed UAT |
| How it gets there | `npm start` (README) | Automatically, `deploy-staging.yml` | Pushing the tag, `deploy-uat.yml` | Pushing the tag, then approval, `deploy.yml` |
| Who approves | Pull request review | Merging the pull request | Pushing the tag | A required reviewer of the `production` environment |
| Data | In-memory, the fictional cast | Its own database; test sign-ups only | Its own database; test sign-ups only | Real launch list |
| Access | Developer | Shared password | Shared password | Public |
| Email sender | Logged, not sent | `DoNotReply@…azurecomm.net` | `DoNotReply@…azurecomm.net` | `hello@sweethand.ca` |
| Azure resource group | none | `rg-sweethand-staging` | `rg-sweethand-uat` | `rg-sweethand-prod` |
| Database backups | none | 7 days, local | 7 days, local | 35 days, geo-redundant in Canada East |
| Monthly budget alert | none | CAD 60 | CAD 60 | CAD 100 |

The founder's sprint board is outside this table: it is internal tooling (ADR 0013) that
`deploy-board.yml` publishes to a public Free-tier Azure Static Web App on every push to
`main`, without tags, approvals, a database or Bicep (ADR 0014). The workflow signs in as
the staging deployer, creates `swa-sweethand-board` in `rg-sweethand-staging` the first time,
and prints the board's address on each run of **Actions → Deploy board**.

Development also covers the checks on every branch and pull request: `ci.yml` runs the backend
acceptance tests, Chromium Playwright tests, lint, type checks, builds, the i18n catalogue
check, the container scan, gitleaks and the Bicep build. CI changes no Azure resource.

Staging, UAT and production are the same Bicep template (`infra/main.bicep`) with different
parameters, each in its own resource group with its own PostgreSQL server, Key Vault, managed
identity, container registry, two Static Web Apps (the application and the marketing page) and GitHub deployer. No environment can read
another's data or secrets, and no production personal information is copied into staging or
UAT. Testers sign up with their own addresses. All three run in pre-launch mode, as production does.

## Promotion: one commit, three environments

```text
 feature branch ──PR + CI──▶ main ──auto──▶ STAGING
                                │
                     git tag v1.4.0-rc.1
                                ▼
                               UAT  ──accepted──▶ git tag v1.4.0 ──approval──▶ PRODUCTION
```

1. **Develop.** Branch from `main`, follow the ATDD rules in `AGENTS.md`, open a pull request.
   CI must be green and the pull request reviewed before it merges.
2. **Staging.** Every merge to `main` deploys to staging once CI passes on it. Staging is
   where `main` is seen running on Azure with a real database, real email and the real
   pipeline: migrations, the API image, the static site and the smoke checks. A red
   staging delivery blocks the next release until it is fixed on `main`. Because the site
   password covers every path, `/api` included, and the linked API refuses direct calls,
   the staging and UAT smoke checks confirm the API revision is `Healthy` and that the site
   redirects to its sign-in page; the full path checks run only in production.
3. **Release candidate to UAT.** When `main` holds what the next release should contain, tag
   the commit that staging is serving:

   ```sh
   git tag -a v1.4.0-rc.1 -m "Release candidate 1.4.0-rc.1" <commit>
   git push origin v1.4.0-rc.1
   ```

   `deploy-uat.yml` checks that CI passed on that commit and deploys it to UAT. UAT is the
   stable place for acceptance: the release checklist, manual accessibility audits such as
   L2-107.9, and anyone outside development trying it. It changes only when someone pushes
   a new candidate, so testing is not disturbed by every merge. If UAT finds a problem, fix it
   on `main` (it reaches staging), then tag `v1.4.0-rc.2`.
4. **Release to production.** Tag the accepted candidate's commit with the plain version and
   push it:

   ```sh
   git tag -a v1.4.0 -m "Release 1.4.0" v1.4.0-rc.2^{commit}
   git push origin v1.4.0
   ```

   `deploy.yml` refuses any commit that did not deploy successfully to UAT, then waits for a
   required reviewer to approve the `production` environment in GitHub. Production therefore
   runs byte-for-byte the source that was accepted. Write the release notes on the tag's
   GitHub release.

Every environment builds its API image from the same commit with locked dependencies, runs
the explicit migration job before the new API revision takes traffic, and restores the
previous API image if a smoke check fails (L2-108.3, L2-108.4).

### Versions

Releases use semantic versions: `vMAJOR.MINOR.PATCH`. Increase PATCH for a hotfix, MINOR for a
release with new behaviour, MAJOR when the product opens and pre-launch mode ends. Release
candidates add `-rc.N`, counting from 1 for each version. Tags are never moved or reused: a
second attempt is a new `rc` number.

## Hotfixes

A hotfix is an urgent production fix that cannot wait for the next release.

**When `main` has nothing unreleased** (the latest production tag is `main`'s head, or
everything after it is ready to ship), there is no separate path: merge the fix to `main`
through a pull request, let staging deploy it, then tag `vX.Y.Z+1-rc.1` and `vX.Y.Z+1` as
usual. The process takes as long as CI and a UAT check.

**When `main` holds unreleased work**, fix the release that is live instead:

1. Branch from the production tag, once per minor version:

   ```sh
   git switch -c release/v1.4 v1.4.0
   git push -u origin release/v1.4
   ```

2. Open a pull request from `hotfix/<short-name>` into `release/v1.4`. It needs the same green
   CI and review as any change; a hotfix is not a reason to skip the acceptance test.
3. After it merges and CI passes on `release/v1.4`, tag `v1.4.1-rc.1` on that commit. UAT
   deploys it; check the fix and the smoke paths.
4. Tag `v1.4.1` on the same commit. Production deploys after approval.
5. Bring the fix to `main` the same day with a pull request (cherry-pick, or merge
   `release/v1.4` into `main`), so the next release does not undo it. The hotfix is not closed
   until that pull request merges.

A hotfix skips staging, because staging follows `main`, but never skips CI, UAT or approval.
A hotfix shall not add a database migration that `main` does not also have in the same order.

## Database migrations

Each environment's migration job runs `npm run migrate` before its API image changes, so a
migration reaches staging, then UAT, then production in that order. Migrations are
forward-only and stay backward compatible with the image they replace, because a failed
smoke check restores the previous image against the migrated database. Split a breaking
schema change across two releases: add and backfill first, remove in a later release.

## Rollback

- **Automatic.** A failed migration stops a delivery before traffic changes; a failed
  smoke check restores the API image that was serving before the run.
- **To an earlier release.** In GitHub Actions, run *Deploy production* by hand and choose the
  earlier release tag under *Use workflow from*. The tag already passed UAT, so the gate
  admits it, and approval still applies. The database is not rolled back; see
  `azure-production.md` for point-in-time restore.
- **Staging and UAT.** Push a fix to `main`, or a new release candidate tag.

## Configuration per environment

| Setting | Where it lives | Staging and UAT | Production |
|---|---|---|---|
| `AZURE_CLIENT_ID`, `AZURE_TENANT_ID`, `AZURE_SUBSCRIPTION_ID` | GitHub environment variables | The environment's own deployer | `github-sweethand-production` |
| `POSTGRES_ADMIN_PASSWORD`, `IP_HASH_SECRET` | GitHub environment secrets | Generated by `infra/new-environment.ps1` | Existing |
| `SITE_PASSWORD` | GitHub environment secret | Generated; share with testers | Never set |
| `TURNSTILE_SITE_KEY` (variable), `TURNSTILE_SECRET` (secret) | GitHub environment | Optional; unset leaves the challenge off with a warning (L2-104.9) | As in `azure-production.md` |
| Bicep parameters | The caller workflow's `parameters` input | 7-day local backups, CAD 60 budget | Template defaults |

Every variable and secret is set on its GitHub environment, not on the repository, so a
delivery only ever sees its own environment's credentials. Production keeps its existing
values.

## Setting up staging and UAT

These steps need Quinn's Azure Owner, GitHub admin and Namecheap accounts. Each is done once.

1. **Create the environment in Azure and GitHub.** In an MFA Azure CLI session with the
   GitHub CLI signed in, from the repository root:

   ```powershell
   ./infra/new-environment.ps1 -Environment staging
   ./infra/new-environment.ps1 -Environment uat
   ```

   Each run creates the resource group, applies the foundation, applies `roles.bicep`, creates
   the `github-sweethand-<env>` deployer with a federated credential for
   `repo:QuinntyneBrown@1749159/sweet-hand@1413231887:environment:<env>` and Contributor on
   its resource group only, then creates the GitHub environment and sets its variables and
   secrets. It prints the CNAME target and the site password.
2. **Publish the DNS records** in Namecheap Advanced DNS, using the targets the script printed:

   | Type | Host | Value |
   |---|---|---|
   | CNAME | `staging` | the staging Static Web App's default hostname (`*.azurestaticapps.net`) |
   | CNAME | `uat` | the UAT Static Web App's default hostname |

   The next delivery adds the hostname to the Static Web App once the CNAME resolves.
3. **Restrict what each GitHub environment accepts** (Settings → Environments):
   - `staging`: deployment branches and tags → selected → branch `main`.
   - `uat`: deployment branches and tags → selected → tag `v*.*.*-rc.*`.
   - `production`: required reviewers → Quinn; deployment branches and tags → selected → tag
     `v*.*.*`. Remove any `main` branch rule.
4. **Protect release tags and branches** (Settings → Rules → Rulesets): a tag ruleset on
   `v*` that blocks deletion and update, and a branch ruleset on `release/*` that requires
   a pull request and the CI checks, like `main`.
5. **Optional bot challenge.** Add `staging.sweethand.ca` and `uat.sweethand.ca` to a
   Cloudflare Turnstile widget (or create a separate one) and set `TURNSTILE_SITE_KEY` and
   `TURNSTILE_SECRET` on each environment.

## Cost

Staging and UAT each cost about the same as production less the geo-redundant backup:
roughly CAD 70–110 a month each (see the estimate in `azure-production.md`), most of it the
container registry, the always-on API replica and PostgreSQL. To save money while there is
no one to run acceptance, UAT can be created later: until it exists, release candidate tags
fail at the UAT login and production stays unreachable, so create UAT before the first release.
