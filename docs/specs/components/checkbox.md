# Checkbox

| Field | Value |
|---|---|
| Selector | `sh-checkbox` (one row: renders `<label class="choice">`), `sh-checkbox-group` (renders the `<fieldset>` around related rows) |
| Library path | `frontend/projects/components/src/lib/checkbox/` |
| Status | planned |
| Traces to | L2-007, L2-008, L2-009, L2-010, L2-017, L2-021, L2-037, L2-042, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-070, L2-076, L2-085 |
| Design system | [`checkbox.html`](../../design-system/components/checkbox.html) |
| Source mocks | [`pages/profile-cuisines/default`](../../mocks/pages/profile-cuisines/default.html), [`pages/profile-cuisines/invalid`](../../mocks/pages/profile-cuisines/invalid.html), [`pages/profile-events/invalid`](../../mocks/pages/profile-events/invalid.html), [`dialogs/dish/edit`](../../mocks/dialogs/dish/edit.html), [`dialogs/filters/default`](../../mocks/dialogs/filters/default.html), [`dialogs/filter-menu/default`](../../mocks/dialogs/filter-menu/default.html), [`dialogs/filter-menu/area`](../../mocks/dialogs/filter-menu/area.html), [`pages/register/invalid`](../../mocks/pages/register/invalid.html), [`pages/register-caterer/invalid`](../../mocks/pages/register-caterer/invalid.html), [`dialogs/photo-details/default`](../../mocks/dialogs/photo-details/default.html), [`dialogs/moderate-review/remove`](../../mocks/dialogs/moderate-review/remove.html), [`dialogs/record-breach/default`](../../mocks/dialogs/record-breach/default.html), [`pages/sign-in/challenge`](../../mocks/pages/sign-in/challenge.html) |
| Rendering | [`checkbox.html`](checkbox.html) |

## Purpose and scope

A checkbox lets someone pick any number of options on Sweet Hand: the islands
and traditions Pelau House cooks from, the areas Kendra serves, the occasions
she takes on, the dietary tags on "Paw paw chow", the cuisines a visitor
filters by on a phone. A single checkbox records one agreement before a form
can be sent: "I agree to the privacy notice", "I understand this review can't
be restored". Each box is independent; the whole row (box, label and
description) is one target, and a checked box fills with pepper red, the
brand's one meaning for "selected". `sh-checkbox-group` puts related rows in a
`<fieldset>` with a legend, help, a group error and the option grid, and runs
the "All of Durham" parent that is mixed when only some areas are ticked.

Use something else when exactly one option must be chosen ([radio
group](radio-group.md)), when a setting takes effect the moment it changes
with no Save ([switch](switch.md)), for the listing's large-screen cuisine and
area filters ([filter list](filter-list.md)), when the list is too long to
scan ([combobox](combobox.md)), or for a read-only "done / not done" list
([checklist](checklist.md)).

Out of scope:

- Form submission, autosave ("Saving…" / "Saved") and server validation: the
  page owns the form and tells the component which rows are invalid and what
  the group error says.
- The error summary at the top of a form (`.form-summary`) and moving focus to
  it: [form layout](form-layout.md). The checkbox only exposes `inputId` so a
  summary link can reach a box.
- The phone filter sheet, the tablet filter dropdown and their "Show 2 caterers" /
  "Clear" buttons: [sheet](sheet.md) and [filter trigger](filter-trigger.md)
  host checkbox groups; result counts and their live announcement belong to
  the page.
- Choosing the primary cuisine or area (radios and a select beside the
  checkboxes): [radio group](radio-group.md), [select](select.md).
- The bot-protection challenge itself; the checkbox is only its visible
  "I'm a person, not a bot" row.

## Usage

Inventory from a search of every `type="checkbox"` in `docs/mocks/` (35
files) and `usage_inventory.py docs/mocks choice "label"`. Rows that share a
configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/profile-cuisines/default`, `invalid`, `saving` — Cuisines | group, `layout="grid"`, legend `<h2>`, help, `inputId` on every box (`c-grenadian`) | 18 cuisines from L2-007: "Antiguan & Barbudan" … "Vincentian", "Pan-Caribbean" | unchecked, checked; group error "Choose between 1 and 5 cuisines" with `aria-invalid` on the six ticked boxes | canvas |
| `pages/profile-cuisines/*` — Areas you serve, one group per region | group with `parentLabel` "All of City of Toronto", "All of Peel", "All of York Region", "All of Durham", "All of Halton"; nested grid indented | 30 areas from L2-010 | unchecked, checked, parent mixed (D-5) | canvas |
| `pages/profile-events/default`, `invalid`, `saving` — Occasions | group, `layout="grid"`, legend `<h2>`, help, `inputId` | 8 occasions from L2-021 | unchecked, checked; group error "Choose at least one occasion" with no box invalid | canvas |
| `dialogs/dish/default`, `edit`, `busy`, `failed`, `invalid` | group, `layout="grid"`, legend "Dietary tags (optional)" | 8 tags from L2-017 | unchecked, checked, disabled while the dialog saves | dialog (`--color-bg-surface-raised`) |
| `dialogs/filters/default`, `selected`, `busy` (phone sheet) | group, `variant="filter"`, `layout="stack"`, legend "Cuisine" / "Area" | option + `description` count: "Jamaican" "14 caterers", "Surinamese" "1 caterer" | unchecked, checked, disabled zero-count ("Bahamian" "0 caterers"), all disabled while results load | sheet |
| `dialogs/filter-menu/default` (tablet cuisine dropdown) | group, `layout="stack"`, hidden legend | 18 cuisines with counts | unchecked, checked, disabled zero-count | popover (`--color-bg-surface-raised`) |
| `dialogs/filter-menu/area` (tablet area dropdown) | group, `layout="stack"`, hidden legend "Regions" | "City of Toronto" "31 caterers", "Peel" "13 caterers" … | unchecked, checked | popover |
| `dialogs/record-breach/*` | group, `layout="grid"`, legend "Information involved" | "Names", "Email addresses", "Phone numbers", "Event details" … | unchecked, checked, disabled while saving | dialog |
| `dialogs/photo-details/*` | single option with `description` | "Use as cover photo" / "Shown on your listing card and when your page is shared" | unchecked, checked, disabled while saving | dialog |
| `pages/register/*` | agreement: inside [form field](form-field.md) with `label` null; `required`, summary slot, link in the label | "I agree to the privacy notice"; summary "We use your name and email to run your account…" | unchecked (never pre-ticked), checked, invalid "Tick the box to agree to the privacy notice" | canvas |
| `pages/register-caterer/*` "Before you start" | group, `layout="stack"`, two agreements | "I sell Caribbean food in Toronto or the GTA"; "I accept the caterer terms and the privacy notice" + summary | unchecked, checked, invalid "Confirm that you sell Caribbean food in Toronto or the GTA", "Accept the caterer terms and privacy notice to continue" | canvas |
| `dialogs/moderate-review/remove` | agreement in a form field, `required` | "I understand this review can't be restored" | unchecked, checked | dialog |
| `pages/sign-in/challenge` | group, `layout="stack"`, hidden legend "Quick check", agreement with `describedBy` | "I'm a person, not a bot" + "A privacy-friendly check…" | unchecked, invalid | well (`--color-bg-surface-sunken`) |

Not built by this component:

- `.filter-list__item` buttons on the listing (LG–XL) are [filter
  list](filter-list.md); they are toggle buttons, not checkboxes.
- `.switch` rows ("Pause new enquiries") are [switch](switch.md).
- The `.form-summary` link list is [form layout](form-layout.md).

## Anatomy

1. **Row** — `label.choice` wraps everything, so a click or tap anywhere on
   the row toggles the box. Flex row, `--space-3` between box and text,
   `--space-1` block padding, minimum height `--target-min` (from 48rem) or
   `--target-comfortable` (below 48rem).
2. **Box** — the native `<input type="checkbox">`, `appearance: none`,
   `--icon-size-md` square, `--radius-xs` corners, hairline
   `--color-border-strong` edge on `--color-bg-surface`, nudged down
   `--space-0-5` to sit on the first text line. Checked: `--color-accent` fill
   with a clipped tick in `--color-fg-on-accent` (a `::before`, not a DOM
   node). Indeterminate: the same fill with a `--border-width-thick` bar.
3. **Text column** — `span.choice__text`, a flex column with `--space-0-5`
   between lines. Its first child is a `<span>` holding the projected label
   (D-3); the label is the accessible name and may contain a link.
4. **Description (optional)** — a `<small>` inside `.choice__text`, in
   `--color-fg-muted`: a consequence ("Shown on your listing card and when your
   page is shared") or a count ("14 caterers"). Read with the name.
5. **Consent summary (optional)** — `p.consent-summary` rendered right after
   the row, indented to the label (`--icon-size-md` + `--space-3`), tied to
   the box by `aria-describedby`.
6. **Error (agreement)** — not rendered by the checkbox. An agreement sits in
   [form field](form-field.md) with `label` null; the field renders the
   `.field` wrapper and its `.field__error` after the checkbox's block (D-4).

`sh-checkbox-group` parts:

7. **Fieldset** — `<fieldset>`; `.stack.stack--sm` for the stacked layout,
   `.filter-group` in the filter sheet.
8. **Legend** — `<legend>`; may hold an `<h2>` (rendered with `--text-h3` by
   the `legend > h2` rule) or an `.optional` marker; `.visually-hidden` when
   the surrounding dialog already names the set; `.filter-group__title` in
   the filter sheet.
9. **Help and group error** — `p.field__help` and `p.field__error` after the
   legend, both listed in the fieldset's `aria-describedby` (error first).
10. **Option grid** — `div.option-grid`: one column, two from 36rem.
11. **Parent row (nested only)** — an `sh-checkbox` "All of Durham" above an
    `.option-grid` indented by `--space-8`.

Hosts: `sh-checkbox` and `sh-checkbox-group` are layout-transparent
(`display: contents`), so `.option-grid` places the real `label.choice`
elements and `.stack` spaces the real rows (D-2). Every class and attribute in
*Markup* is on the inner native elements, in the light DOM, so the wrapping
label, form submission, `required` and `aria-describedby` id references work
natively.

## API

### `sh-checkbox` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `checked` | `boolean` (two-way) | `false` | no | Reflected as the input's `checked` property. Never `true` by default for an agreement (L2-070). |
| `indeterminate` | `boolean` | `false` | no | Sets the input's `indeterminate` DOM property (no attribute exists). Ignored when `checked` is true. Set by `sh-checkbox-group` for the parent row; consumers rarely set it. |
| `name` | `string \| null` | `null` | no | Rendered as `name`. In a group, the group's `name` wins. |
| `value` | `string` | `'on'` | no | Rendered as `value`. In a group, the identity of the row in the group's `value` array ("Jamaican", "Ajax"). |
| `inputId` | `string \| null` | `null` | no | Rendered as the input's `id`, so an error-summary link (`#c-grenadian`) can point at it. Inside a [form field](form-field.md) the field context's `id` is used instead. Otherwise no id is rendered on the input. |
| `disabled` | `boolean` | `false` | no | Native `disabled`: removed from the tab order, sunken box, `--color-fg-disabled` text. |
| `required` | `boolean` | `false` | no | Native `required`. Used on agreements. |
| `invalid` | `boolean` | `false` | no | Renders `aria-invalid="true"` (danger ring). Inside a [form field](form-field.md), the field context's `invalid` also sets it. |
| `describedBy` | `string \| null` | `null` | no | Extra ids appended to `aria-describedby` ("human-help"). Order: the form field context's ids (error, help), then the summary id, then these. |
| `description` | `string \| null` | `null` | no | Text for the `<small>` description line, when the consumer has a plain string ("14 caterers"). The `description` slot is the alternative for marked-up text; use one or the other. |

- Boolean inputs accept the bare attribute (`<sh-checkbox required>`).
- Attributes whose input is `null` or `false` are absent from the DOM, never
  rendered as `"false"` or `"null"`.
- Form field context: inside [form field](form-field.md), `sh-checkbox`
  reads the field's `id`, `describedBy` and `invalid` and renders them on the
  native input, like every other control.
- Form integration: `sh-checkbox` implements the framework's form-control
  contract (Angular `ControlValueAccessor` or equivalent) for a `boolean`;
  the control's disabled state maps to `disabled`.

### `sh-checkbox` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `checkedChange` | `boolean` (the new checked value) | The person toggles the box by click, tap or <kbd>Space</kbd>. Never emitted for input changes made by the consumer, or while `disabled`. |

### `sh-checkbox` methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the native input (used when an error-summary link targets the box). |

### `sh-checkbox` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text and inline links (`<a href>`) | The label, rendered inside `span.choice__text > span`. It is the accessible name. A link stays its own focus stop; a click on the label text outside the link toggles the box. |
| `[slot=description]` | Text | Rendered inside a `<small>` after the label span. Used when the description needs markup; otherwise use the `description` input. |
| `[slot=summary]` | Text and inline links | Rendered as `p.consent-summary` right after the row, with a generated id added to `aria-describedby`. Used for agreements. |

### `sh-checkbox-group` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `string[]` (two-way) | `[]` | no | The `value`s of the checked child rows, in child order. Child `checked` is derived from it. |
| `name` | `string \| null` | `null` | no | Rendered as `name` on every child input ("cuisine", "area", "tags"). |
| `layout` | `'grid' \| 'stack'` | `'grid'` | no | `grid` wraps the rows in `div.option-grid`; `stack` adds `.stack.stack--sm` to the fieldset and places the rows directly in it. |
| `variant` | `'form' \| 'filter'` | `'form'` | no | `filter` adds `.filter-group` to the fieldset and `.filter-group__title` to the legend (phone filter sheet). |
| `legendHidden` | `boolean` | `false` | no | Adds `.visually-hidden` to the legend ("Regions", "Quick check"). The legend still names the group. |
| `help` | `string \| null` | `null` | no | Renders `p.field__help` after the legend: "Choose 1 to 5 islands or traditions you cook from." |
| `error` | `string \| null` | `null` | no | Renders `p.field__error` after the help: "Choose between 1 and 5 cuisines". The fieldset's `aria-describedby` lists the error id, then the help id. |
| `invalidValues` | `string[]` | `[]` | no | The child `value`s that break the group rule; each gets `aria-invalid="true"`. Empty when no single box is at fault ("Choose at least one occasion"). |
| `disabled` | `boolean` | `false` | no | Disables every child (native `disabled` on each input) while a dialog saves or results load. The fieldset itself never gets `disabled`, so the legend does not dim (D-7). |
| `parentLabel` | `string \| null` | `null` | no | Turns the group into a nested region: renders a parent `sh-checkbox` with this label ("All of Durham") above an indented grid (D-5). |
| `parentDescription` | `string \| null` | `null` | no | The parent's description, formatted by the consumer from `value` ("2 of 8 areas"). Tied to the parent by `aria-describedby`. |

### `sh-checkbox-group` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string[]` | A child is toggled, or the parent row is toggled (then every enabled child changes at once). One emission per user action. |

### `sh-checkbox-group` content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=legend]` | Text, an `<h2>`, a `span.optional` marker | Rendered inside `<legend>`. Required: a group always has a legend. |
| default | `sh-checkbox` children | The rows. Each child's `value` identifies it in the group's `value`. |

- Translation: every label, description, summary, legend, help, error and
  `parentLabel` / `parentDescription` arrives from the consumer, who takes it
  from the resource files (L2-064). The component contains no user-facing
  strings.
- Option labels for cuisines, areas, occasions and dietary tags come from
  data (the operator-managed lists in L2-007, L2-010, L2-017 and L2-021),
  never hard-coded.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Option | bare `label.choice` | A row in a pick-any list: cuisines, areas, occasions, dietary tags, filters. Also a single stand-alone option such as "Use as cover photo". |
| Option with description | `label.choice` + `<small>` | A count ("14 caterers") or a consequence line. |
| Agreement | `sh-form-field` (`label` null) > `label.choice` + `.consent-summary`; the field adds `.field__error` | One box that must be ticked before the form can be sent. The label starts with "I". |
| Group, grid | `fieldset` > `legend`, help, error, `.option-grid` | Related options in forms and dialogs. |
| Group, stack | `fieldset.stack.stack--sm` | Filter lists in the sheet and dropdowns, agreements under "Before you start". |
| Group, filter | `fieldset.filter-group` > `legend.filter-group__title` | The phone filter sheet's "Cuisine" and "Area" groups. |
| Nested region | group with `parentLabel` | "All of Durham" above its eight areas. |

Checkboxes have one size: a 20 px (`--icon-size-md`) box beside `--text-body`.
The row, not the box, is the touch target. Width comes from the container;
in `.option-grid` each row takes one column. Density comes from the grid,
never from a smaller box.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Unchecked | — | `--color-bg-surface` box, `--color-border-strong` edge | "checkbox, not checked" |
| Hover | `:hover` on the row | Box edge `--color-fg-muted` | — |
| Focus | `:focus-visible` on the input | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out, around the box only | Name, description and state announced |
| Checked | `checked` | `--color-accent` fill and edge, tick in `--color-fg-on-accent` | "checked" |
| Indeterminate | `indeterminate` property | `--color-accent` fill, `--border-width-thick` bar in `--color-fg-on-accent` | "mixed" (`aria-checked` is implied by the native property) |
| Disabled | `disabled` | Box `--color-bg-subtle`, edge `--color-border-default`, text `--color-fg-disabled`, `cursor: not-allowed` | Skipped by Tab; announced as unavailable |
| Disabled, checked | `checked` + `disabled` | Sunken box keeps the tick (dish dialog busy) | "checked, unavailable" |
| Invalid | `aria-invalid="true"` | Box edge `--color-danger-solid` plus a hairline `--color-danger-solid` ring outside it; checked boxes keep the fill | "invalid entry"; the error is read through `aria-describedby` |
| Required | `required` | No visual change; the label and the form field's error say it | "required" |
| Group error | group `error` | `p.field__error` in `--color-danger-fg` with the warning glyph under the help | The fieldset description reads the error first, then the help |
| Group disabled | group `disabled` | Every row disabled; legend and help unchanged | Every box skipped by Tab |
| On a raised surface | inside a dialog, popover or sheet | Box stays `--color-bg-surface`; the checked fill keeps 3:1 against `--color-bg-surface-raised` | — |

Indeterminate is never combined with invalid: a group error sits on the
group. `data-state="hover|focus|checked|indeterminate|disabled|invalid"`
exists in `components.css` only for documentation and mocks; the component
never renders it.

## Markup

```html
<!-- rendered: option, unchecked; checked; with a description; disabled zero-count -->
<label class="choice"><input type="checkbox" name="tags" value="Halal"><span class="choice__text"><span>Halal</span></span></label>
<label class="choice"><input type="checkbox" name="tags" value="Vegan" checked><span class="choice__text"><span>Vegan</span></span></label>
<label class="choice"><input type="checkbox" name="cuisine" value="Jamaican"><span class="choice__text"><span>Jamaican</span><small>14 caterers</small></span></label>
<label class="choice"><input type="checkbox" name="cuisine" value="Bahamian" disabled><span class="choice__text"><span>Bahamian</span><small>0 caterers</small></span></label>
```

```html
<!-- rendered: agreement with a link and summary, inside sh-form-field (label null) with an error (register, invalid) -->
<div class="field">
  <label class="choice"><input type="checkbox" id="consent" name="consent" required aria-invalid="true" aria-describedby="consent-error consent-summary"><span class="choice__text"><span>I agree to the <a href="/privacy">privacy notice</a></span></span></label>
  <p class="consent-summary" id="consent-summary">We use your name and email to run your account and pass your enquiries to caterers. Caterers see your name, never your email or phone unless you share them. Everything is stored in Canada.</p>
  <span class="field__error" id="consent-error">Tick the box to agree to the privacy notice</span>
</div>
<!-- div.field and span.field__error come from sh-form-field; label.choice and p.consent-summary from sh-checkbox -->
```

The summary id is `{id}-summary` where `id` is the input's id (from the form
field or `inputId`), otherwise generated (`sh-checkbox-3-summary`).

```html
<!-- rendered: group, grid, with help and a group error (profile-cuisines, invalid) -->
<fieldset aria-describedby="cuisine-error cuisine-help">
  <legend><h2>Cuisines</h2></legend>
  <p class="field__help" id="cuisine-help">Choose 1 to 5 islands or traditions you cook from.</p>
  <p class="field__error" id="cuisine-error">Choose between 1 and 5 cuisines</p>
  <div class="option-grid">
    <label class="choice"><input type="checkbox" name="cuisine" id="c-grenadian" value="Grenadian" checked aria-invalid="true"><span class="choice__text"><span>Grenadian</span></span></label>
    <label class="choice"><input type="checkbox" name="cuisine" id="c-haitian" value="Haitian"><span class="choice__text"><span>Haitian</span></span></label>
    …
  </div>
</fieldset>
```

```html
<!-- rendered: nested region with a mixed parent (Pelau House serves Ajax and Pickering) -->
<fieldset class="stack stack--sm">
  <legend>Durham</legend>
  <label class="choice"><input type="checkbox" value="Durham" aria-describedby="sh-checkbox-group-4-parent"><span class="choice__text"><span>All of Durham</span><small id="sh-checkbox-group-4-parent">2 of 8 areas</small></span></label>
  <div class="option-grid" style="padding-inline-start: var(--space-8);">
    <label class="choice"><input type="checkbox" name="area" value="Ajax" checked><span class="choice__text"><span>Ajax</span></span></label>
    <label class="choice"><input type="checkbox" name="area" value="Brock"><span class="choice__text"><span>Brock</span></span></label>
    …
  </div>
</fieldset>
<!-- the parent input has indeterminate = true set as a DOM property; it has no name (D-5) -->
```

```html
<!-- rendered: filter variant in the phone sheet -->
<fieldset class="filter-group stack stack--sm">
  <legend class="filter-group__title">Cuisine</legend>
  <label class="choice"><input type="checkbox" name="cuisine" value="Jamaican" checked><span class="choice__text"><span>Jamaican</span><small>2 caterers</small></span></label>
  …
</fieldset>
```

```html
<!-- rendered: hidden legend, stacked (tablet area dropdown; sign-in challenge) -->
<fieldset class="stack stack--sm"><legend class="visually-hidden">Regions</legend> … </fieldset>
```

Consumer templates (binding syntax illustrative; copy comes from the resource
files, option labels from data):

```html
<!-- consumer: cuisines on the profile editor -->
<sh-checkbox-group name="cuisine" [(value)]="cuisines" [help]="t('profile.cuisines.help')" [error]="cuisineError()" [invalidValues]="cuisineError() ? cuisines() : []">
  <h2 slot="legend">{{ t('profile.cuisines.legend') }}</h2>
  @for (c of cuisineList(); track c.id) {
    <sh-checkbox [value]="c.name" [inputId]="'c-' + c.slug">{{ c.name }}</sh-checkbox>
  }
</sh-checkbox-group>

<!-- consumer: one region of service areas -->
<sh-checkbox-group name="area" layout="grid" [(value)]="areas" [parentLabel]="t('areas.allOf', { region: 'Durham' })" [parentDescription]="t('areas.countOf', { n: 2, total: 8 })">
  <span slot="legend">Durham</span>
  @for (a of durham; track a) { <sh-checkbox [value]="a">{{ a }}</sh-checkbox> }
</sh-checkbox-group>

<!-- consumer: privacy consent on registration -->
<sh-form-field [label]="null" controlId="consent" [error]="consentError()">
  <sh-checkbox name="consent" required [(checked)]="consent">
    {{ t('register.consent.before') }}<a href="/privacy">{{ t('register.consent.link') }}</a>
    <span slot="summary">{{ t('register.consent.summary') }}</span>
  </sh-checkbox>
</sh-form-field>

<!-- consumer: filter sheet, zero-count disabled -->
<sh-checkbox-group name="cuisine" layout="stack" variant="filter" [(value)]="filters.cuisines" [disabled]="loading()">
  <span slot="legend">{{ t('filters.cuisine') }}</span>
  @for (o of cuisineCounts(); track o.name) {
    <sh-checkbox [value]="o.name" [disabled]="o.count === 0" [description]="t('filters.count', { n: o.count })">{{ o.name }}</sh-checkbox>
  }
</sh-checkbox-group>
```

The e2e page objects locate checkboxes by role and name and by `.choice`,
`.choice__text`, `.option-grid`, `.consent-summary` and `.field__error`, so
those classes, the native input, its `name`/`value`/`id` and the ARIA
attributes are part of the contract. The generated id format is free to
change; ids set through `inputId` are not.

## Design

- Row: flex, `gap: --space-3`, `align-items: flex-start`, `padding-block:
  --space-1`, `min-height: --target-min` from 48rem and
  `--target-comfortable` below; `cursor: pointer`; text `--text-body`.
- Box: `--icon-size-md` square, `--radius-xs`, `--border-width-hairline`
  edge, top margin `--space-0-5`; tick `0.75rem` clipped polygon; bar
  `0.65rem` × `--border-width-thick`.
- Text column gap `--space-0-5`; description inherits `--text-body` size in
  `--color-fg-muted`.
- Consent summary `--text-body-sm`, `--color-fg-muted`, top margin
  `--space-1`, left margin `--icon-size-md` + `--space-3`.
- Legend `--text-label` with `--space-2` below; an `<h2>` inside it uses
  `--text-h3`; `.optional` in `--color-fg-subtle`.
- Help and error `--text-body-sm`; error in `--color-danger-fg`.
- Option grid: one column; two equal columns from 36rem with a `--space-6`
  column gap; row gap `--space-1` from 48rem and `--space-2` below, so
  neighbouring 44 px rows are 8 px apart (L2-065). Never three columns.
- Nested grid indent `--space-8`.
- Shape: box only; rows have no border, fill or radius.
- Elevation and layer: none; no `z-index`.
- Motion: box background and border colour transition over
  `--duration-fast` with `--ease-standard`; the tick and bar appear without
  animation.

The checkbox declares no component tokens; it reads semantic tokens directly.
Re-skin by overriding `--color-accent` on a wrapper, never by restyling
`.choice input`, because the same token drives the selected filter, the
current tab and the focus ring.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Box fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Box edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Box edge, hover | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Checked / mixed fill | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Tick and bar | `--color-fg-on-accent` | `--palette-white` | `--palette-stone-950` |
| Label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Description, consent summary, help | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Disabled box / edge | `--color-bg-subtle` / `--color-border-default` | `--palette-stone-100` / `--palette-stone-200` | `--palette-stone-800` / `--palette-stone-750` |
| Disabled text | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |
| Invalid edge and ring | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Error text | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Unchecked box edge |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Unchecked box edge in a dialog |
| `--color-accent` | `--color-bg-surface` | 3:1 | Checked fill against the page |
| `--color-accent` | `--color-bg-surface-raised` | 3:1 | Checked fill in a dialog |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Tick and bar |
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Label |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Description and summary |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid ring |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Error text |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring in a dialog |

Disabled rows (`--color-fg-disabled`) are exempt from the minimums (WCAG
1.4.3, inactive components); they appear only for zero-count filter options,
whose "0 caterers" description explains why, and while a form saves.

Forced colours: `.choice input:checked` and `:indeterminate` take
`Highlight` for fill and edge with `forced-color-adjust: none`; the
unchecked edge becomes `CanvasText` through `--color-border-strong`; the focus
ring becomes `Highlight`. `prefers-contrast: more` needs no checkbox rule.

## Responsive behaviour

- Below 48rem (XS, SM) every `.choice` row is at least `--target-comfortable`
  (44 px) high and the option grid's row gap is `--space-2`, so targets are
  44 px tall and 8 px apart (L2-065). From 48rem rows return to the compact
  height (about 32 px, still above the 24 px WCAG 2.5.8 minimum).
- Below 36rem `.option-grid` is one column; from 36rem two equal columns
  with `--space-6` between them. It never goes to three.
- Long labels ("Dominican (Dominican Republic)", "Religious and cultural
  celebrations", "Trinidadian & Tobagonian") wrap under themselves, never
  under the box; they never truncate.
- Nested areas keep their `--space-8` indent at every width.
- Filters: below 48rem the cuisine and area checkboxes sit in the phone
  filter sheet; at 48–62rem in the filter dropdowns; from 62rem the listing
  uses the [filter list](filter-list.md) instead (L2-009).
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom at a 1280 px
  window every row stays readable and usable.

## Accessibility

### Role and pattern

Native `<input type="checkbox">` ([APG
Checkbox](https://www.w3.org/WAI/ARIA/apg/patterns/checkbox/)), restyled with
`appearance: none` only; role, checked and mixed states, `required` and form
submission stay native. No `role` or `aria-checked` attribute is ever added.
Groups are a `<fieldset>` with a `<legend>`, announced on entry ("Cuisines,
group").

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to the next or previous checkbox. Every box is its own tab stop; a link inside a label is a separate stop after its box. Disabled boxes are skipped. |
| <kbd>Space</kbd> | Toggles the focused box. On the parent row: unchecked or mixed → checked, ticking every enabled area; checked → unchecked, clearing them. |
| <kbd>Enter</kbd> | Does not toggle. Inside a form it submits; autosaved profile forms have no implicit submit. |

### Focus

- The shared ring (`--focus-ring-width`, `--color-focus-ring`,
  `--focus-ring-offset`) draws around the box only, not the row, so it does
  not collide with neighbouring rows in the grid. It shows on keyboard focus
  only.
- Toggling never moves focus. Toggling the parent keeps focus on the parent.
- Focus is moved to a checkbox only by an error-summary link (`href="#c-grenadian"`)
  or the consumer calling `focus()`.

### Labelling

- The wrapping label gives the name; no `for`/`id` is needed unless an
  error-summary link targets the box (`inputId`).
- The description `<small>` is inside the label, so it is read with the name
  ("Jamaican 14 caterers").
- `aria-describedby` on the box lists, in order: the form field's error and
  help (from the field context), the consent summary, then `describedBy`. On a parent row it lists the
  `parentDescription` ("2 of 8 areas").
- Group help and error are on the fieldset's `aria-describedby` (error
  first), not repeated on each box.
- A label with a link keeps the link short ("privacy notice"); the rest of
  the label toggles.

### Announcements

None from the component. Checked and mixed states are native; result counts
after a filter change are announced by the page's `aria-live="polite"` region
(L2-067).

### Motion

Box colour transitions use `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms. Nothing moves.

## Content and internationalisation

- Option labels are the option, spelt as the lists in L2-007, L2-010, L2-017
  and L2-021 spell them: "Trinidadian & Tobagonian", "Barbadian (Bajan)",
  "St. Lucian", "Whitchurch-Stouffville", "Funerals and repasts",
  "Contains shellfish". Never one flattened "Caribbean" option.
- The legend names the set or asks the question: "Cuisines", "Occasions",
  "Dietary tags", "Information involved". Help says the rule: "Choose 1 to 5
  islands or traditions you cook from."
- Agreements start with "I": "I agree to the privacy notice", "I sell
  Caribbean food in Toronto or the GTA", "I understand this review can't be
  restored", "I'm a person, not a bot".
- Descriptions are one short line: a consequence or a count, singular for
  one ("1 caterer", "14 caterers", "0 caterers"). Counts are formatted by the
  consumer with the locale's plural rules.
- Errors say what to do: "Tick the box to agree to the privacy notice",
  "Choose between 1 and 5 cuisines", "Choose at least one occasion". Never
  "Required" or "Invalid".
- Parents read "All of Durham", never "Select all"; the description reads
  "2 of 8 areas".
- Translatable inputs: label, `description`, summary, group `error`, legend, `help`,
  `parentLabel`, `parentDescription`. Data values: cuisine, area, occasion and
  tag names, counts.
- French runs about 30 % longer ("J'accepte la politique de confidentialité");
  labels wrap under themselves and never truncate.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the `aria-describedby`
  list, the group's checked set and the parent's checked / mixed state) are
  computed once per input change, not in the template.
- The group derives each child's `checked` from a `Set` of `value`, so a
  53-box profile page updates in one pass; one `change` listener per input,
  no global listeners, timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Checkbox.ts`
  renders Pelau House's "Areas you serve" (five region groups, 30 areas,
  Scarborough, East York, North York, Pickering and Ajax ticked) and toggles
  "All of Durham"; iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep it at roughly 100–300 ms.
- Composite scenarios: `ProfileCuisines`, `FilterSheet`, `DishDialog`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the box is a fixed `--icon-size-md` square in every
  state; the tick is a pseudo-element; a group error is inserted above the
  grid only after a save attempt, never while the person is ticking.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given the dish dialog for "Paw paw chow" at 1280 px, when the "Dietary tags (optional)" group renders, then it is a `<fieldset>` with that legend and an `.option-grid` of 8 `label.choice` rows labelled exactly "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Halal", "Contains nuts", "Contains shellfish" and "Spicy", with "Vegan", "Gluten-free" and "Spicy" checked. (L2-017)
- **AC-2** Given Kendra's cuisines editor, when the group renders, then it has 18 rows named exactly as L2-007 spells them, in the order the cuisine list returns, with "Guyanese" and "Trinidadian & Tobagonian" checked and the box for Grenadian carrying `id="c-grenadian"`. (L2-007)
- **AC-3** Given the phone filter sheet with no filters active, when the "Cuisine" group renders with `variant="filter"`, then the fieldset has `.filter-group`, the legend `.filter-group__title`, and the row "Jamaican" carries the description "14 caterers" inside its label, so its accessible name is "Jamaican 14 caterers". (L2-009)
- **AC-4** Given the phone filter sheet, when "Bahamian" renders with the count 0, then its row is shown in place with the description "0 caterers", its input has the native `disabled` attribute, and Tab skips it. (L2-008)
- **AC-5** Given the photo details dialog, when "Use as cover photo" renders with the description "Shown on your listing card and when your page is shared", then the description is a `<small>` in `--color-fg-muted` inside `.choice__text`, and ticking it emits `checkedChange` with `true`. (L2-042)

### Agreements

- **AC-6** Given the customer registration page, when the consent agreement renders, then "I agree to the privacy notice" is unchecked, has `required`, and the `.consent-summary` paragraph "We use your name and email to run your account…" is its accessible description. (L2-070)
- **AC-7** Given the consent agreement, when Marcia clicks the words "I agree to the", then the box toggles; when she clicks the "privacy notice" link, then the box does not toggle and the privacy notice opens. (L2-070)
- **AC-8** Given the caterer registration form submitted with "I sell Caribbean food in Toronto or the GTA" unticked, when the error is set, then the box has `aria-invalid="true"`, a `--color-danger-solid` ring, and `aria-describedby` pointing at "Confirm that you sell Caribbean food in Toronto or the GTA". (L2-037)
- **AC-9** Given the consent agreement with the error "Tick the box to agree to the privacy notice", when a screen reader focuses the box, then it announces the name, "required", "invalid entry", then the error and the summary, in that order. (L2-068)
- **AC-10** Given the sign-in challenge after 20 failed attempts from one address, when "I'm a person, not a bot" renders with `describedBy="human-help"`, then it is a required checkbox inside a fieldset with the hidden legend "Quick check", described by "A privacy-friendly check…". (L2-076)

### Groups and nesting

- **AC-11** Given Kendra ticks a sixth cuisine and saves, when the group error "Choose between 1 and 5 cuisines" is set with `invalidValues` naming the six ticked cuisines, then the error appears under the help, the fieldset's `aria-describedby` lists the error before the help, exactly those six boxes have `aria-invalid="true"`, and the summary link `#c-grenadian` focuses the Grenadian box. (L2-007)
- **AC-12** Given Kendra saves her occasions with none ticked, when the group error "Choose at least one occasion" is set with empty `invalidValues`, then the error is the fieldset's description and no box has `aria-invalid`. (L2-021)
- **AC-13** Given the Durham group with Ajax and Pickering ticked, when it renders, then "All of Durham" has `indeterminate` true, is announced as "mixed", and is described by "2 of 8 areas". (L2-010)
- **AC-14** Given "All of Durham" is mixed, when Kendra presses Space on it, then all 8 Durham areas become checked, the parent becomes checked, `valueChange` is emitted once with the 8 Durham areas plus her other areas, and focus stays on the parent. (L2-010)
- **AC-15** Given every Peel area is ticked, when Kendra unticks "All of Peel", then Brampton, Caledon and Mississauga are all unchecked and the parent is unchecked, not mixed. (L2-010)
- **AC-16** Given the dish dialog is saving, when the group's `disabled` is true, then every box has the native `disabled` attribute, checked boxes keep their tick, and the legend "Dietary tags (optional)" is not dimmed. (L2-068)

### Keyboard and focus

- **AC-17** Given focus on "Vegan" in the dietary tags, when Marcia presses Tab, then focus moves to "Gluten-free" (each box a tab stop); when she presses Space, then "Gluten-free" toggles; when she presses Enter, then nothing toggles. (L2-067)
- **AC-18** Given any checkbox receives keyboard focus, when it renders in either theme, then a `--focus-ring-width` ring in `--color-focus-ring` surrounds the box only, `--focus-ring-offset` out, with at least 3:1 contrast against the surface, and a mouse click shows no ring. (L2-067)

### Screen readers and automated checks

- **AC-19** Given the cuisines group with its error, the consent agreement and the Durham parent in the mixed state, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)
- **AC-20** Given every rendered checkbox, when it is inspected, then it is wrapped by its visible `<label class="choice">`, and no box is named only by a placeholder, title or `aria-label`. (L2-068)

### Theming

- **AC-21** Given the light theme, when "Vegan" is checked, then its fill is `--color-accent` with at least 3:1 against the surface and the tick `--color-fg-on-accent` with at least 4.5:1 against the fill. (L2-069)
- **AC-22** Given the dark theme in the dish dialog, when "Vegan" is checked and "Halal" is unchecked, then the checked fill resolves to `--palette-pepper-300` with at least 3:1 against `--color-bg-surface-raised`, the tick to `--palette-stone-950`, and the unchecked edge has at least 3:1 against the dialog surface. (L2-069)
- **AC-23** Given the invalid consent box in either theme, when it renders, then the `--color-danger-solid` ring has at least 3:1 against the surface and the error text `--color-danger-fg` at least 4.5:1, and the error is also stated in text, not only by colour. (L2-069)

### Responsive

- **AC-24** Given a 360 px viewport, when the dietary tags render, then the option grid is one column, every row is at least 44 CSS px high, and neighbouring rows are at least 8 px apart. (L2-065)
- **AC-25** Given a 768 px viewport, when the cuisines group renders, then the option grid has two equal columns `--space-6` apart and no third column at any wider width. (L2-064)
- **AC-26** Given a 320 px viewport, when "Dominican (Dominican Republic)" and "Religious and cultural celebrations" render, then each label wraps under itself, not under the box, with no text cut off and no horizontal scrolling. (L2-064)
- **AC-27** Given a 1280 px window at 200 % zoom, when the "Areas you serve" section renders, then every region, parent and area row is readable and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-28** Given `prefers-reduced-motion: reduce`, when "Halal" is hovered and ticked, then the border and fill change with no visible transition. (L2-069)

### Performance

- **AC-29** Given the `Checkbox` perf-test scenario with Pelau House's five region groups, when Kendra toggles "All of Durham", then the eight areas and the parent are repainted within 200 ms of the press (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/checkbox/`; files
  `checkbox.component.*` (selector `sh-checkbox`, class `CheckboxComponent`)
  and `checkbox-group.component.*` (selector `sh-checkbox-group`, class
  `CheckboxGroupComponent`). The group finds its rows with a content query
  and owns their `name`, `checked`, `disabled` and `aria-invalid`.
- Styles: the `.choice` (checkbox rules), `.option-grid`, `.consent-summary`,
  `legend` and checkbox forced-colours and phone-target rules of
  `docs/design-system/assets/components.css` move into the component. `.choice`
  and `.option-grid` are shared with [radio group](radio-group.md); keep them
  in one shared stylesheet both components import, so the two never drift.
  Class names reach the DOM unchanged and unscoped.
- `indeterminate` is set on the native element after render
  (`input.indeterminate = …`); server-rendered HTML cannot carry it, so the
  parent's description ("2 of 8 areas") states the mix for anyone reading
  before scripts run (D-5).
- Design-system catch-up: the page's *Responsive* text calls the `--space-2`
  phone row gap "proposed"; `components.css` already applies it, and this CRD
  makes it a requirement.
- Mock catch-up: legends with inline `style="font: var(--text-h3)"` on the
  `<h2>` and the dish dialog's `.text-muted` "(optional)" are replaced by the
  `legend > h2` rule and `span.optional` (design system, Sources).
- Composes nothing. Composed by [form field](form-field.md) (agreements), [form layout](form-layout.md),
  [dialog](dialog.md), [sheet](sheet.md) and [filter
  trigger](filter-trigger.md) dropdowns.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What are the hosts?* Both hosts are `display: contents`, so `.option-grid` lays out the real `label.choice` rows and `.stack` spaces them; the native input is in the light DOM so the wrapping label and form submission work without proxying.
- **D-3** *Is the label always wrapped in an inner `<span>`?* Yes. The agreement mocks wrap their label in a `<span>` because `.choice__text` is a flex column and an inline link would otherwise split the text into separate lines. Wrapping every label the same way keeps one template; option rows in the mocks have a bare text node, which renders and announces identically.
- **D-4** *Who owns the agreement's wrapper, error and summary?* The sibling [form field](form-field.md) CRD owns the `.field` wrapper and the error for a self-labelled checkbox (`label` null) and passes `id`, `describedBy` and `invalid` through its field context, as for every control; the checkbox owns only the `.consent-summary`, which the form field CRD assigns to it. The `aria-describedby` order therefore follows the form field (error, help) and then the summary; the register mock lists the summary first, which reads the same content in a different order.
- **D-5** *How does the "All of …" parent work, and is it submitted?* The group computes it: checked when every enabled child is checked, mixed when some are, unchecked when none; toggling it sets every enabled child. It renders no `name`, because L2-010.3 stores a whole-region pick as every area in it; the mocks' `name="region"` on the parent is dropped. The design system fixed the mocks' unchecked parents above ticked areas; this follows the design system.
- **D-6** *Which boxes are invalid when a group rule fails?* Only those the consumer names in `invalidValues`: the ticked ones for "too many" (six cuisines), none for "too few" (no occasion), as the design system and `profile-events/invalid` show. The error summary links to the first offending box, or to the first box when none is at fault.
- **D-7** *How is a whole group disabled while a dialog saves?* Each input gets native `disabled`; the `<fieldset>` never does, so the legend and help keep full contrast and the layout does not change. This matches `dialogs/dish/busy` and `dialogs/filters/busy`, which disable every input and leave the legend alone.
- **D-8** *Can a checkbox be pre-ticked?* Options can (editing saved data). Agreements never are: L2-070.2 says the consent box is not ticked by default, and the same rule applies to every agreement for consistency.
- **D-9** *Is there a description input as well as a slot?* Yes. Counts arrive as strings from the consumer's formatter, and a string input avoids projecting a node for each of 23 filter rows; the slot remains for marked-up text. Using both is a consumer error the component resolves by preferring the slot.
- **D-10** *Does the nested grid's indent use an inline style?* Yes, `padding-inline-start: var(--space-8)` on the nested `.option-grid`, set by the component, as the mocks and design-system page do. The design system defines no class for it, and inline styles are allowed by the content-security policy (L2-081 restricts scripts only).
