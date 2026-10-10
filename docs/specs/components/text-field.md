# Text field

| Field | Value |
|---|---|
| Selector | `sh-text-field` |
| Library path | `frontend/projects/components/src/lib/text-field/` |
| Status | planned |
| Traces to | L2-022, L2-026, L2-060, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-076, L2-080, L2-085 |
| Design system | [`text-field.html`](../../design-system/components/text-field.html) |
| Source mocks | [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/register/default`](../../mocks/pages/register/default.html), [`pages/register-caterer/default`](../../mocks/pages/register-caterer/default.html), [`pages/two-factor/default`](../../mocks/pages/two-factor/default.html), [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/enquiry/invalid`](../../mocks/dialogs/enquiry/invalid.html), [`dialogs/enquiry/busy`](../../mocks/dialogs/enquiry/busy.html), [`pages/profile-events/default`](../../mocks/pages/profile-events/default.html), [`pages/admin-caterers/default`](../../mocks/pages/admin-caterers/default.html), [`pages/admin-caterers/loading`](../../mocks/pages/admin-caterers/loading.html), [`pages/admin-audit/default`](../../mocks/pages/admin-audit/default.html), [`pages/profile-certificate/default`](../../mocks/pages/profile-certificate/default.html) |
| Rendering | [`text-field.html`](text-field.html) |

## Purpose and scope

A text field takes one short value someone types: Marcia's email when she
signs in, the event date and guest count in her enquiry to Pelau House,
Kendra's business name and certificate number, an operator's search for a
caterer. It is a native `<input>` with the input type, keyboard and autofill
hints that match the data, so phones show the right keyboard and password
managers and autofill work. It sits in a [form field](form-field.md), which
gives it its label, help and message.

Use something else for more than one line ([textarea](textarea.md)), for a
fixed list of answers ([select](select.md) or [radio group](radio-group.md)),
or for the area and postal code search that suggests areas as you type
([combobox](combobox.md)). A value that cannot be edited at all on a locked
profile is the form field's read-only value, not a text field.

Out of scope:

- Label, help, error, warning and counter: [form field](form-field.md).
- Validation and parsing (whole numbers, postal code format, date range), and
  normalising what was typed ("m1b2k3" → "M1B 2K3"): the consumer's form logic,
  which may write a normalised value back on blur.
- The password "Show" toggle button itself: a [button](button.md) in the form
  field's `labelAction` slot; the text field only switches its type while
  `revealed` is true.
- The `<form role="search">` landmark around an operator search and its
  submit: the page's.
- Suggestions while typing: [combobox](combobox.md), which reuses this
  component's `.input` and `.search-field` classes.

## Usage

Inventory from `usage_inventory.py docs/mocks input "input"` and a parse of
every `input.input` in `docs/mocks/` (252 inputs on 139 screens). Rows that
share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/sign-in`, `register`, `register-caterer`, `forgot-password` Email | `type="email"`, `lg`, `autocomplete="email"`, `spellcheck="false"`, required | "marcia.t@example.com" | default, invalid "Enter an email address like name@example.com", busy (read-only), locked | canvas |
| `pages/sign-in`, `register`, `register-caterer`, `reset-password` Password | `type="password"`, `lg`, `current-password` / `new-password`, `minlength="12"`, `maxlength="128"`, `revealed` toggled by "Show" | — | default, revealed, invalid, busy | canvas |
| `dialogs/change-password`, `delete-account` | `type="password"`, md, `current-password` / `new-password` | "Enter your password for marcia.t@example.com" | default, invalid, busy | dialog |
| `pages/register`, `register-caterer` names | text, `lg`, `name` / `organization`, `minlength`, `maxlength` | "Marcia Thompson", "Pelau House" | default, busy | canvas |
| `pages/register-caterer` Phone; `dialogs/edit-details` Phone | `type="tel"`, `inputmode="tel"`, `autocomplete="tel"`, `lg` or md | "+1 416 555 0142" | default, invalid, busy | canvas, dialog |
| `pages/two-factor` 6-digit code | text, `lg`, `inputmode="numeric"`, `autocomplete="one-time-code"`, `pattern`, `maxlength="6"` | — | default, invalid, busy | canvas |
| `dialogs/enquiry/*` Event date; `profile-certificate` Expiry date; `record-breach` Date confirmed | `type="date"`, `min` / `max` | "2026-11-21" (Sat 21 Nov) | default, invalid "Choose a date at least 2 days from today", busy | dialog, canvas |
| `dialogs/enquiry/*` Guests; `profile-events` Smallest / Largest event; `record-breach` People affected | text, `inputmode="numeric"`, `pattern="[0-9]*"`, `autocomplete="off"` | "120", "fifty", "500" | default, invalid, warning, busy | dialog, canvas |
| `dialogs/enquiry/*` Postal code | text, `autocomplete="postal-code"`, `autocapitalize="characters"`, `maxlength="7"` | "L1H 7K4" | default, busy | dialog |
| `pages/profile-details`, `dialogs/dish`, `add-cuisine`, `edit-details`, `add-operator`, `profile-certificate` | text / email, md, `maxlength`, `autocomplete` per data | "Pelau House", "Doubles", "FH-2024-118734" | default, invalid, busy | canvas, dialog |
| `dialogs/remove-caterer`, `deactivate-operator` typed confirmation | text, `autocomplete="off"`, `spellcheck="false"` | "Type Pelau House to confirm" | default, invalid, busy | dialog |
| `pages/admin-audit/*` Target; `admin-metrics` From / To | `type="search"` with placeholder "Name or ID"; `type="date"`; in `.toolbar` | — | default, invalid ("Choose a range of 24 months or less") | canvas |
| `pages/admin-caterers/*`, `admin-reviews/*`, `dialogs/moderate-review` | pill search (`.search-field`, search icon), hidden label, in a `role="search"` form | "Business or owner name", "Caterer or reviewer" | default, disabled while loading | canvas |
| Design system only | compact `.search` with icon; `sm` size; input group with "+1" prefix or "guests" suffix | "Name or ID"; "416 555 0142"; "300" | all | canvas |

Not built by this component:

- The area search (`dialogs/search`, `pages/caterers` aside, `dialogs/filters`,
  `dialogs/filter-menu`): [combobox](combobox.md). Some of those mocks lack
  `role="combobox"`; that is drift the combobox fixes.

## Anatomy

1. **Input** — `input.input`, full width, at least `--control-height-md`
   (44 px), `--radius-md`, hairline edge in `--field-border`, fill
   `--field-bg`, value in `--field-fg` at `--text-body` (16 px).
2. **Placeholder (optional)** — a format hint in `--color-fg-subtle`
   ("Name or ID", "FH-2024-000000"); never the label.
3. **Search wrapper (search variants)** — `div.search` (compact, square-ish)
   or `div.search-field` (52 px pill) positioning a leading
   `svg.icon[aria-hidden="true"]` (magnifier) inside the input's start
   padding.
4. **Input group (optional)** — `div.input-group` joining a leading or
   trailing `span.addon` ("+1", "guests") to the input; inner corners square.

Host: `sh-text-field` is layout-transparent (`display: contents`). The input
(and its wrapper, when present) are rendered in the light DOM, so the form
field's `for`, `aria-describedby` and native form submission reach the real
`<input>` (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `type` | `'text' \| 'email' \| 'password' \| 'tel' \| 'date' \| 'search'` | `'text'` | no | Rendered on the input. No `number`: counts use `text` with `inputmode="numeric"` (D-3). |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | no | Adds `.input--sm` or `.input--lg`; `md` adds no modifier. `sm` only in desktop toolbars. |
| `variant` | `'plain' \| 'search' \| 'search-pill'` | `'plain'` | no | `search` wraps in `div.search` with the magnifier; `search-pill` wraps in `div.search-field` with the magnifier. Both require `type="search"`. |
| `value` | `string` | `''` | no | The value. Two-way with `valueChange`. Set as the DOM property, never as markup, so it shows literally. Dates are ISO `YYYY-MM-DD`. |
| `name` | `string \| null` | `null` | no | Rendered as `name`. |
| `autocomplete` | `string \| null` | `null` | no | Rendered as `autocomplete`: `name`, `email`, `organization`, `tel`, `tel-national`, `postal-code`, `current-password`, `new-password`, `one-time-code`, `off`. |
| `inputmode` | `'numeric' \| 'tel' \| 'email' \| null` | `null` | no | Rendered as `inputmode`. |
| `autocapitalize` | `'characters' \| 'words' \| 'off' \| null` | `null` | no | Rendered as `autocapitalize` (postal codes, certificate numbers: `characters`). |
| `spellcheck` | `boolean \| null` | `null` | no | `false` renders `spellcheck="false"` (emails, typed confirmations). |
| `enterkeyhint` | `'search' \| 'send' \| 'next' \| 'done' \| null` | `null` | no | Rendered as `enterkeyhint`. |
| `pattern` | `string \| null` | `null` | no | Rendered as `pattern` (`[0-9]*` brings up the iOS number pad). |
| `minlength`, `maxlength` | `number \| null` | `null` | no | Rendered as attributes. Never on fields where people may paste past the limit and need to be told by how much. |
| `min`, `max` | `string \| null` | `null` | no | Date bounds, ISO, rendered as attributes ("2026-10-12", "2028-10-10"). |
| `placeholder` | `string \| null` | `null` | no | Format hint only. |
| `required` | `boolean` | `false` | no | Rendered as `required`. The form uses `novalidate`, so no browser bubble shows. |
| `disabled` | `boolean` | `false` | no | Native `disabled`: out of the tab order. Only when the field cannot apply (the operator search while the list loads). |
| `readonly` | `boolean` | `false` | no | Native `readonly`: focusable, selectable, not editable. Forms set it on every field while busy. |
| `autofocus` | `boolean` | `false` | no | Focuses the input once on first render (first field of sign-in and register; the reason in a dialog). |
| `revealed` | `boolean` | `false` | no | With `type="password"`, renders `type="text"` while true; value, caret and focus are kept. Ignored for other types. |
| `invalid` | `boolean \| null` | `null` | no | Standalone use only. `null` follows the form field's context; `true`/`false` override it. Renders `aria-invalid="true"` or nothing. |
| `ariaLabel` | `string \| null` | `null` | no | Rendered as `aria-label` when the input is used without a form field (a compact `.search` in a table header). Never with a form field. |
| `prefix` | `string \| null` | `null` | no | Renders `div.input-group` with a leading `span.addon[aria-hidden="true"]` ("+1"); the value never includes it. |
| `suffix` | `string \| null` | `null` | no | Renders a trailing `span.addon#{id}-unit` ("guests"), appended to `aria-describedby` after the form field's ids. |

- Boolean inputs accept the bare attribute (`<sh-text-field required readonly>`).
- Every attribute whose input is `null` or `false` is absent from the DOM.
- The id, `aria-describedby` and `aria-invalid` come from the [form
  field](form-field.md) context; the text field never invents its own id
  inside a form field.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string` | On every `input` event (typing, paste, autofill, picking a date). Not emitted while `readonly` or `disabled`. |
| `blurred` | `FocusEvent` | The input loses focus. Forms use it to re-validate a touched field and to show fit warnings. |

Enter is not intercepted: it submits the enclosing form natively.

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the input; the form field's `focusControl()` calls it. |
| `select()` | Selects the whole value (used after an invalid typed confirmation). |

### Content slots

None. Every string arrives as an input.

- Translation: `placeholder`, `ariaLabel`, `prefix` and `suffix` come from the
  resource files (L2-064). `value` is data.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Plain | `input.input` | Every typed value: names, email, phone, dates, counts, codes. |
| Compact search | `div.search` + icon + `input.input[type="search"]` | A search in a dense desktop toolbar. |
| Pill search | `div.search-field` + icon + `input.input[type="search"]` | The operator list searches ("Business or owner name", "Caterer or reviewer"). |
| Input group | `div.input-group` + `span.addon` + input | A fixed prefix ("+1") or unit ("guests"). |

Types and hints per data (L2-065):

| Data | `type` | Hints |
|---|---|---|
| Email | `email` | `autocomplete="email"`, `spellcheck="false"` |
| Password | `password` | `current-password` or `new-password`, `minlength="12"`, `maxlength="128"`; paste allowed |
| Phone | `tel` | `inputmode="tel"`, `autocomplete="tel"` |
| Postal code | `text` | `autocomplete="postal-code"`, `autocapitalize="characters"`, `maxlength="7"` |
| Guest count, smallest / largest event, people affected | `text` | `inputmode="numeric"`, `pattern="[0-9]*"`, `autocomplete="off"` |
| One-time code | `text` | `inputmode="numeric"`, `autocomplete="one-time-code"`, `maxlength="6"` |
| Event date, expiry date | `date` | `min`, `max` |
| Search | `search` | `autocomplete="off"`, placeholder as a format hint |

| Size | Modifier | Height | Type |
|---|---|---|---|
| sm | `.input--sm` | `--control-height-sm` (36 px) from 48rem; `--target-comfortable` (44 px) and `--font-size-md` below | `--font-size-sm` |
| md | — | `--control-height-md` (44 px) | `--text-body` |
| lg | `.input--lg` | `--control-height-lg` (52 px) | `--font-size-lg` |

`lg` is for the single-column auth screens (sign-in, register, forgot and
reset password, two-factor). The pill search is always 52 px whatever `size`.
Width is always 100 % of the form field's column.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default / filled | — | `--field-bg` fill, `--field-border` hairline edge | Name from the label |
| Placeholder | empty with `placeholder` | Hint in `--color-fg-subtle` | Not the name |
| Hover | `:hover` | Edge `--color-fg-muted` | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring` flush (offset 0); edge turns `--color-focus-ring` | Focused; label, then description |
| Invalid | `aria-invalid="true"` (from the field's `error`) | Edge `--color-danger-solid`, doubled by a hairline inset shadow; value kept | "invalid entry"; error read first in the description |
| Read-only / busy | `readonly` | Fill `--color-bg-surface-sunken`, strong edge kept | Focusable, "read only", value selectable |
| Disabled | `disabled` | Fill `--color-bg-subtle`, text `--color-fg-disabled`, edge `--color-border-default`, `cursor: not-allowed` | Out of the tab order |
| Revealed password | `revealed` | Characters visible | Type changes to text; "Show" button reports `aria-pressed="true"` |

`data-state="hover|focus|invalid|disabled|read-only"` exists in
`components.css` for documentation and mocks only; the component never
renders it.

## Markup

```html
<!-- rendered: plain, md, in a form field (enquiry, Guests) -->
<input class="input" id="guests" name="guests" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required aria-describedby="guests-help">
```

```html
<!-- rendered: lg email, sign-in -->
<input class="input input--lg" id="email" name="email" type="email" autocomplete="email" spellcheck="false" required autofocus>
```

```html
<!-- rendered: invalid date (aria-invalid from the field's error) -->
<input class="input" id="date" name="date" type="date" min="2026-10-12" max="2028-10-10" required aria-invalid="true" aria-describedby="date-error date-help">
```

```html
<!-- rendered: busy (read-only), postal code -->
<input class="input" id="postal" name="postal" type="text" autocomplete="postal-code" autocapitalize="characters" maxlength="7" readonly aria-describedby="postal-help">
```

```html
<!-- rendered: password, revealed by "Show" -->
<input class="input input--lg" id="password" name="password" type="text" autocomplete="current-password" minlength="12" maxlength="128" required>
```

```html
<!-- rendered: pill search (operator caterer list), disabled while loading -->
<div class="search-field">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <input class="input" id="cat-q" name="q" type="search" placeholder="Business or owner name" autocomplete="off" disabled>
</div>
```

```html
<!-- rendered: compact search without a form field -->
<div class="search">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <input class="input" id="target" type="search" placeholder="Name or ID" aria-label="Target, name or ID">
</div>
```

```html
<!-- rendered: input group, decorative prefix and describing suffix -->
<div class="input-group"><span class="addon" aria-hidden="true">+1</span><input class="input" id="phone" type="tel" inputmode="tel" autocomplete="tel-national" aria-describedby="phone-help"></div>
<div class="input-group"><input class="input" id="max" type="text" inputmode="numeric" aria-describedby="max-unit"><span class="addon" id="max-unit">guests</span></div>
```

Size sm differs only by `.input--sm`.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: enquiry guest count -->
<sh-form-field controlId="guests" [label]="t('enquiry.guests')" [help]="t('enquiry.guestsHelp', caterer)" [error]="guestsError()" [warning]="guestsWarning()">
  <sh-text-field name="guests" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required [readonly]="busy()" [(value)]="guests" (blurred)="touch('guests')" />
</sh-form-field>

<!-- consumer: operator search in its landmark -->
<form role="search" (submit)="search()">
  <sh-form-field controlId="cat-q" [label]="t('admin.searchCaterers')" labelHidden>
    <sh-text-field type="search" variant="search-pill" name="q" autocomplete="off" [placeholder]="t('admin.searchPlaceholder')" [disabled]="loading()" [(value)]="query" />
  </sh-form-field>
</form>
```

The e2e page objects locate inputs by their label and read `type`,
`inputmode`, `autocomplete`, `aria-invalid` and `readonly`; those attributes
and the classes above are the contract. The icon path data is free to change.

## Design

- Height `--control-height-md` (sm `--control-height-sm`, lg
  `--control-height-lg`); padding `--space-2` `--space-3` (sm `--space-1`
  block padding); compact search start padding `--space-10`; pill search start
  padding `--space-4` + `--icon-size-md` + `--space-2`, radius
  `--radius-full`, height `--control-height-lg`.
- Value `--text-body` (16 px at md and lg, so iOS never zooms on focus); sm
  `--font-size-sm` from 48rem, `--font-size-md` below.
- Shape `--radius-md`; edge `--border-width-hairline` in `--field-border`;
  invalid adds a hairline inset shadow in `--color-danger-solid`.
- Search icon `--icon-size-md` in `--color-fg-subtle`, positioned at
  `--space-3` (compact) or `--space-4` (pill), never receives pointer events.
- Addon: `--color-bg-subtle` fill, `--color-border-strong` edge,
  `--color-fg-muted` text at `--text-body-sm`, `--space-3` inline padding.
- Focus ring `--focus-ring-width` in `--color-focus-ring`, offset 0.
- Motion: border colour and shadow transition over `--duration-fast` with
  `--ease-standard`. No shake on error.
- Layer: none.

Component tokens (declared on `.input`, shared with [select](select.md) and
[textarea](textarea.md); a re-skin overrides these):

| Token | Aliases | Overridden by |
|---|---|---|
| `--field-bg` | `--color-bg-surface` | read-only `--color-bg-surface-sunken`, disabled `--color-bg-subtle` |
| `--field-border` | `--color-border-strong` | hover `--color-fg-muted`, focus `--color-focus-ring`, invalid `--color-danger-solid`, disabled `--color-border-default` |
| `--field-fg` | `--color-fg-default` | disabled `--color-fg-disabled` |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Read-only fill | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| Disabled fill, addon fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Value | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Placeholder, search icon | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Hover edge, addon text | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring and edge | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Invalid edge | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Disabled text | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Value |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Placeholder and icon |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Value, read-only |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Edge on a page |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Edge in a dialog |
| `--color-fg-muted` | `--color-bg-surface` | 3:1 | Hover edge |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid edge |
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Addon text |

Disabled inputs are exempt (WCAG 1.4.3, inactive components). Forced
colours: `.input` keeps a `CanvasText` hairline edge and the focus ring
becomes `Highlight` through `--color-focus-ring`; invalid is still told by the
error text and glyph.

## Responsive behaviour

- Below 48rem, `.input--sm` grows to `--target-comfortable` (44 px) and
  `--font-size-md`, so it meets the touch target and iOS does not zoom
  (L2-065). md (44 px) and lg (52 px) are the same at every width.
- The input is always 100 % of its column; pairs (Event date + Guests) are
  [form layout](form-layout.md)'s `.field-row`.
- Date inputs use the platform picker (a wheel on iOS, a calendar on Android
  and desktop); `min` and `max` bound it.
- Input groups never wrap: the addon stays joined. Addons stay a few
  characters so the input keeps room at 320 px.
- In the operator toolbar, search and date fields are at least 10rem and wrap
  to new rows (the toolbar's rule).
- At 320 px nothing scrolls sideways; long values scroll inside the input, as
  native inputs do. At 200 % zoom the input stays usable.
- When the on-screen keyboard opens, the focused input is scrolled into view
  above it (the dialog body scrolls; L2-026).

## Accessibility

### Role and pattern

A native `<input>` with the matching `type`, named by the form field's
`<label for>`. `type="search"` exposes the searchbox role; the landmark is the
consumer's `<form role="search">`. `autocomplete` tokens meet WCAG 1.3.5
(Identify Input Purpose). No `role` attribute is added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into and out of the input. Read-only inputs are tab stops; disabled ones are not. |
| <kbd>Enter</kbd> | Submits the enclosing form (native). |
| <kbd>Esc</kbd> in a search | Clears the value (native); inside a dialog, a second Esc closes the dialog. |
| Paste (<kbd>Ctrl</kbd>/<kbd>Cmd</kbd>+<kbd>V</kbd>) | Always allowed, including passwords and one-time codes (WCAG 3.3.8). |

### Focus

- The ring sits flush on the edge (offset 0) and the edge itself turns
  `--color-focus-ring`, so the indicator is at least 2 px at 3:1 against the
  field and the page.
- Focus never moves on its own while typing. `revealed` keeps focus and the
  caret position.
- `autofocus` focuses only on first render, never on later changes.

### Labelling

- The name is the form field's visible label; standalone search inputs use
  `ariaLabel` or a visually hidden label.
- The placeholder is never the name.
- A prefix addon is `aria-hidden`; a suffix unit is part of the description
  ("Largest event, 300, guests").
- The magnifier is decorative (`aria-hidden="true"`).

### Announcements

None. Errors and warnings are announced by the [form field](form-field.md)
and the error summary.

### Motion

The edge and shadow transition use `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms. Nothing else animates.

## Content and internationalisation

- Placeholders show a format, never the label: "Name or ID", "Business or
  owner name", "FH-2024-000000". Leave them out when the help already shows an
  example.
- Accept what people naturally type: postal codes with or without a space,
  in any case; phone numbers with spaces, dashes or brackets; counts with a
  comma ("1,200"). The consumer normalises; the input never blocks keys.
- Name the unit in the label or a suffix, never in the value ("Largest
  event" + "guests").
- Values are shown exactly as stored: `<img src=x onerror=alert(1)>` typed into
  "Dish name" shows those characters (L2-080).
- Dates are entered with the native picker and stored ISO; they are displayed
  elsewhere as "Sat 21 Nov".
- Translatable inputs: `placeholder`, `ariaLabel`, `prefix`, `suffix`.
  Data: `value`.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the class list, the
  effective `type`, the merged `aria-describedby`) are computed once per input
  change, not in the template. Typing does not re-render the host: the value
  flows out through `valueChange` and is written back only when it differs
  from the DOM value, so the caret never jumps.
- One `input` and one `blur` listener on the input; no timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/TextField.ts`
  renders the sign-in form for Marcia (Email "marcia.t@example.com", Password
  with "Show") and the enquiry's Guests field for Pelau House, typing "120"
  and toggling `readonly`; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `EnquiryDialog`, `SignIn`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: height is fixed by the size; invalid, read-only and
  disabled change only colours, never dimensions.
- Weight: no dependencies beyond the framework; no masking or formatting
  library.

## Acceptance criteria

### Rendering

- **AC-1** Given the enquiry to Pelau House, when the Guests text field renders in its form field, then it is `<input class="input" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required>`, 44 CSS px high, as wide as its column, with `id` and `aria-describedby` from the form field. (L2-065)
- **AC-2** Given the sign-in page, when the Email field renders with `type="email"` and `size="lg"`, then the input has classes `input input--lg`, `autocomplete="email"`, `spellcheck="false"`, and is 52 CSS px high. (L2-065)
- **AC-3** Given Kendra registering Pelau House, when the Phone field renders, then it has `type="tel"`, `inputmode="tel"` and `autocomplete="tel"`. (L2-065)
- **AC-4** Given the enquiry's Postal code field, when it renders, then it has `autocomplete="postal-code"`, `autocapitalize="characters"` and `maxlength="7"`. (L2-065)
- **AC-5** Given a touch device and the enquiry form, when Marcia focuses Guests, then the numeric keypad opens; when she focuses Event date (`type="date"`, `min="2026-10-12"`, `max="2028-10-10"`), then the native date picker opens bounded to those dates. (L2-026)
- **AC-6** Given the operator caterer list, when the pill search renders with `variant="search-pill"`, then the DOM is `div.search-field` containing an `svg.icon[aria-hidden="true"]` and `input.input[type="search"]` with placeholder "Business or owner name", the input is 52 CSS px high with `--radius-full`, and its name is "Search caterers by business or owner name". (L2-068)
- **AC-7** Given the audit log toolbar, when Target renders with `type="search"` and placeholder "Name or ID" and From/To render with `type="date"`, then an operator can type "R-2047" and choose 3 Oct to 10 Oct, and submitting the toolbar sends those values. (L2-060)

### States

- **AC-8** Given Marcia typed "fifty" in Guests and submitted, when the form field sets its error, then the input has `aria-invalid="true"`, a `--color-danger-solid` edge doubled by an inset shadow, and still contains "fifty". (L2-022)
- **AC-9** Given the error on Guests is cleared, when the input re-renders, then `aria-invalid` is absent and the edge returns to `--color-border-strong`. (L2-068)
- **AC-10** Given Marcia presses "Send enquiry" and the form is busy, when the inputs re-render with `readonly`, then each keeps its value, shows the `--color-bg-surface-sunken` fill, stays in the tab order, and typing changes nothing and emits no `valueChange`. (L2-022)
- **AC-11** Given the operator caterer list is loading, when the pill search renders `disabled`, then Tab skips it and it shows the `--color-bg-subtle` fill with `--color-fg-disabled` text. (L2-067)
- **AC-12** Given Marcia types "correct-horse-battery" into the sign-in Password field and the "Show" button sets `revealed`, then the input's `type` becomes `text` with the value, caret position and focus unchanged; when `revealed` is false again, `type` is `password`. (L2-076)
- **AC-13** Given the register Password field with `minlength="12"` and `maxlength="128"`, when Marcia pastes a 20-character password from her password manager, then the paste is accepted and `valueChange` emits the full value. (L2-076)
- **AC-14** Given Kendra types `<img src=x onerror=alert(1)>` as a dish name, when the input re-renders with that value, then the input shows those characters literally and no script runs. (L2-080)
- **AC-15** Given Marcia has typed "120" in Guests on a phone in portrait, when she rotates to landscape and the view re-renders, then the input still contains "120". (L2-064)

### Keyboard and focus

- **AC-16** Given focus on the Email field on the sign-in page, when Marcia presses Enter, then the sign-in form submits; when she presses Tab, then focus moves to the "Show" button and then to Password, in reading order. (L2-067)
- **AC-17** Given any text field, when it receives keyboard focus, then a `--focus-ring-width` ring in `--color-focus-ring` sits flush on its edge and the edge turns `--color-focus-ring`, with at least 3:1 contrast against the field and the page in both themes. (L2-067)

### Screen readers

- **AC-18** Given the enquiry's Largest event in the design-system input group with suffix "guests", when it is inspected, then the suffix addon's id is in the input's `aria-describedby`, and given a "+1" prefix, that addon has `aria-hidden="true"` and is not part of the value. (L2-068)
- **AC-19** Given the sign-in, register and enquiry forms with their text fields in every state (default, invalid, read-only), when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations, and no input is named only by its placeholder. (L2-066)

### Theming

- **AC-20** Given the dark theme, when a filled text field renders on the page, then its value (`--color-fg-default` on `--color-bg-surface`) measures at least 4.5:1 and its `--color-border-strong` edge at least 3:1 against `--color-bg-canvas` and `--color-bg-surface-raised`. (L2-069)
- **AC-21** Given the light and the dark theme, when an invalid input renders, then its `--color-danger-solid` edge measures at least 3:1 against the field fill, and the form field's error text names the problem, so the state is not given by colour alone. (L2-069)

### Responsive

- **AC-22** Given a 360 px viewport, when a `size="sm"` search renders, then it is at least 44 CSS px high with 16 px text; given 1280 px, then it is 36 CSS px high. (L2-065)
- **AC-23** Given a 320 px viewport, when the enquiry's Event date and Guests render, then both inputs fit their column with no horizontal page scroll and no clipped value. (L2-064)

### Motion

- **AC-24** Given `prefers-reduced-motion: reduce`, when a text field gains focus or becomes invalid, then its edge colour and shadow change without a visible transition. (L2-069)

### Performance

- **AC-25** Given the `TextField` perf-test scenario, when Marcia types "120" into Guests, then each keystroke is painted within 200 ms (Interaction to Next Paint), the host does not re-render per keystroke, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/text-field/`; files
  `text-field.component.*` (selector `sh-text-field`, class
  `TextFieldComponent`). It injects the optional `FormFieldContext` from
  [form field](form-field.md).
- Styles: the `.input`, `.input--sm`, `.input--lg`, `.input-group`, `.addon`,
  `.search` and `.search-field` rules (including the phone-target and
  forced-colours rules) move from `components.css` into the component's
  stylesheet unscoped; [select](select.md) and [textarea](textarea.md) share
  the `.input, .select, .textarea` base rule and the `--field-*` tokens, so
  that base lives in one shared stylesheet the three import.
- [Combobox](combobox.md) reuses `.search-field` and `.input` with its own
  pin icon; keep `.search-field` free of search-only assumptions.
- The magnifier SVG is inlined in the template (24 × 24 viewBox, stroked);
  no icon library.
- Composes nothing. Composed by [form field](form-field.md) consumers and
  [combobox](combobox.md) (shares classes only).
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* Layout-transparent (`display: contents`) with the `<input>` and its wrapper in the light DOM, so `label[for]`, `aria-describedby` ids, `form` submission and `.field-row` grid layout work natively.
- **D-3** *Is there a `number` type?* No. The design system rules `type="number"` out (spinners, wheel changes, "fifty" silently dropped), and L2-065.2 asks for `inputmode="numeric"`. The type union leaves it out so it cannot be used by accident.
- **D-4** *Does the pill search render its own `<form role="search">` as the mock does (`form.search-field`)?* No. The text field renders `div.search-field`; the page owns the form, its landmark and its submit, because a component that renders a form cannot be placed inside another form and would own submission it knows nothing about. `.search-field` styles a div and a form identically.
- **D-5** *Where does the hidden label of a pill search go?* In the [form field](form-field.md) with `labelHidden`, before the `.search-field`. The mocks put it inside the wrapper; the name and the `for` link are the same, and the help and messages get their normal place.
- **D-6** *Is the operator caterer search label "Search caterers"?* No: "Search caterers by business or owner name", as the design system corrected, so the name includes what the placeholder says.
- **D-7** *How does "Show" reveal a password?* Through `revealed`, which swaps `type` to `text` and back without re-creating the input, so focus, caret and value survive. The toggle button keeps the label "Show" and reports `aria-pressed`; it lives in the form field's `labelAction` slot.
- **D-8** *Do `sm`, `.input-group` and `.search` belong in the API although no mock uses them?* Yes. The design system keeps them as stable parts of the kit (compact desktop toolbars, the phone prefix, the unit suffix), and leaving them out would force an API change when the first operator toolbar or unit field arrives.
- **D-9** *Can the input be used without a form field?* Only for a compact `.search` in a dense header, with `ariaLabel`. Everywhere else the form field provides the label, and `ariaLabel` must not be set.
- **D-10** *Does the component rewrite the value as people type (postal code case and spacing)?* No. It never changes the value while typing, which would move the caret and fight autofill; the consumer normalises on blur or submit and writes the normalised value back.
