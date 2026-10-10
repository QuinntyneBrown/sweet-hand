# List rows

| Field | Value |
|---|---|
| Selector | `sh-list` (the `ul`/`ol` of any family, its loading rows and its status line), `sh-list-item` (`.list__item`: compact and device rows, whole-row links), `sh-admin-row` (`.admin-row`: settings rows), `sh-edit-row` (`.edit-row`: editable menu rows), `sh-breach-record` (`.breach`: breach register records) |
| Library path | `frontend/projects/components/src/lib/list/` |
| Status | planned |
| Traces to | L2-007, L2-043, L2-044, L2-045, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-075, L2-078 |
| Design system | [`list.html`](../../design-system/components/list.html) |
| Source mocks | [`pages/account/default`](../../mocks/pages/account/default.html), [`pages/account/caterer`](../../mocks/pages/account/caterer.html), [`pages/account/loading`](../../mocks/pages/account/loading.html), [`pages/admin-cuisines/default`](../../mocks/pages/admin-cuisines/default.html), [`pages/admin-cuisines/loading`](../../mocks/pages/admin-cuisines/loading.html), [`pages/admin-operators/default`](../../mocks/pages/admin-operators/default.html), [`pages/admin-operators/loading`](../../mocks/pages/admin-operators/loading.html), [`pages/profile-menu/default`](../../mocks/pages/profile-menu/default.html), [`pages/profile-menu/loading`](../../mocks/pages/profile-menu/loading.html), [`pages/profile-menu/read-only`](../../mocks/pages/profile-menu/read-only.html), [`pages/profile-menu/full`](../../mocks/pages/profile-menu/full.html), [`pages/admin-breaches/default`](../../mocks/pages/admin-breaches/default.html), [`pages/admin-breaches/loading`](../../mocks/pages/admin-breaches/loading.html) |
| Rendering | [`list.html`](list.html) |

## Purpose and scope

Most of Sweet Hand's settings and records are rows: a title, a quiet line
under it, an action at the end, and a hairline between. This component is the
four row families that share that shape, plus the list that holds them:

- **List** (`.list`, `.list__item`): a compact title-and-meta row with an
  optional trailing control. The account page's **device list** is the product
  use: "Safari on iPhone · Last active today, 8:15 a.m." with "Sign out".
- **Settings rows** (`.admin-list`, `.admin-row`): operator settings with a
  larger title: cuisines with their caterer count and "Retire", operators with
  an avatar and "Deactivate".
- **Editable rows** (`.edit-list`, `.edit-row`): a caterer's dishes in page
  order, each with move up, move down, edit and remove icon buttons.
- **Breach records** (`.breach-list`, `.breach`): tall, read-only records in
  the privacy breach register, each a heading, a date line and a key-value
  list.

Rows are flat: no card, no shadow, just a 1 px rule. Use an
[inbox row](inbox-row.md) for conversations, a [queue item](queue-item.md) for
operator review work, a [table](table.md) when people compare columns, a
[dish](dish.md) for the public menu, a [caterer card](caterer-card.md) for
browsing, the [filter list](filter-list.md) for the side navigation and
filters, and the [combobox](combobox.md)'s own listbox for selectable
suggestions.

Out of scope:

- What the actions do: "Retire", "Deactivate", "Sign out", "Edit" and
  "Remove" open [dialogs](dialog.md) owned by the page; reordering calls the
  page's API. The rows emit events and render what they are given.
- The dish content inside an editable row (name, price, description, tags):
  [dish](dish.md) owns `.dish__top`, `.dish__name`, `.dish__price`,
  `.dish__desc` and the [tags](tag.md); the row projects it.
- The key-value list inside a breach record: the `.kv` variant of
  [description list](description-list.md).
- Empty and error states: the page replaces the list with an
  [empty state](empty-state.md) ("What do you cook best?", "We couldn't load
  your menu").
- The banner that explains a read-only menu ("Waiting for review") and the
  disabled "Add dish" with its reason: the page's [alert](alert.md) and
  [button](button.md).

## Usage

Inventory from `usage_inventory.py docs/mocks` for `list__item`, `admin-row`,
`edit-row` and `breach` (the 2,176 `filter-list__item` hits belong to
[filter list](filter-list.md) and are excluded).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/account/default`, `bounced`, `export-requested`, `saved`, `unverified`; `dialogs/change-password`, `delete-account`, `download-data`, `edit-details`, `end-session` (page behind) | family `device`, `ul`, labelled by the section heading "Signed-in devices" | "Chrome on Windows" / "This device · active now" + [status](status.md) "Current"; "Safari on iPhone" / "Last active today, 8:15 a.m." + secondary `sm` "Sign out" (opens `dialogs/end-session`); "Samsung Internet on Android" / "Last active Mon 28 Sep" | default | canvas |
| `pages/account/caterer` | family `device` | "Safari on iPhone" (Current), "Chrome on Mac" / "Last active yesterday, 9:03 p.m." | default | canvas |
| `pages/account/loading` | family `device`, `busy`, 3 skeleton rows | — | loading | canvas |
| `pages/admin-cuisines/default`; `dialogs/add-cuisine`, `retire-cuisine` (page behind) | family `settings`, `ul`, label "Cuisines, A to Z" | 19 rows: "Antiguan & Barbudan" / "2 published caterers" … "Belizean" / "1 published caterer", "Bahamian" / "No published caterers", "Caymanian" + [badge](badge.md) "New" / "Added today by Leah Mohammed · no caterers yet"; ghost `sm` "Retire" named "Retire Belizean" | default | canvas |
| `pages/admin-cuisines/loading` | family `settings`, `busy`, 10 skeleton rows with an action block | status "Loading cuisines" | loading | canvas |
| `pages/admin-operators/default`; `dialogs/add-operator`, `deactivate-operator` (page behind) | family `settings`, `ul`, label "Operators", leading [avatar](avatar.md) | "Leah Mohammed" + badge "You" / "Admin · Authenticator app · Active now", no action; "Tomas Reyes" / "Operator · Security key · Last active today, 8:15 a.m." + "Deactivate" named "Deactivate Tomas Reyes" | default, own row without action | canvas |
| `pages/admin-operators/loading` | family `settings`, `busy`, 2 skeleton rows with avatar and action blocks | status "Loading operators" | loading | canvas |
| `pages/profile-menu/default`; `dialogs/dish`, `remove-dish` (page behind) | family `editable`, `ol`, label "Dishes, in the order they appear on your page" | 18 rows: "Chicken pelau" / "From $16 per person" / description / tags "Gluten-free", "Dairy-free"; four icon buttons "Move Chicken pelau up" (unavailable on the first row), "Move … down" (unavailable on the last, "Paw paw chow"); the mock's native `disabled` becomes `aria-disabled` (D-5), "Edit …", "Remove …" | default, first, last | canvas |
| `pages/profile-menu/full` | family `editable`, 50 rows | "50 of 50 dishes" | default | canvas |
| `pages/profile-menu/read-only` | family `editable`, `readOnly` rows (no actions), 4 rows | "Curry goat" / "From $19 per person" / "Bone-in, with potato and pimento." / "Halal", "Gluten-free", "Spicy" | read-only | canvas |
| `pages/profile-menu/loading` | family `editable`, `busy`, 8 skeleton rows | — | loading | canvas |
| `pages/admin-breaches/default`; `dialogs/record-breach` (page behind) | family `breach`, `ul`, label "Recorded breaches, newest first", record title `h2` | "Enquiry email sent to the wrong caterer" / "Confirmed Thu 17 Sep 2026 · recorded by Leah Mohammed" / kv "Information involved", "People affected" 1, "Risk assessment", "Notification decision"; "Team laptop stolen from a car" (Tue 11 Mar 2025) | default | canvas |
| `pages/admin-breaches/loading` | family `breach`, `busy`, 2 skeleton records | status "Loading breach records" | loading | canvas |
| `pages/admin-breaches/empty`, `error`; `profile-menu/empty`, `error`; `admin-cuisines/error`, `admin-operators/error`, `account/error` | no list: [empty state](empty-state.md) | — | empty, error | canvas |
| Design-system kit (no mock yet) | family `list`, whole-row links with a chevron, one `current` | "Business details" / "Name, description, contact"; "Food safety" / "Certificate expires 14 Mar 2029" (current) | default, hover, focus, current | canvas |

Every row is buildable with the API below.

## Anatomy

1. **List** — `ul` or `ol` with the family's class (`.list`, `.list.device-list`,
   `.admin-list`, `.edit-list`, `.breach-list`), list reset, and (except
   `.list`) a top rule. Labelled by `aria-label` or `aria-labelledby`.
2. **Row** — one `li` per item:
   - `li.list__item`: flex, `--space-3` / `--space-4` padding, bottom rule
     (none on the last); in `.device-list` no inline padding and a
     `--control-height-lg` minimum height. A whole-row link is
     `li > a.list__item.list__item--interactive`.
   - `li.admin-row`: wrapping flex, `--space-4` / `--space-2` padding,
     bottom rule.
   - `li.edit-row`: grid, one column below 36rem and body + actions from 36rem,
     `--space-4` block padding, bottom rule.
   - `li.breach`: column, `--space-8` block padding, bottom rule.
3. **Leading visual (settings, optional)** — `span.avatar[aria-hidden="true"]`
   with initials, `--target-comfortable` square ([avatar](avatar.md)).
4. **Body** — `.list__body`, `.admin-row__body` (flex basis `--space-32`),
   `.edit-row__body`, `.breach__head`.
5. **Title** — `.list__title` (`--text-label` at `--font-size-md`),
   `.admin-row__title` (`--text-body-lg`, medium, may hold a
   [badge](badge.md)), the dish name in an edit row, `.breach__title`
   (`--text-h4`, a heading element).
6. **Meta** — `.list__meta`, `.admin-row__meta` (`--text-body-sm`,
   `--color-fg-muted`), `.breach__when`.
7. **Trailing item / actions** — device rows: one `sm` [button](button.md) or
   a [status](status.md) label; settings: `.admin-row__actions` with ghost `sm`
   buttons; editable: `.edit-row__actions` with four `.icon-btn`
   ([icon button](icon-button.md)); link rows: a chevron `svg.icon`.
8. **Key-value list (breach)** — `dl.kv` from
   [description list](description-list.md).
9. **Skeleton rows (loading)** — the family's skeleton (`.admin-row--skeleton`,
   `.edit-row--skeleton`, plain `.list__item` / `.breach` with skeleton bars),
   each `aria-hidden="true"`.
10. **Status line** — `p.visually-hidden[role="status"]` after the list, for
    the loading label and reorder announcements.

Host: `sh-list` is `display: block` and renders the `ul`/`ol` and the status
line as its children. `sh-list-item`, `sh-admin-row`, `sh-edit-row` and
`sh-breach-record` are `display: contents` and render the `li` (with every
class) as their only child, so the list's direct children stay `li` elements.

## API

### `sh-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `family` | `'list' \| 'device' \| 'settings' \| 'editable' \| 'breach'` | `'list'` | no | Picks the list class: `.list`, `.list.device-list`, `.admin-list`, `.edit-list`, `.breach-list`. Rows inside must be of the matching row component. |
| `ordered` | `boolean` | `true` for `editable`, otherwise `false` | no | `true` renders `ol` (order is the content), `false` renders `ul`. |
| `label` | `string \| null` | `null` | yes unless `labelledBy` | Rendered as `aria-label`; says what and in what order ("Cuisines, A to Z", "Dishes, in the order they appear on your page"). |
| `labelledBy` | `string \| null` | `null` | yes unless `label` | Rendered as `aria-labelledby`, for a list under its own heading ("Signed-in devices"). |
| `busy` | `boolean` | `false` | no | Renders `aria-busy="true"` on the list, `skeletonCount` skeleton rows of the family in place of the projected rows, and `busyLabel` in the status line. |
| `busyLabel` | `string` | — | yes when `busy` | "Loading cuisines". While busy it also replaces `label` as the list's `aria-label`. |
| `skeletonCount` | `number` | `3` | no | Skeleton rows while busy (device 3, cuisines 10, operators 2, menu 8, breaches 2). Whole number from 1 to 20. |
| `skeletonAvatar` | `boolean` | `false` | no | Settings skeletons start with a `.avatar.skeleton.skeleton--circle` (operators). |
| `skeletonAction` | `boolean` | `true` for `settings`, otherwise `false` | no | Settings skeletons end with a `.skeleton--rect` action block. |
| `announcement` | `string \| null` | `null` | no | Text for the status line when not busy ("Doubles moved to position 4 of 12"). Changing it announces it once, politely. |

### `sh-list-item` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | `.list__title` ("Safari on iPhone"). Text, never HTML. |
| `meta` | `string \| null` | `null` | no | `.list__meta` ("Last active today, 8:15 a.m."). Omitted when `null`. |
| `href` | `string \| null` | `null` | no | A URL renders `li > a.list__item.list__item--interactive` with a trailing chevron; `null` renders `li.list__item`. Not allowed with a trailing slot. |
| `current` | `boolean` | `false` | no | With `href`, renders `aria-current="true"` (the open item). Ignored without `href` (D-4). |

### `sh-admin-row` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | `.admin-row__title` ("Barbadian (Bajan)", "Tomas Reyes"). Wraps anywhere; never truncated. |
| `meta` | `string \| null` | `null` | no | `.admin-row__meta`. |
| `initials` | `string \| null` | `null` | no | Renders a leading `span.avatar[aria-hidden="true"]` with these initials ("TR"). People only. |

### `sh-edit-row` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | The dish name, used only inside the action labels ("Move Chicken pelau up"). The visible name comes through the body slot. |
| `first` | `boolean` | `false` | no | Marks "Move up" `aria-disabled="true"`: it stays focusable and pressing it does nothing (D-5). Never native `disabled`. |
| `last` | `boolean` | `false` | no | Marks "Move down" `aria-disabled="true"`, as `first` does. |
| `readOnly` | `boolean` | `false` | no | Renders no `.edit-row__actions` at all (pending review, suspended). |
| `moveUpLabel`, `moveDownLabel`, `editLabel`, `removeLabel` | `string` | — | yes unless `readOnly` | The full accessible names, already interpolated by the consumer: "Move Chicken pelau up", "Move Chicken pelau down", "Edit Chicken pelau", "Remove Chicken pelau". |

### `sh-breach-record` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | `.breach__title` ("Team laptop stolen from a car"). |
| `headingLevel` | `2 \| 3 \| 4` | `2` | no | Renders the title as `h2`/`h3`/`h4` so the register can be navigated by headings at the page's level. |
| `when` | `string` | — | yes | `.breach__when` ("Confirmed Tue 11 Mar 2025 · recorded by Leah Mohammed"). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `sh-edit-row` `movedUp` | `void` | "Move up" is activated and not `aria-disabled`. Never emitted on the first row. |
| `sh-edit-row` `movedDown` | `void` | "Move down" is activated and not `aria-disabled`. Never emitted on the last row. |
| `sh-edit-row` `editRequested` | `void` | "Edit" is activated; the page opens the dish dialog. |
| `sh-edit-row` `removeRequested` | `void` | "Remove" is activated; the page opens the remove-dish dialog. |
| Others | — | None: device, settings and link rows hold [buttons](button.md) or a link with their own outputs; breach records are read-only. |

### Methods

| Method | Rule |
|---|---|
| `sh-list.focusItem(index: number)` | Focuses the first enabled control of the row at `index` (the link itself for link rows), or the list's labelling heading when `index` is past the end. The page calls it after a confirmed removal (D-6). |
| `sh-edit-row.focusMove(direction: 'up' \| 'down')` | Focuses that move button, even when it is `aria-disabled`. Used after a move when the row element was re-created (D-5). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-list`: default | Row components of the list's family | Rendered inside the `ul`/`ol`; hidden while `busy`. |
| `sh-list-item`: `[slot=end]` | One `sh-button size="sm"` with an `ariaLabel` naming the row, or one [status](status.md) label | After `.list__body`. Not allowed with `href`. |
| `sh-admin-row`: `[slot=badge]` | One [badge](badge.md) ("You", "New") | Inside the title, after the text. |
| `sh-admin-row`: `[slot=actions]` | One or two `sh-button variant="ghost" size="sm" haspopup="dialog"` with `ariaLabel` naming the row | Rendered in `.admin-row__actions`; the element is omitted when the slot is empty (your own operator row). |
| `sh-edit-row`: default | The dish content: `.dish__top` (name, price), optional `.dish__desc`, optional `ul.tags` | Rendered in `.edit-row__body`. |
| `sh-breach-record`: default | One `dl.kv` ([description list](description-list.md)) | After `.breach__head`. |

- Translation: `label`, `busyLabel`, `announcement`, every action label and
  the badge text come from the resource files through the consumer (L2-064).
  Titles, meta lines and dish content are data or the consumer's formatted
  copy.

## Variants and sizes

| Variant | List class | Row class | Use for |
|---|---|---|---|
| List | `.list` | `.list__item` | Generic compact rows; no top rule; last row has no rule. |
| Link list | `.list` | `a.list__item.list__item--interactive` | Navigation where the whole row goes somewhere (kit). |
| Device list | `.list.device-list` | `.list__item` | Signed-in sessions on the account page. |
| Settings | `.admin-list` | `.admin-row` | Cuisines, operators. |
| Editable | `.edit-list` | `.edit-row` | The menu manager. |
| Breach | `.breach-list` | `.breach` | The breach register. |

Each family has one size, set by its padding:

| Row | Padding (block / inline) | Minimum height | Title type |
|---|---|---|---|
| `.list__item` | `--space-3` / `--space-4` | content | `--text-label` at `--font-size-md` |
| `.device-list .list__item` | `--space-3` / 0 | `--control-height-lg` (52 px) | as list |
| `.admin-row` | `--space-4` / `--space-2` | content; `--target-comfortable` avatar | `--text-body-lg`, medium |
| `.edit-row` | `--space-4` / 0 | content; 44 px icon buttons | `.dish__name` |
| `.breach` | `--space-8` / 0 | content | `--text-h4` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Flat rows, hairline rules | "list, Cuisines, A to Z, 19 items" |
| Control hover / focus | the row's buttons | The [button](button.md) and [icon button](icon-button.md) states; the row itself does not change | Control announced with its row name |
| Link row hover | `:hover` on `.list__item--interactive` (title and meta on two lines, D-10) | Fill `--color-bg-subtle` over `--duration-fast` | — |
| Link row focus | `:focus-visible` | Shared `--color-focus-ring` ring | "Food safety, Certificate expires 14 Mar 2029, link" |
| Current | `aria-current="true"` on the link | Fill `--color-accent-subtle` | "current" |
| Current device | [status](status.md) "Current" instead of a button | Status dot and word | "Current" read as text |
| New / you | [badge](badge.md) in the title | Badge after the title | Badge text read with the title |
| Own operator row | no `[slot=actions]` | No actions column | Nothing to tab to |
| First / last dish | `first` / `last` | "Move up" / "Move down" dimmed (`aria-disabled="true"`) | Still focusable, announced "dimmed" / "unavailable"; pressing does nothing |
| Read-only | `readOnly` | No actions; the body only | Row is text only |
| Loading | `busy` | Family skeletons shimmering in the final layout | List `aria-busy="true"`, label = `busyLabel`, skeleton rows `aria-hidden`, status line says `busyLabel` |
| Moved | `announcement` changes | Row in its new position; nothing animates | Status line says "Doubles moved to position 4 of 12" |
| Long title | wider than the body | Wraps (`overflow-wrap: anywhere`), never truncates | Full title |
| Empty, error | — | Never rendered by the list: the page shows an [empty state](empty-state.md) | — |
| Selected (listbox) | — | Not a list-row state here: listbox selection belongs to [combobox](combobox.md) (D-4) | — |

`data-state="hover|selected|focus"` exists in `components.css` for
documentation and mocks only; the component never renders it.

## Markup

```html
<!-- rendered: device list -->
<ul class="list device-list" aria-labelledby="devices-title">
  <li class="list__item"><div class="list__body"><div class="list__title">Chrome on Windows</div><div class="list__meta">This device · active now</div></div><span class="status status--published">Current</span></li>
  <li class="list__item"><div class="list__body"><div class="list__title">Safari on iPhone</div><div class="list__meta">Last active today, 8:15 a.m.</div></div><button class="btn btn--sm" type="button" aria-haspopup="dialog" aria-label="Sign out Safari on iPhone">Sign out</button></li>
</ul>
```

```html
<!-- rendered: settings rows (cuisines; operators with an avatar and badge) -->
<ul class="admin-list" aria-label="Cuisines, A to Z">
  <li class="admin-row"><span class="admin-row__body"><span class="admin-row__title">Belizean</span><span class="admin-row__meta">1 published caterer</span></span><span class="admin-row__actions"><button class="btn btn--sm btn--ghost" type="button" aria-haspopup="dialog" aria-label="Retire Belizean">Retire</button></span></li>
  <li class="admin-row"><span class="admin-row__body"><span class="admin-row__title">Caymanian <span class="badge badge--info">New</span></span><span class="admin-row__meta">Added today by Leah Mohammed · no caterers yet</span></span><span class="admin-row__actions">…</span></li>
</ul>
<ul class="admin-list" aria-label="Operators">
  <li class="admin-row"><span class="avatar" aria-hidden="true">LM</span><span class="admin-row__body"><span class="admin-row__title">Leah Mohammed <span class="badge">You</span></span><span class="admin-row__meta">Admin · Authenticator app · Active now</span></span></li>
  <li class="admin-row"><span class="avatar" aria-hidden="true">TR</span><span class="admin-row__body"><span class="admin-row__title">Tomas Reyes</span><span class="admin-row__meta">Operator · Security key · Last active today, 8:15 a.m.</span></span><span class="admin-row__actions"><button class="btn btn--sm btn--ghost" type="button" aria-haspopup="dialog" aria-label="Deactivate Tomas Reyes">Deactivate</button></span></li>
</ul>
```

```html
<!-- rendered: editable rows (first row) and a read-only row -->
<ol class="edit-list" aria-label="Dishes, in the order they appear on your page">
  <li class="edit-row"><div class="edit-row__body"><div class="dish__top"><span class="dish__name">Chicken pelau</span><span class="dish__price">From $16 per person</span></div><p class="dish__desc">Browned in burnt sugar, cooked down with pigeon peas, rice and coconut milk.</p><ul class="tags"><li class="tag">Gluten-free</li><li class="tag">Dairy-free</li></ul></div>
    <div class="edit-row__actions"><button class="icon-btn" type="button" aria-label="Move Chicken pelau up" aria-disabled="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button><button class="icon-btn" type="button" aria-label="Move Chicken pelau down">…</button><button class="icon-btn" type="button" aria-label="Edit Chicken pelau" aria-haspopup="dialog">…</button><button class="icon-btn" type="button" aria-label="Remove Chicken pelau" aria-haspopup="dialog">…</button></div></li>
  <li class="edit-row"><div class="edit-row__body"><div class="dish__top"><span class="dish__name">Curry goat</span><span class="dish__price">From $19 per person</span></div>…</div></li>
</ol>
<p class="visually-hidden" role="status"></p>
```

```html
<!-- rendered: breach record -->
<ul class="breach-list" aria-label="Recorded breaches, newest first">
  <li class="breach"><div class="breach__head"><h2 class="breach__title">Enquiry email sent to the wrong caterer</h2><p class="breach__when">Confirmed Thu 17 Sep 2026 · recorded by Leah Mohammed</p></div>
    <dl class="kv"><dt>Information involved</dt><dd>A customer's display name and event details (date, guests, area). No email or phone.</dd><dt>People affected</dt><dd>1</dd><dt>Risk assessment</dt><dd>Low. …</dd><dt>Notification decision</dt><dd>Not reported to the Privacy Commissioner: …</dd></dl></li>
</ul>
```

```html
<!-- rendered: link list with the current item (kit) -->
<ul class="list" aria-label="Profile sections">
  <li><a class="list__item list__item--interactive" href="/dashboard/profile/details"><span class="list__body"><span class="list__title">Business details</span><span class="list__meta">Name, description, contact</span></span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></a></li>
  <li><a class="list__item list__item--interactive" href="/dashboard/profile/certificate" aria-current="true">…Food safety…</a></li>
</ul>
```

```html
<!-- rendered: loading (settings with avatar and action blocks; menu) -->
<ul class="admin-list" aria-busy="true" aria-label="Loading operators">
  <li class="admin-row admin-row--skeleton" aria-hidden="true"><span class="avatar skeleton skeleton--circle"></span><span class="admin-row__body"><span class="skeleton skeleton--title"></span><span class="skeleton skeleton--text"></span></span><span class="admin-row__actions"><span class="skeleton skeleton--rect"></span></span></li>
</ul>
<p class="visually-hidden" role="status">Loading operators</p>

<ol class="edit-list" aria-busy="true" aria-label="Loading your menu">
  <li class="edit-row edit-row--skeleton" aria-hidden="true"><div class="edit-row__body"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div></li> … (8)
</ol>
```

Device and breach skeletons use plain `li.list__item` (two bars, 10rem and
8rem) and `li.breach` (title bar 60 %, text bar 35 %, a `--space-32` tall
rect), each `aria-hidden="true"`. Skeleton widths come from the family's CSS,
not inline styles (D-8).

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: cuisines -->
<sh-list family="settings" [label]="t('cuisines.listLabel')" [busy]="loading()" [busyLabel]="t('cuisines.loading')" [skeletonCount]="10">
  @for (c of cuisines(); track c.id) {
    <sh-admin-row [title]="c.name" [meta]="t('cuisines.count', { count: c.published })">
      @if (c.isNew) { <sh-badge slot="badge" tone="info">{{ t('badge.new') }}</sh-badge> }
      <sh-button slot="actions" variant="ghost" size="sm" haspopup="dialog" [ariaLabel]="t('cuisines.retireNamed', { name: c.name })" (activated)="retire(c)">{{ t('cuisines.retire') }}</sh-button>
    </sh-admin-row>
  }
</sh-list>

<!-- consumer: menu manager -->
<sh-list family="editable" [label]="t('menu.listLabel')" [busy]="loading()" [busyLabel]="t('menu.loading')" [skeletonCount]="8" [announcement]="moved()">
  @for (d of dishes(); track d.id; let i = $index, f = $first, l = $last) {
    <sh-edit-row [name]="d.name" [first]="f" [last]="l" [readOnly]="paused()"
        [moveUpLabel]="t('menu.moveUp', { name: d.name })" [moveDownLabel]="t('menu.moveDown', { name: d.name })"
        [editLabel]="t('menu.edit', { name: d.name })" [removeLabel]="t('menu.remove', { name: d.name })"
        (movedUp)="move(d, -1)" (movedDown)="move(d, 1)" (editRequested)="edit(d)" (removeRequested)="remove(d)">
      <sh-dish-summary [dish]="d"></sh-dish-summary>
    </sh-edit-row>
  }
</sh-list>
```

The e2e page objects locate rows by the family classes (`.list__item`,
`.admin-row`, `.edit-row`, `.breach`), their `__title` and `__meta`, the
list's accessible name, `aria-busy`, `--skeleton` rows and the action buttons'
accessible names; those are part of the contract. Icon path data is free to
change.

## Design

- Rules: `--border-width-hairline` in `--color-border-default`, under every
  row; `.device-list`, `.admin-list`, `.edit-list` and `.breach-list` add one
  on top; `.list` drops the last row's.
- Spacing: as in *Variants and sizes*; gaps `--space-3` (list), `--space-3` /
  `--space-4` (settings), `--space-2` / `--space-6` (editable), `--space-4`
  (breach). Settings meta sits `--space-0-5` under the title; actions
  `--space-2` apart and pushed to the end (`margin-left: auto`).
- Type: titles `--text-label` at `--font-size-md`, `--text-body-lg` medium,
  `--text-h4`; meta `--text-body-sm` in `--color-fg-muted`.
- Avatar and icon buttons: `--target-comfortable` (44 px) at every width.
- Small buttons: `--control-height-sm` from 48rem, `--target-comfortable`
  below.
- Motion: link-row fill over `--duration-fast` with `--ease-standard`;
  reordering does not animate; skeleton shimmer over `--duration-loop`.
- Elevation and layer: none. Rows have no background; they sit on whatever
  surface holds them (the canvas on pages, `--color-bg-surface-raised` in a
  dialog).

Component tokens: none.

| Token | Aliases | Overridden by |
|---|---|---|
| None | — | Surfaces never re-skin rows. |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rules | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Title | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Meta, `.breach__when` | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Link-row hover | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Current link row | `--color-accent-subtle` | `--palette-pepper-50` | `--palette-pepper-950` |
| "Current" status word | `--color-success-fg` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Page behind | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Skeleton | `--color-bg-subtle` → `--color-bg-subtle-hover` | `--palette-stone-100` → `--palette-stone-200` | `--palette-stone-800` → `--palette-stone-700` |

Badges, status labels, avatars, buttons and tags bring their own tokens.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Titles |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Meta lines, breach date line |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Title on a hovered link row |
| `--color-fg-default` | `--color-accent-subtle` | 4.5:1 | Title on the current row |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | "Current" |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Forced colours: rules become `CanvasText`; the current link row's tint may
disappear, which is acceptable because `aria-current` and the page heading
say the same. `prefers-contrast: more` darkens rules and meta through the
tokens.

## Responsive behaviour

- XS (below 36rem): editable rows stack, dish details then the four icon
  buttons on their own line; settings rows wrap their actions under the body
  when the title and meta need the width (body basis `--space-32`); breach
  key-value pairs stack.
- SM and up (36rem+): editable rows become two columns, details and actions
  side by side; breach pairs sit in a 12rem label column.
- Below 48rem small text buttons ("Sign out", "Retire", "Deactivate") are
  44 px tall; icon buttons are 44 px at every width. Below 48rem the four
  edit-row icon buttons sit `--space-2` (8 px) apart, and settings actions
  keep their `--space-2` gap, so neighbouring targets are always at least
  8 px apart (L2-065.1, the user's decision of 10 Oct 2026, D-11). Link rows are at least 44 px tall and,
  below 48rem, `--space-2` apart (D-11).
- Long titles wrap; nothing truncates ("Dominican (Dominican Republic)").
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom every row
  and action stays available.

## Accessibility

### Role and pattern

Native lists: `ul`, or `ol` when order is the content (dishes). No ARIA list
roles are added. An interactive row is a real link; actions are real
buttons. This is not a listbox ([APG
Listbox](https://www.w3.org/WAI/ARIA/apg/patterns/listbox/) belongs to the
[combobox](combobox.md)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Through each row's controls in order (editable: up, down, edit, remove; then the next row). `aria-disabled` move buttons stay in the order. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activates the focused control. |
| <kbd>Enter</kbd> | On a link row, follows it. |

### Focus

- Moving a dish keeps focus on the same button in the row's new position
  (rows are tracked by id, so the element is kept). When the move takes the row
  to the top or bottom, that button becomes `aria-disabled="true"` and keeps
  focus; pressing it again does nothing (D-5).
- After a removal is confirmed in its dialog, focus goes to the next row's
  first enabled control, or to the list's heading if the removed row was the
  last (`focusItem`, D-6).
- No row traps or moves focus otherwise.

### Labelling

- Each list is named, with what and in what order: "Cuisines, A to Z",
  "Operators", "Dishes, in the order they appear on your page", "Recorded
  breaches, newest first"; the device list is labelled by its heading
  "Signed-in devices".
- Every row action names its row and starts with the visible word (WCAG
  2.5.3): "Sign out Safari on iPhone", "Retire Belizean", "Deactivate Tomas
  Reyes", "Move Chicken pelau up". Icon buttons have only that name.
- Avatars are `aria-hidden` beside the name.
- Breach titles are headings so the register can be navigated by headings.

### Announcements

The status line (`role="status"`, polite) says `busyLabel` while loading and
each new `announcement` after a move ("Doubles moved to position 4 of 12").
Nothing else announces.

### Motion

Link rows fill over `--duration-fast`, which reduced motion sets to 0.01 ms.
Reordering never animates. Skeleton shimmer stops under reduced motion.

## Content and internationalisation

- Titles are the thing's own name: "Safari on iPhone", "Barbadian (Bajan)",
  "Tomas Reyes", "Chicken pelau". Cuisines use the L2-007 names; dishes are
  spelled as the caterer spells them.
- Meta lines join two or three facts with middle dots, most useful first:
  "Operator · Security key · Last active today, 8:15 a.m.".
- Counts use the noun: "1 published caterer", "No published caterers", never
  "0 published caterers".
- Row actions are one verb: "Sign out", "Retire", "Deactivate"; the dialog
  they open names the consequence. Badges are one word: "You", "New".
- Times follow the shared format: "today, 8:15 a.m.", "Mon 28 Sep",
  "yesterday, 9:03 p.m.".
- Translatable inputs: list `label`, `busyLabel`, `announcement`, action
  labels, badge text. Data: device names, cuisine and operator names, counts
  (formatted by the consumer), dish content, breach text.
- Longer French labels ("Se déconnecter") wrap the settings actions under the
  body rather than squeezing the title.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the list element and class,
  the skeleton row list, whether actions render) are computed once, not in
  the template.
- Rows are tracked by id, so a reorder moves DOM nodes rather than
  re-creating them (this is also what keeps focus).
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ListRows.ts`
  renders Pelau House's 18-dish editable list ("Chicken pelau" … "Paw paw
  chow") plus the 19-row cuisines list; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `MenuManagerFull` (Maracas Bay's 50 dishes),
  `AdminCuisines`, `AccountDevices`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: skeleton rows have their family's padding and rule, so the
  first real rows land where the skeletons were.
- Weight: composes [avatar](avatar.md), [skeleton](skeleton.md),
  [icon button](icon-button.md); badges, buttons, status labels, dish content
  and `.kv` come through slots. No drag-and-drop library (reordering is by
  buttons).

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia Thompson signed in on Chrome on Windows and also on Safari on iPhone and Samsung Internet on Android, when the account page's "Signed-in devices" renders, then `ul.list.device-list` holds three `li.list__item` rows "Chrome on Windows" / "This device · active now" with the status "Current", "Safari on iPhone" / "Last active today, 8:15 a.m." with "Sign out", and "Samsung Internet on Android" / "Last active Mon 28 Sep" with "Sign out". (L2-078)
- **AC-2** Given the two "Sign out" buttons in Marcia's device list, when a screen-reader user lists the page's buttons, then they read "Sign out Safari on iPhone" and "Sign out Samsung Internet on Android", each with `aria-haspopup="dialog"`. (L2-068)
- **AC-3** Given the 18 initial cuisines plus "Caymanian" added today by Leah Mohammed, when the cuisines page renders, then `ul.admin-list` named "Cuisines, A to Z" holds 19 `li.admin-row` in alphabetical order, "Caymanian" carries the badge "New" and the meta "Added today by Leah Mohammed · no caterers yet", and "Belizean" reads "1 published caterer". (L2-007)
- **AC-4** Given the cuisine "Bahamian" with no published caterers, when its row renders, then the meta reads "No published caterers" and its ghost `sm` action is named "Retire Bahamian". (L2-007)
- **AC-5** Given Leah Mohammed, an Admin, views the operators page, when it renders, then her own row shows the avatar "LM" (`aria-hidden`), the badge "You" and no `.admin-row__actions`, and Tomas Reyes's row shows "Deactivate" named "Deactivate Tomas Reyes". (L2-056)
- **AC-6** Given Pelau House's 18 dishes, when the menu manager renders, then `ol.edit-list` named "Dishes, in the order they appear on your page" holds 18 `li.edit-row` in page order, "Move Chicken pelau up" has `aria-disabled="true"` on the first row and "Move Paw paw chow down" has it on the last; neither has native `disabled`. (L2-043)
- **AC-7** Given the dish "Doubles" in position 5 of 12, when Kendra activates "Move Doubles up", then `movedUp` is emitted once, the row renders in position 4 after the page reorders, focus is still on "Move Doubles up", and the status line says "Doubles moved to position 4 of 12". (L2-043)
- **AC-8** Given Maracas Bay's menu with 50 of 50 dishes, when it renders, then all 50 rows keep their four actions and the page's "Add dish" is disabled with "You can list up to 50 dishes. Remove one to add another." (L2-043)
- **AC-9** Given Auntie Bev's Kitchen's menu while her profile is pending review, when the rows render with `readOnly`, then no row has `.edit-row__actions` and the 4 dishes show only their name, price, description and tags. (L2-044)
- **AC-10** Given the breach register, when it renders, then `ul.breach-list` named "Recorded breaches, newest first" holds "Enquiry email sent to the wrong caterer" before "Team laptop stolen from a car", each title an `h2`, each with a date line and a `dl.kv` holding "Information involved", "People affected", "Risk assessment" and "Notification decision". (L2-075)

### States

- **AC-11** Given the operators page is loading, when the list renders with `busy`, `busyLabel` "Loading operators", `skeletonCount` 2, `skeletonAvatar` and `skeletonAction`, then the list has `aria-busy="true"` and `aria-label="Loading operators"`, holds two `li.admin-row.admin-row--skeleton[aria-hidden="true"]` each with a circle, a title bar, a text bar and an action block, and the status line reads "Loading operators". (L2-066)
- **AC-12** Given the menu manager is loading, when the list renders with `busy`, then the `ol.edit-list` holds 8 `li.edit-row.edit-row--skeleton[aria-hidden="true"]`, has `aria-busy="true"` and a name, and the status line says "Loading your menu". (L2-066)
- **AC-13** Given "Paw paw chow" is in position 2 of 18, when Kendra activates "Move Paw paw chow up", then after the reorder the row is first, its "Move up" has `aria-disabled="true"` and still has focus, and pressing Enter again emits nothing and changes no order. (L2-067)
- **AC-14** Given Kendra confirms removing "Sweet bread" (row 14 of 18) in the remove-dish dialog, when the dialog closes and the row is gone, then focus is on "Move Sorrel up", the first enabled control of the row that took its place. (L2-067)

### Keyboard and focus

- **AC-15** Given the menu manager at 1280 px, when a keyboard user tabs through the first two rows, then focus visits "Move Chicken pelau up" (announced as dimmed), "Move Chicken pelau down", "Edit Chicken pelau", "Remove Chicken pelau", then "Move Curry goat up", in that order. (L2-067)
- **AC-16** Given keyboard focus on "Retire Grenadian" or on a link row, when it is displayed in either theme, then a `--color-focus-ring` ring is visible with at least 3:1 contrast against the page. (L2-067)

### Screen readers

- **AC-17** Given the account, cuisines, operators, menu (default, read-only, loading) and breach pages, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from any list. (L2-066)
- **AC-18** Given the icon buttons in Chicken pelau's row, when they are inspected, then each `svg.icon` is `aria-hidden="true"` and the buttons are named "Move Chicken pelau up", "Move Chicken pelau down", "Edit Chicken pelau" and "Remove Chicken pelau". (L2-068)

### Theming

- **AC-19** Given the light and the dark theme, when the cuisines list renders, then titles and the meta "4 published caterers" have at least 4.5:1 contrast against the page, and the rules use `--color-border-default` (`--palette-stone-750` in dark). (L2-069)
- **AC-20** Given the "Food safety" link row is current, when it renders in either theme, then it has `aria-current="true"`, a `--color-accent-subtle` fill and a title contrast of at least 4.5:1. (L2-069)

### Responsive

- **AC-21** Given a 360 px viewport, when Pelau House's menu manager renders, then each edit row shows the dish details and, under them, the four 44 × 44 CSS px icon buttons in one line, at least 8 px apart, with no horizontal scrolling. (L2-045)
- **AC-22** Given a 360 px viewport, when the device list and the cuisines list render, then "Sign out" and "Retire" are at least 44 × 44 CSS px with at least 8 px to the next target. (L2-065)
- **AC-23** Given a 320 px viewport, when the cuisines list renders "Dominican (Dominican Republic)" and the breach register renders, then titles wrap, nothing is truncated or clipped, the breach key-value pairs stack, and the page does not scroll horizontally. (L2-064)
- **AC-24** Given a 1280 px window at 200 % zoom, when the menu manager renders, then every row's details and four actions are visible and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-25** Given `prefers-reduced-motion: reduce`, when a dish is moved and when a list is loading, then the row changes position with no animation and the skeleton rows do not shimmer. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/list/`; files
  `list.component.*` (`sh-list`, `ListComponent`), `list-item.component.*`
  (`sh-list-item`), `admin-row.component.*` (`sh-admin-row`),
  `edit-row.component.*` (`sh-edit-row`) and `breach-record.component.*`
  (`sh-breach-record`).
- Styles: the "List rows" section of `components.css` (`.list`,
  `.device-list`, `.admin-list`, `.admin-row`, `.edit-list`, `.edit-row`,
  `.breach-list`, `.breach`) moves into the component, class names unscoped.
  `.kv` stays with [description list](description-list.md).
- Composes [avatar](avatar.md), [icon button](icon-button.md) (the four
  edit-row buttons, with the arrow up / down, edit and trash icons from the
  mocks' icon set) and [skeleton](skeleton.md). Buttons, badges and status
  labels arrive through slots and keep their own CRDs' APIs.
- Mock catch-up: the menu mocks' native `disabled` on the first "Move up" and last "Move down" becomes `aria-disabled="true"` (D-5).
- Mock catch-up: the account device "Sign out" buttons gain row names;
  `account/loading` and `profile-menu/loading` gain `aria-busy`, a name and
  the status line, and their skeleton rows `aria-hidden`; the cuisines and
  operators skeleton `li`s gain `aria-hidden`; "Deactivate" becomes ghost like
  every settings action (design system drift notes, D-7).
- Design-system catch-up for D-8: skeleton widths that the mocks set inline
  (`width: 10rem`, `height: var(--space-32)`) move into family rules
  (`.device-list .skeleton--text`, `.breach .skeleton--rect`).
- Design-system catch-up for D-11: `@media (max-width: 47.99rem) { .edit-row__actions { gap: var(--space-2); } .list > li + li > .list__item--interactive { margin-top: var(--space-2); } }`.
- Design-system catch-up for D-10: link-row title and meta display as blocks.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component or four?* One library folder and one `sh-list` container with a row component per family. The design system documents the four families on one page and they share rules, loading and labelling; separate row components keep each family's API small and stop a settings row from being given dish content.
- **D-3** *Who renders the loading status line?* `sh-list`, after the list, from `busyLabel`. The cuisines, operators and breach mocks do this; the device list and menu mocks lacked it and the design system fixed that drift.
- **D-4** *Does the list support `aria-selected` rows?* No. The design system says `aria-selected` is valid only in a listbox, which is the [combobox](combobox.md)'s; list rows support only `aria-current` on a link row.
- **D-5** *Native `disabled` or `aria-disabled` for the first "Move up" and last "Move down"?* `aria-disabled="true"`, and the button keeps focus; pressing it does nothing. With native `disabled`, a dish moved to the top or bottom would drop focus to the page; the dish design-system page, [photo tile](photo-tile.md) and [gallery](gallery.md) use the same rule, so every reorder control in the product behaves alike. The mocks' native `disabled` is drift.
- **D-6** *Where does focus go after a removal?* To the next row's first enabled control, or the list heading when the last row went, as the design system says; the page calls `focusItem` when the remove dialog closes because the dialog's own return-focus target no longer exists.
- **D-7** *Ghost or secondary for "Deactivate"?* Ghost, as every settings row action. The operators mock drew it outlined; the design system recorded this as drift and chose ghost. Device "Sign out" stays secondary `sm`, as the design system renders it.
- **D-8** *Inline skeleton widths in the mocks?* Replaced by family CSS rules so the component sets no inline styles; the widths stay the same.
- **D-9** *Is the device list's top rule part of the family?* Yes: `.device-list` adds the top rule and drops the inline padding, exactly as `components.css` does; generic `.list` has neither.
- **D-10** *How do title and meta stack inside a link row?* As two lines. A link row's body holds `span` elements (phrasing content inside the `a`), which today's CSS leaves inline, so "Business details" and "Name, description, contact" run together on the design-system page. `components.css` adds `.list__body > .list__title, .list__body > .list__meta { display: block; }`; the rendering shows the required look with a specimen-only style.
- **D-11** *How far apart are adjacent targets on phones?* At least 8 px, as L2-065.1 asks and the user's decision of 10 Oct 2026 settles (it wins over the design system's 4 px and its "no gap between icon buttons is acceptable"). Below 48rem `.edit-row__actions` uses a `--space-2` gap, and stacked full-row links in a `.list` are separated by `--space-2`; settings actions already have it. `components.css` adds both rules (design-system catch-up); the rendering shows them with a specimen-only style.
