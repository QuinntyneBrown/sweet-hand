# Bar chart

| Field | Value |
|---|---|
| Selector | `sh-chart-grid` (`.chart-grid`), `sh-chart-card` (`section.chart-card`: head, plot, axis, table disclosure, failed and loading states), `sh-bar-chart` (the `.bar-chart` plot and its `.bar-chart__axis`) |
| Library path | `frontend/projects/components/src/lib/bar-chart/` |
| Status | planned |
| Traces to | L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-091 |
| Design system | [`bar-chart.html`](../../design-system/components/bar-chart.html) |
| Source mocks | [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html), [`pages/admin-metrics/partial`](../../mocks/pages/admin-metrics/partial.html), [`pages/admin-metrics/loading`](../../mocks/pages/admin-metrics/loading.html), [`pages/admin-metrics/invalid`](../../mocks/pages/admin-metrics/invalid.html), [`pages/admin-metrics/empty`](../../mocks/pages/admin-metrics/empty.html), [`pages/admin-metrics/error`](../../mocks/pages/admin-metrics/error.html) |
| Rendering | [`bar-chart.html`](bar-chart.html) |

## Purpose and scope

Bar charts live on one screen, the operator metrics page, where Leah Mohammed
and Tomas Reyes check how Sweet Hand is doing over a date range. Each measure
gets a **chart card**: its title, its total for the range, ink bars (one per
day, week or month), a date axis and a "Show as a table" disclosure holding
the same figures as a [table](table.md). One series per chart, bars always
from zero; pepper marks only the current, still-running period.

Use a [stat](stat.md) for a single headline figure (four sit above the
charts) and a [table](table.md) when people need exact values. Never use a bar
chart for parts of a whole, for more than one series, or on customer and
caterer screens.

Out of scope:

- Computing the figures, buckets and totals, and which period is still
  running: the metrics service and page (L2-061, L2-062). The chart scales and
  draws what it is given.
- The date-range form, "Show by" (day, week, month), the "Choose a range of 24
  months or less" error and "Export CSV" (disabled until every figure has
  loaded, L2-063): the page.
- A range with no data and a failed metrics service: the page replaces every
  chart with one [empty state](empty-state.md) ("No activity in this range",
  "We couldn't load metrics").
- The table inside the disclosure: [table](table.md) owns its markup; the
  chart card feeds it the same figures.

## Usage

Inventory from a search of `docs/mocks` for `chart-card`, `bar-chart` and
`chart-grid`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-metrics/default`, `invalid` | grid of 6 cards, weekly, count scale | "Enquiries" 71: 8, 11, 15, 13, 12, 12; "Listing page visits" 22,670; "Caterer page visits" 39,700; "Unique visitors" "2,578 avg"; "New caterers published" 4 (zero weeks: 0, 0, 0) | default, table collapsed | canvas |
| same | percentage scale | "Replied within 48 hours" 82%: 75%, 82%, 80%, 85%, 83%, 88% | default | canvas |
| same, running week (design system) | current period accented, "so far" | "5 Oct so far: 12" | current | canvas |
| `pages/admin-metrics/partial` | 2 cards failed, 4 drawn | "Enquiries", "Replied within 48 hours": title, no total, danger [alert](alert.md) with no live role "This chart didn't load" / "The other figures are up to date." / "Try again"; the page adds one assertive summary alert "2 charts didn't load" (D-10) | failed | canvas |
| `pages/admin-metrics/loading` | grid, cards `busy` | title, total and plot skeletons; page status "Loading metrics" | loading | canvas |
| `pages/admin-metrics/empty`, `error` | no charts: the page's [empty state](empty-state.md) | — | empty, error | canvas |
| "Show by: Day" (design system; L2-061.4) | 41 bars for six weeks, up to 366 for 12 months | — | dense | canvas |

Every row is buildable with the API below.

## Anatomy

1. **Grid** — `div.chart-grid`: one column, two from 62rem, `--space-12`
   column gap.
2. **Card** — `section.chart-card[aria-labelledby]`: a column with
   `--space-4` gap, `--space-6` block padding and a hairline above; no box.
3. **Head** — `div.chart-card__head`: the `h3` title (names the card) and
   `span.chart-card__total` (`--text-h3`, tabular figures) on one baseline.
4. **Plot** — `div.bar-chart[role="img"][aria-label]`: 10rem tall, flex row
   of bars with `--space-2` gaps (`--dense`: `--space-0-5`), baseline
   `--border-width-hairline` in `--color-border-strong`.
5. **Bar** — `span.bar-chart__bar[style="--value: N%"]`: empty span, height a
   percentage of the scale maximum, ink, `--radius-xs` top corners;
   `--accent` for the running period.
6. **Axis** — `div.bar-chart__axis[aria-hidden="true"]`: one caption per bar
   (empty for thinned labels), `--text-caption`, `--color-fg-subtle`, never
   wrapping.
7. **Table disclosure** — `details > summary` "Show as a table" (44 px tall,
   muted, a "+" that turns to "×") and a [table](table.md): caption = the
   chart's label, "Week" row headers ("Week of 31 Aug"), a numeric column.
8. **Failed** — in place of plot, axis and disclosure: a danger
   [alert](alert.md) with "Try again"; the total is dropped.
9. **Loading** — `div.chart-card[aria-hidden="true"]` with title and total
   skeletons and one rect of plot-plus-axis height.

Host: `sh-chart-grid` is `display: block` and renders `div.chart-grid`;
`sh-chart-card` is `display: contents` and renders the `section` (so the grid
places it); `sh-bar-chart` is `display: contents` and renders the plot and
axis.

## API

### `sh-chart-card` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | The `h3` ("Replied within 48 hours"). |
| `total` | `string \| null` | `null` | no | `.chart-card__total`, formatted ("71", "82%", "2,578 avg"). Dropped while `failed`. |
| `label` | `string` | — | yes | The measure and unit for the image label and the table caption: "Enquiries by week". |
| `points` | `ChartPoint[]` | — | yes unless `busy` or `failed` | In time order. `{ axis: string; row: string; value: number; display: string }` — "31 Aug", "Week of 31 Aug", 8, "8". |
| `scale` | `'count' \| 'percent'` | `'count'` | no | `count` scales to the largest value (it draws at 100 %); `percent` draws on 0–100 % (D-3). |
| `current` | `boolean` | `false` | no | The last point is the still-running period: its bar gets `--accent` and its image-label entry ends with `soFarLabel`. |
| `soFarLabel` | `string` | — | yes with `current` | "so far". |
| `periodHeader`, `valueHeader` | `string` | — | yes | The table's column headers ("Week", "Enquiries"). |
| `tableLabel` | `string` | — | yes | The summary text, "Show as a table". |
| `tableOpen` | `boolean` | `false` | no | Opens the disclosure initially. |
| `failed` | `boolean` | `false` | no | Renders the failed alert (no live role, D-10) instead of plot, axis and table. |
| `failedTitle`, `failedText`, `retryLabel` | `string` | — | yes with `failed` | "This chart didn't load", "The other figures are up to date.", "Try again". |
| `busy` | `boolean` | `false` | no | Renders the loading card (`aria-hidden`). The page's single status line says "Loading metrics". |

### `sh-chart-grid` inputs

None.

### `sh-bar-chart` inputs

Used by the card; available on its own for a plot without a card.

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label`, `points`, `scale`, `current`, `soFarLabel` | as above | | yes | Renders the plot, its `aria-label` and the axis. |

Derived rules (computed, not inputs):

- `--value` = `value / max × 100` for `count`, `value` for `percent`,
  rounded to a whole percent; any value at zero or rounding below 2 % is drawn
  at 2 %, a visible stub (D-4).
- More than 14 points adds `.bar-chart--dense`; more than 31 also removes the
  gap (D-5); the axis then labels only every *n*-th point so at most 7 labels
  show, the others render as empty spans.
- The `aria-label` is "`label`. `axis`: `display`, …" with `soFarLabel` after
  the last axis date when `current` ("Enquiries by week. 31 Aug: 8, 7 Sep: 11,
  …, 5 Oct so far: 12.").

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `sh-chart-card` `retried` | `void` | "Try again" in the failed state is activated. |
| `sh-chart-card` `tableToggled` | `boolean` (open) | The disclosure opens or closes. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-chart-grid`: default | `sh-chart-card` elements | In display order. |
| `sh-chart-card`: none | — | Everything is an input, so the chart and its table always show the same figures (D-2). |

- Translation: `title`, `label`, `total` suffixes ("avg"), axis and row
  labels, headers, `tableLabel`, `soFarLabel` and the failed copy come from
  the resource files and formatters through the consumer (L2-064).

## Variants and sizes

| Variant | How | Use for |
|---|---|---|
| Count | `scale="count"` | Enquiries, visits, visitors, new caterers. |
| Percentage | `scale="percent"` | Replied within 48 hours. |
| Current period | `current` | The running week, month or day, always the last bar. |
| Dense | more than 14 points | Daily ranges. |
| In a grid | inside `sh-chart-grid` | The metrics page: one column, two from 62rem. |

One size: a 10rem plot filling the card's width. Bar width follows from the
number of points.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Ink bars on a baseline, axis captions | Region "Enquiries"; image "Enquiries by week. 31 Aug: 8, …" |
| Current period | `current` | Last bar in `--color-accent` | "… 5 Oct so far: 12." |
| Zero value | value 0 | 2 % stub | "7 Sep: 0" |
| Dense | more than 14 / 31 points | Narrow bars, smaller or no gaps, thinned axis | Image label still lists every value |
| Summary hover | `:hover` | Summary text in `--color-fg-default` | — |
| Summary focus | `:focus-visible` | Shared focus ring | "Show as a table, collapsed" |
| Expanded | `details[open]` | "+" turns 45° to "×"; the table shows | "expanded"; the table is readable |
| Failed | `failed` | Title only, danger alert with "Try again" | Alert has no live role; the page's one summary alert announces the failures (D-10); "Try again" focusable |
| Loading | `busy` | Title, total and plot skeletons of the final size | Card hidden; the page's status says "Loading metrics" |
| Empty, error | — | Never rendered by the chart; the page shows an [empty state](empty-state.md) | — |

## Markup

```html
<!-- rendered: count chart card -->
<section class="chart-card" aria-labelledby="c-enquiries">
  <div class="chart-card__head"><h3 id="c-enquiries">Enquiries</h3><span class="chart-card__total">71</span></div>
  <div class="bar-chart" role="img" aria-label="Enquiries by week. 31 Aug: 8, 7 Sep: 11, 14 Sep: 15, 21 Sep: 13, 28 Sep: 12, 5 Oct: 12."><span class="bar-chart__bar" style="--value: 53%;"></span><span class="bar-chart__bar" style="--value: 73%;"></span><span class="bar-chart__bar" style="--value: 100%;"></span><span class="bar-chart__bar" style="--value: 87%;"></span><span class="bar-chart__bar" style="--value: 80%;"></span><span class="bar-chart__bar" style="--value: 80%;"></span></div>
  <div class="bar-chart__axis" aria-hidden="true"><span>31 Aug</span><span>7 Sep</span><span>14 Sep</span><span>21 Sep</span><span>28 Sep</span><span>5 Oct</span></div>
  <details>
    <summary>Show as a table</summary>
    <div class="table-wrap"><table class="table"><caption class="visually-hidden">Enquiries by week</caption>
      <thead><tr><th scope="col">Week</th><th scope="col" class="num">Enquiries</th></tr></thead>
      <tbody><tr><th scope="row">Week of 31 Aug</th><td class="num">8</td></tr>…</tbody></table></div>
  </details>
</section>
```

```html
<!-- rendered: percentage with the running week -->
<div class="bar-chart" role="img" aria-label="Replied within 48 hours by week. 31 Aug: 75%, 7 Sep: 82%, 14 Sep: 80%, 21 Sep: 85%, 28 Sep: 83%, 5 Oct so far: 88%."><span class="bar-chart__bar" style="--value: 75%;"></span>…<span class="bar-chart__bar bar-chart__bar--accent" style="--value: 88%;"></span></div>
```

```html
<!-- rendered: failed -->
<section class="chart-card" aria-labelledby="c-replied">
  <div class="chart-card__head"><h3 id="c-replied">Replied within 48 hours</h3></div>
  <div class="alert alert--danger"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><div class="alert__body"><p class="alert__title">This chart didn't load</p><p>The other figures are up to date.</p><div class="alert__actions"><button class="btn btn--sm" type="button">Try again</button></div></div></div>
</section>
```

```html
<!-- rendered: loading card -->
<div class="chart-card" aria-hidden="true"><div class="chart-card__head"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div><span class="skeleton skeleton--rect"></span></div>
```

Skeleton sizes (title 40 %, total 15 %, rect `calc(--space-32 + --space-16)`)
move from inline styles to a `.chart-card[aria-hidden="true"]` rule (D-6).

Consumer template (binding syntax illustrative):

```html
<sh-chart-grid>
  @for (m of measures(); track m.key) {
    <sh-chart-card [title]="t('metrics.' + m.key)" [total]="m.total" [label]="t('metrics.byPeriod', { measure: t('metrics.' + m.key), period: granularity() })"
        [points]="m.points" [scale]="m.scale" [current]="m.running" [soFarLabel]="t('metrics.soFar')"
        [periodHeader]="t('metrics.period.' + granularity())" [valueHeader]="t('metrics.col.' + m.key)" [tableLabel]="t('metrics.showTable')"
        [busy]="loading()" [failed]="m.failed" [failedTitle]="t('metrics.chartFailed')" [failedText]="t('metrics.othersOk')" [retryLabel]="t('action.tryAgain')"
        (retried)="reload(m.key)"></sh-chart-card>
  }
</sh-chart-grid>
```

The e2e page objects locate charts by `.chart-card` and its heading, the
plot's role and `aria-label`, `.bar-chart__bar` count and `--value`,
`--accent`, `.chart-card__total`, the summary and the table; those are part
of the contract.

## Design

- Grid: one column, two from 62rem, `0 --space-12` gap.
- Card: `--space-4` gap, `--space-6` block padding, top hairline
  `--color-border-default`, `min-width: 0`.
- Head: space-between, baseline-aligned, `--space-3` gap; title `h3`; total
  `--text-h3`, tabular figures.
- Plot: 10rem, `--space-2` gaps (`--space-0-5` dense, none above 31 bars),
  baseline `--border-width-hairline` `--color-border-strong`.
- Bar: `flex: 1`, `min-width: 0`, height `var(--value)`, `--color-fg-default`,
  `--radius-xs` top corners; accent `--color-accent`.
- Axis: `--text-caption`, `--color-fg-subtle`, `--space-2` gaps, captions
  centred, `nowrap`, clipped if wider than their bar.
- Summary: `--text-body-sm`, `--color-fg-muted`, at least
  `--target-comfortable` tall, "+" in `--font-size-lg` `--color-fg-subtle`
  rotating 45° over `--duration-base` when open.
- No animation of bars; no chart palette; no elevation.

Component tokens: none; `--value` is the per-bar knob.

| Token | Aliases | Overridden by |
|---|---|---|
| `--value` | a percentage set inline per bar | The component only |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Bar, title, total | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Current-period bar | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Baseline | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Axis | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Card divider | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Summary | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Page | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Bars, title, total |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Current-period bar |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Baseline |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Axis labels |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | "Show as a table" |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Summary focus ring |

Ink and pepper bars differ by colour only, so the running period is also named
"so far" in the image label and is always the last bar. Forced colours: bars
must stay visible — `components.css` adds `forced-color-adjust: none` to
`.bar-chart__bar` with `CanvasText` (accent `Highlight`) (D-7).

## Responsive behaviour

- Below 62rem: one chart per row, full width; six weekly bars are about 2.5rem
  wide at 320 px.
- From 62rem: two columns; heads stay on one line and wrap only for a very
  long title.
- Dense: 15–31 bars use `--space-0-5` gaps; more than 31 use none, so 41 daily
  bars fit a 320 px phone and 366 fit a desktop card; the axis shows at most 7
  labels.
- Axis labels never wrap; clipped labels are acceptable because every value
  is in the image label and the table.
- At 200 % zoom in a 1280 px window the grid is one column and every chart and
  table stays usable; nothing scrolls horizontally. The summary is a 44 px
  target.

## Accessibility

### Role and pattern

Each card is a `section` named by its `h3`, so charts are reachable by heading
or region. The plot is `role="img"` with an `aria-label` listing every period
and value; bars are empty spans; the axis is `aria-hidden`. The disclosure's
table is the full equivalent ([W3C complex
images](https://www.w3.org/WAI/tutorials/images/complex/)), with a caption and
row headers. The disclosure is a native `details`/`summary`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | From chart to chart via each "Show as a table" summary (and "Try again" in a failed chart). Bars are not focusable. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Open or close the table; activate "Try again". |

### Focus

The summary takes the shared focus ring and is at least 44 px tall. After
"Try again", focus stays on the card's heading region: the component moves
focus to the new summary when the chart reloads (D-8).

### Labelling

- The image label starts with the measure and the period unit ("Enquiries by
  week"), then every value; a running period is marked "so far".
- The table caption repeats the label; the summary reads "Show as a table".

### Announcements

The card's failed alert has no live role. The page renders one assertive
summary [alert](alert.md) ("2 charts didn't load") however many cards failed
(D-10). Loading is announced once by the page's status line.

### Motion

Bars never grow or animate in; the "+" rotation runs over `--duration-base`,
which reduced motion zeroes.

## Content and internationalisation

- Titles name the measure in sentence case, units spelled out: "Replied
  within 48 hours", "Caterer page visits".
- Totals match the stat above when both exist (71 enquiries, 39,700 visits);
  averages say "avg" ("2,578 avg").
- Axis labels are short dates ("31 Aug"); table rows "Week of 31 Aug"; the
  page subtitle gives the range and time zone.
- Numbers: comma thousands, "%" without a space.
- Translatable: titles, the label template, period words, headers, "Show as a
  table", "so far", the failed copy. Data: the figures.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (scale maximum, each bar's
  `--value`, the aria-label, axis thinning, table rows) are computed once per
  `points` change, not in the template.
- Bars are plain spans with one inline custom property; no SVG, canvas or
  chart library.
- The table renders only when the disclosure first opens (`details` content
  is created lazily), so a 12-month daily page renders 6 × 366 bars and no
  hidden table rows on load (D-9).
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/BarChart.ts`
  renders the "Enquiries" card (8, 11, 15, 13, 12, 12; total 71); iterations
  in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `AdminMetrics` (six weekly cards),
  `AdminMetricsDaily12Months` (six cards × 366 bars), `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the loading card reserves plot-plus-axis height; a failed
  card keeps its title row.
- Weight: composes [table](table.md), [alert](alert.md), [button](button.md)
  and [skeleton](skeleton.md).

## Acceptance criteria

### Rendering

- **AC-1** Given known test data with 12 enquiries created in the week of 2026-09-28, when an operator views enquiries by week for 31 Aug – 10 Oct 2026, then the "Enquiries" card's fifth bar has the image-label entry "28 Sep: 12" and its table row "Week of 28 Sep" reads 12. (L2-061)
- **AC-2** Given the weekly enquiries 8, 11, 15, 13, 12, 12, when the chart renders with `scale="count"`, then the bars have `--value` 53 %, 73 %, 100 %, 87 %, 80 %, 80 % and the total reads 71. (L2-061)
- **AC-3** Given the replied shares 75 %, 82 %, 80 %, 85 %, 83 %, 88 %, when the chart renders with `scale="percent"`, then the first bar is drawn at 75 % of the plot height, not scaled to the best week. (L2-061)
- **AC-4** Given the week of 5 Oct is still running on Sat 10 Oct, when the chart renders with `current`, then only the last bar has `.bar-chart__bar--accent` and the image label ends "5 Oct so far: 88%.". (L2-069)
- **AC-5** Given "New caterers published" with weeks 1, 0, 2, 0, 1, 0, when the chart renders, then the zero weeks draw a 2 % stub and the image label reads "7 Sep: 0". (L2-068)
- **AC-6** Given each chart on the metrics page, when "Show as a table" is opened, then a table captioned with the chart's label lists every period as a row header with its value, the same figures as the image label. (L2-061)

### States

- **AC-7** Given the enquiry data fails while visits load (`pages/admin-metrics/partial`), when the "Enquiries" and "Replied within 48 hours" cards render with `failed`, then each keeps its title, has no total, and shows the danger alert "This chart didn't load" / "The other figures are up to date." with "Try again" and no live role, the page shows exactly one `role="alert"` summary "2 charts didn't load", and the other four charts draw normally. (L2-091)
- **AC-8** Given a failed card, when the operator activates "Try again", then `retried` is emitted once and, after the data loads, focus is on that card's "Show as a table" summary. (L2-067)
- **AC-9** Given the metrics page is loading, when the cards render with `busy`, then each is an `aria-hidden` card with title, total and plot skeletons of the final height, and no `role="img"` is present. (L2-066)
- **AC-10** Given "Show by: Day" for 31 Aug – 10 Oct 2026 (41 days), when the chart renders, then it has 41 bars with `.bar-chart--dense` and no gap, at most 7 axis labels, and an image label listing all 41 values. (L2-061)

### Keyboard and focus

- **AC-11** Given the metrics page, when a keyboard user tabs through the charts, then focus visits each card's "Show as a table" summary in order, Enter opens and closes it, and no bar is focusable. (L2-067)
- **AC-12** Given keyboard focus on a summary, when it is displayed in either theme, then the focus ring has at least 3:1 contrast and the summary is at least 44 CSS px tall. (L2-067)

### Screen readers

- **AC-13** Given the "Enquiries" card, when a screen reader reaches it, then it announces region "Enquiries", then image "Enquiries by week. 31 Aug: 8, 7 Sep: 11, 14 Sep: 15, 21 Sep: 13, 28 Sep: 12, 5 Oct: 12.", and the axis is not read. (L2-068)
- **AC-14** Given the metrics page in default, partial and loading states with every disclosure open and closed, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any chart. (L2-066)

### Theming

- **AC-15** Given the light and the dark theme, when a chart renders, then bars and the total have at least 4.5:1, the current-period bar and the baseline at least 3:1, and the axis labels and summary at least 4.5:1 against the page. (L2-069)

### Responsive

- **AC-16** Given a 320 px viewport, when the metrics page renders, then charts sit one per row, six weekly bars fit, the card heads do not overflow, and the page does not scroll horizontally. (L2-064)
- **AC-17** Given a 1000 px viewport (LG), when the metrics page renders, then the chart cards sit in two columns. (L2-064)
- **AC-18** Given a 360 px touch viewport, when the summaries are measured, then each is at least 44 CSS px tall and spans the card width. (L2-065)
- **AC-19** Given a 1280 px window at 200 % zoom, when the metrics page renders, then every chart and its table are usable and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when charts load and a disclosure opens, then no bar grows and the "+" changes to "×" without a visible rotation. (L2-069)

### Performance

- **AC-21** Given an operator opens the dashboard with a 12-month range at daily granularity, when it loads, then all six charts (366 bars each) appear within 3 seconds. (L2-061)

## Implementation notes

- Folder `frontend/projects/components/src/lib/bar-chart/`; files
  `chart-grid.component.*`, `chart-card.component.*`,
  `bar-chart.component.*`; the `ChartPoint` type is exported.
- Styles: the "Bar chart" section of `components.css` (`.chart-grid`,
  `.chart-card`, `__head`, `__total`, its `summary` rules, `.bar-chart`,
  `__bar`, `--dense`, `--accent`, `__axis`) moves into the component, class
  names unscoped.
- Design-system catch-up: `.bar-chart--dense:has(> :nth-child(32)) { gap: 0; }`
  and the matching dense axis rules (D-5); the loading-card skeleton rule (D-6); forced-colours bars (D-7). The
  rendering shows them with specimen-only styles.
- Mock catch-up: the replied chart uses a 0–100 % scale (the mock scaled to
  the best week); the running week becomes the accent bar with "so far".
- Composes [table](table.md) (two columns, numeric), [alert](alert.md)
  (danger, with a [button](button.md) `sm`) and [skeleton](skeleton.md). No
  CDK primitive: the disclosure is native `details`.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Does the consumer write the table itself?* No. The card builds the table from the same `points`, so the chart and its accessible equivalent can never disagree (L2-061.5).
- **D-3** *How are percentages scaled?* On 0–100 %, as the design system decided; the mock scaled shares to the best week, which made 88 % look like 100 %.
- **D-4** *How is a zero drawn?* As a 2 % stub, as the mocks draw "New caterers published", so a zero week reads as a measured zero rather than a missing bar; the image label and table give the exact 0. Bars still start at zero.
- **D-5** *What about more than 31 bars (12 months by day, required by L2-061.4)?* Draw every bar with no gap (up to 366 bars), with at most 7 axis labels and the exact values in the table, per the user's decision of 10 Oct 2026. L2-061 lets the operator choose daily granularity over 12 months and requires the charts to appear, so the design system's suggestion to cap at 31 bars and aggregate is not followed; a gapless dense plot shows the shape. The axis follows the bars' gap, and in a dense chart its few labels start at their bar and may run over the empty neighbouring slots instead of being clipped (`.bar-chart--dense + .bar-chart__axis span { overflow: visible; text-align: left; }`).
- **D-6** *Inline skeleton heights?* Replaced by a rule on the loading card; the height stays plot plus axis.
- **D-7** *Do bars survive forced colours?* Yes: bars take `CanvasText` (accent `Highlight`) with `forced-color-adjust: none`; otherwise the background-coloured bars would disappear in Windows high contrast.
- **D-8** *Where does focus go after "Try again" succeeds?* To the card's new "Show as a table" summary, because the button that had focus no longer exists; it is the card's first control.
- **D-9** *Is the hidden table rendered on load?* No. It is created when the disclosure first opens, which keeps the 12-month daily page within its 3-second budget; the image label already gives every value to assistive technology.
- **D-10** *How are failed charts announced?* Aligned with [alert](alert.md) D-5 and the user's ruling on the conflict between the two CRDs: each failed card shows "This chart didn't load" with no live role, and the page renders one assertive summary alert, "2 charts didn't load". Two assertive alerts would interrupt each other; the per-card alert keeps the card's own "Try again".
