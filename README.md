<p align="center">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="assets/logo/sweet-hand-logo-dark.svg">
    <img alt="Sweet Hand" src="assets/logo/sweet-hand-logo-light.svg" width="440">
  </picture>
</p>

<p align="center">
  <strong>Find the Caribbean home cooks and small-batch food makers of Toronto and the GTA.</strong>
</p>

<p align="center">
  <a href="LICENSE"><img alt="License: MIT" src="https://img.shields.io/badge/license-MIT-b5381f.svg"></a>
  <img alt="Node.js 22.18+" src="https://img.shields.io/badge/node-%3E%3D22.18-141312.svg">
  <img alt="Angular 21" src="https://img.shields.io/badge/frontend-Angular%2021-141312.svg">
  <img alt="NestJS 11" src="https://img.shields.io/badge/backend-NestJS%2011-141312.svg">
  <a href="CONTRIBUTING.md"><img alt="PRs welcome" src="https://img.shields.io/badge/PRs-welcome-b5381f.svg"></a>
</p>

<p align="center">
  <a href="#about">About</a> ·
  <a href="#getting-started">Getting started</a> ·
  <a href="#repository-layout">Layout</a> ·
  <a href="#documentation">Documentation</a> ·
  <a href="#contributing">Contributing</a> ·
  <a href="#license">License</a>
</p>

---

## About

Sweet Hand is a platform for discovering Caribbean home cooks and small-batch
food makers in Toronto and the Greater Toronto Area. People who cook at home
or at a small scale (doubles, roti, patties, jerk, oxtail, pepper sauce, black
cake, sorrel and more) get a place to be found, and eaters get a way to find
them by dish, island tradition, neighbourhood, dietary need and availability.

The name comes from the Caribbean saying that someone has a "sweet hand": their
cooking is just that good.

### Principles

- **Maker privacy first.** Makers cook from their homes, so the platform shows
  an approximate area, never a home address. Precise pickup details go only to
  the eater they apply to, when the maker chooses.
- **Toronto and the GTA first.** Canadian English (`en-CA`), Canadian dollars,
  the `America/Toronto` time zone and Canadian postal codes by default.
- **Respect the cuisines.** Jamaican, Trinidadian and Tobagonian, Guyanese,
  Barbadian, Haitian, Grenadian, Vincentian, Lucian and more are kept distinct,
  and dishes are spelled the way their communities spell them.
- **Food safety is first-class.** Allergens and dietary tags are structured
  data. Licensing and food handler information is shown as the maker's own
  statement; the platform does not certify kitchens.
- **Small scale is the point.** Batch limits, pre-order cut-offs and sold-out
  states are modelled, not always-on inventory.
- **Mobile first and accessible.** Every screen works at phone width and meets
  WCAG 2.2 AA.

## Getting started

### Prerequisites

- [Node.js](https://nodejs.org/) 22.18 or newer, with npm
- PostgreSQL, only if you want to run the API against a real database
  (development and every automated test use an in-memory database)

### Run the app locally

```sh
git clone https://github.com/QuinntyneBrown/sweet-hand.git
cd sweet-hand

npm install --prefix backend
npm install --prefix frontend

cd frontend
npm start          # API on :4300 (in-memory, seeded) and the app on :4200
# or: npm run start:launch   # the pre-launch site on :4200 instead
```

Open <http://localhost:4200>. Every seeded account is fictional and uses the
password `pepperpot-sunday-2026`, for example `marcia.t@example.com`
(customer), `kendra@pelauhouse.example` (caterer) and
`leah@sweethand.example` (operator).

### Run the tests and checks

```sh
cd backend
npm test           # acceptance tests against the API (in-memory database)
npm run typecheck

cd ../frontend
npm run e2e        # Playwright acceptance suite (Chromium) against the backend in test mode
npm run build:launch  # prerendered launch site and its size check
npm run lint
npm run typecheck
```

### Run against PostgreSQL

Set `DATABASE_URL`, then apply migrations and the seed explicitly. Migrations
never run on startup, and the seed is safe to re-run.

```sh
cd backend
npm run migrate
npm run seed
npm start
```

See [`backend/README.md`](backend/README.md) for every environment variable and
[`frontend/README.md`](frontend/README.md) for frontend conventions and ports.

## Repository layout

```
sweet-hand/
├── backend/        HTTP API: NestJS 11 on Node.js, TypeScript through SWC
├── frontend/       Angular 21 workspace
│   ├── projects/components/   sh-* design-system component library
│   ├── projects/api/          @sweet-hand/api: backend services and wire models
│   ├── projects/sweet-hand/   the product application
│   ├── projects/launch/       the pre-launch site, served at / until launch day
│   └── e2e/                   Playwright acceptance suite (page objects)
├── docs/
│   ├── specs/                 L1/L2 requirements and component requirements
│   ├── detailed-designs/      detailed designs per feature
│   ├── mocks/                 static HTML mocks (open docs/mocks/index.html)
│   ├── design-system/         tokens, foundations and components
│   ├── adr/                   architecture decision records
│   ├── technical-debt/        technical-debt registers
│   ├── plans/                 plans for work not yet specified
│   ├── operations/            environments, release and hotfix process, Azure runbooks
│   ├── marketing/             print-ready flyer and stickers
│   ├── business-cards/        print-ready business cards
│   └── videos/                narrated demo videos of the launch app
├── tools/          video tooling: narration, screen recordings, MP4 builds
└── assets/         logo and shared imagery
```

## Architecture

| Area | Choice | Decision |
|---|---|---|
| Frontend | Angular 21: standalone components, signals, zoneless | [ADR 0001](docs/adr/0001-frontend-stack-angular.md) |
| Styling | The design system stylesheet is the only global CSS | [ADR 0002](docs/adr/0002-design-system-stylesheet-as-global-foundation.md) |
| API contracts | Abstract service classes as DI tokens, shared wire models | [ADR 0003](docs/adr/0003-frontend-api-contracts.md) |
| Text | All user-facing text externalised with Angular i18n | [ADR 0005](docs/adr/0005-externalised-text-with-angular-i18n.md) |
| Backend | NestJS on Node.js 22 with PostgreSQL | [ADR 0006](docs/adr/0006-backend-stack-nestjs-postgresql-drizzle.md), [ADR 0010](docs/adr/0010-backend-nestjs-structure-and-tooling.md) |
| Persistence | JSON document collections behind one port | [ADR 0008](docs/adr/0008-persistence-document-collections.md) |
| Testing | API tests in-process on an in-memory database; Playwright against the backend in test mode | [ADR 0007](docs/adr/0007-backend-tests-against-in-memory-repositories.md), [ADR 0009](docs/adr/0009-acceptance-tests-against-the-backend-in-test-mode.md) |
| Delivery | Azure; `main` to staging, release candidate tags to UAT, approved release tags to production | [ADR 0011](docs/adr/0011-azure-launch-hosting-and-delivery.md), [ADR 0012](docs/adr/0012-environments-and-release-promotion.md) |

The full index is in [`docs/adr/README.md`](docs/adr/README.md).

## Documentation

- **Requirements:** [`docs/specs/`](docs/specs/) (L1, L2 and component requirements)
- **Designs:** [`docs/detailed-designs/`](docs/detailed-designs/)
- **Mocks:** [`docs/mocks/`](docs/mocks/), open `docs/mocks/index.html` in a browser
- **Design system:** [`docs/design-system/`](docs/design-system/)
- **Decisions:** [`docs/adr/`](docs/adr/)
- **Plans:** [`docs/plans/`](docs/plans/), including the [public preview](docs/plans/public-preview.md)
- **Environments, releases and hotfixes:** [`docs/operations/environments.md`](docs/operations/environments.md)
- **Working agreements for contributors and coding agents:** [`AGENTS.md`](AGENTS.md)

## Contributing

Contributions are welcome. Sweet Hand works requirement first: every change to
production behaviour starts with a requirement, a detailed design and a mock,
and is built in small slices with acceptance tests written first. Read
[CONTRIBUTING.md](CONTRIBUTING.md) before opening a pull request.

- Report a bug or ask for a feature in [GitHub Issues](https://github.com/QuinntyneBrown/sweet-hand/issues).
- Get help with the project: see [SUPPORT.md](SUPPORT.md).
- Report a security vulnerability privately: see [SECURITY.md](SECURITY.md).

Everyone taking part is expected to follow the [Code of Conduct](CODE_OF_CONDUCT.md).

## License

Sweet Hand is released under the [MIT License](LICENSE).

All makers, dishes, reviews and accounts in the seed data are fictional. Any
resemblance to real people, businesses or addresses is coincidental.
