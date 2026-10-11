# Sweet Hand

A platform for finding Caribbean caterers in Toronto and the GTA. Read
[AGENTS.md](AGENTS.md) before working in this repository.

## Documentation

- Requirements: `docs/specs/` (L1, L2, component requirements)
- Designs: `docs/detailed-designs/`, mocks in `docs/mocks/` (open `docs/mocks/index.html`),
  design system in `docs/design-system/`
- Decisions: `docs/adr/`

## Backend

The API is in `backend/`: NestJS on Node.js (ADRs 0006, 0010). Node 22.18 or
newer. ADR 0006 decides PostgreSQL through Drizzle ORM and S3-compatible
object storage; the code currently persists JSON document collections in
PostgreSQL instead (ADR 0008), a difference still to be reconciled.

```sh
cd backend
npm install
npm start          # API on :4300 with an in-memory database seeded with the cast
npm test           # acceptance tests against the API (in-memory database)
npm run typecheck
```

With PostgreSQL: set `DATABASE_URL`, then `npm run migrate`, `npm run seed`
and `npm start`. See `backend/README.md`.

## Frontend

The frontend is in `frontend/` and talks to the backend. Install both
(`npm install` in `backend/` and `frontend/`). Node 22.18 or newer.

```sh
cd frontend
npm install
npm start          # backend :4300 (in-memory) + app :4200
npm run e2e        # Playwright acceptance suite (Chromium) against the backend in test mode
npm run lint
npm run typecheck
```

Seeded accounts (all fictional) use the password `pepperpot-sunday-2026`, for
example `marcia.t@example.com` (customer), `kendra@pelauhouse.example`
(caterer) and `leah@sweethand.example` (operator). See `frontend/README.md`.
