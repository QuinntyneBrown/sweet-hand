# Textarea

| Field | Value |
|---|---|
| Selector | `sh-textarea` |
| Library path | `frontend/projects/components/src/lib/textarea/` |
| Status | planned |
| Traces to | L2-022, L2-026, L2-032, L2-039, L2-050, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-080, L2-085 |
| Design system | [`textarea.html`](../../design-system/components/textarea.html) |
| Source mocks | [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/enquiry/invalid`](../../mocks/dialogs/enquiry/invalid.html), [`pages/profile-details/default`](../../mocks/pages/profile-details/default.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/thread/invalid`](../../mocks/pages/thread/invalid.html), [`pages/thread/submitting`](../../mocks/pages/thread/submitting.html), [`dialogs/decline-enquiry/default`](../../mocks/dialogs/decline-enquiry/default.html), [`dialogs/suspend-caterer/default`](../../mocks/dialogs/suspend-caterer/default.html), [`dialogs/report/default`](../../mocks/dialogs/report/default.html), [`dialogs/review-response/default`](../../mocks/dialogs/review-response/default.html), [`dialogs/review/invalid`](../../mocks/dialogs/review/invalid.html) |
| Rendering | [`textarea.html`](textarea.html) |

## Purpose and scope

A textarea gives room to write: Marcia's message to Pelau House, Kendra's
business description, Jean-Robert's review, a reply in a thread, the reason an
operator gives when suspending a caterer. It is a native `<textarea>` with the
text field's look, sized by `rows` to the answer we expect, and it lets people
type or paste past a limit so they can trim, with the [form
field](form-field.md)'s counter telling them by how much.

For one line (a name, a postal code) use a [text field](text-field.md).
Structured choices such as allergens or dietary tags are never free text: use
[checkbox](checkbox.md) groups.

Out of scope:

- Label, help, error, counter and the over-limit announcement: [form
  field](form-field.md) (the consumer passes the counter text).
- Length rules and when errors appear: the consumer's validation, run on
  submit and again while fixing.
- The reply box bar (`.reply-box`, its label, its Send button, stickiness):
  [message](message.md). The textarea inside it is this component with
  `variant="reply"`.
- Rendering what was written (literal text, links as plain text): the thread,
  review and profile components that display it.

## Usage

Inventory from a parse of every `<textarea>` in `docs/mocks/` (125 textareas
on 113 screens) and `usage_inventory.py docs/mocks textarea "textarea"`. Rows
that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/enquiry/*` Message | form, `rows="5"`, required, autofocus when restored | "Hi Kendra, we’re planning my parents’ 40th anniversary…" | default, invalid "Tell the caterer a little more (at least 20 characters)", busy (read-only), restored | dialog |
| `pages/profile-details/*` Description; `dialogs/operator-edit` Description | form, `rows="9"` (operator `6`), required | "Kendra Baptiste learned to burn sugar for pelau…" | default, invalid "Write at least 50 characters (35 so far)", saving, read-only | canvas, dialog |
| `dialogs/review/*` Your review | form, `rows="5"` | "We had Pelau House cater…" | default, invalid "Write at least 20 characters", busy | dialog |
| `dialogs/review-response/*` Your response | form, `rows="4"`, required | "Thank you, Marcia…" | default, invalid, busy | dialog |
| `dialogs/dish` Description; `decline-enquiry` Note to Priya; `report` Details; `photo-details` Caption | form, `rows="2"`–`3`, optional | "Thanks for thinking of us. We’re fully booked that weekend." | default, invalid (`report/invalid` "Details (needed for “Other”)"), busy | dialog |
| Operator reasons (`suspend-caterer`, `remove-caterer`, `reinstate-caterer`, `moderate-review`, `resolve-report`, `open-enquiry`, `operator-edit`, `revert-change`, `request-changes`, `record-breach`) | form, `rows="2"`–`4`, required, autofocus | "Reason (sent to Kendra)" | default, invalid, busy | dialog |
| `pages/thread/*`; `dashboard-enquiry`, `dashboard-enquiries`; `dialogs/close-enquiry`, `share-contact` (page behind) | **reply**, `rows="2"`, grows | "Your reply", "Reply to Priya" | empty, invalid over the limit "Keep your reply under 2,000 characters. It’s 2,143 now.", sending (read-only) | reply box on canvas |

Every mock `maxlength` on a textarea (enquiry, review, review response, thread,
reasons) is drift: the rule is a visible counter, no `maxlength`, validation on
submit (D-3).

## Anatomy

1. **Box** — `textarea.textarea`: the text field's container (the
   `--field-*` tokens, `--radius-md`, hairline edge, `--text-body`), full
   width, height from `rows`, never less than 2.5 × `--control-height-md`
   (110 px).
2. **Resize handle** — vertical only (`resize: vertical`), so the box never
   breaks the layout sideways.
3. **Reply variant** — inside `.reply-box`: minimum `--control-height-lg`
   (52 px), `--radius-lg` corners, grows with its content
   (`field-sizing: content`) to `33dvh`, then scrolls.

The counter under the box is the [form field](form-field.md)'s
`.field__counter`.

Host: `sh-textarea` is layout-transparent (`display: contents`) and renders the
native `<textarea>` in the light DOM, so `label[for]`, `aria-describedby`,
`.reply-box__row` flex layout and native form submission reach it (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'form' \| 'reply'` | `'form'` | no | `reply` is the textarea in the reply box: auto-grows and sends on <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd>. Adds no class; the `.reply-box` parent styles it. |
| `rows` | `number` | `3` | no | Rendered as `rows`. Size to the expected answer (table below). |
| `value` | `string` | `''` | no | The text. Two-way with `valueChange`. Set as the DOM property, so markup shows literally. Line breaks kept as typed. |
| `name` | `string \| null` | `null` | no | Rendered as `name`. |
| `required` | `boolean` | `false` | no | Rendered as `required`. |
| `minlength` | `number \| null` | `null` | no | Rendered as `minlength` (request-changes uses 10). |
| `readonly` | `boolean` | `false` | no | Native `readonly`: focusable, selectable, not editable. Set while the form or reply sends. |
| `disabled` | `boolean` | `false` | no | Native `disabled`. Rare: a closed enquiry hides the reply box instead. |
| `autofocus` | `boolean` | `false` | no | Focuses once on first render (a reason box when its dialog opens; the restored enquiry message). |
| `spellcheck` | `boolean \| null` | `null` | no | `null` keeps the browser default (on). |
| `invalid` | `boolean \| null` | `null` | no | Standalone use only (the reply box, which has no form field). `null` follows the form field's context. Renders `aria-invalid="true"` or nothing. |
| `describedBy` | `string \| null` | `null` | no | Standalone use only: ids rendered as `aria-describedby` ("reply-error reply-count"). Inside a form field the field's ids are used. |

There is no `maxlength` and no `placeholder` input (D-3, D-4).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `valueChange` | `string` | On every `input` event (typing, paste, dictation). Not while `readonly` or `disabled`. |
| `lengthChange` | `number` | With every `valueChange`: the length in user-perceived characters (grapheme clusters), so the consumer's counter and limit agree with what people see. |
| `blurred` | `FocusEvent` | The textarea loses focus. |
| `submitRequested` | `KeyboardEvent` | `variant="reply"` only: <kbd>Ctrl</kbd>+<kbd>Enter</kbd> or <kbd>⌘</kbd>+<kbd>Enter</kbd>, not while `readonly`. The reply box submits its form, as the Send button does. |

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the textarea; the form field's `focusControl()` calls it, and the reply box calls it after sending. |

### Content slots

None.

- Translation: the textarea has no strings of its own; its label, help and
  counter come through the [form field](form-field.md) or the reply box.

## Variants and sizes

| Variant | Use for |
|---|---|
| Form | Every textarea in a form field: messages, descriptions, reviews, notes, reasons. |
| Reply | The reply box under a thread, beside the icon-only Send. |

One width (the column). Height from `rows`:

| Use | Rows | Limit (counter) |
|---|---|---|
| Reply in a thread | 2, growing | 2,000 |
| Dish description, decline note, report details, reasons, caption | 2–3 | 300 / 500 / 1,000 / 1,000 / 125 |
| Review response, request changes | 4 | 1,000 / — |
| Enquiry message, review | 5 | 20–2,000 |
| Operator edit of a description | 6 | 50–2,000 |
| Business description | 9 | 50–2,000 |

Minimum height 2.5 × `--control-height-md` (form) or `--control-height-lg`
(reply). The reply grows to `33dvh`, then scrolls inside.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default / filled | — | `--field-bg` fill, `--field-border` edge | Name from the label |
| Hover | `:hover` | Edge `--color-fg-muted` | — |
| Focus | `:focus-visible` | Flush `--color-focus-ring` ring, edge `--color-focus-ring`; follows `--radius-lg` in the reply | Focused; label then description |
| Invalid | `aria-invalid="true"` | `--color-danger-solid` doubled edge; text kept | Invalid; error first in the description |
| Over limit | consumer sets the field's `counterOver` and, on submit, `error` | Counter in `--color-danger-fg`; the box turns invalid only on submit | Polite "143 characters too many" after a pause (form field) |
| Read-only / sending | `readonly` | `--color-bg-surface-sunken` fill | Focusable, read only |
| Disabled | `disabled` | `--color-bg-subtle` fill, `--color-fg-disabled` text | Out of the tab order |
| Growing (reply) | content longer than 2 rows | Height follows content up to `33dvh`, then the box scrolls | — |

`data-state="hover|focus|invalid|disabled"` is documentation-only.

## Markup

```html
<!-- rendered: form textarea in a form field (enquiry Message), default -->
<textarea class="textarea" id="message" name="message" rows="5" required aria-describedby="message-help message-count"></textarea>
```

```html
<!-- rendered: invalid, text kept, no maxlength -->
<textarea class="textarea" id="message" name="message" rows="5" required aria-invalid="true" aria-describedby="message-error message-help message-count">Food for 120 please</textarea>
```

```html
<!-- rendered: read-only while the enquiry sends -->
<textarea class="textarea" id="message" name="message" rows="5" required readonly aria-describedby="message-help message-count">Hi Kendra, we’re planning my parents’ 40th anniversary…</textarea>
```

```html
<!-- rendered: reply variant inside the reply box (box owned by message) -->
<form class="reply-box" novalidate>
  <label class="reply-box__label" for="reply">Your reply</label>
  <div class="reply-box__row">
    <textarea class="textarea" id="reply" name="reply" rows="2" aria-describedby="reply-help reply-count"></textarea>
    <button class="btn btn--primary btn--icon" type="submit" aria-label="Send reply">…</button>
  </div>
  <span class="cluster cluster--between"><span class="field__help" id="reply-help">Pelau House gets an email. Links show as plain text.</span><span class="field__counter" id="reply-count">0 / 2,000</span></span>
</form>
```

Disabled differs only by `disabled`.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: enquiry message -->
<sh-form-field controlId="message" [label]="t('enquiry.message')" [help]="t('enquiry.messageHelp')" [error]="messageError()"
  [counter]="t('form.counter', { count: length(), max: 2000 })" [counterOver]="length() > 2000" [counterAnnouncement]="t('form.tooMany', { over: length() - 2000 })">
  <sh-textarea name="message" rows="5" required [readonly]="busy()" [(value)]="message" (lengthChange)="length.set($event)" />
</sh-form-field>

<!-- consumer: reply box -->
<sh-textarea variant="reply" name="reply" [describedBy]="replyDescribedBy()" [invalid]="!!replyError()" [readonly]="sending()" [(value)]="reply" (submitRequested)="send()" />
```

The e2e page objects locate the textarea by its label and read `rows`,
`aria-invalid`, `readonly` and the absence of `maxlength`; those attributes
and the class are the contract.

## Design

- Minimum height `calc(var(--control-height-md) * 2.5)`; reply
  `--control-height-lg`, maximum `33dvh`.
- Padding `--space-2` `--space-3`; text `--text-body` (16 px at every width,
  so iOS never zooms); line height from `--text-body`.
- Shape `--radius-md`; reply `--radius-lg`. Edge `--border-width-hairline` in
  `--field-border`; invalid adds a hairline inset shadow in
  `--color-danger-solid`.
- Focus ring `--focus-ring-width` in `--color-focus-ring`, offset 0.
- Motion: border colour and shadow over `--duration-fast` with
  `--ease-standard`; growth is instant, never animated.
- Layer: none.

Component tokens: the text field's `--field-bg`, `--field-border` and
`--field-fg` with the same state overrides (see [text field](text-field.md)).
A surface re-skins the textarea by overriding them (`.reply-box .textarea`).

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Read-only fill | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| Disabled fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Hover edge | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring and edge | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Invalid edge | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Disabled text | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Text |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Text, read-only |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Edge on a page and in the reply box |
| `--color-border-strong` | `--color-bg-surface-raised` | 3:1 | Edge in a dialog |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Invalid edge |

Disabled textareas are exempt. Forced colours: a `CanvasText` hairline edge
and a `Highlight` focus ring.

## Responsive behaviour

- Full width of the column, capped by `.form` at 40rem; in dialogs, the
  dialog's width. Below 48rem the enquiry dialog fills the screen, so the
  message has room above the on-screen keyboard; the focused textarea is
  scrolled into view above it (L2-026).
- The reply textarea grows to about a third of the viewport, then scrolls, so
  the thread above stays visible on a phone.
- Resize is vertical only; nothing scrolls sideways at 320 px.
- Form textareas are at least 110 px and reply ones 52 px tall, above the
  44 px target (L2-065).

## Accessibility

### Role and pattern

A native `<textarea>` (multi-line textbox), named by the form field's `<label
for>` or the reply box's `label.reply-box__label`; `aria-describedby` lists
message, help and counter. No `role` attribute is added.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves into and out of the textarea; Tab never inserts a tab character. |
| <kbd>Enter</kbd> | Inserts a new line. Never submits, in the reply box included. |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> | Reply variant: emits `submitRequested`, which sends the reply. No effect on form textareas. |
| Paste | Always allowed, past the limit too. |

### Focus

- Flush ring and pepper edge, as on the text field; in the reply variant it
  follows `--radius-lg`.
- After a reply is sent, the reply box keeps focus in the emptied textarea.
- Focus never moves on its own while typing.

### Labelling

- Labels say who will read the text where it matters: "Note to Priya",
  "Reason (sent to Kendra)", "Your response".
- The counter is in the description, so the limit is heard on focus.
- No placeholder: it reads as text already written.

### Announcements

None from the textarea. The over-limit count is announced politely by the
[form field](form-field.md) after a pause; the reply box does the same for its
counter.

### Motion

The edge transition uses `--duration-fast`, which reduced motion zeroes.
Growth is instant.

## Content and internationalisation

- Prompt with what is useful, in help, not in the box: "What you’d like to
  eat, serving style, timing".
- State the range in help ("50–2,000 characters") and show the count as
  "225 / 2,000".
- Text is kept as typed, including line breaks and pasted characters; HTML
  and URLs typed in are shown as literal text wherever the text is displayed
  (L2-032, L2-080).
- Counting is by user-perceived characters, so "callaloo 🌶️" counts each
  emoji once and the counter matches what people see.
- French help and labels run about 30 % longer; they wrap in the form field.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the effective
  `aria-describedby`, the grapheme count) are computed once per change, not in
  the template. Typing does not re-render the host.
- Auto-grow uses CSS `field-sizing: content`; where it is unsupported, one
  `input` listener sets the height from `scrollHeight`, batched to the next
  animation frame; no observers.
- Grapheme counting uses `Intl.Segmenter`, created once per component.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Textarea.ts`
  renders Kendra's 9-row business description (225 / 2,000) and the thread
  reply box, then pastes Marcia's 2,143-character reply into it and grows it;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `EnquiryDialog`, `Thread`, `ProfileDetails`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: form textareas have a fixed height from `rows` and only
  the person resizes them; the reply box grows upward from its sticky bottom,
  so the thread does not jump.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia opens the enquiry to Pelau House, when the Message textarea renders in its form field, then it is `<textarea class="textarea" rows="5" required>` with `id="message"` and `aria-describedby="message-help message-count"`, at least 110 CSS px high, and has no `maxlength` and no `placeholder`. (L2-022)
- **AC-2** Given Kendra's profile editor, when the Description renders with `rows="9"`, then it shows nine lines of text at 16 px without scrolling and resizes only vertically. (L2-039)
- **AC-3** Given the thread with Pelau House, when the reply textarea renders with `variant="reply"`, then it is 52 CSS px high with `--radius-lg` corners inside `.reply-box__row`, beside the "Send reply" button. (L2-032)

### States

- **AC-4** Given Marcia pastes a 2,143-character message, when the paste completes, then the textarea keeps all 2,143 characters and `lengthChange` emits 2,143. (L2-022)
- **AC-5** Given the message is 19 characters ("Food for 120 please") and Marcia submits, when the form field sets its error "Tell the caterer a little more (at least 20 characters)", then the textarea has `aria-invalid="true"`, the `--color-danger-solid` doubled edge, and still contains "Food for 120 please". (L2-022)
- **AC-6** Given Jean-Robert writes "Great food!!" and submits his review, when the field shows "Write at least 20 characters", then the textarea is invalid and keeps "Great food!!"; when he types to 20 characters and the error clears, then `aria-invalid` is removed. (L2-050)
- **AC-7** Given the reply box with 2,143 characters, when Marcia submits, then the reply is not sent, the textarea has `aria-invalid="true"` and its `aria-describedby` begins with the id of "Keep your reply under 2,000 characters. It’s 2,143 now." (L2-032)
- **AC-8** Given the enquiry is sending, when the message re-renders with `readonly`, then it shows the `--color-bg-surface-sunken` fill, stays in the tab order, its text can be selected, and typing changes nothing. (L2-022)
- **AC-9** Given Marcia writes `<script>alert(1)</script>` in a reply, when the textarea holds it and re-renders, then the characters show literally in the box and no script runs. (L2-080)
- **AC-10** Given "callaloo 🌶️" typed into a dish description, when `lengthChange` emits, then it reports 10, counting the emoji once. (L2-068)

### Keyboard and focus

- **AC-11** Given focus in the enquiry Message, when Marcia presses Enter, then a new line is inserted and the form is not submitted; when she presses Tab, then focus moves to the next control and no tab character is inserted. (L2-067)
- **AC-12** Given focus in the reply textarea with "Shall I hold the date?" typed, when Marcia presses Ctrl+Enter (or ⌘+Enter on macOS), then `submitRequested` is emitted once; pressing Enter alone emits nothing. (L2-067)
- **AC-13** Given a textarea receives keyboard focus, when it renders, then a flush `--color-focus-ring` ring and edge appear with at least 3:1 contrast against the field and the page, following `--radius-lg` in the reply variant. (L2-067)

### Screen readers

- **AC-14** Given the enquiry invalid state and the thread invalid state, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations, and each textarea's name is its visible label ("Message", "Your reply"). (L2-066)
- **AC-15** Given the report dialog's Details (optional) with a counter "0 / 1,000", when the textarea is inspected, then the counter's id is in its `aria-describedby`. (L2-068)

### Theming

- **AC-16** Given the dark theme, when a filled textarea renders in a dialog, then its text measures at least 4.5:1 against the fill and its edge at least 3:1 against `--color-bg-surface-raised`. (L2-069)

### Responsive

- **AC-17** Given a 360 px phone with the reply box, when Marcia types twelve lines, then the textarea grows to at most a third of the viewport height and then scrolls inside, and the page never scrolls sideways. (L2-064)
- **AC-18** Given the enquiry on a phone with the on-screen keyboard open, when Marcia focuses Message, then the textarea is scrolled into view above the keyboard. (L2-026)
- **AC-19** Given a 360 px viewport, when any form textarea renders, then it is at least 44 CSS px high (110 px by its minimum). (L2-065)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when the reply textarea grows or gains focus, then the growth and the edge change happen without a visible transition. (L2-069)

### Performance

- **AC-21** Given the `Textarea` perf-test scenario, when 2,143 characters are pasted into the reply box, then the grown box is painted within 200 ms (Interaction to Next Paint) and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/textarea/`; files
  `textarea.component.*` (selector `sh-textarea`, class
  `TextareaComponent`). It injects the optional `FormFieldContext` from
  [form field](form-field.md).
- Styles: the `.textarea` rule moves into the component; the shared
  `.input, .select, .textarea` base and `--field-*` tokens come from the
  stylesheet shared with [text field](text-field.md) and [select](select.md).
  `.reply-box .textarea` stays with [message](message.md).
- Mocks to correct when they are next touched: drop `maxlength` from every
  textarea (enquiry, review, review response, thread, reasons) and add the id
  to the report dialog's counter.
- Composes nothing. Composed by [form field](form-field.md) consumers and the
  reply box in [message](message.md).
- No CDK primitive is needed (`cdkTextareaAutosize` is not needed where
  `field-sizing` is supported; the fallback is a few lines).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* Layout-transparent (`display: contents`) with the native `<textarea>` in the light DOM, so it is a flex child of `.reply-box__row` and `label[for]` and form submission work natively.
- **D-3** *Is there a `maxlength`?* No. The design system's rule is a visible counter, no `maxlength`, validation on submit: people may paste a long draft and trim it, and a hidden cut-off silently loses text (the suspend reason). The mocks' `maxlength` attributes are drift.
- **D-4** *Is there a placeholder?* No. The design system forbids it on textareas because it reads as text already written; prompts go in help.
- **D-5** *How is length counted?* In grapheme clusters, emitted as `lengthChange`, and the server counts the same way. Code-unit length would count one chili pepper emoji as two or more and make "2,000" disagree with what people see.
- **D-6** *Does Enter ever submit?* Never. Ctrl/⌘+Enter sends a reply (design system keyboard table), through `submitRequested`, only in the reply variant; a form textarea ignores it so a half-written enquiry or reason cannot go out by accident.
- **D-7** *How does the reply grow where `field-sizing` is unsupported?* A small fallback sets the height from `scrollHeight` on input, capped at `33dvh`, so Firefox and older Safari behave like the design system's reply box.
- **D-8** *Can the textarea be used without a form field?* Only in the reply box, which has its own visible label; it passes `invalid` and `describedBy` itself.
