# Icon button

| Field | Value |
|---|---|
| Selector | `sh-icon-button` (renders `<button>`), `sh-icon-button-anchor` (renders `<a href>`) |
| Library path | `frontend/projects/components/src/lib/icon-button/` |
| Status | planned |
| Traces to | L2-016, L2-029, L2-042, L2-043, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`icon-button.html`](../../design-system/components/icon-button.html) |
| Source mocks | [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/caterers/signed-in`](../../mocks/pages/caterers/signed-in.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`dialogs/search/default`](../../mocks/dialogs/search/default.html), [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/suspend-caterer/busy`](../../mocks/dialogs/suspend-caterer/busy.html), [`dialogs/photo-viewer/default`](../../mocks/dialogs/photo-viewer/default.html), [`dialogs/photo-viewer/last`](../../mocks/dialogs/photo-viewer/last.html), [`dialogs/filters/default`](../../mocks/dialogs/filters/default.html), [`dialogs/site-menu/default`](../../mocks/dialogs/site-menu/default.html), [`pages/profile-photos/default`](../../mocks/pages/profile-photos/default.html), [`pages/profile-menu/default`](../../mocks/pages/profile-menu/default.html) |
| Rendering | [`icon-button.html`](icon-button.html) |

## Purpose and scope

An icon button is a 44 px round control that holds one outline icon and no
visible text. Sweet Hand uses it where space is tight and the glyph is
understood without a word: the header's search, inbox and menu icons, the
Close of every dialog and sheet, Previous and Next in the photo viewer, and
the repeated Move, Edit and Remove actions on Kendra's photo and dish rows.
Every icon button still has a name, given by `aria-label`, and may carry an
unread count badge ("Inbox, 1 unread"). `sh-icon-button-anchor` is the same
look on a link that goes somewhere (the phone inbox link).

Use something else when there is room for a word: a [button](button.md) with a
leading icon ("Area or postal code"). The screen's main action is never an
icon button; the thread's "Send reply" is a primary `.btn.btn--icon` from
[button](button.md) because it can be busy. When one trigger offers several
actions, the icon button is the trigger and the list is a [menu](menu.md). A
hover label for mouse users is a [tooltip](tooltip.md) wrapped around the icon
button.

Out of scope:

- What the action does, opening and closing dialogs, sheets and the viewer,
  and returning focus: the [dialog](dialog.md), [sheet](sheet.md) and the
  page own that; the icon button exposes `focus()` for it.
- The spacing between neighbouring icon buttons (`.site-nav`,
  `.edit-row__actions`, `.photo-tile__move`, `.viewer__stage`): the parent
  lays them out (see D-8).
- Computing the unread count and polling for it (L2-029.3): the site header
  passes the number in.
- The count badge's own styling: [badge](badge.md) `.badge--count`; this
  component places it and hides it from assistive technology.
- Busy actions: a busy action is a [button](button.md) (`aria-busy`), never
  an icon button.

## Usage

Inventory from `usage_inventory.py docs/mocks icon-btn "a|button|span"` and a
search of every `class="icon-btn` in `docs/mocks/` (1,723 product
elements on 65 screens). Rows that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Site header on every page (115 screens) | button, ghost, `haspopup="dialog"` | search icon; "Search by area or postal code" | default | canvas header |
| Site header below 48rem (`.site-nav__menu`) | button, ghost, `haspopup="dialog"` | menu icon; "Menu" | default | canvas header |
| `pages/caterers/signed-in` header below 48rem | button, ghost, `haspopup="dialog"`, count 1 | menu icon + badge "1"; "Menu, 1 unread enquiry" | default | canvas header |
| Customer header below 48rem (`inbox`, `thread`) | anchor, ghost, count, `current` | envelope + badge "1"; "Inbox, 1 unread" / "Inbox" | default, current page | canvas header |
| Caterer header below 48rem (`dashboard`, `dashboard-enquiries`, profile editor pages) | anchor, ghost, count | envelope + badge "2"; "Enquiries, 2 unread", "Enquiries, 1 unread", "Enquiries" | default, current page | canvas header |
| Every dialog header (all dialog screens) | button, ghost | close icon; "Close" | default, disabled while the dialog is busy (`suspend-caterer/busy`, `remove-caterer/busy`, `delete-account/busy`…) | dialog (`--color-bg-surface-raised`) |
| `dialogs/filters`, `dialogs/site-menu` (sheets) | button, ghost, focused on open | close icon; "Close filters", "Close menu" | default, focus | sheet |
| `dialogs/photo-viewer/default`, `last`, `failed`, `busy` | button, outline (from `.viewer .icon-btn`), focused on open | chevrons and close; "Previous photo", "Next photo", "Close photo viewer" | default, disabled ("Next photo" on photo 6 of 6) | viewer (canvas) |
| `pages/profile-photos/*`, `dialogs/photo-details`, `remove-photo` (page behind) | button, ghost, pair | up / down arrows; "Move photo 1 up" … "Move photo 6 down" | default, disabled at the ends | canvas, photo tile |
| `pages/profile-menu/*`, `dialogs/dish`, `remove-dish` (page behind) | button, ghost, four per row; Edit and Remove `haspopup="dialog"` | "Move Chicken pelau up", "Move Chicken pelau down", "Edit Chicken pelau", "Remove Chicken pelau" × 18 dishes | default, disabled at the ends | canvas, edit row |
| Design system: row "More actions for Pelau House" | button, ghost or outline, `haspopup="menu"`, `expanded`, `controls` | three-dot icon | expanded false, true | canvas, table row |
| Design system: toggle "Show photo captions" | button, `pressed` | captions icon | pressed false, true | canvas |

Not product markup, and not built by this component:

- `<span class="icon-btn">` copies (22, in `dialogs/filters`, `search`,
  `site-menu`) are the mock's static picture of the header behind an open
  sheet (D-9).
- `.btn--icon` (the thread's "Send reply", `.btn--icon.btn--sm` row squares)
  is [button](button.md).

## Anatomy

1. **Container** — `.icon-btn` on the native `<button type="button">` (or
   `<a href>` for `sh-icon-button-anchor`). A circle (`--radius-full`)
   exactly `--target-comfortable` (44 px) square, transparent at rest,
   `inline-grid` centring its one child, `position: relative` for the badge,
   `flex: none` so it never shrinks.
2. **Outline (variant)** — `.icon-btn--outline` adds a
   `--border-width-hairline` ring in `--color-border-default`. Decorative:
   it shows where the target is next to a large photo.
3. **Icon** — one `svg.icon`, `--icon-size-md` (20 px), stroke
   `--icon-stroke`, `currentColor`, always `aria-hidden="true"`.
4. **Count badge (optional)** — `span.badge.badge--count` from
   [badge](badge.md), pinned to the top-right corner, at least
   `--icon-size-md` square, always `aria-hidden="true"`; the count is in the
   accessible name instead.

Host: `sh-icon-button` and `sh-icon-button-anchor` are layout-transparent
(`display: contents`), like [button](button.md) D-2. Every class and attribute
in *Markup* is on the inner native element, so parent rules
(`.viewer .icon-btn`, `.site-nav__menu`, `.edit-row__actions` flex children)
apply unchanged and [tooltip](tooltip.md)'s `.has-tooltip:focus-within`
works.

## API

### Inputs

Both selectors share these inputs unless the rule says otherwise.

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `ariaLabel` | `string` | — | yes | Rendered as `aria-label`: the accessible name. Names the action and, in repeated rows, the object ("Move photo 3 up", "Edit Chicken pelau"). With a `count` above 0 it includes the count ("Inbox, 1 unread"). |
| `outline` | `boolean` | `false` | no | Adds `.icon-btn--outline`. Inside `.viewer` the ring appears without it. |
| `count` | `number \| null` | `null` | no | A whole number above 0 renders the badge with that number, or "99+" above 99. `0` and `null` render no badge (D-3). |
| `extraClass` | `string \| null` | `null` | no | Extra classes the layout needs on the native element, such as `site-nav__menu`. Never a `.icon-btn--*` modifier. |
| `disabled` | `boolean` | `false` | no | `sh-icon-button` only. Native `disabled`: removed from the tab order, 50 % opacity, no hover fill. Links are never disabled (D-4). |
| `pressed` | `boolean \| null` | `null` | no | `sh-icon-button` only. `null` renders no `aria-pressed`; `true`/`false` render `aria-pressed="true"`/`"false"`. Controlled by the consumer. |
| `expanded` | `boolean \| null` | `null` | no | `sh-icon-button` only. `null` renders no `aria-expanded`; otherwise `"true"`/`"false"`. Required (not null) when `haspopup` is `'menu'`. |
| `controls` | `string \| null` | `null` | no | `sh-icon-button` only. Rendered as `aria-controls`; required with `expanded`. |
| `haspopup` | `'dialog' \| 'menu' \| null` | `null` | no | `sh-icon-button` only. Rendered as `aria-haspopup`. |
| `describedBy` | `string \| null` | `null` | no | Rendered as `aria-describedby`. Set by [tooltip](tooltip.md) when its text adds information ("Close Esc"). |
| `href` | `string` | — | yes (anchor) | `sh-icon-button-anchor` only. |
| `current` | `boolean` | `false` | no | `sh-icon-button-anchor` only. Renders `aria-current="page"`: the glyph turns `--color-fg-accent`. |

- Boolean inputs accept the bare attribute (`<sh-icon-button outline>`).
- Every attribute whose input is `null` or `false` is absent from the DOM
  (except `pressed`/`expanded` `false`, which render `"false"`).
- `type="button"` is always rendered on `sh-icon-button`; an icon button never
  submits a form (D-5).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `activated` | `MouseEvent` (the native click; keyboard activation arrives as a click) | The user activates the control by click, tap, <kbd>Enter</kbd> or (button only) <kbd>Space</kbd> and it is not disabled. On the anchor, navigation then follows unless the consumer prevents it. |

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the inner native element. Dialogs, sheets, the viewer and [menu](menu.md) call it to return focus to the icon button that opened them (L2-067.4). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Exactly one `svg.icon` | The glyph. The component adds `aria-hidden="true"` if missing. Text in the slot is not allowed: the name is `ariaLabel`. Declared once. |

- Translation: `ariaLabel` arrives from the consumer, who takes it from the
  resource files and formats the count into it (L2-064.4). The component
  contains no user-facing words; the overflow "99+" is a numeral formatted
  with the page locale.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Ghost | — (base `.icon-btn`) | The default: header icons, dialog Close, row and tile actions. No border, no fill at rest. |
| Outline | `.icon-btn--outline` | Next to a large photo, where the ring shows the target: the photo viewer's Previous, Next and Close (applied there by `.viewer .icon-btn`). |
| With count | ghost + `.badge--count` child | The unread count on the phone inbox link and the phone menu button. |
| As a link | `<a class="icon-btn">` | Goes somewhere instead of doing something: the phone inbox link. |

One size: 44 × 44 CSS px (`--target-comfortable`) with a 20 px icon
(`--icon-size-md`) at every width. A denser square on a desktop row is
`.btn.btn--icon.btn--sm` from [button](button.md), not this component.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Transparent; glyph `--color-fg-default` | Role button (link for the anchor); name from `aria-label` |
| Hover | `:hover` | Fill `--color-bg-subtle` | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out, following the circle | Focused; name announced |
| Active | `:active` | Fill `--color-bg-subtle-hover`; nothing moves | — |
| Disabled | `disabled` → native `disabled` | 50 % opacity, `cursor: not-allowed`, no fill on hover | Removed from the tab order; announced as unavailable by virtual cursor |
| Pressed | `pressed` true → `aria-pressed="true"` | Fill `--color-bg-subtle` kept; glyph `--color-fg-accent` | Announced as toggle, pressed |
| Not pressed | `pressed` false → `aria-pressed="false"` | As default | Announced as toggle, not pressed |
| Expanded | `expanded` true → `aria-expanded="true"` | Fill `--color-bg-subtle` kept while the menu or popover is open | Announced as expanded; `aria-controls` names the popup |
| Current page | `current` → `aria-current="page"` | Glyph `--color-fg-accent` | "Current page" announced |
| With count | `count` > 0 | Badge top right: `--color-danger-solid` fill, `--color-fg-on-danger` figures | Badge hidden; the count is in the name |
| On a raised surface | inside `.dialog`, `.sheet` | Same tokens; glyph and ring keep 3:1 against `--color-bg-surface-raised` | — |
| In the viewer | inside `.viewer` | Outline ring added | — |

There is no busy state (design system, States). `data-state="hover|focus|active|disabled"`
exists in `components.css` only for documentation and mocks; the component
never renders it.

## Markup

```html
<!-- rendered: ghost, opens a dialog (header search) -->
<button class="icon-btn" type="button" aria-label="Search by area or postal code" aria-haspopup="dialog"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/></svg></button>
```

```html
<!-- rendered: dialog Close; disabled while the dialog is busy -->
<button class="icon-btn" type="button" aria-label="Close"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
<button class="icon-btn" type="button" aria-label="Close" disabled><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
```

```html
<!-- rendered: sh-icon-button-anchor with count, current page, extra layout class -->
<a class="icon-btn site-nav__menu" href="/inbox" aria-label="Inbox, 1 unread" aria-current="page"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="badge badge--count" aria-hidden="true">1</span></a>
```

```html
<!-- rendered: button with count (phone menu, signed-in customer) -->
<button class="icon-btn site-nav__menu" type="button" aria-label="Menu, 1 unread enquiry" aria-haspopup="dialog"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="badge badge--count" aria-hidden="true">1</span></button>
```

```html
<!-- rendered: outline (viewer), last photo -->
<button class="icon-btn icon-btn--outline" type="button" aria-label="Next photo" disabled><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
```

```html
<!-- rendered: row actions naming the object -->
<button class="icon-btn" type="button" aria-label="Move Chicken pelau up" disabled>…</button>
<button class="icon-btn" type="button" aria-label="Move Chicken pelau down">…</button>
<button class="icon-btn" type="button" aria-label="Edit Chicken pelau" aria-haspopup="dialog">…</button>
<button class="icon-btn" type="button" aria-label="Remove Chicken pelau" aria-haspopup="dialog">…</button>
```

```html
<!-- rendered: menu trigger, open; toggle, pressed -->
<button class="icon-btn" type="button" aria-label="More actions for Pelau House" aria-haspopup="menu" aria-expanded="true" aria-controls="caterer-actions">…</button>
<button class="icon-btn" type="button" aria-label="Show photo captions" aria-pressed="true">…</button>
```

```html
<!-- rendered: over 99 unread -->
<a class="icon-btn" href="/dashboard/enquiries" aria-label="Enquiries, 120 unread"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="badge badge--count" aria-hidden="true">99+</span></a>
```

Consumer templates (binding syntax illustrative; names come from the
resource files):

```html
<!-- consumer: dialog Close, off while the dialog is busy -->
<sh-icon-button [ariaLabel]="t('common.close')" [disabled]="busy()" (activated)="close()"><svg class="icon" …></svg></sh-icon-button>

<!-- consumer: phone inbox link with count -->
<sh-icon-button-anchor extraClass="site-nav__menu" href="/inbox" [current]="onInbox()" [count]="unread()" [ariaLabel]="t('header.inbox', { count: unread() })"><svg class="icon" …></svg></sh-icon-button-anchor>

<!-- consumer: move arrows in the photo manager -->
<sh-icon-button [ariaLabel]="t('photos.moveUp', { n: i + 1 })" [disabled]="i === 0" (activated)="moveUp(i)"><svg class="icon" …></svg></sh-icon-button>
```

The e2e page objects locate icon buttons by role and name and by these
classes and attributes, so the class list, `type="button"`, the ARIA
attributes and the `aria-hidden` badge are part of the contract. Icon path
data is free to change.

## Design

- Size `--target-comfortable` square; radius `--radius-full`; padding 0.
- Icon `--icon-size-md`, stroke `--icon-stroke`, `currentColor`.
- Outline ring `--border-width-hairline` in `--color-border-default`.
- Badge: [badge](badge.md) `.badge--count` at `top: 0; right: 0`, minimum
  `--icon-size-md` high and wide.
- Focus ring `--focus-ring-width` solid `--color-focus-ring`, offset
  `--focus-ring-offset`; the circle keeps `--radius-full` so the ring is round.
- Motion: only `background-color` transitions, over `--duration-fast` with
  `--ease-standard`. Nothing moves or scales.
- Layer: none; the badge is positioned inside the container.

The icon button has no component tokens. A context re-skins it by setting
`color` on a container (the glyph follows), never by editing `.icon-btn`.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Glyph | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Hover, pressed, expanded fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Active fill | `--color-bg-subtle-hover` | `--palette-stone-200` | `--palette-stone-700` |
| Outline ring | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Pressed and current glyph | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Badge fill | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Badge figures | `--color-fg-on-danger` | `--palette-white` | `--palette-sorrel-950` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 3:1 | Glyph on the page |
| `--color-fg-default` | `--color-bg-subtle` | 3:1 | Glyph on hover, pressed or expanded fill |
| `--color-fg-default` | `--color-bg-subtle-hover` | 3:1 | Glyph on active fill |
| `--color-fg-default` | `--color-bg-surface-raised` | 3:1 | Glyph in a dialog, sheet or viewer |
| `--color-fg-accent` | `--color-bg-canvas` | 3:1 | Current-page glyph |
| `--color-fg-accent` | `--color-bg-subtle` | 3:1 | Pressed glyph on its fill |
| `--color-fg-on-danger` | `--color-danger-solid` | 4.5:1 | Count figures |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring on the page |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring in a dialog |

The outline ring is decorative (the glyph identifies the control); disabled
icon buttons are exempt (WCAG 1.4.11).

Forced colours: the glyph follows `ButtonText`, the focus ring becomes
`Highlight` through `--color-focus-ring`. Pepper is lost, so a pressed,
expanded or current icon button draws a `--border-width-thick` `Highlight`
border to keep its state visible (D-6).

## Responsive behaviour

- The icon button never changes size: 44 × 44 at every width, so it meets
  L2-065.1 on XS and SM without a phone rule. It never shrinks (`flex: none`);
  if a row cannot fit its icon buttons, the row wraps.
- Below 48rem the site header shows the `.site-nav__menu` icon buttons (inbox
  link with count, Menu) and hides the text links; from 48rem they hide. The
  `.site-nav__menu` class is passed through `extraClass`; the visibility rule
  belongs to [site header](site-header.md).
- At 320 px the header row (wordmark, search, inbox, menu) fits with no
  horizontal scroll; at 200 % zoom on a 1280 px window every icon button stays
  visible and operable.
- Nothing depends on hover: no hover-only reveal on rows or tiles.

## Accessibility

### Role and pattern

`sh-icon-button` renders a native `<button type="button">`
([APG Button](https://www.w3.org/WAI/ARIA/apg/patterns/button/)); with
`pressed` it is a toggle button; with `haspopup="menu"` and `expanded` it is
the trigger of an [APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/).
`sh-icon-button-anchor` renders `<a href>` and keeps the link role. No `role`
attribute is ever added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the icon button in DOM order (header: search, inbox, menu). Disabled icon buttons are skipped. |
| <kbd>Enter</kbd> | Activates the button or follows the link. |
| <kbd>Space</kbd> | Activates the button on key up; on the anchor it scrolls the page, as on any link. |
| <kbd>Esc</kbd> | No effect on the icon button; the dialog, sheet, viewer or menu it opened closes and calls `focus()`. |

### Focus

- The ring shows on `:focus-visible` only and follows the circle.
- `focus()` focuses the inner element, so "Escape or Close returns focus to
  the search icon" (L2-067.4).
- When a dialog sets Close `disabled` while busy and Close had focus, the
  dialog moves focus to its busy button first; the icon button does not manage
  that.

### Labelling

- `ariaLabel` is the only name; there is no visible text and no `title`.
- Names are verb phrases naming the object in repeated rows: "Move photo 3
  up", "Edit Chicken pelau", "Remove Curry goat". Inside a named dialog
  "Close" is enough; the viewer says "Close photo viewer".
- The count goes in the name ("Inbox, 1 unread"); the badge is `aria-hidden`.
- The name does not change when pressed.

### Announcements

None. The component has no live region; state changes are attributes.

### Motion

Only the background colour transitions, over `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms. Nothing moves.

## Content and internationalisation

- Names are verb phrases in sentence case, Canadian English: "Search by area
  or postal code", "Close photo viewer", "Previous photo", "Move photo 2 down".
- Dish names are spelled as the caterer spells them ("Remove Curry channa and
  aloo"); they are data, not translated.
- Counts read noun, comma, number, state: "Inbox, 1 unread", "Enquiries, 2
  unread". Over 99 the badge shows "99+"; the name keeps the real number.
- One icon, one meaning: pin for area, envelope for inbox and enquiries, two
  lines for the site menu, magnifier for search only.
- Translatable inputs: `ariaLabel`. Data inside it: dish names, photo numbers,
  counts. French names run about 30 % longer; that changes nothing visible.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the class list, the badge
  text) are computed once per input change, not in the template.
- No timers, observers or global listeners; one click listener on the inner
  element.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/IconButton.ts`
  renders Kendra's menu manager rows for Pelau House (18 dishes × Move up,
  Move down, Edit, Remove = 72 icon buttons, first and last arrows disabled)
  and the phone header with "Enquiries, 2 unread"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `SiteHeader`, `PhotoViewer`, `MenuManager`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: fixed 44 px box; the badge is absolutely positioned, so
  it appearing or changing never shifts the header.
- Weight: no dependencies beyond the framework and [badge](badge.md). It must
  not import an icon library; the icon arrives in the slot.

## Acceptance criteria

### Rendering

- **AC-1** Given `<sh-icon-button>` with `ariaLabel` "Search by area or postal code", `haspopup="dialog"` and the search icon, when it renders at 1280 px, then the DOM is `<button class="icon-btn" type="button" aria-label="Search by area or postal code" aria-haspopup="dialog">` holding one `svg.icon` with `aria-hidden="true"`, and the box measures 44 × 44 CSS px. (L2-065)
- **AC-2** Given Marcia's enquiry dialog to Pelau House, when its Close icon button renders, then its accessible name is exactly "Close", it has no visible text, and axe-core reports 0 violations for the dialog. (L2-068)
- **AC-3** Given Marcia has 1 unread thread and views her inbox at 360 px, when the header's `sh-icon-button-anchor` renders with `count` 1, `current` and `ariaLabel` "Inbox, 1 unread", then it is `<a class="icon-btn site-nav__menu" href="/inbox" aria-label="Inbox, 1 unread" aria-current="page">` with a `.badge.badge--count` child reading "1" that has `aria-hidden="true"`. (L2-029)
- **AC-4** Given Kendra has no unread enquiries, when the phone header renders the enquiries link with `count` 0, then no `.badge` element exists inside it and its name is "Enquiries". (L2-029)
- **AC-5** Given the enquiries link shows "2" for Kendra, when the header passes `count` 1 after she reads Priya Ramdial's thread, then the badge text becomes "1" without a page reload and no other element of the header re-renders. (L2-029)
- **AC-6** Given a caterer with 120 unread enquiries, when the link renders with `count` 120 and `ariaLabel` "Enquiries, 120 unread", then the badge reads "99+" and the accessible name still contains "120". (L2-029)
- **AC-7** Given the photo viewer open on Pelau House's photo 2 of 6, when Previous, Next and Close render, then each has a `--border-width-hairline` ring in `--color-border-default`, and their names are "Previous photo", "Next photo" and "Close photo viewer". (L2-016)
- **AC-8** Given the photo viewer on photo 6 of 6, when "Next photo" renders with `disabled`, then it has the native `disabled` attribute, is drawn at 50 % opacity, and is skipped by Tab. (L2-016)
- **AC-9** Given Pelau House's photo manager with 6 photos, when the move arrows render, then "Move photo 1 up" and "Move photo 6 down" are `disabled` and stay in place, and every other arrow is enabled. (L2-042)
- **AC-10** Given Kendra's menu manager listing 18 dishes, when the row actions render, then every Move, Edit and Remove icon button has a unique accessible name that includes the dish as Kendra spells it ("Edit Chicken pelau", "Remove Curry goat"), and Edit and Remove carry `aria-haspopup="dialog"`. (L2-043)
- **AC-11** Given any icon button, when its slot holds an icon without `aria-hidden`, then the rendered `svg` has `aria-hidden="true"` and the accessible name comes only from `ariaLabel`. (L2-068)

### States

- **AC-12** Given the header search icon button, when it is hovered and then pressed, then its fill is `--color-bg-subtle` and then `--color-bg-subtle-hover`, and the glyph keeps at least 3:1 contrast against each fill. (L2-069)
- **AC-13** Given "Show photo captions" with `pressed` false and then true, when it renders, then it carries `aria-pressed="false"` and then `aria-pressed="true"`, the pressed one keeps the `--color-bg-subtle` fill and draws its glyph in `--color-fg-accent` at 3:1 or more, and an icon button with `pressed` null carries no `aria-pressed`. (L2-069)
- **AC-14** Given "More actions for Pelau House" with `haspopup="menu"`, `controls="caterer-actions"` and `expanded` false, when the consumer opens the menu and sets `expanded` true, then the button reads `aria-expanded="true"` with `aria-controls="caterer-actions"`, keeps the `--color-bg-subtle` fill while open, and axe-core reports 0 violations. (L2-066)
- **AC-15** Given the inbox link on Marcia's inbox page, when it renders with `current`, then its glyph is `--color-fg-accent` with at least 3:1 contrast against the page, and on any other page it has no `aria-current` and an ink glyph. (L2-069)

### Keyboard and focus

- **AC-16** Given focus on "Edit Chicken pelau", when Kendra presses Enter, then `activated` is emitted once; when she presses Space and releases it, then `activated` is emitted once; when a disabled "Move Chicken pelau up" is clicked, then nothing is emitted. (L2-067)
- **AC-17** Given the header search icon button opened the search dialog, when the dialog closes on Esc and calls the icon button's `focus()`, then the inner `<button>` is the active element and its focus ring is visible. (L2-067)
- **AC-18** Given any icon button, when it receives keyboard focus, then a round `--focus-ring-width` ring in `--color-focus-ring` appears `--focus-ring-offset` outside the circle with at least 3:1 contrast against the page or dialog surface in both themes, and a mouse click shows no ring. (L2-067)

### Theming

- **AC-19** Given the dark theme, when the header's search, inbox and menu icon buttons render, then the glyph resolves to `--palette-stone-100` with at least 3:1 contrast against `--color-bg-canvas`, and the hover fill resolves to `--palette-stone-800`. (L2-069)
- **AC-20** Given the dark theme and "Enquiries, 2 unread", when the badge renders, then its fill resolves to `--palette-sorrel-300`, its figures to `--palette-sorrel-950`, and their contrast is at least 4.5:1. (L2-069)

### Responsive

- **AC-21** Given a 320 px viewport and Kendra's dashboard, when the header renders the wordmark, the search icon button, the enquiries link with count 2 and Menu, then all three icon buttons are fully visible at 44 × 44 CSS px and the page does not scroll horizontally. (L2-064)
- **AC-22** Given a 360 px viewport and Pelau House's photo manager, when the move arrows are measured, then every arrow's target is at least 44 × 44 CSS px. (L2-065)
- **AC-23** Given a 1280 px window at 200 % zoom, when Kendra's menu manager renders, then all four row actions for "Chicken pelau" are visible and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-24** Given `prefers-reduced-motion: reduce`, when an icon button is hovered, then its fill changes without a visible transition, and nothing moves or scales. (L2-069)

### Performance

- **AC-25** Given the `IconButton` perf-test scenario rendering 72 row actions for Pelau House's 18 dishes, when Kendra activates "Move Curry goat up", then the next frame is painted within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/icon-button/`; files
  `icon-button.component.*` (selector `sh-icon-button`) and
  `icon-button-anchor.component.*` (selector `sh-icon-button-anchor`),
  sharing one class-list helper; class names `IconButtonComponent` and
  `IconButtonAnchorComponent`.
- Styles: the `.icon-btn` section of `docs/design-system/assets/components.css`
  moves into the component as its stylesheet, unscoped, because parents
  (`.viewer .icon-btn`, `.site-nav__menu`) and e2e locators address
  `.icon-btn` directly.
- Composes [badge](badge.md) (`.badge--count`) for the count. Composed by
  [site header](site-header.md), [dialog](dialog.md), [sheet](sheet.md),
  [gallery](gallery.md) (the viewer), [photo tile](photo-tile.md), the menu
  manager rows, [menu](menu.md) (as a trigger) and [tooltip](tooltip.md) (as
  the anchored control).
- Design-system catch-up for D-6: add to the forced-colours block in
  `components.css`:
  `.icon-btn[aria-pressed="true"], .icon-btn[aria-expanded="true"], .icon-btn[aria-current="page"] { border: var(--border-width-thick) solid Highlight; }`.
  The rendering shows it with a specimen-only style.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Where does the unread count go for assistive technology?* In `ariaLabel`, with the badge `aria-hidden`, as the design system specifies ("Enquiries, 2 unread"). L2-029.1 says the badge's accessible name is "2 unread enquiries"; that matches the wide header's text link, whose visible badge carries `aria-label="2 unread enquiries"` ([site header](site-header.md)). On the phone icon link the badge is hidden and the link's own name carries the count, so the count is announced once. Raised with the user because a literal L2-029.1 test at phone width expects the other wording.
- **D-3** *What does `count` 0 show?* Nothing: no badge, and the consumer drops the count from the name ("Enquiries"), per L2-029.4 and the mocks' `aria-label="Enquiries"`.
- **D-4** *Can the anchor be disabled?* No. The design system says links are never disabled; a link that cannot go anywhere is not rendered.
- **D-5** *Can an icon button submit a form?* No; it always renders `type="button"`. The only icon-only submit ("Send reply") needs a busy state and is `.btn--icon` from [button](button.md).
- **D-6** *How do pressed, expanded and current show in forced colours?* With a thick `Highlight` border. Their only cue besides the fill is pepper, which forced colours remove, and WCAG 1.4.11 requires the state to stay perceivable; `components.css` catches up.
- **D-7** *What does the badge show above 99?* "99+", with the real number in the name (design system, Content). The badge then stays within the 44 px box at 320 px.
- **D-8** *Who owns the 8 px gap L2-065.1 asks for between neighbouring targets?* The parent layout, not the icon button, which sets no margin. The design system draws `.site-nav` and `.edit-row__actions`/`.photo-tile__move` at a 4 px gap and calls it compliant under WCAG 2.5.8, but L2-065.1 asks for 8 px on XS and SM. This CRD keeps the 44 px target and leaves the gap to [site header](site-header.md) and the row layouts; raised with the user as a conflict between L2-065.1 and the design system.
- **D-9** *Must the component render `<span class="icon-btn">`?* No. Those 22 spans are the static picture of the header behind an open sheet; the product renders the real, inert header there.
- **D-10** *Is `extraClass` needed?* Yes. The header's phone-only icon buttons carry `.site-nav__menu` on the same element as `.icon-btn` in 395 mock instances, and with a layout-transparent host that class must reach the native element.
- **D-11** *How does a mouse user learn what a row icon means?* Through an optional [tooltip](tooltip.md) wrapped around the icon button, which sets `describedBy` only when its text adds information. The icon button needs no tooltip input of its own.
