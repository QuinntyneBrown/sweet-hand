# Stat

| Field | Value |
|---|---|
| Selector | `sh-stat-grid` (the `dl.stat-grid` and its loading state), `sh-stat` (one figure: `div.stat`) |
| Library path | `frontend/projects/components/src/lib/stat/` |
| Status | planned |
| Traces to | L2-045, L2-051, L2-061, L2-064, L2-066, L2-067, L2-068, L2-069, L2-091 |
| Design system | [`stat.html`](../../design-system/components/stat.html) |
| Source mocks | [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/loading`](../../mocks/pages/dashboard/loading.html), [`pages/dashboard/name-pending`](../../mocks/pages/dashboard/name-pending.html), [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html), [`pages/admin-metrics/partial`](../../mocks/pages/admin-metrics/partial.html), [`pages/admin-metrics/loading`](../../mocks/pages/admin-metrics/loading.html), [`pages/admin-metrics/invalid`](../../mocks/pages/admin-metrics/invalid.html), [`notifications/profile-banner/success`](../../mocks/notifications/profile-banner/success.html) |
| Rendering | [`stat.html`](stat.html) |

## Purpose and scope

Stats answer "how am I doing?" at a glance: a quiet label above a large
number, optionally a signed change under it, in a grid with generous gaps. They
are flat: no card, no border, no icon. Two places use them:

- **Caterer dashboard**: four counts Kendra acts on — Unread enquiries 2, Open
  enquiries 3, Rating 4.7, Reviews 23.
- **Operator metrics**: four headline figures for the chosen range —
  Published caterers 60 (+4 in this range), Enquiries 71, Replied within 48
  hours 82%, Caterer page visits 39,700 — above the
  [bar charts](bar-chart.md).

Use a [bar chart](bar-chart.md) for change over time, a [table](table.md) for
many figures to compare, a [description list](description-list.md) for facts
that are not numbers, and a [count badge](badge.md) for unread counts in
navigation.

Out of scope:

- Computing the figures, the range, the delta and whether a change is good or
  bad: the domain layer and page decide them (D-3); the stat renders what it
  is given.
- The page subtitle that states the range ("31 Aug – 10 Oct 2026 · by week ·
  Toronto time"), the date-range form and "Export CSV".
- The chart card total ("71", "2,578 avg") beside each chart's heading: that is
  `.chart-card__total`, owned by [bar chart](bar-chart.md).
- The "Try again" for a figure that failed: the chart below it offers it.
- A whole range with no data: the page shows an [empty state](empty-state.md)
  ("No activity in this range").

## Usage

Inventory from a search of `docs/mocks` for `stat-grid` and `class="stat"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/dashboard/default`, `name-pending`; `notifications/profile-banner/success`, `persistent` (page behind) | grid of 4, no deltas | "Unread enquiries" 2, "Open enquiries" 3, "Rating" 4.7 (hidden "out of 5"), "Reviews" 23 | default | canvas |
| `pages/dashboard/loading` | grid, `busy`, 4 | — | loading | canvas |
| `pages/admin-metrics/default`, `invalid` | grid of 4, one delta | "Published caterers" 60 + good delta "+4 in this range"; "Enquiries" 71; "Replied within 48 hours" 82%; "Caterer page visits" 39,700 | default | canvas |
| `pages/admin-metrics/partial` | grid of 4, two figures not loaded | "Enquiries" and "Replied within 48 hours": dash + "Not loaded" | not loaded | canvas |
| `pages/admin-metrics/loading` | grid, `busy`, 4 | status "Loading metrics" | loading | canvas |
| `pages/admin-metrics/empty`, `error` | no grid: [empty state](empty-state.md) | — | empty, error | canvas |
| Design-system kit | single stat outside a grid; bad delta down ("−4 points in this range"); bad delta up ("Open reports" 9, "+3 in this range"); "No change in this range"; large "4,870" | — | default | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Grid** — `dl.stat-grid`: two columns, four from 62rem, `--space-8` row
   and `--space-6` column gaps; values step up to `--text-h1`.
2. **Stat** — `div.stat`: a column with `--space-1` gap.
3. **Label** — `dt.stat__label` (`span` outside a grid): what is counted,
   `--text-label`, `--color-fg-muted`.
4. **Value** — `dd.stat__value`: `--text-h2` alone, `--text-h1` in a grid,
   tabular figures. May end with hidden context ("out of 5").
5. **Delta (optional)** — `dd.stat__delta` with `--up` (good, callaloo) or
   `--down` (bad, sorrel): an `aria-hidden` arrow for direction, then the
   signed change and period in text. Neutral deltas take neither modifier.
6. **Not loaded / no value** — the value holds an `aria-hidden` dash and a
   hidden word; a visible `dd.text-caption` says "Not loaded" (or "No reviews
   yet").
7. **Loading** — `div.stat-grid[aria-busy="true"]` holding `div.stat[aria-hidden="true"]`
   skeletons (label bar, value bar of `--space-10`), plus a hidden status line.

Host: `sh-stat-grid` is `display: block` and renders the `dl` (or the loading
grid) and the status line. `sh-stat` is `display: contents` and renders the
`div.stat` with `dt`/`dd` inside a grid, or `span`s when used alone.

## API

### `sh-stat-grid` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `busy` | `boolean` | `false` | no | Renders `div.stat-grid[aria-busy="true"]` with `skeletonCount` skeleton stats and the `busyLabel` status line. |
| `busyLabel` | `string` | — | yes when `busy` | "Loading metrics", "Loading your dashboard". |
| `skeletonCount` | `number` | `4` | no | Whole number from 1 to 8. |
| `skeletonDelta` | `boolean` | `false` | no | Adds a delta bar to each skeleton (metrics). |

### `sh-stat` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | "Published caterers", "Replied within 48 hours". |
| `value` | `string \| null` | — | yes | The formatted figure ("39,700", "82%", "4.7", "0"). `null` renders the not-loaded form. Zero is a value, never `null`. |
| `valueContext` | `string \| null` | `null` | no | Hidden text after the value for screen readers (" out of 5"). |
| `missingLabel` | `string` | — | yes when `value` is `null` | The visible caption and hidden word for a missing figure: "Not loaded", "No reviews yet" (D-4). |
| `delta` | `string \| null` | `null` | no | The signed change with its period, formatted by the consumer ("+4 in this range", "−4 points in this range", "No change in this range"). |
| `direction` | `'up' \| 'down' \| null` | `null` | no | The arrow: up or down. `null` renders no arrow ("No change"). |
| `sentiment` | `'good' \| 'bad' \| null` | `null` | no | `good` adds `.stat__delta--up` (callaloo), `bad` adds `.stat__delta--down` (sorrel), `null` neither. Independent of `direction` (more reports is up but bad). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Stats are not interactive; a link to the inbox belongs to the section heading. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-stat-grid`: default | `sh-stat` elements | Rendered inside the `dl`; hidden while `busy`. |
| `sh-stat`: none | — | Every part is an input, so no icon, link or colour can be added (D-5). |

- Translation: `label`, `missingLabel`, `valueContext`, `delta`, `busyLabel`
  come from the resource files through the consumer (L2-064); values are
  formatted by the shared number formatter in `en-CA`.

## Variants and sizes

| Variant | How | Use for |
|---|---|---|
| In a grid | inside `sh-stat-grid` | Dashboard and metrics; value `--text-h1`. |
| Alone | `sh-stat` outside a grid (`div.stat` with `span` parts) | A single figure on its own; value `--text-h2`. |
| With delta, good | `delta` + `sentiment="good"` | "+4 in this range" on Published caterers. |
| With delta, bad | `delta` + `sentiment="bad"` | "−4 points in this range" on Replied within 48 hours; "+3 in this range" on Open reports. |
| Neutral delta | `delta`, no `sentiment` or `direction` | "No change in this range". |

| Size | Value type | Where |
|---|---|---|
| Alone | `--text-h2` | Outside a grid. |
| Grid | `--text-h1` (larger from 62rem with the type scale) | `dl.stat-grid`. |

There is no small stat; a figure in running text is written as text.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Label, large value | "Unread enquiries, 2" |
| With delta | `delta` | Arrow + signed text in callaloo or sorrel | "Published caterers, 60, +4 in this range"; arrow hidden |
| Zero | `value` "0" | "0", never a dash | "Unread enquiries, 0" |
| Large | long figure | Full number ("39,700", "4,870"), never abbreviated; never wraps | Full number |
| Not loaded | `value` `null` + `missingLabel` | Dash and the caption "Not loaded" | "Enquiries, Not loaded"; dash hidden |
| No reviews yet | `value` `null` + `missingLabel` "No reviews yet" | Dash and "No reviews yet" | "Rating, No reviews yet" |
| Loading | grid `busy` | Label and value skeletons in the final grid | Grid `aria-busy="true"`; skeletons hidden; status "Loading metrics" |
| Hover, focus, disabled | — | None: not interactive | — |

## Markup

```html
<!-- rendered: dashboard grid -->
<dl class="stat-grid">
  <div class="stat"><dt class="stat__label">Unread enquiries</dt><dd class="stat__value">2</dd></div>
  <div class="stat"><dt class="stat__label">Open enquiries</dt><dd class="stat__value">3</dd></div>
  <div class="stat"><dt class="stat__label">Rating</dt><dd class="stat__value">4.7<span class="visually-hidden"> out of 5</span></dd></div>
  <div class="stat"><dt class="stat__label">Reviews</dt><dd class="stat__value">23</dd></div>
</dl>
```

```html
<!-- rendered: metrics grid with a good delta and a figure that failed -->
<dl class="stat-grid">
  <div class="stat"><dt class="stat__label">Published caterers</dt><dd class="stat__value">60</dd><dd class="stat__delta stat__delta--up"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>+4 in this range</dd></div>
  <div class="stat"><dt class="stat__label">Enquiries</dt><dd class="stat__value"><span aria-hidden="true">–</span><span class="visually-hidden">Not loaded</span></dd><dd class="text-caption" aria-hidden="true">Not loaded</dd></div>
  …
</dl>
```

```html
<!-- rendered: single stat with a bad rise -->
<div class="stat"><span class="stat__label">Open reports</span><span class="stat__value">9</span><span class="stat__delta stat__delta--down"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 19V5m-6 6 6-6 6 6"/></svg>+3 in this range</span></div>
```

```html
<!-- rendered: loading -->
<p class="visually-hidden" role="status">Loading metrics</p>
<div class="stat-grid" aria-busy="true">
  <div class="stat" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--title"></span></div> … (4)
</div>
```

Skeleton widths (label 70 %, value 50 % × `--space-10`) come from a
`.stat-grid[aria-busy] .skeleton` rule, not inline styles (D-6).

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: metrics -->
<sh-stat-grid [busy]="loading()" [busyLabel]="t('metrics.loading')" skeletonDelta>
  <sh-stat [label]="t('metrics.published')" [value]="fmt(m.published)" [delta]="t('metrics.deltaRange', { signed: fmtSigned(m.publishedDelta) })"
      [direction]="dir(m.publishedDelta)" [sentiment]="m.publishedSentiment"></sh-stat>
  <sh-stat [label]="t('metrics.enquiries')" [value]="m.enquiries === null ? null : fmt(m.enquiries)" [missingLabel]="t('metrics.notLoaded')"></sh-stat>
</sh-stat-grid>

<!-- consumer: dashboard rating -->
<sh-stat [label]="t('dashboard.rating')" [value]="d.reviewCount ? fmt1(d.average) : null" [valueContext]="t('rating.outOf5')" [missingLabel]="t('reviews.none')"></sh-stat>
```

The e2e page objects locate stats by `.stat`, `.stat__label` text, the paired
`.stat__value`, `.stat__delta` and its modifier, and the grid's `aria-busy`;
those are part of the contract. The arrow path is free to change.

## Design

- Stat: flex column, `--space-1` gap. No border, background, shadow or icon.
- Label `--text-label`, `--color-fg-muted`; wraps (two lines for "Replied
  within 48 hours" on phones).
- Value `--text-h2` alone, `--text-h1` in a grid; `font-variant-numeric:
  tabular-nums`; never wraps; `--color-fg-default`.
- Delta `--text-body-sm`, inline-flex with `--space-1` gap; arrow
  `--icon-size-sm`; good `--color-success-fg`, bad `--color-danger-fg`,
  neutral `--color-fg-muted` (D-7).
- Grid: two columns, four from 62rem; gaps `--space-8` rows / `--space-6`
  columns.
- Motion: none; values never count up.
- Elevation and layer: none.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Value | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Delta, good | `--color-success-fg` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Delta, bad | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Delta, neutral; "Not loaded" | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Page | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Skeleton | `--color-bg-subtle` → `--color-bg-subtle-hover` | `--palette-stone-100` → `--palette-stone-200` | `--palette-stone-800` → `--palette-stone-700` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Label, neutral delta, "Not loaded" |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Value |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | Good delta |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Bad delta |

The value is never coloured. Forced colours: deltas lose their hue, which is
acceptable because the sign, the number, the period and the arrow remain.

## Responsive behaviour

- Below 62rem: two columns; labels may wrap to two lines; values never wrap.
- From 62rem: four columns in one row; the h1 value grows with the type
  scale.
- At 320 px a column is about 8rem: "39,700" at the h1 size fits. Figures are
  never abbreviated ("39.7k"); below 22.5rem grid values step down to
  `--text-h2` so seven-character figures ("4,870" with a delta, "125,400")
  fit (D-8).
- At 200 % zoom the grid keeps two columns and every figure stays readable;
  nothing scrolls horizontally. Not a touch target.

## Accessibility

### Role and pattern

A description list: `dl.stat-grid` with one `div.stat` per figure holding a
`dt` label, a `dd` value and an optional `dd` delta. Screen readers read
"Published caterers, 60, +4 in this range". A single stat outside a grid uses
`span` parts in a `div`, because a lone `dd` would keep the browser indent. Not
a heading structure.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on a stat. |

### Focus

None.

### Labelling

- Labels say what; the page subtitle says over what period.
- Hidden context where the number alone is ambiguous: "4.7 out of 5".
- Deltas carry sign and period in text; the arrow is `aria-hidden`.
- A missing figure reads its word ("Not loaded"), never "en dash" and never
  "0".

### Announcements

Only the loading status line. When a range changes, figures are replaced in
place; the page announces the new range, not each figure.

### Motion

None. Skeleton shimmer stops under reduced motion.

## Content and internationalisation

- Labels: short noun phrases in sentence case, units spelled out: "Replied
  within 48 hours", never "48 h".
- Numbers in Canadian English: "39,700", "82%", one decimal for ratings
  ("4.7"), money "$2,600".
- Deltas: sign, number, unit, period: "+4 in this range", "−4 points in this
  range" (percentages change in points, with a true minus sign), "No change in
  this range". Never a bare "+4".
- Averages say so: "2,578 avg" (chart totals).
- Translatable: `label`, `delta` template, `missingLabel`, `valueContext`,
  `busyLabel`. Data: the figures.
- French labels are longer ("Demandes non lues"); they wrap in their column.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the delta classes, the
  element choice, the missing form) are computed once, not in the template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Stat.ts`
  renders the metrics grid (60 with "+4 in this range", 71, 82%, 39,700);
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `AdminMetrics`, `CatererDashboard`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: tabular figures and skeletons of the final height keep
  the grid still when figures load or a range changes.
- Weight: [skeleton](skeleton.md) only.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's dashboard with 2 unread and 3 open enquiries, a 4.7 average and 23 reviews, when the stats render, then `dl.stat-grid` holds four `div.stat`: "Unread enquiries" 2, "Open enquiries" 3, "Rating" 4.7 and "Reviews" 23. (L2-045)
- **AC-2** Given the rating stat, when a screen reader reads it, then it says "Rating, 4.7 out of 5". (L2-068)
- **AC-3** Given Green Fig Catering has no published reviews, when its dashboard renders, then the "Rating" stat shows a dash and "No reviews yet", and no average is shown. (L2-051)
- **AC-4** Given the metrics range 31 Aug – 10 Oct 2026, when the stats render, then they read "Published caterers" 60 with "+4 in this range", "Enquiries" 71, "Replied within 48 hours" 82% and "Caterer page visits" 39,700. (L2-061)
- **AC-5** Given the "+4 in this range" delta is good, when it renders, then it has `.stat__delta--up`, an `aria-hidden` up arrow, and the sign and period in its text. (L2-069)
- **AC-6** Given "Open reports" rose by 3 (a bad rise), when the stat renders with `direction="up"` and `sentiment="bad"`, then the arrow points up and the delta has `.stat__delta--down`. (L2-069)

### States

- **AC-7** Given the enquiry figures fail to load while the others load (`pages/admin-metrics/partial`), when the grid renders, then "Enquiries" and "Replied within 48 hours" show a dash and "Not loaded", "Published caterers" and "Caterer page visits" show their figures, and no failed figure shows "0". (L2-091)
- **AC-8** Given a figure that failed, when a screen reader reads it, then it says "Enquiries, Not loaded" and not "en dash". (L2-068)
- **AC-9** Given a caterer with no unread enquiries, when the dashboard renders, then "Unread enquiries" shows "0", not a dash. (L2-045)
- **AC-10** Given the metrics page is loading, when the grid renders with `busy`, then `div.stat-grid` has `aria-busy="true"`, holds 4 `div.stat[aria-hidden="true"]` skeletons, and a `role="status"` line reads "Loading metrics". (L2-066)

### Keyboard and focus

- **AC-11** Given the metrics page, when a keyboard user tabs through it, then no stat is a tab stop. (L2-067)

### Screen readers

- **AC-12** Given the dashboard and metrics (default, partial, loading), when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any stat. (L2-066)

### Theming

- **AC-13** Given the light and the dark theme, when the metrics stats render, then labels, values, the good delta and a bad delta each have at least 4.5:1 contrast against the page, and no value is coloured. (L2-069)

### Responsive

- **AC-14** Given a 360 px viewport, when the metrics stats render, then they sit in 2 columns, "Replied within 48 hours" wraps to two lines, and "39,700" stays on one line without horizontal scrolling. (L2-064)
- **AC-15** Given a 1000 px viewport (LG), when the dashboard stats render, then all four sit in one row. (L2-045)
- **AC-16** Given a 1280 px window at 200 % zoom, when the metrics stats render, then every label and figure is visible and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-17** Given `prefers-reduced-motion: reduce`, when the metrics load and when a range changes, then the skeletons do not shimmer and the figures appear without counting up. (L2-069)

### Performance

- **AC-18** Given an operator opens the metrics page with a 12-month range at daily granularity, when it loads, then the four stats are rendered within 3 seconds and do not move when the charts below them arrive. (L2-061)

## Implementation notes

- Folder `frontend/projects/components/src/lib/stat/`; files
  `stat-grid.component.*` (`sh-stat-grid`) and `stat.component.*`
  (`sh-stat`).
- `sh-stat` reads whether it sits in a grid to choose `dt`/`dd` or `span`
  parts.
- Styles: the "Stat" section of `components.css` moves into the component,
  class names unscoped.
- Design-system catch-up: a neutral `.stat__delta` uses `--color-fg-muted`
  (D-7); skeleton sizes move to a `.stat-grid[aria-busy]` rule (D-6); the
  `--text-h2` step-down below 22.5rem for long values (D-8). The rendering
  shows them with specimen-only styles.
- Mock catch-up: "Replied within 48 h" becomes "Replied within 48 hours";
  deltas gain the arrow; the not-loaded dash gains its hidden word; the
  dashboard loading grid uses `aria-busy` instead of `aria-hidden`; "Rating"
  gains "out of 5".
- Composes [skeleton](skeleton.md). No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One input for arrow and colour, or two?* Two: `direction` and `sentiment`. The design system shows a bad rise (more open reports) with an up arrow and sorrel colour, which one input cannot express.
- **D-3** *Who decides whether a change is good or bad?* The domain layer, per metric; the stat renders `sentiment`. AGENTS.md keeps business rules out of UI components.
- **D-4** *What does the rating stat show with no reviews?* The not-loaded form with "No reviews yet" as its word. L2-051.2 says no average is shown without reviews, and a "0" would read as a zero rating.
- **D-5** *Can a stat hold an icon, link or coloured value?* No: there are no slots. The design system's stats are flat and never colour the value; a link belongs to the section heading.
- **D-6** *Inline skeleton sizes?* Replaced by a rule on the loading grid; sizes follow the design system (`--space-10` value bars), which also fixes the dashboard's 2.75rem drift.
- **D-7** *Colour of a neutral delta ("No change in this range")?* `--color-fg-muted`. The design system renders it without a modifier, which today inherits the value colour; muted keeps it quiet and above 4.5:1.
- **D-8** *What if a value is too long for a 320 px column?* Below 22.5rem every grid value steps down to `--text-h2` (`@media (max-width: 22.49rem) { .stat-grid .stat__value { font: var(--text-h2); } }`), the rule the design system proposed; one rule for all values keeps the row even, and figures are never abbreviated.
