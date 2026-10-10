# Gallery and viewer

| Field | Value |
|---|---|
| Selector | `sh-gallery` (the caterer page's photo gallery), `sh-photo-viewer` (the full-screen viewer it opens) |
| Library path | `frontend/projects/components/src/lib/gallery/` |
| Status | planned |
| Traces to | L2-015, L2-016, L2-019, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`gallery.html`](../../design-system/components/gallery.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`pages/caterer/loading`](../../mocks/pages/caterer/loading.html), [`pages/caterer/more-dishes`](../../mocks/pages/caterer/more-dishes.html), [`dialogs/photo-viewer/default`](../../mocks/dialogs/photo-viewer/default.html), [`dialogs/photo-viewer/last`](../../mocks/dialogs/photo-viewer/last.html), [`dialogs/photo-viewer/busy`](../../mocks/dialogs/photo-viewer/busy.html), [`dialogs/photo-viewer/failed`](../../mocks/dialogs/photo-viewer/failed.html) |
| Rendering | [`gallery.html`](gallery.html) |

## Purpose and scope

A caterer page opens with their food. `sh-gallery` shows the caterer's photos
in the order they chose, cover first, as round [photos](photo.md): a
swipeable carousel with position dots on phones, a lead photo with a strip of
thumbnails on tablets, and a large lead beside a 2 × 2 grid on desktops. Every
photo is a button that opens `sh-photo-viewer` at that photo: a full-screen
modal dialog in the page colour with a "2 of 6" count, previous and next
buttons, swipe, arrow keys, and the caterer's caption underneath. When more
photos exist than a layout shows, the last visible thumbnail says "+1 photo"
so nobody assumes there are only five.

The gallery is only for a caterer's photos on their public page. Caterers
manage photos with [photo tiles](photo-tile.md); the listing shows one cover
per [caterer card](caterer-card.md); any other full-screen layer is a
[dialog](dialog.md) or [sheet](sheet.md).

Out of scope:

- The circle, its image states and `alt` rules: [photo](photo.md).
- The icon buttons' look and states: [icon button](icon-button.md); "Try
  again": [button](button.md).
- Which photos exist, their order and captions (L2-042): the caterer page
  passes them.
- The rest of the caterer page layout and the order of its sections
  (L2-015, L2-019 columns): the page.

## Usage

Inventory from `usage_inventory.py docs/mocks gallery "section|ul|li|button|div|span"`,
`… viewer "div|p"` and a search of `gallery__btn` (37 buttons).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default`, `can-review`, `more-dishes`, `no-reviews`, `own-review`, `offline` | gallery, 6 photos, dots on XS | Pelau House's six captions, "Open photo 2 of 6: Curry chicken with rice and buss up shut in a steel karahi" | default, hover, focus | canvas |
| `pages/caterer/edge` | gallery, 4 photos, one failed | "Open photo 2 of 4: Stewed saltfish with peppers over rice (did not load)" | failed thumbnail | canvas |
| `pages/caterer/loading` | gallery, 5 skeleton circles | — | loading | canvas |
| (design system) | gallery, 30 photos | "+25 photos" on the last visible thumbnail | more | canvas |
| `dialogs/photo-viewer/default` | viewer at 2 of 6 | "Pelau House photos", "2 of 6", caption | default | canvas (full screen) |
| `dialogs/photo-viewer/last` | viewer at 6 of 6 | "6 of 6", Next unavailable | last | canvas |
| `dialogs/photo-viewer/busy` | viewer at 3 of 6, loading | spinner "Loading photo 3 of 6", caption shown | loading | canvas |
| `dialogs/photo-viewer/failed` | viewer at 4 of 6, failed | "Photo 4 of 6 didn't load", "This photo didn't load.", "Try again" | failed | canvas |

## Anatomy

### Gallery

1. **Section** — `section.gallery` with `aria-label="Photos"`: a flex column,
   `--space-4` gap.
2. **Track** — `ul.gallery__track`: carousel on XS, lead + strip on SM and MD,
   lead + 2 × 2 on LG and XL.
3. **Button** — `button.gallery__btn` per photo, `aria-haspopup="dialog"`,
   round, `cursor: zoom-in`, holding a [photo](photo.md) with `alt=""`.
4. **More scrim** — `span.gallery__more` (`aria-hidden`) over the last visible
   thumbnail: "+1 photo", "+25 photos", on `--color-bg-scrim`.
5. **Dots** — `div.gallery__dots` (`aria-hidden`) on XS only: one `span` per
   photo, the current one `aria-current="true"`, wider and ink.
6. **Skeleton** — five `li` items each holding a photo with a skeleton circle.

### Viewer

1. **Dialog** — `div.viewer`, `role="dialog"`, `aria-modal="true"`,
   `aria-labelledby` the hidden title, `aria-describedby` the caption; fixed,
   full screen, `--color-bg-canvas`, `--z-modal`.
2. **Bar** — `div.viewer__bar`: the visually hidden `h2` "Pelau House photos",
   `p.viewer__count` "2 of 6" (`aria-live="polite"`), and the Close icon
   button.
3. **Stage** — `div.viewer__stage`: Previous, the photo
   (`min(100%, 62dvh, 34rem)`, 1200w image), Next.
4. **Caption** — `p.viewer__caption`: the caption in `--text-body-lg`; when the
   photo failed, a muted "This photo didn't load." and a small "Try again".

Host: `sh-gallery` is `display: block` and renders the `section`.
`sh-photo-viewer` renders the `div.viewer` through the framework's dialog or
overlay primitive (AGENTS.md: no hand-rolled modals), which also makes the
page behind inert.

## API

### `sh-gallery` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `photos` | `GalleryPhoto[]` | `[]` | yes | `{ src, srcset, width, height, caption, viewerSrc }` in the caterer's order, cover first. 3 to 30 for a published caterer (L2-039). |
| `label` | `string` | — | yes | The section's name: "Photos". |
| `openLabel` | `(n: number, total: number, caption: string) => string` | — | yes | "Open photo 2 of 6: Curry chicken with rice and buss up shut in a steel karahi". |
| `moreLabel` | `(hidden: number) => { visible: string; spoken: string }` | — | yes | Visible "+25 photos" / "+1 photo"; spoken suffix "25 more photos in the viewer", appended to that button's name. |
| `failedSuffix` | `string` | — | yes | Added to a failed thumbnail's name: " (did not load)". |
| `failedLabel` | `string` | — | yes | "Photo unavailable", passed to the photo. |
| `busy` | `boolean` | `false` | no | Renders five skeleton circles in the final layout and `aria-busy="true"` on the section. |

### `sh-photo-viewer` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `photos` | `GalleryPhoto[]` | — | yes | The same list as the gallery. |
| `index` | `number` | `0` | yes | Two-way: the photo shown (0-based). Clamped to the list; never wraps (D-4). |
| `title` | `string` | — | yes | The hidden heading: "Pelau House photos". |
| `countLabel` | `(n: number, total: number) => string` | — | yes | "2 of 6". |
| `labels` | `ViewerLabels` | — | yes | `close` "Close photo viewer", `previous` "Previous photo", `next` "Next photo", `loading` "Loading photo {n} of {total}", `failed` "Photo {n} of {total} didn't load", `failedNote` "This photo didn't load.", `retry` "Try again". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `opened` (`sh-gallery`) | `{ index: number; trigger: HTMLElement }` | A gallery button is activated. The page opens the viewer at that index and keeps the trigger for focus return. |
| `indexChange` (`sh-photo-viewer`) | `number` | Previous, Next, an arrow key, Home, End or a swipe changes the photo. |
| `closed` (`sh-photo-viewer`) | `{ index: number }` | Close or Escape. The gallery then focuses the button of the photo that was showing (D-5). |
| `retried` (`sh-photo-viewer`) | `{ index: number }` | "Try again" is activated; the viewer reloads that photo. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | Both components render from data, so the order, names and count always agree. |

- Translation: `label`, the label functions, `title` and `labels` come from
  the resource files (L2-064); captions are the caterer's data.

## Variants and sizes

| Layout | Viewport | Visible | "+N" scrim |
|---|---|---|---|
| Carousel | XS (below 36rem) | All, by swiping; 80 % slides snapping to centre, edge to edge; dots | None |
| Lead + strip | SM, MD (36–62rem) | A 24rem lead and a 5-across strip: photos 1–6 | On photo 6 when there are more |
| Lead + grid | LG, XL (62rem and wider) | Lead at 1.7fr spanning two rows, 2 × 2 thumbnails: photos 1–5 | On photo 5 when there are more |

The viewer fills the screen at every width. No size modifiers exist.

## States

| State | Part | Trigger | Visual | Assistive technology |
|---|---|---|---|---|
| Default | gallery button | — | Round photo | "Open photo 2 of 6: caption", has popup dialog |
| Hover | gallery button | `:hover` | Photo zooms to 1.08 over `--duration-slow` | — |
| Focus | gallery button | `:focus-visible` | Round `--color-focus-ring` ring | Name announced; on XS the track scrolls the photo into view |
| Active | gallery button | `:active` | Same as hover | — |
| Failed thumbnail | gallery button | photo `error` | Failed photo with "Photo unavailable" | Name ends "(did not load)" |
| More | last visible thumbnail | hidden photos exist | "+25 photos" scrim | Name adds "25 more photos in the viewer" |
| Loading | gallery | `busy` | Five skeleton circles in the final layout | Section `aria-busy="true"`; skeletons hidden |
| Disabled | gallery button | — | Never | — |
| Open | viewer | `opened` | Full screen, fades in over `--duration-base` | Dialog named "Pelau House photos", described by the caption; focus on Close |
| First / last | viewer arrows | index 0 / last | Previous or Next looks unavailable, `aria-disabled="true"` (D-6) | Still focusable; activating does nothing |
| Photo loading | viewer | the next image takes over 300 ms | Placeholder circle with a large spinner; caption already shown; `aria-busy="true"` on the viewer | `role="img"` "Loading photo 3 of 6" |
| Photo failed | viewer | image `error` | Failed circle, caption, "This photo didn't load.", "Try again"; arrows still work | `role="img"` "Photo 4 of 6 didn't load" |

## Markup

```html
<!-- rendered: gallery with six photos (Pelau House) -->
<section class="gallery" aria-label="Photos">
  <ul class="gallery__track">
    <li><button class="gallery__btn" type="button" aria-haspopup="dialog" aria-label="Open photo 1 of 6: Chicken pelau in a steel pot with lime and cucumber chutney"><span class="photo"><img src="…-800.avif" srcset="…-400.avif 400w, …-800.avif 800w, …-1200.avif 1200w" sizes="(min-width: 62rem) 30rem, (min-width: 36rem) 24rem, 80vw" alt="" width="280" height="280"></span></button></li>
    …
    <li><button class="gallery__btn" type="button" aria-haspopup="dialog" aria-label="Open photo 5 of 30: Rum-soaked black cake dusted with icing sugar, 25 more photos in the viewer">…</button><span class="gallery__more" aria-hidden="true">+25 photos</span></li>
  </ul>
  <div class="gallery__dots" aria-hidden="true"><span aria-current="true"></span><span></span><span></span><span></span><span></span><span></span></div>
</section>
```

The "+N" scrim is rendered on the 5th and the 6th item when there are more
photos; CSS shows it on the 6th at SM–MD and the 5th at LG–XL. Its spoken
suffix is attached to both buttons, because only CSS knows which one is last
visible (D-3).

```html
<!-- rendered: gallery loading -->
<section class="gallery" aria-label="Photos" aria-busy="true">
  <ul class="gallery__track" aria-hidden="true"><li><span class="photo"><span class="skeleton skeleton--circle"></span></span></li> … (5 in all)</ul>
</section>
```

```html
<!-- rendered: viewer at 2 of 6 -->
<div class="viewer" role="dialog" aria-modal="true" aria-labelledby="viewer-title" aria-describedby="viewer-caption">
  <div class="viewer__bar">
    <h2 class="visually-hidden" id="viewer-title">Pelau House photos</h2>
    <p class="viewer__count" aria-live="polite">2 of 6</p>
    <button class="icon-btn" type="button" aria-label="Close photo viewer">…</button>
  </div>
  <div class="viewer__stage">
    <button class="icon-btn" type="button" aria-label="Previous photo">…</button>
    <span class="photo"><img src="…-1200.avif" alt="Curry chicken with rice and buss up shut in a steel karahi" width="560" height="560"></span>
    <button class="icon-btn" type="button" aria-label="Next photo">…</button>
  </div>
  <p class="viewer__caption" id="viewer-caption">Curry chicken with rice and buss up shut in a steel karahi</p>
</div>

<!-- rendered: last photo; loading; failed -->
<button class="icon-btn" type="button" aria-label="Next photo" aria-disabled="true">…</button>
<div class="viewer" … aria-busy="true">… <span class="photo photo--placeholder" role="img" aria-label="Loading photo 3 of 6"><span class="spinner spinner--lg"></span></span> …</div>
<span class="photo photo--failed" role="img" aria-label="Photo 4 of 6 didn't load">…</span>
<p class="viewer__caption" id="viewer-caption">Curry chicken scattered with shado beni over white rice<br><span class="text-muted text-sm">This photo didn't load.</span> <button class="btn btn--sm" type="button">…Try again</button></p>
```

Consumer template (binding syntax illustrative):

```html
<sh-gallery [photos]="caterer.photos" [label]="t('gallery.label')" [openLabel]="openLabel" [moreLabel]="moreLabel"
    [failedSuffix]="t('gallery.failed')" [failedLabel]="t('photo.unavailable')" [busy]="loading()" (opened)="openViewer($event)"></sh-gallery>
<sh-photo-viewer [photos]="caterer.photos" [(index)]="viewerIndex" [title]="t('viewer.title', { name: caterer.name })"
    [countLabel]="countLabel" [labels]="viewerLabels" (closed)="viewerOpen = false"></sh-photo-viewer>
```

The e2e page objects locate these by `.gallery`, `.gallery__btn` and its name,
`.gallery__more`, `.gallery__dots [aria-current]`, `.viewer`, `.viewer__count`,
`.viewer__caption`, the viewer buttons' names and `aria-busy`; those are part of
the contract.

## Design

- Gallery: `--space-4` gap between track and dots; `--space-4` above and
  `--space-10` below the section.
- Track: XS flex, `--space-4` gap, slides 80 %, padding and negative margin of
  `--layout-margin` so it bleeds to the edges; SM–MD a 5-column grid with a
  24rem lead and `--space-4` gaps; LG–XL `1.7fr 1fr 1fr`, `--space-6` row and
  `--space-8` column gaps.
- Buttons: no border or fill, `--radius-full` (so the focus ring is round).
- Dots: `--space-2` circles in `--color-border-strong`; the current one
  `--icon-size-md` wide in `--color-fg-default`, width over `--duration-base`.
- More scrim: `--color-bg-scrim`, `--color-fg-on-scrim`, `--text-label` at
  `--font-size-md`, round.
- Viewer: `--z-modal`, `--color-bg-canvas`; bar `--space-4` padding plus the
  top safe area; stage gap `--space-2`, `--space-8` from 48rem; caption
  `--text-body-lg`, padding plus the bottom safe area; count `--text-label` at
  `--font-size-md`, `--color-fg-muted`; icon buttons outlined
  `--border-width-hairline` `--color-border-default`, 44 px.
- Motion: thumbnail zoom `--duration-slow`; viewer fade-in `--duration-base`
  with `--ease-enter`.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Viewer background | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Caption, icons, current dot | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Count | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Inactive dots | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Viewer button outline | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| More scrim | `--color-bg-scrim` | fixed dark scrim (72 %) | fixed dark scrim (72 %) |
| More text | `--color-fg-on-scrim` | `--palette-white` | `--palette-white` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

The viewer is the page colour, not a black lightbox; in dark it is near-black
because the canvas is. Photos are never dimmed.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-scrim` | `--color-bg-scrim` | 4.5:1 | "+25 photos" over a photo (L2-069.2) |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Count "2 of 6" |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Caption, icons |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Inactive dot |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The icon buttons' outline is decorative; the icon carries the meaning.

## Responsive behaviour

- XS: carousel, one photo at 80 % width with the next peeking in, snap to
  centre, dots below; the track is the only thing that scrolls sideways, and
  that is the intended swipe (L2-019.4).
- SM, MD: a 24rem lead centred above a strip of five; photos 7 and later hidden
  and counted on photo 6.
- LG, XL: the lead spans two rows beside a 2 × 2 grid; photos 6 and later
  hidden and counted on photo 5.
- Viewer: photo `min(100%, 62dvh, 34rem)` so a landscape phone needs no
  scrolling; bar and caption respect the safe areas; the stage gap grows at
  48rem.
- At 320 px nothing but the carousel track scrolls sideways; at 200 % zoom in a
  1280 px window the gallery uses the SM layout.
- Gallery buttons are at least 80 px on an SM strip; viewer buttons are 44 px.

## Accessibility

### Role and pattern

Gallery: a labelled `section` with a list of buttons, each
`aria-haspopup="dialog"`. It is not an auto-rotating carousel and never moves
on its own. Viewer: a modal dialog over an inert page ([APG Dialog
(Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Gallery: one stop per visible photo, scrolling the carousel to the focused photo. Viewer: cycles Close, Previous, Next (and Try again) only. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Opens the viewer at that photo; focus moves to Close. |
| <kbd>←</kbd> / <kbd>→</kbd> | Viewer: previous or next photo; the count updates and is announced. |
| <kbd>Home</kbd> / <kbd>End</kbd> | Viewer: first or last photo. |
| <kbd>Esc</kbd> | Closes the viewer; focus returns to the gallery button of the photo that was showing. |

### Focus

Gallery buttons keep `--radius-full`, so the ring is a circle. Opening the
viewer focuses Close. Previous and Next keep focus at the ends because they use
`aria-disabled`. Closing returns focus to the thumbnail of the photo that was
showing; if that photo is hidden in the current layout (photo 9 at LG), focus
goes to the last visible thumbnail, the one with the "+N" scrim (D-5).

### Labelling

- Each gallery button: "Open photo 2 of 6: Curry chicken with rice and buss up
  shut in a steel karahi"; the image inside has `alt=""` so the caption is not
  read twice.
- The "+N" scrim is `aria-hidden`; the button's name adds "25 more photos in
  the viewer". Dots are `aria-hidden`; position is in the names.
- Viewer: dialog named "Pelau House photos", described by the caption; the
  stage image's `alt` is the caption (L2-068.1); buttons "Close photo viewer",
  "Previous photo", "Next photo".

### Announcements

The count (`aria-live="polite"`) announces "3 of 6" after each change. Loading
and failure are in the photo's `role="img"` name.

### Motion

Thumbnails zoom over `--duration-slow`; the current dot widens over
`--duration-base`; the viewer fades in. Under `prefers-reduced-motion:
reduce`, zoom and slide transitions stop, the photo swap is an opacity fade of
200 ms or less, and carousel snap scrolling is instant.

## Content and internationalisation

- Count: "2 of 6" ("2 sur 6"), no "Photo" prefix on screen.
- Captions are the caterer's own words, 5–125 characters.
- More: "+1 photo", "+25 photos".
- Failure: "This photo didn't load." with "Try again"; never an error code.
- Order is the caterer's; the cover is always first.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (button names, the hidden
  count, the current dot) are computed once, not in the template.
- The lead photo loads eagerly (it is the caterer page's largest image and
  likely LCP); thumbnails beyond the first viewport use `loading="lazy"`. The
  viewer preloads the next and previous `viewerSrc` so the spinner is rare; the
  spinner appears only after 300 ms.
- Swipe uses pointer events with `touch-action: pan-y` on the stage; no gesture
  library.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Gallery.ts`
  renders Pelau House's six photos (cover `pelau-house`, "Chicken pelau in a
  steel pot with lime and cucumber chutney"); a second scenario
  `PhotoViewer.ts` opens the viewer at 2 of 6; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep each at roughly
  100–300 ms.
- Composite scenarios: `CatererPage`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: skeleton circles occupy the final layout; images carry
  `width` and `height`.
- Weight: composes [photo](photo.md), [icon button](icon-button.md),
  [button](button.md), [spinner](spinner.md), [skeleton](skeleton.md) and the
  framework's dialog primitive.

## Acceptance criteria

### Gallery

- **AC-1** Given Pelau House's photos ordered `pelau-house` (cover), `maracas-bay`, `sunday-pot`, when the page renders, then the gallery's buttons are in that order and the first is named "Open photo 1 of 6: Chicken pelau in a steel pot with lime and cucumber chutney". (L2-016)
- **AC-2** Given the gallery, when a screen reader reads photo 2's button, then it hears "Open photo 2 of 6: Curry chicken with rice and buss up shut in a steel karahi" once, and the image inside has `alt=""`. (L2-068)
- **AC-3** Given Pelau House's page, when it renders, then the gallery is the first section of the main content, before the business name. (L2-015)
- **AC-4** Given a caterer with 30 photos at 1280 px, when the gallery renders, then the lead and four thumbnails show, the fifth shows "+25 photos", and its button's name ends "25 more photos in the viewer". (L2-019)
- **AC-5** Given the edge-case caterer whose photo 2 fails, when the gallery renders, then that button shows "Photo unavailable" and is named "Open photo 2 of 4: Stewed saltfish with peppers over rice (did not load)". (L2-068)
- **AC-6** Given the caterer page is loading, when the gallery renders, then it shows five skeleton circles in the final layout, `aria-busy="true"` on the section and no focusable items. (L2-066)

### Responsive

- **AC-7** Given a 360 px viewport, when Pelau House's gallery renders, then it is a horizontal carousel with each photo about 80 % wide, the next one peeking in, six dots with the first current, and swiping moves one photo at a time. (L2-019)
- **AC-8** Given a 800 px viewport, when the gallery renders, then a lead photo at most 24rem wide sits above a strip of five thumbnails. (L2-019)
- **AC-9** Given a 1280 px viewport, when the gallery renders, then a lead photo spans two rows beside a 2 × 2 grid of four thumbnails. (L2-019)
- **AC-10** Given a 320 px viewport, when the caterer page renders, then the page does not scroll horizontally; only the gallery track scrolls sideways. (L2-064)
- **AC-11** Given a 360 px viewport, when the viewer is open, then Close, Previous and Next each measure at least 44 × 44 CSS px with at least 8 px between them. (L2-065)

### Viewer

- **AC-12** Given the gallery, when the visitor activates photo 2, then the viewer opens showing that photo with the caption "Curry chicken with rice and buss up shut in a steel karahi" and the count "2 of 6", and focus is on "Close photo viewer". (L2-016)
- **AC-13** Given the viewer at 2 of 6, when the visitor presses Right Arrow, swipes left, or activates "Next photo", then photo 3 shows and the count reads and announces "3 of 6"; Left Arrow or a right swipe goes back. (L2-016)
- **AC-14** Given the viewer at 6 of 6 reached with "Next photo", when it renders, then "Next photo" has `aria-disabled="true"`, keeps focus, and pressing it again changes nothing; at 1 of 6 the same holds for "Previous photo". (L2-067)
- **AC-15** Given the viewer opened from photo 2 and moved to photo 4, when the visitor presses Escape or activates Close, then the viewer closes and focus is on the gallery button for photo 4. (L2-016)
- **AC-16** Given the viewer is open, when the visitor presses Tab repeatedly, then focus cycles only among Close, Previous and Next (and Try again when shown), and the page behind is inert. (L2-016)
- **AC-17** Given photo 3 takes longer than 300 ms to load, when the viewer moves to it, then the stage shows a spinner in a circle named "Loading photo 3 of 6", the viewer has `aria-busy="true"`, and the caption is already shown. (L2-016)
- **AC-18** Given photo 4 fails to load in the viewer, when it renders, then the stage shows a circle named "Photo 4 of 6 didn't load", the caption, "This photo didn't load." and "Try again", and Previous and Next still work. (L2-016)

### Theming and motion

- **AC-19** Given the light and dark themes, when the viewer opens, then its background is `--color-bg-canvas`, the count has at least 4.5:1 and the caption at least 4.5:1 contrast, and the photo has no filter. (L2-069)
- **AC-20** Given the light and dark themes, when "+25 photos" renders on the scrim, then its contrast is at least 4.5:1 over the darkest and the lightest photo. (L2-069)
- **AC-21** Given keyboard focus on a gallery button, when it renders, then a round `--color-focus-ring` ring surrounds the photo with at least 3:1 contrast against the page. (L2-067)
- **AC-22** Given `prefers-reduced-motion: reduce`, when the visitor moves from photo 2 to 3 in the viewer, then the swap is an opacity fade of 200 ms or less with no sliding, and hovering a thumbnail zooms instantly. (L2-069)

### Performance

- **AC-23** Given Pelau House's page on a mobile profile, when it first loads, then the lead gallery image has no `loading` attribute, thumbnails outside the first viewport have `loading="lazy"`, and Cumulative Layout Shift stays at or below 0.1. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/gallery/`; files
  `gallery.component.*` (`sh-gallery`, `GalleryComponent`) and
  `photo-viewer.component.*` (`sh-photo-viewer`, `PhotoViewerComponent`); the
  `GalleryPhoto` and `ViewerLabels` types are exported.
- The viewer uses the framework's accessible dialog or overlay primitive for
  focus trapping, inert background, Escape and focus return; the component
  adds arrow, Home, End and swipe handling.
- Styles: the "Gallery and viewer" section of `components.css` moves into the
  components. The `.gallery__more` breakpoint rules have landed in
  `components.css`.
- Design-system catch-up: viewer arrows at the ends use `aria-disabled` (the
  mocks and design system use `disabled`, D-6); the gallery buttons on
  `caterer/default` gain the caption in their names; "Try again" loses its
  inline margin.
- The carousel scrolls the focused button into view with `scrollIntoView({
  inline: 'center' })`; dots follow scroll position, read once per scroll end.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component or two?* Two in one folder: the gallery lives in the page; the viewer is an overlay that the page opens with the gallery's index. Keeping them separate lets the viewer use the dialog primitive without wrapping the page section.
- **D-3** *Which thumbnail carries the "+N" scrim?* The 6th at SM–MD and the 5th at LG–XL, chosen by CSS. The component renders the scrim and the spoken suffix on both candidates when there are more photos than the layout shows; at each breakpoint the other candidate is either hidden or not the last visible, so a screen reader at SM hears the suffix on photo 6 and also on photo 5. That one extra mention is accepted to keep the choice in CSS.
- **D-4** *Does the viewer wrap from the last photo to the first?* No, as the design system says; the ends are stated by unavailable arrows.
- **D-5** *Where does focus return when the last photo viewed is hidden in the gallery's layout?* To the last visible thumbnail (the one with "+N"), because focus cannot go to a hidden button and that thumbnail represents the hidden photos.
- **D-6** *Do the viewer's arrows use `disabled` at the ends?* No, `aria-disabled="true"`. A visitor pressing Next to reach the last photo would otherwise lose focus to the page behind the modal; the same rule is used for move buttons in [photo tile](photo-tile.md), as the dish and photo-tile design-system pages require.
- **D-7** *What is the viewer image's `alt`?* The caption, as the design system code and `photo-viewer/default` show and L2-068.1 requires; the dialog's description repeats it once on open, which is acceptable for a full-screen view of one photo.
- **D-8** *What `sizes` does the gallery declare?* `(min-width: 62rem) 30rem, (min-width: 36rem) 24rem, 80vw` for the lead and `(min-width: 62rem) 14rem, (min-width: 36rem) 8rem, 80vw` for thumbnails. The design system names no `sizes` for the gallery; these match its layout widths.
