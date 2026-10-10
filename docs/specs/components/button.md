# Button

| Field | Value |
|---|---|
| Selector | `sh-button` (renders `<button>`), `sh-button-anchor` (renders `<a href>`) |
| Library path | `frontend/projects/components/src/lib/button/` |
| Status | planned |
| Traces to | L2-001, L2-015, L2-017, L2-018, L2-025, L2-043, L2-054, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-085 |
| Design system | [`button.html`](../../design-system/components/button.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/offline`](../../mocks/pages/caterer/offline.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`dialogs/enquiry/busy`](../../mocks/dialogs/enquiry/busy.html), [`dialogs/remove-caterer/default`](../../mocks/dialogs/remove-caterer/default.html), [`dialogs/delete-account/default`](../../mocks/dialogs/delete-account/default.html), [`dialogs/filters/busy`](../../mocks/dialogs/filters/busy.html), [`pages/profile-menu/full`](../../mocks/pages/profile-menu/full.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/not-found/default`](../../mocks/pages/not-found/default.html) |
| Rendering | [`button.html`](button.html) |

## Purpose and scope

A button lets someone do something on Sweet Hand: send an enquiry to Pelau
House, save their details, approve a profile, remove a photo. Activating it
changes something — it submits, saves, removes, opens a dialog or starts a
process. One solid ink primary button per screen says what matters most;
everything else is quieter. `sh-button-anchor` gives a link that goes somewhere
the same look ("Browse caterers" on the 404 page) while staying an `<a href>`.

Use something else when the control only navigates in running text (a plain
link, [link](link.md)), is a single glyph in a header or photo row without a
pill outline ([icon button](icon-button.md), `.icon-btn`), is one of a set of
toggles ([button group](button-group.md)), opens a dropdown of options
([filter trigger](filter-trigger.md)) or offers several actions
([menu](menu.md)). The sticky "Send an enquiry" bar is [sticky
CTA](sticky-cta.md), which contains a button.

Out of scope:

- Footer and toolbar layout: order of "Cancel" and the primary, wrapping,
  stretching in the phone filter sheet (`.dialog__footer`, `.sheet__footer`,
  `.toolbar`) belongs to [dialog](dialog.md), [sheet](sheet.md) and the page.
- Form validation, the error summary and what happens on submit; the button
  only reports activation and shows busy while the consumer says so.
- Progress text such as "Sending your enquiry…": the consumer's live region
  announces it, not the button.
- Opening and closing dialogs and returning focus: the dialog does that; the
  button only exposes a `focus()` it can call.
- File pickers styled as buttons (`<label class="btn" for="photo-upload">`):
  [file upload](file-upload.md) renders that label with this CRD's classes.
- The toggle group (`.btn-group`) and dropdown triggers (`aria-expanded` with a
  popup listbox).

## Usage

Inventory from `usage_inventory.py docs/mocks btn "a|button|label|span"` and
a search of every `class="btn` in `docs/mocks/`. Rows that share a
configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default` main column and sticky bar (XS–MD) | primary, lg, block, `haspopup="dialog"` | "Send an enquiry" | default | canvas, sticky bar |
| `pages/caterer/default` side panel (LG–XL) | primary, md, `haspopup="dialog"` | "Send an enquiry" | default | canvas |
| `pages/caterer/offline` | primary, lg, block, disabled, `describedBy` | "Send an enquiry" + offline note | disabled | canvas |
| `pages/caterer/default`, `more-dishes` | secondary, `expanded`, `controls="dish-list"` | "Show all 18 dishes" / "Show fewer dishes" | expanded false, true | canvas |
| `pages/caterer/default` reviews | secondary | "Show more reviews" | default, busy (decided, D-9) | canvas |
| `pages/caterer/default` | link, sm, leading flag icon, `haspopup="dialog"` | "Report this listing" | default | canvas |
| `pages/sign-in`, `register`, `register-caterer`, `forgot-password`, `reset-password`, `two-factor`, `verify-email`, `privacy-update` | primary, lg, block, `type="submit"` | "Sign in", "Create account", "Create caterer account", "Send reset link", "Save new password", "Continue", "Accept and continue" | default, busy | canvas |
| same auth pages, secondary action | secondary, lg, block | "Use a security key instead", "Resend email", "Sign out" | default, disabled + `describedBy="resend-help"` | canvas |
| `pages/sign-in/default` password field | link, sm, `pressed`, `controls="password"` | "Show" | pressed false, true | canvas |
| `pages/not-found`, `forbidden`, `server-error`, `offline`, `caterer/removed` | anchor, primary or secondary, lg | "Browse caterers", "Go to Sweet Hand", "Browse by occasion", "Sign in with another account" | default | canvas |
| `pages/server-error`, `offline`, `maintenance`, `rate-limited` | primary, lg | "Try again", "Check again", "Try again in 1 minute" | default, busy | canvas |
| `pages/profile-menu/default` (empty), `full` | primary, lg / md, `haspopup="dialog"` | "Add your first dish", "Add dish" | default, disabled + `describedBy="dish-limit"` | canvas |
| Every form dialog footer (`enquiry`, `edit-details`, `change-password`, `add-cuisine`, `add-operator`, `approve-profile`, `request-changes`, `review`, `review-response`, `share-contact`, `download-data`, `end-session`, `operator-edit`, `reinstate-caterer`, `revert-change`, `resolve-report`, `report`, `photo-details`, `record-breach`) | secondary "Cancel" + primary `type="submit"` | "Cancel"; "Send enquiry", "Save details", "Change password", "Approve and publish", "Post response", "Request export" | default, busy | dialog (`--color-bg-surface-raised`) |
| Confirmation dialogs (`delete-account`, `remove-caterer`, `suspend-caterer`, `remove-dish`, `remove-photo`, `retire-cuisine`, `deactivate-operator`, `decline-enquiry`, `close-enquiry`, `delete-review`, `moderate-review`) | danger, `type="submit"` | "Delete my account", "Remove permanently", "Suspend caterer", "Decline enquiry", "Retire cuisine", "Close enquiry" | default, focus, busy, disabled-focusable (until the typed name matches) | dialog |
| `dialogs/filters` (phone filter sheet) | anchor secondary + primary `type="submit"` with `form="filters-form"` | "Clear"; "Show 2 caterers" | default, busy (anchor aria-disabled) | sheet footer, stretched |
| `pages/caterers` toolbar | ghost, leading location icon, `haspopup="dialog"` | "Area or postal code" | default | canvas |
| `pages/caterers/no-results`, `filtered` | anchor, link, sm; anchor primary in the empty state | "Clear filters" | default | canvas |
| `pages/thread/default`, reply box | primary, icon-only, `type="submit"`, `ariaLabel` | send icon, "Send reply" | default, busy | surface |
| Operator rows (`admin-operators`, `admin-cuisines`, `admin-reviews`, `admin-queue`) | secondary or ghost, sm, `ariaLabel` naming the object | "Deactivate" ("Deactivate Tomas Reyes"), "Retire" ("Retire Jamaican"), "Approve", "Keep hidden" | default, disabled | canvas, table |
| Caterer editor rows (`profile-photos`, `profile-menu`, `profile-certificate`) | link or ghost, sm, visually hidden object in the label | "Edit<span class="visually-hidden"> photo 1</span>", "Remove<span class="visually-hidden"> food-handler-certificate.pdf</span>" | default, disabled | canvas |
| `pages/admin-profile-review`, `dialogs/approve-profile` | secondary, sm, wrap | "Open food-handler-certificate.pdf · 1.2 MB" | default | canvas, dialog |
| `pages/account` | anchor, link | "Sign out" | default | canvas |
| Operator back links (`admin-audit`, `admin-breaches`, `admin-caterer`, `admin-report` …) | anchor, secondary or ghost | "Back to the queue", "Back to overview", "Export CSV" | default | canvas |

Not product markup, and not built by this component:

- `<span class="btn">` copies (123 in `dialogs/change-password`,
  `delete-account`, `download-data`, `edit-details`, `end-session`,
  `review-response`, `filters`, `search`, `site-menu`) are the mock's static
  picture of the page behind an open dialog. The product renders the real page
  there, made inert by the dialog (D-11).
- `<label class="btn">` for file inputs (`dialogs/photo-details`,
  `pages/profile-photos`, `pages/profile-certificate`) is owned by
  [file upload](file-upload.md) (D-12).
- `.icon-btn` (close, menu, move photo up) is [icon button](icon-button.md).

## Anatomy

1. **Container** — `.btn` on the native `<button>` (or `<a>` for
   `sh-button-anchor`). A pill (`--radius-full`) with a hairline border
   (`--border-width-hairline`), centred inline-flex content, height from the
   size, never wider than its container (`max-width: 100%`).
2. **Leading icon (optional)** — `svg.icon` before the label, 1.25em square,
   stroked in `currentColor`, always `aria-hidden="true"`. There is no trailing
   icon: no mock uses one.
3. **Label** — the projected text. It is the accessible name unless `ariaLabel`
   extends it. May contain a `.visually-hidden` span that names the object
   ("Edit<span class="visually-hidden"> photo 1</span>").
4. **Busy indicator** — the `::after` pseudo-element of `.btn[aria-busy="true"]`:
   a 1.1em ring in `--btn-fg` with one transparent quarter, spinning once per
   `--duration-loop-fast`. Not a DOM node.

Host: `sh-button` and `sh-button-anchor` are layout-transparent
(`display: contents`). Every class and attribute in *Markup* goes on the inner
native element, so parent rules written for `.btn` (`.sheet__footer .btn`,
`.dialog__footer`, flex and grid children) apply unchanged (D-2). The inner
element is in the light DOM, never a shadow root, so form submission, the
`form` attribute and `aria-describedby` id references work natively.

## API

### Inputs

Both selectors share these inputs unless the rule says otherwise.

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'primary' \| 'secondary' \| 'ghost' \| 'link' \| 'danger'` | `'secondary'` | no | Adds `.btn--primary`, `.btn--ghost`, `.btn--link` or `.btn--danger`; `secondary` adds no modifier. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | no | Adds `.btn--sm` or `.btn--lg`; `md` adds no modifier. |
| `block` | `boolean` | `false` | no | Adds `.btn--block` (full width of the container). |
| `wrap` | `boolean` | `false` | no | Adds `.btn--wrap`: the label may wrap, left-aligned. Never renders `data-wrap`. |
| `iconOnly` | `boolean` | `false` | no | Adds `.btn--icon` (square, width equals the height). Requires `ariaLabel`; the default slot then holds only the icon. |
| `type` | `'button' \| 'submit' \| 'reset'` | `'button'` | no | `sh-button` only. Rendered on every button, so nothing submits a form by accident. |
| `form` | `string \| null` | `null` | no | `sh-button` only. Rendered as `form="…"` for a submit button outside its form ("Show 2 caterers" in the filter sheet). |
| `href` | `string` | — | yes (anchor) | `sh-button-anchor` only. Rendered on the `<a>` and kept while disabled. |
| `target`, `rel` | `string \| null` | `null` | no | `sh-button-anchor` only. Passed through; `target="_blank"` requires `rel="noopener"`. |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"` and `aria-disabled="true"`, never native `disabled`. Keeps label, width and focus; activation is ignored (D-3, D-4). |
| `disabled` | `boolean` | `false` | no | `sh-button`: native `disabled`, removed from the tab order. `sh-button-anchor`: `aria-disabled="true"`, activation prevented (D-6). |
| `disabledFocusable` | `boolean` | `false` | no | `sh-button` only. With `disabled`, renders `aria-disabled="true"` instead of native `disabled`, so the button stays focusable and announces as dimmed ("Remove permanently" until the name matches). Ignored when `disabled` is false. |
| `pressed` | `boolean \| null` | `null` | no | `null` renders no `aria-pressed`; `true`/`false` render `aria-pressed="true"`/`"false"`. Controlled by the consumer. |
| `expanded` | `boolean \| null` | `null` | no | `null` renders no `aria-expanded`; otherwise `"true"`/`"false"`. Controlled by the consumer. |
| `controls` | `string \| null` | `null` | no | Rendered as `aria-controls`. Use with `expanded` or `pressed`. |
| `haspopup` | `'dialog' \| null` | `null` | no | Rendered as `aria-haspopup="dialog"` on a button that opens a dialog. Other popup types belong to [menu](menu.md) and [filter trigger](filter-trigger.md). |
| `ariaLabel` | `string \| null` | `null` | yes when `iconOnly` | Rendered as `aria-label`. When a visible label exists, it must start with that label ("Retire Jamaican" for "Retire", WCAG 2.5.3). |
| `describedBy` | `string \| null` | `null` | no | Rendered as `aria-describedby`. Points at the text that explains a disabled button ("You can list up to 50 dishes. Remove one to add another."). |

- Boolean inputs accept the bare attribute (`<sh-button block busy>`).
- Every attribute whose input is `null` or `false` is absent from the DOM, not
  rendered as `"false"` or `"null"` (except `pressed`/`expanded` `false`, which
  render `"false"`).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `activated` | `MouseEvent` (the native click; keyboard activation arrives as a click) | The user activates the button by click, tap, <kbd>Enter</kbd> or <kbd>Space</kbd>, and it is neither `busy`, `disabled` nor disabled-focusable. Never emitted otherwise. |

While `busy` or disabled-focusable, the component calls `preventDefault()` and
`stopPropagation()` on the native click, so neither `activated`, a consumer's
own click listener on an ancestor, form submission nor anchor navigation
happens.

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the inner native element. Dialogs call it to return focus to the button that opened them (L2-067). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text, an optional leading `svg.icon` and optional `span.visually-hidden` | The label. The icon, if any, comes first. An icon without `aria-hidden="true"` is given it by the component. With `iconOnly`, only the icon. The slot is declared once, whatever the state. |

- Translation: the label and `ariaLabel` arrive from the consumer, who takes
  them from the resource files (L2-064). The component contains no
  user-facing strings.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Primary | `.btn--primary` | The one action the screen exists for: "Send an enquiry", "Approve and publish", "Sign in". At most one per view. |
| Secondary | — (base `.btn`) | Every other action: "Cancel", "Edit", "Show more reviews". The default. |
| Ghost | `.btn--ghost` | Dense places: row actions, the listing toolbar ("Area or postal code"). No border. |
| Link | `.btn--link` | Low-emphasis actions inside text and forms: "Report this listing", "Show", "Edit photo 1". Looks like a link, is a button. |
| Danger | `.btn--danger` | Destructive or punitive confirmations, only inside a confirmation dialog: "Delete my account", "Suspend caterer". |

Modifiers that combine with any variant: `.btn--block`, `.btn--wrap`,
`.btn--icon`. Pepper red is never a button colour; it means "selected / you are
here".

| Size | Modifier | Height | Padding | Type |
|---|---|---|---|---|
| sm | `.btn--sm` | `--control-height-sm` (36 px) from 48rem; `--target-comfortable` (44 px) below | `--space-3` | `--text-label` at `--font-size-sm` |
| md | — | `--control-height-md` (44 px) | `--space-4` | `--text-label` at `--font-size-md` |
| lg | `.btn--lg` | `--control-height-lg` (52 px) | `--space-6` | `--text-label` at `--font-size-lg` |

Width comes from the label and padding; `.btn--block` fills the container;
`.btn--icon` is square (`--control-height-md`, or `--control-height-sm` with
`.btn--sm`, growing to `--target-comfortable` below 48rem). The link variant
uses `--space-1` side padding instead of the size's padding.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Variant fill, border and label from `--btn-bg`, `--btn-border`, `--btn-fg` | Role button (link for the anchor), name from the label |
| Hover | `:hover` | Fill `--btn-bg-hover`; primary also takes `--color-action-hover` border and `--shadow-2`; link takes `--color-fg-link-hover` and a `--border-width-thick` underline | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out; no ring on mouse focus | Focused; name announced |
| Active | `:active` | Fill `--btn-bg-active`; moves 1 px down (none under reduced motion) | — |
| Busy | `busy` → `aria-busy="true"` + `aria-disabled="true"` | Label turns transparent (still laid out, so width is kept); spinner in `--btn-fg` centred; full opacity (D-5); no pointer events | Name unchanged; "busy" / "dimmed" exposed; stays focusable and in the tab order |
| Disabled | `disabled` → native `disabled` | 50 % opacity, `cursor: not-allowed`, no lift or nudge | Removed from the tab order; announced as unavailable if reached by virtual cursor; `aria-describedby` gives the reason |
| Disabled, focusable | `disabled` + `disabledFocusable` → `aria-disabled="true"` | Same as disabled | Focusable, announced as dimmed with its description; activation ignored |
| Pressed | `pressed` → `aria-pressed` | No visual change outside a button group; the consumer swaps the label if needed ("Show" stays "Show") | Announced as toggle, pressed / not pressed |
| Expanded | `expanded` → `aria-expanded` | No visual change; the consumer swaps the label ("Show all 18 dishes" → "Show fewer dishes") | Announced as collapsed / expanded; `aria-controls` names the region |
| Opens a dialog | `haspopup` → `aria-haspopup="dialog"` | No visual change | Announced as having a dialog popup |
| On dialog surface | inside `.dialog` (`--color-bg-surface-raised`) | Secondary fill is `--color-bg-surface`; edges still meet 3:1 against the raised surface | — |

`data-state="hover|focus|active|loading|disabled"` exists in `components.css`
only for documentation and mocks. The component never renders it.

## Markup

```html
<!-- rendered: secondary (default), md -->
<button class="btn" type="button">Cancel</button>
```

```html
<!-- rendered: primary, lg, block, opens a dialog (Pelau House, main column) -->
<button class="btn btn--primary btn--lg btn--block" type="button" aria-haspopup="dialog">Send an enquiry</button>
```

Ghost, link and danger differ only by `.btn--ghost`, `.btn--link` or
`.btn--danger`; sm and lg only by `.btn--sm` or `.btn--lg`.

```html
<!-- rendered: leading icon -->
<button class="btn btn--ghost" type="button" aria-haspopup="dialog"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Area or postal code</button>
```

```html
<!-- rendered: icon-only submit, busy -->
<button class="btn btn--primary btn--icon" type="submit" aria-label="Send reply" aria-busy="true" aria-disabled="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
```

```html
<!-- rendered: visible label extended for assistive technology -->
<button class="btn btn--ghost btn--sm" type="button" aria-haspopup="dialog" aria-label="Retire Jamaican">Retire</button>
<button class="btn btn--link btn--sm" type="button" aria-haspopup="dialog">Edit<span class="visually-hidden"> photo 1</span></button>
```

```html
<!-- rendered: busy submit; label kept, never native disabled -->
<button class="btn btn--primary" type="submit" aria-busy="true" aria-disabled="true">Send enquiry</button>
```

```html
<!-- rendered: disabled with its reason -->
<button class="btn btn--primary" type="button" disabled aria-describedby="dish-limit">Add dish</button>
<p class="field__help" id="dish-limit">You can list up to 50 dishes. Remove one to add another.</p>
```

```html
<!-- rendered: disabled but focusable (confirmation not yet typed) -->
<button class="btn btn--danger" type="submit" aria-disabled="true">Remove permanently</button>
```

```html
<!-- rendered: disclosure and toggle -->
<button class="btn" type="button" aria-expanded="false" aria-controls="dish-list">Show all 18 dishes</button>
<button class="btn btn--link btn--sm" type="button" aria-pressed="false" aria-controls="password">Show</button>
```

```html
<!-- rendered: submit outside its form -->
<button class="btn btn--primary" type="submit" form="filters-form">Show 2 caterers</button>
```

```html
<!-- rendered: sh-button-anchor, default and disabled -->
<a class="btn btn--primary btn--lg" href="/caterers">Browse caterers</a>
<a class="btn" href="/caterers" aria-disabled="true">Clear</a>
```

```html
<!-- rendered: long label that wraps -->
<button class="btn btn--sm btn--wrap" type="button">Open food-handler-certificate.pdf · 1.2 MB</button>
```

Consumer templates (binding syntax illustrative; labels come from the resource
files):

```html
<!-- consumer: caterer page call to action -->
<sh-button variant="primary" size="lg" block haspopup="dialog" (activated)="openEnquiry()">{{ t('caterer.enquire') }}</sh-button>

<!-- consumer: enquiry dialog footer -->
<sh-button (activated)="close()">{{ t('common.cancel') }}</sh-button>
<sh-button variant="primary" type="submit" [busy]="sending()">{{ t('enquiry.send') }}</sh-button>

<!-- consumer: danger confirmation that stays focusable until the name matches -->
<sh-button variant="danger" type="submit" [disabled]="!nameMatches()" disabledFocusable>{{ t('admin.remove.confirm') }}</sh-button>

<!-- consumer: icon-only reply -->
<sh-button variant="primary" iconOnly type="submit" [ariaLabel]="t('thread.sendReply')" [busy]="posting()"><svg class="icon" …></svg></sh-button>

<!-- consumer: navigation that looks like a button -->
<sh-button-anchor variant="primary" size="lg" href="/caterers">{{ t('errors.browseCaterers') }}</sh-button-anchor>
```

The e2e page objects locate buttons by role and name and by these classes and
attributes, so the class list, `type`, the ARIA attributes and the absence of
native `disabled` while busy are part of the contract. The icon's path data is
free to change.

## Design

- Height `--control-height-md` by default; `--control-height-sm` and
  `--control-height-lg` for the sizes; side padding `--space-4`
  (`--space-3` sm, `--space-6` lg, `--space-1` link); icon-to-label gap
  `--space-2`.
- Label `--text-label` with `--font-size-md` (`--font-size-sm` sm,
  `--font-size-lg` lg), line height 1, `white-space: nowrap` unless
  `.btn--wrap` (then `--line-height-snug` and `--space-2` block padding).
  Sentence case; no `text-transform`.
- Shape `--radius-full`; border `--border-width-hairline` in `--btn-border`.
- Elevation: none at rest; primary hover `--shadow-2`.
- Focus ring `--focus-ring-width` solid `--color-focus-ring`, offset
  `--focus-ring-offset`.
- Motion: background, border, transform and shadow transition over
  `--duration-fast` with `--ease-standard`; active translates 1 px down; the
  busy spinner turns once per `--duration-loop-fast`, linear.
- Layer: none. The button never sets a `z-index`.

Component tokens (declared on `.btn`, overridden per variant; a re-skin
overrides these, never `.btn` itself):

| Token | Aliases | Overridden by |
|---|---|---|
| `--btn-bg` | `--color-bg-surface` | primary `--color-action`, danger `--color-danger-solid`, ghost and link transparent |
| `--btn-fg` | `--color-fg-default` | primary `--color-fg-on-action`, danger `--color-fg-on-danger`, link `--color-fg-link` (hover `--color-fg-link-hover`) |
| `--btn-border` | `--color-border-strong` | primary `--color-action`, danger `--color-danger-solid`, ghost and link transparent |
| `--btn-bg-hover` | `--color-bg-subtle` | primary `--color-action-hover`, danger `--color-danger-solid-hover`, link transparent |
| `--btn-bg-active` | `--color-bg-subtle-hover` | primary `--color-action-active`, danger `--color-danger-solid-hover`, link transparent |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Primary fill | `--color-action` | `--palette-stone-950` | `--palette-stone-100` |
| Primary fill, hover | `--color-action-hover` | `--palette-stone-800` | `--palette-white` |
| Primary fill, active | `--color-action-active` | `--palette-stone-700` | `--palette-stone-200` |
| Primary label | `--color-fg-on-action` | `--palette-white` | `--palette-stone-950` |
| Secondary fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Secondary and ghost label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Secondary border | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Secondary and ghost hover / active | `--color-bg-subtle` / `--color-bg-subtle-hover` | `--palette-stone-100` / `--palette-stone-200` | `--palette-stone-800` / `--palette-stone-700` |
| Link label / hover | `--color-fg-link` / `--color-fg-link-hover` | `--palette-stone-950` / `--palette-pepper-600` | `--palette-stone-100` / `--palette-pepper-300` |
| Danger fill / hover | `--color-danger-solid` / `--color-danger-solid-hover` | `--palette-sorrel-600` / `--palette-sorrel-700` | `--palette-sorrel-300` / `--palette-sorrel-100` |
| Danger label | `--color-fg-on-danger` | `--palette-white` | `--palette-sorrel-950` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Primary label |
| `--color-fg-on-action` | `--color-action-hover` | 4.5:1 | Primary label, hover |
| `--color-fg-on-action` | `--color-action-active` | 4.5:1 | Primary label, active |
| `--color-action` | `--color-bg-canvas` | 3:1 | Primary edge on the page |
| `--color-action` | `--color-bg-surface-raised` | 3:1 | Primary edge in a dialog |
| `--color-fg-on-danger` | `--color-danger-solid` | 4.5:1 | Danger label |
| `--color-fg-on-danger` | `--color-danger-solid-hover` | 4.5:1 | Danger label, hover |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Danger edge |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Secondary edge on the page |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Secondary edge in a dialog |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Secondary and ghost label, hover |
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Link label |
| `--color-fg-link-hover` | `--color-bg-canvas` | 4.5:1 | Link label, hover |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring on the page |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring in a dialog |

Disabled buttons (50 % opacity) are exempt from the text minimum (WCAG 1.4.3,
inactive components); busy buttons are not dimmed, so the spinner keeps 3:1
against the fill (D-5).

Forced colours: every `.btn` keeps a `CanvasText` hairline border and primary
uses `Highlight` / `HighlightText`, so variants stay distinguishable; the focus
ring becomes `Highlight` through `--color-focus-ring`. `prefers-contrast: more`
needs no button rule: `--color-border-strong` is already the strong edge.

## Responsive behaviour

- Sizes do not change by breakpoint, with one exception: below 48rem
  (XS and SM), `.btn--sm` grows to `--target-comfortable` (44 px) high, and
  `.btn--icon.btn--sm` to 44 × 44 (L2-065). From 48rem, sm is 36 px and lives
  only in rows with at least 8 px to the next target.
- Below 48rem the page's primary call to action is `block` (in the form or the
  sticky bar); that choice belongs to the consumer, which sets `block`.
- Labels never truncate. A label that does not fit at 320 px uses `wrap`
  (left-aligned, line height `--line-height-snug`) or a shorter verb phrase;
  the button never exceeds its container (`max-width: 100%`).
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom at a 1280 px
  window every label stays readable and every button usable; every target is
  at least 44 × 44 CSS px on XS and SM.

## Accessibility

### Role and pattern

`sh-button` renders a native `<button>` with an explicit `type`, following the
[APG Button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/); with
`pressed` it is a toggle button, with `expanded` a disclosure button
([APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)).
`sh-button-anchor` renders a native `<a href>` and keeps the link role. No
`role` attribute is ever added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves focus to and from the button in DOM order. Busy and disabled-focusable buttons stay in the order; natively disabled ones are skipped. |
| <kbd>Enter</kbd> | Activates `sh-button` (and submits its form when `type="submit"`); follows the link on `sh-button-anchor`. |
| <kbd>Space</kbd> | Activates `sh-button` on key up, so moving focus away before release cancels it. Scrolls the page on `sh-button-anchor`, as on any link. |
| <kbd>Esc</kbd> | No effect on the button; inside a dialog the dialog closes. |

### Focus

- The ring shows on `:focus-visible` only: keyboard focus shows it, a mouse
  click does not.
- Busy keeps focus on the button. Turning busy off does not move focus.
- `focus()` focuses the inner element, so a dialog opened by the button can
  return focus to it when it closes (L2-067).
- The `--focus-ring-offset` gap shows the surface behind, so the ring meets
  3:1 against the page or dialog surface on every variant, including the ink
  primary.

### Labelling

- The visible label is the accessible name. `ariaLabel` may extend it, and
  then starts with the visible words ("Retire" → "Retire Jamaican",
  "Deactivate" → "Deactivate Tomas Reyes").
- Icon-only buttons name the action and its object: "Send reply",
  "Move Doubles up" — never "Send" or "Up".
- Icons are always `aria-hidden="true"`.
- Busy never changes the name: "Send enquiry" stays "Send enquiry"; the
  consumer announces "Sending your enquiry…" in its live region.
- A disabled button that has a reason points at it with `describedBy`.

### Announcements

None. The button has no live region. State changes (`aria-busy`,
`aria-pressed`, `aria-expanded`) are exposed as attributes, and progress text
belongs to the consumer.

### Motion

Colour, border and shadow transitions use `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms; the 1 px active nudge is
removed. The busy spinner keeps turning under reduced motion, because it
reports status rather than decorating (design system, Motion).

## Content and internationalisation

- Verb phrases in sentence case, Canadian English: "Send an enquiry",
  "Approve and publish", "Add a dish", "Try again". Never "OK", "Submit",
  "Yes" or "Click here".
- Name the object when context does not: "Remove photo" in a row,
  "Remove permanently" in the confirmation. Destructive labels say what is
  lost: "Delete my account", "Decline enquiry", not "Confirm".
- "Cancel" is always "Cancel"; the dismiss of a successful dialog is "Done".
- Three words where possible; a label that wraps at 360 px in English is too
  long, except data-bearing labels such as "Open food-handler-certificate.pdf ·
  1.2 MB", which use `wrap`.
- Counts and data inside labels are formatted by the consumer: "Show all 18
  dishes", "Show 2 caterers", "Try again in 1 minute".
- Translatable inputs: the default-slot label, `ariaLabel`. Data values inside
  labels: dish counts, file names and sizes, cuisine and operator names.
- Labels in French run about 30 % longer ("Envoyer une demande"); the button
  grows to fit and never truncates; `wrap` is the escape at 320 px.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the class list, the
  effective `aria-disabled`) are computed once per input change, not in the
  template.
- No timers, observers or global listeners; one click listener on the inner
  element.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Button.ts`
  renders the enquiry dialog footer for Pelau House ("Cancel" + "Send
  enquiry", toggling `busy`) and the "Send an enquiry" lg block call to action;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CatererPage`, `EnquiryDialog`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: busy keeps the label in the layout (transparent), so the
  width never changes; the spinner is absolutely positioned.
- Weight: no dependencies beyond the framework. It must not import an icon
  library; icons arrive in the slot.

## Acceptance criteria

### Rendering

- **AC-1** Given `<sh-button>` with the label "Cancel" and no other inputs, when it renders at 1280 px, then the DOM is `<button class="btn" type="button">Cancel</button>` with no variant or size modifier and the button is 44 CSS px high. (L2-065)
- **AC-2** Given Pelau House's caterer page at 360 px, when the main-column call to action renders, then it is a `<button>` with classes `btn btn--primary btn--lg btn--block`, `type="button"` and `aria-haspopup="dialog"`, labelled "Send an enquiry", 52 CSS px high and as wide as its column. (L2-015)
- **AC-3** Given the page "This caterer has left Sweet Hand" served for a removed caterer, when "Browse caterers" renders through `sh-button-anchor` with `href="/caterers"`, then it is `<a class="btn btn--primary btn--lg" href="/caterers">` exposed with the link role, and pressing Enter on it opens the listing. (L2-018)
- **AC-4** Given the listing with the filters "Jamaican" and "Scarborough" matching no caterers, when the empty state's "Clear filters" renders through `sh-button-anchor` with the link variant and small size, then it is `<a class="btn btn--link btn--sm">` underlined in `--color-fg-link`, and activating it opens the listing URL without filter parameters. (L2-001)
- **AC-5** Given Pelau House's caterer page, when "Report this listing" renders with the link variant, small size, a flag icon and `haspopup="dialog"`, then it is a `<button type="button">` with `aria-haspopup="dialog"`, its icon has `aria-hidden="true"`, and its accessible name is exactly "Report this listing". (L2-054)
- **AC-6** Given Marcia Thompson's "Delete my account" confirmation dialog, when the confirm button renders with `variant="danger"` and `type="submit"`, then it has classes `btn btn--danger`, a `--color-danger-solid` fill and a label contrast of at least 4.5:1 in the light theme. (L2-072)
- **AC-7** Given the listing toolbar, when the ghost "Area or postal code" button renders with a location icon in its slot, then the icon comes before the label, has `aria-hidden="true"`, and the accessible name is "Area or postal code". (L2-068)
- **AC-8** Given the reply box in Marcia's thread with Pelau House, when the icon-only submit renders with `ariaLabel` "Send reply", then it has classes `btn btn--primary btn--icon`, measures 44 × 44 CSS px, and its accessible name is "Send reply". (L2-068)
- **AC-9** Given the operator's cuisine list, when the row action for Jamaican renders with the visible label "Retire" and `ariaLabel` "Retire Jamaican", then its accessible name is "Retire Jamaican" and begins with its visible label. (L2-068)

### Sizes

- **AC-10** Given the small "Deactivate" button in Tomas Reyes's operator row, when it is measured at 1280 px, then it is 36 CSS px high; when it is measured at 360 px, then it is at least 44 CSS px high. (L2-065)

### States

- **AC-11** Given a primary "Send an enquiry" button, when it is hovered and then pressed, then the fill changes to `--color-action-hover` and then `--color-action-active`, and the label contrast stays at least 4.5:1 in both states. (L2-069)
- **AC-12** Given "Send enquiry" in the enquiry dialog to Pelau House, when `busy` becomes true, then the button has `aria-busy="true"` and `aria-disabled="true"`, has no `disabled` attribute, its text content and accessible name are still "Send enquiry", and a spinner replaces the visible label. (L2-068)
- **AC-13** Given "Send enquiry" is busy after Marcia's first press, when she presses it again by click, Enter or Space, then `activated` is not emitted, the form is not submitted again, and exactly one enquiry to Pelau House for Sat 21 Nov is created. (L2-025)
- **AC-14** Given keyboard focus is on "Send enquiry", when `busy` turns on and later off, then focus stays on the button throughout and the button remains in the tab order. (L2-067)
- **AC-15** Given "Send enquiry" at its resting width, when `busy` turns on, then its rendered width and height are unchanged to the pixel and the dialog footer does not shift. (L2-085)
- **AC-16** Given a busy primary button in the light and the dark theme, when it renders, then it is drawn at full opacity and the spinner has at least 3:1 contrast against the button fill. (L2-069)
- **AC-17** Given a caterer with 50 dishes on the menu editor, when "Add dish" renders with `disabled` and `describedBy="dish-limit"`, then it has the native `disabled` attribute, is skipped by Tab, is drawn at 50 % opacity, and its accessible description is "You can list up to 50 dishes. Remove one to add another." (L2-043)
- **AC-18** Given the "Remove Pelau House permanently?" dialog before the operator has typed "Pelau House", when "Remove permanently" renders with `disabled` and `disabledFocusable`, then it has `aria-disabled="true"` and no `disabled` attribute, Tab reaches it, and activating it neither submits the form nor emits `activated`. (L2-067)
- **AC-19** Given Pelau House's page showing 12 of 18 dishes, when "Show all 18 dishes" renders with `expanded` false and `controls="dish-list"` and the consumer then sets `expanded` true and the label "Show fewer dishes", then the button reads `aria-expanded="false"` before and `aria-expanded="true"` after, with `aria-controls="dish-list"` throughout. (L2-017)
- **AC-20** Given the sign-in page, when the password "Show" button renders with `pressed` false and the consumer then sets it true, then it carries `aria-pressed="false"` and then `aria-pressed="true"`, while a button with `pressed` null carries no `aria-pressed`, and axe-core reports 0 violations for both. (L2-066)

### Keyboard and focus

- **AC-21** Given focus on "Send an enquiry" on Pelau House's page, when Marcia presses Enter, then `activated` is emitted once; when she presses Space and releases it, then `activated` is emitted once on key up; when she presses Space, moves focus away with Tab and then releases, then nothing is emitted. (L2-067)
- **AC-22** Given "Send an enquiry" opened the enquiry dialog, when the dialog closes and calls the button's `focus()`, then the inner `<button>` is the active element and its focus ring is visible. (L2-067)
- **AC-23** Given any variant, when it receives keyboard focus, then a `--focus-ring-width` ring in `--color-focus-ring` appears `--focus-ring-offset` outside it with at least 3:1 contrast against the page in both themes, and when it is clicked with a mouse no ring appears. (L2-067)

### Theming

- **AC-24** Given the dark theme, when a primary button renders, then its fill is `--color-action` resolving to `--palette-stone-100`, its label `--color-fg-on-action` resolving to `--palette-stone-950`, and the label contrast is at least 4.5:1. (L2-069)
- **AC-25** Given the dark theme, when "Suspend caterer" renders as a danger button in its confirmation dialog, then its fill resolves to `--palette-sorrel-300` and its label contrast is at least 4.5:1. (L2-069)
- **AC-26** Given a secondary "Cancel" on the page canvas and on a dialog surface, when it renders in each theme, then its `--color-border-strong` edge has at least 3:1 contrast against the surface behind it. (L2-069)

### Responsive

- **AC-27** Given a 320 px viewport, when the small wrapping button "Open food-handler-certificate.pdf · 1.2 MB" renders in the approve-profile dialog, then its label wraps onto more lines, left-aligned, with no text cut off, and the page does not scroll horizontally. (L2-064)
- **AC-28** Given a 1280 px window at 200 % zoom, when the enquiry dialog footer renders, then "Cancel" and "Send enquiry" are fully visible and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-29** Given `prefers-reduced-motion: reduce`, when a button is hovered and pressed, then its colour changes complete without a visible transition and it does not move down, while a busy button's spinner keeps turning. (L2-069)

### Performance

- **AC-30** Given the `Button` perf-test scenario rendering Pelau House's enquiry dialog footer, when Marcia presses "Send enquiry", then the busy state is painted within 200 ms of the press (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/button/`; files
  `button.component.*` (selector `sh-button`) and `button-anchor.component.*`
  (selector `sh-button-anchor`), sharing one class-list helper; class names
  `ButtonComponent` and `ButtonAnchorComponent`.
- Styles: the `.btn` section of `docs/design-system/assets/components.css`
  (including its reduced-motion, forced-colours and phone-target rules) moves
  into the component as its stylesheet. Class names must reach the DOM
  unchanged and unscoped, because parents (`.sheet__footer .btn`,
  `.dialog__footer`) and e2e locators address `.btn` directly.
- Design-system catch-up for D-5: add
  `.btn[aria-busy="true"] { opacity: 1; cursor: progress; }` after the disabled
  rule in `components.css`, so a busy button with `aria-disabled="true"` is not
  dimmed. The rendering shows the required look with a specimen-only style.
- Composes nothing. Composed by [sticky CTA](sticky-cta.md),
  [dialog](dialog.md) and [sheet](sheet.md) footers, [empty
  state](empty-state.md), [error page](error-page.md), [form
  layout](form-layout.md), [inline message](inline-message.md), [alert](alert.md)
  and every page in the inventory.
- [Button group](button-group.md) styles `.btn` by sibling position
  (`.btn-group .btn:first-child`); with the host `display: contents` the inner
  buttons are still the group's flex children, but each is the only child of
  its host, so the group renders its own `.btn` elements rather than nesting
  `sh-button` (D-2).
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host, and how do parent rules for `.btn` keep working?* The host is layout-transparent (`display: contents`) and renders the native element in the light DOM with every class and attribute on it. Parents such as `.sheet__footer .btn { flex: 1 }` and dialog footers then style the real button, forms and `aria-describedby` work without proxying, and e2e locators match the mocks. Structural selectors (`:first-child`) are the only casualty, and button group owns its own markup.
- **D-3** *Does a busy button change its label?* No. Six mocks swap to "Saving…", "Creating account…", "Removing…"; the design system fixed that drift and keeps the label, hiding it visually behind the spinner. The name stays stable for screen readers and the width stays put.
- **D-4** *Does busy use native `disabled`, and does it ignore keyboard activation?* It sets `aria-busy="true"` and `aria-disabled="true"` and never native `disabled` (three mocks add `disabled`, which drops focus to the body). CSS `pointer-events: none` stops only the pointer, so the component also cancels click events while busy, which covers Enter and Space. Some mocks set only `aria-busy`; the component always sets both, as the design system's text requires.
- **D-5** *Is a busy button dimmed?* No. The `.btn[aria-disabled="true"]` rule would dim it to 50 %, but the design system's state matrix draws loading at full opacity and its text says the spinner shows "in the label colour". A dimmed spinner reads as disabled and loses its 3:1 contrast, so busy stays at full opacity; `components.css` catches up (see *Implementation notes*).
- **D-6** *How is a button-styled link disabled?* With `aria-disabled="true"`, keeping `href` and focusability, and cancelling activation, as the filter sheet's "Clear" does while results load. Removing `href` would drop the link role and focus, which surprises keyboard users mid-task.
- **D-7** *Should "soft" disabled (`aria-disabled`, still focusable) be part of the API?* Yes, as `disabledFocusable`. The remove-caterer confirmation needs it ("The button stays off until the name matches"), and a focusable disabled control lets a screen-reader user find it and hear why.
- **D-8** *What is the default `type`?* `button`. A native `<button>` defaults to `submit`, which would make every "Cancel" in a form dialog submit it. Consumers opt into `submit`.
- **D-9** *Can "Show more reviews" be busy?* Yes. The mocks show no loading state for it, but the next 10 reviews load without a page reload (L2-051.4), so the consumer sets `busy` while they load; the button needs nothing extra.
- **D-10** *Is there an `activated` output rather than relying on the native click?* Yes. A single output that is never emitted while busy or disabled-focusable lets consumers avoid re-checking state; the native click is cancelled in those states so ancestor listeners and forms do not see it either.
- **D-11** *Must the component support `<span class="btn">`?* No. Those 123 spans in dialog mocks are a static picture of the page behind the dialog. In the product the real page sits behind the dialog, inert, with real buttons.
- **D-12** *Must the component render `<label class="btn">` for file pickers?* No. The focus ring for those labels comes from `.file-input:focus-visible + .btn` and the disabled look from `.file-input:disabled + .btn`, which belong to [file upload](file-upload.md); that component applies this CRD's classes to its own `<label>`.
- **D-13** *Is the at-most-one-primary and danger-only-in-confirmations rule enforced by the component?* No; it is a content rule checked in review (design system, Overview). A component cannot see the rest of the screen; the caterer page repeats the same "Send an enquiry" action in the main column, the sticky bar and the side panel, which is one action, not two primaries.
