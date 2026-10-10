# Progress

| Field | Value |
|---|---|
| Selector | `sh-progress` (the bar), `sh-meter` (label row and bar) |
| Library path | `frontend/projects/components/src/lib/progress/` |
| Status | planned |
| Traces to | L2-038, L2-039, L2-041, L2-045, L2-064, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 |
| Design system | [`progress.html`](../../design-system/components/progress.html) |
| Source mocks | [`pages/dashboard/empty`](../../mocks/pages/dashboard/empty.html), [`pages/dashboard/draft`](../../mocks/pages/dashboard/draft.html), [`dialogs/submit-profile/default`](../../mocks/dialogs/submit-profile/default.html), [`dialogs/submit-profile/invalid`](../../mocks/dialogs/submit-profile/invalid.html), [`dialogs/withdraw-submission/default`](../../mocks/dialogs/withdraw-submission/default.html), [`pages/profile-photos/uploading`](../../mocks/pages/profile-photos/uploading.html) |
| Rendering | [`progress.html`](progress.html) |

## Purpose and scope

A progress bar is an 8 px rounded track with an ink fill that shows how far
something measurable has got. Sweet Hand uses it in two ways. A **transfer
bar** sits under each photo while it uploads ("IMG_2076.heic", 64 %) and ends
when the photo is in. The **setup meter** is a label row ("Ready to submit" ·
"8 of 10 done") above a bar on Auntie Bev's Kitchen's dashboard and in the
submit-profile dialog; it counts finished checklist items and moves only when
the caterer completes one. When the amount is unknown ("Processing
IMG_2077.heic" while image processing catches up) the bar sweeps
indeterminately.

Use something else when the wait is short and has no measurable amount (a
button saving, a photo loading in the viewer): the [button](button.md)'s busy
state or a [spinner](spinner.md). When content loads into a known layout:
[skeleton](skeleton.md). When the list of what is left matters more than the
amount: the [checklist](checklist.md) under the meter, which the meter
summarises and never replaces. A value on a scale that is not progress (a
rating, a chart): [rating](rating.md) or [bar chart](bar-chart.md).

Out of scope:

- The photo tile around an upload bar: the round preview, its "64%" overlay
  (`.photo-tile__progress`), the file-name caption and "Cancel upload of
  IMG_2076.heic" belong to [photo tile](photo-tile.md).
- The checklist and the "Start with your description" prompt near the meter:
  [checklist](checklist.md) and the dashboard page.
- Announcing an upload's outcome ("IMG_2076.heic uploaded", "Upload failed ·
  Retry"): the photo tile's status text and the dashboard [toast](toast.md).
- The toast's own countdown line (`.toast__progress`): [toast](toast.md).
- Counting upload bytes or checklist items: the consumer passes `value`.

## Usage

Inventory from `usage_inventory.py docs/mocks progress "div"` and
`usage_inventory.py docs/mocks meter "div"` plus a block extraction of each
use (11 bars, 9 meters).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/dashboard/empty` | `sh-meter`, value 1, max 10 | "Ready to submit", "1 of 10 done" | determinate | canvas, `.work-main` |
| `pages/dashboard/draft` | `sh-meter`, value 8, max 10 | "Ready to submit", "8 of 10 done" | determinate | canvas |
| `dialogs/submit-profile/default`, `busy`, `failed`, `success`; `dialogs/withdraw-submission/default`, `busy` | `sh-meter`, value 10, max 10 | "Ready to submit", "10 of 10 done" | complete | dialog surface |
| `dialogs/submit-profile/invalid` | `sh-meter`, value 8, max 10 | "Ready to submit", "8 of 10 done" | determinate | dialog surface |
| `pages/profile-photos/uploading` | `sh-progress`, value 64 / 18 of 100, `label` | "Uploading IMG_2076.heic", "Uploading IMG_2077.heic"; value text "64%, uploading" | determinate | photo tile, 8rem |
| Photo tile end states (design system) | `sh-progress`, tone success / danger | "Uploaded", "Failed at 18%" | succeeded, failed | photo tile |
| Photo processing while the service is down (design system, L2-091) | `sh-progress`, indeterminate, `label` | "Processing IMG_2077.heic" | unknown amount | photo tile |
| Metrics export (design system) | `sh-progress`, indeterminate, `labelledBy` | caption "Preparing your metrics export" | unknown amount | canvas |

Not built by this component:

- `style="--value: 64%"` on the track (`profile-photos/uploading`) is drift;
  the component sets `--value` on the fill.
- The upload bars' missing `aria-valuetext` is drift; it is required.

## Anatomy

1. **Track** — `.progress` (`div`, `role="progressbar"`): full width of its
   container, `--space-2` high, `--radius-full`, `--color-bg-subtle-hover`,
   `overflow: hidden`. Carries the name and value attributes.
2. **Fill** — `.progress__bar` (`div`): width from the custom property
   `--value` (a percentage, default 0 %), ink `--color-action`, pill ends,
   width transition `--duration-deliberate` with `--ease-standard`.
3. **Meter (sh-meter only)** — `.meter` (`div`): a column with `--space-2`
   gap holding:
   - **Label row** — `.meter__label`: the label (`span` with an id, which
     names the bar) and the visible value text (`span`), space-between,
     `--text-body-sm`, `--color-fg-muted`.
   - **Bar** — the track and fill above.

Host: both selectors are layout-transparent (`display: contents`) and render
their elements in the light DOM, so `.photo-tile .progress { width: min(100%,
8rem) }` and `aria-labelledby` ids work as written.

## API

### `sh-progress` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `number \| null` | `null` | no | `null` renders the indeterminate bar (`.progress--indeterminate`, no value attributes, `aria-busy="true"`). A number is clamped to `min`–`max`. |
| `min` | `number` | `0` | no | `aria-valuemin`. |
| `max` | `number` | `100` | no | `aria-valuemax`; greater than `min`. |
| `valueText` | `string \| null` | `null` | yes when determinate | `aria-valuetext`, in words people recognise: "64%, uploading", "8 of 10 done", "Uploaded", "Failed at 18%". |
| `label` | `string \| null` | `null` | one of `label` / `labelledBy` | `aria-label` when there is no visible label ("Uploading IMG_2076.heic"). |
| `labelledBy` | `string \| null` | `null` | one of `label` / `labelledBy` | `aria-labelledby`, pointing at a visible caption ("Preparing your metrics export"). Wins over `label`. |
| `tone` | `'default' \| 'success' \| 'danger'` | `'default'` | no | Adds `.progress--success` or `.progress--danger`; end states only, lasting about a second before the consumer replaces the bar. |

- The fill's `--value` is `(value − min) / (max − min) × 100 %`, computed
  once per input change.

### `sh-meter` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | What is measured, shown left in the label row and naming the bar: "Ready to submit". |
| `value` | `number` | — | yes | Items done (0–`max`). |
| `max` | `number` | — | yes | Items in all (10). |
| `valueText` | `string` | — | yes | Shown right in the label row and used as `aria-valuetext`: "8 of 10 done". |

- The meter is always determinate and default tone; it counts items, so it
  has no success, danger or indeterminate form.
- The label's id is generated per instance, unique on the page.

### Outputs

None. Neither is interactive.

### Content slots

None. Every string arrives as an input.

- Translation: `label`, `valueText` and the meter's `label` come from the
  resource files through the consumer, with numbers inserted ("8 of 10
  done", "64%, uploading") (L2-064).

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Determinate | `.progress` with value attributes | Uploads ("64%, uploading"). |
| Meter | `.meter` > `.meter__label` + `.progress` | Profile setup: "Ready to submit", "8 of 10 done". |
| Indeterminate | `.progress.progress--indeterminate`, `aria-busy="true"` | An unknown amount: "Processing IMG_2077.heic", "Preparing your metrics export". A 40 % fill sweeps across once per `--duration-loop`. |
| Success | `.progress.progress--success` | An upload just finished: "Uploaded" (`--color-success-solid`). |
| Danger | `.progress.progress--danger` | An upload just failed: "Failed at 18%" (`--color-danger-solid`), always with a way to retry nearby. |

One height (`--space-2`, 8 px). Width comes from the container: full width
in the meter, `min(100%, 8rem)` on a photo tile.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty | `value` = `min` | Track only | `aria-valuenow="0"`, value text ("0 of 10 done") |
| In progress | between | Fill at the percentage | `aria-valuenow`, `aria-valuetext` |
| Complete | `value` = `max` | Full ink fill | "10 of 10 done" |
| Value changes | new `value` | Fill glides over `--duration-deliberate` (500 ms) | Attributes update; nothing announced (D-4) |
| Unknown amount | `value` null | 40 % fill sweeping; under reduced motion a full-width fill at 60 % opacity | `aria-busy="true"`, no value attributes |
| Succeeded | `tone="success"`, value = max | Callaloo fill | "Uploaded" |
| Failed | `tone="danger"` | Sorrel fill at the failure point | "Failed at 18%" |
| Paused offline | consumer keeps `value`, changes the caption to "Waiting for connection" | Fill stops where it is | Value text unchanged ("64%, uploading"); the caption tells |
| Cancelled | consumer removes the tile | Bar removed with its tile | — |

Progress is never focusable or interactive: no hover, focus, active or
disabled state.

## Markup

```html
<!-- rendered: sh-meter, Auntie Bev's Kitchen in draft -->
<div class="meter">
  <div class="meter__label"><span id="meter-label-1">Ready to submit</span><span>8 of 10 done</span></div>
  <div class="progress" role="progressbar" aria-labelledby="meter-label-1" aria-valuemin="0" aria-valuemax="10" aria-valuenow="8" aria-valuetext="8 of 10 done"><div class="progress__bar" style="--value: 80%"></div></div>
</div>
```

```html
<!-- rendered: upload bar on a photo tile -->
<div class="progress" role="progressbar" aria-label="Uploading IMG_2076.heic" aria-valuemin="0" aria-valuemax="100" aria-valuenow="64" aria-valuetext="64%, uploading"><div class="progress__bar" style="--value: 64%"></div></div>
```

```html
<!-- rendered: indeterminate, named by a visible caption -->
<span class="text-sm" id="export-label">Preparing your metrics export</span>
<div class="progress progress--indeterminate" role="progressbar" aria-labelledby="export-label" aria-busy="true"><div class="progress__bar"></div></div>
```

```html
<!-- rendered: end states -->
<div class="progress progress--success" role="progressbar" aria-label="IMG_2076.heic" aria-valuemin="0" aria-valuemax="100" aria-valuenow="100" aria-valuetext="Uploaded"><div class="progress__bar" style="--value: 100%"></div></div>
<div class="progress progress--danger" role="progressbar" aria-label="IMG_2077.heic" aria-valuemin="0" aria-valuemax="100" aria-valuenow="18" aria-valuetext="Failed at 18%"><div class="progress__bar" style="--value: 18%"></div></div>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: dashboard setup meter -->
<sh-meter [label]="t('setup.readyToSubmit')" [value]="done()" [max]="10" [valueText]="t('setup.doneOf', { done: done(), total: 10 })"></sh-meter>

<!-- consumer: photo tile upload -->
<sh-progress [value]="upload.percent" [valueText]="t('photos.uploadingPct', { pct: upload.percent })" [label]="t('photos.uploading', { file: upload.name })"></sh-progress>

<!-- consumer: processing while the image service is down -->
<sh-progress [value]="null" [label]="t('photos.processing', { file: 'IMG_2077.heic' })"></sh-progress>
```

The e2e page objects read `role="progressbar"`, its name and
`aria-valuenow` / `aria-valuetext`, and `.meter__label`; those are the
contract.

## Design

- Track: `width: 100%`, height `--space-2`, `--radius-full`,
  `--color-bg-subtle-hover`, `overflow: hidden`.
- Fill: `height: 100%`, `width: var(--value, 0%)`, `--color-action`,
  `border-radius: inherit`, `transition: width --duration-deliberate
  --ease-standard`.
- Indeterminate: fill 40 % wide, `indeterminate` keyframes (translate from
  −100 % to 350 %) over `--duration-loop`, `--ease-standard`, infinite.
- Meter: column, gap `--space-2`; label row `display: flex;
  justify-content: space-between; flex-wrap: wrap` (D-3), `--text-body-sm`,
  `--color-fg-muted`.
- No elevation, layer or component tokens. Fills are ink, never pepper:
  progress is not a selection.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Track | `--color-bg-subtle-hover` | `--palette-stone-200` | `--palette-stone-700` |
| Fill | `--color-action` | `--palette-stone-950` | `--palette-stone-100` |
| Fill, success | `--color-success-solid` | `--palette-callaloo-700` | `--palette-callaloo-300` |
| Fill, danger | `--color-danger-solid` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Meter label and value | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |

Contrast pairs (from `tokens/contrast-pairs.json`; the fill-to-track
boundary is the information, WCAG 1.4.11; L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-action` | `--color-bg-subtle-hover` | 3:1 | Ink fill against the track |
| `--color-success-solid` | `--color-bg-subtle-hover` | 3:1 | Success fill against the track |
| `--color-danger-solid` | `--color-bg-subtle-hover` | 3:1 | Danger fill against the track |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Meter label on the dashboard |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Meter label in the submit dialog |

The track need not reach 3:1 against the page: the value text carries the
amount. Forced colours: backgrounds drop out, so the bar disappears; the value
text in the label row or caption still says how far it has got.

## Responsive behaviour

- The bar is 100 % of its container at every size; the container decides.
  The meter spans the main column; upload bars are `min(100%, 8rem)` under
  each photo tile.
- Below 48rem the dashboard meter sits full width above the checklist. The
  label row wraps if "Ready to submit" and "8 of 10 done" cannot share a line
  at 320 px; it never truncates.
- From 62rem the meter stays in `.work-main` beside the preview pane. The
  submit-profile dialog repeats it at the dialog's width (full screen below
  48rem).
- Nothing in the component is a target; a "Cancel upload" next to a bar keeps
  its own 44 px target with 8 px clearance.

## Accessibility

### Role and pattern

`role="progressbar"` with `aria-valuemin`, `aria-valuemax`, `aria-valuenow`
and a human `aria-valuetext`; indeterminate bars omit the value attributes and
carry `aria-busy="true"`. The setup meter is a progressbar, not
`role="meter"`: it measures progress towards a goal ([WAI-ARIA
progressbar](https://www.w3.org/TR/wai-aria-1.2/#progressbar)).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Skips the bar; it is not focusable. Controls around it ("Cancel upload of IMG_2076.heic", the checklist links) are. |
| Screen-reader browse keys | Read the name and value text where the bar sits. |

### Focus

Never focusable and never moves focus. When an upload finishes, focus stays
where it was.

### Labelling

Every bar has a name: `labelledBy` pointing at a visible label ("Ready to
submit", a caption) or `label` when there is none ("Uploading
IMG_2076.heic"). Value text counts things: "8 of 10 done" for the checklist, a
percentage only for transfers.

### Announcements

None from the bar. `aria-valuenow` updates freely, but the bar is not a live
region; only milestones (uploaded, failed) are announced, by the photo tile's
status text or the toast (D-4).

### Motion

Fill changes use `--duration-deliberate`, which `prefers-reduced-motion:
reduce` sets to 0.01 ms, so the bar jumps to the new value. The indeterminate
sweep stops and becomes a full-width fill at 60 % opacity; the caption still
says what is happening.

## Content and internationalisation

- Label what is measured, not the act: "Ready to submit", the file name
  "IMG_2076.heic". Not "Progress" or "Loading".
- Value text counts things people recognise: "8 of 10 done"; percentages only
  for transfers ("64%, uploading"). Numerals.
- Outcome words are plain: "Uploaded", "Failed at 18%", "Waiting for
  connection". No "Success!".
- Indeterminate bars always have a caption: "Preparing your metrics export",
  "Processing IMG_2077.heic". Never a bare bar.
- Translatable inputs: `label`, `valueText`, the meter `label`. Data inside:
  counts, percentages (formatted for the locale, "64 %" in French), file
  names.
- French "Prêt à soumettre" / "8 sur 10 terminés" wrap in the label row at
  320 px rather than truncate.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the percentage, clamped value and class
  list are computed once per input change, not in the template.
- An upload may update `value` many times a second; the component writes
  only the `--value` property and two attributes, and the consumer throttles
  updates to at most 4 per second.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Progress.ts`
  renders Auntie Bev's Kitchen's meter at "8 of 10 done" and two upload bars
  (IMG_2076.heic at 64 %, IMG_2077.heic at 18 %) and steps their values;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CatererDashboard`, `PhotoManager`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the track's height is fixed; value changes resize only
  the fill inside it, so nothing around it moves.
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given Auntie Bev's Kitchen's draft with 8 of 10 checklist items done, when the dashboard renders `sh-meter`, then `.meter__label` shows "Ready to submit" and "8 of 10 done", and the bar has `role="progressbar"`, `aria-labelledby` naming "Ready to submit", `aria-valuemin="0"`, `aria-valuemax="10"`, `aria-valuenow="8"`, `aria-valuetext="8 of 10 done"` and a fill 80 % of the track's width. (L2-038)
- **AC-2** Given a new caterer account on first run, when the dashboard renders, then the meter reads "1 of 10 done" with a fill 10 % wide; when the caterer completes another item, then it reads "2 of 10 done" and the fill glides to 20 % over `--duration-deliberate`. (L2-038)
- **AC-3** Given Auntie Bev activates "Submit for review" with 8 of 10 items done, when the submit-profile dialog shows its invalid state, then the meter at the top of the dialog reads "8 of 10 done" above the checklist. (L2-039)
- **AC-4** Given Auntie Bev's draft meets every rule, when the submit-profile dialog opens, then the meter reads "10 of 10 done" with a full ink fill. (L2-039)
- **AC-5** Given Auntie Bev uploads IMG_2076.heic and 64 % has transferred, when its photo tile renders, then the bar under the file name has the name "Uploading IMG_2076.heic", `aria-valuenow="64"`, `aria-valuetext="64%, uploading"`, a fill 64 % wide set through `--value` on `.progress__bar`, and a width of at most 8rem. (L2-041)
- **AC-6** Given IMG_2076.heic finishes uploading, when the tile shows its end state, then the bar has `.progress--success`, `aria-valuetext="Uploaded"` and a `--color-success-solid` fill for about a second before the tile shows the preview, within 10 seconds of the upload. (L2-041)
- **AC-7** Given the image-processing service is down, when Auntie Bev uploads IMG_2077.heic and it is accepted, then its tile shows an indeterminate bar named "Processing IMG_2077.heic" with `aria-busy="true"` and no `aria-valuenow`. (L2-091)
- **AC-8** Given every progress bar and meter on the dashboard, the photo manager and the submit-profile dialog, when axe-core runs at XS and XL in both themes, then it reports 0 violations and every `role="progressbar"` element has an accessible name. (L2-066)

### States

- **AC-9** Given IMG_2077.heic fails at 18 %, when the tile shows its end state, then the bar has `.progress--danger` and `aria-valuetext="Failed at 18%"`, the caption beside it says "didn’t upload", and a "Retry" control is present, so the failure is given in words as well as colour. (L2-069)
- **AC-10** Given an upload moving from 18 % to 64 %, when a screen reader is running, then the bar is not a live region and no percentage is announced; only the tile's "IMG_2076.heic uploaded" is announced when it ends. (L2-068)
- **AC-11** Given an upload in progress when the device goes offline, when the tile updates, then the bar stays at its last value and its caption changes to "Waiting for connection", and the bar resumes from that value when the connection returns. (L2-091)

### Keyboard and focus

- **AC-12** Given the photo manager with two uploads, when a keyboard user presses Tab, then focus moves from "Cancel upload of IMG_2076.heic" to "Cancel upload of IMG_2077.heic" without stopping on either bar, and focus does not move when an upload ends. (L2-067)

### Theming

- **AC-13** Given the light and dark themes, when the default, success and danger bars render, then each fill has at least 3:1 against `--color-bg-subtle-hover`, the default fill resolves to `--palette-stone-950` in light and `--palette-stone-100` in dark, and no fill uses `--color-accent`. (L2-069)
- **AC-14** Given the meter on the dashboard canvas and in the submit-profile dialog, when it renders in each theme, then "Ready to submit" and "8 of 10 done" have at least 4.5:1 against the surface behind them. (L2-069)

### Responsive

- **AC-15** Given a 320 px viewport and the French labels "Prêt à soumettre" and "8 sur 10 terminés", when the meter renders, then both texts are fully visible, the value moves to a second line whenever the two cannot share one, nothing is truncated, and the page does not scroll horizontally. (L2-064)
- **AC-16** Given viewport XS, when Auntie Bev opens the photo manager with two uploads in progress, then each bar is at most 8rem wide under its tile and the page does not scroll horizontally. (L2-045)

### Motion

- **AC-17** Given `prefers-reduced-motion: reduce`, when a meter's value changes from 7 to 8, then the fill reaches 80 % without a visible transition, and an indeterminate bar shows a static full-width fill at 60 % opacity instead of sweeping. (L2-069)

### Content

- **AC-18** Given the component sources, when they are scanned for user-facing string literals, then none are found; "Ready to submit", "8 of 10 done" and "64%, uploading" all arrive as inputs. (L2-064)

### Performance

- **AC-19** Given the `Progress` perf-test scenario stepping two upload bars from 0 to 100 %, when it runs, then no element outside the fills changes size or position, and it does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/progress/`; files
  `progress.component.*` (`ProgressComponent`, `sh-progress`) and
  `meter.component.*` (`MeterComponent`, `sh-meter`, which renders
  `sh-progress`).
- Styles: the "Progress and meter" section of `components.css`, the
  `indeterminate` keyframes and its reduced-motion rule move into the
  component's stylesheet, unscoped so `.photo-tile .progress` still applies.
- Design-system catch-up for D-3: add `flex-wrap: wrap; gap: 0 var(--space-3)`
  to `.meter__label`; today's rule is `space-between` without wrapping, so the
  two spans would squeeze rather than wrap at 320 px. The rendering applies it
  with a specimen-only style.
- Mock catch-up: the upload bars move `--value` to the fill and add
  `aria-valuetext`.
- Composed by [photo tile](photo-tile.md), the caterer dashboard, and the
  submit-profile and withdraw-submission [dialogs](dialog.md). Composes
  nothing. No CDK primitive.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One selector or two?* Two. `sh-meter` always has a visible label row and counts items, `sh-progress` is a bare bar named by `label` or a caption; one component with an optional label row would allow a meter without a label or an upload bar with a "N of M" row, which the design system forbids.
- **D-3** *What happens when the meter's label row does not fit?* It wraps (the design system's Responsive rule says it wraps and never truncates), which needs `flex-wrap` on `.meter__label`; `components.css` lacks it, so it catches up.
- **D-4** *Does the bar announce its value?* No. Announcing every percentage would flood screen readers; the design system announces only milestones, through the tile's status text and toasts. The bar is never a live region.
- **D-5** *Is "indeterminate" a separate input?* No: `value` null means indeterminate. A bar with no number cannot honestly show one, and a separate flag could contradict `value`.
- **D-6** *Where does `--value` go?* On `.progress__bar`, the canonical place in the design system; the upload mocks set it on the track, which works by inheritance but is drift.
- **D-7** *Does a "cancelled" bar state exist?* No. Cancelling an upload removes the tile and its bar together (design system, States).
