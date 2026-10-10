# Sheet

| Field | Value |
|---|---|
| Selector | `sh-sheet` (full-height modal panel: full screen on phones, a 28rem side sheet from 48rem; also the `.drawer` side panel) |
| Library path | `frontend/projects/components/src/lib/sheet/` |
| Status | planned |
| Traces to | L2-009, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`sheet.html`](../../design-system/components/sheet.html) |
| Source mocks | [`dialogs/filters/default`](../../mocks/dialogs/filters/default.html), [`dialogs/filters/selected`](../../mocks/dialogs/filters/selected.html), [`dialogs/filters/busy`](../../mocks/dialogs/filters/busy.html), [`dialogs/site-menu/default`](../../mocks/dialogs/site-menu/default.html), [`dialogs/site-menu/signed-in`](../../mocks/dialogs/site-menu/signed-in.html), [`dialogs/site-menu/caterer`](../../mocks/dialogs/site-menu/caterer.html), [`dialogs/site-menu/operator`](../../mocks/dialogs/site-menu/operator.html), [`pages/caterers/default`](../../mocks/pages/caterers/default.html) |
| Rendering | [`sheet.html`](sheet.html) |

## Purpose and scope

A sheet is a modal dialog shaped for content that is tall rather than wide:
the phone Filters panel (every cuisine and region as checkboxes, "Clear" and
"Show 60 caterers") and the site menu (the header links that do not fit below
48rem, then "Signed in as Marcia Thompson" and "Sign out"). Below 48rem it
fills the screen and slides up; from 48rem it is a 28rem panel on the right
over a backdrop. The same component draws the `.drawer`, a side panel at every
width, kept for a future operator side panel.

Use a [dialog](dialog.md) for one decision or a short form, a
[popover](popover.md) or the [filter trigger](filter-trigger.md) dropdown for a
handful of choices that should not cover the page, and a [menu](menu.md) for
an action list about one object.

Out of scope:

- The content: filter groups, checkboxes and chips ([filter
  list](filter-list.md), [checkbox](checkbox.md), [chip](chip.md)); the menu's
  link list ([filter list](filter-list.md) as navigation), badges
  ([badge](badge.md)) and "Sign out" ([button](button.md)).
- The trigger buttons: "Filters" is [filter trigger](filter-trigger.md); the
  header menu button is [icon button](icon-button.md) in
  [site header](site-header.md).
- What "Clear" and "Show 2 caterers" do (resetting the form, updating the URL
  and results): the listing page.

## Usage

Inventory from `usage_inventory.py docs/mocks sheet "div|form|nav"` and a read of
the seven sheet mocks.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/filters/default` (XS–SM listing) | `bodyAs="form"`, `formId="filters-form"`, footer | title "Filters", `closeLabel` "Close filters"; Cuisine and Area fieldsets; footer "Clear" (reset) + "Show 60 caterers" (submit, `form="filters-form"`) | open | full screen over the listing |
| `dialogs/filters/selected` | as above, `count` 2, `countLabel` "active" | "Filters 2"; Jamaican checked; chip "Scarborough"; "Show 2 caterers" | selected | full screen |
| `dialogs/filters/busy` | as above, `busy` | inputs disabled, Clear disabled, "Show 2 caterers" busy | busy | full screen |
| `dialogs/site-menu/default`, `signed-in`, `caterer`, `operator` | `bodyAs="nav"`, no footer | title "Menu", `closeLabel` "Close menu"; `.filter-list` links with `aria-current="page"`; badges "Inbox 1", "Review queue 7"; "Signed in as Leah Mohammed, Admin" + "Sign out"; About, Privacy, Terms | open, current | full screen below 48rem |
| Drawer (design system only) | `variant="drawer"` or `"drawer-left"` | "Report R-2047" details + Close / "Open report"; operator console links | open | side panel at every width |

## Anatomy

1. **Backdrop** — `.backdrop` before the panel at `--z-overlay`. Hidden behind
   the full-screen sheet below 48rem; dims the page beside the side sheet and
   drawer. Clicking it does nothing (D-5).
2. **Panel** — `.sheet` (or `.drawer`, `.drawer.drawer--left`) with
   `role="dialog"`, `aria-modal="true"`, `aria-labelledby` → title, at
   `--z-modal`; `aria-busy="true"` while busy.
3. **Header** — `.sheet__header` (`.drawer__header`): hairline bottom rule,
   top safe-area padding.
   - **Title** — `h2.sheet__title` in `--text-h4`, with an optional count
     bubble `span.filter-trigger__count` whose spoken words are visually hidden
     (", 2 active").
   - **Close** — [icon button](icon-button.md) `.icon-btn`, named for the sheet
     ("Close filters"), 44 × 44 px, focused on open.
4. **Body** — `.sheet__body` (`.drawer__body`): a `<div>`, a
   `<form id>` (filters) or a `<nav aria-labelledby>` (menu); scrolls on its
   own; groups `--space-8` apart.
5. **Footer (optional)** — `.sheet__footer` (`.drawer__footer`): hairline top
   rule, bottom safe-area padding; in a sheet the buttons share the width
   equally; in a drawer they are right-aligned.

Host: `sh-sheet` renders nothing in place; while `open` it attaches the
backdrop and panel to the overlay container at the end of `<body>` and makes
every other child of `<body>` `inert`, like [dialog](dialog.md).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `open` | `boolean` | `false` | no | Controlled by the consumer. |
| `variant` | `'sheet' \| 'drawer' \| 'drawer-left'` | `'sheet'` | no | Root class `.sheet`, `.drawer` or `.drawer.drawer--left`; region classes follow (`sheet__*` or `drawer__*`). |
| `title` | `string` | — | yes | `h2` title; the dialog's name. One word: "Filters", "Menu". |
| `count` | `number \| null` | `null` | no | When greater than 0, renders the count bubble after the title. `0` and `null` render none. |
| `countLabel` | `string \| null` | `null` | yes with `count` | The visually hidden word after the number: "active". The name becomes "Filters, 2 active". |
| `closeLabel` | `string` | — | yes | Close's accessible name: "Close filters", "Close menu". |
| `bodyAs` | `'div' \| 'form' \| 'nav'` | `'div'` | no | Element of the body. `nav` is labelled by the title (`aria-labelledby`). |
| `formId` | `string \| null` | `null` | yes with `form` | `id` of the body `<form>`, so footer buttons outside it use `form="filters-form"`. |
| `formAction` | `string \| null` | `null` | no | `action` of the body form; the filters form submits `GET /caterers` without script (D-6). |
| `busy` | `boolean` | `false` | no | `aria-busy="true"` on the panel. Close stays enabled (leaving keeps the previous results). Inputs, Clear and the primary are the consumer's. |
| `returnFocus` | `HTMLElement \| null` | `null` | no | Where focus goes on close; `null` means the element focused before opening (the trigger). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `dismissed` | `'escape' \| 'close'` | Escape or Close. Emitted while busy too. Never for a backdrop click. The consumer sets `open` to `false`; unsubmitted filter changes are discarded by the consumer. |
| `submitted` | `SubmitEvent` | The body form is submitted (`bodyAs="form"`). The native submission is prevented when the consumer handles it in place. |
| `closed` | `void` | After removal and focus return. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Body content: fieldsets of checkboxes, a [filter list](filter-list.md) of links, a signed-in line and "Sign out" | Inside the body element. |
| `footer` | One or two [buttons](button.md) | Omitted footer renders no `.sheet__footer`. In a sheet each button gets `flex: 1`. |

- Translation: `title`, `countLabel`, `closeLabel` and all slot text come from
  the resource files (L2-064); the component holds no strings.

## Variants and sizes

| Variant | Class | Below 48rem | From 48rem | Inner padding |
|---|---|---|---|---|
| Sheet | `.sheet` | Full screen, slides up | `--layout-sheet-width` (28rem) on the right, slides in, `--shadow-4`, backdrop | `--layout-margin` below 48rem, `--space-6` from 48rem |
| Drawer | `.drawer` | `min(100%, 28rem)` on the right | 28rem on the right | `--space-6` |
| Drawer, left | `.drawer.drawer--left` | As drawer, from the left | 28rem on the left | `--space-6` |

One width; height is always the full viewport.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | `open` false | Nothing rendered | — |
| Open | `open` true | Slides up (phone) or in from the edge; Close focused | Dialog "Filters" announced; page `inert` |
| With count | `count` > 0 | Ink bubble "2" after the title | Name "Filters, 2 active" |
| Busy | `busy` | Panel `aria-busy="true"`; consumer disables inputs and Clear and sets the primary busy | Close still works; Escape still closes |
| Current item (menu) | consumer sets `aria-current="page"` on a link | Pepper, semibold ([filter list](filter-list.md)) | "current page" |
| Scrolled | body taller than the viewport | Body scrolls; header and footer fixed | — |

## Markup

```html
<!-- rendered: filters sheet with a count and a footer -->
<div class="backdrop"></div>
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-sheet-1-title">
  <div class="sheet__header">
    <h2 class="sheet__title" id="sh-sheet-1-title">Filters <span class="filter-trigger__count"><span class="visually-hidden">, </span>2<span class="visually-hidden"> active</span></span></h2>
    <button class="icon-btn" type="button" aria-label="Close filters"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  </div>
  <form class="sheet__body" id="filters-form" action="/caterers">
    <fieldset class="filter-group"><legend class="filter-group__title">Cuisine</legend>…</fieldset>
    <fieldset class="filter-group"><legend class="filter-group__title">Area</legend>…</fieldset>
  </form>
  <div class="sheet__footer">
    <button class="btn" type="reset" form="filters-form">Clear</button>
    <button class="btn btn--primary" type="submit" form="filters-form">Show 2 caterers</button>
  </div>
</div>
```

```html
<!-- rendered: busy -->
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="…" aria-busy="true">
  … <button class="icon-btn" type="button" aria-label="Close filters">…</button> …
  <div class="sheet__footer">
    <button class="btn" type="reset" form="filters-form" disabled>Clear</button>
    <button class="btn btn--primary" type="submit" form="filters-form" aria-busy="true" aria-disabled="true">Show 2 caterers</button>
  </div>
</div>
```

```html
<!-- rendered: site menu, nav body, no footer -->
<div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sh-sheet-2-title">
  <div class="sheet__header"><h2 class="sheet__title" id="sh-sheet-2-title">Menu</h2><button class="icon-btn" type="button" aria-label="Close menu">…</button></div>
  <nav class="sheet__body" aria-labelledby="sh-sheet-2-title">
    <ul class="filter-list"><li><a class="filter-list__item" href="/caterers" aria-current="page">Caterers</a></li>…</ul>
    <div class="stack stack--sm"><p class="text-muted">Signed in as Marcia Thompson</p><button class="btn" type="button">Sign out</button></div>
  </nav>
</div>
```

```html
<!-- rendered: drawer (left); regions use drawer__* -->
<div class="drawer drawer--left" role="dialog" aria-modal="true" aria-labelledby="…">
  <div class="drawer__header"><h2 class="drawer__title" id="…">Operator</h2><button class="icon-btn" type="button" aria-label="Close operator menu">…</button></div>
  <div class="drawer__body">…</div>
</div>
```

```html
<!-- consumer: phone filters -->
<sh-sheet [open]="filtersOpen()" [title]="t('filters.title')" [count]="activeCount()" [countLabel]="t('filters.active')"
  [closeLabel]="t('filters.close')" bodyAs="form" formId="filters-form" formAction="/caterers" [busy]="loading()"
  (dismissed)="filtersOpen.set(false)" (submitted)="apply($event)">
  …fieldsets…
  <sh-button slot="footer" type="reset" form="filters-form" [disabled]="loading()">{{ t('filters.clear') }}</sh-button>
  <sh-button slot="footer" variant="primary" type="submit" form="filters-form" [busy]="loading()">{{ t('filters.show', { count }) }}</sh-button>
</sh-sheet>
```

The e2e page objects locate the sheet by `role="dialog"` and name and its
regions by these classes. Generated ids and icon paths are free to change.

## Design

- Header padding `--space-3` by `--layout-margin` (plus
  `env(safe-area-inset-top)`), gap `--space-4`; body `--space-6` by
  `--layout-margin`, groups `--space-8` apart; footer `--space-4` by
  `--layout-margin` (plus `env(safe-area-inset-bottom)`), gap `--space-3`. From
  48rem the inline padding is `--space-6`. Drawer: `--space-4`/`--space-6`
  header, `--space-6` body.
- Title `--text-h4`. Count bubble from [filter trigger](filter-trigger.md):
  1.375rem round, `--text-caption` semibold, `--color-action`.
- Rules `--border-width-hairline` in `--color-border-default`.
- Elevation `--shadow-4` on the side sheet and drawer; none full screen.
- Layers: backdrop `--z-overlay`, panel `--z-modal`.
- Motion: `slide-up` below 48rem, `slide-in-right` (or `slide-in-left`) from
  48rem and for drawers, over `--duration-slow` with `--ease-enter`. Closing is
  instant.
- No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel | `--color-bg-surface-raised` | `--palette-white` | `--palette-stone-850` |
| Header and footer rules | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Backdrop (side sheet) | `--color-bg-backdrop` | stone at 50 % | black at 66 % |
| Title | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Group legend | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Count bubble / digits | `--color-action` / `--color-fg-on-action` | `--palette-stone-950` / `--palette-white` | `--palette-stone-100` / `--palette-stone-950` |
| Current menu item | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Title, choices, links |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Counts, signed-in line |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Group legend |
| `--color-fg-accent` | `--color-bg-surface-raised` | 4.5:1 | Current menu item |
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Count bubble |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring |

The header rule is decorative (the title and Close separate chrome from
content); in dark the raised surface also lifts the side sheet off the canvas.
Forced colours: the side sheet and drawer keep a `CanvasText` 1 px left (or
right) edge so they stay distinct from the page (D-7).

## Responsive behaviour

| Range | Layout |
|---|---|
| XS, SM (below 48rem) | `.sheet` fills the screen; no backdrop visible; header and footer pad by the safe areas so Close clears the notch and the footer clears the home indicator. |
| MD and up (48rem+) | `.sheet` is a 28rem side sheet on the right with `--shadow-4` over the backdrop. |
| Drawers | 28rem at every width, capped at the screen. |

- The filters sheet and the site menu are only opened below 48rem; the page
  never opens them at wider widths, but the side-sheet layout keeps them usable
  if the window is resized while open.
- Long cuisine names ("Dominican (Dominican Republic)") wrap under their
  checkbox; nothing scrolls sideways at 320 px.
- Close and footer buttons are at least 44 × 44 px; footer buttons split the
  width, each a large thumb target, `--space-3` apart.

## Accessibility

### Role and pattern

[APG Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):
`role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the title, page
`inert`. A `nav` body is labelled by the same title, so the menu is also a
navigation landmark. Built on the framework's accessible dialog/overlay
primitive (AGENTS.md).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Through Close, the body and the footer; wraps inside. |
| <kbd>Space</kbd> | Toggles the focused checkbox. |
| <kbd>Enter</kbd> | Follows a menu link, or submits the filters form. |
| <kbd>Esc</kbd> | Emits `dismissed('escape')`; unsubmitted changes are discarded. Works while busy. |

### Focus

- On open: Close, always — the body is long and screen-reader users hear the
  title first (D-2).
- While open: trapped in the panel.
- On close: back to `returnFocus` or the trigger ("Filters", "Menu"). After
  applying filters, the page moves focus to its result count instead and sets
  `returnFocus` accordingly.

### Labelling

- Name: the title, including the count's hidden words ("Filters, 2 active").
  No `aria-label` on the bubble span (D-3).
- Close names the sheet: "Close filters", "Close menu".

### Announcements

None from the sheet. The listing announces the new result count in its own
`aria-live="polite"` region (L2-067.5).

### Motion

Slide-up and slide-in use `--duration-slow`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms; the panel simply appears.

## Content and internationalisation

- Titles are one word: "Filters", "Menu". The count goes in the bubble.
- The filter primary states the outcome with the live number: "Show 60
  caterers", "Show 2 caterers", "Show 1 caterer"; the secondary is "Clear",
  which empties every choice and does not close the sheet (D-4).
- The menu says who is signed in with role where it matters: "Signed in as
  Leah Mohammed, Admin", "Signed in as Kendra Baptiste, Pelau House".
- Numbers are formatted by the consumer; French titles ("Filtres") and
  buttons ("Afficher 2 traiteurs") wrap rather than truncate.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (region class names, the
  count's spoken text, ids) are computed once, not in the template.
- Nothing is rendered while closed.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Sheet.ts`
  opens the Filters sheet with all 18 cuisines and 5 regions, Jamaican and
  Scarborough chosen (count 2, "Show 2 caterers"), and toggles `busy`;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CaterersListing`, `SiteHeader`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: fixed overlay; page scroll locked while open with
  `scrollbar-gutter: stable`, as in [dialog](dialog.md).
- Weight: the framework's overlay primitive only.

## Acceptance criteria

### Rendering

- **AC-1** Given the caterer listing at 360 px, when Marcia activates "Filters", then a `div.sheet[role="dialog"][aria-modal="true"]` named "Filters" fills the viewport, with a `.sheet__body` form of id "filters-form" and a footer holding "Clear" and "Show 60 caterers". (L2-009)
- **AC-2** Given Jamaican and Scarborough are on, when the sheet renders with `count` 2 and `countLabel` "active", then the title shows an ink bubble "2" and the dialog's accessible name is "Filters, 2 active", with no `aria-label` on the bubble. (L2-068)
- **AC-3** Given the filters sheet, when Close renders, then it is an `.icon-btn` named "Close filters" at least 44 × 44 CSS px; given the site menu, it is named "Close menu". (L2-068)
- **AC-4** Given the site menu for Leah Mohammed, when it renders with `bodyAs="nav"`, then the body is a `nav` labelled by the "Menu" title, "Review queue" carries `aria-current="page"`, there is no `.sheet__footer`, and axe-core reports 0 violations. (L2-066)
- **AC-5** Given the open filters sheet in each theme, when axe-core runs with WCAG 2.1 A and AA rules at 360 px, then it reports 0 violations. (L2-066)

### States

- **AC-6** Given Marcia ticks Guyanese and the count is reloading, when `busy` becomes true, then the sheet has `aria-busy="true"`, Close remains enabled, and pressing Close emits `dismissed('close')`. (L2-009)
- **AC-7** Given the filters sheet with "Show 2 caterers" in the footer at 360 px, when it renders, then "Clear" and "Show 2 caterers" share the footer width equally and each is at least 44 CSS px high. (L2-065)

### Keyboard and focus

- **AC-8** Given "Filters" on the listing, when Marcia opens the sheet with Enter, then focus moves to "Close filters". (L2-067)
- **AC-9** Given focus on "Show 2 caterers", the last control, when Tab is pressed, then focus wraps to "Close filters", and nothing on the listing behind is reachable. (L2-067)
- **AC-10** Given the sheet opened from "Filters", when Marcia presses Escape, then `dismissed('escape')` is emitted and, once closed, focus is back on "Filters". (L2-067)
- **AC-11** Given the menu sheet opened from the header's "Menu" button, when "Close menu" is activated, then focus returns to "Menu". (L2-067)
- **AC-12** Given a control in the sheet in each theme, when it receives keyboard focus, then the focus ring has at least 3:1 contrast against `--color-bg-surface-raised`. (L2-067)

### Theming

- **AC-13** Given the dark theme, when the filters sheet renders, then the panel resolves to `--palette-stone-850`, the title and choices meet 4.5:1 against it, and the count bubble's digits meet 4.5:1 against `--color-action`. (L2-069)
- **AC-14** Given the site menu in each theme, when "Caterers" is current, then it is drawn in `--color-fg-accent` with at least 4.5:1 against the panel. (L2-069)

### Responsive

- **AC-15** Given a 320 px viewport, when the filters sheet shows "Dominican (Dominican Republic) 0 caterers", then the name wraps under its checkbox and nothing scrolls horizontally. (L2-064)
- **AC-16** Given a 768 px window, when the sheet is open, then it is 28rem wide on the right, has `--shadow-4`, and the backdrop dims the listing to its left. (L2-064)
- **AC-17** Given a device with a notch and a home indicator, when the sheet renders full screen, then the header padding includes `env(safe-area-inset-top)` and the footer padding includes `env(safe-area-inset-bottom)`, so Close and "Show 2 caterers" are fully tappable. (L2-065)
- **AC-18** Given a 1280 px window at 200 % zoom with the side sheet open, when the body is longer than the viewport, then the body scrolls, header and footer stay visible, and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-19** Given `prefers-reduced-motion: reduce`, when the sheet opens, then it appears in place without sliding. (L2-069)

### Performance

- **AC-20** Given the `Sheet` perf-test scenario, when "Filters" is activated, then the sheet is painted within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/sheet/`; `sheet.component.*`,
  selector `sh-sheet`, class `SheetComponent`.
- Builds on the same accessible overlay primitive as [dialog](dialog.md) and
  shares its focus-trap, `inert` and scroll-lock helper.
- Composes [icon button](icon-button.md) (Close). Hosts [filter
  list](filter-list.md), [checkbox](checkbox.md), [chip](chip.md),
  [button](button.md) and [badge](badge.md) in its slots.
- Styles: the Sheet and drawer section of `components.css` with `slide-up`,
  `slide-in-right`, `slide-in-left`.
- Design-system catch-up: replace the mocks' `aria-label` on the count span
  with visually hidden text (D-3); make "Clear" a `<button type="reset">`
  instead of `<a class="btn">` (D-4); add
  `@media (forced-colors: active) { .sheet, .drawer { border-left: 1px solid CanvasText; } .drawer--left { border-left: 0; border-right: 1px solid CanvasText; } }` (D-7).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Where does focus start?* On Close in both sheets. Only the site-menu mocks set `autofocus` on it; the filters mock's note says the same and the design system fixed the drift.
- **D-3** *How is the title's count spoken?* As visually hidden text inside the heading ("Filters, 2 active"). Every mock put `aria-label` on a plain span, which most screen readers ignore.
- **D-4** *What does the footer say, given L2-009.1 names "Apply" and "Clear"?* "Show 2 caterers" and "Clear", as every mock and the design system do, per the user's decision of 10 Oct 2026, because the primary then states the outcome before the person commits. The behaviour (a full-height panel with an apply action and a clear action) is the one L2-009.1 describes; its "Apply" wording will be amended through engineering-requirements. AC-1 tests the structure and the mocks' copy.
- **D-5** *Does a backdrop click close the side sheet?* No, as for [dialog](dialog.md): a stray tap must not discard ticked choices. Escape and Close close it.
- **D-6** *Does the filters form work without script?* Yes. The body form has `action="/caterers"` and named checkboxes, so submitting produces the same URL the listing uses (L2-003); with script the consumer handles `submitted` in place.
- **D-7** *How does the side sheet stay distinct in forced colours, where shadow and backdrop vanish?* A 1 px `CanvasText` edge on the inner side. The design system has no forced-colours rule for sheets.
- **D-8** *One component for sheet and drawer?* Yes, `variant` switches the root and region classes. They share role, focus, layering and motion; no mock uses a drawer yet, and a single API avoids a second overlay component later.
