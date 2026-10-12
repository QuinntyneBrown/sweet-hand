# Sweet Hand launch backlog

**Status:** Scrum backlog for the [launch roadmap](launch-roadmap.md), 12 October 2026. Not a
specification: engineering stories that change production behaviour wait for their L1/L2,
detailed design and mock, and follow `implementing-incrementally` with acceptance tests first
(`AGENTS.md`). The sprint board (`npm run start:board` in `frontend/`, ADR 0013) reads this
file, so story IDs, titles, lanes, points and the sprint tables here are what it shows.

Work is grouped **Initiative → Epic → Story → Tasks**. Each story has a title, a description, a
definition of done and Fibonacci points (1, 2, 3, 5, 8, 13). Tick tasks off here as they're done;
story IDs are stable and never reused.

## Working agreement

### Sprints

Two weeks, Monday to Friday. Sprint 1 starts today.

| Sprint | Dates | Goal |
| --- | --- | --- |
| 1 | Mon 12 Oct – Fri 23 Oct | Decide and start |
| 2 | Mon 26 Oct – Fri 6 Nov | Founding caterers build their pages on production |
| 3 | Mon 9 Nov – Fri 20 Nov | The directory is full and the release is frozen |
| 4 | Mon 23 Nov – Fri 4 Dec | Launch and hold |

### Lanes and capacity

One founder carries two lanes. Points are sized within each lane, never compared across lanes.

| Lane | Who | Capacity per sprint |
| --- | --- | --- |
| **Engineering** | Founder with coding agents: the agents implement, the founder decides, reviews and releases | About 40 points; Sprint 1 about 30 (Thanksgiving) |
| **Business** | Founder: recruiting, shoots, marketing, legal, sales | About 25 points |

Measure points done per lane at each review, and plan the next sprint on that number, not on this
table.

### Ceremonies for a team of one

| Ceremony | When | Length | Output |
| --- | --- | --- | --- |
| Sprint planning | Monday of week 1, 09:00 | 45 min | Goal confirmed, stories in priority order, first agent tasks started |
| Daily check | Every working day, first thing | 10 min | Ticks updated here and in the founding-maker tracker; one blocker named |
| Refinement | Wednesday of week 2 | 30 min | The next sprint's stories meet the Definition of Ready |
| Sprint review | Friday of week 2, 15:00 | 45 min | The demo below, on a phone, against staging, UAT or production |
| Retrospective | After the review | 20 min | One thing to keep, one to drop, one to try |

### Definition of Ready

- The story has a description and a definition of done, and its points are agreed.
- **Engineering:** the L2, detailed design and mock it needs exist and are approved, or the story is itself the spec story that writes them.
- Any story it depends on is done, or comes earlier in the same sprint.

### Definition of Done

**Engineering, every story:**

- [ ] Given-When-Then acceptance criteria written in the story's L2, and an acceptance test was seen to fail first (backend: `backend/test/<area>/` against the in-memory database; frontend: Playwright with page objects, Chromium only)
- [ ] Implemented in thin slices with `implementing-incrementally`; no test weakened to pass
- [ ] CI green: backend tests and typecheck, lint, i18n check, builds, Playwright, Docker scan, Bicep build
- [ ] Merged to `main` by pull request and deployed to staging
- [ ] Specs, designs, mocks, ADRs, READMEs and `AGENTS.md` still match the code; a technical-debt entry is deleted when its item is resolved
- [ ] Works at phone width; meets WCAG 2.2 AA; all user-facing text marked for i18n

**Business, every story:**

- [ ] The outcome is recorded in the founding-maker tracker or the founder's operations folder
- [ ] Money spent is logged against the year-one budget (`business-plan.md` §Costs)
- [ ] Public copy is Canadian English, names each island tradition the maker gives, and spells dishes as the makers do
- [ ] No promise depends on a product feature that isn't specified; any feature need becomes a requirement instead
- [ ] Personal data is handled as the privacy policy says; the launch list is never used for anything but the launch-day email (L2-101)

## Sprint plan

### Sprint 1 · Mon 12 Oct – Fri 23 Oct · Decide and start

**Goal:**

- Launch scope locked in approved specs, designs and mocks.
- Staging and UAT running.
- The founding-maker offer out, with 40 makers recruited and the first 12 shot.
- The company and mailboxes set up.

| Order | Story | Lane | Points |
| --- | --- | --- | ---: |
| 1 | SH-01 Approve the pre-launch and launch-list drafts | Engineering | 2 |
| 2 | SH-02 Specify founding-caterer access in pre-launch | Engineering | 3 |
| 3 | SH-03 Design and mock founding-caterer access | Engineering | 5 |
| 4 | SH-04 Specify and design the product hand-over | Engineering | 5 |
| 5 | SH-05 Decide and specify production hardening | Engineering | 5 |
| 6 | SH-29 Stand up staging and UAT | Engineering | 5 |
| 7 | SH-11 Serve photos under `/api/media` | Engineering | 3 |
| 1 | SH-60 Incorporate and open business banking | Business | 3 |
| 2 | SH-61 Set up the sweethand.ca mailboxes | Business | 1 |
| 3 | SH-40 Founding-maker offer and agreement | Business | 3 |
| 4 | SH-43 Shoot production kit | Business | 3 |
| 5 | SH-41 Recruit the first 40 founding makers | Business | 5 |
| 6 | SH-51 Finish the social channels | Business | 2 |
| 7 | SH-52 Content calendar to 31 December | Business | 3 |
| 8 | SH-44 Studio block 1 | Business | 5 |
| | **Totals** | Engineering 28 · Business 25 | |

**Review demo:**

- The approved founding-access requirements, design and mocks.
- A green `main` commit deployed to `staging.sweethand.ca`.
- A cast photo served from `/api/media`.
- The tracker showing 40 signed makers.
- The first edited shoot.

### Sprint 2 · Mon 26 Oct – Fri 6 Nov · Founding caterers build their pages on production

**Goal:**

- Founding access is in production by Wed 4 Nov.
- The product app deploys to staging and UAT.
- Uploaded photos are stripped of location data.
- 100 makers are signed and 56 shot.

| Order | Story | Lane | Points |
| --- | --- | --- | ---: |
| 1 | SH-06 Operator issues founding-caterer invites | Engineering | 5 |
| 2 | SH-07 Caterer redeems an invite and registers in pre-launch | Engineering | 8 |
| 3 | SH-12 Product static hosting configuration | Engineering | 3 |
| 4 | SH-13 Deliver the product app through the pipeline | Engineering | 8 |
| 5 | SH-08 Founding caterer builds and submits a page in pre-launch | Engineering | 5 |
| 6 | SH-17 Refuse stand-in security keys in production | Engineering | 2 |
| 7 | SH-18 Create the first Admin operator by command | Engineering | 3 |
| 8 | SH-19 Strip location metadata and re-encode uploaded photos | Engineering | 5 |
| 9 | SH-10 Release founding access to production | Engineering | 3 |
| 1 | SH-62 Insurance | Business | 2 |
| 2 | SH-42 Recruit to 100 signed founding makers | Business | 5 |
| 3 | SH-45 Studio block 2 | Business | 8 |
| 4 | SH-63 Lawyer review | Business | 3 |
| 5 | SH-64 Services price sheet, booking and invoicing | Business | 3 |
| 6 | SH-47 Profile clinics, wave 1 | Business | 3 |
| | **Totals** | Engineering 42 · Business 24 | |

**Review demo:**

- On production, the founder issues an invite.
- A maker on a phone redeems it, builds a page and submits it.
- The founder approves the page, and the public listing is still hidden.
- A photo taken with GPS on comes out without it.

### Sprint 3 · Mon 9 Nov – Fri 20 Nov · The directory is full and the release is frozen

**Goal:**

- v1.0.0-rc.1 passes UAT and the switch-over is rehearsed.
- Monitoring and the restore drill are done.
- At least 80 founding pages are approved.
- The legal text is final.
- The launch kit and press are ready.
- Code freeze on Fri 20 Nov.

| Order | Story | Lane | Points |
| --- | --- | --- | ---: |
| 1 | SH-09 Founding caterers see their "live on launch day" status | Engineering | 3 |
| 2 | SH-24 Real terms and privacy content | Engineering | 3 |
| 3 | SH-14 Old launch links keep working after launch | Engineering | 5 |
| 4 | SH-21 Turn on bot protection | Engineering | 2 |
| 5 | SH-22 Admin route guard, email rate cap, breached-password list | Engineering | 3 |
| 6 | SH-20 Seed refuses a live database | Engineering | 2 |
| 7 | SH-25 Count visits from the product | Engineering | 3 |
| 8 | SH-26 External uptime monitor and alert routing | Engineering | 3 |
| 9 | SH-27 Database restore drill | Engineering | 3 |
| 10 | SH-16 Switch-over runbook and UAT rehearsal | Engineering | 5 |
| 11 | SH-30 Release candidate v1.0.0-rc.1 and code freeze | Engineering | 3 |
| 12 | SH-15 Shareable caterer pages with link previews *(first to slip)* | Engineering | 8 |
| 1 | SH-48 Profile clinics, wave 2 | Business | 3 |
| 2 | SH-49 Review and approve founding pages | Business | 3 |
| 3 | SH-46 Studio block 3 | Business | 8 |
| 4 | SH-54 Launch-day kit for makers | Business | 3 |
| 5 | SH-55 Press and community outreach | Business | 3 |
| 6 | SH-56 Christmas menus campaign | Business | 3 |
| 7 | SH-65 Book the first three paid sessions *(first to slip)* | Business | 3 |
| | **Totals** | Engineering 43 · Business 26 | |

**Review demo:**

- A recording of the UAT rehearsal: switch-over, launch email to test addresses, one rollback.
- The uptime alert firing.
- The restore time.
- 80 approved pages in the operator queue.
- A sample launch-day kit.

### Sprint 4 · Mon 23 Nov – Fri 4 Dec · Launch and hold

**Goal:**

- Go/no-go on Tue 24 Nov.
- v1.0.0 opens the product on Thu 26 Nov, and the launch email is sent.
- Hypercare.
- The Christmas menus campaign is live.
- Pre-orders and payments are specified.

| Order | Story | Lane | Points |
| --- | --- | --- | ---: |
| 1 | SH-31 Release v1.0.0 and run launch day | Engineering | 5 |
| 2 | SH-32 Launch hypercare and hotfixes | Engineering | 5 |
| 3 | SH-23 Real security keys for operators | Engineering | 8 |
| 4 | SH-33 Retire launch-site hosting | Engineering | 3 |
| 5 | SH-28 Asset budget tests and WCAG 2.2 checks | Engineering | 3 |
| 6 | SH-34 Specify pre-orders | Engineering | 5 |
| 7 | SH-35 Specify payments through Stripe | Engineering | 3 |
| 1 | SH-57 Launch-day run of show | Business | 2 |
| 2 | SH-53 Google Business Profile | Business | 1 |
| 3 | SH-58 First paid social test | Business | 2 |
| 4 | SH-66 Sponsor one-pager and three conversations | Business | 3 |
| 5 | SH-67 Plan the first supper club | Business | 2 |
| 6 | SH-68 90-day review scorecard | Business | 2 |
| 7 | SH-50 Founder's food handler certificate | Business | 2 |
| | **Totals** | Engineering 32 · Business 14 | |

Sprint 4 is light on purpose: launch week takes whatever it takes.

**Review demo:**

- Day-one and week-one numbers from the operator metrics.
- Hotfixes shipped.
- Approved L2s for pre-orders and payments.
- The scorecard.

---

## I1 Launch-ready product

Everything the product needs between "built and tested" and "open to the public": founding
caterers before launch, delivery of the product app, security and privacy hardening, reliability,
and the release itself. Engineering lane.

### E1.1 Launch specs and decisions

Requirements, designs, mocks and ADRs for every production change in this initiative, so the build
stories can start in Sprint 2.

#### SH-01 · Approve the pre-launch and launch-list drafts

Engineering · **2 points** · Sprint 1 · Traces: L1-024, L1-025, A-8, L2-092 to L2-107

As the founder, I want the draft launch requirements approved, so that the launch work builds on
settled requirements rather than drafts.

**Definition of done**

- L1-024, L1-025, A-8 and L2-092 to L2-107 are marked approved with the date.
- A-8's CASL wording is flagged "pending counsel" until SH-63 confirms it.
- Stale `<TO SUPPLY>` hosting notes now point to ADR 0011, in `docs/detailed-designs/README.md` and `docs/detailed-designs/launch/retire-launch-site/README.md`.

**Tasks**

- [ ] Read L1-024, L1-025, A-8 and L2-092 to L2-107 against what's built; note any differences
- [ ] Mark them approved in `docs/specs/L1.md` and `docs/specs/L2.md`
- [ ] Replace the stale hosting notes in the retire-launch-site design with Static Web Apps (ADR 0011)
- [ ] Add the missing `platform/deploy-to-azure` row to `docs/detailed-designs/README.md`

#### SH-02 · Specify founding-caterer access in pre-launch

Engineering · **3 points** · Sprint 1 · Traces: L1-011, L1-013, L1-024 (amended)

As the founder, I want founding-caterer access written as requirements, so that recruited caterers
can build and get approved on production while the public still sees only the launch site.

**Definition of done**

- A new L1 (the next free ID) and its L2s are approved. They follow the `engineering-requirements` skill, with Given-When-Then criteria, and cover:
  - An Admin issues, lists and revokes single-use invites with a lifetime; every action is audited.
  - In pre-launch, a caterer registers only through a valid invite. Customer registration and every public product route stay closed.
  - An invited caterer builds, submits and is approved through the existing L2-037 to L2-048 rules.
  - An approved page isn't public until launch, and every approved page appears when pre-launch ends.
  - After launch, an invite link leads to the ordinary `/join`.
  - Invite codes are unguessable and rate-limited; redemption failures go to the security log.
- Open choices are decided and written down: invite lifetime, and whether invites go by email, by a link the operator shares (for example on WhatsApp), or both.

**Tasks**

- [ ] Read `backend/src/http/prelaunch-gate.ts` and `backend/src/operator-settings/invitations.ts` to see what pre-launch hides and what operator invitations already do
- [ ] Draft the L1 and L2s with the `engineering-requirements` skill
- [ ] Decide invite lifetime and delivery; record them in the L2
- [ ] Founder approves

#### SH-03 · Design and mock founding-caterer access

Engineering · **5 points** · Sprint 1 · Traces: SH-02's L2s

As the founder, I want the design and mocks for founding access, so that the build stories in
Sprint 2 have nothing left to decide.

**Definition of done**

- `docs/detailed-designs/caterer-profiles/founding-caterer-access/README.md` exists. It follows the `writing-software-design-documents` skill, with C4, class and sequence diagrams for issuing, redeeming and launch-day publishing.
- `docs/detailed-designs/README.md` has a row for it.
- Mocks follow the `writing-html-mocks` skill, at phone and desktop width, in light and dark:
  - The operator's invite page and dialog in every state: empty, issued, copied, revoked, expired.
  - Invite redemption on `/join` in every state: valid, expired, used, revoked, unknown, and no invite during pre-launch.
  - The caterer dashboard's "goes live on 26 November" state.
- `docs/mocks/manifest.json`, the index and the coverage table are updated.

**Tasks**

- [ ] Write the detailed design and render its diagrams
- [ ] Write the operator invite mocks
- [ ] Write the redemption mocks
- [ ] Write the dashboard "live on launch day" mock
- [ ] Update the manifest, index and coverage table

#### SH-04 · Specify and design the product hand-over

Engineering · **5 points** · Sprint 1 · Traces: L1-023, L2-018, L2-102, L2-108

As the founder, I want the move from launch site to product specified and designed, so that the
product can be delivered, previewed and switched on without surprises.

**Definition of done**

- Approved L2s or amendments cover:
  - Photos served under `/api/media/:id` (tracing to L1-023).
  - The product app's static hosting configuration: deep links, security headers and CSP, cache rules, and robots for non-production environments.
  - Delivery of the product app, with smoke checks for pre-launch and post-launch modes.
  - L2-102 brought up to date for Static Web Apps.
- The design decides **how invited caterers reach the product while `/` still serves the launch site**, for example a caterer host such as `makers.sweethand.ca` on the same API, or product routes beside the launch app on one host. It is recorded as an ADR.
- The approach to L2-018 criterion 4 (caterer page HTML without JavaScript, for link previews) is decided.
- A mock for the launch-list removal page on the product exists (`docs/mocks/pages/`), with the manifest updated.

**Tasks**

- [ ] Write the L2s for `/api/media`, the product hosting config and product delivery
- [ ] Update L2-102 and the retire-launch-site design
- [ ] Write the ADR for how the product is served during pre-launch (`recording-architecture-decisions`)
- [ ] Decide the L2-018 criterion 4 approach (prerendered caterer pages or server rendering)
- [ ] Mock the removal page in every state; update the manifest

#### SH-05 · Decide and specify production hardening

Engineering · **5 points** · Sprint 1 · Traces: L1-021, L2-041, L2-056, L2-076

As the founder, I want the security and privacy stand-ins replaced by decisions and requirements,
so that nothing in production depends on a test stand-in.

**Definition of done**

- ADRs (`recording-architecture-decisions`) are recorded:
  - The WebAuthn library that replaces the `local-key:` stand-in (`backend/src/platform/security-key.ts`).
  - `sharp` for image processing in place of `PassThroughImageProcessing`: strip metadata, re-encode, and produce the L2-041 renditions.
- Rows are added to `docs/adr/README.md`.
- L2 criteria cover:
  - Production refuses stand-in security keys and stand-in email-event tokens.
  - A command creates the first Admin and refuses when one exists.
  - `npm run seed` refuses a database that holds real data.
- The production email rate cap is decided (`backend/src/platform/email-dispatch.ts`).

**Tasks**

- [ ] Compare WebAuthn libraries for Node.js 22 and NestJS; write the ADR
- [ ] Write the image-processing ADR, including the Docker image's native dependency
- [ ] Write the L2 criteria for stand-in refusal, the first Admin and the seed guard
- [ ] Set the email rate cap from the ACS sending limits

### E1.2 Founding caterers before launch

The new founding-caterer access, built and released to production so the first pages are ready on
launch day.

#### SH-06 · Operator issues founding-caterer invites

Engineering · **5 points** · Sprint 2 · Traces: SH-02's L2s

As an Admin operator, I want to issue an invite link for a maker I've recruited, so that only the
makers I've chosen can register before launch.

**Definition of done**

- An Admin can issue, list and revoke invites through the API and the operator pages, as in the SH-03 mocks.
- Every action is in the audit log.
- Non-Admin roles are refused, and the catalog-driven policy test covers the new routes.
- The backend acceptance tests and the Playwright spec (with its page object) pass.

**Tasks**

- [ ] Write the failing backend acceptance test for issuing, listing, revoking and expiry
- [ ] Add the domain and use cases (beside `backend/src/operator-settings/`), with `@UsePolicy(admins)`
- [ ] Write audit log entries
- [ ] Add `FoundingInviteService` and `HttpFoundingInviteService` to `projects/api`
- [ ] Build the operator page and dialog from the mocks
- [ ] Add the page object and e2e spec

#### SH-07 · Caterer redeems an invite and registers in pre-launch

Engineering · **8 points** · Sprint 2 · Traces: SH-02's L2s, L2-037, L2-077

As a founding caterer, I want to open my invite link and create my caterer account before launch,
so that my page is ready on launch day.

**Definition of done**

- In pre-launch mode, a valid invite lets a caterer register and verify their email.
- Expired, used, revoked and unknown invites show the mocked messages.
- Without an invite, registration stays closed. Customer registration and every public product route stay hidden; the pre-launch gate tests prove it.
- Redemption is rate-limited and failures go to the security log.
- Backend and Playwright tests pass.

**Tasks**

- [ ] Extend the pre-launch gate tests with the invite cases; see them fail
- [ ] Let invited caterers through `backend/src/http/prelaunch-gate.ts`, and only them
- [ ] Redeem the invite in registration as a single-use transaction
- [ ] Build the redemption states on `/join` from the mocks
- [ ] Add the page object and e2e spec

#### SH-08 · Founding caterer builds and submits a page in pre-launch

Engineering · **5 points** · Sprint 2 · Traces: SH-02's L2s, L2-038 to L2-048

As a founding caterer, I want to add my photos, menu, areas, event sizes, occasions and food handler
certificate, then submit, so that an operator can approve my page before launch.

**Definition of done**

- Page setup, drafts, photo upload, certificate upload and submission work for an invited caterer in pre-launch.
- The operator review queue and decisions work in pre-launch.
- An approved page isn't reachable publicly until pre-launch ends.
- Tests prove each of these.

**Tasks**

- [ ] Write the failing tests for setup, submission and approval in pre-launch
- [ ] Open the caterer and operator routes to signed-in invited caterers and operators in pre-launch
- [ ] Keep the public listing and caterer page closed; test it
- [ ] Add the Playwright journey, from invite to approval, with page objects

#### SH-10 · Release founding access to production

Engineering · **3 points** · Sprint 2 · Traces: L2-109

As the founder, I want founding access in production by Wednesday 4 November, so that makers can
build their pages in the clinics.

**Definition of done**

- `v0.2.0-rc.1` passed UAT with a real invite on a real phone.
- `v0.2.0` is in production, still in pre-launch mode.
- The first Admin was created with SH-18 and enrolled in an authenticator app.
- The first five invites are issued and redeemed.

**Tasks**

- [ ] Tag `v0.2.0-rc.1`; walk the invite journey in UAT
- [ ] Tag `v0.2.0`; approve the production deployment
- [ ] Create the first Admin in production; enrol two-factor
- [ ] Issue and send the first five invites; watch the security log

#### SH-09 · Founding caterers see their "live on launch day" status

Engineering · **3 points** · Sprint 3 · Traces: SH-02's L2s, L2-045

As an approved founding caterer, I want my dashboard to say my page goes live on 26 November and
let me preview it, so that I know I'm done and can plan my launch-day post.

**Definition of done**

- Before launch, an approved caterer's dashboard shows the mocked "live on launch day" state with a private preview of their page.
- After launch, the dashboard shows the ordinary published state.
- The Playwright spec covers both, using the test-mode clock and scenarios.

**Tasks**

- [ ] Write the failing e2e spec with a pre-launch scenario
- [ ] Build the dashboard state and the preview
- [ ] Prove the post-launch state

### E1.3 Product delivery and hand-over

The product app built, configured and deployed, and the switch from launch site to product
rehearsed.

#### SH-11 · Serve photos under /api/media

Engineering · **3 points** · Sprint 1 · Traces: SH-04's L2, L1-023 · Public preview plan slice 1

As a visitor, I want every photo to load in production, so that caterer pages look as they do in
development.

**Definition of done**

- `GET /api/media/:id` serves photos, and the old route is gone.
- One helper builds every photo URL, in place of the inline `/media/...` strings.
- `/media` is gone from `frontend/proxy.conf.mjs`.
- A backend test fetches a cast photo at the new path, and the Playwright pages still show photos.

**Tasks**

- [ ] Write the failing backend test
- [ ] Move the route in `backend/src/discovery/discovery.controller.ts`
- [ ] Replace the inline URLs (for example `backend/src/discovery/photos.ts`, `backend/src/moderation/views.ts`) with the helper
- [ ] Update the dev proxy and run the e2e suite

#### SH-12 · Product static hosting configuration

Engineering · **3 points** · Sprint 2 · Traces: SH-04's L2 · Public preview plan slice 9

As a visitor, I want deep links to open, and the product served with the same security headers as
the launch site, so that shared links work and the site is safe.

**Definition of done**

- `frontend/projects/sweet-hand/public/staticwebapp.config.json` has:
  - A navigation fallback.
  - The launch app's security headers and CSP.
  - Cache rules for hashed assets.
- Staging and UAT send `noindex` and a disallow-all `robots.txt`; production stays indexable.

**Tasks**

- [ ] Start from `frontend/projects/launch/public/staticwebapp.config.json`
- [ ] Add the navigation fallback and cache rules
- [ ] Add the non-production robots overlay to delivery
- [ ] Check a deep link and the headers on staging

#### SH-13 · Deliver the product app through the pipeline

Engineering · **8 points** · Sprint 2 · Traces: SH-04's L2, L2-108, L2-109

As the founder, I want every release to build and deploy the product app as SH-04 designed, so that
staging and UAT run the product and launch day is a release, not a rebuild.

**Definition of done**

- `.github/workflows/deliver.yml` builds `sweet-hand` and deploys it as designed.
- The smoke checks know the mode:
  - In pre-launch, `/api/caterers` returns 404 and invite redemption works.
  - After launch, `/api/caterers` returns 200.
  - In both, deep links resolve and a photo loads.
- A failed smoke check restores the previous image, as it does today.
- `infra/main.bicep` carries any new hostname or setting.
- Staging deploys the product on every green `main` commit.

**Tasks**

- [ ] Add the product build and upload steps
- [ ] Make the smoke checks follow `prelaunchMode`
- [ ] Add any hostname, DNS record and Bicep change from the SH-04 ADR
- [ ] Run a full delivery to staging, then UAT

#### SH-16 · Switch-over runbook and UAT rehearsal

Engineering · **5 points** · Sprint 3 · Traces: L2-101, L2-102

As the founder, I want launch day written down and rehearsed, so that the morning of 26 November is
a checklist, not an experiment.

**Definition of done**

- A "Launch day" section in `docs/operations/azure-production.md` gives the exact steps, timings and rollback. It includes how to run `npm run launch-email` against production.
- A full rehearsal on UAT is done and timed:
  - The MAJOR release ends pre-launch mode.
  - The launch email goes to test addresses.
  - One rollback.

**Tasks**

- [ ] Write the runbook section
- [ ] Rehearse on UAT with the release candidate
- [ ] Record the timings; fix what the rehearsal found

#### SH-14 · Old launch links keep working after launch

Engineering · **5 points** · Sprint 3 · Traces: L2-102

As someone on the launch list, I want the links in my launch emails to work after launch, so that I
can still confirm, remove my email or reach the product.

**Definition of done**

- `launchLinkRedirect` and the launch-list removal page work in the product, as in the SH-04 mock.
- `backend/test/launch-list/after-launch.test.ts` and `frontend/e2e/specs/launch-list/after-launch.spec.ts` pass.

**Tasks**

- [ ] Write the failing backend and e2e tests
- [ ] Add `features/launch-list/` to the product, with its route and page object
- [ ] Check the links from a launch email on UAT

#### SH-15 · Shareable caterer pages with link previews

Engineering · **8 points** · Sprint 3 · Traces: L2-018 (criterion 4) · *First engineering story to slip*

As a founding caterer, I want my page to show my photo and name when I share it on WhatsApp,
Facebook or Instagram, so that my launch-day post brings people to my page.

**Definition of done**

- A caterer page's HTML carries its title, description and Open Graph image without JavaScript, as SH-04 decided.
- L2-018 criterion 4's test passes.
- A shared link previews correctly on WhatsApp and Facebook from UAT.

**Tasks**

- [ ] Write the failing test for criterion 4
- [ ] Implement the SH-04 approach
- [ ] Check previews with the Facebook sharing debugger and WhatsApp

### E1.4 Security and privacy hardening

The test stand-ins and missing guards replaced before real people and real photos arrive.

#### SH-17 · Refuse stand-in security keys in production

Engineering · **2 points** · Sprint 2 · Traces: SH-05's L2, L2-076

As an operator, I want production to refuse the test stand-in for security keys, so that nobody can
pass two-factor sign-in with a made-up key.

**Definition of done**

- Outside test mode, `local-key:` values and stand-in email-event tokens are refused, and the refusal is in the security log.
- Operators use an authenticator app until SH-23.
- A backend test proves the refusal.

**Tasks**

- [ ] Write the failing test with production configuration
- [ ] Refuse the stand-ins in `backend/src/platform/security-key.ts` and `backend/src/platform/email-events.ts` outside test mode
- [ ] Note the authenticator-only rule in `docs/operations/azure-production.md`

#### SH-18 · Create the first Admin operator by command

Engineering · **3 points** · Sprint 2 · Traces: SH-05's L2, L2-056

As the founder, I want to create the first Admin with one command, so that someone can approve
founding pages and invite other operators.

**Definition of done**

- An `npm run` command creates an Admin with a one-time sign-in that requires two-factor enrolment.
- It refuses when an Admin already exists.
- It writes an audit entry.
- It is documented in `backend/README.md` and the production runbook, and a backend test covers it.

**Tasks**

- [ ] Write the failing test
- [ ] Add the command beside `backend/src/seed/run.ts`
- [ ] Document how to run it against production

#### SH-19 · Strip location metadata and re-encode uploaded photos

Engineering · **5 points** · Sprint 2 · Traces: SH-05's ADR, L2-041 (criteria 4 to 6)

As a caterer who cooks at home, I want my uploaded photos stripped of location data, so that a
photo never reveals where I live.

**Definition of done**

- Every upload is auto-oriented, stripped of EXIF, XMP and GPS data, re-encoded, and stored with the L2-041 renditions.
- A test uploads a photo with GPS tags and proves the stored files carry none.
- The Docker image builds with the native dependency and passes its scan.

**Tasks**

- [ ] Write the failing test with a GPS-tagged fixture
- [ ] Implement `sharp` image processing in place of `PassThroughImageProcessing` (`backend/src/platform/image-processing.ts`)
- [ ] Serve the renditions where L2-006 asks for them
- [ ] Update `backend/Dockerfile`; check the image scan

#### SH-20 · Seed refuses a live database

Engineering · **2 points** · Sprint 3 · Traces: SH-05's L2

As the founder, I want `npm run seed` to refuse a database that holds real people, so that the
fictional cast can never be loaded into production.

**Definition of done**

- The seed refuses as the L2 says, with a clear message.
- A backend test proves it.
- `backend/README.md` says so.

**Tasks**

- [ ] Write the failing test
- [ ] Add the guard to `backend/src/seed/run.ts`

#### SH-21 · Turn on bot protection

Engineering · **2 points** · Sprint 3 · Traces: L2-025, L2-104

As the founder, I want the Turnstile challenge live, so that launch-day registration and enquiry
forms resist bots.

**Definition of done**

- The Cloudflare Turnstile widget exists, and its keys are in Key Vault.
- Delivery no longer warns that bot protection is off.
- The challenge works on UAT and production.

**Tasks**

- [ ] Create the widget for the production, UAT and staging hostnames
- [ ] Store the keys; set the delivery choice
- [ ] Check a challenged form on UAT

#### SH-22 · Admin route guard, email rate cap and breached-password list

Engineering · **3 points** · Sprint 3 · Traces: L2-079, L2-030, L2-076 · Technical debt T-19

As the founder, I want the small security gaps closed before launch, so that admin pages, email
sending and passwords behave as specified under real traffic.

**Definition of done**

- `requireAdmin` guards the admin routes (T-19 deleted from `docs/technical-debt/frontend.md`).
- The email rate cap from SH-05 is applied.
- The breached-password list in `backend/src/identity/passwords.ts` is a real list of common passwords.
- Each change has a test.

**Tasks**

- [ ] Guard the admin routes; e2e for a non-Admin operator
- [ ] Apply the rate cap in `backend/src/platform/email-dispatch.ts`
- [ ] Replace the seven-entry breached-password list

#### SH-24 · Real terms and privacy content

Engineering · **3 points** · Sprint 3 · Traces: L2-070, L2-075 · Depends on SH-61, SH-63

As a caterer or customer, I want the terms and privacy policy to be true, so that I know who handles
my data and how to reach Sweet Hand.

**Definition of done**

- The mocks (`docs/mocks/pages/privacy`, `docs/mocks/pages/terms`) are updated first. Then the pages, `shell/system-page.html` and the delete-account dialog:
  - Name the real processors: Azure in Canada Central, Azure Communication Services for email, Cloudflare Turnstile for the bot check.
  - Use real `@sweethand.ca` addresses.
  - Take effect on 26 November 2026.
  - Include counsel's edits.
- The e2e copy assertions match.

**Tasks**

- [ ] Update the mocks with counsel's edits
- [ ] Update `privacy.page.html` and `terms.page.html`
- [ ] Replace every `@sweethand.example` address in the product
- [ ] Run the e2e suite

#### SH-23 · Real security keys for operators

Engineering · **8 points** · Sprint 4 · Traces: SH-05's ADR, L2-076

As an operator, I want to sign in with a real security key, so that the strongest two-factor method
works in production.

**Definition of done**

- WebAuthn registration and verification use the library chosen in SH-05.
- The `local-key:` stand-in remains for test mode only.
- Production operators can enrol a key.
- Backend and e2e tests pass.

**Tasks**

- [ ] Write the failing tests for registration and verification
- [ ] Implement with the chosen library
- [ ] Keep the test-mode stand-in behind `TEST_CONTROL`
- [ ] Enrol the founder's key in production

### E1.5 Reliability and observability

Seeing launch day as it happens, and knowing the data can come back.

#### SH-25 · Count visits from the product

Engineering · **3 points** · Sprint 3 · Traces: L2-062 · Technical debt T-60 (part)

As an operator, I want visits counted, so that the metrics dashboard shows real traffic from launch
day.

**Definition of done**

- The product sends visits to `POST /api/visits` as L2-062 says.
- The metrics dashboard shows them.
- A Playwright spec covers it, and the L2-062 part of T-60 is removed.

**Tasks**

- [ ] Write the failing e2e spec
- [ ] Send the visit from the product
- [ ] Check the dashboard on staging

#### SH-26 · External uptime monitor and alert routing

Engineering · **3 points** · Sprint 3 · Traces: L2-088

As the founder, I want an alert when sweethand.ca or its API goes down, so that I hear about it
before the makers do.

**Definition of done**

- Availability tests for `/` and `/health/ready` are in `infra/main.bicep`.
- Alerts reach the founder's email and phone.
- One alert has been tested by stopping the UAT API.

**Tasks**

- [ ] Add the Application Insights availability tests and the alert rule
- [ ] Route alerts to email and SMS
- [ ] Fire a test alert on UAT

#### SH-27 · Database restore drill

Engineering · **3 points** · Sprint 3 · Traces: L2-090

As the founder, I want to have restored the database once before launch, so that recovery is a
practised step, not a guess.

**Definition of done**

- A point-in-time restore of the production database to a scratch server is done and verified by counts.
- The time is recorded in `docs/operations/azure-production.md`.
- The scratch server is deleted.

**Tasks**

- [ ] Restore to a scratch server
- [ ] Compare counts of users, caterers and media
- [ ] Record the steps and time; delete the server

#### SH-28 · Asset budget tests and WCAG 2.2 checks

Engineering · **3 points** · Sprint 4 · Traces: L2-087, L2-066 · Technical debt T-58, T-60 (part)

As a customer on a phone, I want the product fast and accessible, so that it works on my phone and
with my assistive technology.

**Definition of done**

- L2-087's budgets are tested.
- axe runs with the WCAG 2.2 AA tags, and any violations are fixed.
- T-58 and the L2-087 part of T-60 are deleted from the register.

**Tasks**

- [ ] Write the budget test
- [ ] Switch the axe tags; fix violations
- [ ] Update the technical-debt register

### E1.6 Environments and release

The road from `main` to production, used for every release from Sprint 1.

#### SH-29 · Stand up staging and UAT

Engineering · **5 points** · Sprint 1 · Traces: L2-109, ADR 0012

As the founder, I want staging and UAT running, so that every release is seen before production, as
ADR 0012 requires.

**Definition of done**

- `staging.sweethand.ca` and `uat.sweethand.ca` exist, set up with `infra/new-environment.ps1` (`docs/operations/environments.md` §Setting up staging and UAT).
- GitHub environments and tag rulesets are in place.
- A green `main` commit reaches staging.
- The production DNS records and the ACS domain verification are confirmed.
- The budget decision for production (raise `budgetAmount` or accept the alerts) is recorded.

**Tasks**

- [ ] Run `infra/new-environment.ps1` for staging and UAT
- [ ] Add the Namecheap CNAMEs; bind the hostnames
- [ ] Configure the GitHub environments and tag rulesets
- [ ] Confirm the production DNS records and ACS verification
- [ ] Record the budget decision in the runbook

#### SH-30 · Release candidate v1.0.0-rc.1 and code freeze

Engineering · **3 points** · Sprint 3 · Traces: L2-109

As the founder, I want the launch release frozen and tested in UAT by 20 November, so that the last
week before launch is for fixes only.

**Definition of done**

- `v1.0.0-rc.1` is in UAT by Wed 18 Nov.
- A phone test script covers the customer, caterer and operator journeys, and it has passed.
- Defects are triaged; any fix ships as `rc.2`.
- After Fri 20 Nov, only fixes for launch-blocking defects merge.

**Tasks**

- [ ] Write the UAT test script from the L2 journeys
- [ ] Tag the release candidate; run the script on a phone
- [ ] Triage and fix; tag `rc.2` if needed

#### SH-31 · Release v1.0.0 and run launch day

Engineering · **5 points** · Sprint 4 · Traces: L2-101, L2-102

As the founder, I want to open Sweet Hand on 26 November, so that founding caterers are found and
the launch list gets its one email.

**Definition of done**

- The go/no-go on Tue 24 Nov is recorded against the [roadmap's criteria](launch-roadmap.md#gono-go-tuesday-24-november).
- `v1.0.0` is in production.
- The smoke checks pass, and the launch email is queued and sent.
- Day-one numbers are recorded.

**Tasks**

- [ ] Hold the go/no-go; record it
- [ ] Follow the SH-16 runbook to the minute
- [ ] Run `npm run launch-email`; watch the outbox drain
- [ ] Record day-one numbers

#### SH-32 · Launch hypercare and hotfixes

Engineering · **5 points** · Sprint 4 · Traces: L2-088, L2-089

As the founder, I want the first week watched closely, so that problems are fixed while people are
first trying Sweet Hand.

**Definition of done**

- From 26 Nov to 4 Dec there is a daily check of Application Insights, the outbox, the moderation queue and the security log.
- Hotfixes follow `docs/operations/environments.md` §Hotfixes.
- Findings go into the Sprint 5 backlog.

**Tasks**

- [ ] Run the daily check
- [ ] Ship hotfixes through UAT
- [ ] Write the Sprint 5 candidates

#### SH-33 · Retire launch-site hosting

Engineering · **3 points** · Sprint 4 · Traces: L2-102

As the founder, I want the launch site's leftovers removed after launch, so that only the product is
deployed and maintained.

**Definition of done**

- Everything L2-102 says goes after launch is gone: the launch build in delivery, its hosting, and `frontend/projects/launch`.
- The launch-list sweep keeps running until the list is deleted on 26 Dec.
- `AGENTS.md`, `README.md` and `frontend/README.md` no longer describe the launch app.

**Tasks**

- [ ] Remove the launch build from delivery
- [ ] Delete the launch hosting, if it's separate
- [ ] Delete `frontend/projects/launch`; update the layouts in `AGENTS.md` and the READMEs

---

## I2 Founding makers

A hundred photographed makers recruited, shot and approved before launch: supply first, as the
business plan says. Business lane.

### E2.1 Recruitment

#### SH-40 · Founding-maker offer and agreement

Business · **3 points** · Sprint 1 · Traces: business plan §Go-to-market

As a maker, I want to understand exactly what I get and what I promise, so that I can say yes with
confidence.

**Definition of done**

- A one-page offer and agreement exists:
  - The maker gets a free 10-dish studio shoot (a CAD 249 value).
  - The maker promises a complete page by 20 November, a food handler certificate, and a launch-day post.
  - It sets out a photo licence: the maker uses the photos freely; Sweet Hand may use them in its marketing, with credit.
- It never asks for a home address.
- It's sent to counsel with SH-63, and makers can sign it digitally.

**Tasks**

- [ ] Draft the offer and agreement
- [ ] Set up digital signing
- [ ] Send to counsel with the SH-63 brief

#### SH-41 · Recruit the first 40 founding makers

Business · **5 points** · Sprint 1 · Traces: business plan §Go-to-market

As the founder, I want 40 makers signed in the first two weeks, so that the first studio days are
full and word spreads from them.

**Definition of done**

- A founding-maker tracker exists, with these fields: business name, contact, island traditions, area, dishes, certificate status, shoot date, invite sent, page status, launch post.
- 40 makers have signed.
- At least 12 are booked into studio block 1.
- The tracker shows a spread of island traditions and GTA municipalities.

**Tasks**

- [ ] Build the tracker
- [ ] Reach the founder's network, churches, and WhatsApp and Facebook seller groups
- [ ] Message makers already selling on Instagram
- [ ] Book block 1
- [ ] Do not recruit from the launch list (L2-101)

#### SH-42 · Recruit to 100 signed founding makers

Business · **5 points** · Sprint 2 · Traces: business plan §Go-to-market

As the founder, I want 100 makers signed by 6 November, so that every studio day in block 3 is
booked.

**Definition of done**

- 100 makers have signed.
- All are booked into blocks 2 and 3.
- Each maker's certificate status is known, and those without a certificate have been pointed to a course.
- Flyers and stickers are at Caribbean grocers and churches across the GTA.

**Tasks**

- [ ] Drop flyers and stickers (`docs/marketing/`) at grocers and churches
- [ ] Share video 05 (Cater with Sweet Hand) in seller groups
- [ ] Ask each signed maker for one referral
- [ ] Book blocks 2 and 3

### E2.2 Studio shoots

Twenty studio days at CAD 100 each, about five makers a day.

#### SH-43 · Shoot production kit

Business · **3 points** · Sprint 1

As the founder, I want a repeatable shoot day, so that five makers a day get consistent photos
delivered within three days.

**Definition of done**

- The kit has:
  - A booking calendar.
  - A 10-dish shot list: hero, overhead and detail, cropped to the product's photo ratios.
  - A run sheet with one-hour slots.
  - A lighting setup.
  - An edit preset.
  - A file-naming and delivery folder that meets the L2-041 upload limits.
- It was tested on the first shoot day.

**Tasks**

- [ ] Book the studio for blocks 1 to 3
- [ ] Write the shot list and run sheet
- [ ] Build the edit preset and delivery template
- [ ] Check the files against the upload limits

#### SH-44 · Studio block 1

Business · **5 points** · Sprint 1 (20 to 23 Oct)

As a founding maker, I want my dishes shot in the studio, so that my page opens with the best photos
in the city.

**Definition of done**

- 3 studio days, about 12 makers shot.
- Photos edited and delivered within 3 working days.
- Lessons fed back into the kit.

**Tasks**

- [ ] Run the shoot days
- [ ] Edit and deliver
- [ ] Update the kit

#### SH-45 · Studio block 2

Business · **8 points** · Sprint 2

As a founding maker, I want my shoot before the profile clinics, so that I have my photos when I
build my page.

**Definition of done**

- 9 studio days, about 44 makers shot (56 in total).
- Every set delivered within 3 working days.

**Tasks**

- [ ] Run the shoot days, Saturdays included
- [ ] Edit and deliver
- [ ] Record each maker's delivery in the tracker

#### SH-46 · Studio block 3

Business · **8 points** · Sprint 3

As a founding maker, I want my shoot in time to go live on launch day, so that I'm on the site from
day one.

**Definition of done**

- 8 studio days, about 44 makers shot (100 in total).
- Photos delivered by Fri 20 Nov.
- Anyone not shot is rebooked into December.

**Tasks**

- [ ] Run the shoot days
- [ ] Edit and deliver
- [ ] Rebook no-shows into December

### E2.3 Pages live

#### SH-47 · Profile clinics, wave 1

Business · **3 points** · Sprint 2 · Depends on SH-10

As a founding maker, I want help building my page, so that it's complete and submitted without
struggling alone.

**Definition of done**

- Two clinics have run (studio or video call) after founding access reached production.
- At least 20 pages are submitted.
- Common questions are written into a one-page guide.

**Tasks**

- [ ] Send invites to every maker with delivered photos
- [ ] Run the clinics
- [ ] Write the one-page guide

#### SH-48 · Profile clinics, wave 2

Business · **3 points** · Sprint 3

As a founding maker, I want a second chance at a clinic, so that my page is approved before launch.

**Definition of done**

- At least 85 pages are submitted by Wed 18 Nov.
- Every maker who hasn't submitted has been contacted twice.

**Tasks**

- [ ] Run clinics
- [ ] Chase by WhatsApp and phone
- [ ] Update the tracker daily

#### SH-49 · Review and approve founding pages

Business · **3 points** · Sprint 3 · Traces: L2-047, L2-048

As a founding maker, I want my page reviewed within a working day, so that I can fix anything before
launch.

**Definition of done**

- Every submitted page is decided within one working day, against a checklist:
  - No home address or identifying details in the text or photos.
  - A certificate is present.
  - Island traditions are specific, not a generic "Caribbean".
  - Dish names are spelled as the maker spells them.
  - Allergens and dietary tags are filled in, not left in the description.
- At least 80 pages are approved by Fri 20 Nov.

**Tasks**

- [ ] Write the review checklist
- [ ] Work the operator queue daily
- [ ] Send changes back with clear reasons

---

## I3 Launch marketing and demand

People arriving on launch day to find makers, through the makers' own audiences first. Business
lane.

### E3.1 Channels and content

#### SH-51 · Finish the social channels

Business · **2 points** · Sprint 1 · Traces: `docs/marketing/youtube/`, `facebook/`, `instagram/`

As the founder, I want YouTube, Facebook and Instagram finished, so that every channel is ready
before recruiting traffic arrives.

**Definition of done**

- YouTube: phone verified, custom thumbnail, pinned comment.
- Facebook: first two posts and the video share.
- Instagram: published.
- Each README records its published dates.

**Tasks**

- [ ] Finish the YouTube steps in `docs/marketing/youtube/README.md`
- [ ] Post the Facebook items in `docs/marketing/facebook/README.md`
- [ ] Publish Instagram per `docs/marketing/instagram/README.md`

#### SH-52 · Content calendar to 31 December

Business · **3 points** · Sprint 1

As the founder, I want posts planned to the end of December, so that posting happens every day
without daily decisions.

**Definition of done**

- The calendar sets out:
  - Weekly themes.
  - A daily maker story from Mon 9 Nov, posted with the maker's consent.
  - A launch-list call to action until 26 Nov, then a link to the product.
  - The Christmas menus campaign from 26 Nov.
- The first two weeks are scheduled.

**Tasks**

- [ ] Write the calendar
- [ ] Schedule the first two weeks in Meta Business Suite
- [ ] Get consent for each maker story

#### SH-53 · Google Business Profile

Business · **1 point** · Sprint 4 · Traces: business plan §Go-to-market

As a customer searching Google, I want to find Sweet Hand, so that a search for Caribbean food in
Toronto leads to the makers.

**Definition of done**

- A verified Google Business Profile exists as a service-area business: no address shown, linked to sweethand.ca.

**Tasks**

- [ ] Create and verify the profile
- [ ] Add photos from the studio library

### E3.2 Launch campaign

#### SH-54 · Launch-day kit for makers

Business · **3 points** · Sprint 3

As a founding maker, I want everything for my launch-day post ready to send, so that I post at 10:30
on 26 November without making anything.

**Definition of done**

- Every approved maker has received:
  - Their page link.
  - A square image and a 9:16 story image of their dishes.
  - A WhatsApp Status image.
  - A caption in plain words.
- It was sent on Mon 23 Nov.

**Tasks**

- [ ] Make the templates (consider extending `docs/marketing/render.mjs`)
- [ ] Produce one kit per maker
- [ ] Send on 23 Nov; confirm receipt

#### SH-55 · Press and community outreach

Business · **3 points** · Sprint 3

As the founder, I want launch coverage in Toronto food and Caribbean media, so that people beyond
the makers' audiences hear about Sweet Hand.

**Definition of done**

- Under an embargo to 10:00 on 26 Nov, a press release, ten photos and three maker stories have gone to:
  - blogTO, Toronto Life, CBC Toronto and the Toronto Star food writers.
  - Share and the Caribbean Camera.
  - Caribbean radio.
- Follow-ups are done.

**Tasks**

- [ ] Write the release and the three stories
- [ ] Build the media list
- [ ] Send, then follow up

#### SH-56 · Christmas menus campaign

Business · **3 points** · Sprint 3 (runs 26 Nov to 20 Dec)

As a customer planning Christmas, I want to find makers taking orders for black cake, sorrel,
pastelles and the rest, so that I can send them an enquiry in time.

**Definition of done**

- At least 30 makers have Christmas items on their menus.
- The posts are scheduled.
- The campaign's success is measured in enquiries (operator metrics, L2-061).
- Everything runs through enquiries; no pre-ordering or payment is promised.

**Tasks**

- [ ] Ask makers to add their Christmas items
- [ ] Write and schedule the posts
- [ ] Set the enquiry baseline

#### SH-57 · Launch-day run of show

Business · **2 points** · Sprint 4

As the founder, I want an hour-by-hour plan for 26 November that matches the engineering runbook, so
that posts, press and the release land in the right order.

**Definition of done**

- The run of show matches SH-16 and the [roadmap](launch-roadmap.md#launch-day-thursday-26-november).
- It names who helps on the day.
- It has message templates for an incident.
- It was reviewed on Mon 23 Nov.

**Tasks**

- [ ] Write the run of show
- [ ] Write the incident messages
- [ ] Brief helpers

#### SH-58 · First paid social test

Business · **2 points** · Sprint 4 · Traces: business plan §Paid spend

As the founder, I want to learn what an enquiry costs through Meta ads, so that year-one spend goes
where it works.

**Definition of done**

- Three ads promote specific makers in specific neighbourhoods, from 27 Nov to 13 Dec, capped at CAD 500.
- The cost per enquiry is recorded.

**Tasks**

- [ ] Choose the makers and neighbourhoods
- [ ] Run the ads
- [ ] Record the results

---

## I4 Legal and business foundations

A real company, insured, with text counsel has read. Business lane.

### E4.1 Company, insurance and counsel

#### SH-60 · Incorporate and open business banking

Business · **3 points** · Sprint 1 · Traces: business plan §Legal setup

As the founder, I want Sweet Hand incorporated with its own bank account, so that contracts,
insurance and invoices are in the company's name.

**Definition of done**

- The company is incorporated, Ontario or federal.
- It has a business number and a bank account.
- An account for invoicing services is open.
- A bookkeeping tool is set up.

**Tasks**

- [ ] Choose Ontario or federal; incorporate
- [ ] Open the bank account and the invoicing account
- [ ] Set up bookkeeping

#### SH-61 · Set up the sweethand.ca mailboxes

Business · **1 point** · Sprint 1

As a caterer or customer, I want the addresses on the site to reach a person, so that I can ask for
help or exercise my privacy rights.

**Definition of done**

- `hello@`, `privacy@` and `help@sweethand.ca` receive and send.
- The MX records don't disturb the ACS sending records.

**Tasks**

- [ ] Choose the mail provider
- [ ] Add the records in Namecheap
- [ ] Test each address both ways

#### SH-62 · Insurance

Business · **2 points** · Sprint 2

As the founder, I want commercial general liability, equipment and event cover in place, so that a
studio accident or a dispute doesn't end the business.

**Definition of done**

- Cover is bound before studio block 2 (Mon 26 Oct), from a broker who has heard how the platform works.

**Tasks**

- [ ] Get two quotes
- [ ] Ask about platform liability
- [ ] Bind the cover

#### SH-63 · Lawyer review

Business · **3 points** · Sprint 2 · Traces: business plan §Legal setup, L1 A-8

As the founder, I want counsel to review the terms, privacy policy, CASL wording and founding-maker
agreement, so that what Sweet Hand promises is lawful and true.

**Definition of done**

- Counsel has the brief: the pages, the processors, the CASL questions in A-8, and the SH-40 agreement.
- Written comments are back by Wed 11 Nov.
- The final text is agreed by Fri 13 Nov and handed to SH-24.

**Tasks**

- [ ] Write the brief with the specific questions
- [ ] Send it by Mon 26 Oct
- [ ] Agree the final text

#### SH-50 · Founder's food handler certificate

Business · **2 points** · Sprint 4 · Traces: business plan, video 06

As the founder, I want my own food handler certificate, so that I know what makers go through and
can point them to the same course.

**Definition of done**

- The founder has passed the course and the certificate is on file.

**Tasks**

- [ ] Book the online course
- [ ] Pass the exam

---

## I5 Year-one revenue and after-launch product

The founder's services start earning, and the next product stage is specified. Business lane,
except SH-34 and SH-35.

### E5.1 Services and partnerships

#### SH-64 · Services price sheet, booking and invoicing

Business · **3 points** · Sprint 2 · Traces: business plan §Revenue streams B

As a maker or caterer, I want to see what a shoot or portrait costs and book one, so that I can buy
more than the free founding shoot.

**Definition of done**

- The price sheet carries the business plan's prices: shoots CAD 249, 449 and 599; portraits CAD 175; reels CAD 350.
- It sits behind the link in Sweet Hand's social bios, not in the product.
- A booking form and invoice template with a deposit policy exist.

**Tasks**

- [ ] Write the price sheet
- [ ] Set up booking and invoicing
- [ ] Add the link to the social bios

#### SH-65 · Book the first three paid sessions

Business · **3 points** · Sprint 3 · *First business story to slip*

As the founder, I want three paid shoots or portraits booked by launch, so that services revenue
starts while the directory fills.

**Definition of done**

- Three sessions are booked with deposits paid.

**Tasks**

- [ ] Offer founding makers an upgrade to 25 dishes or portraits
- [ ] Offer caterers a menu shoot
- [ ] Book and invoice

#### SH-66 · Sponsor one-pager and three conversations

Business · **3 points** · Sprint 4 · Traces: business plan §Revenue streams A

As the founder, I want three sponsor conversations open, so that sponsor revenue can start when
there's something to sponsor.

**Definition of done**

- A one-pager exists.
- Three conversations have been held with Caribbean grocers or food brands, with notes.
- No commitment depends on unspecified product features. The product has no ad slots, so sponsorship is offered for studio events first.

**Tasks**

- [ ] Write the one-pager
- [ ] Book and hold the conversations

#### SH-67 · Plan the first supper club

Business · **2 points** · Sprint 4 · Traces: business plan §Revenue streams C

As the founder, I want January's supper club planned before the holidays, so that tickets sell in
December.

**Definition of done**

- The date, maker, menu, 30 seats, price (CAD 45 to 65) and ticketing are set.
- Event cover is confirmed with SH-62's broker.

**Tasks**

- [ ] Choose the maker and date
- [ ] Set up ticketing
- [ ] Confirm event insurance

#### SH-68 · 90-day review scorecard

Business · **2 points** · Sprint 4 · Traces: business plan §90-day launch plan

As the founder, I want the 90-day targets tracked from launch day, so that the review around 10
January decides from numbers, not memory.

**Definition of done**

- A scorecard tracks the six targets from the [roadmap](launch-roadmap.md#after-launch-to-the-90-day-review), with an enquiry target in place of pre-order GMV.
- It's fed weekly from the operator metrics CSV export (L2-063).

**Tasks**

- [ ] Set the enquiry target
- [ ] Build the scorecard
- [ ] Book the review date

### E5.2 Next product stage

#### SH-34 · Specify pre-orders

Engineering · **5 points** · Sprint 4 · Traces: business plan §Product, stage 2; amends A-2

As a maker who cooks in small batches, I want people to pre-order my batches up to a limit and a
cut-off, so that I cook what's already sold.

**Definition of done**

- An amended A-2, a new L1 and L2s are approved, with Given-When-Then criteria, for:
  - Pre-order windows, batch limits and cut-offs.
  - Sold-out states.
  - Pickup details revealed only to the eater they apply to, when the maker chooses.
  - Allergens shown on each item.
- The design and mocks are planned for Sprint 5.

**Tasks**

- [ ] Draft the L1 and L2s with the `engineering-requirements` skill
- [ ] Check them against the domain rules in `AGENTS.md`
- [ ] Founder approves

#### SH-35 · Specify payments through Stripe

Engineering · **3 points** · Sprint 4 · Traces: business plan §Product, stage 2; amends A-3

As a maker, I want pre-orders paid up front, with Sweet Hand's 10% taken automatically, so that I
never chase a payment and nobody fails to show up at pickup.

**Definition of done**

- An amended A-3 and L2s for prepayment, the fee, refunds and payouts are approved.
- An ADR draft weighs the Stripe products for paying makers.

**Tasks**

- [ ] Draft the L2s
- [ ] Draft the ADR
- [ ] Founder approves
