# Timeline

| Field | Value |
|---|---|
| Selector | `sh-timeline` (the `ol.timeline`, its loading block and status line), `sh-timeline-entry` (one `li`) |
| Library path | `frontend/projects/components/src/lib/timeline/` |
| Status | planned |
| Traces to | L2-039, L2-044, L2-046, L2-048, L2-058, L2-064, L2-066, L2-067, L2-068, L2-069 |
| Design system | [`timeline.html`](../../design-system/components/timeline.html) |
| Source mocks | [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html), [`pages/admin-caterer/suspended`](../../mocks/pages/admin-caterer/suspended.html), [`pages/admin-caterer/removed`](../../mocks/pages/admin-caterer/removed.html), [`pages/admin-caterer/certificate-expired`](../../mocks/pages/admin-caterer/certificate-expired.html), [`pages/admin-profile-review/default`](../../mocks/pages/admin-profile-review/default.html), [`pages/admin-profile-review/name-change`](../../mocks/pages/admin-profile-review/name-change.html), [`pages/admin-profile-review/resubmitted`](../../mocks/pages/admin-profile-review/resubmitted.html), [`dialogs/suspend-caterer/default`](../../mocks/dialogs/suspend-caterer/default.html), [`dialogs/submit-profile/success`](../../mocks/dialogs/submit-profile/success.html) |
| Rendering | [`timeline.html`](timeline.html) |

## Purpose and scope

A timeline is an ordered list with a 2 px rule down its left edge. Each entry
is a time stamp, what happened and, where it matters, who did it and why. It
never has dots, icons or colour: the order and the words are the information.
Three uses:

- **Status history** on the operator's caterer record (and behind the
  suspend, remove, reinstate, approve and request-changes dialogs), newest
  first, so the operator sees the latest decision and its reason before acting
  again.
- **History** in sentence form on the profile review ("Name change requested
  by Kendra Baptiste").
- **Next steps** after a caterer submits their profile: "Now", "Within 3
  business days", "Approved", in forward order, without time stamps.

Use the [table](table.md) audit log to filter and compare many events across
caterers, a message thread for conversations, and a
[description list](description-list.md) for a record's current values.

Out of scope:

- Which entries are shown, their order and the cap of 10: the page passes
  them (status history is newest first; next steps oldest first).
- The section heading ("Status history"), its "Audit log" link and the
  read-only note under the list ("History entries can't be edited"): the
  page renders them.
- Formatting time stamps: the consumer passes "Fri 14 Mar 2025, 11:20 a.m."
  and the UTC `datetime`.

## Usage

Inventory from a search of `docs/mocks` for `class="timeline`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-caterer/default`, `suspended`, `certificate-expired`; `dialogs/suspend-caterer/*`, `reinstate-caterer/*`, `remove-caterer/*`, `operator-edit/*` (page behind) | status history, newest first, 5 entries | "Fri 14 Mar 2025, 11:20 a.m." / **Published** · Tomas Reyes / "Approved"; "Mon 10 Mar 2025, 2:40 p.m." / **Changes requested** · Leah Mohammed / "“Photo 4 is blurry. Please replace it with a sharper one.”"; … "Tue 4 Mar 2025, 7:30 p.m." / **Draft** · Kendra Baptiste / "Account created"; suspended adds "Fri 9 Oct, 4:30 p.m." / **Suspended** · Leah Mohammed / "Food handler certificate expired on 30 Sep 2026" | default | canvas |
| `pages/admin-caterer/removed` | status history, 6 entries | "Sat 10 Oct, 10:48 a.m." / **Removed** · Leah Mohammed / "“Repeated stock photos after two warnings; owner confirmed the business has closed.”" | long reason | canvas |
| `pages/admin-profile-review/default`, `name-change`, `resubmitted`; `dialogs/approve-profile/*`, `request-changes/*` (page behind) | sentence history, newest first | "Wed 7 Oct, 2:10 p.m." / "Submitted for review by Beverley Campbell"; "Mon 28 Sep, 8:47 p.m." / "Draft created"; "Fri 9 Oct, 6:20 p.m." / "Name change requested by Kendra Baptiste" | default, one-line entries | canvas |
| `dialogs/submit-profile/success` | next steps, forward, no time stamps | **Now** / "Your profile is read-only while we look at it."; **Within 3 business days** / "We email beverley@auntiebevs.example with the result."; **Approved** / "Auntie Bev's Kitchen appears in the listing within a minute." | default | dialog |
| `pages/admin-caterer/loading`, `admin-profile-review/loading` | the page's own skeleton; the timeline's `busy` block when it loads on its own (D-5) | — | loading | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `ol.timeline`: no numbers, `--border-width-thick` left rule in
   `--color-border-default`, `--space-4` padding to the text, `--space-4`
   between entries. Named by `aria-label` with its order.
2. **Entry** — `li`: a column with `--space-0-5` between lines.
3. **When** — `time.timeline__when[datetime]`: `--text-caption`,
   `--color-fg-subtle`, Toronto time. Absent in next steps.
4. **Event line** — `span`: the event in `strong` (a status word), " · ", the
   person; or one sentence ("Published by Leah Mohammed"); or, in next steps,
   the time phrase in `strong`.
5. **Reason or note (optional)** — `span.text-muted.text-sm`: the operator's
   reason in curly quotes, or a short past-tense note ("Approved",
   "Resubmitted"); in next steps the sentence, `span.text-muted`.
6. **Loading block** — `div.timeline[aria-hidden="true"]` with skeleton
   lines, plus a hidden status line.

Host: `sh-timeline` is `display: block` and renders the `ol` (or the loading
block and status line). `sh-timeline-entry` is `display: contents` and renders
the `li`.

## API

### `sh-timeline` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | `aria-label` with the order: "Status history, newest first", "What happens next". |
| `form` | `'event' \| 'sentence' \| 'steps'` | `'event'` | no | Fixes one entry form for the whole list (D-2); entries render accordingly. |
| `busy` | `boolean` | `false` | no | Renders the loading block (`aria-hidden`) and the `busyLabel` status line instead of entries. |
| `busyLabel` | `string` | — | yes when `busy` | "Loading status history". |
| `skeletonCount` | `number` | `2` | no | Skeleton entries while busy (two lines each). |

### `sh-timeline-entry` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `datetime` | `string \| null` | `null` | yes unless `steps` | ISO 8601 in UTC, rendered as the `time` element's `datetime`. |
| `when` | `string \| null` | `null` | yes unless `steps` | The formatted Toronto time ("Fri 14 Mar 2025, 11:20 a.m."). |
| `event` | `string` | — | yes | `event` form: the status word in `strong` ("Changes requested"). `sentence` form: the whole sentence ("Published by Leah Mohammed"). `steps` form: the time phrase in `strong` ("Within 3 business days"). |
| `actor` | `string \| null` | `null` | yes in `event` form | The person's full name after " · " ("Leah Mohammed"). |
| `reason` | `string \| null` | `null` | no | Rendered as `span.text-muted.text-sm`. Text, never HTML. |
| `quoted` | `boolean` | `false` | no | Wraps `reason` in curly quotes: an operator's own words, exactly as sent to the caterer. |
| `detail` | `string \| null` | `null` | yes in `steps` form | The step's sentence, in `span.text-muted`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Timelines are read-only and not interactive. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-timeline`: default | `sh-timeline-entry` elements, in display order | Hidden while `busy`. |
| `sh-timeline-entry`: none | — | Every part is an input, so each entry keeps the same shape. |

- Translation: `label`, `busyLabel`, the status words, notes ("Approved",
  "Account created"), the sentence templates and the step copy come from the
  resource files through the consumer (L2-064). Names, time stamps and
  operator reasons are data.

## Variants and sizes

| Variant | `form` | Order | Entry |
|---|---|---|---|
| Status history | `event` | Newest first | When · **Status** · Person · reason or note |
| History | `sentence` | Newest first | When · sentence |
| Next steps | `steps` | Forward | **Time phrase** · sentence |

One size: caption time stamps, body-text events, small reasons, `--space-4`
between entries. In dialogs the same size; the dialog scrolls.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Rule, stacked entries | "Status history, newest first, list, 5 items" |
| Long reason | reason wider than the column | Wraps under the event; the rule runs the full height | Full reason |
| One entry | a single entry | One entry against the rule | "list, 1 item" |
| Loading | `busy` | Skeleton lines against the rule | Block hidden; status "Loading status history" |
| Hover, focus, active, disabled, selected | — | None: read-only and not interactive | — |
| Empty | — | Never: every profile has at least its "Draft" entry; next steps are static | — |

## Markup

```html
<!-- rendered: status history (event form) -->
<ol class="timeline" aria-label="Status history, newest first">
  <li><time class="timeline__when" datetime="2025-03-14T15:20:00Z">Fri 14 Mar 2025, 11:20 a.m.</time><span><strong>Published</strong> · Tomas Reyes</span><span class="text-muted text-sm">Approved</span></li>
  <li><time class="timeline__when" datetime="2025-03-10T18:40:00Z">Mon 10 Mar 2025, 2:40 p.m.</time><span><strong>Changes requested</strong> · Leah Mohammed</span><span class="text-muted text-sm">“Photo 4 is blurry. Please replace it with a sharper one.”</span></li>
  …
</ol>
```

```html
<!-- rendered: history (sentence form) -->
<ol class="timeline" aria-label="History, newest first">
  <li><time class="timeline__when" datetime="2026-10-09T22:20:00Z">Fri 9 Oct, 6:20 p.m.</time><span>Name change requested by Kendra Baptiste</span></li>
  <li><time class="timeline__when" datetime="2026-04-14T15:02:00Z">Tue 14 Apr, 11:02 a.m.</time><span>Published by Leah Mohammed</span></li>
</ol>
```

```html
<!-- rendered: next steps -->
<ol class="timeline" aria-label="What happens next">
  <li><strong>Now</strong><span class="text-muted">Your profile is read-only while we look at it.</span></li>
  <li><strong>Within 3 business days</strong><span class="text-muted">We email beverley@auntiebevs.example with the result.</span></li>
  <li><strong>Approved</strong><span class="text-muted">Auntie Bev's Kitchen appears in the listing within a minute.</span></li>
</ol>
```

```html
<!-- rendered: loading -->
<div class="timeline" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
<p class="visually-hidden" role="status">Loading status history</p>
```

Consumer template (binding syntax illustrative):

```html
<sh-timeline [label]="t('history.label')" [busy]="loading()" [busyLabel]="t('history.loading')">
  @for (h of history().slice(0, 10); track h.id) {
    <sh-timeline-entry [datetime]="h.atUtc" [when]="h.atToronto" [event]="t('status.' + h.to)" [actor]="h.by"
        [reason]="h.reason ?? t('history.note.' + h.kind)" [quoted]="!!h.reason"></sh-timeline-entry>
  }
</sh-timeline>
```

The e2e page objects locate timelines by `ol.timeline`, its accessible name,
`li`, `time.timeline__when[datetime]`, `strong` and the reason span; those are
part of the contract.

## Design

- List: `list-style: none`, padding-left `--space-4`, left border
  `--border-width-thick` solid `--color-border-default`, flex column with
  `--space-4` gap.
- Entry: flex column, `--space-0-5` gap.
- When: `--text-caption`, `--color-fg-subtle`.
- Event: body text, `--color-fg-default`; the event word `strong`.
- Reason: `--text-body-sm`, `--color-fg-muted`.
- Skeleton lines: [skeleton](skeleton.md) `.skeleton--text`, 8rem / 12rem.
- No dots, icons, colours by status, motion or elevation.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | — |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rule | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Time stamp | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Event | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Reason, step sentence | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Page / dialog | `--color-bg-canvas` / `--color-bg-surface-raised` | `--palette-white` / `--palette-white` | `--palette-stone-950` / `--palette-stone-850` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Time stamp on the page |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Time stamp in a dialog |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Event |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Reason |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Reason, step sentence in a dialog |

The rule is decorative (the order is in the list semantics and the time
stamps), so it needs no 3:1. Forced colours: the rule becomes `CanvasText`.

## Responsive behaviour

- One column at every width; each entry is stacked (when, event, reason), so
  nothing has to fit side by side at 320 px.
- Long reasons wrap under the event; the rule runs the full list height.
- In dialogs that fill the screen below 48rem the timeline scrolls with the
  dialog body; from 48rem it keeps the dialog's measure.
- At 320 px nothing scrolls horizontally; at 200 % zoom everything stays
  readable. Not a touch target.

## Accessibility

### Role and pattern

An `ol` (the order is the meaning) with one `li` per event and a
`time datetime` per stamp. No ARIA roles. Because newest-first contradicts the
numbering a screen reader may read, the list's name says the order
("Status history, newest first").

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops in the timeline. |

### Focus

None.

### Labelling

- Each entry is self-contained: time, event, actor, reason. Nothing relies on
  position or the rule.
- Operator reasons are quoted exactly as written, because the caterer
  received the same words by email.
- The list's `aria-label` names it and its order.

### Announcements

Only the loading status line, once.

### Motion

None. Skeleton shimmer stops under reduced motion.

## Content and internationalisation

- Time stamps: "Fri 14 Mar 2025, 11:20 a.m." — weekday, day, short month, the
  year only when it isn't 2026 (D-4), a comma, the time with "a.m." / "p.m.";
  Toronto time.
- Status history: the status word in bold, the same words as the
  [status](status.md) label (Published, Pending review, Changes requested,
  Suspended, Removed, Draft), a middle dot, the person's full name; then the
  reason, quoted if an operator wrote it, otherwise a short past-tense note
  ("Approved", "Resubmitted", "Submitted", "Account created").
- Sentence history: "Name change requested by Kendra Baptiste", "Published by
  Leah Mohammed", "Draft created". One form per list.
- Next steps: a short time phrase in bold and one sentence each.
- Translatable: `label`, status words, notes, sentence templates, step copy,
  `busyLabel`. Data: names, time stamps, reasons.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the quoted reason, the
  entry form) are computed once, not in the template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Timeline.ts`
  renders Pelau House's 5-entry status history ("Published · Tomas Reyes"
  … "Draft · Kendra Baptiste"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `AdminCaterer`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the loading block reserves two lines per entry.
- Weight: [skeleton](skeleton.md) only.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's five status changes, when its operator record renders the status history, then `ol.timeline` named "Status history, newest first" lists "Published · Tomas Reyes" (Fri 14 Mar 2025, 11:20 a.m.) first and "Draft · Kendra Baptiste" (Tue 4 Mar 2025, 7:30 p.m.) last, each entry with its time, status word in `strong`, person and note or reason. (L2-046)
- **AC-2** Given Leah Mohammed requested changes with the reason "Photo 4 is blurry. Please replace it with a sharper one.", when that entry renders, then the reason reads exactly "“Photo 4 is blurry. Please replace it with a sharper one.”" in `span.text-muted.text-sm`. (L2-048)
- **AC-3** Given Leah Mohammed suspended Flying Fish Kitchen on Fri 9 Oct at 4:30 p.m. with the reason "Food handler certificate expired on 30 Sep 2026", when its status history renders, then the first entry is "Fri 9 Oct, 4:30 p.m." / "Suspended · Leah Mohammed" / that reason. (L2-058)
- **AC-4** Given every status-history entry, when it is inspected, then its time is a `time.timeline__when` whose `datetime` is the UTC instant and whose text is the Toronto time, and no entry is editable or offers any control. (L2-046)
- **AC-5** Given Kendra requested a name change on Fri 9 Oct at 6:20 p.m., when the profile review's history renders with `form="sentence"`, then the entry reads "Name change requested by Kendra Baptiste" under "Fri 9 Oct, 6:20 p.m.", and every entry in that list uses the sentence form. (L2-044)
- **AC-6** Given Beverley Campbell has just submitted Auntie Bev's Kitchen, when the success dialog renders the next steps, then `ol.timeline` named "What happens next" lists "Now", "Within 3 business days" and "Approved" in that order, each with its sentence and no time stamp. (L2-039)

### States

- **AC-7** Given the status history loads on its own, when it renders with `busy` and `busyLabel` "Loading status history", then a `div.timeline[aria-hidden="true"]` with skeleton lines and a `role="status"` line "Loading status history" are shown, and no `li` is rendered. (L2-066)
- **AC-8** Given the removed record's reason "Repeated stock photos after two warnings; owner confirmed the business has closed.", when it renders at 360 px, then it wraps under the event and the left rule runs to the end of the list. (L2-064)

### Keyboard and focus

- **AC-9** Given the operator record, when a keyboard user tabs past the "Status history" heading, then focus goes from the "Audit log" link to the next control after the timeline without stopping in it. (L2-067)

### Screen readers

- **AC-10** Given the status history, when a screen reader reaches it, then it announces "Status history, newest first, list, 5 items" and reads each entry as time, status, person, reason. (L2-068)
- **AC-11** Given the operator record and profile review, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any timeline. (L2-066)

### Theming

- **AC-12** Given the light and the dark theme, when the status history renders on the page and inside a dialog, then the time stamp, event and reason each have at least 4.5:1 contrast against the background, and no entry is coloured by status. (L2-069)

### Responsive

- **AC-13** Given a 320 px viewport, when the status history renders, then each entry stacks time, event and reason, and the page does not scroll horizontally. (L2-064)
- **AC-14** Given a 1280 px window at 200 % zoom, when the status history renders, then every entry is readable and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-15** Given `prefers-reduced-motion: reduce`, when the status history is loading, then the skeleton lines do not shimmer and nothing in the timeline animates. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/timeline/`; files
  `timeline.component.*` (`sh-timeline`) and `timeline-entry.component.*`
  (`sh-timeline-entry`).
- Styles: the "Timeline" section of `components.css` moves into the
  component, class names unscoped; `.text-muted` and `.text-sm` stay global
  utilities.
- `sh-timeline-entry` reads its parent's `form` to choose the entry markup.
- Mock catch-up: every time stamp becomes `<time datetime>`; the lists gain
  their `aria-label`; "Sat 10 Oct 2026, 10:48 a.m." on the removed record
  drops the year (D-4).
- Composes [skeleton](skeleton.md). No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Can one timeline mix sentence and "event · actor" entries?* No. The design system says one form per list; `form` on the list enforces it.
- **D-3** *Does the timeline cap its entries?* No. The page passes at most the latest 10 and links to the audit log; the component renders what it gets, so the cap lives with the page's query.
- **D-4** *Year in 2026 time stamps?* Dropped, as the cast and the design system's content rules say; the removed mock's "Sat 10 Oct 2026" is drift.
- **D-5** *Does the timeline have its own loading state although the mocks load the whole page?* Yes, the design system renders one; it is used when the history loads separately (for example after an action), and the page's skeleton covers first load.
- **D-6** *Status colour on entries?* None. The design system forbids tinting entries; the bold status word carries it.
