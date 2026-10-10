# Form layout

| Field | Value |
|---|---|
| Selector | `sh-form`, `sh-fieldset`, `sh-form-row`, `sh-form-summary`, `sh-form-actions`, `sh-save-status` |
| Library path | `frontend/projects/components/src/lib/form-layout/` |
| Status | planned |
| Traces to | L2-022, L2-026, L2-038, L2-039, L2-060, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`form-layout.html`](../../design-system/components/form-layout.html) |
| Source mocks | [`dialogs/enquiry/invalid`](../../mocks/dialogs/enquiry/invalid.html), [`dialogs/enquiry/busy`](../../mocks/dialogs/enquiry/busy.html), [`pages/register/invalid`](../../mocks/pages/register/invalid.html), [`pages/register/submitting`](../../mocks/pages/register/submitting.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/profile-details/default`](../../mocks/pages/profile-details/default.html), [`pages/profile-details/saving`](../../mocks/pages/profile-details/saving.html), [`pages/profile-details/saved`](../../mocks/pages/profile-details/saved.html), [`pages/profile-details/invalid`](../../mocks/pages/profile-details/invalid.html), [`pages/profile-events/default`](../../mocks/pages/profile-events/default.html), [`pages/profile-certificate/default`](../../mocks/pages/profile-certificate/default.html), [`pages/profile-certificate/invalid`](../../mocks/pages/profile-certificate/invalid.html), [`pages/admin-audit/default`](../../mocks/pages/admin-audit/default.html), [`pages/admin-metrics/invalid`](../../mocks/pages/admin-metrics/invalid.html) |
| Rendering | [`form-layout.html`](form-layout.html) |

## Purpose and scope

Form layout is the set of containers around [form fields](form-field.md):
the form column, groups with a question as their legend, pairs of short
fields, the error summary that links to each problem, the actions row and the
autosave status. It decides order and spacing; the fields decide everything
inside a field. It covers both kinds of Sweet Hand form, which never mix:
**submit forms** (sign in, create an account, send an enquiry to Pelau House,
save a certificate, record a breach) that end in one primary button, and
**autosave forms** (Kendra's profile editor) that save each field 2 seconds
after typing stops or on blur and report it in a save status, with no Save
button.

A short task started from a button is a form inside a [dialog](dialog.md)
(the dialog owns its header, body, footer and full-screen behaviour); a
longer one is a page. There are no inline edit forms in page content
(AGENTS.md). Operator list filters use the toolbar variant.

Out of scope:

- Everything inside a field: [form field](form-field.md) and the controls.
- Dialog chrome, the footer with Cancel and the primary, and the full-screen
  enquiry below 48rem: [dialog](dialog.md) and [sheet](sheet.md).
- The buttons themselves and their busy state: [button](button.md).
- Failure alerts ("Your enquiry wasn’t sent… Reference 7F3K-92QD"):
  [alert](alert.md).
- Validation rules, the autosave timer and what is sent: the consumer's form
  logic. The layout only renders the summary, the status and the busy
  presentation it is given.
- Groups of checkboxes or radios inside a fieldset: [checkbox](checkbox.md),
  [radio group](radio-group.md); the region filter groups:
  [filter list](filter-list.md).

## Usage

Inventory from `usage_inventory.py docs/mocks form "form|div"`,
`usage_inventory.py docs/mocks field-row "div"`, and searches for
`form-summary` (36 screens), `form-actions`, `save-status` (42 uses),
`<fieldset` and `class="toolbar"` in `docs/mocks/`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/sign-in`, `register`, `register-caterer`, `forgot-password`, `reset-password`, `two-factor` | submit form, compact column in `.auth` (28rem), large fields, block primary | summary (h2) | default, invalid "Fix 3 things to create your account", submitting (fields read-only), error | canvas |
| Form dialogs (`enquiry`, `review`, `review-response`, `dish`, `report`, `edit-details`, `change-password`, `add-operator`, `add-cuisine`, `photo-details`, `record-breach`, reasons) | submit form, compact column in `.dialog__panel--form`; actions in the dialog footer | summary (h3) "Fix 4 things to send your enquiry"; rows Event date + Guests, Event area + Postal code | default, invalid, busy, failed, restored | dialog |
| `pages/profile-details/*`, `profile-cuisines/*`, `profile-events/*` | autosave form in `.work-main`, named by the page title; save status in the page intro | status "All changes saved", "Saving…", "Saved at 10:14 a.m. · live on your page within a minute", "Not saved: fix 2 things below"; summary (h2) "Fix 2 things so we can save" | loaded, saving, saved, invalid, read-only (pending review, suspended) | canvas |
| `pages/profile-events/*`, `profile-cuisines/*` | fieldsets with an `h2` legend and a shared help line; row Smallest event + Largest event | "Guests", "Occasions", "Cuisines", "Areas you serve" | default, invalid | canvas |
| `pages/profile-certificate/*` | submit form on a page; actions row with primary and save status | "Save certificate" + "Saved Tue 2 Sep"; summary "Fix 1 thing to save" | default, saving (primary busy), invalid "This certificate has expired", expiring | canvas |
| `pages/admin-audit/*`, `admin-metrics/*` | toolbar form with `aria-label` | Operator, Action, Target, From, To + Apply; From, To, Show by + Apply + Export CSV | default, invalid "Choose a range of 24 months or less", loading | canvas |
| Design system only | sticky actions (`.form-actions--sticky`) for a long submit form on phones | "Save breach record" | default | canvas |
| Single-field forms (`pages/thread`, `dashboard-enquiry`, `dialogs/decline-enquiry`) | no summary; the error sits under the field | — | invalid | reply box, dialog |

Not built by this component: the reply box (`.reply-box`, [message](message.md))
and `pages/profile-photos`' upload summary ("2 photos weren’t added"), which
uses this CRD's `sh-form-summary` with a different heading.

## Anatomy

1. **Form column** — `form.form[novalidate]`: flex column, `--space-6` between
   blocks (`.form--compact`: `--space-5`), maximum 40rem. Named by
   `aria-labelledby` (the page title) or `aria-label`, so it is a form
   landmark.
2. **Toolbar (variant)** — `form.toolbar[aria-label]`: a wrapping row of
   fields and buttons, bottoms aligned, `--space-3` gaps, `--space-6` below;
   each field at least 10rem.
3. **Fieldset** — `fieldset.stack` with `legend` (label type) or `legend > h2`
   (`--text-h3`) for an editor section; browser border and padding removed;
   an optional shared help line referenced by `aria-describedby` on the
   fieldset.
4. **Field row** — `div.field-row`: one column, two equal columns from 36rem,
   `--space-4` gap. Never three.
5. **Error summary** — `div.form-summary[role="alert"][tabindex="-1"]`,
   `aria-labelledby` its heading (`h2` on pages, `h3` in dialogs); a list of
   links, one per problem, each to its control's id. `--color-danger-bg`
   tint, `--color-danger-fg` text, `--radius-md`, `--space-4` padding.
6. **Actions** — `div.form-actions`: wrapping row, `--space-3` gaps,
   `--space-4` above, start-aligned; holds the primary and optionally a save
   status. `.form-actions--sticky` pins it to the bottom with
   `--color-bg-canvas`, a hairline `--color-border-default` top edge and
   safe-area padding.
7. **Save status** — `p.save-status[role="status"]` (or a `span` inside the
   actions row): 44 px high, `--text-body-sm`; icon or pulsing dot, then the
   words. `--saved` success, `--error` danger, plain muted otherwise.

Hosts: every selector is layout-transparent (`display: contents`) and renders
its element in the light DOM, so `.form > *` gaps, `.field-row` grid children,
`.toolbar .field` widths and native form submission work exactly as in the
mocks (D-2).

## API

### `sh-form`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `layout` | `'column' \| 'compact' \| 'toolbar'` | `'column'` | no | `column` renders `form.form`; `compact` `form.form.form--compact` (auth and dialog forms); `toolbar` `form.toolbar`. |
| `mode` | `'submit' \| 'autosave'` | `'submit'` | no | `autosave` cancels the native submit (Enter in a text field) and emits `saveRequested` instead, so an autosave page never navigates. |
| `labelledBy` | `string \| null` | `null` | no | Rendered as `aria-labelledby` (the page title's id). One of `labelledBy` or `ariaLabel` is required. |
| `ariaLabel` | `string \| null` | `null` | no | Rendered as `aria-label` ("Filter the audit log", "Date range"). |
| `action`, `method` | `string \| null` | `null` | no | Passed through for forms that post natively (sign-in). |

`novalidate` is always rendered: the product's messages replace browser
bubbles.

| Output | Payload | Emitted when |
|---|---|---|
| `submitted` | `SubmitEvent` | `mode="submit"`: the form is submitted (Enter or the submit button). The component calls `preventDefault()` unless `action` is set. |
| `saveRequested` | `SubmitEvent` | `mode="autosave"`: Enter in a text field; the consumer saves the focused field as on blur. |

Slot: default — fields, fieldsets, rows, summary, actions, notes.

### `sh-fieldset`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `legend` | `string` | — | yes | The group's question ("Guests", "Areas you serve"). |
| `legendHeading` | `'h2' \| 'h3' \| null` | `null` | no | Wraps the legend text in that heading (`<legend><h2>Guests</h2></legend>`) for editor sections, so the outline and the group agree. |
| `optionalMarker` | `string \| null` | `null` | no | Renders `span.optional` inside the legend. |
| `help` | `string \| null` | `null` | no | Renders `p.field__help#{id}-help` after the legend and puts its id in the fieldset's `aria-describedby`; one help line serves every field in the group. |
| `error` | `string \| null` | `null` | no | Renders `p.field__error#{id}-error` after the help and first in `aria-describedby` (group errors such as "Minimum guests can’t be more than maximum"). |

Renders `<fieldset class="stack">`; spacing between consecutive fieldsets is
`--space-8`. Slot: default — the group's fields or rows.

### `sh-form-row`

No inputs. Renders `div.field-row`; slot: default — exactly two
[form fields](form-field.md).

### `sh-form-summary`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | "Fix 4 things to send your enquiry", "Fix 1 thing to save". |
| `headingLevel` | `2 \| 3` | `2` | no | `h2` on pages, `h3` inside dialogs. |
| `items` | `readonly { controlId: string; message: string }[]` | — | yes | One `<li><a href="#controlId">message</a></li>` each, in form order; messages repeat the fields' errors word for word. |
| `attempt` | `number` | `0` | no | Each time it changes while `items` is non-empty, the summary takes focus after it renders (a new failed submit or save). |

| Output | Payload | Emitted when |
|---|---|---|
| `itemActivated` | `string` (the control id) | A summary link is activated by click, Enter or tap. |

Activating a link prevents fragment navigation (no router change), focuses
the control with that id and scrolls it into view clear of sticky actions
(D-6). Method `focus()` focuses the summary. Not rendered when `items` is
empty.

### `sh-form-actions`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `sticky` | `boolean` | `false` | no | Adds `.form-actions--sticky`. While mounted, sets the page's `scroll-padding-bottom` to its measured height so a focused field is never hidden behind it, and restores it on destroy. |

Slot: default — the primary [button](button.md) first, then an optional
`sh-save-status`.

### `sh-save-status`

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `state` | `'loaded' \| 'saving' \| 'saved' \| 'error'` | `'loaded'` | no | `loaded`: plain tick, muted ("All changes saved"). `saving`: pulsing dot ("Saving…"). `saved`: circled tick, `.save-status--saved`. `error`: circled "!", `.save-status--error`. |
| `text` | `string` | — | yes | The words, from the resource files, with times formatted by the consumer ("Saved at 10:14 a.m. · live on your page within a minute"). |
| `inline` | `boolean` | `false` | no | Renders a `span` without `role` (inside `.form-actions`, after "Save certificate") instead of the page-intro `p[role="status"]`. |

- Boolean inputs accept the bare attribute.
- Translation: `legend`, `help`, `error`, `heading`, `items[].message`,
  `ariaLabel` and `text` come from the resource files (L2-064). No component
  contains a user-facing string.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Page submit form | `form.form` + `.form-actions` (start-aligned primary, optional inline save status) | Food handler certificate. |
| Autosave form | `form.form`, `mode="autosave"`, `p.save-status` in the page intro, no Save button, ends with a "Done" link | Business details, cuisines and areas, guests and occasions. |
| Compact form | `form.form.form--compact` | Auth forms (in `.auth`) and dialog forms (actions in the dialog footer). |
| Toolbar | `form.toolbar[aria-label]` | Operator filters with Apply: audit log, metrics. |
| Sticky actions | `.form-actions--sticky` | A long submit form on phones (breach record). |

Widths are set by the container, never by fields: auth 28rem (`.auth`), page
form 40rem (`.form`), dialog form 40rem (`.dialog__panel--form`). Gaps:
`--space-6` between blocks (`--space-5` compact), `--space-4` in a row,
`--space-3` between actions, `--space-8` between fieldsets.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Fields with help; primary enabled | Form landmark named by the title |
| Submitting / busy | consumer: controls `readonly` (selects `disabled`), primary `busy` | Sunken fields, spinner in the primary; Cancel stays | Values readable; primary busy; focus kept |
| Invalid (after submit) | summary `items` non-empty, `attempt` changed | Summary at the top in the danger tint; each field shows its error | Summary announced (`role="alert"`) and focused; links move to fields |
| Fixing | consumer clears a field's error on input or blur | That field's error disappears; the summary stays until the next submit | — |
| Autosave loaded | `state="loaded"` | Plain tick, muted "All changes saved" | Polite status |
| Saving | `state="saving"` | Pulsing dot, "Saving…" | Polite status |
| Saved | `state="saved"` | Circled tick, success colour, "Saved at 10:14 a.m. · live on your page within a minute" | Polite status |
| Not saved | `state="error"` + summary | Circled "!", danger colour, "Not saved: fix 2 things below" | Polite status; summary focused |
| Failed | consumer shows an [alert](alert.md) above the actions | Every value kept; primary becomes "Try again" | Alert announced |
| Read-only (profile under review) | consumer renders read-only values instead of the form | [Form field](form-field.md) read-only values under a banner | No form landmark |
| Toolbar invalid | consumer sets a field error ("Choose a range of 24 months or less") | Error under From; results unchanged | Field invalid and described |

## Markup

```html
<!-- rendered: dialog form, invalid (enquiry to Pelau House); footer belongs to the dialog -->
<form class="form form--compact" novalidate aria-labelledby="dlg-title">
  <div class="form-summary" id="error-summary" role="alert" tabindex="-1" aria-labelledby="error-summary-title">
    <h3 id="error-summary-title">Fix 4 things to send your enquiry</h3>
    <ul>
      <li><a href="#date">Choose a date at least 2 days from today</a></li>
      <li><a href="#guests">Enter a whole number of guests from 1 to 5,000</a></li>
      <li><a href="#occasion">Choose an occasion</a></li>
      <li><a href="#message">Tell the caterer a little more (at least 20 characters)</a></li>
    </ul>
  </div>
  <div class="field-row">
    <div class="field">…Event date…</div>
    <div class="field">…Guests…</div>
  </div>
  <div class="field-row">
    <div class="field">…Event area…</div>
    <div class="field">…Postal code (optional)…</div>
  </div>
  <div class="field">…Occasion…</div>
  <div class="field">…Message…</div>
</form>
```

```html
<!-- rendered: autosave page form with fieldsets (Guests and occasions) -->
<div class="page-intro">
  <h1 id="page-title">Guests and occasions</h1>
  <p class="save-status" role="status"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…tick…</svg>All changes saved</p>
</div>
<form class="form" novalidate aria-labelledby="page-title">
  <fieldset class="stack" aria-describedby="guests-help">
    <legend><h2>Guests</h2></legend>
    <p class="field__help" id="guests-help">Whole numbers from 1 to 5,000. Your page says “Serves 20–300 guests”.</p>
    <div class="field-row">
      <div class="field">…Smallest event…</div>
      <div class="field">…Largest event…</div>
    </div>
  </fieldset>
  …
</form>
```

```html
<!-- rendered: save status states -->
<p class="save-status" role="status"><span class="dot dot--pulse" aria-hidden="true"></span>Saving…</p>
<p class="save-status save-status--saved" role="status"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…circled tick…</svg>Saved at 10:14 a.m. · live on your page within a minute</p>
<p class="save-status save-status--error" role="status"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…circled !…</svg>Not saved: fix 2 things below</p>
```

```html
<!-- rendered: page submit form actions with inline status (certificate) -->
<div class="form-actions">
  <button class="btn btn--primary" type="submit">Save certificate</button>
  <span class="save-status save-status--saved"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg>Saved Tue 2 Sep</span>
</div>
```

```html
<!-- rendered: toolbar (audit log) -->
<form class="toolbar" novalidate aria-label="Filter the audit log">
  <div class="field">…Operator…</div><div class="field">…Action…</div><div class="field">…Target…</div>
  <div class="field">…From…</div><div class="field">…To…</div>
  <button class="btn btn--primary" type="submit">Apply</button>
</form>
```

Sticky actions differ only by `.form-actions--sticky`.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: enquiry form in its dialog -->
<sh-form layout="compact" labelledBy="dlg-title" (submitted)="send()">
  <sh-form-summary [headingLevel]="3" [heading]="t('enquiry.fixN', { n: errors().length })" [items]="errors()" [attempt]="attempts()" />
  <sh-form-row>
    <sh-form-field controlId="date" …><sh-text-field type="date" … /></sh-form-field>
    <sh-form-field controlId="guests" …><sh-text-field inputmode="numeric" … /></sh-form-field>
  </sh-form-row>
  …
</sh-form>

<!-- consumer: autosave editor -->
<sh-save-status [state]="saveState()" [text]="saveText()" />
<sh-form mode="autosave" labelledBy="page-title" (saveRequested)="saveFocused()">
  <sh-fieldset legendHeading="h2" [legend]="t('profile.guests')" [help]="t('profile.guestsHelp', range)">
    <sh-form-row>…</sh-form-row>
  </sh-fieldset>
</sh-form>
```

The e2e page objects find the summary by role and heading, its links by
text, and the status by role; the classes and attributes above are the
contract. Icon path data is free to change.

## Design

- Column `--space-6` gaps (`--space-5` compact), `max-width: 40rem`;
  consecutive fieldsets `--space-8` apart; the summary is followed by
  `--space-6` (a margin rule, replacing the mocks' spacer divs).
- Field row: `grid-template-columns: minmax(0, 1fr)`, two columns from 36rem,
  `--space-4` gap.
- Legend `--text-label`, `--space-2` below; with a heading, `--text-h3`.
- Summary `--space-4` padding, `--radius-md`, heading `--text-label` at
  `--font-size-md`, list `--space-2` above and `--space-5` start padding,
  links inherit the colour and are underlined.
- Actions `--space-3` gaps, `--space-4` top padding, start-aligned; sticky:
  `--color-bg-canvas`, hairline `--color-border-default` top edge,
  `--space-4` block padding plus `env(safe-area-inset-bottom)`, layer
  `--z-raised`.
- Save status: inline-flex, `--space-2` gap, `--text-body-sm`, 44 px min
  height (`--target-comfortable`); icon `--icon-size-sm`; dot `--space-2`,
  pulsing over `--duration-loop`.
- Toolbar: `--space-3` gaps, `--space-6` below, `align-items: flex-end`;
  fields at least 10rem.
- No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Summary fill | `--color-danger-bg` | `--palette-sorrel-50` | `--palette-sorrel-950` |
| Summary text and links | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Sticky actions fill | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Sticky actions edge | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Status, loaded and saving | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Status, saved | `--color-success-fg` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Status, not saved | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Legend | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Summary text and links |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Not-saved status, field errors on a page |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | Saved status |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Loaded and saving status, help |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Legend |

The summary and statuses never rely on colour: the summary has a heading
with a count and a list, each status has an icon or dot and words. Forced
colours: the summary keeps its text and underlined links; add a `CanvasText`
border so its edge survives (D-9).

## Responsive behaviour

- Below 36rem everything is one column, including `.field-row`; auth forms
  use block primaries.
- From 36rem `.field-row` splits into two equal columns. Never three.
- Below 48rem the enquiry dialog fills the screen and its footer stays at the
  bottom ([dialog](dialog.md)); sticky actions do the same for a long page
  form, padded by the safe area.
- From 62rem the profile editor gains its side navigation and from 75rem the
  live preview; the form column stays 40rem.
- The toolbar wraps fields onto new lines with a 10rem minimum each; Apply
  wraps with them.
- A focused field is never hidden behind sticky actions or the on-screen
  keyboard (WCAG 2.4.11): sticky actions set the scroll padding; summary links
  scroll their field into view above it.
- At 320 px nothing scrolls sideways; at 200 % zoom at 1280 px the form stays
  one readable column.

## Accessibility

### Role and pattern

A `<form>` named by `aria-labelledby` or `aria-label` is a form landmark.
Groups are `<fieldset>` and `<legend>`. The error summary follows WCAG 3.3.1
(errors identified in text), 3.3.3 (how to fix) and the ARIA21 technique: a
focusable `role="alert"` container named by its heading, with links to the
fields. The save status is a polite `role="status"`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through fields in visual order: left then right in a row, top to bottom otherwise; then Cancel and the primary in a dialog, or the primary in the actions row. |
| <kbd>Enter</kbd> in a text field | Submit forms: submits. Autosave forms: saves the field (`saveRequested`), never navigates. Never in a textarea. |
| <kbd>Enter</kbd> on a summary link | Focuses the field it names. |
| <kbd>Esc</kbd> | In a dialog form, closes the dialog unless busy (the dialog's). |

### Focus

- On a failed submit or save, focus moves to the summary, not the first field,
  so the count of problems is heard first (D-5).
- A summary link puts focus in its control, which reads its label, error and
  help.
- Focus never moves on blur validation or on a save. After a page save it
  stays where it was.
- Under reduced motion the move to the summary and the scroll to a field do
  not animate.

### Labelling

- The summary is `aria-labelledby` its heading; its links repeat the field
  errors word for word.
- A fieldset's shared help and group error are on the fieldset's
  `aria-describedby`, error first.
- Busy buttons keep their labels; progress is announced by the save status or
  the consumer.

### Announcements

- The summary (`role="alert"`) is announced when it appears.
- The save status (`role="status"`, polite) announces "Saving…", "Saved at
  10:14 a.m. · live on your page within a minute" and "Not saved: fix 2
  things below" as `state` and `text` change. An inline status in the actions
  row has no role; the page's own status announces the save.

### Motion

The saving dot pulses over `--duration-loop`; `prefers-reduced-motion:
reduce` stops it and the word "Saving…" carries the state. Nothing else
animates.

## Content and internationalisation

- Summary heading: "Fix {n} thing(s) to {goal}": "Fix 4 things to send your
  enquiry", "Fix 1 thing to save", "Fix 2 things so we can save". Never
  "There is a problem" or "There are 3 problems".
- Summary items repeat the field's own error and link to it.
- Save status: "All changes saved", "Saving…", "Saved at 10:14 a.m.", "Not
  saved: fix 2 things below"; times in `America/Toronto`, "a.m."/"p.m.",
  dates "Saved Tue 2 Sep".
- Legends are nouns ("Guests", "Occasions", "Areas you serve"); help states
  the rule with numbers ("Whole numbers from 1 to 5,000").
- A page form's button says what it saves ("Save certificate"); a dialog's
  says what it does ("Send enquiry", "Add dish", "Send report").
- Plural forms come from the resource files (ICU plural), so French and
  English count correctly.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the summary's link list and the status
  class are computed once per input change, not in the template.
- The summary's focus happens once per `attempt` change, after render. Sticky
  actions use one `ResizeObserver` to keep the scroll padding equal to their
  height, disconnected on destroy. No other observers or timers (the autosave
  timer is the consumer's).
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/FormLayout.ts`
  renders Kendra's Business details autosave form (save status cycling
  loaded → saving → saved) and the enquiry form for Pelau House going from
  default to invalid with four summary items; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `EnquiryDialog`, `ProfileDetails`, `AuditLog`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the summary appears only after a submit, never while
  typing; the save status keeps a 44 px minimum height so changing its text
  does not move the form; field rows never reflow on input.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given the enquiry dialog for Pelau House, when its form renders with `layout="compact"`, then it is `form.form.form--compact[novalidate]` named by the dialog title, with `--space-5` between blocks and Event date + Guests and Event area + Postal code each in a `div.field-row`. (L2-022)
- **AC-2** Given a 360 px viewport, when the enquiry rows render, then each `.field-row` is one column; given 768 px, then each is two equal columns with a `--space-4` gap and no truncated value. (L2-026)
- **AC-3** Given Kendra's Guests and occasions page, when the Guests fieldset renders with `legendHeading="h2"` and the help "Whole numbers from 1 to 5,000. Your page says “Serves 20–300 guests”.", then it is `<fieldset class="stack">` with `<legend><h2>Guests</h2></legend>`, and the fieldset's `aria-describedby` names the help. (L2-068)
- **AC-4** Given the audit log, when the toolbar renders with `ariaLabel` "Filter the audit log", then it is `form.toolbar` exposed as a form landmark with that name, its fields are at least 10rem wide, and Operator "Tomas Reyes" with From 3 Oct and To 10 Oct submits only when Apply is pressed. (L2-060)

### Error summary

- **AC-5** Given Marcia presses "Send enquiry" with four problems, when the summary renders with heading "Fix 4 things to send your enquiry" and `headingLevel` 3, then it is `div.form-summary[role="alert"][tabindex="-1"]` labelled by its `h3`, listing four links whose text equals each field's error and whose `href`s are "#date", "#guests", "#occasion" and "#message". (L2-068)
- **AC-6** Given the summary has just rendered after a failed submit, when the page settles, then focus is on the summary, not on the first field. (L2-068)
- **AC-7** Given focus on the summary link "Enter a whole number of guests from 1 to 5,000", when Marcia presses Enter, then the Guests input is focused and in view, the URL does not change, and `itemActivated` emits "guests". (L2-022)
- **AC-8** Given Marcia fixes Guests and submits again with three problems left, when `attempt` changes, then the summary lists three links under "Fix 3 things to send your enquiry" and takes focus again. (L2-022)
- **AC-9** Given an empty `items` list, when the form renders, then no `.form-summary` element is in the DOM. (L2-066)

### Autosave and submit

- **AC-10** Given Kendra edits her description, when the consumer sets `state="saving"` and then, after the save, `state="saved"` with "Saved at 10:14 a.m. · live on your page within a minute", then the `role="status"` element shows the pulsing dot and "Saving…", then the circled tick in `--color-success-fg` with that text. (L2-038)
- **AC-11** Given Kendra's business name is empty and her description is 35 characters, when the save is refused, then the status shows "Not saved: fix 2 things below" with `.save-status--error`, and a summary "Fix 2 things so we can save" lists both errors. (L2-039)
- **AC-12** Given an autosave form, when Kendra presses Enter in Business name, then the form is not submitted, the page does not navigate, and `saveRequested` is emitted once. (L2-038)
- **AC-13** Given the sign-in form is submitting, when the consumer sets every control read-only and the primary busy, then the email and password keep their values and stay focusable, and no second submit happens. (L2-022)
- **AC-14** Given the certificate page, when "Save certificate" and the inline status "Saved Tue 2 Sep" render in `sh-form-actions`, then they are in `div.form-actions`, start-aligned, with the button first and the status as a `span` without a role. (L2-039)
- **AC-15** Given the metrics toolbar with From 2024-08-31 and To 2026-10-10, when the operator applies it, then From shows "Choose a range of 24 months or less" through its form field and the charts do not change. (L2-061)

### Keyboard and focus

- **AC-16** Given the enquiry form, when Marcia tabs through it, then the order is Event date, Guests, Event area, Postal code, Occasion, Message, then Cancel and "Send enquiry", matching the visual order. (L2-067)
- **AC-17** Given a long breach record on a 360 px phone with sticky actions, when focus moves to a field near the bottom, then the field is fully visible above the sticky "Save breach record" bar. (L2-067)

### Screen readers

- **AC-18** Given the enquiry invalid, the profile details invalid and the audit toolbar, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)

### Theming

- **AC-19** Given the light and the dark theme, when the summary renders, then its text and links (`--color-danger-fg` on `--color-danger-bg`) measure at least 4.5:1, and the saved status (`--color-success-fg`) and loaded status (`--color-fg-muted`) at least 4.5:1 on the canvas. (L2-069)

### Responsive

- **AC-20** Given a 320 px viewport, when the audit toolbar renders, then its fields wrap onto new lines at least 10rem wide, Apply wraps with them, and the page does not scroll horizontally. (L2-064)
- **AC-21** Given touch input at 360 px, when the sign-in form is measured, then every control is at least 44 px tall and neighbouring targets are at least 8 px apart. (L2-065)

### Motion

- **AC-22** Given `prefers-reduced-motion: reduce`, when the save status shows "Saving…", then the dot does not pulse, and moving focus to the summary does not animate a scroll. (L2-069)

### Performance

- **AC-23** Given the `FormLayout` perf-test scenario, when the enquiry goes from default to invalid with four summary items, then the summary and field errors are painted within 200 ms of the submit (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/form-layout/`; files
  `form.component.*` (`sh-form`, `FormComponent`), `fieldset.component.*`
  (`sh-fieldset`), `form-row.component.*` (`sh-form-row`),
  `form-summary.component.*` (`sh-form-summary`), `form-actions.component.*`
  (`sh-form-actions`), `save-status.component.*` (`sh-save-status`).
- Styles: `fieldset`, `legend`, `.form`, `.form--compact`, `.field-row`,
  `.form-actions`, `.form-actions--sticky`, `.form-summary`, `.toolbar`,
  `.save-status` and `.dot` move from `components.css`; the bare `fieldset`
  and `legend` resets stay global.
- Design-system catch-up: replace the mocks' spacer `div`s with
  `.form-summary { margin-bottom: var(--space-6); }`; add a forced-colours
  border to `.form-summary` (D-9).
- Mocks to correct when next touched: the summary headings ("There is a
  problem", "Fix 1 problem", "Fix 2 things to continue"), the inline
  `gap: var(--space-5)` on auth and dialog forms (`.form--compact`), the
  inline `justify-content` on `.form-actions`.
- Composes [form field](form-field.md) and [button](button.md) through slots;
  composed by [dialog](dialog.md) bodies and editor pages.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What are the hosts?* All six selectors are layout-transparent (`display: contents`) and render their element in the light DOM, so `.form > *` gaps, `.field-row` grid children and native submission behave as in the mocks.
- **D-3** *One component or several?* Six small selectors in one library folder, because the pieces are used independently (a summary in the reply box's dialog, a save status in a page intro outside the form, a row inside a fieldset) and each has its own element and contract.
- **D-4** *Does the form layout make controls read-only while busy?* No. The consumer sets `readonly` on text fields and textareas and `disabled` on selects, as each control's CRD says; a form-wide switch would hide the select's different rule.
- **D-5** *On a failed submit, does focus go to the summary or to the first field in error?* To the summary, as L2-068.3 and the design system require, per the user's decision of 10 Oct 2026; the summary keeps the count of problems audible and links to every field. L2-022.7 ("focus moves to the first field in error") will be amended through engineering-requirements.
- **D-6** *Do summary links use fragment navigation?* No. The link keeps its `href="#id"` for semantics, but activation is handled: focus the control, scroll it into view clear of sticky actions, no URL change, so the router and Back button are not disturbed (L2-003 keeps URLs meaningful).
- **D-7** *What does Enter do in an autosave form?* Saves the field as blur would (`saveRequested`) and never submits or navigates, as the design system's keyboard table says.
- **D-8** *How does a read-only profile render?* With the [form field](form-field.md) read-only value variant under the page's banner, as `profile-details/read-only` shows. The form-layout page mentions a description list; the mock and the form-field page use read-only values, which keep labels and order identical to the editable form.
- **D-9** *Does the summary need a forced-colours edge?* Yes, a `CanvasText` hairline border under `forced-colors: active`, because its tint disappears in Windows high contrast and the box would merge with the form.
- **D-10** *Is the save status in the actions row a live region?* No. Only the page-intro status is `role="status"`; a second live region in the actions would announce the same save twice.
