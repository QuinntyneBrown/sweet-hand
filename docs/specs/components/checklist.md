# Checklist

| Field | Value |
|---|---|
| Selector | `sh-check` (the round mark: `span.check`), `sh-checklist` (renders `ul.checklist` or `ol.checklist`), `sh-checklist-item` (one `li`) |
| Library path | `frontend/projects/components/src/lib/checklist/` |
| Status | planned |
| Traces to | L2-037, L2-038, L2-039, L2-040, L2-048, L2-058, L2-064, L2-066, L2-067, L2-068, L2-069, L2-071, L2-085 |
| Design system | [`checklist.html`](../../design-system/components/checklist.html) |
| Source mocks | [`dialogs/approve-profile/default`](../../mocks/dialogs/approve-profile/default.html), [`dialogs/request-changes/default`](../../mocks/dialogs/request-changes/default.html), [`pages/admin-profile-review/default`](../../mocks/pages/admin-profile-review/default.html), [`dialogs/submit-profile/default`](../../mocks/dialogs/submit-profile/default.html), [`dialogs/submit-profile/invalid`](../../mocks/dialogs/submit-profile/invalid.html), [`pages/dashboard/draft`](../../mocks/pages/dashboard/draft.html), [`pages/register-caterer/success`](../../mocks/pages/register-caterer/success.html), [`dialogs/download-data/default`](../../mocks/dialogs/download-data/default.html), [`dialogs/suspend-caterer/default`](../../mocks/dialogs/suspend-caterer/default.html), [`dialogs/remove-caterer/default`](../../mocks/dialogs/remove-caterer/default.html), [`notifications/profile-banner/danger`](../../mocks/notifications/profile-banner/danger.html) |
| Rendering | [`checklist.html`](checklist.html) |

## Purpose and scope

A checklist says what is done and what is left, with a round check beside
words that say the same thing, so the circle is never the only signal. Leah
reads "Email verified", "5 photos, each with a caption, cover chosen", "Food
handler certificate valid" before approving Auntie Bev's Kitchen; Beverley
reads "All 10 sections are complete." before she submits; a new caterer sees
"Account created", then "Verify your email" still to do. The check is a 28 px
circle: an empty ring (to do), a filled green disc with a tick (done), or a
danger ring with an exclamation (needs attention). `sh-check` is that mark on
its own, which the dashboard's setup rows also use; `sh-checklist` is the
compact list of checked lines inside dialogs and confirmation pages.

Use something else for a choice the user makes ([checkbox](checkbox.md)),
the status of an enquiry or review ([status](status.md)), setup progress as a
number ("8 of 10 done", [progress](progress.md) meter) and the dashboard's
tall linked setup rows (`sh-section-list` in [side nav](side-nav.md), which
renders this CRD's `sh-check` as its status mark).

Out of scope:

- The setup rows (`.section-list` > `a.section-link`), their meta text,
  links and `data-highlight` meta colour: [side nav](side-nav.md)
  (`sh-section-list`).
- The meter "Ready to submit · 8 of 10 done": [progress](progress.md).
- Working out which rules pass: the page computes each item's status from
  the profile (L2-039); the checklist only shows it.

## Usage

Inventory from `usage_inventory.py docs/mocks checklist "ul|ol"`,
`usage_inventory.py docs/mocks check "span"` and a search of every `.check`
in `docs/mocks/` (38 files). Rows that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/approve-profile/default`, `busy`, `failed`; `dialogs/request-changes/*`; `pages/admin-profile-review/default`, `resubmitted` — "Submission rules" | `ul.checklist`, every item done, no state prefix (the heading says they pass) | "Email verified", "5 photos, each with a caption, cover chosen", "6 dishes", "Description, cuisines, areas, guests and occasions", "Food handler certificate valid" | done | dialog (`--color-bg-surface-raised`), canvas |
| `dialogs/approve-profile/*` — what approving does | `ul.checklist`, done, no prefix | "All submission rules pass", "Certificate valid until 22 Jan 2030", "Recorded in the audit log under your name" | done | dialog |
| `dialogs/submit-profile/default` | single confirmation line: `p.cluster` with `sh-check` done | "All 10 sections are complete." | done | dialog |
| `pages/register-caterer/success` — next steps | `ol.checklist`, mixed, with prefixes (D-4) | "Account created" (done), "Verify your email", "Add photos, menu and food safety certificate", "Submit for review (about 3 business days)" (to do, `data-missing`) | done, missing | canvas |
| Design system *Anatomy* / dashboard banners — mixed list | `ul.checklist` with prefixes | "Email verified" (done), "Add at least 3 photos (2 so far)" (missing), "Add your food handler certificate" (attention, highlighted) | done, missing, attention, highlighted | canvas, dialog |
| `pages/dashboard/*`, `dialogs/submit-profile/*`, `dialogs/withdraw-submission/*`, `notifications/profile-banner/*` — setup rows | `sh-check` inside `sh-section-list` ([side nav](side-nav.md)) | — | missing, done, attention ("Expired 30 Sep 2026") | canvas, dialog |
| `dialogs/suspend-caterer/*`, `dialogs/remove-caterer/*` — what will happen | `ul.checklist`, items with a leading `svg.icon.icon--sm` and no check (D-6) | mail icon + "Kendra gets an email with your reason.", info icon + "3 open enquiries close; those customers are told Pelau House is no longer available." | — | dialog |
| `dialogs/download-data/default`, `busy` — what the export holds | `ul.checklist`, plain items, no check (D-6) | "Your profile and consent records", "4 enquiries and every message in them", "2 reviews you wrote", "1 report you sent" | — | dialog |

## Anatomy

1. **Check** — `span.check[aria-hidden=true]`: `--icon-size-xl` (28 px)
   circle, `--border-width-thick` ring, `flex: none`. To do: empty
   `--color-border-strong` ring. Done (`.check--done`): `--color-success-solid`
   disc with a tick `svg.icon` (`--icon-size-sm`) in `--color-bg-surface`.
   Needs attention (`.check--error`): `--color-danger-solid` ring with a bare
   exclamation in `--color-danger-fg` (never the circled danger icon).
2. **List** — `ul.checklist` (or `ol.checklist` for ordered steps): no
   bullets, flex column, `--space-3` between items.
3. **Item** — `li`: flex row, `--space-3` between mark and text.
   `data-missing` mutes the text (`--color-fg-muted`); `data-highlight` turns
   it `--color-danger-fg` at `--font-weight-medium`.
4. **Text** — a `<span>` holding a visually hidden state prefix
   (`span.visually-hidden` "Done: ", "To do: ", "Needs attention: ") and the
   item text.
5. **Leading icon (icon items only)** — `svg.icon.icon--sm`,
   `aria-hidden="true"`, in place of the check, for lists of consequences
   (D-6).

Hosts: `sh-check`, `sh-checklist` and `sh-checklist-item` are
layout-transparent (`display: contents`), so `.checklist li` and the
section-list rows style the real elements.

## API

### `sh-check` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `status` | `'missing' \| 'done' \| 'attention'` | — | yes | `missing` → `span.check` (empty ring); `done` → `.check--done` with the tick icon; `attention` → `.check--error` with the exclamation icon. Always `aria-hidden="true"`: the words carry the state. |

`sh-check` has no outputs or slots. Its names match `sh-section-list`'s item
`status` in [side nav](side-nav.md).

### `sh-checklist` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `ordered` | `boolean` | `false` | no | Renders `ol.checklist` for steps in order ("Account created" → "Submit for review"); otherwise `ul.checklist`. |
| `statusLabels` | `{ missing: string; done: string; attention: string }` | — | yes when `prefixes` is true | The visually hidden prefixes from the resource files: "To do: ", "Done: ", "Needs attention: ". Same shape as `sh-section-list`. |
| `prefixes` | `boolean` | `true` | no | `false` omits the hidden prefixes; allowed only when every item is done and a heading or sentence says so ("Submission rules", D-3). |
| `ariaLabelledby` | `string \| null` | `null` | no | Rendered as `aria-labelledby` on the list (the heading "Submission rules"). |

### `sh-checklist` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | `sh-checklist-item` children | The items, in order. |

### `sh-checklist-item` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `status` | `'missing' \| 'done' \| 'attention' \| null` | — | yes | A status renders an `sh-check` and (with `prefixes`) the hidden prefix. `missing` also adds `data-missing`. `null` renders no check: the item is a plain line or an icon line (D-6). |
| `highlight` | `boolean` | `false` | no | Adds `data-highlight`: the line turns `--color-danger-fg`, medium weight. Used after a failed submit, normally with `status="attention"`. |

### `sh-checklist-item` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text | The item, inside the text `<span>` after the prefix. |
| `[slot=icon]` | One `svg.icon.icon--sm` | Only with `status` null. Given `aria-hidden="true"` by the component. |

- No outputs: nothing in a checklist is interactive.
- Translation: item text and `statusLabels` arrive from the consumer's
  resource files (L2-064); counts and dates inside items are formatted by the
  consumer ("6 dishes", "Certificate valid until 22 Jan 2030").

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Compact checklist | `ul.checklist` of checked items | Rules an operator confirms, what an action has done. |
| Ordered steps | `ol.checklist` | Next steps after registering. |
| Mixed with prefixes | items with different statuses, prefixes on | Any list where not everything is done. |
| All done, no prefixes | `prefixes` false | "Submission rules" under a heading that says they pass. |
| Single confirmation line | `p.cluster` > `sh-check` + sentence (consumer markup) | "All 10 sections are complete." |
| Icon list | items with `status` null and an icon | Consequences of an action ("Kendra gets an email with your reason."). |
| Plain list | items with `status` null, no icon | Contents of a download. |

One size: a 28 px (`--icon-size-xl`) check with a 16 px icon, in every
variant and at every breakpoint. The list takes its container's width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| To do | `status="missing"` | Empty `--color-border-strong` ring; text `--color-fg-muted` (`data-missing`) | "To do: Verify your email" |
| Done | `status="done"` | `--color-success-solid` disc, tick in `--color-bg-surface`; text default | "Done: Account created" (or the bare text with `prefixes` false) |
| Needs attention | `status="attention"` | `--color-danger-solid` ring, exclamation in `--color-danger-fg` | "Needs attention: Add your food handler certificate" |
| Highlighted | `highlight` | Text `--color-danger-fg`, `--font-weight-medium` | Same words; the prefix already says "Needs attention" |
| Icon line | `status` null + icon | `icon--sm` in `currentColor`, no ring | Text only |
| Plain line | `status` null | Text only, aligned with the other items | Text only |

Not interactive: no hover, focus, active or disabled state. The state of a
check never animates.

## Markup

```html
<!-- rendered: mixed list with prefixes -->
<ul class="checklist">
  <li><span class="check check--done" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></span><span><span class="visually-hidden">Done: </span>Email verified</span></li>
  <li data-missing><span class="check" aria-hidden="true"></span><span><span class="visually-hidden">To do: </span>Add at least 3 photos (2 so far)</span></li>
  <li data-highlight><span class="check check--error" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="M12 7v6M12 16.5v.5"/></svg></span><span><span class="visually-hidden">Needs attention: </span>Add your food handler certificate</span></li>
</ul>
```

```html
<!-- rendered: all done, no prefixes, labelled by its heading (approve profile) -->
<h3 id="rules-title">Submission rules</h3>
<ul class="checklist" aria-labelledby="rules-title">
  <li><span class="check check--done" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></span><span>Email verified</span></li>
  …
</ul>
```

```html
<!-- rendered: ordered steps (register caterer, success) -->
<ol class="checklist">
  <li><span class="check check--done" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></span><span><span class="visually-hidden">Done: </span>Account created</span></li>
  <li data-missing><span class="check" aria-hidden="true"></span><span><span class="visually-hidden">To do: </span>Verify your email</span></li>
  …
</ol>
```

```html
<!-- rendered: icon list (suspend caterer) and plain list (download data) -->
<ul class="checklist">
  <li><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…mail…</svg><span>Kendra gets an email with your reason.</span></li>
</ul>
<ul class="checklist">
  <li><span>Your profile and consent records</span></li>
</ul>
```

```html
<!-- rendered: sh-check alone (single line; section-list status mark) -->
<p class="cluster"><span class="check check--done" aria-hidden="true"><svg class="icon" viewBox="0 0 24 24"><path d="m5 12 5 5 9-10"/></svg></span>All 10 sections are complete.</p>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: approve profile rules -->
<h3 id="rules-title">{{ t('approve.rules') }}</h3>
<sh-checklist ariaLabelledby="rules-title" [prefixes]="false">
  @for (r of rules(); track r.key) { <sh-checklist-item status="done">{{ r.text }}</sh-checklist-item> }
</sh-checklist>

<!-- consumer: next steps after registering -->
<sh-checklist ordered [statusLabels]="statusLabels">
  <sh-checklist-item status="done">{{ t('register.steps.created') }}</sh-checklist-item>
  <sh-checklist-item status="missing">{{ t('register.steps.verify') }}</sh-checklist-item>
</sh-checklist>

<!-- consumer: consequences in the suspend dialog -->
<sh-checklist [prefixes]="false">
  <sh-checklist-item [status]="null"><svg slot="icon" class="icon icon--sm" …></svg>{{ t('suspend.email', { name: 'Kendra' }) }}</sh-checklist-item>
</sh-checklist>
```

The e2e page objects read state from `.check`, `.check--done`,
`.check--error`, `[data-missing]`, `[data-highlight]` and the visually hidden
prefix; those, `.checklist` and the `ul`/`ol` choice are the contract. The
icon path data is free to change.

## Design

- Check `--icon-size-xl` square, `--radius-full` circle (50 %),
  `--border-width-thick` ring, icon `--icon-size-sm`, `place-items: center`.
- List: flex column, `--space-3` gap, no padding or bullets.
- Item: flex row, `--space-3` gap, `align-items: flex-start`, the text span
  padded `--space-0-5` at the top so the first 24 px line centres on the
  28 px check (D-5). Text `--text-body`.
- Missing: `--color-fg-muted`. Highlight: `--color-danger-fg`,
  `--font-weight-medium`.
- Icon item: `icon--sm` (`--icon-size-sm`) in `currentColor`, the same
  `--space-3` gap, aligned with the first line.
- Elevation, layer, motion: none. Checks change state without animation.

No component tokens; the checklist reads status tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Done disc | `--color-success-solid` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Tick | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| To-do ring | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Needs-attention ring | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Exclamation, highlighted text | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Missing text | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Item text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-success-solid` | `--color-bg-canvas` | 3:1 | Done disc on the page |
| `--color-success-solid` | `--color-bg-surface-raised` | 3:1 | Done disc in a dialog |
| `--color-bg-surface` | `--color-success-solid` | 4.5:1 | Tick inside the disc |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | To-do ring |
| `--color-danger-solid` | `--color-bg-surface` | 3:1 | Needs-attention ring |
| `--color-danger-solid` | `--color-bg-surface-raised` | 3:1 | Needs-attention ring in a dialog |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Highlighted line |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Missing line |

Green means done here and nowhere else in a list; it never means
"selected", which stays pepper red. Every state is also in words (L2-069).
Forced colours: the rings use `CanvasText` through `--color-border-strong`;
the done disc keeps a `CanvasText` ring and its tick stays visible because
the icon inherits `CanvasText`.

## Responsive behaviour

- The check never shrinks (`flex: none`); text wraps beside it, the check
  centred on the first line (D-5), at every width.
- In dialogs the list uses the dialog body's width (full screen below 48rem).
- No breakpoint changes anything else. At 320 px "Description, cuisines,
  areas, guests and occasions" wraps with nothing clipped; at 200 % zoom the
  list reflows with no horizontal scrolling.
- Items are not targets, so L2-065 sizes do not apply.

## Accessibility

### Role and pattern

A plain list (`ul` or `ol`), announced with its item count ("list, 5
items"). The check is decorative (`aria-hidden="true"`); state is spoken
through the visually hidden prefix. No ARIA widget pattern applies.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Not a stop: nothing in a checklist is focusable. Links inside an item text, if any, are ordinary links. |

### Focus

Never receives focus. Updates to statuses (after returning from a step page)
do not move focus.

### Labelling

- "Done: Email verified", "To do: Verify your email", "Needs attention: Add
  your food handler certificate".
- A list where every item is done may omit the prefixes only when its heading
  or sentence says so, and is then labelled by that heading.
- Icon items: the icon is `aria-hidden`; the text says the whole consequence.

### Announcements

None. A checklist is static content; changes are announced by whatever
caused them (the submit dialog's error summary).

### Motion

None: checks change state without animation, so `prefers-reduced-motion`
needs no rule.

## Content and internationalisation

- In dialogs, each item is a finished fact: "Email verified", "Certificate
  valid until 22 Jan 2030", "Recorded in the audit log under your name".
- Steps to come are imperatives: "Verify your email", "Submit for review
  (about 3 business days)".
- Needs-attention items say what to do or what happened: "Add your food
  handler certificate", "Expired 30 Sep 2026".
- Never tick things that were not completed: the contents of an export are a
  plain list (D-6).
- Dates "22 Jan 2030" (with the year when not 2026), counts "6 dishes",
  "5 photos".
- Translatable: item text, `statusLabels`. French runs about 30 % longer;
  items wrap beside the check.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the check class, the
  prefix text, `data-missing`) are computed once per input change, not in the
  template.
- No listeners, timers or observers; static markup.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Checklist.ts`
  renders the "Submission rules" for Auntie Bev's Kitchen (five done items)
  and the mixed anatomy list (done, missing, highlighted attention), toggling
  one item from missing to done; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `ApproveProfileDialog`, `CatererDashboard` (through
  `sh-section-list`), `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the check is a fixed 28 px square in every state, so a
  status change never moves the text.
- Weight: no dependencies beyond the framework; the two icon paths are
  inlined.

## Acceptance criteria

### Rendering

- **AC-1** Given Leah approves Auntie Bev's Kitchen, when "Submission rules" renders with five done items and `prefixes` false, then it is a `ul.checklist` labelled by the heading, each `li` has a `span.check.check--done[aria-hidden=true]` with a tick, and the items read "Email verified", "5 photos, each with a caption, cover chosen", "6 dishes", "Description, cuisines, areas, guests and occasions", "Food handler certificate valid". (L2-048)
- **AC-2** Given Beverley's profile meets every rule, when the submit dialog's confirmation line renders, then it is a `p.cluster` with one done `sh-check` before "All 10 sections are complete." (L2-039)
- **AC-3** Given a caterer has just registered, when the next steps render with `ordered`, then they are an `ol.checklist` with "Account created" done and "Verify your email", "Add photos, menu and food safety certificate", "Submit for review (about 3 business days)" each to do, with `data-missing` and an empty ring. (L2-037)
- **AC-4** Given a draft with 2 photos, when a mixed checklist renders "Add at least 3 photos (2 so far)" as missing and "Email verified" as done, then each item's state is shown both by its check and by its words. (L2-038)
- **AC-5** Given Beverley's submission failed because of photos, when the item "Add at least 3 photos" renders with `status="attention"` and `highlight`, then it has `.check--error` with a bare exclamation (no inner circle), `data-highlight`, and text in `--color-danger-fg` at `--font-weight-medium`. (L2-039)
- **AC-6** Given Flying Fish Kitchen's certificate expired on 30 Sep 2026, when its setup row's mark renders through `sh-check` with `status="attention"`, then the mark is `span.check.check--error[aria-hidden=true]`. (L2-040)
- **AC-7** Given Leah suspends Pelau House, when the dialog lists what will happen, then each item is a `.checklist` line led by an `aria-hidden` `icon--sm` (mail, info) and no `.check`, reading "Kendra gets an email with your reason." and "3 open enquiries close; those customers are told Pelau House is no longer available." (L2-058)
- **AC-8** Given Marcia requests her data, when the dialog lists what the export holds, then the items "Your profile and consent records", "4 enquiries and every message in them", "2 reviews you wrote" and "1 report you sent" render with no check and no "Done" prefix. (L2-071)

### Screen readers and automated checks

- **AC-9** Given the mixed list, when a screen reader reads it, then it hears "list, 3 items", "Done: Email verified", "To do: Add at least 3 photos (2 so far)", "Needs attention: Add your food handler certificate", and nothing from the checks. (L2-068)
- **AC-10** Given every checklist variant in both themes, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)
- **AC-11** Given a dialog containing a checklist, when the person tabs through it, then no checklist item or check receives focus. (L2-067)

### Theming

- **AC-12** Given the light theme, when a done check renders on the page and in a dialog, then the `--color-success-solid` disc has at least 3:1 against `--color-bg-canvas` and `--color-bg-surface-raised`, and the tick at least 4.5:1 against the disc. (L2-069)
- **AC-13** Given the dark theme, when a done check renders, then the disc resolves to `--palette-callaloo-300` and the tick to `--palette-stone-950`, with at least 3:1 and 4.5:1 respectively. (L2-069)
- **AC-14** Given either theme, when a to-do ring and a needs-attention ring render, then each has at least 3:1 against its surface, the missing text `--color-fg-muted` and the highlighted text `--color-danger-fg` at least 4.5:1. (L2-069)
- **AC-15** Given the mixed list rendered in greyscale, when it is compared with colour, then every item's state is still clear from the check's shape (ring, filled disc, exclamation) and from its words. (L2-069)

### Responsive

- **AC-16** Given a 320 px viewport in the approve dialog, when "Description, cuisines, areas, guests and occasions" renders, then it wraps beside its check, the check stays 28 × 28 CSS px and centred on the first line, and nothing scrolls horizontally. (L2-064)
- **AC-17** Given a 1280 px window at 200 % zoom, when the approve dialog's checklists render, then every item is readable with no horizontal scrolling. (L2-069)

### Performance

- **AC-18** Given the `Checklist` perf-test scenario, when an item changes from missing to done, then the change paints within 200 ms with no layout shift, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/checklist/`; files
  `check.component.*` (selector `sh-check`, class `CheckComponent`),
  `checklist.component.*` (selector `sh-checklist`, class
  `ChecklistComponent`) and `checklist-item.component.*` (selector
  `sh-checklist-item`, class `ChecklistItemComponent`). The list passes
  `statusLabels` and `prefixes` to its items.
- Styles: the `.check` and `.checklist` section of
  `docs/design-system/assets/components.css` moves into the component.
- `sh-check` is composed by `sh-section-list` in [side nav](side-nav.md), whose
  item `status` uses the same three names; keep the two in step.
- Design-system catch-up for D-5: change `.checklist li` to
  `align-items: flex-start` and give its text `padding-top: var(--space-0-5)`,
  so a check centres on the first line of a wrapped item as the design system
  states; today's `align-items: center` centres it on the whole block. The
  rendering applies it with a specimen-only style.
- Mock catch-up: `notifications/profile-banner/*` nest the circled danger
  icon inside `.check--error`; `dialogs/download-data` ticks the export's
  contents (D-6); `register-caterer/success` has no hidden prefixes (D-4).
- Composes nothing else. Composed by [dialog](dialog.md) bodies, the
  registration success page and [side nav](side-nav.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Items as content children or as data?* Content children (`sh-checklist-item`), because icon lines need a projected icon and some items need inline formatting; `sh-section-list` uses data because its rows are uniform links. Both share `status` names and `statusLabels`.
- **D-3** *When may the hidden prefixes be dropped?* Only when every item is done and a heading or sentence already says so, as the design system allows ("Submission rules"); the list is then labelled by that heading. Mixed lists always carry prefixes.
- **D-4** *Do the next steps after registration carry prefixes?* Yes. The mock has none, but the list is mixed (one done, three to do), and the design system requires a prefix whenever states differ so the state is not carried by the ring alone.
- **D-5** *Where does the check sit beside a wrapped item?* Centred on the first line, as the design system's *Responsive* section says; `components.css` centres it on the whole item, which floats the check between lines when "Description, cuisines, areas, guests and occasions" wraps at 320 px.
- **D-6** *Who renders lists of consequences and of export contents that use `.checklist` in the mocks?* This component, as items with `status` null: icon lines for consequences (suspend, remove caterer) and plain lines for export contents. The design system says neither is a checklist of done items, so they never get a check or a "Done" prefix; they keep the `.checklist` layout the mocks and the [dialog](dialog.md) CRD rely on, and no other CRD owns that layout.
