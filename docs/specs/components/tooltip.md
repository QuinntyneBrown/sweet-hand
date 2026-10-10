# Tooltip

| Field | Value |
|---|---|
| Selector | `sh-tooltip` (wraps one control in `.has-tooltip` and renders its `.tooltip`) |
| Library path | `frontend/projects/components/src/lib/tooltip/` |
| Status | planned |
| Traces to | L2-043, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`tooltip.html`](../../design-system/components/tooltip.html) |
| Source mocks | [`pages/profile-menu/default`](../../mocks/pages/profile-menu/default.html), [`pages/profile-photos/default`](../../mocks/pages/profile-photos/default.html), [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`dialogs/photo-viewer/default`](../../mocks/dialogs/photo-viewer/default.html), [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html) |
| Rendering | [`tooltip.html`](tooltip.html) |

## Purpose and scope

A tooltip is a short dark label that appears above a control on hover or
keyboard focus. In Sweet Hand it is a desktop enhancement for mouse users who
may not know what a row icon means: "Edit" over the pencil on Kendra's
"Chicken pelau" row, "Move up" over its arrow, or "Close" with its <kbd>Esc</kbd>
shortcut on a dialog's Close. It holds plain text only, never anything you can
click, and never information that is not available another way: the control's
`aria-label` stays its accessible name whatever the tooltip says.

No current mock uses a tooltip; every icon-only button already has an
accessible name, and most people browse on phones, where hover does not
exist. This CRD specifies it completely so it can be added to the places the
design system names without an API change. Use something else when everyone
needs the word (a [button](button.md) with an icon and a visible label), when
the text is longer than three words or has a link ([popover](popover.md)), or
for anything about food safety, prices or errors (always visible text).

Out of scope:

- The control itself: an [icon button](icon-button.md) (or a
  [button](button.md)), which keeps its own name, focus ring and behaviour.
- Dialog <kbd>Esc</kbd> handling: the [dialog](dialog.md) closes on the
  second <kbd>Esc</kbd>; the tooltip only consumes the first while it is
  showing (D-4).

## Usage

No mock renders `.tooltip` or `.has-tooltip` (`usage_inventory.py docs/mocks
tooltip "span|div"` finds none). These are the places the design system
approves it for, each an icon-only control that already has a full
`aria-label`:

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/profile-menu/*` row actions, from 48rem | `mode="label"` around each icon button | "Move up", "Move down", "Edit", "Remove" over "Move Chicken pelau up" … "Remove Chicken pelau" | hidden, hover, focus | canvas, edit row |
| `pages/profile-photos/*` tile arrows, from 48rem | `mode="label"` | "Move up", "Move down" over "Move photo 3 up" | hidden, hover, focus | canvas, photo tile |
| Any dialog header Close | `mode="description"`, `shortcut="Esc"` | "Close" + <kbd>Esc</kbd> over "Close" | hidden, focus, dismissed | dialog |
| `dialogs/photo-viewer/*` | `mode="label"` | "Previous", "Next" over "Previous photo", "Next photo" | hidden, hover | viewer |

Not allowed (design system, Overview and Do and don't): header icons at the
screen edge on XS, allergen or dietary information, links or buttons inside
the tooltip.

## Anatomy

1. **Anchor** — `span.has-tooltip` (`position: relative; display:
   inline-flex`) wrapping exactly one control.
2. **Control** — the projected icon button or button; untouched except for
   `aria-describedby` in `description` mode.
3. **Tooltip** — `span.tooltip[role="tooltip"]` after the control:
   `--text-caption` in `--color-fg-inverse` on `--color-bg-inverse`,
   padding `--space-1` `--space-2`, `--radius-sm`, `--shadow-2`, one line
   (`white-space: nowrap`), `--z-tooltip`; placed `--space-2` above the
   control, centred.
4. **Shortcut (optional)** — `kbd` inside the tooltip, `--space-2` after the
   label, with a `--color-border-inverse` outline on a transparent fill.
5. **Arrow** — the `::after` triangle (0.3125rem) in `--color-bg-inverse`,
   centred under the label.
6. **Hover bridge** — the `::before` strip that fills the `--space-2` gap so
   the pointer can move onto the tooltip without it vanishing (WCAG 1.4.13).

Host: `sh-tooltip` renders the `span.has-tooltip` as its only child and is
`display: inline-flex` itself, so it sits in a flex row like the control it
wraps.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `text` | `string` | — | yes | One to three words ("Edit", "Move up", "Close"). Rendered as text. |
| `mode` | `'label' \| 'description'` | `'label'` | no | `label`: the text repeats the control's name, so the tooltip gets `aria-hidden="true"` and no id. `description`: it adds information, so it gets an id and the control's `aria-describedby` points at it. |
| `shortcut` | `string \| null` | `null` | no | Renders `<kbd>` after the text and requires `mode="description"`. Only for a shortcut that exists; today only "Esc" on Close. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `shownChange` | `boolean` | The tooltip becomes visible (after the delay) or hidden. For analytics-free tests and for a consumer that must know; nothing in the product depends on it. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Exactly one focusable control: `sh-icon-button`, `sh-icon-button-anchor` or `sh-button` | In `description` mode the tooltip sets the control's `describedBy` input (or `aria-describedby` on a native element). A disabled control is not allowed (D-6). |

- Translation: `text` and the shortcut name come from the resource files
  (L2-064.4).

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Text, repeats the name | `mode="label"`, tooltip `aria-hidden="true"` | Row and tile icons: "Edit" over "Edit Chicken pelau". |
| With shortcut, adds information | `mode="description"`, tooltip `id` + control `aria-describedby` | "Close" + <kbd>Esc</kbd> on a dialog's Close. |

One placement (above, centred) and one size: caption text on one line, sized
to the label.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Hidden | default | `opacity: 0`, still in the DOM | Description still available in `description` mode |
| Shown on hover | `:hover` on the anchor for `--duration-hover-delay` (300 ms) | Fades in over `--duration-fast` | — |
| Shown on focus | `:focus-within` (keyboard focus on the control) after the delay | Same | Description read with the control in `description` mode |
| Hover moves onto the tooltip | pointer crosses the bridge | Stays shown | — |
| Dismissed | <kbd>Esc</kbd> while shown → `data-dismissed` on the anchor | Hidden at once; focus stays on the control | — |
| Leave | pointer leaves and focus leaves | Hidden at once (no fade-out delay) | — |
| Touch device | `(hover: none)` | Shows only while the tapped control keeps focus; never relied on (D-3) | — |

`data-state="hover"` on the anchor and `data-state="visible"` on the tooltip
exist for documentation only; the component never renders them.

## Markup

```html
<!-- rendered: mode="label" (repeats the name) -->
<span class="has-tooltip">
  <button class="icon-btn" type="button" aria-label="Edit Chicken pelau" aria-haspopup="dialog"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  <span class="tooltip" role="tooltip" aria-hidden="true">Edit</span>
</span>
```

```html
<!-- rendered: mode="description" with a shortcut -->
<span class="has-tooltip">
  <button class="icon-btn" type="button" aria-label="Close" aria-describedby="tooltip-7"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  <span class="tooltip" id="tooltip-7" role="tooltip">Close <kbd>Esc</kbd></span>
</span>
```

```html
<!-- rendered: dismissed with Esc -->
<span class="has-tooltip" data-dismissed>…</span>
```

```html
<!-- consumer -->
<sh-tooltip [text]="t('common.edit')">
  <sh-icon-button [ariaLabel]="t('menu.editDish', { name: dish.name })" haspopup="dialog" (activated)="edit(dish)"><svg class="icon" …></svg></sh-icon-button>
</sh-tooltip>
<sh-tooltip mode="description" [text]="t('common.close')" shortcut="Esc">
  <sh-icon-button [ariaLabel]="t('common.close')" (activated)="close()"><svg class="icon" …></svg></sh-icon-button>
</sh-tooltip>
```

Ids are generated per instance; the wiring is contract, the values are free.

## Design

- Label `--text-caption`, one line; padding `--space-1` `--space-2`; radius
  `--radius-sm`; shadow `--shadow-2`.
- Position `bottom: calc(100% + --space-2)`, centred (`left: 50%`,
  `translate: -50% 0`), clamped so it stays `--layout-margin` inside the
  viewport (D-5); the arrow stays centred over the control.
- Shortcut `kbd`: `--space-2` left margin, transparent fill,
  `--color-border-inverse` border.
- Layer `--z-tooltip`, above dialogs and toasts.
- Motion: opacity over `--duration-fast` with `--ease-standard`, after
  `--duration-hover-delay`; hiding uses `--duration-instant`.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill and arrow | `--color-bg-inverse` | `--palette-stone-950` | `--palette-stone-50` |
| Text | `--color-fg-inverse` | `--palette-white` | `--palette-stone-950` |
| Shortcut outline | `--color-border-inverse` | `--palette-stone-700` | `--palette-stone-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-inverse` | `--color-bg-inverse` | 4.5:1 | Tooltip text |
| `--color-border-inverse` | `--color-bg-inverse` | 1:1 (decorative) | Shortcut outline |

The inverse pair flips with the theme, so the tooltip always contrasts with
the page. Forced colours: text `CanvasText` on `Canvas` with a `CanvasText`
border, so the label is still boxed when the fill is removed (D-7).

## Responsive behaviour

- The tooltip is useful from 48rem with a mouse (the menu manager's row icons).
  On touch screens it shows only while a focused control keeps focus and is
  never relied on.
- It never wraps: labels are at most three words, so it fits at 320 px.
- Near a viewport edge it shifts inward to stay `--layout-margin` from the
  edge rather than being cut off; it never flips below the control (D-5).
- At 200 % zoom the tooltip scales with the text and stays inside the
  viewport.

## Accessibility

### Role and pattern

[APG Tooltip](https://www.w3.org/WAI/ARIA/apg/patterns/tooltip/):
`role="tooltip"`, shown on hover and focus. In `description` mode the control
references it with `aria-describedby`; in `label` mode it is `aria-hidden` so
the name is not read twice. The control's `aria-label` stays in both modes.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Focusing the control shows its tooltip after the delay; moving on hides it. |
| <kbd>Esc</kbd> | Hides a showing tooltip; focus stays on the control. When no tooltip is showing, Esc passes through (a dialog then closes). |

### Focus

The tooltip never takes focus and contains nothing focusable. The control's
focus ring stays visible: the tooltip sits above the control, `--space-2` away,
so it never covers the ring.

### Labelling

- Tooltip text is shorter than the name it supports ("Edit" for "Edit Chicken
  pelau") because the row gives the context visually.
- No `title` attribute on the control or the tooltip.

### Announcements

None. A description is read with the control; nothing is live.

### Motion

The fade uses `--duration-fast`, zeroed by `prefers-reduced-motion: reduce`.
The 300 ms delay is not motion and is kept, so a tooltip never flashes up as
the pointer crosses a row.

## Content and internationalisation

- One to three words, sentence case, no full stop: "Edit", "Move up",
  "Close".
- Describe the action, not the icon: "Remove", not "Bin".
- Never put information only in a tooltip: allergens, dietary tags, prices,
  certificate details and errors are always visible text.
- Translatable: `text`, the shortcut name. French runs about 30 % longer
  ("Monter" for "Move up" is shorter, "Supprimer" longer); still one line.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the id and mode attributes are computed once,
  not in the template.
- Showing and hiding are pure CSS (`:hover`, `:focus-within`, transition
  delay); the only script is one keydown listener on the anchor for Esc,
  attached while the tooltip shows, and the edge clamp measured once per show.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Tooltip.ts`
  renders Kendra's 18-dish menu manager with a tooltip on each of the 72 row
  icons and hovers "Edit Chicken pelau"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `MenuManager`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: absolutely positioned; adding tooltips to 72 icons never
  changes the row layout.
- Weight: no dependencies beyond the framework; no positioning library.

## Acceptance criteria

### Rendering

- **AC-1** Given "Edit Chicken pelau" wrapped in `sh-tooltip` with `text` "Edit", when it renders, then the control sits in `span.has-tooltip` followed by `span.tooltip[role="tooltip"][aria-hidden="true"]` reading "Edit", and the control's accessible name is still "Edit Chicken pelau". (L2-068)
- **AC-2** Given a dialog's Close wrapped with `mode="description"` and `shortcut` "Esc", when it renders, then the tooltip has an id, reads "Close Esc" with "Esc" in a `<kbd>`, and the button's `aria-describedby` points at it. (L2-068)
- **AC-3** Given Kendra's menu manager at 1280 px with tooltips on every row icon, when axe-core runs with one tooltip showing, then it reports 0 violations and no name is announced twice. (L2-066)

### States

- **AC-4** Given the pointer moves onto "Move Chicken pelau up", when it rests for 300 ms, then "Move up" becomes visible above the arrow; when it leaves after 200 ms, then no tooltip was shown. (L2-043)
- **AC-5** Given a tooltip shown by hover, when the pointer moves from the control onto the tooltip across the gap, then the tooltip stays visible. (L2-067)
- **AC-6** Given keyboard focus on "Remove Chicken pelau", when 300 ms pass, then "Remove" is visible; when Kendra presses Esc, then it hides at once and focus stays on the button. (L2-067)
- **AC-7** Given the "Remove “Curry goat”?" dialog's Close focused with its tooltip showing, when Esc is pressed once, then only the tooltip hides; when Esc is pressed again, then the dialog closes. (L2-067)
- **AC-8** Given a tooltip is showing, when the control's focus ring is measured, then the tooltip does not overlap the ring. (L2-067)

### Touch

- **AC-9** Given a touch device, when Kendra taps the pencil on "Chicken pelau", then the "Edit dish" dialog for Chicken pelau opens, so the information the tooltip gives on desktop ("Edit") is available by tap. (L2-065)

### Theming

- **AC-10** Given the light theme, when a tooltip shows, then its fill resolves to `--palette-stone-950`, its text to `--palette-white`, and their contrast is at least 4.5:1; given the dark theme, then they resolve to `--palette-stone-50` and `--palette-stone-950` with at least 4.5:1. (L2-069)

### Responsive

- **AC-11** Given a 320 px viewport and a tooltip "Close" on a control 8 px from the right edge, when it shows, then it stays fully inside the viewport and the page does not scroll horizontally. (L2-064)
- **AC-12** Given a 1280 px window at 200 % zoom, when "Move up" shows, then its text is fully visible on one line inside the viewport. (L2-069)

### Motion

- **AC-13** Given `prefers-reduced-motion: reduce`, when a tooltip shows, then it appears after the 300 ms delay without a visible fade. (L2-069)

### Performance

- **AC-14** Given the `Tooltip` perf-test scenario, when the pointer rests on "Edit Chicken pelau", then showing the tooltip adds no layout shift and no long task over 50 ms, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/tooltip/`; file
  `tooltip.component.*` (selector `sh-tooltip`, `TooltipComponent`).
- Styles: the `.has-tooltip` and `.tooltip` section of `components.css`,
  which already has the hover bridge and `[data-dismissed]`. The component
  adds the Esc listener and the edge clamp.
- Design-system catch-up: D-5 (clamp inside the viewport) and D-7 (forced
  colours border) are not in `components.css` yet:
  `@media (forced-colors: active) { .tooltip { border: var(--border-width-hairline) solid CanvasText; } }`.
  The rendering shows the clamp with a specimen-only style.
- No CDK overlay: the tooltip is positioned in its anchor with CSS so it
  costs nothing until hovered (D-8).
- Composes nothing; wraps [icon button](icon-button.md) or
  [button](button.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Should the CRD exist when no mock uses a tooltip?* Yes. The design system keeps it available for the menu manager's row icons and Close with Esc; specifying it now means adding it later needs no API change to [icon button](icon-button.md), which already has `describedBy`.
- **D-3** *How does a tooltip meet L2-065.3 ("hover information is available by tap")?* By never holding information of its own: its text repeats or shortens the control's name, and tapping the control performs the action it names. The shortcut hint is the only addition, and Esc does not apply on touch.
- **D-4** *How does Esc interact with a dialog?* The first Esc hides a showing tooltip and stops there; with no tooltip showing, Esc passes through and the dialog closes (design system, States).
- **D-5** *What happens at the viewport edge?* The tooltip shifts inward to stay `--layout-margin` from the edge, with the arrow still over the control. The design system says it "does not flip" and asks authors to avoid edge controls; shifting sideways keeps that one placement while meeting L2-064's no-clipping rule.
- **D-6** *Can a disabled control have a tooltip?* No. It cannot take focus, so keyboard users would never see it; the reason a control is disabled is visible text (design system, States).
- **D-7** *How does the tooltip look in forced colours?* Boxed with a `CanvasText` border, because the inverse fill disappears.
- **D-8** *CSS positioning or an overlay primitive?* CSS inside the anchor. The tooltip never needs to escape a clipping parent in the approved places (rows, tiles, dialog headers), and 72 overlays on the menu manager would cost more than 72 hidden spans.
