# Plan: publish a public preview at preview.sweethand.ca

**Status:** Proposed, 2026-10-12. Not yet specified; nothing here is built.
**Retires:** with the launch site on launch day (L2-102).

This plan is the road to a public preview of the Sweet Hand product. A visitor
opens `https://preview.sweethand.ca`, enters a four-digit code and uses the real
product app on the fictional cast. Nothing in the preview is real: no real
makers, no real customers, no email leaves the server.

The plan is not a specification. Before any production code changes, the
requirements, design and mocks listed in [Artifacts before
implementation](#6-artifacts-before-implementation) must exist, and the work
then follows the `implementing-incrementally` skill with acceptance tests first
(`AGENTS.md`).

## 1. Goal and non-goals

**Goal.** People we meet before launch (makers, eaters, partners) can try the
whole product on a phone: browse caterers, sign in as a customer and send an
enquiry, sign in as a caterer and edit a menu, sign in as an operator and work
the review queue.

**Non-goals.**

- Real accounts, real data or real email. The preview never connects to the
  production database or email service.
- Confidentiality. The repository is public, so the code is a gate on *who gets
  the experience*, not a security boundary for secrets. Nothing behind it is
  secret.
- Search visibility. The preview is never indexed.
- A permanent demo. It is removed on launch day.

## 2. Decisions

| Decision | Choice |
|---|---|
| Who sees what | **One shared world.** Every visitor with the code uses the same seeded in-memory data. |
| Reset | **Daily at 04:00 `America/Toronto`**, and on every restart or deployment. |
| Accounts in phase 1 | **Cast accounts only.** Registration is closed in the preview. |
| Email in phase 1 | Queued and logged, never sent. A preview inbox is an optional phase 2. |
| Lifetime | **Until launch day**, retired with the launch site (L2-102). |
| Build | **One product build** serves the preview and, later, production. Preview behaviour comes from the API's configuration, never from a frontend build flag. |
| Hosting | The production resource group, Container Apps environment, registry image, Key Vault and monitoring are reused. The preview adds one Static Web App and one Container App. |

## 3. What is already in place

The backend already runs the product on fictional data without a database:

- `backend/src/main.ts` uses `MemoryDatabase` and seeds the cast with
  `seedDatabase` when `DATABASE_URL` is absent.
- Without a database, email goes to `logGateway`
  (`backend/src/platform/email-dispatch.ts`), which logs a hashed address and
  never sends. Bot challenges use `LocalChallengeVerifier`, and security keys
  use the `local-key:` stand-in.
- The cast has 14 accounts across the three roles with one shared password
  (`backend/src/seed/users.ts`) and about 69 caterers. All of it is fictional.
- `api-app.ts` already runs a gate before NestJS routing: `prelaunchGate`
  (`backend/src/http/prelaunch-gate.ts`). A preview gate sits in the same slot.
- `Environments.resolve(req)` (`backend/src/http/nest/options.ts`) is the one
  place a request picks its environment, which is where a daily reset can swap
  worlds.

What is missing:

- **The product app is deployed nowhere.** Production serves only the
  prerendered launch app, and its API runs with `PRELAUNCH_MODE=true`, which
  hides every product route (ADR 0011).
- **Photos are outside `/api`.** The API serves photos at `/media/:id`
  (`backend/src/discovery/discovery.controller.ts`), and about ten use cases
  build `/media/...` URLs. A Static Web App's linked backend forwards only
  `/api/*`, so no photo would load. Launch day needs the same fix.
- **The API image has no cast photos.** In-memory mode reads them from
  `docs/mocks/assets/img` (`CAST_MEDIA_DIR` in `backend/src/platform/media.ts`),
  and `backend/Dockerfile` does not copy `docs/`.
- **The product app has no Static Web Apps configuration**: no navigation
  fallback for deep links, no security headers, no robots policy.

## 4. Experience

### The gate

1. A visitor opens any preview address. The app shell loads from the static
   host.
2. The app's first API read is refused with HTTP 403 and a body marking the
   preview as locked. The system-errors interceptor
   (`shell/system-errors.interceptor.ts`) sends the visitor to `/preview`,
   keeping the requested address as the return address.
3. `/preview` has the wordmark-only header (`data.chrome: 'minimal'`), one
   sentence on what the preview is, and a single four-digit field. The field
   follows the two-factor page: `sh-text-field`, numeric keyboard,
   `autocomplete="one-time-code"`.
4. A correct code sets a `sh_preview` cookie and returns the visitor to the
   requested page, or to the caterer listing.

Gate states to mock: default, invalid code, submitting, too many attempts (with
when to try again), and unavailable (the world is resetting).

### Inside the preview

- **A persistent info banner** on every page: "This is a preview. Makers,
  dishes and reviews are fictional, and everything resets daily at 4 a.m.
  Don't enter real personal information." It links to the guide. It is a new
  notice kind from `GET /api/public/notices`, so the existing site banner
  (`features/account/site-banner/`) shows it and production never does.
- **`/preview/guide`** lists accounts to try, each with one line on what to
  look at:
  - customer Marcia, to send an enquiry and write a review
  - caterer Kendra (Pelau House), to edit the menu and answer enquiries
  - operator Tomas, to work the review queue with the security-key stand-in
  - operator Leah, for admin pages, with her fictional authenticator setup key
    shown so a visitor can add it to an authenticator app

  The guide also says what resets, what is not real, and where to send
  feedback (`hello@sweethand.ca`).
- **Sign-in works as normal** against the seeded users.
- **Registration and the password-reset email are closed in phase 1.** In a
  shared world, a real address typed into registration would be visible to
  every visitor signed in as an operator.

## 5. Architecture

### Backend preview mode

`PREVIEW_MODE=true` with no `DATABASE_URL` gives:

- the in-memory database seeded with the cast, the system clock, the
  background work on, and `logGateway` for email
- the preview gate in place of the pre-launch gate
- registration refused with a problem reply ("Registration is closed in the
  preview")

`loadConfig` refuses `PREVIEW_MODE` together with `DATABASE_URL`, or together
with `PRELAUNCH_MODE`, the same way it refuses `TEST_CONTROL` with a database.

### The gate

`previewGate` runs in the `before` slot of `createApiApp`. It lets three kinds
of request through:

- `/health/live` and `/health/ready`
- `GET /api/preview/status`, which returns `{ locked, retryAfter? }` and
  issues the `XSRF-TOKEN` cookie the code form needs
- `POST /api/preview/access`

Every other request without a valid `sh_preview` cookie gets HTTP 403
`{ "title": "Preview locked", "preview": "locked" }`.

The access endpoint is an ordinary NestJS route with `@UsePolicy(anonymous)`,
so CSRF, body limits and the transaction apply. That is also why it can record
security events.

### The grant cookie

- **Value:** an HMAC-SHA256 of a fixed label. The key comes from
  `PREVIEW_GRANT_KEY` and the current access code. The server compares it in
  constant time.
- **Attributes:** HttpOnly, Secure, SameSite=Lax, a 30-day lifetime, and no
  `Domain`. It stays on `preview.sweethand.ca` and never reaches
  `sweethand.ca`.
- **Rotation:** changing the code invalidates every grant at once.
- **Reset:** a daily reset ends visitors' product sessions but not their grant.
  They sign in again, but they never retype the code.

### Guessing the code

Four digits is 10,000 combinations, so attempts are limited:

- **Per IP:** five failures from one IP in 15 minutes return 429 until the
  window passes. IPs come from `X-Forwarded-For` through `TRUST_PROXY`.
- **Gate lock:** 50 failures across all IPs in an hour lock the gate for 15
  minutes for every new visitor.
- **Counters:** they live in process memory outside the seeded world, so a
  daily reset does not clear them.
- **Security events:** each success, failure and lock records one through
  `recordSecurityEvent` (`backend/src/platform/security-log.ts`). That adds
  `preview-access-granted` and `preview-access-refused` to `SecurityEventType`.
  The log line reaches Log Analytics, so it outlives the reset.
- **Rotation:** the operator rotates the code routinely, and at once when it
  leaks (see [Operations](#operations)).

### The daily reset

- `PreviewEnvironments` implements `Environments` by holding one current
  environment: `MemoryDatabase`, `MemoryMediaStore`, system clock and the
  local stand-ins. At 04:00 Toronto it builds and seeds a fresh environment,
  then swaps it in.
- Requests already in flight finish on the old environment. Those that arrive
  during seeding get the "unavailable" gate state.
- `startBackgroundWork` takes a getter for the current environment instead of
  the one it was started with, so email, photos and the daily maintenance
  follow the swap.
- The preview notice carries `resetsAt` for the banner.

### The frontend

- **Service:** `PreviewService` in `projects/api` (`status()`, `unlock(code)`)
  with `HttpPreviewService`, registered in `features/preview/providers.ts`.
- **Pages:** `features/preview/` holds the gate page, the guide page and their
  routes. `core/routing/paths.ts` gains `preview.gate` and `preview.guide`.
- **Errors:** the system-errors interceptor learns the locked reply.
  `Session.load()` treats a locked reply as signed out, so the app initializer
  never fails.
- **Banner:** the rules in `site-banner-rules.ts` gain a `preview` banner
  kind, below `degraded` and above the account banners.

### Photos under /api

- **Route:** move `GET /media/:id` to `GET /api/media/:id`.
- **URLs:** one helper builds every photo URL in place of the ten inline
  `/media/...` strings (for example `backend/src/discovery/photos.ts` and
  `backend/src/moderation/views.ts`).
- **Dev proxy:** drop `/media` from `frontend/proxy.conf.mjs`.
- **Image:** ship the cast photos. Either copy `docs/mocks/assets/img` in
  `backend/Dockerfile`, or read `MEDIA_DIR`, which `config.ts` already parses
  but nothing reads.

### Static hosting

- **Base config:** add
  `frontend/projects/sweet-hand/public/staticwebapp.config.json` with a
  navigation fallback to `/index.html` for deep links. It carries the launch
  app's security headers and CSP, with cache rules for hashed assets.
- **Preview overlay:** delivery adds `X-Robots-Tag: noindex, nofollow` and a
  `robots.txt` that disallows everything. The production build stays
  indexable.

### Tests

- **Backend acceptance tests** start the app with preview configuration, as
  `backend/test/platform/prelaunch-gate.test.ts` does for pre-launch mode.
- **Playwright** needs the gate on for one test session at a time. A
  `preview-locked` scenario under `backend/src/testing/scenarios/` turns it on
  for that session's environment.
- **Page objects** for the gate and guide follow the e2e conventions: no
  selectors in specs.

## 6. Artifacts before implementation

`AGENTS.md` requires a requirement, a detailed design and a mock before
production code changes.

| Artifact | Content |
|---|---|
| `docs/specs/L1.md` | **L1-026 Public preview.** Before launch, people with an access code can try the product on fictional data at its own address. Nothing they do there reaches real people. |
| `docs/specs/L2.md` | A new part, **Public preview (L2-109 onward)**, with one requirement each for: access code and grant; attempt limits, lock and rotation; banner and guide; daily reset; no real email, registration or data; not indexable; hosting and delivery; retirement. Separately, **photos served under `/api/media`**, tracing to L1-023, because launch needs it too. |
| `docs/adr/0012-public-preview-hosting-and-gate.md` | The second Static Web App and Container App, the in-memory shared world, the gate before routing, and the code as a gate rather than a secret. Add a row to `docs/adr/README.md`. |
| `docs/detailed-designs/platform/publish-public-preview/` | `README.md` with C4 context, container and component diagrams, a class diagram, and sequences for unlocking, the daily reset and delivery. Add a row to `docs/detailed-designs/README.md`. |
| `docs/mocks/` | `pages/preview-gate/{default,invalid,submitting,locked,unavailable}.html`, `pages/preview-guide/default.html` and `notifications/site-banner/preview.html`. Update `manifest.json`, `index.html` and the coverage table. |
| CRDs | None. The pages use existing `sh-*` components. |

## 7. Infrastructure and delivery

### Azure resources

All of these sit behind a `deployPreview` parameter in `infra/main.bicep`.

| Resource | Setting |
|---|---|
| Static Web App `swa-sweethand-preview` | Standard tier, needed for a linked backend; `eastus2` control plane, like the launch site |
| Container App `ca-swh-preview` | Existing environment `cae-swh-prod`, image `sweet-hand-api:<commit>` (the image production promotes), 0.5 vCPU, 1 GiB, minimum and maximum one replica, probes on `/health/live` and `/health/ready` |
| Key Vault secrets | `preview-access-code` and `preview-grant-key`, read by the existing API identity, so no new role assignment |
| Linked backend | `az staticwebapp backends link` from the preview Static Web App to `ca-swh-preview` |

Preview Container App settings:

```
PREVIEW_MODE=true
PREVIEW_ACCESS_CODE=<Key Vault reference: preview-access-code>
PREVIEW_GRANT_KEY=<Key Vault reference: preview-grant-key>
SECURE_COOKIES=true
TRUST_PROXY=true
ALLOWED_ORIGINS=https://preview.sweethand.ca,https://<preview default hostname>
SITE_URL=https://preview.sweethand.ca
APPLICATIONINSIGHTS_CONNECTION_STRING=<existing>
```

There is no `DATABASE_URL`, no `PRELAUNCH_MODE` and no email or Turnstile
settings.

### Delivery

These steps join `.github/workflows/deploy.yml` after the production steps,
under the same OIDC identity and resource group:

1. Update `ca-swh-preview` to the commit's image.
2. Build the product: `ng build sweet-hand`.
3. Add the preview overlay: robots header and `robots.txt`.
4. Upload `dist/sweet-hand/browser` with `Azure/static-web-apps-deploy@v1`.
5. Run smoke checks:
   - `/health/ready` returns 200
   - a deep link returns the app shell
   - `GET /api/public/caterers` without the cookie returns 403 locked
   - a wrong code returns 400
   - the code from Key Vault returns 204 with the cookie
   - the same read with the cookie returns 200
   - `/api/media/<a cast photo>` returns an image
6. On failure, restore the preview's previous image. Production is untouched.

A preview failure fails the workflow but never rolls back production.

### DNS

In Namecheap Advanced DNS, add `CNAME preview` pointing to the preview Static
Web App's default hostname. Then run `az staticwebapp hostname set` and wait
for `Ready`. The `HSTS includeSubDomains` header on `sweethand.ca` already
requires HTTPS here, which Static Web Apps provides.

### Cost

Estimate in CAD per month, before tax:

| Item | Monthly |
|---|---:|
| Static Web Apps Standard | $13 |
| Container App, one always-on lean replica | $12–30 |
| **Preview total** | **$25–43** |
| Current production estimate | $78–121 |

The CAD 100 budget (`budget-swh-prod`) will alert. Either raise
`budgetAmount` to 150 for the preview's lifetime, or accept the alerts and
record that in the runbook. L2-108 AC7 names CAD 100, so the preview's
requirement must say which.

### Operations

Add a "Public preview" section to `docs/operations/azure-production.md`:

- **Rotate the code:**
  `az keyvault secret set --vault-name <vault> -n preview-access-code --value <new code>`,
  then `az containerapp revision restart`. The restart also resets the world.
- **Force a reset:** restart the revision.
- **Read gate events:** a Log Analytics query for `preview-access-*` security
  events.
- **Share the code:** who holds it, and where it may and may not be printed.
- **Retire:** see slice 11.

## 8. Slices

Each slice is one pull request with its acceptance criteria and failing tests
first, and each leaves `main` deployable.

| # | Slice | Proves |
|---|---|---|
| 1 | Photos under `/api/media` | Backend tests fetch a cast photo at the new path; Playwright pages still show photos |
| 2 | API image carries cast photos | A locally built image in in-memory mode serves a cast photo |
| 3 | Preview mode and the gate | With preview mode, product reads return 403 locked; health and status pass; config refuses unsafe combinations |
| 4 | Unlock with the code | Right code grants; wrong code is refused; limits return 429; the gate locks; rotation revokes; security events recorded |
| 5 | Gate page | A visitor deep-links, is sent to the gate, enters the code and lands on the requested page; every gate state renders |
| 6 | Banner and guide | The preview banner shows on every page and links to the guide; production shows no banner |
| 7 | Registration closed in preview | Register returns the closed problem; the page explains it |
| 8 | Daily reset | At 04:00 Toronto (fixed clock), edits are gone, the grant survives and the session does not |
| 9 | Product static config and preview overlay | Deep links resolve; the preview build carries `noindex` and the disallow-all `robots.txt` |
| 10 | Infrastructure, delivery, DNS and runbook | First deployment passes the smoke checks at `preview.sweethand.ca` |
| 11 | Retirement, with L2-102 | Delete the Static Web App, Container App, secrets, DNS record and `deployPreview`; preview mode stays in code for local demos and videos |

Phase 2, optional, after slice 10: a **preview inbox** page that lists the
emails the shared world queued. Registration then reopens, but only for
addresses at reserved example domains (`example.com` and `*.example`), so no
real address ever enters the shared world.

## 9. Risks and open questions

### Risks

- **Shared-world content.** A visitor can post text or photos that others see
  until the next reset. The banner, the daily reset, a one-command forced reset
  and the security events mitigate it.
- **The code leaks.** Four digits on a flyer or in a screenshot spread quickly,
  so rotation is routine, not an incident.
- **Memory.** Uploads accumulate in process memory until the reset. The 1 GiB
  replica needs a cap on total in-memory media, refusing uploads past it.
- **Sign-outs.** One replica means a deployment or reset signs every visitor
  out of the product. The grant cookie survives, so they never retype the code.
- **Aging data.** The cast is written around 10 October 2026 (`CAST_NOW`). On a
  live clock, events, availability and "recent" activity age every day. Check
  how the cast reads weeks later; if it reads stale, seed dates relative to the
  reset day.

### Open questions

- Should the flyer and stickers in `docs/marketing/` print the preview address
  and the code, or should the code be shared only in person?
- Should the photo move (slice 1) land before the next launch-site deployment?
  It is invisible to the launch site, so either order is safe.
- Raise the budget, or accept the alerts while the preview runs?
