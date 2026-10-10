# Table

| Field | Value |
|---|---|
| Selector | `sh-table` (wrapper, caption, header and loading rows), `sh-table-row-actions` (the `.row-actions` cell content), `sh-table-na` (the empty-cell marker) |
| Library path | `frontend/projects/components/src/lib/table/` |
| Status | planned |
| Traces to | L2-060, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 |
| Design system | [`table.html`](../../design-system/components/table.html) |
| Source mocks | [`pages/admin-audit/default`](../../mocks/pages/admin-audit/default.html), [`pages/admin-audit/long`](../../mocks/pages/admin-audit/long.html), [`pages/admin-audit/loading`](../../mocks/pages/admin-audit/loading.html), [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html), [`pages/admin-metrics/partial`](../../mocks/pages/admin-metrics/partial.html), [`pages/admin-metrics/invalid`](../../mocks/pages/admin-metrics/invalid.html), [`pages/privacy/default`](../../mocks/pages/privacy/default.html) |
| Rendering | [`table.html`](table.html) |

## Purpose and scope

A table is for operators comparing records across the same columns: who did
what, to which caterer, when and why (the audit log), a number per week (the
metrics page's "Show as a table" disclosures), caterers by status. It is also
the plain two- and three-column tables in the public privacy notice ("Cookies
Sweet Hand sets", "How long we keep it"). It is a native `<table>` with a
caption, `th scope` headers and no zebra stripes or vertical rules, inside a
`.table-wrap` that scrolls sideways on its own so the page never does.

Customers and caterers see rows, not tables. Use something else for things
people scan one at a time, each with a photo or a status: enquiries are
[inbox rows](inbox-row.md), the operator queue is [queue items](queue-item.md),
cuisines, operators and menu items are [list](list.md) rows, one caterer's
facts are a [description list](description-list.md), and a chart's figures at
a glance are a [bar chart](bar-chart.md) (whose accessible twin is this
table). Never use a table for layout.

Out of scope:

- Fetching, filtering and ordering records (the audit log's filters and
  newest-first order, L2-060), and paginating them ("Showing 41–60 of 1,284"
  and [pagination](pagination.md)): the page owns them. The table renders the
  rows it is given, in the order given.
- Empty, no-results, error and forbidden states: the page replaces the whole
  table with an [empty state](empty-state.md) ("No entries match", "We
  couldn't load the audit log"); the table never renders an empty body (D-6).
- The "Show as a table" disclosure around a metrics table: it belongs to the
  [bar chart](bar-chart.md)'s chart card ([accordion](accordion.md) styles).
- Sorting the data: the table reports which header was activated; the page
  re-orders the rows and passes the new sort back.
- Date and number formatting: cells receive already-formatted text ("Fri 9 Oct,
  4:30 p.m.", "3,910", "82%") from the consumer's formatters.

## Usage

Inventory from `usage_inventory.py docs/mocks table "table|div"` and a search
for `table-wrap`, `.num`, `aria-sort`, `row-actions`, `.na` and
`table--dense` across `docs/mocks`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-audit/default`, `long` | default density, `region` (focusable scroll wrapper), caption hidden, 6 text columns | Caption "Audit entries, newest first"; headers "When", "Operator", "Action", "Target", "Reason", "Before → after"; cells hold `<time>`, `<strong>` action, target name with an ID in `.list__meta`, and an empty before/after ("—") | default (9 rows), long (20 rows, page 3 of 65) | canvas, work area |
| `pages/admin-audit/loading` | default density, `busy`, 6 columns, 8 skeleton rows | Status line "Loading audit entries" | loading | canvas |
| `pages/admin-audit/empty`, `no-results`, `error`, `forbidden` | no table: the page shows an [empty state](empty-state.md) | — | empty, no results, error, forbidden | canvas |
| `pages/admin-metrics/default`, `invalid` (6 tables), `partial` (4 tables) | numeric: row header + one `.num` column, caption hidden, inside a chart card's "Show as a table" | "Enquiries by week": "Week of 31 Aug" 8 … "Week of 5 Oct" 12; "Replied within 48 hours by week": "75%" …; "Listing page visits by week": "3,120" …; "Caterer page visits", "Unique visitors", "New caterers published" | default (collapsed and expanded) | canvas, inside `details` |
| `pages/admin-metrics/default`, `partial`, `invalid` "Caterers by status" | numeric, caption hidden under an `h2` | "Published" 60, "Pending review" 3, "Changes requested" 1, "Draft" 9, "Suspended" 1, "Removed" 2 | default | canvas |
| `pages/privacy/default` | text, row headers, caption hidden, block margin set by the page | "Cookies Sweet Hand sets" (Cookie / Why / Lasts: "Session", "Keeps you signed in", "Up to 30 days"); "How long Sweet Hand keeps personal information" (Information / Kept for: "Food handler certificate files", "90 days after they are replaced or the account is deleted") | default | public canvas |
| Design-system kit (no mock yet): operator caterer list | sortable headers, row actions, selected row, dense | "Caterer", "Cuisine", "Published" (sorted descending), "Reviews"; action "Open" named "Open Pelau House" | hover, focus, sorted ascending / descending, selected | canvas |

Every row is buildable with the API below. The kit row is in the API now
because the design system specifies it (D-3), so the operator screens that
need sorting or row actions do not reshape the component later.

## Anatomy

1. **Status line (loading only)** — `p.visually-hidden[role="status"]` placed
   immediately before the wrapper, carrying `busyLabel` ("Loading audit
   entries").
2. **Wrapper** — `div.table-wrap`: `position: relative`, 1 px top rule in
   `--color-border-default`, `--color-bg-surface` fill, `overflow-x: auto`. With
   `region`, also `tabindex="0" role="region" aria-labelledby="<caption id>"`.
   With `busy`, `aria-busy="true"`.
3. **Table** — `table.table` (plus `.table--dense`): full width, collapsed
   borders, `--text-body-sm`.
4. **Caption** — `<caption>` with a generated `id`; `.visually-hidden` unless
   `captionVisible`. When visible: `--text-label`, muted, left.
5. **Column header** — `thead th[scope="col"]`: `--text-label`, muted, one
   line, sticky to the top of the wrapper over `--color-bg-surface`. Numeric
   columns add `.num`. Sortable columns carry `aria-sort` and wrap their label
   in a `<button type="button">`; the arrow is CSS (`::after` "↑" / "↓").
   An actions column has a visually hidden label ("Actions").
6. **Row header** — `tbody th[scope="row"]`: names the row ("Published",
   "Week of 28 Sep", "Session"); body text colour, medium weight, wraps, never
   sticky.
7. **Cell** — `td`, `.num` for figures (right-aligned, tabular figures).
   Content is the consumer's: text, `<time datetime>`, `<strong>`, a link, a
   secondary line in `div.list__meta`, a [status](status.md) label.
8. **Row separator** — 1 px `--color-border-default` under every row except
   the last.
9. **Row actions** — `div.row-actions` in the last cell, holding small ghost
   [buttons](button.md) in a wrapping flex row with a `--space-2` (8 px) gap
   (D-10); revealed on row hover or focus within, always shown on touch.
10. **Empty marker** — `span.na[aria-hidden="true"]` "—" plus
    `span.visually-hidden` with a word ("No change").
11. **Skeleton row (loading only)** — `tr[aria-hidden="true"]` with one
    `span.skeleton.skeleton--text` per column ([skeleton](skeleton.md)).

Host: `sh-table` is `display: block` and renders the optional status line and
`div.table-wrap` as its only children; the classes go on those inner
elements, never on the host. `sh-table-row-actions` and `sh-table-na` are
`display: contents` and render `div.row-actions` and the `span.na` pair.

## API

### `sh-table` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `caption` | `string` | — | yes | The table's name ("Audit entries, newest first", "Enquiries by week"). Rendered in `<caption id>`; also names the scroll region. Text, never HTML. |
| `captionVisible` | `boolean` | `false` | no | `false` adds `.visually-hidden` to the caption, for tables under a heading that says the same (every mock). `true` shows it in `--text-label`. |
| `columns` | `TableColumn[]` | — | yes | One entry per column, in order; renders `thead > tr > th[scope="col"]`. At least 1. |
| `density` | `'default' \| 'dense'` | `'default'` | no | `dense` adds `.table--dense`. Refused (rendered as `default`) when any column is `actions` (D-4). |
| `region` | `boolean` | `false` | no | Makes the wrapper a focusable, labelled scroll region: `tabindex="0" role="region" aria-labelledby` the caption's id. Set it on tables that can overflow at 320 px (the audit log); narrow two- and three-column tables leave it off (D-5). Ignored while `busy`. |
| `sort` | `TableSort \| null` | `null` | no | `{ key: string; direction: 'ascending' \| 'descending' }`. The matching sortable column renders `aria-sort` with that direction; every other sortable column renders `aria-sort="none"`. Controlled by the consumer. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` on the wrapper, renders `skeletonRows` skeleton rows in place of the projected body and the `busyLabel` status line. The header stays. |
| `busyLabel` | `string` | — | yes when `busy` | The hidden status line ("Loading audit entries"). |
| `skeletonRows` | `number` | `8` | no | Skeleton rows while busy (the audit log uses 8). Whole number from 1 to 20. |

`TableColumn`:

| Field | Type | Default | Rule |
|---|---|---|---|
| `key` | `string` | — | Unique within the table; the value `sortChange` reports. |
| `label` | `string` | — | The header text ("When", "Before → after"). For `actions`, the hidden header ("Actions"). |
| `numeric` | `boolean` | `false` | Adds `.num` to the header; the consumer adds `.num` to that column's cells. |
| `sortable` | `boolean` | `false` | Renders `aria-sort` and wraps the label in `<button type="button">`. |
| `firstSort` | `'ascending' \| 'descending'` | `'ascending'` | The direction a first activation asks for. Dates and counts use `descending` (design system). |
| `actions` | `boolean` | `false` | The row-actions column: label rendered as `span.visually-hidden`, never sortable. At most one, and last. |

### `sh-table-row-actions` inputs

None. It renders `div.row-actions` around its slot.

### `sh-table-na` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The hidden word read instead of the dash ("No change", "None"). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `sortChange` (on `sh-table`) | `TableSort` — the column's `key` and the requested direction | A sort header button is activated by click, tap, <kbd>Enter</kbd> or <kbd>Space</kbd>. The direction is the column's `firstSort` when it is not the sorted column, otherwise the opposite of the current direction. The table does not re-order anything itself. |

`sh-table-row-actions` and `sh-table-na` have no outputs: row actions are
[buttons](button.md) with their own `activated` output.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-table`: default | `<tr>` elements for the body | Rendered inside the `<tbody>`. Each row starts with a `th scope="row"` when a cell names the row (metrics, status, privacy), otherwise `td`s. Cells match `columns` one to one. Hidden while `busy`. Declared once, whatever the state. |
| `sh-table-row-actions`: default | One to three `sh-button variant="ghost" size="sm"` with an `ariaLabel` naming the row | Rendered inside `div.row-actions`. |
| `sh-table-na`: none | — | The dash is fixed punctuation; the word comes from `label`. |

- A row the consumer marks as the one open beside the table carries
  `aria-current="true"` on its `<tr>` (D-2). The consumer sets it; the table
  styles it.
- Translation: `caption`, every `columns[].label`, `busyLabel` and
  `sh-table-na`'s `label` come from the resource files through the consumer
  (L2-064). Cell content is data or the consumer's formatted copy. The arrows
  and the dash are punctuation, not copy.

## Variants and sizes

| Variant | How | Use for |
|---|---|---|
| Default (text) | `table.table` | The audit log; the privacy notice's cookie and retention tables. |
| Numeric | `columns[].numeric` + `td.num`, row headers on the left | Metrics by week, "Caterers by status". |
| Sortable | `columns[].sortable` + `sort` | Operator lists compared by a column (the kit's caterer list). |
| With row actions | an `actions` column holding `sh-table-row-actions` | Small ghost buttons such as "Open", revealed on row hover or focus. |
| Scroll region | `region` | Any table that can be wider than a 320 px viewport (the audit log). |

| Density | Modifier | Cell padding (block / inline) | Row height, one line | Type | Use |
|---|---|---|---|---|---|
| Default | — | `--space-4` / `--space-3` | about 52 px | `--text-body-sm` cells, `--text-label` headers | Everything in the mocks; any table with row actions. |
| Dense | `.table--dense` | `--space-2` / `--space-3` | about 36 px | the same | Long numeric lists on desktop. |

The table is always the full width of its container; columns size to their
content, and long cells wrap.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Rows separated by hairlines on `--color-bg-surface` | "table, Audit entries, newest first, 6 columns, 10 rows" |
| Row hover | `:hover` on a body `tr` | Row fill `--color-bg-subtle`; means nothing else | — |
| Focus within a row | `:focus-within` | Row actions become visible; the focused control shows the shared `--color-focus-ring` ring | Focused control announced with its row name |
| Region focus | `:focus-visible` on `.table-wrap` | Shared focus ring around the wrapper | "Audit entries, newest first, region"; arrow keys scroll |
| Sorted | `th[aria-sort="ascending\|descending"]` | "↑" or "↓" after the label | "Published, sorted descending, button" |
| Unsorted sortable | `th[aria-sort="none"]` | No arrow; pointer cursor | "Reviews, button" |
| Sort button focus | `:focus-visible` on the header button | Shared focus ring | — |
| Selected (open beside the table) | `tr[aria-current="true"]` | Row fill `--color-accent-subtle` | "current" announced on the row (D-2) |
| Row actions hidden | default on hover-capable pointers | `opacity: 0` | Still in the tab order; revealed on focus before it is seen |
| Row actions shown | row `:hover`, `:focus-within`, or `@media (hover: none)` | Fade to `opacity: 1` over `--duration-fast` | — |
| Empty cell | `sh-table-na` | Muted "—" in `--color-fg-subtle` | Reads the hidden word ("No change") |
| Loading | `busy` | Real header, `skeletonRows` shimmering bars, no caption change | Wrapper `aria-busy="true"`, skeleton rows `aria-hidden`, status "Loading audit entries" |
| Empty, no results, error | — | Never rendered by the table; the page shows an [empty state](empty-state.md) instead (D-6) | — |
| Disabled | — | Never: a table is not a control | — |

`data-state="hover|selected|focus"` exists in `components.css` for
documentation and mocks only; the component never renders it.

## Markup

```html
<!-- rendered: audit log (text, scroll region, empty marker) -->
<div class="table-wrap" tabindex="0" role="region" aria-labelledby="audit-cap">
  <table class="table">
    <caption class="visually-hidden" id="audit-cap">Audit entries, newest first</caption>
    <thead><tr><th scope="col">When</th><th scope="col">Operator</th><th scope="col">Action</th><th scope="col">Target</th><th scope="col">Reason</th><th scope="col">Before → after</th></tr></thead>
    <tbody>
      <tr><td><time datetime="2026-10-10T13:12:00Z">Today, 9:12 a.m.</time></td><td>Tomas Reyes</td><td><strong>Hide review</strong></td><td>Review of Maracas Bay by Devon W.<div class="list__meta">rev_7f3c9a</div></td><td>Personal attack on staff, 3 reports</td><td>Published → Hidden</td></tr>
      <tr><td><time datetime="2026-10-10T12:47:00Z">Today, 8:47 a.m.</time></td><td>Leah Mohammed</td><td><strong>Open enquiry</strong></td><td>Enquiry with Island Pot<div class="list__meta">enq_3b9e0c41 · report rpt_51a0</div></td><td>Checking a reported request for off-platform payment</td><td><span class="na" aria-hidden="true">—</span><span class="visually-hidden">No change</span></td></tr>
    </tbody>
  </table>
</div>
```

```html
<!-- rendered: numeric (metrics, inside the chart card's disclosure) -->
<div class="table-wrap">
  <table class="table">
    <caption class="visually-hidden" id="t-enq">Enquiries by week</caption>
    <thead><tr><th scope="col">Week</th><th scope="col" class="num">Enquiries</th></tr></thead>
    <tbody><tr><th scope="row">Week of 31 Aug</th><td class="num">8</td></tr>…<tr><th scope="row">Week of 28 Sep</th><td class="num">12</td></tr><tr><th scope="row">Week of 5 Oct</th><td class="num">12</td></tr></tbody>
  </table>
</div>
```

```html
<!-- rendered: sortable with row actions and a selected row -->
<div class="table-wrap" tabindex="0" role="region" aria-labelledby="cat-cap">
  <table class="table">
    <caption class="visually-hidden" id="cat-cap">Caterers, sorted by date published, newest first</caption>
    <thead><tr><th scope="col" aria-sort="none"><button type="button">Caterer</button></th><th scope="col">Cuisine</th><th scope="col" aria-sort="descending"><button type="button">Published</button></th><th scope="col" class="num" aria-sort="none"><button type="button">Reviews</button></th><th scope="col"><span class="visually-hidden">Actions</span></th></tr></thead>
    <tbody>
      <tr><td>Coconut Drops Bakery</td><td>Jamaican</td><td>Fri 9 Oct</td><td class="num">0</td><td><div class="row-actions"><button class="btn btn--ghost btn--sm" type="button" aria-label="Open Coconut Drops Bakery">Open</button></div></td></tr>
      <tr aria-current="true"><td>Pelau House</td><td>Trinidadian &amp; Tobagonian</td><td>Mon 4 May</td><td class="num">23</td><td><div class="row-actions"><button class="btn btn--ghost btn--sm" type="button" aria-label="Open Pelau House">Open</button></div></td></tr>
    </tbody>
  </table>
</div>
```

```html
<!-- rendered: loading -->
<p class="visually-hidden" role="status">Loading audit entries</p>
<div class="table-wrap" aria-busy="true">
  <table class="table">
    <caption class="visually-hidden" id="audit-cap">Audit entries, newest first</caption>
    <thead><tr><th scope="col">When</th>…<th scope="col">Before → after</th></tr></thead>
    <tbody>
      <tr aria-hidden="true"><td><span class="skeleton skeleton--text"></span></td>… (one per column)</tr>
      … (8 rows)
    </tbody>
  </table>
</div>
```

The caption keeps its normal text while loading (D-7); the mock's "Audit
entries, loading" caption is replaced by the status line.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: audit log -->
<sh-table [caption]="t('audit.caption')" [columns]="auditColumns" region [busy]="loading()" [busyLabel]="t('audit.loading')">
  @for (e of entries(); track e.id) {
    <tr><td><time [attr.datetime]="e.atUtc">{{ e.atToronto }}</time></td><td>{{ e.operator }}</td><td><strong>{{ e.action }}</strong></td>
      <td>{{ e.target }}<div class="list__meta">{{ e.targetId }}</div></td><td>{{ e.reason }}</td>
      <td>@if (e.change) { {{ e.change }} } @else { <sh-table-na [label]="t('audit.noChange')"></sh-table-na> }</td></tr>
  }
</sh-table>

<!-- consumer: metrics table inside a chart card -->
<sh-table [caption]="t('metrics.enquiriesByWeek')" [columns]="[{ key: 'week', label: t('metrics.week') }, { key: 'value', label: t('metrics.enquiries'), numeric: true }]">
  @for (b of buckets(); track b.start) { <tr><th scope="row">{{ b.label }}</th><td class="num">{{ b.value }}</td></tr> }
</sh-table>

<!-- consumer: sortable with row actions -->
<sh-table [caption]="caption()" [columns]="columns" region [sort]="sort()" (sortChange)="resort($event)">
  <tr [attr.aria-current]="c.slug === open() ? 'true' : null">…
    <td><sh-table-row-actions><sh-button variant="ghost" size="sm" [ariaLabel]="t('table.openRow', { name: c.name })">{{ t('table.open') }}</sh-button></sh-table-row-actions></td></tr>
</sh-table>
```

The e2e page objects locate tables by `.table-wrap`, the region role and its
name, `caption`, `th[scope]`, `aria-sort`, `.num`, `.row-actions`, `.na`,
`aria-busy` and `tr[aria-hidden]` skeleton rows; those are part of the
contract. The arrow glyphs are free to change.

## Design

- Wrapper: `position: relative` (so visually hidden text inside a scrolling
  table never widens the page), `overflow-x: auto`, top rule
  `--border-width-hairline` in `--color-border-default`, fill
  `--color-bg-surface`.
- Table: `width: 100%`, `border-collapse: collapse`, `--text-body-sm`.
- Cells: padding `--space-4` / `--space-3` (dense `--space-2` / `--space-3`),
  `vertical-align: middle`, bottom rule `--border-width-hairline` in
  `--color-border-default`; the last body row has none.
- Column headers: `--text-label`, `--color-fg-muted`, `white-space: nowrap`,
  `position: sticky; top: 0` over `--color-bg-surface`.
- Row headers: `--text-body-sm` at `--font-weight-medium`, `--color-fg-default`,
  wrap, static.
- Numbers: `.num` right-aligned with `font-variant-numeric: tabular-nums`.
- Sort button: no button chrome (`all: unset`), inline-flex with `--space-1`
  before the arrow; shared focus ring (`--focus-ring-width`,
  `--focus-ring-offset`, `--color-focus-ring`).
- Row actions: `opacity` transition over `--duration-fast` with
  `--ease-standard`; buttons are [button](button.md) ghost `sm`
  (`--control-height-sm`, growing to `--target-comfortable` below 48rem).
- Empty marker: `--color-fg-subtle`.
- Skeleton bars: [skeleton](skeleton.md) `.skeleton--text`, shimmer over
  `--duration-loop`.
- Elevation and layer: none; the sticky header stays inside the wrapper.

Component tokens: none. The table reads semantic tokens directly.

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Surfaces never re-skin the table; a `details` or card around it keeps `--color-bg-surface`. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Wrapper, sticky header | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Rules | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Column header, caption | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Cells, row headers | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| ID line under a name | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Row hover | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Selected row | `--color-accent-subtle` | `--palette-pepper-50` | `--palette-pepper-950` |
| Empty marker | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Skeleton | `--color-bg-subtle` → `--color-bg-subtle-hover` | `--palette-stone-100` → `--palette-stone-200` | `--palette-stone-800` → `--palette-stone-700` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Cell text, row headers |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Column headers, caption, ID line |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Text on a hovered row |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Text on the selected row |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Empty marker (checked at the text minimum) |
| `--color-focus-ring` | `--color-bg-subtle` | 3:1 | Focus ring on a hovered row |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring on the region and sort buttons |

Forced colours: rules become `CanvasText` through `--color-border-default`,
the focus ring `Highlight`; the hover and selected fills may disappear, which
is acceptable because hover means nothing and the selected row is also
`aria-current`. `prefers-contrast: more` swaps rules to `--color-border-strong`
and muted text to `--color-fg-default` through the tokens.

## Responsive behaviour

- XS and SM (below 48rem): tables keep their columns. A table wider than the
  viewport scrolls sideways inside `.table-wrap`; the page itself never does.
  The audit log at 320 px scrolls inside its wrapper; the metrics, status and
  privacy tables fit at 320 px, and their row headers wrap ("Food handler
  certificate files" takes two lines).
- MD and up: the audit log fits from about 62rem; column headers stay on one
  line and long cells (reasons, targets) wrap.
- Row actions are always visible on touch screens (`@media (hover: none)`),
  and their small buttons grow to `--target-comfortable` (44 px) below 48rem
  with at least `--space-2` (8 px) between neighbours, in the row and to the
  next row's buttons (L2-065.1, the user's decision of 10 Oct 2026, D-10).
- Tables are never turned into cards on phones: operators compare across rows
  (design system).
- At 200 % zoom in a 1280 px window the audit log behaves as at 640 px: it
  scrolls inside its wrapper and every cell stays reachable.
- At 320 px nothing on the page scrolls horizontally or clips; every target is
  at least 44 × 44 CSS px on touch devices.

## Accessibility

### Role and pattern

A native `<table>` with `<caption>`, `<thead>` and `th scope` ([APG
Table](https://www.w3.org/WAI/ARIA/apg/patterns/table/)); sortable headers
follow the [sortable table
example](https://www.w3.org/WAI/ARIA/apg/patterns/table/examples/sortable-table/).
It is never `role="grid"`: Tab moves between the links and buttons inside, not
between cells. A scroll wrapper is `role="region"` named by the caption.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focuses the scroll region (when `region`), then sort buttons, links and row actions in reading order. Cells are not stops. |
| <kbd>←</kbd> / <kbd>→</kbd> | With the region focused, scroll the table sideways. |
| <kbd>↑</kbd> / <kbd>↓</kbd> | With the region focused, scroll the page (the wrapper has no vertical scroll). |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On a sort button, emits `sortChange`; on a row action, activates it. |

### Focus

- Row actions become visible as soon as anything in the row has focus
  (`:focus-within`), so a keyboard user never tabs onto an invisible button.
- After a sort, the page re-renders the rows but the header buttons are kept,
  so focus stays on the activated sort button.
- The sticky header never covers a focused cell control: the wrapper has no
  vertical scroll of its own, so the header only sticks while the wrapper is
  in view.
- The table never moves focus itself.

### Labelling

- Every table has a caption, visually hidden when a heading says the same.
  The region's name is the caption.
- Sort buttons are named by their header text; `aria-sort` gives the state.
- Row-action buttons name their row ("Open Pelau House"; the visible "Open"
  starts the name, WCAG 2.5.3), and the actions column has a hidden header
  ("Actions"), so no header cell is empty.
- The empty marker is `aria-hidden` with a hidden word, so screen readers say
  "No change", never "em dash".
- Times are `<time datetime>` in UTC, shown in `America/Toronto`.

### Announcements

The loading status line (`role="status"`) says `busyLabel` once. The result
count above the table ("9 entries from 3 Oct to 10 Oct 2026 · times in
Toronto") is the page's own live region. Sorting announces nothing beyond the
changed `aria-sort` on the focused header.

### Motion

Row actions fade in over `--duration-fast`, which `prefers-reduced-motion:
reduce` sets to 0.01 ms, so they appear at once. The skeleton shimmer stops
under reduced motion ([skeleton](skeleton.md)). Nothing else moves.

## Content and internationalisation

- Column headers are one or two words in sentence case: "When", "Operator",
  "Before → after", "Kept for".
- Times are relative to today when recent ("Today, 9:12 a.m."), otherwise
  "Fri 9 Oct, 4:30 p.m."; the page's result line says "times in Toronto".
- Numbers use Canadian separators: "22,670", "3,910"; percentages without a
  space, "82%"; money "$2,600".
- Name caterers and cuisines in full ("Trinidadian & Tobagonian"); IDs
  (`cat_0e6d21`) go under the name in `div.list__meta`, never as the only
  identifier.
- Row headers for weeks read "Week of 28 Sep"; for statuses, the L2-046 status
  names ("Pending review", "Changes requested").
- An empty cell is the muted dash with a hidden word, never "N/A", "null" or
  a bare "—".
- Translatable inputs: `caption`, `columns[].label`, `busyLabel`,
  `sh-table-na` `label`, and the row-action labels. Data: operator names,
  caterer names, reasons, IDs, figures.
- French headers run about 30 % longer; headers never wrap (`nowrap`), so a
  wider table scrolls inside its wrapper rather than squeezing.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the caption id, each
  header's `aria-sort`, the skeleton row list) are computed once, not in the
  template.
- No scroll, resize or intersection listeners: the region is declared by the
  consumer (D-5), and row-action reveal is pure CSS.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Table.ts`
  renders the audit log's 20-row page ("Wed 30 Sep, 9:00 a.m.", "Leah
  Mohammed", "Approve", "Ti Kay"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `AdminMetrics` (six 2-column tables plus "Caterers by
  status", and the 12-month daily case with 366 rows per table), `AuditLog`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: while loading, the real header and `skeletonRows` rows of
  one-line height hold the table's place; the first page of rows replaces them
  without moving the header.
- Weight: composes [skeleton](skeleton.md) and, through the slot,
  [button](button.md); no data-grid, virtual-scroll or sorting library.

## Acceptance criteria

### Rendering

- **AC-1** Given the audit log with 9 entries from 3 Oct to 10 Oct 2026, when the table renders, then one `div.table-wrap` holds one `table.table` whose caption is "Audit entries, newest first", whose header row has six `th scope="col"` cells "When", "Operator", "Action", "Target", "Reason" and "Before → after", and whose body has 9 rows in the order given. (L2-060)
- **AC-2** Given Leah Mohammed suspended Flying Fish Kitchen at `2026-10-09T20:30:00Z` with the reason "Food handler certificate expired on 30 Sep 2026", when its row renders, then the When cell is `<time datetime="2026-10-09T20:30:00Z">` showing "Fri 9 Oct, 4:30 p.m.", the action reads "Suspend", the target "Flying Fish Kitchen" has `cat_0e6d21` in a `.list__meta` line under it, and the last cell reads "Published → Suspended". (L2-060)
- **AC-3** Given Leah Mohammed's "Open enquiry" entry, which changed no value, when its "Before → after" cell renders, then it holds `span.na` "—" with `aria-hidden="true"` and a `span.visually-hidden` "No change", and a screen reader reads "No change", never "em dash". (L2-068)
- **AC-4** Given 12 enquiries created in the week of 2026-09-28, when an operator opens "Show as a table" under the Enquiries chart, then the row headed by `th scope="row"` "Week of 28 Sep" has a right-aligned `td.num` "12" in tabular figures. (L2-061)
- **AC-5** Given each of the six charts on the metrics page, when its "Show as a table" disclosure is open, then a screen reader finds a table named by its caption ("Listing page visits by week"), with 2 columns and 6 data rows, and reading the "Week of 28 Sep" row announces "Visits 4,240". (L2-061)
- **AC-6** Given the "Caterers by status on 10 Oct 2026" table under the heading "Caterers by status", when it renders, then its caption has `.visually-hidden`, its row headers "Published" … "Removed" are in `--color-fg-default` at medium weight and not sticky, and its column headers "Status" and "Caterers" are in `--color-fg-muted`. (L2-061)

### Variants

- **AC-7** Given the caterer list sorted by "Published", newest first, when it renders, then only the "Published" header has `aria-sort="descending"` and shows "↓", the "Caterer" and "Reviews" headers have `aria-sort="none"` and no arrow, and "Cuisine" has no `aria-sort`. (L2-069)
- **AC-8** Given that list with focus on the "Reviews" sort button, when the operator presses Enter, then `sortChange` emits `{ key: 'reviews', direction: 'descending' }`, and after the page passes that sort back, "Reviews" has `aria-sort="descending"`, "Published" has `aria-sort="none"`, and focus is still on the "Reviews" button. (L2-067)
- **AC-9** Given a row-actions column with an "Open" button for Pelau House, when the table is inspected, then the column header holds only `span.visually-hidden` "Actions" and the button's accessible name is "Open Pelau House"; axe reports no empty-header or button-name violation. (L2-066)
- **AC-10** Given a table with `density="dense"` and an actions column, when it renders, then it has no `.table--dense` class and its rows keep the default `--space-4` block padding. (L2-065)

### States

- **AC-11** Given the audit log is loading, when the table renders with `busy` and `busyLabel` "Loading audit entries", then the wrapper has `aria-busy="true"` and no `role="region"`, the six real column headers stay, the body holds exactly 8 `tr[aria-hidden="true"]` each with six `.skeleton--text` bars, and a `role="status"` line reading "Loading audit entries" sits before the wrapper. (L2-066)
- **AC-12** Given a mouse user at 1280 px, when the pointer moves over the Pelau House row, then the row fills with `--color-bg-subtle`, its "Open" button becomes visible, and the row's text keeps at least 4.5:1 contrast in both themes. (L2-069)
- **AC-13** Given the Pelau House row is the one whose detail is open beside the table, when it renders, then the `tr` has `aria-current="true"`, a `--color-accent-subtle` fill, no `aria-selected`, and its text keeps at least 4.5:1 contrast in both themes. (L2-069)

### Keyboard and focus

- **AC-14** Given the audit log at 360 px, when a keyboard user presses Tab into it, then focus lands on the wrapper, announced as region "Audit entries, newest first", and pressing → scrolls the table sideways until the "Before → after" column is visible. (L2-067)
- **AC-15** Given the caterer list at 1280 px with row actions hidden, when a keyboard user tabs from the last sort button, then focus moves through each row's "Open" button in row order, and each button is fully visible (opacity 1) while it has focus. (L2-067)
- **AC-16** Given keyboard focus on the scroll region, on a sort button, or on a row action in a hovered row, when it is displayed in either theme, then the `--color-focus-ring` ring has at least 3:1 contrast against the colours next to it. (L2-067)

### Screen readers

- **AC-17** Given the audit log default, long and loading states, the metrics page with every disclosure open, and the privacy notice, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any table. (L2-066)
- **AC-18** Given an "Open" row action in the caterer list, when the operator focuses it on a desktop, then a screen reader announces "Open Pelau House, button" and the table's column and row context. (L2-068)

### Theming

- **AC-19** Given the light and the dark theme, when the audit log renders, then cell text and the ID line have at least 4.5:1 contrast, column headers at least 4.5:1, and the empty marker at least 4.5:1 against `--color-bg-surface`. (L2-069)

### Responsive

- **AC-20** Given a 320 px viewport, when the audit log renders with its 6 columns, then the table scrolls inside `.table-wrap`, the page's `scrollWidth` equals its `clientWidth`, and the hidden "No change" text does not widen the page. (L2-064)
- **AC-21** Given a 320 px viewport, when the privacy notice's "How long we keep it" table renders, then it fits without a scrollbar, the row header "Food handler certificate files" wraps onto two lines, and nothing is clipped or overlapping. (L2-064)
- **AC-22** Given a 1280 px window at 200 % zoom, when the audit log renders, then every column is reachable by scrolling inside the wrapper and the page does not scroll horizontally. (L2-069)
- **AC-23** Given a 360 px touch viewport, when the caterer list renders, then every row's "Open" button is visible without hover, at least 44 × 44 CSS px, and at least 8 px from the next target. (L2-065)
- **AC-26** Given a 360 px touch viewport and a row with two actions ("Open" and "Suspend"), when the row is measured, then the two 44 px buttons are at least 8 px apart. (L2-065)

### Motion

- **AC-24** Given `prefers-reduced-motion: reduce`, when the pointer enters a row with actions and when the audit log is loading, then the actions appear with no visible fade and the skeleton bars do not shimmer. (L2-069)

### Performance

- **AC-25** Given an operator opens the metrics page with a 12-month range at daily granularity (six tables of 366 rows plus "Caterers by status"), when it loads, then every chart and its table are rendered within 3 seconds. (L2-061)

## Implementation notes

- Folder `frontend/projects/components/src/lib/table/`; files
  `table.component.*` (selector `sh-table`, class `TableComponent`),
  `table-row-actions.component.*` (`sh-table-row-actions`,
  `TableRowActionsComponent`) and `table-na.component.*` (`sh-table-na`,
  `TableNaComponent`); the `TableColumn` and `TableSort` types are exported
  from the folder's public API.
- Styles: the "Table" section of `components.css` moves into the component,
  class names unscoped (the consumer's `tr`, `th scope="row"`, `.num` and
  `.list__meta` sit in the projected body and must still match).
- Design-system catch-up for D-10: `.table .row-actions { display: flex; flex-wrap: wrap; gap: var(--space-2); }`.
- Design-system catch-up for D-2: add `.table tbody tr[aria-current="true"]`
  to the selected-row rule. The rendering shows the required look with a
  specimen-only style.
- Mock catch-up: the audit mock's bare "—" in "Before → after" becomes
  `sh-table-na` ("No change"), as the design system already fixed; the loading
  caption "Audit entries, loading" becomes the normal caption plus the status
  line (D-7).
- Composes [skeleton](skeleton.md) for loading rows and expects
  [button](button.md) (`ghost`, `sm`) in row actions. No CDK primitive is
  needed.
- The page, not the table, renders the result count, [pagination](pagination.md)
  and the [empty state](empty-state.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How is the "selected" row marked?* With `aria-current="true"` on the `tr`, never `aria-selected`. The design system notes `aria-selected` is valid only inside `role="grid"`, and the table is never a grid; it asks a plain table to mark the open row as current. `components.css` styles only `aria-selected` today, so it adds `aria-current` to the same rule.
- **D-3** *Are sorting, row actions, the selected row and dense density in the API although no mock uses them?* Yes. The design system specifies them for operator lists; adding them later would change `columns` and the outputs every consumer uses.
- **D-4** *Can a table with row actions be dense?* No. The design system says rows with actions keep the default density so buttons have room; the component ignores `dense` in that case rather than failing.
- **D-5** *Who decides whether the wrapper is a focusable region?* The consumer, through `region`. Measuring overflow at runtime would need a resize observer and differs between server and client renders; the audit log, the only table that can overflow at 320 px, sets it, as the mocks do.
- **D-6** *Does the table render empty, no-results and error states?* No. Every mock replaces the whole table with an [empty state](empty-state.md) and keeps the filters above it; a header over an empty body would be read as a table with no rows.
- **D-7** *Does the caption change while loading?* No. The mock renames it "Audit entries, loading", but the design system pairs `aria-busy` with a separate hidden status line; one stable caption keeps the region's name stable and avoids announcing "loading" twice.
- **D-8** *How many skeleton rows?* 8 by default, as in the audit loading mock; the input allows 1 to 20 for other tables.
- **D-9** *Does the table sort or format anything itself?* No. It reports `sortChange` and renders given rows; sorting belongs to the page's query (the audit log is newest first by L2-060) and formatting to the shared formatters.
- **D-10** *How far apart are adjacent row actions on phones?* At least 8 px: `.row-actions` is a wrapping flex row with a `--space-2` gap. L2-065.1 asks for 8 px between neighbouring targets and the user's decision of 10 Oct 2026 is that it wins over the design system's 4 px; `components.css` adds the gap (design-system catch-up).
