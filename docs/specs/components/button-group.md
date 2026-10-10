# Button group

| Field | Value |
|---|---|
| Selector | `sh-segmented` (the text filter, `ul.segmented`), `sh-button-group` (joined toggle buttons, `div.btn-group`) |
| Library path | `frontend/projects/components/src/lib/button-group/` |
| Status | planned |
| Traces to | L2-031, L2-036, L2-047, L2-059, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`button-group.html`](../../design-system/components/button-group.html) |
| Source mocks | [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/inbox/filtered`](../../mocks/pages/inbox/filtered.html), [`pages/inbox/loading`](../../mocks/pages/inbox/loading.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/dashboard-enquiries/loading`](../../mocks/pages/dashboard-enquiries/loading.html), [`pages/admin-caterers/default`](../../mocks/pages/admin-caterers/default.html), [`pages/admin-caterers/long`](../../mocks/pages/admin-caterers/long.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/admin-reviews/default`](../../mocks/pages/admin-reviews/default.html), [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html) |
| Rendering | [`button-group.html`](button-group.html) |

## Purpose and scope

Two ways to pick exactly one option from a short row that is always fully
visible. The **segmented text filter** (`sh-segmented`) is the one Sweet Hand
uses everywhere: a quiet, wrapping row of words with counts above a list —
Marcia's inbox "All 4 · Open 1 · Replied 1 · Declined 1 · Closed 1",
Kendra's enquiries, and every operator list ("Filter by status", "Filter by
kind", "Review status"). Its items are links with `aria-current="page"` when
the filter lives in the URL, or toggle buttons with `aria-pressed` when the
list filters in place. The **button group** (`sh-button-group`) joins 2 to 4
outlined [buttons](button.md) into one pill, the pressed one in pepper, for
view options in a toolbar such as the operator metrics "Show by: Day · Week ·
Month".

Use something else to choose a value inside a form ([radio
group](radio-group.md)), to filter by several values at once ([filter
list](filter-list.md), [checkbox](checkbox.md)), to switch panels
([tabs](tabs.md)), or when there are more than about seven options or options
that grow ([select](select.md)).

Out of scope:

- Filtering the list, building the filter URLs, counting the items per status
  and the result count line with its live region ("4 enquiries · 1 unread"):
  the page owns them.
- Where focus goes after a link filter navigates (the new page's `<h1>`): the
  page owns it.
- The list's own loading skeleton and `aria-busy`.

## Usage

Inventory from `usage_inventory.py docs/mocks segmented "ul|div|nav"` (83 lists on
83 screens, including pages behind dialogs and notifications) and
`… btn-group "div"` (none: the button group is the approved shape for the
metrics toolbar, which a native select draws today).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/inbox/*`, `pages/thread/*`, `dialogs/close-enquiry`, `share-contact`, `account-menu` (page behind) | segmented, links, label "Filter by status", count captions | "All 4", "Open 1", "Replied 1", "Declined 1", "Closed 1" | current page, default, hover, focus | canvas, inbox list column |
| `pages/dashboard-enquiries/*`, `pages/dashboard-enquiry/*`, `dialogs/decline-enquiry` | segmented, links, "Filter by status" | "All 6", "Open 2", "Replied 2", "Declined 1", "Closed 1" (counts typed into the label in the mocks, D-3) | current page | canvas |
| `pages/inbox/loading`, `pages/dashboard-enquiries/loading` | segmented, loading, 5 skeleton items | — | loading (`aria-hidden`) | canvas |
| `pages/admin-caterers/default`, `long`, `empty`, `no-results`, `error` | segmented, links, 7 items | "All 68", "Draft 3", "Pending review 2", "Changes requested 1", "Published 60", "Suspended 1", "Removed 1"; `long`: "All 5,214", "Draft 211" …; `empty`: every count 0 | current page, wraps to 3 lines at 320 px | canvas |
| `pages/admin-caterers/loading` | segmented, links without counts | "All", "Draft", "Pending review" … | counts not known yet (D-5) | canvas |
| `pages/admin-queue/*` | segmented, links, "Filter by kind" | "All 7", "Profiles 2", "Name changes 1", "Certificates 1", "Reports 2", "Held reviews 1" (goes to another page) | current page | canvas |
| `pages/admin-reviews/*`, `dialogs/moderate-review` | segmented, "Review status" (links in the mocks; toggle buttons in the design system) | "Held 2", "Hidden 2", "Removed 0" (disabled in the design system) | current or pressed, disabled | canvas |
| `pages/admin-metrics/*` "Show by" | button group, `role="group"`, 3 segments (a select in the mocks, D-7) | "Day", "Week", "Month" | one pressed | canvas toolbar |
| Design system: "Period" | button group, small, 2 segments | "30 days", "90 days" | one pressed | canvas toolbar |

## Anatomy

**Segmented text filter**

1. **List** — `ul.segmented` with `aria-label` naming the choice. Flex, wraps,
   no row gap, `--space-5` between items, `--space-4` below.
2. **Item** — each `li` holds an `<a href>` (link mode) or a
   `<button type="button">` (toggle mode): `--text-body` in `--color-fg-muted`,
   at least `--target-comfortable` (44 px) tall, no border or fill.
3. **Count** — `span.filter-list__count` after the word and a space: a quiet
   caption, `--color-fg-subtle`; inherits pepper when its item is selected.
4. **Hidden context (optional)** — `span.visually-hidden` after the count
   (" enquiry", " caterers") where the bare number is unclear.
5. **Selected item** — `aria-current="page"` or `aria-pressed="true"`:
   `--color-fg-accent` and `--font-weight-semibold`.
6. **Skeleton (loading)** — `ul.segmented[aria-hidden="true"]` of `li`s each
   holding `span.skeleton.skeleton--text` 4rem wide.

**Button group**

1. **Group** — `div.btn-group` with `role="group"` and `aria-label` ("Show
   by"). Inline-flex, never wraps.
2. **Segment** — a secondary `.btn` (optionally `.btn--sm`) with
   `aria-pressed`; inner edges square and overlapping by one hairline, outer
   ends `--radius-full`.
3. **Pressed segment** — `aria-pressed="true"`: `--color-accent-subtle` fill,
   `--color-fg-accent` label in `--font-weight-semibold`, `--color-accent`
   border, raised to `--z-raised`.

Host: both hosts are `display: block` (`sh-segmented`) and `display:
inline-block` (`sh-button-group`) and render the `ul` or `div` as their only
child. The group renders its own `button.btn` elements rather than nesting
`sh-button`, because `.btn-group .btn:first-child` and `:last-child` need the
buttons to be siblings ([button](button.md) D-2).

## API

### `sh-segmented` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `ariaLabel` | `string` | — | yes | Rendered as `aria-label` on the `ul` ("Filter by status", "Filter by kind", "Review status"). |
| `mode` | `'link' \| 'toggle'` | `'link'` | no | `link` renders `<a href>` items and marks the selected one `aria-current="page"`; `toggle` renders `<button type="button">` items with `aria-pressed`. |
| `items` | `SegmentedItem[]` | — | yes | In display order, "All" first. 2 to 8 items. |
| `selected` | `string` | — | yes | The `value` of the one selected item. Exactly one item is selected. |
| `loading` | `boolean` | `false` | no | Renders the skeleton list (`aria-hidden="true"`, one skeleton per item, or 5 when `items` is empty) instead of the items. |

`SegmentedItem` = `{ value: string; label: string; count?: number | null;
hiddenSuffix?: string | null; href?: string; disabled?: boolean }`.

- `label` is the status noun ("Pending review"); never with the count typed in.
- `count` renders `<span class="filter-list__count">` after the label and a
  space, formatted with the page locale ("5,214"). `0` renders "0"; `null` or
  absent renders no count span (D-5).
- `hiddenSuffix` renders `<span class="visually-hidden">` after the count
  (" enquiry").
- `href` is required in `link` mode and ignored in `toggle` mode.
- `disabled` applies in `toggle` mode only (native `disabled`); in `link` mode
  it is ignored, because links are never disabled (D-6).

### `sh-button-group` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `ariaLabel` | `string` | — | yes | Rendered as `aria-label` on the `div[role="group"]` ("Show by"). |
| `options` | `{ value: string; label: string; disabled?: boolean }[]` | — | yes | 2 to 4 segments of one or two words; rendered as `button.btn[type="button"]` with `aria-pressed`. |
| `value` | `string` | — | yes | The pressed segment's `value`. |
| `size` | `'sm' \| 'md'` | `'md'` | no | `sm` adds `.btn--sm` to every segment (36 px from 48rem, 44 px below). Never mixed. |

### Outputs

| Output | Selector | Payload | Emitted when |
|---|---|---|---|
| `selectedChange` | `sh-segmented` (toggle mode) | `string` (the item's `value`) | A not-selected, enabled item is activated. Activating the selected item emits nothing. |
| `followed` | `sh-segmented` (link mode) | `{ value: string; event: MouseEvent }` | A link item is activated; navigation follows unless the consumer calls `event.preventDefault()` (client-side routing). |
| `valueChange` | `sh-button-group` | `string` | A not-pressed segment is activated. Pressing the pressed segment emits nothing and does not unpress it. |

Both components are controlled: they re-render only when `selected` or `value`
changes.

### Content slots

None. Labels and counts are data, so the item structure (and the count
caption) can never be bypassed.

- Translation: `ariaLabel`, every `label` and `hiddenSuffix` come from the
  resource files through the consumer (L2-064.4). Counts are numbers the
  component formats.

## Variants and sizes

| Variant | Element | Use for |
|---|---|---|
| Segmented, links | `ul.segmented` > `a` | A filter kept in the URL (`/inbox?status=open`): inbox, enquiries, operator lists. Back and Forward work. |
| Segmented, toggles | `ul.segmented` > `button[aria-pressed]` | A list that filters in place without a URL change ("Review status" on a review dialog). |
| Button group | `div.btn-group` > `.btn[aria-pressed]` | 2 to 4 view options in a toolbar ("Show by: Day · Week · Month"). |

| Size | Applies to | Height | Type |
|---|---|---|---|
| Segmented (one size) | every item | at least `--target-comfortable` (44 px) | `--text-body` |
| Group md | every segment | `--control-height-md` (44 px) | `--text-label` at `--font-size-md` |
| Group sm | every segment | `--control-height-sm` (36 px) from 48rem; `--target-comfortable` below | `--text-label` at `--font-size-sm` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Item default | — | `--color-fg-muted` label, `--color-fg-subtle` count | Link or toggle button, name "Open 1" |
| Item hover | `:hover` | Label `--color-fg-default` | — |
| Item focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out, `--radius-sm` | — |
| Item active | `:active` | Hover colour until the list updates | — |
| Item selected (link) | `aria-current="page"` | `--color-fg-accent`, `--font-weight-semibold`, count inherits | "Current page" |
| Item selected (toggle) | `aria-pressed="true"` | Same as link | "Pressed" |
| Item disabled (toggle) | `disabled` | `--color-fg-disabled`, `cursor: not-allowed` | Skipped by Tab |
| Loading | `loading` | Skeleton bars, `aria-hidden` | Hidden; the page's status speaks |
| No count yet | `count` null | Label only | Name is the label |
| Segment default / hover / focus / active | as [button](button.md) secondary | Hairline `--color-border-strong`; hover `--color-bg-subtle`; active nudge 1 px | Toggle button, not pressed |
| Segment pressed | `aria-pressed="true"` | `--color-accent-subtle` fill, `--color-fg-accent` semibold label, `--color-accent` border, `--z-raised` | Toggle button, pressed |
| Segment disabled | `disabled` | 50 % opacity | Skipped by Tab |

Exactly one item or segment is selected at all times. `data-state` values in
`components.css` are for documentation only; the component never renders them.

## Markup

```html
<!-- rendered: sh-segmented, link mode (Marcia's inbox) -->
<ul class="segmented" aria-label="Filter by status">
  <li><a href="/inbox" aria-current="page">All <span class="filter-list__count">4</span></a></li>
  <li><a href="/inbox?status=open">Open <span class="filter-list__count">1</span></a></li>
  <li><a href="/inbox?status=replied">Replied <span class="filter-list__count">1</span></a></li>
  <li><a href="/inbox?status=declined">Declined <span class="filter-list__count">1</span></a></li>
  <li><a href="/inbox?status=closed">Closed <span class="filter-list__count">1</span></a></li>
</ul>
```

```html
<!-- rendered: sh-segmented, toggle mode with a disabled option and hidden context -->
<ul class="segmented" aria-label="Review status">
  <li><button type="button" aria-pressed="true">Held <span class="filter-list__count">2</span><span class="visually-hidden"> reviews</span></button></li>
  <li><button type="button" aria-pressed="false">Hidden <span class="filter-list__count">2</span><span class="visually-hidden"> reviews</span></button></li>
  <li><button type="button" aria-pressed="false" disabled>Removed <span class="filter-list__count">0</span><span class="visually-hidden"> reviews</span></button></li>
</ul>
```

```html
<!-- rendered: sh-segmented, loading -->
<ul class="segmented" aria-hidden="true"><li><span class="skeleton skeleton--text" style="width: 4rem;"></span></li>…</ul>
```

```html
<!-- rendered: sh-button-group, md -->
<div class="btn-group" role="group" aria-label="Show by">
  <button class="btn" type="button" aria-pressed="false">Day</button>
  <button class="btn" type="button" aria-pressed="true">Week</button>
  <button class="btn" type="button" aria-pressed="false">Month</button>
</div>
```

The small group adds `.btn--sm` to every segment. The skeleton width may be
set by a class instead of the inline style; everything else is contract.

```html
<!-- consumer: Kendra's enquiries -->
<sh-segmented [ariaLabel]="t('enquiries.filterLabel')" [selected]="status()" [items]="statusItems()"></sh-segmented>

<!-- consumer: operator metrics -->
<sh-button-group [ariaLabel]="t('metrics.showBy')" [options]="granularities" [value]="by()" (valueChange)="setBy($event)"></sh-button-group>
```

## Design

- Segmented: `display: flex; flex-wrap: wrap`, gap `0 --space-5`, margin below
  `--space-4`; items `inline-flex`, `--space-1` between label and count,
  min-height `--target-comfortable`; label `--text-body`; count
  `.filter-list__count` (caption, `--color-fg-subtle`); selected
  `--font-weight-semibold`.
- Button group: segments from [button](button.md); radius 0 except the outer
  ends (`--radius-full`); each segment after the first overlaps by
  `--border-width-hairline`; pressed segment `z-index: --z-raised`.
- Motion: colour over `--duration-fast` with `--ease-standard`; group
  segments nudge 1 px on `:active` like every `.btn`.
- No component tokens; re-skin by overriding the button tokens on the group
  (`--btn-bg` …) or `color` on `.segmented`.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Item label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Item hover | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Count caption | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Selected item and count | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Disabled item | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |
| Segment border | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Pressed segment fill | `--color-accent-subtle` | `--palette-pepper-50` | `--palette-pepper-950` |
| Pressed segment border | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Item label |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Count caption |
| `--color-fg-accent` | `--color-bg-canvas` | 4.5:1 | Selected item |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Pressed segment label |
| `--color-accent` | `--color-bg-surface` | 3:1 | Pressed segment border |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Segment border |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The selected state never relies on hue alone: both variants add semibold
weight, and the group also changes fill and border (L2-069.5). Disabled items
are exempt from contrast minimums. Forced colours: the existing rule
underlines a selected `.filter-list__item`; the segmented filter's selected
item is underlined the same way (D-8), and pressed segments keep their
`Highlight` border through `--color-accent`.

## Responsive behaviour

- Segmented wraps and never scrolls sideways: at 320 px Marcia's five
  statuses take two lines and the seven caterer states take three. Labels are
  never truncated or hidden behind "More".
- From 62rem (LG) the inbox list and the open thread sit side by side
  (L2-036.1); the filter wraps inside the list column, never the page.
- The button group never wraps and is kept to 4 short segments (about
  280 px at md), so it fits at 320 px. From 48rem the segments are joined;
  below 48rem they separate by `--space-2` (8 px) and each becomes a full pill,
  so neighbouring targets are at least 8 px apart (L2-065.1, D-11).
- Segmented rows that wrap below 48rem keep `--space-2` (8 px) between lines,
  so a wrapped item is never closer than 8 px to the one above (D-11).
- Small segments are 36 px only from 48rem and 44 px below; segmented items
  are 44 px tall at every width, with `--space-5` (20 px) between them.
- At 200 % zoom on a 1280 px window every item stays visible and operable.

## Accessibility

### Role and pattern

Segmented links: a `ul` with `aria-label` of `<a href>` items, the current one
`aria-current="page"`. Segmented toggles and the button group: toggle buttons
([APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)); the group is
`role="group"` with `aria-label`. Neither is tabs: they filter one list.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Every item and segment is a tab stop, in order. No roving tabindex, no arrow keys (D-4). Disabled toggles are skipped. |
| <kbd>Enter</kbd> | Follows a link item or presses a toggle. |
| <kbd>Space</kbd> | Presses a toggle item or segment; scrolls on a link item. |

### Focus

- Focus stays on the activated toggle or segment after an in-place update.
- After a link filter navigates, the page moves focus to its `<h1>`; the
  component does nothing.
- The pressed segment's raised layer keeps its ring and border unclipped.

### Labelling

- The list or group name says what is chosen ("Filter by status", "Show by").
- An item's name is its text, count included ("Open 1"); `hiddenSuffix` adds
  context ("Open 1 enquiry") where a bare number is unclear.
- The selected item is exposed by `aria-current="page"` or `aria-pressed`,
  never by colour alone.

### Announcements

None. The page's result count ("4 enquiries · 1 unread") is the live region.

### Motion

Colour changes use `--duration-fast`, zeroed by `prefers-reduced-motion:
reduce`; the segment nudge is removed with it.

## Content and internationalisation

- Status nouns used everywhere else, in lifecycle order, "All" first: All ·
  Open · Replied · Declined · Closed; All · Draft · Pending review · Changes
  requested · Published · Suspended · Removed.
- Counts are figures with thousands separators after a space ("Published
  5,214"); show 0 rather than hiding the option.
- Button-group segments are one or two words, sentence case, no icons:
  "Day", "Week", "30 days".
- A filter only filters; "Held reviews 1" in the queue's kind filter leaves
  the queue for another page, which the design system calls a near-miss. It is
  still a valid link item; the page decides.
- Translatable: `ariaLabel`, labels, `hiddenSuffix`. French labels run about
  30 % longer; segmented rows wrap one more line; group segments must still
  fit at 320 px or the page uses a select.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (formatted counts, the
  selected flag per item) are computed once per input change, not in the
  template.
- No timers or global listeners.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ButtonGroup.ts`
  renders Leah's caterer list filter from `pages/admin-caterers/long` (7 link
  items, "All 5,214" … "Removed 29") switching `selected`, and the "Show by"
  group switching from "Week" to "Month"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Inbox`, `CatererEnquiries`, `OperatorCaterers`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: semibold on selection can widen an item by a few pixels;
  each item reserves its semibold width (D-9), so selecting never reflows the
  row. The skeleton row matches the loaded row's 44 px height.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia's inbox with 4 enquiries (1 open, 1 replied, 1 declined, 1 closed), when `sh-segmented` renders in link mode with "All" selected, then it is `ul.segmented[aria-label="Filter by status"]` of five links in the order All, Open, Replied, Declined, Closed, each with a `.filter-list__count` caption, and only "All 4" has `aria-current="page"`. (L2-031)
- **AC-2** Given Kendra's enquiries filtered to Open, when the filter renders with `selected` "open", then "Open 2" has `aria-current="page"`, is drawn in `--color-fg-accent` at `--font-weight-semibold`, and its count is a `.filter-list__count` span rather than text typed into the label. (L2-031)
- **AC-3** Given Leah's caterer list on `pages/admin-caterers/long`, when the filter renders with a count of 5214 for "All", then the caption reads "5,214". (L2-047)
- **AC-4** Given the caterer list while counts load, when items have `count` null, then each item renders its label with no count span; when `loading` is true, then the row is `ul.segmented[aria-hidden="true"]` of skeleton bars and no link is focusable. (L2-066)
- **AC-5** Given a review dialog's "Review status" filter in toggle mode with "Removed" disabled, when it renders, then the items are `<button type="button">` with "Held 2" `aria-pressed="true"`, "Hidden 2" `aria-pressed="false"`, and "Removed 0" native `disabled` in `--color-fg-disabled`. (L2-059)
- **AC-6** Given an item with `hiddenSuffix` " enquiry", when its accessible name is computed, then it is "Open 1 enquiry" while the visible text is "Open 1". (L2-068)
- **AC-7** Given `sh-button-group` "Show by" with Day, Week and Month and `value` "week", when it renders, then it is `div.btn-group[role="group"][aria-label="Show by"]` of three `button.btn[type="button"]`, only "Week" has `aria-pressed="true"`, and the outer ends are round while the inner edges are square. (L2-061)

### States

- **AC-8** Given the "Show by" group with "Week" pressed, when the operator activates "Month", then `valueChange` emits "month" once, and when they activate "Week" while it is already pressed, then nothing is emitted and it stays pressed. (L2-061)
- **AC-9** Given the "Review status" toggles, when "Hidden 2" is activated, then `selectedChange` emits "hidden", and after the consumer sets `selected` "hidden" exactly one item has `aria-pressed="true"`. (L2-059)
- **AC-10** Given the pressed "Week" segment in the light theme, when its colours are measured, then the label on `--color-accent-subtle` is at least 4.5:1, the `--color-accent` border against the surface is at least 3:1, and the label is semibold. (L2-069)
- **AC-11** Given a selected segmented item, when it is compared with its neighbours, then it differs by weight (`--font-weight-semibold`) as well as colour, so the selection is visible without colour. (L2-069)

### Keyboard and focus

- **AC-12** Given focus before Marcia's status filter, when she presses Tab five times, then focus visits All, Open, Replied, Declined and Closed in order, each with a visible `--color-focus-ring` ring of at least 3:1, and arrow keys move nothing. (L2-067)
- **AC-13** Given focus on the "Month" segment, when the operator presses Space, then "Month" becomes pressed and keeps focus. (L2-067)
- **AC-14** Given Kendra's enquiries filter, when axe-core runs on the page in the default and filtered states, then it reports 0 violations. (L2-066)

### Theming

- **AC-15** Given the dark theme, when Marcia's filter renders, then item labels resolve to `--palette-stone-350`, the selected item to `--palette-pepper-300`, and each has at least 4.5:1 contrast against the canvas. (L2-069)
- **AC-16** Given the dark theme, when the pressed "Week" segment renders, then its fill resolves to `--palette-pepper-950` and its label contrast is at least 4.5:1. (L2-069)

### Responsive

- **AC-17** Given a 320 px viewport, when Leah's seven caterer states render, then they wrap onto three lines with no label truncated and no horizontal scrolling. (L2-064)
- **AC-18** Given a 1280 px viewport and Marcia's inbox with a thread open, when the filter renders, then it wraps within the list column beside the thread, not across the page. (L2-036)
- **AC-19** Given a 360 px viewport, when segmented items and the small "Period" group render, then every item and segment is at least 44 CSS px tall and segmented items are 20 px apart. (L2-065)
- **AC-23** Given a 360 px viewport, when the "Show by" group and Leah's seven caterer states (wrapped onto three lines) are measured, then every pair of neighbouring targets, side by side or line above line, is at least 8 CSS px apart, and each "Show by" segment is a separate full pill. (L2-065)
- **AC-20** Given a 1280 px window at 200 % zoom, when the "Show by" group and Leah's caterer filter render, then every option is visible and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-21** Given `prefers-reduced-motion: reduce`, when an item or segment is hovered and pressed, then colour changes complete without a visible transition and no segment moves. (L2-069)

### Performance

- **AC-22** Given the `ButtonGroup` perf-test scenario on Leah's caterer list, when "Published 5,214" becomes selected, then the change is painted within 200 ms (Interaction to Next Paint) without the row reflowing, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/button-group/`; files
  `segmented.component.*` (selector `sh-segmented`, `SegmentedComponent`) and
  `button-group.component.*` (selector `sh-button-group`,
  `ButtonGroupComponent`).
- Styles: the `.btn-group` and `.segmented` sections of `components.css`; the
  group depends on the `.btn` styles from [button](button.md) and the count on
  `.filter-list__count` from [filter list](filter-list.md). The skeleton bars
  are [skeleton](skeleton.md).
- Mock drift to drop when building: 50 caterer and operator mocks type counts
  into the label ("Open 2"); the component always renders the caption (D-3).
- Design-system catch-up for D-8 (forced colours) and D-9 (reserved semibold
  width): add `.segmented [aria-current="page"], .segmented [aria-pressed="true"]`
  to the forced-colours underline rule, and reserve each item's bold width
  (for example a hidden bold copy of the label via `::after { content:
  attr(data-text); font-weight: var(--font-weight-semibold); height: 0;
  visibility: hidden; }`). The rendering shows both with specimen-only styles.
- Design-system catch-up for D-11: below 48rem, `.btn-group { gap: var(--space-2); }`
  with every segment `border-radius: var(--radius-full); margin-left: 0;`, and
  `.segmented { row-gap: var(--space-2); }`. The rendering shows both with a
  specimen-only style.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One CRD or two for `.segmented` and `.btn-group`?* One CRD with two selectors, because the design system documents them on one page as two weights of the same "pick one from a short row" choice; they share content, selection and keyboard rules.
- **D-3** *Counts in the label or as a caption?* Always a `.filter-list__count` caption. The design system fixed the drift in the caterer and operator mocks; `count` is a separate input so the drift cannot return.
- **D-4** *Arrow keys or tab stops?* Tab stops for every item and segment, as the design system says, so the selection is never hidden behind arrow keys. They are not tabs or a radio group.
- **D-5** *What does an item show before its count is known?* The label alone (`count` null), as `pages/admin-caterers/loading` does; `0` is a known count and is shown.
- **D-6** *Can a link item be disabled?* No. A status with 0 items stays enabled and leads to the list's empty state ("No open enquiries"); only toggle items may be disabled, for an option that can never apply.
- **D-7** *Does the metrics "Show by" control use the button group?* The component is specified for it now so the API is complete, but the metrics page's choice belongs to that page's design; the mocks draw a select today and stay valid until the page moves. Only the group's own behaviour traces to L2-061.
- **D-8** *How is the selected item visible in forced colours?* Underlined, like the filter list's selected item, because pepper and weight alone may not survive forced colours.
- **D-9** *Does selecting an item shift its neighbours?* No. Each item reserves its semibold width so the row never reflows when the selection changes.
- **D-10** *Who emits for link items?* `followed`, so a client-side router can intercept; the link keeps its real `href` so it still works without script and opens in a new tab.
- **D-11** *How far apart are neighbouring options on phones?* At least 8 px, per L2-065.1 and the user's decision of 10 Oct 2026. The design system joins button-group segments with no gap and stacks wrapped segmented rows with no row gap; below 48rem the segments separate by `--space-2` into full pills and wrapped rows get a `--space-2` row gap. From 48rem the joined pill returns. The design system is to be updated.
