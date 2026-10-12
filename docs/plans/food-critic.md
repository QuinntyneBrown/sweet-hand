# PRD: a food critic on Sweet Hand — Critic's Picks

**Status:** Proposed, 2026-10-12. Not yet specified; nothing here is built.
**Type:** Product requirements document (PRD). A PRD is not a requirement set:
before any production code changes, the L1/L2 requirements, detailed design and
mocks listed in [Artifacts before implementation](#12-artifacts-before-implementation)
must exist, and the work then follows the `implementing-incrementally` skill with
acceptance tests first (`AGENTS.md`).
**Earliest release:** after launch. Nothing here blocks the first release.

## 1. Summary

Add an independent food critic to Sweet Hand: a named, credited person (or a
small panel) who eats from caterers on the platform and publishes short, honest
write-ups and a curated set of **Critic's Picks** — "best jerk for a backyard
party of 40", "best Guyanese pepperpot for Christmas", "best doubles for an
office lunch".

Customer reviews (L1-014) tell a customer *what other customers thought*. A
critic adds something reviews cannot: a consistent palate across many caterers,
context about the dish and the island tradition behind it, and a reason to
discover a caterer before anyone has reviewed them.

## 2. Problem

- **New caterers are invisible.** The listing is deliberately fair — a
  date-seeded random order, no caterer permanently favoured (L2-002) — and
  reviews need a completed event (A-5). A great caterer who just joined has no
  reviews and no way to stand out.
- **Customers planning an event face a wall of cards.** The listing shows only a
  name, cuisine and area (L1-002). A first-time customer planning a wedding or
  a nine-night does not know where to start.
- **Star averages flatten the food.** "4.6 · 12 reviews" does not say whether the
  oxtail is better than the curry goat, or which caterer cooks a proper
  Vincentian buljol. The cuisines deserve to be talked about as the communities
  talk about them (`AGENTS.md`, *Respect the cuisines*).
- **Sweet Hand needs things worth sharing.** A "Best Trini doubles in
  Scarborough" pick travels on WhatsApp and Facebook in a way a listing page
  does not.

## 3. Goals and non-goals

**Goals**

1. Help customers choose with confidence, especially for a first event.
2. Give good caterers — including new ones — a credible way to be noticed,
   without paying and without breaking listing fairness.
3. Celebrate specific dishes and island traditions with knowledgeable writing.
4. Create shareable editorial content that brings people to the platform.

**Non-goals**

- Paid placement, sponsored picks or "featured" listings. Listing stays free
  (A-3), and a pick can never be bought.
- Inspection or certification. A pick is one person's opinion of the food. It
  never says or implies that Sweet Hand vouches for a kitchen (`AGENTS.md`,
  *Food safety*).
- Replacing customer reviews. Critic write-ups are kept apart from reviews and
  never count toward a caterer's average rating.
- Restaurants, home cooks or market vendors. The critic covers published
  caterers only, until assumption A-1 changes.
- Negative take-downs. The critic publishes recommendations; see
  [§7.2](#72-editorial-policy).

## 4. Users

| Role | Today (L1) | What changes |
|---|---|---|
| Visitor / Customer | Browses, enquires, reviews | Sees Critic's Picks, a pick badge and the critic's note on a caterer page |
| Caterer | Manages profile, answers enquiries | Is told when picked; can respond publicly; can ask to be removed from a pick |
| Operator | Approves, moderates, sees metrics | Appoints critics, approves picks before publishing, handles disputes |
| **Critic (new)** | — | Writes notes and assembles picks; cannot enquire, review or see private data |

The critic is a new, separate role. A critic account can never also be a
caterer account, and the critic signs in with the same security as an operator
(security key or second factor, L2-076).

## 5. User stories

**Customer**

- As a customer planning my first event, I want a short list of recommended
  caterers for my occasion, so that I have somewhere to start.
- As a customer, I want to read *why* a caterer was picked — the dish, the
  tradition, what stood out — so that I can judge whether it fits my event.
- As a customer, I want to see clearly that a pick is an independent opinion
  and when the critic last ate there, so that I can trust it.
- As a customer, I want to filter Critic's Picks by cuisine, area and occasion
  the same way I filter the listing.

**Caterer**

- As a caterer, I want to know when I am picked and what was written, so that I
  can share it with my customers.
- As a caterer, I want to respond publicly to a critic's note, as I can to a
  review (L2-052).
- As a caterer, I want to decline being featured, so that I am never featured
  against my wishes.
- As a caterer, I want a fair path to be considered, so that picks are not just
  the critic's friends.

**Critic**

- As a critic, I want to keep private tasting notes on caterers I have tried,
  so that I can write picks later.
- As a critic, I want to assemble a themed pick list from published caterers
  and submit it for approval.

**Operator**

- As an operator, I want to approve every note and pick before it is public, so
  that nothing defamatory, inaccurate or conflicted is published.
- As an operator, I want to unpublish a pick at once if a caterer is suspended
  or a complaint is upheld.

## 6. Features

### 6.1 Critic profile

A public page per critic: name, photo, a short bio, the traditions they know
best, and a plain-language **disclosure statement** (how they choose, that they
pay for their food, and any connection to a caterer). Every note links to it.

### 6.2 Critic's note on a caterer

A short write-up attached to one caterer:

- Headline, 100–1,500 characters of plain text, up to three dishes named from
  the caterer's own menu (L2-017) so spellings match the caterer's.
- The occasion and approximate party size the critic tried it for, and the
  **month and year** they ate it ("Tasted in September 2026"). No address, no
  event location and nothing more precise (`AGENTS.md`, *Protect maker privacy*).
- Shown on the caterer page in its own section, **above or beside reviews but
  visibly separate**, labelled "Critic's note · {critic name}". It never adds to
  the star average or review count (L2-051).
- One public caterer response per note, with the same rules as L2-052.
- A note older than 12 months is marked "Tasted over a year ago"; after 24
  months it is withdrawn unless the critic re-tastes.

### 6.3 Critic's Picks

A **pick list** is a titled, themed set of 3–12 caterers, each with a one-line
reason and a link to the full note. Examples:

- "Best for a wedding of 150+"
- "Best Guyanese for Christmas"
- "Best vegan and ital"
- "Best in Brampton and Mississauga"
- "New and worth knowing" (caterers published in the last 90 days)

A pick list has its own shareable URL with Open Graph tags (like L2-018), a
published date and the critic's name. Lists are filterable by cuisine, area
and occasion using the existing taxonomy (L2-007, L2-010, L2-021).

### 6.4 Pick badge

A caterer on a current pick list shows a small "Critic's Pick" badge on their
caterer page. **On the listing card, the badge needs a decision** (see
[§11](#11-open-questions)): L1-002 limits a card to a name, cuisine and area,
and L2-002 says no caterer is permanently favoured. The recommended default is
**no badge on listing cards and no change to listing order**. Picks get their
own entry point instead.

### 6.5 Entry points

- A "Critic's Picks" link in the main navigation and on the listing page, above
  the results, never mixed into them.
- A pick list's caterers link to their normal caterer pages; enquiries follow the
  usual flow (L2-022). The critic plays no part in enquiries.

### 6.6 Critic workspace

Signed-in critic only:

- Private tasting notes per caterer, never public and never visible to the
  caterer.
- Draft notes and pick lists, submitted to operators for approval.
- A conflict-of-interest declaration on each submission ("I have no personal or
  financial connection to this caterer").

### 6.7 Caterer controls

- An in-app notice and an email when a note or pick about them is approved,
  **before** it goes public, with 7 days to respond or decline.
- "Don't feature me" in the caterer dashboard: no new notes or picks, and
  existing ones are withdrawn within 60 seconds.
- A "Suggest my business to the critic" form: one suggestion per 90 days, with no
  promise of coverage.

### 6.8 Operator tools

- Appoint and remove critics; see each critic's declarations.
- An approval queue for notes and pick lists, in the existing review queue
  pattern (L2-047).
- Unpublish any note or pick; suspending or removing a caterer (L2-058) withdraws
  their notes and removes them from picks automatically.
- Every action goes to the audit log (L2-060).
- Metrics (L2-061): pick list views, caterer page visits and enquiries that came
  from a pick.

## 7. Trust and integrity

This is the part that makes or breaks the feature.

### 7.1 Independence

- **No money, no free food.** The critic pays for every meal at the caterer's
  normal price. Sweet Hand reimburses the critic, never the caterer. No caterer
  can pay, gift or barter for coverage.
- **Anonymous where possible.** The critic orders through an ordinary enquiry
  under a name the caterer does not know as the critic, and reveals nothing until
  the note is in approval.
- **Disclosed connections.** Any connection — family, friend, former employer,
  investor — is disclosed on the note, or the critic does not cover that caterer.
  This follows the Competition Bureau's guidance on disclosing material
  connections in endorsements. *Confirm with counsel.*
- **Spread.** The critic should cover a broad mix of islands, areas and business
  sizes. Operators review coverage each quarter (see [§9](#9-success-metrics)).

### 7.2 Editorial policy

- **Recommendations only.** Notes are published about caterers the critic would
  recommend. A disappointing meal stays in private tasting notes. This keeps the
  feature encouraging for small, home-scale businesses and lowers defamation
  risk.
- **Specific and fair.** Name the dish and the tradition as the caterer does;
  never call a Jamaican caterer simply "Caribbean" when they say Jamaican.
- **No health or safety claims.** No "clean kitchen", "safe", "certified" or
  allergen guarantees. Allergens come only from the caterer's own structured
  data.
- **Corrections.** A visible "Updated {date}" line on any corrected note.

### 7.3 Accuracy and freshness

- A note or pick is re-checked when the caterer changes their menu: if a named
  dish is removed, the note is flagged to the critic and operators.
- Picks show their published date and are reviewed at least every 6 months.

## 8. Privacy, security and accessibility

- The critic role sees only what a visitor sees, plus their own drafts and
  tasting notes. It never sees enquiries, customer data, certificates or
  unpublished profiles (L2-034, L2-079).
- Critic notes and picks follow the same input validation and output encoding as
  reviews (L2-080) and the same retention and export rules for the critic's
  personal data (L2-071 to L2-073).
- Every new page meets WCAG 2.2 AA and works at phone width without horizontal
  scrolling.
- All new text is marked for i18n (L2-064, ADR 0005).

## 9. Success metrics

Measured over the first 6 months after the feature launches:

| Metric | Target |
|---|---|
| Customers who view a pick list and then send an enquiry to a picked caterer | ≥ 8% of pick list visitors |
| Share of first-time enquiries that came through a pick | ≥ 15% |
| Picked caterers published in the last 90 days at the time of pick | ≥ 25% |
| Islands or traditions represented across all current picks | ≥ 6 |
| GTA municipalities represented across all current picks | ≥ 5 |
| Upheld complaints about a note or pick | 0 |
| Caterers who used "Don't feature me" | Tracked; investigate if > 5% of picked caterers |

The fairness metrics (new caterers, traditions, municipalities) matter as much as
the conversion metrics.

## 10. Phasing

| Phase | Scope |
|---|---|
| **0 — Pilot, no code** | One critic writes 3 pick lists as static editorial pages with operator sign-off; caterers consent by email. Measure shares and enquiries. |
| **1 — Notes and picks** | Critic role, critic profile, notes on caterer pages, pick lists, operator approval, caterer notice and decline. |
| **2 — Discovery** | Picks filterable by cuisine, area and occasion; "New and worth knowing"; suggestion form; metrics. |
| **3 — Panel** | Several critics, each with a specialty (for example, one for Guyanese and Trini, one for Haitian and French Caribbean). |

## 11. Open questions

| # | Question | Recommended answer |
|---|---|---|
| Q-1 | Does a pick badge appear on listing cards or change listing order? | No. Keep L1-002 and L2-002 unchanged; picks have their own entry point. |
| Q-2 | Can a caterer decline a note that has already been published? | Yes, at any time; it is withdrawn within 60 seconds. |
| Q-3 | One staff critic, a paid freelance critic or a community panel? | A paid freelance critic with a known name in the GTA Caribbean food community, under a written independence agreement. |
| Q-4 | Who pays for the critic's meals, and how is that budgeted? | Sweet Hand reimburses the critic; budget per pick list before phase 1. |
| Q-5 | Should the critic be allowed to publish critical (non-recommending) notes? | No, recommendations only (§7.2). |
| Q-6 | Do we need legal review of the disclosure and editorial policy? | Yes, before phase 0 publishes anything. |
| Q-7 | Does the critic ever cover non-caterers? | Not while assumption A-1 holds. |

## 12. Artifacts before implementation

Phase 0 needs no code. Before phase 1 code changes:

1. **L1/L2** — a new L1 (for example "Critic's Picks") and L2s for the critic
   role, notes, pick lists, caterer notice and decline, operator approval and
   withdrawal; updates to L2-051 (critic notes kept apart from reviews), L2-058
   (suspension withdraws notes), L2-060 (audit log) and L2-079 (the new role).
   Add the answered open questions as assumptions in L1. (`engineering-requirements`)
2. **ADR** — if the critic role changes the role model or authorisation policy
   catalogue, record it in `docs/adr/`.
3. **Detailed design** — a `critics` area in `docs/detailed-designs/`.
   (`writing-software-design-documents`)
4. **Mocks** — the pick list index, a pick list, the critic profile, the caterer
   page with a note and response, the caterer notice and decline, the critic
   workspace and the operator queue, each in every state. (`writing-html-mocks`)
5. **CRDs** — for any new `sh-*` component, such as a pick badge or note card.
   (`writing-component-requirements-documents`)
