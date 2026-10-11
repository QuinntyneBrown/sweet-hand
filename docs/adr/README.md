# Architecture decision records

One file per decision, numbered in the order they were made. Read the ones that
cover an area before changing it.

| ADR | Decision | Status |
|---|---|---|
| [0001](0001-frontend-stack-angular.md) | Frontend stack: Angular workspace with a `sh-` component library | Accepted |
| [0002](0002-design-system-stylesheet-as-global-foundation.md) | The design-system stylesheet is the frontend's global foundation | Accepted |
| [0003](0003-frontend-api-contracts.md) | Pages depend on API contracts; HTTP clients implement them | Accepted |
| [0004](0004-e2e-tests-against-a-fake-backend.md) | Frontend acceptance tests run in Playwright against a fake backend | Superseded in part by 0008 |
| [0005](0005-externalised-text-with-angular-i18n.md) | User-facing text is externalised with Angular i18n | Accepted |
| [0006](0006-backend-stack-nestjs-postgresql-drizzle.md) | Backend stack: NestJS on Node.js, PostgreSQL through Drizzle ORM, S3-compatible object storage | Accepted |
| [0007](0007-backend-tests-against-in-memory-repositories.md) | Backend tests drive the API over HTTP against in-memory repositories | Accepted |
| [0006](0006-backend-stack-node-typescript.md) | Backend stack: TypeScript on Node.js, no web framework | Accepted |
| [0007](0007-persistence-document-collections.md) | Persistence: document collections on PostgreSQL, faked in memory for tests | Accepted |
| [0008](0008-acceptance-tests-against-the-backend-in-test-mode.md) | Acceptance tests run against the real backend in test mode | Accepted |
