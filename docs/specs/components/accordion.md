# Accordion

| Field | Value |
|---|---|
| Selector | `sh-accordion` (the group, renders `div.accordion`), `sh-accordion-item` (one row, renders `<details>`), `sh-disclosure` (one quiet `<details>` styled by its parent) |
| Library path | `frontend/projects/components/src/lib/accordion/` |
| Status | planned |
| Traces to | L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 |
| Design system | [`accordion.html`](../../design-system/components/accordion.html) |
| Source mocks | [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html), [`pages/admin-metrics/invalid`](../../mocks/pages/admin-metrics/invalid.html), [`pages/admin-metrics/partial`](../../mocks/pages/admin-metrics/partial.html), [`pages/privacy/default`](../../mocks/pages/privacy/default.html), [`pages/terms/default`](../../mocks/pages/terms/default.html), [`pages/about/default`](../../mocks/pages/about/default.html) |
| Rendering | [`accordion.html`](accordion.html) |

## Purpose and scope

An accordion tucks optional detail behind a short label so the screen stays
calm: the operator's weekly numbers behind each metrics chart ("Show as a
table"), or the longer answers on an information page ("Who sees it", "How
long we keep it"). Sweet Hand builds it on native `<details>` and `<summary>`,
so a row opens with no script, keeps working before the application has
loaded, and browser find-in-page searches and opens closed rows.

There are three shapes, all from this CRD: the **grouped accordion**
(`sh-accordion` holding `sh-accordion-item` rows, each opening on its own),
the **single-open group** (the same, with a shared `name` so opening one row
closes the others), and the **quiet disclosure** (`sh-disclosure`: one bare
`<details>` inside a component that styles it, used under every chart on the
operator metrics page). Use something else to move between screens
([side navigation](side-nav.md)), to switch between views of the same thing
([tabs](tabs.md)), for a "Show all 18 dishes" control that reveals more of a
list already on screen ([button](button.md) with `expanded`), or for content
everyone needs (allergens are [tags](tag.md) on the [dish](dish.md), never
folded away).

Out of scope:

- The chart card around the quiet disclosure (`.chart-card`, its heading,
  total and `.bar-chart`), and the decision to omit the disclosure when a
  chart fails to load: [bar chart](bar-chart.md) and the metrics page own them.
- The table inside the quiet disclosure (`.table-wrap`, `.table`, its caption):
  [table](table.md).
- The heading that names a group ("Your privacy"): the page renders it and
  passes its id to `labelledBy`.
- Forms inside panels. Editing never happens in a panel that opens on the page
  (AGENTS.md); "Edit details" opens a [dialog](dialog.md).
- Fetching panel content. Panels show what they are given; there is no
  loading or error state in the accordion itself.

## Usage

Inventory from `usage_inventory.py docs/mocks accordion "div|details|section"`
(no matches: no current screen uses the grouped accordion) and a search of
every `<details` and `<summary` in `docs/mocks/` (16 quiet disclosures on 3
screens). The grouped and single-open rows come from the design-system page,
whose copy is taken from the information pages; they are specified now so the
information pages need no API change when they adopt it (D-2).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-metrics/default`, `invalid` (6 charts each) | `sh-disclosure` inside `.chart-card`, closed | summary "Show as a table"; content `.table-wrap` > `table.table` with a visually hidden caption ("Enquiries by week", "Replied within 48 hours by week", "Listing page visits by week", "Caterer page visits by week", "Unique visitors by week", "New caterers published by week") and 6 weekly rows | closed, open, hover, focus | canvas |
| `pages/admin-metrics/partial` (4 of 6 charts) | `sh-disclosure`, closed; the 2 failed charts ("Enquiries", "Replied within 48 hours") render an alert and no disclosure | as above | closed, open; absent when the chart failed | canvas |
| Design-system grouped accordion (privacy notice copy) | `sh-accordion` with 3 `sh-accordion-item`, one `open` | "What we collect, and why", "Who sees it", "How long we keep it"; one paragraph each | closed, open, hover, focus | canvas; group on `--color-bg-surface` |
| Design-system single-open group (terms copy) | `sh-accordion` with `name="terms"`, first item `open` | "For customers", "For caterers", "Questions" | closed, open (one at a time) | canvas |
| Design-system code example (privacy page) | `sh-accordion` with `labelledBy="privacy-title"` and `name="privacy"` | heading "Your privacy" above; "Who sees it" | closed, open | canvas |

Not product markup: the `<details class="ds-example__code">` blocks and the
navigation `<details>` on design-system pages are documentation chrome.

## Anatomy

1. **Group** — `div.accordion` (`sh-accordion`). Hairline outline in
   `--color-border-default`, `--radius-md` corners, `--color-bg-surface`
   fill. With `labelledBy`, it carries `role="group"` and `aria-labelledby`.
2. **Row** — `<details>` (`sh-accordion-item`, or `sh-disclosure` for the quiet
   shape). The native `open` attribute is the expanded state; `name` joins a
   single-open group.
3. **Summary (the button)** — `<summary>`, the first child of the row. Plain
   text only, never a heading or another interactive element. At least
   `--target-comfortable` high and full width; it is the accessible name.
4. **Indicator** — the summary's `::after`: a "+" in `--color-fg-subtle` that
   turns 45° into "×" when open. Decorative; excluded from the accessible name
   (D-4). Not a DOM node.
5. **Panel** — `div.accordion__body` in a grouped row: `--space-4` inset on
   the sides and below, `--color-fg-muted` text. The quiet disclosure has no
   panel wrapper; its content (`.table-wrap`) follows the summary directly.
6. **Row separator** — a hairline `--color-border-default` top border on every
   row after the first (`.accordion details + details`). Never a gap or a
   shadow.

Hosts: `sh-accordion` is layout-transparent (`display: contents`) and renders
`div.accordion`. `sh-accordion-item` and `sh-disclosure` **are** the native
`<details>` element (an attribute selector such as `details[sh-accordion-item]`
or the chosen framework's equivalent), not a wrapper around it, so rows are
real DOM siblings and `.accordion details + details` and `.chart-card details`
match unchanged (D-3). Everything is light DOM.

## API

### `sh-accordion` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string \| null` | `null` | no | When set, every child item renders `name="{name}"` on its `<details>`, making the group single-open natively. Must be unique on the page ("privacy", "terms"). `null` renders no `name`: rows open independently. |
| `labelledBy` | `string \| null` | `null` | no | The id of the heading that names the group. When set, `div.accordion` renders `role="group"` and `aria-labelledby="{labelledBy}"`; when `null`, neither attribute is rendered. |

### `sh-accordion-item` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `summary` | `string` | — | yes | The summary text and accessible name ("Who sees it"). Plain text; it never changes with the open state. |
| `open` | `boolean` | `false` | no | Renders the native `open` attribute. Two-way: the component writes the native state back on every `toggle` (see `openChange`), so `[(open)]` stays true to what the user sees. |

### `sh-disclosure` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `summary` | `string` | — | yes | The summary text ("Show as a table"). |
| `open` | `boolean` | `false` | no | As for `sh-accordion-item`. |
| `name` | `string \| null` | `null` | no | Renders `name` for a standalone exclusive set. No mock uses it; it exists because the element supports it and a set of quiet disclosures may need it without an API change. |

- Boolean inputs accept the bare attribute (`<sh-accordion-item open>`).
- An item never takes its own `name`; it inherits the group's (D-5).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `openChange` (`sh-accordion-item`, `sh-disclosure`) | `boolean`, the new open state | The native `toggle` event fires: the user opened or closed the row by pointer, keyboard or find-in-page, a single-open group closed it because a sibling opened, or the consumer changed `open`. Emitted once per change, never when the state did not change. |

`sh-accordion` has no outputs; each item reports its own state.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-accordion` default | `sh-accordion-item` only | Items render in source order. Nothing else goes between them, or the separators break. |
| `sh-accordion-item` default | Flow content: one or two paragraphs, a list, links | Projected into `div.accordion__body`. No headings (D-6), no form fields, no nested accordion. |
| `sh-disclosure` default | Flow content, typically `.table-wrap` > `table.table` | Projected directly after the `<summary>`, no wrapper. |

- Content is in the DOM whether the row is open or closed (D-7). It is never
  created lazily on open.
- Translation: `summary` arrives from the consumer, who takes it from the
  resource files (L2-064); panel content is the consumer's. The components
  contain no user-facing strings.

## Variants and sizes

| Variant | Selector and markup | Use for |
|---|---|---|
| Grouped | `sh-accordion` > `sh-accordion-item`; `div.accordion` > `details` | Several related, optional answers that may all be read: the privacy notice's "What we collect, and why", "Who sees it", "How long we keep it". |
| Single-open group | Grouped, plus `name` on `sh-accordion` | Rows that are alternatives, where one open at a time reads best: "For customers", "For caterers", "Questions". |
| Quiet disclosure | `sh-disclosure` inside a styling parent (`.chart-card`) | One fold inside another component: "Show as a table" under every metrics chart. Small muted label, no outline, no hover fill. |

One size. The summary is at least `--target-comfortable` (44 px) with
`--space-4` padding in the group; the quiet disclosure keeps the same 44 px row
in `--text-body-sm`. The group's width is its container's; density comes from
the content, not a size modifier.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed (default) | no `open` | Summary row and "+" indicator; panel not rendered by the browser | Button, collapsed |
| Open | `open` | Indicator turned 45° to "×"; panel below the summary pushes later content down; nothing overlays | Button, expanded; panel content in the reading order after the summary |
| Hover (grouped) | `:hover` on `summary` | Summary fill `--color-bg-subtle`, fading over `--duration-fast`; the fill follows the group's rounded corners on the first and last row (D-8) | — |
| Hover (quiet) | `:hover` on `summary` | No change; text stays `--color-fg-muted`, `cursor: pointer` | — |
| Focus | `:focus-visible` on `summary` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out; none on mouse focus | Focused; name and state announced |
| Single-open sibling closes | another row with the same `name` opens | The previously open row closes in the same frame | Its state changes to collapsed; not announced (focus is on the row that opened) |
| Find-in-page match | browser find matches text in a closed panel | The row opens and the match is highlighted | Same as open |
| Absent | the consumer has nothing to show (a chart that failed) | Not rendered at all; there is no disabled, loading or empty state | Not in the tree |

`data-state="hover|focus"` on `summary` exists in `components.css` only for
documentation and mocks. The components never render it.

## Markup

```html
<!-- rendered: grouped, second row open -->
<div class="accordion">
  <details>
    <summary>What we collect, and why</summary>
    <div class="accordion__body"><p>Your name and email to run your account, and the event details you put in an enquiry so the caterer can reply.</p></div>
  </details>
  <details open>
    <summary>Who sees it</summary>
    <div class="accordion__body"><p>A caterer sees your name and your enquiry, not your email or phone, until you choose to share them.</p></div>
  </details>
  <details>
    <summary>How long we keep it</summary>
    <div class="accordion__body"><p>Enquiries and messages are kept for 3 years after the enquiry closes.</p></div>
  </details>
</div>
```

```html
<!-- rendered: single-open group, named by its heading -->
<h2 id="terms-title">Using Sweet Hand</h2>
<div class="accordion" role="group" aria-labelledby="terms-title">
  <details name="terms" open><summary>For customers</summary><div class="accordion__body"><p>Send honest enquiries, and tell the caterer if your plans change.</p></div></details>
  <details name="terms"><summary>For caterers</summary><div class="accordion__body"><p>Keep your food handler certificate current and your menu accurate.</p></div></details>
  <details name="terms"><summary>Questions</summary><div class="accordion__body"><p>Write to help@sweethand.example and a person will answer within 2 business days.</p></div></details>
</div>
```

```html
<!-- rendered: quiet disclosure under the "Enquiries" chart (admin-metrics) -->
<section class="chart-card" aria-labelledby="c-enquiries">
  <div class="chart-card__head"><h3 id="c-enquiries">Enquiries</h3><span class="chart-card__total">71</span></div>
  <div class="bar-chart" role="img" aria-label="Enquiries by week. 31 Aug: 8, 7 Sep: 11, 14 Sep: 15, 21 Sep: 13, 28 Sep: 12, 5 Oct: 12.">…</div>
  <div class="bar-chart__axis" aria-hidden="true">…</div>
  <details>
    <summary>Show as a table</summary>
    <div class="table-wrap">
      <table class="table">
        <caption class="visually-hidden">Enquiries by week</caption>
        <thead><tr><th scope="col">Week</th><th scope="col" class="num">Enquiries</th></tr></thead>
        <tbody><tr><th scope="row">Week of 31 Aug</th><td class="num">8</td></tr>…<tr><th scope="row">Week of 28 Sep</th><td class="num">12</td></tr><tr><th scope="row">Week of 5 Oct</th><td class="num">12</td></tr></tbody>
      </table>
    </div>
  </details>
</section>
```

No component adds ARIA to `<details>` or `<summary>`: no `role`,
`aria-expanded` or `aria-controls`, because the browser exposes the
disclosure button and its state natively. The only ARIA is the group's
optional `role="group"` + `aria-labelledby`.

Consumer templates (binding syntax illustrative; strings come from the
resource files):

```html
<!-- consumer: privacy page -->
<h2 id="privacy-title">{{ t('privacy.title') }}</h2>
<sh-accordion labelledBy="privacy-title">
  <sh-accordion-item [summary]="t('privacy.collect.q')"><p>{{ t('privacy.collect.a') }}</p></sh-accordion-item>
  <sh-accordion-item [summary]="t('privacy.who.q')" open><p>{{ t('privacy.who.a') }}</p></sh-accordion-item>
</sh-accordion>

<!-- consumer: single-open terms -->
<sh-accordion name="terms" labelledBy="terms-title">…</sh-accordion>

<!-- consumer: metrics chart card -->
<sh-disclosure [summary]="t('metrics.showAsTable')" [(open)]="tableOpen.enquiries">
  <div class="table-wrap"><table class="table">…</table></div>
</sh-disclosure>
```

The e2e page objects locate rows by role (`button` named by the summary text)
and by `.accordion`, `details`, `summary` and `.accordion__body`, so those
elements, their order and the absence of extra ARIA are part of the contract.
The indicator glyph is free to change as long as it stays out of the name.

## Design

- Group: border `--border-width-hairline` solid `--color-border-default`,
  radius `--radius-md`, fill `--color-bg-surface`. No shadow and no tint: Sweet
  Hand surfaces are flat.
- Summary (grouped): flex row, label left, indicator right, gap `--space-4`,
  padding `--space-4`, minimum height `--target-comfortable`; font
  `--text-label` at `--font-size-md`; `cursor: pointer`; the native marker is
  hidden (`list-style: none` and `::-webkit-details-marker`).
- Indicator: "+" at `--font-size-xl` (`--font-size-lg` in the quiet
  disclosure) in `--color-fg-subtle`; rotates 45° when open.
- Panel: padding `0 --space-4 --space-4`, colour `--color-fg-muted`, body type
  from the base styles; paragraphs capped at `--layout-measure` by the base
  `p` rule.
- Separator: `--border-width-hairline` solid `--color-border-default` between
  rows.
- Quiet disclosure (styled by `.chart-card summary`): `--text-body-sm` in
  `--color-fg-muted`, minimum height `--target-comfortable`, gap `--space-2`
  between label and indicator, no padding, no fill.
- Focus ring: the shared `--focus-ring-width` solid `--color-focus-ring` at
  `--focus-ring-offset`.
- Motion: hover fill over `--duration-fast`, indicator turn over
  `--duration-base`, both `--ease-standard`. The panel opens instantly; there
  is no height animation.
- Layer: none. Nothing sets a `z-index`.

Component tokens: none. The accordion reads semantic tokens directly (design
system, Theming); a re-skin overrides the semantic tokens on a theme scope.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Group fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Outline and separators | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Summary hover fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Summary label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Panel text, quiet disclosure label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Indicator | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Summary label |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Summary label, hover |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Panel text |
| `--color-fg-subtle` | `--color-bg-surface` | 3:1 | Indicator (a state indicator, non-text) |
| `--color-fg-subtle` | `--color-bg-subtle` | 3:1 | Indicator, hover |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Quiet disclosure label on the page |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring in the group |
| `--color-focus-ring` | `--color-bg-subtle` | 3:1 | Focus ring over a hovered row |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring on the quiet disclosure |

The outline (`--color-border-default`) is decorative: the summary text and
indicator identify each row, so the outline has no 3:1 minimum. In dark the
group fill and the canvas are both `--palette-stone-950`, so the outline is
what holds the group together; it must not be removed in dark.

`prefers-contrast: more` maps `--color-border-default` to the strong border
and the muted and subtle text to stronger roles, with no accordion rule.
Forced colours: the outline and separators become `CanvasText` through
`--color-border-default`, the focus ring `Highlight`; the hover fill is
dropped by the system, which is acceptable because hover carries no meaning.

## Responsive behaviour

- The layout does not change by breakpoint. The group fills its column at
  every width; below 48rem it runs edge to edge inside the page margin
  (`--layout-margin`), and the panel keeps its `--space-4` inset so text never
  touches the outline.
- From 48rem panel paragraphs are capped at `--layout-measure` by the base `p`
  rule even when the group is wider.
- Summary labels wrap onto more lines and never truncate; the indicator stays
  vertically centred on the right and never shrinks (`flex: none`, D-9).
- Quiet-disclosure tables scroll sideways inside `.table-wrap` rather than
  widening the page; the metrics tables have two columns and fit at 320 px.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom at a 1280 px
  window every summary and panel stays readable and operable; every summary
  is at least 44 CSS px high and full width, and successive summaries in a
  group are separated by the hairline, with no gap needed because the rows
  touch edge to edge and each row is one target (L2-065).

## Accessibility

### Role and pattern

Native `<details>` / `<summary>`, which browsers expose as a button with an
expanded or collapsed state — the [APG Disclosure
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/); a group is the
[APG Accordion](https://www.w3.org/WAI/ARIA/apg/patterns/accordion/) without
its optional arrow keys. No `role` or `aria-expanded` is added. With
`labelledBy`, the group is `role="group"` named by the section heading.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves between summaries in DOM order, and into an open panel's links and buttons after its summary. Closed panels contribute no tab stops. |
| <kbd>Enter</kbd> | Opens or closes the focused row. |
| <kbd>Space</kbd> | Opens or closes the focused row; the page does not scroll. |
| Arrow keys, <kbd>Home</kbd>, <kbd>End</kbd> | Not used (D-10). Rows are reached with Tab like any button. |

### Focus

- Focus stays on the summary when its row toggles; it never moves into the
  panel. In a single-open group, opening a row keeps focus on that row while
  the previous one closes.
- The ring shows on `:focus-visible` only.
- If focus was inside a panel that a single-open sibling closes (impossible
  by keyboard, possible by pointer), the browser moves focus to the body; the
  component does nothing extra, because the user's pointer action chose that.

### Labelling

- The summary text is the accessible name, exactly: "Show as a table", "Who
  sees it". The indicator is excluded (D-4).
- The label never states the state ("Hide table"); the expanded state is
  announced by the browser.
- "Show as a table" is announced inside its chart section ("Enquiries"
  region), which gives the context; six identical labels on one page are
  distinguished by their section names.
- Summary text is plain text: no heading element inside `<summary>`, because
  a heading inside a button role is flattened by some screen readers (D-6).

### Announcements

None. The components have no live region. Expanded and collapsed are exposed
natively and announced on toggle by screen readers.

### Motion

The indicator's 45° turn (`--duration-base`) and the hover fill
(`--duration-fast`) are the only motion; `prefers-reduced-motion: reduce`
sets both durations to 0.01 ms, so the indicator snaps. The panel never
animates its height.

## Content and internationalisation

- Summaries are short noun phrases or questions in sentence case, Canadian
  English, four or five words at most: "Who sees it", "How long we keep it",
  "Show as a table". Front-load the distinctive word: "For caterers", not
  "Information for caterers".
- The label is the same open or closed.
- Panels answer in one or two short paragraphs. A panel that needs its own
  headings deserves its own page.
- Never fold prices ("From $18 per person"), allergens, licensing statements
  or anything a person must agree to.
- Data in quiet-disclosure tables is formatted by the consumer: dates "Week of
  28 Sep", counts with thousands separators "22,670", shares "82%".
- Translatable inputs: `summary`. Data values: everything in the panel is the
  consumer's.
- French runs about 30 % longer ("Afficher sous forme de tableau"); the
  summary wraps and the indicator stays right.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the group's `name` passed to
  items, the group attributes) are computed once per input change, not in the
  template.
- No timers, observers or global listeners; one `toggle` listener per row.
  Opening and closing is done by the browser with no script on the critical
  path, so it works before hydration.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Accordion.ts`
  renders the six "Show as a table" disclosures of the metrics dashboard for
  31 Aug – 5 Oct (Enquiries 71, Replied within 48 hours 82%, Listing page
  visits 22,670, Caterer page visits 39,700, Unique visitors 2,578 avg, New
  caterers published 4), toggling each, and the three-row privacy group;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `MetricsDashboard`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: closed rows reserve exactly the summary height; opening
  pushes content down only as the user's direct response, which does not
  count toward Cumulative Layout Shift.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given the metrics dashboard for 31 Aug – 5 Oct with all six charts loaded, when it renders, then each of the six `.chart-card` sections contains exactly one `<details>` without `open` whose `<summary>` reads "Show as a table", and the table inside it holds the same six weekly values as the chart's text alternative. (L2-061)
- **AC-2** Given the "Enquiries" chart, when its disclosure is opened, then a table captioned "Enquiries by week" shows "Week of 28 Sep" with 12, matching the bar for that week, and the table is exposed to assistive technology with column headers "Week" and "Enquiries". (L2-061)
- **AC-3** Given the metrics dashboard where the "Enquiries" and "Replied within 48 hours" charts failed to load, when it renders, then those two sections show "This chart didn’t load" and contain no `<details>`, and the other four sections each contain one "Show as a table" disclosure. (L2-061)
- **AC-4** Given `sh-accordion` with three `sh-accordion-item` rows "What we collect, and why", "Who sees it" (`open`) and "How long we keep it", when it renders, then the DOM is one `div.accordion` whose three children are `<details>` elements in that order, only the second has `open`, each panel is a `div.accordion__body`, and no `role`, `aria-expanded` or `aria-controls` appears on any `<details>` or `<summary>`, and axe-core reports 0 violations for the group. (L2-066)
- **AC-5** Given `sh-accordion` with `labelledBy="privacy-title"` under the heading "Your privacy", when it renders, then `div.accordion` has `role="group"` and `aria-labelledby="privacy-title"` and its accessible name is "Your privacy"; given no `labelledBy`, then neither attribute is present. (L2-068)

### States

- **AC-6** Given the closed "Show as a table" disclosure under "Listing page visits", when an operator clicks its summary, then the `<details>` gains `open`, the table with "Week of 28 Sep" 4,240 becomes visible below the summary, the indicator shows "×", and `openChange` is emitted once with `true`; a second click closes it and emits `false`. (L2-061)
- **AC-7** Given the single-open group `name="terms"` with "For customers" open, when keyboard focus is on "For caterers" and Enter is pressed, then "For caterers" has `open`, "For customers" no longer has `open`, exactly one row is open, and each item emits `openChange` once (`true` and `false`). (L2-067)
- **AC-8** Given a grouped row at 1280 px, when it is hovered, then the summary fill becomes `--color-bg-subtle` and the label keeps at least 4.5:1 contrast against it; given the quiet "Show as a table" summary, when it is hovered, then its fill and colour do not change. (L2-069)

### Keyboard and focus

- **AC-9** Given the metrics dashboard, when an operator presses Tab from the date-range controls, then focus reaches each "Show as a table" summary in chart order, one stop each, and closed tables contribute no tab stops. (L2-067)
- **AC-10** Given keyboard focus on the "Who sees it" summary, when Enter is pressed, then the row opens and focus stays on the summary; when Space is pressed, then the row closes, focus stays on the summary and the page does not scroll. (L2-067)
- **AC-11** Given an open "Who sees it" row whose panel contains a link, when the user presses Tab from the summary, then focus moves to that link before the next summary "How long we keep it". (L2-067)
- **AC-12** Given any summary with keyboard focus in either theme, when it is displayed, then a `--focus-ring-width` ring in `--color-focus-ring` surrounds it `--focus-ring-offset` out with at least 3:1 contrast against the surface behind it, and clicking a summary with a mouse shows no ring. (L2-067)

### Screen readers

- **AC-13** Given the "Enquiries" chart's disclosure, when a screen reader reaches it closed and then after it is opened, then it is announced as a button named exactly "Show as a table", collapsed and then expanded, with no "+" or "×" in the name. (L2-068)
- **AC-14** Given the metrics page in each of its states (default, invalid, partial) with every disclosure closed and then every disclosure open, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)

### Theming

- **AC-15** Given the dark theme, when the privacy group renders, then its fill resolves to `--palette-stone-950`, its outline and separators to `--palette-stone-750`, the summary label has at least 4.5:1 and the panel text at least 4.5:1 contrast against the fill, and the indicator at least 3:1. (L2-069)
- **AC-16** Given the light and the dark theme, when "Show as a table" renders on the metrics page, then its label has at least 4.5:1 contrast against `--color-bg-canvas` and its indicator at least 3:1. (L2-069)

### Responsive

- **AC-17** Given a 360 px viewport, when any summary is measured, then it is at least 44 CSS px high and as wide as its group or chart card, and the whole row toggles on tap. (L2-065)
- **AC-18** Given a 320 px viewport, when the single-open group renders with the French summary "Pour les traiteurs et traiteuses" and an open "Show as a table" table, then the summary wraps with the indicator still on the right, the table stays inside `.table-wrap`, and the page does not scroll horizontally. (L2-064)
- **AC-19** Given a 1280 px window at 200 % zoom, when the metrics dashboard renders with the "Enquiries" table open, then every summary, the table and its six rows are visible and operable with no horizontal page scrolling. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when "Who sees it" is hovered and opened, then the fill change and the indicator's turn complete with no visible transition, and the panel appears with no height animation. (L2-069)

### Performance

- **AC-21** Given the `Accordion` perf-test scenario rendering the six metrics disclosures, when each is opened and closed, then the scenario does not regress against the base branch with `--fail-on-regression`, and on the metrics dashboard with a 12-month range at daily granularity all charts and their closed disclosures appear within 3 seconds. (L2-061)

## Implementation notes

- Folder `frontend/projects/components/src/lib/accordion/`; files
  `accordion.component.*` (`sh-accordion`, `AccordionComponent`),
  `accordion-item.component.*` (`sh-accordion-item`, `AccordionItemComponent`)
  and `disclosure.component.*` (`sh-disclosure`, `DisclosureComponent`). The
  group provides its `name` to its items through the framework's dependency
  injection or context; an item outside a group renders no `name`.
- Styles: the `.accordion` section of `components.css` moves into the
  component. The `.chart-card summary` rules stay with [bar chart](bar-chart.md),
  which styles the quiet disclosure; `sh-disclosure` ships no styles of its
  own.
- Design-system catch-up for D-4: change both indicators to
  `content: "+" / "";` (`.accordion summary::after` and
  `.chart-card summary::after`) so the glyph has empty alternative text.
- Design-system catch-up for D-8: round the first summary's top corners
  (`border-start-start-radius` and `border-start-end-radius`) and a closed
  last summary's bottom corners (`border-end-start-radius` and
  `border-end-end-radius`) with `--radius-md`, using the logical longhands so
  a single closed row gets all four, and the hover fill no longer covers the
  group's rounded corners.
- Design-system catch-up for D-9: add `flex: none` to
  `.accordion summary::after` so a long wrapping label cannot squeeze the
  indicator.
- Composes nothing. Composed by [bar chart](bar-chart.md) (the quiet
  disclosure under every chart card) and by the information pages.
- No CDK primitive is needed: the native element provides the behaviour.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Is the grouped accordion built although no current screen uses it?* Yes. The design system marks it stable with copy from the privacy, terms and about pages, and building the group now means those pages adopt it without an API change. It is specified in full and covered by criteria like the quiet disclosure.
- **D-3** *What is the host of an item?* The native `<details>` element itself (attribute selector), not a wrapper. `.accordion details + details` draws the separators and `.chart-card details` styles the quiet disclosure; a wrapper host would make the rows non-siblings and break the separators, and `display: contents` does not change the DOM that `+` reads.
- **D-4** *Is the "+" indicator part of the accessible name?* No. CSS generated content is included in the name computation, which would announce "Show as a table +" or "Who sees it ×". The design system calls the indicator decorative, so it renders with empty alternative text (`content: "+" / ""`); `components.css` catches up (see *Implementation notes*).
- **D-5** *Can an item set its own `name`?* No; the group sets it for all its items. Mixed names in one group would make some rows exclusive and others not, which no design shows.
- **D-6** *May a summary contain a heading?* No. The design system says to put plain text in the summary because a heading inside the button role is flattened by some screen readers; `summary` is therefore a string input, not a slot.
- **D-7** *Is panel content rendered while closed?* Yes, always. Find-in-page can then search and open closed rows, the disclosure works before scripts load, and the metrics tables cost six small tables. Lazy rendering would break both behaviours for no measurable gain.
- **D-8** *Does the hover fill respect the group's rounded corners?* Yes. Today the first summary's square fill covers the `--radius-md` corners of the outline; the required look rounds the fill on the first row's top corners and on the closed last row's bottom corners. The rendering shows it with a specimen-only style.
- **D-9** *What happens to the indicator beside a long, wrapping label?* It keeps its size (`flex: none`) and stays vertically centred on the right, as the design system's Responsive section says.
- **D-10** *Do arrow keys move between summaries?* No. The design system rules them out: rows are reached with Tab like every native button, which is what the element gives everywhere and what users of the native control expect.
- **D-11** *Is there a disabled, loading or empty row?* No. The design system says to leave a row out when it has nothing to show; the metrics page drops "Show as a table" from a failed chart and shows an [alert](alert.md) instead.
