# Chip

| Field | Value |
|---|---|
| Selector | `sh-chip` (toggle: `button.chip[aria-pressed]`; link: `a.chip`; static: `span.chip`), `sh-filter-chip` (active filter: `span.chip.chip--filter` with its remove `button.remove`), `sh-chip-group` (renders `div.active-filters[role=group]`) |
| Library path | `frontend/projects/components/src/lib/chip/` |
| Status | planned |
| Traces to | L2-008, L2-009, L2-011, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`chip.html`](../../design-system/components/chip.html) |
| Source mocks | [`pages/caterers/filtered`](../../mocks/pages/caterers/filtered.html), [`pages/caterers/occasion`](../../mocks/pages/caterers/occasion.html), [`pages/caterers/no-results`](../../mocks/pages/caterers/no-results.html), [`dialogs/filters/selected`](../../mocks/dialogs/filters/selected.html), [`dialogs/filters/busy`](../../mocks/dialogs/filters/busy.html), [`pages/admin-caterers/no-results`](../../mocks/pages/admin-caterers/no-results.html) |
| Rendering | [`chip.html`](chip.html) |

## Purpose and scope

Chips are small pills you act on. Above the caterer results, each filter that
is on is a chip, "Jamaican" and "Scarborough", with a button that removes it,
and the row ends with "Clear filters"; the operator's caterer records get the
same row ("“Pelau”", "Suspended"). A toggle chip is a quick on/off filter in a
short row ("All 23", "5 stars 17"); a link chip goes to a filtered listing
("Weddings"). Selected is pepper red, the brand's one meaning for "selected",
so an active filter chip always wears the pepper tint. `sh-chip-group` is the
wrapping, labelled row that holds them and keeps focus in place when a chip
is removed.

Use something else for dietary and allergen labels on a dish ([tag](tag.md):
information, not controls), for the cuisine and area lists ([filter
list](filter-list.md) on large screens, [checkbox](checkbox.md) in the phone
sheet), for a choice between views ([button group](button-group.md)) and for
a record's state ([status](status.md)).

Out of scope:

- What removing a filter does: the listing page updates the URL (L2-003),
  reloads results without a page reload and announces the new count in its
  polite live region (L2-067). The chip only reports the removal.
- "Clear filters": an [`sh-button-anchor`](button.md) (link variant, small)
  the consumer places last in the group.
- Picking an area in the sheet's search: [combobox](combobox.md) turns a pick
  into a filter chip.

## Usage

Inventory from `usage_inventory.py docs/mocks chip "span|button|a"` and a
search for `active-filters` (6 files). Rows that share a configuration are
grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/filtered` | group "Active filters", two filter chips + "Clear filters" | "Jamaican", "Scarborough"; removes "Remove Jamaican filter", "Remove Scarborough filter" | default | canvas, above results |
| `pages/caterers/occasion` | group, one filter chip + "Clear filters" | "Weddings" | default | canvas |
| `pages/caterers/no-results` | group, two filter chips + "Clear filters" | "Haitian", "Durham" | default | canvas, above the empty state |
| `dialogs/filters/selected`, `busy` (phone sheet, Area group) | group "Selected areas" (D-5), one filter chip, no "Clear filters" | "Scarborough" | default; remove disabled while results load | sheet |
| `pages/admin-caterers/no-results` | group "Active filters" (D-5), search chip + status chip | "“Pelau”" (remove "Remove search “Pelau”"), "Suspended" (remove "Remove Suspended filter") | default | canvas |
| Design system only — review filters | group "Show reviews", toggle chips | "All 23" (pressed), "5 stars 17", "4 stars 5", "With a response 6" | pressed, not pressed, hover, focus, active, disabled | canvas |
| Design system only — link and static chips | link chip (`href`), `current`; static chip | "Weddings", "Funerals and repasts"; "Within 3 business days" | default, current, disabled ("Private dinners 0") | canvas |

## Anatomy

1. **Container** — `.chip` on a `<button>` (toggle), `<a>` (link) or
   `<span>` (static, filter): inline flex pill (`--radius-full`), hairline
   border, `--space-3` side padding, `--space-1` gap, `--text-label`. Height
   `--control-height-sm` (36 px) from 48rem, `--target-comfortable` (44 px)
   below.
2. **Label** — the projected text, exactly the filter value ("Trinidadian &
   Tobagonian"). One line; never truncated.
3. **Remove button (filter chips)** — `button.remove` inside the `span`:
   circular, `--target-min` (24 px) from 48rem and `--target-comfortable`
   (44 × 44 px) below, holding a 16 px close icon (`aria-hidden`), named
   "Remove Jamaican filter".
4. **Group** — `div.active-filters[role=group][aria-label]`: a wrapping flex
   row, `--space-2` gaps, items centred.

Hosts: `sh-chip`, `sh-filter-chip` and `sh-chip-group` are layout-transparent
(`display: contents`), so `.active-filters` lays out the real chips and the
"Clear filters" anchor.

## API

### `sh-chip` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'toggle' \| 'link' \| 'static'` | `'toggle'` | no | `toggle` → `<button class="chip" type="button" aria-pressed>`; `link` → `<a class="chip" href>`; `static` → `<span class="chip">`. |
| `pressed` | `boolean` (two-way) | `false` | no | Toggle only: `aria-pressed="true"` / `"false"`; pressed draws the selected look. |
| `href` | `string` | — | yes (link) | Link only. |
| `current` | `boolean` | `false` | no | Link only: `aria-current="page"`, drawn selected (D-3). |
| `disabled` | `boolean` | `false` | no | Toggle: native `disabled`. Link and static: `aria-disabled="true"`; a disabled link keeps `href` but cancels activation. 50 % opacity. |

### `sh-chip` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `pressedChange` | `boolean` | A toggle chip is activated by click, tap, <kbd>Enter</kbd> or <kbd>Space</kbd> while enabled. |

### `sh-chip` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text | The label and the accessible name. A count inside it ("5 stars 17") is part of the name. |

### `sh-filter-chip` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `removeLabel` | `string` | — | yes | The remove button's `aria-label`, from the resource files with the value: "Remove Jamaican filter", "Remove search “Pelau”" (D-4). |
| `removeDisabled` | `boolean` | `false` | no | Native `disabled` on the remove button while results load (the phone sheet's busy state). |

### `sh-filter-chip` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `removed` | `void` | The remove button is activated while enabled. The consumer drops the filter; the group then moves focus (D-6). |

### `sh-filter-chip` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Text | The filter value: "Scarborough", "“Pelau”", "Suspended". |

### `sh-chip-group` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Rendered as `aria-label` with `role="group"`: "Active filters", "Selected areas", "Show reviews". |

### `sh-chip-group` outputs

| Output | Payload | Emitted when |
|---|---|---|
| `emptied` | `void` | The last filter chip was removed and no other focusable item ("Clear filters") remains, so the consumer moves focus to the results heading (D-6). |

### `sh-chip-group` content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | `sh-chip`, `sh-filter-chip`, then an optional `sh-button-anchor` "Clear filters" | In reading order. "Clear filters" comes last. |

- Boolean inputs accept the bare attribute; `null` / `false` render no
  attribute, except `pressed`, which always renders `"true"` or `"false"`.
- Translation: labels of fixed options, `removeLabel`, the group `label` and
  "Clear filters" come from the resource files (L2-064); filter values
  (cuisine, area, occasion names, a search string) are data.

## Variants and sizes

| Variant | Markup | Use for |
|---|---|---|
| Active filter | `span.chip.chip--filter` + `button.remove` | One per filter that is on, above the results and in the sheet's Area group. Always selected-looking. |
| Toggle | `button.chip[aria-pressed]` | A short row of quick on/off filters. |
| Link | `a.chip[href]` | Goes to a filtered listing ("Weddings"); `current` when that listing is open. |
| Static | `span.chip` | Shows a choice already made. Rare; read-only facts are [tags](tag.md). |
| Group | `div.active-filters[role=group]` | Every row of chips. |

One design size whose height depends on the viewport (L2-065): 44 px chips
and 44 × 44 px remove buttons below 48rem; 36 px chips and 24 px remove
buttons from 48rem. Width comes from the label; a chip never wraps its label
and never exceeds its row (`max-width: 100%`).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | `--color-bg-surface` fill, `--color-border-strong` edge, `--color-fg-default` label | Button / link / text, named by the label |
| Hover | `:hover` | Fill `--color-bg-subtle`, label unchanged (D-9) (filter chips keep their tint; their remove button takes `--color-accent-subtle-hover`) | — |
| Active | `:active` | Fill `--color-bg-subtle-hover` | — |
| Focus | `:focus-visible` | Ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) round the toggle or link chip, or round the remove button on a filter chip | — |
| Selected | `aria-pressed="true"`, `aria-current="page"`, always on `.chip--filter` | Fill `--color-accent-subtle`, edge `--color-accent`, label `--color-fg-accent` | "pressed" / "current page"; a filter chip says it through its remove button |
| Selected hover | `:hover` + pressed | Fill `--color-accent-subtle-hover` | — |
| Disabled | `disabled` / `aria-disabled` | 50 % opacity, `cursor: not-allowed` | Toggle skipped by Tab; link announced "dimmed" |
| Remove disabled | `removeDisabled` | Remove button not interactive; chip unchanged | Remove button skipped by Tab |
| Results loading | page reloads results | No change on chips; no spinner | The page's live region announces the new count |

`data-state="hover|focus|active|selected|disabled"` exists in
`components.css` for documentation only.

## Markup

```html
<!-- rendered: active filters row (listing, filtered) -->
<div class="active-filters" role="group" aria-label="Active filters">
  <span class="chip chip--filter">Jamaican<button class="remove" type="button" aria-label="Remove Jamaican filter"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span>
  <span class="chip chip--filter">Scarborough<button class="remove" type="button" aria-label="Remove Scarborough filter"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button></span>
  <a class="btn btn--link btn--sm" href="/caterers">Clear filters</a>
</div>
```

```html
<!-- rendered: operator search and status chips -->
<div class="active-filters" role="group" aria-label="Active filters">
  <span class="chip chip--filter">“Pelau”<button class="remove" type="button" aria-label="Remove search “Pelau”">…</button></span>
  <span class="chip chip--filter">Suspended<button class="remove" type="button" aria-label="Remove Suspended filter">…</button></span>
</div>
```

```html
<!-- rendered: sheet Area group while results load -->
<div class="active-filters" role="group" aria-label="Selected areas"><span class="chip chip--filter">Scarborough<button class="remove" type="button" aria-label="Remove Scarborough filter" disabled>…</button></span></div>
```

```html
<!-- rendered: toggle chips -->
<div class="active-filters" role="group" aria-label="Show reviews">
  <button class="chip" type="button" aria-pressed="true">All 23</button>
  <button class="chip" type="button" aria-pressed="false">5 stars 17</button>
</div>
```

```html
<!-- rendered: link (current), static, disabled link -->
<a class="chip" href="/caterers?occasion=weddings" aria-current="page">Weddings</a>
<span class="chip">Within 3 business days</span>
<a class="chip" href="/caterers?occasion=private-dinners" aria-disabled="true">Private dinners 0</a>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: listing active filters -->
@if (active().length) {
  <sh-chip-group [label]="t('filters.active')" (emptied)="resultsHeading.focus()">
    @for (f of active(); track f.key) {
      <sh-filter-chip [removeLabel]="t('filters.remove', { value: f.label })" (removed)="removeFilter(f)">{{ f.label }}</sh-filter-chip>
    }
    <sh-button-anchor variant="link" size="sm" href="/caterers">{{ t('filters.clear') }}</sh-button-anchor>
  </sh-chip-group>
}

<!-- consumer: review toggles -->
<sh-chip-group [label]="t('reviews.show')">
  <sh-chip [(pressed)]="showAll">{{ t('reviews.all', { n: 23 }) }}</sh-chip>
</sh-chip-group>
```

The e2e page objects locate chips by `.chip`, `.chip--filter`, `.remove`
and `.active-filters`, by the group name and by the remove buttons' names;
those classes, `aria-pressed`, `aria-current` and the remove labels are the
contract. The icon path data is free to change.

## Design

- Height `--control-height-sm` from 48rem, `--target-comfortable` below;
  side padding `--space-3` (filter chips `--space-1` on the right, so the
  remove button sits close to the edge); label-to-button gap `--space-1`.
- Label `--text-label`, one line (`white-space: nowrap`).
- Shape `--radius-full`; border `--border-width-hairline`.
- Remove button: `--target-min` square from 48rem, `--target-comfortable`
  below, 50 % radius, close icon `--icon-size-sm`, transparent until hovered.
- Group: wrap, `--space-2` gaps.
- Elevation and layer: none.
- Motion: background over `--duration-fast` with `--ease-standard`. A
  removed chip disappears without an exit animation.

No component tokens; the chip reads semantic tokens, and a re-skin changes
the accent tokens so every "selected" mark moves together.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Fill at rest | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Edge at rest | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Label at rest | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Hover / active fill | `--color-bg-subtle` / `--color-bg-subtle-hover` | `--palette-stone-100` / `--palette-stone-200` | `--palette-stone-800` / `--palette-stone-700` |
| Selected fill | `--color-accent-subtle` | `--palette-pepper-50` | `--palette-pepper-950` |
| Selected edge | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Selected label | `--color-fg-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Selected hover, remove hover | `--color-accent-subtle-hover` | `--palette-pepper-100` | `--palette-pepper-900` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Label at rest |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Edge at rest |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Label on hover |
| `--color-fg-accent` | `--color-accent-subtle` | 4.5:1 | Selected label, close icon |
| `--color-fg-accent` | `--color-accent-subtle-hover` | 4.5:1 | Selected label on hover, close icon on remove hover |
| `--color-accent` | `--color-bg-surface` | 3:1 | Selected edge |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

Selected is not colour alone: `aria-pressed` is announced, and a filter
chip carries a remove button. Forced colours: every `.chip` keeps a
`CanvasText` border (`components.css`); pressed and current chips add a
`Highlight` border so selection survives (D-7).

## Responsive behaviour

- Rows wrap (`.active-filters`), never scroll sideways.
- Below 48rem every chip is at least 44 px tall and every remove button
  44 × 44 px (L2-065); from 48rem 36 px and 24 px, with 8 px gaps, which
  clears the 24 px WCAG 2.5.8 minimum for pointers.
- XS–SM: the active-filter row sits under the results heading; the sheet's
  Area group shows its own chip row. MD: the row sits under the filter
  dropdowns. LG–XL: above the results, beside the filter list (L2-009).
- A long label ("Religious and cultural celebrations") stays on one line and
  the row wraps around it; at 320 px a chip never exceeds the row.
- At 200 % zoom the row reflows with no horizontal scrolling.

## Accessibility

### Role and pattern

Toggle chips are `<button aria-pressed>` ([APG Button,
toggle](https://www.w3.org/WAI/ARIA/apg/patterns/button/)); link chips are
`<a>`; a filter chip is a plain `<span>` holding a real remove `<button>`,
and the chip itself is not focusable. Rows are `role="group"` with an
`aria-label`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Each toggle chip, link chip and remove button is one tab stop, in reading order. |
| <kbd>Space</kbd> / <kbd>Enter</kbd> | Toggles a chip, follows a link chip (Enter), or removes a filter. |

### Focus

- The ring goes round the whole toggle or link chip, or round the remove
  button on a filter chip; its offset keeps 3:1 against the page around the
  pepper tint.
- After a removal, focus moves to the remove button of the chip that took
  its place; after the last chip, to "Clear filters"; when nothing is left,
  `emptied` lets the page focus the results heading (D-6). Focus never lands
  on the body.

### Labelling

- Toggle chips are named by their label and announce pressed / not pressed.
- Remove buttons name the value and the word "filter": "Remove Jamaican
  filter"; searches: "Remove search “Pelau”".
- The close icon is `aria-hidden="true"`.

### Announcements

None from the chip. The page announces the new result count ("2 caterers")
in its polite live region after a change (L2-067).

### Motion

The background fade uses `--duration-fast`, zeroed by
`prefers-reduced-motion: reduce`. No exit animation.

## Content and internationalisation

- Use the filter value exactly as the filter list writes it: "Trinidadian &
  Tobagonian", "Barbadian (Bajan)", "Scarborough", "Weddings". Never "Trini"
  or "Bajan".
- Searches in curly quotes: "“Pelau”"; statuses as the segmented control
  writes them: "Suspended".
- Remove buttons: "Remove {value} filter"; for a search "Remove search
  “{text}”".
- The listing's row ends with "Clear filters" whenever at least one filter
  chip is on (D-8).
- Counts in toggle labels are formatted by the consumer: "All 23", "5 stars
  17".
- Translatable: `removeLabel` templates, group labels, "Clear filters",
  toggle labels. Data: filter values and search text. French labels run
  about 30 % longer; the row wraps.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the element kind, the
  class list, the remove label) are computed once per input change, not in
  the template.
- The group observes its content children only to restore focus after a
  removal; no timers or global listeners.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Chip.ts`
  renders the listing's "Active filters" row for Jamaican + Scarborough with
  "Clear filters" and removes "Scarborough"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CaterersListing`, `FilterSheet`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the row is rendered on the server with the filters in
  the URL, so it never pops in above the results after load; removing a chip
  reflows only the row.
- Weight: no dependencies beyond the framework and [button](button.md).

## Acceptance criteria

### Rendering

- **AC-1** Given the listing filtered by Jamaican and Scarborough, when the results render, then a `div.active-filters` with `role="group"` and `aria-label="Active filters"` holds two `span.chip.chip--filter` chips "Jamaican" and "Scarborough", each with a `button.remove` named "Remove Jamaican filter" and "Remove Scarborough filter", followed by "Clear filters". (L2-009)
- **AC-2** Given the occasion listing for Weddings, when it renders, then the row holds one "Weddings" filter chip and "Clear filters", and activating "Clear filters" opens the listing with no filters. (L2-008)
- **AC-3** Given the phone filter sheet after Marcia picked "Scarborough" in the Area search, when the Area group renders, then a group named "Selected areas" holds one "Scarborough" filter chip whose remove button is named "Remove Scarborough filter". (L2-011)
- **AC-4** Given Leah searched "Pelau" and filtered by Suspended, when the operator records list renders, then the chips read "“Pelau”" and "Suspended" with remove buttons named "Remove search “Pelau”" and "Remove Suspended filter", inside a group named "Active filters". (L2-068)
- **AC-5** Given a toggle chip "5 stars 17", when it renders not pressed and Marcia activates it, then it is `button.chip[type=button]` with `aria-pressed="false"` before and `"true"` after, takes the selected look, and `pressedChange` emits `true` once. (L2-069)

### States

- **AC-6** Given "Scarborough" is removed by its remove button, when the chip emits `removed` and the consumer drops the filter, then the listing shows caterers for Jamaican only and the remaining chip is "Jamaican". (L2-009)
- **AC-7** Given the sheet is reloading results, when `removeDisabled` is true, then the Scarborough remove button has native `disabled`, Tab skips it, and the chip keeps its look. (L2-067)
- **AC-8** Given a link chip "Private dinners 0" for an occasion with no caterers, when it is disabled, then it has `aria-disabled="true"`, keeps its `href`, is drawn at 50 % opacity, and activating it does not navigate. (L2-008)

### Keyboard and focus

- **AC-9** Given focus on "Remove Jamaican filter" in a row of Jamaican, Scarborough and "Clear filters", when Marcia presses Enter, then the Jamaican chip is gone and focus is on "Remove Scarborough filter"; when she removes Scarborough, then focus is on "Clear filters". (L2-067)
- **AC-10** Given a group with one filter chip and no "Clear filters" (the sheet's Area group), when the chip is removed, then `emptied` is emitted so the consumer can move focus, and focus is never left on the document body. (L2-067)
- **AC-11** Given keyboard focus on a toggle chip and on a remove button, when each renders in either theme, then the `--color-focus-ring` ring surrounds the whole toggle chip, or the remove button only, with at least 3:1 against the surface. (L2-067)

### Screen readers and automated checks

- **AC-12** Given the "Active filters" row, when a screen reader reaches it, then it announces "Active filters, group", the chip text "Jamaican" as plain text, then the button "Remove Jamaican filter"; the close icon is not announced. (L2-068)
- **AC-13** Given the listing with active filters and a toggle row, when axe-core runs with WCAG 2.1 A and AA rules at 360 px and 1280 px in both themes, then it reports 0 violations. (L2-066)

### Theming

- **AC-14** Given the light theme, when a filter chip renders, then its label `--color-fg-accent` has at least 4.5:1 against `--color-accent-subtle` (and against `--color-accent-subtle-hover` when its remove button is hovered), and its `--color-accent` edge at least 3:1 against the surface. (L2-069)
- **AC-15** Given the dark theme, when a pressed toggle chip and a chip at rest render, then the pressed fill resolves to `--palette-pepper-950` with a `--palette-pepper-300` label of at least 4.5:1, and the resting chip's edge has at least 3:1 against the surface. (L2-069)

### Responsive

- **AC-16** Given a 360 px viewport, when the "Active filters" row renders, then each chip is at least 44 CSS px high, each remove button 44 × 44 CSS px, and neighbouring targets are at least 8 px apart. (L2-065)
- **AC-17** Given a 1280 px viewport, when the same row renders, then chips are 36 CSS px high and remove buttons 24 × 24 CSS px. (L2-065)
- **AC-18** Given a 320 px viewport with the filters "Religious and cultural celebrations", "Trinidadian & Tobagonian" and "Scarborough", when the row renders, then it wraps onto several lines, no label is truncated, and nothing scrolls horizontally. (L2-064)
- **AC-19** Given a 1280 px window at 200 % zoom, when the row renders, then every chip and remove button is visible and usable with no horizontal scrolling. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when a toggle chip is hovered and pressed, then its fill changes with no visible transition, and a removed chip disappears with no exit animation. (L2-069)

### Performance

- **AC-21** Given the `Chip` perf-test scenario, when "Scarborough" is removed, then the row is repainted with focus on the next control within 200 ms (Interaction to Next Paint), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/chip/`; files
  `chip.component.*` (selector `sh-chip`, class `ChipComponent`),
  `filter-chip.component.*` (selector `sh-filter-chip`, class
  `FilterChipComponent`) and `chip-group.component.*` (selector
  `sh-chip-group`, class `ChipGroupComponent`).
- Styles: the `.chip`, `.chip--filter`, `.remove` and `.active-filters` rules
  of `docs/design-system/assets/components.css`, with their forced-colours
  and phone-target lines, move into the component.
- Design-system catch-up for D-3: add `.chip[aria-current="page"]` to the
  selected rule (today only `data-state="selected"` draws a current link
  chip). For D-7: in forced colours add
  `.chip[aria-pressed="true"], .chip[aria-current="page"], .chip--filter { border-color: Highlight; }`.
  For D-9: add `a.chip:hover { color: var(--color-fg-default); }` (and keep
  the selected colour on a current link chip). The rendering applies D-3 and
  D-9 with specimen-only styles.
- Mock catch-up: remove labels in `dialogs/filters/*` and
  `pages/admin-caterers/no-results` (D-4); the sheet and operator rows lack
  `role="group"` and a label, and the operator row spaces itself inline
  (D-5).
- Composes [button](button.md) ("Clear filters" is the consumer's
  `sh-button-anchor`). Composed by the caterers listing, the operator
  records list, the filter [sheet](sheet.md) and [combobox](combobox.md).
- The group restores focus after the consumer's change detection removes a
  chip (it remembers the removed index, then focuses the next `.remove`, the
  last focusable child, or emits `emptied`).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One selector or several?* `sh-chip` covers the toggle, link and static pills, which differ only in element; the active filter is `sh-filter-chip` because it has a different structure (a non-focusable span holding a real button) and its own output; the row is `sh-chip-group` because it owns the group name and focus after removal.
- **D-3** *How does a link chip show it is current?* With `aria-current="page"` and the selected look. The design system draws it with `data-state="selected"`, which is documentation only; `components.css` catches up.
- **D-4** *How are remove buttons named?* "Remove {value} filter", and "Remove search “{text}”" for a search, as the design system settled after the mocks used four patterns ("Remove Scarborough", "Remove filter Suspended", "Remove search Pelau").
- **D-5** *Do the sheet's Area chips and the operator's chips form a labelled group?* Yes: "Selected areas" in the sheet and "Active filters" on the operator list. The design system requires `role="group"` with a label on every chip row; the mocks left both unlabelled.
- **D-6** *Where does focus go after a removal?* To the next chip's remove button, then to "Clear filters", then (through `emptied`) to the results heading, as the design system's keyboard table says. The group does this because the consumer removes the chip and the removed button no longer exists.
- **D-7** *Does selection survive forced colours?* Yes: pressed, current and filter chips get a `Highlight` border, because forced colours drop the pepper tint and `aria-pressed` alone would leave sighted high-contrast users with no cue.
- **D-8** *When does the row show "Clear filters"?* Whenever at least one filter chip is on, as `pages/caterers/occasion` shows with its single "Weddings" chip and as L2-008.5 implies ("one or more cuisines are selected"). The design system's Content section says "two or more"; L2 and the mock are followed, and the content rule should be updated.
- **D-9** *Does a link chip's label change colour on hover?* No. The global `a:hover` rule turns link text pepper (`--color-fg-link-hover`), which on a chip would read as "selected"; a link chip keeps `--color-fg-default` and shows hover with the `--color-bg-subtle` fill like every other chip.
