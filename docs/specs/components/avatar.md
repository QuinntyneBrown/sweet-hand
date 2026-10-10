# Avatar

| Field | Value |
|---|---|
| Selector | `sh-avatar` (a static avatar, or the account-menu trigger with `button`), `sh-avatar-group` (overlapping avatars for several people) |
| Library path | `frontend/projects/components/src/lib/avatar/` |
| Status | planned |
| Traces to | L2-031, L2-047, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072 |
| Design system | [`avatar.html`](../../design-system/components/avatar.html) |
| Source mocks | [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/dashboard-enquiries/loading`](../../mocks/pages/dashboard-enquiries/loading.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/admin-operators/default`](../../mocks/pages/admin-operators/default.html), [`pages/admin-operators/loading`](../../mocks/pages/admin-operators/loading.html), [`pages/account/default`](../../mocks/pages/account/default.html), [`pages/account/loading`](../../mocks/pages/account/loading.html), [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`dialogs/account-menu/caterer`](../../mocks/dialogs/account-menu/caterer.html), [`pages/caterers/signed-in`](../../mocks/pages/caterers/signed-in.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/dashboard-enquiry/default`](../../mocks/pages/dashboard-enquiry/default.html) |
| Rendering | [`avatar.html`](avatar.html) |

## Purpose and scope

Avatars stand for people: a customer in a caterer's enquiry inbox ("PR" for
Priya Ramdial), an operator in the console ("LM" for Leah Mohammed), you in the
header. An avatar is a stone circle with two initials, because Sweet Hand does
not ask customers or operators for a photo. Things that are neither a person
nor a caterer (a report, a held review) get an icon avatar in the operator
queue: a flag or a star. A person who deleted their account gets a person
icon, never initials. The account-menu trigger at the end of every signed-in
header is an avatar button: "Account menu for Kendra Baptiste".

Caterers are never avatars: they are represented by their food in a round
[photo](photo.md) (Marcia's inbox shows each caterer's dish). Use a
[status](status.md) for a state and a [badge](badge.md) for a count, never an
avatar.

Out of scope:

- The rows that hold avatars and size them (`.inbox-row`, `.queue-item`,
  `.admin-row`, `.thread__head`, `.account-menu__who`): [list](list.md),
  [queue item](queue-item.md), [menu](menu.md) and the pages.
- The account menu, its items, focus management and Escape:
  [menu](menu.md) (`sh-account-menu`); its placement in the header:
  [site header](site-header.md).
- Computing initials from a name: the consumer passes them (D-3).

## Usage

Inventory from `usage_inventory.py docs/mocks avatar "span|button|div"`: 253
trigger buttons on 50 screens, 237 static avatars on 22.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every signed-in header: customers (`pages/caterers/signed-in`, `inbox`, `thread` …), caterers (`dashboard`, `profile-*` …), operators (`admin-*`) | trigger button, 44 px, `site-nav__extra` for customers | "MT" / "Account menu for Marcia Thompson"; "KB" Kendra Baptiste; "LM" Leah Mohammed; "BC" Beverley Campbell; "TR" Tomas Reyes … | default, hover, focus, expanded | header |
| `dialogs/account-menu/default`, `caterer` | trigger, `aria-expanded="true"`; static md avatar in `.account-menu__who` | "MT" + "Marcia Thompson"; "KB" | expanded; default | header, raised panel |
| `pages/dashboard-enquiries/*`, `dashboard-reviews` | static, 48 px in `a.inbox-row`, `aria-hidden` | "PR" Priya Ramdial, "AC" Andre Clarke, "NJ" Nadia Joseph, "JP" Jean-Robert Pierre | default, loading | canvas |
| `pages/dashboard-enquiries/default` | static, person icon, 48 px | "Former Sweet Hand user" beside it | deleted person | canvas |
| `pages/dashboard-enquiry/*` thread header | static, 56 px | customer initials beside their name | default | canvas |
| `pages/admin-queue/*` | static icon avatars, 56 px in `a.queue-item` | flag (reports: "Review of Maracas Bay by Devon W."), star (held reviews) | default | canvas |
| `pages/admin-operators/*` | static, 44 px in `li.admin-row` | "LM" Leah Mohammed, "TR" Tomas Reyes … | default, loading | canvas |
| `pages/account/*`, account dialogs (page behind) | static `lg` 56 px | "MT", "KB" beside the name | default, loading | canvas |
| (design system only) | `sm` 32 px; image; group | "NJ"; "LM" + "TR" on report R-2041 | default | any |

Not product markup: `<span class="avatar">` without `aria-hidden` inside
static header pictures in 49 dialog mocks (the page behind the dialog); the
product renders the real header there (as [site header](site-header.md) also
decides).

## Anatomy

1. **Circle** — `.avatar`: `--radius-full`, `--color-bg-subtle`, clips its
   content, `flex: none`, inline grid centring.
2. **Content** — one of: two initials in `--text-label` (scaled per size); a
   20 px outline `svg.icon` (flag, star, person); an `img` filling the circle
   with `object-fit: cover`.
3. **Trigger** — `button.avatar`: the same circle as a native button, 44 px,
   no border, pointer cursor, hover fill.
4. **Group** — `.avatar-group`: avatars overlapping by `--space-2`, each ringed
   `--border-width-thick` in `--color-bg-surface`.
5. **Skeleton** — `.avatar.skeleton.skeleton--circle` with `aria-hidden`.

Host: `sh-avatar` is `display: contents` so row rules such as
`.inbox-row > .avatar` keep sizing the classed element; it renders
`span.avatar` or `button.avatar`. `sh-avatar-group` renders `div.avatar-group`.

## API

### `sh-avatar` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'initials' \| 'icon' \| 'image' \| 'former'` | `'initials'` | no | `former` renders the person icon for a deleted account and ignores `initials` (D-4). |
| `initials` | `string` | — | yes for `initials` | One or two uppercase letters, computed by the consumer ("MT", "JP"). |
| `icon` | `'report' \| 'held-review'` | — | yes for `icon` | Flag or star. |
| `src` | `string \| null` | `null` | yes for `image` | Supported by the CSS, unused today; `img` with `alt=""`. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | no | `sm` adds `.avatar--sm` (32 px), `md` none (40 px), `lg` `.avatar--lg` (56 px). Rows may override the size through their own rules (inbox 48, queue 56, operator rows 44). |
| `button` | `boolean` | `false` | no | Renders `button.avatar type="button"` (44 px) as an account-menu trigger. Requires `label`. |
| `label` | `string \| null` | `null` | yes with `button` | The trigger's `aria-label`: "Account menu for Leah Mohammed". |
| `expanded` | `boolean` | `false` | no | With `button`: `aria-expanded`. `aria-haspopup="menu"` is always rendered on the trigger. |
| `extraClass` | `'site-nav__extra' \| null` | `null` | no | The customer header's class that moves the trigger into the site menu below 48rem. |
| `skeleton` | `boolean` | `false` | no | Renders the loading circle and ignores everything else. |

### `sh-avatar-group` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string \| null` | `null` | no | When set, the group is `role="img"` with this `aria-label` ("Leah Mohammed and Tomas Reyes"); when `null`, names are printed beside it and the group is `aria-hidden`. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `activated` | `void` | The trigger is clicked or activated by Enter, Space or Down Arrow. [Menu](menu.md) opens and sets `expanded`. Static avatars emit nothing. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-avatar`: none | — | Content comes from `kind`, so an avatar cannot hold a status, a count or a caterer's initials. |
| `sh-avatar-group`: default | `sh-avatar` elements (static) | Two to five. |

- Translation: `label` (trigger and group) comes from the resource files with
  the name interpolated (L2-064). Initials are data.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Initials | `span.avatar` "PR" | A person beside their printed name. |
| Icon | `span.avatar` + flag / star | Reports and held reviews in the operator queue. |
| Former user | `span.avatar` + person icon | "Former Sweet Hand user" (L2-072). |
| Image | `span.avatar` + `img` | Reserved; no screen uses it. |
| Trigger | `button.avatar` | The account menu in the header. |
| Group | `div.avatar-group` | Several people on one record (reserved). |

| Size | Class | Diameter | Initials |
|---|---|---|---|
| sm | `.avatar--sm` | `--space-8` (32 px) | `--font-size-xs` |
| md | `.avatar` | `--space-10` (40 px) | `--text-label` |
| lg | `.avatar--lg` | 3.5rem (56 px) | `--font-size-lg` |
| Trigger | `button.avatar` | `--target-comfortable` (44 px) | `--text-label` |

## States

| State | Applies to | Trigger | Visual | Assistive technology |
|---|---|---|---|---|
| Default | all | — | Stone circle, ink content | Static: hidden; trigger: "Account menu for …, menu button, collapsed" |
| Hover | trigger | `:hover` | Fill `--color-bg-subtle-hover` over `--duration-fast` | — |
| Focus | trigger | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out | — |
| Active | trigger | `:active` | Same as hover | — |
| Expanded | trigger | `expanded` | No extra fill; the open menu below is the cue | "expanded" |
| Loading | all | `skeleton` | Skeleton circle of the same size, shimmering | Hidden |
| Former user | static | `kind="former"` | Person icon, no initials | Hidden; the name "Former Sweet Hand user" is printed |
| Disabled | — | — | Never: a trigger is either present or not | — |

## Markup

```html
<!-- rendered: static avatars beside a printed name -->
<span class="avatar" aria-hidden="true">PR</span><span class="inbox-row__name">Priya Ramdial</span>
<span class="avatar avatar--lg" aria-hidden="true">MT</span>
<span class="avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M5 21V4m0 0h11l-2 4 2 4H5"/></svg></span>
<span class="avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/></svg></span>
<span class="avatar" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/></svg></span><span class="inbox-row__name">Former Sweet Hand user</span>
```

```html
<!-- rendered: account trigger, collapsed and expanded -->
<button class="avatar" type="button" aria-label="Account menu for Leah Mohammed" aria-haspopup="menu" aria-expanded="false">LM</button>
<button class="avatar site-nav__extra" type="button" aria-label="Account menu for Marcia Thompson" aria-haspopup="menu" aria-expanded="true">MT</button>
```

```html
<!-- rendered: loading, image, group -->
<span class="avatar skeleton skeleton--circle" aria-hidden="true"></span>
<span class="avatar" aria-hidden="true"><img src="…" alt=""></span>
<div class="avatar-group" role="img" aria-label="Leah Mohammed and Tomas Reyes"><span class="avatar">LM</span><span class="avatar">TR</span></div>
```

Consumer templates (binding syntax illustrative):

```html
<a class="inbox-row" …><sh-avatar [kind]="e.customer ? 'initials' : 'former'" [initials]="e.customer?.initials"></sh-avatar><span class="inbox-row__name">{{ e.customer?.name ?? t('user.former') }}</span>…</a>
<sh-avatar button [label]="t('account.menuFor', { name: me.name })" [initials]="me.initials" [expanded]="menuOpen()" (activated)="toggleMenu()"></sh-avatar>
```

The e2e page objects locate avatars by `.avatar`, `.avatar--lg`, the trigger's
name, `aria-expanded` and `.avatar-group`; those are part of the contract. Icon
path data is free to change.

## Design

- Circle `--radius-full`, fill `--color-bg-subtle`, content
  `--color-fg-default`.
- Sizes `--space-8`, `--space-10`, 3.5rem; trigger `--target-comfortable`.
- Initials `--text-label`, `--font-size-xs` at sm, `--font-size-lg` at lg;
  icons `--icon-size-md` (20 px).
- Group: overlap `--space-2`, ring `--border-width-thick` in
  `--color-bg-surface`.
- Trigger hover fill `--color-bg-subtle-hover` over `--duration-fast` with
  `--ease-standard`; focus ring `--focus-ring-width`, `--focus-ring-offset`.
- Layer: none.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Circle | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Initials, icon | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Trigger hover | `--color-bg-subtle-hover` | `--palette-stone-200` | `--palette-stone-700` |
| Group ring | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Avatars never take a brand or per-person colour: pepper reads as "selected".

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Initials |
| `--color-fg-default` | `--color-bg-subtle-hover` | 4.5:1 | Initials on the hovered trigger |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring in the header |

The stone circle against the canvas is exempt from the 3:1 non-text rule: the
trigger is identified by its initials and position, not its edge. Forced
colours: the circle may disappear; initials stay in system text colour and the
focus ring becomes `Highlight`.

## Responsive behaviour

- Avatars do not change size by breakpoint; rows set the size they need.
- Below 48rem the customer header moves the trigger into the site menu
  (`site-nav__extra`); caterer and operator headers keep it at every width.
- At 320 px the header hides its tag before it would squeeze the avatar; the
  trigger stays 44 × 44 CSS px.
- Initials never wrap or truncate (at most two letters).

## Accessibility

### Role and pattern

Static avatars are decorative: the person's name is printed beside them, so
they are `aria-hidden="true"` (an image inside has `alt=""`). The trigger is a
native `button` following [APG Menu
Button](https://www.w3.org/WAI/ARIA/apg/patterns/menu-button/):
`aria-haspopup="menu"` and `aria-expanded`. A group without names beside it is
`role="img"` with a label naming everyone.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the trigger last in the header. Static avatars are skipped. |
| <kbd>Enter</kbd>, <kbd>Space</kbd>, <kbd>↓</kbd> | Open the account menu; [menu](menu.md) moves focus to its first item. |
| <kbd>Esc</kbd> | Closes the menu; focus returns to the trigger ([menu](menu.md)). |

### Focus

The shared ring wraps the circle, 2 px at a 3 px offset, clear of the stone
fill.

### Labelling

- Trigger: "Account menu for Leah Mohammed". Initials alone are never the
  name.
- Static avatars and their icons are hidden; the printed name speaks.

### Announcements

None.

### Motion

Only the trigger's hover fill transitions (`--duration-fast`); reduced motion
makes it instant. The skeleton shimmer stops under reduced motion.

## Content and internationalisation

- Two uppercase initials from the first and last name as the person entered
  them: Marcia Thompson → MT, Jean-Robert Pierre → JP, Kendra Baptiste → KB;
  one letter for a single name.
- Always print the name next to a static avatar: "Priya Ramdial", "Leah
  Mohammed · Admin".
- Never a caterer's business initials ("PH" for Pelau House).
- The trigger label pattern "Account menu for {name}" is translated as a whole
  ("Menu du compte de {name}").

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (classes, the icon path,
  attributes) are computed once, not in the template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Avatar.ts`
  renders Kendra's header trigger ("KB", "Account menu for Kendra Baptiste")
  and Priya Ramdial's inbox avatar ("PR"); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `SiteHeader`, `CatererInbox` (20 rows), `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the skeleton has the final diameter.
- Weight: inline SVG paths only; no image loading for initials.

## Acceptance criteria

### Rendering

- **AC-1** Given Kendra's enquiry inbox with an enquiry from Priya Ramdial, when the row renders, then it shows `span.avatar` "PR" with `aria-hidden="true"` beside the printed name "Priya Ramdial". (L2-031)
- **AC-2** Given Marcia's inbox with Pelau House, when the row renders, then it shows Pelau House's round photo and no `.avatar` with initials. (L2-031)
- **AC-3** Given a thread whose customer deleted their account, when Kendra's inbox renders that row, then the avatar shows the person icon with no initials and the printed name is "Former Sweet Hand user". (L2-072)
- **AC-4** Given the operator queue with a report on Devon W.'s review of Maracas Bay and a held review, when it renders, then the report row has a flag icon avatar and the held review a star icon avatar, both `aria-hidden="true"`. (L2-047)
- **AC-5** Given the account page for Marcia, when it renders, then `span.avatar.avatar--lg` "MT" is 56 px and hidden from assistive technology. (L2-068)

### Trigger

- **AC-6** Given Leah Mohammed is signed in, when the operator header renders, then the last control is `button.avatar` "LM" named "Account menu for Leah Mohammed" with `aria-haspopup="menu"` and `aria-expanded="false"`. (L2-068)
- **AC-7** Given focus on the trigger, when Leah presses Enter, Space or Down Arrow, then `activated` fires, the menu opens and the trigger has `aria-expanded="true"`; Escape closes it and focus is back on the trigger. (L2-067)
- **AC-8** Given keyboard focus on the trigger in either theme, when it renders, then a `--color-focus-ring` ring surrounds the circle with at least 3:1 contrast against the header. (L2-067)
- **AC-9** Given a 360 px viewport, when Kendra's header renders, then the trigger "KB" measures at least 44 × 44 CSS px with at least 8 px to the neighbouring control. (L2-065)
- **AC-10** Given a 360 px viewport, when Marcia's header renders, then the avatar trigger is not shown in the header and the account is reached from the site menu. (L2-064)

### States

- **AC-11** Given the operator list is loading, when its rows render, then each avatar is a `.avatar.skeleton.skeleton--circle` of the final size with `aria-hidden="true"`. (L2-066)
- **AC-12** Given a group of Leah Mohammed and Tomas Reyes with no names printed, when it renders, then it is `role="img"` named "Leah Mohammed and Tomas Reyes". (L2-068)

### Theming and motion

- **AC-13** Given the light and dark themes, when "MT" renders on the circle and on the hovered trigger, then the initials have at least 4.5:1 contrast against `--color-bg-subtle` and `--color-bg-subtle-hover`. (L2-069)
- **AC-14** Given `prefers-reduced-motion: reduce`, when Leah hovers the trigger, then the fill changes with no transition. (L2-069)
- **AC-15** Given a 1280 px window at 200 % zoom, when Kendra's header renders, then the trigger is visible at 44 px and the page does not scroll horizontally. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/avatar/`; files
  `avatar.component.*` (`sh-avatar`, `AvatarComponent`) and
  `avatar-group.component.*` (`sh-avatar-group`).
- Styles: the "Avatar" section of `components.css` moves into the component;
  row sizing rules stay with their rows.
- Design-system catch-up: every trigger renders `aria-expanded` (the mocks only
  had it while open); the former-user person icon is added to the avatar page
  (D-4).
- [Menu](menu.md) attaches to the trigger and owns `aria-controls`; the avatar
  only exposes `expanded` and `activated`.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What popup type does the trigger declare?* `aria-haspopup="menu"`, as the design system (APG Menu Button), every mock and [menu](menu.md) do.
- **D-3** *Who computes initials?* The consumer, from the name as entered; the component shows what it is given, so names like "Jean-Robert Pierre" → "JP" follow one rule in one place (the user model).
- **D-4** *What does a deleted person look like?* A person icon with no initials, as `pages/dashboard-enquiries/default` shows. The design system says "an empty circle with no initials" and notes no mock showed it; the icon meets the same rule (initials are personal data and leave with the account) and tells the caterer there was a person here.
- **D-5** *Is the image variant kept?* Yes, as `kind="image"`, because the CSS supports it, but no screen may use it until people photos are a product decision; caterers always use [photo](photo.md).
- **D-6** *Does the trigger look different when expanded?* No extra fill, as the design system says; the open menu is the visual cue and `aria-expanded` the programmatic one.
