# Sweet Hand frontend

Angular 21 workspace (ADR 0001) with three projects and the Playwright
acceptance suite. The API it talks to is `../backend`, a NestJS application (ADRs 0006–0009).

```
frontend/
  projects/components/   sh-* design-system components (docs/specs/components)
  projects/api/          @sweet-hand/api: backend services and wire models
  projects/sweet-hand/   the product application
  e2e/                   Playwright: support/, pages/ (page objects), specs/
```

## Commands

Run everything from `frontend/` (Node 22.18+), after `npm install` in both
`frontend/` and `../backend/`.

| Command | What it does |
|---|---|
| `npm install` | Install dependencies |
| `npm start` | The backend on :4300 (in-memory database seeded with the cast) and the dev server on :4200 (proxy in `proxy.conf.mjs`) |
| `npm run e2e` | Acceptance suite, Chromium only, against the backend in test mode (ADR 0008); starts both servers unless already running |
| `npm run lint` | ESLint, including the i18n rule (ADR 0005) |
| `npm run typecheck` | `tsc` for the API library, the app and the e2e suite |
| `npm run build` | Production build |
| `npm run extract-i18n` | Writes `projects/sweet-hand/src/locale/messages.xlf` |

Ports: set `E2E_WEB_PORT` and `E2E_API_PORT` to run a second checkout side by
side (`E2E_WEB_PORT=4210 E2E_API_PORT=4310 npx playwright test`).
`E2E_WORKERS=1` limits Playwright workers.

The Angular CLI sometimes keeps running after a failed compile. Wrap builds in a
timeout: `timeout 120 node_modules/.bin/ng build sweet-hand --configuration development < /dev/null`.

## How a change is made (AGENTS.md, ATDD)

Every production behaviour change goes slice by slice:

1. Read the L2 requirement, the detailed design (`docs/detailed-designs/`),
   the mock (`docs/mocks/`, every state) and the CRD of every component the
   slice touches (`docs/specs/components/`).
2. Write Given/When/Then acceptance criteria as Playwright tests in
   `e2e/specs/<area>/`, naming the L2 or CRD criterion in the test title.
3. Run them and see them fail for the expected reason.
4. Implement just enough: page, API contract, components, and the backend
   endpoint with its own API acceptance tests (`backend/README.md`).
5. Run the slice, then the whole suite, `npm run lint` and `npm run typecheck`.
6. Commit. Next slice.

Never weaken a test to make it pass, and never write architecture tests
(structure, naming, traceability). Tests prove behaviour only.

## E2E conventions (ADRs 0004, 0008)

- Import `test` and `expect` from `e2e/support/test`. Each test gets its own
  seeded backend environment (in-memory database, `x-test-session` header)
  and a browser clock fixed at Saturday 10 October 2026, 10:00 a.m. Toronto;
  the backend's clock starts at the same instant.
- **No selectors in tests.** One page object per screen in `e2e/pages/`
  (extending `BasePage`); shared overlays (header, menus, search) live in
  `e2e/pages/shell.ts`. Prefer roles and accessible names; fall back to the
  mocks' class names.
- Arrange state through the `backend` fixture:
  - `backend.signInAs('marcia')` (cast in `e2e/support/cast.ts`)
  - `backend.scenario('name', args)` — named state changes, defined in
    `backend/src/testing/scenarios/<area>.ts`
  - `backend.fail('GET /api/path*', { status, body, times, network, delayMs })`
  - `backend.hold('POST /api/path')` then `backend.release()` for busy states
  - `backend.requests()` (what the browser sent) and `backend.state()` (every
    collection of the test's database) to assert on effects
  - `backend.emails()` for the emails the platform queued, oldest first
  - `backend.setNow(iso)` to move the backend's clock; authenticator codes
    follow it (`operatorCodeAt(iso)` in `e2e/support/operator-code.ts`)
  - `const audit = await backend.watchAudit()` after arranging, then
    `await audit.appended()` for the audit entries the test's actions added
    (the log is seeded, so never assert on the whole `state().audit`)
- `page.clock.runFor(ms)` advances timers (polling, toasts).
- Call `expectNoAccessibilityViolations()` in the states a test covers (L2-066)
  and `usePhone()` for phone layouts.
- Seed data is the fictional cast in `docs/mocks/README.md`. Never use real
  people, businesses or addresses.

## Backend in test mode (ADR 0008)

- `server.ts` routes `/api/*` to handlers registered in `routes/index.ts`.
  Each area has `routes/<area>.ts` (`registerX` + `xScenarios`) and seed data
  in `seed/<area>.ts`; the store (`lib/store.ts`) holds one copy per test.
- Wire types live in `projects/api/src/lib/models/`, one type per file, and
  are imported by the fake with `import type`, so both sides share one
  contract. The real backend (ADR 0006) imports them the same way.
- Validation errors: `invalid({ field: ['message'] })` → HTTP 400 problem body
  `{ title, errors }`; field names match the form control names.
- `npm run e2e` starts `node ../backend/src/main.ts` with `TEST_CONTROL=1`:
  no database server, one seeded in-memory environment per test session, and
  the `/__test/` control API the fixture uses. Faults and the request log live
  in the fixture, on the browser context's network.
- Wire types live in `projects/api/src/lib/models/`, one type per file; the
  backend imports them with `import type`, so both sides share one contract.
- Validation errors are HTTP 400 problem bodies `{ title, errors }`; field
  names match the form control names.
- State-changing requests need the CSRF header; Angular's HttpClient adds it.

## Application conventions

- `projects/api/src/lib/services/`: `foo.service.ts` holds `abstract class
  FooService` (the contract and DI token) and `http-foo.service.ts` holds
  `HttpFooService extends FooService`. Export both from `src/public-api.ts`,
  register `{ provide: FooService, useClass: HttpFooService }` in
  `features/<area>/providers.ts`, and inject `FooService` in pages.
- One type per file (class, interface, type alias, enum), named in kebab case
  after the type. Components keep templates in `.html` and styles in `.css`;
  no inline `template` or `styles`.
- `features/<area>/routes.ts` holds the area's lazy routes; guard pages with
  `requireRole(...)` / `requireAdmin` from `core/session/guards.ts`.
  `data.mainClass` sets the classes of `<main>` from the mock; `data.chrome:
  'minimal'` shows the wordmark-only header.
- Business rules (validation, eligibility, view models) live in plain
  TypeScript beside the page, never in templates or library components.
- Dates, times and counts: `core/format/format.ts` (America/Toronto, en-CA:
  "Sat 21 Nov", "Saturday 21 November 2026", "9:42 a.m.").
- Problem bodies: `core/forms/problem.ts`; summary headings and shared
  messages: `core/forms/validation.ts`.
- Toasts: inject `ToastNotifier` from the library and call `show(...)`.

### i18n (ADR 0005)

- Every user-facing template string has `i18n="@@area.key"` (attributes:
  `i18n-label="@@area.key"`); TypeScript uses
  ``$localize`:@@area.key:Text` ``. Reuse an id only for the identical text.
- Plurals in templates use ICU; in TypeScript, pick between two messages.
- Data from the API (names, cuisines, captions, user text) is not marked.
- `npm run lint` fails on unmarked text. Non-text attributes that trip the rule
  go in `ignoreAttributes` in `eslint.config.js`.

## Component library rules

- One folder per CRD component: `projects/components/src/lib/<component>/`,
  selectors and inputs exactly as the CRD's API section, markup exactly as its
  Markup section (class names and ARIA are the e2e contract). Export from
  `src/public-api.ts`.
- Library components hold no user-facing strings; every label is an input.
- Wrapper hosts use `host: { style: 'display: contents' }`. **Do not** use an
  inline `styles`; styles go in the component's `.css` file.
- Template reference names must not shadow component members (`#title` next to
  a `title` input breaks compilation).
- Overlays: `sh-dialog` and `sh-sheet` render through `ModalLayer` (focus trap,
  inert page, Escape, focus return). Pass `returnFocus` when the opener will be
  gone.
- Chrome computes "Inbox , 1 unread" for a link whose badge and hidden text are
  non-inline boxes; give such links an explicit `aria-label`.
