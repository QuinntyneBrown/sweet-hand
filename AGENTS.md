## Project overview

Sweet Hand is a platform for discovering Caribbean home cooks and small-batch
food makers in Toronto and the Greater Toronto Area (GTA). People who cook at
home or at a small scale — doubles, roti, patties, jerk, oxtail, pepper sauce,
black cake, sorrel, and more — get a place to be found, and eaters get a way to
find them by dish, island tradition, neighbourhood, dietary need, and
availability.

The name comes from the Caribbean saying that someone has a "sweet hand": their
cooking is just that good.

## Repository layout

The repository is at an early stage. Record the layout here as it lands, and
keep it accurate:

- `docs/specs/` — L1/L2 requirements (`engineering-requirements` skill)
- `docs/specs/components/` — component requirements documents (CRDs), one
  `<component>.md` and `<component>.html` pair per component, tracing to L2
  (`writing-component-requirements-documents` skill)
- `docs/detailed-designs/` — detailed designs (`writing-software-design-documents` skill)
- `docs/mocks/` — static HTML design reference (`writing-html-mocks` skill)
- `docs/design-system/` — design system extracted from the mocks (`extracting-design-systems` skill)
- `docs/adr/` — architecture decisions; read relevant ADRs before changing the areas they cover
- `docs/videos/` — narrated walkthroughs (`creating-videos` skill)
- `frontend/` — Angular workspace (ADR 0001); see `frontend/README.md`
  - `frontend/projects/components/` — `sh-*` design-system component library,
    one folder per CRD under `src/lib/<component>/`
  - `frontend/projects/web/` — the product application: `core/` (API
    contracts, session, formatting, form helpers), `shell/` (header, footer,
    menus, system pages), `features/<area>/` (pages, routes, providers)
  - `frontend/fake-backend/` — in-memory implementation of the HTTP API for
    development and acceptance tests (ADR 0004)
  - `frontend/e2e/` — Playwright: `support/` (fixtures, cast, ports),
    `pages/` (page objects), `specs/<area>/`

See `README.md` and `frontend/README.md` for setup and development commands.

## Architecture

Record each stack decision as an ADR in `docs/adr/` and summarize it here.

Frontend (ADRs 0001–0005):

- Angular 21 (standalone components, signals, zoneless) in `frontend/`. The
  web app imports the component library from source as
  `@sweet-hand/components`. The library knows nothing about the API and holds
  no user-facing strings; pages pass every label in.
- Dependency direction: `features/<area>` → `core` → library. Pages depend on
  abstract API contracts in `core/api/` (each its own DI token), registered
  per area in `features/<area>/providers.ts`; `Http…` classes implement them.
- Frontend business rules (validation messages, eligibility, view models,
  URL state) live in plain TypeScript beside the page, never in templates or
  library components. The server remains the authority for every rule.
- Global CSS is the design system itself (`docs/design-system/tokens/tokens.css`
  and `assets/components.css`, ADR 0002); product code adds no global rules.
- Sessions are HttpOnly cookies set by the API; Angular sends the CSRF token
  from the `XSRF-TOKEN` cookie. Guards in `core/session/guards.ts` send
  visitors to sign in and show "No access" for the wrong role; they are a
  convenience, not security.
- All user-facing text is marked for Angular i18n (ADR 0005); lint fails on
  unmarked template text.
- The backend is not built yet. The fake backend implements the same HTTP
  contract, with wire types shared from `core/api/*.models.ts`.

These rules hold whatever the stack:

- Business rules live in the domain/application layer, not in controllers,
  route handlers, or UI components.
- Never apply database migrations implicitly on application startup; run them
  through an explicit command.
- Seed data is idempotent and safe to re-run. Seed makers, dishes, and reviews
  are clearly fictional — never real people, real businesses, or real addresses.
- Endpoints require authentication by default; anonymous access (public
  browsing of makers and dishes) is an explicit, deliberate choice.
- Maker-owned data (profile, menu, availability, orders, messages) is scoped to
  that maker. Never expose one maker's private data or one eater's data to
  another user.

## Domain rules

- **Protect maker privacy.** Makers cook from their homes. Never show a maker's
  exact home address publicly; show an approximate area (neighbourhood,
  municipality, or nearest intersection the maker chooses). Reveal precise
  pickup details only to the eater they apply to, and only when the maker
  chooses to.
- **Toronto and the GTA first.** Default to Canadian English (`en-CA`), Canadian
  dollars (CAD), the `America/Toronto` time zone, and Canadian postal codes.
  Location features cover Toronto and the surrounding GTA municipalities
  (e.g. Mississauga, Brampton, Vaughan, Markham, Richmond Hill, Pickering, Ajax,
  Oshawa, Oakville).
- **Respect the cuisines.** The Caribbean is many islands and traditions —
  Jamaican, Trinidadian and Tobagonian, Guyanese, Barbadian, Haitian, Grenadian,
  Vincentian, Lucian, and more. Do not flatten them into one generic
  "Caribbean" label when the maker gives a specific tradition, and spell dish
  names as the makers and their communities do.
- **Food safety and allergens are first-class.** Allergens and dietary tags
  (e.g. halal, ital/vegan, gluten-free, contains nuts, contains shellfish) are
  structured data, not free text buried in a description. Do not present the
  platform as certifying a maker's kitchen; surface whatever licensing or food
  handler information a maker provides as the maker's own statement.
- **Small scale is the point.** Makers cook in limited batches on their own
  schedule. Model availability, batch limits, pre-order cut-offs, and
  sold-out states rather than assuming always-on inventory.

## Frontend conventions

Detailed conventions are in `frontend/README.md`. In short:

- Library components follow their CRD's API and Markup exactly; wrapper hosts
  use `host: { style: 'display: contents' }`.
- Routes live in `features/<area>/routes.ts`; `data.mainClass` gives `<main>`
  the mock's classes, `data.chrome: 'minimal'` the wordmark-only header.
- Dates and times are always shown in `America/Toronto` through
  `core/format/format.ts`.
- Components preserve the mock design's class names and accessible state
  semantics; e2e locators depend on that parity.
- Keep component styles encapsulated and global styles limited to shared
  foundations and utilities.
- Read design tokens by role, never by hex value. The tokens come from the
  design system in `docs/design-system/`.
- API clients have a contract (interface/abstraction); pages depend on the
  contract, not the concrete implementation.
- No inline forms in pages. Button-triggered editing opens a dialog or
  navigates to a screen. Use the UI framework's accessible dialog/overlay
  primitives; don't hand-roll modals.
- Mobile first: most eaters will browse on a phone. Every screen must work at
  phone width without horizontal scrolling and respect device safe areas.
- Meet WCAG 2.2 AA.

## E2E architecture

- Visual regression baselines are updated only for intentional design changes.
  Record the snapshot policy in an ADR when visual coverage is added.

## Incremental Implementation and ATDD - mandatory

Mocks and the design system are design artifacts. ATDD does not apply to their
development. Do not write tests for mocks or the design system.

Every new feature or change to production behavior MUST have a requirement, a
detailed design, and a mock before implementation begins. This includes
behavioral changes to existing features, such as changing how a page behaves.
This requirement applies to production-code changes only; documentation-only,
design-system-only, mock-only, and test-only changes are out of scope unless
they are part of implementing a production behavior change.

Every production behavior implementation MUST invoke and follow the
`implementing-incrementally` skill (`.claude/skills/implementing-incrementally`
and `.agents/skills/implementing-incrementally`) before any code is written,
combined with acceptance test-driven development (ATDD). Plan small,
reviewable slices, then complete one slice at a time: write Given-When-Then
acceptance criteria, write the acceptance test, and run it to prove it fails for
the expected reason BEFORE writing production code. Implement only what satisfies
that slice, refactor with tests green, and run the relevant regression checks.
Do not move to the next slice until those checks pass. No bulk implementation,
no tests added afterward, and no weakening tests to manufacture a pass. Keep
the requirement, detailed design, mock, criteria, tests, and implementation
aligned until the entire feature or behavior change is complete.

Back end: integration tests against the API. Front end: Playwright, using the
Page Object Model - one page object per screen, owning the selectors and the
interactions. Tests state intent; page objects know the DOM. Never put a
selector in a test.

Run frontend tests in Chromium only. Do not configure or run Firefox, WebKit,
or any other browser for frontend testing.

### Never write architecture tests

Never add a test that asserts the shape of the codebase rather than its behavior:
no structure, layout, or naming tests; no banned-API scans; no traceability tests
that parse the specifications. Those constraints belong to the compiler, the
formatter, and review. A test suite exists to prove behavior.

## Skills

Project skills live in `.claude/skills/` and are mirrored in `.agents/skills/`
for other agents. Keep the two copies identical.

- `engineering-requirements` — L1/L2 requirements with acceptance criteria
- `writing-software-design-documents` — detailed designs from requirements
- `writing-html-mocks` — static HTML mocks for every page, dialog and
  notification in every state
- `extracting-design-systems` — design system from the HTML mocks
- `writing-component-requirements-documents` — CRDs for UI components
- `implementing-incrementally` — thin, verifiable slices (mandatory, see above)
- `creating-videos` — narrated walkthrough videos
