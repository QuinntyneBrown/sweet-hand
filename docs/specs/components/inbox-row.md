# Inbox row

| Field | Value |
|---|---|
| Selector | `sh-inbox-row` (one enquiry, renders `li > a.inbox-row`), `sh-inbox-list` (the list, renders `ul.inbox-list`) |
| Library path | `frontend/projects/components/src/lib/inbox-row/` |
| Status | planned |
| Traces to | L2-029, L2-031, L2-036, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-085 |
| Design system | [`inbox-row.html`](../../design-system/components/inbox-row.html) |
| Source mocks | [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/inbox/loading`](../../mocks/pages/inbox/loading.html), [`pages/inbox/long`](../../mocks/pages/inbox/long.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/dashboard-enquiries/loading`](../../mocks/pages/dashboard-enquiries/loading.html), [`pages/dashboard-enquiries/long`](../../mocks/pages/dashboard-enquiries/long.html), [`pages/dashboard-enquiry/default`](../../mocks/pages/dashboard-enquiry/default.html), [`pages/dashboard-enquiry/former-user`](../../mocks/pages/dashboard-enquiry/former-user.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html) |
| Rendering | [`inbox-row.html`](inbox-row.html) |

## Purpose and scope

The inbox row is how both sides of Sweet Hand find a conversation: one row per
enquiry, one link to its thread. It shows who the enquiry is with, when it
last moved, the event in a few words and where it stands — "Pelau House ·
9:42 a.m. · Sat 21 Nov · 120 guests · Replied" for Marcia; "Priya Ramdial ·
Yesterday · Thu 5 Nov · 60 guests · Corporate events · Open" for Kendra.
Customers see the caterer's round food photo; caterers see the customer's
initials. An unread row has a pepper dot, a bold name, a darker summary and a
hidden "Unread."; the row whose thread is open beside the list is current.

`sh-inbox-list` is the ruled list of rows and its loading skeletons. Use
something else for operator review work (queue item, which shows wait time),
settings and account lists ([list](list.md)), and the conversation itself
([message](message.md)).

Out of scope:

- Sorting by latest activity, the 20-per-page split and the status filter
  (All, Open, Replied, Declined, Closed) above the list (L2-031.1–3): the inbox
  page, its segmented control and [pagination](pagination.md).
- Empty, no-results, error and offline states ("No enquiries yet", "We
  couldn't load your enquiries. Your messages are safe."):
  [empty state](empty-state.md) and the page's banner.
- Computing "unread" and the header count (L2-029.1–3): the API and
  [badge](badge.md) in the site header.
- The two-column layout and loading a thread into the pane: the inbox page
  and [message](message.md).

## Usage

Inventory from `usage_inventory.py docs/mocks inbox-row "a|li|div"` (225 read
and 51 unread rows on 12 screens; 23 `aria-current="page"`, 18
`aria-current="true"`), `… inbox-list "ul"` (58) and
`… inbox-skeleton-row "li|div"` (4).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/inbox/default`, `filtered`, `offline`, `long` (Marcia) | customer: photo, name, time, "date · guests", status | "Pelau House" (unread) "9:42 a.m." "Sat 21 Nov · 120 guests" "Replied"; "Sugar Dumplin" "Thu" … "Open"; "Demerara Kitchen" "Tue" … "Declined"; "Ti Kay" "Sat 5 Sep" "Sun 23 Aug · 45 guests" "Closed" | default, unread, hover, focus | canvas |
| `pages/thread/*`, `dialogs/close-enquiry`, `share-contact`, `notifications/toast` (LG list beside the thread) | customer, current with `aria-current="page"` | "Pelau House" | current | canvas |
| `pages/inbox/loading` | list `busy`, 4 skeletons | — | loading | canvas |
| `pages/dashboard-enquiries/default`, `filtered`, `long` (Kendra) | caterer: initials, name, time, "date · guests · occasion", status | "PR" "Priya Ramdial" (unread) "Yesterday" "Thu 5 Nov · 60 guests · Corporate events" "Open"; "AC" "Andre Clarke" (unread) "Thu" "Sat 12 Jun 2027 · 250 guests · Weddings"; "MT" "Marcia Thompson" "9:42 a.m." "Replied"; "NJ" "Nadia Joseph" "Declined"; "JP" "Jean-Robert Pierre" "Tue 6 Oct" "Closed"; long name "Simone Achterberg-Ramkissoon" | default, unread, hover, focus, truncated name | work layout |
| `pages/dashboard-enquiry/*`, `dialogs/decline-enquiry` (LG list beside the thread) | caterer, current with `aria-current="true"` | "Priya Ramdial" | current + unread | work layout |
| `pages/dashboard-enquiries/default`, `pages/dashboard-enquiry/former-user` | caterer, deleted customer: person glyph | "Former Sweet Hand user" "Tue 22 Sep" "Sat 26 Sep · 35 guests · Birthdays" "Replied" | default | work layout |
| `pages/dashboard/default` "Latest enquiries", `notifications/profile-banner`, `site-banner`, `dialogs/account-menu` (page behind) | caterer, first 3 rows | "Priya Ramdial", "Andre Clarke", "Marcia Thompson" | default, unread | canvas |
| `pages/dashboard-enquiries/loading`, `pages/dashboard/loading` | list loading (mocks use `li.inbox-row[aria-hidden]` skeletons, D-5) | — | loading | canvas |

## Anatomy

1. **List** — `ul.inbox-list` with `aria-label` ("Your enquiries", "Pelau House
   enquiries"): list reset, hairline rule on top; `aria-busy="true"` while
   loading.
2. **Row link** — `a.inbox-row` inside each `li`: a three-column, two-line
   grid (`auto minmax(0, 1fr) auto`), `--space-4` × `--space-2` padding,
   `--space-4` column gap, hairline rule below. The whole row is the link.
3. **Picture** — `span.photo` with a decorative 48 px `img` (customer view),
   `span.avatar` with initials (caterer view) or with a person glyph (former
   user); 3rem, spans both lines.
4. **Name** — `span.inbox-row__name`: `--text-body` medium, one line with an
   ellipsis; when unread it starts with `span.unread-dot` (`aria-hidden`) and
   a visually hidden "Unread. ".
5. **Time** — `span.inbox-row__time`: last activity, `--text-caption`,
   `--color-fg-subtle`, right-aligned, never wraps.
6. **Summary** — `span.inbox-row__meta`: event date, guests and (caterer view)
   occasion joined by " · "; `--text-body-sm`, muted, one line with an
   ellipsis.
7. **Status** — [status label](status.md) with the extra class
   `inbox-row__status`, right-aligned on the second line.
8. **Skeleton** — `li.inbox-skeleton-row[aria-hidden]`: the same grid with a
   circle and four text bars (50 %, 3rem, 70 %, 4rem).

Hosts: both are `display: contents`; `sh-inbox-row` renders its own `li`, so
the `ul` holds only `li` children.

## API

### `sh-inbox-row` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `href` | `string` | — | yes | The thread URL (`/inbox/{id}` or `/dashboard/enquiries/{id}`), with a random enquiry id (L2-034.2). |
| `name` | `string` | — | yes | Caterer business name (customer view), customer full name (caterer view) or "Former Sweet Hand user". Never an email address. Rendered as text. |
| `picture` | `{ kind: 'photo'; src: string } \| { kind: 'initials'; text: string } \| { kind: 'gone' }` | — | yes | 48 × 48 decorative photo with `loading="lazy"`, initials avatar, or person glyph. |
| `time` | `string` | — | yes | Last activity, formatted by the consumer in `America/Toronto`: "9:42 a.m.", "Yesterday", "Thu", "Tue 6 Oct", "Tue 6 Oct 2025". |
| `datetime` | `string \| null` | `null` | no | ISO timestamp; renders `time[datetime]` inside `.inbox-row__time` (D-6). |
| `summary` | `string` | — | yes | "Sat 21 Nov · 120 guests" or "Thu 5 Nov · 60 guests · Corporate events", composed and translated by the consumer; the year is added when the event is not in 2026. |
| `statusTone` | `'open' \| 'replied' \| 'declined' \| 'closed'` | — | yes | Passed to `sh-status`. |
| `statusLabel` | `string` | — | yes | "Open", "Replied", "Declined", "Closed". |
| `unread` | `boolean` | `false` | no | Adds `.inbox-row--unread`, the dot and the hidden `unreadLabel`. |
| `unreadLabel` | `string` | — | yes when `unread` | "Unread." (the component adds the trailing space). |
| `current` | `'page' \| 'true' \| null` | `null` | no | Rendered as `aria-current`: `page` on thread pages where this row's link is the page; `true` where the thread is open in the pane beside a list page. |

### `sh-inbox-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The `ul`'s `aria-label`: "Your enquiries", "Pelau House enquiries". |
| `busy` | `boolean` | `false` | no | Sets `aria-busy="true"`, replaces the rows with `skeletonCount` skeletons, and switches the label to `loadingLabel`. |
| `loadingLabel` | `string` | — | yes when `busy` | "Loading your enquiries". |
| `skeletonCount` | `number` | `4` | no | Whole number 1–20. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `sh-inbox-row` `opened` | `MouseEvent \| KeyboardEvent` | The link is activated. The consumer may cancel it at LG and load the thread into the pane instead of navigating (then it moves focus to the thread heading). |

### Methods

| Method | Rule |
|---|---|
| `sh-inbox-row` `focus()` | Focuses the row link; the inbox page calls it when the person returns from a thread on a phone. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-inbox-row` | none | Everything is an input: no message preview or extra badge can be added (D-3). |
| `sh-inbox-list` default | `sh-inbox-row` elements | Hidden while `busy`. |

- Translation: `summary`, `time`, `statusLabel`, `unreadLabel`, `label` and
  `loadingLabel` come from the resource files (L2-064); `name` is data.

## Variants and sizes

| Variant | Picture | Summary | Where |
|---|---|---|---|
| Customer | caterer's round food photo | date · guests | `pages/inbox` |
| Caterer | customer's initials | date · guests · occasion | `pages/dashboard-enquiries`, dashboard "Latest enquiries" |
| Former user | person glyph | as caterer | caterer view after a customer deleted their account |

The variant follows from `picture`; no modifier class. One size: 48 px
picture, `--space-4` block padding and two text lines, about 81 px tall at
every breakpoint.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Picture, name, time, summary, status | One link: "Sugar Dumplin, Thu, Sat 21 Nov · 120 guests, Open" |
| Hover | `:hover` | `--color-bg-surface-sunken` fill over `--duration-fast` | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring` around the whole row | Focused link |
| Unread | `unread` | Pepper dot, bold name, `--color-fg-default` summary | "Unread. Pelau House, …" |
| Current | `aria-current` | `--color-bg-subtle` fill (neutral, not pepper) | "current page" / "current" announced |
| Current + unread | both | Fill plus dot and bold | Both announced |
| Long name | name wider than its column | One line with an ellipsis | Full name read |
| Loading | list `busy` | Skeleton rows in the final grid | List `aria-busy`, labelled "Loading your enquiries"; rows hidden |
| Active | `:active` | As hover | — |
| Disabled | — | Never: every enquiry a person is part of can be opened (L2-031.4) | — |

`data-state="hover|focus"` exists for documentation and mocks only.

## Markup

```html
<!-- rendered: customer list, first row unread -->
<ul class="inbox-list" aria-label="Your enquiries">
  <li><a class="inbox-row inbox-row--unread" href="/inbox/enq_51c2">
    <span class="photo"><img src="…/pelau-house-96.avif" alt="" width="48" height="48" loading="lazy"></span>
    <span class="inbox-row__name"><span class="unread-dot" aria-hidden="true"></span><span class="visually-hidden">Unread. </span>Pelau House</span>
    <span class="inbox-row__time"><time datetime="2026-10-10T09:42-04:00">9:42 a.m.</time></span>
    <span class="inbox-row__meta">Sat 21 Nov · 120 guests</span>
    <span class="inbox-row__status status status--replied">Replied</span>
  </a></li>
</ul>
```

```html
<!-- rendered: caterer row, current in the pane, unread -->
<li><a class="inbox-row inbox-row--unread" href="/dashboard/enquiries/enq_7a10" aria-current="true">
  <span class="avatar" aria-hidden="true">PR</span>
  <span class="inbox-row__name"><span class="unread-dot" aria-hidden="true"></span><span class="visually-hidden">Unread. </span>Priya Ramdial</span>
  <span class="inbox-row__time">Yesterday</span>
  <span class="inbox-row__meta">Thu 5 Nov · 60 guests · Corporate events</span>
  <span class="inbox-row__status status status--open">Open</span>
</a></li>

<!-- rendered: former user -->
<li><a class="inbox-row" href="/dashboard/enquiries/enq_3f09"><span class="avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><span class="inbox-row__name">Former Sweet Hand user</span><span class="inbox-row__time">Tue 22 Sep</span><span class="inbox-row__meta">Sat 26 Sep · 35 guests · Birthdays</span><span class="inbox-row__status status status--replied">Replied</span></a></li>
```

```html
<!-- rendered: loading -->
<ul class="inbox-list" aria-busy="true" aria-label="Loading your enquiries">
  <li class="inbox-skeleton-row" aria-hidden="true"><span class="skeleton skeleton--circle"></span><span class="skeleton skeleton--text" style="width: 50%"></span><span class="skeleton skeleton--text" style="width: 3rem"></span><span class="skeleton skeleton--text" style="width: 70%"></span><span class="skeleton skeleton--text" style="width: 4rem"></span></li>
  … (4 in all)
</ul>
```

Consumer templates (binding syntax illustrative):

```html
<sh-inbox-list [label]="t('inbox.label')" [busy]="loading()" [loadingLabel]="t('inbox.loading')">
  @for (e of page().enquiries; track e.id) {
    <sh-inbox-row [href]="'/inbox/' + e.id" [name]="e.caterer.name" [picture]="{ kind: 'photo', src: e.caterer.thumb }"
      [time]="fmtActivity(e.lastActivityAt)" [datetime]="e.lastActivityAt" [summary]="t('inbox.summary', { date: fmtEvent(e.eventDate), guests: e.guests })"
      [statusTone]="tone(e.status)" [statusLabel]="t('enquiry.status.' + e.status)" [unread]="e.unread" [unreadLabel]="t('inbox.unread')"
      [current]="e.id === openId() ? 'page' : null"></sh-inbox-row>
  }
</sh-inbox-list>
```

The e2e page objects locate rows by `.inbox-row`, its link name,
`.inbox-row--unread`, `.unread-dot`, `[aria-current]`, `.inbox-row__name`,
`.inbox-row__time`, `.inbox-row__meta`, `.inbox-row__status` and
`.inbox-skeleton-row`; those are part of the contract.

## Design

- List: list reset, `--border-width-hairline` `--color-border-default` rule on
  top.
- Row: grid `auto minmax(0, 1fr) auto`, `0 --space-4` gap, `--space-4`
  × `--space-2` padding, hairline rule below, no underline, inherits colour;
  hover fill transition `--duration-fast` with `--ease-standard`.
- Picture: 3rem, round, spans two rows.
- Name: `--text-body`, `--font-weight-medium` (`--font-weight-bold` unread),
  one line, ellipsis. Dot: 0.625rem circle in `--color-accent`, `--space-2`
  after it.
- Time: `--text-caption`, `--color-fg-subtle`, right-aligned, no wrap.
- Summary: `--text-body-sm`, `--color-fg-muted` (`--color-fg-default`
  unread), one line, ellipsis.
- Status: `justify-self: end`.
- Focus ring: `--focus-ring-width` `--color-focus-ring` around the row.
- Skeleton: `.inbox-skeleton-row` with the same grid and `--space-2` row gap.
- Layer: none.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Row rule | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Hover fill | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| Current fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Name, unread summary | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Summary | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Time | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Unread dot | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Name, unread summary |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Summary |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Time |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Name on the current row |
| `--color-fg-muted` | `--color-bg-subtle` | 4.5:1 | Summary on the current row |
| `--color-fg-subtle` | `--color-bg-subtle` | 4.5:1 | Time on the current row |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Name on hover |
| `--color-accent` | `--color-bg-canvas` | 3:1 | Unread dot |
| `--color-fg-accent` | `--color-bg-subtle` | 4.5:1 | "Open" on the current row |
| `--color-success-fg` | `--color-bg-subtle` | 4.5:1 | "Replied" on the current row |
| `--color-focus-ring` | `--color-bg-subtle` | 3:1 | Focus ring on the current row |

Forced colours: the row is a link in system colours; hover and current fills
drop out, so `aria-current` rows also keep the bold-free name and the
status; unread keeps its bold name and the hidden text.

## Responsive behaviour

- Below LG (62rem) the inbox shows the list or one thread, never both;
  opening a row navigates to its thread, and the thread's back link "Inbox" returns to the
  list with focus on that row (L2-036.2).
- From LG the list sits in a 20–26rem column beside the open thread; the
  current row is marked (L2-036.1).
- At every width the name and summary truncate to one line with an ellipsis;
  time and status never truncate or wrap. At 320 px "Simone
  Achterberg-Ramkissoon" truncates and the status stays on the second line.
- The row is a full-width target about 81 px tall; nothing inside is
  separately interactive. No horizontal scroll at 320 px or at 200 % zoom.

## Accessibility

### Role and pattern

A list of links: `ul[aria-label]` of `li` each holding one `a.inbox-row`. The
link's accessible name is its text in order: "Unread. Pelau House, 9:42 a.m.,
Sat 21 Nov · 120 guests, Replied".

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Row to row, one stop each. |
| <kbd>Enter</kbd> | Opens the thread (navigates, or at LG loads it into the pane and focus moves to its heading). |

### Focus

The shared ring draws around the whole row. Returning from a thread on a phone
puts focus back on the row that was opened (`focus()`), so a long inbox does
not start over.

### Labelling

- The picture is decorative (`alt=""`, avatar `aria-hidden`); the name
  follows.
- "Unread." is visually hidden text inside the name, not an `aria-label`, so
  the rest of the row is still read.
- `aria-current` tells which thread is open.
- The full name is in the DOM even when truncated.

### Announcements

None from the row. The list's `aria-busy` and label cover loading; the page
announces the result count after filtering (L2-067.5).

### Motion

Only the hover fill transitions, over `--duration-fast`, which
`prefers-reduced-motion: reduce` makes instant. Skeletons stop shimmering.

## Content and internationalisation

- Name: business name (customer view), full customer name (caterer view),
  "Former Sweet Hand user" after deletion; never an email.
- Time of last activity in Toronto time: today as a time ("9:42 a.m."),
  yesterday "Yesterday", the last 6 days as the weekday ("Thu"), older "Tue 6
  Oct", other years with the year. One format on both sides (the mocks' "5
  Sep" is drift).
- Summary: event date, guests, then (caterer view) occasion: "Thu 5 Nov · 60
  guests · Corporate events"; "Sat 12 Jun 2027" outside 2026.
- Status: Open, Replied, Declined or Closed.
- No message preview: messages are private and the row stays scannable.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (classes, the hidden prefix,
  the picture element) are computed once, not in the template.
- Rows are tracked by enquiry id; a new message moves one row to the top
  without re-rendering the others.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/InboxRow.ts`
  renders Kendra's enquiries (Priya Ramdial unread and current, Andre Clarke
  unread, Marcia Thompson, Nadia Joseph, Jean-Robert Pierre, Former Sweet Hand
  user) repeated to 20 rows; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Inbox` (LG, list beside thread), `DashboardEnquiries`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: fixed picture size with `width`/`height`; skeleton rows use
  the same grid and height; marking a row read changes weight only.
- Weight: composes [photo](photo.md), avatar, [status label](status.md) and
  [skeleton](skeleton.md).

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia's inbox, when the Pelau House row renders, then it is one `a.inbox-row` showing the photo, "Pelau House", "9:42 a.m.", "Sat 21 Nov · 120 guests" and the status "Replied". (L2-031)
- **AC-2** Given Kendra's enquiries, when Priya Ramdial's row renders, then it shows the "PR" avatar, "Priya Ramdial", "Yesterday", "Thu 5 Nov · 60 guests · Corporate events" and "Open", and no photo of the customer. (L2-031)
- **AC-3** Given Andre Clarke's wedding on Sat 12 Jun 2027, when his row renders, then the summary reads "Sat 12 Jun 2027 · 250 guests · Weddings". (L2-031)
- **AC-4** Given Ti Kay's last activity was Sat 5 Sep, when Marcia's inbox renders on Sat 10 Oct, then the time reads "Sat 5 Sep". (L2-031)
- **AC-5** Given a customer who deleted their account, when Kendra's enquiries render, then that row shows the person glyph and "Former Sweet Hand user", and no name, email or phone of the customer. (L2-072)
- **AC-6** Given Pelau House's thread has an unread reply, when Marcia's inbox renders, then its row has `.inbox-row--unread`, a pepper dot, a bold name, a `--color-fg-default` summary and the hidden text "Unread. " before "Pelau House". (L2-029)
- **AC-7** Given Marcia opens the Pelau House thread and returns to her inbox, when it renders, then that row no longer has `.inbox-row--unread`, a dot or the hidden text. (L2-029)
- **AC-8** Given the inbox is loading, when `sh-inbox-list` renders with `busy`, then the `ul` has `aria-busy="true"` and the label "Loading your enquiries" and holds 4 `li.inbox-skeleton-row` with `aria-hidden="true"`. (L2-066)

### Layout and current row

- **AC-9** Given viewport LG with Kendra's enquiry from Priya open in the pane, when the list renders, then Priya's row has `aria-current="true"` and the `--color-bg-subtle` fill, and no other row is current. (L2-036)
- **AC-10** Given viewport XS, when Marcia taps the Sugar Dumplin row, then the browser navigates to its thread (the list is no longer shown); when she follows the back link "Inbox", then focus returns to the Sugar Dumplin row. (L2-036)

### Keyboard and focus

- **AC-11** Given Kendra's enquiries list, when she tabs through it, then each row is one stop in list order and Enter opens that enquiry. (L2-067)
- **AC-12** Given keyboard focus on a row, including the current row, in either theme, when it is displayed, then a `--color-focus-ring` ring surrounds the whole row with at least 3:1 contrast against the row fill and the page. (L2-067)

### Screen readers

- **AC-13** Given Marcia's unread Pelau House row, when a screen reader reads the link, then its name is "Unread. Pelau House, 9:42 a.m., Sat 21 Nov · 120 guests, Replied" and the photo adds nothing. (L2-068)
- **AC-14** Given the customer and caterer inboxes in every row state, when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations. (L2-066)

### Theming

- **AC-15** Given the light and the dark theme, when rows render on the page and as the current row, then the name, summary and time each have at least 4.5:1 contrast against the row fill. (L2-069)
- **AC-16** Given the light and the dark theme, when an unread row and a read row are compared without colour, then unread is still shown by the bold name and the hidden "Unread." text, not only by the pepper dot. (L2-069)

### Responsive

- **AC-17** Given a 320 px viewport, when "Simone Achterberg-Ramkissoon"'s row renders, then the name ends in an ellipsis on one line, the time and status are fully visible, and the page does not scroll horizontally. (L2-064)
- **AC-18** Given a 360 px viewport, when a row is measured, then its link is the full row width and at least 44 CSS px tall. (L2-065)
- **AC-19** Given a 1280 px window at 200 % zoom, when Kendra's enquiries render, then every row's name, time, summary and status are visible without horizontal scrolling. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when a row is hovered, then its fill appears without a visible transition. (L2-069)

### Performance

- **AC-21** Given the `InboxRow` perf-test scenario with 20 rows, when one row changes from unread to read, then only that row re-renders and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/inbox-row/`; files
  `inbox-row.component.*` (`sh-inbox-row`, `InboxRowComponent`) and
  `inbox-list.component.*` (`sh-inbox-list`, `InboxListComponent`).
- Composes [photo](photo.md) (48 px, lazy), avatar, [status label](status.md)
  (`extraClass="inbox-row__status"`) and [skeleton](skeleton.md).
- Styles: the "Inbox row" section of `components.css` (`.inbox-list`,
  `.inbox-row*`, `.unread-dot`, `.inbox-skeleton-row`) moves into the
  component, class names unscoped. `.inbox-layout` stays with the page.
- Mock drift to fix as screens are built: the customer inbox writes "5 Sep"
  where the format needs "Sat 5 Sep"; loading lists lack `aria-busy`; the
  dashboard's loading list uses `li.inbox-row[aria-hidden]` skeletons instead
  of `.inbox-skeleton-row`; the `ul` has no `aria-label`.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Which `aria-current` value?* Both, by input: `page` where the row's link is the page you are on (customer thread pages), `true` where the thread is open in a pane beside a list page (caterer enquiries at LG), as the design system decided from the mocks.
- **D-3** *Can a row show a message preview or extra marker?* No. The design system rules out previews (messages are private and rows stay scannable) and L2-031 lists exactly the fields to show, so the row has no slots.
- **D-4** *Who formats the time and summary?* The consumer, from shared date helpers, so customer and caterer views use the one format the design system fixed ("Sat 5 Sep", never "5 Sep").
- **D-5** *Which skeleton markup?* `.inbox-skeleton-row`, the design system's class, on every loading list; the dashboard mocks' `li.inbox-row[aria-hidden]` skeletons are drift because an `.inbox-row` locator would match them.
- **D-6** *Is the time machine-readable?* Yes, a `time[datetime]` when `datetime` is given, as in [message](message.md); it changes nothing visually.
- **D-7** *Does the row own the unread count or the fit warning?* No. The header [badge](badge.md) owns the count; the fit warning ("This caterer doesn’t list Downtown Toronto as an area they serve") appears in the thread, not the row, as the mocks show.
