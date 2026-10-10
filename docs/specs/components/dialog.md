# Dialog

| Field | Value |
|---|---|
| Selector | `sh-dialog` (the modal: backdrop, panel, header, body, footer), `sh-dialog-photo` (one large round photo in the body), `sh-dialog-people` (the round photos of the caterers a decision affects) |
| Library path | `frontend/projects/components/src/lib/dialog/` |
| Status | planned |
| Traces to | L2-022, L2-025, L2-026, L2-042, L2-054, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-085 |
| Design system | [`dialog.html`](../../design-system/components/dialog.html) |
| Source mocks | [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/enquiry/busy`](../../mocks/dialogs/enquiry/busy.html), [`dialogs/enquiry/success`](../../mocks/dialogs/enquiry/success.html), [`dialogs/suspend-caterer/default`](../../mocks/dialogs/suspend-caterer/default.html), [`dialogs/suspend-caterer/invalid`](../../mocks/dialogs/suspend-caterer/invalid.html), [`dialogs/suspend-caterer/busy`](../../mocks/dialogs/suspend-caterer/busy.html), [`dialogs/suspend-caterer/failed`](../../mocks/dialogs/suspend-caterer/failed.html), [`dialogs/approve-profile/default`](../../mocks/dialogs/approve-profile/default.html), [`dialogs/remove-photo/default`](../../mocks/dialogs/remove-photo/default.html), [`dialogs/remove-photo/blocked`](../../mocks/dialogs/remove-photo/blocked.html), [`dialogs/retire-cuisine/default`](../../mocks/dialogs/retire-cuisine/default.html), [`dialogs/add-cuisine/invalid`](../../mocks/dialogs/add-cuisine/invalid.html), [`dialogs/download-data/success`](../../mocks/dialogs/download-data/success.html), [`dialogs/review-response/edit`](../../mocks/dialogs/review-response/edit.html), [`dialogs/report/success`](../../mocks/dialogs/report/success.html), [`dialogs/delete-account/default`](../../mocks/dialogs/delete-account/default.html) |
| Rendering | [`dialog.html`](dialog.html) |

## Purpose and scope

A dialog stops the page for one decision or one short form: send an enquiry
to Pelau House, suspend a caterer, remove a photo, add a cuisine. The page
behind becomes inert under a dimming backdrop, focus moves into the panel and
stays there, and when the dialog closes focus goes back where it came from.
On phones every dialog rises from the bottom as a sheet; the enquiry form fills
the screen. It has four uses: a default confirmation ("Approve Auntie Bev's
Kitchen?"), a destructive confirmation ("Suspend Pelau House?"), a form
("Send an enquiry", "Add cuisine") and a success panel ("Export requested").

Use something else when the panel is a long list of choices or links — the
phone filters and the site menu are a [sheet](sheet.md); when the choice is
small and should not block the page — the cuisine filter on tablets and the
account menu are a [popover](popover.md); when nothing needs deciding, only
confirming that something happened ("Photo removed. Undo") — that is a
[toast](toast.md); when the task has steps or more than about six fields
(caterer registration, profile setup) — that is a page with a
[form layout](form-layout.md). The full-screen photo viewer is
[gallery](gallery.md) (`.viewer`), not a dialog.

Out of scope:

- The buttons, fields, checklists and alerts inside the panel: [button](button.md),
  [icon button](icon-button.md) (Close), [text field](text-field.md),
  [textarea](textarea.md), [checklist](checklist.md), [alert](alert.md),
  [photo](photo.md), [empty state](empty-state.md). The dialog places them; their
  CRDs define them.
- The error summary (`.form-summary`) and field errors: [form
  layout](form-layout.md) and [form field](form-field.md). The dialog only keeps
  itself open and lets the consumer move focus to the summary.
- What submitting does, validation rules, and the copy of each dialog: the
  consumer (the page or feature that opens it).
- Toasts shown after a dialog closes ("Pelau House suspended"): [toast](toast.md).
- Opening a dialog from a URL or the browser Back button closing it: routing,
  owned by the page.

## Usage

Inventory from `usage_inventory.py docs/mocks dialog "div|form"` (151 uses
across 35 dialog mocks) and a read of each mock's header, body and footer. Rows
that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/enquiry` (all 11 states) | `size="form"`, `fullScreenOnPhone`, `form`, `photo` (caterer cover), `descriptionRole="recipient"` | "Send an enquiry" / "to Pelau House"; fields; footer "Send enquiry" | default, invalid, busy, failed, duplicate, limit, restored, unverified, warning, wrong-account, success in place ("Enquiry sent to Pelau House", footer "Back to Pelau House" + "Go to your inbox") | over the caterer page |
| Form dialogs: `change-password`, `delete-account`, `dish`, `download-data`, `edit-details`, `end-session`, `record-breach`, `review-response` | `size="form"`, `form`; `delete-account` adds `tone="danger"` | title, description, fields; Cancel + primary or danger submit; `review-response/edit` adds "Delete response" in `footer-start` | default, invalid, busy, failed; `download-data` success ("Export requested", `tone="success"`, one "Done", opened as its own dialog, D-8); `delete-account` confirm (typed password) | over account, dashboard and admin pages |
| `operator-edit`, `approve-profile`, `request-changes`, `resolve-report`, `open-enquiry` | default or `form` size, `photo` (caterer), `descriptionRole="consequence"` | "Edit Pelau House", "Approve Auntie Bev's Kitchen?", "Request changes to Auntie Bev's Kitchen"; checklist, reason field, info alert | default, invalid, busy, failed, take-action | over admin pages |
| Destructive confirmations with a reason: `suspend-caterer`, `remove-caterer`, `deactivate-operator`, `moderate-review` (remove), `decline-enquiry`, `reinstate-caterer` (success tone) | default size, `form`, `tone="danger"` (`success` for reinstate) | checklist of consequences, reason textarea, `alert--info`; Cancel + danger | default, invalid, busy, failed, confirm (typed name), conflict (`alert--warning`) | over admin and inbox pages |
| `retire-cuisine` | default size, `tone="danger"`, `initialFocus="cancel"` | warning alert + `sh-dialog-people` "Caterers using Pan-Caribbean" (Mauby & Co., Sea Moss & Spice) | default, busy, failed | over `admin-cuisines` |
| Small confirmations: `remove-photo`, `remove-dish`, `close-enquiry`, `delete-review`, `share-contact`, `withdraw-submission`, `add-cuisine` | `size="sm"`; `tone="danger"` or `"info"`; `remove-photo` uses `sh-dialog-photo`; `add-cuisine` is a `form` | "Remove this photo?", "Delete your review?", "Share your contact details?", "Withdraw your submission?" ("Keep it in review" as the cancel label) | default, busy, failed, invalid; `remove-photo/blocked` and `remove-dish/blocked` with `tone="warning"`, no body, one "Got it" | over dashboard, thread and review pages |
| `report` | default size, `form`, `tone="info"` | "Report this listing" / "Pelau House"; reason radios | default, invalid, busy, failed, duplicate, limit, success in place ("Thanks — our team will look into this", "Done") | over the caterer page |
| `review`, `moderate-review`, `revert-change`, `submit-profile`, `search` | default size, `form`; tones info, success, warning | "Write a review", "Keep Priya R.'s review hidden?", "Revert Pelau House's description?", "Where's your event?" (no description) | default, invalid, busy, failed, held, success, no-match, out-of-area, suggestions | over caterer, admin and listing pages |

Every dialog in the mocks has a Close icon button named "Close" and, except
the success and blocked panels, a Cancel button first in the footer.

Not built by this component: `dialogs/filters`, `dialogs/site-menu` (`.sheet`,
[sheet](sheet.md)); `dialogs/filter-menu`, `dialogs/account-menu` (popover);
`dialogs/photo-viewer` (`.viewer`, [gallery](gallery.md)).

## Anatomy

1. **Backdrop** — `.backdrop`, a sibling before `.dialog`. Fixed over the
   viewport at `--z-overlay`, `--color-bg-backdrop`, fades in. Clicking it does
   nothing.
2. **Dialog** — `.dialog` (`.dialog--full` for the enquiry form): fixed,
   full-viewport grid at `--z-modal`, `role="dialog"`, `aria-modal="true"`,
   `aria-labelledby` → title, `aria-describedby` → description (absent when there
   is none). Bottom-aligned below 36rem, centred above.
3. **Panel** — `.dialog__panel` with an optional `--sm`, `--form` or `--lg`
   modifier. A `<form novalidate>` when the dialog is a form, otherwise a
   `<div>`. Carries `aria-busy="true"` while busy.
4. **Header** — `.dialog__header`: optional tone icon or caterer photo, the
   heading block, and Close.
   - **Tone icon (optional)** — `.dialog__icon.dialog__icon--{tone}`,
     `aria-hidden="true"`, a 40 px tinted circle holding the projected
     `svg.icon`.
   - **Caterer photo (optional)** — `.dialog__caterer` wraps a 3.5rem
     [photo](photo.md) (`<span class="photo"><img alt=""></span>`) and the heading
     block.
   - **Heading block** — `.dialog__heading`: `h2.dialog__title` and, when given,
     the description: `p.dialog__desc` (a consequence sentence) or
     `p.dialog__caterer-name` ("to Pelau House").
   - **Close** — an [icon button](icon-button.md) `.icon-btn`, `aria-label` from
     `closeLabel`, 44 × 44 px.
5. **Body** — `.dialog__body.stack`: the default slot. Hidden when empty.
   Scrolls with the panel when tall.
6. **Busy status** — `p.visually-hidden[role="status"]` at the end of the body,
   always in the DOM while open, holding `busyMessage` only while busy.
7. **Footer** — `.dialog__footer`: sticky to the panel bottom, right-aligned,
   wraps. In order: the `footer-start` slot (buttons carry `.push-start`), the
   Cancel [button](button.md) when `cancelLabel` is set, then the `footer` slot
   (the primary last).

Sub-components (body content):

- `sh-dialog-photo` renders `.dialog__photo` with one large round
  [photo](photo.md) (`min(60%, 10rem)` wide, `alt=""` because the title or a
  caption names it).
- `sh-dialog-people` renders `ul.dialog-people[aria-label]`, one `li` per
  caterer: a `--space-20` round photo with `alt=""` above the name in
  `--text-label`.

Host: `sh-dialog` renders nothing in place. While `open`, it attaches the
backdrop and `.dialog` to the overlay container at the end of `<body>` (the
framework's accessible overlay primitive), outside the page's DOM, and makes
every other child of `<body>` `inert`. `sh-dialog-photo` and `sh-dialog-people`
hosts are `display: contents`; their classes go on the inner elements.

## API

### `sh-dialog` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `open` | `boolean` | `false` | no | Controlled by the consumer. `true` attaches and shows the dialog; `false` removes it and returns focus. |
| `title` | `string` | — | yes | Rendered in `h2.dialog__title`; the dialog's accessible name. Kept unchanged when the panel swaps to success (D-8). |
| `description` | `string \| null` | `null` | no | Rendered as the description and referenced by `aria-describedby`; `null` renders neither ("Where's your event?"). |
| `descriptionRole` | `'consequence' \| 'recipient'` | `'consequence'` | no | `consequence` → `p.dialog__desc` (muted). `recipient` → `p.dialog__caterer-name` ("to Pelau House"); only with `photo`. |
| `size` | `'sm' \| 'md' \| 'form' \| 'lg'` | `'md'` | no | Adds `.dialog__panel--sm` (24rem), none (`--layout-dialog-width`, 32rem), `--form` (40rem) or `--lg` (48rem). |
| `tone` | `'info' \| 'warning' \| 'danger' \| 'success' \| null` | `null` | no | Renders `.dialog__icon.dialog__icon--{tone}` around the `icon` slot. Ignored when `photo` is set. |
| `photo` | `string \| null` | `null` | no | URL of the caterer's cover photo; renders `.dialog__caterer` with a 56 × 56 `img alt=""`. |
| `form` | `boolean` | `false` | no | Renders the panel as `<form class="dialog__panel" novalidate>`, so a `type="submit"` footer button and Enter in a field submit it. |
| `fullScreenOnPhone` | `boolean` | `false` | no | Adds `.dialog--full`: below 48rem the panel fills the screen (`100dvh`, no radius). Used by the enquiry form only. |
| `busy` | `boolean` | `false` | no | `aria-busy="true"` on the panel; Close and Cancel get native `disabled`; Escape is ignored; `busyMessage` goes into the status line. Fields and the primary are the consumer's (D-4). |
| `busyMessage` | `string \| null` | `null` | yes when `busy` | The status line's text while busy: "Suspending Pelau House", "Sending your enquiry to Pelau House". |
| `closeLabel` | `string` | — | yes | The Close icon button's accessible name: "Close". |
| `cancelLabel` | `string \| null` | `null` | no | Renders a secondary Cancel button first in the footer with this label ("Cancel", "Keep it in review"). `null` renders none (success and blocked panels). |
| `initialFocus` | `'auto' \| 'cancel'` | `'auto'` | no | `cancel` focuses the Cancel button on open (destructive dialogs without fields). `auto` focuses the first element with `autofocus` in the slots, else the title (D-5). |
| `returnFocus` | `HTMLElement \| null` | `null` | no | Where focus goes on close. `null` means the element that had focus when the dialog opened; set it when that element will be gone ("Remove photo" for a removed photo, D-6). |

### `sh-dialog` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `dismissed` | `'escape' \| 'close' \| 'cancel'` | The person presses Escape, activates Close or activates Cancel, and the dialog is not busy. The consumer then sets `open` to `false`. Never emitted while busy, and never for a backdrop click. |
| `submitted` | `SubmitEvent` | The panel `<form>` is submitted (only with `form`) and the dialog is not busy. The native submission is prevented; the dialog stays open. |
| `closed` | `void` | After the dialog has been removed and focus has been returned. |

### `sh-dialog` content slots

| Slot | Accepts | Rule |
|---|---|---|
| `icon` | One `svg.icon` | Inside the tone circle; given `aria-hidden="true"` by the component. Used only with `tone`. |
| default | Body content: fields, [alert](alert.md), [checklist](checklist.md), `.form-summary`, [empty state](empty-state.md) compact, `sh-dialog-photo`, `sh-dialog-people` | Becomes `.dialog__body.stack`. An element in it with `autofocus` receives initial focus. |
| `footer-start` | One [button](button.md) with the `push-start` class | Placed before Cancel and pushed to the start ("Delete response"). |
| `footer` | One or two buttons; the primary last | The primary is `type="submit"` in a form dialog. A success panel puts "Done" or the next step here. |

Each slot is declared once; swapping the panel to success replaces the slot
content, never the dialog.

### `sh-dialog-photo` and `sh-dialog-people` inputs

| Selector | Input | Type | Default | Required | Rule |
|---|---|---|---|---|---|
| `sh-dialog-photo` | `src` | `string` | — | yes | Rendered as `<img alt="" width="160" height="160">` in `.photo`. |
| `sh-dialog-people` | `label` | `string` | — | yes | The list's `aria-label`: "Caterers using Pan-Caribbean". |
| `sh-dialog-people` | `people` | `{ name: string; photo: string }[]` | — | yes | One `li` each, in order; photo `alt=""`, 80 × 80. |

- Translation: `title`, `description`, `busyMessage`, `closeLabel`,
  `cancelLabel`, `label` and every slot's text come from the consumer's
  resource files (L2-064). The component contains no user-facing strings.

## Variants and sizes

| Variant | How | Use for |
|---|---|---|
| Default | no `tone`; ink primary in `footer` | Easy-to-undo confirmations: "Approve Auntie Bev's Kitchen?", "Share your contact details?". |
| Destructive | `tone="danger"` (small ones may omit it); [button](button.md) `variant="danger"` in `footer`; `initialFocus="cancel"` when there are no fields | Removes, suspends or deletes: "Suspend Pelau House?", "Retire Pan-Caribbean?", "Remove this photo?". |
| Form | `form`; usually `size="form"` | Collects input: "Send an enquiry", "Add a dish", "Report this listing". |
| Success | `tone="success"` (or a compact [empty state](empty-state.md) with `role="status"` in the body), no `cancelLabel`, one button | Confirms a task with something to read: "Export requested", "Enquiry sent to Pelau House". |
| Blocked | `tone="warning"`, no body, no `cancelLabel`, one "Got it" | "Keep at least 3 photos", "Keep at least 3 dishes". |

| Size | Modifier | Max width | Use for |
|---|---|---|---|
| sm | `.dialog__panel--sm` | 24rem | One-line confirmations: remove photo, remove dish, delete review, close enquiry, add cuisine. |
| md | — | `--layout-dialog-width` (32rem) | Confirmations with a reason or checklist: suspend, approve, retire cuisine, report. |
| form | `.dialog__panel--form` | 40rem (640 px) | Forms: enquiry, dish, review response, change password, delete account. |
| lg | `.dialog__panel--lg` | 48rem | Side-by-side comparison; no mock uses it yet, kept so the API does not change when one does. |

Size is width only. Height follows the content up to the viewport less
`--space-12` (48 px), then the panel scrolls and the footer stays pinned.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | `open` false | Nothing rendered | — |
| Open (default) | `open` true | Backdrop fades in; panel slides up (XS) or scales in (SM+) | Dialog announced with its name and description; page behind is `inert` |
| Invalid | consumer renders `.form-summary` at the top of the body after `submitted` | Summary and field errors in the body; dialog stays open, values kept | Consumer focuses the summary (`role="alert"`); focus stays trapped in the panel |
| Busy | `busy` | Panel `aria-busy="true"`; Close and Cancel disabled; the consumer's primary shows its spinner and keeps its label; fields read-only | Status line announces `busyMessage` once; Escape ignored |
| Failed | consumer renders an [alert](alert.md) `.alert--danger` with `role="alert"` first in the body; `busy` back to false | Alert at the top; buttons enabled for a retry; input kept | Alert announced |
| Success in place | consumer swaps the body and footer slots; `title` unchanged | Success icon or compact empty state, one or two buttons | Body's `role="status"` announces the result; focus moves to the `autofocus` button |
| Blocked | `tone="warning"`, no body, one footer button | Warning circle, title "Keep at least 3 photos", "Got it" | Same as open |
| Conflict | consumer renders `.alert--warning` in the body | Warning alert ("Someone replied first") | Alert announced |
| Full screen | `fullScreenOnPhone` below 48rem | Panel `100dvh`, square corners | — |
| Scrolled | content taller than the viewport less 48 px | Panel scrolls; header scrolls away, footer stays pinned | — |

Hover, focus and pressed belong to the buttons and fields inside.

## Markup

```html
<!-- rendered: md, danger tone, form, Cancel + danger submit (Suspend Pelau House, default) -->
<div class="backdrop"></div>
<div class="dialog" role="dialog" aria-modal="true" aria-labelledby="sh-dialog-1-title" aria-describedby="sh-dialog-1-desc">
  <form class="dialog__panel" novalidate>
    <div class="dialog__header">
      <div class="dialog__icon dialog__icon--danger" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></div>
      <div class="dialog__heading">
        <h2 class="dialog__title" id="sh-dialog-1-title">Suspend Pelau House?</h2>
        <p class="dialog__desc" id="sh-dialog-1-desc">It leaves the listing within a minute and its page returns "not found". You can reinstate it later.</p>
      </div>
      <button class="icon-btn" type="button" aria-label="Close"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
    </div>
    <div class="dialog__body stack">
      …checklist, reason textarea…
      <p class="visually-hidden" role="status"></p>
    </div>
    <div class="dialog__footer">
      <button class="btn" type="button">Cancel</button>
      <button class="btn btn--danger" type="submit">Suspend caterer</button>
    </div>
  </form>
</div>
```

```html
<!-- rendered: busy — panel aria-busy, Close and Cancel disabled, status line filled -->
<form class="dialog__panel" novalidate aria-busy="true">
  <div class="dialog__header">… <button class="icon-btn" type="button" aria-label="Close" disabled>…</button></div>
  <div class="dialog__body stack">
    …<textarea class="textarea" id="reason" readonly>Food safety concern under investigation after report R-2047.…</textarea>
    <p class="visually-hidden" role="status">Suspending Pelau House</p>
  </div>
  <div class="dialog__footer">
    <button class="btn" type="button" disabled>Cancel</button>
    <button class="btn btn--danger" type="submit" aria-busy="true" aria-disabled="true">Suspend caterer</button>
  </div>
</form>
```

```html
<!-- rendered: form size, full screen on phones, caterer photo, recipient description -->
<div class="dialog dialog--full" role="dialog" aria-modal="true" aria-labelledby="sh-dialog-2-title" aria-describedby="sh-dialog-2-desc">
  <form class="dialog__panel dialog__panel--form" novalidate>
    <div class="dialog__header">
      <div class="dialog__caterer">
        <span class="photo"><img src="/img/pelau-house.jpg" alt="" width="56" height="56"></span>
        <div class="dialog__heading">
          <h2 class="dialog__title" id="sh-dialog-2-title">Send an enquiry</h2>
          <p class="dialog__caterer-name" id="sh-dialog-2-desc">to Pelau House</p>
        </div>
      </div>
      <button class="icon-btn" type="button" aria-label="Close">…</button>
    </div>
    <div class="dialog__body stack">…fields, the first with autofocus…</div>
    <div class="dialog__footer"><button class="btn" type="button">Cancel</button><button class="btn btn--primary" type="submit">Send enquiry</button></div>
  </form>
</div>
```

```html
<!-- rendered: blocked — sm, warning tone, no body, single button, no Cancel -->
<div class="dialog__panel dialog__panel--sm">
  <div class="dialog__header">
    <div class="dialog__icon dialog__icon--warning" aria-hidden="true">…</div>
    <div class="dialog__heading"><h2 class="dialog__title" id="…">Keep at least 3 photos</h2><p class="dialog__desc" id="…">Published profiles need at least 3 photos. Add another photo before you remove this one.</p></div>
    <button class="icon-btn" type="button" aria-label="Close">…</button>
  </div>
  <div class="dialog__body stack"><p class="visually-hidden" role="status"></p></div>
  <div class="dialog__footer"><button class="btn" type="button" autofocus>Got it</button></div>
</div>
```

The status line is the body's only node in a dialog without body content; it
is visually hidden, so `.dialog__body` is hidden from layout by the
`:has()` rule in *Implementation notes* and the blocked panel shows no gap.

```html
<!-- rendered: footer with a start-aligned destructive action (review-response/edit) -->
<div class="dialog__footer">
  <button class="btn btn--ghost push-start" type="button"><svg class="icon" aria-hidden="true">…</svg>Delete response</button>
  <button class="btn" type="button">Cancel</button>
  <button class="btn btn--primary" type="submit">Save response</button>
</div>
```

```html
<!-- rendered: sh-dialog-photo and sh-dialog-people -->
<div class="dialog__photo"><span class="photo"><img src="/img/maracas-bay.jpg" alt="" width="160" height="160"></span></div>
<ul class="dialog-people" aria-label="Caterers using Pan-Caribbean">
  <li><span class="photo"><img src="/img/mauby-and-co.jpg" alt="" width="80" height="80"></span>Mauby &amp; Co.</li>
  <li><span class="photo"><img src="/img/sea-moss-and-spice.jpg" alt="" width="80" height="80"></span>Sea Moss &amp; Spice</li>
</ul>
```

The `id`s are generated per instance (`sh-dialog-{n}-title`, `-desc`). Default
size, tone info, success and the `--sm`, `--lg` sizes differ only by modifier
class.

Consumer templates (binding syntax illustrative; copy from the resource files):

```html
<!-- consumer: destructive confirmation with a reason -->
<sh-dialog [open]="suspending()" form tone="danger"
  [title]="t('admin.suspend.title', { name })" [description]="t('admin.suspend.desc')"
  [closeLabel]="t('common.close')" [cancelLabel]="t('common.cancel')"
  [busy]="saving()" [busyMessage]="t('admin.suspend.busy', { name })"
  (dismissed)="suspending.set(false)" (submitted)="suspend()">
  <svg slot="icon" class="icon" …></svg>
  <sh-alert *ngIf="failed()" tone="danger" …></sh-alert>
  <sh-textarea …></sh-textarea>
  <sh-button slot="footer" variant="danger" type="submit" [busy]="saving()">{{ t('admin.suspend.confirm') }}</sh-button>
</sh-dialog>

<!-- consumer: enquiry form -->
<sh-dialog [open]="enquiring()" form size="form" fullScreenOnPhone [photo]="caterer.cover"
  [title]="t('enquiry.title')" [description]="t('enquiry.to', { name: caterer.name })" descriptionRole="recipient" …>

<!-- consumer: destructive without fields -->
<sh-dialog [open]="retiring()" tone="danger" initialFocus="cancel" …>
  <sh-dialog-people [label]="t('admin.cuisine.users', { cuisine })" [people]="affected()"></sh-dialog-people>
</sh-dialog>
```

The e2e page objects locate the dialog by `role="dialog"` and its name, and
its parts by these classes; the class list, the ARIA attributes, the `form`
element and the footer order are part of the contract. Icon path data and the
generated `id` values are free to change.

## Design

- Panel padding `--space-6` (header `--space-6 --space-6 0`, body
  `--space-4 --space-6`, footer `--space-4 --space-6 --space-6`); header gap
  `--space-4`; footer gap `--space-3`; description `--space-1` below the title.
- Title `--text-h3`; description `--text-body` in `--color-fg-muted`; caterer
  name `--text-label` at `--font-size-md`.
- Tone circle `--space-10` square, `--radius-full`; caterer photo 3.5rem;
  `sh-dialog-photo` `min(60%, 10rem)`; `sh-dialog-people` items `--space-32`
  wide with `--space-20` photos and `--space-6` gaps.
- Shape: `--radius-lg` on every corner from 36rem; below, `--radius-xl` on the
  top corners only; none with `.dialog--full` below 48rem.
- Elevation `--shadow-4` — the one lifted surface in Sweet Hand.
- Layers: backdrop `--z-overlay`, dialog `--z-modal`.
- Motion: backdrop `fade-in` over `--duration-base`; panel `slide-up` (XS) or
  `scale-in` (SM+) over `--duration-slow` with `--ease-enter`. Closing is
  instant.
- Safe area: the panel pads its bottom by `env(safe-area-inset-bottom)`.
- The dialog declares no component tokens; it reads semantic tokens directly
  (design system, Theming). Re-skin by overriding those on a theme scope.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel and sticky footer | `--color-bg-surface-raised` | `--palette-white` | `--palette-stone-850` |
| Backdrop | `--color-bg-backdrop` | stone at 50 % | black at 66 % |
| Title and body text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Description | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Danger circle / icon | `--color-danger-bg` / `--color-danger-icon` | `--palette-sorrel-50` / `--palette-sorrel-500` | `--palette-sorrel-950` / `--palette-sorrel-300` |
| Warning circle / icon | `--color-warning-bg` / `--color-warning-icon` | `--palette-mango-50` / `--palette-mango-500` | `--palette-mango-950` / `--palette-mango-300` |
| Success circle / icon | `--color-success-bg` / `--color-success-icon` | `--palette-callaloo-50` / `--palette-callaloo-500` | `--palette-callaloo-950` / `--palette-callaloo-300` |
| Info circle / icon | `--color-info-bg` / `--color-info-icon` | `--palette-stone-50` / `--palette-stone-700` | `--palette-stone-900` / `--palette-stone-350` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Title and body |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Description |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Field error in a dialog |
| `--color-danger-solid` | `--color-bg-surface-raised` | 3:1 | Invalid field edge, danger button edge |
| `--color-action` | `--color-bg-surface-raised` | 3:1 | Primary edge on the panel |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Cancel edge on the panel |
| `--color-danger-icon` | `--color-danger-bg` | 3:1 | Danger icon on its circle |
| `--color-warning-icon` | `--color-warning-bg` | 3:1 | Warning icon on its circle |
| `--color-success-icon` | `--color-success-bg` | 3:1 | Success icon on its circle |
| `--color-info-icon` | `--color-info-bg` | 3:1 | Info icon on its circle |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring on the panel |

The tone icons are decorative (the title says the same thing), so their 3:1
is a design-system rule, not a WCAG requirement. In dark the raised surface is
a step lighter than the canvas and the backdrop deepens, so the panel separates
without a border.

Forced colours: the panel keeps a `CanvasText` 1 px outline so it stays
distinguishable from the page when the backdrop and shadow disappear (D-10);
the tone circles fall back to `Canvas` with `CanvasText` icons.

## Responsive behaviour

| Range | Layout |
|---|---|
| XS (below 36rem) | Bottom sheet: panel full width, on the bottom edge, `--radius-xl` top corners, slides up, safe-area bottom padding. Footer buttons wrap; the primary stays last. |
| SM and up (36rem+) | Centred with `--space-6` around it, `--radius-lg` on every corner, scales in. |
| `.dialog--full`, below 48rem | Panel fills the screen (`100dvh`, no radius) so the enquiry is typed on a full screen; the sticky footer keeps "Send enquiry" at the bottom, above the on-screen keyboard. From 48rem a 40rem form dialog. |
| Any | Panel height at most `100dvh` less `--space-12`; long bodies scroll inside; footer pinned. |

- At 320 px nothing scrolls sideways and no text clips; titles and buttons
  wrap. At 200 % zoom at 1280 px every field and button stays reachable by
  scrolling inside the panel.
- Close and every footer button are at least 44 × 44 CSS px, with at least
  `--space-3` between footer buttons (L2-065).
- The sticky footer never covers the focused field: on focus the body scrolls
  the field into view above the footer (WCAG 2.4.11).

## Accessibility

### Role and pattern

[APG Dialog (Modal)](https://www.w3.org/WAI/ARIA/apg/patterns/dialog-modal/):
`role="dialog"`, `aria-modal="true"`, `aria-labelledby` on the title,
`aria-describedby` on the description. Everything outside is `inert`, so focus,
find-in-page and screen-reader browsing cannot reach the page. Built on the
framework's accessible dialog/overlay primitive (AGENTS.md), never
hand-rolled. Destructive confirmations stay `role="dialog"`; `alertdialog` is
never used (D-7).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the panel's controls and wraps from last to first; never leaves the dialog. |
| <kbd>Esc</kbd> | Emits `dismissed('escape')`; same as Cancel and Close. Ignored while busy. |
| <kbd>Enter</kbd> | In a field of a form dialog, submits the form; in a textarea, adds a line. |
| <kbd>Space</kbd> / <kbd>Enter</kbd> on a button | Activates it. |

### Focus

- On open: the slot element with `autofocus` (the first field of a form; the
  primary of a default confirmation; Done in a success panel); Cancel with
  `initialFocus="cancel"`; otherwise the title (`tabindex="-1"`), never a danger
  button (D-5).
- While open: focus is trapped in the panel; the page is `inert`.
- On close: to `returnFocus`, else to the element focused before opening.
- On success in place: to the new `autofocus` button.
- The focus ring of controls inside meets 3:1 against
  `--color-bg-surface-raised`.

### Labelling

- Name: the title. Description: the consequence sentence or "to Pelau House".
- Close: an icon button named by `closeLabel` ("Close"); its icon is
  `aria-hidden`.
- Tone icons and every header, body and people photo are decorative: `aria-hidden="true"`
  on the circle, `alt=""` on photos, because the text beside them says the same.
- `sh-dialog-people` is a list named by `label`.

### Announcements

- The dialog's name and description are announced on open by the dialog role.
- While busy, the status line (`role="status"`, polite) announces `busyMessage`
  once; it is emptied when busy ends.
- Failure and invalid announcements come from the consumer's `role="alert"`
  alert or summary; success from the body's `role="status"`.

### Motion

The panel slide or scale and the backdrop fade use `--duration-slow` and
`--duration-base`, which `prefers-reduced-motion: reduce` sets to 0.01 ms, so
the dialog appears without movement. Closing is always instant.

## Content and internationalisation

- Titles: confirmations are questions naming the thing ("Suspend Pelau
  House?", "Remove this photo?", "Retire Pan-Caribbean?"); forms are the task
  as a verb phrase ("Send an enquiry", "Add cuisine"); success is a statement
  ("Export requested"). Never "Are you sure?" or "Confirm".
- Description: one sentence of consequence ("It leaves the listing within a
  minute and its page returns "not found". You can reinstate it later.").
- Buttons: the primary repeats the title's verb ("Suspend caterer"); the
  other is "Cancel" unless the dialog is about keeping something ("Keep it in
  review"); a success panel's only button is "Done" or the next step ("Go to
  your inbox").
- Failure copy says what failed, that nothing changed and what is kept: "We
  couldn't suspend Pelau House. Nothing has changed. Check your connection and
  try again; your reason is kept."
- `busyMessage` is the action in progress with its object, without an
  ellipsis: "Suspending Pelau House", "Sending your enquiry to Pelau House".
- Data inside copy (caterer names, dates "Sat 21 Nov", counts) is formatted by
  the consumer per L2-064's resource files.
- Long titles wrap; French runs about 30 % longer ("Suspendre Pelau House ?")
  and the header grows; nothing truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the panel class list, the
  generated ids, the effective footer) are computed once per input change, not
  in the template.
- Nothing is rendered while closed: the overlay, the trap and the `inert`
  marking exist only while `open`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Dialog.ts`
  opens and closes "Suspend Pelau House?" (danger tone, checklist, reason,
  Cancel + "Suspend caterer") and toggles `busy`; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly 100–300 ms.
- Composite scenarios: `EnquiryDialog`, `CatererPage`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the dialog sits in a fixed overlay, so opening it shifts
  nothing on the page; body scrolling is locked while open without removing
  the scrollbar gutter (`scrollbar-gutter: stable` on the root, D-9).
- Weight: the framework's overlay primitive only. It must not import a page,
  form or icon library; icons arrive in the slot.

## Acceptance criteria

### Rendering

- **AC-1** Given "Approve Auntie Bev's Kitchen?" opens in the light theme at 1280 px, when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations, and the DOM has a `.backdrop` followed by `div.dialog[role="dialog"][aria-modal="true"]` whose `aria-labelledby` names the `h2.dialog__title` and whose `aria-describedby` names the `.dialog__desc`. (L2-066)
- **AC-2** Given "Where's your event?" opens with no `description`, when it renders, then the dialog has no `aria-describedby` attribute and no description element. (L2-066)
- **AC-3** Given any open dialog, when its header renders, then Close is an `.icon-btn` with the accessible name "Close", measures at least 44 × 44 CSS px, and its icon has `aria-hidden="true"`. (L2-068)
- **AC-4** Given "Suspend Pelau House?" with `tone="danger"`, when it renders, then the header holds `.dialog__icon.dialog__icon--danger` with `aria-hidden="true"` before the heading, and the screen reader's name for the dialog is exactly "Suspend Pelau House?". (L2-068)
- **AC-5** Given the enquiry to Pelau House at 1280 px, when it opens, then the panel is `.dialog__panel--form` at most 640 CSS px wide, and its header shows Pelau House's cover photo (`alt=""`) beside "Send an enquiry" and "to Pelau House". (L2-026)
- **AC-6** Given "Retire Pan-Caribbean?", when `sh-dialog-people` renders Mauby & Co. and Sea Moss & Spice, then it is a `ul.dialog-people` named "Caterers using Pan-Caribbean" with two items, each photo has `alt=""`, and each name is visible text. (L2-068)
- **AC-7** Given Black Cake Co. has exactly 3 photos and Paulette asks to remove one, when the blocked dialog opens with `tone="warning"`, then it shows "Keep at least 3 photos" and "Published profiles need at least 3 photos. Add another photo before you remove this one.", has no Cancel, and "Got it" is the only footer button. (L2-042)

### States

- **AC-8** Given "Add cuisine" is submitted with "jamaican", when `submitted` is emitted and the consumer renders the error summary, then the dialog stays open with "jamaican" still in the field, and focus moves to the summary inside the panel. (L2-068)
- **AC-9** Given "Suspend Pelau House?" with a reason typed, when `busy` becomes true, then the panel has `aria-busy="true"`, Close and Cancel both have the native `disabled` attribute, and the status line's text becomes "Suspending Pelau House". (L2-066)
- **AC-10** Given Marcia's enquiry to Pelau House for Sat 21 Nov is busy after she pressed "Send enquiry", when she presses Escape, Close, Cancel or Enter in a field, then `dismissed` and `submitted` are not emitted, the dialog stays open, and exactly one enquiry is created. (L2-025)
- **AC-11** Given suspending Pelau House failed, when the consumer sets `busy` false and renders the danger alert "We couldn't suspend Pelau House" first in the body, then the alert has `role="alert"`, Close and Cancel are enabled again, and the reason text is unchanged. (L2-068)
- **AC-12** Given Marcia's enquiry was sent, when the consumer swaps the panel to success, then the dialog's name stays "Send an enquiry", the body's `role="status"` announces "Enquiry sent to Pelau House", the footer shows "Back to Pelau House" and "Go to your inbox", and focus is on "Go to your inbox". (L2-022)
- **AC-13** Given a visitor reports Pelau House with "Food safety concern", when the report dialog swaps to success, then "Thanks — our team will look into this" is announced through `role="status"` and "Done" has focus. (L2-054)
- **AC-14** Given Marcia opens "Delete my account" with `tone="danger"` and a password field marked `autofocus`, when it opens, then focus is in the password field, not on "Delete my account", and Escape closes the dialog without deleting anything. (L2-072)

### Keyboard and focus

- **AC-15** Given "Send an enquiry" on Pelau House's page, when Marcia activates it, then the dialog opens and focus moves to the "Event date" field, which carries `autofocus`. (L2-067)
- **AC-16** Given "Retire Pan-Caribbean?" opens with `initialFocus="cancel"`, when it opens, then focus is on Cancel, never on "Retire cuisine". (L2-067)
- **AC-17** Given a dialog whose slots contain no `autofocus` element and `initialFocus="auto"`, when it opens, then the title has focus with `tabindex="-1"`. (L2-067)
- **AC-18** Given focus on the last control in "Suspend Pelau House?", when Tab is pressed, then focus wraps to the first control in the panel; Shift+Tab from the first goes to the last; nothing outside the dialog is reachable, and every other child of `<body>` is `inert`. (L2-067)
- **AC-19** Given "Report this listing" opened the report dialog, when the visitor presses Escape, then `dismissed` is emitted with `'escape'`, and once `open` is false focus returns to "Report this listing" and `closed` is emitted. (L2-067)
- **AC-20** Given Kendra removes photo 3 of 6 through "Remove this photo?", when the dialog closes with `returnFocus` set to photo 4's "Remove" button, then that button has focus. (L2-067)
- **AC-21** Given the enquiry dialog on a 360 px phone with the on-screen keyboard open, when Marcia moves focus to the "Message" field, then the field is scrolled into view above the sticky footer and is not hidden behind it or the keyboard. (L2-026)
- **AC-22** Given a field inside a dialog in each theme, when it receives keyboard focus, then its focus ring has at least 3:1 contrast against `--color-bg-surface-raised`. (L2-067)

### Theming

- **AC-23** Given the dark theme, when "Suspend Pelau House?" renders, then the panel is `--color-bg-surface-raised` resolving to `--palette-stone-850`, the backdrop is black at 66 %, and the title and description meet 4.5:1 against the panel. (L2-069)
- **AC-24** Given each tone in each theme, when the header icon renders, then the icon has at least 3:1 contrast against its circle. (L2-069)

### Responsive

- **AC-25** Given the enquiry dialog at 360 px, when it opens, then the panel fills the viewport height with square corners, and "Send enquiry" is visible at the bottom of the screen without scrolling. (L2-026)
- **AC-26** Given "Suspend Pelau House?" at 320 px, when it opens, then the panel spans the width on the bottom edge with rounded top corners only, the footer buttons wrap with "Suspend caterer" last, and the page does not scroll horizontally. (L2-064)
- **AC-27** Given "Delete my account" in a 1280 px window at 200 % zoom, when the panel is taller than the viewport, then the panel scrolls inside, the footer stays pinned and visible, and there is no horizontal scrolling. (L2-069)
- **AC-28** Given "Suspend Pelau House?" at 360 px, when the footer is measured, then Cancel and "Suspend caterer" are each at least 44 CSS px high with at least 8 px between them. (L2-065)

### Motion

- **AC-29** Given `prefers-reduced-motion: reduce`, when a dialog opens, then the panel appears in place without sliding or scaling and the backdrop appears without a visible fade. (L2-069)

### Performance

- **AC-30** Given the `Dialog` perf-test scenario, when "Suspend Pelau House?" is opened from its trigger, then the dialog is painted within 200 ms of the press (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/dialog/`; files
  `dialog.component.*` (`sh-dialog`, `DialogComponent`),
  `dialog-photo.component.*` (`sh-dialog-photo`, `DialogPhotoComponent`),
  `dialog-people.component.*` (`sh-dialog-people`, `DialogPeopleComponent`).
- Builds on the chosen framework's accessible dialog/overlay primitive (focus
  trap, `inert` siblings, Escape handling, overlay container at the end of
  `<body>`). It keeps the mock's `div.dialog` markup rather than the native
  `<dialog>` element (D-3).
- Composes [icon button](icon-button.md) (Close), [button](button.md) (Cancel)
  and [photo](photo.md) (caterer photo, `sh-dialog-photo`, `sh-dialog-people`).
  Hosts [alert](alert.md), [checklist](checklist.md), [empty
  state](empty-state.md), form controls and `.form-summary` from [form
  layout](form-layout.md) in its slots.
- Styles: the Dialog section of `components.css`, including `fade-in`,
  `slide-up` and `scale-in`. Class names reach the DOM unscoped so e2e locators
  and nested component rules (`.dialog__footer .btn`) keep working.
- Design-system catch-up:
  - Replace the mocks' `<div style="flex: 1;">` and inline description margin
    with `.dialog__heading` and `.dialog__desc` (already in `components.css`).
  - Add `.dialog__body:not(:has(> :not([role="status"].visually-hidden))) { display: none; }`
    so a body holding only the status line takes no space (D-2).
  - Add `@media (forced-colors: active) { .dialog__panel { outline: 1px solid CanvasText; } }` (D-10).
- Body scroll lock: while open, `overflow: hidden` on the root element with
  `scrollbar-gutter: stable`, removed on close.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Where does the busy status line live, and what happens to an empty body?* As the last child of `.dialog__body`, always present while open so screen readers register the live region before it is filled. A body holding only the status line is hidden by a `:has()` rule, so the blocked panel matches its mock, which has no body.
- **D-3** *Native `<dialog>` or `div.dialog`?* `div.dialog` with `role="dialog"` on the framework's overlay primitive. The mocks, `components.css` and e2e locators use `.backdrop` + `div.dialog`; native `<dialog>` brings its own `::backdrop`, user-agent box styles and top-layer stacking that the toast region could not sit above. The design system allows either; parity with the mocks decides.
- **D-4** *Who disables Cancel and Close while busy, and who makes fields read-only?* The dialog owns Close and Cancel and disables both together, which fixes the drift in 10 busy mocks that left Close working. Fields and the primary belong to the consumer, which sets `readonly` (not `disabled`, so values stay legible) and the button's `busy`.
- **D-5** *What gets focus when no slot element has `autofocus`?* The title, with `tabindex="-1"`. Focusing the first focusable element would land on Close in every dialog, and in a footer-only dialog could land on a danger button; the title is safe and announces the dialog.
- **D-6** *Where does focus go when the opener is gone?* To `returnFocus`, which the consumer sets to the next item in the list (or the list heading) when its action removes the opener, as the design system's Focus rule requires. The component cannot know the list.
- **D-7** *`dialog` or `alertdialog` for destructive confirmations?* `dialog`. The person asked for them; `alertdialog` is for interruptions the system starts. `delete-review` used `alertdialog` with no Close and "Keep review"; the design system aligned it, and so does the API (no role input).
- **D-8** *Does the success panel change the dialog's name?* No. The title stays ("Send an enquiry", "Report this listing"); the success text is announced through the body's `role="status"`. Renaming a dialog mid-session is not reliably re-announced. `download-data/success` and `submit-profile/success` change the title in the mocks; for those the consumer closes the dialog and opens a success dialog with its own title, which is announced as a new dialog.
- **D-9** *Is page scrolling locked while a dialog is open?* Yes, on the root element with `scrollbar-gutter: stable`, so the page behind neither scrolls under a touch drag on the backdrop nor shifts when the scrollbar disappears. The design system is silent; iOS scrolls the page behind otherwise.
- **D-10** *How does the panel stay visible in forced colours, where the backdrop and shadow vanish?* A 1 px `CanvasText` outline on the panel under `forced-colors: active`. The design system lists no forced-colours rule for the dialog.
- **D-11** *Does Cancel live in the component or in the footer slot?* In the component, through `cancelLabel`, so it can be disabled with Close while busy and emit `dismissed('cancel')`. The footer slot holds the actions; `footer-start` holds a start-aligned secondary destructive action, which replaces the inline `margin-right: auto` in `review-response/edit` with `.push-start`.
- **D-12** *Can dialogs stack?* No. One dialog at a time; no mock opens a dialog from a dialog ("Delete response" confirms in place). Toasts may appear above an open dialog: the overlay helper leaves `.toast-region` out of `inert` (see [toast](toast.md) D-5).
