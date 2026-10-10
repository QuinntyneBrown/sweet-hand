# Select

| Field | Value |
|---|---|
| Selector | `sh-select` |
| Library path | `frontend/projects/components/src/lib/select/` |
| Status | planned |
| Traces to | L2-021, L2-022, L2-024, L2-060, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`select.html`](../../design-system/components/select.html) |
| Source mocks | [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/enquiry/invalid`](../../mocks/dialogs/enquiry/invalid.html), [`dialogs/enquiry/warning`](../../mocks/dialogs/enquiry/warning.html), [`dialogs/enquiry/busy`](../../mocks/dialogs/enquiry/busy.html), [`dialogs/operator-edit/default`](../../mocks/dialogs/operator-edit/default.html), [`pages/profile-cuisines/invalid`](../../mocks/pages/profile-cuisines/invalid.html), [`pages/admin-audit/default`](../../mocks/pages/admin-audit/default.html), [`pages/admin-metrics/default`](../../mocks/pages/admin-metrics/default.html) |
| Rendering | [`select.html`](select.html) |

## Purpose and scope

A select asks for one answer from a known list: the area of Marcia's event,
grouped by region; the occasion ("Family gatherings"); Kendra's primary area;
an operator's audit-log filter ("All operators") or the metrics grouping
("Show by: Week"). It is always the native `<select>`, so phones show their
own wheel or sheet, screen readers know it, and nothing custom has to
reimplement a listbox. It looks like a [text field](text-field.md) with a
chevron and sits in a [form field](form-field.md).

Use something else with 2 to 4 options ([radio group](radio-group.md) or
[button group](button-group.md)), when several answers can apply
([checkbox](checkbox.md) groups: the occasions a caterer serves), or when the
list is long and people know what to type (the area and postal code
[combobox](combobox.md) on the listing). A select never navigates or submits
on change.

Out of scope:

- Label, help, error and warning: [form field](form-field.md).
- The options themselves: the consumer passes them from the area and occasion
  data (L2-010, L2-021).
- Applying a filter: the toolbar's Apply button ([form layout](form-layout.md)).
- The open option list: drawn by the operating system, not styled.

## Usage

Inventory from `usage_inventory.py docs/mocks select "select"` and a parse of
every `select.select` in `docs/mocks/` (41 selects on 27 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/enquiry/*` Event area | form select, placeholder "Choose an area", 5 `optgroup`s (City of Toronto, Peel, York Region, Durham, Halton), 30 areas, required | "Scarborough" | placeholder, chosen, warning "This caterer doesn’t list Oshawa as an area they serve", busy (disabled) | dialog |
| `dialogs/enquiry/*` Occasion | form select, placeholder "Choose an occasion", 8 occasions, required | "Family gatherings" | placeholder, chosen, invalid "Choose an occasion", busy (disabled) | dialog |
| `pages/profile-cuisines/*` Primary area | form select, placeholder "Choose your primary area", the caterer's areas, with help | "Scarborough" | chosen, invalid "Choose your primary area", saving | canvas |
| `dialogs/operator-edit/*` Field | form select, no placeholder, 8 options | "Description" | chosen, busy (disabled) | dialog |
| `pages/admin-audit/*` Operator, Action | filter select, first option "All operators" / "All actions", in `.toolbar` | "All operators", "Leah Mohammed", "Tomas Reyes" | default | canvas |
| `pages/admin-metrics/*` Show by | filter select, ordered by meaning (Day, Week, Month), in `.toolbar` | "Week" | default | canvas |

## Anatomy

1. **Box** — `select.select`: the text field's container (`--field-*`
   tokens, `--control-height-md`, `--radius-md`, hairline edge), full width,
   native appearance removed.
2. **Selected value or placeholder option** — `--text-body`. The placeholder
   option has `value=""`, so `required` catches it.
3. **Chevron** — two 5 px gradient triangles in `currentColor` (so it follows
   `--field-fg`), 12–18 px from the end; `--space-10` end padding keeps text
   clear of it. Drawn by CSS backgrounds, never an image or a DOM node.

Host: `sh-select` is layout-transparent (`display: contents`) and renders the
native `<select>` with its `<option>` and `<optgroup>` children in the light
DOM (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `options` | `readonly (SelectOption \| SelectGroup)[]` | — | yes | `SelectOption = { value: string; label: string; disabled?: boolean }`; `SelectGroup = { label: string; options: readonly SelectOption[] }`. Groups render `<optgroup label>`, options `<option value>`. Order is kept as given. |
| `placeholder` | `string \| null` | `null` | no | Renders a first `<option value="">` with this text ("Choose an area"). Use on form selects; never on filter selects. |
| `value` | `string` | `''` | no | The chosen option's value; `''` selects the placeholder. Two-way with `valueChange`. A value matching no option selects the placeholder (or the first option). |
| `name` | `string \| null` | `null` | no | Rendered as `name`. |
| `required` | `boolean` | `false` | no | Rendered as `required`. |
| `disabled` | `boolean` | `false` | no | Native `disabled`: out of the tab order, faded. Set while the form is busy (a select cannot be read-only) and restored when sending fails. The value is kept. |
| `autocomplete` | `string \| null` | `null` | no | Rendered as `autocomplete` (none of today's selects need it). |
| `invalid` | `boolean \| null` | `null` | no | Standalone use only. `null` follows the form field's context; renders `aria-invalid="true"` or nothing. |

- Boolean inputs accept the bare attribute (`<sh-select required>`).
- The id, `aria-describedby` and `aria-invalid` come from the [form
  field](form-field.md) context.
- There is no `size`, `multiple` or `readonly` input (D-3, D-4, D-5).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string` | On the native `change` event, whether by the picker, the arrow keys or type-ahead. The consumer may update the form (the operator-edit value field follows "Field") but must not navigate or submit. |
| `blurred` | `FocusEvent` | The select loses focus. The enquiry shows the area fit warning on change or blur. |

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the select; the form field's `focusControl()` calls it. |

### Content slots

None. Options come through `options` so the component can render
`<optgroup>`, keep the placeholder first and compare values.

- Translation: `placeholder` and every option and group label arrive from the
  consumer (L2-064): fixed lists (occasions, "Show by" values, "All
  operators") from the resource files, area names from the area data.

## Variants and sizes

| Variant | Shape | Use for |
|---|---|---|
| Form select | `placeholder` + options (or groups), usually `required` | Event area, Occasion, Primary area, operator-edit Field. |
| Filter select | first option is a real "All …" value, no placeholder | Audit log Operator and Action; metrics Show by. Applied by the toolbar's Apply, never on change. |

One size: 44 px (`--control-height-md`) with 16 px text, in forms and
toolbars alike. No small size (it would shrink the native picker's trigger
below the phone target) and no large size (no select sits on the auth
screens). Width follows the field: full width in forms, at least 10rem in a
toolbar.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Placeholder | `value` `''` with `placeholder` | Placeholder option text in `--field-fg` | "Choose an area" read as the value |
| Chosen | `value` matches an option | The option's label | Value announced |
| Hover | `:hover` | Edge `--color-fg-muted` | — |
| Focus | `:focus-visible` | Flush `--color-focus-ring` ring and edge | Name, value and group announced |
| Open | platform picker | Drawn by the OS; follows `color-scheme` | Native listbox |
| Invalid | `aria-invalid="true"` (field `error`) | `--color-danger-solid` doubled edge | Invalid; error first in the description |
| Warning | field `warning` | Edge unchanged; `.field__warning` under it | Warning in the description, announced once by the field |
| Disabled / busy | `disabled` | `--color-bg-subtle` fill, `--color-fg-disabled` text and chevron | Out of the tab order; value still shown |

`data-state="hover|focus|invalid|disabled"` is documentation-only.

## Markup

```html
<!-- rendered: form select with placeholder and groups (enquiry Event area) -->
<select class="select" id="area" name="area" required aria-describedby="area-warning">
  <option value="">Choose an area</option>
  <optgroup label="City of Toronto"><option value="downtown-toronto">Downtown Toronto</option>…<option value="scarborough" selected>Scarborough</option><option value="york">York</option></optgroup>
  <optgroup label="Peel">…</optgroup>
  <optgroup label="York Region">…</optgroup>
  <optgroup label="Durham">…<option value="oshawa">Oshawa</option>…</optgroup>
  <optgroup label="Halton">…</optgroup>
</select>
```

```html
<!-- rendered: invalid (placeholder still chosen on submit) -->
<select class="select" id="occasion" name="occasion" required aria-invalid="true" aria-describedby="occasion-error">
  <option value="" selected>Choose an occasion</option>
  <option value="weddings">Weddings</option>…<option value="family-gatherings">Family gatherings</option>…
</select>
```

```html
<!-- rendered: busy (disabled, value kept) -->
<select class="select" id="area" name="area" required disabled>…<option value="scarborough" selected>Scarborough</option>…</select>
```

```html
<!-- rendered: filter select in the audit toolbar -->
<select class="select" id="op" name="operator">
  <option value="" selected>All operators</option><option value="op-leah">Leah Mohammed</option><option value="op-tomas">Tomas Reyes</option>
</select>
```

The "All …" option of a filter select is an ordinary option with value `''`
passed in `options`, not the `placeholder`.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: enquiry Event area with the fit warning -->
<sh-form-field controlId="area" [label]="t('enquiry.area')" [error]="areaError()" [warning]="areaWarning()">
  <sh-select name="area" required [placeholder]="t('enquiry.chooseArea')" [options]="areaGroups" [disabled]="busy()" [(value)]="area" (blurred)="touch('area')" />
</sh-form-field>

<!-- consumer: audit toolbar filter -->
<sh-form-field controlId="op" [label]="t('audit.operator')">
  <sh-select name="operator" [options]="operatorOptions()" [(value)]="operator" />
</sh-form-field>
```

The e2e page objects choose options by their visible label through the native
`<select>` and read `aria-invalid`, `disabled` and the selected option; those
and the `.select` class are the contract. Option `value` strings are free to
change with the data model.

## Design

- Height `--control-height-md`; padding `--space-2` `--space-3`, end padding
  `--space-10` for the chevron; chevron triangles at
  `calc(100% - var(--space-4) - var(--space-0-5))` and
  `calc(100% - var(--space-3))`, 5 px each.
- Value `--text-body` (16 px); options use the platform's font in the picker.
- Shape `--radius-md`; edge `--border-width-hairline` in `--field-border`;
  invalid adds a hairline inset shadow in `--color-danger-solid`.
- Focus ring `--focus-ring-width` in `--color-focus-ring`, offset 0.
- Motion: edge colour over `--duration-fast` with `--ease-standard`; the
  picker opens with the platform's own motion.
- Layer: none; the picker is the platform's.

Component tokens: `--field-bg`, `--field-border`, `--field-fg` with the text
field's state overrides (see [text field](text-field.md)); the chevron follows
`--field-fg` through `currentColor`.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Value and chevron | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Hover edge | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring and edge | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Invalid edge | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Disabled fill / text and chevron | `--color-bg-subtle` / `--color-fg-disabled` | `--palette-stone-100` / `--palette-stone-300` | `--palette-stone-800` / `--palette-stone-700` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Value and chevron |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Edge on a page |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Edge in a dialog |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid edge |

The open list follows `color-scheme` (set by the theme), so it is dark in the
dark theme. Disabled selects are exempt. Forced colours: a `CanvasText` edge,
and the chevron follows the text colour.

## Responsive behaviour

- Full width in forms; Event area and Postal code share a `.field-row` from
  36rem ([form layout](form-layout.md)).
- On phones the native picker opens (a wheel on iOS, a sheet on Android) with
  `optgroup` labels as section headers.
- The closed box shows the chosen option on one line; a long option
  ("Religious and cultural celebrations") is clipped by the browser at 320 px,
  never wrapped and never widening the page.
- In the operator toolbar each select is at least 10rem and wraps with the
  other filters.
- 44 px tall at every width, plus the label as an extra target (L2-065).

## Accessibility

### Role and pattern

A native `<select>` (exposed as a combobox with a listbox popup by the
browser), named by the form field's `<label for>`. Groups use `<optgroup
label>`, which screen readers announce. No custom listbox, no `role`
attribute.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into and out of the select. |
| <kbd>Space</kbd>, <kbd>Enter</kbd>, <kbd>Alt</kbd>+<kbd>↓</kbd> | Opens the list (platform-dependent). |
| <kbd>↑</kbd> / <kbd>↓</kbd> | Changes the option; on some platforms without opening. Nothing navigates or submits on change. |
| Letters | Type-ahead: "S" jumps to Scarborough. |
| <kbd>Esc</kbd> | Closes the list without changing the value; in a dialog, a second Esc closes the dialog. |

### Focus

- Flush pepper ring and edge, as on the text field.
- Choosing an option keeps focus on the select; nothing else moves (WCAG
  3.2.2).

### Labelling

- The visible label names the question ("Event area"); the placeholder option
  is an instruction ("Choose an area"), not the name.
- Errors and warnings are in `aria-describedby`.
- While busy the label and the chosen value stay visible.

### Announcements

None from the select. The fit warning is announced by the [form
field](form-field.md).

### Motion

The edge transition uses `--duration-fast`, which reduced motion zeroes; the
platform picker honours the OS setting.

## Content and internationalisation

- Placeholder options start with "Choose": "Choose an area", "Choose an
  occasion", "Choose your primary area".
- Filter selects start with a real "All …" option: "All operators", "All
  actions".
- Option names match the rest of the product: GTA municipalities as in L2-010
  ("Whitchurch-Stouffville"), occasions as on caterer pages ("Funerals and
  repasts", "Religious and cultural celebrations").
- Order by meaning when there is one (Day, Week, Month); otherwise
  alphabetical within each group; regions in the filter list's order.
- The error repeats the instruction: "Choose your primary area".
- Translatable: `placeholder`, fixed option labels, group labels. Data: area
  and operator names.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the option tree and the selected flag are
  computed once per `options` or `value` change, not in the template. The
  30-area list renders once and is not rebuilt on `value` changes.
- One `change` and one `blur` listener; no timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Select.ts`
  renders the enquiry's Event area (30 areas in 5 groups) and Occasion for
  Pelau House, then changes the area from Scarborough to Oshawa and toggles
  `disabled`; iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep it at roughly 100–300 ms.
- Composite scenarios: `EnquiryDialog`, `AuditLog`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: fixed height; states change colours only.
- Weight: no dependencies beyond the framework; never a custom dropdown
  library.

## Acceptance criteria

### Rendering

- **AC-1** Given the enquiry to Pelau House, when Event area renders with `placeholder` "Choose an area" and five groups, then the DOM is `<select class="select" required>` whose first child is `<option value="">Choose an area</option>` followed by `<optgroup>`s labelled "City of Toronto", "Peel", "York Region", "Durham" and "Halton" with the 30 areas, 44 CSS px high. (L2-022)
- **AC-2** Given the enquiry's Occasion, when it renders, then its options after "Choose an occasion" are the L2-021 occasions in order, including "Funerals and repasts" and "Religious and cultural celebrations". (L2-021)
- **AC-3** Given the audit log toolbar, when the Operator filter renders, then its first option is "All operators" (not a placeholder) and it is selected by default; changing it to "Tomas Reyes" emits `valueChange` but does not reload or filter until Apply is pressed. (L2-060)
- **AC-4** Given the metrics dashboard toolbar, when "Show by" renders, then its options are Day, Week, Month in that order with Week selected. (L2-061)

### States

- **AC-5** Given Marcia submits the enquiry without choosing an occasion, when the form field sets "Choose an occasion", then the select has `aria-invalid="true"`, the `--color-danger-solid` doubled edge, and the placeholder is still selected. (L2-022)
- **AC-6** Given Pelau House does not serve Oshawa, when Marcia chooses Oshawa in Event area and the form field shows "This caterer doesn’t list Oshawa as an area they serve", then the select keeps its default edge, has no `aria-invalid`, and the warning id is in its `aria-describedby`. (L2-024)
- **AC-7** Given Marcia presses "Send enquiry" and the form is busy, when Event area and Occasion re-render `disabled`, then they still show "Scarborough" and "Family gatherings", are skipped by Tab, and when sending fails and `disabled` is cleared, the same values are selected. (L2-022)
- **AC-8** Given Kendra's Primary area with no choice, when she saves and the field shows "Choose your primary area", then the error text equals the placeholder option's text. (L2-068)

### Keyboard and focus

- **AC-9** Given focus on Event area showing "Choose an area", when Marcia types "S", then Scarborough is selected; when she presses ↓, then the next area is selected, focus stays on the select, and nothing navigates or submits. (L2-067)
- **AC-10** Given a select receives keyboard focus, when it renders, then a flush `--color-focus-ring` ring and edge appear with at least 3:1 contrast against the field and the page in both themes. (L2-067)

### Screen readers

- **AC-11** Given the enquiry with Event area and Occasion in default, invalid and warning states, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations, and each select's accessible name is its visible label ("Event area"), not the placeholder. (L2-066)

### Theming

- **AC-12** Given the dark theme, when a chosen select renders in a dialog, then its value and chevron (`--color-fg-default` on `--color-bg-surface`) measure at least 4.5:1, its edge at least 3:1 against `--color-bg-surface-raised`, and the open native list uses the dark colour scheme. (L2-069)

### Responsive

- **AC-13** Given a 320 px viewport, when Occasion shows "Religious and cultural celebrations", then the text is clipped inside the box on one line, the chevron stays visible, and the page does not scroll horizontally. (L2-064)
- **AC-14** Given a 360 px touch viewport, when Marcia taps Event area, then the native picker opens and the select's target is at least 44 × 44 CSS px. (L2-065)

### Performance

- **AC-15** Given the `Select` perf-test scenario, when the area changes from Scarborough to Oshawa, then the change is painted within 200 ms (Interaction to Next Paint), the option list is not re-rendered, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/select/`; files
  `select.component.*` (selector `sh-select`, class `SelectComponent`) and
  `select.types.ts` (`SelectOption`, `SelectGroup`). It injects the optional
  `FormFieldContext` from [form field](form-field.md).
- Styles: the `.select` rule (chevron) moves into the component; the shared
  `.input, .select, .textarea` base and `--field-*` tokens come from the
  stylesheet shared with [text field](text-field.md) and
  [textarea](textarea.md). Add `.select:disabled { color: var(--field-fg); }`
  only if a browser fails to fade the chevron through `currentColor`.
- The dark theme must set `color-scheme: dark` on the root so the native list
  follows it (design system Theming); that belongs to the theme, not the
  component.
- Mock drift to note when the mocks are next touched: the primary-area error
  "Mark one area as primary" becomes "Choose your primary area".
- Composes nothing. No CDK primitive; never a custom listbox.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* Layout-transparent (`display: contents`) with the native `<select>` and its options in the light DOM, so `label[for]`, form submission, toolbar wrapping and e2e `selectOption` work natively.
- **D-3** *Is there a small or large size?* No. The design system gives the select one size; a compact select would shrink the picker's trigger below the phone target, and no select appears on the large auth screens.
- **D-4** *How is a select made read-only while busy?* It is `disabled`, as the design system decides and `enquiry/busy` shows, because HTML has no read-only select; the value is kept and restored to interactive if sending fails. There is no `readonly` input to suggest otherwise.
- **D-5** *Is there a multiple select?* No. Several answers use checkbox groups; `<select multiple>` is hard to use on phones and with screen readers.
- **D-6** *Are options a slot or an input?* An input of plain data. The component must render groups, keep the placeholder first and match `value` to an option; projected `<option>` elements would leave that to every consumer.
- **D-7** *Is the "All operators" first option a placeholder?* No. It is a real option with value `''` passed in `options`, so a filter select is always valid and never shows "Choose"; `placeholder` is only for form selects.
- **D-8** *Is the enquiry's Event area a select or the combobox?* A select, as `dialogs/enquiry/*` and the select page show: the caterer's fit warning depends on one area from a fixed list, and the optional postal code beside it is a plain text field. The combobox page's "the one way to say where an event is" refers to searching the listing; see [combobox](combobox.md) D-6.
- **D-9** *Which error does an unchosen primary area show?* "Choose your primary area", repeating the placeholder, as the design system's select page decides. L2-010.4 words the rule as "Mark one area as primary" for a caterer who picks several areas without a primary; the select page calls that wording drift because it describes a different control. The component only renders the consumer's error string, so either wording builds without an API change; the wording is raised with product (see the report).
