# Badge

| Field | Value |
|---|---|
| Selector | `sh-badge` |
| Library path | `frontend/projects/components/src/lib/badge/` |
| Status | planned |
| Traces to | L2-007, L2-029, L2-053, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`badge.html`](../../design-system/components/badge.html) |
| Source mocks | [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/admin-queue/long`](../../mocks/pages/admin-queue/long.html), [`pages/caterers/signed-in`](../../mocks/pages/caterers/signed-in.html), [`dialogs/site-menu/signed-in`](../../mocks/dialogs/site-menu/signed-in.html), [`pages/admin-operators/default`](../../mocks/pages/admin-operators/default.html), [`pages/admin-cuisines/default`](../../mocks/pages/admin-cuisines/default.html), [`dialogs/retire-cuisine/busy`](../../mocks/dialogs/retire-cuisine/busy.html), [`pages/caterer/own-review`](../../mocks/pages/caterer/own-review.html) |
| Rendering | [`badge.html`](badge.html) |

## Purpose and scope

A badge is a small pill that adds one short fact to something else. On Sweet
Hand that means three things: how many enquiries are unread or how many items
wait in the operator queue ("Inbox 1" for Marcia, "Enquiries 2" for Kendra,
"Queue 7" for Leah), which row is you ("You" beside Leah Mohammed in the
operator list, "Your review" on Marcia's own review of Pelau House), and which
cuisine was added today ("New" beside Caymanian). Badges are rare on purpose:
the busy lists stay calm.

Use something else for the state of a record — Open, Replied, Published,
Suspended — which is a [status label](status.md) (a word plus a shape, no
fill); for a dietary or allergen fact about a dish ("Vegan", "Contains nuts"),
which is a [tag](tag.md); and for anything a person can press or remove, which
is a chip. The link, tab or icon button that carries a count is
[site header](site-header.md), [tabs](tabs.md) or
[icon button](icon-button.md); the badge is only the pill inside it.

Out of scope:

- Fetching the unread count, polling it every 60 seconds and deciding when it
  changes (L2-029.3): the header or page owns that and passes the new count.
- The accessible name of an icon button that carries a count ("Enquiries,
  2 unread"): the [icon button](icon-button.md) owns its
  `aria-label`; the badge inside it is hidden.
- Announcing count changes: the inbox and queue pages own their own live
  regions; the badge never announces.
- Deciding when "New" disappears (the day after the cuisine is added): the
  page decides whether to render the badge.

## Usage

Inventory from `usage_inventory.py docs/mocks badge "span|a|div|li|strong|em"`
(332 count badges on 53 screens, 9 neutral, 4 info) plus a grep of their
surrounding links and buttons.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Customer header on every signed-in customer page (`pages/inbox/*`, `pages/thread/*`, `pages/caterers/signed-in`, `pages/caterer/*` signed in, `pages/account/*`) | count, after the text link "Inbox", with hidden text | "1"; hidden ", 1 unread enquiry" | default, inside current link (`aria-current="page"`) | canvas, site header |
| Caterer header on every caterer page (`pages/dashboard*`, `pages/profile-*`, `dialogs/dish`, `dialogs/remove-*`, `dialogs/decline-enquiry` …) | count, after "Enquiries", with hidden text | "2" (and "1" after one thread is read); hidden ", 2 unread" | default, current link | canvas, site header |
| Caterer header below 48rem (79 screens) | count on the inbox icon button, no hidden text | "2"; the button is named "Enquiries, 2 unread" | default, current | icon button corner |
| Customer header below 48rem (14 screens) | count on the inbox icon button, no hidden text | "1"; button "Inbox, 1 unread" | default, current | icon button corner |
| `pages/caterers/signed-in` below 48rem | count on the menu icon button, no hidden text | "1"; button "Menu, 1 unread enquiry" | default | icon button corner |
| Operator header (`pages/admin-*`, operator dialogs and toasts) | count after "Queue", with hidden text | "7", "6" (after a toast resolves one), "34" (`admin-queue/long`); hidden ", 7 items waiting" | default, current link | canvas, site header |
| `dialogs/site-menu/signed-in`, operator side nav | count after a filter-list item ("Inbox", "Enquiries", "Review queue") | "1", "2", "7" | default, current item | sheet surface, side nav |
| Design-system tabs page (operator caterer record) | count after a tab label | "Reports" + "2"; hidden ", 2 open reports" | default, selected tab, hovered, focused tab | tab bar |
| `pages/admin-operators/default`, `dialogs/add-operator`, `dialogs/deactivate-operator` (page behind) | neutral, inside `.admin-row__title` after the name | "You" | default | list row |
| `pages/admin-cuisines/default`, `dialogs/add-cuisine/busy`, `dialogs/retire-cuisine/busy` | info, inside `.admin-row__title` after the cuisine | "New" | default | list row |
| `pages/caterer/own-review` | neutral, in `.review__head` after the author | "Your review" | default | canvas |
| Design system only | success, warning, danger, solid | "Success", "Warning", "Danger", "Cover" | default | any |

The 236 mocks that put `aria-label` on the count `<span>` ("7 items waiting")
are drift the design system fixed (D-3); the product renders the hidden text.

## Anatomy

1. **Pill** — `span.badge`. Inline flex, `--radius-full`, `--space-2` side
   padding (`--space-1` for counts), at least `--target-min` tall, never wraps.
2. **Dot** — `.badge::before`, a 0.375rem circle in `currentColor`. Drawn by CSS
   on neutral and tinted badges; hidden on count and solid badges.
3. **Label** — the text node: one or two words, or the count numerals.
4. **Hidden meaning (count only)** — `span.visually-hidden` placed immediately
   after the pill, holding ", " plus the count's meaning. Present only when the
   consumer passes `countLabel`.

Host: `sh-badge` is `display: contents`, so `.icon-btn .badge--count`,
`.tab .badge` and the wrapping `.admin-row__title` style the real `span.badge`
(D-2). The hidden span is a sibling of the pill, not a child, so the pill's
`aria-hidden` does not hide it.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `variant` | `'neutral' \| 'info' \| 'success' \| 'warning' \| 'danger' \| 'solid' \| 'count'` | `'neutral'` | no | Maps to `.badge--{variant}`; `neutral` adds no modifier. |
| `count` | `number \| null` | `null` | yes for `count` | Whole number. `null`, `0` or a negative number renders nothing at all (no pill, no hidden text). Ignored for other variants. |
| `max` | `number` | `99` | no | Above `max` the pill shows "`max`+" ("99+"). The hidden text is not capped. |
| `countLabel` | `string \| null` | `null` | no | The meaning of the count, already translated and pluralised by the consumer ("2 unread", "1 unread enquiry", "7 items waiting", "134 items waiting"). When set, the component renders `<span class="visually-hidden">, {countLabel}</span>` after the pill. Leave `null` when the parent already names the count (an icon button's `aria-label`). |

The count pill always carries `aria-hidden="true"`; there is no input to turn
that off (D-3).

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | A badge is not interactive. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text, one or two words | The label for every variant except `count` ("You", "New", "Your review"). Ignored for `count`, which renders the formatted number. No icons, no markup. |

- Translation: the default slot text and `countLabel` come from the resource
  files through the consumer (L2-064). The ", " separator before the hidden
  text is punctuation, not copy. The count is formatted with the page locale's
  numerals (`Intl.NumberFormat('en-CA')`).

## Variants and sizes

| Variant | Class | Use for |
|---|---|---|
| Neutral | `.badge` | A marker beside a name: "You", "Your review". |
| Info | `.badge.badge--info` | "New" beside a cuisine an operator added today. |
| Success | `.badge.badge--success` | In the kit; no screen uses it (D-5). |
| Warning | `.badge.badge--warning` | In the kit; no screen uses it (D-5). |
| Danger | `.badge.badge--danger` | In the kit; no screen uses it (D-5). |
| Solid | `.badge.badge--solid` | In the kit; no screen uses it (the photo "Cover" marker is a [tag](tag.md)) (D-5). |
| Count | `.badge.badge--count` | Unread enquiries or queue items on a link, tab, filter-list item or icon button. |

One size: the label is `--text-label` at `--font-size-xs` (12 px) in a pill at
least `--target-min` (24 px) tall; a count is at least 1.375rem wide so "1"
and "7" are round. Inside an icon button `.icon-btn .badge--count` lowers the
minimum height and width to `--icon-size-md` (20 px) and pins the pill to the
top-right corner. Width otherwise follows the text.

## States

A badge is not interactive: no hover, focus, active or disabled state of its
own. What changes is the value and the context.

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Pill with label (and dot for neutral and tinted variants) | Neutral and tinted: read as text after the name ("Leah Mohammed You"). Count: pill hidden; hidden text read inside the link |
| Large count | `count` > `max` | "99+" | Hidden text keeps the exact count ("134 items waiting") |
| Zero | `count` is `0` or `null` | Nothing rendered; the link still says "Inbox" | Link name is just "Inbox" |
| Updated | `count` input changes | New number, no animation | Nothing announced (D-6) |
| Inside a current or hovered link | parent `aria-current="page"` or `:hover` | The badge keeps its own colours; only the parent's label changes (ink and semibold in the header, pepper in a side nav or site menu) | — |
| Inside a selected or focused tab | parent `aria-selected="true"` / `:focus-visible` | Badge unchanged; the tab's ring encloses it | Tab name "Reports, 2 open reports" |
| On an icon button | inside `.icon-btn` | Pinned to the top-right corner inside the 44 px button | Hidden; the button's `aria-label` carries the meaning |
| Forced colours | `forced-colors: active` | Hairline `CanvasText` border, system colours | — |

## Markup

```html
<!-- rendered: count after a text link, with hidden meaning -->
<a class="site-nav__link" href="/dashboard/enquiries">Enquiries <span class="badge badge--count" aria-hidden="true">2</span><span class="visually-hidden">, 2 unread</span></a>
```

```html
<!-- rendered: count on an icon button (no hidden text; the button names it) -->
<a class="icon-btn" href="/dashboard/enquiries" aria-label="Enquiries, 2 unread"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/></svg><span class="badge badge--count" aria-hidden="true">2</span></a>
```

```html
<!-- rendered: large count -->
<a class="site-nav__link" href="/admin/queue" aria-current="page">Queue <span class="badge badge--count" aria-hidden="true">99+</span><span class="visually-hidden">, 134 items waiting</span></a>
```

```html
<!-- rendered: marker beside a name -->
<span class="admin-row__title">Leah Mohammed <span class="badge">You</span></span>
<span class="admin-row__title">Caymanian <span class="badge badge--info">New</span></span>
```

The success, warning, danger and solid variants differ from neutral only by
their modifier class (`.badge--success`, `.badge--warning`, `.badge--danger`,
`.badge--solid`). A zero count renders no element at all.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: header link -->
<a class="site-nav__link" href="/inbox" [attr.aria-current]="current ? 'page' : null">{{ t('nav.inbox') }}
  <sh-badge variant="count" [count]="unread()" [countLabel]="t('nav.unreadEnquiries', { count: unread() })"></sh-badge></a>

<!-- consumer: icon button below 48rem -->
<a class="icon-btn" href="/inbox" [attr.aria-label]="t('nav.inboxUnread', { count: unread() })">…
  <sh-badge variant="count" [count]="unread()"></sh-badge></a>

<!-- consumer: markers -->
<sh-badge>{{ t('operators.you') }}</sh-badge>
<sh-badge variant="info">{{ t('cuisines.new') }}</sh-badge>
```

The e2e page objects locate badges by `.badge`, `.badge--count`, `.badge--info`
and the adjacent `.visually-hidden` text; those are part of the contract.

## Design

- Pill: inline flex, centred, `--space-1` gap between dot and label,
  `--space-2` side padding (`--space-1` for counts), `min-height:
  --target-min`, `--radius-full`, `white-space: nowrap`.
- Label: `--text-label` with `--font-size-xs`; counts use tabular numerals.
- Count: `min-width` 1.375rem, centred; on an icon button `min-height` and
  `min-width` `--icon-size-md`, `position: absolute` at the button's top-right
  corner.
- In a tab, `--space-1` before the badge (`.tab .badge`).
- Motion: none. Layer: none beyond the icon button's own stacking.

Component tokens: none. Variants read semantic status tokens directly; see
*Colour*.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Count fill | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Count numerals | `--color-fg-on-danger` | `--palette-white` | `--palette-sorrel-950` |
| Neutral fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Neutral label and dot | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Info fill | `--color-info-bg` | `--palette-stone-50` | `--palette-stone-900` |
| Info label and dot | `--color-info-fg` | `--palette-stone-800` | `--palette-stone-200` |
| Success fill / label | `--color-success-bg` / `--color-success-fg` | `--palette-callaloo-50` / `--palette-callaloo-700` | `--palette-callaloo-950` / `--palette-callaloo-300` |
| Warning fill / label | `--color-warning-bg` / `--color-warning-fg` | `--palette-mango-50` / `--palette-mango-700` | `--palette-mango-950` / `--palette-mango-300` |
| Danger fill / label | `--color-danger-bg` / `--color-danger-fg` | `--palette-sorrel-50` / `--palette-sorrel-600` | `--palette-sorrel-950` / `--palette-sorrel-300` |
| Solid fill / label | `--color-info-solid` / `--color-bg-surface` | `--palette-stone-800` / `--palette-white` | `--palette-stone-200` / `--palette-stone-950` |

The count is sorrel, never pepper: pepper (`--color-accent`) means "selected /
you are here", and a current side-nav or site-menu item (`.filter-list__item`
with `aria-current`) turns pepper while its count stays sorrel. In dark the two
stay apart (a sorrel-300 fill beside a pepper-300 label).

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-danger` | `--color-danger-solid` | 4.5:1 | Count numerals |
| `--color-danger-solid` | `--color-bg-canvas` | 3:1 | Count pill against the header (state indicator) |
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | "You", "Your review" |
| `--color-info-fg` | `--color-info-bg` | 4.5:1 | "New" |
| `--color-success-fg` | `--color-success-bg` | 4.5:1 | Success label |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Warning label |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Danger label |
| `--color-bg-surface` | `--color-info-solid` | 4.5:1 | Solid label |

Forced colours: `components.css` sets `forced-color-adjust: none` and a hairline
`CanvasText` border on `.badge`, so every pill keeps a visible edge and its
text in Windows high contrast.

## Responsive behaviour

- The badge never wraps and never changes size at any breakpoint.
- Below MD (48rem) the header's text links with counts become icon buttons or
  move into the site menu; the header renders the count on the icon's corner,
  so a count is visible at every width (site header owns the swap).
- In a wrapping title (`.admin-row__title` is a wrapping flex row) the badge
  drops to the next line as a whole pill, never split from its label.
- At 320 px and at 200 % zoom on a 1280 px window nothing is clipped: the
  count stays inside its 44 × 44 CSS px icon button and never enlarges or
  shifts the target. The badge itself is never a touch target.

## Accessibility

### Role and pattern

Text in a `<span>`, no role. A count is meaningless alone ("7"), so the pill is
`aria-hidden="true"` and its meaning is said once: in visually hidden text
inside the link or tab, or in the icon button's `aria-label`. `aria-label` is
never put on the badge `<span>`: a generic element cannot be named reliably
(WCAG 1.3.1).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on a badge; it stops on the link, tab or button that contains it. |

### Focus

No focus of its own. On an icon button the badge sits within the button's
bounds, so the button's focus ring encloses it; in a tab the tab's ring
encloses it.

### Labelling

- Spoken: "Inbox, 1 unread enquiry", "Enquiries, 2 unread",
  "Queue, 7 items waiting", "Reports, 2 open reports".
- Neutral and info badges are read as part of the name they follow ("Leah
  Mohammed You", "Caymanian New"); keep them to one or two words.
- WCAG 2.5.3 Label in Name: the visible link text ("Enquiries") starts the
  name; the count meaning follows it.

### Announcements

None. A changed count is not announced; the inbox and queue pages announce
their own updates in `aria-live="polite"` regions.

### Motion

None. Counts change without animation; nothing pulses or bounces.

## Content and internationalisation

- Counts are numerals: "1", "2", "7", "34", "99+". "0" is never shown.
- The hidden text uses the noun the page uses, pluralised by the consumer:
  "1 unread enquiry" / "2 unread enquiries" (and the shorter "2 unread" after "Enquiries"), "1 item waiting" / "7 items
  waiting", "2 open reports". French ("2 demandes non lues") is longer, which
  is fine because the text is hidden.
- Markers are one or two words, sentence case: "You", "New", "Your review"
  (the longest in use). Never a record state ("Published") — that is a
  [status label](status.md); never "Halal" or "Contains nuts" — that is a
  [tag](tag.md).
- Translatable: the slot label and `countLabel`. Data: the count.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the displayed "99+" text, the
  modifier class, whether to render at all) are computed once, not in the
  template.
- No listeners, no timers, no polling; the parent passes new counts.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Badge.ts`
  renders Kendra's header link "Enquiries" with count 2 and hidden text
  ", 2 unread", plus the "You" marker beside Leah Mohammed;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `SiteHeader` (all three roles' headers), `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the count pill has a minimum width and a fixed height, so
  "1" becoming "2" does not move the header; removing the badge at zero
  shifts only the trailing space of its own link.
- Weight: no dependencies.

## Acceptance criteria

### Rendering

- **AC-1** Given Kendra Baptiste has 2 threads with unread messages, when her header renders at 1280 px, then the "Enquiries" link contains `<span class="badge badge--count" aria-hidden="true">2</span>` followed by `<span class="visually-hidden">, 2 unread</span>`. (L2-029)
- **AC-2** Given Kendra opens one of her 2 unread threads, when the count input changes from 2 to 1, then the pill reads "1" and the hidden text ", 1 unread", without a page reload. (L2-029)
- **AC-3** Given Marcia Thompson has no unread threads, when her header renders, then the "Inbox" link contains no `.badge` element and no hidden count text, and no "0" appears. (L2-029)
- **AC-4** Given the operator queue holds 134 items, when the "Queue" badge renders with `max` 99, then the pill reads "99+" and the hidden text reads ", 134 items waiting". (L2-029)
- **AC-5** Given an operator added the cuisine "Caymanian" today, when the cuisines list renders, then "Caymanian" is followed by `<span class="badge badge--info">New</span>`. (L2-007)
- **AC-6** Given Marcia's own review of Pelau House, when the caterer page renders for her, then the review head shows "Marcia T." followed by a neutral `span.badge` reading "Your review". (L2-053)

### Screen readers

- **AC-7** Given Kendra's header at 1280 px, when a screen reader reads the "Enquiries" link, then its accessible name is "Enquiries, 2 unread" and the number "2" is not read twice. (L2-029)
- **AC-8** Given Kendra's header at 360 px, when the inbox icon button with a count of 2 renders, then the badge has `aria-hidden="true"`, has no `aria-label`, and the button's accessible name is "Enquiries, 2 unread". (L2-068)
- **AC-9** Given the operator list, when a screen reader reads Leah Mohammed's row title, then it reads "Leah Mohammed You" with no role announced for the badge. (L2-066)
- **AC-10** Given the count badge renders in a link, a tab, an icon button and a filter-list item, when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations, including none for `aria-label` on a generic element. (L2-066)

### Keyboard and focus

- **AC-11** Given Leah's header with "Queue 7", when she tabs through the header, then focus stops on the "Queue" link once and never on the badge itself. (L2-067)
- **AC-12** Given keyboard focus on Kendra's inbox icon button at 360 px, when the focus ring shows, then the ring encloses the count pill and the pill is not cut off. (L2-067)

### Theming

- **AC-13** Given the light and the dark theme, when the count "2" renders, then its fill is `--color-danger-solid` and the numerals have at least 4.5:1 contrast against it. (L2-069)
- **AC-14** Given the dark theme and Leah's side nav with the current item "Review queue" (`aria-current="page"`, label in `--color-fg-accent`), when it renders with a count of 7, then the pill's fill resolves to `--palette-sorrel-300`, not the item's pepper accent, so the count is not read as "selected". (L2-069)
- **AC-15** Given the light and the dark theme, when "You" and "New" render, then each label has at least 4.5:1 contrast against its own fill. (L2-069)
- **AC-16** Given the count pill on the header in either theme, when its edge is measured against `--color-bg-canvas`, then the contrast is at least 3:1. (L2-069)

### Responsive

- **AC-17** Given a 360 px viewport, when Kendra's inbox icon button renders with a count of 2, then the button still measures 44 × 44 CSS px and the pill lies entirely within it. (L2-065)
- **AC-18** Given a 320 px viewport, when an operator row title "Leah Mohammed" with the "You" badge wraps, then the badge moves to the next line as one pill and nothing is clipped or scrolls horizontally. (L2-064)
- **AC-19** Given the "Queue" badge with "99+", when it renders at any width from 320 px to 2560 px, then its text stays on one line and its height does not change. (L2-064)

### Motion

- **AC-20** Given the count changes from 2 to 1 while Kendra is on her dashboard, when the new value renders, then no animation, transition or `aria-live` announcement comes from the badge. (L2-069)

### Performance

- **AC-21** Given the `Badge` perf-test scenario, when the count input changes from 2 to 1, then only the badge re-renders, the header's layout does not shift (Cumulative Layout Shift 0), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/badge/`; file
  `badge.component.*` (selector `sh-badge`, class `BadgeComponent`).
- Styles: the "Badge" section of `components.css` moves into the component,
  class names unscoped; `.icon-btn .badge--count` and `.tab .badge` stay with
  [icon button](icon-button.md) and [tabs](tabs.md) since they are parent
  rules.
- The component renders the hidden-text span itself when `countLabel` is set,
  so no consumer can forget `aria-hidden` on the pill.
- Mock drift to clean up as screens are built: 236 mocks put
  `aria-label="7 items waiting"` on the count span and have no hidden text;
  the design-system tabs page does the same for "Reports 2".
- No CDK primitive is needed. Composed by [site header](site-header.md),
  [icon button](icon-button.md), [tabs](tabs.md), filter list,
  [review](review.md) and the operator list rows.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* `display: contents`, rendering `span.badge` in the light DOM, so parent rules (`.icon-btn .badge--count`, `.tab .badge`, the wrapping `.admin-row__title`) style the real pill and e2e locators match the mocks.
- **D-3** *How is a count named?* The pill is always `aria-hidden="true"` and the meaning is visually hidden text after it (or the parent's `aria-label`), as the design system decided when it fixed 236 mocks that put `aria-label` on the `<span>`. There is no way to put `aria-label` on the badge.
- **D-4** *What exactly does the hidden text say?* ", {count} {meaning}" in the words the link needs: after "Enquiries" just ", 2 unread" (the link already says what is unread), after "Inbox" ", 1 unread enquiry", after "Queue" ", 7 items waiting". The phone icon link is named "Enquiries, 2 unread" with the badge `aria-hidden`, by the user's decision of 10 Oct 2026 (L2-029.1, which asks for "2 unread enquiries", is to be amended to match).
- **D-5** *Are success, warning, danger and solid part of the API although no screen uses them?* Yes. The design system defines and renders them, and a later screen may need them; leaving them out would change the `variant` type later. Content rules (status labels for record states) keep them rare.
- **D-6** *Does a count change animate or announce?* No. The design system forbids motion on counts, and the inbox and queue pages own their own live regions; a badge announcing every 60-second poll would interrupt.
- **D-7** *What does a count of 0 or `null` render?* Nothing, not even the hidden text, so the link reads just "Inbox" (L2-029.4). A negative count, which should never arrive, is treated as 0.
- **D-8** *What is `max`?* 99, as the design system says ("up to 99, then 99+"); a consumer may lower it, never raise it beyond what fits the pill on an icon button.
