# Filter list

| Field | Value |
|---|---|
| Selector | `sh-filter-group` (a titled group: optional "All", the list, the More toggle), `sh-filter-list` (the plain text list of toggle options or navigation links), `sh-active-filters` (the chips row above the results) |
| Library path | `frontend/projects/components/src/lib/filter-list/` |
| Status | planned |
| Traces to | L2-007, L2-008, L2-009, L2-011, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 |
| Design system | [`filter-list.html`](../../design-system/components/filter-list.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterers/filtered`](../../mocks/pages/caterers/filtered.html), [`pages/caterers/no-results`](../../mocks/pages/caterers/no-results.html), [`pages/caterers/empty`](../../mocks/pages/caterers/empty.html), [`pages/caterers/offline`](../../mocks/pages/caterers/offline.html), [`pages/caterers/occasion`](../../mocks/pages/caterers/occasion.html), [`pages/profile-photos/default`](../../mocks/pages/profile-photos/default.html), [`dialogs/site-menu/signed-in`](../../mocks/dialogs/site-menu/signed-in.html), [`dialogs/filters/selected`](../../mocks/dialogs/filters/selected.html) |
| Rendering | [`filter-list.html`](filter-list.html) |

## Purpose and scope

The filter list is the vertical cuisine column from the reference design and
the most recognisable piece of Sweet Hand after the round photos: on the
caterer listing at 62rem and wider, a 15rem column lists cuisines and areas as
large, quiet words with counts. Choosing "Jamaican" turns the word pepper red
and semibold, recounts every other option against the other group, and puts a
removable "Jamaican" chip above the results. Nothing is boxed, ticked or
highlighted: the colour of the word is the whole state. The same list, with
links and `aria-current="page"`, is the dashboard and console side navigation
and the site menu, so "you are here" looks the same everywhere.

Below 62rem the same choices move behind the [filter
trigger](filter-trigger.md) as checkboxes. Use a [checkbox](checkbox.md) or
[radio group](radio-group.md) inside a form, [tabs](tabs.md) or the segmented
control ([button group](button-group.md)) for a few exclusive views, and the
area [combobox](combobox.md) for long free-text lists.

Out of scope:

- Applying filters, recounting, the URL and the results (L2-003, L2-008): the
  listing page, which passes options and counts in.
- The area search field (`.search-field`) inside the Area group:
  [combobox](combobox.md); the group hosts it in a slot.
- The side navigation's landmark and layout: [side navigation](side-nav.md),
  which composes `sh-filter-list` in nav mode.
- The chip itself: [chip](chip.md) (`.chip--filter`); `sh-active-filters`
  arranges chips and "Clear filters".
- The result count's live region above the grid: the listing page.

## Usage

Inventory from `usage_inventory.py docs/mocks filter-list__item "a|button"`
(2,320 items on 50 screens) and searches for `filter-more` (13 screens) and
`active-filters` (6 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/default`, `signed-in`, `long`, `edge`, `loading`, `error`, `postal-invalid`, `out-of-area` (LG–XL column) | `sh-filter-group` "Cuisine" with "All" link (current), 6 toggle options, More "More cuisines (11)"; "Area" group with the area search in a slot and 5 regions | "Jamaican 14", "Trinidadian & Tobagonian 11", "City of Toronto 31" | default, hover, focus, "All" current | canvas, `.browse__aside` |
| `pages/caterers/filtered` | same, Jamaican and Scarborough pressed, counts recomputed, zero counts disabled | "Jamaican 2", "Barbadian (Bajan) 0" (disabled), "Scarborough 2" | selected, disabled | canvas |
| `pages/caterers/no-results` | chosen options with count 0 stay enabled | "Haitian 0" pressed, "Durham 0" pressed | selected with zero | canvas |
| `pages/caterers/empty`, `offline` | every option disabled, More disabled, counts kept | — | disabled | canvas |
| `pages/caterers/filtered`, `occasion`, `no-results`; `dialogs/filters/selected`, `busy`; `pages/admin-caterers/no-results` | `sh-active-filters` | chips "Jamaican", "Scarborough", "Weddings" with "Remove … filter"; "Clear filters" link | default, remove disabled (busy) | canvas, sheet body |
| Dashboard and console side nav (40+ screens: `profile-*`, `dashboard-*`, `admin-*`) | `sh-filter-list mode="nav"` (via [side navigation](side-nav.md)) | "Overview", "Photos" (current), "Enquiries 2 unread", "Review queue 7" | current page | canvas |
| `dialogs/site-menu/*` | `mode="nav"` in the [sheet](sheet.md) | "Caterers" (current), "Occasions", "Inbox 1" | current | sheet |

## Anatomy

`sh-filter-group`:

1. **Group** — `div.filter-group[role="group"]` labelled by its title (a
   `fieldset` with `legend` inside a sheet or dropdown, owned by those).
2. **Title** — `h2.filter-group__title`: "Cuisine", "Area"; `--text-label`,
   subtle.
3. **Before-list slot** — the area search field, when present.
4. **List** — `sh-filter-list` (below).
5. **More toggle** — `button.filter-more[aria-expanded][aria-controls]`:
   "More cuisines (11)" / "Fewer cuisines"; underlined text button.

`sh-filter-list`:

1. **List** — `ul.filter-list`.
2. **"All" reset (toggle mode, optional)** — `a.filter-list__item` back to the
   unfiltered listing, `aria-current="true"` when nothing in the group is
   chosen.
3. **Option** — `button.filter-list__item[aria-pressed]` (toggle mode) or
   `a.filter-list__item[aria-current="page"]` (nav mode): a full-width 44 px row
   in `--text-body-lg`, muted.
4. **Count** — `span.filter-list__count`: caption size, tabular numerals, with
   a visually hidden noun (" caterers") in toggle mode; free text in nav mode
   ("2 unread"); a [badge](badge.md) may replace it in nav mode.

`sh-active-filters`:

1. **Row** — `div.active-filters[role="group"][aria-label]`, wrapping.
2. **Chips** — [chip](chip.md) `.chip.chip--filter`, each with a remove button
   "Remove Jamaican filter".
3. **Clear filters** — `a.btn.btn--link.btn--sm` to the unfiltered listing,
   last.

Hosts are `display: contents`; classes go on the inner elements.

## API

### `sh-filter-group` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | `h2.filter-group__title`; names the group. |
| `allLabel` | `string \| null` | `null` | no | Renders the "All" link first in the list. |
| `allHref` | `string \| null` | `null` | yes with `allLabel` | The unfiltered listing URL for this group. |
| `options` | `FilterOption[]` | — | yes | `{ value: string; label: string; count: number; pressed: boolean; disabled?: boolean }`, in display order (by count, then A–Z). |
| `visibleCount` | `number` | `6` | no | Options shown before the More toggle; pressed options are always shown (D-4). |
| `moreLabel` | `(hidden: number) => string` | — | yes when options exceed `visibleCount` | "More cuisines (11)". |
| `fewerLabel` | `string \| null` | `null` | yes with `moreLabel` | "Fewer cuisines". |
| `countNoun` | `(count: number) => string` | — | yes | Hidden noun after a count: " caterers", " caterer". |
| `disabled` | `boolean` | `false` | no | Disables every option and the More toggle (empty and offline), keeping counts. |

Outputs: `toggled` (`{ value: string; pressed: boolean }`) when an option is
activated; `expandedChange` (`boolean`) when More is toggled.

Slot: `before-list` — the area search field.

### `sh-filter-list` inputs (used directly in nav mode)

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `mode` | `'toggle' \| 'nav'` | `'toggle'` | no | `toggle`: buttons with `aria-pressed`; `nav`: links with `aria-current="page"` on the current one. |
| `items` | `FilterOption[] \| NavItem[]` | — | yes | `NavItem` = `{ label: string; href: string; current: boolean; count?: string; badge?: { text: string; label: string } }`. |

### `sh-active-filters` inputs and outputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Group name: "Active filters". |
| `chips` | `{ value: string; label: string }[]` | — | yes | One `.chip--filter` each; nothing rendered when empty. |
| `removeLabel` | `(label: string) => string` | — | yes | "Remove Jamaican filter" — always "Remove … filter". |
| `clearLabel` | `string` | — | yes | "Clear filters". |
| `clearHref` | `string` | — | yes | The unfiltered listing. |
| `disabled` | `boolean` | `false` | no | Disables the remove buttons while results load (filters sheet busy). |

Output: `removed` (`value: string`).

- Translation: titles, labels, nouns and "Clear filters" come from the resource
  files (L2-064). Cuisine and region names are data with the L2-007 / L2-010
  spellings, never shortened.

## Variants and sizes

| Variant | Element | Use |
|---|---|---|
| Toggle option | `button.filter-list__item[aria-pressed]` | Listing column filters. |
| "All" reset | `a.filter-list__item[aria-current="true"]` when nothing chosen | First item of the Cuisine group. |
| Navigation item | `a.filter-list__item[aria-current="page"]` | Side navigation and the site menu. |
| More toggle | `button.filter-more[aria-expanded]` | After six options. |
| Active filters | `.active-filters` + `.chip--filter` + "Clear filters" | Above the results at every width when something is chosen. |

One size: options are `--text-body-lg` in a `--target-comfortable` (44 px)
row. The large type is the design; a compact list would be a different
component. The column width (`--layout-sidebar-width`, 15rem) comes from the
page's `.browse__aside`.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | `--color-fg-muted` word, `--color-fg-subtle` count | Toggle button "Jamaican, 14 caterers", not pressed |
| Hover | `:hover` | `--color-fg-default` | — |
| Focus | `:focus-visible` | Shared pepper ring around the full-width row, offset `--focus-ring-offset` | — |
| Selected | `aria-pressed="true"` | `--color-fg-accent`, semibold; count inherits pepper | "pressed" |
| Selected with zero | pressed and count 0 | As selected; stays enabled so it can be unchosen | "Haitian, 0 caterers, pressed" |
| Disabled | count 0 and not pressed, or group `disabled` | `--color-fg-disabled`, `not-allowed`; count inherits; skipped by Tab | "dimmed"; the "0" says why in text |
| Current ("All" / nav) | `aria-current="true"` / `"page"` | Pepper, semibold | "current" / "current page" |
| More collapsed / expanded | `aria-expanded` | "More cuisines (11)" / "Fewer cuisines" | "collapsed" / "expanded" |
| More disabled | group `disabled` | `--color-fg-disabled`, no underline | Unavailable |
| Loading results | page refreshing | Options stay interactive; counts update with the results | Page's result count announces the total |
| Forced colours | `forced-colors: active` | Selected and current are underlined | — |

## Markup

```html
<!-- rendered: Cuisine group, nothing chosen -->
<div class="filter-group" role="group" aria-labelledby="sh-fg-1-title">
  <h2 class="filter-group__title" id="sh-fg-1-title">Cuisine</h2>
  <ul class="filter-list" id="sh-fg-1-list">
    <li><a class="filter-list__item" href="/caterers" aria-current="true">All</a></li>
    <li><button class="filter-list__item" type="button" aria-pressed="false">Jamaican <span class="filter-list__count">14<span class="visually-hidden"> caterers</span></span></button></li>
    …five more…
  </ul>
  <button class="filter-more" type="button" aria-expanded="false" aria-controls="sh-fg-1-list">More cuisines (11)</button>
</div>
```

```html
<!-- rendered: chosen, recounted, zero disabled -->
<li><a class="filter-list__item" href="/caterers">All</a></li>
<li><button class="filter-list__item" type="button" aria-pressed="true">Jamaican <span class="filter-list__count">2<span class="visually-hidden"> caterers</span></span></button></li>
<li><button class="filter-list__item" type="button" aria-pressed="false" disabled>Barbadian (Bajan) <span class="filter-list__count">0<span class="visually-hidden"> caterers</span></span></button></li>
```

```html
<!-- rendered: Area group with the search in the before-list slot -->
<div class="filter-group" role="group" aria-labelledby="sh-fg-2-title">
  <h2 class="filter-group__title" id="sh-fg-2-title">Area</h2>
  <form class="search-field" role="search" action="/caterers">…Area or postal code…</form>
  <ul class="filter-list">…City of Toronto 31, Peel 13, York Region 8, Durham 7, Halton 3…</ul>
</div>
```

```html
<!-- rendered: navigation mode -->
<ul class="filter-list">
  <li><a class="filter-list__item" href="/dashboard/photos" aria-current="page">Photos</a></li>
  <li><a class="filter-list__item" href="/dashboard/enquiries">Enquiries <span class="filter-list__count">2 unread</span></a></li>
</ul>
```

```html
<!-- rendered: active filters -->
<div class="active-filters" role="group" aria-label="Active filters">
  <span class="chip chip--filter">Jamaican<button class="remove" type="button" aria-label="Remove Jamaican filter"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg></button></span>
  <span class="chip chip--filter">Scarborough<button class="remove" type="button" aria-label="Remove Scarborough filter">…</button></span>
  <a class="btn btn--link btn--sm" href="/caterers">Clear filters</a>
</div>
```

```html
<!-- consumer: the listing column -->
<aside class="browse__aside" [attr.aria-label]="t('filters.title')">
  <sh-filter-group [title]="t('filters.cuisine')" [allLabel]="t('filters.all')" allHref="/caterers" [options]="cuisines()"
    [moreLabel]="moreCuisines" [fewerLabel]="t('filters.fewerCuisines')" [countNoun]="caterersNoun" [disabled]="offline()"
    (toggled)="toggleCuisine($event)"></sh-filter-group>
  <sh-filter-group [title]="t('filters.area')" [options]="regions()" [countNoun]="caterersNoun" (toggled)="toggleArea($event)">
    <sh-area-search slot="before-list"></sh-area-search>
  </sh-filter-group>
</aside>
```

The listing's page object finds options by role and name ("Jamaican, 14
caterers") and reads `aria-pressed`; e2e locators also use these classes.

## Design

- Group: title `--text-label` in `--color-fg-subtle`, `--space-2` below; groups
  `--space-10` apart in the column (page layout).
- Option row: `--target-comfortable` min height, full width, no padding, gap
  `--space-2`, `--text-body-lg`; selected and current
  `--font-weight-semibold`.
- Count: `--text-caption`, `font-variant-numeric: tabular-nums`, regular
  weight.
- More toggle: `--text-body-sm`, underlined, `--target-comfortable` high.
- Active filters: gap `--space-2`, wrapping; chip fill `--color-accent-subtle`
  with an `--color-accent` edge ([chip](chip.md)).
- Motion: colour over `--duration-fast` with `--ease-standard`; revealing more
  options does not animate.
- No backgrounds, ticks or bars on the chosen row; no component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Option | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Hovered option | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Selected, current | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Disabled option | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |
| Title, count | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Filter chip fill / edge | `--color-accent-subtle` / `--color-accent` | `--palette-pepper-50` / `--palette-pepper-600` | `--palette-pepper-950` / `--palette-pepper-300` |
| Chip remove hover | `--color-accent-subtle-hover` | `--palette-pepper-100` | `--palette-pepper-900` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Option |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Hovered option |
| `--color-fg-accent` | `--color-bg-canvas` | 4.5:1 | Selected option, current item |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Title and count |
| `--color-fg-accent` | `--color-bg-surface-raised` | 4.5:1 | Current item in the menu sheet |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Filter chip label |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Filter chip edge |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Disabled options are exempt from contrast (WCAG 1.4.3) and say "0" in text, so
colour is never the only signal. In forced colours the selected and current
items are underlined (`components.css`).

## Responsive behaviour

| Range | Behaviour |
|---|---|
| LG, XL (62rem+) | The listing shows the groups in `.browse__aside`, 15rem, `--space-10` between groups, beside the grid. |
| MD (48–62rem) | The column hides; the [filter trigger](filter-trigger.md) dropdowns carry the same choices as checkboxes. |
| XS, SM | The Filters [sheet](sheet.md) carries them as checkboxes. |
| Every width | `.active-filters` sits above the results whenever something is chosen; chips wrap, "Clear filters" stays last. Below 48rem chips and their remove buttons are 44 px; from 48rem the remove button is 24 px in a 36 px chip. |

- Long names ("Dominican (Dominican Republic)", "Kittitian & Nevisian") wrap
  inside the 15rem column; the count follows the last word.
- Navigation mode follows its host ([side navigation](side-nav.md), the menu
  [sheet](sheet.md)).

## Accessibility

### Role and pattern

Each group is `role="group"` labelled by its title. Options are toggle buttons
with `aria-pressed` ([APG
Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)); "All" is a link with
`aria-current="true"`; More uses `aria-expanded` and `aria-controls` ([APG
Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)); chips sit in
`role="group" aria-label="Active filters"`. Navigation mode is links with
`aria-current="page"`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Option by option; disabled options are skipped. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Toggles the option; results update in place and focus stays on the option. |
| <kbd>Enter</kbd> on More | Reveals the rest after the last visible option; focus stays on the toggle, now "Fewer cuisines". |
| <kbd>Enter</kbd> on a chip's remove | Removes the filter; focus moves to the next chip, or to the results heading if none are left (the page provides it). |

### Focus

The ring wraps the full-width row, offset 3 px, so on a pepper option it stays
distinct from the word. An option that becomes disabled after a recount while
focused keeps focus until the person moves on (D-5).

### Labelling

- Option names include the count and a hidden noun: "Jamaican, 14 caterers".
- Chip removes: "Remove Jamaican filter", the same wording in the sheet and on
  the page.

### Announcements

None from the list. The listing's `role="status"` result count announces each
change ("2 caterers", L2-067.5).

### Motion

Colour changes use `--duration-fast`; reduced motion makes them instant.

## Content and internationalisation

- Use the L2-007 names exactly: "Trinidadian & Tobagonian", "Barbadian
  (Bajan)", "Antiguan & Barbudan", "St. Lucian"; never "Trini", "Bajan" alone
  or a generic "Caribbean".
- Order: "All" first, then by count (most first), ties A to Z. Show six, then
  "More cuisines (11)" with the number hidden.
- Group titles are one word: "Cuisine", "Area". Areas list the five regions
  (City of Toronto, Peel, York Region, Durham, Halton) plus any chosen area
  ("Scarborough").
- Counts are bare numerals visibly ("14") with the hidden noun; nav counts are
  text ("2 unread").
- The reset is "All" in the list and "Clear filters" beside the chips.
- French names are longer ("Trinidadien et tobagonien"); they wrap in the
  column.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (visible and hidden options,
  "All" current, spoken counts) are computed once per input change, not in the
  template. Options are keyed by `value` so a recount updates text in place.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FilterList.ts`
  renders the listing column with all 18 cuisines and 5 regions, then
  toggles Jamaican and recounts every option (the `filtered` state);
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CaterersListing`, `SideNav`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: zero-count options stay in place, disabled, so the list
  never jumps; counts use tabular numerals so recounts do not shift words.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given the listing at 1280 px with no filters, when the Cuisine group renders, then it is `div.filter-group[role="group"]` named "Cuisine", "All" is a link with `aria-current="true"`, and the next six options are "Jamaican 14", "Trinidadian & Tobagonian 11", "Guyanese 9", "Barbadian (Bajan) 6", "Haitian 5", "Grenadian 4", followed by "More cuisines (11)". (L2-007)
- **AC-2** Given the Cuisine group, when a screen reader reads the Jamaican option, then its name is "Jamaican, 14 caterers" and it is a toggle button, not pressed. (L2-068)
- **AC-3** Given the listing at 1280 px, when it renders, then the column shows the groups to the left of the grid, 15rem wide, without any trigger. (L2-009)
- **AC-4** Given Jamaican and Scarborough are chosen, when the column renders, then Jamaican has `aria-pressed="true"` in `--color-fg-accent` and semibold, its count "2" is pepper too, and Barbadian (Bajan), Haitian and Grenadian show "0" and are disabled but still listed in place. (L2-008)
- **AC-5** Given Jamaican and Scarborough are chosen, when the results render, then `.active-filters` named "Active filters" shows chips "Jamaican" and "Scarborough" with remove buttons "Remove Jamaican filter" and "Remove Scarborough filter", and "Clear filters" last. (L2-009)
- **AC-6** Given the Area group, when it renders, then the area search sits between the title and the five regions with counts "City of Toronto 31", "Peel 13", "York Region 8", "Durham 7", "Halton 3". (L2-011)
- **AC-7** Given Kendra on her Photos page, when the side navigation renders through `mode="nav"`, then "Photos" is a link with `aria-current="page"` in pepper and "Enquiries" reads "Enquiries 2 unread". (L2-066)

### States

- **AC-8** Given Haitian and Durham are both chosen and match nothing, when the column renders, then both stay pressed and enabled with "0", so either can be unchosen. (L2-008)
- **AC-9** Given Jamaican is chosen, when Marcia activates "Clear filters", then the listing opens without filter parameters and every option is unpressed with "All" current again. (L2-008)
- **AC-10** Given a cached copy of the listing is served while the application servers cannot answer, when the column renders with `disabled`, then every option and "More cuisines (11)" are disabled, counts are kept, and the cached caterers stay browsable. (L2-091)
- **AC-11** Given "More cuisines (11)", when Marcia activates it, then the eleven remaining cuisines appear after Grenadian, the toggle reads "Fewer cuisines" with `aria-expanded="true"`, and focus stays on it. (L2-067)

### Keyboard and focus

- **AC-12** Given focus on "Jamaican", when Space is pressed, then `toggled` is emitted with `{ value: "jamaican", pressed: true }`, focus stays on the option, and the page's result count announces "14 caterers". (L2-067)
- **AC-13** Given Tab from "Guyanese" in the filtered state, when the next options are disabled, then focus skips them to the next enabled control. (L2-067)
- **AC-14** Given focus on "Remove Jamaican filter", when Enter is pressed, then `removed` is emitted with "jamaican" and focus moves to "Remove Scarborough filter". (L2-067)
- **AC-15** Given a pressed option in each theme, when it has keyboard focus, then the ring has at least 3:1 contrast against the page and is visibly separate from the pepper word. (L2-067)

### Theming

- **AC-16** Given the light and the dark theme, when the column renders, then options meet 4.5:1 in `--color-fg-muted`, the chosen option meets 4.5:1 in `--color-fg-accent` (`--palette-pepper-300` in dark), and title and counts meet 4.5:1 in `--color-fg-subtle`. (L2-069)
- **AC-17** Given a chosen option, when it renders, then the choice is also exposed by `aria-pressed` and the chip above the results, not by colour alone. (L2-069)

### Responsive

- **AC-18** Given a 1280 px window at 200 % zoom, when the listing renders, then the column hides behind the filter trigger as at 640 px, and nothing scrolls horizontally. (L2-069)
- **AC-19** Given "Dominican (Dominican Republic)" in the expanded Cuisine group, when the 15rem column renders, then the name wraps and its count follows the last word. (L2-064)
- **AC-20** Given a 360 px viewport with Jamaican chosen, when `.active-filters` renders, then each chip and its remove button are at least 44 CSS px tall with at least 8 px between targets. (L2-065)

### Performance

- **AC-21** Given the `FilterList` perf-test scenario, when Jamaican is toggled, then the pressed state is painted within 200 ms (Interaction to Next Paint) and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/filter-list/`; files
  `filter-group.component.*` (`sh-filter-group`, `FilterGroupComponent`),
  `filter-list.component.*` (`sh-filter-list`, `FilterListComponent`),
  `active-filters.component.*` (`sh-active-filters`, `ActiveFiltersComponent`).
- Composes [chip](chip.md) and [button](button.md) ("Clear filters" as a
  link-styled anchor), and [badge](badge.md) in nav counts. Composed by the
  listing page, [side navigation](side-nav.md) and the menu [sheet](sheet.md).
- Styles: the Filter list section of `components.css`, `.chip--filter`, and
  the forced-colours underline.
- Design-system catch-up: counts get the hidden noun (D-2); the remove label
  is always "Remove … filter" (D-3); `.filter-more:disabled` is already in
  `components.css`.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How are counts spoken?* With a visually hidden noun ("Jamaican, 14 caterers"); the mocks' bare "Jamaican 14" is ambiguous (design system, Labelling).
- **D-3** *How are chip removes labelled?* "Remove … filter" everywhere; the sheet's "Remove Scarborough" was drift.
- **D-4** *Can a chosen option hide behind More?* No. Pressed options always show among the visible ones, so a choice made from the expanded list stays visible after "Fewer cuisines"; otherwise the only sign of it would be the chip.
- **D-5** *What happens to focus when the focused option becomes disabled after a recount?* It keeps focus (a disabled button can hold focus it already has in most browsers, and the component sets `aria-disabled="true"` instead of `disabled` for that one option until focus leaves), so keyboard users are not dropped to the page body. The design system is silent.
- **D-6** *Does the "All" link exist in the Area group?* No. The mocks show it only for Cuisine; the area search and the chips cover resetting areas, and "Clear filters" resets both.
