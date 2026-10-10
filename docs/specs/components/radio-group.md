# Radio group

| Field | Value |
|---|---|
| Selector | `sh-radio-group` (renders the `<fieldset>`), `sh-radio` (one option: renders `<label class="choice">`) |
| Library path | `frontend/projects/components/src/lib/radio-group/` |
| Status | planned |
| Traces to | L2-007, L2-054, L2-055, L2-056, L2-059, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-075, L2-085 |
| Design system | [`radio-group.html`](../../design-system/components/radio-group.html) |
| Source mocks | [`dialogs/report/default`](../../mocks/dialogs/report/default.html), [`dialogs/report/invalid`](../../mocks/dialogs/report/invalid.html), [`dialogs/resolve-report/default`](../../mocks/dialogs/resolve-report/default.html), [`dialogs/resolve-report/take-action`](../../mocks/dialogs/resolve-report/take-action.html), [`dialogs/add-operator/invalid`](../../mocks/dialogs/add-operator/invalid.html), [`dialogs/record-breach/invalid`](../../mocks/dialogs/record-breach/invalid.html), [`pages/profile-cuisines/default`](../../mocks/pages/profile-cuisines/default.html) |
| Rendering | [`radio-group.html`](radio-group.html) |

## Purpose and scope

A radio group asks for exactly one answer and keeps every option in view so
people can compare them: why a visitor is reporting Maracas Bay ("Food safety
concern · Something that could make people ill"), whether Leah dismisses a
report or takes action, whether a new operator is an Operator or an Admin,
which of Kendra's ticked cuisines is primary. Choosing one clears the others;
the chosen circle fills with pepper red, the brand's "selected" colour.
`sh-radio-group` is the `<fieldset>` with its legend, help and error;
`sh-radio` is one option row, the same `.choice` row as the
[checkbox](checkbox.md) with a round box.

Use something else when more than one answer is allowed
([checkbox](checkbox.md)), for a single on/off setting ([switch](switch.md)),
when there are more than about six well-known options that need no
explanation, such as the primary area or the enquiry's occasion
([select](select.md)), to switch views on a page such as the inbox's "All ·
Open · Replied" ([button group](button-group.md)), or to give a 1–5 star
review ([rating](rating.md), whose star input is its own component).

Out of scope:

- Revealing dependent fields (the "Action" group after "Take action", the
  details textarea for "Other"): the dialog shows or hides them from the
  group's `valueChange`.
- Any action on change. Arrow keys change the answer, so nothing submits,
  navigates or saves on `valueChange`; the dialog's primary button does.
- The read-only display of a chosen value with the `.primary-pick` "Primary"
  label (`pages/profile-cuisines/read-only`, the operator's caterer record):
  [description list](description-list.md) renders it.
- The error summary and moving focus to it: [form layout](form-layout.md).

## Usage

Inventory from a search of every `type="radio"` in `docs/mocks/` and
`usage_inventory.py docs/mocks choice "label"`. The review dialog's
`name="rating"` radios are the [rating](rating.md) star input and are not
built here.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/report/default`, `invalid`, `busy`, `failed`, `limit` | vertical, legend "Reason", five options with descriptions, `required`, no preselection, `autofocus` on the first option | "Inaccurate information" / "Wrong menu, areas or details", "Inappropriate content", "Fake or spam", "Food safety concern", "Other" / "Tell us in the details" | none chosen, chosen, disabled while sending | dialog (`--color-bg-surface-raised`) |
| `dialogs/resolve-report/default`, `take-action`, `invalid`, `busy`, `failed` — Decision | vertical, legend "Decision", preselected "Dismiss" with `autofocus` | "Dismiss" / "Nothing breaks the rules. Any automatic hiding is undone.", "Take action" / "Hide or remove the review." | chosen, disabled while saving | dialog |
| `dialogs/resolve-report/take-action`, `busy` — Action | vertical, legend "Action", shown only after "Take action" | "Hide the review" / "Reversible. It leaves the page and the rating within a minute.", "Remove the review" / "Permanent. Only the audit entry remains." | chosen, disabled | dialog |
| `dialogs/add-operator/default`, `invalid`, `busy`, `failed` | vertical, legend "Role", `inputId` on each option, preselected "Operator" (D-4) | "Operator" / "Reviews profiles, reviews and reports", "Admin" / "Also manages operators and the full audit log" | chosen; group error "Choose a role" with every radio invalid (drift: "Operator" is preselected, so there is no role error, D-11); disabled | dialog |
| `dialogs/record-breach/*` — Risk | vertical (horizontal allowed: two short labels), legend "Risk of significant harm" | "Low", "Real risk of significant harm" | none chosen, chosen, disabled | dialog |
| `dialogs/record-breach/*` — Notification decision | vertical or `variant="card"`, `inputId` "decision-report" | "Report to the Privacy Commissioner and notify the people affected", "Not reportable: no real risk of significant harm" | none chosen, invalid "Choose a notification decision", chosen, disabled | dialog |
| `pages/profile-cuisines/default`, `invalid`, `saving` — Primary cuisine | `layout="vertical"` in `.stack.stack--sm`, legend "Primary cuisine", help "Shown on your listing card.", options are the ticked cuisines | "Guyanese", "Trinidadian & Tobagonian" | chosen; group error "Mark one cuisine as primary" | canvas |

Every row above is buildable with the API below; card and horizontal layouts
appear in no mock but are in the design system and are specified here so a
later screen needs no API change.

## Anatomy

1. **Fieldset** — `<fieldset class="stack stack--sm">` in every variant, so
   rows, help and error are `--space-2` apart (D-10).
2. **Legend** — `<legend>`, the question or noun ("Reason", "Role",
   "Primary cuisine"), in `--text-label`. Required: it names the group.
3. **Help (optional)** — `p.field__help` under the legend.
4. **Error (optional)** — `p.field__error` under the legend and help (D-3),
   with the shared warning glyph.
5. **Options container** — the rows directly in the fieldset (vertical),
   in `div.cluster` (horizontal) or as `label.choice.choice--card` rows
   (card).
6. **Option row** — `label.choice` wraps the radio and text; the whole row
   (or card) is the target. `--space-3` between circle and text.
7. **Radio** — native `<input type="radio">`, `appearance: none`,
   `--icon-size-md` circle (`--radius-full`), hairline `--color-border-strong`
   edge on `--color-bg-surface`. Selected: `--color-accent` fill with a
   `--space-2` dot in `--color-fg-on-accent` (a `::before`).
8. **Text column** — `span.choice__text` > `<span>` label (the accessible
   name) and an optional `<small>` description in `--color-fg-muted`.

Hosts: `sh-radio-group` and `sh-radio` are layout-transparent
(`display: contents`); every class and attribute in *Markup* is on the native
elements in the light DOM, so the browser's native radio grouping (one tab
stop, arrow keys) works through the shared `name`.

## API

### `sh-radio-group` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | Rendered as `name` on every radio. It is what makes them one group. |
| `value` | `string \| null` (two-way) | `null` | no | The chosen option's `value`. `null` renders no `checked` radio. A value that matches no option renders none checked and is left unchanged. |
| `layout` | `'vertical' \| 'horizontal'` | `'vertical'` | no | `horizontal` wraps the rows in `div.cluster` with a `--space-2` row and `--space-6` column gap. Allowed only for two or three options with one- or two-word labels and no descriptions; ignored with `variant="card"`. |
| `variant` | `'plain' \| 'card'` | `'plain'` | no | `card` adds `.choice--card` to every row. Cards always stack. |
| `legendHidden` | `boolean` | `false` | no | Adds `.visually-hidden` to the legend when a dialog title already asks the question. |
| `help` | `string \| null` | `null` | no | Renders `p.field__help` under the legend. |
| `error` | `string \| null` | `null` | no | Renders `p.field__error` under the help, lists it first in the fieldset's `aria-describedby`, and sets `aria-invalid="true"` on every radio (D-5). |
| `required` | `boolean` | `false` | no | Renders native `required` on every radio. |
| `disabled` | `boolean` | `false` | no | Native `disabled` on every radio while a dialog sends; the fieldset never gets `disabled`, so the legend keeps its contrast. |
| `autofocus` | `boolean` | `false` | no | Renders `autofocus` on the checked radio, or the first enabled radio when none is checked, so a dialog opening on the group lands there. |

### `sh-radio-group` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string` (the newly chosen `value`) | The person chooses an option by click, tap, arrow key or <kbd>Space</kbd>. Never for consumer changes, never while `disabled`. |

### `sh-radio-group` methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the checked radio, or the first enabled one. Used by an error-summary link handler and by dialogs. |

### `sh-radio-group` content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=legend]` | Text | Rendered inside `<legend>`. Required. |
| default | `sh-radio` children | The options, in order. "Other" goes last. |

### `sh-radio` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `string` | — | yes | Rendered as `value`; identifies the option in the group's `value`. |
| `description` | `string \| null` | `null` | no | Text of the `<small>` description. The `description` slot is the alternative for marked-up text. |
| `inputId` | `string \| null` | `null` | no | Rendered as the radio's `id`, for an error-summary link (`#role-operator`). |
| `disabled` | `boolean` | `false` | no | Disables this option only. |

### `sh-radio` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text | The option label, inside `span.choice__text > span`. The accessible name. |
| `[slot=description]` | Text | Rendered inside `<small>` after the label. |

- `sh-radio` has no outputs; the group reports the choice.
- `sh-radio-group` implements the framework's form-control contract
  (`ControlValueAccessor` or equivalent) for `string | null`.
- Boolean inputs accept the bare attribute; `null` / `false` inputs render no
  attribute.
- Translation: legend, help, error, labels and descriptions arrive from the
  consumer's resource files (L2-064). Report reasons and roles are fixed
  lists in L2 and are translated; cuisine names in the primary pick are data.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Vertical (default) | rows directly in `fieldset.stack.stack--sm` | Every group in the mocks; always when options have descriptions or long labels. |
| Horizontal | `div.cluster` around the rows | Two or three one- or two-word options with no description ("Low" / "Real risk of significant harm" may not; "Dismiss" / "Take action" without descriptions may). Wraps at narrow widths. |
| Card | `label.choice.choice--card` rows in the same fieldset | An option with a real consequence that deserves room: the breach notification decision. Never side by side. |
| Primary pick | vertical, options from another field's selection | "Primary cuisine" built from the ticked cuisines. |

Radios have one size: a 20 px (`--icon-size-md`) circle beside `--text-body`.
Emphasis comes from the card variant, never from a bigger circle. Width comes
from the container; cards stretch to it.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Unselected | — | `--color-bg-surface` circle, `--color-border-strong` edge; card edge `--color-border-strong` | "radio button, not checked, 2 of 5" |
| Hover | `:hover` on the row | Circle edge `--color-fg-muted`; card edge `--color-fg-muted` | — |
| Focus | `:focus-visible` on the radio | Ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) around the circle; on a card, around the card instead (D-6) | Name, description, position announced |
| Selected | `checked` | `--color-accent` fill and edge, `--space-2` dot in `--color-fg-on-accent`; card edge `--color-accent` plus an inset hairline `--color-accent` ring | "checked" |
| Disabled | `disabled` | Circle `--color-bg-subtle`, edge `--color-border-default`, text `--color-fg-disabled` | Skipped by Tab and arrows |
| Disabled, selected | `checked` + `disabled` | Sunken circle keeps the dot (dialog sending) | "checked, unavailable" |
| Invalid | group `error` → `aria-invalid="true"` on every radio | `--color-danger-solid` edge and hairline ring on each circle; error text under the legend | "invalid entry"; the fieldset description reads the error |
| Required | `required` | No visual change | "required" on the first radio announced |
| None chosen | `value` null | Every circle empty | Tab lands on the first radio |

A chosen answer is never itself invalid: once a radio is chosen the consumer
clears `error`. `data-state="hover|focus|checked|disabled|invalid"` exists in
`components.css` for documentation only; the component never renders it.

## Markup

```html
<!-- rendered: vertical with descriptions, none chosen, autofocus on the first (report dialog) -->
<fieldset class="stack stack--sm">
  <legend>Reason</legend>
  <label class="choice"><input type="radio" name="reason" value="Inaccurate information" required autofocus><span class="choice__text"><span>Inaccurate information</span><small>Wrong menu, areas or details</small></span></label>
  <label class="choice"><input type="radio" name="reason" value="Inappropriate content" required><span class="choice__text"><span>Inappropriate content</span><small>Offensive words or photos</small></span></label>
  …
  <label class="choice"><input type="radio" name="reason" value="Other" required><span class="choice__text"><span>Other</span><small>Tell us in the details</small></span></label>
</fieldset>
```

```html
<!-- rendered: group error, every radio invalid (report dialog, no reason chosen) -->
<fieldset class="stack stack--sm" aria-describedby="reason-error">
  <legend>Reason</legend>
  <p class="field__error" id="reason-error">Choose a reason</p>
  <label class="choice"><input type="radio" name="reason" id="reason-inaccurate" value="Inaccurate information" required aria-invalid="true"><span class="choice__text"><span>Inaccurate information</span><small>Wrong menu, areas or details</small></span></label>
  <label class="choice"><input type="radio" name="reason" value="Inappropriate content" required aria-invalid="true"><span class="choice__text"><span>Inappropriate content</span><small>Offensive words or photos</small></span></label>
  <label class="choice"><input type="radio" name="reason" value="Fake or spam" required aria-invalid="true"><span class="choice__text"><span>Fake or spam</span><small>Not a real caterer, or stock photos</small></span></label>
  <label class="choice"><input type="radio" name="reason" value="Food safety concern" required aria-invalid="true"><span class="choice__text"><span>Food safety concern</span><small>Something that could make people ill</small></span></label>
  <label class="choice"><input type="radio" name="reason" value="Other" required aria-invalid="true"><span class="choice__text"><span>Other</span><small>Tell us in the details</small></span></label>
</fieldset>
```

```html
<!-- rendered: primary pick with help -->
<fieldset class="stack stack--sm" aria-describedby="primary-cuisine-help">
  <legend>Primary cuisine</legend>
  <p class="field__help" id="primary-cuisine-help">Shown on your listing card.</p>
  <label class="choice"><input type="radio" name="primary_cuisine" value="Guyanese"><span class="choice__text"><span>Guyanese</span></span></label>
  <label class="choice"><input type="radio" name="primary_cuisine" value="Trinidadian &amp; Tobagonian" checked><span class="choice__text"><span>Trinidadian &amp; Tobagonian</span></span></label>
</fieldset>
```

```html
<!-- rendered: horizontal -->
<fieldset class="stack stack--sm">
  <legend>Decision</legend>
  <div class="cluster" style="gap: var(--space-2) var(--space-6);">
    <label class="choice"><input type="radio" name="decision" value="dismiss" checked><span class="choice__text"><span>Dismiss</span></span></label>
    <label class="choice"><input type="radio" name="decision" value="act"><span class="choice__text"><span>Take action</span></span></label>
  </div>
</fieldset>
```

```html
<!-- rendered: card -->
<fieldset class="stack stack--sm">
  <legend>Notification decision</legend>
  <label class="choice choice--card"><input type="radio" name="decision" id="decision-report" value="report" checked><span class="choice__text"><span>Report to the Privacy Commissioner and notify the people affected</span><small>Required when there is a real risk of significant harm</small></span></label>
  <label class="choice choice--card"><input type="radio" name="decision" value="not"><span class="choice__text"><span>Not reportable: no real risk of significant harm</span><small>The record is kept in the breach register for at least 24 months</small></span></label>
</fieldset>
```

When a group has help or an error, the fieldset's `aria-describedby` lists
the error id, then the help id. Generated ids (`sh-radio-group-2-error`) are
free to change; ids from `inputId` are not.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: report reasons -->
<sh-radio-group name="reason" required autofocus [(value)]="reason" [disabled]="sending()">
  <span slot="legend">{{ t('report.reason') }}</span>
  @for (r of reasons; track r.value) {
    <sh-radio [value]="r.value" [description]="t(r.descriptionKey)">{{ t(r.labelKey) }}</sh-radio>
  }
</sh-radio-group>

<!-- consumer: resolve report, dependent group -->
<sh-radio-group name="decision" autofocus [(value)]="decision">…</sh-radio-group>
@if (decision() === 'act') { <sh-radio-group name="act" [(value)]="act">…</sh-radio-group> }

<!-- consumer: primary cuisine from the ticked cuisines -->
<sh-radio-group name="primary_cuisine" [(value)]="primary" [help]="t('profile.primaryCuisine.help')" [error]="primaryError()">
  <span slot="legend">{{ t('profile.primaryCuisine.legend') }}</span>
  @for (c of cuisines(); track c) { <sh-radio [value]="c">{{ c }}</sh-radio> }
</sh-radio-group>
```

The e2e page objects locate groups by the legend (role group) and options by
role and name, and by `.choice`, `.choice--card`, `.choice__text` and
`.field__error`; those classes, the native radios, `name`, `value`, `id` and
the ARIA attributes are the contract.

## Design

- Row: as [checkbox](checkbox.md) — flex, `--space-3` gap, `--space-1` block
  padding, minimum height `--target-min` from 48rem, `--target-comfortable`
  below; `--text-body`.
- Circle: `--icon-size-md`, `--radius-full`, `--border-width-hairline` edge,
  top margin `--space-0-5`; dot `--space-2` across.
- Fieldset `.stack.stack--sm`: `--space-2` between legend, help, error and
  rows in every variant.
- Card: `--space-4` padding, `--border-width-hairline` `--color-border-strong`
  edge, `--radius-md`.
- Horizontal: `.cluster` with `--space-2` row gap and `--space-6` column gap.
- Legend `--text-label`, `--space-2` below; help and error `--text-body-sm`.
- Elevation and layer: none.
- Motion: background and border colour over `--duration-fast` with
  `--ease-standard`; the dot appears without movement.

No component tokens: the radio reads the same semantic tokens as the
checkbox. Re-skin by overriding `--color-accent` on a wrapper.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Circle fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Circle and card edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Edge, hover | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Selected fill, selected card edge | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Dot | `--color-fg-on-accent` | `--palette-white` | `--palette-stone-950` |
| Label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Description, help | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Disabled circle / edge | `--color-bg-subtle` / `--color-border-default` | `--palette-stone-100` / `--palette-stone-200` | `--palette-stone-800` / `--palette-stone-750` |
| Disabled text | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |
| Invalid edge and ring | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Error text | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Circle and card edge |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Circle and card edge in a dialog |
| `--color-accent` | `--color-bg-surface` | 3:1 | Selected fill |
| `--color-accent` | `--color-bg-surface-raised` | 3:1 | Selected fill and card edge in a dialog |
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Dot |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Description in a dialog |
| `--color-danger-solid` | `--color-bg-surface-raised` | 3:1 | Invalid ring in a dialog |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Error text in a dialog |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Focus ring in a dialog |

Disabled radios are exempt from the minimums (WCAG 1.4.3). Forced colours:
`.choice input:checked` takes `Highlight` fill and edge; edges become
`CanvasText`; the card ring becomes `Highlight` through `--color-focus-ring`.

## Responsive behaviour

- Vertical groups and cards are the same at every breakpoint; labels wrap
  under themselves, never under the circle, and never truncate.
- Horizontal groups wrap: at 320 px "Take action" drops under "Dismiss".
- Below 48rem every plain row is at least 44 px (`--target-comfortable`)
  and rows are `--space-2` apart through the fieldset's `.stack--sm`, so
  neighbouring 44 px targets are 8 px apart (L2-065). Cards are taller than
  44 px at every width and also `--space-2` apart.
- In the report, resolve and breach dialogs (full screen below 36rem) groups
  keep the dialog's padding; cards stretch to the body width.
- At 320 px nothing scrolls horizontally; at 200 % zoom every option stays
  readable and usable.

## Accessibility

### Role and pattern

Native radios sharing a `name` inside a `<fieldset>` with a `<legend>` ([APG
Radio Group](https://www.w3.org/WAI/ARIA/apg/patterns/radio/)). The browser
supplies the single tab stop and arrow-key selection; no `role="radiogroup"`,
`tabindex` or key handling is added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Enters the group on the checked radio, or the first if none is checked, and leaves it in one step. |
| <kbd>↓</kbd> / <kbd>→</kbd> | Moves to and selects the next enabled radio; wraps from last to first. |
| <kbd>↑</kbd> / <kbd>←</kbd> | Moves to and selects the previous enabled radio; wraps. |
| <kbd>Space</kbd> | Selects the focused radio when none is checked. |

### Focus

- The ring circles the radio on a plain row and surrounds the card on a card
  row (D-6). Keyboard focus only.
- `autofocus` / `focus()` lands on the checked radio, or the first one: the
  resolve-report dialog opens on "Dismiss", the report dialog on
  "Inaccurate information" without choosing it.
- Choosing never moves focus; a dependent group that appears ("Action")
  follows in tab order and does not take focus.

### Labelling

- The legend names the group; each label names its option; the `<small>`
  description is inside the label and read with it.
- Group help and error are on the fieldset's `aria-describedby`, error first.
- Only a radio that an error summary links to needs an `id`.

### Announcements

None from the component; checked state and position ("2 of 5") are native.

### Motion

Colour transitions use `--duration-fast`, zeroed by
`prefers-reduced-motion: reduce`. Nothing moves.

## Content and internationalisation

- The legend is a noun or short question: "Reason", "Role", "Decision",
  "Action", "Risk of significant harm", "Notification decision", "Primary
  cuisine".
- Options are parallel and start with the distinguishing word: the five L2-054
  reasons exactly, "Inaccurate information", "Inappropriate content", "Fake or
  spam", "Food safety concern", "Other".
- Descriptions say what the option means or what happens next in one line:
  "Reversible. It leaves the page and the rating within a minute."
- "Other" is last and its details field becomes required ("Tell us what's
  wrong") — the dialog's rule.
- Errors: "Choose a reason", "Choose a notification
  decision", "Mark one cuisine as primary". Never "Please make a selection".
- Preselect the safe default in operator decisions ("Dismiss") and the least
  privilege in a role ("Operator"); never preselect a report reason.
- French runs about 30 % longer; labels wrap and the horizontal layout wraps
  to separate lines.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (each radio's `checked`,
  the `aria-describedby` list, the autofocus target) are computed once per
  input change, not in the template.
- One `change` listener per radio; no key handlers, timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/RadioGroup.ts`
  renders the report dialog's five reasons for Maracas Bay and steps through
  them with the arrow keys; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `ReportDialog`, `ProfileCuisines`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: circles are fixed squares; the dot is a pseudo-element;
  the selected card's ring is an inset shadow, so selecting a card never
  changes its size.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor reports Maracas Bay, when the report dialog opens, then the "Reason" group shows exactly "Inaccurate information", "Inappropriate content", "Fake or spam", "Food safety concern" and "Other", in that order, each with its description, none chosen, and focus on "Inaccurate information" without choosing it. (L2-054)
- **AC-2** Given "Food safety concern" is chosen in the report dialog, when the visitor clicks anywhere on the "Other" row, then "Other" is the only checked radio, `valueChange` emits "Other" exactly once, and the group submits nothing. (L2-054)
- **AC-3** Given Leah opens "Resolve report R-2041", when the "Decision" group renders, then "Dismiss" is checked and focused, and its description reads "Nothing breaks the rules. Any automatic hiding is undone." (L2-055)
- **AC-4** Given Leah chooses "Take action", when the dialog shows the "Action" group, then it is a separate fieldset with its own legend, "Hide the review" described "Reversible. It leaves the page and the rating within a minute." and "Remove the review" described "Permanent. Only the audit entry remains." (L2-059)
- **AC-5** Given Leah opens "Add an operator", when the "Role" group renders, then "Operator" is checked and "Admin" is not. (L2-056)
- **AC-6** Given Kendra has ticked Trinidadian & Tobagonian and Guyanese, when "Primary cuisine" renders, then it offers exactly those two, with "Trinidadian & Tobagonian" checked and the help "Shown on your listing card." as the fieldset's description. (L2-007)

### States

- **AC-7** Given Kendra saves with no primary cuisine, when the group error "Mark one cuisine as primary" is set, then the error appears under the legend and help, the fieldset's `aria-describedby` lists it first, and every radio has `aria-invalid="true"`. (L2-007)
- **AC-8** Given the breach record is submitted with no notification decision, when the error "Choose a notification decision" is set, then both radios have `aria-invalid="true"` and a `--color-danger-solid` ring, and the summary link `#decision-report` focuses the first radio. (L2-075)
- **AC-9** Given the report dialog's "Reason" group shows "Choose a reason", when the visitor chooses "Food safety concern", then the consumer clears `error`, and no radio keeps `aria-invalid`. (L2-068)
- **AC-10** Given the report dialog is sending, when the group's `disabled` is true, then every radio has native `disabled`, the chosen "Food safety concern" keeps its dot, and the legend "Reason" is not dimmed. (L2-054)
- **AC-11** Given the breach dialog renders the notification decision with `variant="card"`, when "Report to the Privacy Commissioner and notify the people affected" is checked, then its `label.choice.choice--card` edge is `--color-accent` with at least 3:1 against the dialog surface, and cards are `--space-2` apart. (L2-069)

### Keyboard and focus

- **AC-12** Given focus is on the field before the "Reason" group, when the visitor presses Tab once, then focus lands on "Inaccurate information"; when they press Tab again, then focus leaves the group. (L2-067)
- **AC-13** Given focus on a checked "Fake or spam", when the visitor presses ↓, then "Food safety concern" is checked and focused and `valueChange` emits "Food safety concern"; when they press ↓ on "Other", then "Inaccurate information" is checked. (L2-067)
- **AC-14** Given any radio has keyboard focus, when it renders in either theme, then the `--color-focus-ring` ring is drawn around the circle (around the card for a card row) with at least 3:1 against the dialog surface, and no second ring is drawn. (L2-067)
- **AC-15** Given the arrow keys move through "Dismiss" and "Take action", when the choice changes, then nothing is submitted and no dialog closes until Leah activates the primary button. (L2-055)

### Screen readers and automated checks

- **AC-16** Given the "Role" group, when a screen reader enters it, then it announces "Role, group", then "Operator, radio button, checked, 1 of 2, Reviews profiles, reviews and reports". (L2-068)
- **AC-17** Given the report dialog with the group in the default, chosen, invalid and disabled states, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)

### Theming

- **AC-18** Given the light theme, when "Admin" is checked, then the fill is `--color-accent` with at least 3:1 against `--color-bg-surface-raised`, and the dot `--color-fg-on-accent` has at least 4.5:1 against the fill. (L2-069)
- **AC-19** Given the dark theme, when the report dialog renders with "Fake or spam" checked, then the fill resolves to `--palette-pepper-300`, the dot to `--palette-stone-950`, unchecked circles keep at least 3:1 against the dialog surface, and descriptions at least 4.5:1. (L2-069)

### Responsive

- **AC-20** Given a 360 px viewport, when the report reasons render, then every option row is at least 44 CSS px high and the radios' targets are at least 8 px apart. (L2-065)
- **AC-21** Given a 320 px viewport, when "Report to the Privacy Commissioner and notify the people affected" renders, then it wraps under itself, not under the circle, with no clipping and no horizontal scrolling; a horizontal "Dismiss" / "Take action" group wraps onto two lines. (L2-064)
- **AC-22** Given a 1280 px window at 200 % zoom, when the resolve-report dialog renders, then both groups are readable and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-23** Given `prefers-reduced-motion: reduce`, when "Low" is hovered and chosen, then the edge and fill change with no visible transition. (L2-069)

### Performance

- **AC-24** Given the `RadioGroup` perf-test scenario, when the visitor presses ↓ from "Inaccurate information", then the next reason is painted as chosen within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/radio-group/`; files
  `radio-group.component.*` (selector `sh-radio-group`, class
  `RadioGroupComponent`) and `radio.component.*` (selector `sh-radio`, class
  `RadioComponent`). The group finds its radios with a content query and
  owns `name`, `checked`, `required`, `disabled` and `aria-invalid`.
- Styles: the radio rules of `.choice`, `.choice--card` and the shared
  `.choice` forced-colours and phone-target rules come from the stylesheet
  shared with [checkbox](checkbox.md); do not copy them.
- Design-system catch-up for D-6: `components.css` already rings a focused
  card with `.choice--card:has(input:focus-visible)` (the page calls it
  "proposed"), but the global `:focus-visible` still rings the radio inside
  it; add `.choice--card input:focus-visible { outline: none; }` so a card
  shows one ring. The rendering applies it with a specimen-only style.
- Mock catch-up: plain groups in the mocks are bare `<fieldset>`s (D-10);
  `dialogs/add-operator` starts with no role (D-4);
  `dialogs/add-operator/invalid` drops its role error, because "Operator" is
  preselected (D-11); `dialogs/record-breach/invalid` puts the error after
  the options (D-3); `record-breach/invalid` links its summary to
  the second radio (D-7).
- Composes nothing. Composed by [dialog](dialog.md) bodies and [form
  layout](form-layout.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component or two?* Two: `sh-radio-group` owns the fieldset, name, value and validation; `sh-radio` is one option row with its own label and description. Native grouping by `name` needs every radio to get the same name, which the group guarantees.
- **D-3** *Where does the group error sit?* Under the legend and help, before the options, as the design system's text says ("one error under the legend") and as the [checkbox](checkbox.md) group does. Two mocks and one design-system specimen put it after the options; one placement across all choice groups lets people find errors in the same place, and the form summary links to the first radio either way.
- **D-4** *Is the operator role preselected?* Yes, "Operator", the least privilege, per the design system's Content and Do-and-don't sections; the add-operator mock started empty and the design system fixed that drift. Report reasons are never preselected, so a report is not biased.
- **D-5** *Which radios are invalid when the group fails?* All of them, because the error is that no answer was chosen; once one is chosen the error is cleared. This is simpler than the checkbox's `invalidValues` because a radio group has only the "nothing chosen" rule.
- **D-6** *Where is the focus ring on a card?* Around the card, once. `components.css` rings the card through `:has(input:focus-visible)`, and the radio inside would draw a second ring; the radio's own outline is removed inside a card. Plain rows ring the circle only, as the design system specifies.
- **D-7** *Which radio does an error-summary link target?* The first one (`#decision-report`, `#role-operator`), as the design-system text says. `dialogs/record-breach/invalid` links to the second; the design system is followed.
- **D-8** *What happens when the value matches no option (a primary cuisine Kendra has just unticked)?* No radio is checked and the value is left for the consumer to clear; the group never emits on its own, so the page's validation ("Mark one cuisine as primary") stays the single source of the rule.
- **D-9** *Are horizontal and card layouts needed with no mock using them?* Yes; the design system documents both for future use, and specifying them now avoids an API change when the breach dialog adopts cards.
- **D-10** *How are 44 px phone rows kept 8 px apart?* Every group's fieldset carries `.stack.stack--sm`, so rows are `--space-2` apart at every width. The mocks' bare fieldsets stack 44 px rows with no gap below 48rem, which misses the 8 px spacing in L2-065.1; the primary-cuisine and card groups already use `.stack.stack--sm`, so this extends an existing pattern rather than adding a class.
- **D-11** *Can the add-operator "Role" group show an error?* No. Aligned with D-4: "Operator" is preselected and a radio group cannot be emptied, so "Choose a role" can never occur; `add-operator/invalid` shows only the email error. The group-error examples use the report dialog's "Reason" ("Choose a reason") instead.
