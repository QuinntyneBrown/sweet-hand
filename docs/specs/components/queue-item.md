# Queue item

| Field | Value |
|---|---|
| Selector | `sh-queue` (the `ul.queue`, its loading rows and status line), `sh-queue-item` (one `a.queue-item` row) |
| Library path | `frontend/projects/components/src/lib/queue-item/` |
| Status | planned |
| Traces to | L2-040, L2-044, L2-046, L2-047, L2-050, L2-055, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 |
| Design system | [`queue-item.html`](../../design-system/components/queue-item.html) |
| Source mocks | [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/admin-queue/long`](../../mocks/pages/admin-queue/long.html), [`pages/admin-queue/filtered`](../../mocks/pages/admin-queue/filtered.html), [`pages/admin-queue/loading`](../../mocks/pages/admin-queue/loading.html), [`pages/admin-queue/empty`](../../mocks/pages/admin-queue/empty.html), [`pages/admin-caterers/default`](../../mocks/pages/admin-caterers/default.html), [`pages/admin-caterers/long`](../../mocks/pages/admin-caterers/long.html), [`pages/admin-caterers/loading`](../../mocks/pages/admin-caterers/loading.html), [`notifications/admin-toast/success`](../../mocks/notifications/admin-toast/success.html) |
| Rendering | [`queue-item.html`](queue-item.html) |

## Purpose and scope

The operator console is built from two lists of queue items: the **review
queue** (everything that needs a decision, oldest first: new profiles,
resubmissions, name changes, expired certificates, reports and held reviews)
and the **caterer records** list (all 68 caterers, sorted by last change).
Every row is one link to one record, and the row's job is triage: what kind of
thing, about whom, waiting how long. The decision itself (approve, request
changes, suspend) happens on the record page, never in the row.

Use an [inbox row](inbox-row.md) for conversations, [list rows](list.md)
(`.admin-row`) when the row itself carries actions, and a [table](table.md)
when operators compare columns (the audit log). Queue items are flat: a
hairline between rows, no card, no shadow, and no pepper red.

Out of scope:

- Which items are in the queue, their order (oldest first, L2-047) and the
  late threshold: the page's query and the domain layer decide them; the row
  renders `late` as given (D-3).
- The page subtitle ("7 waiting · oldest first", "34 waiting · oldest first ·
  9 waiting over 3 days"), filters, the search box and the "No results" chips:
  the page owns them.
- The empty state "All caught up", the error state and
  [pagination](pagination.md): the page replaces or follows the list.
- The status label on record rows ([status](status.md)), the photo
  ([photo](photo.md)) and the changed flag
  ([description list](description-list.md) `sh-changed-flag`): the row places
  them; their CRDs own them.

## Usage

Inventory from `usage_inventory.py docs/mocks queue-item "a|li|div"` and a
search for `class="queue"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-queue/default`; `notifications/admin-toast/*` (page behind) | waiting rows, photo media for caterers, icon media for reports (flag) and held reviews (star) | "Auntie Bev's Kitchen" / late "Waiting 3 days" / kind "New profile" · "Jamaican · Oshawa"; "Breadfruit & Butter" / "Resubmitted" · "Vincentian · Brampton"; "Review of Maracas Bay by Devon W." / "2 reports" · "Fake or spam · Inappropriate content"; "Island Pot" / "Waiting 6 hours" / "1 report" · "Food safety"; "Pelau House → Pelau House by Kendra" / "Name change" · "Published"; "Flying Fish Kitchen" / "Certificate expired" · "30 Sep 2026 · still published"; "Review of Sugar Dumplin by Priya R." / "Held review" · "contains a phone number" | default, late | canvas |
| `pages/admin-queue/long` | 34 rows, 9 late ("Sea Moss & Spice" "Waiting 9 days", "Paramaribo Pot" "Waiting 8 days") | as default | default, late | canvas |
| `pages/admin-queue/filtered` | reports only | "2 reports" rows | default | canvas |
| `pages/admin-queue/loading` | `busy`, 7 skeleton rows | status "Loading the review queue" | loading | canvas |
| `pages/admin-queue/empty`, `error` | no list: [empty state](empty-state.md) "All caught up" | — | empty, error | canvas |
| `pages/admin-caterers/default`, `long` | record rows, `stack`, status label in the right slot, placeholder photo for caterers without photos, changed flag in the meta | "Pelau House" / status "Published" / "Trinidadian & Tobagonian · Scarborough · Kendra Baptiste · updated today ·" flag "Name change waiting"; "Breadfruit & Butter" / "Pending review" / flag "Resubmitted"; "Hibiscus Hut" / "Suspended" (placeholder); "Tamarind Tree" / "Changes requested"; "Flying Fish Kitchen" / flag "Certificate expired"; "Island Pot" / flag "1 open report" | default | canvas |
| `pages/admin-caterers/loading` | `busy`, `stack`, 8 skeleton rows | status "Loading caterers" | loading | canvas |
| `pages/admin-caterers/empty`, `no-results`, `error` | no list: [empty state](empty-state.md) | "No suspended caterers match “Pelau”" | empty, no results, error | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `ul.queue`: list reset, hairline above the first row.
2. **Row** — `li > a.queue-item` (plus `.queue-item--stack` on record rows): a
   three-column grid (media · text · wait), `--space-1` / `--space-4` gaps,
   `--space-5` / `--space-2` padding, hairline below, hover fill.
3. **Media** — `span.photo` with a decorative `img` (`alt=""`, 56 × 56) for a
   caterer, `span.photo.photo--placeholder` with the plate icon for a caterer
   without photos, or `span.avatar[aria-hidden="true"]` holding an icon (flag
   for reports, star for held reviews) for things that are not a caterer.
   3.5rem, spanning both text lines.
4. **Title** — `span.queue-item__title`: the record's name, `--text-body-lg`
   medium, wraps anywhere, never truncates. A name change reads "Old → New"
   with the arrow `aria-hidden` and a hidden "renamed to".
5. **Wait or status** — `span.queue-item__wait`: "Waiting 3 days" in tabular
   figures, never wrapping, spanning both lines on the right; `--late` makes it
   semibold `--color-warning-fg`. On record rows it holds a
   [status](status.md) label instead.
6. **Kind** — `span.kind` at the start of the meta: "New profile", "2
   reports"; caption size, semibold, uppercase by CSS.
7. **Meta** — `span.queue-item__meta`: the facts after the kind, joined by
   middle dots, `--text-body-sm` `--color-fg-muted`; may end with a
   `.changed-flag`.
8. **Skeleton row (loading)** — `li.queue-item.queue-item--skeleton[aria-hidden="true"]`
   with a circle, a title bar, a wait bar and a meta bar.
9. **Status line** — `p.visually-hidden[role="status"]` before the list while
   loading.

DOM order inside the row is media, title, wait, meta, so the link's name
reads title, wait, kind, meta even though the grid places the wait on the
right.

Host: `sh-queue` is `display: block` and renders the status line and the
`ul`. `sh-queue-item` is `display: contents` and renders the `li` and its
`a.queue-item`.

## API

### `sh-queue` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string \| null` | `null` | no | `aria-label` for the list when no heading labels it ("Review queue, oldest first"). |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"`, renders `skeletonCount` skeleton rows in place of the projected rows, and the `busyLabel` status line. |
| `busyLabel` | `string` | — | yes when `busy` | "Loading the review queue", "Loading caterers". |
| `skeletonCount` | `number` | `7` | no | Whole number from 1 to 20 (queue 7, caterers 8). |
| `stack` | `boolean` | `false` | no | Skeleton rows take the stacked layout (record lists). Projected rows set their own `stack`. |

### `sh-queue-item` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `href` | `string` | — | yes | The record ("/operator/profiles/auntie-bevs-kitchen", "/operator/reports/R-2041"). Every row is a link. |
| `title` | `string` | — | yes | The record's name, exactly as written ("Auntie Bev's Kitchen", "Review of Maracas Bay by Devon W."). Text, never HTML. |
| `renamedTo` | `string \| null` | `null` | no | For a name change: renders "`title` → `renamedTo`" with the arrow `aria-hidden` and `renamedLabel` visually hidden between them. |
| `renamedLabel` | `string` | — | yes with `renamedTo` | The hidden words ("renamed to"). |
| `media` | `'photo' \| 'placeholder' \| 'report' \| 'review'` | `'photo'` | no | `photo` renders [photo](photo.md) `size="sm"` with `alt=""`; `placeholder` the plate placeholder; `report` an avatar with the flag icon; `review` an avatar with the star icon. All decorative. |
| `photo` | `{ src: string; width: number; height: number } \| null` | `null` | yes for `photo` | The caterer's cover rendition (56 × 56); lazy-loaded. |
| `wait` | `string \| null` | `null` | yes unless `[slot=status]` | "Waiting 3 days", already formatted and pluralised by the consumer. |
| `late` | `boolean` | `false` | no | Adds `.queue-item__wait--late`. The consumer sets it from the domain's rule (waited 3 days or more, D-3). |
| `kind` | `string \| null` | `null` | no | Rendered as `span.kind` at the start of the meta ("New profile", "2 reports"). |
| `meta` | `string` | — | yes | The facts after the kind, joined by " · " by the consumer ("Jamaican · Oshawa", "Fake or spam · Inappropriate content"). |
| `stack` | `boolean` | `false` | no | Adds `.queue-item--stack`: below 36rem the right slot moves under the meta. Set it whenever the right slot holds a status. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Activation is native link navigation. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-queue`: default | `sh-queue-item` elements | Rendered inside the `ul`; hidden while `busy`. |
| `sh-queue-item`: `[slot=status]` | One [status](status.md) label | Rendered inside `.queue-item__wait` instead of `wait` (record rows). |
| `sh-queue-item`: `[slot=flag]` | One `sh-changed-flag` ([description list](description-list.md)) | Rendered at the end of the meta after " · " ("Name change waiting"). |

No slot accepts a button: decisions never happen in the row, and a button
inside a link row is a nested control (D-2).

- Translation: `wait`, `kind`, `renamedLabel`, `busyLabel`, `label` and the
  flag text come from the resource files through the consumer (L2-064).
  Titles and meta facts are data (names, cuisines, areas, report reasons).

## Variants and sizes

| Variant | How | Right slot | Use for |
|---|---|---|---|
| Waiting | default | `wait` | Review-queue items within the promise. |
| Late | `late` | `wait`, semibold warning | Items waiting 3 days or more. |
| Not a caterer | `media="report"` or `"review"` | `wait` | Reports and held reviews. |
| Name change | `renamedTo` | `wait` | Pending business-name changes (L2-044). |
| Record | `stack` + `[slot=status]` | status label | Caterer records, sorted by last change. |
| No photos yet | `media="placeholder"` | either | Drafts and suspended caterers without photos. |

One density: 3.5rem media, `--space-5` block padding, a body-large title;
rows are at least 96 px tall. For denser data use a [table](table.md).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Flat row with hairlines | "Auntie Bev's Kitchen, Waiting 3 days, New profile · Jamaican · Oshawa, link" |
| Hover | `:hover` | Fill `--color-bg-surface-sunken` over `--duration-fast` | — |
| Focus | `:focus-visible` | Shared ring around the whole row, `--focus-ring-offset` outside | Link announced |
| Active | `:active` | As hover | — |
| Late | `late` | Wait semibold in `--color-warning-fg` | The number of days is the information; colour adds nothing a reader misses |
| Record status | `[slot=status]` | Status dot and word on the right (under the meta below 36rem with `stack`) | Status word read after the title |
| Flagged | `[slot=flag]` | Warning caption at the end of the meta | Flag text read |
| Image loading / failed | [photo](photo.md) | `--color-bg-photo` disc; failed keeps the disc | Decorative, nothing read |
| Long title | wider than the column | Wraps to two or three lines at 320 px; the wait stays on the right | Full title |
| Loading | `busy` | Skeleton rows in the row grid | List `aria-busy="true"`; status "Loading the review queue" |
| Visited | `:visited` | Not styled | — |
| Disabled, selected, pressed | — | Never: an item an operator cannot act on is not in their queue | — |
| Empty, no results, error | — | Never rendered by the list; the page shows an [empty state](empty-state.md) | — |

`data-state="hover|focus"` exists in `components.css` for documentation and
mocks only; the component never renders it.

## Markup

```html
<!-- rendered: review queue rows (late caterer, report, name change) -->
<ul class="queue">
  <li><a class="queue-item" href="/operator/profiles/auntie-bevs-kitchen"><span class="photo"><img src="…/green-fig-catering-56.avif" alt="" width="56" height="56" loading="lazy"></span><span class="queue-item__title">Auntie Bev's Kitchen</span><span class="queue-item__wait queue-item__wait--late">Waiting 3 days</span><span class="queue-item__meta"><span class="kind">New profile</span> · Jamaican · Oshawa</span></a></li>
  <li><a class="queue-item" href="/operator/reports/R-2041"><span class="avatar" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="M5 21V4m0 0h11l-2 4 2 4H5"/></svg></span><span class="queue-item__title">Review of Maracas Bay by Devon W.</span><span class="queue-item__wait">Waiting 2 days</span><span class="queue-item__meta"><span class="kind">2 reports</span> · Fake or spam · Inappropriate content</span></a></li>
  <li><a class="queue-item" href="/operator/profiles/pelau-house/name"><span class="photo">…</span><span class="queue-item__title">Pelau House <span aria-hidden="true">→</span><span class="visually-hidden">renamed to</span> Pelau House by Kendra</span><span class="queue-item__wait">Waiting 1 day</span><span class="queue-item__meta"><span class="kind">Name change</span> · Published</span></a></li>
</ul>
```

```html
<!-- rendered: record row (stacked, status, flag) and a placeholder photo -->
<li><a class="queue-item queue-item--stack" href="/operator/caterers/pelau-house"><span class="photo">…</span><span class="queue-item__title">Pelau House</span><span class="queue-item__wait"><span class="status status--published">Published</span></span><span class="queue-item__meta">Trinidadian &amp; Tobagonian · Scarborough · Kendra Baptiste · updated today · <span class="changed-flag">Name change waiting</span></span></a></li>
<li><a class="queue-item queue-item--stack" href="/operator/caterers/hibiscus-hut"><span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg></span><span class="queue-item__title">Hibiscus Hut</span><span class="queue-item__wait"><span class="status status--suspended">Suspended</span></span><span class="queue-item__meta">Jamaican · Brampton · Sharon Bailey · updated Tue 6 Oct</span></a></li>
```

```html
<!-- rendered: loading -->
<p class="visually-hidden" role="status">Loading the review queue</p>
<ul class="queue" aria-busy="true">
  <li class="queue-item queue-item--skeleton" aria-hidden="true"><span class="skeleton skeleton--circle"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></li>
  … (7)
</ul>
```

Skeleton sizes come from `.queue-item--skeleton` rules, not inline styles
(D-5).

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: review queue -->
<sh-queue [busy]="loading()" [busyLabel]="t('queue.loading')">
  @for (q of items(); track q.id) {
    <sh-queue-item [href]="q.href" [title]="q.title" [renamedTo]="q.newName" [renamedLabel]="t('queue.renamedTo')"
        [media]="q.media" [photo]="q.photo" [wait]="t('queue.waiting', { duration: q.waited })" [late]="q.late"
        [kind]="t('queue.kind.' + q.kind, { count: q.reports })" [meta]="q.meta"></sh-queue-item>
  }
</sh-queue>

<!-- consumer: caterer records -->
<sh-queue stack [busy]="loading()" [busyLabel]="t('caterers.loading')" [skeletonCount]="8">
  <sh-queue-item stack [href]="c.href" [title]="c.name" [media]="c.cover ? 'photo' : 'placeholder'" [photo]="c.cover" [meta]="c.meta">
    <sh-status slot="status" [tone]="c.statusTone" [label]="t('status.' + c.status)"></sh-status>
    @if (c.flag) { <sh-changed-flag slot="flag">{{ t('caterers.flag.' + c.flag) }}</sh-changed-flag> }
  </sh-queue-item>
</sh-queue>
```

The e2e page objects locate rows by `.queue-item`, the link name,
`.queue-item__title`, `.queue-item__wait`, `--late`, `.kind`,
`.queue-item__meta`, `.queue-item--skeleton` and the list's `aria-busy`;
those are part of the contract. Icon path data is free to change.

## Design

- Row: grid `auto minmax(0, 1fr) auto`, gaps `--space-1` / `--space-4`,
  padding `--space-5` / `--space-2`, bottom hairline
  `--border-width-hairline` `--color-border-default`; the list adds the top
  hairline.
- Media 3.5rem square ([photo](photo.md) `sm`, [avatar](avatar.md) with
  `--color-bg-subtle` behind the icon), spanning two rows.
- Title `--text-body-lg` at `--font-weight-medium`, `overflow-wrap: anywhere`.
- Meta `--text-body-sm`, `--color-fg-muted`. Kind `--text-caption`,
  `--font-weight-semibold`, uppercase, `--letter-spacing-wide`,
  `--color-fg-muted`.
- Wait `--text-body-sm`, `--color-fg-muted`, right-aligned, `nowrap`,
  `tabular-nums`, spanning two rows; late `--font-weight-semibold`,
  `--color-warning-fg`.
- Hover fill `--color-bg-surface-sunken` over `--duration-fast` with
  `--ease-standard`.
- Focus: shared ring `--focus-ring-width`, `--focus-ring-offset`,
  `--color-focus-ring`, `--radius-sm` corners.
- Elevation and layer: none.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | A future density theme may tighten `padding-block`; the row reads semantic tokens only. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Hairlines | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Row hover | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| Title | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Meta, kind, wait | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Late wait | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Photo before it loads | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |
| Icon media background | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Meta, kind, wait |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | Late wait |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Title on a hovered row |
| `--color-fg-muted` | `--color-bg-surface-sunken` | 4.5:1 | Meta on a hovered row |
| `--color-warning-fg` | `--color-bg-surface-sunken` | 4.5:1 | Late wait on a hovered row |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Forced colours: the link keeps system colours, the ring becomes `Highlight`,
hairlines `CanvasText`; the late colour is lost, which is acceptable because
the number of days and the weight remain.

## Responsive behaviour

- All widths: three columns (media · text · wait); the title wraps rather
  than pushing the wait off-screen; the wait never wraps.
- Below 36rem, `stack` rows: two columns, media spanning three rows, and the
  status label under the meta, left-aligned, so "Changes requested" never
  squeezes the name.
- Below 22.5rem every row takes the stacked layout, wait included
  (`components.css` rule), so at 320 px the title column keeps room.
- From 48rem the operator side navigation sits above, and from 62rem beside,
  the list; the row itself does not change.
- Each row is the full width and at least 96 px tall: far above the 44 × 44
  CSS px target. At 320 px nothing scrolls horizontally; at 200 % zoom every
  row stays readable.

## Accessibility

### Role and pattern

A list of links: `ul.queue`, one `li` and one `a.queue-item` per item ([APG
Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/)). Screen readers
announce "list, 7 items", matching the subtitle. Not a grid or listbox: no
selection, and arrow keys stay with the screen reader.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Row by row in list order (oldest first); one stop per row. |
| <kbd>Enter</kbd> | Opens the record. Returning with Back restores focus on the same row (the page keeps the list's scroll and focus target, D-4). |

### Focus

The shared ring outlines the whole row outside its box, so the hairlines stay
visible and the ring is never clipped by the list.

### Labelling

- The link's name is its text in DOM order: title, wait, kind, meta — "Auntie
  Bev's Kitchen, Waiting 3 days, New profile · Jamaican · Oshawa".
- Media is decorative: photo `alt=""`, avatar and placeholder icons
  `aria-hidden`. The title already names the caterer.
- Name changes read "Pelau House renamed to Pelau House by Kendra"; the arrow
  is never read as "right arrow".
- On record rows the status word is part of the name ("Pelau House,
  Published, …").

### Announcements

Only the loading status line, once.

### Motion

Only the hover fill animates, over `--duration-fast`, which reduced motion
zeroes. Skeleton shimmer stops under reduced motion.

## Content and internationalisation

- Title: the business name exactly as written ("Breadfruit & Butter"); for
  name changes "Old → New"; for reports and held reviews "Review of Maracas
  Bay by Devon W." (first name and initial, as on the public page).
- Kind: a short noun phrase in sentence case, uppercased by CSS: "New
  profile", "Resubmitted", "Name change", "Certificate expired", "2 reports",
  "1 report", "Held review"; reports counted with a numeral.
- Meta: the specific tradition and primary area ("Vincentian · Brampton",
  never "Caribbean · GTA"), the report reasons as chosen, or why a review was
  held ("contains a phone number").
- Wait: relative and coarse, never abbreviated: "Waiting 2 hours", "Waiting
  1 day", "Waiting 9 days". Record rows say "updated today", "updated Thu
  8 Oct".
- Never a caterer's email, phone or home address in a row.
- Translatable: `wait`, `kind`, `renamedLabel`, flag text, status label,
  `busyLabel`. Data: names, cuisines, areas, reasons.
- French waits are longer ("En attente depuis 3 jours"); the wait column
  grows and the title wraps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the row classes, the name
  change parts, the skeleton list) are computed once, not in the template.
- Photos are 56 px renditions, `loading="lazy"`, with `width`/`height`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/QueueItem.ts`
  renders Auntie Bev's Kitchen's late row ("Waiting 3 days", "New profile ·
  Jamaican · Oshawa"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `AdminQueueLong` (34 rows, 9 late), `AdminCaterers`
  (20 record rows with statuses and flags), `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: skeleton rows use the row grid and the 3.5rem circle, so
  rows land where the skeletons were; photos reserve their square.
- Weight: composes [photo](photo.md), [avatar](avatar.md) and
  [skeleton](skeleton.md); status and flag come through slots.

## Acceptance criteria

### Rendering

- **AC-1** Given profiles submitted at 09:00, 10:00 and 11:00, when the review queue renders the rows it is given, then they appear in that order, each as one `a.queue-item` in `ul.queue` with a `.queue-item__wait` such as "Waiting 3 days". (L2-047)
- **AC-2** Given Auntie Bev's Kitchen has waited 3 days, when its row renders with `late`, then the wait "Waiting 3 days" has `.queue-item__wait--late`, and the link's accessible name is "Auntie Bev's Kitchen, Waiting 3 days, New profile · Jamaican · Oshawa". (L2-047)
- **AC-3** Given 2 reports about Devon W.'s review of Maracas Bay, when the queue renders, then one row titled "Review of Maracas Bay by Devon W." shows the kind "2 reports" and the meta "Fake or spam · Inappropriate content", with a decorative flag icon in an `aria-hidden` avatar. (L2-055)
- **AC-4** Given Kendra requested the name "Pelau House by Kendra", when its queue row renders, then the title reads "Pelau House → Pelau House by Kendra" visually, the kind is "Name change", and a screen reader reads "Pelau House renamed to Pelau House by Kendra". (L2-044)
- **AC-5** Given Flying Fish Kitchen's certificate expired on 30 Sep 2026, when the queue renders its item, then the kind is "Certificate expired" and the meta "30 Sep 2026 · still published". (L2-040)
- **AC-6** Given Priya R.'s review of Sugar Dumplin was held because it contains a phone number, when the queue renders it, then the row shows a star icon, the kind "Held review" and the meta "contains a phone number". (L2-050)
- **AC-7** Given the caterer records list, when Pelau House's row renders with `stack`, then its right slot holds the status label "Published", its meta ends with the flag "Name change waiting", and Tamarind Tree's row shows "Changes requested". (L2-046)
- **AC-8** Given Hibiscus Hut has no photos, when its record row renders with `media="placeholder"`, then a `.photo.photo--placeholder` with an `aria-hidden` plate icon keeps the 3.5rem square. (L2-068)

### States

- **AC-9** Given the review queue is loading, when the list renders with `busy` and `busyLabel` "Loading the review queue", then `ul.queue` has `aria-busy="true"`, holds 7 `li.queue-item.queue-item--skeleton[aria-hidden="true"]`, and a `role="status"` line reads "Loading the review queue". (L2-066)
- **AC-10** Given a mouse user at 1280 px, when the pointer is over Breadfruit & Butter's row, then the row fills with `--color-bg-surface-sunken` and its title, meta and wait keep at least 4.5:1 contrast in both themes. (L2-069)

### Keyboard and focus

- **AC-11** Given the review queue at 1280 px, when a keyboard user tabs through it, then focus visits the 7 rows in list order, one stop per row, and Enter on "Island Pot" opens its report. (L2-067)
- **AC-12** Given keyboard focus on a row, when it is displayed in either theme, then a `--color-focus-ring` ring surrounds the whole row with at least 3:1 contrast against the page and is not clipped by the list. (L2-067)

### Screen readers

- **AC-13** Given every queue row, when it is inspected, then photos have `alt=""` and icon media is `aria-hidden="true"`, so no row's name contains image text. (L2-068)
- **AC-14** Given the review queue default, long and loading states and the caterer records list, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any queue item. (L2-066)

### Theming

- **AC-15** Given the light and the dark theme, when Sea Moss & Spice's late row ("Waiting 9 days") renders, then the late wait has at least 4.5:1 contrast against the page and the hovered row, and lateness is also given by the number of days and the semibold weight. (L2-069)

### Responsive

- **AC-16** Given a 320 px viewport, when the review queue renders "Pelau House → Pelau House by Kendra", then the title wraps, the wait is not cut off, and the page does not scroll horizontally. (L2-064)
- **AC-17** Given a 360 px viewport, when Tamarind Tree's record row renders with `stack`, then "Changes requested" sits under the meta, left-aligned, and the title is not squeezed. (L2-064)
- **AC-18** Given a 360 px viewport, when any queue row is measured, then its tap target is the full row, at least 44 CSS px tall (96 px in practice). (L2-065)
- **AC-19** Given a 1280 px window at 200 % zoom, when the caterer records list renders, then every title, status and meta is visible and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when the pointer enters a row and while the queue is loading, then the fill appears with no transition and the skeleton rows do not shimmer. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/queue-item/`; files
  `queue.component.*` (`sh-queue`) and `queue-item.component.*`
  (`sh-queue-item`).
- Styles: the "Queue item (operator)" section of `components.css` (`.queue`,
  `.queue-item`, `__title`, `__meta`, `__wait`, `--late`, `--stack`,
  `--skeleton`, `.kind`) moves into the component, class names unscoped.
  `.kind` stays available to the admin toast and record headers.
- Composes [photo](photo.md) (`sm`, decorative), [avatar](avatar.md) and
  [skeleton](skeleton.md); the flag and star icons come from the mocks' icon
  set.
- Mock catch-up: loading rows drop the inline `grid-row` and size styles in
  favour of `.queue-item--skeleton` (already in `components.css`); the
  long-queue mock's duplicate `aria-hidden` on icons inside an `aria-hidden`
  avatar goes; name-change titles gain the hidden "renamed to";
  `admin-queue/loading` gains `aria-busy` on the list.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Can a row hold an action button?* No. The design system's do and don't forbids approving from the row (decisions need the record), and a button inside a link is a nested control; there is no slot for one.
- **D-3** *Who decides that an item is late?* The domain layer, which knows the 3-day promise and business days; the row only renders `late`. AGENTS.md keeps business rules out of UI components.
- **D-4** *Does the row restore focus after Back?* The browser restores the page; the list keeps stable row ids and hrefs so the restored focus target is the same link. The row adds no script for it.
- **D-5** *Inline skeleton styles in the mocks?* Replaced by `.queue-item--skeleton`, which the design system proposed and `components.css` now has; widths stay the same.
- **D-6** *Does a narrow phone stack every row?* Yes, below 22.5rem, as the rule in `components.css` does (the design system proposed it for the narrowest phones); `stack` rows stack from 36rem down.
- **D-7** *Is the photo in a row ever given alt text?* No. The title names the caterer, and alt text would lengthen every link name (design system do and don't).
