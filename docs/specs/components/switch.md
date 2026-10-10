# Switch

| Field | Value |
|---|---|
| Selector | `sh-switch` (renders `<label class="switch">` around `<input type="checkbox" role="switch">`) |
| Library path | `frontend/projects/components/src/lib/switch/` |
| Status | planned |
| Traces to | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`switch.html`](../../design-system/components/switch.html) |
| Source mocks | None: no mock uses the switch. The design system keeps it from the base kit (`docs/mocks/assets/ui.css`); see [`dialogs/photo-details/default`](../../mocks/dialogs/photo-details/default.html) and [`pages/account/default`](../../mocks/pages/account/default.html) for where a checkbox is used instead. |
| Rendering | [`switch.html`](switch.html) |

## Purpose and scope

A switch turns one setting on or off the moment it is flipped, with no Save
button, and the change can be undone by flipping it back. It is a pill track
with a sliding thumb; on is pepper red, the brand's "selected" colour.
Sweet Hand has no instant setting today, so no screen uses it; the component
is specified now so the first instant setting gets a ready, accessible answer
rather than a new invention. The labels used here, "Pause new enquiries" and
"Show the live preview", are the design system's illustrations; neither has an
L2 requirement, and adding one needs a requirement, a design and a mock first.

Use something else for anything inside a form that is saved or submitted,
any agreement and any list of options ([checkbox](checkbox.md)), for an
action with consequences such as hiding a caterer page or suspending a
caterer ([button](button.md) opening a confirmation [dialog](dialog.md)),
for a choice between two named views ([button group](button-group.md)), and
for exactly one of several answers ([radio group](radio-group.md)).

Out of scope:

- Saving the setting, reverting it when the server refuses, and the error
  [toast](toast.md) ("We couldn't pause enquiries. Try again."): the consumer
  owns the request and sets `checked` back.
- Announcing a result that is not visible in place ("New enquiries paused"):
  the consumer's polite live region.
- Layout of several settings rows (spacing, dividers): the page.

## Usage

`grep -r 'class="switch' docs/mocks` and `usage_inventory.py docs/mocks switch
"label"` find no use. Every on/off choice in the mocks is inside a form that
autosaves or submits, so it is a [checkbox](checkbox.md). The rows below are
the design system's configurations, which the API must build.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| No mock (design system, *Variants*) | label right (default) | "Show the live preview" | on, off, hover, focus, disabled | canvas |
| No mock (design system, *Variants*) | label right, with description | "Pause new enquiries" / "Your page says you're not taking bookings" | on, off | canvas |
| No mock (design system, *Variants*) | label left, settings row (`labelPosition="start"`) | "Pause new enquiries" + description, track at the row end | on, off | canvas, settings list |
| No mock (design system, *States*) | inside a dialog | any setting | on | dialog (`--color-bg-surface-raised`) |

Places a switch must not be used, kept here so a consumer does not reach for
it: "Use as cover photo" in `dialogs/photo-details` (saved with the dialog,
a checkbox), consent and agreements (checkboxes), hiding or suspending a
caterer (buttons with confirmation).

## Anatomy

1. **Row** — `label.switch`: inline flex, items centred, `--space-3` gap,
   minimum height `--target-comfortable` (44 px) at every width. The whole row
   toggles.
2. **Track** — the native `<input type="checkbox" role="switch">`,
   `appearance: none`, `--target-comfortable` × `--target-min` (44 × 24 px),
   `--radius-full`. Off `--color-border-strong`; on `--color-accent`.
3. **Thumb** — the input's `::before`: `--icon-size-md` circle in
   `--color-bg-surface` with `--shadow-1`, inset `--space-0-5`; it slides
   `--icon-size-md` to the right when on. Not a DOM node.
4. **Text column** — `span.switch__text`, a flex column with `--space-0-5`
   gap: a `<span>` label naming the setting (the accessible name), and an
   optional `<small>` description in `--color-fg-muted`, `--text-body-sm`.

In the label-left settings row the text column comes first and the row is
`label.switch.cluster.cluster--between`, spread to the full width with the
track pinned to the end.

Host: `sh-switch` is layout-transparent (`display: contents`); the classes
and attributes go on the native elements in the light DOM.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `checked` | `boolean` (two-way) | `false` | no | Reflected as the input's `checked` property. The consumer sets it back to revert a refused change. |
| `disabled` | `boolean` | `false` | no | Native `disabled`; the track is drawn at 50 % opacity. Requires `describedBy` pointing at the reason on screen (D-4). |
| `describedBy` | `string \| null` | `null` | no | Appended to `aria-describedby` after the description id. |
| `labelPosition` | `'end' \| 'start'` | `'end'` | no | `end`: track, then text (default). `start`: text, then track, row stretched with `.cluster.cluster--between`. |
| `name` | `string \| null` | `null` | no | Rendered as `name`. Switches are rarely in forms; the name exists for consistency with checkbox. |
| `inputId` | `string \| null` | `null` | no | Rendered as the input's `id`. |
| `description` | `string \| null` | `null` | no | Text of the `<small>` description; the `description` slot is the alternative. Given an id and listed in `aria-describedby` (D-3). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `checkedChange` | `boolean` (the new state) | The person flips the switch by click, tap or <kbd>Space</kbd>. Never for consumer changes (including a revert), never while `disabled`. |

### Methods

| Method | Rule |
|---|---|
| `focus(options?: FocusOptions)` | Focuses the native input. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text | The setting's name, inside `span.switch__text > span`. Required; it is the accessible name and never changes with the state. |
| `[slot=description]` | Text | Rendered in the `<small>`. |

- Boolean inputs accept the bare attribute; `null` / `false` render no
  attribute.
- Translation: the label and description arrive from the consumer's resource
  files (L2-064). The component has no user-facing strings: no "On" / "Off"
  text.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Label end (default) | `label.switch` > input, `.switch__text` | A single setting lined up with the form's left edge like a checkbox. |
| Label start, settings row | `label.switch.cluster.cluster--between` > `.switch__text`, input | A list of settings: the eye reads the setting first; the track sits at the row end. |

One size: a 44 × 24 px track in a row at least 44 px tall. A smaller switch
would miss the phone target; a larger one would outweigh the label. Width:
inline for label end; the container's width for label start.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Off | — | Track `--color-border-strong`, thumb at the start | "switch, off" |
| Off, hover | `:hover` on the row | Track `--color-fg-muted` | — |
| On | `checked` | Track `--color-accent`, thumb slid to the end | "switch, on" |
| On, hover | `:hover` + `checked` | Track `--color-accent-hover` | — |
| Focus | `:focus-visible` | Ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) following the pill | Name, description, state announced |
| Disabled | `disabled` | Track and thumb at 50 % opacity, `cursor: not-allowed`; label at full colour (D-4) | Skipped by Tab; "unavailable"; the reason read through `aria-describedby` |
| Disabled, on | `checked` + `disabled` | As on, at 50 % opacity | "on, unavailable" |
| Refused change | consumer sets `checked` back | Thumb slides back; no error inside the track | Focus stays; the consumer's toast says why |

No invalid, mixed or busy state: a switch cannot hold a wrong value, a parent
of several settings uses checkboxes, and saving is optimistic with no spinner
in the track (design system, *States*). `data-state` and `data-hover` exist in
`components.css` for documentation only.

## Markup

```html
<!-- rendered: label end, off, with a description -->
<label class="switch"><input type="checkbox" role="switch" name="pause-enquiries" aria-describedby="sh-switch-1-desc"><span class="switch__text"><span>Pause new enquiries</span><small id="sh-switch-1-desc">Your page says you're not taking bookings</small></span></label>
```

```html
<!-- rendered: label end, on, no description -->
<label class="switch"><input type="checkbox" role="switch" checked><span class="switch__text"><span>Show the live preview</span></span></label>
```

```html
<!-- rendered: label start, settings row -->
<label class="switch cluster cluster--between"><span class="switch__text"><span>Pause new enquiries</span><small id="sh-switch-2-desc">Your page says you're not taking bookings</small></span><input type="checkbox" role="switch" checked aria-describedby="sh-switch-2-desc"></label>
```

```html
<!-- rendered: disabled with its reason -->
<label class="switch"><input type="checkbox" role="switch" disabled aria-describedby="preview-reason"><span class="switch__text"><span>Show the live preview</span></span></label>
<p class="field__help" id="preview-reason">The preview appears once you add a cover photo.</p>
```

The `role="switch"` attribute is always present; no `aria-checked` is
added (the native checked state maps to on / off).

```html
<!-- consumer: optimistic setting with revert -->
<sh-switch [checked]="paused()" (checkedChange)="setPaused($event)" [description]="t('settings.pause.description')">{{ t('settings.pause.label') }}</sh-switch>
```

The e2e page objects locate the switch by role `switch` and its name, and by
`.switch` and `.switch__text`; those, `role="switch"` and the native
`checked` / `disabled` are the contract. Generated ids are free to change.

## Design

- Row: `display: inline-flex` (flex, full width, for label start),
  `align-items: center`, `gap: --space-3`, `min-height: --target-comfortable`.
- Track `--target-comfortable` × `--target-min`, `--radius-full`.
- Thumb `--icon-size-md`, inset `--space-0-5`, `--shadow-1`, moves
  `--icon-size-md` when on.
- Label `--text-body`; description `--text-body-sm` in `--color-fg-muted`.
- Elevation: the thumb's `--shadow-1` only. Layer: none.
- Motion: track colour and thumb position over `--duration-base` with
  `--ease-standard`.

No component tokens; the switch reads semantic tokens. Re-skin by overriding
`--color-accent` on a wrapper.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Track, off | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Track, off hover | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Track, on | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Track, on hover | `--color-accent-hover` | `--palette-pepper-700` | `--palette-pepper-200` |
| Thumb | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Label | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Description | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Off track against the page |
| `--color-accent` | `--color-bg-surface` | 3:1 | On track against the page |
| `--color-accent` | `--color-bg-surface-raised` | 3:1 | On track in a dialog |
| `--color-bg-surface` | `--color-border-strong` | 3:1 | Thumb on the off track (D-5) |
| `--color-bg-surface` | `--color-accent` | 3:1 | Thumb on the on track (D-5) |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Description |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

The on / off state is shown by the thumb's position as well as the colour, so
it does not rely on colour alone. Forced colours: the on track takes
`Highlight` (`components.css`); the off track and thumb need a `CanvasText`
edge so they do not vanish into `Canvas` (D-6).

## Responsive behaviour

- The switch is the same at every breakpoint; the 44 px row meets L2-065 on
  phones with no phone rule.
- In a label-start row the text wraps and the track stays pinned to the end;
  at 320 px the description may take three lines.
- Never two switches on one line; rows of switches are at least `--space-2`
  apart, so 44 px targets are 8 px apart.
- At 320 px nothing scrolls horizontally; at 200 % zoom the row stays usable.

## Accessibility

### Role and pattern

`role="switch"` on a native checkbox ([APG
Switch](https://www.w3.org/WAI/ARIA/apg/patterns/switch/)): "Pause new
enquiries, switch, off". No `aria-checked`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the switch; disabled switches are skipped. |
| <kbd>Space</kbd> | Toggles and applies the setting (`checkedChange`). |
| <kbd>Enter</kbd> | No effect; it never submits a surrounding form. |

### Focus

The shared ring follows the pill with `--focus-ring-offset`, so it stays
visible against the pepper "on" track. Toggling and a consumer revert keep
focus on the switch.

### Labelling

- The label names the setting, never the action ("Turn on") or the state
  ("Paused"); it does not change when flipped.
- The description is tied by `aria-describedby` (D-3), then `describedBy`.

### Announcements

None from the component. The role announces on / off; the consumer announces
results that are not visible in place.

### Motion

The thumb slide and track fade use `--duration-base`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms; the state still changes.

## Content and internationalisation

- A short positive phrase in sentence case naming the setting: "Pause new
  enquiries", "Show the live preview". No negatives ("Don't show…").
- The description says what customers or the caterer will see when it is on:
  "Your page says you're not taking bookings".
- No "On" / "Off" text beside the track.
- If turning something off loses data or hides a business from customers, it
  is a button and a confirmation, not a switch.
- Translatable: label, description. French runs about 30 % longer; the text
  wraps beside the track and never truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the `aria-describedby`
  list, the row class list) are computed once per input change, not in the
  template.
- One `change` listener; no timers or observers. The thumb moves with a CSS
  `translate`, so flipping causes no layout.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Switch.ts`
  renders a settings list of three label-start rows ("Pause new enquiries"
  with its description, "Show the live preview", one disabled) and flips the
  first; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it
  at roughly 100–300 ms.
- Composite scenario: `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the track has a fixed size; on, off and disabled never
  change the row's dimensions.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given `<sh-switch>` labelled "Show the live preview" and off, when it renders, then the DOM is a `label.switch` containing `<input type="checkbox" role="switch">` without `checked` and a `span.switch__text` whose text is "Show the live preview", and no "On" or "Off" text is present. (L2-064)
- **AC-2** Given "Pause new enquiries" with the description "Your page says you're not taking bookings", when it renders, then the description is a `<small>` in `--color-fg-muted` and is the switch's accessible description. (L2-068)
- **AC-3** Given `labelPosition="start"` at 1280 px, when "Pause new enquiries" renders in a 40rem column, then the text comes first, the track is pinned to the right edge of the column, and clicking the text toggles the switch. (L2-065)

### States

- **AC-4** Given an off switch, when the person clicks it, then it is on, the thumb has moved `--icon-size-md` to the end, the track is `--color-accent`, and `checkedChange` emits `true` once. (L2-069)
- **AC-5** Given the consumer's request to pause enquiries fails after the switch turned on, when the consumer sets `checked` to false, then the switch returns to off, `checkedChange` is not emitted, and keyboard focus stays on the switch. (L2-067)
- **AC-6** Given "Show the live preview" disabled with `describedBy` pointing at "The preview appears once you add a cover photo.", when it renders, then the input has native `disabled`, the track is at 50 % opacity, the label keeps `--color-fg-default`, Tab skips it, and the reason is its accessible description. (L2-068)
- **AC-7** Given the switch is on and the pointer hovers it, when it renders in the light theme, then the track is `--color-accent-hover` and still has at least 3:1 against the surface. (L2-069)

### Keyboard and focus

- **AC-8** Given focus on "Pause new enquiries", when the person presses Space, then the switch toggles and `checkedChange` emits; when they press Enter inside a form, then the switch does not toggle and the form is not submitted. (L2-067)
- **AC-9** Given keyboard focus on an on switch in either theme, when it renders, then a `--focus-ring-width` ring in `--color-focus-ring` follows the pill `--focus-ring-offset` outside the track with at least 3:1 against the surface, and a mouse click shows no ring. (L2-067)

### Screen readers and automated checks

- **AC-10** Given "Pause new enquiries" off, when a screen reader focuses it, then it announces "Pause new enquiries, switch, off" and the description; after Space it announces "on". (L2-068)
- **AC-11** Given a settings list with an off, an on and a disabled switch, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px in both themes, then it reports 0 violations. (L2-066)

### Theming

- **AC-12** Given the light theme, when an off and an on switch render, then the off track `--color-border-strong` and the on track `--color-accent` each have at least 3:1 against `--color-bg-surface`, and the thumb has at least 3:1 against each track. (L2-069)
- **AC-13** Given the dark theme, when an on switch renders in a dialog, then the track resolves to `--palette-pepper-300` with at least 3:1 against `--color-bg-surface-raised`, the thumb to `--palette-stone-950`, and the thumb has at least 3:1 against the track. (L2-069)
- **AC-14** Given the on and off states, when they are compared in greyscale, then they are still distinguished by the thumb's position. (L2-069)

### Responsive

- **AC-15** Given a 360 px viewport, when a switch row renders, then its target (track and label) is at least 44 × 44 CSS px and neighbouring switch rows are at least 8 px apart. (L2-065)
- **AC-16** Given a 320 px viewport, when a label-start "Pause new enquiries" row with its description renders, then the text wraps beside the pinned track with nothing clipped and no horizontal scrolling. (L2-064)
- **AC-17** Given a 1280 px window at 200 % zoom, when a settings list of switches renders, then every switch is readable and operable with no horizontal scrolling. (L2-069)

### Motion

- **AC-18** Given `prefers-reduced-motion: reduce`, when the switch is flipped, then the thumb jumps to its new position and the track colour changes with no visible transition. (L2-069)

### Performance

- **AC-19** Given the `Switch` perf-test scenario, when the first switch is flipped, then the new state is painted within 200 ms of the press (Interaction to Next Paint) with no layout shift, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/switch/`; file
  `switch.component.*`, selector `sh-switch`, class `SwitchComponent`.
- Styles: the `.switch` section of `docs/design-system/assets/components.css`
  and its forced-colours line move into the component; class names reach the
  DOM unchanged.
- Design-system catch-up for D-5: add the two thumb-on-track pairs
  (`--color-bg-surface` on `--color-border-strong` and on `--color-accent`) to
  `tokens/contrast-pairs.json`, as the design-system page says is pending.
- Design-system catch-up for D-6: in `@media (forced-colors: active)` give
  `.switch input` a `CanvasText` hairline border and the thumb a `CanvasText`
  fill when off, so the off state is visible; the rendering shows the light
  and dark look, which forced colours cannot be simulated in.
- Design-system catch-up for D-8: `.cluster` wraps (`flex-wrap: wrap`), so a
  label-start row drops the track under long text at 320 px. Add
  `.switch.cluster--between { display: flex; flex-wrap: nowrap; width: 100%; }`
  and `.switch.cluster--between .switch__text { flex: 1 1 auto; min-width: 0; }`.
  The rendering applies it with a specimen-only style.
- Composes nothing. No product screen composes it yet.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Should a component with no product use be specified?* Yes, in full. The design system keeps the switch "available, unused" so the first instant setting has a ready answer; a complete CRD means that screen needs a requirement and a mock, not a new component API. Its acceptance criteria trace only to the cross-cutting accessibility, layout and performance requirements, because no feature requirement uses it.
- **D-3** *Is the description tied with `aria-describedby`?* Yes. Unlike the checkbox, whose description sits inside its label, the design system keeps the switch's label as the setting's name only ("never the state"); describing rather than naming keeps the announced name short ("Pause new enquiries, switch, off") and still reads the consequence.
- **D-4** *What does disabled dim, and when may it be used?* Only the track and thumb (50 % opacity, per `components.css`); the label stays readable because the design system allows disabling only when the reason is on screen next to it, and `describedBy` must point at that reason.
- **D-5** *Must the thumb contrast with the track?* Yes, 3:1 against both tracks (WCAG 1.4.11), as the design-system page states; both pairs pass in both themes and are rendered live in [`switch.html`](switch.html).
- **D-6** *How does the switch look in forced colours?* The on track is `Highlight`; the off track and thumb get a `CanvasText` edge and fill, because forced colours replace backgrounds with `Canvas` and the off switch would otherwise disappear.
- **D-7** *Is there a busy state while the setting saves?* No. The design system makes saving optimistic with no spinner in the track; a refused change is reverted by the consumer setting `checked`, which does not emit `checkedChange`, and explained by a toast.
- **D-8** *Can the track wrap under the text in a label-start row?* No. The design system says the text wraps and the track stays pinned to the end, but `.cluster` wraps its children, which at 320 px puts the track on its own line under "Pause new enquiries"; the row is `nowrap` with a shrinking text column so the stated behaviour holds.
