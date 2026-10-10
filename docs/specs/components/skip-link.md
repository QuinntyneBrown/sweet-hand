# Skip link

| Field | Value |
|---|---|
| Selector | `sh-skip-link` (renders `<a class="skip-link">`) |
| Library path | `frontend/projects/components/src/lib/skip-link/` |
| Status | planned |
| Traces to | L2-003, L2-064, L2-065, L2-066, L2-067, L2-069, L2-085 |
| Design system | [`skip-link.html`](../../design-system/components/skip-link.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/not-found/default`](../../mocks/pages/not-found/default.html), [`notifications/site-banner/danger`](../../mocks/notifications/site-banner/danger.html), [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html) |
| Rendering | [`skip-link.html`](skip-link.html) |

## Purpose and scope

The skip link is the first thing a keyboard user reaches on every Sweet Hand
page. It sits out of sight above the viewport until it receives keyboard
focus, slides into view at the top left over the [site
header](site-header.md), and, when activated, moves focus to the page's one
`<main id="main">`. The next Tab then lands on the first control of the page
("All" in the listing's cuisine filter) instead of the wordmark, the nav links,
search and the avatar again (WCAG 2.4.1 Bypass Blocks, L2-067.3).

There is exactly one skip link per page and it always says "Skip to main
content". Nothing else in the product uses it: a dialog moves focus into
itself when it opens ([dialog](dialog.md), [sheet](sheet.md)), and landmarks
and headings already let screen-reader users jump between regions.

Out of scope:

- The `<main id="main">` landmark itself and the page shell around it
  (`.page`, `.container`): the app shell renders them; the skip link only
  needs the `id`.
- Focus handling when a dialog, sheet or the photo viewer opens or closes:
  [dialog](dialog.md) and [sheet](sheet.md) own it.
- Focus after client-side route changes (where focus goes when Marcia opens
  Pelau House's page from the listing): the router and page shell own it.
- The design-system site's own "Skip to content" link in `ds.css`: docs
  chrome, not product.

## Usage

Inventory from `usage_inventory.py docs/mocks skip-link "a"` (436 uses in 90
screens) and a search of every `<main id="main"` in `docs/mocks/`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every public page (`caterers/*`, `caterer/*`, `occasions/*`, `about`, `privacy`, `terms`) | first child of `<body>`, `href="#main"`; target `<main id="main" class="container">` (`has-sticky-cta` on the caterer page, `aria-busy="true"` while loading) | "Skip to main content" | default (hidden), focus | floats over the site header on the canvas |
| Every customer, caterer and operator page (`inbox`, `thread`, `account`, `dashboard*`, `profile-*`, `admin-*`) | same | "Skip to main content" | default, focus | same |
| Auth and system pages (`sign-in`, `register`, `register-caterer`, `forgot-password`, `reset-password`, `two-factor`, `verify-email`, `privacy-update`, `not-found`, `forbidden`, `server-error`, `offline`, `maintenance`, `rate-limited`) — 47 mocks | same; target `<main id="main">` without `.container` | "Skip to main content" | default, focus | same |
| Every notification mock (`site-banner`, `profile-banner`, `toast`, `dashboard-toast`, `admin-toast`) | same; a site banner sits after the header, so the skip link stays first | "Skip to main content" | default, focus | same |

Not product markup, and not built by this component:

- The 165 dialog and viewer mocks open with "Skip to the dialog" (147),
  "Skip to the enquiry form" (11), "Skip to the menu" (3) and "Skip to the
  photo viewer" (4), pointing at `#dlg-title` or `#viewer-title` from outside
  the modal. The product drops them: the dialog takes focus when it opens and
  the page behind it, skip link included, is inert (D-2).

## Anatomy

1. **Link** — `a.skip-link`, the inner native element. Absolutely positioned at
   `left: --space-4`, `top: calc(-1 * --space-24)` (above the viewport) until
   `:focus-visible`, then `top: --space-4`. Raised surface, `--radius-md`,
   `--shadow-3`, `--z-tooltip`, inline-flex, at least `--target-comfortable`
   high.
2. **Label** — the projected text "Skip to main content", body text in
   `--color-fg-default`, no underline. It is the accessible name.
3. **Target** — `<main id="main">`, rendered by the page shell, not by this
   component. The link's `href` is always `#main`.

Host: `sh-skip-link` is layout-transparent (`display: contents`) and renders
the `<a>` in the light DOM, so the `.skip-link` rules and the print rule in
`components.css` apply unchanged and the link's containing block is the page,
not the host. The app shell places the host as the first child of `<body>`,
before `.page`; nothing focusable may come before it (not a cookie notice, not
a site banner).

## API

### Inputs

None. The target is always `#main` and the look never varies (D-3).

### Outputs

None. Activation moves focus itself; no consumer has anything to do (D-4).

### Methods

None.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text only | The label, "Skip to main content" in English. Declared once. No icon, no markup. |

- Translation: the label arrives from the consumer, who takes it from the
  resource files (L2-064.4). The component contains no user-facing strings.

### Behaviour on activation

1. The native `href="#main"` is rendered so the link works before the
   application script runs (server-rendered first paint, L2-091).
2. Once the script runs, the component handles the click (Enter on a link
   arrives as a click): it calls `preventDefault()` so the router does not
   navigate and the URL and history do not change (D-4), finds the element
   with `id="main"`, sets `tabindex="-1"` on it if it has no `tabindex`,
   focuses it, and scrolls it into view at the top (the page's
   `scroll-padding-top: --layout-topbar-height` applies).
3. When the target loses focus, the component removes the `tabindex` it added,
   and only that one.
4. If no `#main` exists, the component does nothing and logs nothing to the
   user; the page shell guarantees the target (AC-1).

## Variants and sizes

One variant. The dialog mocks' second form ("Skip to the dialog") is not built
(D-2).

One size: body text with `--space-2` block and `--space-4` inline padding,
`min-height: --target-comfortable` (44 px). The width comes from the label.
It appears only on keyboard focus, so it has no size variants.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default (hidden) | — | Above the viewport (`top: calc(-1 * --space-24)`); not visible | In the accessibility tree and the tab order; role link, name "Skip to main content" |
| Focus | `:focus-visible` | Slides to `top: --space-4` over `--duration-fast` `--ease-standard`; `--focus-ring-width` ring in `--color-focus-ring` at `--focus-ring-offset` | Focused; "Skip to main content, link" announced |
| Hover, active, visited | `:hover`, `:active`, `:visited` while focused | Same as focus; no colour change, no underline | — |
| Mouse focus | `:focus:not(:focus-visible)` | Never happens in practice (it is above the viewport); if focused by script, it stays hidden | — |
| Activated | click / Enter | Focus leaves the link, so it slides back above the viewport; `<main>` gets focus with no ring (D-5) | Focus is on the main landmark; reading continues from the page heading |
| Behind a dialog | a modal dialog is open | Not visible | Inert with the rest of the page; Tab cannot reach it |
| Print | `@media print` | `display: none` | — |

`data-state="focus"` exists in `components.css` only for documentation and
mocks. The component never renders it.

## Markup

```html
<!-- rendered: the only form, first child of <body> -->
<a class="skip-link" href="#main">Skip to main content</a>
```

```html
<!-- rendered: the target, owned by the page shell; tabindex is added only while focus is on it after a jump -->
<main id="main" class="container" tabindex="-1">…</main>
```

Consumer template (the app shell; binding syntax illustrative, the label comes
from the resource files):

```html
<!-- consumer: app shell -->
<body>
  <sh-skip-link>{{ t('shell.skipToMain') }}</sh-skip-link>
  <div class="page">
    <sh-site-header …></sh-site-header>
    <main id="main" class="container">…</main>
    <sh-footer …></sh-footer>
  </div>
</body>
```

The e2e page objects locate the link by `.skip-link` and by its role and name,
and the target by `main#main`, so the class, the `href` and the absence of any
`aria-label` or `title` are part of the contract.

## Design

- Position absolute; hidden offset `calc(-1 * --space-24)`, shown offset
  `--space-4` from the top and `--space-4` from the left at every breakpoint.
- Padding `--space-2` block, `--space-4` inline; `min-height`
  `--target-comfortable`; inline-flex, centred vertically.
- Label `--text-body`, no underline, sentence case, one line.
- Shape `--radius-md`; no border.
- Elevation `--shadow-3`; layer `--z-tooltip`, above the header, sticky bars,
  toasts and overlays, because it must never be covered while focused.
- Focus ring: the shared `--focus-ring-width` solid `--color-focus-ring` at
  `--focus-ring-offset`, from the base `:focus-visible` rule.
- Motion: `top` transitions over `--duration-fast` with `--ease-standard`.

No component tokens: it reads the semantic tokens directly (design system,
Theming).

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Background | `--color-bg-surface-raised` | `--palette-white` | `--palette-stone-850` |
| Label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Shadow | `--shadow-3` (`--shadow-color`) | soft ink shadow | stronger black shadow |
| Page behind (header) | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface-raised` | 4.5:1 | Label |
| `--color-focus-ring` | `--color-bg-surface-raised` | 3:1 | Ring against the link's own surface |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Ring against the header behind it |

In the light theme the raised surface and the canvas are both white, so the
shadow and the focus ring separate the link from the header; in the dark theme
the raised surface is a step lighter than the canvas.

Forced colours: the background and shadow give way to system colours; the
focus ring (an outline) stays and draws in the system highlight colour, which
outlines the link against the header. No forced-colours rule is needed.

## Responsive behaviour

- Identical at every breakpoint: `--space-4` from the top and left when
  focused. The header's height (`--layout-topbar-height`, 4, 5 or 6 rem) does
  not move it.
- It overlaps the site header while focused; that is intended and lasts only
  until focus moves on.
- At 320 px "Skip to main content" fits on one line with room to spare and
  nothing scrolls horizontally. The label never truncates; a longer
  translation wraps inside the link (`max-width: calc(100vw - 2 * --space-4)`,
  D-6).
- At 200 % zoom at a 1280 px window, the focused link is fully in view.
- Touch: it is not a touch feature. Touch does not trigger `:focus-visible`,
  so it never appears on touch alone; with a hardware keyboard or switch
  access on a phone it works the same, at 44 px high (L2-065).

## Accessibility

### Role and pattern

A native in-page link, `<a href="#main">`, the standard technique for
[WCAG 2.4.1 Bypass Blocks](https://www.w3.org/WAI/WCAG22/Understanding/bypass-blocks.html).
No `role` attribute.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> (first press on a page) | Focuses the skip link and shows it. |
| <kbd>Enter</kbd> | Moves focus to `<main id="main">`; the next <kbd>Tab</kbd> reaches the first control inside main. |
| <kbd>Tab</kbd> again without Enter | Hides it and continues to the wordmark "Sweet Hand". |
| <kbd>Shift</kbd>+<kbd>Tab</kbd> | Leaves the page to the browser chrome, as from any first element. |
| <kbd>Space</kbd> | Scrolls the page, as on any link; does not activate it. |

### Focus

- It is the first focusable element in the DOM on every page.
- Its ring is the shared ring (`--focus-ring-width`, `--color-focus-ring`,
  `--focus-ring-offset`) and meets 3:1 against both its own surface and the
  header.
- After activation, focus is on `<main>`. Main shows no ring, because it is
  not a control (D-5); the next Tab continues from inside main.
- While a modal dialog is open, the page behind it is inert, so the skip link
  is not reachable (D-2).

### Labelling

- The visible text is the accessible name: "Skip to main content". No
  `aria-label`, no `title`.

### Announcements

None. Moving focus to the main landmark is what screen readers announce.

### Motion

The slide uses `--duration-fast`, which `prefers-reduced-motion: reduce` sets
to 0.01 ms, so the link appears in place.

## Content and internationalisation

- Exactly "Skip to main content", in sentence case, on every product page. Not
  "Skip to content", not "Skip navigation".
- No arrows, icons or "Click here".
- The label is translatable copy from the resource files (key
  `shell.skipToMain`). French ("Passer au contenu principal") runs about 30 %
  longer and still fits on one line at 320 px; anything longer wraps inside the
  link and never truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values are computed once, not in the
  template. It has no inputs, so it renders once.
- One click listener on the `<a>`, and one `blur` listener added to `<main>`
  only after a jump and removed when it fires. No timers, observers or global
  listeners.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/SkipLink.ts`
  renders the skip link above Marcia's signed-in site header on the listing
  and focuses and activates it; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Listing`, `CatererPage`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: absolutely positioned, so appearing and disappearing never
  moves anything else (zero layout shift).
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's caterer page, when it renders, then the first child of `<body>` is `<a class="skip-link" href="#main">Skip to main content</a>`, the page has exactly one `.skip-link` and exactly one `<main id="main">`, and no focusable element comes before the link in the DOM. (L2-067)
- **AC-2** Given the listing page with nothing focused, when it renders, then the skip link's bounding box lies entirely above the top of the viewport, and the link is neither `display: none` nor `visibility: hidden` nor `.visually-hidden`, so it stays in the tab order and the accessibility tree. (L2-067)
- **AC-3** Given the component source, when it is scanned for user-facing string literals, then none are found: "Skip to main content" arrives through the default slot from the resource files. (L2-064)

### Keyboard and focus

- **AC-4** Given the listing page has just loaded, when Marcia presses Tab once, then the skip link is focused and fully visible with its top-left corner `--space-4` from the top and left of the viewport, drawn over the site header. (L2-067)
- **AC-5** Given the skip link is focused on the listing page, when Marcia presses Enter, then focus moves to `<main id="main">`, and the next Tab focuses the cuisine filter "All" rather than the wordmark "Sweet Hand". (L2-067)
- **AC-6** Given the skip link is focused, when Marcia presses Tab without activating it, then the link moves back above the viewport and focus moves to the wordmark "Sweet Hand". (L2-067)
- **AC-7** Given the jump has moved focus to `<main>`, when focus then leaves main, then main carries no `tabindex` attribute, and while it had focus it showed no focus ring. (L2-067)
- **AC-8** Given the focused skip link, when its focus ring is measured in the light and the dark theme, then the ring has at least 3:1 contrast against `--color-bg-surface-raised` and against the header's `--color-bg-canvas`. (L2-067)
- **AC-9** Given Marcia came to `/caterers?cuisine=jamaican&page=2` from the home page, when she activates the skip link and then presses the browser Back button, then the URL never gained `#main` or a new history entry, and Back returns her to the page she came from. (L2-003)
- **AC-10** Given the enquiry dialog is open over Pelau House's page, when Marcia presses Tab and Shift+Tab repeatedly, then the page's skip link is never focused, and no "Skip to the enquiry form" link exists in the DOM. (L2-067)

### Screen readers

- **AC-11** Given the focused skip link, when its accessible name and role are read, then the role is link and the name is exactly "Skip to main content", with no `aria-label` or `title` attribute. (L2-067)
- **AC-12** Given the listing at XS and XL, when axe-core runs with the skip link at rest and again with it focused, then it reports 0 violations. (L2-066)

### Theming

- **AC-13** Given the light theme, when the skip link is focused, then its label `--color-fg-default` on `--color-bg-surface-raised` has at least 4.5:1 contrast. (L2-069)
- **AC-14** Given the dark theme, when the skip link is focused, then its background resolves to `--palette-stone-850`, its label to `--palette-stone-100`, and the label contrast is at least 4.5:1. (L2-069)

### Responsive

- **AC-15** Given a 360 px viewport with a hardware keyboard, when the skip link is focused, then it is at least 44 CSS px high. (L2-065)
- **AC-16** Given a 320 px viewport, when the skip link is focused, then "Skip to main content" sits on one line, the link lies entirely inside the viewport, and the page does not scroll horizontally. (L2-064)
- **AC-17** Given a 1280 px window at 200 % zoom, when the skip link is focused, then it is fully visible and readable and activating it still moves focus to main. (L2-069)

### Motion

- **AC-18** Given `prefers-reduced-motion: reduce`, when the skip link receives focus, then it appears at its shown position without a visible slide. (L2-069)

### Performance

- **AC-19** Given the `SkipLink` perf-test scenario on the listing, when the skip link is focused, shown and hidden again, then the cumulative layout shift it causes is 0, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/skip-link/`; files
  `skip-link.component.*`, selector `sh-skip-link`, class
  `SkipLinkComponent`.
- Styles: the "Skip link" section of `docs/design-system/assets/components.css`
  and the `.skip-link` entry of its print rule move into the component as its
  stylesheet, class names unscoped.
- Design-system catch-up for D-5: add `main[tabindex="-1"]:focus { outline:
  none; }` to the base rules of `components.css`, so the jump target shows no
  ring. The app shell keeps it with the other foundation rules.
- Design-system catch-up for D-6: add `max-width: calc(100vw - 2 *
  var(--space-4))` to `.skip-link` so a long translation wraps instead of
  running off a 320 px screen. English never reaches it.
- The design-system page says the link is "about 40px tall" and proposes
  44 px; `components.css` already sets `min-height: var(--target-comfortable)`.
  This CRD requires 44 px (AC-15); the page's prose catches up.
- The app shell places `sh-skip-link` first in `<body>` and renders
  `<main id="main">`. The dialog and sheet components make the page behind
  them inert (`inert` on `.page` and on the skip link host's `<a>`), which is
  what removes the skip link from the tab order while a dialog is open.
- Composes nothing. No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Are the dialog mocks' "Skip to the dialog" links built?* No. The design system drops them: a modal dialog moves focus into itself when it opens (L2-067.4), the page behind is inert, and a link outside an `aria-modal` dialog is outside what assistive technology presents. The skip link therefore has one form.
- **D-3** *Does the component take a `target` or a label input?* No target: the system has one skip link and one target, `#main`, on every page, and a knob would invite a second link the design system forbids. The label comes through the slot because it is translatable copy.
- **D-4** *Does a jump change the URL?* No. With client-side routing, a bare `#main` resolves against the base URL and could navigate away from the current route or add a history entry, which would break the listing's Back behaviour (L2-003). The component prevents the default navigation once its script has run and moves focus itself; before that, the native `href` does the same job.
- **D-5** *Does `<main>` show a focus ring after the jump?* No. Main is a landmark, not a control; a 2 px pepper ring around the whole page content would read as an error. The temporary `tabindex="-1"` makes focus reliable in every supported browser (the sequential-focus starting point alone is not honoured by all of them after a script-handled click), and it is removed when focus leaves.
- **D-6** *What happens to a label longer than the screen?* It wraps inside the link, which is capped at the viewport width less `--space-4` each side. English fits on one line at 320 px, so this protects translations only.
