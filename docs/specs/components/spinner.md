# Spinner

| Field | Value |
|---|---|
| Selector | `sh-spinner` |
| Library path | `frontend/projects/components/src/lib/spinner/` |
| Status | planned |
| Traces to | L2-012, L2-016, L2-064, L2-066, L2-067, L2-068, L2-069, L2-077, L2-085 |
| Design system | [`spinner.html`](../../design-system/components/spinner.html) |
| Source mocks | [`dialogs/photo-viewer/busy`](../../mocks/dialogs/photo-viewer/busy.html), [`pages/verify-email/loading`](../../mocks/pages/verify-email/loading.html), [`pages/caterers/default`](../../mocks/pages/caterers/default.html) (area search) |
| Rendering | [`spinner.html`](spinner.html) |

## Purpose and scope

A spinner is a thin stone ring with an ink arc that turns once every 800 ms,
paired with words that say what is being waited for. It is the least
informative loading indicator, so Sweet Hand uses it sparingly: in the round
placeholder when the photo viewer moves to a photo that has not loaded yet
("Loading photo 3 of 6"), and inline with a short status line while something
small is checked ("Looking up M1B 2K3…", "Verifying your email…"). It
appears only after 300 ms and never flickers.

Use something else when content loads into a known layout (listing, inbox,
queue, dashboard): [skeleton](skeleton.md). When the amount is measurable (an
upload): [progress](progress.md). When an action is in flight on a button:
the [button](button.md)'s own busy state, which draws its spinner with CSS;
never put `sh-spinner` inside a button. When autosave is in flight: the save
status line with its pulsing dot ([inline message](inline-message.md)).

Out of scope:

- The busy region: the consumer sets `aria-busy="true"` on the region being
  loaded (the viewer stage) and removes it when done.
- The round photo placeholder the viewer spinner sits in: [photo](photo.md)
  renders `.photo.photo--placeholder`; the spinner is its content.
- The button's busy spinner (`.btn[aria-busy="true"]::after`): [button](button.md).
- What replaces a spinner after 10 seconds ("Still loading. Try again"): the
  consumer, told by the `slow` output.

## Usage

Inventory from `usage_inventory.py docs/mocks spinner` (one product use) and
the design-system page, which documents the inline variant from the mock
kit's `.inline-status`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `dialogs/photo-viewer/busy` | standalone, lg, inside the round viewer placeholder | hidden label "Loading photo 3 of 6"; caption "Spiced rice lifted from a blue cast-iron pot" already shown beside it | delayed 300 ms, spinning, done | viewer stage, `--color-bg-photo` disc |
| Listing area search (`pages/caterers` toolbar, design system) | inline, sm | visible "Looking up M1B 2K3…" | delayed, spinning, done | canvas |
| `pages/verify-email/loading` (design system inline example) | inline, md | visible "Verifying your email…" | delayed, spinning, done | canvas |
| Dialog bodies and sunken wells (design-system surface matrix) | any size | — | spinning | surface, sunken, subtle |

Not built by this component:

- `role="img" aria-label="Loading photo 3 of 6"` on the viewer placeholder is
  drift; the words go in the spinner's `role="status"` (D-3).
- The busy spinners in `dialogs/enquiry/busy` and
  `pages/profile-certificate/saving` are the button's.

## Anatomy

1. **Status wrapper** — `span` with `role="status"` (standalone) or
   `p.inline-status` with `role="status"` (inline). Present from the moment
   the component exists, empty until the delay passes, so the text insertion
   is announced.
2. **Ring** — `span.spinner` (`aria-hidden="true"`): a circle with a
   `--border-width-thick` track in `--color-border-default` and the top
   quarter in `--color-fg-default`, turning linearly once per
   `--duration-loop-fast`. Size from `.spinner--sm` / default / `.spinner--lg`.
3. **Label** — the words: `span.visually-hidden` (standalone) or the visible
   text after the ring (inline).

Host: `sh-spinner` is layout-transparent (`display: contents`) and renders
the wrapper in the light DOM, so a parent such as `.photo--placeholder`
(`display: grid; place-items: center`) centres the ring directly.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | What is loading: "Loading photo 3 of 6", "Looking up M1B 2K3…". Never "Loading…" alone. |
| `variant` | `'standalone' \| 'inline'` | `'standalone'` | no | Standalone hides the label (`.visually-hidden`); inline renders `p.inline-status` with the label visible after the ring. Never both visible and hidden. |
| `size` | `'sm' \| 'md' \| 'lg'` | `'md'` | no | `sm` adds `.spinner--sm` (16 px, beside `--text-body-sm`); `md` none (20 px, beside body text); `lg` adds `.spinner--lg` (40 px, in photo placeholders and empty regions). |
| `active` | `boolean` | `true` | no | While true, the ring and label appear after `delay`; when false, they stay until `minVisible` has passed since they appeared, then go (D-2). |
| `delay` | `number` (ms) | `300` | no | Wait before showing. Whole number 0–1000. |
| `minVisible` | `number` (ms) | `600` | no | Once shown, the shortest time it stays. Whole number 0–2000. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `idle` | `void` | `active` turned false and the spinner is no longer shown (at once if it never appeared, otherwise after `minVisible`). The consumer swaps in the content on this event. |
| `slow` | `void` | `active` has been true for 10 seconds. The consumer replaces the spinner with words and a way out ("Still loading. Try again"). Emitted once per activation. |

### Content slots

None. The label arrives as an input.

- Translation: `label` comes from the resource files through the consumer,
  with data inserted ("photo 3 of 6", "M1B 2K3") (L2-064).

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Standalone | `span[role=status]` > ring + hidden label | Centred in the box the content will fill: the viewer's round placeholder. |
| Inline | `p.inline-status[role=status]` > ring + visible label | A short status line: "Looking up M1B 2K3…", "Verifying your email…". |

| Size | Modifier | Diameter | Beside |
|---|---|---|---|
| sm | `.spinner--sm` | `--icon-size-sm` (16 px) | `--text-body-sm` |
| md | — | `--icon-size-md` (20 px) | body text |
| lg | `.spinner--lg` | `--space-10` (40 px) | photo placeholders, empty regions |

The ring width is `--border-width-thick` (2 px) at every size (D-4). Size
never changes by breakpoint.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Waiting (first 300 ms) | `active` true, `delay` not passed | Nothing; the wrapper is empty | Empty status region, nothing announced |
| Spinning | `delay` passed | Ring turns once per `--duration-loop-fast`, linear; label shown (inline) | Label inserted into `role="status"`, announced politely once |
| Ending early | `active` false before `minVisible` | Ring keeps turning until 600 ms after it appeared | Unchanged |
| Done | `active` false and `minVisible` passed | Ring and label removed together; `idle` emitted | Region emptied; the arriving content (the photo's caption) speaks for itself |
| Slow | 10 s active | Unchanged; `slow` emitted for the consumer | — |
| Reduced motion | `prefers-reduced-motion: reduce` | Keeps turning (it is status, not decoration) | — |
| On a surface | inside `.dialog`, a sunken well, a subtle row, a photo placeholder | Same ring; the arc keeps 3:1 against each | — |

The spinner has no hover, focus, disabled or selected state; it is never
interactive.

## Markup

```html
<!-- rendered: standalone, lg, in the viewer's round placeholder, after 300 ms -->
<div class="viewer__stage" aria-busy="true">
  <button class="icon-btn" type="button" aria-label="Previous photo">…</button>
  <span class="photo photo--placeholder">
    <span role="status"><span class="spinner spinner--lg" aria-hidden="true"></span><span class="visually-hidden">Loading photo 3 of 6</span></span>
  </span>
  <button class="icon-btn" type="button" aria-label="Next photo">…</button>
</div>
```

```html
<!-- rendered: standalone, first 300 ms (wrapper present, empty) -->
<span role="status"></span>
```

```html
<!-- rendered: inline, sm, visible label -->
<p class="inline-status" role="status"><span class="spinner spinner--sm" aria-hidden="true"></span>Looking up M1B 2K3…</p>
```

The md size differs only by having no size modifier.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: photo viewer -->
<span class="photo photo--placeholder">
  <sh-spinner size="lg" [label]="t('viewer.loading', { n: 3, total: 6 })" [active]="!photoReady()" (idle)="showPhoto()"></sh-spinner>
</span>

<!-- consumer: postal code lookup -->
<sh-spinner variant="inline" size="sm" [label]="t('search.lookingUp', { code: 'M1B 2K3' })" [active]="lookingUp()" (slow)="showStillLoading()"></sh-spinner>
```

The e2e page objects locate the spinner by `.spinner` and its status text;
those are the contract.

## Design

- Ring: `display: inline-block`, square at the size's diameter,
  `border: --border-width-thick solid --color-border-default`,
  `border-top-color: --color-fg-default`, `border-radius: 50%`,
  `flex: none` (inline spinners never wrap away from their first line).
- Motion: `spin` keyframes over `--duration-loop-fast` (800 ms), linear,
  infinite.
- Inline row: `.inline-status` (`inline-flex`, gap `--space-2`,
  `--text-body-sm`, `--color-fg-muted`).
- No elevation, layer or component tokens. On an inverse surface the parent
  sets `color` and the arc uses `border-top-color: currentColor`, as the
  button's busy state does.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Arc | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Track | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Inline label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Placeholder behind (viewer) | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |

Contrast pairs (WCAG 1.4.11: the arc is a graphical object meaning
"working"; the track is decorative; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 3:1 | Arc on the page |
| `--color-fg-default` | `--color-bg-surface` | 3:1 | Arc on a card or dialog |
| `--color-fg-default` | `--color-bg-surface-sunken` | 3:1 | Arc in a sunken well |
| `--color-fg-default` | `--color-bg-photo` | 3:1 | Arc in the viewer placeholder (D-5) |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Inline label |

The arc is ink, never pepper: a red arc reads as an error or a selection on
screens where pepper marks the current filter. Forced colours: borders take
`CanvasText`, so the arc and track merge; the words still say what is
happening.

## Responsive behaviour

- Size never changes by breakpoint; a 20 px ring reads the same on a phone
  and a 1440 px screen.
- Standalone spinners centre in the box the content will occupy (the round
  viewer photo is full width on XS, the lead photo size from 48rem), so the
  layout does not move when the content arrives.
- Inline spinners stay on the label's first line (`flex: none`); a long label
  wraps beside the ring at 320 px without horizontal scroll.

## Accessibility

### Role and pattern

The ring is `aria-hidden="true"`. The words live in a `role="status"`
element (a polite live region, WCAG 4.1.3) that exists before the text is
inserted. The consumer sets `aria-busy="true"` on the region being loaded.
There is no APG pattern for spinners; this follows the APG live-region
guidance and Understanding 4.1.3.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips the spinner; it is never focusable. Controls around it ("Previous photo", "Next photo", "Close photo viewer") stay operable while it turns. |

### Focus

A spinner never takes or moves focus. When the content arrives, focus stays
where the person left it ("Next photo").

### Labelling

Say what is loading: "Loading photo 3 of 6", "Looking up M1B 2K3…". The
words are visually hidden for a standalone spinner and visible for an inline
one, never both. The ring never has `role="img"` or an `aria-label`.

### Announcements

The label is announced once, politely, when it is inserted after the delay.
Nothing is announced when the spinner goes; the content that arrives (the
next photo's caption, the area name) announces itself.

### Motion

The spinner keeps turning under `prefers-reduced-motion: reduce`. It reports
status: a still ring would read as frozen, and the turn is slow, linear and
small and stops as soon as the content arrives. `--duration-loop-fast` is
deliberately not zeroed by `tokens.css`.

## Content and internationalisation

- Name the thing: "Loading photo 3 of 6", "Looking up M1B 2K3…", "Verifying
  your email…". Not "Loading…" or "Please wait".
- Present participle plus an ellipsis character (…) for visible text; no
  exclamation marks; no time estimates.
- Translatable input: `label`. Data inside it: photo positions, postal codes
  (formatted "M1B 2K3"), email-free wording.
- French runs about 30 % longer ("Recherche de M1B 2K3…"); inline labels wrap
  beside the ring.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the visible state is derived once per timer
  tick, not in the template.
- Timers: one for `delay`, one for `minVisible`, one for the 10-second
  `slow`; all cleared when `active` turns false or the component is destroyed.
  The rotation is a CSS animation on the compositor (`rotate`), no JavaScript.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Spinner.ts`
  renders the photo viewer moving to photo 3 of 6 of Pelau House ("Spiced
  rice lifted from a blue cast-iron pot") with the lg spinner, toggling
  `active`; iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep
  it at roughly 100–300 ms.
- Composite scenarios: `PhotoViewer`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the standalone spinner sits inside a placeholder of the
  final photo size; the inline status line keeps its height whether or not
  the ring shows (the empty wrapper reserves no height, so the consumer
  places it where a line already exists).
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given `sh-spinner` with the label "Loading photo 3 of 6" and default inputs, when 300 ms have passed, then it renders `span[role="status"]` containing `span.spinner` with `aria-hidden="true"` and `span.visually-hidden` with the label, and the ring has no `role` or `aria-label`. (L2-068)
- **AC-2** Given Marcia viewing Pelau House's photos moves to photo 3 of 6 and it has not loaded after 300 ms, when the viewer stage renders, then a large (40 px) spinner is centred in a round placeholder the size of the coming photo, the caption "Spiced rice lifted from a blue cast-iron pot" and "3 of 6" are already shown, and "Loading photo 3 of 6" is announced once. (L2-016)
- **AC-3** Given the viewer spinner is turning, when Marcia presses Right Arrow or Left Arrow, then the viewer moves to the next or previous photo without waiting for photo 3. (L2-016)
- **AC-4** Given the viewer spinner is turning and focus is on "Next photo", when Tab is pressed, then focus moves to the next control and never to the spinner; when photo 3 arrives, focus is still where it was. (L2-067)
- **AC-5** Given a visitor searches the listing for "M1B 2K3", when the lookup takes longer than 300 ms, then an inline small spinner (16 px) shows before the visible text "Looking up M1B 2K3…" in `p.inline-status[role="status"]`, and the listing then filters to caterers serving Scarborough. (L2-012)
- **AC-6** Given Beverley Campbell opens her verification link, when the check takes longer than 300 ms, then an inline medium spinner (20 px) with the visible text "Verifying your email…" shows until the result replaces it. (L2-077)

### States

- **AC-7** Given the next photo is preloaded and arrives in 120 ms, when Marcia moves to it, then no `.spinner` element is ever rendered and nothing is announced. (L2-085)
- **AC-8** Given a spinner that appeared at 300 ms, when `active` turns false at 400 ms, then the ring stays until 900 ms (600 ms after it appeared), `idle` is emitted then and not before, and the photo is swapped in on `idle`. (L2-085)
- **AC-9** Given `active` stays true for 10 seconds, when the tenth second passes, then `slow` is emitted once and the consumer replaces the spinner with the text "Still loading." and a "Try again" button. (L2-068)
- **AC-10** Given the viewer while photo 3 loads, when axe-core runs at XS and XL in both themes, then it reports 0 violations. (L2-066)

### Theming

- **AC-11** Given the light theme, when the spinner renders on the canvas, a dialog surface, a sunken well and the viewer's `--color-bg-photo` placeholder, then the arc (`--color-fg-default`) has at least 3:1 against each. (L2-069)
- **AC-12** Given the dark theme, when the spinner renders, then the arc resolves to `--palette-stone-100` and the track to `--palette-stone-750`, the arc keeps at least 3:1 against the canvas and the placeholder, and no pepper colour is used. (L2-069)
- **AC-13** Given any spinner, when it is shown, then its meaning is also given in words in its status region, so the ring's colour and motion are never the only signal. (L2-069)

### Responsive

- **AC-14** Given a 320 px viewport and the French label "Recherche du code postal M1B 2K3…", when the inline spinner renders, then the ring stays on the first line, the label wraps beside it, and the page does not scroll horizontally. (L2-064)

### Motion

- **AC-15** Given `prefers-reduced-motion: reduce`, when a spinner is shown, then it keeps turning with `animation-name` `spin`, a duration equal to `--duration-loop-fast` (800 ms) and linear timing. (L2-069)

### Content

- **AC-16** Given the component source, when it is scanned for user-facing string literals, then none are found; every label arrives through `label` from the resource files. (L2-064)

### Performance

- **AC-17** Given the viewer moving from photo 2 to photo 3 with a spinner, when photo 3 replaces the placeholder, then the layout shift of the stage is 0, and the `Spinner` perf-test scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/spinner/`; files
  `spinner.component.*`, class `SpinnerComponent`, selector `sh-spinner`.
- Styles: the `.spinner` section and the `spin` keyframes of `components.css`
  move into the component's stylesheet; `.inline-status` and
  `.visually-hidden` stay global foundations.
- Design-system catch-up: the page's text says the large ring is 3 px, but no
  3 px border token exists and `components.css` draws 2 px (D-4); the page's
  text should say 2 px. Add `--color-fg-default` on `--color-bg-photo` to
  `contrast-pairs.json` (D-5).
- Mock catch-up: the viewer placeholder drops `role="img"` and
  `aria-label`; the ring gets `aria-hidden`.
- Composed by [photo](photo.md) placeholders in the photo viewer and by the
  listing's area search; composes nothing. No CDK primitive.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Who enforces the 300 ms delay and the 600 ms minimum?* The component, through `active`, `delay`, `minVisible` and the `idle` output. Every use needs the same timing (design system, States), and putting it in each consumer would let one forget it; `idle` lets the consumer hold the content until the ring can go without flicker.
- **D-3** *Where does `role="status"` go?* On the spinner's own wrapper, not on the photo placeholder as the design-system snippet shows. The component then works the same anywhere, the placeholder keeps being a plain [photo](photo.md), and the announcement is unchanged. The viewer mock's `role="img"` label is drift.
- **D-4** *How thick is the large ring?* `--border-width-thick` (2 px), as `components.css` draws it. The design-system text says 3 px, but there is no 3 px border token and tokens are the source of truth.
- **D-5** *Is the arc on the photo placeholder checked?* Yes. The design system lists it as "not yet a checked pair"; the viewer is the main use, so the CRD requires 3:1 there and the pair is added to `contrast-pairs.json`.
- **D-6** *Does the spinner announce when it ends?* No. The arriving content announces itself (the next caption, the filtered count); a "Loaded" message would be noise.
- **D-7** *What happens after 10 seconds?* The spinner emits `slow` once; the consumer replaces it with words and a way out, using an error [empty state](empty-state.md) if the request then fails. The spinner itself never changes its label, so the status is not re-announced on a timer.
