# Popover

| Field | Value |
|---|---|
| Selector | `sh-popover` (the anchored non-modal panel: `.popover` or `.filter-dropdown`) |
| Library path | `frontend/projects/components/src/lib/popover/` |
| Status | planned |
| Traces to | L2-008, L2-009, L2-011, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`popover.html`](../../design-system/components/popover.html) |
| Source mocks | [`dialogs/filter-menu/default`](../../mocks/dialogs/filter-menu/default.html), [`dialogs/filter-menu/area`](../../mocks/dialogs/filter-menu/area.html), [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html) |
| Rendering | [`popover.html`](popover.html) |

## Purpose and scope

A popover is a small raised panel anchored to the control that opened it. It
does not block the page: ticking "Jamaican" in the tablet listing's Cuisine
dropdown updates the results behind it within a second. `sh-popover` owns the
shared surface and behaviour — anchoring, the non-modal `role="dialog"`,
opening and closing, focus in and out — in two shapes: the generic
**`.popover`** (up to 20rem, sized to its content, an optional title and
actions; for short help next to a control, such as "How this is counted" on
the operator metrics) and the **filter dropdown** (`.filter-dropdown`, a fixed
20rem panel holding one filter group, Clear and the live count, opened by a
[filter trigger](filter-trigger.md) at MD).

The design system also lists the account menu as a popover; it is built by
`sh-account-menu` in [menu](menu.md) (D-2). Use something else when the
person must decide before carrying on or the content is a form
([dialog](dialog.md)), on a phone or for a long list ([sheet](sheet.md)), for
a list of actions ([menu](menu.md)), or for a one-line name of an icon
([tooltip](tooltip.md), or better a visible label).

Out of scope:

- The filter group inside the dropdown (checkboxes with counts, the area
  search field and its suggestions, Clear, the live result count): the
  [filter trigger](filter-trigger.md), [filter list](filter-list.md),
  [checkbox](checkbox.md) and the listing page own them.
- The trigger's look and its count bubble ("1 selected"):
  [filter trigger](filter-trigger.md) or [button](button.md); the popover sets
  only `aria-expanded` and `aria-controls` on it.
- Applying filters and updating the URL (L2-003, L2-008.6).

## Usage

Inventory from `usage_inventory.py docs/mocks filter-dropdown "div"`,
`… popover "div"` (no mock: the generic popover is the approved shape) and
`… menu-anchor "div"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/filter-menu/default` (listing at MD, 48–62rem) | `variant="filter"`, trigger `.filter-trigger` "Cuisine", title "Cuisine" | fieldset of 18 cuisine checkboxes with "14 caterers" counts (0-count disabled), Clear, live count "14 caterers" | open with selection, focus on first checkbox | raised panel over the listing |
| `dialogs/filter-menu/area` | `variant="filter"`, trigger "Area", title "Area" | "Area or postal code" search field, 5 region checkboxes, Clear, "60 caterers" | open, focus on the search field | raised panel |
| `pages/caterers/default` at MD | the same two triggers, closed | — | closed, trigger hover, focus | filter bar |
| `pages/admin-metrics/default` (design-system examples) | `variant="default"`, small button trigger | "How this is counted" / "Enquiries a caterer answered within 48 hours…"; "Figures lag by up to 60 minutes" with Dismiss and Refresh | open, text-only | raised panel |
| `dialogs/account-menu/*` | built by [menu](menu.md) `sh-account-menu` (D-2) | — | — | — |

## Anatomy

1. **Anchor** — `.menu-anchor` (`position: relative; display: inline-block`)
   wraps the trigger and the panel.
2. **Trigger** — the projected `<button>`; the popover sets `aria-expanded`,
   `aria-controls` and `aria-haspopup="dialog"` on it.
3. **Panel** — `div.popover` or `div.filter-dropdown` with `role="dialog"`
   (never `aria-modal`), labelled by its title or `ariaLabel`:
   `--color-bg-surface-raised`, `--border-width-hairline`
   `--color-border-default`, `--shadow-3`. Generic: `--radius-md`,
   `--space-4` padding, `width: max-content`, `max-width: min(20rem, 90vw)`,
   `--z-popover`. Filter: `--radius-lg`, `--space-4 --space-5` padding,
   `width: min(20rem, 100vw − 2 × --layout-margin)`, `--space-2` below the
   trigger, `--z-dropdown`.
4. **Title (optional)** — generic `p.popover__title` (`--text-label` at
   `--font-size-md`); filter `h2.filter-group__title`. Carries the id the panel
   is labelled by.
5. **Content** — one or two sentences of `--color-fg-muted` body text, or one
   filter group (whose fieldset scrolls within `min(50dvh, 20rem)`).
6. **Actions (optional)** — `div.popover__actions`: small buttons,
   right-aligned, `--space-2` apart, `--space-3` above.

Host: `sh-popover` is `display: inline-block` and renders the `.menu-anchor`.
Inside a `.filter-bar` below 48rem the bar is the positioning parent, so the
panel starts at the bar's left edge.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'default' \| 'filter'` | `'default'` | no | Renders `div.popover` or `div.filter-dropdown`. |
| `open` | `boolean` | `false` | no | Controlled open state. The panel is in the DOM only while open. |
| `heading` | `string \| null` | `null` | no | Renders the title (`p.popover__title`, or `h2.filter-group__title` for `filter`) and labels the panel with `aria-labelledby`. |
| `headingLevel` | `2 \| 3` | `2` | no | `filter` only: the heading level that fits the page outline. |
| `ariaLabel` | `string \| null` | `null` | yes when `heading` is null | Rendered as `aria-label` on the panel ("About these figures"). |
| `align` | `'start' \| 'end'` | `'start'` | no | Aligns the panel to the trigger's start or end edge; flips when it would overflow. |
| `initialFocus` | `'auto' \| 'none'` | `'auto'` | no | `auto` moves focus to the first focusable control in the panel on open (the Area search field, the first cuisine checkbox) and leaves it on the trigger when the panel has none. `none` always leaves it on the trigger. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `openChange` | `boolean` | The trigger is activated (toggles), or the panel closes by Esc, an outside click, or focus leaving both the trigger and the panel. |

### Methods

| Method | Rule |
|---|---|
| `close(returnFocus = true)` | Closes; returns focus to the trigger unless told not to (an action that moves focus elsewhere). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=trigger]` | One button (`.filter-trigger`, `sh-button`) | The popover wires `aria-expanded`, `aria-controls` and `aria-haspopup="dialog"` on its native `<button>`. |
| default | Text paragraphs or one filter group | No headings beyond `heading`, no form submit. |
| `[slot=actions]` | One or two small `sh-button`s | Rendered in `.popover__actions`; never a primary button (design system, Do and don't). |

- Translation: `heading`, `ariaLabel` and slot copy come from the resource
  files (L2-064.4); the component holds no words.

## Variants and sizes

| Variant | Class | Width | Padding | Radius | Layer |
|---|---|---|---|---|---|
| Generic | `.popover` | content, at most `min(20rem, 90vw)` | `--space-4` | `--radius-md` | `--z-popover` |
| Filter dropdown | `.filter-dropdown` | `min(20rem, 100vw − 2 × --layout-margin)` | `--space-4` `--space-5` | `--radius-lg` | `--z-dropdown` |

One size per variant. `.popover--static` exists only for documentation.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | `open` false | No panel; trigger `aria-expanded="false"` | "Collapsed", "dialog" popup |
| Trigger hover / focus | on the trigger | The trigger's own states | — |
| Open | `open` true | Panel scales in from 96 % with a fade over `--duration-fast` (`--ease-enter`) from the corner nearest the trigger (D-5); the filter trigger shows its 2 px ink outline through `aria-expanded="true"` | "Expanded"; panel announced as a dialog with its title when focus moves in |
| Open, with selection | checkboxes checked | Ticked boxes pepper; the trigger keeps its count bubble after closing | — |
| Updating | consumer's live count changes | No overlay: the panel never blocks; the `role="status"` count inside updates | Count announced politely |
| Text-only open | no focusable content | Focus stays on the trigger | Panel read when the trigger's `aria-controls` target is reached |

There is no busy, disabled or error state of the panel itself.

## Markup

```html
<!-- rendered: filter dropdown, open (Cuisine, tablet listing) -->
<div class="menu-anchor">
  <button class="filter-trigger" type="button" aria-haspopup="dialog" aria-expanded="true" aria-controls="menu-cuisine">Cuisine <span class="filter-trigger__count" aria-label="1 selected">1</span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  <div class="filter-dropdown" id="menu-cuisine" role="dialog" aria-labelledby="menu-cuisine-title">
    <h2 class="filter-group__title" id="menu-cuisine-title">Cuisine</h2>
    <fieldset><legend class="visually-hidden">Cuisines</legend>…</fieldset>
    <div class="cluster cluster--between"><button class="btn btn--link btn--sm" type="button">Clear</button><span class="result-count" role="status">14 caterers</span></div>
  </div>
</div>
```

```html
<!-- rendered: generic popover with title and actions -->
<div class="menu-anchor">
  <button class="btn btn--sm" type="button" aria-haspopup="dialog" aria-expanded="true" aria-controls="lag-note">About these figures</button>
  <div class="popover" id="lag-note" role="dialog" aria-labelledby="lag-note-title">
    <p class="popover__title" id="lag-note-title">Figures lag by up to 60 minutes</p>
    <p class="text-muted">Refresh later to see this morning's visits.</p>
    <div class="popover__actions"><button class="btn btn--sm btn--ghost" type="button">Dismiss</button><button class="btn btn--sm" type="button">Refresh</button></div>
  </div>
</div>
```

```html
<!-- rendered: generic popover, text only, labelled by aria-label -->
<div class="popover" id="visits-note" role="dialog" aria-label="About visits"><p class="text-muted">Visits are counted on our own servers, with no third-party analytics.</p></div>
```

```html
<!-- consumer -->
<sh-popover variant="filter" [heading]="t('filters.cuisine')" [(open)]="cuisineOpen">
  <button slot="trigger" class="filter-trigger" type="button">…</button>
  <sh-filter-group …></sh-filter-group>
</sh-popover>
```

The panel may additionally use the native `popover="manual"` attribute for
top-layer rendering (D-4); ids are generated per instance.

## Design

- Surface `--color-bg-surface-raised`, border `--border-width-hairline`
  `--color-border-default`, shadow `--shadow-3`; radius `--radius-md`
  (generic) or `--radius-lg` (filter).
- Generic: padding `--space-4`; title `--text-label` at `--font-size-md` with
  `--space-1` below; actions gap `--space-2`, `--space-3` above.
- Filter: padding `--space-4` `--space-5`; `--space-2` below the trigger;
  fieldset scrolls inside `min(50dvh, 20rem)`; footer cluster `--space-4` above.
- Layers: `--z-popover` (generic), `--z-dropdown` (filter); both below
  dialogs, toasts and tooltips.
- Motion: `scale-in` over `--duration-fast` with `--ease-enter`; closing is
  instant.
- No component tokens; never tint a popover.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel | `--color-bg-surface-raised` | `--palette-white` | `--palette-stone-850` |
| Border | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Title and text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Body, counts and help | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Group title | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Ticked box | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Title and text |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Body, counts and help |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Group title |
| `--color-accent` | `--color-bg-surface-raised` | 3:1 | Ticked box edge |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring in the panel |

In dark the raised surface steps up to stone-850 against the stone-950 page
and the shadow deepens; the border separates the panel when forced colours
remove the shadow (`CanvasText`).

## Responsive behaviour

- XS and SM (below 48rem): the listing has no filter dropdowns; the "Filters"
  button opens the [sheet](sheet.md) (L2-009.1). If a popover is used this
  narrow, inside a `.filter-bar` the bar is the positioning parent so the
  panel starts at the bar's left edge; widths never exceed the screen less
  both margins.
- MD (48–62rem): filter dropdowns open under their trigger in the filter bar
  (L2-009.2).
- LG and up: filters are a [filter list](filter-list.md) in the left column;
  no dropdowns.
- The generic popover opens below its trigger, aligned to `align`, and flips
  up or to the other edge when it would overflow.
- At 200 % zoom on a 1280 px window the open panel stays fully reachable; its
  fieldset scrolls rather than running past the fold.

## Accessibility

### Role and pattern

A non-modal dialog: `role="dialog"` without `aria-modal`, labelled by its
title, opened by a button that follows
[APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)
(`aria-expanded`, `aria-controls`) and says `aria-haspopup="dialog"`. The rest
of the page stays operable and is not made inert.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Enter</kbd>, <kbd>Space</kbd> on the trigger | Opens or closes the panel. |
| <kbd>Tab</kbd> | Moves through the panel's controls, then on to the next control on the page, which closes the panel. Focus is never trapped. |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> from the first control | Returns to the trigger; the panel stays open. |
| <kbd>Esc</kbd> | Closes and returns focus to the trigger. |

### Focus

- With `initialFocus="auto"`, focus moves in only when the panel has
  controls: the Area dropdown focuses its search field, the Cuisine dropdown
  its first checkbox; a text-only popover leaves focus on the trigger.
- Esc returns focus to the trigger; an outside click closes without moving
  focus; Tab past the last control closes and lets focus continue.
- The panel itself is not focusable and has no focus ring.

### Labelling

- The trigger names the panel ("Cuisine", "About these figures"); its count
  bubble says "1 selected" ([filter trigger](filter-trigger.md)).
- The panel is labelled by its title, or by `ariaLabel` when it has none.

### Announcements

The popover announces nothing itself. The filter's result count inside it is a
`role="status"` region owned by the listing (L2-067.5).

### Motion

The scale-in uses `--duration-fast`, zeroed by `prefers-reduced-motion:
reduce`; closing is instant.

## Content and internationalisation

- Titles are short statements, not questions: "How this is counted",
  "Figures lag by up to 60 minutes".
- Two sentences at most; a list or a link to more belongs on a page.
- Filter dropdowns reuse the filter vocabulary exactly: full cuisine names
  ("Trinidadian & Tobagonian"), counts as "14 caterers", Clear, and the live
  result count instead of an Apply button.
- Translatable: `heading`, `ariaLabel`, slot text. French runs about 30 %
  longer; the generic panel grows to 20rem and then wraps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); position and labelling ids are computed once
  per open, not in the template.
- Document listeners (outside click, Esc, focus-out) exist only while open;
  repositioning on scroll and resize is throttled to one per frame.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Popover.ts`
  opens the Cuisine dropdown at 768 px with 18 cuisines ("Jamaican 14
  caterers" checked) and ticks "Haitian"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `ListingTablet`, `OperatorMetrics`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the panel is positioned out of flow; opening it never
  moves the filter bar or the grid.
- Weight: the framework's overlay/positioning primitive only.

## Acceptance criteria

### Rendering

- **AC-1** Given the listing at 768 px, when the visitor activates the "Cuisine" filter trigger, then a `div.filter-dropdown[role="dialog"]` labelled "Cuisine" opens under the trigger, without `aria-modal`, and the trigger reads `aria-expanded="true"` with `aria-controls` naming the panel. (L2-009)
- **AC-2** Given the open Cuisine dropdown, when the visitor ticks "Jamaican", then the panel stays open, the listing behind it updates to 14 caterers and the panel's count reads "14 caterers" with no Apply button. (L2-008)
- **AC-3** Given the Cuisine dropdown with 18 cuisines in a 600 px tall window, when it opens, then its fieldset scrolls inside a height of at most `min(50dvh, 20rem)` and the panel's foot (Clear and the count) stays visible. (L2-008)
- **AC-4** Given the Area dropdown, when it opens, then focus is in the "Area or postal code" field, and typing "scar" shows "Scarborough" inside the panel. (L2-011)
- **AC-5** Given a generic popover with `heading` "Figures lag by up to 60 minutes" on the operator metrics, when it opens, then it is `div.popover[role="dialog"]` labelled by its `p.popover__title`, at most 20rem wide, and focus moves to its first action. (L2-061)
- **AC-6** Given a text-only popover labelled "About visits", when it opens, then focus stays on its trigger and the panel has `aria-label="About visits"`. (L2-068)

### Keyboard and focus

- **AC-7** Given the open Cuisine dropdown with focus on a checkbox, when the visitor presses Esc, then the panel closes, `openChange` emits false, and focus returns to the "Cuisine" trigger. (L2-067)
- **AC-8** Given focus on the last control in the open Area dropdown, when the visitor presses Tab, then focus moves to the next control on the page after the trigger and the panel closes; focus is never trapped. (L2-067)
- **AC-9** Given the open Cuisine dropdown, when the visitor clicks a caterer card behind it, then the panel closes and the card's link is followed, because the page is not inert. (L2-067)
- **AC-10** Given the listing at 768 px in each state (closed, Cuisine open, Area open), when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-11** Given the dark theme, when the Area dropdown opens, then the panel resolves to `--palette-stone-850`, its text and counts have at least 4.5:1 contrast on it, and the focus ring at least 3:1. (L2-069)

### Responsive

- **AC-12** Given a 360 px viewport and a popover inside a `.filter-bar`, when it opens, then the panel starts at the bar's left edge, is no wider than 328 CSS px, and the page does not scroll horizontally. (L2-064)
- **AC-13** Given the listing at 360 px, when it renders, then no filter dropdown exists and the "Filters" button opens the sheet instead. (L2-009)
- **AC-14** Given a 360 px viewport, when the generic popover "Figures lag by up to 60 minutes" is open, then its small "Dismiss" and "Refresh" buttons are each at least 44 CSS px tall with at least 8 px between them. (L2-065)
- **AC-15** Given a 1280 px window at 200 % zoom, when a generic popover opens, then its whole text and actions are visible and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-16** Given `prefers-reduced-motion: reduce`, when a popover opens, then it appears without a visible scale or fade, and it always closes instantly. (L2-069)

### Performance

- **AC-17** Given the `Popover` perf-test scenario, when the visitor activates "Cuisine", then the open panel is painted within 200 ms (Interaction to Next Paint) and opening it shifts no layout (CLS contribution 0), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/popover/`; file
  `popover.component.*` (selector `sh-popover`, `PopoverComponent`).
- Build on the framework's accessible overlay primitive (CDK Overlay with
  `ConnectedPosition` start/end and flip, or the equivalent), per AGENTS.md;
  the native `popover="manual"` attribute may supply top-layer rendering,
  with the component keeping control of light dismiss so Tab-out and
  focus-return follow this CRD (D-4).
- Styles: `.menu-anchor`, `.popover*` and `.filter-dropdown*` from
  `components.css`, plus the `.filter-bar` phone rule.
- Design-system catch-up for D-5: give `.filter-dropdown` the same
  `animation: scale-in var(--duration-fast) var(--ease-enter); transform-origin: top left;`
  as `.popover`; and move the mock's inline cuisine-list height into
  `.filter-dropdown fieldset` (already in `components.css`).
- Design-system catch-up for D-8: extend the phone rule to
  `.filter-bar .popover { left: 0; }`.
- Composed by [filter trigger](filter-trigger.md) (the dropdowns) and the
  operator metrics page. Composes nothing.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Does `sh-popover` build the account menu?* No. The popover page calls it a non-modal dialog with `aria-haspopup="dialog"`; the menu page calls it a plain container around a labelled `role="menu"` with `aria-haspopup="menu"`. The two design-system pages conflict; this CRD and [menu](menu.md) D-2 follow the menu page (the component that owns it, and what 290 mock triggers already say). Raised with the user.
- **D-3** *Does Tab out of the panel close it?* Yes, as the design system's keyboard table says; Shift+Tab back to the trigger keeps it open, so the trigger and panel act as one unit.
- **D-4** *Native `popover` attribute or a framework overlay?* Either, behind this API. The design system prefers the native attribute for top-layer rendering; its built-in light dismiss does not close on Tab-out, so the component handles dismissal itself (`popover="manual"`).
- **D-5** *Does the filter dropdown animate?* Yes, like every popover (design system, States: "scales in from its anchor corner"); today's `.filter-dropdown` rule lacks the animation and catches up.
- **D-6** *Does the trigger say `aria-haspopup="dialog"`?* Yes, matching what opens (design system, Labelling). The filter mocks omit it; the component adds it.
- **D-7** *Who owns the 44 px rule inside the dropdown?* The rows inside belong to the filter group; dropdowns exist only from 48rem, where compact rows of at least 24 px meet WCAG 2.5.8, and below 48rem the sheet's 44 px rows take over (design system, Touch).
- **D-8** *Where does a generic popover sit inside a `.filter-bar` below 48rem?* At the bar's left edge, like the filter dropdown. The design system says "the panel starts at the bar's left edge instead of under a trigger near the right that would push it off screen", but today's phone rule applies `left: 0` to `.filter-dropdown` only, and the rendering shows a generic popover running off a 320 px screen. `components.css` extends the rule to `.filter-bar .popover`.
