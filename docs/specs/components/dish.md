# Dish

| Field | Value |
|---|---|
| Selector | `sh-dish` (one menu item), `sh-dish-list` (the ruled menu list with its loading state and "Show all" toggle) |
| Library path | `frontend/projects/components/src/lib/dish/` |
| Status | planned |
| Traces to | L2-015, L2-017, L2-043, L2-045, L2-047, L2-064, L2-066, L2-067, L2-068, L2-069, L2-080, L2-085 |
| Design system | [`dish.html`](../../design-system/components/dish.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/more-dishes`](../../mocks/pages/caterer/more-dishes.html), [`pages/caterer/edge`](../../mocks/pages/caterer/edge.html), [`pages/caterer/loading`](../../mocks/pages/caterer/loading.html), [`pages/profile-menu/default`](../../mocks/pages/profile-menu/default.html), [`pages/profile-menu/full`](../../mocks/pages/profile-menu/full.html), [`pages/profile-menu/read-only`](../../mocks/pages/profile-menu/read-only.html), [`pages/profile-menu/loading`](../../mocks/pages/profile-menu/loading.html), [`pages/admin-profile-review/default`](../../mocks/pages/admin-profile-review/default.html), [`dialogs/remove-dish/default`](../../mocks/dialogs/remove-dish/default.html), [`dialogs/approve-profile/default`](../../mocks/dialogs/approve-profile/default.html) |
| Rendering | [`dish.html`](dish.html) |

## Purpose and scope

A dish is one item on a caterer's menu: the name as the caterer spells it
("Buss up shut", "Pholourie", "Paw paw chow"), an optional price in Canadian
dollars ("From $16 per person"), an optional one-line description, and
dietary and allergen tags as structured data. It is a row of text in a quiet
ruled list, never a card and never a photo. Only the name is required; a dish
with nothing else ("Goat water") still reads cleanly.

`sh-dish-list` is the caterer page's Menu list: one column on phones, two from
48rem, the loading skeletons, and the "Show all 18 dishes" disclosure that
expands the rest in place. The caterer's menu manager shows the same dish
parts inside a [list](list.md) edit row with move, edit and remove buttons;
`sh-dish` renders those parts with `layout="row"`. Food photos are
[photo](photo.md) and [photo tile](photo-tile.md); the tags themselves are
[tag](tag.md).

Out of scope:

- The manager row (`li.edit-row`), its four icon buttons, unavailable moves at
  the ends, focus following a moved dish and the "Doubles moved to position 4
  of 18" announcement: [list](list.md) and the menu page.
- The add, edit and remove dialogs (`dialogs/dish`, `dialogs/remove-dish`) and
  their validation (L2-043): [dialog](dialog.md) and the page.
- The Menu section heading and its "18 dishes" count (`.caterer-section__head`,
  `.result-count`): the caterer page.
- The manager's empty, full, read-only and error states: [empty
  state](empty-state.md), [alert](alert.md) and the page.
- Tag styles and the fixed vocabulary's translations: [tag](tag.md).

## Usage

Inventory from `usage_inventory.py docs/mocks dish "li|ul|div|span|h3|p"` and a
search of every `dish__name` in `docs/mocks/` (27 screens).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/default`, `can-review`, `no-reviews`, `own-review`, `offline` | list, 12 of 18 shown, `h3` names, toggle collapsed | "Chicken pelau" / "From $16 per person" / "Browned in burnt sugar…" / Gluten-free, Dairy-free; "Aloo pie" / Vegan; "Shrimp fried rice" / Contains shellfish; "Black cake" / "$65 per cake" / Contains nuts | default, collapsed | canvas |
| `pages/caterer/more-dishes` | list, all 18, toggle expanded | dishes 13–18: "Coconut bake" "$2 each", "Sweet bread" Contains nuts, "Sorrel" "$14 per litre" … | expanded | canvas |
| `pages/caterer/edge` | list | "Goat water" and "Conkies" name only; "Stewed saltfish, spicy plantain, coconut dumplings and seasoned breadfruit platter" / "From $1,250 per 50 guests" / long description / all eight tags | name only, long name, eight tags | canvas |
| `pages/caterer/loading` | list, 6 skeleton dishes | — | loading | canvas |
| `pages/admin-profile-review/*`, `dialogs/approve-profile/*`, `request-changes/*` | list, `h4` names (under an `h3` "Menu"), no toggle | Flying Fish Kitchen and Auntie Bev's dishes: "Brown stew chicken" / "From $15 per person" … | default | canvas |
| `pages/profile-menu/default`, `full`, `read-only`; `dialogs/remove-dish/*`, `dialogs/dish/*` (page behind) | `layout="row"` inside `li.edit-row`, `span` name, price under the name | Pelau House's 18 dishes, "Paw paw chow" / Vegan, Gluten-free, Spicy | default, read-only (no actions) | canvas |
| `pages/profile-menu/loading` | manager skeleton rows (`edit-row--skeleton`) | — | loading | canvas |

## Anatomy

1. **Item** — `li.dish`: a flex column, `--space-1` between parts,
   `--space-5` padding above and below, a hairline `--color-border-default`
   rule underneath. No card, no shadow.
2. **Top row** — `div.dish__top`: the name and the price on one wrapping line,
   `--space-4` apart, baseline-aligned.
3. **Name** — `h3.dish__name` (or the level given; `span` in a manager row):
   `--text-h4` at `--font-size-lg`, `overflow-wrap: anywhere`, never
   truncated. In the list it takes `flex: 1 1 12rem`.
4. **Price (optional)** — `span.dish__price`: `--text-body-sm`, muted,
   tabular figures, never wraps inside itself; drops below the name when they
   cannot share a line.
5. **Description (optional)** — `p.dish__desc`: `--text-body-sm`, muted.
6. **Tags (optional)** — `ul.tags` of `li.tag` ([tag](tag.md)); allergens add
   `.tag--allergen`.
7. **List** — `ul.dish-list`: a list reset and a grid, one column with a top
   rule below 48rem, two columns with a `--space-12` gutter from 48rem.
8. **Skeleton (loading only)** — `li.dish.dish--skeleton`, `aria-hidden`: two
   `.skeleton.skeleton--text` bars, 50 % and 80 % wide.
9. **Toggle** — a secondary [button](button.md) after the list, inside a `p`,
   with `aria-expanded` and `aria-controls` naming the list.

Host: `sh-dish` with `layout="menu"` renders `li.dish` as its only child and
must be a direct child of `sh-dish-list`'s `ul` (the host is `display:
contents`, so the `ul > li` structure stays valid). With `layout="row"` it
renders the three parts with no wrapper, inside the consumer's
`.edit-row__body`. `sh-dish-list` is `display: block` and renders the `ul`,
then the toggle.

## API

### `sh-dish` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `name` | `string` | — | yes | 2–80 characters (L2-043), rendered as text, never HTML. |
| `price` | `string \| null` | `null` | no | The caterer's price guidance as entered, up to 60 characters ("From $16 per person"). `null` renders no `.dish__price`. |
| `description` | `string \| null` | `null` | no | Up to 300 characters, plain text. `null` renders no `p`. |
| `tags` | `DietaryTag[]` | `[]` | no | Values from the fixed list `'vegetarian' \| 'vegan' \| 'gluten-free' \| 'dairy-free' \| 'halal' \| 'contains-nuts' \| 'contains-shellfish' \| 'spicy'`. Rendered through [tag](tag.md)'s `sh-tags`, which sorts them into that list's order whatever the input order (D-4); `contains-*` add `.tag--allergen`. Empty renders no `ul.tags`. |
| `tagLabels` | `Record<DietaryTag, string>` | — | yes when `tags` is not empty | The translated words ("Gluten-free", "Contains nuts"), passed to [tag](tag.md)'s `labels`. |
| `changedTags` | `DietaryTag[]` | `[]` | no | Passed to [tag](tag.md)'s `changed`: tags added since the last "Changes requested" decision, marked only in the operator's review of a resubmitted profile. |
| `headingLevel` | `3 \| 4 \| 5` | `3` | no | The name's heading level in `layout="menu"` (the admin review nests the menu one level deeper: `4`). |
| `layout` | `'menu' \| 'row'` | `'menu'` | no | `menu` renders `li.dish` with a heading name; `row` renders `div.dish__top` with a `span` name, then description and tags, for an `.edit-row__body`. |
| `skeleton` | `boolean` | `false` | no | Renders `li.dish.dish--skeleton` with two bars, `aria-hidden="true"`, and ignores every other input. |

### `sh-dish-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `listId` | `string` | — | yes | The `ul`'s `id`; the toggle's `aria-controls` points at it. |
| `busy` | `boolean` | `false` | no | Renders `skeletonCount` skeleton dishes in place of the projected ones and sets `aria-busy="true"` on the `ul`. |
| `skeletonCount` | `number` | `6` | no | Whole number from 1 to 12. |
| `collapsedCount` | `number \| null` | `12` | no | How many dishes show while collapsed (L2-017). `null` shows every dish and no toggle (admin review). |
| `expanded` | `boolean` | `false` | no | Two-way: shows all projected dishes and flips the toggle. |
| `showAllLabel` | `string` | — | yes when the toggle can show | "Show all 18 dishes", formatted by the consumer with the count. |
| `showFewerLabel` | `string` | — | yes when the toggle can show | "Show fewer dishes". |
| `expandedAnnouncement` | `string` | — | yes when the toggle can show | "18 dishes shown", said politely after expanding. |

The toggle renders only when there are more projected dishes than
`collapsedCount`.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `expandedChange` (`sh-dish-list`) | `boolean` | The toggle is activated. The list expands or collapses in place, with no reload and no network request (D-5). |
| None (`sh-dish`) | — | A dish is static text. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-dish-list`: default | `sh-dish` elements with `layout="menu"` | In the menu's order. Hidden while `busy`. |
| `sh-dish`: none | — | Every part is an input, so tags stay structured and nothing else (photos, prices in free text, "certified") gets in. |

- Translation: `tagLabels`, `showAllLabel`, `showFewerLabel` and
  `expandedAnnouncement` come from the resource files (L2-064). `name`,
  `price` and `description` are the caterer's data and are never translated.

## Variants and sizes

| Variant | Element | Use for |
|---|---|---|
| Menu dish | `li.dish` in `ul.dish-list`, heading name | The caterer page and the operator's profile review. |
| Row parts | parts inside `.edit-row__body`, `span` name, price under the name | The caterer's menu manager and dialogs over it. |
| Skeleton | `li.dish.dish--skeleton` | Loading the public menu. |

Content combinations the dish must render intentionally: all four parts; name
+ price + description; name + description + tags (no price); name + tags only
(allergen included); name + price + allergen; name only.

One size. Type, spacing and tags never shrink; only the list's columns change
(see Responsive).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Name, then the optional parts | Heading, then text, then a list of tags |
| Name only | `price`, `description`, `tags` all empty | The name and its rule; no empty lines or labels | Heading only |
| Long name | name does not leave 12rem beside the price | The price drops below the name, left-aligned | Unchanged |
| Many tags | up to eight tags | Tags wrap onto as many lines as needed | "list, 8 items" |
| Loading | list `busy` | Six skeleton dishes in the final grid, shimmering | `ul` `aria-busy="true"`; skeletons `aria-hidden`; the page's status says "Loading Pelau House" |
| Collapsed | more than `collapsedCount` dishes, not expanded | First 12; toggle "Show all 18 dishes", `aria-expanded="false"` | Toggle states collapsed |
| Expanded | toggle activated | All dishes; toggle "Show fewer dishes", `aria-expanded="true"`; focus stays on the toggle | "18 dishes shown" announced politely |
| Read-only (manager) | profile in review | Row parts unchanged; the row has no actions ([list](list.md)) | — |
| Hover, focus, active, disabled | — | None: a dish is not interactive; the toggle has the [button](button.md) states | — |

## Markup

```html
<!-- rendered: menu list with a full dish, an allergen dish and a name-only dish; collapsed toggle -->
<ul class="dish-list" id="dish-list">
  <li class="dish">
    <div class="dish__top"><h3 class="dish__name">Chicken pelau</h3><span class="dish__price">From $16 per person</span></div>
    <p class="dish__desc">Browned in burnt sugar, cooked down with pigeon peas, rice and coconut milk.</p>
    <ul class="tags"><li class="tag">Gluten-free</li><li class="tag">Dairy-free</li></ul>
  </li>
  <li class="dish"><div class="dish__top"><h3 class="dish__name">Black cake</h3><span class="dish__price">$65 per cake</span></div><p class="dish__desc">Fruit soaked since last Christmas.</p><ul class="tags"><li class="tag tag--allergen">Contains nuts</li></ul></li>
  <li class="dish"><div class="dish__top"><h3 class="dish__name">Goat water</h3></div></li>
</ul>
<p><button class="btn" type="button" aria-expanded="false" aria-controls="dish-list">Show all 18 dishes</button></p>
<p class="visually-hidden" role="status" aria-live="polite"></p>
```

```html
<!-- rendered: loading -->
<ul class="dish-list" id="dish-list" aria-busy="true">
  <li class="dish dish--skeleton" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></li>
  … (6 in all)
</ul>
```

```html
<!-- rendered: row parts inside the manager's edit row (the li and actions belong to list) -->
<div class="edit-row__body">
  <div class="dish__top"><span class="dish__name">Doubles</span><span class="dish__price">$3 each, 40 minimum</span></div>
  <p class="dish__desc">Bara and curry channa with tamarind and cucumber chutney.</p>
  <ul class="tags"><li class="tag">Vegan</li><li class="tag">Spicy</li></ul>
</div>
```

Consumer templates (binding syntax illustrative):

```html
<sh-dish-list listId="dish-list" [busy]="loading()" [(expanded)]="showAll"
    [showAllLabel]="t('menu.showAll', { count: 18 })" [showFewerLabel]="t('menu.showFewer')" [expandedAnnouncement]="t('menu.shown', { count: 18 })">
  @for (d of caterer.dishes; track d.id) {
    <sh-dish [name]="d.name" [price]="d.price" [description]="d.description" [tags]="d.tags" [tagLabels]="tagLabels"></sh-dish>
  }
</sh-dish-list>

<!-- manager row: list owns the li and actions -->
<li class="edit-row"><div class="edit-row__body"><sh-dish layout="row" [name]="d.name" [price]="d.price" [description]="d.description" [tags]="d.tags" [tagLabels]="tagLabels"></sh-dish></div>…</li>
```

The e2e page objects locate dishes by `.dish`, `.dish__name`, `.dish__price`,
`.dish__desc`, `.tag`, `.tag--allergen`, `.dish--skeleton`, the list's
`aria-busy` and the toggle's `aria-expanded`; those are part of the contract.

## Design

- Item: `--space-5` block padding, `--space-1` gap between parts, hairline
  `--border-width-hairline` rule in `--color-border-default`.
- Top row: `--space-4` gap; the name `flex: 1 1 12rem` in the list; in a
  manager row the top row is a column with `--space-0-5` gap and the name has
  no flex basis.
- Name: `--text-h4` with `--font-size-lg`, `--color-fg-default`.
- Price and description: `--text-body-sm`, `--color-fg-muted`; price
  `white-space: nowrap`, tabular figures.
- Tags: `.tags` `--space-2` gap, `--space-1` above; each tag at least
  `--target-min` tall ([tag](tag.md)).
- List: gutter `--space-12` from 48rem; top rule below 48rem only.
- Skeleton bars from [skeleton](skeleton.md), 50 % and 80 % wide; shimmer
  over `--duration-loop`.
- Toggle: `--space-6` above it.
- Motion: none. Expanding and collapsing are instant.
- Layer: none.

Component tokens: none. The dish reads semantic tokens directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Name | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Price, description, dietary tag text | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Rule, dietary tag edge | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Allergen tag fill | `--color-warning-bg` | `--palette-mango-50` | `--palette-mango-950` |
| Allergen tag text | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Allergen tag edge | `--color-warning-border` | `--palette-mango-300` | `--palette-mango-700` |
| Skeleton | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Page | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |

Pepper red never marks a dish, a price or a "Spicy" tag: red means "selected"
on Sweet Hand. Spice is a word, not a colour.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Dish name |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Price, description, dietary tag text |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Allergen tag text |

The rule and the tag edges are decorative (the words carry the meaning), so
they are exempt from WCAG 1.4.11. Forced colours: tags draw a `CanvasText`
edge; the allergen fill may disappear, and "Contains …" still says it.

## Responsive behaviour

- Below 48rem: one column, with a rule above the first dish so the menu reads
  as a ruled list under the "Menu" heading.
- From 48rem: two equal columns, `--space-12` gutter, no top rule; each dish
  keeps its bottom rule; order runs left to right, then down.
- Name and price share a line while the name has at least 12rem; otherwise
  the price wraps below, left-aligned. At 320 px "From $1,250 per 50 guests"
  sits under the name.
- Names and descriptions wrap (long names break anywhere); nothing truncates;
  nothing scrolls horizontally at 320 px; at 200 % zoom in a 1280 px window
  the list is one column.
- A dish has no touch targets of its own; the toggle is a 44 px button.

## Accessibility

### Role and pattern

A plain list (`ul.dish-list`) of list items; each name is a heading one level
below the Menu heading (`h3` under the caterer page's `h2`), so screen-reader
users can jump dish to dish. Tags are a nested list. The toggle follows the
[APG Disclosure](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/) pattern.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Dishes are not focusable; Tab goes from the content before the menu to the toggle. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On the toggle, expands or collapses the list; focus stays on the toggle. |

### Focus

The toggle shows the shared ring ([button](button.md)). Expanding never moves
focus; the newly shown dishes follow the toggle's position in the list, so the
next Tab after the list continues from the toggle.

### Labelling

- The heading is the dish name exactly as entered.
- Allergen tags are self-describing ("Contains shellfish"); never an icon or
  "Shellfish" alone, never colour alone.
- The toggle has `aria-expanded` and `aria-controls="dish-list"` (fixing the
  drift in `caterer/default`).

### Announcements

After expanding, a polite status region says "18 dishes shown". Collapsing
says nothing. Loading is announced by the page.

### Motion

Nothing animates except the skeleton shimmer, which stops under
`prefers-reduced-motion: reduce`.

## Content and internationalisation

- Names are the caterer's, spelled as they and their community spell them, in
  sentence case, untranslated: "Buss up shut", "Saltfish buljol", "Curry
  channa and aloo". Never a "Caribbean" catch-all.
- Prices are CAD with a unit, as the caterer entered them: "From $16 per
  person", "$3 each, 40 minimum", "$65 per cake", "$14 per litre". No "CAD"
  suffix, no tax.
- Descriptions say what is in it or how it is made: "Slow-cooked with scotch
  bonnet."
- Tags come only from the fixed list (L2-017) and are the caterer's own
  statement; never "certified", "safe for" or "allergen-free".
- The toggle names the total: "Show all 18 dishes" / "Show fewer dishes".
- French tag words ("Sans gluten", "Contient des noix") are longer; tags wrap.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (sorted tags, allergen flags,
  the visible slice) are computed once, not in the template.
- The list renders all dishes and hides the rest with CSS (`hidden`), so
  expanding costs no request and no re-render of shown dishes.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Dish.ts`
  renders Pelau House's "Curry goat" ("From $18 per person", "Slow-cooked with
  scotch bonnet.", Halal, Gluten-free, Spicy); iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Menu` (Pelau House's 18 dishes, collapsed then
  expanded), `MenuLoading` (6 skeletons), `CatererPage`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: skeleton dishes have the padding and rule of a real dish;
  dishes are text, so nothing loads late.
- Weight: composes [tag](tag.md), [skeleton](skeleton.md) and
  [button](button.md) only.

## Acceptance criteria

### Rendering

- **AC-1** Given the dish "Curry goat" with description "Slow-cooked with scotch bonnet", tags Halal and Gluten-free and price "From $18 per person", when the menu renders, then the `li.dish` shows `.dish__name` "Curry goat", `.dish__price` "From $18 per person", `.dish__desc` "Slow-cooked with scotch bonnet" and two `.tag` items "Halal" and "Gluten-free". (L2-017)
- **AC-2** Given the dish "Goat water" with only a name, when it renders, then the `li.dish` contains only `.dish__top` with the name, and no `.dish__price`, `.dish__desc`, `ul.tags`, empty label or placeholder text. (L2-017)
- **AC-3** Given "Black cake" tagged Contains nuts, when it renders, then the tag reads "Contains nuts" and has `.tag--allergen`, and no tag reads anything outside the fixed list. (L2-017)
- **AC-4** Given the edge-case dish with all eight tags passed in any order, when it renders, then they appear as Vegetarian, Vegan, Gluten-free, Dairy-free, Halal, Contains nuts, Contains shellfish, Spicy, wrapping onto several lines. (L2-017)
- **AC-5** Given a dish name `<img src=x onerror=alert(1)>`, when the menu renders, then the heading shows that text literally and no script runs. (L2-080)
- **AC-6** Given Pelau House's page, when the menu renders, then each dish name is an `h3` under the "Menu" `h2`, and a screen reader's heading list includes "Chicken pelau", "Curry goat" … in menu order. (L2-066)
- **AC-7** Given an operator opens Flying Fish Kitchen's submitted profile, when the review screen renders the menu, then the dishes appear exactly as on the public page with `h4` names under the "Menu" `h3`, and no "Show all" toggle. (L2-047)

### List and toggle

- **AC-8** Given Pelau House with 18 dishes, when its page renders, then the first 12 dishes are shown in the caterer's order and a button reads "Show all 18 dishes" with `aria-expanded="false"` and `aria-controls="dish-list"`. (L2-017)
- **AC-9** Given the collapsed menu, when the visitor activates "Show all 18 dishes", then dishes 13–18 ("Coconut bake" … "Paw paw chow") appear without a page reload or network request, the button reads "Show fewer dishes" with `aria-expanded="true"`, and focus stays on it. (L2-017)
- **AC-10** Given the collapsed menu, when the visitor expands it, then a polite live region announces "18 dishes shown". (L2-067)
- **AC-11** Given the keyboard, when a user tabs through Pelau House's page, then no dish receives focus and the next stop after the content before the menu is the toggle. (L2-067)
- **AC-12** Given the menu section is in the page order, when Pelau House's page renders, then the menu appears after the description and the event-size summary and before the service areas. (L2-015)

### States

- **AC-13** Given Pelau House's page is loading, when the menu renders, then `ul.dish-list` has `aria-busy="true"` and holds 6 `li.dish.dish--skeleton` items, each `aria-hidden="true"`. (L2-066)
- **AC-14** Given the menu loading at 360 px, when the 12 dishes replace the skeletons, then the menu's first dish starts where the first skeleton was and the page's Cumulative Layout Shift stays at or below 0.1. (L2-085)
- **AC-15** Given Kendra's menu manager at 360 px, when "Doubles" renders in its edit row, then `span.dish__name` "Doubles" sits above `.dish__price` "$3 each, 40 minimum" with no gap wider than `--space-0-5` between them, and the row has no horizontal scroll. (L2-045)
- **AC-16** Given Kendra adds "Pepperpot" with a description at position 4, when the menu manager and her public page render, then "Pepperpot" is the fourth dish in both. (L2-043)

### Theming

- **AC-17** Given the light and dark themes, when "Stewed oxtail" renders, then the name has at least 4.5:1 and the price "From $22 per person" at least 4.5:1 contrast against the canvas. (L2-069)
- **AC-18** Given the light and dark themes, when "Contains nuts" renders, then its text has at least 4.5:1 contrast against `--color-warning-bg`, and no part of any dish uses `--color-accent`. (L2-069)

### Responsive

- **AC-19** Given a viewport of 360 px, when Pelau House's menu renders, then dishes are in one column with a rule above the first. (L2-064)
- **AC-20** Given a viewport of 800 px, when the menu renders, then dishes are in two columns, "Chicken pelau" left and "Curry goat" right on the first row, with no rule above the first row. (L2-064)
- **AC-21** Given a 320 px viewport, when the edge-case dish "Stewed saltfish, spicy plantain, coconut dumplings and seasoned breadfruit platter" renders, then "From $1,250 per 50 guests" sits on its own line under the name, nothing is cut off, and the page does not scroll horizontally. (L2-064)
- **AC-22** Given a 1280 px window at 200 % zoom, when the menu renders, then every dish's name, price, description and tags are visible in one column with no horizontal scrolling. (L2-069)

### Screen readers

- **AC-23** Given "Shrimp fried rice" tagged Contains shellfish, when a screen reader reads the dish, then it hears the heading "Shrimp fried rice" and a list of one item "Contains shellfish", with no icon or colour name. (L2-068)

## Implementation notes

- Folder `frontend/projects/components/src/lib/dish/`; files
  `dish.component.*` (`sh-dish`, `DishComponent`) and
  `dish-list.component.*` (`sh-dish-list`, `DishListComponent`); the
  `DietaryTag` type and its fixed order are exported from the folder's public
  API so the dish dialog's checkboxes use the same list.
- Styles: the "Dish (menu item)" section of `components.css` moves into the
  components, class names unscoped; `.edit-row .dish__top` stays with
  [list](list.md). Design-system catch-up: `.edit-row .dish__name { flex:
  none; }` (the proposed fix) and `.dish--skeleton` replace the inline widths
  in the mocks.
- `sh-dish` uses `display: contents` on its host in `layout="menu"`, so the
  `ul > li` structure stays valid for axe.
- The toggle and the status region are rendered by `sh-dish-list`; the page
  passes the translated, counted labels.
- No CDK primitive is needed. Composes [tag](tag.md), [skeleton](skeleton.md)
  and [button](button.md).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Does this component own the list and the "Show all" toggle?* Yes, as `sh-dish-list`. The design-system page documents the list's states (collapsed, expanded, loading) with the dish, and L2-017.4 ties the 12-dish limit to the menu.
- **D-3** *Who owns the manager row?* [List](list.md), whose design-system page lists `.edit-row`. The dish supplies only the parts inside `.edit-row__body` (`layout="row"`), so the row's actions, ordering and announcements stay in one place.
- **D-4** *In what order are tags shown?* The fixed L2-017 order (Vegetarian, Vegan, Gluten-free, Dairy-free, Halal, Contains nuts, Contains shellfish, Spicy), as `caterer/edge` shows. A fixed order lets customers scan for an allergen in the same place on every dish. "Curry goat" in `caterer/default` lists Halal before Gluten-free; that is mock drift.
- **D-5** *Does expanding fetch dishes 13–18?* No. The page receives all dishes (at most 50, L2-043) and the list hides the rest, so expanding is instant and works offline (`caterer/offline`).
- **D-6** *What does the expand announcement say, and does collapsing announce?* "18 dishes shown" after expanding, as the design system states; collapsing says nothing, because focus is on the toggle whose name already says "Show all 18 dishes".
- **D-7** *Is the price validated or formatted by the component?* No. Price guidance is the caterer's free text of up to 60 characters (L2-043); the component shows it as entered, so "$3 each, 40 minimum" keeps its wording.
