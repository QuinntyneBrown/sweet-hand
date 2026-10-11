# Frontend technical debt register

- Date: 2026-10-11
- Scope: everything under `frontend/` (the `sweet-hand` application, the
  `@sweet-hand/components` and `@sweet-hand/api` libraries, the fake backend,
  the Playwright suite and the tooling around them) plus the frontend-facing
  documents in `docs/` that the code claims to follow.
- Out of scope: anything that only a real backend can resolve (server-side
  rendering, real sessions, real rate limiting, backend integration tests),
  and anything that is a product decision rather than a code decision.

## How this register was built

Every item was measured against the checked-in code, not remembered:

| Check | Result |
|---|---|
| `npm run lint` | passes |
| `npm run typecheck` | passes |
| `ng build sweet-hand` (production) | passes, initial bundle 533 kB raw against a 600 kB warning budget |
| `ng build components`, `ng build api` | pass |
| `ng extract-i18n` | catalogue identical to the committed `messages.xlf` (2,228 units) |
| `npx prettier --check` | 576 files fail |
| `npm audit` | 0 vulnerabilities |
| `npm outdated` | Angular 22.2 is current; the workspace is on 21.2 |
| Unit tests (`*.spec.ts`) | 0 in the whole workspace |
| CI configuration | none in the repository |

Sizes: app 20.5k lines (214 `.ts`, 87 `.html`, 86 components), component
library 7.1k lines (103 components), API library 2.5k lines (16 contracts,
152 model files), fake backend 7.1k lines, e2e 18.2k lines (85 spec files,
653 tests, 79 page objects).

The codebase is disciplined in the places the conventions name (100 %
`OnPush`, zero decorator inputs, zero `any` in product TypeScript, zero inline
templates, zero raw colours in CSS, catalogue in sync). The debt is almost
entirely **repetition without a shared abstraction**, **string literals with
no single source**, **gaps between the written contracts (ADRs, CRDs, README)
and the code**, and **safety nets that are declared but not enforced**.

## How to read an item

Each item has an identifier (`T-nn`), an area, a severity and an effort.

- Severity: **High** means it already causes wrong behaviour, hides defects, or
  makes every future change slower. **Medium** means it costs time on every
  change in its area. **Low** means it is an inconsistency that will bite once.
- Effort: **S** under a day, **M** a few days, **L** a week or more.

Every item ends with a resolution strategy that removes the debt in its
entirety, and a "done when" that can be checked. Refactors that keep behaviour
unchanged are covered by the existing acceptance suite and need no new
requirement. Anything that changes production behaviour (marked **behaviour
change**) goes through the `implementing-incrementally` skill and ATDD as
AGENTS.md requires: criterion, failing acceptance test, then code.

## Index

| ID | Item | Area | Severity | Effort |
|---|---|---|---|---|
| T-01 | No continuous integration | Tooling | High | S |
| T-02 | Prettier configured but never run or enforced | Tooling | Medium | S |
| T-03 | Lint covers only `projects/**`; e2e and fake backend are unlinted | Tooling | Medium | S |
| T-04 | Accessibility and `any` lint rules switched off; 170-entry i18n ignore list | Tooling | Medium | M |
| T-05 | No unit-test runner for pure logic | Tooling | High | M |
| T-06 | Typecheck skips the component library's own tsconfig | Tooling | Low | S |
| T-07 | Angular 21 and pinned Playwright behind current releases | Tooling | Medium | M |
| T-08 | Libraries are not publishable packages | Tooling | Low | S |
| T-09 | Initial bundle close to its budget with no per-route tracking | Tooling | Low | S |
| T-10 | ~~Dialog lifecycle boilerplate copied into 28 dialogs~~ **Fixed** | App | High | L |
| T-11 | ~~Problem-body to error-summary mapping hand-written in 12 files~~ **Fixed** | App | High | M |
| T-12 | HTTP status branching repeated per page | App | Medium | M |
| T-13 | Two form styles, manual validation, scattered rule files | App | Medium | L |
| T-14 | Focus management hand-rolled per page | App | Medium | M |
| T-15 | Five independent 60-second pollers | App | Medium | M |
| T-16 | Two `Connectivity` services | App | Low | S |
| T-17 | ~~Route paths, titles and role landing pages as scattered literals~~ **Fixed** | App | High | M |
| T-18 | Every feature's routes and providers loaded eagerly; order-dependent flat route list | App | Medium | M |
| T-19 | `requireAdmin` unused; admin pages rely on runtime 403 | App | Medium | S |
| T-20 | ~~Operator sign-out always lands on `/caterers`~~ **Fixed** | App | High | S |
| T-21 | Session bootstrap swallows failures; privacy redirect lives in a service | App | Medium | M |
| T-22 | Effects used for state synchronisation (36 writes inside `effect`) | App | Medium | M |
| T-23 | Three god components (`photos`, `overview`, `enquiry-form-dialog`) | App | Medium | L |
| T-24 | Business rules and `$any()` in templates | App | Medium | M |
| T-25 | 83 inline `style=""` attributes, 26 with raw values | App | Medium | M |
| T-26 | Browser storage keys and shapes with no registry | App | Low | S |
| T-27 | File naming split three ways; trivial type files; inverted import | App | Low | M |
| T-28 | Dead exports and an empty `reviewsRoutes` | App | Low | S |
| T-29 | Download and external-link hacks through the DOM | App | Low | S |
| T-30 | 240 i18n ids declared in more than one place; inconsistent id scheme | i18n | High | M |
| T-31 | Locale-specific punctuation built inside the component library | i18n | Low | S |
| T-32 | 13 CRDs with no component; 34 CRD selectors missing | Library | High | L |
| T-33 | Hand-rolled overlay, focus and keyboard code instead of CDK | Library | High | L |
| T-34 | Id generation copy-pasted in 17 components | Library | Low | S |
| T-35 | Business rules and multi-export files inside the library | Library | Medium | M |
| T-36 | Inconsistent input naming across 103 components | Library | Medium | L |
| T-37 | Library accessibility gaps against its CRDs | Library | Medium | M |
| T-38 | Components the product never uses | Library | Low | S |
| T-39 | Stale library and CRD documentation | Library | Low | S |
| T-40 | Endpoint URLs typed in three places with no shared source | API | High | M |
| T-41 | Four idioms for query parameters; URL encoding inlined 45 times | API | Medium | S |
| T-42 | Inconsistent service conventions and inline types | API | Medium | M |
| T-43 | Duplicate and drifting model types | API | Medium | M |
| T-44 | Wire vocabulary changed in transit (`Held` to `held`) | API | Low | S |
| T-45 | Route modules of 600 to 1,200 lines with scenarios and fixtures inside | Fake | Medium | L |
| T-46 | Auth, pagination and body typing repeated per handler | Fake | Medium | M |
| T-47 | Stores never evicted; every test seeds twice | Fake | Medium | S |
| T-48 | Held requests never time out; `/__fake/state` leaks everything | Fake | Low | S |
| T-49 | Frozen clock and 230 absolute 2026 dates | Fake | Medium | M |
| T-50 | Types defined in seed and route files; dead exports | Fake | Low | M |
| T-51 | Hard-coded ports and cookie names in five places | Fake | Low | S |
| T-52 | Selectors leak into 45 of 85 spec files | E2E | High | L |
| T-53 | 1,643 literal-copy assertions | E2E | Medium | M |
| T-54 | Sign-in and scenario arrangement inlined 349 times; scenario names untyped | E2E | Medium | M |
| T-55 | Browser clock and backend clock set separately and diverge | E2E | Medium | S |
| T-56 | Ambiguous locators resolved with `.first()`, `.nth()`, `.last()` | E2E | Medium | M |
| T-57 | Page-object duplication and no shared form, dialog or list objects | E2E | Medium | M |
| T-58 | Axe runs WCAG 2.1 tags; AGENTS.md requires WCAG 2.2 AA | E2E | High | S |
| T-59 | Phone coverage at 8 % of tests with two different phone widths | E2E | Medium | M |
| T-60 | L2-062 and L2-087 untested; 31 % of titles cite no criterion | E2E | Medium | M |
| T-61 | Specs assert on the fake backend's store shape through `any` | E2E | Medium | M |
| T-62 | `profile-api.spec.ts` tests the fake, not the product | E2E | Low | S |
| T-63 | No retries, screenshots or video; two hand-rolled browser contexts | E2E | Low | S |
| T-64 | No visual regression coverage and no snapshot policy | E2E | Low | M |
| T-65 | Documentation drift between AGENTS.md, READMEs, ADRs and code | Docs | Medium | S |

---

## A. Tooling, build and delivery

### T-01 No continuous integration — High, S

**Evidence.** No `.github/workflows`, no other CI configuration. Every
`process.env['CI']` branch in `playwright.config.ts` is dead. Lint, typecheck,
build and the 653 acceptance tests run only when a contributor remembers.

**Why it matters.** Every other safety net in this register depends on
something running it. The ATDD rule in AGENTS.md cannot be enforced without a
gate.

**Resolution.**
1. Add one workflow that runs on every push and pull request: `npm ci`,
   `npm run lint`, `npm run typecheck`, `npm run build`, `npm run e2e` with
   `E2E_WORKERS=4`, and `npx prettier --check` once T-02 lands.
2. Cache `~/.npm` and the Playwright Chromium download; upload the Playwright
   HTML report and traces as artifacts on failure.
3. Make the workflow a required check on the default branch.
4. Add an `ng extract-i18n` step that fails when `messages.xlf` would change,
   so the catalogue cannot drift (it is in sync today only by discipline).

**Done when** a pull request cannot merge with red lint, types, build, i18n
catalogue or acceptance tests.

### T-02 Prettier configured but never run or enforced — Medium, S

**Evidence.** `.prettierrc` sets `printWidth: 100`; `npx prettier --check`
fails on 576 files; there is no `format` script and lint does not include
Prettier. Many files use 160-plus character lines.

**Resolution.**
1. Decide the width once (the code is written at roughly 160; the config says
   100). Update `.prettierrc` to the chosen width.
2. Run `prettier --write` across `projects/`, `e2e/`, `fake-backend/` in a
   single formatting-only commit, with `.git-blame-ignore-revs` pointing at it.
3. Add `"format": "prettier --write ."` and `"format:check"` scripts; run the
   check in CI (T-01) and as a pre-commit hook via `lint-staged`.

**Done when** `npm run format:check` passes in CI and there is no formatting
noise in diffs.

### T-03 Lint covers only `projects/**` — Medium, S

**Evidence.** `eslint.config.js` has file patterns only for `projects/**`;
`e2e/` (18k lines) and `fake-backend/` (7k lines) get no rules. `npm run lint`
runs `ng lint sweet-hand`, whose `lintFilePatterns` list the three projects
only.

**Resolution.**
1. Add a `files: ['e2e/**/*.ts', 'fake-backend/**/*.ts']` block with
   `tseslint.configs.recommendedTypeChecked` and `eslint-plugin-playwright`
   for `e2e/` (its `no-raw-locators`, `no-nth-methods`, `no-force-option`,
   `no-conditional-in-test` rules directly target T-52, T-56 and T-63).
2. Run `eslint .` from the root rather than through the Angular builder so one
   command covers everything.

**Done when** `npm run lint` reports on every TypeScript file in `frontend/`.

### T-04 Accessibility and `any` lint rules switched off — Medium, M

**Evidence.** `eslint.config.js` turns off `no-explicit-any` for every
project, `template/no-autofocus` for all templates, and
`interactive-supports-focus` and `click-events-have-key-events` for the whole
library. The `template/i18n` rule carries an `ignoreAttributes` list of about
170 names including generic ones (`value`, `width`, `count`, `label`-like
inputs), which weakens the "lint fails on unmarked text" guarantee in ADR 0005.

**Resolution.**
1. Turn `no-explicit-any` back on with `error`. Product code already has zero
   `any`; fix the 20 in the fake backend (T-46) and 4 in e2e (T-61).
2. Replace the three blanket accessibility exemptions with per-line
   `eslint-disable-next-line` comments on the handful of composite widgets that
   legitimately handle keys on a container (combobox listbox, menu). Keep
   `no-autofocus` on and allow it only in `sh-dialog`, `sh-sheet` and
   `sh-popover`.
3. Shrink `ignoreAttributes` to attributes that are provably never user
   text. Most entries are library input names; give those inputs a
   non-string type or an `i18n-` convention and drop them from the list.
4. Enable `noUncheckedIndexedAccess` in `tsconfig.json` and fix the resulting
   errors (mostly the `e[f]!` idiom removed by T-11).

**Done when** no rule is disabled at file-pattern scope except with a comment
that names the CRD clause that requires it.

### T-05 No unit-test runner for pure logic — High, M

**Evidence.** Zero `*.spec.ts`. `angular.json` has no `test` target for any
project. The library README still advertises `ng test` with Karma. Pure
functions with real logic (`shell/navigation.ts`, `core/forms/validation.ts`,
every `*-rules.ts` and `*-view.ts`, `pagination-arrangement.ts`, `foldText`,
`graphemeLength`, `markCurrent`, `safeReturnUrl`) are tested only indirectly
through 30-second Playwright runs, or not at all.

AGENTS.md mandates acceptance tests and forbids architecture tests; it does
not forbid unit tests of behaviour, and the acceptance suite cannot cheaply
reach edge cases in pure functions.

**Resolution.**
1. Add the Angular CLI's Vitest builder (`@angular/build:unit-test`) as the
   `test` target of all three projects; it runs in jsdom without a browser.
2. Write behaviour tests for the pure modules listed above first; each one is
   a plain function with inputs and outputs. Keep component tests out of
   scope: Playwright already covers components through the product.
3. Run `ng test` in CI (T-01).

**Done when** every `*-rules.ts`, `*-view.ts`, `core/**` and library helper
module has a spec and the suite runs in under a minute.

### T-06 Typecheck skips the component library's own tsconfig — Low, S

**Evidence.** `npm run typecheck` runs `tsc` for the API library, the app, e2e
and the fake backend. `projects/components/tsconfig.lib.json` is referenced
from the root `tsconfig.json` but never checked on its own; a library file the
app does not import would never be compiled.

**Resolution.** Add `tsc -p projects/components/tsconfig.lib.json --noEmit` to
the script, or replace the chain with `tsc -b` using the root project
references.

**Done when** every tsconfig in the workspace is part of `npm run typecheck`.

### T-07 Angular 21 and pinned Playwright behind current releases — Medium, M

**Evidence.** Angular, CLI and CDK 22.2 are current; the workspace is on 21.2.
`@playwright/test` is pinned to 1.56.1 with an `overrides` entry while 1.64 is
current; `angular-eslint`, `eslint`, `typescript` and `@types/node` each have a
major release available.

**Resolution.**
1. Run `ng update @angular/core@22 @angular/cli@22 @angular/cdk@22` on a branch
   and let the schematics apply; fix any template type errors; run the full
   suite.
2. Remove the Playwright pin and override once the reason for it is
   recorded (if it exists to match a preinstalled browser, document that in
   `frontend/README.md`; otherwise lift it).
3. Add Renovate or Dependabot with a monthly cadence so the gap never reopens.

**Done when** `npm outdated` shows no major-version gaps and an update bot
owns the cadence.

### T-08 Libraries are not publishable packages — Low, S

**Evidence.** `projects/components/package.json` is named `components` and
lists only `@angular/common` and `@angular/core` as peers, although the library
imports `@angular/cdk` (overlay), `@angular/router` (20 files) and
`@angular/forms` (5 files). `ng-package.json` ships no stylesheet, so a
consumer outside this repository would render unstyled (see T-32 for the
styling model). Both libraries are `0.0.1` and the app imports them from
source, so this is harmless today.

**Resolution.** Either declare the libraries internal (delete the `build`
targets and `ng-package.json`, keep the path aliases) or make them real:
rename to `@sweet-hand/components` and `@sweet-hand/api`, list every peer,
and ship `tokens.css` plus `components.css` as package assets. Internal is the
honest choice until a second consumer exists.

**Done when** the package manifests match how the libraries are actually
consumed.

### T-09 Initial bundle close to its budget — Low, S

**Evidence.** Production initial total is 533 kB raw (133 kB transferred);
the warning budget is 600 kB. The two largest initial chunks are 175 kB and
121 kB of shared code pulled in by the eager route and provider imports
(T-18). Nothing tracks per-route size over time.

**Resolution.** Land T-18 first, then lower the warning budget to the new
baseline plus 10 % so growth is noticed. Add `--stats-json` to the CI build
and keep the stats artifact for comparison.

**Done when** the budget sits just above the measured baseline and CI reports
the initial size on every build.

---

## B. Application (`projects/sweet-hand`)

### T-10 Dialog lifecycle boilerplate copied into 28 dialogs — High, L — Fixed

**Status. Fixed** on 2026-10-11. `core/forms/form-dialog-state.ts` holds
`attempt`, `busy`, `failed` and `errors`, the one open-reset `effect`, and
`open()`, `validate()`, `reject()` and `submit()`. `submit()` hands each failed
request's status and problem to the dialog's handler, the hook T-11's
`applyProblem` plugs into. Every dialog in `features/` now creates one
`FormDialogState` and declares only its own fields (through the `reset`
option) and its own submit; `search-dialog` and `report-dialog` use it too, and
`listing-filters-sheet` starts each opening from a `linkedSignal` instead of an
effect. `overview/submit-dialog` still takes `busy` and `failed` as inputs: it
is presentational and the overview page owns that state. The evidence below is
kept as the record of what was removed.

**Evidence.** 31 dialogs each declare `open = input(...)`, `closed = output()`,
`attempt`, `busy`, `failed` signals, and 27 of them repeat the same
constructor `effect(() => { if (!this.open()) return; untracked(() => {
reset form; clear errors; failed.set(false); attempt.set(0) }) })`. See
`features/operator/cuisines/add-cuisine.dialog.ts`,
`features/account/edit-details/edit-details.dialog.ts`,
`features/dashboard/menu/dish.dialog.ts`.

**Why it matters.** Every new dialog is 40 lines of ceremony before its first
field, and a fix to the reset sequence has to be made 28 times.

**Resolution.**
1. Introduce a `FormDialogState` class in `core/forms/` holding `attempt`,
   `busy`, `failed`, `errors`, an `open()` method that performs the reset, and
   a `submit(action)` helper that increments the attempt, sets busy, runs the
   action, and maps a thrown problem through T-11. It is a plain class created
   with `new`, not a service, so it needs no injection context.
2. Convert dialogs one feature at a time, running that feature's specs after
   each conversion. Each dialog ends up declaring only its form and its
   feature-specific submit.
3. Delete the `effect` reset pattern as each dialog converts; the `open` input
   calls `state.open()` from a single `effect` inside `FormDialogState`.

**Done when** no dialog in `features/` declares `attempt`, `busy` or `failed`
itself, and the effect pattern appears once in `core/forms/`.

### T-11 Problem-body to error-summary mapping hand-written in 12 files — High, M — Fixed

**Status. Fixed** on 2026-10-11. `core/forms/problem.ts` is the only module
that reads `problem.errors`: `hasFieldErrors`, `fieldError` (a field's first
message, trying several wire names in turn), `fieldErrors` (one message or null
per form field, with a map for fields the API spells differently, such as the
certificate's `expires` and the enquiry form's `eventDate`) and
`applyProblem(state, status, problem, fields)`, which a `FormDialogState`
submit handler returns to show the server's field errors through `reject`.
`summaryFrom(errors, controls)` in `core/forms/validation.ts` builds the error
summary from a list of fields or a field-to-control-id map; every hand-written
summary over several fields uses it, and the non-null assertions it needed are
gone. `enquiry-rules.ts` keeps only the wire names (`SERVER_FIELD`);
`serverErrors` is removed. The `summaryHeading` calls are unchanged. The
evidence below is kept as the record of what was removed.

**Evidence.** `core/forms/problem.ts` parses the body but never maps `errors`
to control ids. The idiom `FIELDS.filter((f) => e[f]).map((f) => ({ controlId:
f, message: e[f]! }))` appears in 8 files and a second variant with
`.filter(Boolean) as SummaryItem[]` in 5. `summaryHeading(` is called 22 times
with the same shape. The 9 non-null assertions in the app are all this idiom.

**Resolution.** Add `summaryFrom(errors, fields)` and `applyProblem(form,
problem)` to `core/forms/problem.ts`, typed over the form's field union so the
assertion disappears. Replace every copy. Pair with T-10 so the dialog state
calls it automatically.

**Done when** `problem.errors` is read in exactly one module.

### T-12 HTTP status branching repeated per page — Medium, M

**Evidence.** `status === 409` in 10 places, `404` in 6, `403` in 3, `429` in
3. The admin-only 403 fallback is copied verbatim in `operators.page.ts` and
`audit.page.ts`. `Retry-After` is parsed only in `forgot-password.page.ts`.

**Resolution.** Extend `core/forms/problem.ts` with a typed `Outcome`
discriminated union (`conflict`, `gone`, `forbidden`, `rateLimited(retryAfter)`,
`invalid(errors)`, `failed`) returned by one `outcomeOf(error)` function, and
have pages switch on it. Move the admin 403 case into the guard (T-19).

**Done when** no page compares `status ===` to a number.

### T-13 Two form styles, manual validation, scattered rule files — Medium, L

**Evidence.** Identity and account dialogs use reactive `FormGroup`; `dish`,
`cuisines`, `events` and `operator-edit` use a signal per field. Neither uses
Angular validators; each runs its own rule function on submit, gates
`aria-invalid` on a hand-counted `attempt` (49 occurrences of
`attempt.update((n) => n + 1)`). Rules live in `core/forms/validation.ts`
(2 functions), `identity/rules.ts` (reused by `account`), and six per-feature
`*-rules.ts` with three different error shapes (`Errors`, `Partial<Record>`,
`FieldErrors`). Error-summary `controlId` strings must match ids typed
separately in templates.

**Resolution.**
1. Choose reactive forms as the single style (the library's `sh-form-field`
   already binds `formControlName`), with Angular's signal-forms API as the
   target once it is stable in the installed major.
2. Express each rule once as a `ValidatorFn` in `core/forms/rules/`
   (name, password, phone, postal, length) and compose per form. Move
   `identity/rules.ts` there.
3. Derive `aria-invalid`, the summary and the heading from the form's state
   through the `FormDialogState` of T-10 so `attempt` is counted once.
4. Generate control ids from the form group path so the summary and the
   template cannot disagree.

**Done when** there is one error shape, one rule module, and no page
declares a signal per field.

### T-14 Focus management hand-rolled per page — Medium, M

**Evidence.** `opener.set(event.currentTarget as HTMLElement)` in 9 places,
`document.activeElement as HTMLElement | null` in 4, `document.getElementById
('<x>-title')` in 3, `afterNextRender(() => el.nativeElement.focus())` in 21.
`dashboard/reviews/reviews.page.ts` and `enquiries/shared/enquiry-thread.ts`
find targets with CSS `querySelector` chains in TypeScript.

**Resolution.** Give `ModalLayer` (library) ownership of "return focus to the
opener" by default, remove the `returnFocus` plumbing from pages except where
the opener disappears, and add a `focusAfterRender(elementRef)` helper in
`core/` for the "move focus to the new section" cases. Replace `querySelector`
targets with `viewChild` references.

**Done when** `document.activeElement`, `getElementById` and `querySelector`
appear nowhere in `features/`.

### T-15 Five independent 60-second pollers — Medium, M

**Evidence.** `core/session/session.ts`, `account/site-banner/site-banner.ts`,
`enquiries/shared/enquiry-thread.ts`, `operator/moderation/queue/queue.page.ts`
and `dashboard/photos/photos.page.ts` each run their own `setInterval`. On the
operator queue three timers fire together; none pauses when the tab is hidden.

**Resolution.** One `Poller` service in `core/` exposes `every(ms, fn)` tied to
`DestroyRef`, pauses on `visibilitychange`, and resumes immediately when the
tab returns. Session refresh becomes the only global subscriber; pages
subscribe to it for counts rather than calling `session.refresh()` themselves.

**Done when** `setInterval` appears only in the `Poller`.

### T-16 Two `Connectivity` services — Low, S

**Evidence.** `discovery/caterer/connectivity.ts` (component-provided, with a
back-online pulse) and `discovery/listing/connectivity.ts` (root-provided)
both wrap `navigator.onLine` with different APIs.

**Resolution.** Keep one root-provided `Connectivity` in `core/`, expose
`online` and `backOnline` signals, delete the other.

### T-17 Route paths, titles and role landing pages as scattered literals — High, M — Fixed

**Status. Fixed** on 2026-10-11. `core/routing/paths.ts` holds every app
address as typed builders (`paths.caterer(slug)`, `paths.admin.queue`, …),
`landingFor(role)`, `homeFor(role)` and `catererSlugOf(url)`. Guards, the
shell, pages and dialogs navigate through it, templates read it through a
`paths` field, and `enquiry-draft-store` no longer parses return URLs with its
own regex. `PageTitleStrategy` (registered in `app.config.ts`) adds the site's
name through `documentTitle()`, so route titles are the page name only; `/join`
opts out with `data: { titleSuffix: false }` because its title already names
Sweet Hand, and the caterer page uses `documentTitle()` for the titles it sets
itself. Container pages use `page()` (`core/routing/page.ts`) and system pages
and the per-area not-found routes use `system()` (`shell/system-route.ts`).
Outside `paths.ts` and the `routes.ts` files the only `/`-prefixed strings left
are `/media/` image addresses, which are not routes. The evidence below is kept
as the record of what was removed.

**Evidence.** `routerLink="/admin/queue"` 17 times, `"/caterers"` 16,
`"/dashboard"` 13, `"/sign-in"` 8, plus about 20 `navigate([...])` literals.
The role-to-home mapping is written three times (`guards.ts` `landingFor`,
`navigation.ts` `homeHref`, `app.ts` sign-out). `/privacy/accept` is typed in
`session.ts` and `identity/routes.ts`. The ` · Sweet Hand` title suffix is
typed 47 times, `data: { mainClass: 'container' }` 22 times, the `'**'`
not-found child route 3 times. `core/enquiry/enquiry-draft-store.ts` parses
return URLs with a regex that hard-codes `/caterers/`.

**Resolution.**
1. Create `core/routing/paths.ts` exporting typed path builders
   (`paths.caterer(slug)`, `paths.admin.queue`, …) and `landingFor(role)` in
   one place. Replace every literal, in templates through a `paths` field on
   the page.
2. Move the title suffix into a `TitleStrategy` registered in `app.config.ts`;
   route `title` entries become the page name only.
3. Replace the repeated `mainClass`/not-found entries with the `page()` and
   `system()` route helpers already sketched in `app.routes.ts`.

**Done when** no `/`-prefixed path string appears outside
`core/routing/paths.ts` and the `routes.ts` files.

### T-18 Every feature's routes and providers loaded eagerly — Medium, M

**Evidence.** `app.routes.ts` spreads seven feature route arrays and
`app.config.ts` spreads seven provider arrays, so route configuration and
every `Http*` service for every area are in the initial bundle. The flat list
is order-dependent ("Order matters" comment) because `enquiries` owns
`dashboard/enquiries` paths inside the dashboard's URL space.

**Resolution.** Convert each area to `loadChildren: () => import('./features/
<area>/routes')` with `providers` declared on that area's parent route. Move
the `dashboard/enquiries` routes under the dashboard area (the page component
can stay in `enquiries/`). The order comment goes away because each area owns
one prefix.

**Done when** `app.routes.ts` is seven `loadChildren` entries plus the system
pages, and `app.config.ts` registers only `SessionService`.

### T-19 `requireAdmin` unused; admin pages rely on runtime 403 — Medium, S

**Evidence.** `core/session/guards.ts` exports `requireAdmin`; nothing imports
it. `operators.page.ts` and `audit.page.ts` instead catch a 403 after loading
and render a fallback.

**Resolution.** Apply `requireAdmin` to the `operators` and `audit` routes
(the README already says to), keep the runtime 403 handling only as the
generic outcome from T-12. **Behaviour change**: the redirect to `/403` for a
non-admin operator needs a criterion and an acceptance test first.

### T-20 Operator sign-out always lands on `/caterers` — High, S — Fixed

**Status. Fixed** on 2026-10-11. `app.ts` `signOut()` reads the user's role
before awaiting `session.signOut()`, so an operator lands on `/sign-in` and
customers and caterers on `/caterers`. L2-078.6 states where each role lands,
and `e2e/specs/shell/header-and-footer.spec.ts` covers operator sign-out. The
evidence below is kept as the record of what was wrong.

**Evidence.** `app.ts` `signOut()` awaits `session.signOut()`, which resets the
view to visitor, then reads `this.user()?.role === 'Operator'` to choose the
destination. The role is always `undefined` at that point, so operators land
on the public listing. No acceptance test covers operator sign-out.

**Resolution.** **Behaviour change.** Write the criterion ("an operator who
signs out is on the sign-in page"), write the failing test in
`e2e/specs/shell/header-and-footer.spec.ts`, then capture the role before the
await (or have `signOut()` return the previous user).

### T-21 Session bootstrap swallows failures; privacy redirect lives in a service — Medium, M

**Evidence.** `Session.load()` gates `provideAppInitializer`; `refresh()`
swallows every error, so a transient failure at boot makes a signed-in user a
visitor and the guards send them to sign in. The privacy-notice redirect is a
router-events subscription inside `Session` with literal paths, runs on every
navigation including the one it triggers, and nothing unsubscribes.

**Resolution.**
1. Distinguish "no session" (200 with `user: null`) from "could not reach the
   API" in `refresh()`; on the latter keep a `stale` flag and let the shell
   show the offline banner instead of demoting the user.
2. Move the privacy redirect into a `CanActivate` guard on the areas that
   require acceptance (identity routes already express this for one path),
   removing the router subscription from `Session`.

**Done when** `Session` has no router subscription and a failed boot request
does not change the signed-in state.

### T-22 Effects used for state synchronisation — Medium, M

**Evidence.** 48 `effect()` calls in the app, 36 of which write signals inside
`untracked()`. `inbox.page.ts` derives `loadedAt` from `view()` in an effect;
`caterer.page.ts` derives classes, title and navigation from `state()` in an
effect. The library has the same pattern in 13 of its 15 effects.

**Resolution.** T-10 removes the dialog-reset effects. For the rest, replace
"derive A from B" effects with `computed` or `linkedSignal`, and keep
`effect` only for genuine side effects (DOM focus, `Title`/`Meta`, storage).

**Done when** no `effect` body calls `.set()` or `.update()` on a signal the
component also reads.

### T-23 Three god components — Medium, L

**Evidence.** `dashboard/photos/photos.page.ts` (322 lines, 22 signals,
upload orchestration with per-file RxJS subscriptions, a processing-poll
timer, reorder, dialogs, withdraw); `dashboard/overview/overview.page.ts`
(304 lines, 45 signals, load, submission wizard, banner dismissal in
`localStorage`, download, withdraw); `enquiries/enquiry-form/enquiry-form-
dialog.ts` (300 lines, 8 injections, 41 signals, draft restore, sign-in
redirect, send/resend, refusal mapping, the only `ngOnInit` in the app).

**Resolution.** Extract the state machines into plain TypeScript classes
beside the page as the conventions already require for business rules:
`UploadQueue` (photos), `SubmissionFlow` (overview), `EnquiryDraftFlow`
(enquiry form). Each takes the service it needs as a constructor argument,
exposes signals, and is unit-tested under T-05. The components keep only
bindings.

**Done when** no component in `features/` exceeds roughly 150 lines or 15
signals.

### T-24 Business rules and `$any()` in templates — Medium, M

**Evidence.** 15 role or status literal comparisons in templates
(`caterer-record.page.html`, `account.page.html`, `overview.page.html`,
`download-data.dialog.html`); 15 `$any()` casts, six of them in
`certificate.page.html` to read a discriminated union; position arithmetic in
`photos.page.html`.

**Resolution.** Move each comparison into a `computed` on the page or into
the `*-view.ts` model. Replace `$any($event.target).checked` with a typed
`(change)` handler, and the union reads with a `computed` that narrows once.

**Done when** `$any(` appears nowhere and templates compare only booleans the
page computed.

### T-25 83 inline `style=""` attributes — Medium, M

**Evidence.** About 50 set spacing with tokens (`margin-top: var(--space-8)`
12 times, `var(--space-6)` 10 times) and about 26 set skeleton widths with raw
values (`width: 10rem` 6 times, `8rem`, `12rem`, `60%`, `70%`). Both bypass
the design system and ADR 0002.

**Resolution.** Add the missing spacing utilities and skeleton size modifiers
to `docs/design-system/assets/components.css` (the design system is the only
place allowed to hold global rules), regenerate the design-system page for
skeletons, then replace every inline style with the class.

**Done when** `style="` appears in no template under `projects/`.

### T-26 Browser storage keys with no registry — Low, S

**Evidence.** `localStorage` in `site-banner.ts` and `overview.page.ts`,
`sessionStorage` in `core/enquiry/enquiry-draft-store.ts`, each with its own
literal key and try/catch.

**Resolution.** One `core/storage/` module exporting typed accessors per key
with a shared guard; pages import the accessor, never the storage API.

### T-27 File naming split three ways; trivial type files; inverted import — Low, M

**Evidence.** 16 `*.dialog.ts` versus 17 `*-dialog.ts`; pages are `*.page.ts`
but 13 shared components have no suffix; view models are `*-view.ts`,
`view-state.ts` or `view.ts`; error types are `errors.ts`, `breach-errors.ts`,
`field-errors.ts`, `failure.ts`, `outcome.ts`. Seven identical two-line
`errors.ts` and six `field.ts` files exist because of the one-type-per-file
rule; `identity/register-caterer/field.ts` imports `FIELDS` from the page
component, inverting the dependency. `profile-data.ts` and `autosave.ts` use
constructor parameter properties, and `Autosave` calls `inject()` in its
constructor so it silently requires an injection context.

**Resolution.** Pick `*.dialog.ts`, `*.page.ts`, `*.component.ts` for shared
components, `*.view.ts`, `*.rules.ts`, `*.errors.ts`, and rename in one
commit per feature. Collapse the identical `errors.ts` files into the generic
`FieldErrors<F>` from T-13. Move `FIELDS` into the field file. Make
`Autosave` take its `DestroyRef` as a constructor argument.

### T-28 Dead exports and an empty `reviewsRoutes` — Low, S

**Evidence.** 40 symbols exported but used only in their own file
(constants such as `PASSWORD_MAX`, `QUEUE_REFRESH_MS`, helpers such as
`joinWords`, `guestsText`, types such as `QueueRow`). `features/reviews/
routes.ts` exports an empty array that is still spread into `app.routes.ts`.

**Resolution.** Turn on `@typescript-eslint/no-unused-vars` plus
`eslint-plugin-import`'s `no-unused-modules` with `unusedExports: true`,
then drop the `export` keyword from the 40 and delete `reviewsRoutes`.

### T-29 Download and external-link hacks through the DOM — Low, S

**Evidence.** `operator/metrics/metrics.page.ts` builds an `<a download>`,
clicks it and revokes the object URL after a fire-and-forget 60-second timer;
`dashboard/certificate/certificate-link.ts` calls `window.open`.

**Resolution.** Serve downloads as real links with `download` attributes
bound to the blob URL in the template, and revoke in `DestroyRef`. Open
certificate files with an anchor `target="_blank" rel="noopener"` in the
template.

---

## C. Internationalisation

### T-30 240 i18n ids declared in more than one place — High, M

**Evidence.** The catalogue is in sync, but 240 of 2,228 ids are declared in
two or more source files with the English text retyped each time
(`enquiries.listLabel` in 3 files, `nav.unread` in 3, and so on); 57 ids are
typed once in TypeScript and again in a template. Changing a sentence means
finding every copy, and a missed copy makes extraction fail. The id scheme
mixes page, component, concept and verb prefixes (`signIn`, `checklist`,
`common`, `approve`); `reviews`, `reviewsAdmin`, `review` and `response` all
cover review text.

**Resolution.**
1. Move every shared message into a `core/i18n/messages.ts` module of named
   `$localize` constants (one declaration per id), and import it from the
   pages and templates that need it.
2. Add a script (run in CI, T-01) that fails when an `@@id` is declared in
   more than one file.
3. Publish the id convention in `frontend/README.md` (`<area>.<screen>.<key>`
   for page text, `common.<key>` for shared text) and rename the outliers in
   one pass with the catalogue regenerated.

**Done when** the duplicate-id script reports zero and the convention is
written down.

### T-31 Locale-specific punctuation built inside the component library — Low, S

**Evidence.** `site-header.ts` builds `'99+'`; `site-header.html`,
`sheet.html` and `combobox.html` concatenate `label + ', ' + countLabel`;
`timeline-entry.ts` wraps reasons in English typographic quotes;
`site-header.html` carries `aria-label="Primary"`.

**Resolution.** Make the overflow text, the separator and the quote marks
inputs with no default, supplied by the page from `$localize`; move
`Primary` to a required `navLabel` input.

---

## D. Component library (`projects/components`)

### T-32 13 CRDs with no component; 34 CRD selectors missing — High, L

**Evidence.** 63 CRDs, 49 library folders. No component exists for
`accordion`, `avatar`, `badge`, `breadcrumb`, `container`, `divider`,
`icon-button`, `inline-message`, `skip-link`, `spinner`, `switch`, `tabs`,
`tooltip`. Sub-components named by implemented CRDs are missing too:
`sh-dialog-photo`, `sh-dialog-people`, `sh-menu`, `sh-button-group`,
`sh-checkbox-group`, `sh-form` and the eight layout selectors (`sh-container`,
`sh-page`, `sh-auth-layout`, …). The app and the library compensate by hand
writing the markup: raw `class="icon-btn"` 14 times and `avatar` 10 times
inside library templates, raw `<button class="btn">` 23 times. Five CRDs
(`form-field`, `text-field`, `textarea`, `select`, `checkbox`) live in a
single `form/` folder against the folder-per-CRD rule.

**Why it matters.** The CRDs are the binding contract for class names and
accessible state that the e2e suite depends on. Hand-written markup drifts
from it silently.

**Resolution.**
1. Implement the missing components in the order they are used most:
   `icon-button`, `avatar`, `badge`, `skip-link`, `spinner`, `inline-message`,
   `divider`, `container` and the layouts, then `menu`, `button-group`,
   `checkbox-group`, `form`, then `accordion`, `breadcrumb`, `switch`, `tabs`,
   `tooltip`. Each follows its CRD API and Markup section exactly; the CRD's
   own acceptance criteria are the tests (Playwright through the product
   pages that use them, per AGENTS.md).
2. Replace each raw-markup use in the app and the library with the component
   as it lands.
3. Split `form/` into the five CRD folders.
4. Add a check script that lists CRD selectors absent from `public-api.ts`,
   run in CI as a report (not a test, per the no-architecture-tests rule).

**Done when** every selector in `docs/specs/components/README.md` resolves to
a library component and no `class="btn"`, `icon-btn`, `avatar` or `badge`
markup is hand-written outside the library.

### T-33 Hand-rolled overlay, focus and keyboard code instead of CDK — High, L

**Evidence.** ADR 0001 decides on Angular CDK for dialogs, overlays, focus
trap and `LiveAnnouncer`. `@angular/cdk` is imported in one file
(`overlay/modal-layer.ts`, for `FocusTrapFactory` and portals). `ModalLayer`
itself hand-rolls `inert` on body children, scroll locking, a modal stack,
Escape and focus return. `popover` and `account-menu` do not use it and each
hand-roll outside-click, Escape, initial focus and (in the menu) roving
tabindex with arrow keys that `FocusKeyManager` provides. `popover` positions
with `left`/`right` only and never flips. `toast-region` appends its host to
`body` by hand. The first-focusable selector string is duplicated in four
files; the `open` → `effect` → `show/hide` block is copied between `dialog`
and `sheet`.

**Resolution.**
1. Rebuild `ModalLayer` on `@angular/cdk/overlay` (`Overlay`,
   `OverlayRef`, `cdkTrapFocus`, `ConfigurableFocusTrap`), keeping its
   public `open()` API so `dialog`, `sheet` and `photo-viewer` do not change.
2. Route `popover` and `menu` through the same layer with a connected-position
   strategy (which gives flipping for free) and `FocusKeyManager` for the
   menu's roving focus.
3. Move toasts into the CDK overlay container instead of `body.appendChild`.
4. Factor the shared `open` effect and first-focusable lookup into one
   helper.

**Done when** no library file listens to `document` for `pointerdown` or
`keydown` outside `ModalLayer`, and ADR 0001's statement is true.

### T-34 Id generation copy-pasted in 17 components — Low, S

**Evidence.** `let nextId = 0; … \`sh-x-${++nextId}\`` in 17 files;
`account-menu` uses a fixed id that collides with a second instance.

**Resolution.** One `uniqueId(prefix)` helper in `src/lib/overlay/` (or
`inject(…).id` on Angular 22) used everywhere; fix the fixed id.

### T-35 Business rules and multi-export files inside the library — Medium, M

**Evidence.** `foldText` (accent folding, L2-011.3) and a postal-code regex in
`combobox.ts`, `graphemeLength` in `textarea.ts`, `DIETARY_TAGS`/`isAllergen`
in `tag.ts`, `formatAverage` in `rating.ts`. 16 files export more than one
top-level symbol (components plus constants, tokens, helpers), against the
one-type-per-file rule. Internals such as `ICONS`, `WRAPPED`, `classes`,
`optionDisabled` and the five injection tokens are part of the public API.

**Resolution.** Move the rules into the app (`features/discovery/search/`
for folding and postal, `core/format/` for grapheme length and averages,
`features/dashboard/menu/` for dietary tags) and pass results in as inputs.
Split each multi-export file; stop exporting internals from `public-api.ts`.

**Done when** the library exports only components, directives, services,
tokens and the types their inputs need.

### T-36 Inconsistent input naming across 103 components — Medium, L

**Evidence.** The same concept is `label` (25 files), `title` (12), `heading`
(7), `name` (13), `text` (7) or `caption` (2); `ariaLabel` in 8 files while 12
templates bind a plain `label` to `aria-label`; `busy` in 19 versus `loading`
in 4; link inputs are named `href` but bound to `routerLink`. The `title`
input name forces `[attr.title]: null` in `filter-dropdown.ts` and a README
warning about `#title` template references.

**Why it matters.** Pages pass every label in (the library has no strings), so
every inconsistency is relearned at every call site, and CRD parity cannot be
checked mechanically.

**Resolution.** Write the naming rule into `docs/specs/components/README.md`
(`label` for the visible text, `ariaLabel` for an accessible name, `busy`
for in-progress, `link` for a router path), update the CRDs, then rename
inputs one component at a time with the e2e suite as the net. Rename `title`
inputs to `heading` to end the attribute collision.

### T-37 Library accessibility gaps against its CRDs — Medium, M

**Evidence.** The site-header avatar trigger has no `aria-controls`;
`sh-account-menu` sets no ARIA on its trigger although its CRD says it must;
pagination's disabled previous/next render as `<a role="link"
aria-disabled>` without `href`, so they are not focusable; the gallery
thumbnail strip has no arrow-key navigation; `combobox` renders
`suggestions__empty` instead of the CRD's `suggestions--inline` modifier in
the inline variant.

**Resolution.** Fix each against its CRD clause, with the CRD criterion as
the acceptance test, as part of the CDK rebuild in T-33 for the menu.

### T-38 Components the product never uses — Low, S

**Evidence.** `sh-card`, `sh-closed-note`, `sh-contact-card`,
`sh-enquiry-panel`, `sh-link`, `sh-tag`, `sh-filter-list`,
`sh-table-row-actions` are used by neither the app nor the library;
`sh-chip`, `sh-filter-chip`, `sh-chip-group`, `sh-popover`, `sh-tags`,
`sh-bar-chart`, `sh-progress` are used only internally.

**Resolution.** For each, either wire it into the page its CRD names (the
mocks show where) or delete it with its CRD marked as not needed. Unused code
with no test is pure maintenance cost.

### T-39 Stale library and CRD documentation — Low, S

**Evidence.** `projects/components/README.md` is the untouched CLI boilerplate
(Karma, `npm publish`). `docs/specs/components/README.md` says every
component is `planned` and that no frontend stack is chosen.

**Resolution.** Replace the library README with the rules currently in
`frontend/README.md`'s "Component library rules" section; update the CRD
index status column from the actual `public-api.ts`.

---

## E. API library (`projects/api`)

### T-40 Endpoint URLs typed in three places — High, M

**Evidence.** 72 distinct `/api/...` paths are literals in the `Http*`
services, 89 registrations are literals in the fake backend, and 65 distinct
paths appear directly in `e2e/specs` (204 lines, for `backend.fail(...)` and
`backend.hold(...)`). The only shared element is the model types. Renaming an
endpoint touches three codebases and nothing fails at compile time.
`HttpEnquiriesService.resendVerificationEmail()` and
`HttpIdentityService.resendVerification()` post to the same endpoint.

**Resolution.**
1. Add `projects/api/src/lib/endpoints.ts`: typed path builders
   (`endpoints.caterer.profile`, `endpoints.enquiries.thread(id)`) exported
   from the library.
2. The `Http*` services use them; the fake backend imports them with `import
   type` plus a tiny runtime copy (the fake runs under type stripping, so
   either make the builders erasable or import the module directly, which is
   allowed because it has no Angular dependency).
3. The e2e `backend.fail` and `hold` helpers accept the same builders, so the
   method and path are checked by the compiler.
4. Delete the duplicate resend method.

**Done when** no `/api/` string literal exists outside `endpoints.ts` and
`fake-backend/routes/index.ts`.

### T-41 Four idioms for query parameters — Medium, S

**Evidence.** `page > 1` guards written six ways across `http-discovery`,
`http-enquiries`, `http-operator-moderation`, `http-reviews`;
`encodeURIComponent` inlined about 45 times; `http-metrics` has a private
`params()` helper and `http-operator-settings` an `Object.entries` loop.

**Resolution.** One `toParams(query)` helper in the library that drops
defaults and undefined values; path builders from T-40 encode segments.

### T-42 Inconsistent service conventions and inline types — Medium, M

**Evidence.** Observables everywhere except two Promise-returning contracts
and one synchronous `certificateUrl()`. Query objects are model files for
three services and inline literals for `inbox()`, `queue()`, `caterers()`.
Contracts return anonymous shapes (`{ id; name }`, `{ filename; file }`) and
index into `OwnReviewPageView['items'][number]` six times although
`OwnReviewView` exists. Three methods lack return types. Verbs for the same
operation differ (`page()`, `reviews(page)`, `inbox(query)`; `remove()`,
`deleteResponse()`, `removePhoto()`; `current()`, `currentNotice()`).

**Resolution.** Write the service conventions into ADR 0003 (Observable
only; `list(query)`, `get(id)`, `create`, `update`, `remove`; every query and
result is a named model file) and bring the 16 contracts into line in one
pass, updating the fake and the pages with the compiler as the guide.

### T-43 Duplicate and drifting model types — Medium, M

**Evidence.** `DietaryTag` and `DietaryTagId` are identical; `ProfileStatus`
and `OwnProfileStatus` are identical; `Role`, `HoldReason`, `ReportReason`,
`ReportOutcome` are re-inlined in other model or seed files; the review
status union is inlined in `reported-target-view.ts`; pagination has three
shapes (`items/total/page/pageSize/pageCount`, the same without `pageSize`,
`entries/total/page/pageSize` without `pageCount`). Two `AuditEntry` types
exist (library and fake) with different field types, and the seed writes one
into a store typed as the other. 39 lines declare inline nested object types.
`notices.models.ts` is the one file that breaks the naming rule.

**Resolution.** One `Page<T>` generic and one union per vocabulary, each in
its own file, imported everywhere including seed files (T-50). Delete the
fake's `AuditEntry` and align the stored shape with the wire shape. Name the
inline nested types. Rename `notices.models.ts`.

### T-44 Wire vocabulary changed in transit — Low, S

**Evidence.** `HttpOperatorSettingsService.moderation()` lower-cases
`ModerationStatus` for the query string, and the fake maps it back with a
default of `Held` for anything unrecognised.

**Resolution.** Send the model's value unchanged and parse it in the fake
through the shared union; no translation layer.

---

## F. Fake backend (`fake-backend/`)

### T-45 Route modules of 600 to 1,200 lines with scenarios inside — Medium, L

**Evidence.** `routes/operator.ts` is 1,228 lines (queue, decisions, records,
edits, changes, reports), `caterer-profile.ts` 836, `enquiries.ts` 696,
`operator-settings.ts` 646. About 575 lines of e2e scenario fixtures sit
inside route modules, and conversation and review text that belongs in
`seed/` is hard-coded in `routes/enquiries.ts` and `routes/discovery.ts`.
`/__fake/scenario` lazily imports `scenarios.ts` on every call to dodge a
circular import.

**Resolution.** Split each route module by resource (one file per first path
segment under the area), move scenarios into `fake-backend/scenarios/<area>.ts`
registered from one index (removing the lazy import), and move fixture text
into `seed/`.

### T-46 Auth, pagination and body typing repeated per handler — Medium, M

**Evidence.** `currentUser`/`unauthorized` repeated per handler in 10 files;
`forbidden()` at 13 sites, `notFound()` at 39; six hand-written pagination
blocks with four differently named page-size constants; `(ctx.body ?? {}) as
Partial<XRequest>` 17 times because `Ctx.body` is `any`; 20 `any` and 76
casts overall; helper names such as `isReply`, `DAY`, `PAGE`, `text()`
re-declared in up to five files; both `newId()` and raw `randomUUID()` used.

**Resolution.** Add `requireUser(ctx)`, `requireRole(ctx, role)`,
`paginate(items, page, size)`, `body<T>(ctx)` (typed via T-40's endpoint
definitions) and a shared `lib/validate.ts` with the email and password rules;
make `Ctx.body` `unknown`. Delete the per-file helper copies.

**Done when** the fake has zero `any` and one implementation of each of
those concerns.

### T-47 Stores never evicted; every test seeds twice — Medium, S

**Evidence.** `lib/store.ts` keeps a `Map` of stores keyed by the
`x-fake-session` header with no `delete`; a full run creates 653 fully seeded
stores (60-plus caterers each) that live until the process exits, and
`reuseExistingServer` keeps that process alive between local runs. Each test
seeds once on first request and again on `/__fake/reset`.

**Resolution.** Delete the store on `/__fake/release`, add a last-used
timestamp with eviction after ten minutes, and have `reset` create the store
only if one already exists.

### T-48 Held requests never time out; `/__fake/state` leaks everything — Low, S

**Evidence.** `hold()` keeps a request pending until `release()` with no
server-side timeout; the fixture teardown swallows failures. `/__fake/state`
serialises the whole store including passwords and the session map;
`watchAudit()` fetches it twice. `/__fake/faults` stores an unvalidated body.
`readBody` has no size cap.

**Resolution.** Cap holds at the Playwright test timeout, validate the fault
body against the shared `Fault` type (T-61), strip credentials from `state`
and let it accept a `?path=` selector, cap `readBody` at a few megabytes.

### T-49 Frozen clock and 230 absolute 2026 dates — Medium, M

**Evidence.** Every store's `now` is `2026-10-10T14:00:00Z`; the fake never
reads the real clock. That is right for e2e but also applies to `npm start`,
where the browser runs on the real date (already past the fixed one). Idle
timeouts, review edit windows, certificate expiry, rate-limit windows and the
metrics range therefore freeze in development while date pickers and relative
times move. Seed dates are 187 absolute literals in `seed/` and 41 in
`routes/`, so moving the clock means editing them all.

**Resolution.** Express every seed date as an offset from `DEFAULT_NOW`
(`daysAgo(3)`, `at('10:00')`), and let `server.ts` take `FAKE_NOW` from the
environment with the real clock as the development default and the fixed
date set by the Playwright `webServer` command.

### T-50 Types defined in seed and route files; dead exports — Low, M

**Evidence.** Nine seed files mix a type with data (`Role` in `users.ts`,
`ProfileStatus` in `caterers.ts`, `ReviewStatus` in `reviews.ts`, …) and four
one-line type files sit under `routes/`. 31 exports in the fake are never
imported elsewhere. `routes/session.ts` contains a 20-line user-agent sniffer.

**Resolution.** Import the unions from `@sweet-hand/api` (T-43), move the
fake-only types into `lib/types/`, drop the gratuitous `export`s under the
lint rule from T-28, and replace the sniffer with a lookup table of the two
or three device strings the seed needs.

### T-51 Hard-coded ports and cookie names in five places — Low, S

**Evidence.** Port 4300 in `server.ts`, `e2e/support/ports.ts`,
`proxy.conf.mjs` and `playwright.config.ts`; the `sh_session` cookie name in
`store.ts`, `session.ts` (4 times), `identity.ts` and `e2e/support/backend.ts`;
the `/media` handler re-implements fault matching with different `times`
semantics from the `/api` branch.

**Resolution.** One `fake-backend/lib/config.ts` for the port and cookie
names, imported by the fake and by `e2e/support` (the e2e tsconfig already
reaches `fake-backend`); one fault-matching path for all requests.

---

## G. Acceptance suite (`e2e/`)

### T-52 Selectors leak into 45 of 85 spec files — High, L

**Evidence.** AGENTS.md: "Never put a selector in a test". No bare
`page.locator()` exists, but specs chain `.locator('.empty__title')`,
`.locator('h3')`, `.photo-tile__caption`, `.admin-row__meta` and others on
page-object locators (62 lines in 25 files), call `getByRole` on them (83
lines in 34 files), and use `page.getByText` directly (9 sites). Eleven specs
call `page.goto` instead of a page object's `open()`, eleven set the viewport
directly although `usePhone()` exists, and 33 use `page.keyboard.press`.

**Why it matters.** The page object is supposed to be the only thing that
changes when markup changes. Today a class rename breaks dozens of specs.

**Resolution.**
1. Turn on `eslint-plugin-playwright` (T-03) with `no-raw-locators` scoped to
   `e2e/specs/**` and treat `.locator(`, `.getBy*(` and `page.goto(` in a spec
   as errors.
2. Add the missing getters to the page objects (the audit shows they cluster
   on `errorSummary` headings and links, dialog summaries, empty-state titles,
   tile captions, row metadata) and rewrite the 150-odd call sites.
3. Expose `pressKey` or intent methods (`nextPhoto()`, `closeWithEscape()`) on
   page objects for the keyboard cases.

**Done when** the lint rule passes and specs contain no CSS, role or text
lookups.

### T-53 1,643 literal-copy assertions — Medium, M

**Evidence.** `toHaveText(` is called 1,643 times with 68 literals longer than
80 characters; "Try again" is asserted in 42 files, "We couldn't…" in 43,
"Something went wrong" in 22. A copy edit becomes a 40-file test change.
188 `toHaveCount(0)` assertions, several on unscoped text, pass vacuously when
a page fails to load.

**Resolution.** Keep exact-copy assertions where the copy is the requirement
(error messages named in L2), and put those strings in `e2e/support/copy.ts`
so a change is made once. For everything else assert on role, state and
structure through page-object methods (`expectError()`, `expectEmpty()`).
Replace unscoped `toHaveCount(0)` with a positive assertion on the containing
region followed by the negative.

### T-54 Sign-in and scenario arrangement inlined 349 times — Medium, M

**Evidence.** `backend.signInAs(` appears 349 times in specs; only 13 files
use `beforeEach`. The `scenario('beverley')` plus `signInAs('beverley')` pair
is repeated 22 times with an ordering dependency documented only in a comment
in `cast.ts`. `scenario(name: string, args: Record<string, unknown>)` accepts
any string; 55 scenario names exist, one (`hold-review`) is never used, and a
typo fails only at run time.

**Resolution.** Export a `Scenarios` type from the fake's scenario index
(T-45) and type `backend.scenario<K extends keyof Scenarios>(name: K, args:
Scenarios[K])`. Add per-cast fixtures (`asLeah`, `asKendra`, `asBeverley`)
that run the scenario and the sign-in together, and use `test.use` or
`beforeEach` per describe block.

### T-55 Browser clock and backend clock diverge — Medium, S

**Evidence.** The fixture installs the browser clock at the fixed date; the
backend clock is changed separately with `backend.setNow` in 13 places, and
six specs move the backend without the browser (reset-password,
listing-layout, write-review, own-review, send-enquiry-account,
send-enquiry-review). Two specs build a second browser context by hand with
the session header but without the clock.

**Resolution.** Replace `backend.setNow` with a `clock.setTo(date)` fixture
that sets both, and a `newContext()` fixture that reproduces the header and
clock, then delete the hand-rolled contexts.

### T-56 Ambiguous locators resolved with ordinals — Medium, M

**Evidence.** `.first()` on 65 lines in 29 spec files and 25 in page objects,
`.nth()` on 23, `.last()` on 32. `caterer.page.ts` reaches into
`app-caterer-page > p[role="status"]`, a component selector. One
`click({ force: true })`, one `dispatchEvent('click')` on a disabled button,
synthetic pointer events in `photo-viewer.ts`.

**Resolution.** Enable `playwright/no-nth-methods` and `no-force-option`, and
make each locator unique by accessible name or by a `filter({ has })` on
content that the test arranged. Where several identical regions legitimately
exist, expose a `row(name)` accessor on the page object.

### T-57 Page-object duplication — Medium, M

**Evidence.** `get errorSummary()` is defined 10 times; getters named
`status` (22), `subtitle` (20), `alert` (20), `loadingStatus` (13), `close`
(10), `submit` (8) repeat across objects with no shared form, dialog, list or
empty-state object. `useTablet()` is duplicated in two pages. Naming splits
39 `*.page.ts`, 40 unsuffixed, 3 `*-page.ts`. `shell.ts` contains only
`SiteHeader` while the README says shared overlays live there. `caterer.page.ts`
(402 lines) also does layout maths via five `evaluate` calls and network
sniffing.

**Resolution.** Add component objects for `FormSummary`, `Dialog`,
`EmptyState`, `StatusRegion` and `ListRows` that page objects compose;
rename files to `<screen>.page.ts` and `<component>.component.ts`; split the
caterer page object into page, gallery, reviews and report-flow objects, and
move the layout and network checks into support helpers.

### T-58 Axe runs WCAG 2.1 tags — High, S

**Evidence.** `base.page.ts` runs axe with `wcag2a, wcag2aa, wcag21a,
wcag21aa`. AGENTS.md requires WCAG 2.2 AA; ADR 0004 says 2.1. The 2.2
criteria (focus not obscured, target size, dragging alternatives, consistent
help) are never checked.

**Resolution.** Add `wcag22aa` to the tag list, fix whatever the 393 calls
then report, and correct ADR 0004. **Behaviour change** for any fix that
alters layout; the axe assertion is the acceptance test.

### T-59 Phone coverage at 8 % with two different widths — Medium, M

**Evidence.** `usePhone()` (360 px) is called in 52 of 653 tests; `reviews`
has none, `account` and `dashboard` very few. Seven specs set 320 px directly.
AGENTS.md says mobile first.

**Resolution.** Define phone as 360 px and small phone as 320 px in
`BasePage`, add a `usePhone()` plus `expectNoHorizontalScroll()` test for
every screen's default state (one per page object, generated from a list in
one spec per area), and remove the direct viewport calls.

### T-60 Untested requirements and uncited tests — Medium, M

**Evidence.** 83 of 91 L2 ids are cited by a spec. Of the eight uncited, two
are frontend-observable: L2-062 (privacy-preserving visit counting) and
L2-087 (asset budgets and caching). 200 of 653 titles (31 %) cite no
criterion; CRD criteria are cited in 34 titles across roughly 1,900 declared
CRD criteria. Four duplicate test titles exist.

**Resolution.** Write the L2-062 and L2-087 tests (the fake can record the
visit beacon; the asset check can read response headers). Add a lint-like
script that lists titles without an `L2-`, `AC-` or `D-` id as a CI report,
and add ids to the 200 titles over time, starting with the areas that
implement CRDs. Fix the duplicate titles.

### T-61 Specs assert on the fake's store shape — Medium, M

**Evidence.** `backend.state()` returns `Promise<any>` and `watchAudit()`
`any[]`; 64 `state()` and 57 `requests()` uses assert on store internals
(`state().enquiries.length`, `caterers.find(...)`). `e2e/support/
fault-options.ts` duplicates the fake's `Fault` type and `cast.ts` duplicates
the seed password and operator code.

**Resolution.** Export `Store`, `Fault` and the cast constants from the fake
and import them in `e2e/support` (type-only where needed) so `state()` is
typed. Then audit the 64 uses: assertions on what the user can see belong in
the page; assertions on what was sent stay on `requests()` through the typed
endpoints of T-40.

### T-62 `profile-api.spec.ts` tests the fake, not the product — Low, S

**Evidence.** Six tests drive the fake backend over HTTP with no page object,
proving fake-backend rules. ADR 0004 reserves backend rules for later
integration tests.

**Resolution.** Move the file to `fake-backend/tests/` under the Vitest runner
from T-05, or delete the cases that a product test already covers.

### T-63 No retries, screenshots or video; `forbidOnly` only on CI — Low, S

**Evidence.** `retries: 0` everywhere, `trace: 'retain-on-failure'` but no
`screenshot` or `video`, `forbidOnly` gated on a CI variable that nothing sets.

**Resolution.** With T-01 in place: `retries: process.env.CI ? 1 : 0`
(a single retry surfaces flakiness in the report without hiding it),
`screenshot: 'only-on-failure'`, `forbidOnly: true`.

### T-64 No visual regression coverage — Low, M

**Evidence.** No `toHaveScreenshot` anywhere. ADR 0004 says no snapshot policy
is needed yet; AGENTS.md anticipates one. Design drift between the mocks and
the product is caught only by eye.

**Resolution.** Decide, and record the decision in an ADR either way. If
adopted: one screenshot per mock state for the states the manifest lists
(`docs/mocks/manifest.json` has 90 screens), Chromium only, baselines
committed, updated only through a `--update-snapshots` run named in the pull
request.

---

## H. Documentation drift

### T-65 AGENTS.md, READMEs, ADRs and code disagree — Medium, S

**Evidence.**
- AGENTS.md describes the product as home cooks and small-batch makers with
  dishes, batches and pre-orders; `README.md`, the L2, the mocks and all the
  code describe caterers, enquiries and events. The vocabulary in AGENTS.md
  (`maker`, `eater`, `dish availability`) appears nowhere in the frontend.
- ADR 0001 says pages set title, meta description, canonical and Open Graph
  tags through `Title` and `Meta`. Route `title` entries cover the title;
  only the caterer page sets the description, canonical and Open Graph tags
  (`features/discovery/caterer/caterer-meta.ts`).
- ADR 0001 says CDK is used for dialogs, overlays and `LiveAnnouncer` (T-33).
- ADR 0004 says WCAG 2.1 tags; AGENTS.md says 2.2 (T-58).
- `frontend/README.md` says shared overlays live in `e2e/pages/shell.ts`
  (T-57) and that scenarios live in `routes/<area>.ts` while `backend.ts`
  says `routes/scenarios.ts`.
- The component library README and the CRD index are stale (T-39).

**Resolution.** Rewrite the AGENTS.md overview and domain rules in the
product's actual vocabulary (or record the pivot in an ADR if the code is
wrong), amend ADRs 0001 and 0004 to say what is true, and give every other
page a `Title`/`Meta` setup through the `TitleStrategy` of T-17.

---

## Resolution roadmap

The items above resolve in six phases. Each phase leaves the suite green and
is small enough to review. Phases 1 and 2 unlock everything after them.

### Phase 1: safety net (about one week)

T-01 CI, T-02 Prettier, T-03 lint scope, T-06 typecheck scope, T-63
retries and screenshots, T-58 WCAG 2.2 tags, T-20 operator sign-out fix,
T-19 `requireAdmin`. Nothing in this phase changes product behaviour except
the two bug fixes, which go through ATDD.

### Phase 2: single sources of truth (two to three weeks)

T-17 route paths and titles, T-40 endpoints, T-41 params, T-30 i18n
messages, T-26 storage, T-51 fake config, T-43 shared unions, T-44 wire
vocabulary, T-55 one clock. Each replaces literals with an import and is
verified by the compiler and the unchanged suite.

### Phase 3: shared form and dialog machinery (three to four weeks)

T-11 problem mapping, T-12 outcomes, T-10 dialog state, T-13 forms and
rules, T-22 effects, T-14 focus, T-15 polling, T-16 connectivity, T-23 god
components, T-24 template rules, T-27 naming, T-28 dead code, T-29 DOM hacks.
Convert one feature area per pull request; the area's specs are the gate.
T-05 unit tests land at the start of this phase so the extracted plain
classes get direct tests.

### Phase 4: component library (four to six weeks)

T-33 CDK overlay rebuild first (it changes the most shared code), then T-32
missing components in usage order, T-34, T-35, T-36 renames, T-37
accessibility fixes, T-38 unused components, T-31 punctuation inputs, T-39
and T-25 design-system utilities. Each component follows its CRD and is
proven through the product pages that use it.

### Phase 5: fake backend and suite hygiene (three to four weeks)

T-45 route split and scenarios, T-46 shared handlers, T-47 eviction, T-48
holds and state, T-49 relative dates, T-50 types, T-52 selector leaks with
the lint rule as the gate, T-53 copy, T-54 fixtures, T-56 ordinals, T-57
page-object composition, T-59 phone coverage, T-60 criteria, T-61 typed
state, T-62 move the fake's tests.

### Phase 6: upgrades and decisions (one week plus ongoing)

T-07 Angular 22 and dependency bot, T-08 package manifests, T-09 budget,
T-64 visual regression decision, T-65 documentation reconciliation, T-04
re-enable the lint rules once Phases 3 to 5 have removed the reasons they
were turned off.

### Keeping the register honest

- Each item is closed by a pull request that links to it and deletes its
  entry; the register should shrink, not grow a "done" column.
- A new item is added when a reviewer accepts a shortcut knowingly; the
  review comment names the `T-nn` it creates.
- Re-run the measurements in "How this register was built" at the end of
  each phase and update the table.
