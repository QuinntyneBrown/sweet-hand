# Status label

| Field | Value |
|---|---|
| Selector | `sh-status` |
| Library path | `frontend/projects/components/src/lib/status/` |
| Status | planned |
| Traces to | L2-031, L2-033, L2-040, L2-046, L2-050, L2-055, L2-059, L2-064, L2-066, L2-067, L2-069, L2-085, L2-091 |
| Design system | [`status.html`](../../design-system/components/status.html) |
| Source mocks | [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/dashboard-enquiry/default`](../../mocks/pages/dashboard-enquiry/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/admin-caterers/default`](../../mocks/pages/admin-caterers/default.html), [`pages/admin-caterer/certificate-expired`](../../mocks/pages/admin-caterer/certificate-expired.html), [`pages/admin-reviews/default`](../../mocks/pages/admin-reviews/default.html), [`pages/admin-changes/default`](../../mocks/pages/admin-changes/default.html), [`pages/admin-report/default`](../../mocks/pages/admin-report/default.html), [`pages/account/default`](../../mocks/pages/account/default.html), [`pages/account/bounced`](../../mocks/pages/account/bounced.html), [`pages/profile-photos/processing`](../../mocks/pages/profile-photos/processing.html), [`pages/dashboard-reviews/default`](../../mocks/pages/dashboard-reviews/default.html), [`dialogs/moderate-review/remove`](../../mocks/dialogs/moderate-review/remove.html), [`dialogs/resolve-report/default`](../../mocks/dialogs/resolve-report/default.html) |
| Rendering | [`status.html`](status.html) |

## Purpose and scope

A status label says where a record stands: Marcia's enquiry to Pelau House is
"Replied", Kendra's enquiry from Priya Ramdial is "Open", Flying Fish Kitchen
is "Suspended", a review is "Held · contains a phone number". It is always a
word plus a small shape — a dot for live or moving, a square for stopped by
someone, a ring for not live — in the tone's text colour, with no fill and no
border, so a list of 40 rows stays calm. The word carries the meaning; the
shape repeats it for people who cannot tell the hues apart.

Use something else for a count or a one-word marker that is not a state
([badge](badge.md): "You", "New", "2"), for a state that needs an explanation
or action (an alert or inline message: "Your food handler certificate expired
on 30 Sep 2026. Upload a current certificate…"), and for "Saved Tue 2 Sep"
after autosave (the forms' `.save-status`, not this component).

Out of scope:

- Deciding which status a record has, or which words to show: the domain layer
  and the page decide (L2-033, L2-046); the label renders what it is given.
- Announcing a change of status: the action's toast or the dialog's live region
  owns that (D-6).
- Where the label sits in a row (second line on the right in the inbox, under
  the meta below 36rem on caterer records): [inbox row](inbox-row.md), queue
  item and description list own that layout.
- `.save-status` ("All changes saved", "Saving…", "Not saved: fix 2 things
  below"): part of the form layout, not a status label.

## Usage

Inventory from `usage_inventory.py docs/mocks status "span|p|div|li|strong"`
(about 560 labels on 50 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/inbox/*`, `pages/dashboard-enquiries/*`, dashboard "Latest enquiries", inbox list behind enquiry dialogs and toasts | `open`, `replied`, `declined`, `closed`, with the extra class `inbox-row__status` | "Open", "Replied", "Declined", "Closed" | on page, on hovered row, on the current row | inbox row |
| `pages/thread/*`, `pages/dashboard-enquiry/*`, `dialogs/open-enquiry`, `close-enquiry`, `decline-enquiry`, `share-contact` | `open`, `replied`, `declined`, `closed` in the thread header | "Open", "Replied", "Declined", "Closed" | default, updated in place after an action | canvas, dialog |
| `pages/dashboard/*`, `notifications/profile-banner/*` | profile status in the dashboard intro | "Draft", "Pending review", "Published", "Changes requested", "Suspended", "Removed" | default | canvas |
| `pages/admin-caterers/default`, `pages/admin-caterer/*`, `dialogs/reinstate-caterer`, `approve-profile`, `request-changes` | profile status on caterer records | "Published", "Pending review", "Changes requested", "Suspended", "Draft", "Removed" | default, hovered row | queue item, canvas |
| `pages/admin-caterer/certificate-expired`, `pages/profile-certificate/*` | `suspended` / `published` reused for the certificate | "Expired", "Valid" | default | section head |
| `pages/admin-reviews/default`, `dialogs/moderate-review/*`, `pages/admin-report/default`, `dialogs/resolve-report/default` | `held`, `hidden`, `published` with a reason or actor | "Held · contains a phone number", "Held · contains a link", "Hidden automatically · 3 reports", "Hidden by Tomas Reyes", "Hidden by an operator", "Showing on Maracas Bay’s page" | default | canvas, dialog |
| `pages/admin-changes/default`, `dialogs/revert-change/*`, `pages/admin-report/default` | `closed` | "Reverted by Leah Mohammed · Tue 6 Oct", "Resolved", "Closed" | default | canvas, dialog |
| `pages/account/default`, `bounced`, `unverified`; `dialogs/change-password`, `end-session`, `edit-details` | `published`, `pending`, `declined` after a `.kv` value or in a device list | "Verified", "Not verified", "Emails bouncing", "Current" | default | description list, list row |
| `pages/profile-photos/processing`, `pages/profile-menu/*` | `pending`, `draft` | "Processing", "Draft" | default | photo tile, canvas |
| `pages/dashboard-reviews/default`, `dialogs/review-response/*` | `pending` as a block (`p.status`) | "No response yet" | default | review |
| Design system | base (no modifier), skeleton | — | loading | any |

## Anatomy

1. **Label** — `span.status` (or `p.status` when it stands on its own line):
   inline flex, `--space-2` gap, `--text-label`, sentence case, never wraps.
   Its `color` comes from the modifier's text token.
2. **Shape** — `.status::before`, `--space-2` square in `currentColor`: a filled
   dot by default; a square (`--radius-xs` corners) for declined, suspended
   and changes; a ring (`--border-width-thick` outline, no fill) for closed,
   removed and draft. Generated content, decorative.
3. **Word** — the text node: the state, optionally followed by " · " and a
   reason or actor.
4. **Skeleton (loading only)** — `span.skeleton.skeleton--text`, about 5rem,
   `aria-hidden="true"`; never a guessed state.

Host: `sh-status` is `display: contents`, so `.inbox-row__status`, `.kv dd`
and `.queue-item--stack` place the real `span.status`.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'open' \| 'replied' \| 'published' \| 'pending' \| 'held' \| 'hidden' \| 'declined' \| 'suspended' \| 'changes' \| 'closed' \| 'removed' \| 'draft' \| null` | `null` | no | Maps to `.status--{tone}`; `null` renders the base muted dot. The modifier names a shape and tone, not a record type, so "Expired" uses `suspended` and "Verified" uses `published` (D-2). |
| `label` | `string` | — | yes (unless `skeleton`) | The state word, translated by the consumer ("Replied", "Pending review"). Rendered as text. |
| `detail` | `string \| null` | `null` | no | A reason or date, rendered after " · " ("contains a phone number", "3 reports", "Tue 6 Oct"). An actor that reads as part of the state stays in `label` ("Hidden by Tomas Reyes"). |
| `block` | `boolean` | `false` | no | Renders `p.status` instead of `span.status`, for a label on its own line under a review ("No response yet"). |
| `extraClass` | `string \| null` | `null` | no | One placement class from the parent component, added verbatim (`inbox-row__status`). |
| `skeleton` | `boolean` | `false` | no | Renders `span.skeleton.skeleton--text` (5rem, `aria-hidden="true"`) and ignores every other input. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | A status label is not interactive. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | The word is an input so the component can append `detail` consistently; no markup inside a label. |

- Translation: `label` and `detail` come from the resource files through the
  consumer (L2-064); names and dates inside them ("Tomas Reyes", "Tue 6 Oct")
  are data formatted per `en-CA` and `America/Toronto`. The " · " separator is
  punctuation.

## Variants and sizes

| Modifier | Shape | Tone token | Words in use |
|---|---|---|---|
| (none) | Dot | `--color-fg-muted` | Base; not used by the mocks |
| `--open` | Dot | `--color-fg-accent` | Open |
| `--replied` | Dot | `--color-success-fg` | Replied |
| `--published` | Dot | `--color-success-fg` | Published, Verified, Valid, Current, Showing on Maracas Bay’s page |
| `--pending` | Dot | `--color-warning-fg` | Pending review, No response yet, Not verified, Processing |
| `--held` | Dot | `--color-warning-fg` | Held · contains a phone number / a link |
| `--hidden` | Dot | `--color-fg-muted` | Hidden automatically · 3 reports, Hidden by Tomas Reyes, Hidden by an operator |
| `--declined` | Square | `--color-danger-fg` | Declined, Emails bouncing |
| `--suspended` | Square | `--color-danger-fg` | Suspended, Expired |
| `--changes` | Square | `--color-warning-fg` | Changes requested |
| `--closed` | Ring | `--color-fg-subtle` | Closed, Resolved, Reverted by Leah Mohammed · Tue 6 Oct |
| `--removed` | Ring | `--color-fg-subtle` | Removed |
| `--draft` | Ring | `--color-fg-muted` | Draft |

One size: `--text-label` (14 px medium) with a `--space-2` (8 px) shape. It
inherits no size from the surrounding text, so a status in a page intro and
one in an inbox row match. Width follows the words.

## States

A status label is not interactive. Its states are the surfaces it must hold up
on, loading, and a change of value.

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| On the page | default | Word and shape in the tone colour on `--color-bg-canvas` | The word, read in DOM order |
| On a hovered row | parent row `:hover` | Unchanged; the row's fill is `--color-bg-surface-sunken` | — |
| On the current inbox row | parent `aria-current="true"` | Unchanged; the row's fill is `--color-bg-subtle` | — |
| In a dialog | inside `.dialog` | Unchanged on `--color-bg-surface-raised` | — |
| Changed | `tone`/`label` inputs change | Re-renders in place, no motion | Not announced by the label (D-6) |
| Loading | `skeleton` | A 5rem shimmering text bar | Hidden |
| Forced colours | `forced-colors: active` | Colours drop to `CanvasText`; dot, square and ring remain | — |
| Hover, focus, disabled | — | Never | Not in the tab order |

## Markup

```html
<!-- rendered: enquiry status in an inbox row -->
<span class="status status--replied inbox-row__status">Replied</span>
```

```html
<!-- rendered: review held, with a reason -->
<span class="status status--held">Held · contains a phone number</span>
```

```html
<!-- rendered: certificate on the operator's caterer record -->
<div class="caterer-section__head"><h2 id="cert-title">Food handler certificate</h2><span class="status status--suspended">Expired</span></div>
```

```html
<!-- rendered: block placement under a review -->
<p class="status status--pending">No response yet</p>
```

```html
<!-- rendered: loading -->
<span class="skeleton skeleton--text" style="width: 5rem" aria-hidden="true"></span>
```

Every other variant differs only by its modifier class. Consumer templates
(binding syntax illustrative):

```html
<sh-status [tone]="statusTone[enquiry.status]" [label]="t('enquiry.status.' + enquiry.status)" extraClass="inbox-row__status"></sh-status>
<sh-status tone="held" [label]="t('review.held')" [detail]="t('review.heldReason.phone')"></sh-status>
<sh-status tone="pending" block [label]="t('review.noResponse')"></sh-status>
```

The e2e page objects locate labels by `.status`, the modifier class and the
text; those are part of the contract.

## Design

- Label: inline flex, centred, `--space-2` gap, `--text-label`,
  `white-space: nowrap`.
- Shape: `--space-2` × `--space-2`; dot `border-radius: 50%`, square
  `--radius-xs`, ring `--border-width-thick` in `currentColor` with a
  transparent fill; `flex: none`.
- Skeleton: `.skeleton.skeleton--text`, 5rem, shimmer over `--duration-loop`.
- Motion: none. Layer: none.

Component tokens: none. One semantic text token per modifier drives both the
word and the shape.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Open | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Replied, published | `--color-success-fg` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Pending, held, changes | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Declined, suspended | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Closed, removed | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Draft, hidden, base | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |

Pepper is reserved for "Open" (it matches the unread dot); no other status may
use it.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-accent` | `--color-bg-canvas` | 4.5:1 | Open on the page |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | Replied, published |
| `--color-warning-fg` | `--color-bg-canvas` | 4.5:1 | Pending, held, changes |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | Declined, suspended |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Closed, removed |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Draft, hidden |
| `--color-fg-accent` | `--color-bg-subtle` | 4.5:1 | Open on the current inbox row |
| `--color-success-fg` | `--color-bg-subtle` | 4.5:1 | Replied on the current inbox row |
| `--color-warning-fg` | `--color-bg-subtle` | 4.5:1 | Pending on the current row |
| `--color-danger-fg` | `--color-bg-subtle` | 4.5:1 | Declined on the current inbox row |
| `--color-warning-fg` | `--color-bg-surface-sunken` | 4.5:1 | On a hovered record row |
| `--color-success-fg` | `--color-bg-surface-sunken` | 4.5:1 | On a hovered record row |
| `--color-danger-fg` | `--color-bg-surface-sunken` | 4.5:1 | On a hovered record row |
| `--color-fg-accent` | `--color-bg-surface-raised` | 4.5:1 | Open in a dialog |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Declined or suspended in a dialog |

The shapes are drawn in the word's colour, so they meet 3:1 wherever the word
meets 4.5:1. Forced colours: the hues drop out and the three shapes carry on
in `CanvasText`.

## Responsive behaviour

- Labels never wrap and never change size at any breakpoint; containers make
  room. Inbox rows put the label on the second line at the right; caterer
  record rows move it under the meta below 36rem; in `.kv` values it drops
  below the value when the row is narrow.
- The longest label, "Reverted by Leah Mohammed · Tue 6 Oct", fits in a 288 px
  column at 320 px (about 270 px); the parent must allow it a line of its
  own there.
- At 200 % zoom on a 1280 px window nothing is clipped. Not a touch target.

## Accessibility

### Role and pattern

Plain text in a `<span>` (or `<p>`), no role, no live region. The shape is
generated content with no text, so nothing extra is read. WCAG 1.4.1 Use of
Color is met because the word carries the state.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on a status label; it is read as part of its row link or record. |

### Focus

None of its own; the focusable row's ring encloses it.

### Labelling

- The word is the accessible text. Inside a row link it is read after the name
  and meta: "Priya Ramdial, Yesterday, Thu 5 Nov · 60 guests · Corporate
  events, Open".
- Never a shape or colour without the word; never "Status: Open".

### Announcements

None. A changed status is announced by the toast or dialog of the action that
changed it ("Enquiry declined").

### Motion

None. Statuses never pulse or blink. The skeleton's shimmer stops under
`prefers-reduced-motion: reduce`.

## Content and internationalisation

- One to three words, sentence case, past participle or adjective:
  "Replied", "Pending review", "Changes requested".
- The same word for the same state on every screen: Marcia and Kendra both see
  "Declined", never "Rejected" on one side.
- Reason or actor after a middot only for operators: "Held · contains a phone
  number", "Hidden by Tomas Reyes", "Reverted by Leah Mohammed · Tue 6 Oct".
- Certificates: "Valid", "Expires Mon 9 Nov" (pending), "Expired" (suspended
  look). Never "Certified" or "Approved": the certificate is the caterer's
  own statement.
- Translatable: `label`, `detail`. French labels ("Modifications demandées")
  are longer; they still never wrap, and parents give them a line of their own
  on phones.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the class list and the
  joined "label · detail" text) are computed once, not in the template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/StatusLabel.ts`
  renders Kendra's five inbox statuses (Open, Open, Replied, Declined,
  Closed) plus "Held · contains a phone number"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Inbox` (20 rows), `AdminCaterers`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the skeleton has the height of the label; a status that
  changes in place keeps its line, so the row does not jump more than the
  word's width.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia's inbox, when the rows for Pelau House, Sugar Dumplin, Demerara Kitchen and Ti Kay render, then their labels read "Replied", "Open", "Declined" and "Closed" with classes `status--replied`, `status--open`, `status--declined` and `status--closed` and the extra class `inbox-row__status`. (L2-031)
- **AC-2** Given Kendra's thread with Priya Ramdial is `Open`, when Kendra sends her first reply and the page updates, then the thread header's label changes in place from "Open" to "Replied" with the `status--replied` class. (L2-033)
- **AC-3** Given Kendra declines Nadia Joseph's enquiry with the note "Fully booked that weekend", when both Kendra's and Nadia's views of the thread render, then each shows "Declined" with the square shape, never another word. (L2-033)
- **AC-4** Given caterer records in each of the six profile statuses, when the operator's caterer list renders, then they show "Draft", "Pending review", "Changes requested", "Published", "Suspended" and "Removed" with the matching modifiers. (L2-046)
- **AC-5** Given Flying Fish Kitchen's certificate expired on 30 Sep 2026, when Leah opens its caterer record, then the certificate section head shows "Expired" with `status--suspended`. (L2-040)
- **AC-6** Given Priya R.'s review of Sugar Dumplin held because it contains "416-555-0187", when Leah's reviews page renders, then the label reads "Held · contains a phone number" with `status--held`. (L2-050)
- **AC-7** Given a review hidden after 3 reports in 7 days, when the moderation dialog renders, then the label reads "Hidden automatically · 3 reports" with `status--hidden`. (L2-055)
- **AC-8** Given Tomas Reyes hid a review, when the reviews page renders, then the label reads "Hidden by Tomas Reyes" with `status--hidden`. (L2-059)
- **AC-9** Given Kendra uploads a photo while the image processing service is down, when the photos page renders the tile, then it shows "Processing" with `status--pending`. (L2-091)
- **AC-10** Given a list row is loading, when `sh-status` renders with `skeleton`, then it renders a `span.skeleton.skeleton--text` with `aria-hidden="true"` and no state word. (L2-066)

### Colour is never the only cue

- **AC-11** Given each of the twelve modifiers, when it renders, then it shows a word and a shape: a dot for open, replied, published, pending, held and hidden; a square for declined, suspended and changes; a ring for closed, removed and draft. (L2-069)
- **AC-12** Given Kendra's inbox rendered in greyscale or in forced-colours mode, when "Open", "Declined" and "Closed" are compared, then they remain distinguishable by word and by dot, square and ring. (L2-069)

### Screen readers

- **AC-13** Given Priya Ramdial's row in Kendra's inbox, when a screen reader reads the row link, then it ends with "Open" and announces nothing for the shape. (L2-066)

### Keyboard and focus

- **AC-14** Given Kendra's inbox, when she tabs through the rows, then focus stops once per row and never on a status label. (L2-067)

### Theming

- **AC-15** Given the light and the dark theme, when every modifier renders on the page canvas, then each word has at least 4.5:1 contrast against `--color-bg-canvas`. (L2-069)
- **AC-16** Given the current inbox row (`--color-bg-subtle`) and a hovered record row (`--color-bg-surface-sunken`) in both themes, when "Open", "Replied", "Pending review" and "Declined" render on them, then each word has at least 4.5:1 contrast against the row fill. (L2-069)
- **AC-17** Given the decline dialog in both themes, when "Open" and "Declined" render on `--color-bg-surface-raised`, then each has at least 4.5:1 contrast. (L2-069)

### Responsive

- **AC-18** Given a 320 px viewport, when "Reverted by Leah Mohammed · Tue 6 Oct" renders in the changes feed, then it stays on one line, is not clipped and the page does not scroll horizontally. (L2-064)
- **AC-19** Given a 1280 px window at 200 % zoom, when the operator's caterer list renders, then every status label is fully visible with no horizontal scrolling. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when a status changes or a status skeleton renders, then nothing animates. (L2-069)

### Performance

- **AC-21** Given the `StatusLabel` perf-test scenario, when the status of one row changes from "Open" to "Replied", then only that label re-renders and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/status/`; file
  `status.component.*` (selector `sh-status`, class `StatusComponent`); export
  the `StatusTone` type.
- Styles: the "Status label" section of `components.css` moves into the
  component, class names unscoped.
- A map from domain states to tones lives in each feature (enquiry, profile,
  review, certificate, email, device), not in the component, because the
  modifier is a shape and tone, not a record type.
- Composed by [inbox row](inbox-row.md), queue item, description list, list
  rows, [review](review.md) (moderation views) and photo tile. No CDK
  primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *May a modifier carry a word from another record type ("Expired" on `suspended`)?* Yes. The design system kept the mocks' reuse and documented it: the modifier names a shape and tone. `tone` is therefore not tied to a record type.
- **D-3** *Is the reason part of the label or a separate input?* A separate `detail`, joined with " · " by the component, so every reason is formatted the same way and translators get the state word and the reason as separate strings.
- **D-4** *Can the label be a `<p>`?* Yes, through `block`, because "No response yet" under a review in the caterer's reviews page stands on its own line as a paragraph in the mocks; the class names are unchanged.
- **D-5** *What does loading show?* A text skeleton, never a guessed state, as the design system requires.
- **D-6** *Does a status change announce itself?* No. The toast or dialog of the action announces it; a label in a live region would repeat it, and 20 inbox rows refreshing would be noisy.
- **D-7** *Is the base (no modifier) look part of the API?* Yes, as `tone: null`. The design system defines it and the CSS draws it; no mock uses it yet, and supporting it now keeps the type stable.
