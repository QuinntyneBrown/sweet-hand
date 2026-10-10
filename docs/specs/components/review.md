# Review

| Field | Value |
|---|---|
| Selector | `sh-review` (one review, renders `li.review`), `sh-review-list` (the list, renders `ul.review-list`) |
| Library path | `frontend/projects/components/src/lib/review/` |
| Status | planned |
| Traces to | L2-050, L2-051, L2-052, L2-053, L2-055, L2-059, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-080, L2-085 |
| Design system | [`review.html`](../../design-system/components/review.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/own-review`](../../mocks/pages/caterer/own-review.html), [`pages/caterer/can-review`](../../mocks/pages/caterer/can-review.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`pages/caterer/no-reviews`](../../mocks/pages/caterer/no-reviews.html), [`pages/dashboard-reviews/default`](../../mocks/pages/dashboard-reviews/default.html), [`pages/dashboard-reviews/loading`](../../mocks/pages/dashboard-reviews/loading.html), [`pages/admin-reviews/default`](../../mocks/pages/admin-reviews/default.html), [`pages/admin-reviews/hidden`](../../mocks/pages/admin-reviews/hidden.html), [`pages/admin-reviews/loading`](../../mocks/pages/admin-reviews/loading.html), [`dialogs/review-response/default`](../../mocks/dialogs/review-response/default.html), [`dialogs/moderate-review/remove`](../../mocks/dialogs/moderate-review/remove.html), [`dialogs/resolve-report/default`](../../mocks/dialogs/resolve-report/default.html) |
| Rendering | [`review.html`](review.html) |

## Purpose and scope

A review is what a customer said about their event, and the caterer's one
public answer: a ruled row of plain text — who ("Marcia T."), when ("Event in
August 2026"), how many stars, what they wrote — and optionally "Response from
Pelau House". The same row serves four audiences with different parts switched
on: the public caterer page; the author's own review with its badge, edit
window and Edit / Delete; the caterer's dashboard with the posted date, "No
response yet" and Respond / Edit response; and the operator's moderation list,
where the caterer leads, the reviewer follows, a status explains why the
review is held or hidden and the flagged text is highlighted.

`sh-review-list` is the ruled list that holds reviews and its loading
skeletons. Use something else for enquiry conversations
([message](message.md)), report entries and the recent-changes feed (list rows
or table, D-6), and the average at the top of the section
([rating](rating.md) summary).

Out of scope:

- Paging: the 10-per-page order, newest first, and "Show more reviews"
  (L2-051.4) belong to the reviews section; it renders a [button](button.md)
  under the list and announces the new count.
- The dialogs the actions open (review, delete-review, review-response,
  moderate-review): [dialog](dialog.md). The review returns focus by leaving
  the action buttons in place.
- Section-level empty and error states ("No reviews yet", "Your first review is
  on its way", "No reviews to check"): [empty state](empty-state.md).
- Detecting links, emails and phone numbers to hold a review (L2-050.3): the
  API; the review highlights the ranges it is given.

## Usage

Inventory from `usage_inventory.py docs/mocks review "li|div|article"` (151
items on 10 screens) and `… review-list "ul|ol"` (41).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default`, `long`, `signed-in`, `more-dishes` … | public | Marcia T. (5, August 2026, response "Thank you, Marcia. Give your aunt our regards!"), Andre C. (5), Nadia J. (4) … 10 of 23 | published, responded | canvas |
| `pages/caterer/own-review` | own | Marcia T. + "Your review" badge, response, "You can edit this review until Tue 20 Oct.", Edit / Delete | own, responded | canvas |
| `pages/caterer/edge` | public | Anne-Marie F. (3): text with `<script>alert(1)</script>` and `https://example.com` shown as plain text | published | canvas |
| `pages/dashboard-reviews/default`, `dialogs/review-response/*` (page behind) | caterer | "Event in July 2026 · Posted Mon 3 Aug"; "No response yet"; Respond / Edit response | awaiting response, responded | canvas |
| `pages/dashboard-reviews/loading` | list `busy`, 3 public skeletons | — | loading | canvas |
| `pages/admin-reviews/default` | operator | Sugar Dumplin photo + name, "by Priya R. · Event in September 2026", "Held · contains a phone number", "Today, 7:58 a.m.", flagged "416-555-0187"; Approve / Keep hidden / Remove | held | canvas |
| `pages/admin-reviews/hidden`, `dialogs/moderate-review/*`, `pages/admin-report/*`, `dialogs/resolve-report/*` | operator | Maracas Bay, "by Devon W. · Event in July 2026", "Hidden automatically · 3 reports"; Restore / Remove | hidden | canvas, dialog |
| `pages/admin-reviews/loading` | list `busy`, operator skeletons | — | loading | canvas |
| `dialogs/resolve-report/default` | operator, no actions, published status | "Showing on Maracas Bay’s page" | published | dialog |

Not product uses of `sh-review` (D-6): the report entries on
`pages/admin-report/*` ("Fake or spam · Thu 8 Oct, 4:12 p.m. · Signed-in
customer") and the change entries on `pages/admin-changes/*` and
`dialogs/revert-change/*`, which borrow `.review` classes for layout.

## Anatomy

1. **Item** — `li.review`: a column, `--space-6` block padding, `--space-2`
   between parts, a `--color-border-default` rule below.
2. **Head** — `div.review__head`: a wrapping row, `--space-2` × `--space-4`
   gaps.
   - **Caterer photo (operator only)** — `span.photo.photo--xs` with a
     decorative `img` (`alt=""`), 40 px round.
   - **Author** — `span.review__author`: "Marcia T." (or the caterer's name in
     the operator variant), `--text-label` at `--font-size-md`.
   - **Own badge (own only)** — [badge](badge.md) neutral, "Your review".
   - **Date line** — `span.review__date`: "Event in August 2026", plus
     "· Posted Tue 1 Sep" (caterer), "by Priya R. ·" first (operator), and
     "· Edited" when edited (D-3). Muted, small.
   - **Stars** — [rating](rating.md) `sh-stars`, "5 out of 5".
3. **Moderation line (operator only)** — `p.cluster` holding a
   [status label](status.md) ("Held · contains a phone number") and a
   `span.text-caption` time ("Today, 7:58 a.m.").
4. **Body** — `p.review__body`: plain text at `--layout-measure`, wraps
   anywhere; flagged ranges wrapped in `mark.diff-new` (operator only).
5. **Response (optional)** — `div.review__response`: indented `--space-4`
   behind a `--border-width-thick` rule, with `span.review__response-label`
   "Response from Pelau House" and a `p.review__body`.
6. **Awaiting status (caterer only)** — `p.status.status--pending` "No response
   yet".
7. **Edit window (own only)** — `p.text-caption` "You can edit this review until
   Tue 20 Oct."
8. **Actions (optional)** — `div.review__actions`: a wrapping row of small
   [buttons](button.md) projected by the consumer.
9. **Skeleton** — `li.review` with `aria-hidden="true"` holding text skeletons
   (public/caterer) or a photo circle, title, three lines and an action bar
   (operator).
10. **List** — `ul.review-list`: list reset, rule on top; `aria-busy="true"`
    while loading.

Hosts: both are `display: contents`, so the `li` sits directly in the `ul`.

## API

### `sh-review` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'public' \| 'own' \| 'caterer' \| 'operator'` | `'public'` | no | Decides which optional parts may show (table below). Adds no class. |
| `author` | `string` | — | yes | First name and last initial ("Marcia T.", "Jean-Robert P."), already shortened by the API (L2-051.3). In `operator` it is the caterer's business name. Rendered as text. |
| `reviewer` | `string \| null` | `null` | yes for `operator` | "by Priya R.", translated with the name by the consumer; first in the date line. |
| `eventLabel` | `string` | — | yes | "Event in August 2026" (month and year in `America/Toronto`, formatted by the consumer). |
| `postedLabel` | `string \| null` | `null` | no | "Posted Tue 1 Sep"; shown only in `caterer`. |
| `editedLabel` | `string \| null` | `null` | no | "Edited" when the author edited the review (L2-053.1); appended to the date line in every variant. |
| `rating` | `1 \| 2 \| 3 \| 4 \| 5` | — | yes | Passed to `sh-stars`. |
| `ratingLabel` | `string` | — | yes | "5 out of 5". |
| `body` | `string` | — | yes | The review text, rendered as text only: no HTML, no links, line breaks kept (L2-050.4, L2-080). |
| `highlights` | `Array<{ start: number; end: number }>` | `[]` | no | Character ranges of `body` to wrap in `mark.diff-new`; `operator` only. |
| `response` | `{ label: string; body: string } \| null` | `null` | no | `label` is "Response from Pelau House" (L2-052.1); `body` is plain text like `body`. |
| `ownLabel` | `string \| null` | `null` | yes for `own` | "Your review", rendered as a neutral [badge](badge.md). |
| `editWindowLabel` | `string \| null` | `null` | no | `own` only: "You can edit this review until Tue 20 Oct." Omitted after the 30-day window (L2-053.2). |
| `awaitingLabel` | `string \| null` | `null` | no | `caterer` only: "No response yet", shown when `response` is null. |
| `moderation` | `{ tone: StatusTone; label: string; detail?: string; time: string } \| null` | `null` | no | `operator` only: the status label ("Held", detail "contains a phone number") and its time ("Today, 7:58 a.m."). |
| `catererPhoto` | `{ src: string; width: number; height: number } \| null` | `null` | yes for `operator` | The caterer's cover photo at 40 × 40, decorative (`alt=""`). |
| `skeleton` | `'public' \| 'operator' \| null` | `null` | no | Renders the loading item in that layout and ignores every other input. |

| Part | public | own | caterer | operator |
|---|---|---|---|---|
| Photo | — | — | — | yes |
| Own badge, edit window | — | yes | — | — |
| Posted date | — | — | yes | — |
| Reviewer in the date line | — | — | — | yes |
| Moderation line, highlights | — | — | — | yes |
| Awaiting status | — | — | yes | — |
| Response | yes | yes | yes | yes |
| Actions slot | no | yes | yes | yes |

### `sh-review-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` and renders `skeletonCount` skeleton items instead of the projected reviews. |
| `skeletonCount` | `number` | `3` | no | Whole number 1–10. |
| `skeletonVariant` | `'public' \| 'operator'` | `'public'` | no | Layout of the skeleton items. |
| `listId` | `string \| null` | `null` | no | `id` on the `ul`, so "Show more reviews" can point `aria-controls` at it. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | The review has no interaction of its own; its action buttons are the consumer's and emit their own events. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-review` `[slot=actions]` | `sh-button` elements, `size="sm"` | Rendered inside `div.review__actions`, only for `own`, `caterer` and `operator`. Each repeated action carries a visually hidden object ("Respond to Andre C.", "Approve review by Priya R. of Sugar Dumplin") through the button's own content. The row is omitted when nothing is projected. |
| `sh-review-list` default | `sh-review` elements | Hidden while `busy`. |

- Translation: every label input (`eventLabel`, `postedLabel`, `editedLabel`,
  `ratingLabel`, `reviewer`, `ownLabel`, `editWindowLabel`, `awaitingLabel`,
  `response.label`, `moderation.label`/`detail`) comes from the resource files
  (L2-064). `author`, `body` and `response.body` are user content, shown as
  written in any language. " · " is punctuation.

## Variants and sizes

| Variant | Use for | Example |
|---|---|---|
| Public | The caterer page | Nadia J., 4 stars, "Curry goat was the star. I’d ask for the callaloo a little thicker next time." |
| Own | The author's review on the caterer page | Marcia T. + "Your review", edit window, Edit / Delete |
| Caterer | Kendra's reviews page | Andre C., "Event in July 2026 · Posted Mon 3 Aug", "No response yet", "Respond to Andre C." |
| Operator | Reviews moderation, report handling | Sugar Dumplin "by Priya R.", held, Approve / Keep hidden / Remove |

One size and one density. The body is capped at `--layout-measure` on every
screen; action buttons are [button](button.md)'s small size (36 px from 48rem,
44 px below).

## States

| State | Trigger | Visual | Assistive technology | Who sees it · counts? |
|---|---|---|---|---|
| Published | default | Head, body | Text in order; stars "5 out of 5" | Everyone · yes |
| Responded | `response` set | Indented response with its label | Label read before the response | Everyone · yes |
| Awaiting response | `caterer`, `response` null | "No response yet" (pending dot) | Status text | Caterer · yes |
| Edited | `editedLabel` set | "· Edited" in the date line | Read with the date | Everyone · yes |
| Own | `own` | Badge, edit window, Edit / Delete | "Marcia T. Your review" | Author only |
| Edit window passed | `own`, `editWindowLabel` null, no Edit button | Delete only | — | Author only |
| Held | `operator`, moderation `held` | Status, time, highlighted text | Highlight is a `mark` (announced as highlighted where supported) | Operators · no |
| Hidden | `operator`, moderation `hidden` | "Hidden automatically · 3 reports" or "Hidden by Tomas Reyes"; Restore / Remove | Status text | Operators · no |
| Removed | — | Not rendered anywhere | — | Nobody · no |
| Loading | list `busy` | Skeleton items in the final layout | List `aria-busy`, items hidden | — |
| Hover, focus | — | None on the review; its buttons have their own | Not focusable | — |

## Markup

```html
<!-- rendered: public, responded -->
<ul class="review-list" id="review-list">
  <li class="review">
    <div class="review__head"><span class="review__author">Marcia T.</span><span class="review__date">Event in August 2026</span><span class="stars" role="img" aria-label="5 out of 5">…</span></div>
    <p class="review__body">The pelau tasted like my aunt’s. Ninety people, not a grain left.</p>
    <div class="review__response"><span class="review__response-label">Response from Pelau House</span><p class="review__body">Thank you, Marcia. Give your aunt our regards!</p></div>
  </li>
</ul>
```

```html
<!-- rendered: own -->
<li class="review">
  <div class="review__head"><span class="review__author">Marcia T.</span><span class="badge">Your review</span><span class="review__date">Event in August 2026</span><span class="stars" role="img" aria-label="5 out of 5">…</span></div>
  <p class="review__body">The pelau tasted like my aunt’s. Ninety people, not a grain left.</p>
  <div class="review__response">…</div>
  <p class="text-caption">You can edit this review until Tue 20 Oct.</p>
  <div class="review__actions"><button class="btn btn--sm" type="button" aria-haspopup="dialog"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Edit<span class="visually-hidden"> your review</span></button><button class="btn btn--sm btn--ghost" type="button" aria-haspopup="dialog"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Delete<span class="visually-hidden"> your review</span></button></div>
</li>
```

```html
<!-- rendered: caterer, awaiting response -->
<li class="review">
  <div class="review__head"><span class="review__author">Andre C.</span><span class="review__date">Event in July 2026 · Posted Mon 3 Aug</span><span class="stars" role="img" aria-label="5 out of 5">…</span></div>
  <p class="review__body">Doubles for 60 at the office, hot and on time. Kendra answered every question the same day.</p>
  <p class="status status--pending">No response yet</p>
  <div class="review__actions"><button class="btn btn--sm" type="button" aria-haspopup="dialog">Respond<span class="visually-hidden"> to Andre C.</span></button></div>
</li>
```

```html
<!-- rendered: operator, held -->
<li class="review">
  <div class="review__head"><span class="photo photo--xs"><img src="…/sugar-dumplin-80.avif" alt="" width="40" height="40"></span><span class="review__author">Sugar Dumplin</span><span class="review__date">by Priya R. · Event in September 2026</span><span class="stars" role="img" aria-label="5 out of 5">…</span></div>
  <p class="cluster"><span class="status status--held">Held · contains a phone number</span><span class="text-caption">Today, 7:58 a.m.</span></p>
  <p class="review__body">The tamarind balls and sugar cake were gone in ten minutes. Call Ondine on <mark class="diff-new">416-555-0187</mark>, she’s the best!</p>
  <div class="review__actions">…Approve<span class="visually-hidden"> review by Priya R. of Sugar Dumplin</span>…Keep hidden…Remove…</div>
</li>
```

```html
<!-- rendered: loading (public / caterer) -->
<ul class="review-list" aria-busy="true">
  <li class="review" aria-hidden="true"><span class="skeleton skeleton--text" style="width: 12rem"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text" style="width: 70%"></span></li>
  … (3 in all)
</ul>
```

The operator skeleton is `li.review[aria-hidden]` with a `.review__head`
holding `span.photo.photo--xs > .skeleton.skeleton--circle` and a 40 % text
bar, then text bars of 30 %, 90 % and 60 % and a `.skeleton--rect` action bar
of `--control-height-sm`.

Consumer templates (binding syntax illustrative):

```html
<sh-review-list [busy]="loading()" listId="review-list">
  @for (r of page().reviews; track r.id) {
    <sh-review [author]="r.author" [eventLabel]="t('review.event', { month: r.eventMonth })" [rating]="r.rating" [ratingLabel]="t('reviews.outOf5', { value: r.rating })"
      [body]="r.text" [response]="r.response && { label: t('review.responseFrom', { name: caterer.name }), body: r.response.text }"
      [editedLabel]="r.edited ? t('review.edited') : null"></sh-review>
  }
</sh-review-list>

<sh-review variant="caterer" … [postedLabel]="t('review.posted', { date: r.postedAt })" [awaitingLabel]="t('review.noResponse')">
  <sh-button slot="actions" size="sm" haspopup="dialog" (activated)="respond(r)">{{ t('review.respond') }}<span class="visually-hidden"> {{ t('review.respondTo', { name: r.author }) }}</span></sh-button>
</sh-review>
```

The e2e page objects locate reviews by `.review`, `.review__author`,
`.review__date`, `.stars[role="img"]`, `.review__body`, `.review__response`
and its label, `.review__actions` buttons by name, `mark.diff-new`, the status
classes and the list's `aria-busy`; those are part of the contract.

## Design

- List: list reset, `--border-width-hairline` `--color-border-default` rule on
  top; each item ruled below.
- Item: flex column, `--space-6` block padding, `--space-2` gap.
- Head: wrapping row, `--space-2` row gap, `--space-4` column gap; author
  `--text-label` at `--font-size-md`; date `--text-body-sm`, muted.
- Body: `--layout-measure` max width, `overflow-wrap: anywhere`, default text
  style; `mark.diff-new` uses `--color-warning-bg` with `--radius-xs`.
- Response: `--space-2` top margin, `--space-4` left padding,
  `--border-width-thick` `--color-border-default` rule, `--space-1` gap; label
  `--text-label`.
- Edit window: `.text-caption`. Moderation line: `.cluster` with its default
  gap (the mocks' inline gap is drift).
- Actions: wrapping row, `--space-2` gap.
- Motion and layers: none, apart from skeleton shimmer.

Component tokens: none. The response is set apart by indent and label, never a
tinted box.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Author, body, response | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Date, edit window | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Rules, response bar | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Held / awaiting status | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Hidden status | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Flagged-text highlight | `--color-warning-bg` | `--palette-mango-50` | `--palette-mango-950` |
| Stars | `--color-star` / `--color-star-empty` | see [rating](rating.md) | see [rating](rating.md) |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Author, body, response |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Date line, edit window |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | "Held …", "No response yet" |
| `--color-fg-default` | `--color-warning-bg` | 4.5:1 | Highlighted flagged text |
| `--color-star` | `--color-bg-canvas` | 3:1 | Filled stars |
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | A review shown inside a dialog |

The rules are decorative separators and need no 3:1. Forced colours: rules
become `CanvasText` hairlines; the `mark` keeps the system `Mark` colours.

## Responsive behaviour

- The head wraps: at 360 px "Marcia T." and "Event in August 2026" fit on one
  line and the stars drop to the next; from 36rem everything sits on one line.
  In the operator variant the 40 px photo stays first.
- Body and response wrap anywhere, so a pasted URL never pushes the page
  sideways at 320 px.
- Actions wrap onto as many rows as needed; below 48rem the small buttons are
  44 px tall with 8 px between them, from 48rem 36 px with 8 px between.
- The list is one column at every width; the dashboard caps it at 48rem.
- At 200 % zoom on a 1280 px window nothing is lost or scrolls sideways.

## Accessibility

### Role and pattern

A plain `ul` of `li` under the section's "Reviews" `h2`. No widget pattern;
actions are buttons that open dialogs ([APG
Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Public: reviews are not focusable; Tab passes to "Show more reviews". Elsewhere: each review's actions in order. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | On an action: opens its dialog; closing it returns focus to the same button. |

### Focus

The shared ring on each action button. After a review is removed or deleted,
the page moves focus to the next review's first action, or to the list heading
if it was the last; the review keeps its buttons stable so the dialog can
return focus.

### Labelling

- Repeated action words carry a visually hidden object: "Respond to Andre C.",
  "Edit response to Devon W.", "Edit your review", "Approve review by Priya R.
  of Sugar Dumplin". Visible text starts the name (WCAG 2.5.3).
- Stars are one image: "4 out of 5".
- The response label is visible text, so the response is never mistaken for
  the reviewer's words.
- The operator photo is decorative (`alt=""`); the caterer's name follows as
  text.

### Announcements

None from the review. The list's `aria-busy` covers loading; the section
announces "Showing 20 of 23 reviews" after "Show more reviews".

### Motion

None. Rows appear and disappear without animation; skeletons stop shimmering
under `prefers-reduced-motion: reduce`.

## Content and internationalisation

- Author: first name and last initial — "Marcia T.", "Jean-Robert P." Never a
  full surname, a neighbourhood or a precise posting time on public pages.
- Date: the event month, "Event in August 2026". Caterers add "· Posted Tue
  1 Sep". Edited reviews add "· Edited".
- Response label: "Response from Pelau House", always the business name.
- Edit window: "You can edit this review until Tue 20 Oct."
- Moderation reasons name the trigger: "Held · contains a phone number",
  "Held · contains a link", "Hidden automatically · 3 reports", "Hidden by
  Tomas Reyes".
- Reviews are shown exactly as written; markup and links are plain text
  ("Someone typed <script>alert(1)</script> here …").

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the joined date line, the
  body split into text and `mark` segments) are computed once, not in the
  template.
- Body text is inserted as text nodes, never through an HTML sink; highlights
  are built from ranges, not by injecting markup.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Review.ts`
  renders Pelau House's first 10 reviews from the cast (Marcia T. with
  response, Andre C., Nadia J., Jean-Robert P., Devon W., Simone A., Kwame O.,
  Rhea M., Leon B., Tara S.); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CatererPage`, `DashboardReviews`, `AdminReviews`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: skeleton items match the final layout; reviews are
  server-rendered on the caterer page; the operator photo reserves 40 × 40.
- Weight: composes [rating](rating.md), [badge](badge.md),
  [status label](status.md), [photo](photo.md) and [button](button.md) only.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia Thompson's 5-star review of Pelau House for an event in August 2026, when the caterer page renders it, then the head shows "Marcia T.", "Event in August 2026" and stars labelled "5 out of 5", and no full surname appears. (L2-051)
- **AC-2** Given Pelau House responded to Marcia's review, when it renders, then a `div.review__response` follows the body with the label "Response from Pelau House" and the text "Thank you, Marcia. Give your aunt our regards!". (L2-052)
- **AC-3** Given Anne-Marie F.'s review text contains `<script>alert(1)</script>` and `https://example.com`, when it renders, then both appear as literal text, no script runs and the URL is not a link. (L2-080)
- **AC-4** Given a review text containing `<b>great</b>`, when the public page renders, then the tags show as literal text and the word is not bold. (L2-050)
- **AC-5** Given Marcia edited her review 10 days after posting, when it renders, then the date line reads "Event in August 2026 · Edited". (L2-053)
- **AC-6** Given Marcia views her own review within the edit window, when it renders, then it shows the "Your review" badge, "You can edit this review until Tue 20 Oct." and the actions "Edit your review" and "Delete your review". (L2-053)
- **AC-7** Given Marcia's own review was posted 31 days ago, when it renders, then no edit-window text and no Edit action appear, and "Delete your review" remains. (L2-053)
- **AC-8** Given Kendra's reviews page and Andre C.'s review without a response, when it renders, then the date line reads "Event in July 2026 · Posted Mon 3 Aug", "No response yet" shows as a pending status, and the action's accessible name is "Respond to Andre C.". (L2-052)
- **AC-9** Given Priya R.'s review of Sugar Dumplin held for a phone number, when Leah's moderation list renders, then the head leads with Sugar Dumplin's 40 px photo and name, the date line reads "by Priya R. · Event in September 2026", the status reads "Held · contains a phone number" with "Today, 7:58 a.m.", and "416-555-0187" is wrapped in `mark.diff-new`. (L2-050)
- **AC-10** Given Devon W.'s review of Maracas Bay hidden after 3 reports, when the hidden tab renders, then it shows "Hidden automatically · 3 reports" and the actions "Restore review by Devon W. of Maracas Bay" and "Remove review by Devon W. of Maracas Bay". (L2-055)
- **AC-11** Given Leah approves Priya R.'s held review, when the moderation list updates, then that review leaves the held list and the next review's first action receives focus. (L2-059)
- **AC-12** Given the caterer's reviews page is loading, when `sh-review-list` renders with `busy`, then the `ul.review-list` has `aria-busy="true"` and three `li.review` skeletons with `aria-hidden="true"`. (L2-066)

### Keyboard and focus

- **AC-13** Given Pelau House's public reviews, when a keyboard user tabs through the section, then no review receives focus and the next stop after the list is "Show more reviews". (L2-067)
- **AC-14** Given Kendra activates "Respond to Andre C." and then closes the dialog with Escape, when the dialog closes, then focus is back on "Respond to Andre C.". (L2-067)

### Screen readers

- **AC-15** Given Kendra's reviews page with five reviews, when the action buttons are listed by a screen reader, then each has a distinct name such as "Respond to Andre C." or "Edit response to Devon W.", and none is just "Edit response". (L2-068)
- **AC-16** Given the caterer page, dashboard reviews and operator moderation pages, when axe-core runs with WCAG 2.1 A and AA rules in each review state, then it reports 0 violations. (L2-066)

### Theming

- **AC-17** Given the light and the dark theme, when a review renders on the page, then the author and body have at least 4.5:1, the date at least 4.5:1, and "Held · contains a phone number" at least 4.5:1 contrast against `--color-bg-canvas`. (L2-069)
- **AC-18** Given the light and the dark theme, when the flagged "416-555-0187" renders, then its text has at least 4.5:1 contrast against `--color-warning-bg`, and the review is also marked held in words. (L2-069)

### Responsive

- **AC-19** Given a 360 px viewport, when Marcia's review renders, then "Marcia T." and "Event in August 2026" share the first line and the stars wrap to the next, with nothing clipped. (L2-064)
- **AC-20** Given a 320 px viewport, when Anne-Marie F.'s review with an unbroken URL renders, then the text wraps inside the column and the page does not scroll horizontally. (L2-064)
- **AC-21** Given a 360 px viewport, when Leah's held review renders with Approve, Keep hidden and Remove, then each button is at least 44 CSS px tall and neighbouring buttons are at least 8 px apart. (L2-065)
- **AC-22** Given a 1280 px window at 200 % zoom, when the dashboard reviews render, then every review's text and actions are visible without horizontal scrolling. (L2-069)

### Motion

- **AC-23** Given `prefers-reduced-motion: reduce`, when the review list is loading, then the skeleton items do not shimmer. (L2-069)

### Performance

- **AC-24** Given the caterer page with 10 reviews, when "Show more reviews" appends the next 10, then the reviews already shown do not move (no layout shift above the button) and the `Review` perf-test scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/review/`; files
  `review.component.*` (`sh-review`, `ReviewComponent`) and
  `review-list.component.*` (`sh-review-list`, `ReviewListComponent`).
- Composes `sh-stars` from [rating](rating.md), [badge](badge.md),
  [status label](status.md) (`sh-status`), [photo](photo.md) (`photo--xs`) and
  [skeleton](skeleton.md); actions are [button](button.md)s projected by the
  consumer.
- Styles: the "Review" section of `components.css` moves into the component,
  class names unscoped. The moderation line drops the mocks' inline
  `style="gap: …"`.
- Mock drift to fix as screens are built: the own-review edit window sits in
  `p.review__date` (it becomes `p.text-caption`); dashboard "Edit response"
  buttons do not name the reviewer; "Show more reviews" lacks
  `aria-controls`; `mark class='diff-new'` uses single quotes (harmless).
- No CDK primitive is needed in the review itself; the dialogs it opens use
  the dialog component.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component with variants, or four?* One, with `variant` deciding which optional parts may render. The design system describes one row with parts switched on per audience, and all four share the head, body and response markup.
- **D-3** *Where does "Edited" go?* At the end of the date line, "Event in August 2026 · Edited". L2-053.1 requires the label but no mock or design-system rendering shows it; the date line is the muted metadata line where it reads as a fact, not a warning.
- **D-4** *Are actions inputs or a slot?* A slot of `sh-button`s. The four variants have different actions and dialogs, and the consumer owns the dialog and focus return; the review only lays the row out.
- **D-5** *How is flagged text highlighted?* With ranges from the API wrapped in `mark.diff-new`, never by injecting HTML into the body, so the body stays text-only (L2-080).
- **D-6** *Do report entries and change entries render through `sh-review`?* No. The design system flags `pages/admin-report/*` reusing `.review` for reports as drift; `pages/admin-changes/*` and `dialogs/revert-change/*` borrow the same classes for "Was / Now" change entries. Neither has a rating, an author or a response, so they belong to list rows; the review's API does not stretch to them.
- **D-7** *Does a deleted customer's review stay, shown as "Former Sweet Hand user"?* No. L2-072.3 removes a deleted customer's reviews and recalculates the average; the design system's "Former user" specimen contradicts it and no mock uses it. The CRD follows L2 and renders no such review; `author` is plain data, so if product later keeps anonymised reviews nothing in the API changes. Raised to the user as a conflict.
- **D-8** *Where does the edit window sit?* In its own `p.text-caption` after the response, as the design system decided (the mock put it in `.review__date`).
