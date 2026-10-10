# Container and layout

| Field | Value |
|---|---|
| Selector | `sh-container` (renders `main.container` or `div.container`), `sh-page` (`div.page`), `sh-page-intro` (`div.page-intro`), `sh-browse-layout` (`div.browse`), `sh-caterer-layout` (`div.caterer-layout`), `sh-work-layout` (`div.work-layout`), `sh-inbox-layout` (`div.inbox-layout`), `sh-auth-layout` (`div.auth`); global utility classes `.stack`, `.cluster`, `.grid`, `.span-full`, `.prose`, `.measure`, `.section-gap` |
| Library path | `frontend/projects/components/src/lib/container/` |
| Status | planned |
| Traces to | L2-009, L2-019, L2-036, L2-045, L2-064, L2-066, L2-067, L2-069, L2-085 |
| Design system | [`container.html`](../../design-system/components/container.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/loading`](../../mocks/pages/caterer/loading.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/profile-details/default`](../../mocks/pages/profile-details/default.html), [`pages/admin-cuisines/default`](../../mocks/pages/admin-cuisines/default.html), [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/inbox/empty`](../../mocks/pages/inbox/empty.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/verify-email/loading`](../../mocks/pages/verify-email/loading.html), [`pages/about/default`](../../mocks/pages/about/default.html), [`pages/not-found/default`](../../mocks/pages/not-found/default.html) |
| Rendering | [`container.html`](container.html) |

## Purpose and scope

These are the layout primitives every Sweet Hand screen is built from: one
centred container with margins that grow with the screen, the page shell that
keeps the footer at the bottom, the page intro that holds the one `h1`, and the
five product layouts — the listing (filter column beside results), the
caterer page (content beside the sticky enquiry panel), the work areas (side
navigation, work, listing-card preview), the inbox (list beside thread) and the
narrow sign-in column. They carry no colour and no meaning; they only place
things, and they are what makes every screen reflow from 320 px to 2560 px
without sideways scrolling.

Spacing rhythm inside a screen comes from four global utility classes —
`.stack`, `.cluster`, `.grid` (with `.span-full`) and `.prose` (with
`.measure` and `.section-gap`) — not from components (D-2). Use something else
for a surface around content ([card](card.md)), the listing's photo grid
([caterer card](caterer-card.md), `sh-caterer-grid`), the side navigation
itself ([side nav](side-nav.md)), the header and footer ([site
header](site-header.md), [footer](footer.md)), error and system pages
([error page](error-page.md), `.system-page`) or the phone's bottom enquiry bar
([sticky CTA](sticky-cta.md), which this CRD only makes room for).

Out of scope:

- What fills each area: filters, chips and the filter bar
  ([filter list](filter-list.md), [filter trigger](filter-trigger.md)), the
  gallery and caterer sections, the inbox rows and thread, forms.
- Which areas a page shows at which width beyond what the layout classes do:
  the `.only-xs-sm`, `.only-md`, `.only-lg`, `.until-lg` visibility utilities
  are foundations that consumers apply to their own content.
- Routing between the inbox list and a thread; the page sets `mode`.
- The skip link itself ([skip link](skip-link.md)); this CRD only guarantees
  its target, `main#main`.
- Colour: layouts read no colour token; the page canvas comes from `body`.

## Usage

Inventory from `usage_inventory.py docs/mocks <block> "main|div|section|aside|nav|header|article|form"`
for `container`, `page-intro`, `browse`, `caterer-layout`, `work-layout`,
`inbox-layout`, `auth` and `prose`, and a search for `class="page"`,
`stack`, `cluster`, `grid` and `section-gap`. Dialog and notification mocks
repeat the page behind them; those rows are grouped with the page.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every page with a header (76 screens, 382 uses) | `sh-page` > `sh-container` as `main#main.container` | header, main, footer | default; `aria-busy="true"` on `profile-certificate`, `profile-menu`, `profile-photos` loading | canvas |
| `pages/caterer/*` (7) | `sh-container` with `stickyCta` → `main.container.has-sticky-cta` | eyebrow "Caterers", caterer layout | default (loading drops `stickyCta`) | canvas |
| `pages/not-found`, `forbidden`, `server-error`, `offline`, `maintenance`, `rate-limited` | plain `main#main` > `sh-container` as `div.container` > `.system-page` | "Page not found", "Error 404" | default | canvas |
| `pages/about`, `privacy`, `terms` | `sh-container` (`narrow`, D-4) > `.prose` | "In the Caribbean, when someone's cooking is just that good…" | default | canvas |
| 51 screens, 244 uses | `sh-page-intro`, title only | `h1` + `.subtitle` ("Inbox" / "4 enquiries · 1 unread"); or `h1` + status cluster ("Published", "Saved 9:42 a.m."); or leading avatar ("MT", "Marcia Thompson · Customer since March 2025") | default; `busy` with skeletons (`admin-cuisines`, `account`, `dashboard` loading) | canvas |
| `pages/admin-cuisines`, `admin-operators`, `admin-breaches`, `profile-menu` … (26) | `sh-page-intro` with `[slot=action]` → `.page-intro__row` | "Cuisines" / "19 cuisines · shown in filters and caterer profiles" + primary "Add cuisine" | default, busy | canvas |
| `pages/caterers/*`, `occasion` (and the page behind `filters`, `filter-menu`, `search`, `site-menu`) | `sh-browse-layout` | title "Caterers" + live count "60 caterers"; aside "Filters"; head (phone "Filters" bar, MD filter bar, chips); results grid and pagination | default, loading ("Loading caterers"), filtered, no-results ("0 caterers"), occasion ("Weddings · 23 caterers") | canvas |
| `pages/caterer/*` (and behind `enquiry`, `photo-viewer`, `report`, `review`, `delete-review`) | `sh-caterer-layout` | main column (gallery, head, prose, sections); panel "Enquire" with event sizes, occasions and "Send an enquiry" | default, `busy` (panel `aria-hidden`), removed, offline | canvas |
| `pages/dashboard*`, `profile-*`, `dashboard-*` (15 screens) | `sh-work-layout` with `preview` | nav "Dashboard"; work main; preview "Your listing card", "Live preview", "How you’ll appear", "Hidden from the listing", "Live preview: current public name" | default, loading, empty, draft | canvas |
| `pages/admin-*` (20 screens) | `sh-work-layout`, no preview | nav "Operator"; work main | default, loading, error, empty | canvas |
| `pages/inbox/default`, `filtered`, `loading`, `long`, `no-results`, `offline`, `pages/dashboard-enquiries`, `dashboard-enquiry` | `sh-inbox-layout` `mode="list"` | list section labelled by "Inbox"; thread area with the placeholder | default, loading | canvas |
| `pages/thread/*` (and behind `close-enquiry`, `share-contact`, toast) | `sh-inbox-layout` `mode="thread"` | list section "Inbox" (h2); thread | default | canvas |
| `pages/inbox/empty`, `error` | `sh-inbox-layout` `mode="solo"` | "No enquiries yet" empty state | empty, error | canvas |
| `pages/sign-in`, `register`, `register-caterer`, `forgot-password`, `reset-password`, `two-factor`, `verify-email`, `privacy-update` | plain `main#main` > `sh-auth-layout` | head (photo row, `h1` "Sign in", subtitle); form `.stack`; `.auth__alt` | default, busy (`verify-email/loading`) | canvas |
| Forms, panels and rows everywhere (216 screens use `.stack`, 230 use `.cluster`) | utility classes `.stack`, `.stack--sm`, `.stack--lg`, `.cluster`, `.cluster--between`, `.cluster--end` | sign-in form, dialog bodies, status lines | — | any |
| `pages/caterer`, `admin-profile-review`, `dialogs/approve-profile` | utility `.prose.measure` | caterer description ("Kendra Baptiste learned to burn sugar for pelau…") | — | canvas, dialog |

Not product markup: `<span>` copies of these blocks inside dialog and
notification mocks are the static page behind an overlay. `.grid`,
`.grid--auto`, `.container--narrow`, `.section-gap` and `.auth--wide` are in
no mock yet; they come from the design system's base kit and are specified so
the pages that need them (About, Privacy, Terms; caterer registration) adopt
them without an API change (D-4, D-9).

## Anatomy

1. **Container** — `.container` on `main#main` (or a `div`): `width: 100%`,
   `max-width: --layout-container-max` including margins, centred, side
   padding `--layout-margin`. `.container--narrow` caps it at 42rem.
   `.has-sticky-cta` adds bottom room for the phone enquiry bar.
2. **Page shell** — `.page`: a column at least `100dvh` high; `.page > main`
   grows, so the footer sits at the bottom of short pages.
3. **Page intro** — `.page-intro`: a column holding the one `h1` and its
   lines, `--space-2` apart, with `--space-8` above and `--space-10` below
   (`--space-16` / `--space-12` from 62rem). With an action,
   `.page-intro__row` puts the title block (a `div`) at the start and the
   action at the end, wrapping under the title when it runs out of room.
4. **Browse layout** — `.browse` with `.browse__title` (the `h1` and live
   result count), `aside.browse__aside` (filter column, shown from 62rem),
   `section.browse__results` (results, with `.browse__head` for the phone and
   tablet filter bars and chips; `:empty` collapses it).
5. **Caterer layout** — `.caterer-layout`: the main column (`div`) and
   `aside.enquiry-panel` (from 62rem: `--layout-panel-width`, sticky at
   `--space-8`, hairline border, `--radius-lg`, `--space-8` padding; hidden
   below with `.only-lg`).
6. **Work layout** — `.work-layout`: the side navigation, `div.work-main` and,
   with `.work-layout--preview`, `aside.preview-pane` (from 75rem: a 16rem
   sticky column with `h2.preview-pane__label`).
7. **Inbox layout** — `.inbox-layout`: `section.inbox-layout__list` and
   `div.inbox-layout__thread`; `--thread` shows the thread alone below 62rem,
   `--solo` uses one column.
8. **Auth layout** — `.auth` (28rem; `.auth--wide` 34rem) with `.auth__head`
   (photo row, `h1`, subtitle) and the form; `.auth__alt` is muted small text
   below.
9. **Utilities** — `.stack` (`--sm`, `--lg`), `.cluster` (`--between`,
   `--end`), `.grid` (`--auto`, `.span-full`), `.prose`, `.measure`,
   `.section-gap`. Global classes, applied directly.

Hosts: every `sh-*` here **is** its native element (an attribute selector such
as `main[sh-container]`, `div[sh-browse-layout]`, or the chosen framework's
equivalent), never a wrapper, so `.page > main`, the grid areas and
`.inbox-layout--thread .inbox-layout__list` match unchanged (D-3). Area
elements (`.browse__aside`, `.enquiry-panel`, `.work-main`, `.preview-pane`,
`.inbox-layout__list`, `.inbox-layout__thread`, `.auth__head`) are rendered by
the layout component and their content is projected into them.

## API

### `sh-container`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `element` | `'main' \| 'div'` | `'main'` | no | `'main'` renders `<main id="main" class="container">`, the skip-link target; at most one per page. `'div'` renders `div.container` with no id (system pages inside a plain `main#main`). |
| `narrow` | `boolean` | `false` | no | Adds `.container--narrow` (42rem): reading pages About, Privacy, Terms. |
| `stickyCta` | `boolean` | `false` | no | Adds `.has-sticky-cta`, reserving `--space-24` plus the bottom safe area below the content and the footer, so the [sticky CTA](sticky-cta.md) never covers the last line. Set it exactly when the page renders a sticky CTA. |
| `busy` | `boolean` | `false` | no | Renders `aria-busy="true"` while the whole work area loads (photo, menu and certificate managers); absent otherwise. |

### `sh-page`

No inputs. Slots: `[slot=header]` (the skip link and [site
header](site-header.md)), default (exactly one `main#main`, normally
`sh-container`), `[slot=footer]` ([footer](footer.md)). Renders `div.page`.

### `sh-page-intro`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `busy` | `boolean` | `false` | no | Renders `aria-busy="true"` while the subtitle or counts load; the consumer projects skeletons and a visually hidden status ("Loading your enquiries"). |

| Slot | Accepts | Rule |
|---|---|---|
| default | The page's one `h1`, then its lines: `p.subtitle`, a status `p.cluster`, `p.save-status`, a leading avatar cluster | Without an action, projected directly into `div.page-intro`. With an action, projected into the title `div` of `.page-intro__row`. The `h1` is required, first in reading order unless a decorative avatar precedes it. |
| `[slot=action]` | One primary [button](button.md) (or anchor), optionally a secondary | When filled, the component renders `.page-intro__row` and places the action after the title block. When empty, no row is rendered. |

### `sh-browse-layout`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `asideLabel` | `string` | — | yes | `aria-label` of `aside.browse__aside` ("Filters"). |
| `resultsHeading` | `string` | — | yes | Text of the visually hidden `h2` ("Results") that the component renders first in `section.browse__results`, with a generated unique id that the section's `aria-labelledby` points at. |
| `headAtLg` | `boolean` | `false` | no | `false` adds `.until-lg` to `.browse__head` (the phone and tablet filter bars); `true` keeps the head at LG and XL, for active-filter chips (L2-009.4). |

| Slot | Rule |
|---|---|
| `[slot=title]` | Into `div.browse__title`: the `h1` ("Caterers", "Weddings") and the live count `p.result-count`. |
| `[slot=aside]` | Into `aside.browse__aside`: the filter groups. |
| `[slot=head]` | Into `div.browse__head` at the top of the results: phone bar, MD filter bar, chips. Empty collapses. |
| default | Into `section.browse__results` after the heading and the head: the grid, pagination, empty states. |

### `sh-caterer-layout`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `panelLabel` | `string` | — | yes | `aria-label` of the panel `aside` ("Enquire"). |
| `busy` | `boolean` | `false` | no | Renders `aria-busy="true"` on `div.caterer-layout` and `aria-hidden="true"` instead of `aria-label` on the panel, which then holds only skeletons. |

| Slot | Rule |
|---|---|
| default | Into the main-column `div`: gallery, caterer head, description, sections. |
| `[slot=panel]` | Into `aside.enquiry-panel.only-lg`: event sizes, occasions, "Send an enquiry", the note. |

### `sh-work-layout`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `previewLabel` | `string \| null` | `null` | no | When set, adds `.work-layout--preview` and renders `aside.preview-pane` labelled by an `h2.preview-pane__label` with this text ("Your listing card", "Live preview", "How you’ll appear", "Hidden from the listing"). `null` renders no pane. |

| Slot | Rule |
|---|---|
| `[slot=nav]` | The [side nav](side-nav.md) (`nav.side-nav aria-label="Dashboard"` or `"Operator"`), projected as the first grid child with no wrapper. |
| default | Into `div.work-main`: eyebrow, page intro, the work. |
| `[slot=preview]` | Into the preview pane after its label: the [caterer card](caterer-card.md). Ignored when `previewLabel` is `null`. |

### `sh-inbox-layout`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `mode` | `'list' \| 'thread' \| 'solo'` | `'list'` | no | `'list'`: list, plus the thread area from 62rem. `'thread'`: adds `.inbox-layout--thread` (thread alone below 62rem, both from 62rem). `'solo'`: adds `.inbox-layout--solo` (one column) and renders no thread area. |
| `listLabelledBy` | `string` | — | yes | Id of the list's heading (`h1#inbox-title` "Inbox", or `h2#list-title` in thread mode) for `section.inbox-layout__list`. |

| Slot | Rule |
|---|---|
| `[slot=list]` | Into `section.inbox-layout__list`: page intro or heading, status filter, rows, empty state. |
| `[slot=thread]` | Into `div.inbox-layout__thread`: the thread, or the "Select an enquiry" placeholder. Not rendered in `solo`. |

### `sh-auth-layout`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `wide` | `boolean` | `false` | no | Adds `.auth--wide` (34rem), for caterer registration. |
| `busy` | `boolean` | `false` | no | Renders `aria-busy="true"` (verifying an email link). |

| Slot | Rule |
|---|---|
| `[slot=head]` | Into `div.auth__head`: photo row, `h1`, subtitle. |
| default | After the head: the form (`form.stack`), `p.auth__alt`. |

### Outputs

None. Layouts place content; they report nothing.

### Utility classes

| Class | Rule |
|---|---|
| `.stack`, `.stack--sm`, `.stack--lg` | Vertical flex, gap `--space-4`, `--space-2`, `--space-8`. Never override the gap inline (the sign-in form's 20 px gap is drift, D-6). |
| `.cluster`, `.cluster--between`, `.cluster--end` | Wrapping row, gap `--space-3`, centred; space-between or end. |
| `.grid`, `.grid--auto`, `.span-full` | Layout-column grid (`--layout-columns`, gap `--layout-gutter`); auto-fill tracks of `min(100%, 18rem)`; a child spanning the row. Children never overflow their cell: long words wrap (D-13). |
| `.prose`, `.measure`, `.section-gap` | `--text-body-lg` with paragraph rhythm; max width `--layout-measure`; top margin `--layout-section-gap`. |

- Translation: the only strings the components take are the landmark labels
  (`asideLabel`, `resultsHeading`, `panelLabel`, `previewLabel`), from the resource files
  (L2-064). Everything else is projected.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Container | `.container` | Every page's `main`. |
| Narrow container | `.container--narrow` | Reading pages: About, Privacy, Terms. |
| Container with sticky CTA | `.has-sticky-cta` | Caterer page, below 62rem the enquiry bar sits over the bottom. |
| Work layout with preview | `.work-layout--preview` | Caterer dashboard and profile editor. |
| Inbox, thread | `.inbox-layout--thread` | An open enquiry thread. |
| Inbox, solo | `.inbox-layout--solo` | No enquiries yet, or the list failed to load. |
| Auth, wide | `.auth--wide` | Caterer registration (more fields side by side). |

| Size | Max width | Used for |
|---|---|---|
| `.container` | `--layout-container-max` (90rem incl. margins) | Every page |
| `.container--narrow` | 42rem | Reading pages |
| `.auth` / `.auth--wide` | 28rem / 34rem | Sign-in family / caterer registration |
| `.measure`, `p` | `--layout-measure` (62ch) | Paragraphs |
| Side column | `--layout-sidebar-width` (15rem) | Filter column, side nav |
| Enquiry panel | `--layout-panel-width` (22rem) | Caterer page from 62rem |
| Preview pane | 16rem | Dashboard from 75rem |

## States

Layouts have no hover, focus, active or disabled states. Their states are
structural:

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Areas placed per breakpoint (see *Responsive behaviour*) | Landmarks: `main`, `aside` "Filters" / "Enquire", `nav` "Dashboard", `section` labelled by its heading |
| Loading (container) | `sh-container` `busy` | Children show skeletons in their final positions | `aria-busy="true"` on `main` |
| Loading (page intro) | `sh-page-intro` `busy` | Skeleton bars in place of subtitle and counts | `aria-busy="true"`; the consumer's visually hidden status names what loads |
| Loading (caterer) | `sh-caterer-layout` `busy` | Same two columns; skeleton photos, title and panel | `aria-busy="true"`; panel `aria-hidden="true"` |
| Loading (auth) | `sh-auth-layout` `busy` | Head and a progress line | `aria-busy="true"` |
| Empty head | `.browse__head:empty` | Collapses; no gap above the results | — |
| Thread open | `mode="thread"` | Below 62rem list hidden, thread full width; from 62rem both | List section removed from the tree below 62rem (`display: none`) |
| Solo | `mode="solo"` | One column at every width | No thread area |
| Preview | `previewLabel` set | Third column from 75rem; hidden below | Pane is a complementary landmark named by its label |
| Sticky CTA room | `stickyCta` | Bottom padding `--space-24` + safe area below 62rem's content and footer | — |

## Markup

```html
<!-- rendered: page shell, container, page intro without action -->
<div class="page">
  <a class="skip-link" href="#main">Skip to main content</a>
  <header class="site-header">…</header>
  <main id="main" class="container">
    <div class="page-intro">
      <h1>Inbox</h1>
      <p class="subtitle">4 enquiries · 1 unread</p>
    </div>
    …
  </main>
  <footer class="site-footer">…</footer>
</div>
```

```html
<!-- rendered: page intro with an action (admin-cuisines) -->
<div class="page-intro">
  <div class="page-intro__row">
    <div><h1>Cuisines</h1><p class="subtitle">19 cuisines · shown in filters and caterer profiles</p></div>
    <button class="btn btn--primary" type="button" aria-haspopup="dialog">Add cuisine</button>
  </div>
</div>
```

```html
<!-- rendered: browse layout (listing) -->
<div class="browse">
  <div class="browse__title"><h1>Caterers</h1><p class="result-count" role="status" aria-live="polite">60 caterers</p></div>
  <aside class="browse__aside" aria-label="Filters">…</aside>
  <section class="browse__results" aria-labelledby="results-title">
    <h2 class="visually-hidden" id="results-title">Results</h2>
    <div class="browse__head until-lg">…</div>
    <ul class="caterer-grid">…</ul>
  </section>
</div>
```

```html
<!-- rendered: caterer layout, with sticky CTA room; busy swaps aria-label for aria-hidden on the panel -->
<main id="main" class="container has-sticky-cta">
  <a class="eyebrow" href="/caterers">Caterers</a>
  <div class="caterer-layout">
    <div>…gallery, head, sections…</div>
    <aside class="enquiry-panel only-lg" aria-label="Enquire">…</aside>
  </div>
</main>
```

```html
<!-- rendered: work layout with preview (dashboard) -->
<div class="work-layout work-layout--preview">
  <nav class="side-nav" aria-label="Dashboard">…</nav>
  <div class="work-main">…</div>
  <aside class="preview-pane" aria-labelledby="preview-title">
    <h2 class="preview-pane__label" id="preview-title">Your listing card</h2>
    <a class="caterer-card" href="/caterers/pelau-house">…</a>
  </aside>
</div>
```

```html
<!-- rendered: inbox layout, thread open -->
<div class="inbox-layout inbox-layout--thread">
  <section class="inbox-layout__list" aria-labelledby="list-title"><h2 class="inbox-heading" id="list-title">Inbox</h2>…</section>
  <div class="inbox-layout__thread">…</div>
</div>
```

```html
<!-- rendered: auth layout inside a plain main -->
<main id="main">
  <div class="auth">
    <div class="auth__head"><div class="photo-row">…</div><h1>Sign in</h1><p class="subtitle">Welcome back. Your inbox and saved enquiries are waiting.</p></div>
    <form class="stack" …>…</form>
    <p class="auth__alt">New to Sweet Hand? <a href="/register">Create an account</a></p>
  </div>
</main>
```

```html
<!-- rendered: system page (container as div) and reading page (narrow) -->
<main id="main"><div class="container"><div class="system-page">…</div></div></main>
<main id="main" class="container container--narrow"><div class="prose">…</div></main>
```

`div.caterer-layout` with `busy` renders `aria-busy="true"`; the list mode of
the inbox renders the same markup without the modifier, and solo renders
`.inbox-layout--solo` with no thread `div`. The preview pane's `id` is
generated unique per instance; the e2e page objects locate it by class.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: listing page -->
<sh-browse-layout [asideLabel]="t('filters.label')" [resultsHeading]="t('caterers.results')">
  <ng-container slot="title"><h1>{{ t('caterers.title') }}</h1><p class="result-count" role="status" aria-live="polite">{{ countText() }}</p></ng-container>
  <ng-container slot="aside">…</ng-container>
  …results…
</sh-browse-layout>

<!-- consumer: caterer dashboard -->
<sh-work-layout [previewLabel]="t('dashboard.previewLabel')">
  <sh-side-nav slot="nav" …></sh-side-nav>
  <sh-page-intro><h1>{{ business() }}</h1>…</sh-page-intro>
  <sh-caterer-card slot="preview" …></sh-caterer-card>
</sh-work-layout>

<!-- consumer: page intro with action -->
<sh-page-intro><h1>{{ t('admin.cuisines.title') }}</h1><p class="subtitle">{{ subtitle() }}</p>
  <sh-button slot="action" variant="primary" haspopup="dialog" (activated)="add()">{{ t('admin.cuisines.add') }}</sh-button>
</sh-page-intro>
```

The e2e page objects locate areas by these classes and landmarks
(`main#main`, `aside[aria-label="Filters"]`, `.preview-pane`), so the class
names, the landmark elements and their labels are part of the contract.

## Design

- Container: `max-width: --layout-container-max`, `padding-inline:
  --layout-margin` (16 → 32 → 48 → 80 px at 0, 48, 62, 75rem); narrow 42rem.
- Grid: `--layout-columns` (4, 8, 12) and `--layout-gutter` (24, 32, 40 px);
  every column `minmax(0, 1fr)` so long words wrap instead of widening a
  track.
- Page intro: gap `--space-2`; margins `--space-8` / `--space-10`, from 62rem
  `--space-16` / `--space-12`; row gap `--space-4`, aligned to the end.
- Browse: from 62rem columns `--layout-sidebar-width` and the rest,
  column gap `--space-12`, top margin `--space-16`; title margins `--space-6`
  (0 / `--space-8` from 62rem); aside gap `--space-10`; head gap `--space-4`,
  bottom margin `--space-10`.
- Caterer: gap `--space-12` (`--space-16` from 62rem); panel
  `--layout-panel-width`, sticky `top: --space-8`, padding `--space-8`, border
  `--border-width-hairline` `--color-border-default`, radius `--radius-lg`,
  gap `--space-6`.
- Work: gap `--space-8` (`--space-12` and top margin `--space-12` from
  62rem); preview pane 16rem from 75rem, sticky `top: --space-8`, gap
  `--space-4`, label `--text-label` in `--color-fg-subtle`.
- Inbox: gap `--space-8`; from 62rem list `minmax(20rem, 26rem)`, gap
  `--space-12`, top margin `--space-16`.
- Auth: 28rem / 34rem, top margin `--space-8` (`--space-16` from 48rem),
  padding `--layout-margin`, gap `--space-8`; head gap `--space-3`; alt text
  `--text-body-sm` in `--color-fg-muted`.
- Sticky CTA room: `padding-bottom: calc(--space-24 + safe area)`.
- Scrolling: `html` has `scroll-padding-top: --layout-topbar-height` (and
  bottom room for the sticky CTA below 62rem), so anchors and focused fields
  are never hidden under the header or the bar.
- Elevation and layer: none; nothing sets `z-index` or `overflow: hidden`, so
  focus rings are never clipped.
- Motion: none, except `scroll-behavior: smooth`, which reduced motion turns
  off.

Component tokens: none. Density changes by overriding the layout tokens
(`--layout-gutter`, `--layout-margin`) on a wrapper, never by margins on
children.

## Colour

Layouts read no colour tokens except the panel and pane edges and the muted
lines that live in their areas.

| Part | Token | Light | Dark |
|---|---|---|---|
| Page canvas (from `body`) | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Enquiry panel border | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Page-intro subtitle, `.auth__alt` | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Preview pane label | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Page text, `h1` |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Subtitle, result count, `.auth__alt` |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Preview pane label |

The panel border is decorative (the panel is also a named landmark with a
heading inside), so it has no 3:1 minimum. Themes never change layout;
forced colours change nothing here.

## Responsive behaviour

| Token / layout | XS, SM (below 48rem) | MD (48–62rem) | LG (62–75rem) | XL (75rem+) |
|---|---|---|---|---|
| `--layout-columns` / gutter / margin | 4 / 24 / 16 px | 8 / 32 / 32 px | 12 / 40 / 48 px | 12 / 40 / 80 px |
| `.browse` | Title, head (phone "Filters" bar), results | Title, head (MD filter bar), results | 15rem filter column beside results; head only with `headAtLg` | Same as LG |
| `.caterer-layout` | One column; panel hidden; sticky CTA | Same | Content + 22rem sticky panel | Same |
| `.work-layout` | One column: the work only (the [side nav](side-nav.md) hides itself below 62rem; an eyebrow links back to Overview) | Same | 15rem nav + work | `--preview` adds the 16rem pane |
| `.inbox-layout` | List, or thread alone (`--thread`) | Same | List (20–26rem) beside thread | Same |
| `.auth` | Full width within margins, `--space-8` from the top | `--space-16` from the top | Same | Same |
| `.page-intro__row` | Action wraps under the title | Same row when it fits | Same | Same |

- Source order equals visual order at every width; `.browse` places the
  aside with grid areas but keeps it after the title in the DOM.
- `.page` uses `100dvh`, so the footer does not jump when the phone's address
  bar hides.
- At 320 px every layout fits the 288 px content box with no horizontal
  scroll or clipping; at 200 % zoom on a 1280 px window the viewport is
  640 CSS px, so the phone layouts take over and everything stays available.
- Touch targets belong to the components inside; layouts never shrink them.

## Accessibility

### Role and pattern

Layouts are built on landmarks ([APG Landmark
regions](https://www.w3.org/WAI/ARIA/apg/practices/landmark-regions/)):
`main#main` once per page, `aside` "Filters" and "Enquire", the side `nav`
"Dashboard" / "Operator", `aside.preview-pane` labelled by its heading,
`section` labelled by its heading. One `h1` per page, in the page intro, the
browse title, the caterer head or the auth head.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> (first press) | Shows "Skip to main content"; activating it moves focus to `main#main`. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Follows source order, which matches the visual order at every breakpoint. |

### Focus

- No layout clips focus: no `overflow: hidden` on containers or areas.
- `scroll-padding-top` equals the header height and, below 62rem on the
  caterer page, the bottom scroll padding equals the sticky bar, so a focused
  element or anchor target is never hidden behind either (WCAG 2.4.11).

### Labelling

Every repeated landmark has a name: `asideLabel`, `panelLabel`, the preview
label, the side nav's label, the results section by its visually hidden
heading. Hidden areas (`display: none` at a width) are removed from the tree
with them.

### Announcements

None. The live result count belongs to the listing page.

### Motion

Layouts do not animate. Anchor scrolling is smooth only without
`prefers-reduced-motion: reduce`.

## Content and internationalisation

- The `h1` is a noun for the place ("Caterers", "Inbox", "Food safety",
  "Review queue"); a caterer's or person's name is the `h1` on their page
  ("Pelau House", "Marcia Thompson").
- The subtitle is one muted line of fact: "19 cuisines · shown in filters and
  caterer profiles", "4 enquiries · 1 unread". No welcome copy in work areas.
- Prose stays within `--layout-measure` and uses Canadian English.
- Empty space stays empty: a gap is never a slot for a tip or promotion.
- Translatable inputs: `asideLabel` ("Filters"), `resultsHeading` ("Results"), `panelLabel` ("Enquire"),
  `previewLabel` ("Your listing card"). Data values: everything projected.
- Long content wraps: "The Original Auntie Philomena's Roti, Doubles &
  Pholourie Kitchen" as a caterer `h1` wraps inside its column (`minmax(0,
  1fr)`), and French labels about 30 % longer never widen a track.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (class lists, whether the
  intro row or the preview pane renders) are computed once per input change,
  not in the template.
- Pure CSS layout: no resize observers, no JavaScript breakpoints; areas show
  and hide with the stylesheet's media queries, so the server-rendered HTML
  is already laid out on first paint.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Container.ts`
  renders Pelau House's caterer page shell (`sh-page`, `sh-container` with
  `stickyCta`, `sh-caterer-layout` with the "Enquire" panel) and the listing
  shell (`sh-browse-layout` with "Caterers" / "60 caterers" and 24 card
  placeholders); iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep it at roughly 100–300 ms.
- Composite scenarios: `ListingPage`, `CatererPage`, `Dashboard`, `Inbox`,
  `DarkTheme`.
- Regression rule: a change to the templates, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: loading states keep the final grid (same columns, panel
  and pane widths); skeletons fill the areas, so nothing shifts when data
  arrives.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given any page rendered at 360 px and at 1600 px, when the container is measured, then `main#main.container` has 16 px side padding at 360 px, and at 1600 px it is 1440 CSS px wide including its 80 px margins and centred. (L2-064)
- **AC-2** Given Pelau House's caterer page, when a keyboard user presses Tab once and activates "Skip to main content", then focus moves to `main#main` and the next Tab reaches the first link inside it, "Caterers". (L2-067)
- **AC-3** Given the "Page not found" page at 1280 × 900 px, when it renders, then the footer's bottom edge is at the bottom of the viewport and no content overlaps it. (L2-064)
- **AC-4** Given the operator's Cuisines page, when the page intro renders with an action, then it is `div.page-intro > div.page-intro__row` holding a title `div` ("Cuisines", "19 cuisines · shown in filters and caterer profiles") and the "Add cuisine" button at the end of the same row at 1280 px, and at 320 px the button wraps under the subtitle with no horizontal scrolling. (L2-064)
- **AC-5** Given every landmark on the listing, the caterer page, the dashboard and the inbox, when axe-core runs at 360 px and 1280 px, then it reports 0 violations, each page has exactly one `main`, and the filter column, enquiry panel, side nav and preview pane each have a unique accessible name. (L2-066)

### Listing

- **AC-6** Given the listing at 1280 px, when it renders, then `aside.browse__aside` named "Filters" is a 15rem column to the left of `section.browse__results`, below "Caterers" / "60 caterers", and stays visible while the results scroll. (L2-009)
- **AC-7** Given the listing at 800 px (MD), when it renders, then the filter column is not displayed and `.browse__head` above the results shows the filter bar of dropdowns. (L2-009)
- **AC-8** Given the listing at 360 px, when it renders, then the filter column is not displayed and `.browse__head` shows the "Filters" bar above a one-column results area. (L2-009)
- **AC-9** Given the listing filtered by "Jamaican" and "Scarborough" at 1280 px with `headAtLg`, when it renders, then `.browse__head` is displayed above the results with the two chips; given no active filters, then the head carries `.until-lg` and is not displayed. (L2-009)
- **AC-10** Given the listing at 1280 px, when a keyboard user tabs from the header, then focus passes through the filter column before the results, matching the visual order of the two columns. (L2-067)

### Caterer page

- **AC-11** Given Pelau House's page at 1280 px, when it renders, then `div.caterer-layout` has two columns: the main content and a 22rem `aside.enquiry-panel` named "Enquire" holding the event sizes, occasions and "Send an enquiry", which stays `--space-8` from the top while the page scrolls. (L2-019)
- **AC-12** Given Pelau House's page at 360 px and at 800 px, when it renders, then all sections are in one column, the enquiry panel is not displayed, and `main` has the class `has-sticky-cta`, so the last review is not covered by the sticky "Send an enquiry" bar when scrolled to the end. (L2-019)
- **AC-13** Given "The Original Auntie Philomena's Roti, Doubles & Pholourie Kitchen" at 320 px, when its caterer page renders, then the name wraps inside the main column and the page does not scroll horizontally. (L2-019)
- **AC-14** Given Pelau House's page loading at 360 px, when `sh-caterer-layout` renders with `busy` and then the content replaces the skeletons, then the layout has `aria-busy="true"` while loading, the panel has `aria-hidden="true"`, and the page's Cumulative Layout Shift stays at 0.1 or less. (L2-085)

### Work areas

- **AC-15** Given Pelau House's dashboard at 1280 px, when it renders with `previewLabel` "Your listing card", then the work layout has three columns: the side nav "Dashboard" (15rem), `div.work-main`, and a 16rem `aside.preview-pane` labelled "Your listing card" containing Pelau House's card. (L2-045)
- **AC-16** Given Kendra's profile editor at 1000 px (LG), when it renders, then the section navigation is a 15rem column beside the selected section in `div.work-main`. (L2-045)
- **AC-28** Given Kendra's profile editor at 1000 px (LG) with `previewLabel` "Your listing card", when it renders, then no `aside.preview-pane` is displayed and the work layout has two columns, the side nav and `div.work-main`; at 1280 px (XL) the preview pane appears as the third column (AC-15). (L2-045)
- **AC-17** Given the profile editor at 360 px, when it renders, then the work layout is one column with no preview pane displayed and no horizontal scrolling. (L2-045)

### Inbox

- **AC-18** Given Marcia's inbox at 1280 px, when it renders with `mode="list"`, then the list section labelled "Inbox" (20–26rem) and the thread area are side by side; given `mode="thread"` for Pelau House's enquiry, then the list and the thread are side by side. (L2-036)
- **AC-19** Given Marcia's inbox at 800 px, when it renders with `mode="list"`, then only the list is displayed; when she opens Pelau House's enquiry (`mode="thread"`), then only the thread is displayed, full width. (L2-036)
- **AC-20** Given Marcia has no enquiries, when the inbox renders with `mode="solo"` at 1280 px, then `.inbox-layout--solo` has one column holding "No enquiries yet" and no `.inbox-layout__thread` element exists. (L2-036)

### Responsive and auth

- **AC-21** Given the sign-in page, when it renders at 360 px, then `.auth` fills the width inside 16 px margins with the form below the head; when it renders at 1280 px, then it is at most 28rem wide, centred, 64 px below the header. (L2-064)
- **AC-22** Given each page template in L2-064 rendered at 320, 575, 576, 767, 768, 991, 992, 1199, 1200 and 2560 px, when it is inspected, then no layout area overflows its container and the page does not scroll horizontally. (L2-064)
- **AC-23** Given a 1280 px window at 200 % zoom, when the listing renders, then it shows the phone layout (no filter column, "Filters" bar) and every caterer, filter and page control is available with no horizontal scrolling. (L2-069)

### Focus and theming

- **AC-24** Given the caterer page at 1280 px, when a user follows the "4.7 · 23 reviews" link to `#reviews`, then the "Reviews" heading appears fully below the header, not under it, because `scroll-padding-top` equals `--layout-topbar-height`. (L2-067)
- **AC-25** Given the light and the dark theme, when the dashboard renders at 1280 px, then every area keeps the same position and width in both, and the page-intro subtitle has at least 4.5:1 and the preview pane label at least 4.5:1 contrast against `--color-bg-canvas`. (L2-069)

### Motion

- **AC-26** Given `prefers-reduced-motion: reduce`, when a user follows the "4.7 · 23 reviews" anchor on Pelau House's page, then the page jumps to the section without smooth scrolling, and no layout area animates. (L2-069)

### Performance

- **AC-27** Given the `Container` perf-test scenario, when it renders the listing and caterer page shells, then it does not regress against the base branch with `--fail-on-regression`, and the listing page at 360 px loads with a Cumulative Layout Shift of 0.1 or less. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/container/`; files
  `container.component.*`, `page.component.*`, `page-intro.component.*`,
  `browse-layout.component.*`, `caterer-layout.component.*`,
  `work-layout.component.*`, `inbox-layout.component.*`,
  `auth-layout.component.*`; classes `ContainerComponent`, `PageComponent`,
  `PageIntroComponent`, `BrowseLayoutComponent`, `CatererLayoutComponent`,
  `WorkLayoutComponent`, `InboxLayoutComponent`, `AuthLayoutComponent`.
- Styles: the layout section of `components.css` (`.container` to `.auth`,
  `.has-sticky-cta`, `.preview-pane`, `.enquiry-panel`) moves into these
  components; `.stack`, `.cluster`, `.grid`, `.span-full`, `.prose`,
  `.measure`, `.section-gap` and the `.only-*` / `.until-lg` visibility
  classes stay in the global foundations stylesheet (D-2).
- Mock drift to correct on adoption: the About page uses
  `main.container` with `.prose` and `system-page__actions` restyled inline;
  it becomes `sh-container narrow` + `.prose` (D-4). The sign-in form's inline
  `gap: var(--space-5)` on `.stack` is dropped (D-6). The inbox list section
  without a class in list mode gains `.inbox-layout__list` (D-7).
  `.page-header` (admin-profile-review only) is rendered as `sh-page-intro`
  with an action (D-8).
- Design-system catch-up for D-13: add `.grid > * { min-width: 0; overflow-wrap: anywhere; }`
  after the `.grid` rule.
- Composes [button](button.md) (in the intro's action slot, as consumer
  content), [side nav](side-nav.md), [caterer card](caterer-card.md); hosts the
  [sticky CTA](sticky-cta.md) room. No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Are stack, cluster, grid and prose components?* No, global utility classes. They are one-property placement rules used inside hundreds of other components and forms; a component host would add a DOM level that breaks `> *` and flex-child rules, and AGENTS.md allows shared foundations and utilities as global styles. The container and the product layouts are components because they render landmarks and labelled areas that must stay consistent.
- **D-3** *What are the hosts?* Each component is its native element (attribute selector), not a wrapper. `.page > main`, the grid areas and `.inbox-layout--thread .inbox-layout__list` rely on parent–child structure, and the same rule is used for [accordion](accordion.md) rows.
- **D-4** *How do reading pages lay out?* `sh-container narrow` with `.prose`, as the design system fixed it; About's inline restyling of `.system-page` is drift. The 42rem width keeps prose at the measure without inline styles.
- **D-5** *Who renders `main#main`?* `sh-container` with `element="main"` on pages that use the container; auth and system pages write a plain `<main id="main">` around `sh-auth-layout` or a `div` container, as the mocks do. Either way there is exactly one `main#main` per page, the skip-link target.
- **D-6** *May a page override a stack's gap?* No. Pick `.stack--sm`, `.stack` or `.stack--lg`; the sign-in form's 20 px gap is drift the design system removed.
- **D-7** *Does the list area always carry `.inbox-layout__list`?* Yes, in every mode. The list-mode mocks omit it, which is harmless today, but one structure in all modes lets page objects find the list the same way and lets `--thread` work without a markup change.
- **D-8** *Is `.page-header` part of the API?* No. It duplicates `.page-intro__row` on one operator screen; the design system keeps it only for mock parity, so the product renders `sh-page-intro` with an action there.
- **D-9** *Are `.grid`, `.grid--auto`, `.section-gap` and `.auth--wide` built although no mock uses them?* Yes. They are part of the stable design-system kit; caterer registration needs the wide auth column, and building them now avoids an API change.
- **D-10** *Does the work area show the listing-card preview at LG (62–75rem)?* No; the preview pane appears from 75rem, as the design system and every dashboard mock show. At 62rem a third 16rem column would leave the work area about 300 px wide. At LG the side nav sits beside the work area with no preview pane, per the user's decision of 10 Oct 2026; L2-045.3 and L2-045.4 were amended on 10 Oct 2026 to match (AC-28).
- **D-11** *Does solo mode render the thread area?* No. The mocks keep an empty `div.inbox-layout__thread` in solo, which becomes an empty grid row from 62rem; it has no purpose in a one-column layout.
- **D-12** *Does the caterer layout own the enquiry panel's frame?* Yes: the `aside.enquiry-panel.only-lg` element, its sticky position, border and padding live in the caterer-page layout section of the design system. Its content (event sizes, occasions, the button, the note) is the page's.
- **D-13** *What happens to a long word in a `.grid` cell on a phone?* It wraps (`overflow-wrap: anywhere` on `.grid > *`). At 360 px the four layout columns are about 60 px wide, and the rendering showed "Scarborough" and "Pickering" running into the next cell. The design-system rule says long words wrap instead of forcing sideways scroll; `components.css` catches up, and the rendering applies it with a specimen-only style.
