# Photo

| Field | Value |
|---|---|
| Selector | `sh-photo` (one round photo), `sh-photo-row` (a row of round photos) |
| Library path | `frontend/projects/components/src/lib/photo/` |
| Status | planned |
| Traces to | L2-006, L2-016, L2-042, L2-064, L2-066, L2-068, L2-069, L2-085, L2-091 |
| Design system | [`photo.html`](../../design-system/components/photo.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterers/edge`](../../mocks/pages/caterers/edge.html), [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`dialogs/photo-viewer/failed`](../../mocks/dialogs/photo-viewer/failed.html), [`dialogs/photo-viewer/busy`](../../mocks/dialogs/photo-viewer/busy.html), [`pages/dashboard/empty`](../../mocks/pages/dashboard/empty.html), [`pages/profile-photos/processing`](../../mocks/pages/profile-photos/processing.html), [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html), [`pages/admin-caterer/loading`](../../mocks/pages/admin-caterer/loading.html), [`pages/admin-caterers/default`](../../mocks/pages/admin-caterers/default.html), [`pages/admin-reviews/default`](../../mocks/pages/admin-reviews/default.html), [`pages/admin-report/loading`](../../mocks/pages/admin-report/loading.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/not-found/default`](../../mocks/pages/not-found/default.html), [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/suspend-caterer/default`](../../mocks/dialogs/suspend-caterer/default.html) |
| Rendering | [`photo.html`](photo.html) |

## Purpose and scope

Every caterer on Sweet Hand is represented by their food, cropped to a circle.
`sh-photo` is that circle: a 1:1 crop with a calm `--color-bg-photo` disc
behind the image, so a slow load shows a disc, not a hole. It is the image in
the [caterer card](caterer-card.md), the [gallery](gallery.md) and its viewer,
the occasion tiles, the caterer chip in dialogs ("Send an enquiry to Pelau
House"), inbox and operator rows, and review headers. It owns its own image
states: loading, loaded, no photo yet, processing and failed. `sh-photo-row`
is the trio of decorative photos above sign-in and system pages, and the
operator's strip of a caterer's photos.

Use something else for a person without a photo ([avatar](avatar.md) with
initials "MT", never a grey photo circle), for managing photos where the crop
must be judged ([photo tile](photo-tile.md), with move and edit controls), and for logos or icons
(food only, never storefronts).

Out of scope:

- Hover zoom, focus ring and activation: the link or button around the photo
  ([caterer card](caterer-card.md), [gallery](gallery.md)) owns them; the
  photo only provides the `scale` transition.
- Choosing renditions, formats (AVIF, WebP) and the CDN (L2-006.2, L2-041.5,
  L2-087): the API returns `src` and `srcset`; the consumer sets `sizes`.
- The viewer's caption, "This photo didn't load." and "Try again"
  ([gallery](gallery.md)).
- Captions and their validation (L2-042.3): the photo uses the caption it is
  given as `alt`.

## Usage

Inventory from `usage_inventory.py docs/mocks photo "span|div"` (1,025 plain
photos on 47 screens) and a count of each photo's parent element.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/*`, `occasions/*`, dashboard preview (`a.caterer-card`, 228) | fluid, capped at `--photo-card-size`, `srcset` 400/800/1200, first 6 eager | alt = caterer's caption; occasions `alt=""` | loaded, loading, failed "Photo unavailable", placeholder "Cover photo" | canvas |
| `pages/caterer/*` gallery (`button.gallery__btn`, 37) | fluid | Pelau House's six captions | loaded, failed "Photo unavailable" | canvas |
| `dialogs/photo-viewer/*` stage | fluid, `min(100%, 62dvh, 34rem)` | caption shown beside it | loaded, failed (`role="img"` "Photo 4 of 6 didn't load"), loading spinner (`role="img"` "Loading photo 3 of 6") | dialog surface |
| `pages/inbox/*` (`a.inbox-row`, 149), `pages/admin-*` queues (`a.queue-item`, 84) | fixed 48 / 56 px by the row, lazy, `alt=""` | caterer's cover | loaded, placeholder (no cover: Callaloo Corner, Doubles Duo) | canvas |
| review headers (`div.review__head`, 77), `pages/admin-reviews`, `admin-changes`, `dialogs/moderate-review` | `xs` 40 px, `alt=""` | caterer's cover | loaded | canvas, well |
| `dialogs/enquiry`, `report`, `remove-caterer`, `open-enquiry` … (`div.dialog__caterer`, 13) | 56 px chip, `alt=""` | caterer's cover beside the name | loaded | dialog surface |
| `pages/admin-caterer/*`, `dialogs/suspend-caterer`, `remove-caterer`, `reinstate-caterer`, `operator-edit` | `md` 96 px header | caterer's cover | loaded | canvas, dialog |
| `pages/admin-report/loading`, `pages/admin-caterer/loading` | `sm` / row skeleton | — | loading | well, canvas |
| `pages/dashboard/empty`, `draft`, profile previews | fluid placeholder | "Cover photo" | placeholder | preview pane |
| `pages/profile-photos/processing` | fluid inside a [photo tile](photo-tile.md) | clock + "Processing" | processing | canvas |
| `pages/sign-in`, `register`, `not-found`, `server-error`, `offline`, `about`, `inbox/default` … (`div.photo-row`, 66) | decorative trio, 72 / 104 / 72 px | three cast photos, `alt=""` | loaded | canvas |
| `pages/admin-caterer/default`, `dialogs/suspend-caterer/*` | strip of the caterer's six photos, wrapping, left-aligned | Pelau House's photos | loaded, loading (4 skeleton circles) | canvas, dialog |

## Anatomy

1. **Circle** — `span.photo`: `aspect-ratio: 1`, `--radius-full`,
   `overflow: hidden`, `--color-bg-photo` behind. Fluid by default.
2. **Image** — `img`: `object-fit: cover`, scaled 1.03 so no hairline shows at
   the rim, with `width` and `height` attributes, `alt`, and for fluid photos
   `srcset` and `sizes`.
3. **Placeholder icon** — `svg.icon` (`aria-hidden`): the plate (two circles)
   at `--icon-size-2xl` in `--color-fg-subtle`, `--icon-size-md` at `xs` and
   `sm`; a clock while processing.
4. **Label** — `span.photo__label`: one or two words near the bottom ("Cover
   photo", "Processing", "Photo unavailable") in `--text-caption`,
   `--color-fg-muted`. Shown only on fluid and `lg` photos.
5. **Skeleton (loading)** — `.skeleton.skeleton--circle` filling the circle.
6. **Row** — `div.photo-row`: a centred flex row, `--space-3` gap; three
   photos 72 / 104 / 72 px in the decorative variant.

Host: `sh-photo` is `display: contents`; the `span.photo` carries every class,
so a parent's selectors (`.caterer-card .photo`, `.inbox-row > .photo`) keep
working. `sh-photo-row` renders the `div.photo-row` and is `display: block`.

## API

### `sh-photo` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `src` | `string \| null` | `null` | no | `null` with `status="ready"` renders the placeholder. A new `src` clears the failed state and loads again. |
| `srcset` | `string \| null` | `null` | no | Width descriptors 400w, 800w, 1200w for fluid photos (L2-006.1). |
| `sizes` | `string \| null` | `null` | yes with `srcset` | Set by the consumer to match its grid ("(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw"). |
| `alt` | `string` | — | yes | The caterer's caption for food that carries meaning; `''` for decorative photos (the row, rows and chips whose name sits beside it, occasion tiles). Never generated ("Food from …"). |
| `width`, `height` | `number` | — | yes with `src` | Intrinsic size of the `src` rendition; reserve the circle before the image arrives. |
| `loading` | `'eager' \| 'lazy'` | `'lazy'` | no | `lazy` renders `loading="lazy"`; `eager` renders no attribute. |
| `size` | `'fluid' \| 'xs' \| 'sm' \| 'md' \| 'lg'` | `'fluid'` | no | Adds `.photo--xs` (40 px), `--sm` (56), `--md` (96), `--lg` (160); fluid fills its container. |
| `status` | `'ready' \| 'pending' \| 'processing'` | `'ready'` | no | `pending`: data not yet known, shows the skeleton (or spinner); `processing`: uploaded, sizes not ready, shows the clock and `processingLabel`. |
| `pendingIndicator` | `'skeleton' \| 'spinner'` | `'skeleton'` | no | The viewer uses a large [spinner](spinner.md) because it waits on one image, not a page. |
| `placeholderLabel` | `string \| null` | `null` | no | "Cover photo"; shown when there is no `src`, on fluid and `lg` only. |
| `processingLabel` | `string \| null` | `null` | no | "Processing" on a fluid photo; `null` shows the clock alone, as in a [photo tile](photo-tile.md) whose status line already says "Processing". |
| `failedLabel` | `string` | — | yes | "Photo unavailable", shown on fluid and `lg` photos after an `error` event. |
| `standaloneLabel` | `string \| null` | `null` | no | When the photo stands alone without an image (failed or pending in the viewer), renders `role="img"` and this `aria-label` ("Photo 4 of 6 didn't load", "Loading photo 3 of 6"). Inside a link or button leave it `null`; the parent's name says it. |

### `sh-photo-row` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'decorative' \| 'strip'` | `'decorative'` | no | `decorative`: three photos, the middle larger, centred, `aria-hidden="true"`. `strip`: any number of 72 px photos, left-aligned, wrapping, with their captions as `alt` (D-5). |
| `photos` | `RowPhoto[]` | — | yes | `{ src, alt, width, height }`; exactly 3 for `decorative`. |
| `busy` | `boolean` | `false` | no | `strip` only: renders `skeletonCount` skeleton circles, `aria-hidden`. |
| `skeletonCount` | `number` | `4` | no | Whole number from 1 to 30. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `loadFailed` | `{ src: string }` | The `img` fires `error`. The photo has already switched to its failed look; the viewer listens to offer "Try again". |
| `loaded` | `{ src: string }` | The `img` fires `load`. Used by the viewer to drop its spinner. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | A photo shows an image or its own placeholder, nothing else. Text over a photo is the parent's, on `--color-bg-scrim` (L2-069.2). |

- Translation: `placeholderLabel`, `processingLabel`, `failedLabel` and
  `standaloneLabel` come from the resource files (L2-064). `alt` is the
  caterer's caption: data.

## Variants and sizes

| Variant | Class | Use for |
|---|---|---|
| Loaded | `.photo` with `img` | Every food photo. |
| Placeholder | `.photo.photo--placeholder` | No photo yet ("Cover photo"), or a row without a cover. |
| Processing | `.photo.photo--placeholder` + clock | Just uploaded, sizes not ready (L2-091.2). |
| Failed | `.photo.photo--failed` | The image did not load. |
| Loading | `.photo` > `.skeleton.skeleton--circle` | Data not yet arrived. |
| Decorative row | `div.photo-row[aria-hidden]` | Above sign-in and system pages. |
| Strip | `div.photo-row.photo-row--strip` | The operator's view of a caterer's photos (D-5). |

| Size | Class | Width | Request width | Used for |
|---|---|---|---|---|
| Fluid | `.photo` | its container (cards cap at `--photo-card-size`, 280 px; gallery lead 24rem; viewer 34rem) | `srcset` 400/800/1200 | Cards, gallery, viewer |
| xs | `.photo--xs` | 2.5rem (40 px) | 80w | Review headers |
| sm | `.photo--sm` | 3.5rem (56 px) | 120w | Dialog chip, wells |
| md | `.photo--md` | 6rem (96 px) | 200w | Operator caterer header, confirmation dialogs |
| lg | `.photo--lg` | 10rem (160 px) | 400w | Reserved; no mock uses it yet |

Labels appear only on fluid and `lg` photos; at `xs`–`md` only the icon shows.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Loading | `status="pending"` | Skeleton circle fills the photo (or a large spinner in the viewer) | Hidden in a hidden parent; `role="img"` + "Loading photo 3 of 6" when standalone |
| Image arriving | `img` not yet decoded | `--color-bg-photo` disc of the final size | `alt` already present |
| Loaded | `load` | Image at scale 1.03 | `alt` |
| Hover in a link | parent `:hover` | Parent zooms the image to 1.08 over `--duration-slow` | — |
| Placeholder | no `src` | Plate icon, `placeholderLabel` where there is room | Icon hidden; label read as text |
| Processing | `status="processing"` | Clock icon and "Processing" | Label read as text |
| Failed | `error` event | Plate icon, "Photo unavailable" where there is room; same size and place | Label read; `role="img"` + `standaloneLabel` when standalone |
| Focus, active, disabled | — | Never: a photo is not interactive; wrap it in a link or button | — |

## Markup

```html
<!-- rendered: fluid listing photo, lazy -->
<span class="photo"><img src="https://img.sweethand.example/pimento-and-thyme-800.avif" srcset="…-400.avif 400w, …-800.avif 800w, …-1200.avif 1200w" sizes="(min-width: 62rem) 17.5rem, (min-width: 36rem) 45vw, 90vw" alt="Chicken curry with white rice and roti" width="280" height="280" loading="lazy"></span>

<!-- rendered: fixed size, decorative because the name sits beside it -->
<span class="photo photo--xs"><img src="…/pelau-house-80.avif" alt="" width="40" height="40"></span>
```

```html
<!-- rendered: placeholder, processing, failed, loading -->
<span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/></svg><span class="photo__label">Cover photo</span></span>
<span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg><span class="photo__label">Processing</span></span>
<span class="photo photo--failed"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…plate…</svg><span class="photo__label">Photo unavailable</span></span>
<span class="photo"><span class="skeleton skeleton--circle"></span></span>

<!-- rendered: standalone in the viewer -->
<span class="photo photo--failed" role="img" aria-label="Photo 4 of 6 didn't load"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…plate…</svg></span>
<span class="photo photo--placeholder" role="img" aria-label="Loading photo 3 of 6"><span class="spinner spinner--lg"></span></span>
```

```html
<!-- rendered: decorative row and operator strip -->
<div class="photo-row" aria-hidden="true"><span class="photo"><img src="…" alt="" width="72" height="72"></span><span class="photo"><img src="…" alt="" width="104" height="104"></span><span class="photo"><img src="…" alt="" width="72" height="72"></span></div>
<div class="photo-row photo-row--strip"><span class="photo"><img src="…/pelau-house-200.avif" alt="Chicken pelau in a steel pot with lime and cucumber chutney" width="72" height="72"></span>…</div>
```

Consumer templates (binding syntax illustrative):

```html
<sh-photo [src]="c.cover?.src" [srcset]="c.cover?.srcset" [sizes]="cardSizes" [alt]="c.cover?.alt ?? ''" [width]="280" [height]="280"
    [loading]="i < 6 ? 'eager' : 'lazy'" [placeholderLabel]="t('photo.cover')" [failedLabel]="t('photo.unavailable')"></sh-photo>
<sh-photo size="xs" [src]="r.caterer.thumb" alt="" [width]="40" [height]="40" [failedLabel]="t('photo.unavailable')"></sh-photo>
<sh-photo-row [photos]="systemPhotos"></sh-photo-row>
```

The e2e page objects locate photos by `.photo`, its modifiers, `.photo__label`,
the `img`'s `alt` and `loading`, and `role="img"` names; those are part of the
contract. Icon path data is free to change.

## Design

- Circle `--radius-full`, `aspect-ratio: 1`, disc `--color-bg-photo`.
- Image scale 1.03; parents raise it to 1.08 on hover over `--duration-slow`
  with `--ease-standard`.
- Placeholder icon `--icon-size-2xl` (`--icon-size-md` at xs and sm),
  `--color-fg-subtle`.
- Label `--text-caption`, `--color-fg-muted`, 18 % from the bottom (22 % when
  failed).
- Sizes 2.5rem, 3.5rem, 6rem, 10rem; card cap `--photo-card-size`.
- Row gap `--space-3`; decorative photos 4.5rem and 6.5rem.
- Layer: none.

Component tokens: none. A theme changes only the disc.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Disc behind the image, placeholder | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |
| Placeholder and failed icon | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Skeleton | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |

Images are never filtered, dimmed or tinted in either theme: food colour is the
content.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-photo` | 4.5:1 | "Cover photo", "Processing", "Photo unavailable" |
| `--color-fg-subtle` | `--color-bg-photo` | 3:1 | Placeholder icon (non-text) |

Forced colours: the disc may disappear; the icon and label stay in system
text colour.

## Responsive behaviour

- Fluid photos follow their column; the `sizes` attribute is the consumer's
  and matches its grid.
- `width` and `height` plus `aspect-ratio: 1` reserve the circle at every
  width, before the image arrives.
- In the viewer the photo is `min(100%, 62dvh, 34rem)`, so a landscape phone
  needs no scrolling.
- The strip wraps onto new lines at narrow widths; the decorative row (72 +
  104 + 72 px plus gaps) fits in 288 px.
- Photos are never touch targets; a wrapping link or button is at least the
  photo's size, and xs and sm photos are never the only target in a row.

## Accessibility

### Role and pattern

A plain `img` inside a presentational `span`. A photo with no image that
carries meaning on its own gets `role="img"` and an `aria-label`; inside a link
or button the parent's name says it ([W3C Images
tutorial](https://www.w3.org/WAI/tutorials/images/)).

### Keyboard

None. Photos are never focusable.

### Focus

The parent's ring follows the circle (the gallery button keeps
`--radius-full`). The photo draws no ring.

### Labelling

- `alt` is the caption the caterer wrote (5–125 characters, L2-042.3):
  "Curry chicken with rice and buss up shut in a steel karahi". Not "Photo of
  food", not "Image 2", never the caterer's name.
- Decorative photos have `alt=""`: the decorative row (also `aria-hidden`),
  photos beside a visible caterer name (chips, inbox rows, review headers),
  occasion tiles.
- Placeholder and failed icons are `aria-hidden`; labels are visible text.

### Announcements

None. The viewer announces the change of photo; the photo does not.

### Motion

Only the parent's hover zoom; under `prefers-reduced-motion: reduce` the
transition is removed and the zoom happens instantly.

## Content and internationalisation

- Captions use Canadian English and the caterer's spelling ("buss up shut",
  "shado beni", "black cake").
- Labels are one or two words: "Cover photo", "Processing", "Photo
  unavailable"; French runs longer ("Photo indisponible") and stays one line
  inside a 280 px circle.
- Standalone labels follow "Photo 4 of 6 didn't load" / "Loading photo 3 of 6",
  with the numbers formatted by the consumer.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (classes, the visible label,
  the role) are computed once, not in the template.
- One `error` and one `load` listener on the `img`; no `IntersectionObserver`;
  the browser's `loading="lazy"` does the work.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Photo.ts`
  renders Pelau House's cover ("Chicken pelau in a steel pot with lime and
  cucumber chutney", fluid, 280 × 280); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Listing`, `CatererPage`, `Inbox`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the circle's size never depends on the image; failed,
  placeholder and loading states keep it (L2-006.5).
- Weight: no image library; composes [skeleton](skeleton.md) and
  [spinner](spinner.md).

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's cover with caption "Chicken pelau in a steel pot with lime and cucumber chutney", when its fluid photo renders, then the `img` inside `span.photo` has exactly that `alt`, `width="280"`, `height="280"` and `srcset` widths 400w, 800w and 1200w with the consumer's `sizes`. (L2-006)
- **AC-2** Given the edge-case caterer "O", when its card photo renders, then the `alt` is the caterer's caption "Cook-up rice with chicken, peas and carrots in a red pot" and never "Food from O". (L2-068)
- **AC-3** Given the sign-in page, when the decorative row renders, then `div.photo-row` has `aria-hidden="true"`, three photos 72, 104 and 72 px wide, and every `img` has `alt=""`. (L2-068)
- **AC-4** Given Marcia's inbox, when the row for Pelau House renders, then its 48 px photo has `alt=""`, `loading="lazy"`, and the row's name "Pelau House" is read once. (L2-068)
- **AC-5** Given Kendra changes the caption of photo 2 to "Curry chicken with rice and buss up shut in a steel karahi", when the gallery renders, then that photo's `alt` is the new caption. (L2-042)

### States

- **AC-6** Given Salt Pond Provisions' card photo fails to load at 360 px, when the `error` event fires, then the circle keeps its size, gains `.photo--failed`, shows the plate icon and "Photo unavailable", and `loadFailed` is emitted once. (L2-006)
- **AC-7** Given photo 4 of 6 fails in the viewer, when it renders standalone, then `span.photo--failed` has `role="img"` and the accessible name "Photo 4 of 6 didn't load". (L2-016)
- **AC-8** Given the viewer is waiting for photo 3 of 6, when it renders, then the photo shows a large spinner and has `role="img"` named "Loading photo 3 of 6"; when `loaded` fires, the spinner is replaced by the image in place. (L2-016)
- **AC-9** Given a photo on a slow connection, when the image has not arrived, then a `--color-bg-photo` circle of the final size is shown, and the image's arrival shifts nothing. (L2-006)
- **AC-10** Given a photo Kendra uploaded while image processing is down, when it renders fluid with `status="processing"` and `processingLabel` "Processing", then it shows the clock icon and "Processing" in a circle of the final size, and with `processingLabel` `null` the clock alone. (L2-091)
- **AC-11** Given Auntie Bev's draft with no cover, when the dashboard preview renders, then the photo is `.photo--placeholder` with the plate icon and "Cover photo", and the icon has `aria-hidden="true"`. (L2-068)
- **AC-12** Given the operator's caterer list with Callaloo Corner (no cover), when its 56 px row photo renders, then it shows the plate icon with no label and keeps 56 px. (L2-006)
- **AC-13** Given the operator's report page is loading, when the well renders, then its photo holds a skeleton circle that fills it and is hidden from assistive technology. (L2-066)

### Theming and motion

- **AC-14** Given the light and dark themes, when "Cover photo" renders on the placeholder disc, then the label has at least 4.5:1 and the icon at least 3:1 contrast against `--color-bg-photo`. (L2-069)
- **AC-15** Given the dark theme, when Pelau House's cover renders, then the `img` has no filter, opacity or blend mode applied. (L2-069)
- **AC-16** Given `prefers-reduced-motion: reduce`, when a visitor hovers a gallery photo, then the image reaches its zoomed scale with no transition. (L2-069)

### Responsive and performance

- **AC-17** Given a 320 px viewport, when the sign-in page's decorative row and the operator strip of Pelau House's six photos render, then the row fits and the strip wraps, and the page does not scroll horizontally. (L2-064)
- **AC-18** Given listing page 1 with 24 photos, when it first loads, then the first 6 `img` elements have no `loading` attribute and the other 18 have `loading="lazy"`. (L2-085)
- **AC-19** Given the operator views Pelau House in the admin console, when the strip of six photos renders, then each `img` has the caterer's caption as `alt` (photo 1: "Chicken pelau in a steel pot with lime and cucumber chutney"). (L2-068)

## Implementation notes

- Folder `frontend/projects/components/src/lib/photo/`; files
  `photo.component.*` (`sh-photo`, `PhotoComponent`) and
  `photo-row.component.*` (`sh-photo-row`, `PhotoRowComponent`); the
  `RowPhoto` type is exported.
- Styles: the "Photo" section of `components.css` moves into the component,
  class names unscoped; parent sizing rules (`.inbox-row > .photo`,
  `.dialog__caterer .photo`, `.viewer__stage .photo`) stay with their parents.
- Design-system catch-up: add `.photo-row--strip { justify-content:
  flex-start; flex-wrap: wrap; }` and keep every strip photo 4.5rem (the
  decorative row's larger second photo must not apply) to replace the inline styles in
  `admin-caterer` and `suspend-caterer` (D-5); drop the inline `width: 100%;
  height: 100%` on skeletons inside photos.
- The failed state is internal (set on `error`); a new `src` resets it.
- No CDK primitive is needed. Composes [skeleton](skeleton.md) and
  [spinner](spinner.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Is the host a wrapper element?* No, `display: contents`, so the many parent rules that target `> .photo` keep working and no extra box changes the circle's size.
- **D-3** *Are labels shown at fixed sizes?* Only on fluid and `lg` photos. At 96 px and below a caption-size word would collide with the icon (design system, Variants); the parent row says what is missing.
- **D-4** *Is the photo beside a visible caterer name decorative?* Yes, `alt=""` in chips, inbox, queue and review rows: the name is already read and repeating a caption in every row adds noise. Photos that are the content (cards, gallery, the operator strip) carry the caption.
- **D-5** *What is the operator's photo strip?* `sh-photo-row variant="strip"`, 72 px photos, wrapping, left-aligned, with captions as `alt`. The mocks build it as a `.photo-row` with inline styles and `alt=""`, but the operator reviews these photos (L2-047.2), so they are content and L2-068.1 requires their captions.
- **D-6** *How does the viewer retry?* The viewer sets the same `src` again with a cache-busting query; the photo treats a new `src` as a new load and clears the failed state. The photo itself has no retry control.
- **D-7** *Which placeholder icons exist?* Two: the plate (no photo, failed) and the clock (processing). The camera glyph in the profile-photos empty state belongs to [empty state](empty-state.md).
