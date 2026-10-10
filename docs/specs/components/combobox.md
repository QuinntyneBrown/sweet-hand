# Combobox

| Field | Value |
|---|---|
| Selector | `sh-combobox` |
| Library path | `frontend/projects/components/src/lib/combobox/` |
| Status | planned |
| Traces to | L2-009, L2-011, L2-012, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 |
| Design system | [`combobox.html`](../../design-system/components/combobox.html) |
| Source mocks | [`dialogs/search/default`](../../mocks/dialogs/search/default.html), [`dialogs/search/suggestions`](../../mocks/dialogs/search/suggestions.html), [`dialogs/search/no-match`](../../mocks/dialogs/search/no-match.html), [`dialogs/search/invalid`](../../mocks/dialogs/search/invalid.html), [`dialogs/search/out-of-area`](../../mocks/dialogs/search/out-of-area.html), [`dialogs/search/busy`](../../mocks/dialogs/search/busy.html), [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterers/postal-invalid`](../../mocks/pages/caterers/postal-invalid.html), [`pages/caterers/out-of-area`](../../mocks/pages/caterers/out-of-area.html), [`pages/caterers/offline`](../../mocks/pages/caterers/offline.html), [`dialogs/filters/default`](../../mocks/dialogs/filters/default.html), [`dialogs/filters/busy`](../../mocks/dialogs/filters/busy.html) |
| Rendering | [`combobox.html`](combobox.html) |

## Purpose and scope

The combobox is the area and postal code search: Marcia types "scar" or
"M1B 2K3" and Sweet Hand suggests the GTA area she means. It answers "Where’s
your event?" in the search dialog, sits under "Area" in the listing's filter
column from 62rem, and leads the Area group of the phone filter sheet. It
follows the [APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/)
with list autocomplete and manual selection: focus stays in the input, arrow
keys move an active option, Enter picks it.

Use a [text field](text-field.md) pill search for a plain search that
suggests nothing (operator "Business or owner name"), a [select](select.md)
for one area from a fixed list in a form (the enquiry's Event area), and the
region checkboxes or buttons of the [filter list](filter-list.md) to pick
whole regions.

Out of scope:

- Label, help, error and warning text: the combobox sits in a [form
  field](form-field.md) with `labelHidden`; the consumer sets the error
  ("Enter a valid postal code, like M5V 2T6") and warning ("Sweet Hand
  currently serves Toronto and the GTA").
- Resolving a postal code to an area, checking its format, storing only the
  FSA, and running the search: the consumer and the server (L2-012).
- The `<form role="search">` landmark, "Show caterers", Cancel, the region
  fallback ("Or choose a whole region") and the active-filter chips: the
  search dialog, filter column and filter sheet.
- The browse bar's "Area or postal code" button that opens the dialog below
  62rem: a ghost [button](button.md).

## Usage

Inventory from `usage_inventory.py docs/mocks search-field "div|form"`, a
search for `role="combobox"` and `class="suggestion` in `docs/mocks/`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/search/*` (search dialog, all widths) | raised suggestions, autofocus, help "An area like Scarborough, or a postal code like M1B 2K3." | "scar" → Scarborough, City of Toronto; "m" → Markham, Milton, Mississauga | empty, typing with suggestions, no match "Barrie", invalid "12345", out of area "K1A 0B1", busy "M1B 2K3" (read-only) | dialog (`--color-bg-surface-raised`), bottom sheet below 36rem |
| `pages/caterers/*` filter column (from 62rem) | inline suggestions, visually hidden help | "pick" → Pickering, Durham | empty, typing, invalid "12345", out of area, disabled (offline) | canvas, filter column (15rem) |
| `dialogs/filters/*` phone filter sheet, Area group | inline suggestions; a pick becomes a chip and clears the field | "Scarborough" chip | empty, busy (read-only, chip remove disabled) | sheet |

The listing aside and the filter sheet in the mocks lack the combobox
wiring, and the search dialog's no-match state is a disabled option; both are
drift the design system fixed (D-3).

## Anatomy

1. **Field** — `div.search-field` with `input.input[type="search"][role="combobox"]`:
   a 52 px pill (`--control-height-lg`, `--radius-full`) with the text field's
   `--field-*` tokens.
2. **Pin icon** — `svg.icon[aria-hidden="true"]`, the area pin, 20 px in
   `--color-fg-subtle`; decorative. The pin means "area" everywhere.
3. **Listbox panel** — `ul.suggestions[role="listbox"]`, directly after the
   field, `--space-2` below it, as wide as the field; raised
   (`--color-bg-surface-raised`, hairline `--color-border-default`,
   `--radius-lg`, `--shadow-3`) or inline (`.suggestions--inline`: no border,
   shadow or padding). Hidden (`hidden`) when closed. At most 8 options tall,
   then it scrolls inside.
4. **Option** — `li.suggestion[role="option"]`, 44 px, `--radius-md`; the
   active one has `aria-selected="true"`, `--color-bg-subtle` fill and a 2 px
   `--color-accent` bar at its start edge.
5. **Match** — `<mark>` around the typed part, bold, no background.
6. **Hint** — `span.suggestion__hint`: the region ("City of Toronto"),
   caption, `--color-fg-subtle`, preceded by a visually hidden ", " so the
   option reads "Scarborough, City of Toronto".
7. **No-match status** — `p.suggestions.suggestions__empty[role="status"]`
   (raised) or `p.suggestions.suggestions--inline.suggestions__empty`
   (inline): "No matching areas", outside the listbox, shown only when typed
   text matches no area.
8. **Count status** — `span.visually-hidden[role="status"]`: "3 areas match",
   updated after typing pauses.

Host: `sh-combobox` is layout-transparent (`display: contents`); field, panel
and statuses are rendered in the light DOM as siblings inside the form
field's `div.field`, so the field's help and messages sit between the input
and the panel as in the design system (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `areas` | `readonly AreaOption[]` | — | yes | `AreaOption = { value: string; label: string; region: string }`: the 30 L2-010 areas. The component filters them as people type. |
| `value` | `string` | `''` | no | The text in the field. Two-way with `valueChange`. |
| `suggestions` | `'raised' \| 'inline'` | `'raised'` | no | `inline` adds `.suggestions--inline` (filter column, filter sheet) so the panel pushes content down instead of looking like an overlay. |
| `name` | `string \| null` | `'area'` | no | Rendered as `name`. |
| `placeholder` | `string \| null` | `null` | no | "Area or postal code". |
| `listLabel` | `string` | — | yes | The listbox's `aria-label`: "Matching areas". |
| `noMatchText` | `string` | — | yes | "No matching areas". |
| `matchCountText` | `(count: number) => string` | — | yes | Text for the count status: "1 area matches", "3 areas match". |
| `maxSuggestions` | `number` | `8` | no | The most options shown; more matches scroll inside the panel. |
| `readonly` | `boolean` | `false` | no | Native `readonly` while a search runs (busy); the list closes and stays closed. |
| `disabled` | `boolean` | `false` | no | Native `disabled` when the listing cannot load (offline). |
| `autofocus` | `boolean` | `false` | no | Focuses on first render (the search dialog). |
| `invalid` | `boolean \| null` | `null` | no | `null` follows the form field's context. |
| `errorAnnouncement` | `string \| null` | `null` | no | When it changes to a non-null text (the consumer sets it with the field's error after a refused submit), the count status announces it once, because focus is already in the field (D-8). |

Fixed attributes on the input: `type="search"`, `role="combobox"`,
`aria-autocomplete="list"`, `aria-controls` (the listbox id),
`autocomplete="postal-code"`, `autocapitalize="characters"`,
`enterkeyhint="search"`, `spellcheck="false"`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string` | Every `input` event, and when an option is picked (the area's label). |
| `areaChosen` | `AreaOption` | An option is picked by Enter, click or tap. The search dialog keeps the text; the filter sheet adds a chip and sets `value` back to `''`. |
| `blurred` | `FocusEvent` | The input loses focus (the list closes). |

Enter with no active option is not intercepted: it submits the enclosing form,
whose handler resolves a postal code or an exact area name.

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the input. |
| `close()` | Closes the list without picking (the dialog calls it before closing). |

### Content slots

None.

- Translation: `placeholder`, `listLabel`, `noMatchText`, `matchCountText` and
  `errorAnnouncement` come from the resource files (L2-064); area and region
  names are data.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Raised | `.suggestions` | The search dialog: the panel reads as a list over the region fallback. |
| Inline | `.suggestions.suggestions--inline` | The filter column (from 62rem) and the phone filter sheet: flat, in flow, pushing the region list down. |

One size: the 52 px pill with 44 px options. Width follows the container
(the dialog body up to 32rem, the 15rem filter column, the sheet); the panel
is always exactly as wide as the field.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty | `value` `''` | Placeholder and pin; list hidden | `aria-expanded="false"` |
| Focus | `:focus-visible` | Flush `--color-focus-ring` ring and edge on the pill | Name "Area or postal code", help read |
| Typing, suggestions | text matches areas | Panel with up to 8 options, matched part bold; no option active yet | `aria-expanded="true"`; count announced politely after a 500 ms pause |
| Active option | <kbd>↓</kbd>/<kbd>↑</kbd> or hover | `--color-bg-subtle` fill and 2 px accent bar; scrolled into view | `aria-activedescendant` names it; `aria-selected="true"` |
| No match | text matches no area and is not a postal code | Listbox hidden; "No matching areas" status | `aria-expanded="false"`; status read |
| Postal code typed | text starts letter-digit ("M1", "K1A 0B1") | No list, no no-match status | `aria-expanded="false"` |
| Invalid postal code | consumer sets the field's error on submit | `--color-danger-solid` doubled pill edge; `.field__error` under the field | `aria-invalid="true"`; error announced once (D-8) |
| Out of area | consumer sets the field's warning | Default edge; `.field__warning` | Warning announced by the form field |
| Busy | `readonly` | `--color-bg-surface-sunken` fill; list closed | Read only; "Show caterers" carries `aria-busy` |
| Disabled | `disabled` | `--color-bg-subtle` fill, `--color-fg-disabled` text | Out of the tab order |

Hover on the input and on options; `data-state="hover|focus"` is
documentation-only.

## Markup

```html
<!-- rendered: in the search dialog, typing "scar", one suggestion, active after ↓ -->
<div class="field">
  <label class="visually-hidden" for="q">Area or postal code</label>
  <div class="search-field">
    <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…pin…</svg>
    <input class="input" id="q" name="area" type="search" placeholder="Area or postal code" autocomplete="postal-code" autocapitalize="characters" enterkeyhint="search" spellcheck="false" autofocus
      role="combobox" aria-autocomplete="list" aria-controls="q-list" aria-expanded="true" aria-activedescendant="q-opt-scarborough" aria-describedby="q-help" value="scar">
  </div>
  <span class="field__help" id="q-help">An area like Scarborough, or a postal code like M1B 2K3.</span>
  <ul class="suggestions" id="q-list" role="listbox" aria-label="Matching areas">
    <li class="suggestion" id="q-opt-scarborough" role="option" aria-selected="true"><span><mark>Scar</mark>borough</span><span class="visually-hidden">, </span><span class="suggestion__hint">City of Toronto</span></li>
  </ul>
  <span class="visually-hidden" role="status">1 area matches</span>
  <span class="visually-hidden" role="status"></span>
</div>
```

The last status is the form field's announcer; the one before it is the
combobox's count status.

```html
<!-- rendered: no match ("Barrie") -->
<input class="input" id="q" … role="combobox" aria-expanded="false" aria-controls="q-list" value="Barrie">
…
<ul class="suggestions" id="q-list" role="listbox" aria-label="Matching areas" hidden></ul>
<p class="suggestions suggestions__empty" role="status">No matching areas</p>
```

```html
<!-- rendered: invalid postal code after submit -->
<input class="input" id="q" … role="combobox" aria-expanded="false" aria-invalid="true" aria-describedby="q-error q-help" value="12345">
<span class="field__error" id="q-error">Enter a valid postal code, like M5V 2T6</span>
```

```html
<!-- rendered: listing aside, inline suggestions -->
<ul class="suggestions suggestions--inline" id="area-q-list" role="listbox" aria-label="Matching areas">
  <li class="suggestion" id="area-q-opt-pickering" role="option" aria-selected="false"><span><mark>Pick</mark>ering</span><span class="visually-hidden">, </span><span class="suggestion__hint">Durham</span></li>
</ul>
```

Busy differs by `readonly` (list hidden); disabled by `disabled`.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: search dialog -->
<form role="search" (submit)="search($event)">
  <sh-form-field controlId="q" [label]="t('search.areaLabel')" labelHidden [help]="t('search.areaHelp')" [error]="postalError()" [warning]="outOfArea()">
    <sh-combobox [areas]="areas" [(value)]="query" autofocus [readonly]="searching()" [placeholder]="t('search.areaPlaceholder')"
      [listLabel]="t('search.matchingAreas')" [noMatchText]="t('search.noMatch')" [matchCountText]="countText" [errorAnnouncement]="postalError()" />
  </sh-form-field>
</form>

<!-- consumer: phone filter sheet; a pick becomes a chip -->
<sh-combobox suggestions="inline" [areas]="areas" [(value)]="areaText" (areaChosen)="addArea($event); areaText.set('')" … />
```

The e2e page objects drive it by role (`combobox`, `listbox`, `option`) and
read `aria-expanded`, `aria-activedescendant` and `aria-selected`; those, the
classes above and the status texts are the contract. Option ids are free to
change.

## Design

- Field: `--control-height-lg`, `--radius-full`, start padding
  `--space-4` + `--icon-size-md` + `--space-2`; pin at `--space-4` from the
  start, `--icon-size-md`, vertically centred on the 52 px field.
- Panel: `--space-2` gap above, `--space-2` padding, `--radius-lg`,
  hairline `--color-border-default`, `--shadow-3`, maximum height
  8 × `--target-comfortable` + 2 × `--space-2`, `overflow-y: auto`. Inline
  drops border, shadow, padding and background.
- Option: `--target-comfortable` high, `--space-3` inline padding,
  `--radius-md`, label and hint spread with `--space-3` between;
  active/hover fill `--color-bg-subtle`; active bar
  `inset var(--border-width-thick) 0 0 var(--color-accent)`.
- Match `--font-weight-bold`, inherited colour, no background. Hint
  `--text-caption`. No-match status `--text-body-sm` in `--color-fg-muted`,
  `--space-3` padding.
- Motion: suggestions appear and update without animation; the field edge
  transitions over `--duration-fast`.
- Layer: none. The panel is in flow under the field, never positioned over
  other content, so it needs no `z-index`.

Component tokens: the text field's `--field-bg`, `--field-border`,
`--field-fg`.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Field fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Field edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Text, option label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Placeholder, pin, hint | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Panel fill | `--color-bg-surface-raised` | `--palette-white` | `--palette-stone-850` |
| Panel edge | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Active option fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Active bar | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| No-match status | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Invalid edge | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Option on the panel |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Active option |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Region hint |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | No-match status |
| `--color-fg-subtle` | `--color-bg-surface` | 4.5:1 | Placeholder and pin |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Field edge on the page |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Field edge in the dialog |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |
| `--color-accent` | `--color-bg-subtle` | 3:1 | Active bar |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Error in the dialog |

The active option is identified by fill, bar and `aria-selected` together,
never by colour alone. The accent bar against the fill and the field edge
against the dialog surface are not yet entries in `contrast-pairs.json`; the
rendering measures them live. Forced colours: the field keeps a `CanvasText`
edge; the active option is marked with `Highlight` (D-9).

## Responsive behaviour

- Below 36rem the search dialog is a bottom sheet; the field autofocuses so
  the keyboard opens with it, and the raised panel follows the field in the
  dialog body, so it is never under the keyboard.
- From 36rem the dialog is centred (32rem wide).
- Below 62rem the listing has no filter column; the combobox appears in the
  search dialog and in the phone filter sheet's Area group. From 62rem it is
  in the filter column with inline suggestions (L2-009).
- Phones get a capitals keyboard with a Search key and are offered their
  saved postal code (`autocomplete="postal-code"`).
- With more than 8 matches the panel scrolls inside itself; the page never
  scrolls sideways at 320 px. Long area names ("Whitchurch-Stouffville") wrap
  inside the option, and the hint wraps under the name if needed (D-11).
- Field 52 px and options 44 px, full width, no gaps (L2-065).

## Accessibility

### Role and pattern

[APG Combobox](https://www.w3.org/WAI/ARIA/apg/patterns/combobox/), list
autocomplete with manual selection. The input has `role="combobox"`,
`aria-autocomplete="list"`, `aria-controls` pointing at the
`role="listbox"`, `aria-expanded` true only while options show, and
`aria-activedescendant` naming the active `role="option"`, which has
`aria-selected="true"`. DOM focus stays in the input. The landmark is the
consumer's `<form role="search">`.

### Keyboard

| Key | Action |
|---|---|
| Typing | Filters suggestions; opens the listbox when there are matches. |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Opens the listbox if closed and there are matches; moves the active option, wrapping at the ends. The text does not change until Enter. |
| <kbd>Alt</kbd>+<kbd>↓</kbd> | Opens the listbox without moving the active option. |
| <kbd>Enter</kbd> | With an active option: fills the field with its label, emits `areaChosen`, closes the list, and does not submit. With none: submits the form. |
| <kbd>Esc</kbd> | Closes the listbox; with the list closed, clears the field; with the field empty, does nothing, so the dialog's own Esc closes it. |
| <kbd>←</kbd> / <kbd>→</kbd>, <kbd>Home</kbd> / <kbd>End</kbd> | Move the text cursor, not the options. |
| <kbd>Tab</kbd> | Closes the listbox without choosing and moves on. |

### Focus

- Real focus stays in the field, with the flush pepper ring on the pill.
- The active option is scrolled into view within the panel.
- A click or tap on an option picks it without moving focus out of the field
  (the pointer press is prevented from blurring the input).
- Submitting is the consumer's: the search dialog closes and focus moves to
  the listing's result count.

### Labelling

- Named "Area or postal code" by the form field's visually hidden label; the
  dialog title "Where’s your event?" and the visible help give the question
  and an example.
- The listbox is named by `listLabel` ("Matching areas").
- Each option's name is the area and its region: "Scarborough, City of
  Toronto".
- Errors and warnings are referenced from `aria-describedby` by the form
  field.

### Announcements

- The count status announces `matchCountText(n)` politely once typing pauses
  for 500 ms ("3 areas match"), and `noMatchText` through the visible
  no-match status.
- `errorAnnouncement` is announced once through the count status when the
  consumer sets it after a refused submit.
- The out-of-area warning is announced by the [form field](form-field.md).

### Motion

None on the list. The edge transition uses `--duration-fast`, which reduced
motion zeroes; the dialog's entry motion is the dialog's.

## Content and internationalisation

- Placeholder "Area or postal code"; help "An area like Scarborough, or a
  postal code like M1B 2K3."; list label "Matching areas"; no match "No
  matching areas"; count "1 area matches" / "3 areas match".
- Suggestions are L2-010 area names exactly ("Whitchurch-Stouffville",
  "Downtown Toronto") with their region as the hint. Neighbourhoods that are
  not areas (Leslieville, Malton) do not appear.
- Matching ignores case and accents and finds the typed text anywhere in the
  area name; names that start with it come first, then the rest, each
  alphabetical (D-4).
- Postal codes are shown uppercase with a space ("M1B 2K3") once the consumer
  normalises them; only the first three characters are kept, which the help
  or a privacy note says where it matters.
- Error "Enter a valid postal code, like M5V 2T6"; out of area "Sweet Hand
  currently serves Toronto and the GTA". No exclamation marks.
- French area names do not exist; French UI strings run about 30 % longer and
  wrap in the help and statuses.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent) or the typed text changes; the filtered,
  ranked and highlighted option list is computed once per text change (30
  areas, normalised once on `areas` change), not in the template.
- One `input`, one `keydown` and one `blur` listener; one 500 ms debounce
  timer for the count status, cleared on destroy. No observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Combobox.ts`
  renders the search dialog field for Marcia, types "s", "sc", "scar" (Scarborough,
  City of Toronto), presses ↓ and Enter, then types "Barrie" for the no-match
  status; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it
  at roughly 100–300 ms.
- Composite scenarios: `SearchDialog`, `Listing`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the inline panel pushes the region list down only while
  the person types in it; the raised panel is in flow inside the dialog body.
- Weight: no dependencies beyond the framework; the CDK Overlay is not used
  (D-7).

## Acceptance criteria

### Rendering

- **AC-1** Given the search dialog opens, when the combobox renders in its form field with `labelHidden`, then the input is `input.input[type="search"][role="combobox"]` inside `div.search-field` with the pin icon, has `aria-autocomplete="list"`, `aria-controls` naming a hidden `ul.suggestions[role="listbox"]` labelled "Matching areas", `aria-expanded="false"`, focus, and the name "Area or postal code". (L2-068)
- **AC-2** Given the combobox, when it is inspected, then the input has `autocomplete="postal-code"`, `autocapitalize="characters"` and `enterkeyhint="search"`. (L2-065)
- **AC-3** Given the listing at 1280 px, when the filter column renders, then the combobox sits under "Area" with `suggestions="inline"`, and typing "pick" shows Pickering in a `.suggestions.suggestions--inline` list that pushes the region buttons down. (L2-009)

### Suggestions

- **AC-4** Given Marcia types "scar", when suggestions appear, then the listbox shows "Scarborough" with "Scar" in `<mark>` and the hint "City of Toronto", `aria-expanded` is "true", and no option is active. (L2-011)
- **AC-5** Given Marcia types "SCAR", "scar" or "Scár", when suggestions appear, then each shows Scarborough. (L2-011)
- **AC-6** Given Marcia types "york", when suggestions appear, then they are York (City of Toronto), East York and North York, in that order: the name that starts with the text first, then the names that contain it, alphabetically. (L2-011)
- **AC-7** Given Marcia types "Barrie", when matching runs, then the listbox is hidden, `aria-expanded` is "false", a `p.suggestions__empty[role="status"]` outside the listbox reads "No matching areas", and the active filters do not change. (L2-011)
- **AC-8** Given Marcia types "M1B 2K3", when matching runs, then no listbox and no "No matching areas" status appear, and pressing Enter submits the form with "M1B 2K3". (L2-012)
- **AC-9** Given Marcia types "m", when suggestions appear, then at most 8 options show and, if more match, the panel scrolls inside itself without the page scrolling sideways. (L2-064)

### States

- **AC-10** Given Marcia submits "12345", when the consumer sets the field's error and `errorAnnouncement` "Enter a valid postal code, like M5V 2T6", then the input has `aria-invalid="true"` and the danger edge, keeps "12345", and the status announces the error once while focus stays in the input. (L2-012)
- **AC-11** Given Marcia submits "K1A 0B1", when the consumer sets the field's warning "Sweet Hand currently serves Toronto and the GTA", then the input has no `aria-invalid`, the warning is in its `aria-describedby`, and the results do not change. (L2-012)
- **AC-12** Given Marcia submits "M1B 2K3" and the search runs, when the combobox renders `readonly`, then it keeps "M1B 2K3", the list stays closed, and typing changes nothing. (L2-012)
- **AC-13** Given the listing is offline, when the filter column renders, then the combobox is `disabled` and skipped by Tab, along with the region buttons. (L2-091)

### Keyboard and focus

- **AC-14** Given "m" typed with Markham, Milton and Mississauga suggested, when Marcia presses ↓ twice, then Milton has `aria-selected="true"`, the input's `aria-activedescendant` is Milton's id, focus is still in the input, and the text is still "m". (L2-067)
- **AC-15** Given Milton is active, when Marcia presses Enter, then the field reads "Milton", `areaChosen` emits Milton, the list closes, and the form is not submitted. (L2-011)
- **AC-16** Given the list is open in the search dialog, when Marcia presses Esc, then the list closes; a second Esc clears the field; a third Esc reaches the dialog, which closes. (L2-067)
- **AC-17** Given the list is open, when Marcia presses Tab, then the list closes without choosing and focus moves to the next control. (L2-067)
- **AC-18** Given the list is open on a phone, when Marcia taps "Scarborough", then it is picked and focus stays in the input. (L2-065)
- **AC-19** Given the combobox receives keyboard focus, when it renders, then a flush `--color-focus-ring` ring follows the pill with at least 3:1 contrast against the field and the dialog surface. (L2-067)

### Screen readers

- **AC-20** Given "scar" typed, when Scarborough is active, then a screen reader announces the option as "Scarborough, City of Toronto", and after typing pauses the status has said "1 area matches". (L2-068)
- **AC-21** Given the search dialog in its empty, suggestions, no-match, invalid and out-of-area states, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)

### Theming

- **AC-22** Given the dark theme, when the raised panel renders in the dialog with Scarborough active, then option text measures at least 4.5:1 on `--color-bg-surface-raised` and on the `--color-bg-subtle` active fill, the hint at least 4.5:1, and the accent bar at least 3:1 against the fill. (L2-069)

### Responsive

- **AC-23** Given a 320 px viewport, when Marcia types "whit", then "Whitby" and "Whitchurch-Stouffville" show with their hints, long names wrap inside the option, each option is at least 44 CSS px tall, and nothing scrolls sideways. (L2-064)

### Performance

- **AC-24** Given the `Combobox` perf-test scenario, when "scar" is typed one key at a time, then each update of the suggestions is painted within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/combobox/`; files
  `combobox.component.*` (selector `sh-combobox`, class
  `ComboboxComponent`), `area-match.ts` (pure normalise, match, rank and
  highlight function, unit-testable) and `combobox.types.ts` (`AreaOption`).
  It injects the optional `FormFieldContext`.
- Styles: `.search-field`, `.suggestions`, `.suggestions--inline`,
  `.suggestion`, `.suggestion__hint`, `.suggestions__empty` move into the
  component; `.search-field` is shared with [text field](text-field.md)'s
  pill search, so it lives in the shared field stylesheet.
- Normalisation: `NFD` then strip combining marks, lower-case (`en-CA`), for
  both the areas (once) and the text (per input).
- Postal detection for D-5: `/^[A-Za-z]\d/` after trimming.
- Mock drift to fix when the mocks are next touched: add the combobox wiring
  to `pages/caterers/*` and `dialogs/filters/*`; replace the disabled no-match
  option in `dialogs/search/no-match`; move the help into the field.
- Design-system catch-up for D-11: `.suggestion { flex-wrap: wrap; padding-block: var(--space-2); }` and `overflow-wrap: anywhere` on the name; the rendering applies it with a specimen-only style.
- The CDK `ActiveDescendantKeyManager` may drive the active option; no CDK
  Overlay.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Where do the help and messages go relative to the panel?* The combobox renders the field, the panel and its statuses inside the [form field](form-field.md)'s `div.field`, with the field's message and help directly under the input and the panel after them, as the design-system anatomy shows. The mocks' help inside `.search-field` with an inline margin is drift.
- **D-3** *How is "No matching areas" shown?* As a `role="status"` paragraph outside a hidden listbox, never as a disabled option; the design system fixed the mock that read it as "1 of 1".
- **D-4** *Does matching find the text anywhere, or only at the start?* Anywhere, as L2-011.3 requires ("finds the typed text anywhere in the area name"). The design-system page says "start with"; to keep its feel, names that start with the text are listed first. This contradicts the design-system page and is raised with design.
- **D-5** *What happens while a postal code is typed?* Text that starts letter-digit is treated as a postal code: no suggestions and no no-match status, so "M1B 2K3" never reads "No matching areas". A single letter ("m") still suggests areas.
- **D-6** *Is this the only way to give an event's location?* No. It is the only way to search the listing by place. The enquiry form asks for one area with a [select](select.md) and an optional postal code text field, as `dialogs/enquiry/*` and the select page show; the combobox page's "the one way to say where an event is" is read as the search.
- **D-7** *Is the panel an overlay?* No. Both variants are in flow under the field (the design-system CSS has no positioning), so there is no CDK Overlay, no `z-index`, and nothing to reposition above the phone keyboard.
- **D-8** *How is the invalid-postal-code error announced when focus is already in the field?* Through the combobox's polite status, once, from `errorAnnouncement`. The mocks use `role="alert"` on the error; the form field keeps errors out of live regions, and the single-field rule (move focus to the field) does nothing when focus is already there.
- **D-9** *How is the active option shown in forced colours?* With `forced-color-adjust: none` on the active option and `Highlight` / `HighlightText`, because a fill and an inset shadow disappear in Windows high contrast; `aria-selected` carries it for assistive technology regardless. `components.css` needs the rule (catch-up).
- **D-10** *What does picking do in each place?* It always fills the text, closes the list and emits `areaChosen`. The search dialog then waits for "Show caterers" (or Enter); the filter column applies the area; the filter sheet adds a chip and clears the text. The component stays the same; the consumer decides.
- **D-11** *Do long area names wrap in a narrow option?* Yes. `.suggestion` today is a one-line flex row, so "Whitchurch-Stouffville" plus "York Region" overflows a 15rem filter column or a 320 px sheet. The option wraps (name first, hint under it), keeps its 44 px minimum and gains `--space-2` block padding; nothing truncates, matching the design system's "labels wrap; nothing truncates" rule.
