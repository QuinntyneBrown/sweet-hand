# Inline message

| Field | Value |
|---|---|
| Selector | `sh-field-message` (help, error or warning under a control), `sh-inline-status` (result beside an action), `sh-save-status` (the autosave indicator) |
| Library path | `frontend/projects/components/src/lib/inline-message/` |
| Status | planned |
| Traces to | L2-012, L2-022, L2-024, L2-035, L2-038, L2-042, L2-064, L2-066, L2-068, L2-069 |
| Design system | [`inline-message.html`](../../design-system/components/inline-message.html) |
| Source mocks | [`pages/profile-details/default`](../../mocks/pages/profile-details/default.html), [`pages/profile-details/saving`](../../mocks/pages/profile-details/saving.html), [`pages/profile-details/invalid`](../../mocks/pages/profile-details/invalid.html), [`pages/profile-photos/uploading`](../../mocks/pages/profile-photos/uploading.html), [`dialogs/enquiry/warning`](../../mocks/dialogs/enquiry/warning.html), [`dialogs/enquiry/invalid`](../../mocks/dialogs/enquiry/invalid.html), [`dialogs/search/out-of-area`](../../mocks/dialogs/search/out-of-area.html), [`pages/caterers/postal-invalid`](../../mocks/pages/caterers/postal-invalid.html), [`dialogs/photo-details/invalid`](../../mocks/dialogs/photo-details/invalid.html), [`dialogs/review/invalid`](../../mocks/dialogs/review/invalid.html), [`pages/thread/shared`](../../mocks/pages/thread/shared.html), [`pages/dashboard-enquiry/default`](../../mocks/pages/dashboard-enquiry/default.html) |
| Rendering | [`inline-message.html`](inline-message.html) |

## Purpose and scope

Inline messages are the smallest feedback on Sweet Hand: one line of small
text, sometimes a glyph or a dot, right next to what it is about. Help under a
field says what it needs ("2–80 characters. A new name goes live after our team
checks it."); an error says what is wrong and how to fix it ("Choose a date at
least 2 days from today"); a warning says something worth knowing that does not
block ("This caterer usually serves 20–300 guests"); an inline status reports
the result of an action beside it ("Contact details shared"); and the save
status in a caterer's dashboard says "Saving…", "Saved" or "Not saved: fix 2
things below". They live inside the layout, never over it, and are tied to
their control by `aria-describedby` or announced through a live region.

Use an [alert](alert.md) or banner for a message about the whole page or one
that needs an action, a [toast](toast.md) for something that happened
elsewhere or will disappear, and the error summary (`.form-summary`, [form
layout](form-layout.md)) to list every error on submit.

Out of scope:

- The field itself, its label, `aria-invalid`, the `aria-describedby` list and
  the character counter (`.field__counter`): [form field](form-field.md). It
  places `sh-field-message` and passes the ids in the order error, help,
  counter.
- Validation rules and when a message appears: the page or form.
- The error summary and moving focus to it: [form layout](form-layout.md).

## Usage

Inventory from `usage_inventory.py docs/mocks field__error "span|p"` (and the
same for `field__warning`, `field__help`, `save-status`), plus a read of the
thread's shared state.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| 247 help lines across every form (`profile-details`, `enquiry`, `register`, `dish`, `photo-details`…) | `sh-field-message kind="help"` | "2–80 characters. A new name goes live after our team checks it.", "At least 2 days from today", "Pelau House serves 20–300" | default, beside an error | canvas, card, dialog |
| 55 error lines (`profile-details/invalid`, `enquiry/invalid`, `review/invalid`, `photo-details/invalid`, `add-cuisine/invalid`, `caterers/postal-invalid`, `thread/invalid`…) | `kind="error"` | "Enter a business name of 2 to 80 characters", "Choose a date at least 2 days from today", "Captions describe the photo in 5–125 characters", "Enter a valid postal code, like M5V 2T6", "Keep your reply under 2,000 characters. It's 2,143 now." | invalid | canvas, dialog |
| `dialogs/enquiry/warning` | `kind="warning"` (customer side) | "This caterer usually serves 20–300 guests", "This caterer doesn't list Oshawa as an area they serve" | warning (non-blocking) | dialog |
| `pages/dashboard-enquiry/*` (11 mocks) | `kind="warning"` (caterer side) | "You don't list Downtown Toronto as an area you serve" (D-4) | warning on load | card |
| `dialogs/search/out-of-area`, `pages/caterers/out-of-area` | `kind="warning"`, `live` (appears while typing) | "Sweet Hand currently serves Toronto and the GTA" | warning, announced | dialog, toolbar |
| `pages/thread/shared` | `sh-inline-status tone="success"` replacing "Share my contact details" | "Contact details shared" | neutral "Sharing…", success, danger "Couldn't share your details" | thread card |
| `pages/dashboard`, `profile-details`, `profile-cuisines`, `profile-events`, `profile-photos`, `profile-menu`, `profile-certificate` (42 uses) | `sh-save-status` in the page intro | "Saved", "Saving…", "Saved at 10:14 a.m. · live on your page within a minute", "Not saved: fix 2 things below", "Uploading 2 photos…" | saved, saving, error, uploading | canvas |

## Anatomy

`sh-field-message`:

1. **Message** — a `span` with `.field__help`, `.field__error` or
   `.field__warning` and an `id` the field references.
2. **Glyph** — generated by CSS `::before` with empty alternative text: "⚠"
   (text presentation) for error, a ringed "!" for warning; none for help.
3. **Text** — the slot content.

`sh-inline-status`:

1. **Status** — `span.inline-status` (`--success`, `--danger`) with
   `role="status"`.
2. **Icon (optional)** — `svg.icon.icon--sm`, `aria-hidden`; a `.dot.dot--pulse`
   while in progress.
3. **Text**.

`sh-save-status`:

1. **Status** — `p.save-status` (`--saved`, `--error`) with `role="status"`,
   at least 44 px tall so its changes never shift the page intro.
2. **Indicator** — `.dot.dot--pulse` while saving or uploading; a tick icon
   when saved; a warning icon on error; all `aria-hidden`.
3. **Text**.

Hosts are `display: contents`; classes and ids go on the inner elements so the
field's `aria-describedby` and the `.field` flex layout see them directly.

## API

### `sh-field-message` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'help' \| 'error' \| 'warning'` | `'help'` | no | `.field__help`, `.field__error` or `.field__warning`. |
| `id` | `string` | — | yes | Rendered on the span; the field lists it in `aria-describedby`. |
| `live` | `boolean` | `false` | no | `role="status"`. Only for warnings that appear while typing ("Sweet Hand currently serves Toronto and the GTA"). Errors are never live; the summary announces them (D-2). |

Slot: default — the message text (phrasing content; may contain data such as
"20–300" or a count).

### `sh-inline-status` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'neutral' \| 'success' \| 'danger'` | `'neutral'` | no | `.inline-status`, `--success`, `--danger`. |
| `busy` | `boolean` | `false` | no | Shows a pulsing dot before the text ("Sharing…"). |

Slot: default — the text. The element always has `role="status"` and is
rendered by the consumer in place of the one-way action it reports on.

### `sh-save-status` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `state` | `'saved' \| 'saving' \| 'error'` | `'saved'` | no | `saved` → `.save-status--saved` + tick; `saving` → pulsing dot; `error` → `.save-status--error` + warning icon. |
| `message` | `string` | — | yes | "Saved", "Saved at 10:14 a.m. · live on your page within a minute", "Saving…", "Uploading 2 photos…", "Not saved: fix 2 things below". |

The element stays in the DOM for the life of the page and only its text and
modifier change, so each change is announced once.

### Outputs

None. Inline messages are not interactive.

- Translation: every message arrives from the resource files (L2-064); counts,
  times and caterer names inside them are formatted by the consumer.

## Variants and sizes

| Variant | Class | Colour role | Glyph | Blocks saving |
|---|---|---|---|---|
| Help | `.field__help` | `--color-fg-muted` | none | no |
| Error | `.field__error` | `--color-danger-fg` | "⚠" | yes |
| Warning | `.field__warning` | `--color-warning-fg` | ringed "!" | no |
| Inline status, neutral / success / danger | `.inline-status`, `--success`, `--danger` | `--color-fg-muted`, `--color-success-fg`, `--color-danger-fg` | dot or icon | — |
| Save status, saving / saved / error | `.save-status`, `--saved`, `--error` | `--color-fg-muted`, `--color-success-fg`, `--color-danger-fg` | pulsing dot, tick, warning | — |

One size: `--text-body-sm` with a 16 px icon or an 8 px (`--space-2`) dot. The
message follows the field's width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Help only | field valid | Muted help | Read after the label as the description |
| Invalid | consumer renders `kind="error"` and sets `aria-invalid` on the field | Error under the control, help kept below it | Read first in the description; announced by the summary on submit |
| Error cleared | consumer removes it as the person types | Error gone; help stays | Silent |
| Warning on load | `kind="warning"` | Warning glyph and text | Read with the description |
| Warning while typing | `kind="warning"` + `live` | as above | Announced once, politely |
| Saving | `state="saving"` | Pulsing dot + "Saving…" | "Saving…" announced |
| Saved | `state="saved"` | Tick + "Saved" in success colour | "Saved" announced |
| Not saved | `state="error"` | Warning icon + "Not saved: fix 2 things below" | Announced |
| Inline status busy / done / failed | `busy`, `tone` | Dot "Sharing…" → tick "Contact details shared" / "Couldn't share your details" | Each announced once |
| Read-only field | consumer | Help explains why ("Editing is paused while we review your profile") | Description |

## Markup

```html
<!-- rendered: error then help, both referenced by the field -->
<label class="field" for="name"><span class="field__label">Business name</span>
  <input class="input" id="name" type="text" maxlength="80" required aria-invalid="true" aria-describedby="name-error name-help">
  <span class="field__error" id="name-error">Enter a business name of 2 to 80 characters</span>
  <span class="field__help" id="name-help">2–80 characters. A new name goes live after our team checks it.</span>
</label>
```

```html
<!-- rendered: non-blocking warning on the enquiry form -->
<span class="field__warning" id="guests-warn">This caterer usually serves 20–300 guests</span>
```

```html
<!-- rendered: warning that appears while typing -->
<span class="field__warning" id="q-msg" role="status">Sweet Hand currently serves Toronto and the GTA</span>
```

```html
<!-- rendered: inline status replacing a one-way action -->
<span class="inline-status inline-status--success" role="status"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>Contact details shared</span>
```

```html
<!-- rendered: save status, saving then saved then error (one element, text changes) -->
<p class="save-status" role="status"><span class="dot dot--pulse" aria-hidden="true"></span>Saving…</p>
<p class="save-status save-status--saved" role="status"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg>Saved at 10:14 a.m. · live on your page within a minute</p>
<p class="save-status save-status--error" role="status"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg>Not saved: fix 2 things below</p>
```

```html
<!-- consumer: inside a form field -->
<sh-field-message kind="error" [id]="nameErrorId" *ngIf="nameError()">{{ nameError() }}</sh-field-message>
<sh-field-message kind="help" [id]="nameHelpId">{{ t('profile.name.help') }}</sh-field-message>

<!-- consumer: dashboard intro -->
<sh-save-status [state]="saveState()" [message]="saveMessage()"></sh-save-status>
```

The e2e page objects find messages by these classes and through the field's
accessible description.

## Design

- Type `--text-body-sm` for every message.
- Glyph gaps: error `--space-1`, warning `--space-2`, inline and save status
  `--space-2`. Glyphs align with the first line (`align-items: flex-start`).
- Warning ring 1.125rem, `--border-width-thick` in `currentColor`,
  `--text-caption` bold "!".
- Dot `--space-2` round, `currentColor`; pulse `--duration-loop`,
  `--ease-standard`, between full and 35 % opacity.
- Save status `min-height: --target-comfortable`.
- No backgrounds, borders or elevation; no component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Help, neutral status | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Error, danger status, not saved | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Warning | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Saved, success status | `--color-success-fg` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Invalid control edge (on the field) | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Error on the page |
| `--color-danger-fg` | `--color-bg-surface` | 4.5:1 | Error on a card |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Error in a dialog |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | Warning on the page |
| `--color-warning-fg` | `--color-bg-surface-raised` | 4.5:1 | Warning in a dialog |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | Saved |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Help in a dialog |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Help on the page |

Colour is never the only signal: errors and warnings carry a glyph and words,
and the field carries `aria-invalid`.

## Responsive behaviour

- Messages take the field's width and wrap; glyphs stay with the first line.
- Help and counter share a row (`.cluster--between`); below about 20rem the
  counter wraps under the help.
- The save status keeps its 44 px height; in the dashboard intro it wraps under
  the status label on phones.
- No breakpoint hides a message or moves it away from its control. Nothing
  scrolls sideways at 320 px.

## Accessibility

### Role and pattern

Plain text tied to the control by `aria-describedby` (WCAG 1.3.1, 3.3.1,
3.3.3), in the order error, help, counter. Status lines that change after load
are `role="status"` (polite) and are in the DOM before their text changes.

### Keyboard

Messages are never focusable. Focusing the control reads its label, then its
described-by messages.

### Focus

After an invalid submit, focus goes to the error summary, not to an inline
error ([form layout](form-layout.md)). Removing an error as the person types is
silent.

### Labelling

- The error glyph is generated content with empty alternative text
  (`content: "⚠\FE0E" / ""`), so it is never announced and never drawn as a
  colour emoji.
- Icons and dots are `aria-hidden`.

### Announcements

- Errors: never live themselves; the summary announces them.
- Warnings that appear while typing: polite, once.
- Save status and inline status: polite, once per change. The save status is
  not repeated in a toast.

### Motion

The pulsing dot is decorative; `prefers-reduced-motion: reduce` stops it and
leaves a solid dot.

## Content and internationalisation

- Errors say what to do, imperative, with the limit: "Enter a business name of
  2 to 80 characters", "Write at least 50 characters (35 so far)". Never
  "Invalid input". No trailing period on single-clause errors.
- Help states the rule and who sees what: "Pelau House gets an email. Links
  show as plain text."
- Warnings state a fact, not a fault, and address the reader: the customer
  reads "This caterer usually serves 20–300 guests" (L2-024); the caterer reads
  "You don't list Downtown Toronto as an area you serve".
- Save status: "Saving…", "Saved", "Saved at 10:14 a.m. · live on your page
  within a minute", "Not saved: fix 2 things below". Times lowercase with
  periods; the ellipsis character for in-progress text.
- French runs about 30 % longer; messages wrap, never truncate.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (class names, icon choice)
  are computed once, not in the template.
- No timers; the pulse is CSS.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/InlineMessage.ts`
  renders Pelau House's business-details form in its invalid state (three
  fields with error and help) and cycles the save status through "Saving…",
  "Saved at 10:14 a.m." and "Not saved: fix 2 things below"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `ProfileEditor`, `EnquiryDialog`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the save status reserves 44 px, so state changes never
  shift the intro.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given the business-details form for Pelau House submitted with an empty name, when the error renders, then a `span.field__error` reading "Enter a business name of 2 to 80 characters" sits directly under the input, before the help, and the input has `aria-invalid="true"` and `aria-describedby` listing the error id first, then the help id. (L2-068)
- **AC-2** Given an error message, when it is read by a screen reader, then the "⚠" glyph is not announced and the description is exactly the error text followed by the help text. (L2-068)
- **AC-3** Given today is Saturday 10 October 2026 and Marcia enters 11 October 2026 as the event date, when the enquiry form shows the error, then it reads "Choose a date at least 2 days from today" under the date field. (L2-022)
- **AC-4** Given Pelau House serves 20–300 guests, when Marcia enters 500 guests, then a `span.field__warning` "This caterer usually serves 20–300 guests" appears next to the guests field, is in its `aria-describedby`, and "Send enquiry" still submits. (L2-024)
- **AC-5** Given Kendra saves a photo caption "Roti", when the error renders, then it reads "Captions describe the photo in 5–125 characters" with the counter "4 / 125" after it. (L2-042)
- **AC-6** Given the postal code "K1A 0B1" is typed into the area search, when the warning appears with `live`, then "Sweet Hand currently serves Toronto and the GTA" has `role="status"` and is announced once without moving focus. (L2-012)
- **AC-7** Given Marcia activates "Share my contact details" in her thread with Pelau House and confirms, when sharing finishes, then the button is replaced by `span.inline-status.inline-status--success[role="status"]` reading "Contact details shared", and focus moves to the nearest remaining control. (L2-035)

### States

- **AC-8** Given Kendra edits her description, when saving starts, then the save status reads "Saving…" with a pulsing dot; when the save finishes, then the same element reads "Saved at 10:14 a.m. · live on your page within a minute" with `.save-status--saved`, each change announced once. (L2-038)
- **AC-9** Given two invalid fields on the profile-details page, when autosave is refused, then the save status reads "Not saved: fix 2 things below" with `.save-status--error`, and its height is unchanged from "Saved". (L2-038)
- **AC-10** Given an invalid business name, when Kendra types a valid one, then the error and `aria-invalid` are removed, the help remains, and nothing is announced. (L2-068)

### Theming

- **AC-11** Given the light and the dark theme, when error, warning, help and saved messages render on the page, a card and a dialog surface, then each meets 4.5:1 against the surface behind it. (L2-069)
- **AC-12** Given an error or warning, when it renders, then its meaning is carried by its words and glyph as well as its colour. (L2-069)

### Responsive

- **AC-13** Given a 320 px viewport, when the reply-box error "Keep your reply under 2,000 characters. It's 2,143 now." renders beside the counter "2,143 / 2,000", then the error wraps, the counter wraps under the help, and nothing scrolls horizontally. (L2-064)

### Motion

- **AC-14** Given `prefers-reduced-motion: reduce`, when the save status reads "Saving…", then the dot is solid and does not pulse. (L2-069)

### Automated checks

- **AC-15** Given the profile-details page in its invalid and saving states, when axe-core runs with WCAG 2.1 A and AA rules at 360 and 1280 px, then it reports 0 violations. (L2-066)

## Implementation notes

- Folder `frontend/projects/components/src/lib/inline-message/`; files
  `field-message.component.*` (`sh-field-message`, `FieldMessageComponent`),
  `inline-status.component.*` (`sh-inline-status`, `InlineStatusComponent`),
  `save-status.component.*` (`sh-save-status`, `SaveStatusComponent`).
- Composed by [form field](form-field.md) (help, error, warning; it owns the
  counter and `aria-describedby`), the thread page (inline status) and the
  dashboard page intro (save status).
- Styles: the Inline message section of `components.css` plus `.field__help`,
  `.dot` and the reduced-motion rule.
- Design-system catch-up: four mocks show "All changes saved" in neutral grey;
  the component only renders "Saved"-family text with `--saved` (D-3). The
  thread's "Contact details shared" used `.private-note`; it is an
  `.inline-status--success`. The over-limit counter's inline colour becomes
  `data-over` (form field).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Are field errors live regions?* No. Two mocks gave an error `role="alert"`; with several fields that fires several assertive announcements on one submit. The error summary announces them and each error is read with its field (design system, Accessibility).
- **D-3** *How is the saved state worded?* "Saved", optionally with the time and consequence, always with `--saved`. 27 mocks say "Saved" in green; 4 say "All changes saved" in grey.
- **D-4** *Whose wording do fit warnings use?* The customer reads L2-024's exact strings ("This caterer usually serves 20–300 guests", "This caterer doesn't list Oshawa as an area they serve"), which the mocks also use. Per the user's decision of 10 Oct 2026, L2-024's wording is used; the design-system example ("Pelau House usually serves 20–300 guests") is to be corrected. The caterer's own view uses "You don't list …", as the design system decided.
- **D-5** *Where does the counter live?* In [form field](form-field.md). The design system says it "belongs to the form field but follows the same rules"; this CRD only fixes the order error, help, counter.
- **D-6** *Why three selectors in one folder?* They share the type scale, colour roles and live-region rules, and the design system documents them on one page; separate elements keep each API small (a save status has no `kind`, a field message no `state`).
