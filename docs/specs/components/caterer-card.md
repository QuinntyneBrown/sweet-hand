# Caterer card

| Field | Value |
|---|---|
| Selector | `sh-caterer-card` (one card), `sh-caterer-grid` (the list that lays cards out) |
| Library path | `frontend/projects/components/src/lib/caterer-card/` |
| Status | planned |
| Traces to | L2-004, L2-005, L2-006, L2-042, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`caterer-card.html`](../../design-system/components/caterer-card.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterers/loading`](../../mocks/pages/caterers/loading.html), [`pages/caterers/edge`](../../mocks/pages/caterers/edge.html), [`pages/caterers/filtered`](../../mocks/pages/caterers/filtered.html), [`pages/occasions/default`](../../mocks/pages/occasions/default.html), [`pages/occasions/loading`](../../mocks/pages/occasions/loading.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard/empty`](../../mocks/pages/dashboard/empty.html), [`pages/dashboard/loading`](../../mocks/pages/dashboard/loading.html), [`pages/profile-details/default`](../../mocks/pages/profile-details/default.html) |
| Rendering | [`caterer-card.html`](caterer-card.html) |

## Purpose and scope

The caterer card is the listing's core unit: a round food photo, the business
name and one quiet line — "primary cuisine · primary area" — all one link to
the caterer page. Exactly four things and nothing else: no stars, no prices,
no badges, no favourite button (L2-004). It has no border, background or
shadow; the photo and the white space around it are the card. The same card,
with an occasion name and a count, makes the occasion tiles ("Weddings ·
23 caterers"), and caterers see their own card in the dashboard's "Your
listing card" preview, so they see exactly what customers see.

`sh-caterer-grid` is the list that lays cards out: one to three columns of
caterers, two to four of occasion tiles, and the loading skeletons that stand
in for them. Use something else for a person ([avatar](avatar.md) in a
[list](list.md) row), a caterer in the operator's tables ([table](table.md)),
a caterer inside a dialog (the small photo chip `.dialog__caterer`, see
[dialog](dialog.md)) or a dish ([dish](dish.md)). The image itself is
[photo](photo.md); the loading bars are [skeleton](skeleton.md).

Out of scope:

- Fetching, ordering and paging the caterers (L2-001, L2-002), the result
  count and its "Loading caterers" announcement, the empty and error states
  ([empty state](empty-state.md)) and [pagination](pagination.md): the
  listing page owns them.
- Which photo is the cover and its caption: the caterer chooses them
  (L2-042); the card shows what it is given.
- Image processing, formats and the CDN (L2-006.2, L2-087): the card renders
  the `src` and `srcset` the API returns.
- The preview pane around the dashboard card (`.preview-pane`, its heading
  "Your listing card"): the dashboard page owns it.

## Usage

Inventory from `usage_inventory.py docs/mocks caterer-card "a|div|li|span"`,
`… caterer-grid "ul|ol|div"` and `… occasion-grid "ul|ol|div"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/default`, `filtered`, `occasion`, `signed-in`, `out-of-area`, `postal-invalid`, `offline`, `long` | grid `caterers`; card `caterer`, link; first 6 photos eager, the rest lazy | 24 cards: "Pelau House" / "Trinidadian & Tobagonian · Scarborough", "Cou-Cou" / "Barbadian (Bajan) · North York" … | default, hover, focus | canvas |
| `pages/caterers/loading` | grid `caterers`, `busy`, 6 skeletons | — | loading | canvas |
| `pages/caterers/edge` | card `caterer`, link | "The Original Auntie Philomena's Roti, Doubles & Pholourie Kitchen" / "Trinidadian & Tobagonian · Whitchurch-Stouffville"; "O" / "Guyanese · York"; "Salt Pond Provisions" (photo failed); "Mangú & Mofongo Co." / "Puerto Rican · Clarington" (photo failed) | long name clamped, one-letter name, failed photo | canvas |
| `pages/occasions/default` | grid `occasions`; card `occasion`, link, decorative photo | 8 tiles: "Weddings" / "23 caterers", "Birthdays" / "41 caterers", "Funerals and repasts" / "17 caterers" … | default, hover, focus | canvas |
| `pages/occasions/loading` | grid `occasions`, `busy`, 8 skeletons | — | loading | canvas |
| `pages/dashboard/default`, `pages/profile-certificate/default`, `dialogs/dish` (page behind) | card `caterer`, link to the caterer's own public page | "Pelau House" / "Trinidadian & Tobagonian · Scarborough" | default | preview pane |
| `pages/dashboard/empty`, `draft` | card `caterer`, no link, no cover yet | placeholder "Cover photo"; "Auntie Bev's Kitchen" / "Jamaican · Oshawa" | placeholder | preview pane |
| `pages/profile-details/default`, `name-pending`, `saved`; `notifications/profile-banner/*`; `dialogs/submit-profile`, `withdraw-submission` | card `caterer`, no link (live preview of unsaved or unpublished details) | "Pelau House", "Auntie Bev's Kitchen", "Flying Fish Kitchen" | default | preview pane |
| `pages/dashboard/loading`, `pages/profile-details/loading` | card `caterer`, `skeleton`, standalone | — | loading | preview pane |
| `pages/admin-profile-review/default` | card `caterer`, link | "Pelau House" / "Trinidadian & Tobagonian · Scarborough" | default | canvas |

Not product markup: the `<span class="caterer-card">` copies in
`dialogs/filters`, `dialogs/search` and `dialogs/site-menu` (66) are the
mock's static picture of the listing behind an open sheet (D-10).

## Anatomy

1. **Link (or frame)** — `a.caterer-card` (`div.caterer-card` when there is no
   link). A centred flex column, `--space-1` between rows, `--radius-lg`
   corners that shape the focus ring, `--space-1` padding below. No border,
   fill or shadow.
2. **Cover photo** — `.photo` from [photo](photo.md): a 1:1 circle at
   `min(100%, --photo-card-size)` with `--space-5` below it. Holds an `<img>`
   with `width`, `height`, `srcset`, `sizes`, `alt`; or the placeholder
   (`.photo--placeholder` + "Cover photo"); or the failed state
   (`.photo--failed` + "Photo unavailable").
3. **Name** — `span.caterer-card__name`: `--text-card-title`, ink, clamped to
   two lines with an ellipsis, breaking anywhere when a single word is wider
   than the column.
4. **Line** — `span.caterer-card__meta`: "primary cuisine · primary area" (or
   the occasion count) in `--text-body-sm`, `--color-fg-muted`. Wraps freely.
5. **Skeleton (loading only)** — `.caterer-card--skeleton`: the photo circle
   holds `.skeleton.skeleton--circle`, followed by two `.skeleton.skeleton--text`
   bars (9rem and 6rem), all `aria-hidden`.
6. **Grid** — `ul.caterer-grid` or `ul.occasion-grid`: a list reset and a CSS
   grid; each card sits in its own `li`.

Host: `sh-caterer-card` is `display: block` and fills its grid cell; the
`a`/`div.caterer-card` inside it carries every class. `sh-caterer-grid`
renders the `ul` as its only child and is `display: block`.

## API

### `sh-caterer-card` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'caterer' \| 'occasion'` | `'caterer'` | no | `caterer` shows "cuisine · area"; `occasion` shows `meta` and makes the photo decorative (`alt=""`). Adds no class: both use `.caterer-card`. |
| `href` | `string \| null` | `null` | yes for `occasion` | A URL renders `a.caterer-card`; `null` renders `div.caterer-card` with no link and no tab stop (previews of unsaved or unpublished details, D-6). |
| `name` | `string` | — | yes | The business name exactly as registered, or the occasion name. Rendered as text, never HTML. |
| `cuisine` | `string` | — | yes for `caterer` | The primary cuisine's L2-007 name ("Barbadian (Bajan)"). |
| `area` | `string` | — | yes for `caterer` | The primary service area's L2-010 name ("Downtown Toronto"). |
| `meta` | `string` | — | yes for `occasion` | The occasion line, already translated and pluralised by the consumer ("23 caterers", "1 caterer"). Ignored for `caterer`. |
| `photo` | `CardPhoto \| null` | `null` | no | `{ src: string; srcset: string; alt: string; width: number; height: number }`. `null` shows the placeholder. `alt` is the caterer's caption; for `occasion` the card renders `alt=""` whatever is passed. |
| `loading` | `'eager' \| 'lazy'` | `'lazy'` | no | `lazy` renders `loading="lazy"`; `eager` renders no `loading` attribute. Set by the grid's `eagerCount` for listing cards. |
| `placeholderLabel` | `string` | — | yes when `photo` is `null` | The placeholder word ("Cover photo"). |
| `failedLabel` | `string` | — | yes | The word shown if the image fails to load ("Photo unavailable"). |
| `skeleton` | `boolean` | `false` | no | Renders the loading card (`div.caterer-card.caterer-card--skeleton`, `aria-hidden="true"`) and ignores every other input. |

`CardPhoto.width` and `height` are the intrinsic pixel size of the `src`
rendition (280 × 280 in the mocks); they reserve the square before the image
arrives.

### `sh-caterer-grid` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'caterers' \| 'occasions'` | `'caterers'` | no | Renders `ul.caterer-grid` or `ul.occasion-grid`. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` on the `ul` and renders `skeletonCount` skeleton items in place of the projected cards. |
| `skeletonCount` | `number` | `6` | no | Number of skeleton items while busy (the listing uses 6, the occasions page 8). Whole number from 1 to 24. |
| `eagerCount` | `number` | `6` | no | The first `eagerCount` projected cards get `loading="eager"`, the rest `lazy`, unless a card sets `loading` itself (D-8). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Activation is native link navigation; the card has nothing to report. Analytics, if ever needed, listen to the link's click. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-caterer-card`: none | — | The card has no slots, on purpose: everything it may show is an input, so nothing else (rating, price, badge) can be added (L2-004). |
| `sh-caterer-grid`: default | `li` elements, each holding exactly one `sh-caterer-card` | Rendered inside the `ul`. Hidden while `busy`. |

- Translation: `placeholderLabel`, `failedLabel` and `meta` come from the
  resource files through the consumer (L2-064). `name`, `cuisine`, `area` and
  `photo.alt` are data. The separator " · " is punctuation, not copy.

## Variants and sizes

| Variant | Element | Use for |
|---|---|---|
| Caterer, link | `a.caterer-card` | Listing cards, the operator's profile review, the dashboard preview of a published profile. |
| Caterer, no link | `div.caterer-card` | Previews of a draft or of unsaved edits (Auntie Bev's Kitchen, the "Live preview" while editing). |
| Occasion | `a.caterer-card` in `ul.occasion-grid` | Occasion tiles: name plus count, decorative photo. |
| Skeleton | `.caterer-card.caterer-card--skeleton` | Loading, in the grid (`li`) or standalone (`div`). |

| Grid | Modifier | Columns XS / SM / MD / LG / XL | Gaps (row / column) |
|---|---|---|---|
| Caterers | `ul.caterer-grid` | 1 / 2 / 2 / 3 / 3 | `--space-12` / `--space-6`; from 36rem `--space-12` / `--space-8`; from 62rem `--space-16` / `--space-10` |
| Occasions | `ul.occasion-grid` | 2 / 2 / 3 / 4 / 4 | `--space-10` / `--space-6`; from 62rem `--space-16` / `--space-10` |

One card size. Its width comes from the grid column; the photo is
`min(100%, --photo-card-size)` (280 px), so it is 280 px on a 320 px phone and
still 280 px, with more space around it, on a 1440 px screen. Type does not
change with width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Photo, name, line | One link; name = caption, business name, line |
| Hover | `:hover` on the link | The image scales to 1.08 inside its circle over `--duration-slow`; nothing else changes, no colour | — |
| Focus | `:focus-visible` on the link | `--focus-ring-width` ring in `--color-focus-ring`, `--space-2` outside the card, `--radius-lg` corners | Focused; name announced |
| Active | `:active` | Same as hover | — |
| Image loading | `<img>` not yet decoded | `--color-bg-photo` disc of the final size | Name unchanged (alt is already present) |
| Image failed | `error` event on the `<img>` | `.photo--failed`: plate icon and `failedLabel` on the disc; same size | Name becomes "Photo unavailable, Salt Pond Provisions, Kittitian & Nevisian · East Gwillimbury" |
| No cover yet | `photo` is `null` | `.photo--placeholder`: plate icon and "Cover photo" | Not a link; text is read in order |
| Long name | name wider than two lines | Clamped to two lines with an ellipsis | Full name in the accessible name |
| No link | `href` is `null` | Identical to default; no hover zoom (D-13), default cursor | Plain text, no tab stop |
| Loading (skeleton) | `skeleton`, or grid `busy` | Skeleton circle and two bars in the final layout, shimmering | Hidden (`aria-hidden="true"`); the `ul` has `aria-busy="true"` |
| Visited | `:visited` | Not styled (D-9) | — |
| Disabled | — | Never: unpublished caterers are not listed (L2-001) | — |

`data-state="hover|focus"` exists in `components.css` for documentation and
mocks only; the component never renders it.

## Markup

```html
<!-- rendered: listing grid with a caterer card (eager) and a lazy one -->
<ul class="caterer-grid">
  <li><a class="caterer-card" href="/caterers/pelau-house"><span class="photo"><img src="https://img.sweethand.example/pelau-house-800.avif" srcset="…-400.avif 400w, …-800.avif 800w, …-1200.avif 1200w" sizes="(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw" alt="Chicken pelau in a steel pot with lime and cucumber chutney" width="280" height="280"></span><span class="caterer-card__name">Pelau House</span><span class="caterer-card__meta">Trinidadian &amp; Tobagonian · Scarborough</span></a></li>
  …
  <li><a class="caterer-card" href="/caterers/pimento-and-thyme"><span class="photo"><img src="…" srcset="…" sizes="(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw" alt="Chicken curry with white rice and roti" width="280" height="280" loading="lazy"></span><span class="caterer-card__name">Pimento &amp; Thyme</span><span class="caterer-card__meta">Jamaican · York</span></a></li>
</ul>
```

```html
<!-- rendered: image failed to load -->
<a class="caterer-card" href="/caterers/salt-pond-provisions"><span class="photo photo--failed"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="photo__label">Photo unavailable</span></span><span class="caterer-card__name">Salt Pond Provisions</span><span class="caterer-card__meta">Kittitian &amp; Nevisian · East Gwillimbury</span></a>
```

```html
<!-- rendered: draft preview, no link, no cover yet -->
<div class="caterer-card"><span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="photo__label">Cover photo</span></span><span class="caterer-card__name">Auntie Bev's Kitchen</span><span class="caterer-card__meta">Jamaican · Oshawa</span></div>
```

```html
<!-- rendered: occasion tile -->
<ul class="occasion-grid">
  <li><a class="caterer-card" href="/caterers?occasion=weddings"><span class="photo"><img src="…" srcset="…" sizes="(min-width: 62rem) 17.5rem, (min-width: 48rem) 30vw, 45vw" alt="" width="280" height="280"></span><span class="caterer-card__name">Weddings</span><span class="caterer-card__meta">23 caterers</span></a></li>
</ul>
```

```html
<!-- rendered: grid loading -->
<ul class="caterer-grid" aria-busy="true">
  <li class="caterer-card caterer-card--skeleton" aria-hidden="true"><span class="photo"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></li>
  … (6 in all)
</ul>

<!-- rendered: standalone skeleton (dashboard preview pane) -->
<div class="caterer-card caterer-card--skeleton" aria-hidden="true"><span class="photo"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
```

In the grid the skeleton class sits on the `li` itself, as in the mocks, so a
busy list exposes no empty list items.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: listing page 1 -->
<sh-caterer-grid [busy]="loading()">
  @for (c of page().caterers; track c.slug) {
    <li><sh-caterer-card [href]="'/caterers/' + c.slug" [name]="c.name" [cuisine]="c.primaryCuisine" [area]="c.primaryArea"
        [photo]="c.cover" [failedLabel]="t('photo.unavailable')"></sh-caterer-card></li>
  }
</sh-caterer-grid>

<!-- consumer: occasions page -->
<sh-caterer-grid variant="occasions" [busy]="loading()" [skeletonCount]="8">…
  <li><sh-caterer-card variant="occasion" href="/caterers?occasion=weddings" [name]="t('occasion.weddings')" [meta]="t('occasion.count', { count: 23 })" [photo]="tile.photo" [failedLabel]="t('photo.unavailable')"></sh-caterer-card></li>
</sh-caterer-grid>

<!-- consumer: dashboard preview of a draft -->
<sh-caterer-card [href]="null" name="Auntie Bev's Kitchen" cuisine="Jamaican" area="Oshawa" [photo]="null"
    [placeholderLabel]="t('photo.coverPlaceholder')" [failedLabel]="t('photo.unavailable')"></sh-caterer-card>
```

The e2e page objects locate cards by `.caterer-card`, its link role and name,
`.caterer-card__name`, `.caterer-card__meta`, `.caterer-card--skeleton` and the
grid's `aria-busy`; those are part of the contract. The placeholder icon's
path data is free to change.

## Design

- Card: flex column, centred, `--space-1` gap, `--space-1` bottom padding,
  `--radius-lg` corners (only visible through the focus ring), no border,
  fill or shadow.
- Photo: `min(100%, --photo-card-size)` wide, 1:1, `--radius-full`, disc
  `--color-bg-photo`, `--space-5` below. The image sits at scale 1.03 (from
  [photo](photo.md)) and 1.08 on hover.
- Name: `--text-card-title`, `--color-fg-default`, two-line clamp,
  `overflow-wrap: anywhere`.
- Line: `--text-body-sm`, `--color-fg-muted`.
- Skeleton: `.skeleton` bars and circle from [skeleton](skeleton.md), bars 9rem
  and 6rem wide, centred.
- Focus ring: `--focus-ring-width` in `--color-focus-ring`, offset
  `--space-2`.
- Motion: hover zoom over `--duration-slow` with `--ease-standard`; skeleton
  shimmer over `--duration-loop`.
- Grid gaps: `--space-12`/`--space-6`, `--space-12`/`--space-8` from 36rem,
  `--space-16`/`--space-10` from 62rem; occasions `--space-10`/`--space-6`,
  then `--space-16`/`--space-10` from 62rem.
- Layer: none.

Component tokens: none. The card has no surface, so it reads semantic tokens
directly; a theme changes only text colours and the photo disc.

| Token | Aliases | Overridden by |
|---|---|---|
| `--photo-card-size` | 17.5rem (global layout token) | Nothing; the card never overrides it |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Name | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Line | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Photo disc, placeholder | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |
| Placeholder icon | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Placeholder and failed label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Page behind | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Skeleton | `--color-bg-subtle` → `--color-bg-subtle-hover` | `--palette-stone-100` → `--palette-stone-200` | `--palette-stone-800` → `--palette-stone-700` |

The food photo is never filtered, dimmed or tinted in either theme.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Name |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Cuisine and area line |
| `--color-fg-muted` | `--color-bg-photo` | 4.5:1 | "Cover photo", "Photo unavailable" |
| `--color-fg-subtle` | `--color-bg-photo` | 4.5:1 | Placeholder icon (checked at the text minimum) |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Forced colours: the link keeps its system colours; the focus ring becomes
`Highlight` through `--color-focus-ring`; the photo disc may disappear, which
is acceptable because the image or label stays.

## Responsive behaviour

- Caterer grid: 1 column below 36rem (XS), 2 from 36rem (SM, MD), 3 from 62rem
  (LG and XL, D-3). Occasion grid: 2, then 3 from 48rem, 4 from 62rem.
- The photo `sizes` attribute matches the grid: caterers
  `(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw`; occasions
  `(min-width: 62rem) 17.5rem, (min-width: 48rem) 30vw, 45vw`.
- The name wraps within its column and clamps at two lines on every width;
  the line wraps freely ("Trinidadian & Tobagonian · Whitchurch-Stouffville"
  takes two lines on a phone) and is never clamped.
- At 320 px the column is 288 px, the photo 280 px, nothing scrolls
  horizontally and nothing is cut except the clamped name; at 200 % zoom at a
  1280 px window the grid reflows to fewer columns and all text stays; the
  whole card is the touch target, far above 44 × 44 CSS px.

## Accessibility

### Role and pattern

A list (`ul`) of single links ([APG
Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/)): screen readers
announce "list, 24 items" and each card is one link. No `role` attributes are
added. A card without `href` is a plain `div` and is not interactive.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | One stop per card, in reading order (row by row, left to right). Skeletons and link-less cards are not stops. |
| <kbd>Enter</kbd> | Opens the caterer page (or the occasion's listing). |

### Focus

The shared ring wraps the whole card `--space-2` out with `--radius-lg`
corners, clearing the round photo and the text. Focus is never moved by the
card. When the listing replaces the grid (new page, new filter), the page owns
focus.

### Labelling

- The link's accessible name is its content in source order: the photo's alt
  (the caterer's caption), the business name, the line — "Chicken pelau in a
  steel pot with lime and cucumber chutney, Pelau House, Trinidadian &
  Tobagonian · Scarborough".
- The two-line clamp is visual only; the full name stays in the DOM and the
  accessible name (L2-004.4). No `title` or `aria-label` replaces it.
- Occasion photos have `alt=""`, so a tile reads "Weddings, 23 caterers".
- `alt` is never generated: no "Food from Pelau House", no "Photo".
- Icons in the placeholder and failed states are `aria-hidden="true"`; their
  label text is read as part of the card.

### Announcements

None from the card. While loading, the grid sets `aria-busy="true"` and hides
the skeletons; the page's result count says "Loading caterers" and then "60
caterers" in its own `aria-live="polite"` region.

### Motion

The hover zoom runs over `--duration-slow`, which `prefers-reduced-motion:
reduce` sets to 0.01 ms, so the zoom still happens but instantly. The skeleton
shimmer stops under reduced motion ([skeleton](skeleton.md)).

## Content and internationalisation

- The name is exactly as the caterer registered it, ampersands, accents and
  full stops included: "Pimento & Thyme", "Black Cake Co.", "Auntie Merle's
  Table", "Mangú & Mofongo Co.".
- The line is "primary cuisine · primary area" with a middle dot and a space
  each side. Cuisine uses the L2-007 name ("Barbadian (Bajan)", "Trinidadian &
  Tobagonian"), area the L2-010 name ("Downtown Toronto"). Never "Caribbean"
  when the caterer chose a tradition; "Pan-Caribbean" only when it is the
  caterer's own choice.
- Occasion lines are counts formatted by the consumer: "23 caterers",
  "1 caterer" (and "23 traiteurs" in French).
- Alt text is the caterer's caption in their spelling ("Curry chicken
  scattered with shado beni over white rice").
- Translatable inputs: `meta`, `placeholderLabel`, `failedLabel`. Data:
  `name`, `cuisine`, `area`, `photo.alt`. Cuisine and area names come
  translated from their catalogues when a translation exists.
- Longer translated lines wrap; only the name clamps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the meta line, the element
  choice, `loading`) are computed once, not in the template.
- No listeners besides the image's `error` handler (in [photo](photo.md)); no
  `IntersectionObserver` — the browser's `loading="lazy"` does the work.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/CatererCard.ts`
  renders Pelau House's card ("Pelau House", "Trinidadian & Tobagonian ·
  Scarborough", cover `pelau-house`); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Listing` (page 1, 24 cards from the cast, first 6
  eager), `ListingLoading` (6 skeletons), `Occasions` (8 tiles), `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: `width`/`height` attributes plus `aspect-ratio: 1` reserve
  the circle; the skeleton has the final card's dimensions; a failed image
  keeps the circle. Nothing shifts after load (L2-006.5, L2-085).
- Weight: composes [photo](photo.md) and [skeleton](skeleton.md) only; no
  image library, no carousel, no third-party code.

## Acceptance criteria

### Rendering

- **AC-1** Given Island Pot with cover caption "Chicken fried rice with mixed vegetables", primary cuisine "Jamaican" and primary area "Scarborough", when its listing card renders, then it is one `a.caterer-card` containing a `.photo` with that image, `.caterer-card__name` "Island Pot" and `.caterer-card__meta` "Jamaican · Scarborough", and no other text. (L2-004)
- **AC-2** Given Pelau House with 23 reviews averaging 4.7, when its listing card renders, then no rating, star icon, review count, price or badge appears in it. (L2-004)
- **AC-3** Given the listing at 1280 px, when a visitor clicks Pelau House's photo, clicks its name, or tabs to the card and presses Enter, then each time the browser opens `/caterers/pelau-house`, and the card is a single tab stop. (L2-004)
- **AC-4** Given the caterer "The Original Auntie Philomena's Roti, Doubles & Pholourie Kitchen" at 360 px, when its card renders, then the name shows on two lines ending in an ellipsis and the link's accessible name contains the full name. (L2-004)
- **AC-5** Given Pelau House's card, when it renders, then the image's `alt` is exactly "Chicken pelau in a steel pot with lime and cucumber chutney". (L2-006)
- **AC-6** Given Pelau House's card, when the screen reader reads the link, then its name is "Chicken pelau in a steel pot with lime and cucumber chutney, Pelau House, Trinidadian & Tobagonian · Scarborough", in that order. (L2-068)
- **AC-7** Given any listing card, when its HTML is inspected, then the image declares `srcset` widths 400w, 800w and 1200w, `sizes="(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw"`, and `width` and `height` attributes. (L2-006)
- **AC-8** Given the occasions page, when the "Weddings" tile renders, then its image has `alt=""` and the link's accessible name is "Weddings, 23 caterers". (L2-068)

### States

- **AC-9** Given Salt Pond Provisions' card whose image request fails, when the `error` event fires, then the circle keeps its size and position, shows the plate icon and "Photo unavailable", and the card's bounding box does not change. (L2-006)
- **AC-10** Given a listing card on a slow connection, when the card renders before its image arrives, then a `--color-bg-photo` circle of the final size is shown and the image's arrival causes no layout shift. (L2-006)
- **AC-11** Given the listing is loading, when the grid renders with `busy`, then the `ul.caterer-grid` has `aria-busy="true"` and holds exactly 6 `li.caterer-card.caterer-card--skeleton` items, each with `aria-hidden="true"`. (L2-066)
- **AC-12** Given the listing loading at 1280 px, when the 24 real cards replace the skeletons, then the first row of cards occupies the same positions as the skeletons and the page's Cumulative Layout Shift stays at or below 0.1. (L2-085)
- **AC-13** Given Auntie Bev's Kitchen's draft dashboard at 1280 px with no cover photo yet, when "Your listing card" renders, then it is a `div.caterer-card` (no link, no tab stop) with the placeholder "Cover photo", "Auntie Bev's Kitchen" and "Jamaican · Oshawa". (L2-045)
- **AC-14** Given Kendra edits Pelau House's details at 1280 px, when she changes the business name in the form to "Pelau House by Kendra", then the live preview card shows "Pelau House by Kendra" without a page reload and is not a link. (L2-045)
- **AC-15** Given Pelau House changes its cover to the `maracas-bay` photo, when the card is rendered with the new `photo`, then it shows that image with alt "Curry chicken with rice and buss up shut in a steel karahi". (L2-042)

### Keyboard and focus

- **AC-16** Given the listing page 1 at 1280 px, when a keyboard user tabs through the grid, then focus visits the 24 cards in reading order, row by row, left to right, one stop each. (L2-067)
- **AC-17** Given keyboard focus on Cou-Cou's card, when it is displayed in either theme, then a `--color-focus-ring` ring surrounds the whole card `--space-2` out with rounded corners, with at least 3:1 contrast against the page. (L2-067)

### Theming

- **AC-18** Given the light and the dark theme, when Lakay Kitchen's card renders, then the name has at least 4.5:1 and the line "Haitian · Richmond Hill" at least 4.5:1 contrast against the page, and the photo has no filter or opacity applied. (L2-069)
- **AC-19** Given the dark theme, when Auntie Bev's draft card with the placeholder renders, then the disc is `--color-bg-photo` resolving to `--palette-stone-800` and "Cover photo" has at least 4.5:1 contrast against it. (L2-069)

### Responsive

- **AC-20** Given a viewport of 360 px (XS), when listing page 1 renders, then cards appear in 1 column. (L2-005)
- **AC-21** Given viewports of 600 px (SM) and 800 px (MD), when listing page 1 renders, then cards appear in 2 columns. (L2-005)
- **AC-22** Given a viewport of 1000 px (LG), when listing page 1 renders, then cards appear in 3 columns. (L2-005)
- **AC-23** Given any viewport class, when a listing card renders, then its photo fills at least 60 % of the card's height. (L2-005)
- **AC-24** Given a 320 px viewport, when the edge-case listing renders, including "Trinidadian & Tobagonian · Whitchurch-Stouffville", then the line wraps, nothing is cut off except the clamped name, and the page does not scroll horizontally. (L2-064)
- **AC-25** Given a 1280 px window at 200 % zoom, when listing page 1 renders, then every card's photo, name and line are visible and the page does not scroll horizontally. (L2-069)
- **AC-26** Given a 360 px viewport, when Pelau House's card is measured, then its link's tap target is at least 44 × 44 CSS px and at least 8 px from the next card. (L2-065)

### Motion

- **AC-27** Given `prefers-reduced-motion: reduce`, when a visitor hovers Pelau House's card, then the photo reaches its zoomed size with no visible transition and nothing else on the card changes. (L2-069)

### Performance

- **AC-28** Given listing page 1 with 24 cards, when it first loads, then the first 6 card images have no `loading` attribute, cards 7–24 have `loading="lazy"`, and no more than 6 images are requested before the `load` event. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/caterer-card/`; files
  `caterer-card.component.*` (selector `sh-caterer-card`, class
  `CatererCardComponent`) and `caterer-grid.component.*` (selector
  `sh-caterer-grid`, class `CatererGridComponent`); the `CardPhoto` type is
  exported from the folder's public API.
- Composes [photo](photo.md) for the circle, its `img`, placeholder and failed
  states, and [skeleton](skeleton.md) for the loading circle and bars. It
  passes `failedLabel` and `placeholderLabel` to the photo's label input and
  sets `sizes` itself, because the card knows its grid.
- Styles: the "Caterer card and grid" section of `components.css` moves into
  the component, class names unscoped. The `.photo` and `.skeleton` rules stay
  with their own components.
- Design-system catch-up for D-13: scope the hover rule to the link,
  `a.caterer-card:hover .photo img`, so a link-less preview card does not
  zoom. The rendering shows the required look with a specimen-only style.
- The grid assigns `loading` by position from `eagerCount` (D-8); a card's own
  `loading` input wins.
- No CDK primitive is needed.
- The browse-listing detailed design describes a 4:3 photo box, 4 columns at
  XL and a different `sizes` attribute; it changes with the outcome of D-3 and
  D-4.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Does this component own the grid?* Yes, as `sh-caterer-grid`. The design-system page defines `.caterer-grid` and `.occasion-grid` with the card, the skeleton class sits on the grid's `li`, and L2-005 governs columns and photo size together, so splitting them would put one requirement in two places.
- **D-3** *How many columns at XL?* Three, as at LG. L2-005.4 asks for 4, but the reference design, the mocks and the design system show 3 beside the filter column at 1440 px (mocks README, question 2). This CRD follows the design system and has no criterion for XL columns until product settles it; see the report to the user.
- **D-4** *4:3 photo or circle?* The 1:1 circle. L2-005.5 asks for a 4:3 photo filling at least 60 % of the card; the design, the mocks and [photo](photo.md) use a circle, which still fills well over 60 % (mocks README, question 1). AC-23 keeps the 60 % rule; the aspect ratio waits on product.
- **D-5** *How many images load eagerly?* The first 6, as the design system and mocks do, which also satisfies L2-085.3 (at most 6 before `load`). On a phone the first viewport holds only one or two cards, so L2-006.3 ("only images in the first viewport are eager") is met at LG and above but not at XS; server-rendered HTML cannot know the viewport. Raised to the user with D-3 and D-4.
- **D-6** *When is a card not a link?* When it previews something a visitor cannot see yet: a draft (Auntie Bev's Kitchen) or the "Live preview" of unsaved edits. Linking would open a page that does not match the card. The dashboard's preview of a published, saved profile links to the caterer's own public page, as the mocks do.
- **D-7** *What is in the link's accessible name when the image fails?* The failed label, then the name and line ("Photo unavailable, Salt Pond Provisions, …"). The photo component's rule is that inside a link the parent's name carries it, and the label is visible text, so it stays in the name rather than being hidden.
- **D-8** *Who decides `loading` for each card?* The grid, by position, through `eagerCount`, so a page cannot forget it; a card's own `loading` wins for standalone cards (the dashboard preview is eager by setting it).
- **D-9** *Is a visited card styled?* No. The listing is reshuffled daily and a dimmed card would read as unavailable (design system, States).
- **D-10** *Must the component render `<span class="caterer-card">`?* No. Those 66 spans in sheet and dialog mocks are a static picture of the listing behind the overlay; the product renders the real grid there.
- **D-11** *Does the card accept slots for extras such as a "Saved" heart?* No. L2-004 allows exactly four things, so the card takes data inputs only and has no slot through which anything else could be added.
- **D-12** *What `sizes` does the occasion grid use?* `(min-width: 62rem) 17.5rem, (min-width: 48rem) 30vw, 45vw`. The design system gives `sizes` only for the caterer grid; this matches the occasion grid's 2 / 3 / 4 columns with the photo capped at 280 px.
- **D-13** *Does a card without a link zoom on hover?* No. The zoom says "this goes somewhere"; on a preview that is not a link it would promise a click that does nothing. Today's `.caterer-card:hover` rule also matches `div.caterer-card`, so `components.css` narrows it to the link.
