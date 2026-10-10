# Site header

| Field | Value |
|---|---|
| Selector | `sh-site-header` (renders `<header class="site-header">`) |
| Library path | `frontend/projects/components/src/lib/site-header/` |
| Status | planned |
| Traces to | L2-013, L2-029, L2-046, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`site-header.html`](../../design-system/components/site-header.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/profile-menu/default`](../../mocks/pages/profile-menu/default.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/two-factor/default`](../../mocks/pages/two-factor/default.html), [`pages/sign-in/expired`](../../mocks/pages/sign-in/expired.html), [`dialogs/site-menu/signed-in`](../../mocks/dialogs/site-menu/signed-in.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html) |
| Rendering | [`site-header.html`](site-header.html) |

## Purpose and scope

The site header is the first thing on every Sweet Hand page and the least
loud: the bold "Sweet Hand" wordmark that links home, a quiet text-only
primary nav, and a few 44 px icons. It follows the reference design — canvas
background, no border, no shadow, never sticky — and changes with who is
signed in: a visitor sees "Caterers · Occasions · Sign in" and search; Marcia
sees her "Inbox" with its unread count and her account menu; Kendra sees
"Sweet Hand for caterers" with "Dashboard · Enquiries · My page"; an operator
sees "Sweet Hand Operator" with "Queue · Caterers · Metrics". Below 48rem the
text links fold into the site menu sheet behind a Menu button, and the inbox
stays one tap away as an envelope icon with the count.

Use something else for section navigation inside a work area ([side
nav](side-nav.md)), for tabs within a page ([tabs](tabs.md)), and for the
footer links ([footer](footer.md)). The phone site menu is a [sheet](sheet.md)
and the account popup is a [menu](menu.md); the header only holds their
triggers.

Out of scope:

- The content and behaviour of the site menu sheet (`dialogs/site-menu/*`),
  the search dialog (`dialogs/search`) and the account menu
  (`dialogs/account-menu/*`), including focus trapping and returning focus:
  [sheet](sheet.md), [dialog](dialog.md) and [menu](menu.md) own them. The
  header renders the triggers, reports activation and reflects `aria-expanded`.
- Fetching the unread count and refreshing it every 60 seconds (L2-029.3): the
  app shell polls and passes the count in.
- Which links an audience gets and where they point: the app shell builds them
  from the session and the router; the header renders what it is given.
- Page-level actions ("Send an enquiry", filters): never in the header.
- The legacy `.topbar` from the base kit: unused and not built (D-9).

## Usage

Inventory from a parse of every `<header class="site-header">` in
`docs/mocks/` (37 distinct configurations, grouped below) and
`usage_inventory.py docs/mocks site-nav__link "a"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Public pages (`caterers/*`, `caterer/*`, `occasions/*`, `about`, `privacy`, `terms`, `not-found`, `forbidden`, `server-error`, `offline`, `maintenance`, `rate-limited`, `register*`, `forgot-password`, `reset-password`, `verify-email`, `sign-in/default`) signed out | visitor; links Caterers, Occasions, Sign in; search; Menu | "Sweet Hand"; current "Caterers", "Occasions" or "Sign in" (none on system pages) | default, current, hover, focus | canvas |
| `pages/caterers/signed-in`, `caterer/*`, `account`, `inbox/*`, `thread/*`, `notifications/site-banner/*`, `notifications/toast/*` | customer; links Caterers, Occasions, Inbox (+ count); search; inbox icon; Menu; avatar "MT" | "Inbox" + badge "1" ("1 unread enquiry"); icon "Inbox, 1 unread" or "Inbox" with no unread; avatar "Account menu for Marcia Thompson" (also Jean-Robert Pierre "JP") | count 1, count 0, current Inbox (link and icon), account menu open | canvas |
| `pages/dashboard/*`, `dashboard-enquiries/*`, `dashboard-enquiry/*`, `dashboard-reviews/*`, `profile-*/*`, `notifications/dashboard-toast/*`, `notifications/profile-banner/*` | caterer; tag "for caterers"; links Dashboard, Enquiries (+ count), My page; enquiries icon; Menu (added, D-5); avatar | Kendra Baptiste "KB" with "2 unread enquiries"; Beverley Campbell "BC", Sharon Best "SB", Desmond Greaves "DG", Paulette Morgan "PM", Vishnu Ramlogan "VR", Winston Daley "WD" | count 2, 1, 0; current Dashboard or Enquiries; no "My page" for a profile that is not published (D-6) | canvas |
| `pages/admin-*/*`, `notifications/admin-toast/*`, operator dialogs | operator; tag "Operator"; links Queue (+ waiting count), Caterers, Metrics; Menu; avatar; no search | Leah Mohammed "LM", Tomas Reyes "TR"; "7 items waiting", "6 items waiting", "34 items waiting" | current Queue, Caterers or Metrics; none on audit and operators pages | canvas |
| `pages/two-factor/*`, `pages/privacy-update/*`, `pages/sign-in/expired` | minimal: wordmark only, no nav | "Sweet Hand" | default | canvas |
| `dialogs/account-menu/default`, `caterer` | customer, caterer or operator with the account menu open | avatar `aria-expanded="true"` | expanded | canvas behind the popup |
| `dialogs/site-menu/*`, `dialogs/search/*` | any audience with the Menu or search dialog open | Menu or search `aria-expanded="true"` | expanded (inert behind the sheet) | canvas behind the sheet |

Not product markup, and not built by this component:

- `<header class="site-header">` copies built of `<span>`s (`span.wordmark`,
  `span.site-nav`, `span.avatar`) in 70 dialog mocks are the mock's static
  picture of the page behind the dialog. The product renders the real header
  there, made inert by the dialog.
- `pages/caterers/signed-in` puts the unread count on the Menu button ("Menu,
  1 unread enquiry"); the design system moved it to the envelope icon (D-5).

## Anatomy

1. **Banner** — `header.site-header`: a flex row, container width
   (`--layout-container-max`), side padding `--layout-margin`, height at least
   `--layout-topbar-height`, top padding `env(safe-area-inset-top)`, canvas
   background, no border, no shadow, not sticky.
2. **Wordmark** — `a.wordmark`: "Sweet Hand" in `--text-wordmark`, a link to
   the audience's home; 44 px tall. Never current.
3. **Area tag (optional)** — `span.wordmark__tag` inside the wordmark: "for
   caterers" or "Operator", a hairline pill in `--text-label`. Part of the
   wordmark's accessible name. Hidden below 24rem (D-7).
4. **Primary nav** — `nav.site-nav[aria-label="Primary"]`, pushed to the end
   (`margin-left: auto`). Absent in the minimal header.
5. **Nav link** — `a.site-nav__link.site-nav__extra`: muted text, 44 px tall,
   pill-shaped focus ring; current page in ink, semibold, `aria-current="page"`.
   Shown from 48rem.
6. **Unread badge (optional)** — `span.badge.badge--count` from
   [badge](badge.md) inside a link: the number, `aria-hidden="true"`, followed
   by visually hidden text that says what is counted (", 2 unread").
7. **Search (optional)** — `button.icon-btn` from [icon
   button](icon-button.md), magnifier icon, "Search by area or postal code",
   opens the search dialog. Shown at every width for visitors and customers.
8. **Inbox shortcut (optional)** — `a.icon-btn.site-nav__menu`, envelope icon,
   with a visual count badge that is `aria-hidden="true"`. Shown below 48rem
   only.
9. **Menu** — `button.icon-btn.site-nav__menu`, menu icon, "Menu", opens the
   site menu sheet. Shown below 48rem only.
10. **Account trigger (optional)** — `button.avatar.site-nav__extra` from
    [avatar](avatar.md), the person's initials, 44 px, opens the account menu.
    Shown from 48rem; below it, account and sign out are in the menu sheet.

Host: `sh-site-header` is layout-transparent (`display: contents`) and renders
`<header class="site-header">` in the light DOM, so `.page > header` layout and
the print rule (`.site-header { display: none }`) apply unchanged.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `brandName` | `string` | — | yes | The wordmark text, "Sweet Hand", from the resource files. |
| `homeHref` | `string` | — | yes | The wordmark's `href`: `/caterers` for visitors and customers, `/dashboard` for caterers, `/admin/queue` for operators. |
| `tag` | `string \| null` | `null` | no | Renders `span.wordmark__tag` inside the wordmark: "for caterers" or "Operator". |
| `minimal` | `boolean` | `false` | no | Renders only the wordmark: no `nav`, no icons. For mid-authentication pages (two-factor, privacy update, expired session) (D-4). Every input below is ignored. |
| `links` | `SiteNavLink[]` | `[]` | no | The text links, in order, each rendered as `a.site-nav__link.site-nav__extra`. At most four. |
| `inboxShortcut` | `SiteNavShortcut \| null` | `null` | no | The phone-only envelope link (`a.icon-btn.site-nav__menu`). Customers ("Inbox") and caterers ("Enquiries"). |
| `searchLabel` | `string \| null` | `null` | no | When set, renders the search button with this `aria-label` ("Search by area or postal code"). Visitors and customers only. |
| `searchOpen` | `boolean` | `false` | no | Rendered as `aria-expanded` on the search button. |
| `menuLabel` | `string` | — | yes unless `minimal` | The Menu button's `aria-label`, "Menu". The Menu button is always rendered (below 48rem) when not minimal. |
| `menuOpen` | `boolean` | `false` | no | Rendered as `aria-expanded` on the Menu button. |
| `account` | `SiteHeaderAccount \| null` | `null` | no | Renders the avatar button. `null` for visitors. |
| `accountOpen` | `boolean` | `false` | no | Rendered as `aria-expanded` on the avatar button. |

```ts
interface SiteNavLink {
  label: string;          // "Inbox", from the resource files
  href: string;           // "/inbox"
  current?: boolean;      // renders aria-current="page"; at most one link is current
  count?: number;         // unread or waiting count; 0 or absent renders no badge
  countLabel?: string;    // hidden text after the badge: "2 unread", "1 unread enquiry", "7 items waiting"; required when count > 0 (D-15)
}
interface SiteNavShortcut {
  label: string;          // "Inbox" or "Enquiries"
  href: string;
  current?: boolean;
  count?: number;
  countLabel?: string;    // the short count for the icon's name: "1 unread", "2 unread" (D-3)
}
interface SiteHeaderAccount {
  initials: string;       // "MT"
  label: string;          // "Account menu for Marcia Thompson"
}
```

- Boolean inputs accept the bare attribute (`<sh-site-header minimal>`).
- The badge shows the count, or "99+" when the count is above 99 (design
  system, Content); `countLabel` always carries the exact number.
- Every attribute whose value is `null` or `false` is absent from the DOM,
  except `aria-expanded`, which always renders `"true"` or `"false"` on the
  three popup triggers.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `menuRequested` | `void` | The Menu button is activated (click, tap, Enter, Space). The consumer opens the site menu sheet and sets `menuOpen`. |
| `searchRequested` | `void` | The search button is activated. The consumer opens the search dialog and sets `searchOpen`. |
| `accountRequested` | `void` | The avatar button is activated. The consumer opens or closes the account menu and sets `accountOpen`. |

### Methods

| Method | Rule |
|---|---|
| `focusTrigger(which: 'menu' \| 'search' \| 'account')` | Focuses that trigger. The sheet, dialog or menu calls it when it closes, to return focus (L2-067.4). |

### Content slots

None. Everything the header shows is data; a slot would let pages add
page-level actions the design system forbids (D-8).

- Translation: `brandName`, `tag`, every `label`, `countLabel`, `searchLabel`,
  `menuLabel` and the account `label` arrive from the consumer, who takes them
  from the resource files (L2-064.4). The component contains no user-facing
  strings; "99+" is a number format, not copy.

## Variants and sizes

The variants are configurations of the same inputs, by audience:

| Variant | Inputs | Wide (from 48rem) | Phone (below 48rem) |
|---|---|---|---|
| Visitor | no tag; links Caterers, Occasions, Sign in; `searchLabel`; no account | wordmark · Caterers · Occasions · Sign in · search | wordmark · search · Menu |
| Customer | no tag; links Caterers, Occasions, Inbox (+ count); `searchLabel`; `inboxShortcut` "Inbox"; account | wordmark · Caterers · Occasions · Inbox 1 · search · avatar | wordmark · search · envelope 1 · Menu |
| Caterer | tag "for caterers"; links Dashboard, Enquiries (+ count), My page (published only); `inboxShortcut` "Enquiries"; account | wordmark + tag · Dashboard · Enquiries 2 · My page · avatar | wordmark + tag · envelope 2 · Menu |
| Operator | tag "Operator"; links Queue (+ waiting count), Caterers, Metrics; account; no search, no shortcut | wordmark + tag · Queue 7 · Caterers · Metrics · avatar | wordmark + tag · Menu |
| Minimal | `minimal` | wordmark only | wordmark only |

"Sign in" is always a quiet `.site-nav__link`, never a button (L2-013). No
variant has more than three icons beside the wordmark on a phone.

One size, which grows with the viewport through `--layout-topbar-height`:
64 px below 48rem, 80 px from 48rem, 96 px from 62rem. Every item stays
`--target-comfortable` (44 px) high at every width.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Links `--color-fg-muted`; wordmark `--color-fg-default` | Banner landmark; navigation "Primary" |
| Link hover | `:hover` | Link turns `--color-fg-default` over `--duration-fast` | — |
| Icon / avatar hover | `:hover` | Icon button fill `--color-bg-subtle`, icon stays `--color-fg-default` (the inbox shortcut too, D-13); avatar fill `--color-bg-subtle-hover`; the wordmark does not change | — |
| Focus | `:focus-visible` | Shared ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) following the pill or circle | Focused item announced |
| Current page | `current` → `aria-current="page"` | Link in `--color-fg-default`, `--font-weight-semibold`; inbox icon in `--color-fg-accent` (D-10) | "current page" |
| Unread count | `count > 0` | Ink-on-red `.badge--count` with the number, "99+" above 99 | Badge `aria-hidden`; link name includes the hidden text: "Inbox, 1 unread enquiry", "Enquiries, 2 unread"; icon name "Inbox, 1 unread" (D-3, D-15) |
| No unread | `count` 0 or absent | No badge at all | Link name "Inbox"; icon name "Inbox" |
| Popup open | `menuOpen` / `searchOpen` / `accountOpen` → `aria-expanded="true"` | Icon button or avatar keeps the `--color-bg-subtle` fill | "expanded"; focus is inside the popup |
| Behind a dialog | a sheet or dialog is open | Unchanged | Inert with the rest of the page |
| Minimal | `minimal` | Wordmark only | Banner with one link; no navigation landmark |
| Print | `@media print` | `display: none` | — |

`data-state="hover|focus"` exists in `components.css` only for documentation
and mocks. The component never renders it.

## Markup

```html
<!-- rendered: visitor on the listing -->
<header class="site-header">
  <a class="wordmark" href="/caterers">Sweet Hand</a>
  <nav class="site-nav" aria-label="Primary">
    <a class="site-nav__link site-nav__extra" href="/caterers" aria-current="page">Caterers</a>
    <a class="site-nav__link site-nav__extra" href="/occasions">Occasions</a>
    <a class="site-nav__link site-nav__extra" href="/sign-in">Sign in</a>
    <button class="icon-btn" type="button" aria-label="Search by area or postal code" aria-haspopup="dialog" aria-expanded="false"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
    <button class="icon-btn site-nav__menu" type="button" aria-label="Menu" aria-haspopup="dialog" aria-expanded="false"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  </nav>
</header>
```

```html
<!-- rendered: customer (Marcia) on her inbox, 1 unread -->
<header class="site-header">
  <a class="wordmark" href="/caterers">Sweet Hand</a>
  <nav class="site-nav" aria-label="Primary">
    <a class="site-nav__link site-nav__extra" href="/caterers">Caterers</a>
    <a class="site-nav__link site-nav__extra" href="/occasions">Occasions</a>
    <a class="site-nav__link site-nav__extra" href="/inbox" aria-current="page">Inbox <span class="badge badge--count" aria-hidden="true">1</span><span class="visually-hidden">, 1 unread enquiry</span></a>
    <button class="icon-btn" type="button" aria-label="Search by area or postal code" aria-haspopup="dialog" aria-expanded="false"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
    <a class="icon-btn site-nav__menu" href="/inbox" aria-label="Inbox, 1 unread" aria-current="page"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="badge badge--count" aria-hidden="true">1</span></a>
    <button class="icon-btn site-nav__menu" type="button" aria-label="Menu" aria-haspopup="dialog" aria-expanded="false"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
    <button class="avatar site-nav__extra" type="button" aria-label="Account menu for Marcia Thompson" aria-haspopup="menu" aria-expanded="false">MT</button>
  </nav>
</header>
```

```html
<!-- rendered: caterer (Kendra), tag, 2 unread, account menu open -->
<header class="site-header">
  <a class="wordmark" href="/dashboard">Sweet Hand <span class="wordmark__tag">for caterers</span></a>
  <nav class="site-nav" aria-label="Primary">
    <a class="site-nav__link site-nav__extra" href="/dashboard" aria-current="page">Dashboard</a>
    <a class="site-nav__link site-nav__extra" href="/dashboard/enquiries">Enquiries <span class="badge badge--count" aria-hidden="true">2</span><span class="visually-hidden">, 2 unread</span></a>
    <a class="site-nav__link site-nav__extra" href="/caterers/pelau-house">My page</a>
    <a class="icon-btn site-nav__menu" href="/dashboard/enquiries" aria-label="Enquiries, 2 unread"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg><span class="badge badge--count" aria-hidden="true">2</span></a>
    <button class="icon-btn site-nav__menu" type="button" aria-label="Menu" aria-haspopup="dialog" aria-expanded="false"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
    <button class="avatar site-nav__extra" type="button" aria-label="Account menu for Kendra Baptiste" aria-haspopup="menu" aria-expanded="true">KB</button>
  </nav>
</header>
```

The operator header differs only in its tag ("Operator"), links (Queue with
`<span class="badge badge--count" aria-hidden="true">7</span><span class="visually-hidden">, 7 items waiting</span>`,
Caterers, Metrics) and the absence of search and the inbox shortcut.

```html
<!-- rendered: minimal (two-factor, privacy update, expired session) -->
<header class="site-header">
  <a class="wordmark" href="/caterers">Sweet Hand</a>
</header>
```

Consumer template (binding syntax illustrative; labels come from the resource
files, links from the session):

```html
<!-- consumer: app shell -->
<sh-site-header
  [brandName]="t('brand')" [homeHref]="home()" [tag]="areaTag()"
  [links]="navLinks()" [inboxShortcut]="inboxShortcut()"
  [searchLabel]="canSearch() ? t('header.search') : null" [searchOpen]="searchOpen()"
  [menuLabel]="t('header.menu')" [menuOpen]="menuOpen()"
  [account]="account()" [accountOpen]="accountOpen()"
  (menuRequested)="openSiteMenu()" (searchRequested)="openSearch()" (accountRequested)="toggleAccountMenu()">
</sh-site-header>

<!-- consumer: two-factor page -->
<sh-site-header minimal [brandName]="t('brand')" homeHref="/caterers"></sh-site-header>
```

The e2e page objects locate the header by `header.site-header`, links by role
and name inside `nav[aria-label="Primary"]`, and the triggers by their names,
so these classes, the `aria-*` attributes and the visibility classes
`.site-nav__extra` and `.site-nav__menu` are part of the contract. The icons'
path data is free to change.

## Design

- Height at least `--layout-topbar-height` (4, 5, 6 rem by breakpoint); side
  padding `--layout-margin`; maximum width `--layout-container-max`, centred;
  top padding `env(safe-area-inset-top)`.
- Gaps: `--space-2` between wordmark and nav; `--space-1` between nav items
  from 48rem and `--space-2` below it (D-2).
- Wordmark `--text-wordmark`, `--letter-spacing-tight`, no wrap, 44 px
  (`--target-comfortable`) high, `--space-2` before the tag.
- Tag `--text-label` in `--color-fg-muted`, `--space-2` inline padding,
  `--border-width-hairline` in `--color-border-default`, `--radius-full`.
- Nav link `--text-nav`, `--space-3` inline padding, 44 px high,
  `--radius-full` (the focus ring follows the pill), `--space-2` before a
  badge; current `--font-weight-semibold`.
- Icon buttons and avatar 44 × 44 (`--target-comfortable`), circles; icons
  `--icon-size-md`. A badge on an icon sits at the top-right corner,
  `--icon-size-md` minimum.
- Elevation none, border none, background `--color-bg-canvas`; layer none (not
  sticky, no `z-index`).
- Motion: link colour and icon fill transition over `--duration-fast` with
  `--ease-standard`.

No component tokens; it reads semantic tokens directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Background | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Wordmark, current link, hovered link, icons | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Nav link, tag text | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Tag edge | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Avatar and icon hover / expanded fill | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Avatar hover | `--color-bg-subtle-hover` | `--palette-stone-200` | `--palette-stone-700` |
| Current inbox icon | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Count badge fill / number | `--color-danger-solid` / `--color-fg-on-danger` | `--palette-sorrel-600` / `--palette-white` | `--palette-sorrel-300` / `--palette-sorrel-950` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Wordmark, current link, icons |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Nav links, tag text |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Avatar initials, icon on hover fill |
| `--color-fg-on-danger` | `--color-danger-solid` | 4.5:1 | Count number |
| `--color-fg-accent` | `--color-bg-canvas` | 3:1 | Current inbox icon (a graphic) |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |
| `--color-focus-ring` | `--color-bg-subtle` | 3:1 | Focus ring on a hovered icon button |

The current link is not marked by colour alone: it also changes weight and
carries `aria-current` (L2-069.5).

Forced colours: links and icons take system colours; the badge keeps its
number; the focus ring becomes the system highlight. No header-specific rule
is needed.

## Responsive behaviour

| Width | What changes |
|---|---|
| Below 24rem (384 px) | The area tag hides; the wordmark alone links home (D-7). |
| Below 48rem (XS, SM) | Every `.site-nav__extra` item (text links, avatar) hides; every `.site-nav__menu` item (inbox shortcut, Menu) shows; search stays for visitors and customers. Nav gap `--space-2`. Height 64 px. |
| From 48rem (MD) | Text links and avatar show; phone-only items hide. Height 80 px. |
| From 62rem (LG, XL) | Height 96 px. Inside work areas the [side nav](side-nav.md) appears below the header. |

- At 320 px the widest phone row (customer: wordmark, search, envelope, Menu)
  is 308 px including the left margin, so nothing scrolls horizontally or
  clips, and the caterer and operator rows drop their tag.
- At 200 % zoom at a 1280 px window (a 640 CSS px viewport) the header shows
  the phone layout, and every destination stays reachable through the Menu.
- Every item is 44 × 44 CSS px or larger, with at least 8 px between
  neighbouring targets below 48rem (L2-065.1).
- Labels never truncate; the nav never wraps onto a second line from 48rem
  (at most four short links).

## Accessibility

### Role and pattern

`<header>` (banner landmark, as a direct child of `.page`, not inside `main`)
containing `<nav aria-label="Primary">`. The Menu and search buttons are
disclosure-style triggers
([APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/)) with
`aria-haspopup="dialog"` and `aria-expanded`; each opens a dialog that takes
focus. The avatar is a menu button
([APG Menu Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/))
with `aria-haspopup="menu"` and `aria-expanded`; it opens the account
[menu](menu.md) (`role="menu"`), the user's decision of 10 Oct 2026 (D-14).
The minimal header has no `nav`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | After the [skip link](skip-link.md): wordmark, each visible nav link, search, inbox shortcut, Menu, avatar, in DOM order. Hidden items are `display: none` and skipped. |
| <kbd>Enter</kbd> | Follows a link; activates search, Menu or the avatar. |
| <kbd>Space</kbd> | Activates search, Menu or the avatar (buttons only). |
| <kbd>Esc</kbd> | Handled by the open popup, which closes and calls `focusTrigger`. |

### Focus

- The shared ring wraps each 44 px item and follows its pill or circle.
- The header is never sticky, so it can never cover a focused element
  (WCAG 2.4.11).
- When the site menu, search or account menu closes, focus returns to the
  trigger that opened it through `focusTrigger` (L2-067.4).

### Labelling

- The nav is "Primary".
- The wordmark's name includes the tag: "Sweet Hand for caterers", "Sweet Hand
  Operator", which tells screen-reader users which area they are in.
- A text link with a badge: the badge is `aria-hidden="true"` and the
  visually hidden text after it (", 2 unread") joins the link's name:
  "Enquiries, 2 unread" (D-15).
- The inbox shortcut's name is its label, a comma, then its short count label:
  "Inbox, 1 unread", "Enquiries, 2 unread"; its visual badge is
  `aria-hidden="true"` (D-3). With no unread it is just "Inbox" or
  "Enquiries".
- The avatar names the action and the person: "Account menu for Marcia
  Thompson".
- Search and Menu are icon-only and named "Search by area or postal code" and
  "Menu" (L2-068.4). Every icon is `aria-hidden="true"`.

### Announcements

None. A count that changes while the page is open (L2-029.3) updates the badge
and the names silently; it is not announced, so a 60-second refresh never
interrupts reading (D-11).

### Motion

Colour and fill transitions use `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms. The sheet's slide belongs to
[sheet](sheet.md).

## Content and internationalisation

- One-word destinations in sentence case: "Caterers", "Occasions", "Inbox",
  "Dashboard", "Enquiries", "My page", "Queue", "Metrics", "Sign in". The
  product noun is "caterer", never "Cooks" or "Vendors".
- Tags: "for caterers" (lower case, reads on from the wordmark), "Operator" (a
  role, capitalised).
- Counts are numbers only in the badge ("2"); the meaning lives in the hidden
  text or the shortcut's name, pluralised by the resource files: ", 2 unread"
  after "Enquiries", ", 1 unread enquiry" after "Inbox", ", 7 items waiting"
  after "Queue" ([badge](badge.md) D-4). Above 99 the badge shows "99+" while the label keeps the
  number ("134 items waiting").
- No marketing copy, no "Sign up free" button.
- Translatable inputs: `brandName`, `tag`, every link and shortcut `label`,
  every `countLabel`, `searchLabel`, `menuLabel`, the account `label`. Data:
  the account initials and the count. French links run about 30 % longer
  ("Occasions", "Boîte de réception"); from 48rem four links still fit
  beside the wordmark at 768 px, and below 48rem they live in the menu sheet.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the badge text with "99+",
  the shortcut's composed name, which items exist) are computed once per input
  change, not in the template.
- Three click listeners on the trigger buttons; no timers, observers or global
  listeners. Polling for the count belongs to the app shell.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/SiteHeader.ts`
  renders Kendra Baptiste's caterer header ("Sweet Hand for caterers",
  Dashboard current, Enquiries with 2 unread, My page, avatar "KB") and
  updates the count from 2 to 1; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Listing`, `CatererPage`, `Inbox`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the height is fixed by `--layout-topbar-height` whatever
  the content, and the unread count is part of the first server render, so
  nothing below the header moves when it loads or when the count changes.
- Weight: composes [badge](badge.md), [icon button](icon-button.md) and
  [avatar](avatar.md) markup; imports no menu, sheet or icon library. The four
  icons (magnifier, envelope, menu) are inline SVG.

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor on the listing at 1280 px, when the header renders, then it is `<header class="site-header">` with `a.wordmark` "Sweet Hand" linking to `/caterers`, a `nav` named "Primary" holding the links "Caterers" (with `aria-current="page"`), "Occasions" and "Sign in" and the search button "Search by area or postal code", and no avatar. (L2-064)
- **AC-2** Given a visitor on Pelau House's page, when the header renders, then "Sign in" is an `a.site-nav__link` with the same muted style as "Caterers", not a `.btn`, and no sign-in prompt or modal appears in the header. (L2-013)
- **AC-3** Given Marcia Thompson signed in with 1 unread enquiry, when her inbox renders at 1280 px, then the links are "Caterers", "Occasions" and "Inbox" (current), "Inbox" holds `span.badge.badge--count` reading "1" with `aria-hidden="true"` followed by visually hidden text ", 1 unread enquiry" (the link is named "Inbox, 1 unread enquiry"), there is no "Sign in", and the avatar button reads "MT" with the name "Account menu for Marcia Thompson", `aria-haspopup="menu"` and `aria-expanded="false"`. (L2-029)
- **AC-4** Given Kendra Baptiste signed in with 2 unread enquiries, when her dashboard renders at 1280 px, then the wordmark links to `/dashboard` with the name "Sweet Hand for caterers", and "Enquiries" carries an `aria-hidden="true"` badge reading "2" followed by visually hidden text ", 2 unread", so the link's accessible name is "Enquiries, 2 unread". (L2-029)
- **AC-5** Given Beverley Campbell's draft profile Auntie Bev's Kitchen, when her dashboard renders, then the links are "Dashboard" and "Enquiries" only, with no "My page" link to a page the public cannot see. (L2-046)
- **AC-6** Given Leah Mohammed on the operator queue with 7 items waiting, when the header renders at 1280 px, then the wordmark reads "Sweet Hand Operator", the links "Queue" (current, badge "7" named "7 items waiting"), "Caterers" and "Metrics" and the avatar "LM" sit on one row, there is no search button, and nothing overflows. (L2-064)
- **AC-7** Given an operator on the two-factor page who has not completed the second factor, when the minimal header renders, then it contains only the wordmark link and no `nav`, so no Queue, Caterers or Metrics link is offered. (L2-056)
- **AC-8** Given the component source, when it is scanned for user-facing string literals, then none are found; every label, tag and count label arrives as an input. (L2-064)

### States

- **AC-9** Given Kendra has no unread enquiries, when the header renders, then no `.badge--count` exists anywhere in it, and the "Enquiries" link and shortcut are named "Enquiries". (L2-029)
- **AC-10** Given Kendra's header shows 2 unread and she reads one thread, when the shell passes `count` 1 without a page reload, then the badge reads "1", the link's name is "Enquiries, 1 unread", and the header's height does not change. (L2-029)
- **AC-11** Given 134 items are waiting in the operator queue, when the header renders, then the Queue badge shows "99+" and its accessible name is "134 items waiting". (L2-068)
- **AC-12** Given Marcia's inbox at 1280 px, when the header renders, then exactly one link carries `aria-current="page"`, and it differs from the others by `--font-weight-semibold` as well as by colour. (L2-069)

### Keyboard and focus

- **AC-13** Given a visitor on the listing at 1280 px, when they press Tab from the skip link, then focus moves in order to "Sweet Hand", "Caterers", "Occasions", "Sign in" and "Search by area or postal code". (L2-067)
- **AC-14** Given Marcia on the listing at 360 px, when she tabs through the header, then focus reaches "Sweet Hand", "Search by area or postal code", "Inbox, 1 unread" and "Menu" in that order, and never the hidden text links or avatar. (L2-067)
- **AC-15** Given focus on "Menu" at 360 px, when Marcia presses Enter, then `menuRequested` is emitted once; when the shell then sets `menuOpen`, the button reads `aria-expanded="true"`; when the sheet closes with Esc and calls `focusTrigger('menu')`, focus is on "Menu" and it reads `aria-expanded="false"`. (L2-067)
- **AC-16** Given any header item, when it receives keyboard focus in the light or dark theme, then a ring following its pill or circle shape is visible with at least 3:1 contrast against the canvas. (L2-067)

### Screen readers

- **AC-17** Given Kendra at 360 px with 2 unread enquiries, when the enquiries shortcut is inspected, then it is a link named "Enquiries, 2 unread", its icon and its visual badge are `aria-hidden="true"`, and the Menu button is named "Menu". (L2-068)
- **AC-18** Given the visitor, customer, caterer, operator and minimal headers at XS and XL, with and without an open account menu, when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-19** Given the light theme, when the visitor header renders, then the nav links in `--color-fg-muted` and the wordmark in `--color-fg-default` each have at least 4.5:1 contrast against `--color-bg-canvas`, and the count number has at least 4.5:1 against `--color-danger-solid`. (L2-069)
- **AC-20** Given the dark theme, when Kendra's header renders, then the background resolves to `--palette-stone-950`, the wordmark to `--palette-stone-100`, the links keep at least 4.5:1, and no border or shadow appears under the header. (L2-069)

### Responsive

- **AC-21** Given Marcia on the listing at 360 px, when the header renders, then search, the inbox shortcut and Menu are each 44 × 44 CSS px with at least 8 px between neighbouring targets, and the avatar and text links are not displayed. (L2-065)
- **AC-22** Given Kendra's header at 320 px, when it renders, then the "for caterers" tag is hidden, the wordmark, shortcut and Menu fit on one row, and the page does not scroll horizontally. (L2-064)
- **AC-23** Given a 1280 px window at 200 % zoom, when Marcia's header renders, then it shows the phone layout and every destination (Caterers, Occasions, Inbox, account, sign out) is reachable through "Menu" with no horizontal scrolling. (L2-069)

### Motion

- **AC-24** Given `prefers-reduced-motion: reduce`, when a nav link is hovered or an icon button is hovered, then the colour or fill changes without a visible transition. (L2-069)

### Performance

- **AC-25** Given the `SiteHeader` perf-test scenario rendering Kendra's header, when the count changes from 2 to 1, then the layout shift below the header is 0, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/site-header/`; files
  `site-header.component.*` (selector `sh-site-header`, class
  `SiteHeaderComponent`); the `SiteNavLink`, `SiteNavShortcut` and
  `SiteHeaderAccount` types are exported from the folder's public API.
- Composes the markup of [badge](badge.md) (`.badge--count`), [icon
  button](icon-button.md) (`.icon-btn`) and [avatar](avatar.md)
  (`button.avatar`). It renders their classes directly rather than nesting
  their components, because `.site-nav__extra` and `.site-nav__menu` must sit
  on the same element as `.icon-btn` and `.avatar`.
- Styles: the "Site header" section of `components.css` (without `.topbar`)
  moves into the component, class names unscoped.
- Design-system catch-up for D-2: add
  `@media (max-width: 47.99rem) { .site-nav { gap: var(--space-2); } }`.
- Design-system catch-up for D-7: change the tag's breakpoint from
  `max-width: 22.49rem` to `max-width: 23.99rem`.
- L2 catch-up for D-3: L2-029.1 is to be amended (the user's decision of
  10 Oct 2026) so the phone shortcut's name "Enquiries, 2 unread" satisfies it.
- Design-system catch-up for D-13: add `a.icon-btn:not([aria-current="page"]):hover
  { color: var(--color-fg-default); }` to the icon-button rules, so the
  generic `a:hover` link colour does not turn the envelope pepper.
- Mocks catch-up: caterer and operator avatars carry `site-nav__extra`, every
  caterer header has the Menu button, every avatar keeps
  `aria-haspopup="menu"` and adds `aria-expanded`.
- The app shell owns polling for the count (every 60 s, L2-029.3) and the
  three popups; no CDK primitive is needed in the header itself.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How far apart are the header's targets on a phone?* At least 8 px (`--space-2`) below 48rem, the user's decision of 10 Oct 2026: L2-065.1 wins over the design system's 4 px (`--space-1`), and the design system will be updated. The widest row still fits at 320 px (308 px with the left margin). From 48rem the 4 px gap stays; L2-065.1 does not apply there.
- **D-3** *What is the phone inbox shortcut called?* "Inbox, 1 unread" / "Enquiries, 2 unread", with the visual badge `aria-hidden`, as the design system names it: the user's decision of 10 Oct 2026. L2-029.1 (badge named "2 unread enquiries") is to be amended. The text link from 48rem follows [badge](badge.md) D-3 and D-4 (D-15).
- **D-4** *Is the wordmark-only header a variant?* Yes, `minimal`. Eight mocks (two-factor, privacy update, expired session) show only the wordmark: these are mid-authentication steps where offering Queue, Inbox or Dashboard would lead to a page the person cannot open yet (L2-056.2).
- **D-5** *Where does a customer's unread count go on a phone?* On the envelope shortcut, not on the Menu button. One mock (`caterers/signed-in`) put it on Menu; the design system gives customers and caterers the shortcut so the inbox is one tap away, and the caterer header gains the Menu button it lacked so "My page" is reachable below 48rem.
- **D-6** *When does a caterer's header show "My page"?* Only when the profile is Published. The mocks show it for Beverley's draft on some pages and not others; a draft has no public page (L2-046), so the link would lead to "not found". The shell leaves it out of `links`.
- **D-7** *When does the area tag hide?* Below 24rem instead of 22.5rem. With D-2's 8 px gaps, "Sweet Hand for caterers" plus the shortcut and Menu needs 376 px with both margins; between 360 and 383 px the row would otherwise run into the right margin.
- **D-8** *Does the header accept slots?* No. Every configuration in the mocks is data (links, counts, triggers); a slot would let pages put page-level actions in the header, which the design system forbids.
- **D-9** *Is `.topbar` built?* No. No mock uses it, and its border and sticky behaviour contradict the flat reference design; it stays in `components.css` for parity only.
- **D-10** *Is the current inbox shortcut pepper?* Yes. The design-system page says the header uses no pepper for the current page, which holds for text links (ink and weight); an icon cannot change weight, and the shipped `.icon-btn[aria-current="page"]` rule colours it `--color-fg-accent`, which is the system's meaning of "you are here". Kept as the CSS defines it, per the user's decision of 10 Oct 2026; the design-system page text is to be corrected.
- **D-11** *Is a changed unread count announced?* No. L2-029.3 refreshes the count every 60 seconds; announcing it would interrupt whatever the person is reading. The new count is in the link's name the next time they reach it.
- **D-12** *Does search show `aria-expanded`?* Yes, like Menu and the avatar. The design system's do/don't asks for `aria-expanded` on each popup trigger, and the search dialog is a popup like the others.
- **D-13** *Does the inbox shortcut turn pepper on hover?* No. It is an `<a>`, so today the generic `a:hover` rule (`--color-fg-link-hover`) outranks `.icon-btn` and colours the envelope pepper on hover, unlike the search and Menu buttons beside it. Pepper on hover would read as "current"; the shortcut behaves like every other icon button (fill only), and `components.css` catches up.
- **D-14** *What does the avatar open, and how is it announced?* The account menu, `role="menu"`, so the avatar has `aria-haspopup="menu"` and `aria-expanded`: the user's decision of 10 Oct 2026. The design-system page had changed it to `"dialog"`; the mocks' `"menu"` stands, and the design system catches up. Opening moves focus to the first menu item; Esc closes the menu and returns focus through `focusTrigger('account')`.
- **D-15** *How does the wide header's text link name its count?* Aligned with [badge](badge.md) D-3 and D-4: the pill is `aria-hidden="true"` and visually hidden text follows it (", 2 unread" after "Enquiries", ", 1 unread enquiry" after "Inbox", ", 7 items waiting" after "Queue"), so the link is named "Enquiries, 2 unread". The badge owns that markup; the earlier `aria-label="2 unread enquiries"` on the pill was the mocks' drift.
