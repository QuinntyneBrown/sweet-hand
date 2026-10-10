# Menu

| Field | Value |
|---|---|
| Selector | `sh-menu` (dropdown `.menu` in a `.menu-anchor`), `sh-account-menu` (the header's `.menu.account-menu`) |
| Library path | `frontend/projects/components/src/lib/menu/` |
| Status | planned |
| Traces to | L2-045, L2-058, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-078, L2-085 |
| Design system | [`menu.html`](../../design-system/components/menu.html) |
| Source mocks | [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`dialogs/account-menu/caterer`](../../mocks/dialogs/account-menu/caterer.html), [`dialogs/account-menu/operator`](../../mocks/dialogs/account-menu/operator.html), [`dialogs/site-menu/signed-in`](../../mocks/dialogs/site-menu/signed-in.html), [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html), [`pages/caterers/signed-in`](../../mocks/pages/caterers/signed-in.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html) |
| Rendering | [`menu.html`](menu.html) |

## Purpose and scope

A menu is a short list of two to seven actions or destinations that drops
from one trigger. Opening it changes nothing; choosing an item does. The
**account menu** (`sh-account-menu`) drops from the avatar in the site header
and is the one every signed-in person sees: Marcia Thompson gets Inbox,
Account, Sign out; Kendra Baptiste at Pelau House gets Dashboard, Account,
Sign out; operator Leah Mohammed gets Account, Sign out. The **dropdown menu**
(`sh-menu`) is the approved shape for row and toolbar actions on wide screens,
such as an operator's "More actions for Pelau House" or "Sort enquiries"; it
supports section labels, dividers, checkable items, a danger item and
shortcut hints.

Use something else for filters that update results (the [filter
trigger](filter-trigger.md) and its dropdown, a non-modal [popover](popover.md)
with checkboxes), to choose a form value ([select](select.md)), for site
navigation on a phone (the site menu [sheet](sheet.md)), or for one or two
actions that fit ([buttons](button.md)).

Out of scope:

- What an item does: navigating, signing out (L2-078.4), opening the
  "Suspend Pelau House?" confirmation. The consumer acts on `itemActivated`.
- The trigger's own look: an [icon button](icon-button.md), a
  [button](button.md) or the header's [avatar](avatar.md); the menu only wires
  its ARIA state and keys.
- Disabled-item explanations shown next to the menu.
- The phone site menu sheet, which lists the same routes for customers below
  48rem ([sheet](sheet.md)).

## Usage

Inventory from `usage_inventory.py docs/mocks menu "div|ul"`,
`… account-menu "div|ul"` and the avatar triggers (169 pages carry an
"Account menu for …" avatar).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every signed-in customer page from 48rem (`pages/caterers/signed-in`, `inbox`, `thread`, `account` …) | account menu, avatar trigger "Account menu for Marcia Thompson" | "Marcia Thompson" / "marcia.t@example.com"; Inbox, Account, Sign out | closed, open (`dialogs/account-menu/default`), item hover, focus | raised panel over the header |
| Every caterer page, all widths (`dashboard`, profile editor …) | account menu, avatar "Account menu for Kendra Baptiste" | "Kendra Baptiste" / "Pelau House · kendra@pelauhouse.example"; Dashboard, Account, Sign out | closed, open (`caterer`) | raised panel |
| Every operator page, all widths (`admin-*`) | account menu, avatar "Account menu for Leah Mohammed" | "Leah Mohammed" / "Admin · signed in with a security key"; Account, Sign out | closed, open (`operator`) | raised panel |
| Other signed-in mocks | account menu, avatar trigger | "Account menu for Beverley Campbell", "… Tomas Reyes", "… Jean-Robert Pierre" | closed | header |
| `pages/admin-caterer/default` (design-system use case) | dropdown, icon-button trigger "More actions for Pelau House" | label "Pelau House"; "Edit details…", "View public page", "Reinstate caterer" (disabled), divider, "Suspend caterer…", "Remove caterer…" (danger) | closed, open, disabled item, danger hover | raised panel |
| Design system "Sort enquiries" | dropdown, `sm` button trigger "Sort: Latest activity" | label "Sort enquiries"; radio items "Latest activity" (checked), "Event date", "Unread first" | open, checked | raised panel |
| Design system "Queue item actions" | dropdown | label "Queue"; "Approve and publish", "Request changes…"; divider; label "Show"; checkbox items "Name changes" (checked), "Held reviews" | open, checked, unchecked | raised panel |

## Anatomy

1. **Anchor** — `.menu-anchor` (`position: relative; display: inline-block`)
   wraps the trigger and the dropdown panel. The account menu has none: it is
   fixed under the header.
2. **Trigger** — the projected `<button>`; the component sets
   `aria-haspopup="menu"`, `aria-expanded` and `aria-controls` on it.
3. **Panel** — `ul.menu[role="menu"]` (dropdown) or `div.menu.account-menu`
   (account): `--color-bg-surface-raised`, `--border-width-hairline`
   `--color-border-default`, `--radius-md` (`--radius-lg` account),
   `--shadow-3`, `--space-1` padding (`--space-2` account), at least 12rem wide
   (account `min(18rem, 100vw − 2 × --layout-margin)`), `--z-dropdown`.
4. **Identity block (account only)** — `.account-menu__who`: a decorative
   `span.avatar[aria-hidden]` with initials, `p.account-menu__name` (labels
   the menu) and `p.account-menu__email` (second line), then a
   `div.menu__divider`, then `ul.account-menu__list[role="menu"]`.
5. **Section label** — `li.menu__label[role="presentation"]`: overline in
   `--color-fg-subtle`.
6. **Item** — `li[role="none"]` holding `button.menu__item` or
   `a.menu__item` with `role="menuitem"`, `"menuitemcheckbox"` or
   `"menuitemradio"`: optional leading 20 px icon (`aria-hidden`), label,
   optional trailing `<kbd>` shortcut, and for checkable items a tick column
   (pepper ✓ when `aria-checked="true"`).
7. **Divider** — `li.menu__divider[role="separator"]`.
8. **Danger item** — `.menu__item--danger`: `--color-danger-fg`, tinted
   `--color-danger-bg` on hover; always last, after a divider.

Host: `sh-menu` is `display: inline-block` and renders the `.menu-anchor`;
`sh-account-menu` is `display: contents` (the panel is fixed). Item buttons
are rendered by the menu itself, not by `sh-button`.

## API

### `sh-menu` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `ariaLabel` | `string` | — | yes | Rendered as `aria-label` on `role="menu"`: the trigger's name ("More actions for Pelau House", "Sort enquiries"). |
| `items` | `MenuEntry[]` | — | yes | In order; 2 to 7 actionable items. |
| `open` | `boolean` | `false` | no | Controlled open state; the panel exists in the DOM only while open (D-6). |
| `align` | `'start' \| 'end'` | `'start'` | no | Which trigger edge the panel aligns to; it flips up or to the other edge when it would overflow the viewport. |

### `sh-account-menu` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | The signed-in person ("Kendra Baptiste"); rendered in `p.account-menu__name`, which labels the menu via `aria-labelledby`. |
| `secondLine` | `string` | — | yes | The email (customer), "business · email" (caterer) or "role · sign-in method" (operator). Wraps anywhere. |
| `initials` | `string` | — | yes | The decorative avatar's letters ("KB"). |
| `items` | `MenuEntry[]` | — | yes | The routes and Sign out; plain items only. |
| `open` | `boolean` | `false` | no | Controlled open state. |

`MenuEntry` is one of:

- `{ kind: 'item'; id: string; label: string; href?: string; icon?: SVG;
  danger?: boolean; disabled?: boolean; opensDialog?: boolean;
  shortcut?: string }` — `href` renders `a.menu__item` (navigation stays a
  link); otherwise `button.menu__item[type="button"]`. `opensDialog` renders
  `aria-haspopup="dialog"` and the label must end with "…". `shortcut` renders
  `<kbd>` and `aria-keyshortcuts`; only for a shortcut that really exists
  (D-8). `disabled` renders `aria-disabled="true"`.
- `{ kind: 'checkbox'; id: string; label: string; checked: boolean;
  disabled?: boolean }` — `role="menuitemcheckbox"`, `aria-checked`.
- `{ kind: 'radio'; id: string; group: string; label: string;
  checked: boolean; disabled?: boolean }` — `role="menuitemradio"`; one checked
  per group.
- `{ kind: 'label'; text: string }` and `{ kind: 'divider' }`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `openChange` | `boolean` | The trigger is activated (true), or the menu closes by Esc, Tab, an outside click or an item choice (false). |
| `itemActivated` | `{ id: string; event: Event }` | An enabled item is chosen by click, tap, <kbd>Enter</kbd> or <kbd>Space</kbd>. Never for disabled items, labels or dividers. For a link item, navigation follows unless the consumer prevents it. |
| `checkedChange` | `{ id: string; checked: boolean }` | A checkbox item toggles, or a radio item becomes checked (the menu also unchecks its group in the event, the consumer updates `items`). |

### Methods

| Method | Rule |
|---|---|
| `close(returnFocus = true)` | Closes and, by default, focuses the trigger. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=trigger]` | One button: `sh-icon-button`, `sh-button` or the header's avatar `button.avatar` | The menu sets `aria-haspopup="menu"`, `aria-expanded` and `aria-controls` on its native `<button>` and listens for its keys. The trigger supplies its own name ("Account menu for Kendra Baptiste"). |

- Translation: item labels, `ariaLabel`, label texts and the trigger name come
  from the resource files (L2-064.4); `name` and `secondLine` are data.

## Variants and sizes

| Variant | Classes | Use for |
|---|---|---|
| Account menu | `.menu.account-menu` | The avatar's menu in the site header, for every signed-in role. |
| Dropdown | `.menu` in `.menu-anchor` | Row and toolbar actions, sort and show options on wide screens. |
| Checkable | items with `role="menuitemradio"` / `"menuitemcheckbox"` | One sort order ticked; several "Show" options ticked. |
| Danger item | `.menu__item--danger` | A destructive action that opens a confirmation ("Suspend caterer…"). |

| Density | Applies to | Item height | Type |
|---|---|---|---|
| Compact | dropdown `.menu__item` | `--control-height-sm` (36 px) from 48rem; `--target-comfortable` (44 px) below | `--text-body-sm`, item radius `--radius-sm` |
| Comfortable | `.account-menu .menu__item` | `--target-comfortable` at every width | `--text-body`, item radius `--radius-md` |

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Closed | `open` false | Panel absent; trigger `aria-expanded="false"` | "Collapsed", "menu" popup |
| Open | `open` true | Panel scales in from 96 % and fades over `--duration-fast` with `--ease-enter`, from the corner nearest the trigger (top left; top right for the account menu) | Trigger "expanded"; focus on an item |
| Item hover | `:hover` | Fill `--color-bg-subtle` | — |
| Item focus | `:focus-visible` (roving `tabindex="0"`) | Fill `--color-bg-subtle` plus an inset `--focus-ring-width` ring (`box-shadow`) in `--color-focus-ring` | Item name, position ("2 of 3") |
| Item disabled | `aria-disabled="true"` | `--color-fg-disabled`, no fill | Focusable, announced as dimmed |
| Checked | `aria-checked="true"` | Pepper ✓ in the tick column (`--color-fg-accent`, bold) | "Checked" |
| Unchecked | `aria-checked="false"` | Empty tick column reserved | "Not checked" |
| Danger hover | `:hover` on `--danger` | `--color-danger-fg` on `--color-danger-bg` | — |
| Item opens a dialog | `aria-haspopup="dialog"` | Label ends with "…" | "Has popup dialog" |
| Active | `:active` | No separate look: choosing closes the menu at once | — |

There is no busy state: busy belongs to what the item starts (design system,
States). `data-state` values in `components.css` are documentation only.

## Markup

```html
<!-- rendered: sh-account-menu, open (Kendra) -->
<button class="avatar" type="button" aria-label="Account menu for Kendra Baptiste" aria-haspopup="menu" aria-expanded="true" aria-controls="account-menu-list">KB</button>
<div class="menu account-menu">
  <div class="account-menu__who"><span class="avatar" aria-hidden="true">KB</span><div><p class="account-menu__name" id="account-menu-name">Kendra Baptiste</p><p class="account-menu__email">Pelau House · kendra@pelauhouse.example</p></div></div>
  <div class="menu__divider"></div>
  <ul class="account-menu__list" id="account-menu-list" role="menu" aria-labelledby="account-menu-name">
    <li role="none"><a class="menu__item" role="menuitem" href="/dashboard" tabindex="0"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Dashboard</a></li>
    <li role="none"><a class="menu__item" role="menuitem" href="/account" tabindex="-1"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Account</a></li>
    <li role="none"><button class="menu__item" role="menuitem" type="button" tabindex="-1"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Sign out</button></li>
  </ul>
</div>
```

```html
<!-- rendered: sh-menu, open, with label, disabled, divider and danger items -->
<div class="menu-anchor">
  <button class="icon-btn" type="button" aria-label="More actions for Pelau House" aria-haspopup="menu" aria-expanded="true" aria-controls="caterer-actions">…</button>
  <ul class="menu" id="caterer-actions" role="menu" aria-label="More actions for Pelau House">
    <li class="menu__label" role="presentation">Pelau House</li>
    <li role="none"><button class="menu__item" role="menuitem" type="button" aria-haspopup="dialog" tabindex="0">Edit details…</button></li>
    <li role="none"><a class="menu__item" role="menuitem" href="/caterers/pelau-house" tabindex="-1">View public page</a></li>
    <li role="none"><button class="menu__item" role="menuitem" type="button" aria-disabled="true" tabindex="-1">Reinstate caterer</button></li>
    <li class="menu__divider" role="separator"></li>
    <li role="none"><button class="menu__item menu__item--danger" role="menuitem" type="button" aria-haspopup="dialog" tabindex="-1">Suspend caterer…</button></li>
    <li role="none"><button class="menu__item menu__item--danger" role="menuitem" type="button" aria-haspopup="dialog" tabindex="-1">Remove caterer…</button></li>
  </ul>
</div>
```

```html
<!-- rendered: checkable items -->
<ul class="menu" id="sort-menu" role="menu" aria-label="Sort enquiries">
  <li class="menu__label" role="presentation">Sort enquiries</li>
  <li role="none"><button class="menu__item" role="menuitemradio" type="button" aria-checked="true" tabindex="0">Latest activity</button></li>
  <li role="none"><button class="menu__item" role="menuitemradio" type="button" aria-checked="false" tabindex="-1">Event date</button></li>
</ul>
```

```html
<!-- consumer -->
<sh-account-menu [name]="user.name" [secondLine]="user.secondLine" [initials]="user.initials" [items]="accountItems" [(open)]="accountOpen" (itemActivated)="onAccount($event)">
  <button slot="trigger" class="avatar" type="button" [attr.aria-label]="t('header.accountMenu', { name: user.name })">{{ user.initials }}</button>
</sh-account-menu>

<sh-menu [ariaLabel]="t('admin.moreActions', { name: caterer.name })" [items]="catererActions" [(open)]="actionsOpen" (itemActivated)="onAction($event)">
  <sh-icon-button slot="trigger" [ariaLabel]="t('admin.moreActions', { name: caterer.name })"><svg class="icon" …></svg></sh-icon-button>
</sh-menu>
```

Ids are generated per instance; their values are free, their wiring
(`aria-controls`, `aria-labelledby`) is contract. The panel never carries
`role="dialog"` or `aria-modal` (D-2).

## Design

- Panel: background `--color-bg-surface-raised`, border
  `--border-width-hairline` `--color-border-default`, radius `--radius-md`
  (account `--radius-lg`), shadow `--shadow-3`, padding `--space-1` (account
  `--space-2`), min-width 12rem, margin `--space-1` above, `z-index:
  --z-dropdown`.
- Account panel: `position: fixed; top: calc(--layout-topbar-height −
  --space-2); right: --layout-margin`; identity block padding `--space-3`
  `--space-3` `--space-4`, gap `--space-3`; name `--text-label` at
  `--font-size-md`; second line `--text-body-sm` in `--color-fg-muted`,
  `overflow-wrap: anywhere`.
- Item: flex, gap `--space-3`, padding `0 --space-3`, min-height
  `--control-height-sm` (account `--target-comfortable`), `--text-body-sm`
  (account `--text-body`), radius `--radius-sm` (account `--radius-md`).
- Label: `--text-overline`, `--letter-spacing-wide`, uppercase, padding
  `--space-2 --space-3 --space-1`.
- Divider: `--border-width-hairline` `--color-border-default`, margin
  `--space-1` 0.
- Tick column `--icon-size-sm` square; shortcut `<kbd>` at `--font-size-xs`,
  pushed to the end.
- Motion: `scale-in` over `--duration-fast` with `--ease-enter`; closing is
  instant.
- No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Panel | `--color-bg-surface-raised` | `--palette-white` | `--palette-stone-850` |
| Panel border, divider | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Item | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Item hover and focus fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Section label | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Account second line | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Disabled item | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |
| Tick | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Danger item / hover fill | `--color-danger-fg` / `--color-danger-bg` | `--palette-sorrel-600` / `--palette-sorrel-50` | `--palette-sorrel-300` / `--palette-sorrel-950` |
| Inset focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Item |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Item on hover or focus fill |
| `--color-focus-ring` | `--color-bg-subtle` | 3:1 | Inset focus ring on the fill |
| `--color-fg-subtle` | `--color-bg-surface-raised` | 4.5:1 | Section label |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Account second line |
| `--color-danger-fg` | `--color-bg-surface-raised` | 4.5:1 | Danger item |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Danger item on hover |
| `--color-fg-accent` | `--color-bg-surface-raised` | 3:1 | Tick |

Disabled items are exempt. The panel border is decorative (the surface step
and shadow lift the menu); in forced colours it is drawn in `CanvasText`, and
the focused item keeps its ring as `Highlight`.

## Responsive behaviour

- Dropdown menus open below the trigger, aligned to its start edge (or end
  with `align="end"`), and flip up or to the other edge when they would
  overflow; never wider than the viewport less both `--layout-margin`s.
- Below 48rem compact items grow to 44 px; from 48rem they are 36 px. A
  dropdown with more than six items is not used on phones; the page uses a
  [sheet](sheet.md) there (D-9).
- Account menu: fixed under the header (`--layout-topbar-height` 4rem, 5rem
  from 48rem, 6rem from 62rem), `--layout-margin` from the right, `min(18rem,
  100vw − 2 × margin)` wide, so at 320 px it fills the width less 16 px
  margins. Customers below 48rem have no avatar (the site menu sheet lists the
  routes); caterers and operators keep it at every width.
- At 200 % zoom on a 1280 px window the open menu stays fully visible and
  operable.

## Accessibility

### Role and pattern

[APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/): the
trigger is a `<button>` with `aria-haspopup="menu"`, `aria-expanded` and
`aria-controls`; the list is `role="menu"`, labelled by `ariaLabel` or the
account name; each `li` is `role="none"`; items are `menuitem`,
`menuitemcheckbox` or `menuitemradio`; navigation items stay `<a href>`;
roving `tabindex`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> on the trigger | Opens the menu and focuses the first enabled-or-disabled item. <kbd>↑</kbd> opens it on the last item. |
| <kbd>↓</kbd> / <kbd>↑</kbd> | Next / previous item, wrapping at the ends; disabled items are focusable; labels and dividers are skipped. |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last item. |
| A letter | Type-ahead to the next item starting with it ("S" for Sign out). |
| <kbd>Enter</kbd> / <kbd>Space</kbd> on an item | Activates it and closes the menu; a checkbox toggles; a radio checks itself and unchecks the group. Nothing on a disabled item. |
| <kbd>Esc</kbd> | Closes and returns focus to the trigger. |
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Closes the menu and moves on from the trigger. Focus is never trapped. |

### Focus

- Opening moves focus into the menu (no `autofocus`; the component moves it).
- Esc, Tab, an outside click or choosing an item that does not navigate
  returns focus to the trigger; an outside click on another focusable control
  leaves focus there.
- An item that opens a dialog closes the menu; the dialog takes focus and,
  when it closes, returns it to the trigger (L2-067.4).
- The focused item's ring is inset (`box-shadow`), so the panel edge never
  clips it.

### Labelling

- The trigger names the menu and its owner: "Account menu for Marcia
  Thompson", "More actions for Pelau House".
- The account `role="menu"` is labelled by the name paragraph.
- Icons are `aria-hidden`; a trailing "…" pairs with `aria-haspopup="dialog"`;
  shortcuts are visible `<kbd>` plus `aria-keyshortcuts`.

### Announcements

None beyond the roles and states; screen readers announce the menu, item
position and checked state natively.

### Motion

The scale-in uses `--duration-fast`, zeroed by `prefers-reduced-motion:
reduce`, so the menu simply appears; closing is always instant.

## Content and internationalisation

- Items are short verb phrases or destination nouns in sentence case: "Inbox",
  "Account", "Sign out", "Edit details…", "View public page".
- "Sign out", never "Log out".
- "…" marks an item that opens a dialog; destinations and immediate actions
  have none.
- Most common first, destructive last after a divider; two to seven items.
- The second line says what the person needs: email (customer), business and
  email (caterer), role and sign-in method (operator).
- Translatable: item labels, section labels, `ariaLabel`. Data: names,
  emails, business names. French labels run about 30 % longer; items wrap
  rather than truncate, and the panel grows up to its width limit.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (roving index, rendered
  entries) are computed once per input change, not in the template.
- The panel and its document listeners (outside click, Esc) exist only while
  open; nothing listens globally while closed.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Menu.ts`
  opens and closes Kendra's account menu (Dashboard, Account, Sign out) and
  Leah's "More actions for Pelau House" (six entries with a disabled and two
  danger items); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `SiteHeader`, `OperatorCaterer`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the panel is absolutely or fixed positioned and never
  moves page content.
- Weight: the framework's overlay/positioning primitive only (CDK Overlay or
  equivalent); no third-party menu library.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia is signed in on the listing at 1280 px, when she opens the account menu, then the panel shows "Marcia Thompson" and "marcia.t@example.com" above a divider, then a `role="menu"` labelled "Marcia Thompson" with the items Inbox, Account and Sign out in that order, and the panel has no `role="dialog"`. (L2-066)
- **AC-2** Given Kendra is signed in, when her account menu opens, then the `role="menu"` has the accessible name "Kendra Baptiste", the second line reads "Pelau House · kendra@pelauhouse.example" and the items are Dashboard, Account and Sign out; given Leah, then it reads "Admin · signed in with a security key" with Account and Sign out. (L2-068)
- **AC-3** Given the avatar trigger "Account menu for Kendra Baptiste", when the menu is closed and then opened, then it carries `aria-haspopup="menu"` throughout, `aria-expanded="false"` and then `"true"`, and `aria-controls` naming the `role="menu"` list. (L2-066)
- **AC-4** Given Kendra's open account menu, when she activates "Sign out", then `itemActivated` emits `{ id: 'sign-out' }` once and the menu closes. (L2-078)
- **AC-5** Given Leah's "More actions for Pelau House" menu, when it opens, then "Suspend caterer…" and "Remove caterer…" come last, after a `role="separator"`, have class `menu__item--danger` and `aria-haspopup="dialog"`. (L2-058)
- **AC-6** Given that menu, when Leah activates "Suspend caterer…", then the menu closes, `itemActivated` emits "suspend", and when the consumer's confirmation dialog later closes, focus returns to the "More actions for Pelau House" trigger. (L2-067)
- **AC-7** Given "Reinstate caterer" is disabled because Pelau House is published, when Leah arrows onto it and presses Enter, then it is focusable with `aria-disabled="true"`, drawn in `--color-fg-disabled`, and `itemActivated` is not emitted. (L2-067)
- **AC-8** Given the "Sort enquiries" menu with "Latest activity" checked, when Kendra activates "Event date", then `checkedChange` emits `{ id: 'event-date', checked: true }`, and after the consumer updates `items` only "Event date" has `aria-checked="true"` and shows the pepper tick, and axe-core reports 0 violations. (L2-066)

### Keyboard and focus

- **AC-9** Given focus on the avatar trigger, when Kendra presses Enter, then the menu opens with focus on "Dashboard"; ↓ moves to "Account", ↓ to "Sign out", ↓ wraps to "Dashboard", End moves to "Sign out", and "A" moves to "Account". (L2-067)
- **AC-10** Given the open account menu, when Kendra presses Esc, then it closes and focus returns to the avatar; when she reopens it and presses Tab, then it closes and focus moves to the next control after the avatar. (L2-067)
- **AC-11** Given the open menu, when an item has keyboard focus, then it shows the `--color-bg-subtle` fill and an inset `--color-focus-ring` ring with at least 3:1 contrast against the fill, fully visible inside the panel. (L2-067)
- **AC-12** Given the open account menu, when Marcia clicks outside it on the page canvas, then the menu closes, `openChange` emits false, and nothing under the pointer is activated. (L2-067)

### Theming

- **AC-13** Given the dark theme, when the account menu opens, then the panel resolves to `--palette-stone-850` against the `--palette-stone-950` page, item text has at least 4.5:1 contrast on the panel and on the hover fill, and the second line has at least 4.5:1. (L2-069)
- **AC-14** Given the dark theme, when "Suspend caterer…" is hovered, then its `--color-danger-fg` text on `--color-danger-bg` has at least 4.5:1 contrast. (L2-069)

### Responsive

- **AC-15** Given Kendra's dashboard at 320 px, when her account menu opens, then the panel is 288 CSS px wide (the width less two 16 px margins), sits under the header, and the page does not scroll horizontally. (L2-045)
- **AC-16** Given a 360 px viewport, when the account menu or a dropdown opens, then every item is at least 44 CSS px tall. (L2-065)
- **AC-17** Given "More actions for Pelau House" in the last column of a table at 1024 px, when the menu opens, then it flips to align with the trigger's end edge and stays fully inside the viewport. (L2-064)
- **AC-18** Given a 1280 px window at 200 % zoom, when Leah opens her account menu, then Account and Sign out are visible and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-19** Given `prefers-reduced-motion: reduce`, when the menu opens, then it appears without a visible scale or fade, and it always closes instantly. (L2-069)

### Performance

- **AC-20** Given the `Menu` perf-test scenario, when Kendra activates her avatar, then the open menu is painted within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/menu/`; files
  `menu.component.*` (selector `sh-menu`, `MenuComponent`),
  `account-menu.component.*` (selector `sh-account-menu`,
  `AccountMenuComponent`) and a shared `menu-list` part that renders entries,
  roving focus and type-ahead for both.
- Build on the framework's accessible overlay and menu primitives (CDK Menu or
  Overlay with a focus key manager, or the equivalent), per AGENTS.md; do not
  hand-roll positioning or focus management.
- Styles: the `.menu-anchor`, `.menu`, `.menu__*` and `.account-menu*`
  sections of `components.css`, unscoped so e2e locators match the mocks.
- Mock drift to drop: the account-menu mocks wrap the list in `role="dialog"
  aria-modal="false"`, make the name an `<h2>`, use `autofocus` on the first
  item, and the avatar triggers lack `aria-expanded` and `aria-controls`. The
  component renders the menu-page markup above (D-2, D-3).
- Composes [avatar](avatar.md) (identity block) and takes an [icon
  button](icon-button.md), [button](button.md) or avatar as its trigger.
  Composed by [site header](site-header.md) and operator pages.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Is the account menu a menu or a non-modal dialog?* A menu: the trigger says `aria-haspopup="menu"` and the panel is a plain container around a labelled `role="menu"`. The design system contradicts itself here: the menu page says this, while the popover page says `role="dialog"` with `aria-haspopup="dialog"`. The menu page owns the component, 290 of the mocks' avatar triggers already say `menu`, and the panel holds nothing focusable besides menu items, so a dialog wrapper adds a role without a purpose. Raised with the user as a conflict; [popover](popover.md) records the same decision.
- **D-3** *Is the account name a heading?* No, a paragraph that labels the menu; a transient popup should not add to the page's heading outline (design system, Sources).
- **D-4** *Who owns the open state?* The consumer (`open` + `openChange`), so the header can close the menu on navigation; the menu emits every reason to close.
- **D-5** *Do disabled items stay focusable?* Yes, with `aria-disabled`, so people learn the action exists (design system, States).
- **D-6** *Is a closed menu hidden or removed?* Removed from the DOM, so closed menus cost nothing and cannot be reached by a virtual cursor.
- **D-7** *Does choosing a link item close the menu first?* Yes; the menu closes at once, then navigation follows (design system, Active).
- **D-8** *May shortcut hints be shown?* Only for shortcuts that exist; Sweet Hand has none today, so `shortcut` stays unused until one ships.
- **D-9** *What happens to a long dropdown on a phone?* More than six items is a page-level choice for a [sheet](sheet.md) below 48rem; the menu itself only guarantees 44 px items there.
