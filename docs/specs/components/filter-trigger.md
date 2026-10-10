# Filter trigger

| Field | Value |
|---|---|
| Selector | `sh-filter-trigger` (the outlined pill button that opens filter choices), `sh-filter-dropdown` (the non-modal panel a tablet trigger opens) |
| Library path | `frontend/projects/components/src/lib/filter-trigger/` |
| Status | planned |
| Traces to | L2-008, L2-009, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 |
| Design system | [`filter-trigger.html`](../../design-system/components/filter-trigger.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterers/filtered`](../../mocks/pages/caterers/filtered.html), [`pages/caterers/occasion`](../../mocks/pages/caterers/occasion.html), [`pages/caterers/offline`](../../mocks/pages/caterers/offline.html), [`pages/caterers/no-results`](../../mocks/pages/caterers/no-results.html), [`dialogs/filter-menu/default`](../../mocks/dialogs/filter-menu/default.html), [`dialogs/filter-menu/area`](../../mocks/dialogs/filter-menu/area.html), [`dialogs/filters/selected`](../../mocks/dialogs/filters/selected.html) |
| Rendering | [`filter-trigger.html`](filter-trigger.html) |

## Purpose and scope

Below 62rem the cuisine and area column has no room, so the listing's filters
fold into buttons. On tablets (48–62rem) a bar of "Cuisine" and "Area" triggers
sits above the grid; each opens a dropdown under it with a short checkbox list,
"Clear" and the live total ("2 caterers"), and each tick applies at once. On
phones one "Filters" trigger opens the full-height Filters
[sheet](sheet.md). When filters are on, the trigger carries an ink count bubble
spoken as part of its name: "Filters, 2 active", "Cuisine, 1 selected".

Use a [button](button.md) for actions, a [menu](menu.md) for a list of
commands and a [select](select.md) for one choice inside a form. The column
itself (62rem and wider) is the [filter list](filter-list.md).

Out of scope:

- The checkboxes inside the dropdown ([checkbox](checkbox.md), `.choice`), the
  area search field ([combobox](combobox.md) / `.search-field`) and the result
  count's wording: the listing page.
- The Filters sheet: [sheet](sheet.md). The trigger only opens it.
- Applying filters, the URL and the results update (L2-003, L2-008): the
  listing page.
- The ghost "Area or postal code" button beside "Filters" on phones:
  [button](button.md).

## Usage

Inventory from `usage_inventory.py docs/mocks filter-trigger "button"` (40 uses
on 16 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/*` phone bar (`.mobile-browse-bar.only-xs-sm`, 12 screens) | `mode="dialog"`, filters icon | "Filters"; with Jamaican and Scarborough on, count 2 "active" | default, with count, disabled (offline) | canvas, beside the ghost "Area or postal code" |
| `pages/caterers/*` tablet bar (`.filter-bar.only-md`, 11 screens) | `mode="dropdown"`, chevron | "Cuisine", "Area"; count 1 "selected" each when filtered | default, with count, disabled (offline) | canvas |
| `dialogs/filter-menu/default` | Cuisine trigger open + `sh-filter-dropdown` | title "Cuisine", 18 cuisine checkboxes with "14 caterers", zero counts disabled; "Clear" + "60 caterers" | open | dropdown over the grid |
| `dialogs/filter-menu/area` | Area trigger open + dropdown | title "Area", search "Area or postal code" (autofocus), 5 region checkboxes; "Clear" + "60 caterers" | open | dropdown |
| `dialogs/filters/selected`, `busy` | count bubble reused in the sheet title | "Filters 2" | — | [sheet](sheet.md) header |

## Anatomy

`sh-filter-trigger`:

1. **Container** — `button.filter-trigger`: pill, hairline `--color-border-strong`
   edge on `--color-bg-surface`, `--control-height-md` (44 px) tall,
   `--space-4` side padding.
2. **Filters icon (phone only)** — `svg.icon` from the `icon` slot,
   `aria-hidden="true"`, before the label.
3. **Label** — "Filters", "Cuisine", "Area" in `--text-label` at
   `--font-size-md`.
4. **Count bubble** — `span.filter-trigger__count`: ink, 1.375rem round,
   caption semibold digits, with visually hidden ", " before and " active" /
   " selected" after. Only when the count is above 0.
5. **Chevron (dropdown only)** — `svg.icon`, `aria-hidden`, after the label and
   bubble.

`sh-filter-dropdown`:

1. **Anchor** — `.menu-anchor` wrapping the trigger and the panel (positioned
   against the whole `.filter-bar` below 48rem).
2. **Panel** — `div.filter-dropdown[role="dialog"]` labelled by its title,
   `--color-bg-surface-raised`, hairline `--color-border-default`,
   `--radius-lg`, `--shadow-3`, `min(20rem, 100vw − 2 × --layout-margin)` wide,
   `--z-dropdown`.
3. **Title** — `h2.filter-group__title` ("Cuisine", "Area").
4. **Body** — the default slot: an optional search field and a `fieldset` with a
   visually hidden legend ("Cuisines", "Regions"), scrolling at
   `min(50dvh, 20rem)`.
5. **Footer** — `.cluster.cluster--between`: "Clear" (link-variant small
   [button](button.md)) and the live total `span.result-count[role="status"]`.

Host: `sh-filter-trigger` is `display: contents` (classes on the inner
`<button>`). `sh-filter-dropdown` renders the `.menu-anchor` and projects its
trigger, so the panel is positioned under it.

## API

### `sh-filter-trigger` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | "Filters", "Cuisine", "Area". |
| `mode` | `'dialog' \| 'dropdown'` | `'dropdown'` | no | `dialog` renders `aria-haspopup="dialog"` and no chevron; `dropdown` renders `aria-expanded` and `aria-controls` and the chevron. |
| `expanded` | `boolean` | `false` | no | Dropdown only: `aria-expanded`. Controlled by the consumer or the enclosing `sh-filter-dropdown`. |
| `controls` | `string \| null` | `null` | yes in dropdown | `aria-controls`: the dropdown's id. |
| `count` | `number` | `0` | no | Bubble shown when greater than 0. |
| `countLabel` | `string \| null` | `null` | yes when `count` > 0 | Hidden word after the number: "active" (Filters) or "selected" (a group). |
| `disabled` | `boolean` | `false` | no | Native `disabled` (offline), 50 % opacity. |

### `sh-filter-trigger` outputs and slots

| Output | Payload | Emitted when |
|---|---|---|
| `activated` | `MouseEvent` | Click, tap, Enter or Space, when not disabled. |

| Slot | Accepts | Rule |
|---|---|---|
| `icon` | One `svg.icon` | Phone "Filters" only; placed before the label, made `aria-hidden`. |

Methods: `focus()` focuses the button (the sheet and dropdown return focus with
it).

### `sh-filter-dropdown` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `open` | `boolean` | `false` | no | Controlled; sets the trigger's `expanded`. |
| `panelId` | `string` | — | yes | The panel's `id`, given to the trigger's `controls`. |
| `title` | `string` | — | yes | `h2.filter-group__title`; the panel's name. |
| `resultCount` | `string` | — | yes | Live total, already formatted: "2 caterers", "1 caterer". |
| `clearLabel` | `string` | — | yes | "Clear". |
| `clearDisabled` | `boolean` | `false` | no | Disables Clear when nothing in the group is chosen. |

### `sh-filter-dropdown` outputs and slots

| Output | Payload | Emitted when |
|---|---|---|
| `cleared` | `void` | Clear activated. |
| `closed` | `'escape' \| 'outside' \| 'focusout' \| 'trigger'` | Escape, a pointer down outside, Tab out of the panel, or the trigger pressed again. The consumer sets `open` to false. |

| Slot | Accepts | Rule |
|---|---|---|
| `trigger` | One `sh-filter-trigger` in dropdown mode | Rendered first in the anchor. |
| default | An optional search field, then a `fieldset` of `.choice` checkboxes with a visually hidden legend | Body. The first enabled checkbox (or an `autofocus` search field) receives focus on open. |

- Translation: `label`, `countLabel`, `title`, `resultCount`, `clearLabel` and
  slot text come from the resource files (L2-064); cuisine and region names are
  data and use the L2-007 / L2-010 spellings.

## Variants and sizes

| Variant | Mode | Shown | Opens |
|---|---|---|---|
| Filters (phone) | `dialog`, filters icon, no chevron | XS, SM (below 48rem) in `.mobile-browse-bar.only-xs-sm` | The Filters [sheet](sheet.md) with both groups |
| Group dropdown (tablet) | `dropdown`, chevron | MD (48–62rem) in `.filter-bar.only-md` | `sh-filter-dropdown` under it |
| None | — | LG and up | The [filter list](filter-list.md) column is always visible |

One size: `--control-height-md` (44 px) at every width; there is no small or
large trigger.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Outlined pill on `--color-bg-surface` | Button, name "Cuisine" |
| Hover | `:hover` | Fill `--color-bg-subtle` | — |
| Active | `:active` | Fill `--color-bg-subtle-hover` | — |
| Focus | `:focus-visible` | Shared `--color-focus-ring` ring outside the pill | — |
| With count | `count` > 0 | Ink bubble with the number | Name "Cuisine, 1 selected" |
| Open (dropdown) | `aria-expanded="true"` | `--color-fg-default` 1 px border plus 1 px inset: a 2 px ink edge (never pepper) | "expanded" |
| Disabled | `disabled` (offline) | 50 % opacity, `not-allowed` cursor | Unavailable; the offline banner says why |
| Dropdown open | `open` | Raised panel under the trigger; checkboxes apply as ticked; total updates | Non-modal dialog "Cuisine"; total announced politely |
| Busy | — | Lives in the sheet's primary, not the trigger (D-5) | — |

## Markup

```html
<!-- rendered: phone Filters trigger with a count -->
<div class="mobile-browse-bar only-xs-sm">
  <button class="filter-trigger" type="button" aria-haspopup="dialog">
    <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M4 6h16M7 12h10M10 18h4"/></svg>Filters
    <span class="filter-trigger__count"><span class="visually-hidden">, </span>2<span class="visually-hidden"> active</span></span>
  </button>
  <button class="btn btn--ghost" type="button" aria-haspopup="dialog">…Area or postal code</button>
</div>
```

```html
<!-- rendered: tablet bar, Cuisine open with its dropdown, Area with a count -->
<div class="filter-bar only-md">
  <div class="menu-anchor">
    <button class="filter-trigger" type="button" aria-expanded="true" aria-controls="menu-cuisine">Cuisine
      <span class="filter-trigger__count"><span class="visually-hidden">, </span>1<span class="visually-hidden"> selected</span></span>
      <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m6 9 6 6 6-6"/></svg></button>
    <div class="filter-dropdown" id="menu-cuisine" role="dialog" aria-labelledby="menu-cuisine-title">
      <h2 class="filter-group__title" id="menu-cuisine-title">Cuisine</h2>
      <fieldset class="filter-group"><legend class="visually-hidden">Cuisines</legend>
        <label class="choice"><input type="checkbox" name="cuisine" value="Jamaican" checked><span class="choice__text">Jamaican <small>2 caterers</small></span></label>
        <label class="choice"><input type="checkbox" name="cuisine" value="Haitian" disabled><span class="choice__text">Haitian <small>0 caterers</small></span></label>
      </fieldset>
      <div class="cluster cluster--between"><button class="btn btn--link btn--sm" type="button">Clear</button><span class="result-count" role="status">2 caterers</span></div>
    </div>
  </div>
  <div class="menu-anchor"><button class="filter-trigger" type="button" aria-expanded="false" aria-controls="menu-area">Area …</button></div>
</div>
```

```html
<!-- rendered: offline -->
<button class="filter-trigger" type="button" aria-expanded="false" aria-controls="menu-cuisine" disabled>Cuisine <svg class="icon" aria-hidden="true" …/></button>
```

```html
<!-- consumer -->
<sh-filter-trigger label="{{ t('filters.title') }}" mode="dialog" [count]="active()" [countLabel]="t('filters.active')" (activated)="openSheet()">
  <svg slot="icon" class="icon" …></svg>
</sh-filter-trigger>

<sh-filter-dropdown [open]="cuisineOpen()" panelId="menu-cuisine" [title]="t('filters.cuisine')" [resultCount]="t('listing.count', { n })"
  [clearLabel]="t('filters.clear')" (cleared)="clearCuisine()" (closed)="cuisineOpen.set(false)">
  <sh-filter-trigger slot="trigger" [label]="t('filters.cuisine')" controls="menu-cuisine" [count]="cuisineCount()" [countLabel]="t('filters.selected')" (activated)="toggleCuisine()"></sh-filter-trigger>
  <fieldset class="filter-group">…</fieldset>
</sh-filter-dropdown>
```

The listing's page object finds triggers by role and name ("Filters, 2
active") and the open look by `aria-expanded`. No `aria-label` on the bubble
(D-2).

## Design

- Trigger: `--control-height-md`, `--space-4` side padding, `--space-2` gap,
  `--radius-full`, `--border-width-hairline` in `--color-border-strong`; label
  `--text-label` at `--font-size-md`.
- Bubble: 1.375rem round, `--space-1` side padding, `--text-caption` semibold,
  `--color-action` with `--color-fg-on-action`.
- Bars: `.filter-bar` and `.mobile-browse-bar` gap `--space-2` / `--space-3`,
  wrapping.
- Dropdown: padding `--space-4` `--space-5`, `--radius-lg`, `--shadow-3`,
  `--z-dropdown`, `--space-2` below the trigger; fieldset scrolls at
  `min(50dvh, 20rem)`; footer `--space-4` above.
- Motion: trigger fill transitions over `--duration-fast` with
  `--ease-standard`; the dropdown appears without animation.
- No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Trigger fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Trigger edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Label, open edge | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Hover / pressed fill | `--color-bg-subtle` / `--color-bg-subtle-hover` | `--palette-stone-100` / `--palette-stone-200` | `--palette-stone-800` / `--palette-stone-700` |
| Count bubble / digits | `--color-action` / `--color-fg-on-action` | `--palette-stone-950` / `--palette-white` | `--palette-stone-100` / `--palette-stone-950` |
| Dropdown surface / edge | `--color-bg-surface-raised` / `--color-border-default` | `--palette-white` / `--palette-stone-200` | `--palette-stone-850` / `--palette-stone-750` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Label |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Trigger edge |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Label on hover |
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Count digits |
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Dropdown text |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Dropdown counts |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Open is ink, not pepper: pepper means a chosen value. Forced colours: the pill
keeps a `CanvasText` border (`components.css`), and open adds a 2 px edge in
`CanvasText`.

## Responsive behaviour

| Range | Control | Opens |
|---|---|---|
| XS, SM (below 48rem) | `.mobile-browse-bar.only-xs-sm`: "Filters" + "Area or postal code"; wraps at 320 px so "Area or postal code" drops under "Filters" | Full-height [sheet](sheet.md) |
| MD (48–62rem) | `.filter-bar.only-md`: "Cuisine", "Area" | `.filter-dropdown`, 20rem, under its trigger |
| LG, XL | None (`.browse__head.until-lg` hides unless chips show) | [filter list](filter-list.md) column |

- Below 48rem (if a dropdown is ever shown there, for example when the window
  is resized while open) the panel is positioned against the whole bar, starts
  at the left margin and never runs off screen.
- Triggers are 44 px tall with at least 8 px between them (L2-065.1).

## Accessibility

### Role and pattern

Dropdown triggers are buttons with `aria-expanded` and `aria-controls`; the
panel is a non-modal `role="dialog"` labelled by its title holding a fieldset
of checkboxes ([APG
Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) behaviour
with dialog semantics, because the panel holds form controls). The phone
trigger has `aria-haspopup="dialog"` and opens the modal [sheet](sheet.md).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Dropdown trigger: opens the panel, focus to the first enabled checkbox (or the `autofocus` search field). Filters: opens the sheet. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | In the dropdown: checkboxes, Clear, then out; leaving the panel closes it (`'focusout'`). |
| <kbd>Space</kbd> | Ticks a checkbox; results and the total update. |
| <kbd>Esc</kbd> | Closes the dropdown (`'escape'`) and returns focus to its trigger. |

### Focus

The shared ring sits outside the pill. When a dropdown or the sheet closes,
focus returns to the trigger that opened it, whose bubble now shows the new
count.

### Labelling

The count is spoken through visually hidden text inside the button: "Filters,
2 active", "Cuisine, 1 selected". No `aria-label` on the span. Icons and the
chevron are `aria-hidden`.

### Announcements

The dropdown's total (`span.result-count[role="status"]`) is announced
politely when it changes ("2 caterers", L2-067.5).

### Motion

The trigger's fill change uses `--duration-fast` (zeroed by reduced motion);
the dropdown does not animate.

## Content and internationalisation

- The phone trigger is "Filters"; dropdown triggers are the group names,
  "Cuisine" and "Area" — never "Filter by cuisine".
- The bubble is a bare number: values on in that group, or in total for
  Filters.
- Dropdown footers say "Clear" and the live total "2 caterers", "1 caterer".
- Option names use the L2-007 and L2-010 spellings ("Trinidadian & Tobagonian",
  "Barbadian (Bajan)", "York Region"); counts read "14 caterers", "1 caterer",
  "0 caterers".
- French labels ("Cuisine", "Région", "Filtres") fit; the pill grows, never
  truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the spoken count, ARIA
  attributes by mode) are computed once, not in the template.
- The dropdown listens for outside pointer-downs and focus-out only while open.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FilterTrigger.ts`
  renders the tablet bar with "Cuisine 1" and "Area 1" and opens the Cuisine
  dropdown with all 18 cuisines (Jamaican ticked, "2 caterers"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CaterersListing`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the bubble appears inside the pill without moving the
  other trigger by more than its own width; the dropdown is absolutely
  positioned and shifts nothing.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given the caterer listing at 360 px with no filters, when it renders, then a `button.filter-trigger` with `aria-haspopup="dialog"` named "Filters" sits in `.mobile-browse-bar` with an `aria-hidden` icon and no count bubble. (L2-009)
- **AC-2** Given Jamaican and Scarborough are on at 360 px, when "Filters" renders with `count` 2 and `countLabel` "active", then it shows an ink bubble "2" and its accessible name is "Filters, 2 active", with no `aria-label` on the bubble. (L2-009)
- **AC-3** Given the listing at 800 px, when it renders, then `.filter-bar` shows "Cuisine" and "Area" triggers with `aria-expanded="false"`, `aria-controls` and a chevron, and no "Filters" trigger is visible. (L2-009)
- **AC-4** Given Jamaican is on at 800 px, when "Cuisine" renders with count 1 and `countLabel` "selected", then its accessible name is "Cuisine, 1 selected". (L2-068)
- **AC-5** Given the listing at 1280 px, when it renders, then no filter trigger is visible. (L2-009)

### States

- **AC-6** Given "Cuisine" at 800 px, when Marcia activates it, then `aria-expanded` becomes "true", the trigger shows a 2 px `--color-fg-default` edge, and the `.filter-dropdown[role="dialog"]` named "Cuisine" appears under it with each cuisine and its count ("14 caterers"), zero-count cuisines disabled. (L2-008)
- **AC-7** Given the open Cuisine dropdown, when Marcia ticks Jamaican, then the total reads "14 caterers" in the `role="status"` footer and is announced politely, and the dropdown stays open. (L2-067)
- **AC-8** Given a cached copy of the listing is served while the application servers cannot answer (the offline state), when the triggers render, then each has the native `disabled` attribute and is drawn at 50 % opacity while the cached caterers stay browsable. (L2-091)

### Keyboard and focus

- **AC-9** Given focus on "Cuisine", when Enter is pressed, then the dropdown opens and focus moves to the first enabled checkbox, "Jamaican". (L2-067)
- **AC-10** Given focus in the open Cuisine dropdown, when Escape is pressed, then the dropdown closes with `'escape'`, `aria-expanded` is "false" and focus is back on "Cuisine". (L2-067)
- **AC-11** Given focus on Clear in the open dropdown, when Tab is pressed, then focus leaves the panel and the dropdown closes with `'focusout'`. (L2-067)
- **AC-12** Given the open Area dropdown, when it opens, then focus is in the "Area or postal code" search field. (L2-067)
- **AC-13** Given a trigger in each theme, when it has keyboard focus, then the ring has at least 3:1 contrast against the page. (L2-067)

### Theming

- **AC-14** Given the dark theme, when "Filters, 2 active" renders, then the bubble resolves to `--palette-stone-100` with `--palette-stone-950` digits at 4.5:1 or more, and the trigger's edge meets 3:1 against the canvas. (L2-069)
- **AC-15** Given an open dropdown trigger in either theme, when it renders, then its open edge is `--color-fg-default`, not `--color-accent`. (L2-069)

### Responsive

- **AC-16** Given a 320 px viewport, when the phone bar renders "Filters, 2 active" and "Area or postal code", then the second button wraps under the first, both are 44 CSS px tall, and nothing scrolls horizontally. (L2-064)
- **AC-17** Given the tablet bar at 768 px, when it is measured, then each trigger is 44 CSS px tall with at least 8 px between triggers. (L2-065)
- **AC-18** Given axe-core with WCAG 2.1 A and AA rules, when it runs on the listing at 360 px with the count and at 800 px with the Cuisine dropdown open, then it reports 0 violations. (L2-066)

### Performance

- **AC-19** Given the `FilterTrigger` perf-test scenario, when "Cuisine" is activated, then the dropdown is painted within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/filter-trigger/`; files
  `filter-trigger.component.*` (`sh-filter-trigger`, `FilterTriggerComponent`)
  and `filter-dropdown.component.*` (`sh-filter-dropdown`,
  `FilterDropdownComponent`).
- The dropdown uses the framework's non-modal overlay/positioning primitive
  only for outside-click and focus-out detection; positioning stays CSS
  (`.menu-anchor`, `.filter-bar` below 48rem).
- Composes [button](button.md) (Clear). Hosts [checkbox](checkbox.md)
  `.choice` rows and the area search. The Filters [sheet](sheet.md) reuses
  `.filter-trigger__count` in its title.
- The bars (`.filter-bar`, `.mobile-browse-bar`, `.only-xs-sm`, `.only-md`,
  `.until-lg`) are layout classes the listing page renders around the triggers.
- Design-system catch-up: replace `aria-label` on the bubble span with hidden
  text (D-2); the fieldset's inline `max-height` and the footer's inline margin
  are the `.filter-dropdown fieldset` and `.filter-dropdown .cluster` rules
  already in `components.css`.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How is the count spoken?* Visually hidden text inside the button ("Filters, 2 active"). Every mock put `aria-label` on a plain span, which most screen readers ignore (design system, Labelling).
- **D-3** *Does the dropdown apply on each tick, or on a button?* On each tick, with the live total in the footer, as the mocks and design system show; only the phone sheet has an explicit "Show 2 caterers" (see [sheet](sheet.md) D-4 on L2-009.1's "Apply" wording).
- **D-4** *Does leaving the dropdown with Tab close it?* Yes. A non-modal panel left open behind focus would cover the grid the person is now reading; Escape and an outside click close it too.
- **D-5** *Does the trigger have a busy state?* No. While results load, the sheet's primary is busy and the dropdown's total updates when they arrive; the trigger stays usable so the person can keep adjusting.
- **D-6** *Where does focus go when the Cuisine dropdown opens?* To the first enabled checkbox; for Area, to the search field marked `autofocus` in the mock. Both put the person where typing or ticking starts.
