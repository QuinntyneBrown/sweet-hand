# Skeleton

| Field | Value |
|---|---|
| Selector | `sh-skeleton` (one shape), `sh-loading-status` (the region's status message) |
| Library path | `frontend/projects/components/src/lib/skeleton/` |
| Status | planned |
| Traces to | L2-005, L2-051, L2-061, L2-064, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`skeleton.html`](../../design-system/components/skeleton.html) |
| Source mocks | [`pages/caterers/loading`](../../mocks/pages/caterers/loading.html), [`pages/caterer/loading`](../../mocks/pages/caterer/loading.html), [`pages/inbox/loading`](../../mocks/pages/inbox/loading.html), [`pages/thread/loading`](../../mocks/pages/thread/loading.html), [`pages/admin-queue/loading`](../../mocks/pages/admin-queue/loading.html), [`pages/admin-cuisines/loading`](../../mocks/pages/admin-cuisines/loading.html), [`pages/admin-audit/loading`](../../mocks/pages/admin-audit/loading.html), [`pages/admin-metrics/loading`](../../mocks/pages/admin-metrics/loading.html), [`pages/profile-menu/loading`](../../mocks/pages/profile-menu/loading.html), [`pages/profile-photos/loading`](../../mocks/pages/profile-photos/loading.html), [`pages/verify-email/loading`](../../mocks/pages/verify-email/loading.html) |
| Rendering | [`skeleton.html`](skeleton.html) |

## Purpose and scope

A skeleton draws the shape of content that is still coming — a round
caterer photo, a name, an inbox row, a menu row, a chart — as a quiet stone
block with a slow shimmer, in exactly the box the content will occupy. Sweet
Hand pages load as skeletons of themselves: the listing shows grey circles in
the caterer grid, the inbox shows rows with a circle and two lines, Pelau
House's page shows its gallery circles, title and menu rows. When the data
arrives, nothing moves. `sh-skeleton` is the one shape; `sh-loading-status`
is the single, visually hidden message that names what is loading ("Loading
your enquiries") and then what loaded.

Use something else when there is no layout to preview (the next photo in the
viewer, a postal-code lookup): [spinner](spinner.md). When the amount is
measurable (an upload): [progress](progress.md). When an action runs on
content already shown (saving, sending): the [button](button.md)'s busy state;
content never turns back into skeletons. When the load failed or returned
nothing: [empty state](empty-state.md).

Out of scope:

- The composed loading rows and cards (`.caterer-card--skeleton`,
  `.inbox-skeleton-row`, `.queue-item--skeleton`, `.admin-row--skeleton`,
  `.edit-row--skeleton`, `.photo-tile--skeleton`, `.dish--skeleton`): each
  belongs to the component that renders the real row ([caterer
  card](caterer-card.md), [list](list.md), [dish](dish.md), [table](table.md)…),
  which places `sh-skeleton` shapes inside its own markup and sets
  `aria-busy` on its own container.
- How many skeleton items a list renders per breakpoint: the list's
  component, following the rule in *Responsive behaviour*.
- The listing's visible result count ("60 caterers"), which is its own live
  region with a text skeleton inside: the listing page.
- Deciding when loading starts and ends; the page's data layer does, through
  the shared `delayedBusy` helper (300 ms rule, D-3).

## Usage

Inventory from a count of every `skeleton` class in `docs/mocks/` (29
loading mocks, about 600 shapes) and `usage_inventory.py docs/mocks skeleton
"span|div|li"`. Rows that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/loading`, `occasions/loading`, `dashboard/loading`, `profile-details/loading` | circle filling `.photo`, two text lines 9rem / 6rem inside `.caterer-card--skeleton` | status "Loading caterers", "Loading occasions" | loading | canvas, preview pane |
| `pages/caterer/loading` | gallery circles in `.photo`; a text line in the `h1` beside "Loading caterer" (hidden); text lines 18rem and full; dish rows 50 % / 80 %; pill rect `--control-height-lg` for "Send an enquiry" | status "Loading Pelau House", "Loading reviews" | loading | canvas |
| `pages/inbox/loading`, `dashboard-enquiries/loading` | `.inbox-skeleton-row`: 3rem circle spanning two lines, text 50 %, 3rem, 70 %, 4rem | status "Loading your enquiries", "Loading enquiries" | loading | list column |
| `pages/thread/loading`, `dashboard-enquiry/loading` | circle 3.5rem, a 10rem text line in the `h1` beside "Loading enquiry", text 6rem, rect 12rem (summary), rect 4.5rem × 22rem (message) | status "Loading enquiry" | loading | thread column |
| `pages/admin-queue/loading`, `admin-caterers/loading`, `admin-reviews/loading`, `admin-changes/loading` | `.queue-item--skeleton`: circle 3.5rem spanning two lines, text 60 % / 30 % | status "Loading the review queue", "Loading recent changes" | loading | canvas |
| `pages/admin-cuisines/loading`, `admin-operators/loading`, `admin-breaches/loading` | `.admin-row--skeleton`: title 40 %, text 25 %, rect for a small button | status "Loading cuisines", "Loading operators", "Loading breach records" | loading | canvas |
| `pages/admin-audit/loading` | text in every table cell, real headers, caption ending ", loading" | status "Loading audit entries" | loading | table |
| `pages/admin-metrics/loading` | title 3rem × 2.75rem (stat values), rect `calc(--space-32 + --space-16)` (charts) | status "Loading metrics" | loading | canvas |
| `pages/profile-*/loading`, `account/loading` | title, text, rect `--control-height-md` (inputs), pill rect `--control-height-md` 8rem (buttons) | status "Loading your business details", "Loading your account" | loading | canvas |
| `pages/profile-menu/loading`, `profile-photos/loading` | `.edit-row--skeleton` (text 12rem / 18rem), `.photo-tile--skeleton` (circle, text 7rem) | status "Loading your menu", "Loading photos" | loading | canvas |
| `pages/verify-email/loading` | `.photo-row` of three circles, title 80 %, text, two rects `--control-height-lg` | status "Verifying your email…" | loading | canvas |
| Paging (`pages/caterer` "Show more reviews") | text lines appended below the shown reviews | status "Loading reviews" | loading more | canvas |
| Avatar placeholders (`admin-caterer`, `thread`) | `.avatar.skeleton.skeleton--circle` | — | loading | canvas |

Not built by this component:

- `aria-label="Loading …"` on busy lists with exposed rows (cuisines,
  operators, breaches) is drift; rows are `aria-hidden` and one
  `sh-loading-status` names the load.
- Inline `width: 100%; height: 100%` on circles inside `.photo` (29 times) is
  replaced by the `.photo > .skeleton` rule.
- Inline `height: var(--control-height-sm)` on admin-row rects is replaced by
  `.admin-row--skeleton .skeleton--rect`, which follows the phone target size.
- `.avatar.skeleton` is rendered by [avatar](avatar.md) with these classes.

## Anatomy

1. **Shape** — `.skeleton` (`span`, `aria-hidden="true"`): a block of
   `--color-bg-subtle` with a shimmer gradient to `--color-bg-subtle-hover`,
   at least 1em high, never wider than its container.
   - `.skeleton--text`: one line, 0.9em high with 0.3em above and below; the
     last text line in a group is 60 % wide.
   - `.skeleton--title`: a heading-sized line in body text, 1.5em high, 40 %
     wide by default (a section title, a stat value). Inside a real heading
     element a `text` shape is used instead: 0.9em of the heading's own font
     is one line of that heading (D-8).
   - `.skeleton--circle`: 50 % radius; fills a `.photo` or avatar box.
   - `.skeleton--rect`: `--radius-md`; inputs, charts, summaries.
   - `.skeleton--pill`: `--radius-full`; buttons (D-4).
2. **Busy container (consumer's)** — the real `ul`, `table` or `div` with
   `aria-busy="true"` while its skeletons show; every skeleton row in it is
   `aria-hidden="true"`.
3. **Status** — `sh-loading-status` renders `p.visually-hidden` with
   `role="status"`, one per loading region.

Host: `sh-skeleton` is layout-transparent (`display: contents`) and renders
`span.skeleton` in the light DOM, so parent rules (`.photo > .skeleton`,
`.caterer-card--skeleton .skeleton--text + .skeleton--text`,
`.skeleton--text:last-child`) match it as if written by hand (D-2).
`sh-loading-status` is layout-transparent too and renders its `p`.

## API

### `sh-skeleton` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `shape` | `'text' \| 'title' \| 'circle' \| 'rect' \| 'pill'` | `'text'` | no | Adds `.skeleton--{shape}`. |
| `width` | `string \| null` | `null` | no | A CSS length or percentage ("9rem", "50%"), rendered as inline `width`. `max-width: 100%` always applies, so no width overflows a 320 px screen. `null` leaves width to the shape and the parent's CSS. |
| `height` | `string \| null` | `null` | no | A CSS length or a token reference (`var(--control-height-lg)`), rendered as inline `height`. Text and title ignore it (their height is in em). Never set it for a rect or pill whose size changes by breakpoint; the parent's CSS sets those (D-5). |

- The element always has `aria-hidden="true"`; there is no input to remove it.

### `sh-loading-status` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `loading` | `boolean` | `false` | no | While true, the paragraph holds `loadingLabel`. Bind it to the delayed busy signal, so it turns on after 300 ms like the skeletons. |
| `loadingLabel` | `string` | — | yes | What is loading, specific to the region: "Loading your enquiries". |
| `doneLabel` | `string \| null` | `null` | no | Written when `loading` turns false: the result ("4 enquiries · 1 unread"). `null` empties the paragraph. |

### Outputs

None. Skeletons are not interactive.

### Content slots

None. `sh-skeleton` is empty; `sh-loading-status` takes its text from
inputs.

### Helper

`delayedBusy(source, { delay: 300 })` in the same folder turns a "request
in flight" signal into the busy signal that components and
`sh-loading-status` bind to: it becomes true only if the request is still in
flight after 300 ms and becomes false as soon as it ends (D-3).

- Translation: `loadingLabel` and `doneLabel` come from the resource files
  through the consumer (L2-064). Skeletons carry no words.

## Variants and sizes

| Shape | Modifier | Use for |
|---|---|---|
| Text | `.skeleton--text` | A line of text: a caterer name, "Jamaican · Pickering", a table cell, a dish description. |
| Title | `.skeleton--title` | A heading-sized line placed in body text: section titles in admin rows, stat values on the metrics page. Inside an `h1`–`h4` use text (D-8). |
| Circle | `.skeleton--circle` | Round photos and avatars, inside `.photo` or `.avatar`. |
| Rect | `.skeleton--rect` | Inputs, charts, the enquiry summary, a message bubble. |
| Pill | `.skeleton--pill` | Buttons: "Send an enquiry", "Save details" (D-4). |

There is no size scale. Each skeleton copies the box it stands in for: text
and title are in em and follow the surrounding font size; circles fill their
`.photo` or avatar box (17.5rem on a listing card, 48 px in the inbox);
rects and pills take the control height they replace (`--control-height-md`
for an input, `--control-height-lg` for a large button, `--target-comfortable`
below 48rem and `--control-height-sm` from 48rem for a small button).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Not yet shown | request in flight for under 300 ms | Nothing (or only the parts known in advance) | Nothing announced |
| Loading | busy signal true | Shapes shimmer: the gradient moves across a 400 % background once per `--duration-loop`, `--ease-standard` | Shapes hidden; container `aria-busy="true"`; status "Loading your enquiries" |
| Loading, reduced motion | `prefers-reduced-motion: reduce` | Flat `--color-bg-subtle`, no shimmer | Same |
| Loaded | busy signal false | Skeletons replaced in one swap by content in the same boxes; photos may still show `--color-bg-photo` until decoded | `aria-busy` removed; status becomes the result ("60 caterers") |
| Failed | request failed | Skeletons replaced by an error [empty state](empty-state.md) in the same region; header, title and filters stay | The empty state's alert |
| Loading more | "Show more reviews" or next page | Existing items stay; skeletons are appended below only | Status "Loading reviews" |

## Markup

```html
<!-- rendered: sh-skeleton shapes -->
<span class="skeleton skeleton--text" aria-hidden="true"></span>
<span class="skeleton skeleton--title" aria-hidden="true" style="width: 10rem;"></span>
<span class="skeleton skeleton--circle" aria-hidden="true" style="width: 3.5rem; height: 3.5rem;"></span>
<span class="skeleton skeleton--rect" aria-hidden="true" style="height: 12rem;"></span>
<span class="skeleton skeleton--pill" aria-hidden="true" style="height: var(--control-height-lg);"></span>
```

```html
<!-- rendered: a region loading (inbox list) -->
<p class="visually-hidden" role="status">Loading your enquiries</p>
<ul class="inbox-list" aria-busy="true">
  <li class="inbox-skeleton-row" aria-hidden="true"><span class="skeleton skeleton--circle" aria-hidden="true"></span><span class="skeleton skeleton--text" aria-hidden="true" style="width: 50%;"></span><span class="skeleton skeleton--text" aria-hidden="true" style="width: 3rem;"></span><span class="skeleton skeleton--text" aria-hidden="true" style="width: 70%;"></span><span class="skeleton skeleton--text" aria-hidden="true" style="width: 4rem;"></span></li>
  …4 rows
</ul>
```

```html
<!-- rendered: a heading that is loading -->
<h1><span class="visually-hidden">Loading caterer</span><span class="skeleton skeleton--text" aria-hidden="true" style="width: 60%;"></span></h1>
```

```html
<!-- rendered: a table that is loading -->
<p class="visually-hidden" role="status">Loading audit entries</p>
<div class="table-wrap" aria-busy="true"><table class="table">
  <caption class="visually-hidden">Audit entries, loading</caption>
  <thead><tr><th scope="col">When</th><th scope="col">Operator</th><th scope="col">Action</th><th scope="col">Target</th></tr></thead>
  <tbody><tr aria-hidden="true"><td><span class="skeleton skeleton--text" aria-hidden="true"></span></td>…</tr></tbody>
</table></div>
```

```html
<!-- rendered: after loading -->
<p class="visually-hidden" role="status">4 enquiries · 1 unread</p>
<ul class="inbox-list">…real rows…</ul>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: inbox -->
<sh-loading-status [loading]="busy()" [loadingLabel]="t('inbox.loading')" [doneLabel]="summary()"></sh-loading-status>
<ul class="inbox-list" [attr.aria-busy]="busy() || null">
  @if (busy()) { @for (i of [1,2,3,4]; track i) {
    <li class="inbox-skeleton-row" aria-hidden="true"><sh-skeleton shape="circle"></sh-skeleton><sh-skeleton width="50%"></sh-skeleton>…</li> } }
  @else { … }
</ul>

<!-- consumer: caterer page call to action placeholder -->
<sh-skeleton shape="pill" height="var(--control-height-lg)"></sh-skeleton>
```

The e2e page objects wait on `[aria-busy="true"]` disappearing and on the
status text; `.skeleton` and its shape modifiers are part of the contract.

## Design

- Base `--color-bg-subtle`; highlight `--color-bg-subtle-hover`, as a 90°
  gradient (base 25 %, highlight 37 %, base 63 %) on a 400 % × 100 %
  background.
- Shimmer: the `shimmer` keyframes over `--duration-loop` (1.4 s),
  `--ease-standard`, infinite.
- Radius: `--radius-sm` (text, title), `--radius-md` (rect), 50 % (circle),
  `--radius-full` (pill).
- Text 0.9em high with 0.3em block margins; title 1.5em; minimum height 1em.
- `display: block; max-width: 100%`.
- No elevation, border or layer.

No component tokens; the skeleton must be the quietest thing on the screen —
no pepper, no ink.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Base | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Shimmer highlight | `--color-bg-subtle-hover` | `--palette-stone-200` | `--palette-stone-700` |
| Photo still decoding (after load) | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |

Contrast: skeleton shapes are decorative and exempt from WCAG 1.4.11 (they
carry no information; the status text does), so the base is deliberately
faint against the canvas. If text ever sits on a skeleton it needs:

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Text on the base |
| `--color-fg-default` | `--color-bg-subtle-hover` | 4.5:1 | Text on the highlight |

Forced colours: backgrounds are dropped, so skeletons disappear; the status
text still says what is loading. No rule is needed.

## Responsive behaviour

- Skeletons live inside the real layout and follow it: the caterer grid is
  1 column on XS, 2 from 36rem, 3 from 62rem, and its skeletons are laid out
  the same way. Lists render enough skeleton items to fill the first screen
  (design system: 3 cards on XS, 6 on SM and MD, 9 from LG; 4 inbox rows on
  every size), not a fixed 24.
- Queue skeletons use `.queue-item--stack` below 36rem like the real rows.
- Widths are percentages or lengths capped by `max-width: 100%`; nothing is
  wider than a 320 px screen.
- A rect or pill standing in for a small button is 44 px (`--target-comfortable`)
  below 48rem and 36 px (`--control-height-sm`) from 48rem, matching
  [button](button.md), so nothing shifts when the button arrives.

## Accessibility

### Role and pattern

Skeletons are `aria-hidden="true"` and mean nothing to assistive technology.
The container being loaded keeps its real element and role (the `ul`, the
`table` with caption and column headers) and carries `aria-busy="true"`
([aria-busy](https://www.w3.org/TR/wai-aria-1.2/#aria-busy)); one
`role="status"` paragraph per region names what is loading and later
announces the result (WCAG 4.1.3). The APG has no skeleton pattern.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips skeletons; nothing in them is focusable. Real controls on the page (filters, tabs, header) work while content loads. |

### Focus

Focus is never placed on a skeleton and never moved when content arrives. If
focus was on a control the loaded content replaces (a pagination link), the
page moves it to the first result's link.

### Labelling

One status message per loading region, specific to it ("Loading audit
entries"), never on each item. Tables keep their headers and a caption ending
", loading". A heading that is loading holds a visually hidden "Loading
caterer" beside its title skeleton.

### Announcements

`sh-loading-status` announces `loadingLabel` when loading becomes visible and
`doneLabel` when it ends. The listing's result count announces "60 caterers"
through its own polite region (L2-067.5).

### Motion

The shimmer is a decorative loop; under `prefers-reduced-motion: reduce` it
stops and the shape is flat `--color-bg-subtle`. It is a soft brightness
change, far below three flashes a second.

## Content and internationalisation

- Skeletons carry no words. Status messages do: "Loading caterers", "Loading
  your enquiries", "Loading the review queue", "Verifying your email…".
- Render real text for everything known in advance: page titles ("Inbox"),
  filter names (Jamaican, Trinidadian & Tobagonian…), table headers, tab
  labels. Only records and counts are skeletons.
- Never put "Loading…" in place of a caterer name or a count; use a text
  skeleton of the right width.
- Translatable inputs: `loadingLabel`, `doneLabel`. Data in `doneLabel`:
  counts ("60 caterers", "4 enquiries · 1 unread").
- Text skeletons are in em, so a longer French name does not change them;
  the real text wraps when it arrives.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the inline style is computed once per input
  change, not in the template.
- The shimmer is a CSS animation of `background-position` on the compositor
  path; no JavaScript timers per skeleton. `delayedBusy` uses one timer per
  request.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Skeleton.ts`
  renders the listing's loading state (9 caterer-card skeletons) and swaps to
  the first 9 cards (Pelau House to Pimento & Thyme, then Sugar Dumplin…);
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CatererListing`, `Inbox`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the purpose of the component. Every skeleton occupies
  the final content's box, so the swap shifts nothing (L2-085).
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given `sh-skeleton` with each shape, when it renders, then it is a `span` with classes `skeleton skeleton--text`, `--title`, `--circle`, `--rect` or `--pill` respectively, it has `aria-hidden="true"`, and it exposes nothing in the accessibility tree. (L2-068)
- **AC-2** Given Marcia's inbox loading, when the skeleton rows render, then the `ul.inbox-list` has `aria-busy="true"`, each of its 4 rows has `aria-hidden="true"`, one `role="status"` paragraph reads "Loading your enquiries", and axe-core reports 0 violations at XS and XL in both themes. (L2-066)
- **AC-3** Given the audit log loading, when the table renders, then its four real column headers ("When", "Operator", "Action", "Target") are present, the caption ends ", loading", the skeleton rows are `aria-hidden="true"`, and a screen reader in browse mode reads no empty rows. (L2-068)
- **AC-4** Given a 320 px viewport, when the caterer page's loading state renders with a text skeleton of `width="18rem"` and a rect of `width="22rem"`, then each is capped at its container's width and the page does not scroll horizontally. (L2-064)

### States

- **AC-5** Given the inbox request completes in 200 ms, when the page loads, then no `.skeleton` element is ever rendered and no "Loading your enquiries" is announced; given it completes in 800 ms, then the skeletons and the status appear at 300 ms and are removed when the rows arrive. (L2-085)
- **AC-6** Given the listing loading at XS, SM and LG, when the skeleton cards render, then they are laid out in 1, 2 and 3 columns respectively, the same as the loaded cards. (L2-005)
- **AC-7** Given the listing loading, when the 60 caterers arrive, then `aria-busy` is removed from the grid and the result count's polite region announces "60 caterers". (L2-067)
- **AC-8** Given Pelau House's page loading after a client-side navigation, when the title, text, gallery and menu arrive, then the cumulative layout shift of the swap is 0.1 or less, because each skeleton occupied its content's box. (L2-085)
- **AC-9** Given Tomas Reyes's operator list loading at 360 px and at 1280 px, when the row action rect is measured and the real "Deactivate" button then replaces it, then the rect is 44 px high at 360 px and 36 px at 1280 px, matching the button, and the row does not change height. (L2-085)
- **AC-10** Given Pelau House's page showing 10 of 23 reviews, when Marcia activates "Show more reviews", then the 10 shown reviews stay in place, skeleton lines are appended below them, "Loading reviews" is announced, and the next 10 replace the skeletons without a page reload. (L2-051)
- **AC-11** Given the metrics dashboard loading a 12-month range at daily granularity, when the chart placeholders render, then each is a rect of the chart's final height and the charts replace them within 3 seconds. (L2-061)

### Keyboard and focus

- **AC-12** Given the listing loading, when a keyboard user presses Tab, then focus moves through the header and the real filter names (Jamaican, Trinidadian & Tobagonian…) and never lands on a skeleton; when the cards arrive, focus stays where it was. (L2-067)

### Theming

- **AC-13** Given the dark theme, when a skeleton renders, then its base resolves to `--palette-stone-800` and its highlight to `--palette-stone-700`, with no pepper or ink colour, and the loading inbox passes axe-core with 0 violations. (L2-066)

### Motion

- **AC-14** Given no motion preference, when a skeleton renders, then its `animation-name` is `shimmer` with a duration equal to `--duration-loop` (1.4 s) and it changes brightness fewer than 3 times per second. (L2-069)
- **AC-15** Given `prefers-reduced-motion: reduce`, when a skeleton renders, then its `animation-name` is `none` and it is a flat `--color-bg-subtle` block, while the status text is unchanged. (L2-069)

### Content

- **AC-16** Given the component sources, when they are scanned for user-facing string literals, then none are found; every status message arrives as `loadingLabel` or `doneLabel` from the resource files. (L2-064)

### Performance

- **AC-17** Given the `Skeleton` perf-test scenario swapping 9 caterer-card skeletons for the first 9 cards, when it runs, then it does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/skeleton/`; files
  `skeleton.component.*` (`SkeletonComponent`, `sh-skeleton`),
  `loading-status.component.*` (`LoadingStatusComponent`,
  `sh-loading-status`) and `delayed-busy.ts`.
- Styles: the `.skeleton` section, the `shimmer` keyframes and the
  reduced-motion rule move into the component's stylesheet, unscoped so the
  composed row rules in other components (`.caterer-card--skeleton
  .skeleton--text`, `.admin-row--skeleton .skeleton--rect`) still match.
- Design-system catch-up for D-4: add
  `.skeleton--pill { border-radius: var(--radius-full); }` beside
  `.skeleton--rect`; the mocks set the radius inline on five button
  placeholders. The rendering shows it with a specimen-only style.
- Mock catch-up: rows in the cuisines, operators and breach-record loading
  mocks get `aria-hidden`; the busy lists lose `aria-label`.
- Composed by [caterer card](caterer-card.md) (`busy` grid), [list](list.md),
  [table](table.md), [dish](dish.md), [avatar](avatar.md), and every page
  loading state. Composes nothing. No CDK primitive.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* Layout-transparent (`display: contents`) with the `span.skeleton` in the light DOM, so sibling and child rules written against `.skeleton` (`.photo > .skeleton`, `:last-child`, `+`) apply unchanged and composed rows match the mocks.
- **D-3** *Where does the 300 ms rule live?* In a shared `delayedBusy` helper in this folder, not in each skeleton. A whole region appears or not as one; per-shape timers would pop in unevenly. The same signal drives `aria-busy`, the skeletons and `sh-loading-status`, so the announcement and the visuals agree.
- **D-4** *How are button placeholders rounded?* With a `pill` shape adding `.skeleton--pill` (`--radius-full`). Five mocks set the radius inline on a rect, and buttons are pills in this design system; a named shape keeps the radius a token and testable.
- **D-5** *May `height` be set inline?* Yes for fixed boxes (a 12rem summary, a chart), no for boxes that change by breakpoint (a small-button rect): those take their height from the composed row's CSS, because an inline height cannot follow the 44 px phone target (design system, Responsive).
- **D-6** *Is there a status component, or does each page write its own paragraph?* A component, `sh-loading-status`. The mocks used a visible subtitle, a hidden paragraph and a hidden span; the design system settled on one hidden `role="status"` paragraph per region, and a component makes that the only way to write it.
- **D-7** *Is the skeleton ever focusable or labelled?* No. It is always `aria-hidden`; the input to remove it does not exist, because exposed skeleton rows are counted as real list items (design system, Do and don't).
- **D-8** *Which shape stands in for a heading that is loading?* `text` inside the heading element. The mocks used `title` there with an inline `height: 0.9em` override; since `--title` is 1.5em of the heading's own display-size font it would draw a block twice the line's height and shift on load, while `text` (0.9em of that font) is exactly one line of it.
