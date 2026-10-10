# Sticky call to action

| Field | Value |
|---|---|
| Selector | `sh-sticky-cta` (renders `div.sticky-cta`) |
| Library path | `frontend/projects/components/src/lib/sticky-cta/` |
| Status | planned |
| Traces to | L2-015, L2-064, L2-065, L2-066, L2-067, L2-069, L2-085, L2-091 |
| Design system | [`sticky-cta.html`](../../design-system/components/sticky-cta.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/more-dishes`](../../mocks/pages/caterer/more-dishes.html), [`pages/caterer/can-review`](../../mocks/pages/caterer/can-review.html), [`pages/caterer/own-review`](../../mocks/pages/caterer/own-review.html), [`pages/caterer/no-reviews`](../../mocks/pages/caterer/no-reviews.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`pages/caterer/offline`](../../mocks/pages/caterer/offline.html), [`pages/caterer/loading`](../../mocks/pages/caterer/loading.html), [`pages/caterer/removed`](../../mocks/pages/caterer/removed.html) |
| Rendering | [`sticky-cta.html`](sticky-cta.html) |

## Purpose and scope

The sticky call to action keeps "Send an enquiry" under the thumb while
someone scrolls a caterer's photos, menu and reviews on a phone or tablet: a
bar fixed to the bottom of the screen with the caterer's name ("Pelau
House"), their guest range ("Serves 20–300 guests") and the page's one ink
button. It exists for one job, on one page, below 62rem: whatever someone has
read, the enquiry is one tap away (L2-015.4). From 62rem the enquiry panel in
the caterer page's right column takes over and the bar is hidden.

Use something else for a form's submit (the form's own button or
`.form-actions--sticky` in [form layout](form-layout.md)), for messages
([toast](toast.md), [alert](alert.md)) and for navigation. The button inside
is [button](button.md); the desktop enquiry panel and the room the page keeps
for the bar (`.has-sticky-cta`) are [container](container.md)'s
`sh-caterer-layout` and `sh-container stickyCta`.

Out of scope:

- Opening the enquiry dialog and returning focus to the button: the caterer
  page and [dialog](dialog.md) do it, through the button's `focus()`.
- Whether the visitor may enquire (signed in, email verified, L2-023): the
  dialog and the page decide; the bar's button always opens the flow.
- The offline banner and its text: the page renders the [alert](alert.md)
  `#offline-note`; the bar's button only points at it.
- The page's bottom padding, footer padding and `scroll-padding-bottom`:
  [container](container.md) (`stickyCta`) and the global stylesheet.
- Toasts: the toast region is a higher layer (`--z-toast`) and may overlap
  the bar while a toast shows.

## Usage

Inventory from `usage_inventory.py docs/mocks sticky-cta "div|section|aside"`
(one screen family, 7 states) and the caterer page states without a bar.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default`, `more-dishes`, `can-review`, `own-review` | bar, region "Enquire", primary md button with `haspopup="dialog"` | "Pelau House" / "Serves 20–300 guests"; "Send an enquiry" | default (button hover, focus, active) | `--color-bg-surface` over canvas |
| `pages/caterer/no-reviews` | same | "Green Fig Catering" / "Serves 15–120 guests" | default | same |
| `pages/caterer/edge` | same, very long name at 360 px | "Auntie Euphemia’s Kittitian & Nevisian Sunday Kitchen and Celebration Catering" / "Serves 50 guests" | name truncated | same |
| `pages/caterer/offline` | same, button `disabled` | "Pelau House" / "Serves 20–300 guests" | disabled, described by `#offline-note` (D-4) | same |
| `pages/caterer/loading`, `error`, `removed` | no bar | — | absent | — |
| Behind `dialogs/enquiry`, `photo-viewer`, `report`, `review`, `delete-review` | the page's bar, under the dialog | as default | inert behind the dialog | — |

Design-system documentation also uses `.sticky-cta--static` to show the bar
in the flow; the product never renders it (D-3).

## Anatomy

1. **Bar** — `div.sticky-cta` with `role="region"` and `aria-label`
   ("Enquire"). Fixed to the bottom edge, full width, `--z-sticky`;
   `--color-bg-surface` with a `--border-width-hairline` top rule in
   `--color-border-default`, no shadow. Flex row, centred, gap `--space-4`;
   padding `--space-3` block and `--layout-margin` inline, plus
   `env(safe-area-inset-bottom)` at the bottom.
2. **Text** — `div.sticky-cta__text`: a column that takes the remaining width
   (`flex: 1; min-width: 0`).
3. **Caterer name** — `strong`, `--text-label` at `--font-size-md` in
   `--color-fg-default`, one line, truncated with an ellipsis.
4. **Supporting line** — `span`, `--text-body-sm` in `--color-fg-muted`: the
   guest range.
5. **Button** — a primary, medium [button](button.md), "Send an enquiry",
   `aria-haspopup="dialog"`. It never shrinks or wraps.

Host: `sh-sticky-cta` **is** the `div.sticky-cta` element (attribute selector
such as `div[sh-sticky-cta]`, or the chosen framework's equivalent), placed
after `main` and before the footer, so the page's `:has(.sticky-cta)` scroll
padding rule matches it (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `regionLabel` | `string` | — | yes | `aria-label` of the region: "Enquire", the same label as the desktop panel `aside`. |
| `heading` | `string` | — | yes | The caterer's business name in the `strong`. Shown in full in the DOM; truncated only visually. |
| `detail` | `string \| null` | `null` | no | The supporting line ("Serves 20–300 guests"). `null` renders no `span`. |

### Outputs

None. The button in the slot reports activation (`activated` on
[button](button.md)).

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Exactly one `sh-button` with `variant="primary"`, medium size, `haspopup="dialog"` | Placed after `.sticky-cta__text`. No secondary actions (report, share) and no second button. Disabled while offline with `describedBy="offline-note"`. |

- Translation: `regionLabel`, `detail` and the button label come from the
  resource files (L2-064); `heading` is data (the caterer's name). The
  consumer formats the guest range ("Serves 20–300 guests", "Serves 50
  guests").

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Enquiry bar | — | The caterer page below 62rem. The only product variant. |
| Static (documentation) | `.sticky-cta--static` | Design-system and CRD pages, to show the bar in the flow at any width. Never rendered by the component (D-3). |

One size: a 44 px (`--control-height-md`) button plus `--space-3` above and
below, about 69 px, plus the device's bottom safe area. The button stays
medium; the large 52 px button belongs to the desktop enquiry panel. Width is
always the full viewport.

## States

The bar has no interactive states of its own; its button does.

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | caterer page loaded, viewport below 62rem | Bar fixed at the bottom from first paint | Region "Enquire"; button "Send an enquiry", has dialog popup |
| Button hover, focus, active | [button](button.md) states | Primary hover, focus ring, active fills | As button |
| Offline (disabled) | page served from cache, no connection | Button at 50 % opacity, native `disabled` | Button described by the banner: "You’re offline. This is the copy saved from your last visit. Sending an enquiry or a report needs a connection." |
| Long name | name wider than the space left by the button | Name truncated with an ellipsis on one line; supporting line and button unchanged | Full name read |
| Hidden at LG and up | viewport 62rem or wider | `display: none`; the enquiry panel is sticky instead | Removed from the tree; only the panel's `aside` "Enquire" is exposed |
| Absent | caterer page loading, failed or removed | No bar; the page drops `stickyCta` | — |
| Behind a dialog | enquiry or photo dialog open | Covered by the backdrop (`--z-sticky` is below `--z-overlay`) | Inert with the rest of the page |

## Markup

```html
<!-- rendered: default (Pelau House, below 62rem) -->
<main id="main" class="container has-sticky-cta">…</main>
<div class="sticky-cta" role="region" aria-label="Enquire">
  <div class="sticky-cta__text"><strong>Pelau House</strong><span>Serves 20–300 guests</span></div>
  <button class="btn btn--primary" type="button" aria-haspopup="dialog">Send an enquiry</button>
</div>
<footer class="site-footer">…</footer>
```

```html
<!-- rendered: offline; the button points at the page's banner -->
<div class="alert alert--warning banner" role="status" id="offline-note">…You’re offline…</div>
…
<div class="sticky-cta" role="region" aria-label="Enquire">
  <div class="sticky-cta__text"><strong>Pelau House</strong><span>Serves 20–300 guests</span></div>
  <button class="btn btn--primary" type="button" aria-haspopup="dialog" disabled aria-describedby="offline-note">Send an enquiry</button>
</div>
```

```html
<!-- consumer: caterer page -->
<main sh-container stickyCta>…</main>
<div sh-sticky-cta [regionLabel]="t('caterer.enquire.region')" [heading]="caterer().name" [detail]="guestRange()">
  <sh-button #barCta variant="primary" haspopup="dialog" [disabled]="offline()" [describedBy]="offline() ? 'offline-note' : null"
             (activated)="openEnquiry(barCta)">{{ t('caterer.enquire.cta') }}</sh-button>
</div>
```

The e2e page objects locate the bar by `.sticky-cta` and the region name, and
the button by its role and name within it. The class names, the `role`,
`aria-label`, and the bar's position after `main` are part of the contract.

## Design

- Position `fixed`, `left: 0; right: 0; bottom: 0`, layer `--z-sticky` (above
  content and the sticky header's peers, below dropdowns `--z-dropdown`,
  dialogs and toasts `--z-toast`).
- Flex row, `align-items: center`, gap `--space-4`; padding `--space-3`
  `--layout-margin`, bottom padding `calc(--space-3 + safe-area-inset-bottom)`.
- Surface `--color-bg-surface`; top rule `--border-width-hairline` solid
  `--color-border-default`; no shadow (flat surfaces).
- Name `--text-label` at `--font-size-md`, `white-space: nowrap`,
  `overflow: hidden`, `text-overflow: ellipsis`; line `--text-body-sm`.
- Hidden from 62rem (`display: none`).
- Page room (owned by [container](container.md)): `.has-sticky-cta` bottom
  padding `calc(--space-24 + safe area)` below 62rem, the same under the
  footer, and `scroll-padding-bottom: calc(--space-20 + safe area)` on `html`.
- Motion: none. Present from first paint; it never slides in or hides on
  scroll.

Component tokens: none. The button brings its own (`--btn-bg`, `--btn-fg`).

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Bar | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Top rule | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Caterer name | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Guest line | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Button fill | `--color-action` | `--palette-stone-950` | `--palette-stone-100` |
| Button label | `--color-fg-on-action` | `--palette-white` | `--palette-stone-950` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Caterer name |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Guest line |
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Button label |
| `--color-action` | `--color-bg-canvas` | 3:1 | Button edge (bar surface equals canvas) |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring on the bar |

The top rule is decorative: in both themes the bar surface equals the
canvas, and the rule only separates; the bar is identified by its content
and landmark. Forced colours: the rule becomes `CanvasText` and the primary
button `Highlight` / `HighlightText` (button CRD).

## Responsive behaviour

| Viewport | Behaviour |
|---|---|
| XS, SM, MD (below 62rem) | Fixed to the bottom edge, full width; `main` and the footer carry the bar's height as bottom padding. |
| LG, XL (62rem+) | Not displayed; the `.enquiry-panel` in the right column is sticky at `--space-8` from the top with the large button and the privacy note. |
| 320 px | The name truncates first; the supporting line truncates never (it is short); the button keeps its full width and one line. |

- Safe area: pages declare `viewport-fit=cover`; the bar's bottom padding adds
  `env(safe-area-inset-bottom)`, so the button sits above the home indicator.
- On-screen keyboard: the bar has no inputs and the enquiry form opens as a
  full-screen dialog, so the keyboard never pushes the bar over content.
- At 200 % zoom on a 1280 px window the viewport is 640 CSS px, so the bar
  shows; it covers about 69 px and the page's padding keeps content reachable.
- No horizontal scroll at 320 px; the button's target is 44 × 44 CSS px.

## Accessibility

### Role and pattern

`role="region"` landmark named "Enquire", so screen-reader users can jump to
it; the desktop panel is an `aside` with the same name, and only one of the
two is displayed at any width. The button follows the [APG Button
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) with
`aria-haspopup="dialog"`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the button after the page content and before the footer links (the bar follows `main` in the source). |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Opens the enquiry dialog; when it closes, focus returns to this button. |

### Focus

- A fixed bar can cover what has focus beneath it (WCAG 2.4.11 Focus Not
  Obscured). The page's bottom padding under `main` and the footer, and
  `scroll-padding-bottom`, keep every focused element above the bar.
- The button's ring is the shared `--focus-ring-width` ring in
  `--color-focus-ring`, 3:1 against the bar.

### Labelling

- The region is named by `regionLabel` ("Enquire"); the button by its text
  ("Send an enquiry").
- The truncated name repeats the page's `h1`; screen readers read the whole
  text, so the ellipsis loses nothing.
- Offline, the disabled button's description is the banner text.

### Announcements

None. The bar does not appear, disappear or change while the page is used.

### Motion

None. The bar never animates in or out; the button's colour transitions
follow [button](button.md) and reduced motion.

## Content and internationalisation

- The name, then one supporting fact: the guest range ("Serves 20–300
  guests", "Serves 15–120 guests", "Serves 50 guests"). Not the cuisine,
  rating or price ("From $18 per person" stays on the page).
- The button is always "Send an enquiry", the same words as the desktop panel
  and the dialog title.
- No urgency or marketing copy ("Book now!", "Only 2 dates left").
- Translatable: `regionLabel`, the guest-range pattern in `detail`, the
  button label. Data: `heading`. The French button label ("Envoyer une
  demande") is about 30 % longer; the name truncates to make room, the button
  never wraps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values are computed once per input
  change, not in the template.
- No scroll listeners, observers or timers: visibility is CSS only, so the
  bar costs nothing while scrolling.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/StickyCta.ts`
  renders Pelau House's bar ("Pelau House", "Serves 20–300 guests", "Send an
  enquiry") at 360 px and toggles the offline `disabled` state; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CatererPage`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the bar is fixed and server-rendered from first paint;
  the page's bottom padding is in the initial CSS, so nothing shifts.
- Weight: composes [button](button.md) only.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's caterer page at 360 px, when it renders, then a `div.sticky-cta` with `role="region"` and `aria-label="Enquire"` is fixed to the bottom edge across the full width, holding "Pelau House", "Serves 20–300 guests" and a `btn btn--primary` button "Send an enquiry" with `aria-haspopup="dialog"`. (L2-015)
- **AC-2** Given Pelau House's page at 360 px, when the visitor scrolls past the first "Send an enquiry" button down to the reviews, then the bar's "Send an enquiry" button stays fixed in view at the bottom of the screen. (L2-015)
- **AC-3** Given Pelau House's page at 800 px (MD), when it renders, then the bar is displayed; given 1280 px, then the bar is not displayed and the sticky enquiry panel holds "Send an enquiry" instead. (L2-015)
- **AC-4** Given the caterer page is loading, failed or shows "This caterer has left Sweet Hand", when it renders at 360 px, then no `.sticky-cta` exists and `main` has no `has-sticky-cta` class. (L2-015)

### States

- **AC-5** Given Pelau House's page served offline from the cache at 360 px, when the bar renders, then its button has the native `disabled` attribute and `aria-describedby="offline-note"`, and its accessible description begins "You’re offline". (L2-091)

### Keyboard and focus

- **AC-6** Given Pelau House's page at 360 px, when a keyboard user tabs through it, then the bar's "Send an enquiry" is reached after the last link in `main` and before the footer's "About". (L2-067)
- **AC-7** Given focus on the bar's "Send an enquiry", when Enter is pressed and the enquiry dialog then closes with "Cancel", then the dialog opened and focus is back on the bar's button with its ring visible. (L2-067)
- **AC-8** Given Pelau House's page at 360 px scrolled to the end, when the keyboard focuses each footer link ("About", "Cater with us", "Privacy", "Terms"), then each focused link is fully visible above the bar, not covered by it. (L2-067)
- **AC-9** Given keyboard focus on the bar's button in the light and the dark theme, when it is displayed, then the focus ring has at least 3:1 contrast against `--color-bg-surface`. (L2-067)

### Screen readers

- **AC-10** Given Pelau House's page at 360 px and at 1280 px, when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations, and exactly one landmark named "Enquire" is exposed at each width (the region at 360 px, the panel at 1280 px). (L2-066)

### Touch

- **AC-11** Given a 360 × 640 phone with a 34 px bottom safe area, when the bar renders, then the button's target is at least 44 × 44 CSS px, its bottom edge is at least 34 px plus `--space-3` above the screen's bottom edge, and the bar without the safe area is at most 70 px high. (L2-065)

### Theming

- **AC-12** Given the light and the dark theme, when Green Fig Catering's bar renders, then "Green Fig Catering" and "Serves 15–120 guests" each have at least 4.5:1 contrast against the bar, the button label at least 4.5:1 against its fill, and in dark the bar resolves to `--palette-stone-950` with a `--palette-stone-750` top rule. (L2-069)

### Responsive

- **AC-13** Given "Auntie Euphemia’s Kittitian & Nevisian Sunday Kitchen and Celebration Catering" at 320 px, when the bar renders, then the name shows on one line ending in an ellipsis, "Send an enquiry" is on one line at its full width, and the page does not scroll horizontally. (L2-064)
- **AC-14** Given Pelau House's page at 360 px scrolled to the end, when the last review and the footer are measured, then neither is overlapped by the bar. (L2-064)
- **AC-15** Given a 1280 px window at 200 % zoom, when Pelau House's page renders, then the bar is displayed and every section and the footer can be scrolled fully above it with no horizontal scrolling. (L2-069)

### Motion

- **AC-16** Given `prefers-reduced-motion: reduce`, when Pelau House's page loads and is scrolled, then the bar is present from the first paint and never slides, fades or hides. (L2-069)

### Performance

- **AC-17** Given the `StickyCta` perf-test scenario and Pelau House's page at 360 px, when the page loads, then the bar adds no layout shift (Cumulative Layout Shift stays at 0.1 or less), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/sticky-cta/`; file
  `sticky-cta.component.*`, class `StickyCtaComponent`, selector
  `sh-sticky-cta` (attribute host on `div`).
- Styles: the `.sticky-cta` rules of `components.css` move into the
  component; `.has-sticky-cta`, the footer padding and the
  `html:has(.sticky-cta:not(.sticky-cta--static))` scroll padding stay in the
  global layout styles with [container](container.md), because they style
  elements outside the bar. `.sticky-cta--static` stays a documentation-only
  class.
- Mock drift to correct on adoption: the offline bar's button lacks
  `aria-describedby="offline-note"`; the product sets it (D-4). The mock bar's
  button lacks `aria-haspopup="dialog"` in the offline state; the product
  keeps it in every state.
- Composes [button](button.md). Hosted by the caterer page next to
  `sh-container` with `stickyCta`. No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* The `div.sticky-cta` itself (attribute selector), as for [container](container.md), so the global `html:has(.sticky-cta:not(.sticky-cta--static))` scroll padding and the e2e locators see the real element.
- **D-3** *Is `--static` an input?* No. It exists so documentation can show the bar in the flow; a product bar that scrolls away would defeat L2-015.4.
- **D-4** *How is the offline button explained?* With `aria-describedby="offline-note"` pointing at the page's offline banner, exactly as the desktop panel's button does; the offline mock omitted it, which the design system records as drift.
- **D-5** *Does the button come from a slot or from inputs?* A slot holding `sh-button`. The page needs the button instance to open the dialog and to return focus to it (L2-067.4), and the button's own API already covers `disabled`, `describedBy` and `haspopup`.
- **D-6** *Does the bar hide while scrolling down, or appear only after the first button scrolls away?* Neither: it is present from the first paint below 62rem. The design system rules out motion under a finger about to tap, and L2-015.4 is met because the button is in view at every scroll position.
- **D-7** *Which landmark is exposed at each width?* Only the displayed one: the bar below 62rem, the panel from 62rem; both use `display: none` when hidden, so they never appear twice in the landmarks list.
