# Tabs

| Field | Value |
|---|---|
| Selector | `sh-tabs` (panel tabs: `div.tabs[role="tablist"]` plus panels), `sh-tab-panel` (one panel, projected into `sh-tabs`), `sh-link-tabs` (link tabs: `nav > div.tabs` of links) |
| Library path | `frontend/projects/components/src/lib/tabs/` |
| Status | planned |
| Traces to | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 |
| Design system | [`tabs.html`](../../design-system/components/tabs.html) |
| Source mocks | None use `.tabs`. Related patterns: [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html) (stacked sections instead), [`pages/inbox/default`](../../mocks/pages/inbox/default.html) and [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html) (segmented control instead) |
| Rendering | [`tabs.html`](tabs.html) |

## Purpose and scope

Tabs switch between two to five views of one object when each view is long
enough that stacking would bury the others and nobody needs to see two views
at once. A row of `.tab` labels sits over a hairline; the selected tab is ink
and semibold with a 2 px pepper underline, because a selected tab is "you are
here". There are two forms with the same look: **panel tabs** (`sh-tabs`), the
APG Tabs pattern with automatic activation, where each tab shows a panel on
the same page; and **link tabs** (`sh-link-tabs`), a `nav` of links where each
view has its own URL.

No Sweet Hand screen uses tabs today: the design system kept them for views
that will need them, and the CRD specifies them in full so the first consumer
does not reshape the API (D-2). The patterns that look like tabs are something
else and must stay so:

- Status filters on one list (Inbox "All 4 · Open 1 · Replied 1", the operator
  queue "All 7 · Profiles 2 · Name changes 1", Caterers "All 68 · Draft 3")
  are the segmented control in [button group](button-group.md): links that
  filter the same list, which wrap on phones.
- Long records (the operator's Pelau House record: Owner, Profile, Food
  handler certificate, Activity, Status history; the public caterer page) are
  stacked sections with headings, so an expired certificate is never hidden
  behind a second tab.
- Work-area sections are the [side nav](side-nav.md).

Out of scope:

- Panel content, its loading skeleton ([skeleton](skeleton.md)) and its
  errors: the consumer renders them inside `sh-tab-panel`.
- Routing for link tabs: the router decides which link is current.
- Keeping the selected panel in the URL: a consumer that needs a shareable
  view uses link tabs instead (D-5).

## Usage

`usage_inventory.py docs/mocks tab "button|a"` and a search for `role="tablist"`
find no use in `docs/mocks/`; the 83 `ul.segmented` rows are the [button
group](button-group.md)'s segmented control. The configurations below are the
design-system page's, which the API must build.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Design system, panel tabs (illustrative Pelau House record) | `sh-tabs` label "Pelau House record"; 4 tabs; automatic activation | "Profile", "Certificate", "Activity", "Status history"; panels "Trinidadian & Tobagonian (primary), Guyanese · Scarborough (primary) …", "Kendra Baptiste · Toronto Public Health · FH-2024-118734 · expires 14 Mar 2029" | selected, default, hover, focus | canvas or surface |
| Design system, anatomy | `sh-tabs`, a tab with an action badge | "Reports" + badge "1" ("1 open report") | default, selected | surface |
| Design system, link tabs | `sh-link-tabs` label "Pelau House record pages"; 3 links | "Profile" (current), "Certificate", "Audit log" | current, default, disabled | canvas |
| Design system, overflow | `sh-tabs` in a 20rem container; totals in labels | "All 7", "Profiles 2", "Name changes 1", "Certificates 1", "Reports" + badge "2" | scrolled | canvas |
| Design system, both themes | `sh-tabs` with a disabled tab | "Profile", "Certificate", "History" (disabled) | selected, disabled | light and dark |

## Anatomy

1. **Track** — `div.tabs`: a flex row, `--space-1` gap, a
   `--border-width-hairline` bottom edge in `--color-border-default`;
   `overflow-x: auto` with the scrollbar hidden.
2. **Tab** — `button.tab` (panel tabs) or `a.tab` (link tabs): label in
   `--text-label` at `--font-size-md`, `--color-fg-muted`, 44 px
   (`--target-comfortable`) high, `--space-3` inline padding, no wrap.
3. **Selected indicator** — the tab's `::after`: a `--border-width-thick` bar
   over the hairline, `--radius-xs` top corners; `--color-accent` when
   selected, `--color-border-strong` on hover, transparent otherwise.
4. **Count (optional)** — a total as plain text in the label ("All 7"), or an
   action count as `span.badge.badge--count` from [badge](badge.md),
   `aria-hidden="true"`, followed by visually hidden text (", 1 open report"; D-10).
5. **Panel** — `div[role="tabpanel"]` (panel tabs only), rendered by
   `sh-tab-panel`, `tabindex="0"`, `--space-4` above it; non-selected panels
   carry `hidden`.
6. **Navigation wrapper** — `nav[aria-label]` around the track (link tabs
   only).

Hosts: `sh-tabs`, `sh-tab-panel` and `sh-link-tabs` are layout-transparent
(`display: contents`); the track, tabs and panels are in the light DOM so
`.tab .badge` and the forced-colours rule apply.

## API

### `sh-tabs` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Rendered as `aria-label` on the tablist; names the object: "Pelau House record". |
| `tabs` | `TabItem[]` | — | yes | 2 to 5 tabs, rendered in order as `button.tab[role="tab"]`. |
| `selected` | `string` | first enabled tab's `id` | no | The selected tab's `id`. Two-way: the component updates it on user selection and emits `selectedChange`. |
| `activation` | `'automatic' \| 'manual'` | `'automatic'` | no | Automatic: arrow keys move focus and select. Manual: arrows move focus, Enter or Space selects — only for panels that load from the network. |

```ts
interface TabItem {
  id: string;            // "profile"; the tab is rendered with id "<tabs id>-tab-profile", the panel "<tabs id>-panel-profile"
  label: string;         // "Profile", from the resource files; may include a total: "All 7"
  count?: number;        // action count rendered as a badge; 0 or absent renders none
  countLabel?: string;   // hidden text after the badge: "1 open report"; required when count > 0 (D-10)
  disabled?: boolean;    // native disabled; never on a tab with a count
}
```

### `sh-tab-panel` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tabId` | `string` | — | yes | The `TabItem.id` this panel belongs to. Exactly one panel per tab. |

### `sh-link-tabs` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | Rendered as `aria-label` on the `nav`: "Pelau House record pages". |
| `links` | `LinkTabItem[]` | — | yes | 2 to 5 links, rendered as `a.tab`. |

```ts
interface LinkTabItem {
  label: string;
  href: string;
  current?: boolean;     // aria-current="page"; exactly one link is current
  count?: number;
  countLabel?: string;
  disabled?: boolean;    // renders <a class="tab" aria-disabled="true"> with no href
}
```

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `selectedChange` (`sh-tabs`) | `string`, the new tab `id` | The user selects a different tab by click, tap, arrow key, Home, End, or Enter/Space in manual mode. Not emitted when the consumer sets `selected`, nor when the selected tab is clicked again. |

`sh-link-tabs` has no output; navigation is the router's.

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-tabs` default | `sh-tab-panel` elements only | One per tab. The component wires `id`, `aria-labelledby` and `hidden`. Declared once. |
| `sh-tab-panel` default | Any content | The panel body. It is projected whether or not the panel is selected (D-4). |

- Translation: `label`, every tab `label` and `countLabel` arrive from the
  consumer, who takes them from the resource files (L2-064.4). The component
  contains no user-facing strings.

## Variants and sizes

| Variant | Element | Use for |
|---|---|---|
| Panel tabs | `sh-tabs` → `button.tab[role="tab"]` + `div[role="tabpanel"]` | Views of one object on one page, all loaded |
| Panel tabs, manual activation | `sh-tabs activation="manual"` | Views whose panels load from the network on selection |
| Link tabs | `sh-link-tabs` → `nav > div.tabs > a.tab` | Sibling pages of one object, each with its own URL |

One size: 44 px tall with 16 px labels, so tabs meet the phone target without
a compact variant. The width of each tab comes from its label and padding; the
track is as wide as its container and scrolls when the tabs are wider.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Label `--color-fg-muted`; no bar | "tab, 2 of 4" (panel) or link |
| Hover | `:hover` | Label `--color-fg-default`; bar `--color-border-strong` | — |
| Focus | `:focus-visible` | Shared ring colour and width, drawn inside the tab (offset `calc(-1 * (--focus-ring-width + --border-width-thick))`) so the scrolling track cannot clip it and it clears the bar (D-9) | Focused |
| Selected (panel) | `aria-selected="true"` | Label `--color-fg-default`, `--font-weight-semibold`; bar `--color-accent` | "selected"; `tabindex="0"`; its panel is shown |
| Current (link) | `aria-current="page"` | Same as selected | "current page" |
| Not selected (panel) | `aria-selected="false"` | Default look | `tabindex="-1"`; its panel has `hidden` |
| Disabled | `disabled` (button) / `aria-disabled="true"`, no `href` (link) | Label `--color-fg-disabled`, no bar, `cursor: not-allowed` | Skipped by arrow keys and Tab; announced as unavailable |
| With action count | `count > 0` | Badge after the label, `--space-1` apart | Badge `aria-hidden`; name "Reports, 1 open report" (D-10) |
| Overflowing | tabs wider than the track | Track scrolls sideways inside itself; scrollbar hidden; the selected tab is scrolled into view | — |
| Panel loading | consumer content | A skeleton inside the panel; the tab row never shows a spinner | The consumer sets `aria-busy` on its content |
| Forced colours | `forced-colors: active` | The selected or current tab is also underlined in text | — |

`data-state="hover|focus"` exists in `components.css` only for documentation
and mocks. The components never render it.

## Markup

```html
<!-- rendered: sh-tabs, automatic activation, Profile selected -->
<div class="tabs" role="tablist" aria-label="Pelau House record">
  <button class="tab" type="button" role="tab" id="record-tab-profile" aria-controls="record-panel-profile" aria-selected="true" tabindex="0">Profile</button>
  <button class="tab" type="button" role="tab" id="record-tab-certificate" aria-controls="record-panel-certificate" aria-selected="false" tabindex="-1">Certificate</button>
  <button class="tab" type="button" role="tab" id="record-tab-activity" aria-controls="record-panel-activity" aria-selected="false" tabindex="-1">Activity</button>
  <button class="tab" type="button" role="tab" id="record-tab-reports" aria-controls="record-panel-reports" aria-selected="false" tabindex="-1">Reports <span class="badge badge--count" aria-hidden="true">1</span><span class="visually-hidden">, 1 open report</span></button>
</div>
<div role="tabpanel" id="record-panel-profile" aria-labelledby="record-tab-profile" tabindex="0">…</div>
<div role="tabpanel" id="record-panel-certificate" aria-labelledby="record-tab-certificate" tabindex="0" hidden>…</div>
<div role="tabpanel" id="record-panel-activity" aria-labelledby="record-tab-activity" tabindex="0" hidden>…</div>
<div role="tabpanel" id="record-panel-reports" aria-labelledby="record-tab-reports" tabindex="0" hidden>…</div>
```

```html
<!-- rendered: a disabled panel tab -->
<button class="tab" type="button" role="tab" id="record-tab-history" aria-controls="record-panel-history" aria-selected="false" tabindex="-1" disabled>History</button>
```

```html
<!-- rendered: sh-link-tabs, Profile current, one disabled -->
<nav aria-label="Pelau House record pages">
  <div class="tabs">
    <a class="tab" href="/admin/caterers/pelau-house" aria-current="page">Profile</a>
    <a class="tab" href="/admin/caterers/pelau-house/certificate">Certificate</a>
    <a class="tab" aria-disabled="true">Audit log</a>
  </div>
</nav>
```

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: panel tabs -->
<sh-tabs [label]="t('record.tabs', { name: caterer.name })" [tabs]="recordTabs()" [(selected)]="view">
  <sh-tab-panel tabId="profile">…</sh-tab-panel>
  <sh-tab-panel tabId="certificate">…</sh-tab-panel>
  <sh-tab-panel tabId="activity">…</sh-tab-panel>
  <sh-tab-panel tabId="reports">…</sh-tab-panel>
</sh-tabs>

<!-- consumer: link tabs -->
<sh-link-tabs [label]="t('record.pages', { name: caterer.name })" [links]="recordPages()"></sh-link-tabs>
```

The e2e page objects locate tabs by role (`tablist`, `tab`, `tabpanel`) and
name, link tabs by `nav` name and link name, and the selection by
`aria-selected` or `aria-current`, so these roles, attributes and the `.tabs`
and `.tab` classes are part of the contract. Generated `id` prefixes are free
to change; the `aria-controls`/`aria-labelledby` pairing is not.

## Design

- Track: `--space-1` gap; tabs never shrink (`flex: none`); `--border-width-hairline` bottom edge in
  `--color-border-default`; `overflow-x: auto`, `scrollbar-width: none`.
- Tab: height `--target-comfortable`; `--space-3` inline padding; `--space-2`
  gap; `--text-label` at `--font-size-md`; selected `--font-weight-semibold`;
  no wrap; no background or border.
- Bar: `--border-width-thick` high, sitting on the hairline
  (`bottom: calc(-1 * --border-width-hairline)`), `--radius-xs` top corners.
- Badge in a tab: `--space-1` before it.
- Panel: `--space-4` above (consumer spacing inside it).
- Elevation none; layer none.
- Motion: the bar's colour fades over `--duration-fast` with
  `--ease-standard`; it never slides between tabs; panels swap instantly.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Label | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Label, hover and selected | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Bar, hover | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Bar, selected | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Track edge | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Disabled label | `--color-fg-disabled` | `--palette-stone-300` | `--palette-stone-700` |
| Action count | `--color-danger-solid` / `--color-fg-on-danger` | sorrel / `--palette-white` | light sorrel / `--palette-sorrel-950` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Tab label |
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Selected label |
| `--color-accent` | `--color-bg-surface` | 3:1 | Selected bar |
| `--color-border-strong` | `--color-bg-surface` | 3:1 | Hover bar |
| `--color-fg-on-danger` | `--color-danger-solid` | 4.5:1 | Action count |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring |

Selected is shown three ways: weight, colour and the bar, so it is never colour
alone (L2-069.5). Disabled labels are exempt from the text minimum (WCAG 1.4.3,
inactive components).

## Responsive behaviour

- The row never wraps. When the tabs are wider than the container the track
  scrolls sideways inside itself (scrollbar hidden), so the page never scrolls
  at 320 px.
- The selected tab is scrolled into view on first render and on every
  selection change (`scrollIntoView({ inline: 'nearest', block: 'nearest' })`).
- At 360 px "Profile", "Certificate" and "Activity" fit and "Status history"
  is reached by scrolling the row; that is the defined behaviour, not a defect.
  A row whose views must all be visible at once on a phone belongs in the
  segmented control (which wraps) or stacked sections (design system,
  Responsive).
- Sizes are the same at every breakpoint; every tab is at least 44 × 44 CSS px
  (short labels such as "All" are padded to 44 px wide, D-6) with
  `--space-1` plus their own padding between labels.
- At 200 % zoom at a 1280 px window, the row scrolls inside itself and every
  tab stays reachable by keyboard and swipe.

## Accessibility

### Role and pattern

Panel tabs follow the [APG Tabs pattern](https://www.w3.org/WAI/ARIA/apg/patterns/tabs/)
with automatic activation by default: `role="tablist"` with `aria-label`,
`role="tab"` with `aria-selected` and `aria-controls`, `role="tabpanel"` with
`aria-labelledby` and `tabindex="0"`. Link tabs are a `nav` of links with
`aria-current="page"` and no tab roles.

### Keyboard

| Key | Panel tabs | Link tabs |
|---|---|---|
| <kbd>Tab</kbd> | Into the tablist on the selected tab; the next Tab goes to the selected panel. | Moves through the links. |
| <kbd>→</kbd> / <kbd>←</kbd> | Next / previous enabled tab, wrapping at the ends; automatic mode also selects it. | No effect (scrolls the page). |
| <kbd>Home</kbd> / <kbd>End</kbd> | First / last enabled tab; automatic mode selects it. | No effect. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Selects the focused tab (manual mode; harmless in automatic). | Enter follows the link. |

### Focus

- Roving `tabindex`: the selected tab is `0`, the others `-1`; in manual mode
  the focused tab is `0` until focus leaves the list, then the selected tab is
  again.
- The ring uses the shared colour and width but is drawn inside the tab,
  `--focus-ring-width` + `--border-width-thick` in from its edge, because the
  track's `overflow-x: auto` clips anything drawn outside it; it stays clear of
  the bar (D-9).
- Selecting a tab never moves focus into the panel; the panel is the next Tab
  stop.

### Labelling

- The tablist (or link nav) names the object: "Pelau House record". Tab labels
  name the view.
- A total in the label is plain text ("All 7"); an action count is an
  `aria-hidden` badge whose following hidden text joins the tab name:
  "Reports, 1 open report" (D-10).

### Announcements

None beyond the roles: selecting a tab is announced by the screen reader as the
tab's selected state.

### Motion

The bar's colour fade uses `--duration-fast`, which
`prefers-reduced-motion: reduce` sets to 0.01 ms; nothing slides.

## Content and internationalisation

- One or two words per tab, nouns, sentence case: "Profile", "Certificate",
  "Status history". Don't repeat the object ("Caterer profile").
- Totals follow the label with a space and are written one way across a row:
  "All 7", "Profiles 2".
- Never an instruction ("Click to see reviews").
- Translatable inputs: `label`, tab labels, count labels. French labels run
  about 30 % longer ("Historique des statuts"); the row scrolls rather than
  wraps or truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (ids, `tabindex`, `hidden`
  per panel) are computed once per input change, not in the template.
- One `keydown` listener on the tablist and one click listener per tab; no
  timers or observers. `scrollIntoView` runs only when the selection changes.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Tabs.ts`
  renders the Pelau House record tabs ("Profile", "Certificate", "Activity",
  "Reports, 1 open report") and arrows through all four; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the track's height is fixed; the selected label's
  semibold weight is reserved so switching tabs never changes tab widths (D-7).
- Weight: no dependencies beyond the framework; no CDK required (roving
  tabindex is a few lines).

## Acceptance criteria

### Rendering

- **AC-1** Given `sh-tabs` labelled "Pelau House record" with tabs "Profile", "Certificate", "Activity" and "Status history", when it renders, then the DOM is a `div.tabs[role="tablist"]` named "Pelau House record" holding four `button.tab[role="tab"]`, each `aria-controls` pointing at a `div[role="tabpanel"]` whose `aria-labelledby` points back, and only the Profile panel is shown. (L2-068)
- **AC-2** Given `sh-link-tabs` labelled "Pelau House record pages" with "Profile" current, when it renders, then it is a `nav` named "Pelau House record pages" holding `div.tabs` with `a.tab` links, "Profile" has `aria-current="page"`, and no element has a tab role. (L2-068)
- **AC-3** Given a "Reports" tab with `count` 1 and `countLabel` "1 open report", when it renders, then it holds `span.badge.badge--count` reading "1" with `aria-hidden="true"`, followed by visually hidden text ", 1 open report", and its accessible name is "Reports, 1 open report". (L2-068)
- **AC-4** Given the component sources, when they are scanned for user-facing string literals, then none are found. (L2-064)

### States

- **AC-5** Given "Profile" selected in the light theme, when the tabs render, then "Profile" has `aria-selected="true"`, `tabindex="0"`, `--font-weight-semibold` and a `--color-accent` bar, while the others have `aria-selected="false"`, `tabindex="-1"` and no bar. (L2-069)
- **AC-6** Given a disabled "History" tab, when it renders, then it has the native `disabled` attribute, its label is `--color-fg-disabled` with no bar, and clicking it neither selects it nor emits `selectedChange`. (L2-067)
- **AC-7** Given a disabled link tab "Audit log", when it renders, then it is `<a class="tab" aria-disabled="true">` with no `href` and Tab does not reach it. (L2-067)

### Keyboard and focus

- **AC-8** Given focus on "Profile" in automatic mode, when the operator presses Right Arrow, then focus and selection move to "Certificate", its panel is shown, the Profile panel gets `hidden`, and `selectedChange` emits "certificate" once. (L2-067)
- **AC-9** Given focus on "Status history" (the last tab), when Right Arrow is pressed, then focus wraps to "Profile"; and given "History" is disabled, when the arrows pass it, then it is skipped. (L2-067)
- **AC-10** Given focus on "Activity", when Home and then End are pressed, then focus and selection move to the first and then the last enabled tab. (L2-067)
- **AC-11** Given manual activation and focus on "Profile", when Right Arrow is pressed, then focus moves to "Certificate" but the Profile panel stays shown; when Enter is then pressed, "Certificate" is selected and its panel shown. (L2-067)
- **AC-12** Given focus on the selected tab, when Tab is pressed, then focus moves to the selected panel (`tabindex="0"`), not to the next tab. (L2-067)
- **AC-13** Given any tab receives keyboard focus in the light or dark theme, when it is drawn, then the whole ring is visible — not clipped by the scrolling track on any side — with at least 3:1 contrast against the surface, and it does not overlap the selected bar. (L2-067)

### Screen readers

- **AC-14** Given the panel tabs and the link tabs at XS and XL, with a selected, a disabled and a counted tab, when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-15** Given the dark theme, when "Profile" is selected, then its bar resolves to `--palette-pepper-300` with at least 3:1 contrast against the surface, and the unselected labels keep at least 4.5:1. (L2-069)

### Responsive

- **AC-16** Given five tabs "All 7", "Profiles 2", "Name changes 1", "Certificates 1" and "Reports 2" at 320 px, when they render, then the row stays on one line, the track scrolls sideways inside itself, and the page does not scroll horizontally. (L2-064)
- **AC-17** Given "Reports" selected and scrolled out of view in that row, when the tabs render or the selection changes, then the selected tab is scrolled fully into view inside the track. (L2-064)
- **AC-18** Given a 360 px viewport, when each tab is measured, then it is at least 44 × 44 CSS px, including a short label such as "All". (L2-065)
- **AC-19** Given a 1280 px window at 200 % zoom, when the four record tabs render, then every tab is reachable by keyboard and its panel readable with no page-level horizontal scrolling. (L2-069)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when the selection changes, then the bar appears under the new tab without a visible fade and nothing slides. (L2-069)

### Performance

- **AC-21** Given the `Tabs` perf-test scenario, when the selection moves across all four tabs, then each change paints within 200 ms (Interaction to Next Paint), tab widths do not change, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/tabs/`; files
  `tabs.component.*` (selector `sh-tabs`, class `TabsComponent`),
  `tab-panel.component.*` (selector `sh-tab-panel`, class
  `TabPanelComponent`) and `link-tabs.component.*` (selector `sh-link-tabs`,
  class `LinkTabsComponent`); `TabItem` and `LinkTabItem` exported.
- Styles: the "Tabs" section of `components.css` and the `.tab` entries of the
  forced-colours rule move into the component, class names unscoped.
- Design-system catch-up for D-6: add `min-width: var(--target-comfortable);
  justify-content: center; flex: none;` to `.tab` (`flex: none` keeps tabs
  from shrinking below their label once `min-width` is set, so the row
  scrolls instead of overlapping).
- Design-system catch-up for D-9: add `.tab:focus-visible { outline-offset:
  calc(-1 * (var(--focus-ring-width) + var(--border-width-thick))); }`.
- Design-system catch-up for D-7: reserve the semibold width with a
  `::before` that holds the label (from a `data-label` attribute) at
  `--font-weight-semibold`, `height: 0`, `overflow: hidden`,
  `visibility: hidden`, stacked in a one-column grid with the visible label.
  The requirement is only that tab widths do not change.
- Composes [badge](badge.md) markup for action counts.
- No CDK primitive is required; a CDK `FocusKeyManager` may implement the
  roving `tabindex` if the chosen stack has one.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Should a component no screen uses be specified now?* Yes, completely. The design system ships `.tabs` with both forms and says when to use them; specifying the API now means the first screen that needs it does not invent one. Its criteria trace only to the cross-cutting requirements, because no feature L2 asks for tabs.
- **D-3** *Automatic or manual activation by default?* Automatic, as the design system specifies, because panels are already loaded. `activation="manual"` exists for panels that fetch on selection, which the design system names as the only exception.
- **D-4** *Are hidden panels rendered?* Yes, projected and `hidden`. `aria-controls` must point at an element that exists, and switching is then instant; a consumer whose panel is expensive renders a skeleton inside it until selected.
- **D-5** *Is the selected panel kept in the URL?* No. A view that needs its own URL is a different page, which is what link tabs are for; keeping both behaviours in one component would blur tabs and navigation, which the design system separates.
- **D-6** *Does a short tab meet 44 × 44?* It does with a 44 px minimum width. `.tab` is 44 px high but "All" with `--space-3` padding measures 43.4 px wide; L2-065.1 needs 44 × 44 at XS and SM, so `.tab` gets `min-width: --target-comfortable` with its label centred.
- **D-7** *Does selecting a tab change tab widths?* No. Semibold text is wider than regular ("Profile" grows from 73.4 to 74.2 px), so without reserved space every tab after the selected one would shift as the selection moves; the component reserves the semibold width.
- **D-8** *How are disabled tabs treated by the keyboard?* Skipped by the arrows and out of the tab order, as the design system's keyboard table says. A tab that will never apply is removed rather than disabled, and a tab with a count is never disabled.
- **D-9** *Where is the focus ring drawn?* Inside the tab. The track scrolls (`overflow-x: auto`), which clips the shared ring drawn `--focus-ring-offset` outside an element: the rendering shows only one side of it. An inset ring of the same colour and width, held clear of the bar, stays fully visible (WCAG 2.4.7, L2-067.2).
- **D-10** *How does a tab name its count?* Aligned with [badge](badge.md) D-3: the pill is `aria-hidden="true"` and visually hidden text follows it (", 1 open report", ", 2 open reports"), so the tab is named "Reports, 1 open report". No badge carries `aria-label`.
