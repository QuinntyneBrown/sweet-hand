# Rating

| Field | Value |
|---|---|
| Selector | `sh-rating-summary` (average and count), `sh-stars` (one review's score), `sh-star-input` (the five-star radio group) |
| Library path | `frontend/projects/components/src/lib/rating/` |
| Status | planned |
| Traces to | L2-050, L2-051, L2-053, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`rating.html`](../../design-system/components/rating.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`pages/caterer/no-reviews`](../../mocks/pages/caterer/no-reviews.html), [`dialogs/review/default`](../../mocks/dialogs/review/default.html), [`dialogs/review/edit`](../../mocks/dialogs/review/edit.html), [`dialogs/review/invalid`](../../mocks/dialogs/review/invalid.html), [`dialogs/review/busy`](../../mocks/dialogs/review/busy.html), [`dialogs/review/failed`](../../mocks/dialogs/review/failed.html), [`pages/dashboard-reviews/default`](../../mocks/pages/dashboard-reviews/default.html), [`pages/admin-reviews/hidden`](../../mocks/pages/admin-reviews/hidden.html), [`dialogs/moderate-review/default`](../../mocks/dialogs/moderate-review/default.html), [`dialogs/resolve-report/default`](../../mocks/dialogs/resolve-report/default.html) |
| Rendering | [`rating.html`](rating.html) |

## Purpose and scope

Stars, three ways. The **summary** is the caterer's average as a number with
one decorative star — "4.7 · 23 reviews" at the head of Pelau House's Reviews
section — and, as text only, in the facts line under the name, where it links
to the reviews. The **stars** are one review's whole-number score, five 16 px
stars read as "4 out of 5". The **star input** is the five-star radio group
("Your rating") Jean-Robert Pierre uses to rate his event in the review dialog.
The number always carries the value; the stars only echo it. The stars are
ink, never gold and never pepper.

Use something else for the full review with author, date, text and response
([review](review.md), which composes `sh-stars`), for a count of anything else
(plain text or a [badge](badge.md)), and for setup progress (meter). When a
caterer has no reviews the reviews section shows "No reviews yet" as text; the
rating renders nothing (D-4).

Out of scope:

- Calculating the average and count, leaving out held, hidden and removed
  reviews (L2-051.5): the API does it; the summary formats what it receives.
- Deciding who may write a review and when ("Write a review", L2-049): the
  caterer page.
- The review dialog itself, its text field, error summary and submit button:
  [dialog](dialog.md), [textarea](textarea.md) and [button](button.md). The star
  input supplies its own group-level error and takes part in the summary
  through its `id`.
- The facts-line link to `#reviews` (`.caterer-head__meta a`): the caterer
  head owns the link; the summary supplies its text.

## Usage

Inventory from `usage_inventory.py docs/mocks stars "span|div"` (96 on 8
screens), `… rating "span|div|p|a"` (6) and `… star-input "div|fieldset"` (5).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default` and its states, Reviews head | summary `head` | "4.7 · 23 reviews" | default | section head |
| `pages/caterer/*` facts line under the name | summary `inline` inside the head's link | "Rated " (hidden) + "4.7 · 23 reviews" | default | canvas |
| `pages/caterer/edge` | summary `head` and `inline` | "3.0 · 1 review" | one review, whole-number average | canvas |
| `pages/caterer/no-reviews` (Green Fig Catering) | none | "No reviews yet" is the section's text | count 0: nothing rendered | canvas |
| `pages/caterer/*` review heads, `pages/caterer/own-review` | stars | "5 out of 5" (Marcia T.), "5 out of 5" (Andre C.), "4 out of 5" (Nadia J.) | default | canvas |
| `pages/dashboard-reviews/default`, `dialogs/review-response/*` | stars | "5 out of 5", "4 out of 5" | default | canvas, page behind a dialog |
| `pages/admin-reviews/*`, `dialogs/moderate-review/*`, `pages/admin-report/*`, `dialogs/resolve-report/*`, `dialogs/open-enquiry` (page behind) | stars | "4 out of 5", "2 out of 5", "1 out of 5" (Devon W.'s review of Maracas Bay) | default | canvas, dialog |
| `dialogs/review/default` (Jean-Robert P., event Sun 6 Sep) | star input, legend "Your rating" | "1 star" … "5 stars" | unrated, first star autofocused, hover preview, focus | dialog |
| `dialogs/review/edit` (Marcia T.) | star input | 5 checked | selected | dialog |
| `dialogs/review/invalid` | star input with error | "Choose a rating from 1 to 5 stars" | invalid | dialog |
| `dialogs/review/busy` | star input | 5 checked | disabled while posting | dialog |
| `dialogs/review/failed` | star input | value kept | selected, enabled again | dialog |

## Anatomy

**Summary** (`sh-rating-summary`, variant `head`):

1. **Wrapper** — `span.rating`: inline flex, `--space-2` gap.
2. **Star** — `span.stars` with `aria-hidden="true"` holding one filled
   `svg.icon` (no `aria-hidden` on the icon itself is needed; its parent hides
   it).
3. **Text** — `span.rating__summary`: "4.7 · 23 reviews", `--text-h3`,
   tabular figures.

**Summary** (variant `inline`): a visually hidden "Rated " followed by the same
text, with no wrapper class, for the consumer's link.

**Stars** (`sh-stars`):

1. **Image** — `span.stars` with `role="img"` and `aria-label="4 out of 5"`.
2. **Icons** — five `svg.icon` with `aria-hidden="true"`: filled for the score,
   `.icon--empty` for the rest. `--icon-size-sm`, `--space-0-5` apart.

**Star input** (`sh-star-input`):

1. **Group** — `fieldset` (no class; `.star-input` resets borders when placed
   on a fieldset) with `legend` "Your rating".
2. **Row** — `div.star-input`.
3. **Radios** — five `input type="radio"` with one shared `name`, values 1–5,
   visually hidden but focusable and in the accessibility tree.
4. **Star labels** — `label for` each radio: a `--target-comfortable` circle
   holding visually hidden "1 star" … "5 stars" and a `--icon-size-xl` star;
   `data-filled` paints it `--color-star`.
5. **Error** — `span.field__error` with an `id`, after the row, only when
   invalid.

Hosts: all three are `display: contents`, so `.caterer-section__head`, the
wrapping `.review__head` and the dialog's `.stack` lay out the real elements.

## API

### `sh-rating-summary` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'head' \| 'inline'` | `'head'` | no | `head` renders `span.rating` with the star; `inline` renders hidden prefix plus text only. |
| `average` | `number` | — | yes | The published average from the API (1.0–5.0). Always shown with exactly one decimal in the page locale ("4.7", "3.0"), rounded half away from zero. |
| `count` | `number` | — | yes | Number of published reviews. `0` renders nothing at all (D-4). |
| `countLabel` | `string` | — | yes | The count with its noun, translated and pluralised by the consumer: "23 reviews", "1 review". |
| `ratedPrefix` | `string` | — | yes for `inline` | The hidden prefix "Rated", followed by a space by the component. |

### `sh-stars` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `1 \| 2 \| 3 \| 4 \| 5` | — | yes | Whole stars only. Values outside 1–5 or non-integers are not rendered (D-5). |
| `label` | `string` | — | yes | The accessible label, translated: "4 out of 5". |

### `sh-star-input` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `1 \| 2 \| 3 \| 4 \| 5 \| null` | `null` | no | The checked radio; `null` checks none and leaves every star empty. Two-way with `valueChange`. |
| `name` | `string` | `'rating'` | no | Shared radio `name`, submitted with the form. |
| `idPrefix` | `string` | `'star'` | no | Radio ids are `{idPrefix}-1` … `{idPrefix}-5` so the dialog's error summary can link to `#star-1`. |
| `legend` | `string` | — | yes | "Your rating". |
| `starLabels` | `[string, string, string, string, string]` | — | yes | "1 star", "2 stars", "3 stars", "4 stars", "5 stars". |
| `error` | `string \| null` | `null` | no | When set, renders `span.field__error#{idPrefix}-error` under the row and puts `aria-invalid="true"` and `aria-describedby="{idPrefix}-error"` on every radio. |
| `disabled` | `boolean` | `false` | no | Sets `disabled` on the `fieldset` (never on single radios, D-6); the value stays visible. |
| `autofocus` | `boolean` | `false` | no | Focuses the checked radio (or radio 1) when the dialog opens; the review dialog sets it. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `sh-star-input` `valueChange` | `1 \| 2 \| 3 \| 4 \| 5` | The user checks a star by click, tap, arrow keys or Space. Not emitted while `disabled`, and not for hover previews. |
| `sh-rating-summary`, `sh-stars` | — | Not interactive. |

### Content slots

None on any of the three: every string is an input, so nothing else can be
added inside a rating.

- Form participation: `sh-star-input` is a native radio group, so a plain form
  submits `rating=4`; with a forms library it acts as one value control
  (`value`/`valueChange`), validated "required, 1–5".
- Translation: `countLabel`, `ratedPrefix`, `label`, `legend`, `starLabels` and
  `error` come from the resource files (L2-064). The average is formatted with
  the page locale ("4,7" in French).

## Variants and sizes

| Variant | Element | Use for |
|---|---|---|
| Summary, head | `span.rating` | Reviews section head |
| Summary, inline | text in the consumer's link | Facts line under the caterer name |
| Stars | `span.stars[role="img"]` | One review's score |
| Star input | `fieldset > .star-input` | Rating an event in the review dialog |

| Size | Icon | Box | Gap |
|---|---|---|---|
| Display (summary star, stars) | `--icon-size-sm` (16 px) | — | `--space-0-5` |
| Input | `--icon-size-xl` (28 px) | `--target-comfortable` (44 px) circle | `--space-2` below 48rem (D-7), `--space-1` from 48rem |

Sizes are chosen by job, never by breakpoint. The summary text is
`--text-h3`.

## States

| State | Part | Trigger | Visual | Assistive technology |
|---|---|---|---|---|
| Default | summary, stars | — | Filled and empty stars, number | Summary: text; stars: "4 out of 5" |
| No reviews | summary | `count` 0 | Nothing rendered | Nothing |
| Unrated | input | `value` null | Five empty stars (`--color-star-empty`, 3:1) | "Your rating, group; 1 star, radio, not checked, 1 of 5" |
| Hover (3) | input | pointer over star 3 | `--color-bg-subtle` disc behind star 3 (fades over `--duration-fast`), `data-filled` preview on 1–3; restored on leave | Nothing changes until a star is checked |
| Focus | input | `input:focus-visible + label` | `--focus-ring-width` ring in `--color-focus-ring`, no offset, round | Focus on the radio |
| Selected (4) | input | radio 4 checked | `data-filled` on stars 1–4 | "4 stars, radio, checked, 4 of 5" |
| Invalid | input | `error` set | Error text in `--color-danger-fg` under the row; stars unchanged | `aria-invalid="true"`; description "Choose a rating from 1 to 5 stars" on every radio |
| Disabled (posting) | input | `disabled` | Chosen value still filled; no hover disc, `cursor: not-allowed` | Group and radios disabled; value still read |
| Failed post | input | `disabled` back to false | Value kept, enabled | Focus returns per the dialog |
| Forced colours | all | `forced-colors: active` | Stars use `CanvasText`/`GrayText`; the focus ring becomes `Highlight` | — |

`data-state="hover|focus"` on a label exists for documentation and mocks
only; the component never renders it.

## Markup

```html
<!-- rendered: summary, head -->
<div class="caterer-section__head"><h2 id="reviews-title">Reviews</h2>
  <span class="rating"><span class="stars" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/></svg></span><span class="rating__summary">4.7 · 23 reviews</span></span></div>

<!-- rendered: summary, inline inside the caterer head's link -->
<a href="#reviews"><span class="visually-hidden">Rated </span>4.7 · 23 reviews</a>
```

```html
<!-- rendered: stars -->
<span class="stars" role="img" aria-label="4 out of 5"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><svg class="icon icon--empty" aria-hidden="true" viewBox="0 0 24 24">…</svg></span>
```

```html
<!-- rendered: star input, invalid -->
<fieldset>
  <legend>Your rating</legend>
  <div class="star-input">
    <input type="radio" name="rating" id="star-1" value="1" aria-invalid="true" aria-describedby="star-error"><label for="star-1"><span class="visually-hidden">1 star</span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></label>
    … (stars 2–5 the same, labels "2 stars" … "5 stars")
  </div>
  <span class="field__error" id="star-error">Choose a rating from 1 to 5 stars</span>
</fieldset>

<!-- rendered: star input, 5 selected, posting -->
<fieldset disabled>
  <legend>Your rating</legend>
  <div class="star-input">
    <input type="radio" name="rating" id="star-1" value="1"><label for="star-1" data-filled>…</label>
    …
    <input type="radio" name="rating" id="star-5" value="5" checked><label for="star-5" data-filled><span class="visually-hidden">5 stars</span>…</label>
  </div>
</fieldset>
```

The mocks name the error `rating-error`; with the default `idPrefix` the
component names it `star-error`. Consumers that link the error summary use
`#star-1`, which both agree on.

Consumer templates (binding syntax illustrative):

```html
<sh-rating-summary [average]="caterer.rating.average" [count]="caterer.rating.count" [countLabel]="t('reviews.count', { count: caterer.rating.count })"></sh-rating-summary>
<a href="#reviews"><sh-rating-summary variant="inline" [average]="…" [count]="…" [countLabel]="…" [ratedPrefix]="t('reviews.rated')"></sh-rating-summary></a>
<sh-stars [value]="review.rating" [label]="t('reviews.outOf5', { value: review.rating })"></sh-stars>
<sh-star-input [(value)]="form.rating" [legend]="t('review.ratingLegend')" [starLabels]="starLabels" [error]="errors.rating" [disabled]="posting()" autofocus></sh-star-input>
```

The e2e page objects locate ratings by `.rating`, `.rating__summary`,
`.stars[role="img"]` and its label, `.star-input`, the radios by their label
text, `[data-filled]` and `.field__error`; those are part of the contract. The
star path data is free to change.

## Design

- Summary: inline flex, `--space-2` gap; text `--text-h3`, tabular figures,
  `--color-fg-default`.
- Stars: inline flex, `--space-0-5` gap, icons `--icon-size-sm`, `fill:
  currentColor`, no stroke.
- Star input: flex row; gap `--space-2` below 48rem and `--space-1` from 48rem
  (D-7); labels `--target-comfortable` circles (`--radius-full`), icons
  `--icon-size-xl`; hover disc `--color-bg-subtle` over `--duration-fast` with
  `--ease-standard`; focus ring `--focus-ring-width`, offset 0.
- Legend: the form's legend style (`--text-label`).
- Error: `.field__error` from [form field](form-field.md).
- Layer: none.

Component tokens: none. Two semantic tokens re-skin every star:
`--color-star` and `--color-star-empty`; never colour `.stars .icon`
directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Filled star | `--color-star` | `--palette-stone-950` | `--palette-stone-100` |
| Empty star | `--color-star-empty` | `--palette-stone-500` | `--palette-stone-500` |
| Summary text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Hover disc | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Error text | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-star` | `--color-bg-canvas` | 3:1 | Filled star on the page |
| `--color-star-empty` | `--color-bg-canvas` | 3:1 | Empty star (part of a control in the input) |
| `--color-star` | `--color-bg-surface-raised` | 3:1 | Filled star in the review dialog |
| `--color-star-empty` | `--color-bg-surface-raised` | 3:1 | Empty star in the review dialog |
| `--color-star-empty` | `--color-bg-subtle` | 3:1 | Empty star on its hover disc |
| `--color-star` | `--color-star-empty` | 1.2:1 | Filled vs empty (shape and the number carry the value) |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Summary text |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring in the dialog |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Error text in the dialog |

Forced colours: stars are SVG with `fill: currentColor`, so they follow the
system text colour; the checked state is still visible because filled and
empty stars differ in system colour and the number of filled stars.

## Responsive behaviour

- Sizes never change by breakpoint.
- The star input is five 44 px stars with 8 px gaps below 48rem (252 px) and
  4 px gaps from 48rem (236 px); both fit the full-screen review dialog's
  288 px content width at 320 px.
- `.rating` and `.stars` never wrap internally. In a review head the stars
  drop to their own line when author, date and stars do not fit; in the
  section head the summary moves under "Reviews" on narrow screens and sits
  at the right from about 36rem (the parents wrap).
- At 200 % zoom on a 1280 px window everything stays visible without
  horizontal scrolling.

## Accessibility

### Role and pattern

- Summary: text; the decorative star is inside an `aria-hidden` wrapper.
- Stars: one `role="img"` with `aria-label`; icons `aria-hidden="true"`.
- Star input: a native radio group in a `fieldset` with a `legend` ([APG Radio
  Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)); radios are visually
  hidden but focusable; labels are what people see and tap.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Into the group, to the checked star (or star 1 when none is checked), then out to the review text. |
| <kbd>→</kbd> <kbd>↓</kbd> / <kbd>←</kbd> <kbd>↑</kbd> | Checks the next / previous star and fills up to it; wraps from 5 to 1 and 1 to 5. |
| <kbd>Space</kbd> | Checks the focused star when none is checked yet. |

### Focus

The ring is drawn on the label with no offset, following its round shape. With
`autofocus` the dialog opens with focus on the checked star or star 1, and the
legend is read first: "Your rating, group, 1 star, radio, 1 of 5". A
disabled group drops focus only because the dialog moves it to the busy
button; the component never moves focus itself.

### Labelling

- Each label holds visually hidden "1 star" … "5 stars", so a choice is
  announced as a number.
- The error is tied to every radio with `aria-describedby` and is listed in the
  dialog's error summary, which links to `#star-1`.
- The inline summary's hidden "Rated " makes the facts link read "Rated 4.7 ·
  23 reviews".
- Display stars read "4 out of 5", not "4 stars" or "4/5".

### Announcements

None of its own. The error is announced through the dialog's error summary,
which receives focus on a failed submit.

### Motion

The hover disc fades over `--duration-fast`; `prefers-reduced-motion: reduce`
removes the fade. Preview fill is instant. Stars never bounce or sparkle.

## Content and internationalisation

- Summary: average to one decimal, a middle dot, the count with the right noun:
  "4.7 · 23 reviews", "3.0 · 1 review". Always one decimal, even for whole
  numbers.
- Accessible label: "4 out of 5". Legend: "Your rating". Error: "Choose a
  rating from 1 to 5 stars".
- Zero state (section, not this component): "No reviews yet" and "Reviews come
  from customers after their event." Never "0 reviews", "0.0" or five empty
  stars.
- Translatable: every string input. Data: `average`, `count`, `value`.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the formatted average, the
  filled/empty icon list, each label's `data-filled`) are computed once per
  change, not in the template.
- Hover preview updates `data-filled` on at most five labels with no
  re-render of anything else; one `pointerleave` restores it.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Rating.ts`
  renders Pelau House's "4.7 · 23 reviews" summary, ten review stars from the
  cast, and the star input from Jean-Robert P.'s review dialog with a click on
  star 4; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it
  at roughly 100–300 ms.
- Composite scenarios: `CatererPage`, `ReviewDialog`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: fixed icon sizes; the summary is server-rendered; showing
  or clearing the error adds one line below the row only.
- Weight: no dependencies; one inline star path.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House with 23 published reviews averaging 4.7, when its Reviews section head renders, then it shows `span.rating` with one filled star inside an `aria-hidden` wrapper and `span.rating__summary` reading "4.7 · 23 reviews". (L2-051)
- **AC-2** Given a caterer whose published ratings are 5, 4 and 4, when the summary renders with the API's average, then it reads "4.3 · 3 reviews". (L2-051)
- **AC-3** Given the edge-case caterer with one review rated 3, when the summary renders, then it reads "3.0 · 1 review", with one decimal and the singular noun. (L2-051)
- **AC-4** Given Green Fig Catering with 0 published reviews, when the caterer page renders, then no `.rating`, no star and no "0.0" appear, and the facts line has no rating link. (L2-051)
- **AC-5** Given Nadia J.'s 4-star review of Pelau House, when the review renders, then its `span.stars` has `role="img"`, `aria-label="4 out of 5"`, four filled icons and one `.icon--empty`, all icons `aria-hidden="true"`. (L2-068)
- **AC-6** Given the facts line under "Pelau House", when its link renders, then its accessible name is "Rated 4.7 · 23 reviews" and "Rated" is visually hidden. (L2-068)

### Star input states

- **AC-7** Given Jean-Robert P. opens "Write a review" for Pelau House, when the dialog renders, then the fieldset's legend is "Your rating", no radio is checked, all five stars are empty and focus is on the "1 star" radio. (L2-050)
- **AC-8** Given the unrated star input, when Jean-Robert clicks the fourth star, then radio 4 is checked, stars 1–4 carry `data-filled`, star 5 does not, and `valueChange` emits 4 once. (L2-050)
- **AC-9** Given the unrated star input on a device with a pointer, when the pointer rests on star 3 and then leaves the row, then stars 1–3 show filled while it rests and all return to empty after it leaves, and no value is emitted. (L2-050)
- **AC-10** Given Jean-Robert submits with no rating, when the dialog shows its errors, then every radio has `aria-invalid="true"` and `aria-describedby` pointing to the text "Choose a rating from 1 to 5 stars" under the stars. (L2-068)
- **AC-11** Given the review is posting, when `disabled` is true, then the `fieldset` has `disabled`, none of the five radios can be checked by click or keyboard, and the chosen 5 stars stay filled. (L2-050)
- **AC-12** Given Marcia T. opens "Edit your review" for Pelau House, when the star input renders, then radio 5 is checked and all five stars carry `data-filled`. (L2-053)

### Keyboard and focus

- **AC-13** Given focus on the checked "4 stars" radio, when the user presses → then ← then → twice, then the checked star moves to 5, 4, 5 and then wraps to 1, and the fill follows each time. (L2-067)
- **AC-14** Given the star input in the review dialog, when the user tabs into and out of it, then it is one tab stop that lands on the checked radio (or "1 star") and the next Tab moves to the review text field. (L2-067)
- **AC-15** Given keyboard focus on a star in either theme, when it is displayed, then a round `--color-focus-ring` ring with no offset surrounds the star's 44 px circle with at least 3:1 contrast against the dialog surface. (L2-067)

### Screen readers

- **AC-16** Given a screen reader on the review dialog, when focus enters the group, then it announces "Your rating", the radio's name "1 star" (or the checked star's name), its state and "1 of 5". (L2-066)
- **AC-17** Given the caterer page and the review dialog in every star-input state, when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations. (L2-066)

### Theming

- **AC-18** Given the light and the dark theme, when an unrated star input renders in the review dialog, then each empty star has at least 3:1 contrast against `--color-bg-surface-raised`. (L2-069)
- **AC-19** Given the light and the dark theme, when review stars render on the caterer page, then filled stars have at least 3:1 contrast against the page and are ink (`--color-star`), not gold or pepper. (L2-069)
- **AC-20** Given a review's stars, when its colours are removed (greyscale), then the score is still given by the "4 out of 5" label and the number of filled shapes, and the summary by its number. (L2-069)

### Responsive

- **AC-21** Given a 360 px viewport, when the review dialog's star input is measured, then each star target is 44 × 44 CSS px and neighbouring targets are at least 8 px apart. (L2-065)
- **AC-22** Given a 320 px viewport, when the full-screen review dialog renders, then all five stars fit on one row within the content width, nothing is clipped and the dialog does not scroll horizontally. (L2-064)

### Motion

- **AC-23** Given `prefers-reduced-motion: reduce`, when the pointer moves over a star, then the hover disc appears with no visible fade. (L2-069)

### Performance

- **AC-24** Given the `Rating` perf-test scenario, when star 4 is clicked, then the fill is painted within 200 ms (Interaction to Next Paint) and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/rating/`; files
  `rating-summary.component.*` (`sh-rating-summary`, `RatingSummaryComponent`),
  `stars.component.*` (`sh-stars`, `StarsComponent`) and
  `star-input.component.*` (`sh-star-input`, `StarInputComponent`). One star
  path constant is shared.
- Styles: the "Rating" section of `components.css` moves into the components,
  class names unscoped. Design-system catch-up for D-7: `.star-input { gap:
  var(--space-2) }` below 48rem. The disabled look (no hover disc,
  `not-allowed`) already works through `input:disabled + label`, which a
  disabled `fieldset` triggers.
- The hover preview is component code (`pointerenter`/`pointerleave` on the
  labels), not CSS, because CSS cannot fill earlier siblings.
- Mock drift: `dialogs/review/busy` disables radios 1–4 only; the component
  disables the fieldset. The mocks' empty-star colour is stone-300; the
  tokens now give stone-500.
- Composed by [review](review.md) (`sh-stars`) and the caterer page; the
  review dialog composes `sh-star-input`. No CDK primitive is needed: native
  radios give the keyboard model.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component or three?* Three selectors in one folder. The summary, the display stars and the input share tokens and the star path but have different roles, inputs and outputs; one component with a mode switch would mix a form control with static text.
- **D-3** *Who formats the average?* The summary, always to one decimal with the page locale, so "3.0" can never appear as "3". The count's noun comes from the consumer because pluralisation belongs to the translation catalogue.
- **D-4** *What does the summary render for 0 reviews?* Nothing. L2-051.2 wants "No reviews yet" and no average; the reviews section owns that text, and the facts line omits the link, as `caterer/no-reviews` does.
- **D-5** *What if a display value is not a whole number from 1 to 5?* Nothing renders. L2-050 allows only whole numbers 1–5; drawing a partial or empty row would show a value that cannot exist.
- **D-6** *How is the input disabled while posting?* On the `fieldset`, all at once. `dialogs/review/busy` disabled stars 1–4 and left 5 live; the design system fixed that drift.
- **D-7** *What gap separates input stars?* `--space-2` (8 px) below 48rem (XS and SM) and `--space-1` (4 px) from 48rem. L2-065.1 requires at least 8 px between neighbouring targets on phones, and the user's decision of 10 Oct 2026 confirmed that it wins over the design system's 4 px (the design system will be updated). Five stars with 8 px gaps (252 px) still fit 320 px. The rendering applies it with a specimen-only style.
- **D-8** *Is the first star focused when the dialog opens?* Yes, through `autofocus`, as `dialogs/review/default` does; the rating is the first required field. Where the dialog opens on an existing review, focus goes to the checked star.
