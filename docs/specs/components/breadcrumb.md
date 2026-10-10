# Breadcrumb

| Field | Value |
|---|---|
| Selector | `sh-breadcrumb` (renders `<nav aria-label>` around `<ol class="breadcrumb">`) |
| Library path | `frontend/projects/components/src/lib/breadcrumb/` |
| Status | planned |
| Traces to | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`breadcrumb.html`](../../design-system/components/breadcrumb.html) |
| Source mocks | None use `.breadcrumb`. The one-step back link it collapses into appears on [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html) and [`pages/admin-report/default`](../../mocks/pages/admin-report/default.html) |
| Rendering | [`breadcrumb.html`](breadcrumb.html) |

## Purpose and scope

A breadcrumb is an ordered trail from a top-level page to the current one,
with a slash between levels and the current page last as plain text: *Caterers
/ Pelau House / Name change*. It is for screens three or more levels below a
top-level page where people need to jump to a middle level, such as an
operator going from a pending name change back to the Pelau House record. Its
collapsing form shows only the parent on a phone, drawn "‹ Pelau House", so a
phone gets the same one-step affordance as a back link.

No Sweet Hand screen uses a breadcrumb today; the design system keeps it for
deeper operator screens, and this CRD specifies it so the first one does not
reshape the API (D-2). For one step back above a page title ("‹ Caterers" on
Pelau House's page, "‹ Review queue" on an operator record, "‹ Overview" on a
dashboard page) use the back link, `sh-back-link` in [link](link.md); the
design system documents both on one page and chooses by depth:

| Situation | Use |
|---|---|
| Top-level page reached from the [site header](site-header.md) | Neither |
| One level below a known page | Back link ([link](link.md)) |
| Dashboard or operator page from 62rem | Neither; the [side nav](side-nav.md) shows the section |
| Three or more levels deep, middle levels useful | Breadcrumb |

Out of scope:

- The back link (`.eyebrow`): [link](link.md).
- Where in the page the trail sits (above the `h1`, inside `main`): the page.
- Building the trail from the route: the consumer passes the ancestors.
- Switching views of one object ([tabs](tabs.md)) or moving through a list
  ([pagination](pagination.md)).

## Usage

`usage_inventory.py docs/mocks breadcrumb "ol|nav"` finds no use in
`docs/mocks/`. The configurations below are the design-system page's, which
the API must build.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design system, trail (operator console, three levels) | `sh-breadcrumb`, 2 ancestors + current | "Caterers" / "Pelau House" / "Name change" | default, hover, focus, current | canvas |
| Design system, collapsing trail | `sh-breadcrumb collapse` | same; below 48rem "‹ Pelau House" only | collapsed, expanded | canvas |
| Design system, both themes | `sh-breadcrumb` | same | default, current | light and dark |
| Design system, long names | `sh-breadcrumb` with a long caterer name | "Auntie Euphemia's Kittitian & Nevisian Sunday Kitchen and Celebration Catering" (from `pages/caterer/edge`) | wrapped | canvas |

## Anatomy

1. **Navigation** — `nav[aria-label]`, named "Breadcrumb" by the consumer.
2. **Trail** — `ol.breadcrumb`: a wrapping flex row, `--space-2` gap, no
   bullets, `--text-body-sm`, `--color-fg-muted`.
3. **Crumb link** — `li > a`: an ancestor page, muted, no underline until
   hover, at least `--target-min` (24 px) high from 48rem and
   `--target-comfortable` (44 px) below it.
4. **Separator** — `li + li::before`: "/" in `--color-fg-subtle`, `--space-2`
   after it, with an empty alternative text so assistive technology never
   reads it (D-4).
5. **Current page** — the last `li > span[aria-current="page"]`: ink
   (`--color-fg-default`), `--font-weight-medium`. Text, not a link.
6. **Collapsed prefix** — with `.breadcrumb--collapse` below 48rem, the
   parent crumb's `::before` becomes "‹" and every other item is hidden.

Host: `sh-breadcrumb` is layout-transparent (`display: contents`) and renders
the `nav` and `ol` in the light DOM.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Rendered as `aria-label` on the `nav`: "Breadcrumb". |
| `items` | `BreadcrumbItem[]` | — | yes | The ancestors, top level first, each rendered as `li > a`. At least two (a single ancestor is a back link, D-3). |
| `current` | `string` | — | yes | The current page's title, rendered last as `span[aria-current="page"]`. |
| `collapse` | `boolean` | `false` | no | Adds `.breadcrumb--collapse`: below 48rem only the parent (last ancestor) shows, prefixed "‹". |

```ts
interface BreadcrumbItem {
  label: string;   // "Pelau House" — data or resource-file text
  href: string;    // "/admin/caterers/pelau-house"
}
```

- Boolean inputs accept the bare attribute (`<sh-breadcrumb collapse>`).

### Outputs

None. Every crumb is a link.

### Content slots

None. Items are data, so the separator, the current-page semantics and the
collapse rule cannot be broken by a consumer.

- Translation: `label`, page titles in `items` and `current` arrive from the
  consumer, from the resource files or the data (caterer names) (L2-064.4).
  The separators "/" and "‹" are CSS punctuation with empty alternative text,
  not copy.

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Trail | — | Every width shows the whole trail, wrapping if needed |
| Collapsing trail | `.breadcrumb--collapse` | Below 48rem only the parent stays ("‹ Pelau House"); from 48rem the whole trail |

One size: `--text-body-sm` at every breakpoint; wayfinding, never competing
with the `h1`. Crumb links are 44 px high below 48rem and 24 px from 48rem.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Links `--color-fg-muted`, no underline; separators `--color-fg-subtle` | Navigation "Breadcrumb", list of N items |
| Hover | `:hover` | Link `--color-fg-default` with an underline; instant (no transition) | — |
| Focus | `:focus-visible` | Shared ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) | Focused link |
| Active | `:active` | Same as hover | — |
| Current | last item, `aria-current="page"` | `--color-fg-default`, `--font-weight-medium`, not a link | "current page"; not focusable |
| Collapsed | `collapse` below 48rem | Only "‹ Pelau House", a 44 px link | Only that link is in the tree; the list reads as one item |
| Wrapped | trail wider than its container | Continues on the next line; never truncates or scrolls | — |
| Disabled | — | Never: crumbs are always live links | — |
| Loading | page data pending | Rendered with the page shell from the route; caterer names arrive with the data, so a skeleton is the page's choice | — |

`data-state="hover|focus"` exists in `components.css` only for documentation
and mocks. The component never renders it.

## Markup

```html
<!-- rendered: trail -->
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb">
    <li><a href="/admin/caterers">Caterers</a></li>
    <li><a href="/admin/caterers/pelau-house">Pelau House</a></li>
    <li><span aria-current="page">Name change</span></li>
  </ol>
</nav>
```

```html
<!-- rendered: collapsing trail (the same list; CSS hides all but the parent below 48rem) -->
<nav aria-label="Breadcrumb">
  <ol class="breadcrumb breadcrumb--collapse">
    <li><a href="/admin/caterers">Caterers</a></li>
    <li><a href="/admin/caterers/pelau-house">Pelau House</a></li>
    <li><span aria-current="page">Name change</span></li>
  </ol>
</nav>
```

Consumer template (binding syntax illustrative):

```html
<sh-breadcrumb collapse [label]="t('breadcrumb.label')"
  [items]="[{ label: t('admin.caterers'), href: '/admin/caterers' }, { label: caterer.name, href: caterer.adminUrl }]"
  [current]="t('admin.nameChange')"></sh-breadcrumb>
<h1>{{ t('admin.nameChange') }}</h1>
```

The e2e page objects locate the trail by the `nav` name and `ol.breadcrumb`,
crumbs by link name, and the current page by `[aria-current="page"]`, so these
are part of the contract.

## Design

- Trail: `--space-2` gap; wraps (`flex-wrap: wrap`); no padding or margin.
- Each crumb is a centred row of separator and link that can shrink, so a
  long name wraps beside its separator (D-7).
- Type `--text-body-sm`; current `--font-weight-medium`.
- Crumb link height `--target-min` from 48rem, `--target-comfortable` below
  it; inline-flex, centred.
- Separator "/" with `--space-2` after it; collapsed prefix "‹" with
  `--space-1` after it.
- No elevation, layer, border or background.
- Motion: none; hover changes colour and underline instantly.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Crumb link | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Hover, current | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Separator | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Crumb links |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Hover and current |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Separator |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The current page is never pepper: pepper means "selected" in lists people
choose from, and a pepper crumb would compete with the side nav's current item.
It differs from links by weight, by not being a link and by `aria-current`, not
by colour alone (L2-069.5).

## Responsive behaviour

- Below 48rem (XS, SM): crumb links are 44 px high (L2-065.1); with `collapse`
  only the parent shows, as "‹ Pelau House".
- From 48rem: the whole trail; links 24 px high (`--target-min`, WCAG 2.5.8)
  with pointer input.
- The trail wraps onto further lines rather than scrolling; long caterer names
  wrap inside their crumb and are never truncated, because the cut-off part may
  be the only difference between two caterers.
- At 320 px nothing scrolls horizontally; at 200 % zoom at a 1280 px window
  (640 CSS px) the trail shows in full and wraps.

## Accessibility

### Role and pattern

`<nav aria-label="Breadcrumb">` around an `<ol>`, the last item marked
`aria-current="page"`
([APG Breadcrumb](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves through the crumb links in reading order; the current page is not focusable. |
| <kbd>Enter</kbd> | Follows the link. |

### Focus

The shared ring wraps each crumb link. The trail sits inside `main` before the
`h1`, so after the [skip link](skip-link.md) the next Tab reaches the first
crumb.

### Labelling

- The `nav` is named "Breadcrumb"; one per page.
- Link text is the destination's title. Separators are not read (D-4); the
  list semantics give the count and position.
- The collapsed parent's name is its title, "Pelau House"; "‹" is not read.

### Announcements

None.

### Motion

None: nothing transitions, so reduced motion changes nothing.

## Content and internationalisation

- Page titles in sentence case: "Review queue", "Name change". Caterer names
  exactly as the caterer writes them ("Pimento & Thyme", "Black Cake Co.").
- Never "Home" or the site name first; the wordmark already goes home.
- The trail starts at the top-level page the site header or side nav names
  ("Caterers" in the operator console).
- Translatable: `label`, page titles. Data: caterer names. French titles run
  about 30 % longer ("Changement de nom"); the trail wraps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the list items) are computed
  once per input change, not in the template.
- No listeners, timers or observers; collapsing is CSS.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Breadcrumb.ts`
  renders "Caterers / Pelau House / Name change" with `collapse`; iterations
  in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: rendered with the page shell; nothing shifts after load.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given an operator on Pelau House's name-change screen, when `sh-breadcrumb` renders with ancestors "Caterers" and "Pelau House" and current "Name change", then it is a `nav` named "Breadcrumb" containing `ol.breadcrumb` with three `li`: two links and a last `span[aria-current="page"]` reading "Name change". (L2-068)
- **AC-2** Given the trail, when it is read by a screen reader, then the separators "/" are not announced, the list is announced with 3 items, and "Name change" is announced as the current page. (L2-068)
- **AC-3** Given the component source, when it is scanned for user-facing string literals, then none are found. (L2-064)

### States

- **AC-4** Given the trail in the light theme, when it renders, then crumb links are `--color-fg-muted` without underline, "Name change" is `--color-fg-default` at `--font-weight-medium` and is not a link, and hovering "Pelau House" turns it `--color-fg-default` with an underline. (L2-069)

### Keyboard and focus

- **AC-5** Given the trail, when the operator tabs through it, then focus visits "Caterers" and then "Pelau House" and skips "Name change", and Enter on "Pelau House" opens its record. (L2-067)
- **AC-6** Given a crumb link with keyboard focus in the light or dark theme, when it is drawn, then the ring is visible with at least 3:1 contrast against the canvas. (L2-067)

### Screen readers

- **AC-7** Given the trail and the collapsed trail at XS and XL, when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-8** Given the dark theme, when the trail renders, then links resolve to `--palette-stone-350`, the current page to `--palette-stone-100` and the separator to `--palette-stone-400`, each with at least 4.5:1 against the canvas. (L2-069)

### Responsive

- **AC-9** Given `collapse` at 360 px, when the trail renders, then only the "Pelau House" link is displayed, prefixed "‹", at least 44 CSS px high, and "Caterers" and "Name change" are not displayed. (L2-065)
- **AC-10** Given `collapse` at 768 px, when the trail renders, then all three items show with "/" separators and the links are at least 24 CSS px high. (L2-064)
- **AC-11** Given a trail whose middle crumb is "Auntie Euphemia's Kittitian & Nevisian Sunday Kitchen and Celebration Catering" at 320 px without `collapse`, when it renders, then the name wraps inside its crumb with no text cut off or replaced by an ellipsis, and the page does not scroll horizontally. (L2-064)
- **AC-12** Given a 1280 px window at 200 % zoom, when the collapsing trail renders, then the parent link is visible and operable with no horizontal scrolling. (L2-069)

### Performance

- **AC-13** Given the `Breadcrumb` perf-test scenario, when the trail renders, then the layout shift is 0 and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/breadcrumb/`; files
  `breadcrumb.component.*` (selector `sh-breadcrumb`, class
  `BreadcrumbComponent`); `BreadcrumbItem` exported.
- Styles: the "Breadcrumb" section of `components.css` and its entry in the
  phone-targets rule move into the component, class names unscoped.
- Design-system catch-up for D-4: change the separator and prefix to
  `content: "/" / ""` and `content: "‹" / ""`, so the punctuation has an empty
  alternative text in browsers that expose generated content.
- Design-system catch-up for D-7: add `.breadcrumb li { display: flex;
  align-items: center; min-width: 0; }` and `.breadcrumb a { min-width: 0; }`.
- Composes nothing. The back link is [link](link.md)'s `sh-back-link`.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Should a component no screen uses be specified now?* Yes, completely, so the first deep operator screen does not invent the API. Its criteria trace to the cross-cutting requirements only, because no feature L2 asks for a breadcrumb.
- **D-3** *Does this component also render the one-step back link?* No. The design-system page documents the eyebrow beside the breadcrumb, but `.eyebrow` lives with the link styles and [link](link.md) specifies it as `sh-back-link`. A breadcrumb needs at least two ancestors; one ancestor is a back link.
- **D-4** *Are the separators read aloud?* No. The design system says screen readers never read them, but CSS generated content is exposed by current browsers; giving the "/" and "‹" an empty alternative text (`content: "/" / ""`) makes the design system's statement true. The list semantics already convey the hierarchy.
- **D-5** *Is the current page a link?* No: plain text with `aria-current="page"`, not focusable, as the design system and APG show. A link to the page you are on is a wasted Tab stop.
- **D-6** *Is there a "Home" crumb?* No. The trail starts at the top-level page; the header's wordmark goes home (design system, Content).
- **D-7** *How does a crumb with a long name wrap?* Beside its separator. With today's CSS the "/" sits on its own line above a wrapped name at 320 px and the first crumb sits a pixel off the others' line, because the separator is inline text next to an inline-flex link; each `li` becomes a centred flex row whose link may shrink, which the rendering shows.
