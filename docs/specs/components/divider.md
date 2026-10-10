# Divider

| Field | Value |
|---|---|
| Selector | `sh-divider` |
| Library path | `frontend/projects/components/src/lib/divider/` |
| Status | planned |
| Traces to | L2-064, L2-066, L2-067, L2-068, L2-069 |
| Design system | [`divider.html`](../../design-system/components/divider.html) |
| Source mocks | [`dialogs/account-menu/default`](../../mocks/dialogs/account-menu/default.html), [`dialogs/account-menu/caterer`](../../mocks/dialogs/account-menu/caterer.html), [`dialogs/account-menu/operator`](../../mocks/dialogs/account-menu/operator.html), [`pages/caterer/default`](../../mocks/pages/caterer/default.html) |
| Rendering | [`divider.html`](divider.html) |

## Purpose and scope

A divider is a 1 px line between two groups that sit in one container where
space alone does not separate them: a thematic break inside long prose (the
privacy notice moving from what Sweet Hand collects to who sees it), a quiet
rule between two ghost actions ("Edit" | "Preview my page"), or a labelled
break in a long list ("Closed enquiries"). Sweet Hand separates with white
space first and with the row separators built into components second; a
standalone divider is the rare third choice.

Use something else between page sections (space: `--layout-section-gap`, see
[container](container.md)), between list rows (the row component draws its own
rule: [dish](dish.md), [list](list.md), [inbox row](inbox-row.md), [queue
item](queue-item.md), [table](table.md), [description
list](description-list.md)), between inline facts ("Sat 21 Nov · 120 guests ·
Scarborough" uses the middle dot) or to start a group people navigate by (a
heading).

Out of scope:

- Row separators: borders on the row components, not divider elements.
- The account menu's rule, `.menu__divider`: an element of the
  [menu](menu.md) block, rendered by the menu (D-3). This CRD states the rules
  it shares.
- Rules on the [sheet](sheet.md) header and footer, the [sticky
  CTA](sticky-cta.md) top edge, chart cards and toasts: borders of those
  components.

## Usage

Inventory from `usage_inventory.py docs/mocks divider "div|span|hr"` and a
search for `<hr` and `menu__divider` in `docs/mocks/`: no mock uses `<hr>`,
`.divider` or its modifiers; the only standalone rule is `.menu__divider` in
the three account menus. The other rows come from the design-system page and
are specified so the first screen that needs them adopts them without an API
change (D-2).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/account-menu/default`, `caterer`, `operator` | `.menu__divider` rendered by [menu](menu.md) between "Kendra Baptiste" / "kendra@pelauhouse.example" and the menu items | — | default | raised (menu) |
| Design system: prose break (privacy, terms, about) | horizontal, semantic (`<hr>`) | — | default | canvas |
| Design system: two ghost actions | vertical, between "Edit" and "Preview my page" in a `.cluster` | — | default; hidden below 36rem (D-5) | canvas, dialog |
| Design system: grouped long list | labelled | "Closed enquiries", "Earlier" | default | canvas, raised, sunken well |
| Design system states matrix | horizontal, vertical, labelled | — | default | canvas, `--color-bg-surface-raised`, `--color-bg-surface-sunken` |

## Anatomy

1. **Rule** — a `--border-width-hairline` top border (left border when
   vertical) in `--color-border-default`. No background, no shadow, no radius.
2. **Spacing** — `--space-6` above and below a horizontal divider;
   `--space-3` left and right of a vertical one.
3. **Label (optional)** — `.divider--label`: centred `--text-body-sm` text in
   `--color-fg-muted`, with a flexible rule on each side (`::before`,
   `::after`) and `--space-3` between rule and text.

Host: `sh-divider` is layout-transparent (`display: contents`) and renders one
native element chosen by its inputs (see *Markup*), so a vertical divider is a
real flex item of its row and `align-self: stretch` works (D-4).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `orientation` | `'horizontal' \| 'vertical'` | `'horizontal'` | no | `'vertical'` renders `span.divider.divider--vertical` with `aria-hidden="true"`; only valid inside a flex row (`.cluster`). |
| `label` | `string \| null` | `null` | no | Horizontal only. When set, renders `div.divider.divider--label` with `role="separator"`, `aria-label` equal to the label, and the label as its text. Ignored (and a development warning logged) when `orientation` is `'vertical'`. |
| `decorative` | `boolean` | `false` | no | Horizontal, unlabelled only. `false` renders `<hr>` (a thematic break, exposed as a separator). `true` renders `div.divider` with `aria-hidden="true"` (a purely visual line). |

### Outputs

None. A divider is not interactive.

### Content slots

None. The label is an input so that the separator's accessible name and its
visible text are always the same string.

- Translation: `label` arrives from the consumer, from the resource files
  (L2-064).

## Variants and sizes

| Variant | Element and modifier | Use for |
|---|---|---|
| Horizontal, semantic | `<hr>` | A real thematic break inside prose or a long form section. |
| Horizontal, decorative | `div.divider` + `aria-hidden` | A visual line where the break carries no meaning for assistive technology. |
| Vertical | `span.divider.divider--vertical` + `aria-hidden` | Between two ghost actions in one row. |
| Labelled | `div.divider.divider--label` + `role="separator"` | A named break in a long list ("Closed enquiries"). Prefer a heading when people navigate by the groups. |

One weight (1 px) at every size; only the spacing changes:

| Divider | Thickness | Spacing | Length |
|---|---|---|---|
| `hr`, `.divider` | `--border-width-hairline` | `--space-6` above and below | Full width of its container |
| `.divider--vertical` | `--border-width-hairline` | `--space-3` left and right | Stretches to the row; at least `--icon-size-md` |
| `.divider--label` | `--border-width-hairline` rules | `--space-6` block, `--space-3` around the label | Full width |
| `.menu__divider` (menu) | `--border-width-hairline` | `--space-1` above and below | Menu width |

## States

The divider is not interactive: it has no hover, focus, active, disabled or
loading state. It appears on three surfaces, with the same tokens on each:

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default, on the page | — | `--color-border-default` rule on `--color-bg-canvas` | `<hr>`: separator; decorative and vertical: hidden; labelled: separator named by the label |
| On a raised surface | inside a dialog, menu or popover | Same rule on `--color-bg-surface-raised` | Same |
| On a sunken well | inside `.well` | Same rule on `--color-bg-surface-sunken` | Same |
| Vertical below 36rem | viewport narrower than 36rem | Not displayed (D-5) | Already hidden |

## Markup

```html
<!-- rendered: horizontal, semantic (default) -->
<hr>
```

```html
<!-- rendered: horizontal, decorative -->
<div class="divider" aria-hidden="true"></div>
```

```html
<!-- rendered: vertical, between two ghost actions -->
<div class="cluster" style="gap: 0;">
  <button class="btn btn--ghost btn--sm" type="button">Edit</button>
  <span class="divider divider--vertical" aria-hidden="true"></span>
  <button class="btn btn--ghost btn--sm" type="button">Preview my page</button>
</div>
```

```html
<!-- rendered: labelled -->
<div class="divider divider--label" role="separator" aria-label="Closed enquiries">Closed enquiries</div>
```

```html
<!-- consumer -->
<sh-divider></sh-divider>
<sh-divider decorative></sh-divider>
<sh-divider orientation="vertical"></sh-divider>
<sh-divider [label]="t('inbox.closedGroup')"></sh-divider>
```

The `.cluster` and its `gap: 0` in the vertical example belong to the
consumer's row (the divider supplies its own `--space-3` margins). The e2e
page objects locate dividers by `hr`, `.divider` and `[role="separator"]`;
those and the `aria-hidden` attribute are part of the contract.

## Design

- Rule `--border-width-hairline` solid `--color-border-default`; `border: 0`
  first so the native `<hr>` bevel is removed.
- Margins `--space-6` block (horizontal and labelled), `--space-3` inline
  (vertical); vertical `align-self: stretch` with `min-height:
  --icon-size-md`.
- Label `--text-body-sm`, `--color-fg-muted`; flex row with `--space-3` gap;
  rules `flex: 1`.
- No elevation, motion or layer.
- `--color-border-strong` is never used: that weight is reserved for control
  edges, so a divider never looks like an input. On inverse surfaces (a
  toast) the component that owns the surface uses `--color-border-inverse`.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Rule | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Rule on inverse surfaces (owners only) | `--color-border-inverse` | `--palette-stone-700` | `--palette-stone-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Label on the page |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Label in a dialog or menu |
| `--color-fg-muted` | `--color-bg-surface-sunken` | 4.5:1 | Label in a well |

The rule is decorative: the grouping is also carried by space and order, so
the 3:1 non-text minimum does not apply to it (WCAG 1.4.11; design system,
Accessibility). `prefers-contrast: more` maps `--color-border-default` to the
strong border; forced colours map it to `CanvasText`, so the rule stays
visible in both.

## Responsive behaviour

- Horizontal and labelled dividers span their container at every width; their
  spacing does not change.
- Below 36rem the vertical divider is not displayed (D-5): a row that wraps
  would leave it dangling at a line end. The row's own gap separates the
  actions instead.
- Labels are two or three words and fit on one line at 320 px; a longer
  translated label wraps inside the centre, between the two rules, and never
  overflows.
- At 320 px nothing scrolls horizontally or clips; at 200 % zoom everything
  stays visible. Dividers are not targets; a vertical divider never counts
  toward the 8 px between two touch targets — the actions keep that gap
  themselves.

## Accessibility

### Role and pattern

`<hr>` has the implicit `separator` role (a thematic break); it is used only
when the break means something. A purely visual line (decorative, vertical)
is `aria-hidden="true"`. A labelled divider is `role="separator"` with
`aria-label` equal to its text ([WAI-ARIA
separator](https://www.w3.org/TR/wai-aria-1.2/#separator)); a separator is
never focusable, because a focusable separator is a splitter, which Sweet Hand
does not use.

### Keyboard

| Key | Action |
|---|---|
| None | Dividers are not focusable and are skipped by <kbd>Tab</kbd>. |

### Focus

Not focusable. The `--space-6` and `--space-3` margins keep rules clear of
neighbouring controls' focus rings.

### Labelling

The labelled divider's name is its visible text, exactly. When people need
the label to navigate (a list of closed enquiries they jump to), use a heading
instead: headings appear in the screen reader's headings list; separators do
not.

### Announcements

None.

### Motion

None.

## Content and internationalisation

- Labels are two or three words in sentence case, Canadian English: "Closed
  enquiries", "Earlier".
- Never "or" between two equal paths: Sweet Hand shows one primary path and a
  quiet link for the other ("Already have an account? Sign in").
- Inline facts use the middle dot with spaces: "Sat 21 Nov · 120 guests ·
  Family gatherings", never vertical dividers.
- Translatable input: `label`. French runs about 30 % longer ("Demandes
  fermées"); the label wraps between the rules rather than overflowing.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (which element, which
  attributes) are computed once per input change, not in the template.
- No listeners, timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Divider.ts`
  renders the privacy notice with two semantic breaks, the "Edit" |
  "Preview my page" row with a vertical divider, and Marcia's inbox with the
  labelled "Closed enquiries" divider; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: fixed 1 px plus fixed margins; nothing loads.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given `<sh-divider>` with no inputs between two privacy-notice paragraphs, when it renders, then the DOM is a single `<hr>` with no class, drawn as a `--border-width-hairline` rule in `--color-border-default` with `--space-6` above and below, exposed as one separator, and axe-core reports 0 violations for the page. (L2-066)
- **AC-2** Given `<sh-divider decorative>`, when it renders, then it is `<div class="divider" aria-hidden="true"></div>` and the accessibility tree contains no separator for it. (L2-068)
- **AC-3** Given `<sh-divider orientation="vertical">` between the ghost buttons "Edit" and "Preview my page" in a `.cluster` at 1280 px, when it renders, then it is `<span class="divider divider--vertical" aria-hidden="true">`, a 1 px rule as tall as the buttons with `--space-3` on each side. (L2-068)
- **AC-4** Given `<sh-divider label="Closed enquiries">`, when it renders, then it is `div.divider.divider--label` with `role="separator"` and `aria-label="Closed enquiries"`, showing "Closed enquiries" centred with a rule on each side. (L2-068)
- **AC-5** Given a labelled divider and a decorative divider on Marcia's inbox, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px, then it reports 0 violations. (L2-066)

### Keyboard and focus

- **AC-6** Given the "Edit" | "Preview my page" row with a vertical divider and a labelled divider below it, when a keyboard user tabs through, then focus moves from "Edit" to "Preview my page" and on, never stopping on a divider. (L2-067)

### Screen readers

- **AC-7** Given the labelled divider "Closed enquiries", when a screen reader moves through Marcia's inbox, then it announces a separator named "Closed enquiries" once, and does not read the text a second time. (L2-068)

### Theming

- **AC-8** Given the light and the dark theme, when "Closed enquiries" renders on the page, in a dialog and in a well, then the label has at least 4.5:1 contrast against `--color-bg-canvas`, `--color-bg-surface-raised` and `--color-bg-surface-sunken`. (L2-069)
- **AC-9** Given the dark theme, when a horizontal divider renders, then its rule resolves to `--palette-stone-750`, not `--color-border-strong`. (L2-069)

### Responsive

- **AC-10** Given a 360 px viewport, when the "Edit" | "Preview my page" row renders, then the vertical divider is not displayed and the two buttons keep at least 8 px between them; given 600 px, then it is displayed. (L2-064)
- **AC-11** Given a 320 px viewport, when the labelled divider renders with the French label "Demandes fermées", then the label stays on one line between two visible rules and the page does not scroll horizontally. (L2-064)
- **AC-12** Given a 1280 px window at 200 % zoom, when the privacy notice with its semantic breaks renders, then every rule spans its container and no text overlaps a rule. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/divider/`; file
  `divider.component.*`, class `DividerComponent`, selector `sh-divider`.
- Styles: the `hr, .divider` section of `components.css` moves into the
  component; `hr` stays styled globally too, because prose from the resource
  files may contain a plain `<hr>`.
- Design-system catch-up for D-5: add
  `@media (max-width: 35.99rem) { .divider--vertical { display: none; } }`.
  The rendering shows it with a specimen-only style.
- `.menu__divider` stays in the menu block and is rendered by
  [menu](menu.md) (D-3).
- Composes nothing; no CDK primitive.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Is a component built although no mock uses `<hr>` or `.divider`?* Yes. The design system marks it stable, and information pages and long lists are where it lands next; building it now keeps those screens from inventing their own rules.
- **D-3** *Does `sh-divider` render the account menu's rule?* No. `.menu__divider` is an element of the menu block with its own tighter `--space-1` spacing, so [menu](menu.md) renders it. It follows this CRD's colour and decorative rules (a `div` with a border, no role).
- **D-4** *Is the host the native element, as for container and accordion?* No. The element differs by input (`hr`, `div`, `span`), so the host is layout-transparent (`display: contents`) and renders one native element; the vertical rule is still a flex item of its row.
- **D-5** *What happens to a vertical divider when its row wraps on a phone?* It is not displayed below 36rem. The design system says to drop it there because it dangles at a line end; doing it in the component's CSS means no consumer can forget.
- **D-6** *Is the label a slot?* No, an input. The separator's `aria-label` must equal its visible text; one string for both cannot drift.
- **D-7** *Must the rule meet 3:1?* No. It is decorative: grouping is also carried by space and order (WCAG 1.4.11), as the design system states. The label is text and meets 4.5:1.
