# Photo tile

| Field | Value |
|---|---|
| Selector | `sh-photo-tile` (one photo in the manager), `sh-photo-manager` (the ordered grid of tiles with its loading state and move announcements) |
| Library path | `frontend/projects/components/src/lib/photo-tile/` |
| Status | planned |
| Traces to | L2-039, L2-041, L2-042, L2-045, L2-047, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-091 |
| Design system | [`photo-tile.html`](../../design-system/components/photo-tile.html) |
| Source mocks | [`pages/profile-photos/default`](../../mocks/pages/profile-photos/default.html), [`pages/profile-photos/uploading`](../../mocks/pages/profile-photos/uploading.html), [`pages/profile-photos/processing`](../../mocks/pages/profile-photos/processing.html), [`pages/profile-photos/invalid`](../../mocks/pages/profile-photos/invalid.html), [`pages/profile-photos/full`](../../mocks/pages/profile-photos/full.html), [`pages/profile-photos/read-only`](../../mocks/pages/profile-photos/read-only.html), [`pages/profile-photos/loading`](../../mocks/pages/profile-photos/loading.html), [`pages/admin-profile-review/default`](../../mocks/pages/admin-profile-review/default.html), [`pages/admin-profile-review/resubmitted`](../../mocks/pages/admin-profile-review/resubmitted.html), [`dialogs/photo-details/default`](../../mocks/dialogs/photo-details/default.html), [`dialogs/remove-photo/default`](../../mocks/dialogs/remove-photo/default.html), [`notifications/dashboard-toast/default`](../../mocks/notifications/dashboard-toast/default.html) |
| Rendering | [`photo-tile.html`](photo-tile.html) |

## Purpose and scope

A photo tile is one of a caterer's photos in their photo manager
(`pages/profile-photos`): the round photo, a "Cover" tag on the first, the
caterer's caption under it, buttons to move it up or down, and "Edit", which
opens the photo details dialog where caption, cover, replace and remove live.
Tiles also show an upload in progress (percentage, progress bar, "Cancel"), a
photo still processing, a missing caption, and the read-only view while a
profile is in review or when an operator reviews it. Photos lead a caterer's
listing: the first becomes the round photo on their card, so order matters and
is set with buttons only, never by dragging.

`sh-photo-manager` is the grid: two to four columns of tiles in the order they
appear on the public page, its loading skeletons, and the polite announcement
after a move. The public page shows the same photos in the
[gallery](gallery.md); the circle itself is [photo](photo.md).

Out of scope:

- The upload tile (`.upload-tile`) and the "Add photos" toolbar button with its
  file input: [file upload](file-upload.md) and [button](button.md).
- The photo details and remove dialogs, caption validation ("Captions describe
  the photo in 5–125 characters") and the 3-photo minimum message
  (L2-042.3–4): [dialog](dialog.md) and the page.
- The page's subtitle "6 of 30 · the first photo is your cover", save status
  "Uploading 2 photos…", the processing alert, the invalid-file error summary,
  the full-state help and the empty and error states: the page,
  [alert](alert.md), [empty state](empty-state.md).
- Upload transport, resizing and malware scanning (L2-041): the service; the
  tile shows the progress and status it is given.

## Usage

Inventory from `usage_inventory.py docs/mocks photo-tile "li|p|span|div"` (187
tiles on 7 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/profile-photos/default`, `invalid`; `dialogs/photo-details/*`, `remove-photo/*`, `notifications/dashboard-toast` (page behind) | editable, 6 tiles | Pelau House's six photos and captions, "Cover" on photo 1, "Move photo 1 up" (unavailable) / "Move photo 1 down", "Edit photo 1" | default, first, last | canvas |
| `pages/profile-photos/full` | editable, 30 tiles | Maracas Bay's photos | default | canvas |
| `pages/profile-photos/uploading` | 6 editable + 2 uploading | "IMG_2076.heic" 64 %, "IMG_2077.heic" 18 %, "Cancel upload of IMG_2076.heic" | uploading | canvas |
| `pages/profile-photos/processing` | 6 editable + 1 processing | clock placeholder, caption "Doubles with tamarind and cucumber chutney", status "Processing" | processing | canvas |
| `pages/profile-photos/read-only` | read-only, 5 tiles | Green Fig Catering's captions, "Cover" on photo 1 | read-only | canvas |
| `pages/profile-photos/loading` | manager busy, 6 skeleton tiles | — | loading | canvas |
| `pages/admin-profile-review/*`, `dialogs/approve-profile/*`, `request-changes/*` | read-only operator grid | Auntie Merle's Table, Flying Fish Kitchen: photo + caption | read-only | canvas |
| (design system only) | editable, missing caption | Auntie Bev's draft photo 2: "Add a caption", "Add caption to photo 2" | missing caption | canvas |

## Anatomy

1. **Tile** — `li.photo-tile`: a centred flex column, `--space-2` gaps,
   centred text.
2. **Photo** — `.photo` from [photo](photo.md), `min(100%, 10rem)`, round,
   `alt=""` because the caption is visible beside it (D-3).
3. **Cover tag** — `span.photo-tile__cover` inside the photo, on photo 1 only:
   ink pill (`--color-action` / `--color-fg-on-action`), `--text-caption`
   semibold, `--space-3` above the bottom of the circle, "Cover".
4. **Caption** — `p.photo-tile__caption`: the caterer's words in
   `--text-body-sm`, `--color-fg-muted`, clamped to two lines.
   `.photo-tile__caption--missing` reads "Add a caption" in
   `--color-warning-fg`, medium weight.
5. **Move** — `div.photo-tile__move`: two 44 px [icon buttons](icon-button.md),
   "Move photo 2 up" / "Move photo 2 down", `--space-2` (8 px) apart (D-8).
6. **Edit** — a link-style small [button](button.md), "Edit" plus a visually
   hidden " photo 2", `aria-haspopup="dialog"`. Extra actions sit in
   `div.photo-tile__actions`.
7. **Upload progress** — `span.photo-tile__progress` (scrim with the
   percentage, `aria-hidden`) inside the photo, a `.progress` bar
   (`role="progressbar"`) under the file name, and "Cancel".
8. **Processing status** — a [status](status.md) `status--pending`
   "Processing" under the caption; the photo shows the clock alone.
9. **Skeleton** — `li.photo-tile.photo-tile--skeleton`, `aria-hidden`: a
   skeleton circle and a 7rem text bar.
10. **Grid** — `ul.photo-manager` with `aria-label="Photos, in the order they
    appear on your page"`.

Host: `sh-photo-tile` is `display: contents` inside `sh-photo-manager`'s `ul`,
so each tile is a direct `li` child. `sh-photo-manager` is `display: block`
and renders the `ul` and a visually hidden polite status region after it.

## API

### `sh-photo-tile` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `mode` | `'editable' \| 'readonly' \| 'uploading' \| 'processing'` | `'editable'` | no | Chooses the controls: move + edit, none, progress + cancel, status. |
| `position` | `number` | — | yes | 1-based place in the order; names the controls ("photo 2"). Photo 1 shows the Cover tag (D-2). |
| `total` | `number` | — | yes | Number of photos; the last tile's "down" is unavailable. |
| `photo` | `{ src: string; width: number; height: number } \| null` | `null` | no | The 160 px rendition; `null` while processing shows the clock placeholder. |
| `caption` | `string \| null` | `null` | no | The caterer's caption. `null` or empty in `editable` mode shows `missingCaptionLabel` in the warning style. |
| `fileName` | `string` | — | yes for `uploading` | Shown as the caption line and in the progress bar's name ("IMG_2076.heic"). |
| `progress` | `number` | `0` | no | Whole percent 0–100 for `uploading`. |
| `labels` | `PhotoTileLabels` | — | yes | Translated copy: `cover` ("Cover"), `moveUp` ("Move photo {n} up"), `moveDown`, `edit` ("Edit"), `editObject` (" photo {n}"), `missingCaption` ("Add a caption"), `addCaption` ("Add caption to photo {n}"), `uploading` ("Uploading {file}"), `cancel` ("Cancel"), `cancelObject` (" upload of {file}"), `processing` ("Processing"). |

### `sh-photo-manager` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The list's `aria-label`: "Photos, in the order they appear on your page". |
| `busy` | `boolean` | `false` | no | Renders `skeletonCount` skeleton tiles instead of the projected ones; the `ul` gets `aria-busy="true"`. |
| `skeletonCount` | `number` | `6` | no | Whole number from 1 to 30. |
| `announcement` | `string \| null` | `null` | no | Text placed in the polite status region after a move: "Photo 2 moved to position 1. It is now your cover." The consumer sets it after saving the order. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `moveRequested` (`sh-photo-tile`) | `{ position: number; direction: 'up' \| 'down' }` | A move button that is available is activated. Unavailable moves (`aria-disabled`) emit nothing. |
| `editRequested` (`sh-photo-tile`) | `{ position: number }` | "Edit" or "Add caption to photo {n}" is activated; the page opens `dialogs/photo-details` and returns focus to this button. |
| `cancelRequested` (`sh-photo-tile`) | `{ fileName: string }` | "Cancel" on an uploading tile is activated. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-photo-tile`: `[slot=actions]` | extra link-style small [buttons](button.md) | Rendered in `.photo-tile__actions` after "Edit" (design system); no mock uses it. |
| `sh-photo-manager`: default | `sh-photo-tile` elements | In public order. Hidden while `busy`. |

- Translation: every string in `labels`, `label` and `announcement` comes from
  the resource files (L2-064); captions and file names are data.

## Variants and sizes

| Variant | Mode | Shows |
|---|---|---|
| Editable | `editable` | Photo (+ Cover on 1), caption, move up/down, Edit |
| Missing caption | `editable`, no caption | "Add a caption" in warning colour; the edit button reads "Add caption to photo 2" |
| Uploading | `uploading` | Photo under a scrim with "64%", file name, progress bar, Cancel |
| Processing | `processing` | Clock placeholder, caption, "Processing" status |
| Read-only | `readonly` | Photo (+ Cover), caption; no controls |
| Skeleton | manager `busy` | Circle and bar |

One size: the photo fills its column up to 10rem; only the grid's column count
changes.

| Grid | Columns XS / SM / MD / LG / XL | Gaps (row / column) |
|---|---|---|
| `ul.photo-manager` | 2 / 2 / 3 / 3 / 4 (4 from 75rem) | `--space-8` / `--space-4` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | `editable` | As anatomy | Caption read; buttons named "Move photo 2 up" … |
| First / last | `position` 1 / `total` | "Move up" (first) or "Move down" (last) dimmed, `aria-disabled="true"` | Still focusable; announced "dimmed"/"unavailable" |
| Move hover, focus, active | `:hover`, `:focus-visible`, `:active` on a move button | [icon button](icon-button.md) states | — |
| Edit hover, focus, active | on Edit | [button](button.md) link states | — |
| Missing caption | no caption | Warning-coloured "Add a caption" | Read as text; button "Add caption to photo 2" |
| Uploading | `uploading` | Scrim with "64%" over the photo; bar at 64 % | Progress bar "Uploading IMG_2076.heic", value 64; percentage text hidden |
| Processing | `processing` | Clock placeholder, "Processing" status | Status read as text |
| Read-only | `readonly` | No move or edit | Only images and captions |
| Loading | manager `busy` | Six skeleton tiles | `aria-busy` on the list; skeletons hidden |
| Disabled | — | Never on the tile; read-only removes controls instead | — |

## Markup

```html
<!-- rendered: editable grid, first and last tiles -->
<ul class="photo-manager" aria-label="Photos, in the order they appear on your page">
  <li class="photo-tile">
    <span class="photo"><img src="…/pelau-house-400.avif" alt="" width="160" height="160"><span class="photo-tile__cover">Cover</span></span>
    <p class="photo-tile__caption">Chicken pelau in a steel pot with lime and cucumber chutney</p>
    <div class="photo-tile__move">
      <button class="icon-btn" type="button" aria-label="Move photo 1 up" aria-disabled="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
      <button class="icon-btn" type="button" aria-label="Move photo 1 down"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
    </div>
    <button class="btn btn--link btn--sm" type="button" aria-haspopup="dialog">Edit<span class="visually-hidden"> photo 1</span></button>
  </li>
  …
</ul>
<p class="visually-hidden" role="status" aria-live="polite">Photo 2 moved to position 1. It is now your cover.</p>
```

```html
<!-- rendered: missing caption -->
<li class="photo-tile"><span class="photo"><img src="…" alt="" width="160" height="160"></span><p class="photo-tile__caption photo-tile__caption--missing">Add a caption</p><div class="photo-tile__move">…</div><button class="btn btn--link btn--sm" type="button" aria-haspopup="dialog">Add caption<span class="visually-hidden"> to photo 2</span></button></li>

<!-- rendered: uploading -->
<li class="photo-tile"><span class="photo"><img src="…" alt="" width="160" height="160"><span class="photo-tile__progress" aria-hidden="true">64%</span></span><p class="photo-tile__caption">IMG_2076.heic</p><div class="progress" role="progressbar" aria-label="Uploading IMG_2076.heic" aria-valuenow="64" aria-valuemin="0" aria-valuemax="100" style="--value: 64%"><div class="progress__bar"></div></div><button class="btn btn--link btn--sm" type="button">Cancel<span class="visually-hidden"> upload of IMG_2076.heic</span></button></li>

<!-- rendered: processing -->
<li class="photo-tile"><span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></svg></span><p class="photo-tile__caption">Doubles with tamarind and cucumber chutney</p><span class="status status--pending">Processing</span></li>

<!-- rendered: read-only, and loading -->
<li class="photo-tile"><span class="photo"><img src="…" alt="" width="160" height="160"><span class="photo-tile__cover">Cover</span></span><p class="photo-tile__caption">Curry goat and rice in my steel pot</p></li>
<li class="photo-tile photo-tile--skeleton" aria-hidden="true"><span class="photo"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text"></span></li>
```

Consumer template (binding syntax illustrative):

```html
<sh-photo-manager [label]="t('photos.listLabel')" [busy]="loading()" [announcement]="moveMessage()">
  @for (p of photos(); track p.id; let i = $index) {
    <sh-photo-tile [mode]="readOnly() ? 'readonly' : p.state" [position]="i + 1" [total]="photos().length" [photo]="p.thumb" [caption]="p.caption"
        [fileName]="p.fileName" [progress]="p.progress" [labels]="tileLabels" (moveRequested)="move($event)" (editRequested)="openDetails($event)"></sh-photo-tile>
  }
</sh-photo-manager>
```

The e2e page objects locate tiles by `.photo-tile`, `.photo-tile__cover`,
`.photo-tile__caption`, `.photo-tile__caption--missing`, the buttons' names,
`role="progressbar"` and `.photo-tile--skeleton`; those are part of the
contract.

## Design

- Grid: `--space-8` row gap, `--space-4` column gap; 2 / 3 (48rem) / 4 (75rem)
  columns.
- Tile: `--space-2` gaps, centred. Photo `min(100%, 10rem)`, `--radius-full`.
- Cover tag: `--space-3` from the circle's bottom, `--space-2` side padding,
  `--radius-full`, `--text-caption` with `--font-weight-semibold`.
- Caption: `--text-body-sm`, two-line clamp; missing caption
  `--font-weight-medium`.
- Move buttons `--target-comfortable` (44 px), `--space-2` (8 px) apart, and
  `--space-2` between the move row and Edit (D-8).
- Progress overlay `--color-bg-scrim`, `--text-label`; bar `min(100%, 8rem)`,
  `--space-2` tall, width eased over `--duration-deliberate`.
- Layer: the cover tag and overlay sit inside the photo's stacking context; no
  z-index token is needed.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Caption | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Missing caption | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Cover tag fill | `--color-action` | `--palette-stone-950` | `--palette-stone-100` |
| Cover tag text | `--color-fg-on-action` | `--palette-white` | `--palette-stone-950` |
| Upload overlay | `--color-bg-scrim` | fixed dark scrim (72 %) | fixed dark scrim (72 %) |
| Upload percentage | `--color-fg-on-scrim` | `--palette-white` | `--palette-white` |
| Progress bar / track | `--color-action` / `--color-bg-subtle-hover` | `--palette-stone-950` / `--palette-stone-200` | `--palette-stone-100` / `--palette-stone-700` |
| Photo disc | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Progress is not a selection, so it is ink, never pepper.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Caption |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | "Add a caption" |
| `--color-fg-on-action` | `--color-action` | 4.5:1 | "Cover" |
| `--color-fg-on-scrim` | `--color-bg-scrim` | 4.5:1 | "64%" over the photo |
| `--color-action` | `--color-bg-subtle-hover` | 3:1 | Progress bar on its track |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus on move and edit |

## Responsive behaviour

- Below 48rem: two columns, `--space-4` apart, `--space-8` between rows; at
  360 px each photo is about 150 px across.
- 48rem to 75rem: three columns; from 75rem four, with the dashboard's listing
  card preview beside the grid.
- The photo never exceeds 10rem; wide columns add space around it.
- Captions clamp at two lines; the full caption is in the edit dialog.
- Below 48rem the small "Edit" button grows to 44 px tall (L2-065.1); move
  buttons are always 44 px with `--space-2` (8 px) between them and at least
  8 px between the move row and Edit, so neighbouring targets never touch (D-8).
- At 320 px two columns still fit (each about 136 px) and nothing scrolls
  horizontally.

## Accessibility

### Role and pattern

A list (`ul` with an `aria-label`) of tiles. Reordering uses buttons, which
WCAG 2.5.7 (Dragging Movements) requires anyway; dragging is not offered.
Progress is a `role="progressbar"` named after the file. Edit opens a modal
dialog ([APG Dialog](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Move up → move down → Edit, tile by tile in photo order; Cancel on uploading tiles. Read-only and processing tiles have no stops. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On a move button, moves the photo one place; focus follows the photo to its new tile and stays on the same button. On Edit, opens the dialog. |

### Focus

The shared ring. A photo moved to the first or last place keeps focus on its
now-unavailable button (`aria-disabled`, never `disabled`). When an upload
finishes or a processing photo becomes ready, focus does not move. Closing the
details dialog returns focus to the Edit button that opened it.

### Labelling

- The image has `alt=""` in the manager because the caption is visible next to
  it; on the public page the same caption becomes the `alt` (D-3).
- Buttons name the photo: "Move photo 2 up", "Edit photo 2", "Cancel upload of
  IMG_2076.heic".
- The percentage over the photo is `aria-hidden`; the progress bar carries the
  value.

### Announcements

After a move, the manager's polite status says "Photo 2 moved to position 1.
It is now your cover." (the second sentence only when the photo reaches
position 1). Upload start and finish are announced by the page's save status
and a toast ("Photo added").

### Motion

The progress bar eases its width over `--duration-deliberate`; under
`prefers-reduced-motion: reduce` it jumps. Moves are instant.

## Content and internationalisation

- Captions are the caterer's words: "Curry chicken scattered with shado beni
  over white rice", 5–125 characters.
- The cover tag is always "Cover" ("Couverture" in French; the pill grows).
- File names are shown as uploaded ("IMG_2076.heic").
- Control names count from 1 and use the photo's position, not its caption,
  so they stay short and unique.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (control names, availability
  of up and down, the cover flag) are computed once, not in the template.
- A move re-renders only the two tiles whose positions change (tracked by
  photo id).
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/PhotoTile.ts`
  renders Pelau House's photo 2 ("Curry chicken with rice and buss up shut in
  a steel karahi", editable, position 2 of 6); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `PhotoManager` (6 tiles, and the 30-tile `full`
  state), `PhotoManagerUploading`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: skeleton tiles match the final tile; a processing tile
  keeps the circle; the overlay sits inside the photo.
- Weight: composes [photo](photo.md), [icon button](icon-button.md),
  [button](button.md), [status](status.md), the `.progress` bar and
  [skeleton](skeleton.md); no drag-and-drop library.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's six photos, when the photo manager renders, then six `li.photo-tile` appear in the saved order, photo 1 shows `.photo-tile__cover` "Cover" and no other tile does. (L2-042)
- **AC-2** Given tile 2, when it renders, then its caption reads "Curry chicken with rice and buss up shut in a steel karahi", its `img` has `alt=""`, and a screen reader hears the caption once. (L2-068)
- **AC-3** Given tile 2, when its controls are inspected, then they are named "Move photo 2 up", "Move photo 2 down" and "Edit photo 2", and Edit has `aria-haspopup="dialog"`. (L2-068)
- **AC-4** Given Auntie Bev's draft photo 2 has no caption, when its tile renders, then `.photo-tile__caption--missing` reads "Add a caption" and the edit button is named "Add caption to photo 2". (L2-039)

### Reordering

- **AC-5** Given Kendra focuses "Move photo 3 up", when she presses Enter, then the photo moves to position 2, focus stays on the same photo's "Move photo 2 up", and the status says "Photo 3 moved to position 2." (L2-042)
- **AC-6** Given photo 2, when Kendra activates "Move photo 2 up", then it becomes photo 1, gains the Cover tag, and the status says "Photo 2 moved to position 1. It is now your cover." (L2-042)
- **AC-22** Given Pelau House's six photos, when Kendra ticks "Use as cover photo" for photo 4 and saves, then the manager shows that photo as photo 1 with the Cover tag, photos 1–3 move down one position in their previous order, and no other tile shows the Cover tag. (L2-042)
- **AC-23** Given the photo manager at any width, when a pointer user presses on a tile and drags it, then nothing moves: no tile is `draggable` or offers a drag handle, and the order changes only through "Move photo {n} up" and "Move photo {n} down". (L2-042)
- **AC-7** Given photo 1, when it renders, then "Move photo 1 up" has `aria-disabled="true"`, stays focusable, and activating it emits nothing; the same holds for "Move photo 6 down" on the last photo. (L2-067)
- **AC-8** Given the photo manager at 360 px, when Kendra reorders with "Move up" and "Move down", then each button is at least 44 × 44 CSS px, at least 8 px from any neighbouring target (including Edit), and the page does not scroll horizontally. (L2-045)
- **AC-9** Given a keyboard user in the manager, when they tab through, then focus visits move up, move down and Edit of tile 1, then tile 2, in photo order, with a visible ring of at least 3:1 contrast. (L2-067)

### Upload and processing

- **AC-10** Given "IMG_2076.heic" is 64 % uploaded, when its tile renders, then the photo shows "64%" on a scrim (`aria-hidden`), the bar has `role="progressbar"`, name "Uploading IMG_2076.heic" and `aria-valuenow="64"`, and Cancel is named "Cancel upload of IMG_2076.heic". (L2-041)
- **AC-11** Given an uploaded photo is waiting for the image service, when its tile renders, then the photo shows the clock alone (no "Processing" inside the circle) and a `status--pending` reads "Processing" under the caption. (L2-091)
- **AC-12** Given the processing photo becomes ready, when the manager updates, then the tile becomes editable in place with the new image and focus does not move. (L2-041)

### States

- **AC-13** Given Green Fig Catering's profile is in review, when the manager renders, then tiles show photos and captions only, with no move or edit buttons. (L2-039)
- **AC-14** Given an operator opens Auntie Merle's Table's submitted profile, when the photos render, then they appear as read-only tiles in the caterer's order with captions, and the caption element is `p.photo-tile__caption`. (L2-047)
- **AC-15** Given the manager is loading, when it renders with `busy`, then the list has `aria-busy="true"` and six `li.photo-tile--skeleton`, each `aria-hidden="true"`. (L2-066)

### Theming

- **AC-16** Given the light and dark themes, when tile 1 renders, then "Cover" has at least 4.5:1 contrast on `--color-action`, and the caption at least 4.5:1 against the canvas. (L2-069)
- **AC-17** Given the light and dark themes, when the 18 % upload tile renders, then "18%" has at least 4.5:1 contrast on the scrim over any photo and the bar at least 3:1 against its track. (L2-069)
- **AC-18** Given `prefers-reduced-motion: reduce`, when upload progress changes from 18 % to 64 %, then the bar's width changes with no transition. (L2-069)

### Responsive

- **AC-19** Given viewports of 360 px, 800 px and 1280 px, when the manager renders, then tiles are in 2, 3 and 4 columns respectively, and no photo is wider than 160 px. (L2-045)
- **AC-20** Given a 320 px viewport, when the 30-photo manager renders, then captions clamp at two lines, nothing overlaps, and the page does not scroll horizontally. (L2-064)
- **AC-21** Given a 360 px viewport, when "Edit photo 2" is measured, then its target is at least 44 CSS px tall. (L2-065)

## Implementation notes

- Folder `frontend/projects/components/src/lib/photo-tile/`; files
  `photo-tile.component.*` (`sh-photo-tile`, `PhotoTileComponent`) and
  `photo-manager.component.*` (`sh-photo-manager`, `PhotoManagerComponent`);
  `PhotoTileLabels` is exported.
- Styles: the "Photo manager tiles" section of `components.css` moves into the
  components; `.upload-tile` stays with [file upload](file-upload.md).
- Design-system catch-up from the extraction: manager images get `alt=""`
  (every mock repeated the caption); first and last move buttons use
  `aria-disabled` (the mocks use `disabled`); the processing tile drops the
  label inside the circle; the operator grid uses `p.photo-tile__caption`
  (the mocks use `span`).
- Below 48rem the Edit button needs `min-height: var(--target-comfortable)`
  (the design system states it; `components.css` does not yet set it), and
  `.photo-tile__move` needs `gap: var(--space-2)` plus `--space-2` above Edit
  (D-8).
- Focus following a move: after the order updates, the manager focuses the
  same direction's button on the moved photo's new tile (tracked by id).
- No CDK primitive is needed for the grid; the dialog uses the framework's
  dialog primitive ([dialog](dialog.md)).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How is the cover chosen?* The first photo is the cover, as the mocks, the subtitle "the first photo is your cover" and the move announcement say. "Use as cover photo" in the details dialog moves the photo to position 1, per the user's decision of 10 Oct 2026, and L2-042.6 was amended on 10 Oct 2026 to match (AC-22). The tile has no separate `isCover` input, so order and cover can never disagree.
- **D-3** *Does the manager image repeat the caption as alt?* No, `alt=""`: the caption is visible text right beside it (design system, drift fixed). The operator review grid follows the same rule.
- **D-4** *Is the tile square or round?* Round, as `components.css`, the mocks and the photo-tile page show. The photo page's overview mentions square tiles "so the crop can be judged"; the round tile shows exactly the crop the public page uses, which serves the same purpose.
- **D-5** *Does the manager own the move announcement?* Yes, as an input it renders in its own polite region, because the page knows when the new order is saved and the announcement must not fire for a failed save.
- **D-6** *Is dragging supported?* No. Buttons work the same for touch, mouse, keyboard and switch access (WCAG 2.5.7), per the user's decision of 10 Oct 2026. L2-042.1 was amended on 10 Oct 2026 to match: it names the buttons only and says reordering never depends on dragging (AC-23).
- **D-7** *What does the edit button say when the caption is missing?* "Add caption" with the hidden object " to photo 2", so the visible word says what is needed and the accessible name stays unique.
- **D-8** *How far apart are the move buttons?* At least 8 px (`--space-2`), and at least 8 px between the move row and Edit, on every width. The design system shows `--space-1` (4 px), but the user's decision of 10 Oct 2026 makes L2-065.1's 8 px win for neighbouring 44 px targets on phones; the design system will be updated. The rendering applies it with a specimen-only style.
