# Architecture decision records

One file per decision, numbered in the order they were made. Read the ones that
cover an area before changing it.

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-frontend-stack-angular.md) | Frontend stack: Angular workspace with a `sh-` component library | Accepted |
| [0002](0002-design-system-stylesheet-as-global-foundation.md) | The design-system stylesheet is the frontend's global foundation | Accepted |
| [0003](0003-frontend-api-contracts.md) | Pages depend on API contracts; HTTP clients implement them | Accepted |
| [0004](0004-e2e-tests-against-a-fake-backend.md) | Frontend acceptance tests run in Playwright against a fake backend | Superseded in part by 0009 |
| [0005](0005-externalised-text-with-angular-i18n.md) | User-facing text is externalised with Angular i18n | Accepted |
| [0006](0006-backend-stack-nestjs-postgresql-drizzle.md) | Backend stack: NestJS on Node.js, PostgreSQL through Drizzle ORM, S3-compatible object storage | Accepted |
| [0007](0007-backend-tests-against-in-memory-repositories.md) | Backend tests drive the API over HTTP against in-memory repositories | Accepted |
| [0008](0008-persistence-document-collections.md) | Persistence as implemented: document collections on PostgreSQL, faked in memory for tests | Accepted for the current code; conflicts with 0006 and 0007 (open) |
| [0009](0009-acceptance-tests-against-the-backend-in-test-mode.md) | Acceptance tests run against the real backend in test mode | Accepted |
| [0010](0010-backend-nestjs-structure-and-tooling.md) | NestJS application structure and tooling | Accepted |
| [0011](0011-azure-launch-hosting-and-delivery.md) | Azure launch hosting, providers and continuous delivery | Accepted; delivery trigger superseded by 0012 |
| [0012](0012-environments-and-release-promotion.md) | Staging, UAT and production environments with tag-based promotion and hotfixes | Accepted |
| [0013](0013-sprint-board-internal-tool.md) | The sprint board is an internal tool beside the product | Accepted; deployment amended by 0014 |
| [0014](0014-sprint-board-static-web-app.md) | The sprint board is published to its own Static Web App on every push to `main` | Accepted |
| [0015](0015-branded-html-emails.md) | Branded HTML emails are hand-written inline-CSS templates with a hosted logo | Accepted |
| [0016](0016-marketing-site-and-app-hostnames.md) | A static marketing site at `www.sweethand.ca`; the application moves to `app.sweethand.ca` | Accepted; amends 0011 and 0012 |
