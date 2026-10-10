# File upload

| Field | Value |
|---|---|
| Selector | `sh-file-upload` (renders `<input type="file" class="file-input visually-hidden">` + its `<label>` trigger), `sh-file-row` (renders `div.file-row` for one attached file) |
| Library path | `frontend/projects/components/src/lib/file-upload/` |
| Status | planned |
| Traces to | L2-040, L2-041, L2-042, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`file-upload.html`](../../design-system/components/file-upload.html) |
| Source mocks | [`pages/profile-photos/default`](../../mocks/pages/profile-photos/default.html), [`pages/profile-photos/empty`](../../mocks/pages/profile-photos/empty.html), [`pages/profile-photos/uploading`](../../mocks/pages/profile-photos/uploading.html), [`pages/profile-photos/invalid`](../../mocks/pages/profile-photos/invalid.html), [`pages/profile-photos/full`](../../mocks/pages/profile-photos/full.html), [`pages/profile-certificate/default`](../../mocks/pages/profile-certificate/default.html), [`pages/profile-certificate/empty`](../../mocks/pages/profile-certificate/empty.html), [`pages/profile-certificate/expiring`](../../mocks/pages/profile-certificate/expiring.html), [`pages/profile-certificate/saving`](../../mocks/pages/profile-certificate/saving.html), [`dialogs/photo-details/default`](../../mocks/dialogs/photo-details/default.html), [`dialogs/photo-details/busy`](../../mocks/dialogs/photo-details/busy.html) |
| Rendering | [`file-upload.html`](file-upload.html) |

## Purpose and scope

Caterers upload two kinds of file on Sweet Hand: photos of their food
("Add photos" on Kendra's photo manager, "Replace photo" in the photo details
dialog) and an optional copy of their food handler certificate ("Upload a
copy", then a row for `food-handler-certificate.pdf` with Replace and Remove).
The native file input always does the work: it stays in the tab order,
visually hidden, and the visible part is the `<label for>` right after it,
styled as a [button](button.md) or as a round dashed drop tile. On a phone
the operating system's picker offers the camera and the photo library.
`sh-file-row` shows one attached file by name, type, size and date with its
actions, instead of the browser's "No file chosen".

Use something else for the tiles of uploaded photos with their progress,
"Processing" plate and Move up / Move down ([photo tile](photo-tile.md)), for
any action that does not pick a file ([button](button.md)), and never to
collect a business licence, ID or anything the platform would appear to
certify: the food handler details are the caterer's own statement, and the
copy is optional.

Out of scope:

- Checking files: type by content signature, size, dimensions, malware
  (L2-041) happen on the server; the consumer reports rejections in a
  `.form-summary` ("2 photos weren't added") and keeps good files.
- Sending files, progress bars, "Uploading 2 photos…" status, cancel, retry and
  the failed-upload [toast](toast.md): the photo manager and
  [photo tile](photo-tile.md).
- The field label "Copy of certificate (optional)", the help line and any
  field error: [form field](form-field.md). Help outside a field (the photo
  toolbar's "JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on
  the shorter side") is the page's paragraph, referenced by `describedBy`.
- Moving focus after "Remove": the consumer moves it to the trigger that
  replaces the row, using `focus()`.

## Usage

Inventory from `usage_inventory.py docs/mocks file-input "input"`,
`usage_inventory.py docs/mocks file-row "div"` and a search for
`upload-tile` (24 files). Rows that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/profile-photos/default`, `uploading`, `processing`, `invalid`; behind `dialogs/photo-details`, `dialogs/remove-photo`, `notifications/dashboard-toast/*` | trigger, primary, md, camera icon, `multiple`, photo `accept`, `describedBy="upload-help"` | "Add photos" | default, focus; stays enabled while uploading | canvas toolbar |
| `pages/profile-photos/empty` | trigger, primary, lg, camera icon, `multiple` | "Add photos" | default | empty state |
| `pages/profile-photos/full` | trigger as default, `disabled`; help changes to "You can have up to 30 photos. Remove one to add another." | "Add photos" | disabled | canvas |
| `dialogs/photo-details/default`, `busy`, `failed`, `invalid` | trigger, secondary, md, camera icon, single file, `describedBy="replace-help"` | "Replace photo"; help "The new photo keeps this one's place and caption" | default, disabled while saving | dialog (`--color-bg-surface-raised`) |
| `pages/profile-certificate/empty`, `invalid` | trigger, secondary, md, upload icon, certificate `accept`, in a form field | "Upload a copy"; help "PDF, JPEG or PNG, up to 10 MB" | default | canvas |
| `pages/profile-certificate/default`, `expiring` | file row in a form field (`labelledBy` the field label), Replace (trigger, sm) + Remove (ghost sm button) | "food-handler-certificate.pdf" / "PDF · 1.2 MB · uploaded Tue 2 Sep"; "certificate-2021.pdf" / "PDF · 0.8 MB · uploaded 14 Jan 2022" | default | canvas |
| `pages/profile-certificate/saving` | file row with actions disabled | "bev-certificate.jpg" / "JPEG · 2.4 MB" | disabled | canvas |
| Design system only | file row, failed | "scan-0412.tiff" / "This file isn't a PDF, JPEG or PNG, so nothing was saved" | failed | canvas |
| Design system only (photo grid, LG–XL) | upload tile, `multiple`, photo `accept` | camera icon + "Add photos"; while dragging "Drop to upload" | default, hover, focus, dragging, disabled | canvas |

## Anatomy

`sh-file-upload`:

1. **Input** — `input.file-input.visually-hidden[type=file]`: the real control,
   hidden visually but focusable and in the tab order. Never `display: none`
   or `hidden`. Carries `accept`, `multiple`, `disabled` and
   `aria-describedby`.
2. **Trigger** — the `<label for>` immediately after the input (the
   `.file-input + label` rules depend on adjacency). Either a button-styled
   label (`label.btn` with the [button](button.md) variant and size classes)
   or the drop tile (`label.upload-tile`). Its text is the input's accessible
   name.
3. **Icon (optional)** — leading `svg.icon`, `aria-hidden="true"`: camera for
   photos, upload arrow for the certificate; inside the tile, above the text.

`sh-file-row`:

4. **Row** — `div.file-row[role=group]`, labelled by the field label
   (`aria-labelledby`) or `ariaLabel`: hairline `--color-border-default` box,
   `--radius-md`, `--space-4` padding, flex that wraps.
5. **File icon** — outline document `svg.icon`, decorative.
6. **Name** — `span.file-row__name` > `<span>` file name exactly as uploaded,
   breaking anywhere (`overflow-wrap: anywhere`).
7. **Meta** — `span.file-row__meta`: "PDF · 1.2 MB · uploaded Tue 2 Sep" in
   `--text-body-sm` `--color-fg-muted`; the rejection reason in a failed row.
8. **Actions** — `span.cluster`: "Replace" (an `sh-file-upload`, button
   trigger, secondary, sm) and "Remove" (an `sh-button`, ghost, sm), each with
   the file name in a `.visually-hidden` span.

Hosts: both are layout-transparent (`display: contents`), so the input and
label are adjacent siblings of whatever container the consumer uses
(`span.cluster`, `.empty__actions`), and the row is a direct child of the
form field.

## API

### `sh-file-upload` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `accept` | `string` | — | yes | Rendered as `accept`. Photos: `image/jpeg,image/png,image/webp,image/heic`; certificate: `application/pdf,image/jpeg,image/png`. Filters the picker only; the server checks content (L2-041). |
| `multiple` | `boolean` | `false` | no | Rendered as `multiple` ("Add photos"). |
| `trigger` | `'button' \| 'tile'` | `'button'` | no | `button` renders `label.btn…`; `tile` renders `label.upload-tile` and enables drag and drop. |
| `variant` | `'primary' \| 'secondary'` | `'secondary'` | no | Button trigger only: adds `.btn--primary`; `secondary` adds no modifier. Ghost, link and danger are not file triggers. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | no | Button trigger only: `.btn--sm` / `.btn--lg`, as [button](button.md). |
| `disabled` | `boolean` | `false` | no | Native `disabled` on the input; `.file-input:disabled + .btn` (or `+ .upload-tile`, D-5) dims the trigger. Never `aria-disabled` on the label. |
| `inputId` | `string \| null` | `null` | no | The input's `id` and the label's `for`. Inside a [form field](form-field.md) the field context's `id` is used. Otherwise generated (`sh-file-upload-{n}`). |
| `describedBy` | `string \| null` | `null` | no | Appended to `aria-describedby` after the form field context's ids: the help with the types and limits ("upload-help"). |
| `name` | `string \| null` | `null` | no | Rendered as `name` when the input is part of a submitted form. |
| `dropLabel` | `string \| null` | `null` | no | Tile only: the text shown while files are dragged over it ("Drop to upload"). `null` keeps the default slot's text. |

### `sh-file-upload` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `filesSelected` | `File[]` (never empty) | The person picks one or more files in the system picker, or drops files on the tile. With `multiple` false only the first file is passed. Not emitted when the picker is cancelled, or while `disabled`. After emitting, the input's value is cleared so the same file can be picked again (D-3). |

### `sh-file-upload` methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the input; the ring shows on the label. Used after "Remove" and by error-summary links. |

### `sh-file-upload` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text, an optional leading `svg.icon`, an optional `span.visually-hidden` | The trigger label and the input's accessible name: "Add photos", "Upload a copy", "Replace photo", "Replace<span class="visually-hidden"> food-handler-certificate.pdf</span>". |

### `sh-file-row` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `fileName` | `string` | — | yes | The name exactly as uploaded; also appended, visually hidden, to the Replace and Remove labels. |
| `meta` | `string` | — | yes | Formatted by the consumer: "PDF · 1.2 MB · uploaded Tue 2 Sep". In a failed row, the reason. |
| `state` | `'default' \| 'failed'` | `'default'` | no | `failed` renders `data-state="failed"`: `--color-danger-border` edge and `--color-danger-fg` meta. A failed row shows Replace and Remove like any other. |
| `labelledBy` | `string \| null` | `null` | no | Rendered as `aria-labelledby` on the row (the form field's label id). One of `labelledBy` and `ariaLabel` is required. |
| `ariaLabel` | `string \| null` | `null` | no | Rendered as `aria-label` when no visible label exists ("Copy of certificate"). |
| `accept` | `string` | — | yes | Passed to the Replace trigger. |
| `replaceLabel` | `string` | — | yes | Visible text of the Replace trigger ("Replace"). |
| `removeLabel` | `string` | — | yes | Visible text of the Remove button ("Remove"). |
| `disabled` | `boolean` | `false` | no | Disables both actions while the form saves. |

### `sh-file-row` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `replaceSelected` | `File` | A replacement file is picked through Replace. |
| `removed` | `void` | Remove is activated. The consumer confirms if needed, removes the row and moves focus (D-6). |

- Boolean inputs accept the bare attribute; `null` / `false` render no
  attribute.
- Translation: trigger labels, `dropLabel`, `replaceLabel`, `removeLabel`,
  help and meta text arrive from the consumer's resource files (L2-064); file
  names are data.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Button trigger, primary | `label.btn.btn--primary` | The screen's one primary action: "Add photos" on the photo manager. |
| Button trigger, secondary | `label.btn` | Optional or secondary uploads: "Upload a copy", "Replace photo". |
| Button trigger, small (in a row) | `label.btn.btn--sm` | "Replace" inside a file row. |
| Upload tile | `label.upload-tile` | An extra way in beside the button, as the last cell of the photo grid from 62rem; never the only way. |
| File row | `div.file-row` | One attached file with Replace and Remove. |
| File row, failed | `div.file-row[data-state="failed"]` | A rejected single file with its reason. |

| Size | Trigger | Height | Where |
|---|---|---|---|
| sm | `.btn--sm` | `--control-height-sm` (36 px) from 48rem; `--target-comfortable` (44 px) below | Replace in a file row |
| md | — | `--control-height-md` (44 px) | Photo toolbar, certificate field, photo details |
| lg | `.btn--lg` | `--control-height-lg` (52 px) | Photos empty state |
| Tile | `.upload-tile` | `min(100%, 10rem)` square | Photo grid |

Button triggers keep their natural width; they never become full width,
because the photo grid already fills the screen.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Button or tile at rest | "Add photos, button" is not announced: the input announces as a file upload control named "Add photos" |
| Hover | `:hover` on the label | Button: as [button](button.md). Tile: border and text `--color-fg-default` | — |
| Focus | `.file-input:focus-visible + label` | Ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) on the visible label | Focus is on the input; name and description announced |
| Disabled | `disabled` on the input | Button at 50 % opacity; tile `--color-fg-disabled` text, `--color-border-default` edge; `cursor: not-allowed` | Skipped by Tab; the reason is in the help ("You can have up to 30 photos. Remove one to add another.") |
| Dragging (tile) | files dragged over the tile → `data-state="dragging"` | Solid `--color-accent` border, `--color-accent-subtle` fill, `--color-fg-accent` text; label text swaps to `dropLabel` | — (drag is a pointer enhancement) |
| Picker open | after activation | No change | The system picker has focus; Esc returns focus to the input |
| File row | `sh-file-row` | Name, meta and actions | Group named "Copy of certificate"; "Replace food-handler-certificate.pdf", "Remove food-handler-certificate.pdf" |
| File row, actions disabled | `disabled` | Replace and Remove at 50 % | Both skipped by Tab |
| File row, failed | `state="failed"` | `--color-danger-border` edge, reason in `--color-danger-fg` | The reason is read with the row |

There is no busy state on the trigger: "Add photos" stays enabled while
uploads run so more can be added; progress belongs to the
[photo tile](photo-tile.md). `data-state="hover|focus|disabled"` is
documentation only; `data-state="dragging"` is set by the component.

## Markup

```html
<!-- rendered: primary trigger, multiple photos -->
<input class="file-input visually-hidden" id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple aria-describedby="upload-help"><label class="btn btn--primary" for="photo-upload"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…camera…</svg>Add photos</label>
<p class="field__help" id="upload-help">JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on the shorter side</p>
<!-- the help paragraph is the page's, not the component's -->
```

Large adds `.btn--lg`; secondary drops `.btn--primary`; the certificate
trigger uses the upload icon and `accept="application/pdf,image/jpeg,image/png"`.

```html
<!-- rendered: disabled at the 30-photo limit -->
<input class="file-input visually-hidden" id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple aria-describedby="upload-help" disabled><label class="btn btn--primary" for="photo-upload"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Add photos</label>
<!-- no aria-disabled on the label (D-4) -->
```

```html
<!-- rendered: upload tile, at rest and while dragging -->
<input class="file-input visually-hidden" id="tile-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple><label class="upload-tile" for="tile-upload"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Add photos</label>
<label class="upload-tile" for="tile-upload" data-state="dragging"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Drop to upload</label>
```

```html
<!-- rendered: file row in the certificate field -->
<div class="file-row" role="group" aria-labelledby="file-label">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…document…</svg>
  <span class="file-row__name"><span>food-handler-certificate.pdf</span><span class="file-row__meta">PDF · 1.2 MB · uploaded Tue 2 Sep</span></span>
  <span class="cluster"><input class="file-input visually-hidden" id="cert-file" type="file" accept="application/pdf,image/jpeg,image/png"><label class="btn btn--sm" for="cert-file">Replace<span class="visually-hidden"> food-handler-certificate.pdf</span></label><button class="btn btn--sm btn--ghost" type="button">Remove<span class="visually-hidden"> food-handler-certificate.pdf</span></button></span>
</div>
```

```html
<!-- rendered: failed row -->
<div class="file-row" role="group" aria-label="Copy of certificate" data-state="failed">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <span class="file-row__name"><span>scan-0412.tiff</span><span class="file-row__meta">This file isn't a PDF, JPEG or PNG, so nothing was saved</span></span>
  <span class="cluster">…Replace, Remove…</span>
</div>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: photo manager toolbar -->
<span class="cluster">
  <sh-file-upload variant="primary" multiple [accept]="photoTypes" describedBy="upload-help" [disabled]="photos().length >= 30" (filesSelected)="upload($event)">
    <svg class="icon" …></svg>{{ t('photos.add') }}
  </sh-file-upload>
</span>
<p class="field__help" id="upload-help">{{ atLimit() ? t('photos.full') : t('photos.limits') }}</p>

<!-- consumer: certificate field -->
<sh-form-field [label]="t('cert.copy')" [optionalMarker]="t('common.optional')" [help]="t('cert.limits')">
  @if (file(); as f) {
    <sh-file-row [fileName]="f.name" [meta]="f.meta" [labelledBy]="fieldLabelId" [accept]="certTypes" [replaceLabel]="t('common.replace')" [removeLabel]="t('common.remove')" [disabled]="saving()" (replaceSelected)="replace($event)" (removed)="remove()" />
  } @else {
    <sh-file-upload [accept]="certTypes" (filesSelected)="attach($event[0])"><svg class="icon" …></svg>{{ t('cert.upload') }}</sh-file-upload>
  }
</sh-form-field>
```

The e2e page objects locate the control by its accessible name ("Add photos")
and by `.file-input`, `.upload-tile`, `.file-row`, `.file-row__name` and
`.file-row__meta`; those classes, the input-before-label order, `accept`,
`multiple` and `disabled` are the contract. Generated ids are free to change.

## Design

- Button trigger: the [button](button.md) classes, heights, padding, radius
  and icon gap unchanged; this component adds only the hidden input.
- Tile: `aspect-ratio: 1`, `width: min(100%, 10rem)`, `--border-width-thick`
  dashed `--color-border-strong`, `--radius-full`, `--space-4` padding,
  `--space-2` between icon and text, `--text-label`, text centred.
- File row: flex, wraps, `align-items: center`, gaps `--space-2` (row) and
  `--space-4` (column), `--space-4` padding, `--border-width-hairline`
  `--color-border-default` edge, `--radius-md`. The name column flexes
  (`flex: 1 1 12rem; min-width: 0`, D-9); meta `--text-body-sm`. Actions in `.cluster`
  (`--space-3` gap).
- Elevation and layer: none; the row is a list-item edge, not a card shadow.
- Motion: tile border and text colours over `--duration-fast` with
  `--ease-standard`.

No component tokens; the trigger inherits the button's (`--btn-bg`…), the
tile and row read semantic tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Primary trigger fill / label | `--color-action` / `--color-fg-on-action` | `--palette-stone-950` / `--palette-white` | `--palette-stone-100` / `--palette-stone-950` |
| Tile edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Tile text | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Tile hover edge and text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Dragging edge | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Dragging fill | `--color-accent-subtle` | `--palette-pepper-50` | `--palette-pepper-950` |
| Dragging text | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Disabled tile text / edge | `--color-fg-disabled` / `--color-border-default` | `--palette-stone-300` / `--palette-stone-200` | `--palette-stone-700` / `--palette-stone-750` |
| File row edge | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| File name / meta | `--color-fg-default` / `--color-fg-muted` | `--palette-stone-950` / `--palette-stone-700` | `--palette-stone-100` / `--palette-stone-350` |
| Failed edge / meta | `--color-danger-border` / `--color-danger-fg` | `--palette-sorrel-300` / `--palette-sorrel-600` | `--palette-sorrel-700` / `--palette-sorrel-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Primary trigger label |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Tile edge |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Tile text |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Dragging text |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Dragging edge |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | File meta |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Failed meta |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring on the label |

The file row's `--color-border-default` edge is decorative (the row is
identified by its content and group name), so it has no 3:1 minimum; the
failed state is stated in text, not only by the edge colour. Disabled
triggers are exempt (WCAG 1.4.3). Forced colours: `.btn` triggers keep their
`CanvasText` border; the tile's dashed edge uses `CanvasText`, and dragging
uses `Highlight`.

## Responsive behaviour

- Phones: the picker is the operating system's (camera, photo library,
  files). The component never renders `capture`, which would force the
  camera and hide the library (L2-045).
- The file row wraps: when the name and actions do not fit (about 24rem),
  the actions drop under the name, left-aligned, `--space-2` below. Names
  break anywhere rather than overflow.
- Below 48rem the small Replace and Remove grow to 44 px (L2-065) with
  `--space-3` between them; from 48rem they are 36 px.
- The upload tile is used only from 62rem (where dragging from a desktop is
  realistic), as the last cell of the photo grid; below it the button
  trigger is the way in. The consumer decides; the component renders either.
- At 320 px nothing scrolls horizontally; at 200 % zoom the trigger and row
  stay usable.

## Accessibility

### Role and pattern

The native file input is the control; there is no APG pattern. Its name is
its label ("Add photos", "Replace food-handler-certificate.pdf") and its
description the types and limits. Drag and drop is an enhancement: the tile
is also a label that opens the picker (WCAG 2.5.7). The file row is
`role="group"` named by the field label.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Focuses the hidden input; the ring shows on its label. In a row: Replace, then Remove. Disabled inputs are skipped. |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Opens the system file picker. |
| <kbd>Esc</kbd> | Closes the picker (system); focus returns to the input. |

### Focus

- The ring is drawn on the visible label through `.file-input:focus-visible +
  label`; the input is never `display: none`.
- After files are chosen, focus stays on the input.
- After "Remove", the consumer moves focus to the trigger that replaces the
  row ("Upload a copy") with `focus()` (D-6).

### Labelling

- Repeated actions name their file: "Replace food-handler-certificate.pdf",
  "Remove food-handler-certificate.pdf" (the file name visually hidden).
- `aria-describedby` on the input: the form field context's ids, then
  `describedBy` (the limits).
- The icon is `aria-hidden="true"`.

### Announcements

None from the component. Upload progress ("Uploading 2 photos…", then
"Saved") is the page's polite status; rejections are the page's
`role="alert"` summary.

### Motion

The tile's colour changes use `--duration-fast`, zeroed by
`prefers-reduced-motion: reduce`. Nothing moves.

## Content and internationalisation

- Triggers are verb phrases: "Add photos", "Upload a copy", "Replace photo",
  "Replace". Never "Browse…" or "Choose file".
- Limits are stated before the choice, with middle dots: "JPEG, PNG, WebP or
  HEIC · under 15 MB · at least 800 pixels on the shorter side"; "PDF, JPEG or
  PNG, up to 10 MB".
- Rejections use L2-041's words and say what happened to the file: "Photos
  must be under 15 MB and at least 800 pixels on the shorter side", "This file
  isn't a PDF, JPEG or PNG, so nothing was saved".
- File names exactly as uploaded; sizes in MB with one decimal ("1.2 MB");
  dates "uploaded Tue 2 Sep" (add the year when it is not 2026: "uploaded
  14 Jan 2022").
- At the limit: "You can have up to 30 photos. Remove one to add another."
- Translatable: trigger labels, `dropLabel`, `replaceLabel`, `removeLabel`,
  meta templates. Data: file names, sizes, dates. French labels run about
  30 % longer; the row wraps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the class list, the
  `aria-describedby` list, the hidden file-name suffix) are computed once per
  input change, not in the template.
- Reads no file contents: it passes `File` objects to the consumer and never
  creates object URLs or previews (the photo tile does).
- Drag listeners (`dragenter`, `dragover`, `dragleave`, `drop`) exist only on
  the tile; the button trigger has one `change` listener.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FileUpload.ts`
  renders Kendra's certificate field with the
  `food-handler-certificate.pdf` row and the photo toolbar's "Add photos",
  toggling `disabled` and swapping the row for "Upload a copy"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `ProfilePhotos`, `ProfileCertificate`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the tile is a fixed square; the dragging label swap keeps
  the tile's size; the row's height changes only when the file changes.
- Weight: no dependencies beyond the framework and [button](button.md).

## Acceptance criteria

### Rendering

- **AC-1** Given Kendra's photo manager with 6 photos, when "Add photos" renders, then the DOM is `input.file-input.visually-hidden[type=file]` with `accept="image/jpeg,image/png,image/webp,image/heic"`, `multiple` and `aria-describedby` pointing at "JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on the shorter side", immediately followed by `label.btn.btn--primary[for]` with a camera icon and the text "Add photos". (L2-041)
- **AC-2** Given the photo manager with no photos, when the empty state renders, then "Add photos" is a large trigger (`.btn--lg`) 52 CSS px high. (L2-042)
- **AC-3** Given Auntie Bev's Kitchen has no certificate copy, when the certificate field renders, then "Upload a copy" is a secondary trigger with an upload icon and `accept="application/pdf,image/jpeg,image/png"`, described by "PDF, JPEG or PNG, up to 10 MB". (L2-040)
- **AC-4** Given Pelau House's uploaded certificate, when the file row renders, then it is a `div.file-row` group named "Copy of certificate", showing "food-handler-certificate.pdf" and "PDF · 1.2 MB · uploaded Tue 2 Sep", with actions named "Replace food-handler-certificate.pdf" and "Remove food-handler-certificate.pdf". (L2-040)
- **AC-5** Given a failed row for "scan-0412.tiff", when it renders, then the row has `data-state="failed"`, a `--color-danger-border` edge and the meta "This file isn't a PDF, JPEG or PNG, so nothing was saved" in `--color-danger-fg`. (L2-068)

### Selecting files

- **AC-6** Given focus on the "Add photos" input, when Kendra picks `IMG_2076.heic` and `IMG_2077.heic` in the picker, then `filesSelected` emits both files once and the input's value is cleared; when she cancels the picker, then nothing is emitted. (L2-041)
- **AC-7** Given "Replace photo" in the photo details dialog (single file), when a file is dropped or picked, then `filesSelected` emits exactly one file. (L2-042)
- **AC-8** Given an XS viewport on a phone, when Kendra activates "Add photos", then the operating system offers the camera and the photo library, because the input has no `capture` attribute. (L2-045)
- **AC-9** Given the certificate row, when Kendra picks a new file through Replace, then `replaceSelected` emits it; when she activates Remove, then `removed` emits and the consumer's "Upload a copy" trigger receives focus through `focus()`. (L2-067)

### States

- **AC-10** Given Maracas Bay has 30 photos, when the photo manager renders, then the "Add photos" input has native `disabled`, the label has no `aria-disabled`, is drawn at 50 % opacity, Tab skips it, and its description reads "You can have up to 30 photos. Remove one to add another." (L2-042)
- **AC-11** Given the certificate form is saving, when the row's `disabled` is true, then the Replace input and the Remove button are both natively disabled and skipped by Tab. (L2-040)
- **AC-12** Given the upload tile at 1280 px, when files are dragged over it, then it gets `data-state="dragging"`, a solid `--color-accent` border, `--color-accent-subtle` fill and the text "Drop to upload", keeps its size, and returns to rest when the drag leaves; when the files are dropped, then `filesSelected` emits them. (L2-041)
- **AC-13** Given the upload tile, when it is focused with Tab and Enter is pressed, then the system picker opens, so the tile works without dragging. (L2-067)

### Keyboard and focus

- **AC-14** Given Tab reaches "Add photos", when the hidden input receives focus, then the focus ring is drawn on the visible label with at least 3:1 against the page in both themes; when Space is pressed, then the picker opens. (L2-067)

### Screen readers and automated checks

- **AC-15** Given "Add photos" and the certificate row, when a screen reader reaches them, then the input is announced with the name "Add photos" and its limits, and the row as the group "Copy of certificate". (L2-068)
- **AC-16** Given the photo manager (default, full) and the certificate field (empty, uploaded, saving), when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)

### Theming

- **AC-17** Given the dark theme, when the primary "Add photos" trigger renders, then its label has at least 4.5:1 against `--color-action`; and the file row's meta has at least 4.5:1 against the surface. (L2-069)
- **AC-18** Given the upload tile in each theme, when it renders at rest and while dragging, then the dashed edge has at least 3:1 and the text at least 4.5:1 against what is behind it, and "Drop to upload" has at least 4.5:1 against `--color-accent-subtle`. (L2-069)

### Responsive

- **AC-19** Given a 360 px viewport, when the certificate row renders, then Replace and Remove are each at least 44 CSS px high, at least 8 px apart, and drop under the file name when they do not fit beside it. (L2-065)
- **AC-20** Given a 320 px viewport, when a row for "IMG_20260914_183022_HDR-portrait-mode.heic" renders, then the name breaks inside the row with no clipping and no horizontal scrolling. (L2-064)
- **AC-21** Given a 1280 px window at 200 % zoom, when the photo toolbar and the certificate row render, then both are usable with no horizontal scrolling. (L2-069)

### Motion

- **AC-22** Given `prefers-reduced-motion: reduce`, when the upload tile is hovered or dragged over, then the colours change with no visible transition. (L2-069)

### Performance

- **AC-23** Given the `FileUpload` perf-test scenario, when the row is swapped for "Upload a copy" and back, then each change is painted within 200 ms (Interaction to Next Paint) with no layout shift outside the field, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/file-upload/`; files
  `file-upload.component.*` (selector `sh-file-upload`, class
  `FileUploadComponent`) and `file-row.component.*` (selector `sh-file-row`,
  class `FileRowComponent`).
- Composes [button](button.md): the trigger label takes the button's class
  helper (variant and size → `.btn…`) without rendering `sh-button` (button
  D-12); Remove is an `sh-button` (ghost, sm). Reads the [form
  field](form-field.md) context. Composed by the photo manager, the photo
  details [dialog](dialog.md) and the certificate page.
- Styles: `.file-input`, `.upload-tile` and `.file-row` from
  `docs/design-system/assets/components.css` move into the component.
- Design-system catch-up for D-5: `.upload-tile:disabled` can never match a
  `<label>`; add `.file-input:disabled + .upload-tile` with the same
  declarations. The rendering applies it with a specimen-only style.
- Design-system catch-up for D-9: change `.file-row__name` to
  `flex: 1 1 12rem; min-width: 0;` so the actions wrap under the name. The
  rendering applies it with a specimen-only style.
- Mock catch-up: `pages/profile-photos/full` puts `aria-disabled="true"` on
  the label (D-4); the certificate field's help has no id and is not tied to
  the input (the form field CRD wires it).
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Does the component validate files?* No. It passes every picked or dropped file to the consumer; `accept` only filters the picker. L2-041 checks content on the server, and the consumer's summary reports each rejected file by name while keeping good ones, which a per-control check could not do across a batch.
- **D-3** *Is the input's value cleared after each pick?* Yes. Otherwise picking the same file again (a retry after "IMG_2077.heic didn't upload") fires no `change` event.
- **D-4** *How is the trigger disabled?* Only with native `disabled` on the input; the label gets its dimmed look from `.file-input:disabled + .btn`. The design system removed the full mock's `aria-disabled` on the label, which has no disabled state.
- **D-5** *How does a disabled tile look?* Like the design system's disabled tile specimen, through `.file-input:disabled + .upload-tile`, because the kit's `.upload-tile:disabled` rule targets a state a label never has.
- **D-6** *Who moves focus after Remove?* The consumer, with `focus()` on the trigger that replaces the row, because the row is destroyed with its buttons and only the page knows what replaces it.
- **D-7** *What does the tile do with several dropped files when `multiple` is false?* It passes the first file only, the same as the picker allows one.
- **D-8** *Is the tile used anywhere now?* No mock uses it; the design system documents it as an extra way in from 62rem. It is specified now so the photo grid can adopt it without an API change; the button trigger remains on every screen.
- **D-9** *How does the file row wrap on a phone?* The name column gets a 12rem flex basis, so when the name and the actions do not both fit, the actions drop under the name as the design system describes. With the current `flex: 1; min-width: 0` the row never wraps: at 360 px the name is squeezed to a few characters a line beside Replace and Remove.
