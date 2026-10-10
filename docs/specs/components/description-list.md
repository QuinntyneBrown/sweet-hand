# Description list

| Field | Value |
|---|---|
| Selector | `sh-description-list` (the `dl` in one of seven layouts, its loading state and the certificate caption), `sh-description` (one term and value pair), `sh-inline-list` (`ul.inline-list`), `sh-change-value` (`del.diff-old` / `ins.diff-new`), `sh-changed-flag` (`.changed-flag`) |
| Library path | `frontend/projects/components/src/lib/description-list/` |
| Status | planned |
| Traces to | L2-014, L2-015, L2-019, L2-020, L2-021, L2-032, L2-035, L2-040, L2-044, L2-047, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 |
| Design system | [`description-list.html`](../../design-system/components/description-list.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/account/default`](../../mocks/pages/account/default.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/thread/edge`](../../mocks/pages/thread/edge.html), [`pages/thread/loading`](../../mocks/pages/thread/loading.html), [`pages/dashboard-enquiry/default`](../../mocks/pages/dashboard-enquiry/default.html), [`dialogs/enquiry/success`](../../mocks/dialogs/enquiry/success.html), [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html), [`pages/admin-caterer/certificate-expired`](../../mocks/pages/admin-caterer/certificate-expired.html), [`pages/admin-profile-review/name-change`](../../mocks/pages/admin-profile-review/name-change.html), [`pages/admin-profile-review/resubmitted`](../../mocks/pages/admin-profile-review/resubmitted.html), [`pages/admin-changes/default`](../../mocks/pages/admin-changes/default.html), [`pages/admin-caterers/default`](../../mocks/pages/admin-caterers/default.html), [`pages/profile-events/default`](../../mocks/pages/profile-events/default.html), [`pages/admin-breaches/default`](../../mocks/pages/admin-breaches/default.html) |
| Rendering | [`description-list.html`](description-list.html) |

## Purpose and scope

A description list pairs a label with a value: how many guests a caterer
serves, which areas they cover, what an enquiry asks for, what a food handler
certificate says, what a caterer changed. Seven layouts share one rule: the
term is quiet, the value is what people came to read. Every layout is a real
`<dl>`, so screen readers announce "description list" and pair each term with
its value.

- **Facts** (`.facts`): the caterer page's large facts, "Serves 20–300
  guests" and the occasions.
- **Areas served** (`.regions`): a region as the term, its municipalities as
  the value.
- **Record** (`.kv`): account details and operator records, with a label
  column, hairline rows and room for a trailing status or small action.
- **Enquiry summary** (`.enquiry-summary`): the four things a caterer needs to
  answer, in a sunken well, with the original message.
- **Certificate** (`.certificate`): the food handler certificate as the
  caterer entered it, always captioned as the caterer's own statement.
- **Change review** (`.diff-old`, `.diff-new`, `.changed-flag`): old and new
  values for the operator who approves or reverts them.
- **Plain** (`.dl`): the base two-column list for anything short.

Use a [table](table.md) or [list rows](list.md) for many records of the same
shape and a [timeline](timeline.md) for a sequence of events. Values the
person can edit are changed in a [dialog](dialog.md) opened from a button,
never inline in the list. Headline numbers are [stats](stat.md).

Out of scope:

- The heading above each list ("Areas served", "Your details", "Food handler
  certificate") and the certificate's date [status](status.md) ("Valid",
  "Expires Mon 9 Nov", "Expired"): the page renders them.
- Formatting values: the consumer passes "Serves 20–300 guests" (L2-020),
  "Saturday 21 November 2026", "14 Mar 2029" already formatted.
- Fetching and authorising private values (certificate, email, phone): the
  page only renders this component for the caterer and operators (L2-040,
  L2-014).
- The certificate file link's time-limited URL (L2-040.4): the consumer's
  button in the value slot.
- Which of the two `.facts` copies on the caterer page is shown at a width:
  the page's `.until-lg` / `.only-lg` utilities.

## Usage

Inventory from a search of `docs/mocks` for each layout class (`facts`,
`regions`, `kv`, `enquiry-summary`, `certificate`, `dl`, `diff-old`,
`diff-new`, `changed-flag`, `inline-list`).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default`, `edge`, `more-dishes`, `no-reviews`, `can-review`, `own-review`, `offline`; `dialogs/enquiry`, `review`, `report`, `photo-viewer`, `delete-review` (page behind) | `facts`, two copies (content column below LG, enquiry panel from LG), pairs wrapped in `div` | "Guests" / "Serves 20–300 guests"; "Occasions" / `sh-inline-list` "Weddings", "Birthdays", "Family gatherings", "Corporate events", "Religious and cultural celebrations" | default | canvas, sticky panel |
| `pages/caterer/default` (same pages) | `regions` under "Areas served" | "City of Toronto" / "Scarborough, East York, North York"; "Durham" / "Pickering, Ajax" | default | canvas |
| `pages/profile-events/default` | `facts`, one pair as a preview | "On your page" / "Serves 20–300 guests" | default | canvas |
| `pages/account/default`, `caterer`, `bounced`, `unverified`, `saved`; `dialogs/change-password`, `delete-account`, `download-data`, `edit-details`, `end-session` (page behind) | `record` | "Display name" / "Marcia Thompson"; "Email" + status "Verified"; "Phone" + private note "Private until you share it in a thread"; "Password" / "Last changed Sat 14 Mar" + `sm` "Change password" | default, missing ("Not added") | canvas |
| `pages/admin-caterer/default`; `dialogs/suspend-caterer`, `reinstate-caterer`, `remove-caterer`, `operator-edit` (page behind) | `record` ×3 and `certificate` | "Contact" / "Kendra Baptiste", "Email" / "kendra@pelauhouse.example", "On Sweet Hand since" / "Fri 14 Mar 2025"; "Enquiries" / "41 enquiries · 3 open"; certificate "Holder", "Issued by" "Toronto Public Health", "Number" "FH-2024-118734", "Expires" "14 Mar 2029", "Copy" link button | default | canvas |
| `pages/admin-caterer/certificate-expired` | `certificate` | Sharon Best, "Durham Region Health", "FH-2021-337102", "30 Sep 2026" | default (status "Expired" beside the heading) | canvas |
| `pages/admin-profile-review/default`, `name-change`, `resubmitted`; `dialogs/approve-profile`, `request-changes` | `facts`, `regions`, `certificate`, `record` with `sh-change-value`, `sh-changed-flag` | "Current name" / old "Pelau House"; "Requested name" / new "Pelau House by Kendra"; flag "Changed since changes were requested" | changed | canvas, dialog |
| `pages/admin-changes/default`; `dialogs/revert-change` | `plain` with "Was" / "Now" and `sh-change-value` (D-6) | "Serves 30–150 guests" → "Serves 30–200 guests"; description edits | changed, new-only, removed | canvas, dialog |
| `pages/admin-caterers/default` | `sh-changed-flag` inside a [queue item](queue-item.md) | "Name change waiting", "1 open report", "Resubmitted", "Certificate expired" | default | canvas |
| `pages/thread/default`, `open`, `closed`, `declined`, `shared`, `long`, `edge`, `invalid`, `submitting`; `pages/dashboard-enquiry/*`; `dialogs/close-enquiry`, `decline-enquiry`, `share-contact`; `notifications/toast/*` (page behind) | `enquiry-summary` with the message | "Event date" / "Saturday 21 November 2026", "Guests" / "120", "Area" / "Scarborough", "Occasion" / "Family gatherings"; "Your enquiry" / Marcia's message; "Marcia Thompson · Thu 8 Oct, 7:15 p.m." | default, long message, literal markup (`edge`) | canvas |
| `pages/dashboard-enquiry/default` | `enquiry-summary` (caterer view) | "Thu 5 Nov 2026" (D-7: written in full), "60", "Downtown Toronto · M5V", "Corporate events" | default | canvas |
| `dialogs/enquiry/success` | `enquiry-summary`, no message, short date | "Date" / "Sat 21 Nov", "Guests" 120, "Area" Scarborough, "Occasion" Family gatherings | default | dialog |
| `pages/thread/loading` | `enquiry-summary`, `busy` | — | loading | canvas |
| `pages/admin-breaches/default` | `record` inside a breach record ([list rows](list.md)) | "Information involved", "People affected" 1, "Risk assessment", "Notification decision" | default | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `dl` with the layout class: `.facts`, `.regions`, `.kv`,
   `.enquiry-summary`, `.certificate`, `.dl`.
2. **Pair wrapper (facts, regions, enquiry summary)** — one `div` around each
   `dt`/`dd` pair, as HTML allows. In `.kv`, `.certificate` and `.dl` the pairs
   are direct children of the `dl`, because the grid needs them that way.
3. **Term** — `dt`: one or two nouns, `--text-label`, `--color-fg-subtle`
   (`--color-fg-muted` in `.dl`).
4. **Value** — `dd`: body text, or `--text-body-lg` in `.facts` and
   `.regions`. Wraps; in `.kv` and `.certificate` it breaks anywhere.
5. **Trailing status or action (record only)** — after the value text inside
   the `dd` (a flex row with `justify-content: space-between`): a
   [status](status.md), a `.private-note`, or a small [button](button.md).
6. **Message (enquiry summary)** — `div.enquiry-summary__message` spanning
   the row: the message in a `p` that keeps line breaks, then
   `p.enquiry-summary__by` (sender and time).
7. **Container** — hairline rows in `.kv`; the sunken well in
   `.enquiry-summary`; the hairline box in `.certificate`; nothing in
   `.facts`, `.regions` and `.dl`.
8. **Certificate caption** — `p.text-caption` after the certificate:
   "Kendra's own statement; Sweet Hand doesn't certify kitchens."
9. **Inline list** — `ul.inline-list` inside a value; CSS draws the commas.
10. **Change values** — `del.diff-old` (struck through, muted) and
    `ins.diff-new` (highlighted); `span.changed-flag` with an optional
    decorative icon.

Host: `sh-description-list` is `display: block` and renders the `dl` (or the
loading block) and, for the certificate, the caption. `sh-description` is
`display: contents` and renders either the `div` wrapper with its `dt`/`dd` or
the bare `dt`/`dd`, depending on the parent's layout. The helpers are
`display: contents` too.

## API

### `sh-description-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `layout` | `'facts' \| 'regions' \| 'record' \| 'enquiry-summary' \| 'certificate' \| 'plain'` | `'plain'` | no | Renders `dl.facts`, `.regions`, `.kv`, `.enquiry-summary`, `.certificate` or `.dl`, and tells each `sh-description` whether to wrap its pair in a `div`. |
| `statement` | `string` | — | yes for `certificate` | The caption under a certificate ("Kendra's own statement; Sweet Hand doesn't certify kitchens."). Always rendered; a certificate without it is a build error (D-3). |
| `busy` | `boolean` | `false` | no | Renders the layout's skeleton (`aria-hidden="true"`) in place of the pairs, and a hidden status line with `busyLabel`. |
| `busyLabel` | `string` | — | yes when `busy` | "Loading enquiry". |
| `skeletonCount` | `number` | `4` | no | Skeleton pairs while busy (enquiry summary 4, record 4, facts 2, certificate 5). |

### `sh-description` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `term` | `string` | — | yes | The `dt` text. |
| `missingText` | `string \| null` | `null` | no | When set and the value slot is empty, renders `dd.text-muted` with this text ("Not added", "No file uploaded"). Ignored in `facts` and `regions`, where a missing pair is omitted by the consumer (D-4). |
| `message` | `boolean` | `false` | no | Enquiry summary only: renders the pair as `div.enquiry-summary__message`, spanning the row. |
| `by` | `string \| null` | `null` | no | With `message`: renders `p.enquiry-summary__by` ("Marcia Thompson · Thu 8 Oct, 7:15 p.m."). |

### Helper inputs

| Component | Input | Type | Default | Required | Rule |
|---|---|---|---|---|---|
| `sh-inline-list` | `items` | `string[]` | — | yes | Renders `ul.inline-list > li` per item; commas are CSS. |
| `sh-change-value` | `kind` | `'old' \| 'new'` | — | yes | `old` renders `del.diff-old`, `new` renders `ins.diff-new` around the slot text. |
| `sh-changed-flag` | `icon` | `boolean` | `false` | no | Adds the decorative info icon (`aria-hidden`) before the text. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Description lists are not interactive. Buttons inside values have their own outputs. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-description-list`: default | `sh-description` elements | One per pair, in reading order. Hidden while `busy`. |
| `sh-description`: default | The value: text, `<time datetime>`, `sh-inline-list`, `sh-change-value`, a `p` for the message, a link button for the certificate copy | Text is rendered as text, never HTML. In a message, line breaks are kept and markup shows literally. |
| `sh-description`: `[slot=end]` | One [status](status.md), one `.private-note`, or one `sh-button size="sm"` | `record` layout only; pushed to the end of the value. |
| `sh-change-value`, `sh-changed-flag`: default | Text | — |

- Translation: `term`, `missingText`, `statement`, `busyLabel` and the flag
  text come from the resource files through the consumer (L2-064). Values are
  data or the consumer's formatted copy.

## Variants and sizes

| Layout | Class | Pairs | Value type | Use for |
|---|---|---|---|---|
| Facts | `.facts` | `div`-wrapped | `--text-body-lg` | Caterer page guests and occasions; the events editor preview. |
| Areas served | `.regions` | `div`-wrapped | `--text-body-lg` | Region → municipalities on the caterer page and in profile review. |
| Record | `.kv` | direct | `--text-body` | Account details, operator caterer records, breach details, name changes. |
| Enquiry summary | `.enquiry-summary` | `div`-wrapped | `--text-body`, tabular figures | Top of every thread; the enquiry sent confirmation. |
| Certificate | `.certificate` | direct | `--text-body` | The food handler certificate, caterer and operators only. |
| Plain | `.dl` | direct | `--text-body` | Short lists ("Report R-2047"), "Was" / "Now" change review. |

Each layout has one size; the layouts are the scale. Width comes from the
container.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Quiet terms, values | "description list, 4 items"; each term read with its value |
| Long value | value wider than the column | Wraps; `.kv` and `.certificate` values break anywhere ("beverley@auntiebevs.example", "FH-2024-118734") | Full value |
| Missing (private screens) | empty value + `missingText` | `dd.text-muted` "Not added" | "Phone, Not added" |
| Missing (public) | — | Pair omitted; never "N/A" (D-4) | — |
| With trailing status / note / action | `[slot=end]` | Pushed to the end of the value row, wrapping under it when narrow | Read after the value; action reachable by Tab |
| Changed | `sh-change-value` | Old struck through in `--color-fg-muted`; new on `--color-warning-bg` | "Current name, deletion, Pelau House"; "Requested name, insertion, Pelau House by Kendra" (term or "Was"/"Now" names them) |
| Flagged | `sh-changed-flag` | Warning-coloured caption text, optional icon | Text read |
| Literal markup in a message | message contains `<script>` | Shown literally, line breaks kept | Read as text; nothing runs |
| Loading | `busy` | The layout's skeletons in the final layout | Container `aria-hidden="true"`; status line says `busyLabel` |
| Hover, focus, active, disabled | — | None: not interactive; controls inside keep their own | — |

## Markup

```html
<!-- rendered: facts and areas served (caterer page) -->
<dl class="facts">
  <div><dt>Guests</dt><dd>Serves 20–300 guests</dd></div>
  <div><dt>Occasions</dt><dd><ul class="inline-list"><li>Weddings</li><li>Birthdays</li><li>Family gatherings</li><li>Corporate events</li><li>Religious and cultural celebrations</li></ul></dd></div>
</dl>
<dl class="regions">
  <div><dt>City of Toronto</dt><dd>Scarborough, East York, North York</dd></div>
  <div><dt>Durham</dt><dd>Pickering, Ajax</dd></div>
</dl>
```

```html
<!-- rendered: record with trailing status, note and action; a missing value -->
<dl class="kv">
  <dt>Display name</dt><dd>Marcia Thompson</dd>
  <dt>Email</dt><dd><span>marcia.t@example.com</span><span class="status status--published">Verified</span></dd>
  <dt>Phone</dt><dd><span>+1 647 555 0187</span><span class="private-note"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg>Private until you share it in a thread</span></dd>
  <dt>Password</dt><dd><span>Last changed Sat 14 Mar</span><button class="btn btn--sm" type="button" aria-haspopup="dialog">Change password</button></dd>
</dl>
<dl class="kv"><dt>Phone</dt><dd class="text-muted">Not added</dd></dl>
```

```html
<!-- rendered: enquiry summary -->
<dl class="enquiry-summary">
  <div><dt>Event date</dt><dd><time datetime="2026-11-21">Saturday 21 November 2026</time></dd></div>
  <div><dt>Guests</dt><dd>120</dd></div>
  <div><dt>Area</dt><dd>Scarborough</dd></div>
  <div><dt>Occasion</dt><dd>Family gatherings</dd></div>
  <div class="enquiry-summary__message"><dt>Your enquiry</dt><dd><p>Hi Kendra, we're planning my parents' 40th anniversary …</p><p class="enquiry-summary__by">Marcia Thompson · <time datetime="2026-10-08T23:15:00Z">Thu 8 Oct, 7:15 p.m.</time></p></dd></div>
</dl>
```

```html
<!-- rendered: certificate with its caption -->
<dl class="certificate">
  <dt>Holder</dt><dd>Kendra Baptiste</dd>
  <dt>Issued by</dt><dd>Toronto Public Health</dd>
  <dt>Number</dt><dd>FH-2024-118734</dd>
  <dt>Expires</dt><dd><time datetime="2029-03-14">14 Mar 2029</time></dd>
  <dt>Copy</dt><dd><button class="btn btn--link btn--sm" type="button"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>food-handler-certificate.pdf (1.2 MB)</button></dd>
</dl>
<p class="text-caption">Kendra's own statement; Sweet Hand doesn't certify kitchens.</p>
```

```html
<!-- rendered: change review -->
<dl class="kv">
  <dt>Current name</dt><dd><del class="diff-old">Pelau House</del></dd>
  <dt>Requested name</dt><dd><ins class="diff-new">Pelau House by Kendra</ins></dd>
</dl>
<dl class="dl"><dt>Was</dt><dd><del class="diff-old">Serves 30–150 guests</del></dd><dt>Now</dt><dd><ins class="diff-new">Serves 30–200 guests</ins></dd></dl>
<span class="changed-flag"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg>Changed since changes were requested</span>
```

```html
<!-- rendered: loading (enquiry summary) -->
<div class="enquiry-summary" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
<p class="visually-hidden" role="status">Loading enquiry</p>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: caterer page facts -->
<sh-description-list layout="facts">
  <sh-description [term]="t('caterer.guests')">{{ guestRange() }}</sh-description>
  <sh-description [term]="t('caterer.occasions')"><sh-inline-list [items]="occasions()"></sh-inline-list></sh-description>
</sh-description-list>

<!-- consumer: operator's certificate view -->
<sh-description-list layout="certificate" [statement]="t('certificate.statement', { name: holderFirstName() })">
  <sh-description [term]="t('certificate.holder')">{{ cert.holder }}</sh-description> …
  <sh-description [term]="t('certificate.copy')" [missingText]="t('certificate.noFile')">@if (cert.file) { <sh-button variant="link" size="sm" (activated)="openFile()">…</sh-button> }</sh-description>
</sh-description-list>

<!-- consumer: thread -->
<sh-description-list layout="enquiry-summary" [busy]="loading()" [busyLabel]="t('thread.loading')">
  <sh-description [term]="t('enquiry.eventDate')"><time [attr.datetime]="e.date">{{ e.dateLong }}</time></sh-description> …
  <sh-description message [term]="t('enquiry.yours')" [by]="e.by"><p>{{ e.message }}</p></sh-description>
</sh-description-list>
```

The e2e page objects locate lists by the layout class, `dt` text, the paired
`dd`, `.enquiry-summary__message`, `.enquiry-summary__by`, `del.diff-old`,
`ins.diff-new`, `.changed-flag` and the certificate caption; those are part of
the contract. Icon path data is free to change.

## Design

- `.facts`: column, `--space-6` between pairs; term `--text-label` in
  `--color-fg-subtle` with `--space-1` below; value `--text-body-lg`.
- `.regions`: one column, two from 48rem, `--space-6` gap; value
  `--text-body-lg` `--space-1` under the term.
- `.kv`: one column below 36rem (term `--space-4` above, value
  `--space-1` / `--space-4` with a hairline under it); from 36rem a 12rem term
  column with the hairline under both cells and `--space-3` / `--space-4`
  padding; values are a wrapping flex row, `--space-2` gap, `overflow-wrap:
  anywhere`.
- `.enquiry-summary`: two columns, four from 48rem; `--space-4` / `--space-6`
  gaps; `--space-6` padding; `--color-bg-surface-sunken` well with
  `--radius-lg`; values in tabular figures; the message spans every column
  and keeps line breaks (`white-space: pre-wrap`, `overflow-wrap: anywhere`,
  D-5); `__by` in `--text-caption`, `--color-fg-subtle`, `--space-1` above.
- `.certificate`: `max-content` term column, `--space-2` / `--space-6` gaps,
  `--space-6` padding, `--border-width-hairline` box in
  `--color-border-default`, `--radius-lg`; values break anywhere. Never a
  shadow.
- `.dl`: `max-content` term column, `--space-2` / `--space-6` gaps, term in
  `--color-fg-muted`.
- Change review: `.diff-old` struck through in `--color-fg-muted`;
  `.diff-new` on `--color-warning-bg`, `--space-1` inline padding,
  `--radius-xs`, no underline; `.changed-flag` `--text-caption`, semibold,
  `--color-warning-fg`, `--space-1` icon gap.
- Motion: none. Elevation and layer: none.

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Every layout reads semantic tokens directly. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Term | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Term in `.dl`, old value, missing value | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Value, new value text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Record rows, certificate box | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Enquiry well | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| New value highlight | `--color-warning-bg` | `--palette-mango-50` | `--palette-mango-950` |
| Changed flag | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Page | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Terms on the page |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | `.dl` terms, old values, "Not added" |
| `--color-fg-subtle` | `--color-bg-surface-sunken` | 4.5:1 | Terms in the enquiry well |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Values in the enquiry well |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Terms inside a dialog |
| `--color-fg-default` | `--color-warning-bg` | 4.5:1 | New value |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | Changed flag |

Forced colours: rules and the certificate box become `CanvasText`; the well
and highlight backgrounds may disappear, which is acceptable because
`del`/`ins` and the terms carry the meaning. `prefers-contrast: more` raises
terms to `--color-fg-muted` through the tokens.

## Responsive behaviour

- Below 36rem: `.kv` is one column (term above value); `.enquiry-summary` two
  columns with the message full width; `.regions` one column.
- From 36rem: `.kv` gains its 12rem term column.
- From 48rem: `.enquiry-summary` four columns in one row; `.regions` two
  columns.
- From 62rem: on the caterer page `.facts` appears in the sticky enquiry
  panel instead of the content column (two copies, one displayed; the page
  owns the switch).
- `.facts`, `.certificate` and `.dl` keep their layout at every width; the
  certificate's term column is as wide as "Issued by" and fits at 320 px.
- Values wrap; long emails, certificate numbers and file names break
  anywhere; nothing scrolls horizontally at 320 px.
- Small buttons in values ("Change password", the certificate file) are 44 px
  tall below 48rem; at 200 % zoom every value stays readable.

## Accessibility

### Role and pattern

Native `dl` with `dt`/`dd` pairs; one wrapping `div` per pair where the layout
uses it. No ARIA roles; there is no APG pattern (follow the [HTML `dl`
element](https://html.spec.whatwg.org/multipage/grouping-content.html#the-dl-element)).
Each list sits under a heading so it can be reached by heading navigation.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips the list; stops only on controls inside values ("Change password", the certificate file) in reading order. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activate those controls. |

### Focus

The list takes no focus. Controls in `.kv` values use the shared focus ring;
the row padding keeps the ring off the next row.

### Labelling

- The term labels the value; values do not repeat it.
- Change review names old and new in text (the term, or "Was" / "Now") and
  uses `del` / `ins`; strike-through and highlight alone are never the only
  signal.
- Dates are `<time datetime>`.
- Icons in private notes and flags are `aria-hidden`.

### Announcements

Only the loading status line (`role="status"`), once.

### Motion

None. Skeleton shimmer stops under reduced motion.

## Content and internationalisation

- Terms: one or two nouns in sentence case, no colon: "Guests",
  "Occasions", "Issued by", "Event date", "Requested name".
- Values as the person wrote them: "Serves 20–300 guests" (en dash; "Serves
  50 guests" when equal, L2-020); occasions from the L2-021 list; areas by
  municipality under their L2-010 region, never a street address.
- Dates: full on detail screens ("Saturday 21 November 2026"), short in rows,
  records and confirmations ("Thu 8 Oct", "14 Mar 2029", "Sat 21 Nov"); times
  "7:15 p.m."; Toronto time.
- Certificates always carry "<Name>'s own statement; Sweet Hand doesn't
  certify kitchens." Never "verified kitchen" or "certified".
- Private values carry a lock note naming who can see them: "Private until you
  share it in a thread".
- Missing on private screens: "Not added", "No file uploaded"; on public
  pages the pair is left out.
- Translatable: terms, `missingText`, `statement`, `busyLabel`, flag text,
  note text. Data: names, numbers, emails, messages, municipalities.
- French terms are longer ("Date de l'événement"); `.kv` terms wrap inside
  the 12rem column and `.enquiry-summary` terms wrap within their column.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the list class, whether
  each pair is wrapped, the skeleton list) are computed once, not in the
  template.
- Perf-test scenario:
  `frontend/projects/perf-test/src/scenarios/DescriptionList.ts` renders
  Marcia's enquiry summary to Pelau House ("Saturday 21 November 2026", 120,
  Scarborough, Family gatherings, her full message) and Kendra's certificate;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CatererPage` (two `.facts` copies and `.regions`),
  `Thread`, `AdminCaterer`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the facts on the public caterer page are server-rendered
  with the page, so they never shift the menu below them (L2-085); the
  enquiry-summary skeleton has the well's padding and two-line height.
- Weight: no dependencies beyond [skeleton](skeleton.md); statuses and buttons
  come through slots.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House with a guest range of 20 to 300, when its caterer page renders, then a `dl.facts` holds a `div` with `dt` "Guests" and `dd` "Serves 20–300 guests". (L2-020)
- **AC-2** Given a caterer whose minimum and maximum are both 50, when the facts render, then the value reads "Serves 50 guests". (L2-020)
- **AC-3** Given Pelau House's five occasions, when the facts render, then the "Occasions" value is a `ul.inline-list` with 5 `li` items "Weddings" … "Religious and cultural celebrations", and a screen reader announces "list, 5 items". (L2-021)
- **AC-4** Given Pelau House serves Scarborough, East York and North York in City of Toronto and Pickering and Ajax in Durham, when "Areas served" renders, then `dl.regions` has `dt` "City of Toronto" with `dd` "Scarborough, East York, North York" and `dt` "Durham" with `dd` "Pickering, Ajax". (L2-015)
- **AC-5** Given Pelau House's public caterer page, when its HTML is inspected, then no `dl.kv` or `dl.certificate` is present and neither "FH-2024-118734" nor "kendra@pelauhouse.example" appears. (L2-014)
- **AC-6** Given Marcia's account details, when the record renders, then `dl.kv` has "Email" with "marcia.t@example.com" and the status "Verified" at the end of the value, and "Phone" with "+1 647 555 0187" and the note "Private until you share it in a thread". (L2-035)
- **AC-7** Given Marcia opens her thread with Pelau House, when it renders, then the first element of the thread is `dl.enquiry-summary` with "Event date" "Saturday 21 November 2026", "Guests" "120", "Area" "Scarborough", "Occasion" "Family gatherings", then "Your enquiry" with her message and "Marcia Thompson · Thu 8 Oct, 7:15 p.m.". (L2-032)
- **AC-8** Given the enquiry message contains `<script>alert(1)</script>` and a blank line (`pages/thread/edge`), when the summary renders, then the text shows literally with its line break kept, no script runs, and the long hyphenated word wraps inside the well. (L2-032)
- **AC-9** Given Leah Mohammed opens Pelau House's operator record, when the certificate renders, then `dl.certificate` has the pairs "Holder" "Kendra Baptiste", "Issued by" "Toronto Public Health", "Number" "FH-2024-118734", "Expires" "14 Mar 2029" and "Copy", as direct children, followed by the caption "Kendra's own statement; Sweet Hand doesn't certify kitchens." (L2-040)
- **AC-10** Given Kendra requested the name "Pelau House by Kendra", when the operator's name-change review renders, then "Current name" holds `del.diff-old` "Pelau House" and "Requested name" holds `ins.diff-new` "Pelau House by Kendra". (L2-044)
- **AC-11** Given Cou-Cou changed its guest range from 30–150 to 30–200, when the recent-changes feed renders the edit, then a `dl.dl` shows "Was" with `del` "Serves 30–150 guests" and "Now" with `ins` "Serves 30–200 guests". (L2-047)
- **AC-12** Given Breadfruit & Butter's resubmitted profile, when the operator review renders a field changed since changes were requested, then a `.changed-flag` reads "Changed since changes were requested", in text, next to it. (L2-047)

### States

- **AC-13** Given Beverley Campbell has no phone on file, when her account record renders, then the "Phone" value is `dd.text-muted` "Not added"; and given a caterer page with no occasions saved, then no "Occasions" pair and no "N/A" appears. (L2-015)
- **AC-14** Given the thread is loading, when the summary renders with `busy` and `busyLabel` "Loading enquiry", then the well shows skeleton bars inside `aria-hidden="true"` and a hidden `role="status"` line says "Loading enquiry". (L2-066)

### Keyboard and focus

- **AC-15** Given Marcia's account details, when a keyboard user tabs through them, then the only stop in the list is "Change password", and its focus ring has at least 3:1 contrast in both themes. (L2-067)

### Screen readers

- **AC-16** Given the name-change review, when a screen reader reads it, then it announces "Current name", then a deletion "Pelau House", then "Requested name", then an insertion "Pelau House by Kendra", so the old and new values are named without relying on strike-through or colour. (L2-068)
- **AC-17** Given the caterer page, account, thread, operator caterer record and profile review, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any description list (including `dl` content-model rules). (L2-066)

### Theming

- **AC-18** Given the light and the dark theme, when the enquiry summary renders, then its terms have at least 4.5:1 and its values at least 4.5:1 contrast against `--color-bg-surface-sunken`. (L2-069)
- **AC-19** Given the light and the dark theme, when the name-change review renders, then "Pelau House by Kendra" has at least 4.5:1 against `--color-warning-bg`, "Pelau House" at least 4.5:1 against the page, and the changed flag at least 4.5:1. (L2-069)

### Responsive

- **AC-20** Given a 360 px viewport, when Marcia's account record renders, then each term sits above its value, the "Verified" status wraps under the email if needed, and "Change password" is at least 44 × 44 CSS px. (L2-065)
- **AC-21** Given a 320 px viewport, when Beverley's certificate ("Durham Region Health Department", "beverley@auntiebevs.example" in her record) renders, then values wrap within the box and the page does not scroll horizontally. (L2-064)
- **AC-22** Given viewports of 360 px and 800 px, when the thread's enquiry summary renders, then its four facts are in two columns at 360 px and in one row of four at 800 px, with the message full width in both. (L2-064)
- **AC-23** Given a viewport of 1000 px (LG), when Pelau House's page renders, then the facts are shown in the side panel above "Send an enquiry" and the copy in the content column is not displayed. (L2-019)
- **AC-24** Given a 1280 px window at 200 % zoom, when the operator caterer record renders, then every term and value is readable and the page does not scroll horizontally. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/description-list/`; files
  `description-list.component.*` (`sh-description-list`),
  `description.component.*` (`sh-description`), `inline-list.component.*`,
  `change-value.component.*`, `changed-flag.component.*`.
- `sh-description` reads its parent's layout (dependency injection or the
  chosen framework's context) to decide whether to render the `div` wrapper,
  so consumers never choose and the `.certificate` grid cannot be broken.
- Styles: the "Description list" section of `components.css` (`.dl`,
  `.facts`, `.inline-list`, `.regions`, `.kv`, `.enquiry-summary`,
  `.certificate`, `.diff-old`, `.diff-new`, `.changed-flag`) moves into the
  component, class names unscoped; `.private-note` stays shared.
- Design-system catch-up for D-5: `.enquiry-summary__message dd p` already
  carries `white-space: pre-wrap; overflow-wrap: anywhere`; the mocks' inline
  style goes.
- Mock catch-up: `dialogs/approve-profile` and `pages/admin-profile-review`
  stop wrapping `.certificate` pairs; diff spans become `del`/`ins`;
  `pages/admin-changes` moves its "Was"/"Now" captions into `dl.dl` (D-6);
  Kendra's certificate file name is one value everywhere.
- Composes [skeleton](skeleton.md). No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component for seven layouts?* Yes, with a `layout` input. They share the term/value rule, the loading pattern and the accessibility contract; the layout only changes the class and whether pairs are wrapped.
- **D-3** *Can a certificate render without the "own statement" caption?* No: `statement` is required. AGENTS.md says the platform never presents itself as certifying a kitchen, and the design system makes the caption mandatory.
- **D-4** *What does a missing value look like?* On the caterer's own and operator screens, `missingText` in muted text; on public layouts (`facts`, `regions`) the consumer omits the pair, so customers never see "N/A" (design system; L2-017.2 applies the same rule to dishes).
- **D-5** *Who keeps line breaks in an enquiry message?* The component's CSS, not an inline style: the mocks set `white-space: pre-wrap` inline and the design system proposed a rule, which `components.css` already has.
- **D-6** *How does the recent-changes feed show old and new values?* As `dl.dl` with "Was" / "Now" terms and `del` / `ins`, as the design system's change review does. The admin-changes mock used captions in paragraphs with spans; the meaning is identical and the `dl` pairs the label with the value for screen readers.
- **D-7** *Full or short date in the caterer's enquiry summary?* Full ("Thursday 5 November 2026"), as on the customer's thread; the design system flagged `dashboard-enquiry`'s short date as drift. The enquiry-sent confirmation dialog keeps "Date" / "Sat 21 Nov", a compact recap rather than a detail screen.
- **D-8** *How does the thread's summary load?* With the layout's own skeleton bars inside the well, as the design system specifies, rather than the thread mock's single 12rem block; both reserve the well's height.
