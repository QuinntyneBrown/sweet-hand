# Map

| Field | Value |
|---|---|
| Selector | `sh-map` (`.map` frame, canvas, base map, controls, pins, clusters and the selected place's card), `sh-map-legend` (`.map-legend`) |
| Library path | `frontend/projects/components/src/lib/map/` |
| Status | planned |
| Traces to | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-112, L2-113, L2-115 |
| Design system | [`map.html`](../../design-system/components/map.html) |
| Source mocks | [`pages/admin-places-map/default`](../../mocks/pages/admin-places-map/default.html), [`pages/admin-places-map/selected`](../../mocks/pages/admin-places-map/selected.html), [`pages/admin-places-map/filtered`](../../mocks/pages/admin-places-map/filtered.html), [`pages/admin-places-map/loading`](../../mocks/pages/admin-places-map/loading.html), [`pages/admin-places-map/empty`](../../mocks/pages/admin-places-map/empty.html), [`pages/admin-place/default`](../../mocks/pages/admin-place/default.html), [`dialogs/place-editor/edit`](../../mocks/dialogs/place-editor/edit.html) |
| Rendering | [`map.html`](map.html) |

## Purpose and scope

The map shows the operators' directory of places on a map of Toronto and the
GTA (L2-115). Leah Mohammed and Tomas Reyes use it to see where the
businesses they track sit and which food trucks are out today. A small map
also shows one storefront's pin on the place page (L2-112) and in the place
editor, where the pin can be moved to correct a geocoded address (L2-113).
The directory is for operators only (L2-110), so the map never appears on
customer or caterer screens.

Use a [list](list.md) for anything people must read or act on in order. The
places map always pairs the map with the A-to-Z list. Use a
[description list](description-list.md) for a place's address.

Out of scope:

- Which places are on the map, today's food truck stops and the counts in the
  summary: `mapView` and the page (`view-places-map` design).
- Geocoding an address: the `Geocoder` port on the server (`manage-places`).
- The A-to-Z side list and the `.map-layout` grid: the page composes a
  [list](list.md) beside `sh-map`.
- The type filter, the "Food trucks out today" checkbox and the summary text:
  the page.
- The error state: the page replaces the map with an
  [empty state](empty-state.md) ("We couldn't load the map", "Try again",
  "Use the list").
- The card's content: the page fills the card slot with a
  [popover](popover.md) body (type, name, address, [status](status.md), open
  now, "View", "Edit").
- The tile provider: still to be chosen. `sh-map` takes a `MapTileSource`.
  The library ships the schematic stand-in drawn in the mocks.

## Usage

Inventory from a search of `docs/mocks` for `map`, `pin`, `pin-cluster`,
`map-card` and `map-legend`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/admin-places-map/default` | full, 15 places including 1 truck stop and 1 draft, 1 cluster of 3 downtown | legend: Restaurant, Takeout, Grocery store, Bakery, Food truck, "Draft (outline)" | default | canvas |
| `pages/admin-places-map/selected` | full, Yard Pot Jerk Centre selected | card: "Restaurant · Jamaican", "Yard Pot Jerk Centre", "1742 Eglinton Ave W · York · Little Jamaica", Listed, "Open now · until 11 p.m.", View, Edit, Close | selected, card open | canvas |
| `pages/admin-places-map/filtered` | full, 6 pins (grocery and bakery) | — | default | canvas |
| `pages/admin-places-map/loading` | full, `busy` | base map, no pins | loading | canvas |
| `pages/admin-places-map/empty` | full, no pins, overlay | [card](card.md) "No places on the map yet", "Add place" | empty | canvas |
| `pages/admin-place/default`, `closed` | small, one pin | — | default | canvas |
| `dialogs/place-editor/edit`, `busy`, `failed`, `invalid` | small, one movable pin | hint "Placed from the address. Drag the pin if the entrance is around the corner." (the page's help text) | default, disabled (busy) | dialog |

Every row is buildable with the API below.

## Anatomy

1. **Frame** — `div.map[role="region"][aria-label][tabindex="0"]`: hairline
   border, `--radius-lg`, `--color-bg-surface-sunken`, `overflow: auto`. The
   small map adds `.map--sm`.
2. **Controls** — `div.map__controls`: zoom in, zoom out and fit all as
   [icon buttons](icon-button.md). They are sticky in the top-right corner
   and omitted on the small map.
3. **Canvas** — `div.map__canvas`: a 1000 × 640 positioning box, at least
   40rem wide (`--sm`: 100 % of the frame).
4. **Base map** — the tile source's output. The schematic stand-in is an
   `svg[role="img"][aria-label]` with `.map__land`, `__water`,
   `__water-label`, `__road`, `__road--major`, `__boundary`, `__label`,
   `__label--sm` and `__road-label`.
5. **Pin** — `button.pin.pin--{type}[aria-pressed][aria-label]` positioned
   with `style="left: x%; top: y%"`, with `span.pin__head > span[aria-hidden]`
   holding the type letter. `.pin--draft` makes it an outline.
6. **Cluster** — `button.pin-cluster[aria-label]` showing the count.
7. **Card** — `div.map-card` positioned at the selected pin, holding a
   `div.popover[role="dialog"][aria-labelledby]` with the slotted content.
8. **Overlay** — an absolutely positioned centred layer over the canvas for
   the empty state's [card](card.md).
9. **Attribution** — `div.map__attribution`, the provider's credit when the
   tile source gives one.
10. **Legend** — `ul.map-legend[aria-label]`, rendered by `sh-map-legend`.
    Each `li` has a static `span.pin.pin--{type}` (not a button) and the type
    name.

Host: `sh-map` is `display: contents` and renders the frame. `sh-map-legend`
is `display: contents` and renders the list.

## API

### `sh-map` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The frame's name, "Places map". |
| `tiles` | `MapTileSource` | — | yes | Draws the base map and projects `lat`/`lng` to percent of the canvas. `SchematicGtaTiles`, the local stand-in, covers Oakville to Oshawa. It gives the base-map label "Map of Toronto and the GTA from Oakville to Oshawa along Lake Ontario". |
| `size` | `'full' \| 'sm'` | `'full'` | no | `sm` renders `.map--sm`, no controls and no clusters. |
| `pins` | `MapPin[]` | `[]` | no | `{ id: string; lat: number; lng: number; type: 'restaurant' \| 'takeout' \| 'grocery' \| 'bakery' \| 'truck'; letter: string; label: string; draft: boolean }`. Rendered in the given order, which the page sets A to Z (D-2). |
| `selected` | `string \| null` | `null` | no | The selected pin's id. That pin gets `aria-pressed="true"` and the card opens at it. |
| `zoom` | `number` | `0` | no | Zoom step: `0` fits all pins, and each step doubles the scale up to the tile source's maximum. Two-way: `zoomChange` reports changes. |
| `clusterLabel` | `(count: number, names: string[]) => string` | — | yes on `full` | Builds a cluster's name. The page passes "3 places downtown: Lakou Kreyòl, Pepperpot Lunch Counter, and 1 more. Zoom in to see them." |
| `zoomInLabel`, `zoomOutLabel`, `fitLabel` | `string` | — | yes on `full` | "Zoom in", "Zoom out", "Fit all places". |
| `closeCardLabel` | `string` | — | yes on `full` | The card's close button, "Close". |
| `movable` | `boolean` | `false` | no | `sm` only, with exactly one pin. The pin can be dragged and moved with the arrow keys (D-5). |
| `moveHint` | `string` | — | yes with `movable` | Appended to the pin's name as its description: "Use the arrow keys to move the pin." |
| `disabled` | `boolean` | `false` | no | With `movable`: the pin cannot move (the editor is saving). |
| `busy` | `boolean` | `false` | no | Draws the base map with no pins and sets `aria-busy="true"` on the frame. The page's status line says "Loading places on the map". |

### `sh-map-legend` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | "Map key". |
| `items` | `{ type: MapPin['type']; letter: string; label: string; draft?: boolean }[]` | — | yes | One entry each, in order: "Restaurant", "Takeout", "Grocery store", "Bakery", "Food truck", "Draft (outline)". |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `selectedChange` | `string \| null` | A pin is activated (its id), or the card closes by Escape, the close button or activating the selected pin again (`null`). |
| `zoomChange` | `number` | A control, <kbd>+</kbd>, <kbd>−</kbd>, a pinch or a cluster changes the zoom. |
| `pinMove` | `{ lat: number; lng: number }` | A movable pin is dropped, or after each arrow-key step. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=card]` | the card body: `p.map-card__type`, `h2.popover__title`, text, a [status](status.md), `div.popover__actions` | Rendered inside `.map-card .popover` only while a pin is selected. Its first heading must carry the id the popover is labelled by. The component adds the close button. |
| `[slot=overlay]` | an empty-state [card](card.md) | Centred over the canvas, for "No places on the map yet". |

## Variants and sizes

| Variant | Modifier | Use for |
|---|---|---|
| Restaurant pin | `.pin--restaurant` | Restaurants (letter R). |
| Takeout pin | `.pin--takeout` | Takeout counters (T). |
| Grocery pin | `.pin--grocery` | Grocery stores (G). |
| Bakery pin | `.pin--bakery` | Bakeries (B). |
| Food truck pin | `.pin--truck` | A food truck at today's stop (F), with a square head. |
| Draft | `.pin--draft` with a type | A place that is not yet listed: outline head, coloured letter. |
| Cluster | `.pin-cluster` | Pins whose heads would overlap at the current zoom. |

| Size | Modifier | Canvas | Controls | Clusters |
|---|---|---|---|---|
| full | — | at least 40rem wide, scrolls inside the frame | yes | yes |
| small | `.map--sm` | 100 % of the frame | no | no |

Pins are one size: a `--target-comfortable` (44 px) button with a 1.75rem
head, 1.25rem in the legend.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Head in the type colour, letter in `--color-fg-on-accent`, halo in `--color-bg-surface`, `--shadow-1`. | Button named by `label`, `aria-pressed="false"`. |
| Hover | `:hover` | Head scales to 120 % over `--duration-fast`. | — |
| Focus | `:focus-visible` | Shared focus ring around the head; the button outline is hidden. | Focus on the button. |
| Selected | `selected` = id | Head at 120 %, a ring in the pin's colour, `--shadow-2`, raised to `--z-dropdown`; card open. | `aria-pressed="true"`; the card is a labelled non-modal dialog. |
| Draft | `draft: true` | Outline head in `--color-bg-surface` with the type colour's ring and letter. | The name ends with ", draft". |
| Cluster | overlapping pins | Round `--color-action` count with a halo. | Button named by `clusterLabel`. |
| Card above / below | room above the pin in the frame | The card sits above the pin, or below it when it would clip (D-4). | — |
| Movable | `movable` | Same pin; cursor `grab`. | Name plus `moveHint` as the description. |
| Disabled (movable) | `disabled` | Pin at 100 % with no hover growth. | `aria-disabled="true"`. |
| Loading | `busy` | Base map only. | `aria-busy="true"` on the frame. |
| Empty | `[slot=overlay]` filled | Base map with a centred card. | The card's heading and button are reachable. |

## Markup

```html
<!-- rendered: full, Yard Pot Jerk Centre selected -->
<div class="map" role="region" aria-label="Places map" tabindex="0">
  <div class="map__controls">
    <button class="icon-btn" type="button" aria-label="Zoom in">…</button>
    <button class="icon-btn" type="button" aria-label="Zoom out">…</button>
    <button class="icon-btn" type="button" aria-label="Fit all places">…</button>
  </div>
  <div class="map__canvas">
    <svg viewBox="0 0 1000 640" role="img" aria-label="Map of Toronto and the GTA from Oakville to Oshawa along Lake Ontario">…</svg>
    <button class="pin pin--bakery" type="button" style="left: 44%; top: 33%;" aria-pressed="false"
      aria-label="Bridgetown Bakeshop, bakery, North York · Jane &amp; Finch"><span class="pin__head"><span aria-hidden="true">B</span></span></button>
    <button class="pin pin--bakery pin--draft" type="button" style="left: 35.2%; top: 46.9%;" aria-pressed="false"
      aria-label="Coconut Bread Corner, bakery, Etobicoke, draft"><span class="pin__head"><span aria-hidden="true">B</span></span></button>
    <button class="pin-cluster" type="button" style="left: 51%; top: 68.5%;"
      aria-label="3 places downtown: Lakou Kreyòl, Pepperpot Lunch Counter, and 1 more. Zoom in to see them.">3</button>
    <button class="pin pin--restaurant" type="button" style="left: 46.8%; top: 57.5%;" aria-pressed="true"
      aria-label="Yard Pot Jerk Centre, restaurant, York · Little Jamaica"><span class="pin__head"><span aria-hidden="true">R</span></span></button>
    <div class="map-card" style="left: 46.8%; top: 57.5%;">
      <div class="popover" role="dialog" aria-labelledby="mc-title">
        <p class="map-card__type">Restaurant · Jamaican</p>
        <h2 class="popover__title" id="mc-title">Yard Pot Jerk Centre</h2>
        …
        <div class="popover__actions">…View, Edit…<button class="icon-btn" type="button" aria-label="Close">…</button></div>
      </div>
    </div>
  </div>
</div>
<ul class="map-legend" aria-label="Map key">
  <li><span class="pin pin--restaurant"><span class="pin__head"><span aria-hidden="true">R</span></span></span>Restaurant</li>
  …
  <li><span class="pin pin--restaurant pin--draft"><span class="pin__head"><span aria-hidden="true">R</span></span></span>Draft (outline)</li>
</ul>
```

```html
<!-- rendered: small, movable (place editor) -->
<div class="map map--sm" role="region" aria-label="Pin for Yard Pot Jerk Centre" tabindex="-1">
  <div class="map__canvas">
    <svg viewBox="0 0 1000 640" role="img" aria-label="…">…</svg>
    <button class="pin pin--restaurant" type="button" style="left: 46.8%; top: 57.5%;" aria-pressed="false"
      aria-label="Yard Pot Jerk Centre, restaurant, York · Little Jamaica" aria-describedby="pin-hint"><span class="pin__head"><span aria-hidden="true">R</span></span></button>
    <span class="visually-hidden" id="pin-hint">Use the arrow keys to move the pin.</span>
  </div>
</div>
```

```html
<!-- consumer: places map page -->
<sh-map label="Places map" [tiles]="tiles" [pins]="view.pins()" [(selected)]="selectedId" [(zoom)]="zoom"
  [clusterLabel]="clusterName" zoomInLabel="Zoom in" zoomOutLabel="Zoom out" fitLabel="Fit all places" closeCardLabel="Close">
  <div slot="card">…</div>
</sh-map>
<sh-map-legend label="Map key" [items]="legendItems" />
```

## Design

- Frame: `--border-width-hairline` in `--color-border-default`,
  `--radius-lg`, `overscroll-behavior: contain`.
- Controls: `--space-3` inset and `--space-1` gap; each icon button on
  `--color-bg-surface-raised` with `--shadow-2`; `--z-raised`.
- Pin: `--target-comfortable` box. The head is 1.75rem with a `50% 50% 50% 0`
  radius rotated −45° (truck: `--radius-sm`, not rotated). The letter is
  `--text-label` at `--font-size-xs`. The halo is `--border-width-thick` in
  `--color-bg-surface`. Shadows are `--shadow-1` and selected `--shadow-2`.
  Layers are `--z-raised` and selected `--z-dropdown`. Hover and selected
  scale the head to 1.2 over `--duration-fast` with `--ease-standard`.
- Cluster: 2.75rem circle, `--border-width-thick` halo, `--color-action`
  fill, a `--space-1` ring of the action colour at reduced strength,
  `--text-label`.
- Card: at most 18rem, never wider than the frame minus `--space-6`;
  `--z-popover`; 3.5rem above the pin's point, or `--space-2` below its base
  (D-4).
- Legend: `--text-caption` in `--color-fg-muted`, gaps `--space-2` and
  `--space-5`.

Component tokens: none. The pin colour is the private custom property
`--pin`, set by each type modifier to a semantic token.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Land, frame | `--color-bg-surface-sunken` | from tokens | from tokens |
| Water | `--color-bg-subtle` | | |
| Minor road, frame border | `--color-border-default` | | |
| Major road, boundary | `--color-border-strong` | | |
| Area labels | `--color-fg-muted` | | |
| Small labels, attribution | `--color-fg-subtle` | | |
| Restaurant pin | `--color-accent` | | |
| Takeout pin, cluster | `--color-action` | | |
| Grocery pin | `--color-success-solid` | | |
| Bakery pin | `--color-warning-solid` | | |
| Food truck pin | `--color-info-solid` | | |
| Pin letter | `--color-fg-on-accent` | | |
| Cluster count | `--color-fg-on-action` | | |
| Halo, draft fill | `--color-bg-surface` | | |
| Focus ring | `--color-focus-ring` | | |

The rendering shows the resolved values live in both themes.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-accent` | `--color-accent` | 4.5:1 | Restaurant letter |
| `--color-fg-on-accent` | `--color-action` | 4.5:1 | Takeout letter |
| `--color-fg-on-accent` | `--color-success-solid` | 4.5:1 | Grocery letter |
| `--color-fg-on-accent` | `--color-warning-solid` | 4.5:1 | Bakery letter |
| `--color-fg-on-accent` | `--color-info-solid` | 4.5:1 | Food truck letter |
| `--color-warning-solid` | `--color-bg-surface-sunken` | 3:1 | Lightest pin against land |
| `--color-accent` | `--color-bg-surface` | 3:1 | Draft outline and letter |
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Cluster count |
| `--color-focus-ring` | `--color-bg-surface-sunken` | 3:1 | Focus ring on the map |

## Responsive behaviour

- Full map: the canvas keeps its 1000 × 640 ratio and is at least 40rem
  wide. Narrower frames scroll in both directions inside the border, and the
  controls stay in the top-right corner.
- Small map: the canvas fits the frame at every width and never scrolls.
- Pins and clusters stay 44 px at every width. The card is at most 18rem.
- At 320 px nothing scrolls horizontally outside the frame or clips; at 200 %
  zoom everything stays available; every target is at least 44 × 44 CSS px on
  touch devices.

## Accessibility

### Role and pattern

The frame is a named `region` with `tabindex="0"` (small map: `tabindex="-1"`,
not a tab stop). The base map is `role="img"` with a label naming the area.
Pins are native buttons on the
[button pattern](https://www.w3.org/WAI/ARIA/apg/patterns/button/) as toggle
buttons (`aria-pressed`); clusters are plain buttons. The card is a non-modal
`role="dialog"` labelled by its heading. The legend is a labelled list whose
pins are decorative spans. The page's A-to-Z list is the full text
equivalent of the pins.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Frame, then the controls, then pins and clusters in the order given (A to Z), then the open card's actions. |
| <kbd>←</kbd> <kbd>→</kbd> <kbd>↑</kbd> <kbd>↓</kbd> | With the frame focused: pan by 10 % of the frame. With a movable pin focused: move it by 1 % of the canvas; with <kbd>Shift</kbd>, 5 %. |
| <kbd>+</kbd>, <kbd>−</kbd> | With the frame focused: zoom in or out one step. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | On a pin: select it and open its card, or close it if already selected. On a cluster: zoom in until its pins separate, then focus the first of them. |
| <kbd>Escape</kbd> | Close the card and return focus to its pin. |

### Focus

Pins draw the shared focus ring around the head, not the 44 px box. Opening a
card leaves focus on the pin (the card is non-modal); <kbd>Tab</kbd> from the
selected pin enters the card next. After a cluster zoom, focus moves to the
first pin that was in it. After "Fit all places", focus stays on the button.

### Labelling

A pin's name is "{name}, {type}, {area}" with ", draft" for drafts: "Yard Pot
Jerk Centre, restaurant, York · Little Jamaica". The letter is
`aria-hidden`. Controls are named by their labels. The legend list is named
"Map key".

### Announcements

None from the component. Zooming and panning are silent. The page announces
loading ("Loading places on the map") and filter results through its summary.

### Motion

The head's scale transition uses `--duration-fast`. With
`prefers-reduced-motion: reduce` it is instant. Zoom and pan jump without
animation when reduced motion is set; otherwise they ease over
`--duration-base`.

## Content and internationalisation

- Pin names put the place name first, then the type in lower case and the
  area: "Coconut Bread Corner, bakery, Etobicoke, draft".
- Legend labels match the place editor's type names.
- Cluster names give the count, up to 2 place names and "Zoom in to see them".
- Translatable: `label`, control labels, `closeCardLabel`, `moveHint`, legend
  labels, the cluster template, the base map's label. Data: place names,
  areas, coordinates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` with
  signal inputs). Projection and clustering are computed once per `pins`,
  `zoom` or frame-size change, not in the template.
- Pins are absolutely positioned buttons; the base map is one SVG or the
  provider's tile layer. No map library is loaded by the stand-in.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/PlacesMap.ts`
  renders the 15 places from the cast with Yard Pot Jerk Centre selected;
  iterations in `e2e/perf-test/config/scenario-iterations.mjs` keep it at
  roughly 100–300 ms.
- Composite scenarios: `PlacesMap500` (500 pins at fit-all), `DarkTheme`.
- Layout stability: the frame reserves the canvas ratio before tiles load.

## Acceptance criteria

### Rendering

- **AC-1** Given the 15 places on the map from the cast, with 1 food truck out today and Coconut Bread Corner a draft, when the full map renders at the zoom that separates every pin, then it has 15 pin buttons in A-to-Z order, each with its type letter (R, T, G, B or F), and Coconut Bread Corner's pin has `.pin--draft`. (L2-115)
- **AC-2** Given Yard Pot Jerk Centre at its geocoded pin, when the map renders with `SchematicGtaTiles`, then its pin's point sits at the projected position of its latitude and longitude, to within 1 % of the canvas. (L2-115)
- **AC-3** Given `sh-map-legend` with the 6 cast items, when it renders, then the list is named "Map key" and shows Restaurant, Takeout, Grocery store, Bakery, Food truck and "Draft (outline)", each beside a static pin that is not focusable. (L2-115)
- **AC-4** Given the place page for Yard Pot Jerk Centre, when the small map renders, then it shows one pin, no controls and no clusters, and the canvas fits its frame without scrolling. (L2-112)

### States

- **AC-5** Given the full map, when the operator activates Yard Pot Jerk Centre's pin, then `selectedChange` emits its id, the pin has `aria-pressed="true"`, and the card opens at it with "Restaurant · Jamaican", "Yard Pot Jerk Centre", "Open now · until 11 p.m.", "View", "Edit" and "Close". (L2-115)
- **AC-6** Given a selected pin within 12rem of the frame's top edge, when the card opens, then it sits below the pin and is not clipped by the frame. (L2-115)
- **AC-7** Given the card is open, when the operator presses Escape or activates "Close", then `selectedChange` emits `null`, the card closes and focus is on Yard Pot Jerk Centre's pin. (L2-115)
- **AC-8** Given Lakou Kreyòl, Pepperpot Lunch Counter and Callaloo Cart's stop downtown would overlap at the fit-all zoom, when the map renders, then one cluster button shows "3" named "3 places downtown: Lakou Kreyòl, Pepperpot Lunch Counter, and 1 more. Zoom in to see them."; activating it emits `zoomChange` until the 3 pins separate, and focus moves to the first of them. (L2-115)
- **AC-9** Given the places are loading, when the map renders with `busy`, then the base map shows, no pin or cluster is rendered, and the frame has `aria-busy="true"`. (L2-115)
- **AC-10** Given no place has a pin, when the map renders with the overlay slot filled, then the card "No places on the map yet" with "Add place" is centred over the base map and reachable by Tab. (L2-115)
- **AC-11** Given the place editor's small map with `movable`, when the operator drags the pin, or focuses it and presses → three times, then `pinMove` emits the new latitude and longitude after the drop and after each key press. With `disabled`, the pin does not move. (L2-113)

### Keyboard and focus

- **AC-12** Given the full map, when a keyboard user tabs from the filter, then focus visits the frame, "Zoom in", "Zoom out", "Fit all places", then the pins and the cluster in A-to-Z order, starting with Bridgetown Bakeshop. (L2-067)
- **AC-13** Given focus on the frame, when the operator presses → and then +, then the map pans right by 10 % of the frame and zooms in one step, and `zoomChange` emits the new step. (L2-115)
- **AC-14** Given keyboard focus on any pin in either theme, when it is displayed, then a focus ring of at least 3:1 against the land surrounds the head, and the pin's target measures 44 × 44 CSS px. (L2-067)

### Screen readers

- **AC-15** Given the selected mock, when a screen reader reaches Yard Pot Jerk Centre's pin, then it announces "Yard Pot Jerk Centre, restaurant, York · Little Jamaica, toggle button, pressed"; the letter "R" is not read, and the base map is announced as the image "Map of Toronto and the GTA from Oakville to Oshawa along Lake Ontario". (L2-068)
- **AC-16** Given the map in default, selected, loading and empty states and the small movable map, when axe-core runs with WCAG 2.1 A and AA rules at XS and XL, then it reports 0 violations from the map or legend. (L2-066)

### Theming

- **AC-17** Given the light and the dark theme, when pins render, then each type letter has at least 4.5:1 against its head, every pin head and draft outline at least 3:1 against the land, and the cluster count at least 4.5:1. (L2-069)

### Responsive

- **AC-18** Given a 320 px viewport, when the places map renders, then the canvas scrolls inside the frame in both directions, the controls stay visible in the frame's top-right corner, and the page does not scroll horizontally. (L2-064)
- **AC-19** Given a 360 px touch viewport, when pins, clusters and controls are measured, then each is at least 44 × 44 CSS px. (L2-065)
- **AC-20** Given a 1280 px window at 200 % zoom, when the places map renders, then every pin, the card and the legend are usable and the page does not scroll horizontally. (L2-069)

### Motion

- **AC-21** Given `prefers-reduced-motion: reduce`, when a pin is hovered or selected and the map zooms, then the head changes size and the map moves without a visible transition. (L2-069)

### Performance

- **AC-22** Given 500 places with pins, when the places map renders at the fit-all zoom, then every place appears as a pin or inside a cluster, and the map responds to a pin selection within 100 ms. (L2-115)

## Implementation notes

- Folder `frontend/projects/components/src/lib/map/`; files
  `map.component.*`, `map-legend.component.*`, `map-tile-source.ts`,
  `schematic-gta-tiles.ts`, `map-pin.ts`; one type per file.
- Styles: the "Directory map" section of `components.css` moves into the
  component, class names unscoped.
- `SchematicGtaTiles` renders the mock's SVG and a linear projection for
  latitude 43.40–43.95 and longitude −79.80 to −78.80 onto the 1000 × 640
  canvas. A real provider implements the same `MapTileSource` interface,
  which has `render`, `project`, `maxZoom` and `attribution`.
- Clustering groups pins whose points are closer than 44 px at the current
  zoom, greedily in the given order.
- Composes [icon button](icon-button.md) and [popover](popover.md). No CDK
  overlay: the card is positioned inside the canvas so it scrolls with it.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, as every CRD does (README, shared decisions). The class names and attributes in *Markup* are the binding contract.
- **D-2** *Who decides pin order?* The page, which passes pins A to Z to match its list. The component keeps the given order for the DOM and the tab sequence. Visual stacking only raises the selected pin.
- **D-3** *Does the component know about the tile provider?* No. It takes a `MapTileSource` because the provider is still to be chosen (L2-115). The schematic stand-in from the mocks ships with the library so development and tests need no network.
- **D-4** *Where does the card go near the top edge?* Below the pin. The selected mock clips the card at the frame's top, and the design system records the flip.
- **D-5** *How is the editor's pin moved without a pointer?* With the arrow keys, 1 % per press and 5 % with Shift. WCAG 2.5.7 requires an alternative to dragging, and L2-113 asks that the pin can be moved by keyboard.
- **D-6** *Are drafts hidden from the map?* No. Drafts with a pin show as outline pins, as the legend and the default mock show. The page decides which places to pass.
