# Tag

| Field | Value |
|---|---|
| Selector | `sh-tags` (the row, renders `ul.tags`), `sh-tag` (one tag, renders `li.tag`) |
| Library path | `frontend/projects/components/src/lib/tag/` |
| Status | planned |
| Traces to | L2-017, L2-043, L2-047, L2-064, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`tag.html`](../../design-system/components/tag.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`pages/caterer/more-dishes`](../../mocks/pages/caterer/more-dishes.html), [`pages/profile-menu/default`](../../mocks/pages/profile-menu/default.html), [`dialogs/dish/default`](../../mocks/dialogs/dish/default.html), [`dialogs/remove-dish/default`](../../mocks/dialogs/remove-dish/default.html), [`pages/admin-profile-review/default`](../../mocks/pages/admin-profile-review/default.html), [`pages/admin-profile-review/resubmitted`](../../mocks/pages/admin-profile-review/resubmitted.html), [`dialogs/approve-profile/default`](../../mocks/dialogs/approve-profile/default.html), [`dialogs/request-changes/default`](../../mocks/dialogs/request-changes/default.html) |
| Rendering | [`tag.html`](tag.html) |

## Purpose and scope

Tags are the dietary and allergen facts on a dish: "Halal", "Vegan",
"Gluten-free", "Contains nuts". They come from a fixed list of eight values the
caterer ticks in the dish dialog, so customers can rely on them; they are never
free text in a description. Dietary tags (what a dish suits, plus "Spicy") are
a quiet outline; allergen tags ("Contains nuts", "Contains shellfish") carry a
mango tint and a warning icon so they are noticed before someone orders for a
guest with an allergy. They are the caterer's own statement: Sweet Hand does
not test dishes or certify kitchens.

`sh-tags` is the row: it takes the dish's stored values, puts them in the one
fixed order and renders a list. `sh-tag` is a single pill, used by the row and
nowhere else today. Use something else for anything a person can press or
remove (chip), a record's state ([status label](status.md)), or a count or
"New" ([badge](badge.md)). The dish row around the tags is [dish](dish.md).

Out of scope:

- The "Dietary tags" checkboxes in the dish dialog: [checkbox](checkbox.md)
  in the dish form; the dialog offers the same eight values in the same order.
- Filtering the listing by dietary need: no L2 requires it yet; if one is
  added, the tappable version is a chip, not a tag.
- The note telling customers that tags are the caterer's own statement: the
  caterer page's menu section owns it (D-7).
- The operator's recent-changes feed and the revert dialog, which show a
  changed dish as one line of text ("Escovitch fish · From $19 per person ·
  Gluten-free"), not as tags.

## Usage

Inventory from `usage_inventory.py docs/mocks tag "li|span|ul|div"` (379
dietary and 55 allergen tags in 288 rows on 7 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default`, `more-dishes`, `long`, `signed-in` and the other caterer-page states | row under each `li.dish` | Curry goat: "Gluten-free", "Halal", "Spicy"; Doubles: "Vegan", "Spicy"; Sweet bread: "Contains nuts"; Paw paw chow: "Vegan", "Gluten-free", "Spicy" | default, no tags (no row) | canvas |
| `pages/caterer/edge` | row with all eight values on the longest dish name | "Vegetarian" … "Contains shellfish", "Spicy" | wraps over three lines at 320 px | canvas |
| `pages/profile-menu/default` (menu manager) | row inside `.edit-row__body`, beside move and edit buttons | Chicken pelau: "Gluten-free", "Dairy-free" | default, on a hovered row | canvas |
| `dialogs/dish/*`, `dialogs/remove-dish/*` (page behind) | same as the menu manager | — | default | canvas behind a dialog |
| `pages/admin-profile-review/default`, `resubmitted`; `dialogs/approve-profile`, `request-changes` (page behind) | row under each dish in the operator's preview | Breadfruit & Butter: "Gluten-free", "Dairy-free" | default, changed since last review (D-5) | canvas |
| Design system only | allergen icon, dietary icon, changed, loading | "Halal" with check icon, "Contains nuts" with warning icon | — | any |

## Anatomy

1. **Row** — `ul.tags`: list reset, wrapping flex, `--space-2` gaps,
   `--space-1` above. Absent when the dish has no tags.
2. **Item** — `li.tag` (dietary) or `li.tag.tag--allergen`: an inline-flex pill
   at least `--target-min` tall, hairline border, `--radius-full`, never wraps
   internally.
3. **Icon** — `svg.icon`, `aria-hidden="true"`, `--icon-size-xs`, before the
   label. Always on allergen tags (warning triangle); never on dietary tags
   (D-3).
4. **Label** — the translated value, `--text-caption`.
5. **Changed marker (operator review only)** — the pill wrapped in
   `ins.diff-new` inside a plain `li` (D-5).
6. **Skeleton (loading only)** — `span.skeleton.skeleton--text` pills inside the
   row, `aria-hidden="true"`.

Host: both hosts are `display: contents`, so `ul.tags` sits directly in the
dish (or `.edit-row__body`) and `li.tag` directly in the `ul`, keeping list
semantics intact.

## API

### `sh-tags` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `values` | `DietaryTag[]` | `[]` | yes | The dish's stored values, in any order. The component sorts them into the canonical order and drops duplicates. An empty array renders nothing: no `ul`, no text. |
| `labels` | `Record<DietaryTag, string>` | — | yes | The translated label for each value ("Gluten-free", "Contains nuts"), from the resource files. |
| `changed` | `DietaryTag[]` | `[]` | no | Values added since the operator's last "Changes requested" decision; each is wrapped in `ins.diff-new`. Only the operator review sets it. |
| `skeleton` | `boolean` | `false` | no | Renders `ul.tags` with two pill skeletons (4rem and 6rem) and `aria-hidden="true"`, ignoring `values`. |

`DietaryTag` is `'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free' |
'halal' | 'contains-nuts' | 'contains-shellfish' | 'spicy'`, which is also the
canonical order. `contains-nuts` and `contains-shellfish` are allergens; the
component decides the variant from the value, never the consumer (D-2).

### `sh-tag` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `value` | `DietaryTag` | — | yes | Decides `.tag--allergen` and the icon. |
| `label` | `string` | — | yes | The translated label, rendered as text. |
| `changed` | `boolean` | `false` | no | Wraps the pill in `ins.diff-new` (the `li` loses the `tag` class and the inner `span.tag` carries it). |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Tags are not interactive. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| None | — | Values come from the fixed list only, so there is no slot through which free text could become a tag (L2-017.3). |

- Translation: every label arrives through `labels` / `label` from the
  resource files (L2-064); the stored values are language-neutral codes.

## Variants and sizes

| Variant | Class | Values |
|---|---|---|
| Dietary | `.tag` | Vegetarian, Vegan, Gluten-free, Dairy-free, Halal, Spicy |
| Allergen | `.tag.tag--allergen` with the warning icon | Contains nuts, Contains shellfish |

One size: `--text-caption` (12 px) in a pill at least `--target-min` (24 px)
tall with `--space-2` side padding; the icon is `--icon-size-xs` (14 px).
Width follows the label. Tags stay smaller than the dish name and price in
every context.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | values present | Pills in canonical order | "list, 3 items: Gluten-free, Halal, Spicy" |
| No tags | `values` empty | Nothing; no row, no "No dietary information" | Nothing |
| On a hovered row | the menu-manager row `:hover` | Tags unchanged | — |
| Changed (operator review) | value in `changed` | Pill on a `--color-warning-bg` highlight (`ins.diff-new`) | `ins` is exposed as an insertion where supported; the label is read as usual |
| Loading | `skeleton` | Two shimmering pill bars in the final row position | Hidden |
| Hover, focus, active, disabled | — | Never: tags are not interactive | Not in the tab order |
| Forced colours | `forced-colors: active` | Hairline `CanvasText` border, system text | — |

## Markup

```html
<!-- rendered: Pelau House's curry goat (stored as halal, gluten-free, spicy) -->
<ul class="tags"><li class="tag">Gluten-free</li><li class="tag">Halal</li><li class="tag">Spicy</li></ul>
```

```html
<!-- rendered: sweet bread, allergen with its icon -->
<ul class="tags"><li class="tag tag--allergen"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/></svg>Contains nuts</li></ul>
```

```html
<!-- rendered: operator review of a resubmitted profile, "Gluten-free" newly added -->
<ul class="tags"><li><ins class="diff-new"><span class="tag">Gluten-free</span></ins></li><li class="tag">Dairy-free</li></ul>
```

```html
<!-- rendered: loading -->
<ul class="tags" aria-hidden="true"><li class="skeleton skeleton--text" style="width: 4rem; border-radius: var(--radius-full)"></li><li class="skeleton skeleton--text" style="width: 6rem; border-radius: var(--radius-full)"></li></ul>
```

A dish with no tags renders no `ul.tags` at all.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: caterer page menu -->
<li class="dish">…<p class="dish__desc">{{ dish.description }}</p>
  <sh-tags [values]="dish.tags" [labels]="tagLabels"></sh-tags></li>

<!-- consumer: operator review of a resubmitted profile -->
<sh-tags [values]="dish.tags" [labels]="tagLabels" [changed]="dish.tagsAddedSinceReview"></sh-tags>
```

The e2e page objects locate tags by `ul.tags`, `.tag`, `.tag--allergen` and
`ins.diff-new .tag`; those are part of the contract. The icon's path data is
free to change.

## Design

- Row: `display: flex; flex-wrap: wrap`, `--space-2` gaps, `--space-1` top
  margin, list reset.
- Pill: `--target-min` minimum height, `--space-2` side padding, `--space-1`
  between icon and label, `--border-width-hairline` border, `--radius-full`,
  `white-space: nowrap`.
- Label: `--text-caption`. Icon: `--icon-size-xs`, stroke `currentColor`.
- Changed highlight: `.diff-new` (`--color-warning-bg`, `--radius-xs`,
  `--space-1` padding) around the pill.
- Skeleton: `.skeleton.skeleton--text` pills with `--radius-full`, shimmer over
  `--duration-loop`.
- Motion and layers: none.

Component tokens: none.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Dietary border | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Dietary label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Allergen fill | `--color-warning-bg` | `--palette-mango-50` | `--palette-mango-950` |
| Allergen border | `--color-warning-border` | `--palette-mango-300` | `--palette-mango-700` |
| Allergen label and icon | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Changed highlight | `--color-warning-bg` | `--palette-mango-50` | `--palette-mango-950` |

Allergens use the warning family, never danger (an allergen is information,
not an error) and never pepper (which means "selected").

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Dietary label on the page |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Dietary label on a card or dialog |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Allergen label |
| `--color-warning-fg` | `--color-warning-bg` | 3:1 | Allergen icon (meaningful graphic) |
| `--color-warning-border` | `--color-bg-canvas` | decorative | Allergen edge; the words carry the meaning |

Tag outlines are decorative: the text identifies the tag, so neither border
needs 3:1. Forced colours: `components.css` gives `.tag` a `CanvasText` border
and `forced-color-adjust: none`.

## Responsive behaviour

- The row is the dish's full width at every breakpoint and always follows the
  description; it never moves beside the price.
- Tags never wrap inside; the row wraps between tags. All eight on one dish
  take three lines at 320 px, with nothing clipped and no horizontal scroll.
- In the menu manager (`.edit-row`) the row sits beside the move and edit
  buttons from 36rem; below that the buttons drop under the tags (edit-row
  owns that layout).
- Tags are not touch targets; at 24 px tall they would already meet WCAG 2.5.8
  if a future filter made them tappable (and then they would be chips).

## Accessibility

### Role and pattern

A native list: `ul.tags` of `li.tag`, read as "list, 3 items" after the dish
name and description. No ARIA roles, no interaction.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Never stops on a tag or the row. |

### Focus

None.

### Labelling

- The words carry the meaning; colour and icon are extra cues. "Contains"
  starts every allergen, so a screen-reader user hears "Contains nuts".
- Icons are `aria-hidden="true"`; no `alt` or `aria-label` is added.
- Never abbreviations ("GF", "V"): they are not announced meaningfully.

### Announcements

None.

### Motion

None, except the skeleton shimmer, which stops under
`prefers-reduced-motion: reduce` ([skeleton](skeleton.md)).

## Content and internationalisation

- Only the fixed values, written exactly: Vegetarian, Vegan, Gluten-free,
  Dairy-free, Halal, Contains nuts, Contains shellfish, Spicy. Sentence case,
  hyphenated "-free".
- Fixed order: dietary (Vegetarian, Vegan, Gluten-free, Dairy-free, Halal),
  then allergens, then Spicy — the order of L2-017.3 and of the dish dialog,
  whatever order the boxes were ticked in.
- Don't repeat a tag in the description: "Dasheen bush, okra and coconut,
  swizzled smooth", not "A vegan callaloo".
- Translatable: every label (French "Sans gluten", "Contient des noix" is
  longer; the row wraps). Data: the stored codes.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the sorted, de-duplicated
  list and each tag's variant) are computed once, not in the template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Tags.ts`
  renders the edge-case platter on `pages/caterer/edge` with all eight tags;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `CatererMenu` (Pelau House's 12 dishes), `MenuManager`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the skeleton pills sit where the tags will; tags are part
  of the server-rendered HTML of the caterer page, so nothing shifts after
  load.
- Weight: no dependencies; the one icon is inline SVG.

## Acceptance criteria

### Rendering

- **AC-1** Given Pelau House's "Curry goat" stored with the values halal, gluten-free and spicy, when the caterer page renders, then the dish shows `ul.tags` with exactly "Gluten-free", "Halal", "Spicy" in that order. (L2-017)
- **AC-2** Given a dish stored with all eight values in reverse order, when the row renders, then the tags read "Vegetarian", "Vegan", "Gluten-free", "Dairy-free", "Halal", "Contains nuts", "Contains shellfish", "Spicy". (L2-017)
- **AC-3** Given the dish "Goat water" on the edge-case caterer page with no tags, when the menu renders, then the dish contains no `ul.tags`, no empty list and no text such as "No dietary information". (L2-017)
- **AC-4** Given a stored value outside the fixed list (such as "Nut-free kitchen"), when `sh-tags` receives it, then no tag is rendered for it and only the fixed-list values appear. (L2-017)
- **AC-5** Given Pelau House's "Sweet bread" stored with contains-nuts, when it renders, then the tag is `li.tag.tag--allergen` with a warning icon first and the text "Contains nuts". (L2-017)
- **AC-6** Given Kendra's menu manager, when "Chicken pelau" renders with gluten-free and dairy-free and she hovers the row, then the tags "Gluten-free" and "Dairy-free" show in that order and do not change on hover. (L2-043)
- **AC-7** Given Leah opens Breadfruit & Butter's resubmitted profile in which "Gluten-free" was added to "Roasted breadfruit and fried jackfish" after the last "Changes requested", when the review renders, then that tag is wrapped in `ins.diff-new` and the dish's other tags are not. (L2-047)
- **AC-8** Given a dish is loading, when `sh-tags` renders with `skeleton`, then `ul.tags` has `aria-hidden="true"` and holds two pill skeletons and no text. (L2-066)

### Screen readers

- **AC-9** Given "Curry goat" on the caterer page, when a screen reader reaches its tags, then it announces a list of 3 items "Gluten-free", "Halal", "Spicy" and nothing for the icons or borders. (L2-068)
- **AC-10** Given "Sweet bread" with its allergen icon, when it is inspected, then the `svg` has `aria-hidden="true"` and the tag's accessible text is exactly "Contains nuts". (L2-068)
- **AC-11** Given the caterer page with tags in every variant, when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations. (L2-066)

### Keyboard and focus

- **AC-12** Given Pelau House's menu, when a keyboard user tabs from "Curry goat" to the next dish's controls, then focus never lands on a tag or a tag row. (L2-067)

### Theming

- **AC-13** Given the light and the dark theme, when "Gluten-free" renders on the page canvas and on a dialog surface, then its label has at least 4.5:1 contrast against each. (L2-069)
- **AC-14** Given the light and the dark theme, when "Contains shellfish" renders, then its label has at least 4.5:1 and its icon at least 3:1 contrast against `--color-warning-bg`. (L2-069)
- **AC-15** Given "Contains nuts" is rendered in greyscale, when it is compared with a dietary tag, then it is still identified as an allergen by its word "Contains" and its warning icon, not by colour alone. (L2-069)

### Responsive

- **AC-16** Given a 320 px viewport, when the edge-case dish with all eight tags renders, then the row wraps between tags onto three lines, no tag breaks inside, nothing is clipped and the page does not scroll horizontally. (L2-064)
- **AC-17** Given a 1280 px window at 200 % zoom, when Pelau House's menu renders, then every tag is fully visible and the row wraps without horizontal scrolling. (L2-069)

### Motion

- **AC-18** Given `prefers-reduced-motion: reduce`, when the tag skeleton renders, then its shimmer does not animate. (L2-069)

### Performance

- **AC-19** Given the `Tags` perf-test scenario with all eight tags, when it renders, then the sort runs once per change of `values` and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/tag/`; files
  `tags.component.*` (selector `sh-tags`, class `TagsComponent`) and
  `tag.component.*` (selector `sh-tag`, class `TagComponent`); the `DietaryTag`
  type and the canonical order constant are exported from the folder's public
  API so the dish dialog's checkboxes use the same order.
- Styles: the "Tag" section of `components.css` moves into the component,
  class names unscoped. `.diff-new` and `.skeleton` stay shared.
- Mock drift: tag order varies in the mocks ("Halal, Gluten-free, Spicy" on
  curry goat); the component's sort replaces it. No mock shows the allergen
  icon; the component always renders it (D-3).
- Composed by [dish](dish.md) and the menu manager's edit row. No CDK
  primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Who decides the order and the allergen variant?* The component, from the value. The design system fixed drifting orders by requiring the dialog's order, and letting consumers choose would let the drift return; a value-to-variant map means "Contains nuts" can never render as a plain dietary tag.
- **D-3** *Do allergen tags carry the warning icon?* Always, and dietary tags never. The design system recommends it on allergens and supports icons on both; a fixed rule keeps allergens noticeable for people scanning and avoids decorative icons on the quiet dietary tags. The check icon in the design system's state matrix is a demonstration only.
- **D-4** *What happens to a value outside the list?* It is dropped silently in the UI (and logged by the API layer, not here). L2-017.3 allows only the fixed list; showing an unknown value would let free text reach customers.
- **D-5** *Does the tag own a "changed" state?* Yes, through `changed`, for the operator's review of a resubmitted profile (L2-047.3), using the design system's `.diff-new` highlight around the pill. The recent-changes feed and revert dialog show dish changes as a text line, so they do not use it.
- **D-6** *Does the tag row own a loading state?* Yes, as `skeleton`, matching the design system's pill skeletons, so a dish skeleton can place it without restyling `.skeleton`.
- **D-7** *Who shows "Dietary and allergen tags come from the caterer…"?* The caterer page's menu section, once, not every tag row. The design system proposes the note; no mock has it yet, so the menu section's mock and CRD carry it.
