# Side navigation

| Field | Value |
|---|---|
| Selector | `sh-side-nav` (renders `<nav class="side-nav">`), `sh-section-list` (renders `<ul class="section-list">`) |
| Library path | `frontend/projects/components/src/lib/side-nav/` |
| Status | planned |
| Traces to | L2-038, L2-039, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`side-nav.html`](../../design-system/components/side-nav.html) |
| Source mocks | [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/draft`](../../mocks/pages/dashboard/draft.html), [`pages/dashboard/empty`](../../mocks/pages/dashboard/empty.html), [`pages/dashboard/changes-requested`](../../mocks/pages/dashboard/changes-requested.html), [`pages/profile-photos/default`](../../mocks/pages/profile-photos/default.html), [`pages/profile-cuisines/default`](../../mocks/pages/profile-cuisines/default.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/admin-reviews/default`](../../mocks/pages/admin-reviews/default.html), [`dialogs/submit-profile/invalid`](../../mocks/dialogs/submit-profile/invalid.html) |
| Rendering | [`side-nav.html`](side-nav.html) |

## Purpose and scope

Side navigation lists the sections of a work area: Kendra's caterer dashboard
("Overview", "Business details", "Cuisines and areas", "Guests and
occasions", "Photos", "Menu", "Food safety", then "Enquiries 2 unread",
"Reviews", "Account") and the operator console ("Review queue 7", "Recent
changes", "Caterers", "Reviews", "Metrics", then "Audit log", "Cuisines",
"Operators", "Breach register"). It speaks the listing's cuisine-filter
language: a vertical column of large muted text with the current section in
pepper and semibold — no boxes, icons or highlight bars. It appears from 62rem
as the first column of the work layout and sticks while the main column
scrolls (L2-045.3).

Below 62rem the dashboard shows the **section list** instead,
`sh-section-list`: one tall row per profile section with a status mark, the
section title, a one-line summary ("6 photos", "Add at least 3 photos · 2 so
far") and a chevron, opening one section at a time (L2-045.2). The same rows
form the checklist in the "Submit for review" dialog (L2-038.3, L2-039.2).
Both live in this CRD because the design system defines them together as one
navigation at two widths.

Use the [site header](site-header.md) for the two or three top-level
destinations, [tabs](tabs.md) or the [button group](button-group.md) to
switch views inside one section, and the [filter list](filter-list.md) to
filter results (it shares `.filter-list` classes but toggles state rather than
navigating). The status mark is the [checklist](checklist.md)'s `.check`.

Out of scope:

- The work layout grid (`.work-layout`, `.work-main`, `.preview-pane`) and
  the `.until-lg` wrapper around the section list: the page owns them.
- The "Overview" back link (`.eyebrow`) at the top of a section page on a
  phone: [link](link.md).
- Which sections exist, their order, their counts and summaries, and whether a
  non-Admin operator sees the Admin group: the app shell decides from the
  session and passes data (D-6).
- The phone equivalents for operators (the site menu [sheet](sheet.md)).
- The legacy `.nav-link`, `.sidebar`, `.sidebar__group` and
  `.side-nav__title`: unused and not built (D-5).

## Usage

Inventory from a parse of every `<nav class="side-nav">` (30 distinct
configurations) and every `a.section-link` (40) in `docs/mocks/`, and
`usage_inventory.py docs/mocks filter-list__item "a"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/dashboard/*`, `profile-details/*`, `profile-cuisines/*`, `profile-events/*`, `profile-photos/*`, `profile-menu/*`, `profile-certificate/*`, `dashboard-reviews/*`, `account/caterer`, `notifications/dashboard-toast/*`, `notifications/profile-banner/*` | `sh-side-nav` label "Dashboard"; groups of 7 and 3 | "Enquiries" with count "2 unread", "1 unread" or none | current on any of the 10 items; hover; focus | canvas, LG–XL |
| `pages/dashboard/removed` (Winston Daley, Coal Pot Kitchen) | `sh-side-nav` label "Dashboard"; groups of 1 and 2 | "Overview"; "Enquiry history", "Account" | current Overview | canvas |
| `pages/admin-*/*`, `notifications/admin-toast/*`, operator dialogs | `sh-side-nav` label "Operator"; groups of 5 and 4 | "Review queue" with count "7", "6" or "34"; "Reviews" with "2 held" | current on any of the 9 items, or none | canvas, LG–XL |
| `pages/dashboard/default`, `name-pending`, `pending` (Kendra, Pelau House) | `sh-section-list`; rows done and without status | "Business details" / "Name and description", "Photos" / "6 photos", "Food safety" / "Certificate valid until 14 Mar 2029", "Reviews" / "23 reviews · 1 without a response" | done, no status, hover, focus | canvas, XS–MD |
| `pages/dashboard/empty`, `draft` (Beverley, Auntie Bev's Kitchen) | `sh-section-list`; rows to do and done | "Photos" / "Add at least 3 photos · 2 so far", "Email verified" / "Check your inbox for our link. Resend it from Account" | to do, done | canvas, XS–MD |
| `pages/dashboard/changes-requested`, `suspended`, `notifications/profile-banner/warning`, `danger` | `sh-section-list`; a needs-attention row | "Photos" / "Replace photos 2 and 5"; "Food handler certificate" / "Expired 30 Sep 2026" | needs attention | canvas |
| `dialogs/submit-profile/default`, `busy`, `failed`, `invalid`, `success` | `sh-section-list` as the submission checklist | "Business name" / "Auntie Bev's Kitchen", "Photos" / "Add at least 3 photos · 2 so far" (needs attention) | done, needs attention | dialog (`--color-bg-surface-raised`), every width |

Not product markup: `pages/dashboard/default` and other published states omit
the visually hidden "Done: " prefix that `draft` and `empty` include, and
`changes-requested` colours a summary with an inline style; both are drift the
component corrects (D-3, D-4).

## Anatomy

`sh-side-nav`:

1. **Navigation** — `nav.side-nav[aria-label]`: hidden below 62rem; from
   62rem a flex column, `--space-8` between groups, sticky `--space-8` from
   the top, `align-self: start`.
2. **Group** — `ul.filter-list`, one per group, no heading.
3. **Item** — `li > a.filter-list__item`: `--text-body-lg`,
   `--color-fg-muted`, the full column width, 44 px (`--target-comfortable`)
   high, no padding, no background.
4. **Current item** — the same link with `aria-current="page"`:
   `--color-fg-accent`, `--font-weight-semibold`.
5. **Count (optional)** — `span.filter-list__count` after the label:
   `--text-caption`, `--color-fg-subtle`, tabular numbers ("2 unread", "7",
   "2 held").

`sh-section-list`:

1. **List** — `ul.section-list`: no bullets, a `--border-width-hairline` top
   rule in `--color-border-default`.
2. **Row** — `li > a.section-link`: a flex row, at least 4.5rem (72 px) high,
   `--space-3` block and `--space-1` inline padding, `--space-4` gap, a
   hairline bottom rule, inherits colour, no underline.
3. **Status mark (optional)** — `span.check` (to do), `.check--done`,
   `.check--error` from [checklist](checklist.md), `aria-hidden="true"`,
   `--icon-size-xl` circle.
4. **Body** — `span.section-link__body`: a column that can shrink.
5. **Title** — `span.section-link__title`: `--text-body-lg` medium. Starts
   with a `span.visually-hidden` status word when the row has a status ("To
   do: ", "Done: ", "Needs attention: ").
6. **Summary (optional)** — `span.section-link__meta`: `--text-body-sm` in
   `--color-fg-muted`; `.section-link__meta--error` in `--color-danger-fg` for
   a needs-attention row.
7. **Chevron** — `svg.icon`, right-pointing, `aria-hidden="true"`.

Hosts: both are layout-transparent (`display: contents`) and render their root
element in the light DOM, so `.work-layout` places `nav.side-nav` as its
first grid child and `.until-lg` applies to the page's wrapper.

## API

### `sh-side-nav` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Rendered as `aria-label` on the `nav`: "Dashboard" or "Operator". Unique on the page. |
| `groups` | `SideNavItem[][]` | — | yes | One `ul.filter-list` per inner array, in order. Empty groups are not rendered. At most one item in all groups is `current`. |

```ts
interface SideNavItem {
  label: string;        // "Enquiries", from the resource files
  href: string;         // "/dashboard/enquiries"
  current?: boolean;    // renders aria-current="page"
  count?: string;       // visible count text, already formatted: "2 unread", "7", "2 held"
  countLabel?: string;  // spoken instead of a bare number: "7 waiting" (D-2)
}
```

### `sh-section-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `items` | `SectionLinkItem[]` | — | yes | One `li > a.section-link` per item, in order. |
| `statusLabels` | `{ missing: string; done: string; attention: string }` | — | yes when any item has a status | The visually hidden prefixes, from the resource files: "To do: ", "Done: ", "Needs attention: ". |

```ts
interface SectionLinkItem {
  title: string;                                   // "Photos"
  href: string;                                    // "/dashboard/photos"
  meta?: string;                                   // "Add at least 3 photos · 2 so far"
  status?: 'missing' | 'done' | 'attention' | null;   // null: no mark, no prefix
}
```

### Outputs

None for either. Every item is a link; navigation is the router's job.

### Content slots

None. Items are data, so the markup, the status words and the current state
cannot drift between pages (D-3).

- Translation: `label`, every item `label`, `count`, `countLabel`, `title`,
  `meta` and the `statusLabels` arrive from the consumer, who takes them from
  the resource files (L2-064.4). The component contains no user-facing
  strings.

## Variants and sizes

| Variant | Inputs | Use for |
|---|---|---|
| Caterer dashboard | `label` "Dashboard"; profile group (7) then business group (Enquiries, Reviews, Account) | Every caterer page from 62rem |
| Removed caterer | `label` "Dashboard"; Overview; then Enquiry history, Account | A removed profile keeps only its history |
| Operator console | `label` "Operator"; daily-work group (5) then administration group (4) | Every operator page from 62rem |
| Section list, dashboard | `sh-section-list`, rows with and without status | Dashboard overview below 62rem |
| Section list, checklist | `sh-section-list`, every row with a status | "Submit for review" dialog, every width |

One size each. The side nav is the `--layout-sidebar-width` column (15rem)
with 44 px items in `--text-body-lg`; section rows are at least 4.5rem
(72 px) high and as wide as their container.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Item default | — | `--color-fg-muted` | Link in a list in the named navigation |
| Item hover | `:hover` | `--color-fg-default` over `--duration-fast` | — |
| Item focus | `:focus-visible` | Shared ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) | Focused |
| Item current | `current` → `aria-current="page"` | `--color-fg-accent`, `--font-weight-semibold` | "current page" |
| Item with count | `count` | Caption-size `--color-fg-subtle` text after the label; stays subtle when current | Name "Enquiries 2 unread"; with `countLabel`, "Review queue 7 waiting" |
| No current item | no `current` (operator audit and operators pages reached from elsewhere) | All muted | No `aria-current` |
| Side nav below 62rem | viewport < 62rem | `display: none` | Not in the tab order or the accessibility tree |
| Row default | — | Hairline rules, title in `--color-fg-default`, summary muted | Link named by status word, title and summary |
| Row hover | `:hover` | Fill `--color-bg-surface-sunken` | — |
| Row focus | `:focus-visible` | Shared ring around the row | Focused |
| Row to do | `status: 'missing'` | Empty ring `.check` in `--color-border-strong` | "To do: Photos …" |
| Row done | `status: 'done'` | Filled `.check--done` with a tick | "Done: Photos …" |
| Row needs attention | `status: 'attention'` | `.check--error` ring with an exclamation; summary `.section-link__meta--error` | "Needs attention: Photos …" |
| Row without status | `status` null | No mark, no prefix | "Reviews 23 reviews · 1 without a response" |
| Print | `@media print` | Side nav printed as plain links; section list unchanged | — |

`data-state="hover|focus"` exists in `components.css` only for documentation
and mocks. The components never render it.

## Markup

```html
<!-- rendered: sh-side-nav, caterer dashboard, Photos current -->
<nav class="side-nav" aria-label="Dashboard">
  <ul class="filter-list">
    <li><a class="filter-list__item" href="/dashboard">Overview</a></li>
    <li><a class="filter-list__item" href="/dashboard/details">Business details</a></li>
    <li><a class="filter-list__item" href="/dashboard/cuisines">Cuisines and areas</a></li>
    <li><a class="filter-list__item" href="/dashboard/events">Guests and occasions</a></li>
    <li><a class="filter-list__item" href="/dashboard/photos" aria-current="page">Photos</a></li>
    <li><a class="filter-list__item" href="/dashboard/menu">Menu</a></li>
    <li><a class="filter-list__item" href="/dashboard/certificate">Food safety</a></li>
  </ul>
  <ul class="filter-list">
    <li><a class="filter-list__item" href="/dashboard/enquiries">Enquiries <span class="filter-list__count">2 unread</span></a></li>
    <li><a class="filter-list__item" href="/dashboard/reviews">Reviews</a></li>
    <li><a class="filter-list__item" href="/account">Account</a></li>
  </ul>
</nav>
```

```html
<!-- rendered: an item whose count is a bare number, with countLabel "7 waiting" (D-2) -->
<li><a class="filter-list__item" href="/admin/queue" aria-current="page">Review queue <span class="filter-list__count"><span aria-hidden="true">7</span><span class="visually-hidden">7 waiting</span></span></a></li>
```

```html
<!-- rendered: sh-section-list, one row per status -->
<ul class="section-list">
  <li><a class="section-link" href="/dashboard/details"><span class="check check--done" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></span><span class="section-link__body"><span class="section-link__title"><span class="visually-hidden">Done: </span>Business details</span><span class="section-link__meta">Name and description</span></span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></a></li>
  <li><a class="section-link" href="/dashboard/photos"><span class="check" aria-hidden="true"></span><span class="section-link__body"><span class="section-link__title"><span class="visually-hidden">To do: </span>Photos</span><span class="section-link__meta">Add at least 3 photos · 2 so far</span></span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></a></li>
  <li><a class="section-link" href="/dashboard/photos"><span class="check check--error" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></span><span class="section-link__body"><span class="section-link__title"><span class="visually-hidden">Needs attention: </span>Photos</span><span class="section-link__meta section-link__meta--error">Replace photos 2 and 5</span></span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></a></li>
  <li><a class="section-link" href="/dashboard/reviews"><span class="section-link__body"><span class="section-link__title">Reviews</span><span class="section-link__meta">23 reviews · 1 without a response</span></span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></a></li>
</ul>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: caterer work layout -->
<div class="work-layout work-layout--preview">
  <sh-side-nav [label]="t('dashboard.nav')" [groups]="dashboardGroups()"></sh-side-nav>
  <div class="work-main">…</div>
  <aside class="preview-pane">…</aside>
</div>

<!-- consumer: dashboard overview on a phone -->
<section class="caterer-section until-lg" aria-labelledby="profile-title">
  <h2 id="profile-title">{{ t('dashboard.yourProfile') }}</h2>
  <sh-section-list [items]="profileSections()" [statusLabels]="statusWords()"></sh-section-list>
</section>
```

The e2e page objects locate the side nav by `nav.side-nav` and its name, items
by role and name, the current item by `aria-current="page"`, rows by
`a.section-link` and their status by the `.check` modifier, so these classes
and attributes are part of the contract. The chevron and tick paths are free
to change.

## Design

- Side nav: column `--layout-sidebar-width`; `--space-8` between groups;
  sticky at `top: --space-8` from 62rem; no padding, background or border.
- Item: `--text-body-lg`; height `--target-comfortable`; `--space-2` before a
  count; full column width; current `--font-weight-semibold`.
- Count: `--text-caption`, `--font-weight-regular`, tabular numbers.
- Section row: at least 4.5rem high; `--space-3` block and `--space-1` inline
  padding; `--space-4` gap; `--border-width-hairline` rules in
  `--color-border-default`; title `--text-body-lg` at
  `--font-weight-medium`; summary `--text-body-sm`; chevron and tick
  `--icon-size-md` / `--icon-size-sm`; check `--icon-size-xl` with a
  `--border-width-thick` ring.
- Elevation none; layer none (sticky without `z-index`, in its own grid
  column).
- Motion: colour (items) and background (rows) transition over
  `--duration-fast` with `--ease-standard`.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Item | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Item hover, row title | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Current item | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Count | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Row rules | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Row hover | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| Check, to do | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Check, done (fill / tick) | `--color-success-solid` / `--color-bg-surface` | callaloo / `--palette-white` | light callaloo / `--palette-stone-950` |
| Check, needs attention (ring / mark) | `--color-danger-solid` / `--color-danger-fg` | sorrel | light sorrel |
| Needs-attention summary | `--color-danger-fg` | sorrel | light sorrel |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Items, row summaries |
| `--color-fg-accent` | `--color-bg-canvas` | 4.5:1 | Current item |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Count |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Row title on hover |
| `--color-success-solid` | `--color-bg-canvas` | 3:1 | Done check |
| `--color-bg-surface` | `--color-success-solid` | 4.5:1 | Tick in the done check |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | To-do ring |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Needs-attention summary on the page |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Needs-attention summary in the submit dialog |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Row summaries in the submit dialog |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Current is never colour alone: it is semibold and announced as "current
page". Row status is never colour alone: the mark's shape (ring, tick,
exclamation) and the hidden word carry it (L2-069.5).

Forced colours: `.filter-list__item[aria-current]` keeps its weight; the check
rings draw in `CanvasText`; the tick keeps its shape.

## Responsive behaviour

| Width | `sh-side-nav` | `sh-section-list` |
|---|---|---|
| Below 62rem (XS–MD) | `display: none`; every destination is in the dashboard overview's section list or the site menu sheet | Shown on the dashboard overview (the page's `.until-lg`); full width |
| From 62rem (LG) | First column of `.work-layout` (15rem, `--space-12` gap), sticky `--space-8` from the top | Hidden by the page (`.until-lg`); the submit dialog still shows it |
| From 75rem (XL) | Unchanged; the page adds the preview pane on the right | — |

- Labels and summaries wrap and never truncate: "Check your inbox for our
  link. Resend it from Account" wraps under its title at 320 px.
- At 320 px nothing scrolls horizontally; rows are at least 72 px high and
  full width, well over 44 × 44 (L2-065.1).
- At 200 % zoom at a 1280 px window the viewport is 640 CSS px, so the side
  nav hides and the section list and site menu carry every destination.
- Sticky never covers a focused element: the nav and the main column sit in
  separate grid columns.

## Accessibility

### Role and pattern

`sh-side-nav`: a `<nav>` landmark with a unique `aria-label` ("Dashboard",
"Operator") holding lists of links; the current page has
`aria-current="page"`. Plain navigation, not the APG menu or tree pattern: no
`role="menu"`, no arrow-key handling.

`sh-section-list`: a `<ul>` of links, inside a section the page heads ("Your
profile") or inside the submit dialog.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the links in order, group by group, row by row. |
| <kbd>Enter</kbd> | Opens the section. |
| Arrow keys | Scroll the page, as on any links; no roving focus. |

### Focus

- The shared ring wraps each item or row.
- The side nav comes after the header, inside `<main>` and before the work
  column in the DOM, so the [skip link](skip-link.md) lands just before it and
  the next Tab reaches "Overview" (or "Review queue").

### Labelling

- Item text is the section name exactly as the page title says it: "Cuisines
  and areas" opens a page titled "Cuisines and areas".
- Counts are part of the link name: "Enquiries 2 unread", "Reviews 2 held".
  A bare number is spoken with its `countLabel`: "Review queue 7 waiting"
  (D-2).
- Section rows hide the check and put the status in words at the start of the
  title: "Done: ", "To do: ", "Needs attention: " — on every dashboard state,
  including the published one (D-3).

### Announcements

None. The components do not change while the page is open.

### Motion

Colour and background transitions use `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms. Nothing moves.

## Content and internationalisation

- Section names are nouns in sentence case, two or three words at most:
  "Business details", "Guests and occasions", "Food safety", "Breach
  register".
- The business-running group (Enquiries, Reviews, Account) comes after the
  profile group; administration comes after daily work.
- Counts are short and formatted by the consumer: "2 unread", "2 held", "7".
- Summaries say what is there or what is missing, with numbers: "2 cuisines ·
  5 areas", "Add at least 3 photos · 2 so far", "Certificate valid until
  14 Mar 2029", "Replace photos 2 and 5".
- Translatable inputs: `label`, item labels, counts and count labels, row
  titles, summaries and the status words. Data inside them: business names
  ("Auntie Bev's Kitchen"), email addresses, numbers. French section names run
  about 30 % longer ("Invités et occasions"); they wrap inside the 15rem
  column.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the group markup, the status
  class and prefix per row) are computed once per input change, not in the
  template.
- No listeners, timers or observers; stickiness is CSS.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/SideNav.ts`
  renders Kendra's dashboard side nav with "Photos" current and "Enquiries
  2 unread", and Beverley's section list for Auntie Bev's Kitchen (8 done, 2
  to do); iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it
  at roughly 100–300 ms.
- Composite scenarios: `Dashboard`, `OperatorQueue`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the side nav's column width is fixed by the grid and the
  rows' minimum height by CSS; nothing shifts after load.
- Weight: no dependencies beyond the framework; three inline SVG icons
  (chevron, tick, exclamation).

## Acceptance criteria

### Rendering

- **AC-1** Given Kendra Baptiste on her Photos page at 1280 px, when the side nav renders, then it is `nav.side-nav` named "Dashboard" holding two `ul.filter-list` groups — "Overview", "Business details", "Cuisines and areas", "Guests and occasions", "Photos", "Menu", "Food safety", then "Enquiries", "Reviews", "Account" — in a 15rem column beside the work area, and "Photos" alone has `aria-current="page"`. (L2-045)
- **AC-2** Given Leah Mohammed on the review queue with 7 items waiting, when the operator side nav renders with `count` "7" and `countLabel` "7 waiting", then it is named "Operator", "Review queue" shows "7" and its accessible name is "Review queue 7 waiting". (L2-068)
- **AC-3** Given the component sources, when they are scanned for user-facing string literals, then none are found; every label, count, summary and status word arrives as an input. (L2-064)
- **AC-4** Given Kendra's dashboard at 360 px, when the section list renders, then each row is an `a.section-link` at least 72 CSS px high and as wide as the list, with its title, its summary ("6 photos", "18 dishes", "Certificate valid until 14 Mar 2029") and a chevron. (L2-045)

### States

- **AC-5** Given Kendra on "Cuisines and areas", when the side nav renders in the light theme, then that item is drawn in `--color-fg-accent` and `--font-weight-semibold` while the others are `--color-fg-muted` at regular weight, so current is shown by weight as well as colour. (L2-069)
- **AC-6** Given Beverley Campbell's draft with 2 photos, when the dashboard section list renders, then the Photos row has an empty `span.check` with `aria-hidden="true"`, its title starts with the visually hidden "To do: ", and its summary reads "Add at least 3 photos · 2 so far". (L2-038)
- **AC-7** Given Kendra's published Pelau House dashboard, when the section list renders, then every completed row has `.check--done` and a title starting with the visually hidden "Done: ", and the Reviews row has no mark and no prefix. (L2-038)
- **AC-8** Given Beverley tries to submit with 2 photos, when the "Submit for review" dialog's checklist renders, then the Photos row has `.check--error`, its title starts with "Needs attention: ", and its summary "Add at least 3 photos · 2 so far" carries `.section-link__meta--error` in `--color-danger-fg` with no inline style. (L2-039)
- **AC-9** Given rows done, to do and needing attention, when they render, then each status is distinguishable without colour by the mark's shape (tick, empty ring, exclamation) and by its status word. (L2-069)

### Keyboard and focus

- **AC-10** Given Kendra on her Photos page at 1280 px, when she activates the skip link and presses Tab, then focus lands on "Overview" in the side nav, and further Tabs visit every item in order, group by group, before the work column. (L2-067)
- **AC-11** Given focus on "Menu" in the side nav, when Kendra presses the arrow keys, then focus does not move between items, and Enter opens the Menu page. (L2-067)
- **AC-12** Given any side-nav item or section row, when it receives keyboard focus in the light or dark theme, then the focus ring is visible with at least 3:1 contrast against the canvas. (L2-067)

### Screen readers

- **AC-13** Given Kendra's side nav, when it is read by a screen reader, then it is announced as navigation "Dashboard", "Photos" as "current page", and the Enquiries link's name is "Enquiries 2 unread". (L2-068)
- **AC-14** Given the dashboard and operator side navs at XL and the section list at XS in every status, when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-15** Given the dark theme, when the side nav renders, then the current item resolves to `--palette-pepper-300` and items to `--palette-stone-350`, each with at least 4.5:1 contrast against the canvas. (L2-069)
- **AC-16** Given the light and dark themes, when a done row renders, then the done check has at least 3:1 contrast against the canvas and its tick at least 4.5:1 against the check. (L2-069)

### Responsive

- **AC-17** Given Kendra's Photos page at 768 px, when it renders, then the side nav is not displayed and none of its links is reachable by Tab; at 992 px it appears as the first column and stays `--space-8` from the top while the work column scrolls. (L2-045)
- **AC-18** Given Beverley's empty dashboard at 320 px, when the "Email verified" row renders with the summary "Check your inbox for our link. Resend it from Account", then the summary wraps under the title with no text cut off and the page does not scroll horizontally. (L2-064)
- **AC-19** Given the section list at 360 px, when each row is measured, then its target is at least 44 × 44 CSS px and rows do not overlap. (L2-065)
- **AC-20** Given a 1280 px window at 200 % zoom on Kendra's dashboard, when it renders, then the side nav is hidden, the section list is shown, and every section is reachable with no horizontal scrolling. (L2-069)

### Motion

- **AC-21** Given `prefers-reduced-motion: reduce`, when an item or row is hovered, then its colour or fill changes without a visible transition. (L2-069)

### Performance

- **AC-22** Given the `SideNav` perf-test scenario, when Kendra's side nav and Beverley's section list render, then the layout shift is 0 and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)
- **AC-23** Given Leah on the operator queue at 1280 px, when the "Review queue" count changes from 7 to 6 after an approval, then the side nav's column width is unchanged and the queue page's own content does not move. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/side-nav/`; files
  `side-nav.component.*` (selector `sh-side-nav`, class `SideNavComponent`)
  and `section-list.component.*` (selector `sh-section-list`, class
  `SectionListComponent`); the `SideNavItem` and `SectionLinkItem` types are
  exported from the folder's public API.
- Styles: the "Side navigation" section of `components.css` (`.side-nav`,
  `.section-list`, `.section-link*`) moves into the component, class names
  unscoped. `.filter-list` and `.filter-list__item` stay with [filter
  list](filter-list.md) and `.check` with [checklist](checklist.md); this
  component renders their classes.
- Not built: `.nav-link`, `.sidebar`, `.sidebar__group`, `.side-nav__title`
  (D-5).
- Mocks catch-up: `dashboard/default` and the other published states add the
  "Done: " prefix; `changes-requested` and `suspended` replace the inline
  `style="color: …"` with `.section-link__meta--error`; the caterer side
  nav's Account links to the caterer account view.
- Design-system catch-up for D-2: the side-nav page suggests a visually hidden
  word "if testing shows confusion"; the CRD makes it the rule for bare
  numbers.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How is a bare count ("7") spoken?* With `countLabel`: the visible number is `aria-hidden` and a visually hidden "7 waiting" takes its place, so the link reads "Review queue 7 waiting". Counts that already carry a word ("2 unread", "2 held") need no label. The design system left this to testing; a lone number after "Review queue" is ambiguous, so the CRD settles it now.
- **D-3** *Do published-dashboard rows say "Done: "?* Yes. `dashboard/default` dropped the visually hidden prefix that `draft` and `empty` have, which left the ticks silent for screen readers. The component always renders the prefix for a row with a status, from `statusLabels`.
- **D-4** *How is a needs-attention summary coloured?* With `.section-link__meta--error`, which `components.css` already defines; the mocks' inline `style="color: var(--color-danger-fg)"` is drift. The modifier follows from `status: 'attention'`, so a consumer cannot forget it.
- **D-5** *Are the legacy `.nav-link` and `.sidebar` built?* No. No mock uses them, and `.nav-link`'s ink current state breaks the rule that pepper means "you are here".
- **D-6** *Does a non-Admin operator see "Audit log" and "Operators"?* The component renders whatever groups the shell passes, so either answer needs no API change. Until product decides (mocks README, question 21), the shell passes the same groups to every operator, as the mocks show, and Tomas Reyes gets the forbidden page on Admin-only items; the server check (L2-056.3) is what protects them.
- **D-7** *Is the section list part of this component?* Yes, as `sh-section-list`. The design system defines it on the side-nav page as the phone form of the same navigation (L2-045.2), and the submit dialog reuses it as the checklist; one component keeps the status words and marks identical in both places.
- **D-8** *What does a removed caterer's side nav hold?* "Overview", then "Enquiry history" and "Account", as `dashboard/removed` shows: the profile sections no longer apply. It is a data configuration, not a variant.
