# Form field

| Field | Value |
|---|---|
| Selector | `sh-form-field` |
| Library path | `frontend/projects/components/src/lib/form-field/` |
| Status | planned |
| Traces to | L2-022, L2-024, L2-039, L2-050, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-076, L2-085 |
| Design system | [`form-field.html`](../../design-system/components/form-field.html) |
| Source mocks | [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/enquiry/invalid`](../../mocks/dialogs/enquiry/invalid.html), [`dialogs/enquiry/warning`](../../mocks/dialogs/enquiry/warning.html), [`dialogs/enquiry/busy`](../../mocks/dialogs/enquiry/busy.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/register/invalid`](../../mocks/pages/register/invalid.html), [`pages/profile-details/invalid`](../../mocks/pages/profile-details/invalid.html), [`pages/profile-details/read-only`](../../mocks/pages/profile-details/read-only.html), [`dialogs/review/invalid`](../../mocks/dialogs/review/invalid.html), [`dialogs/decline-enquiry/default`](../../mocks/dialogs/decline-enquiry/default.html), [`dialogs/search/invalid`](../../mocks/dialogs/search/invalid.html), [`pages/admin-audit/default`](../../mocks/pages/admin-audit/default.html) |
| Rendering | [`form-field.html`](form-field.html) |

## Purpose and scope

A form field is the wrapper around every single control Sweet Hand asks
people to fill in: Marcia's event date, guest count and message in the enquiry
to Pelau House, Kendra's business name and description, an operator's reason
for suspending a profile. It gives the control a visible label, says what a
good answer looks like (help), shows at most one message (an error that blocks
or a warning that does not), counts characters on long text, and wires all of
that to the control so a screen reader hears it in the same order on every
form: label, control, message, help, counter.

The field owns the words around the control, never the control itself. The
controls are [text field](text-field.md), [textarea](textarea.md),
[select](select.md), [combobox](combobox.md), [file upload](file-upload.md)
and, for a single consent tick, [checkbox](checkbox.md); each sits in the
field's default slot and reads the field's wiring (id, description ids,
invalid). Groups of checkboxes or radios use a `<fieldset>` and `<legend>`
instead ([checkbox](checkbox.md), [radio group](radio-group.md)); the layout
across fields (stack, pairs, actions, error summary) is
[form layout](form-layout.md).

Out of scope:

- Validation rules and timing: the consumer decides when `error` and
  `warning` are set (on submit, then on input and blur once touched, per the
  forms pattern); the field only renders what it is given.
- The error summary, its focus move and its links ([form layout](form-layout.md)).
- The control's own look and states: border, focus ring, invalid edge,
  read-only fill, disabled ([text field](text-field.md) and siblings).
- The reply box under a thread (`.reply-box`, `.reply-box__label`): it is a
  single-field form owned by [message](message.md); it reuses this CRD's
  `.field__error` and `.field__counter` classes.
- The password "Show" toggle's behaviour: it is a [button](button.md) the
  consumer projects into the `labelAction` slot and wires to the input.
- Loading skeletons for a whole form (`pages/profile-details/loading`): the
  page renders [skeleton](skeleton.md) blocks inside a plain `div.field`
  (D-9).

## Usage

Inventory from `usage_inventory.py docs/mocks field "div|label|span|p"`, a
parse of every `.field` in `docs/mocks/` (378 fields on 164 screens), and a
search for `field__help`, `field__error`, `field__warning`, `field__counter`,
`.optional` and `read-only-value`. Rows that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/enquiry/*` Event date, Guests; `profile-certificate` Issued by, Expiry date; `add-cuisine`, `dish` names; `register` Your name | label + help | text field (date, numeric, text, `lg`) | default, invalid, warning (Guests), busy (control read-only) | dialog (`--color-bg-surface-raised`), canvas |
| `dialogs/enquiry/*` Postal code; `dish` Price guidance; `edit-details` Phone | label + optional marker + help | text field (postal, text, tel) | default, invalid (`dish/invalid`), busy | dialog |
| `dialogs/enquiry/*` Message; `profile-details` Description; `review-response`; `review` Your review; `photo-details` Caption | label + help + counter | textarea | default, invalid with counter, busy | dialog, canvas |
| `dialogs/report` Details; `decline-enquiry` Note to Priya | label + optional + help + counter | textarea | default, invalid (`report/invalid` "Details (needed for “Other”)"), busy | dialog |
| `dialogs/dish` Description; `operator-edit` Description | label (+ optional) + counter, no help | textarea | default, busy | dialog |
| `pages/sign-in/*`, `register`, `forgot-password`, `two-factor`, `register-caterer` | label, no help or help, `lg` control | text field email, text, tel, 6-digit code | default, invalid, busy ("submitting": read-only), locked | canvas (`.auth`) |
| `pages/sign-in`, `register`, `reset-password` Password | label + **label action** "Show" + optional help | text field password `lg`; [button](button.md) link sm toggle | default, invalid, busy | canvas |
| `dialogs/enquiry/*` Event area, Occasion; `operator-edit` Field; `profile-cuisines` Primary area | label (+ help) | select | default, invalid, warning (Event area "This caterer doesn’t list Oshawa…"), disabled while busy (D-6 of [select](select.md)) | dialog, canvas |
| `dialogs/add-operator`, `record-breach`, `change-password`, `delete-account`, `deactivate-operator`, `profile-events`, `profile-certificate` | label only | text field, textarea, date | default, invalid, busy | dialog, canvas |
| Reason boxes (`suspend-caterer`, `remove-caterer`, `moderate-review`, `reinstate-caterer`, `resolve-report`, `open-enquiry`, `operator-edit`, `revert-change`, `request-changes`) | label + help | textarea | default, invalid, busy (read-only) | dialog |
| `pages/admin-audit/*`, `admin-metrics/*` toolbar | label only, in `.toolbar` | select, search text field, date | default, invalid (`admin-metrics/invalid` From) | canvas |
| `dialogs/search/*`, `pages/caterers/*` aside | **hidden label** + help + error / warning | [combobox](combobox.md) | empty, invalid "Enter a valid postal code, like M5V 2T6", out-of-area warning, busy | dialog, canvas |
| `pages/register`, `register-caterer` consent | **no label** (the checkbox labels itself) + error | [checkbox](checkbox.md) with `.consent-summary` | default, invalid "Tick the box to agree to the privacy notice", busy | canvas |
| `pages/profile-certificate` Copy of certificate; `dialogs/photo-details` Replace photo | label (or none) + optional + help | [file upload](file-upload.md) | default, disabled while saving | canvas, dialog |
| `pages/profile-details/read-only`, `suspended` | **read-only value**: plain label above text | "Auntie Bev’s Kitchen"; two-paragraph description | read-only | canvas |
| `pages/profile-details/loading`, `profile-certificate/loading` | skeleton in a `div.field` | [skeleton](skeleton.md) text + rect | loading | canvas |

Not built by this component:

- `<label class="field">` wrappers (279 in the mocks) are drift: they fold the
  help and error into the accessible name. The field is always a `div.field`
  with a sibling `label.field__label` (D-2).
- The reply box (`pages/thread/*`, `dashboard-enquiry/*`) uses
  `.reply-box__label` and is [message](message.md)'s.

## Anatomy

1. **Container** — `div.field`. A column with `--space-1` between parts,
   full width of its column. Never a `<label>`.
2. **Label row (optional)** — `div.cluster.cluster--between` wrapping the
   label and the label action, only when `labelAction` is filled.
3. **Label** — `label.field__label[for]` pointing at the control's id;
   `--text-label`. Wraps, never truncates. With `labelHidden` the same element
   carries `.visually-hidden` instead of `.field__label`. In the read-only
   value variant it is a `span.field__label` (nothing to point at).
4. **Optional marker (optional)** — `span.optional` inside the label, after a
   space: "(optional)". Part of the accessible name.
5. **Label action (optional)** — the projected [button](button.md) (sign-in
   "Show"), end-aligned on the label row.
6. **Control** — the projected control, the field's default slot, `--space-1`
   below the label.
7. **Message (optional)** — one `span.field__error` or `span.field__warning`,
   directly under the control. The glyph (⚠ for error, a ringed "!" for
   warning) is CSS-generated with empty alternative text, so it is not read.
8. **Help (optional)** — `span.field__help`, `--text-body-sm` muted. Stays put
   when a message appears.
9. **Counter (optional)** — `span.field__counter`, caption, end-aligned. When
   help is also present, help and counter share a
   `span.cluster.cluster--between` row that wraps. `data-over` turns it
   `--color-danger-fg` and semibold.
10. **Read-only value (variant)** — `p.read-only-value` (one value) or
    `div.prose.read-only-value` (paragraphs) replacing the control.
11. **Announcer** — `span.visually-hidden[role="status"]`, last child, empty
    until the field announces a warning or an over-limit count.

Host: `sh-form-field` is layout-transparent (`display: contents`) and renders
`div.field` in the light DOM, so `.field-row`, `.toolbar .field` and
`.form` rules apply to it unchanged and `for`/`aria-describedby` id
references reach the control (D-3).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string \| null` | — | yes | The visible label text, from the resource files. `null` only when the slotted control labels itself (a single [checkbox](checkbox.md)); then no label element renders. |
| `controlId` | `string \| null` | `null` | no | The id given to the control and targeted by `for` and by error-summary links (`#date`, `#guests`). `null` generates a unique `sh-field-{n}`. |
| `optionalMarker` | `string \| null` | `null` | no | When set, renders `<span class="optional">` with this text ("(optional)") inside the label after a space. Required fields are unmarked. |
| `labelHidden` | `boolean` | `false` | no | Renders the label with `.visually-hidden` instead of `.field__label`. Only where the context is unmistakable (the area combobox under "Where’s your event?"). |
| `help` | `string \| null` | `null` | no | Renders `span.field__help#{id}-help`. Kept when a message shows, and when the control is disabled or read-only. |
| `error` | `string \| null` | `null` | no | Renders `span.field__error#{id}-error` under the control and makes the field invalid: the control gets `aria-invalid="true"`. Wins over `warning`. |
| `warning` | `string \| null` | `null` | no | Renders `span.field__warning#{id}-warning` when `error` is `null`. Never sets `aria-invalid`. Announced once through the announcer when it appears or changes. |
| `counter` | `string \| null` | `null` | no | The counter text, formatted by the consumer ("35 / 2,000"). Renders `span.field__counter#{id}-count`. |
| `counterOver` | `boolean` | `false` | no | Adds `data-over` to the counter. Ignored when `counter` is `null`. |
| `counterAnnouncement` | `string \| null` | `null` | no | Text announced through the announcer ("143 characters too many") 1,000 ms after the last change while `counterOver` is true; announced again only if the text changes. |
| `readOnlyValue` | `string \| readonly string[] \| null` | `null` | no | Read-only value variant: the label renders as `span.field__label`, the default slot is not rendered, and the value renders as `p.read-only-value` (string) or `div.prose.read-only-value` with one `<p>` per item (array). |

- Boolean inputs accept the bare attribute (`<sh-form-field labelHidden>`).
- Every input whose value is `null` or `false` leaves its element or attribute
  out of the DOM.

### Field context (provided to the slotted control)

The field provides one context object to the control in its default slot. The
control components ([text field](text-field.md), [textarea](textarea.md),
[select](select.md), [combobox](combobox.md), [file upload](file-upload.md),
[checkbox](checkbox.md)) read it and render it on their native element:

| Member | Type | Rule |
|---|---|---|
| `id` | `string` | The control's `id` (`controlId` or the generated one). |
| `describedBy` | `string \| null` | Space-separated ids in this order: message (error or warning), help, counter. `null` when none. The control appends its own ids (an addon unit) after these. |
| `invalid` | `boolean` | `true` while `error` is set; the control renders `aria-invalid="true"`, and removes it when `error` returns to `null`. |

### Outputs

None. The field has no interaction of its own; the control emits value and
focus events.

### Methods

| Method | Rule |
|---|---|
| `focusControl(options?: FocusOptions)` | Focuses the slotted control. The error summary and single-field forms call it to put focus in the field (L2-068). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Exactly one control component | The control. Not rendered with `readOnlyValue`. Declared once. |
| `labelAction` | One [button](button.md) (link variant, small) | Rendered at the end of the label row. Used only by the password "Show" toggle. |

- Translation: `label`, `optionalMarker`, `help`, `error`, `warning`,
  `counter` and `counterAnnouncement` arrive from the consumer, who takes them
  from the resource files (L2-064). The component contains no user-facing
  strings. `readOnlyValue` is data.

## Variants and sizes

| Variant | Trigger | Use for |
|---|---|---|
| Standard | `label` | Every labelled control: "Event date", "Business name", "Reason (sent to Kendra)". |
| Optional | `optionalMarker` | The few optional fields: "Postal code (optional)", "Price guidance (optional)", "Copy of certificate (optional)". |
| With help | `help` | A rule or example: "At least 2 days from today", "Pelau House serves 20–300". |
| With counter | `counter` (and usually `help`) | Long text with a limit: "35 / 2,000". |
| With label action | `labelAction` slot | Password fields with "Show". |
| Hidden label | `labelHidden` | The area combobox, whose question is the dialog title. |
| Self-labelled | `label` `null` | A single consent checkbox. |
| Read-only value | `readOnlyValue` | Values of a locked profile (pending review, suspended). |

These combine freely except: `readOnlyValue` ignores the slot,
`counter`, `error` and `warning`; `labelHidden` ignores `labelAction`.

One size. Label `--text-label`, help and messages `--text-body-sm`, counter
`--text-caption`, gap `--space-1`, whatever the control's size (a `lg` sign-in
email keeps the same label and gap as a `md` toolbar field). Width is always
100 % of the field's column.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Label, control, help (and counter) | Control named by the label; described by help and counter |
| Focus | control `:focus-visible` | Ring on the control, not the field | Label, then description, read on focus |
| Invalid | `error` set | `.field__error` with ⚠ under the control; control takes its invalid edge | Control `aria-invalid="true"`; error id first in `aria-describedby` |
| Warning | `warning` set, `error` null | `.field__warning` with ringed "!" under the control, mango; control edge unchanged | Warning id first in `aria-describedby`; announced once, politely |
| Error and warning | both set | Only the error shows | As invalid; the warning returns when the error clears |
| Over limit | `counterOver` | Counter in `--color-danger-fg`, semibold | `counterAnnouncement` read politely after a 1 s pause |
| Disabled | control `disabled` | Control faded; help stays ("Locked while our team reviews it") | Control out of the tab order; help still described |
| Read-only / busy | control `readonly` | Control sunken; label, help and counter unchanged | Control focusable, value readable |
| Hidden label | `labelHidden` | No visible label; help and messages still visible | Name from the hidden label |
| Read-only value | `readOnlyValue` | Plain label above text in `--text-body-lg` | Text in reading order; nothing focusable |
| Loading | page skeleton (D-9) | [skeleton](skeleton.md) blocks in a `div.field` | Hidden; the page reports busy |

Hover belongs to the control. The field has no `data-state` of its own.

## Markup

```html
<!-- rendered: label + help (enquiry, Event date), default -->
<div class="field">
  <label class="field__label" for="date">Event date</label>
  <input class="input" id="date" name="date" type="date" required min="2026-10-12" max="2028-10-10" aria-describedby="date-help">
  <span class="field__help" id="date-help">At least 2 days from today</span>
  <span class="visually-hidden" role="status"></span>
</div>
```

```html
<!-- rendered: invalid; message directly under the control, then help -->
<div class="field">
  <label class="field__label" for="guests">Guests</label>
  <input class="input" id="guests" name="guests" type="text" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required value="fifty" aria-invalid="true" aria-describedby="guests-error guests-help">
  <span class="field__error" id="guests-error">Enter a whole number of guests from 1 to 5,000</span>
  <span class="field__help" id="guests-help">Pelau House serves 20–300</span>
  <span class="visually-hidden" role="status"></span>
</div>
```

```html
<!-- rendered: warning (never aria-invalid) -->
<div class="field">
  <label class="field__label" for="guests">Guests</label>
  <input class="input" id="guests" name="guests" type="text" inputmode="numeric" value="500" aria-describedby="guests-warning guests-help">
  <span class="field__warning" id="guests-warning">This caterer usually serves 20–300 guests</span>
  <span class="field__help" id="guests-help">Pelau House serves 20–300</span>
  <span class="visually-hidden" role="status">This caterer usually serves 20–300 guests</span>
</div>
```

```html
<!-- rendered: optional marker -->
<div class="field">
  <label class="field__label" for="postal">Postal code <span class="optional">(optional)</span></label>
  <input class="input" id="postal" name="postal" type="text" autocomplete="postal-code" autocapitalize="characters" maxlength="7" aria-describedby="postal-help">
  <span class="field__help" id="postal-help">We keep only the first 3 characters</span>
  <span class="visually-hidden" role="status"></span>
</div>
```

```html
<!-- rendered: help + counter, invalid; counter over the limit -->
<div class="field">
  <label class="field__label" for="message">Message</label>
  <textarea class="textarea" id="message" name="message" rows="5" required aria-invalid="true" aria-describedby="message-error message-help message-count">…</textarea>
  <span class="field__error" id="message-error">Keep your message under 2,000 characters</span>
  <span class="cluster cluster--between">
    <span class="field__help" id="message-help">What you’d like to eat, serving style, timing</span>
    <span class="field__counter" id="message-count" data-over>2,143 / 2,000</span>
  </span>
  <span class="visually-hidden" role="status">143 characters too many</span>
</div>
```

A counter without help (dish Description) renders `span.field__counter`
directly after the control, with no cluster.

```html
<!-- rendered: label action (sign-in password) -->
<div class="field">
  <div class="cluster cluster--between">
    <label class="field__label" for="password">Password</label>
    <button class="btn btn--link btn--sm" type="button" aria-pressed="false" aria-controls="password">Show</button>
  </div>
  <input class="input input--lg" id="password" name="password" type="password" autocomplete="current-password" required minlength="12" maxlength="128">
  <span class="visually-hidden" role="status"></span>
</div>
```

```html
<!-- rendered: hidden label (area combobox) with error -->
<div class="field">
  <label class="visually-hidden" for="q">Area or postal code</label>
  <div class="search-field">…<input class="input" id="q" type="search" role="combobox" aria-invalid="true" aria-describedby="q-error q-help" …></div>
  <span class="field__error" id="q-error">Enter a valid postal code, like M5V 2T6</span>
  <span class="field__help" id="q-help">An area like Scarborough, or a postal code like M1B 2K3.</span>
  <span class="visually-hidden" role="status"></span>
</div>
```

```html
<!-- rendered: self-labelled consent checkbox with error -->
<div class="field">
  <label class="choice"><input id="consent" name="consent" type="checkbox" required aria-invalid="true" aria-describedby="consent-error consent-summary"><span class="choice__text"><span>I agree to the <a href="/privacy">privacy notice</a></span></span></label>
  <p class="consent-summary" id="consent-summary">We use your name and email to run your account…</p>
  <span class="field__error" id="consent-error">Tick the box to agree to the privacy notice</span>
  <span class="visually-hidden" role="status"></span>
</div>
```

The consent summary belongs to [checkbox](checkbox.md); with a self-labelled
control the message follows the control's own block.

```html
<!-- rendered: read-only value, one value and paragraphs -->
<div class="field"><span class="field__label">Business name</span><p class="read-only-value">Auntie Bev’s Kitchen</p></div>
<div class="field"><span class="field__label">Description</span><div class="prose read-only-value"><p>Beverley Campbell has cooked Sunday dinner…</p><p>She caters christenings, nine-nights…</p></div></div>
```

Consumer templates (binding syntax illustrative; strings come from the
resource files):

```html
<!-- consumer: enquiry guest count with error or fit warning -->
<sh-form-field controlId="guests" [label]="t('enquiry.guests')" [help]="t('enquiry.guestsHelp', range)" [error]="guestsError()" [warning]="guestsWarning()">
  <sh-text-field name="guests" inputmode="numeric" pattern="[0-9]*" autocomplete="off" required [(value)]="guests" />
</sh-form-field>

<!-- consumer: message with counter -->
<sh-form-field controlId="message" [label]="t('enquiry.message')" [help]="t('enquiry.messageHelp')" [error]="messageError()"
  [counter]="t('form.counter', { count, max: 2000 })" [counterOver]="count() > 2000" [counterAnnouncement]="t('form.tooMany', { over })">
  <sh-textarea name="message" rows="5" required [(value)]="message" />
</sh-form-field>

<!-- consumer: password with Show -->
<sh-form-field controlId="password" [label]="t('auth.password')">
  <sh-button labelAction variant="link" size="sm" [pressed]="shown()" controls="password" (activated)="toggle()">{{ t('auth.show') }}</sh-button>
  <sh-text-field type="password" size="lg" autocomplete="current-password" [revealed]="shown()" required />
</sh-form-field>

<!-- consumer: locked profile -->
<sh-form-field [label]="t('profile.businessName')" [readOnlyValue]="profile.name" />
```

The e2e page objects find a field by its label text and read the control's
`aria-describedby` targets, so the classes, the element order and the
description order are part of the contract. The announcer's position is free
to change; its `role="status"` is not.

## Design

- Gap between parts `--space-1`; between help and counter `--space-3`
  minimum (`.cluster`); the cluster wraps, so the counter drops under long help,
  end-aligned. No margins on help or message.
- Label `--text-label` in `--color-fg-default`, `display: flex` with
  `--space-1` gap so the optional marker sits after the text. Optional marker
  `--color-fg-subtle`, `--font-weight-regular`.
- Help and messages `--text-body-sm`; error `--color-danger-fg` with the
  CSS glyph and `--space-1` gap; warning `--color-warning-fg` with an
  18 px ringed "!" (`--border-width-thick`, `--text-caption`,
  `--font-weight-bold`) and `--space-2` gap.
- Counter `--text-caption` in `--color-fg-subtle`, right-aligned; over the
  limit `--color-danger-fg` and `--font-weight-semibold`.
- Read-only value `--text-body-lg` with `--space-2` block padding.
- Long words (email addresses in help) break with `overflow-wrap: anywhere` on the label, help and messages (D-12).
- Motion: none. Messages appear and disappear without animation.
- Layer: none.

The field declares no component tokens; the control's `--field-bg`,
`--field-border` and `--field-fg` belong to [text field](text-field.md).

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Label, read-only value | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Help | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Optional marker, counter | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Error, over-limit counter | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Warning | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Label on a page |
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Label in a dialog |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Help on a page |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Help in a dialog |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Optional marker and counter on a page |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Optional marker and counter in a dialog |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Error on a page |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Error in a dialog |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | Warning on a page |
| `--color-warning-fg` | `--color-bg-surface-raised` | 4.5:1 | Warning in a dialog |

Errors and warnings never rely on colour: each has its glyph and words, and
the invalid control has a doubled edge (L2-069). `prefers-contrast: more`
lifts muted and subtle text a step through the tokens; forced colours render
all field text in `CanvasText` and keep the glyphs.

## Responsive behaviour

- The field is always the full width of its column; it has no breakpoint
  rules of its own. Pairs (`.field-row`, from 36rem) and the toolbar's
  `min-width: 10rem` are [form layout](form-layout.md)'s.
- Label, help and messages wrap; nothing truncates. At 320 px a long help
  line takes the whole row and the counter wraps beneath it, end-aligned.
- At 200 % zoom at 1280 px every part stays visible in reading order with no
  horizontal scrolling.
- The label is part of the control's touch target: tapping it focuses the
  control (native `for`). Controls themselves are at least 44 px tall below
  48rem (L2-065).

## Accessibility

### Role and pattern

Native labelling, per the [W3C forms tutorial](https://www.w3.org/WAI/tutorials/forms/):
`<label for>` pointing at the control's `id`, `aria-describedby` on the control
listing message, help and counter ids in that order, `aria-invalid="true"` on
the control while `error` is set. Required fields use the control's `required`;
there are no asterisks. The field itself has no role.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the control. The label, help, message, counter and read-only value are not tab stops. |
| Click or tap on the label | Focuses the control. |
| <kbd>Enter</kbd> on an error-summary link | The summary calls `focusControl()`; focus lands on the control, which reads its label, error and help. |

### Focus

- The focus ring belongs to the control. The field never takes focus.
- The field never moves focus on its own: not when an error or warning
  appears, not when the counter goes over.

### Labelling

- The label is a sibling of the control, never its parent, so the name is
  exactly the label text ("Postal code (optional)") and the help and error are
  read once, as the description (D-2).
- With `labelHidden` the name still comes from a real `<label for>`.
- The error and warning glyphs are generated with empty alternative text
  (`content: "⚠\FE0E" / ""`), so screen readers read only the words.
- A read-only value has no programmatic relationship to its label; the label
  text precedes it in reading order (`aria-labelledby` is not allowed on a
  `<p>`).

### Announcements

- One polite announcer per field (`span.visually-hidden[role="status"]`,
  present from first render so insertions are announced).
- It announces the warning text once when it appears or changes, so Marcia
  hears "This caterer usually serves 20–300 guests" after leaving the Guests
  field (L2-024).
- It announces `counterAnnouncement` once typing pauses for 1,000 ms past the
  limit, never on every keystroke.
- Errors are not announced by the field: on submit the error summary is
  announced and focused ([form layout](form-layout.md)); single-field forms
  focus the control, which reads its error.

### Motion

None. Messages appear without animation; the control's border transition is
the control's.

## Content and internationalisation

- Labels are short nouns in sentence case, no colon, no asterisk: "Event
  date", "Guests", "Business name", "Name on the certificate".
- "(optional)" marks the rare optional field; required is unmarked.
- Help gives the rule or an example, matching the real rule: "At least 2 days
  from today", "50–2,000 characters. Leave a blank line between paragraphs."
- Errors say what to do and repeat word for word in the summary: "Enter a
  whole number of guests from 1 to 5,000", "Write at least 50 characters (35
  so far)". Never "Invalid input".
- Warnings say what is unusual without blame: "This caterer usually serves
  20–300 guests".
- Counters: "35 / 2,000", thousands separator per `en-CA`; the consumer
  formats them (French "35 / 2 000").
- Translatable inputs: `label`, `optionalMarker`, `help`, `error`, `warning`,
  `counter`, `counterAnnouncement`. Data: `readOnlyValue`, names inside
  messages ("Pelau House serves 20–300").
- French runs about 30 % longer; every part wraps and the counter drops
  under the help.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the description id list,
  whether the message is the error or the warning, the help/counter cluster)
  are computed once per input change, not in the template.
- One timer at most: the 1,000 ms counter-announcement debounce, cleared on
  every change and on destroy. No observers or global listeners.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FormField.ts`
  renders the enquiry form's six fields for Pelau House (Event date "Sat 21
  Nov", Guests 120, Event area Scarborough, Postal code, Occasion "Family
  gatherings", Message with "144 / 2,000"), then toggles Guests between 120
  and 500 to show and clear the warning; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `EnquiryDialog`, `ProfileDetails`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: messages add one line under the control and push content
  down only on submit or blur, never while typing; the announcer is visually
  hidden and takes no space.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given the enquiry to Pelau House, when the Event date field renders with `label` "Event date" and `help` "At least 2 days from today", then the DOM is a `div.field` containing `label.field__label[for="date"]`, the date input with `id="date"` and `aria-describedby="date-help"`, then `span.field__help#date-help`, and no `<label>` element wraps the input. (L2-068)
- **AC-2** Given any field with a label, when its control is inspected, then its accessible name equals the visible label text exactly ("Event date"), without the help or error text. (L2-068)
- **AC-3** Given the enquiry's Postal code field with `optionalMarker` "(optional)", when it renders, then the label contains `span.optional` with "(optional)" in `--color-fg-subtle`, and the control's accessible name is "Postal code (optional)". (L2-068)
- **AC-4** Given the enquiry's Message field with help "What you’d like to eat, serving style, timing" and counter "144 / 2,000", when it renders, then help and counter sit in one `span.cluster.cluster--between` row after the control, and the textarea's `aria-describedby` is "message-help message-count". (L2-022)
- **AC-5** Given the sign-in page, when the Password field renders with a "Show" button in its `labelAction` slot, then the label and the button share a `div.cluster.cluster--between` row above the input, and Tab reaches the button before the input, matching the visual reading order. (L2-067)
- **AC-6** Given the search dialog, when the area field renders with `labelHidden`, then the label carries `.visually-hidden` and not `.field__label`, and the combobox's accessible name is "Area or postal code". (L2-068)
- **AC-7** Given Auntie Bev’s Kitchen's profile in `Pending review`, when Business name and Description render with `readOnlyValue`, then each shows `span.field__label` above `p.read-only-value` "Auntie Bev’s Kitchen" and `div.prose.read-only-value` with two paragraphs, and no input, textarea or tab stop is rendered. (L2-039)

### States

- **AC-8** Given Marcia submits the enquiry with Guests "fifty", when the consumer sets `error` "Enter a whole number of guests from 1 to 5,000", then `span.field__error#guests-error` renders directly under the input and before the help, the input has `aria-invalid="true"`, and its `aria-describedby` is "guests-error guests-help". (L2-022)
- **AC-9** Given the Guests field is invalid, when Marcia corrects it to 120 and the consumer sets `error` to null, then the error element is removed, `aria-invalid` is removed from the input, and `aria-describedby` returns to "guests-help". (L2-068)
- **AC-10** Given Pelau House serves 20–300 guests, when Marcia enters 500 and the consumer sets `warning` "This caterer usually serves 20–300 guests", then `span.field__warning` renders under the input, the input has no `aria-invalid`, and the warning id is first in `aria-describedby`. (L2-024)
- **AC-11** Given a field with both `error` and `warning` set, when it renders, then only the error is shown and described; when the error is cleared, then the warning shows again without the consumer setting it twice. (L2-024)
- **AC-12** Given the enquiry's Event area field with the warning "This caterer doesn’t list Oshawa as an area they serve", when the warning first appears, then the field's `role="status"` announcer contains that text exactly once and focus has not moved. (L2-024)
- **AC-13** Given the enquiry's Message with 2,001 characters, when the consumer sets `error` "Keep your message under 2,000 characters", `counter` "2,001 / 2,000" and `counterOver`, then the counter has `data-over` and renders in `--color-danger-fg` at `--font-weight-semibold`. (L2-022)
- **AC-14** Given the Message counter is over the limit with `counterAnnouncement` "143 characters too many", when Marcia types and then pauses, then the announcer receives the text once, 1,000 ms after her last keystroke, and not during typing. (L2-068)
- **AC-15** Given Jean-Robert writes "Great food!!" in his review of Pelau House and submits, when the consumer sets `error` "Write at least 20 characters", then the error sits between the textarea and the help-and-counter row, and the textarea's `aria-describedby` is "text-error text-help text-count". (L2-050)
- **AC-16** Given Marcia registers with a common password, when the field shows `help` "At least 12 characters. Avoid common passwords." and `error` "This password is too common. Choose one that’s harder to guess, at least 12 characters.", then both are visible with the error first, and both are in the input's description. (L2-076)
- **AC-17** Given the registration consent checkbox with `label` null and `error` "Tick the box to agree to the privacy notice", when it renders, then no extra label element is rendered, the checkbox has `aria-invalid="true"`, and the error id is in its `aria-describedby`. (L2-068)
- **AC-18** Given the profile certificate's Certificate number is read-only with help "Locked while our team reviews it", when it renders, then the help is still shown and described. (L2-039)

### Keyboard and focus

- **AC-19** Given the enquiry error summary lists "Enter a whole number of guests from 1 to 5,000", when Marcia activates that link with Enter, then the Guests field's `focusControl()` puts focus on the input, which is the active element. (L2-068)
- **AC-20** Given the enquiry form, when Marcia moves through it with Tab, then only the controls (and the label action, where present) receive focus; label, help, message and counter are never focused. (L2-067)
- **AC-21** Given a 360 px touch viewport, when Marcia taps the "Guests" label, then the Guests input receives focus, so the combined label and control target exceeds 44 × 44 CSS px. (L2-065)

### Screen readers

- **AC-22** Given the enquiry invalid state, when axe-core runs with WCAG 2.1 A and AA rules on the dialog at 360 px and 1280 px, then it reports 0 violations for every form field, and the error glyphs are not part of any accessible description. (L2-066)

### Theming

- **AC-23** Given the light and the dark theme, when the enquiry fields render in the dialog (`--color-bg-surface-raised`) with help, an error and a warning, then help, error and warning text each measure at least 4.5:1 against the dialog surface. (L2-069)
- **AC-24** Given the Guests field invalid and the Event area field warned, when they render, then each message shows its glyph and words, so the state is not given by colour alone. (L2-069)

### Responsive

- **AC-25** Given a 320 px viewport, when the profile Description field renders with help "50–2,000 characters. Leave a blank line between paragraphs." and counter "35 / 2,000", then the help wraps, the counter drops beneath it end-aligned, nothing is clipped, and the page does not scroll horizontally. (L2-064)
- **AC-26** Given the source of `sh-form-field`, when it is scanned for user-facing string literals, then none are found; "(optional)" and every counter text arrive as inputs. (L2-064)

### Performance

- **AC-27** Given the `FormField` perf-test scenario, when Guests changes from 120 to 500 and the warning appears, then the next paint happens within 200 ms (Interaction to Next Paint) and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/form-field/`; files
  `form-field.component.*` (selector `sh-form-field`, class
  `FormFieldComponent`) and `form-field-context.ts` (the context token and
  type the controls inject, `FormFieldContext`).
- Styles: the `.field`, `.field__label`, `.optional`, `.field__help`,
  `.field__counter`, `.field__error`, `.field__warning` and
  `.read-only-value` rules of `docs/design-system/assets/components.css` move
  into the component's stylesheet unscoped, because [form
  layout](form-layout.md)'s `.toolbar .field` and e2e locators address them
  directly. `.cluster`, `.prose` and `.visually-hidden` stay global utilities.
- Design-system catch-up for D-4: the forms pattern page
  (`patterns/forms.html`, *Labels, help and required fields*) says the error
  sits under the help; the form-field page and this CRD put it directly under
  the control. The pattern page's sentence should be corrected.
- Design-system catch-up for D-12: add `overflow-wrap: anywhere` to `.field__label`, `.field__help`, `.field__error` and `.field__warning` in `components.css`; the rendering applies it with a specimen-only style.
- Composes nothing but its slots. Composed by every form: the enquiry
  dialog, auth pages, profile editor, operator dialogs, toolbars.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *`<label class="field">` or `div.field` with a sibling label?* Always `div.field` with `label.field__label[for]`. 279 mock fields wrap the help and error in the label, which reads them as part of the name and again as the description; the design system fixed this drift.
- **D-3** *What is the host?* Layout-transparent (`display: contents`), rendering `div.field` in the light DOM, so `.field-row` grid children, `.toolbar .field` and id references work exactly as in the mocks.
- **D-4** *Where does the message go: under the control or under the help?* Directly under the control, before help and counter, as the form-field page decides (the mocks were split 17/17). The forms pattern page still says "under the help"; the component page is the specific, later decision, so this CRD follows it and the pattern page catches up.
- **D-5** *How do the control and the field share ids?* Through a context the field provides and every control component reads; the consumer sets `controlId` only when an error summary links to it. A projected native element would need the consumer to repeat ids and the description order in every form.
- **D-6** *Who formats the counter and its announcement?* The consumer, from the resource files. The text is a translated pattern with locale-formatted numbers ("35 / 2,000", French "35 / 2 000"), and the consumer already holds the value and the limit for validation. The field only renders the text and announces it.
- **D-7** *How are warnings and the over-limit count announced?* Through one visually hidden polite status per field, present from the first render. The combobox page shows the out-of-area warning "in a polite status" and the form-field page asks for a polite over-limit count; one announcer covers both and avoids a live region that is inserted already filled (often not announced). The 1,000 ms pause is the decision for "once typing pauses".
- **D-8** *How does a locked profile render its values?* As the read-only value variant, plain text under a `span.field__label`, with `div.prose` for a multi-paragraph description (as `profile-details/read-only` shows). The mock's `aria-labelledby` on a `<p>` is not allowed and is dropped.
- **D-9** *Does the field render loading skeletons?* No. The mocks put [skeleton](skeleton.md) blocks inside a plain `div.field` for the whole form while it loads; the page composes that, since there is no control to size yet. The field keeps `.field`'s gap so the skeleton lines up with the final layout.
- **D-10** *Can a field have no label?* Only when the control labels itself: the single consent checkbox (`.choice` with its own `<label>`). Every other control needs `label`; hidden labels use `labelHidden`, never `null`.
- **D-11** *Which element is used for help, message and counter?* `<span>`, as the form-field page's code shows. Several mocks use `<p>`; locators use the classes, and a span keeps the help-and-counter cluster valid inside the field.
- **D-12** *Do long words in a label, help or message break?* Yes, with `overflow-wrap: anywhere`. The form-field page's responsive rules require it ("email addresses in help break"), but `components.css` has no such rule, so a long address would overflow a 320 px column. The rendering shows the required behaviour with a specimen-only style.
