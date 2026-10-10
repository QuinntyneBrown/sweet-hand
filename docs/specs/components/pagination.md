# Pagination

| Field | Value |
|---|---|
| Selector | `sh-pagination` (renders `<nav class="load-more">` with `p.result-count` and `ul.pagination`) |
| Library path | `frontend/projects/components/src/lib/pagination/` |
| Status | planned |
| Traces to | L2-002, L2-003, L2-031, L2-036, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 |
| Design system | [`pagination.html`](../../design-system/components/pagination.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterers/long`](../../mocks/pages/caterers/long.html), [`pages/caterers/edge`](../../mocks/pages/caterers/edge.html), [`pages/caterers/filtered`](../../mocks/pages/caterers/filtered.html), [`pages/caterers/offline`](../../mocks/pages/caterers/offline.html), [`pages/inbox/long`](../../mocks/pages/inbox/long.html), [`pages/dashboard-enquiries/long`](../../mocks/pages/dashboard-enquiries/long.html), [`pages/admin-queue/long`](../../mocks/pages/admin-queue/long.html), [`pages/admin-caterers/long`](../../mocks/pages/admin-caterers/long.html), [`pages/admin-changes/long`](../../mocks/pages/admin-changes/long.html), [`pages/admin-audit/long`](../../mocks/pages/admin-audit/long.html) |
| Rendering | [`pagination.html`](pagination.html) |

## Purpose and scope

Pagination sits under a long list: a quiet "Showing 1–24 of 60" line and a row
of round page links with a previous and a next arrow. It appears under the
caterer listing (24 per page, L2-002) and under long inbox, enquiry, queue,
caterer, change and audit lists (20 per page, L2-031). Every page is a real
link whose URL carries the page number and the list's filters, so Back,
bookmarks and shared links return to the same page (L2-003). The current page
is pepper: it is the "you are here" in the list of pages.

A list that fits on one page shows no pagination at all — the filtered listing
("2 caterers") ends after its cards. There is no infinite scroll and no "Load
more": both break the URL contract and push the [footer](footer.md) away (the
wrapper is called `.load-more` for historical reasons only). Use
[tabs](tabs.md) for views of one object and a form flow for steps.

Out of scope:

- Fetching the page, the cards or rows, their skeletons while a page loads
  and the "Loading caterers" announcement: the list and the page own them
  ([caterer card](caterer-card.md), [table](table.md), [list](list.md)).
- The result count at the top of the page (`role="status"`) and the heading
  above the list.
- Moving focus to the results heading and updating the document title
  ("Caterers, page 2 of 3 — Sweet Hand") after navigation: the page does it
  on route change (D-7).
- Validating the `page` query parameter (a page past the end shows page 1,
  L2-002.5): the server and router.

## Usage

Inventory from a parse of every `<nav class="load-more">` in `docs/mocks/`
(12 distinct configurations) and `usage_inventory.py docs/mocks pagination "ul"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/default`, `signed-in`, `out-of-area`, `postal-invalid` | page 1 of 3, 24 per page | "Showing 1–24 of 60"; 1 2 3 | current, previous disabled (D-3), next | canvas, under the grid |
| `pages/caterers/long` | page 3 of 3 | "Showing 49–60 of 60" | previous, current, next disabled (D-3) | canvas |
| `pages/caterers/edge` | page 1 of 54 (1,284 caterers) | "Showing 1–24 of 1,284" | first page with a trailing gap | canvas |
| `pages/caterers/offline` | page 1 of 3, offline | "Showing 1–24 of 60" | pages not saved for offline are unavailable (D-6) | canvas, under the offline banner |
| `pages/caterers/filtered` | 1 page | "2 caterers" at the top only | no pagination rendered | canvas |
| `pages/inbox/long` (Marcia), `pages/dashboard-enquiries/long` (Kendra) | page 1 of 2 / 3, 20 per page, `compact` in the LG list column | "Showing 1–20 of 25", "Showing 1–20 of 48" | current, next | inbox list column |
| `pages/admin-queue/long`, `admin-caterers/default`, `admin-changes/default`, `dialogs/revert-change/*` (page behind) | page 1 of 2–4, 20 per page | "Showing 1–20 of 34", "Showing 1–20 of 68", "Showing 1–20 of 24" | current, next | canvas |
| `pages/admin-caterers/long` | page 12 of 244 | "Showing 221–240 of 4,870 published" | gaps on both sides | canvas |
| `pages/admin-changes/long` | page 6 of 6 | "Showing 101–118 of 118" | last page, leading gap | canvas |
| `pages/admin-audit/long` | page 3 of 65 | "Showing 41–60 of 1,284" | near the start, trailing gap | canvas |

Drift corrected by the component: the mocks omit the previous arrow on the
first page and the next arrow on the last (D-3), show page 2 inside a gap on
`admin-changes/long` (D-4), and append a noun to one count ("of 4,870
published", D-8).

## Anatomy

1. **Wrapper** — `nav.load-more[aria-label]`: a centred column under the
   list, `--space-4` between count and row, `--space-16` above.
2. **Result count (optional)** — `p.result-count`: "Showing 25–48 of 60" in
   `--text-body-sm`, `--color-fg-muted`. Not a live region here.
3. **Row** — `ul.pagination`: centred, wrapping, `--space-2` gap, no bullets.
4. **Arrow** — `li > a` with a chevron `svg.icon`, named "Previous page" /
   "Next page". At an end it is `a[role="link"][aria-disabled="true"]` with no
   `href`.
5. **Page link** — `li > a`: a 44 px (`--control-height-md`) circle, the
   numeral in `--text-label`, `--color-fg-muted`, named "Page 2".
6. **Current page** — `a[aria-current="page"]`: `--color-fg-accent` numeral,
   `--font-weight-bold`, a `--border-width-hairline` ring in `currentColor`.
7. **Gap** — `li > span.pagination__gap[aria-hidden="true"]`: "…" in
   `--color-fg-subtle`, `--control-height-md` wide.
8. **Width-specific items** — `li.pagination__wide` (hidden below 36rem) and
   `li.pagination__narrow` (hidden from 36rem), so one server-rendered row
   shows the right arrangement at every width (D-5).

Host: `sh-pagination` is layout-transparent (`display: contents`); the `nav`
is in the light DOM.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `page` | `number` | — | yes | The current page, 1-based. The consumer has already clamped it (L2-002.5). |
| `pageCount` | `number` | — | yes | Total pages. When it is 1 or less the component renders nothing (D-2). |
| `hrefFor` | `(page: number) => string` | — | yes | Builds each link's URL, keeping the list's filters: `/caterers?region=city-of-toronto&page=2` (L2-003). |
| `label` | `string` | — | yes | `aria-label` of the `nav`: "Pagination". |
| `summary` | `string \| null` | `null` | no | The formatted count line, "Showing 1–24 of 60". `null` renders no `p.result-count`. |
| `previousLabel` | `string` | — | yes | "Previous page". |
| `nextLabel` | `string` | — | yes | "Next page". |
| `pageLabel` | `(page: number) => string` | — | yes | Accessible name of a page link: `n => 'Page ' + n` in English, from the resource files. Must contain the visible numeral (WCAG 2.5.3). |
| `compact` | `boolean` | `false` | no | Uses the narrow arrangement at every width (the inbox list column at LG is 20–26rem wide). No `.pagination__wide` / `__narrow` items are rendered. |
| `unavailablePages` | `number[]` | `[]` | no | Pages that cannot be opened now (offline, not saved): rendered `aria-disabled="true"` without `href`. The current page is never unavailable. |

- Boolean inputs accept the bare attribute (`<sh-pagination compact>`).

### Which items render

```ts
// Pages shown in one arrangement. `narrow` drops the neighbours of the current page.
function arrangement(page: number, count: number, narrow: boolean): (number | 'gap')[] {
  const shown = new Set([1, count, page, ...(narrow ? [] : [page - 1, page + 1])]
    .filter(p => p >= 1 && p <= count));
  const sorted = [...shown].sort((a, b) => a - b);
  const out: (number | 'gap')[] = [];
  sorted.forEach((p, i) => {
    const prev = sorted[i - 1];
    // a single hidden page is shown, never "…" — always when wide, and when narrow only if that keeps the row to three page links (D-4, D-10)
    const fill = !narrow || sorted.length === 2;
    if (prev !== undefined && p - prev === 2 && fill) out.push(prev + 1);
    if (prev !== undefined && p - prev > (fill ? 2 : 1)) out.push('gap');
    out.push(p);
  });
  return out;
}
```

- `compact`: render `arrangement(page, pageCount, true)` only.
- Otherwise render the union of the wide (`narrow = false`) and narrow
  (`narrow = true`) arrangements in page order. A page or gap present in both
  gets no extra class; one only in the wide arrangement gets
  `li.pagination__wide`; one only in the narrow arrangement gets
  `li.pagination__narrow`. A gap is identified by the page it follows.
- The previous and next arrows are always rendered, before and after the
  pages (D-3).

Examples (‹ and › are the arrows):

| Page / count | From 36rem | Below 36rem |
|---|---|---|
| 1 / 3 | ‹ **1** 2 3 › | ‹ **1** 2 3 › |
| 6 / 54 | ‹ 1 … 5 **6** 7 … 54 › | ‹ 1 … **6** … 54 › |
| 3 / 65 | ‹ 1 2 **3** 4 … 65 › | ‹ 1 … **3** … 65 › |
| 12 / 244 | ‹ 1 … 11 **12** 13 … 244 › | ‹ 1 … **12** … 244 › |
| 6 / 6 | ‹ 1 … 5 **6** › | ‹ 1 … **6** › |

### Outputs

None. Every item is a link; navigation is the router's. The component
intercepts nothing, so it works without JavaScript.

### Content slots

None.

- Translation: `label`, `summary`, `previousLabel`, `nextLabel` and
  `pageLabel` come from the resource files (L2-064.4); the summary is
  formatted by the consumer with an en dash and thousands separators. The
  numerals and "…" are not copy.

## Variants and sizes

The variants are arrangements of the same row:

| Arrangement | When |
|---|---|
| Few pages | `pageCount` ≤ 4 (wide) or ≤ 3 (narrow): every page, no gap |
| Gaps | More pages: first, last, current (and its neighbours from 36rem), with "…" for each run of two or more hidden pages |
| Compact | `compact`: the narrow arrangement at every width |
| None | `pageCount` ≤ 1: nothing rendered |

One size: every link is a 44 px circle (`--control-height-md`) at every
breakpoint, which meets the phone target without a compact size.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Numeral `--color-fg-muted`, transparent circle | Link "Page 2" |
| Hover | `:hover` | Fill `--color-bg-subtle`, numeral `--color-fg-default`, over `--duration-fast` | — |
| Focus | `:focus-visible` | Shared ring `--focus-ring-offset` outside the circle, outside the current ring too | Focused |
| Active | `:active` | Same as hover | — |
| Current | `aria-current="page"` | `--color-fg-accent` numeral and hairline ring, `--font-weight-bold`; hover fill `--color-accent-subtle` | "Page 2, current page" |
| Arrow disabled | first or last page → `role="link"`, `aria-disabled="true"`, no `href` | 50 % opacity, no pointer events | Not in the tab order; announced as a dimmed link when read |
| Page unavailable | `unavailablePages` | Same as a disabled arrow | Dimmed link "Page 2" |
| Gap | between shown pages | "…" in `--color-fg-subtle` | Hidden |
| Loading next page | consumer | Row unchanged; the list shows skeletons | — |
| Single page | `pageCount` ≤ 1 | Nothing | Nothing |

`data-state="hover|focus"` exists in `components.css` only for documentation
and mocks. The component never renders it.

## Markup

```html
<!-- rendered: listing, page 1 of 3 -->
<nav class="load-more" aria-label="Pagination">
  <p class="result-count">Showing 1–24 of 60</p>
  <ul class="pagination">
    <li><a role="link" aria-disabled="true" aria-label="Previous page"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg></a></li>
    <li><a href="/caterers?page=1" aria-current="page" aria-label="Page 1">1</a></li>
    <li><a href="/caterers?page=2" aria-label="Page 2">2</a></li>
    <li><a href="/caterers?page=3" aria-label="Page 3">3</a></li>
    <li><a href="/caterers?page=2" aria-label="Next page"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></a></li>
  </ul>
</nav>
```

```html
<!-- rendered: page 6 of 54, wide and narrow arrangements in one row -->
<ul class="pagination">
  <li><a href="/caterers?page=5" aria-label="Previous page">…</a></li>
  <li><a href="/caterers?page=1" aria-label="Page 1">1</a></li>
  <li><span class="pagination__gap" aria-hidden="true">…</span></li>
  <li class="pagination__wide"><a href="/caterers?page=5" aria-label="Page 5">5</a></li>
  <li><a href="/caterers?page=6" aria-current="page" aria-label="Page 6">6</a></li>
  <li class="pagination__wide"><a href="/caterers?page=7" aria-label="Page 7">7</a></li>
  <li><span class="pagination__gap" aria-hidden="true">…</span></li>
  <li><a href="/caterers?page=54" aria-label="Page 54">54</a></li>
  <li><a href="/caterers?page=7" aria-label="Next page">…</a></li>
</ul>
```

```html
<!-- rendered: page 3 of 65 (audit log): narrow-only gaps and wide-only pages and gap -->
<li><a href="/admin/audit?page=1" aria-label="Page 1">1</a></li>
<li class="pagination__narrow"><span class="pagination__gap" aria-hidden="true">…</span></li>
<li class="pagination__wide"><a href="/admin/audit?page=2" aria-label="Page 2">2</a></li>
<li><a href="/admin/audit?page=3" aria-current="page" aria-label="Page 3">3</a></li>
<li class="pagination__narrow"><span class="pagination__gap" aria-hidden="true">…</span></li>
<li class="pagination__wide"><a href="/admin/audit?page=4" aria-label="Page 4">4</a></li>
<li class="pagination__wide"><span class="pagination__gap" aria-hidden="true">…</span></li>
<li><a href="/admin/audit?page=65" aria-label="Page 65">65</a></li>
```

```html
<!-- rendered: offline, page 2 not saved -->
<li><a role="link" aria-disabled="true" aria-label="Page 2">2</a></li>
```

Consumer template (binding syntax illustrative):

```html
<sh-pagination [page]="page()" [pageCount]="pageCount()" [hrefFor]="pageHref"
  [label]="t('pagination.label')" [summary]="t('pagination.summary', { from, to, total })"
  [previousLabel]="t('pagination.previous')" [nextLabel]="t('pagination.next')" [pageLabel]="pageName"></sh-pagination>
```

The e2e page objects locate the row by the `nav` name, links by name ("Page
2", "Next page") and the current page by `aria-current="page"`, so these
names, attributes and the classes above are part of the contract. The chevron
paths are free to change.

## Design

- Wrapper: flex column, centred, `--space-4` gap, `--space-16` above.
- Count: `--text-body-sm`, `--color-fg-muted`.
- Row: `--space-2` gap, `flex-wrap: wrap`, centred.
- Link: `--control-height-md` circle (`min-width` and `height`), `--space-2`
  inline padding for three- and four-digit numbers, `--radius-full`,
  `--border-width-hairline` transparent border, `--text-label`; current
  `--font-weight-bold` with the border in `currentColor`.
- Arrow icon `--icon-size-md`.
- Gap `--space-4` wide with `calc(-1 * --space-1)` inline margins, centred: it is not a target, so it takes less room (D-10).
- Elevation none; layer none.
- Motion: background colour over `--duration-fast` with `--ease-standard`;
  page changes never animate or smooth-scroll.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Page numeral, count | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Hover fill / numeral | `--color-bg-subtle` / `--color-fg-default` | `--palette-stone-100` / `--palette-stone-950` | `--palette-stone-800` / `--palette-stone-100` |
| Current numeral and ring | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Current hover fill | `--color-accent-subtle` | `--palette-pepper-50` | `--palette-pepper-950` |
| Gap | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Numerals and count |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Hovered page |
| `--color-fg-accent` | `--color-bg-canvas` | 4.5:1 | Current numeral and ring |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Current page, hovered |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The current page is never a solid pepper fill, which would read as a primary
button. It is shown by colour, weight, ring and `aria-current`, not colour
alone (L2-069.5). Disabled arrows are exempt from the minimums (inactive).

## Responsive behaviour

- Below 36rem (XS): the narrow arrangement — first, last and the current page,
  with "…" for any hidden run — so the longest row (‹ 1 … 6 … 54 ›, five
  targets and two gaps) is at most 284 px and fits the 288 px a 320 px screen
  leaves inside its margins (D-10).
- From 36rem (SM up): the wide arrangement adds one neighbour either side.
- `compact` keeps the narrow arrangement at every width (the inbox list column
  at LG).
- The row wraps and stays centred instead of scrolling if a long arrangement
  or a large zoom ever needs it; nothing scrolls horizontally at 320 px or at
  200 % zoom.
- Links are 44 × 44 CSS px with 8 px (`--space-2`) between them at every width
  (L2-065.1, D-9).

## Accessibility

### Role and pattern

`<nav aria-label="Pagination">` containing a list of links; the current page
carries `aria-current="page"`. No APG widget applies; plain links work without
JavaScript.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the enabled arrows and the page links. Disabled arrows and unavailable pages have no `href` and are skipped. |
| <kbd>Enter</kbd> | Opens that page. |

### Focus

- The shared ring sits `--focus-ring-offset` outside the circle; on the
  current page it shows outside the pepper ring, so the two never merge.
- After navigation the page moves focus to the results heading (D-7).

### Labelling

- Page links are named by `pageLabel`: "Page 2" (the visible "2" is in the
  name, WCAG 2.5.3). Arrows are "Previous page" and "Next page".
- The gap is `aria-hidden`; the jump from "Page 1" to "Page 5" says enough.
- The count line is plain text, not a live region; the page's top count
  announces changes (L2-067.5).

### Announcements

None from this component.

### Motion

Only the hover fill transitions (`--duration-fast`), which
`prefers-reduced-motion: reduce` zeroes.

## Content and internationalisation

- Count: "Showing 1–24 of 60" — an en dash with no spaces, thousands with a
  comma ("of 1,284"), no noun (the top count says "60 caterers") (D-8).
- Arrows: "Previous page", "Next page" — never "Prev", "Older" or "More".
- Never "Load more", "See more caterers" or "Page 2 of 3" as the only
  control. The numeral has no "Page" prefix on screen.
- French: "Affichage de 1 à 24 sur 60", "Page précédente"; the count line
  wraps if needed, the row does not change.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (both arrangements, their
  merge, every `href`) are computed once per input change, not in the
  template.
- No listeners, timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Pagination.ts`
  renders the listing's page 6 of 54 ("Showing 121–144 of 1,284") and steps
  `page` from 1 to 54; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Listing`, `Inbox`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: both arrows always render, so the numbers do not move
  sideways between pages; the row is server-rendered with the list, so nothing
  shifts after load.
- Weight: no dependencies beyond the framework; two inline chevrons.

## Acceptance criteria

### Rendering

- **AC-1** Given the listing of 60 published caterers on page 1, when the pagination renders, then it is `nav.load-more` named "Pagination" with `p.result-count` "Showing 1–24 of 60" and `ul.pagination` holding a disabled "Previous page" (`role="link"`, `aria-disabled="true"`, no `href`), "Page 1" with `aria-current="page"`, "Page 2", "Page 3" and "Next page" linking to page 2. (L2-002)
- **AC-2** Given page 3 of 3, when the pagination renders, then the count reads "Showing 49–60 of 60", "Next page" is disabled, "Previous page" links to page 2, and the page links occupy the same horizontal positions as on page 1. (L2-002)
- **AC-3** Given the listing filtered to City of Toronto (31 caterers, 2 pages) on page 1, when Marcia follows "Page 2" and then presses Back, then page 2's URL kept the region filter with `page=2`, and Back restores page 1 with the same filter. (L2-003)
- **AC-4** Given the listing filtered to Jamaican and Scarborough (2 caterers), when the page renders, then no `nav.load-more` and no `ul.pagination` exist. (L2-002)
- **AC-5** Given Marcia has 25 enquiries, when her inbox renders page 1, then the pagination reads "Showing 1–20 of 25" with "Page 1" current and "Page 2" linking to the remaining 5. (L2-031)
- **AC-6** Given the component source, when it is scanned for user-facing string literals, then none are found. (L2-064)

### Arrangements

- **AC-7** Given 1,284 caterers (54 pages) on page 6 at 768 px, when the row renders, then it shows ‹ 1 … 5 6 7 … 54 ›, and each "…" is `span.pagination__gap` with `aria-hidden="true"`. (L2-002)
- **AC-8** Given the same page at 320 px, when the row renders, then it shows ‹ 1 … 6 … 54 › on one line, 284 CSS px wide at most, and the page does not scroll horizontally. (L2-064)
- **AC-9** Given the audit log of 1,284 events (65 pages) on page 3, when the row renders at 768 px, then it shows ‹ 1 2 3 4 … 65 › with the single page 2 shown rather than "…"; at 320 px it shows ‹ 1 … 3 … 65 › on one line with no horizontal scrolling. (L2-064)
- **AC-10** Given Kendra's enquiries list at 1280 px in the inbox's list column with `compact`, on page 6 of 12, when the row renders, then it shows ‹ 1 … 6 … 12 › and no `.pagination__wide` item exists. (L2-036)

### States

- **AC-11** Given the current page in the light theme, when it renders, then it has `aria-current="page"`, a `--color-fg-accent` numeral and hairline ring and `--font-weight-bold`, so it differs from other pages by weight and ring as well as colour. (L2-069)
- **AC-12** Given the listing open offline with page 2 not saved, when the row renders with `unavailablePages` [2], then "Page 2" has `aria-disabled="true"` and no `href`, is drawn at 50 % opacity, and the saved page 1 stays usable. (L2-091)

### Keyboard and focus

- **AC-13** Given page 1 of 3, when Marcia tabs through the row, then focus visits "Page 1", "Page 2", "Page 3" and "Next page" in order and skips the disabled "Previous page"; Enter on "Page 2" opens page 2. (L2-067)
- **AC-14** Given keyboard focus on the current page in either theme, when it is drawn, then the focus ring is visible outside the pepper ring with at least 3:1 contrast against the canvas. (L2-067)

### Screen readers

- **AC-15** Given page 2 of 3, when the row is read, then the links are named "Previous page", "Page 1", "Page 2" (current page), "Page 3" and "Next page", and each page link's name contains its visible numeral. (L2-068)
- **AC-16** Given the first, a middle (with gaps) and the last page at XS and XL, when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-17** Given the dark theme, when page 2 is current, then its numeral and ring resolve to `--palette-pepper-300` with at least 4.5:1 against the canvas, and the other numerals keep at least 4.5:1. (L2-069)
- **AC-18** Given a hovered page link in either theme, when it renders, then its `--color-fg-default` numeral on the `--color-bg-subtle` fill has at least 4.5:1 contrast. (L2-069)

### Responsive

- **AC-19** Given a 360 px viewport, when each link and arrow is measured, then it is at least 44 × 44 CSS px with at least 8 px to its neighbours. (L2-065)
- **AC-20** Given a 1280 px window at 200 % zoom on page 6 of 54, when the row renders, then every item is visible and operable and nothing scrolls horizontally. (L2-069)

### Motion

- **AC-21** Given `prefers-reduced-motion: reduce`, when a page link is hovered, then the fill appears without a visible transition. (L2-069)

### Performance

- **AC-22** Given the `Pagination` perf-test scenario stepping from page 1 to 54, when each page renders, then the row causes no layout shift beyond its own content and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/pagination/`; files
  `pagination.component.*` (selector `sh-pagination`, class
  `PaginationComponent`) and a pure `arrangement()` function in
  `pagination-arrangement.ts`, unit-tested on its own.
- Styles: the "Pagination" section of `components.css` (`.load-more`,
  `.pagination`, `.pagination__gap`) moves into the component, class names
  unscoped. `.result-count` stays global; the top-of-page count uses it too.
- Design-system catch-up for D-5: add
  `@media (max-width: 35.99rem) { .pagination__wide { display: none; } }` and
  `@media (min-width: 36rem) { .pagination__narrow { display: none; } }`.
- Design-system catch-up for D-10: `.pagination__gap { min-width: var(--space-4); }`
  and `.pagination li:has(> .pagination__gap) { margin-inline: calc(-1 * var(--space-1)); }`.
- Mocks catch-up for D-3 and D-4: both arrows on every page; first-last-current-neighbours arrangements.
- The design-system page calls the 8 px gap and wrapping "proposed";
  `components.css` already has `gap: var(--space-2); flex-wrap: wrap;
  justify-content: center`. This CRD requires them.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What renders for a single page?* Nothing, not a lone "1" (design system, Variants). The page's own count ("2 caterers") already says how many there are.
- **D-3** *Are both arrows always rendered?* Yes, disabled at the ends. The mocks drop "Previous" on page 1 and "Next" on the last page, which moves every number sideways as people page; the design system fixed it.
- **D-4** *Can "…" stand for a single page?* Not in the wide arrangement: a gap of one page shows that page, so the row never says "1 … 3" from 36rem. `admin-changes/long` shows "1 2 … 5 6" for page 6 of 6; the rule gives "1 … 5 6", the design system's first-last-current-neighbours arrangement. Below 36rem a single page becomes a gap unless the row would still hold at most three page links (‹ 1 2 3 › stays), because a fourth page link pushes the row past 320 px (D-10).
- **D-5** *How does the row switch arrangement at 36rem without JavaScript?* One server-rendered row holds the union of both arrangements; items only in one carry `.pagination__wide` or `.pagination__narrow`, which CSS hides at the other width. Rendering by viewport in script would shift the row after load and differ from the server HTML.
- **D-6** *What happens to pages that cannot load offline?* They are rendered `aria-disabled` without `href`, as the design system's offline note asks; the offline mock left them live. The consumer passes them in `unavailablePages`.
- **D-7** *Who moves focus after a page change?* The page, on route change, to the results heading, with the new document title. The component's links are plain navigation and do not know when the new list has rendered.
- **D-8** *May the count line carry a noun?* No: "Showing 221–240 of 4,870", not "… of 4,870 published". The noun lives in the top count; the summary is a consumer string, so this is a content rule the operator caterers page follows.
- **D-9** *How far apart are page links on a phone?* At least 8 px (`--space-2`), the user's decision of 10 Oct 2026: neighbouring 44 px targets are 8 px apart on phones (L2-065.1 wins over the design system's 4 px). `components.css` already sets `gap: var(--space-2)` on `.pagination`; the component keeps it at every width.
- **D-10** *Does the narrow row really fit at 320 px?* Only with narrower gaps. The design system says seven items fit, but with 44 px targets 8 px apart (D-9) and 44 px gap cells, ‹ 1 … 6 … 54 › is 356 px against the 288 px inside a 320 px screen's margins, and the row wraps. Gap cells are not targets, so they shrink to `--space-4` with `calc(-1 * --space-1)` inline margins (still more than 8 px between the targets either side), and the narrow arrangement holds at most three page links: the widest narrow row is then 284 px (five targets, two gaps), and ‹ 1 2 3 › is 252 px.
