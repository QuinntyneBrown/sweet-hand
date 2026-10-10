# Empty state

| Field | Value |
|---|---|
| Selector | `sh-empty-state` |
| Library path | `frontend/projects/components/src/lib/empty-state/` |
| Status | planned |
| Traces to | L2-001, L2-022, L2-031, L2-043, L2-050, L2-054, L2-060, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-079, L2-085, L2-089 |
| Design system | [`empty-state.html`](../../design-system/components/empty-state.html) |
| Source mocks | [`pages/caterers/no-results`](../../mocks/pages/caterers/no-results.html), [`pages/caterers/error`](../../mocks/pages/caterers/error.html), [`pages/caterers/empty`](../../mocks/pages/caterers/empty.html), [`pages/inbox/empty`](../../mocks/pages/inbox/empty.html), [`pages/inbox/no-results`](../../mocks/pages/inbox/no-results.html), [`pages/inbox/error`](../../mocks/pages/inbox/error.html), [`pages/profile-menu/empty`](../../mocks/pages/profile-menu/empty.html), [`pages/profile-photos/empty`](../../mocks/pages/profile-photos/empty.html), [`pages/admin-audit/forbidden`](../../mocks/pages/admin-audit/forbidden.html), [`pages/admin-queue/empty`](../../mocks/pages/admin-queue/empty.html), [`pages/thread/error`](../../mocks/pages/thread/error.html), [`pages/thread/not-found`](../../mocks/pages/thread/not-found.html), [`dialogs/report/duplicate`](../../mocks/dialogs/report/duplicate.html), [`dialogs/enquiry/success`](../../mocks/dialogs/enquiry/success.html), [`dialogs/review/held`](../../mocks/dialogs/review/held.html) |
| Rendering | [`empty-state.html`](empty-state.html) |

## Purpose and scope

An empty state fills the space where a list, grid or panel would be when it
has nothing to show, and says in one line why and in one action what to do
next: Marcia's inbox before her first enquiry ("No enquiries yet" → "Browse
caterers"), Auntie Bev's Kitchen's menu before its first dish ("What do you
cook best?" → "Add your first dish"), a listing filtered to Haitian caterers
in Durham ("No caterers match these filters" → "Clear filters"), a list that
failed to load ("We couldn't load caterers" → "Try again" and a reference),
or an operator section Tomas Reyes's role cannot see. The page around it
(header, title, filters, side navigation) stays. Inside a dialog that cannot
do its job or has just finished ("You've already reported this", "Enquiry
sent to Pelau House") the compact empty state is the dialog's body.

Use something else when the whole response is an error or a system page
(404, 410, 500, maintenance, offline, rate limit): [error page](error-page.md).
While content is still loading: [skeleton](skeleton.md); never show "No
caterers" while the request is in flight. When part of a page failed but the
rest works (one chart on the metrics page): an inline [alert](alert.md). A
caterer's whole first-run dashboard is the welcome text, setup
[progress](progress.md) meter and [checklist](checklist.md); the empty state
appears inside each section instead.

Out of scope:

- Deciding *which* empty state to show (first run, no results, error,
  forbidden): the page decides from its data and request status.
- The result count and its polite live region ("0 caterers"): the listing
  owns it (L2-067.5); the no-results empty state is not itself live.
- Retrying, reloading when the connection returns and replacing the empty
  state with skeletons and content: the page does that; the empty state only
  hosts the "Try again" [button](button.md), which shows `busy`.
- The actions themselves: they are [button](button.md), `sh-button-anchor` and
  the [file upload](file-upload.md) label, with their own states and outputs.
- The dialog's own heading, close button and "Done" footer: [dialog](dialog.md).
- The round photos: [photo](photo.md) renders each `.photo`; the empty state
  only lays out the `.photo-row`.

## Usage

Inventory from a block extraction of every `class="empty` in `docs/mocks/`
(51 instances on 47 screens) plus `usage_inventory.py docs/mocks empty`.
Rows that share a configuration are grouped.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterers/no-results` | full, neutral, icon (search), heading level 2 | "No caterers match these filters", "No Haitian caterers list Durham yet. Try a nearby area, or clear the filters.", anchor primary "Clear filters" | default, action hover / focus | canvas, results column beside filters |
| `pages/admin-audit/no-results`, `admin-caterers/no-results`, `admin-reviews/no-results` | full, neutral, icon, level 2 | "No entries match", "No suspended caterers match “Pelau”", "No held reviews for Lambie Lane"; anchor primary or secondary "Clear filters" / "Clear search" | default | canvas |
| `pages/inbox/no-results`, `dashboard-enquiries/no-results` | compact, neutral, icon or none, level 2 | "No open enquiries", "No closed enquiries"; anchor secondary "Show all enquiries" | default | canvas, list column |
| `pages/inbox/empty`, `caterers/empty`, `dashboard-enquiries/empty`, `dashboard-reviews/empty` | full, neutral, photo row of three, level 2 | "No enquiries yet", "The first caterers are on their way", "Your first review is on its way"; anchor primary "Browse caterers", "Cater with Sweet Hand", "View your page", "Go to enquiries" | default | canvas |
| `pages/profile-menu/empty` | full, neutral, icon (plate), level 2 | "What do you cook best?"; primary lg button with plus icon, `haspopup="dialog"`, "Add your first dish" | default, action focus | canvas, `.work-main` |
| `pages/profile-photos/empty` | full, neutral, photo row of three placeholders, level 2 | "Show people your food"; [file upload](file-upload.md) label `btn btn--primary btn--lg` "Add photos"; note "JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on the shorter side" | default | canvas |
| `pages/admin-queue/empty`, `admin-audit/empty`, `admin-breaches/empty`, `admin-caterers/empty`, `admin-changes/empty`, `admin-metrics/empty`, `admin-reviews/empty` | full, neutral, icon, level 2 | "All caught up", "No entries yet", "No breaches recorded", "No activity in this range"; one primary or secondary ("Record a breach" opens a dialog) | default | canvas |
| `pages/admin-audit/forbidden`, `admin-operators/forbidden` | full, neutral, icon (lock), level 1 or 2 | "Only Admins can see the audit log", "Only Admins can manage operators"; anchor primary "Back to the queue" | default | canvas |
| Every list or record that failed to load: `pages/caterers`, `occasions`, `inbox`, `account`, `dashboard`, `dashboard-reviews`, `profile-*` (5), `admin-*` (11) `/error` | full, error, icon (alert), level 2, `role="alert"` | "We couldn't load caterers", "…your enquiries", "…your menu"; primary "Try again" (button or anchor, retry icon) + secondary or ghost anchor ("Browse occasions", "Back to the queue"); reference "7f3c-91ad" | default, action busy (retry in flight) | canvas |
| `pages/thread/error`, `admin-caterer/error`, `admin-report/error`, `caterer/error` | full, error, icon or photo row with a placeholder, level 1, title id (`thread-title`) | "We couldn't load this enquiry", "We couldn't load Pelau House"; "Try again" + "Back to inbox"; reference | default, action busy | canvas, thread column |
| `pages/thread/not-found` | full, neutral, photo row, level 1, title id | "We can't find that enquiry", "The link may be old, or it belongs to a different account."; anchor primary "Back to inbox" | default | thread column |
| Offline list region (design system; no mock outside the full [error page](error-page.md)) | compact, neutral, icon (wifi off), level 2 | "You're offline", "Your enquiries will show here once you're back online. Nothing is lost."; secondary "Try again" | default, action busy | canvas |
| `dialogs/report/duplicate`, `dialogs/review/held` | compact, info, icon (info), title as `<p>`, `role="status"` | "You've already reported this", "Your review will appear after a quick check" | default | dialog surface |
| `dialogs/enquiry/success`, `dialogs/report/success`, `dialogs/review/success` | compact, success, icon (check), title as `<p>`, `role="status"` | "Enquiry sent to Pelau House", "Thanks — our team will look into this", "Thanks, Jean-Robert. Your review is live." | default | dialog surface |
| `dialogs/enquiry/wrong-account` | compact, neutral, icon (lock), title as `<p>` | "Sign in with a customer account to send enquiries" | default | dialog surface |
| `notifications/profile-banner/success` | compact, neutral, no image, no actions, level 2 | "No enquiries yet", "Customers can find you now. New enquiries show up here and in your email." | default | canvas below the banner |

Not product markup, and not built by this component:

- The inline `style="background: var(--color-success-bg)…"` and
  `style="background: var(--color-info-bg)…"` on dialog icon circles are the
  mocks standing in for `tone="success"` and `tone="info"` (D-3).
- `style="padding-block: var(--space-16)"` on `pages/caterer/error` is a
  one-off; the full size is used unchanged (D-8).
- `.system-page__code` and a reference inside the sentence ("…Reference
  7F3K-92QD.") are drift; the reference renders as `.text-caption` (D-6).
- `pages/thread/not-found` borrows `.empty__title` inside `.system-page`; the
  product renders a full `sh-empty-state` there (design system, Sources).

## Anatomy

1. **Container** — `.empty` (`div`): a centred column, `--space-3` gap,
   full padding `--space-12` / `--space-6`; `.empty--compact` reduces it to
   `--space-8` / `--space-4`. Tone modifiers `.empty--error`, `.empty--info`,
   `.empty--success` tint the icon circle only.
2. **Image (optional, one of)**
   - **Icon circle** — `.empty__icon` (`div`, `aria-hidden="true"`): a
     4.5rem `--radius-full` disc in `--color-bg-subtle` holding one
     `svg.icon` at `--icon-size-xl`.
   - **Photo row** — `.photo-row` (`div`, `aria-hidden="true"`): three round
     [photos](photo.md), the middle one larger (72 / 104 / 72 px), each
     `alt=""`; a photo may be `.photo--placeholder`.
3. **Title** — `.empty__title`: a heading at the level the page outline
   needs (`h1`–`h4`) or a `<p>` inside a dialog; always the `--text-h3` look.
4. **Text (optional)** — `.empty__text` (`p`): one or two sentences in
   `--color-fg-muted`, at most 36ch wide.
5. **Actions (optional)** — `.empty__actions` (`div`): a centred, wrapping
   row of one primary and at most one secondary [button](button.md).
6. **Note (optional)** — a `p.field__help` after the actions, referenced by
   the action it explains (the photo upload rules).
7. **Reference (optional)** — `p.text-caption` with the words from
   `referenceLabel` and the value in `<code>`: "Reference `7f3c-91ad`".

Host: `sh-empty-state` is layout-transparent (`display: contents`); every
class and attribute in *Markup* goes on the inner `div.empty` in the light DOM,
so a parent grid or flex layout positions the `.empty` box itself and
`aria-labelledby` can reference the title's id (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | The title text, rendered in `.empty__title`. Never empty. |
| `headingLevel` | `1 \| 2 \| 3 \| 4 \| null` | `2` | no | `1`–`4` render `h1`–`h4`; `null` renders `<p class="empty__title">` (inside a dialog whose own title names it). The look is `--text-h3` at every level. |
| `headingId` | `string \| null` | `null` | no | Rendered as the title's `id`, so a region can use `aria-labelledby` ("thread-title"). |
| `text` | `string \| null` | `null` | no | Rendered as `p.empty__text`; absent when `null`. Plain text; the component escapes it. |
| `size` | `'full' \| 'compact'` | `'full'` | no | `compact` adds `.empty--compact`. Compact is for tab panels, filtered lists, cards and dialogs, never to save space on a whole page. |
| `tone` | `'neutral' \| 'error' \| 'info' \| 'success'` | `'neutral'` | no | Adds `.empty--error`, `.empty--info` or `.empty--success`; neutral adds none. Tints the icon circle only. Offline, forbidden and no-results are neutral. |
| `live` | `'auto' \| 'alert' \| 'status' \| 'off'` | `'auto'` | no | `auto` renders `role="alert"` for `tone="error"`, `role="status"` for `info` and `success`, and no role for `neutral`. `off` renders no role (a no-results state, announced by the count). |
| `reference` | `string \| null` | `null` | no | Renders `<p class="text-caption">{referenceLabel} <code>{reference}</code></p>` last. Rendered verbatim (the correlation ID from the failed response). |
| `referenceLabel` | `string \| null` | `null` | yes when `reference` | The translated word before the value ("Reference"). |

- No input renders `"null"` or an empty wrapper: an absent text, image,
  actions, note or reference leaves no element behind.

### Outputs

None. The empty state is not interactive; its actions emit their own events
(`activated` on [button](button.md)).

### Methods

| Method | Rule |
|---|---|
| `focusPrimaryAction(options?: FocusOptions)` | Focuses the first focusable element in the actions slot. The page calls it when the person removed the last item, so focus does not fall to the body (design system, Focus; L2-067). Does nothing when there are no actions. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=icon]` | One `svg.icon` | Wrapped in `div.empty__icon` with `aria-hidden="true"`; the svg also gets `aria-hidden="true"`. |
| `[slot=photos]` | Exactly three [photo](photo.md) elements, decorative (`alt=""`) | Wrapped in `div.photo-row` with `aria-hidden="true"`. When both image slots are filled, only the photos render (D-4). |
| `[slot=actions]` | One or two `sh-button` / `sh-button-anchor`, or a [file upload](file-upload.md) trigger | Wrapped in `div.empty__actions`. Primary first. At most one primary, and only when the screen has no other. |
| `[slot=note]` | One `p.field__help` with an `id` | Rendered after the actions, before the reference. The action points at it with `describedBy`. |

- Each slot is declared once, whatever the tone or size.
- Translation: `heading`, `text`, `referenceLabel` and every action label come
  from the resource files through the consumer (L2-064). The component holds
  no user-facing strings.

## Variants and sizes

| Variant (tone) | Modifier | Use for |
|---|---|---|
| Neutral | — | First run ("What do you cook best?"), no results ("No caterers match these filters"), forbidden ("Only Admins can see the audit log"), offline ("You're offline"), nothing to do ("All caught up"). |
| Error | `.empty--error` | A list or record failed to load: "We couldn't load caterers". Pairs with "Try again" and a reference. |
| Info | `.empty--info` | A dialog that cannot proceed or is waiting on someone else: "You've already reported this", "Your review will appear after a quick check". |
| Success | `.empty--success` | A dialog's finished state: "Enquiry sent to Pelau House" (D-3). |

| Image | Use for |
|---|---|
| Photo row | Public and customer screens, and caterer screens that show the caterer's own food (Pelau House's empty enquiries) (D-5). |
| Icon | Caterer and operator tools, errors, no results, forbidden, dialogs. |
| None | A compact state under a banner or in a list column where an image would repeat the page ("No open enquiries"). |

| Size | Modifier | Padding (block / inline) |
|---|---|---|
| Full | — | `--space-12` / `--space-6` |
| Compact | `.empty--compact` | `--space-8` / `--space-4` |

Width is the container's; the text block is capped at 36ch and the icon
circle is always 4.5rem.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Image, title, text, actions centred | Title is a heading at `headingLevel` |
| Error | `tone="error"` | Icon circle `--color-danger-bg`, glyph `--color-danger-icon` | `role="alert"`: heading and text announced once when it appears |
| Info | `tone="info"` | Icon circle `--color-info-bg`, glyph `--color-info-icon` | `role="status"`: announced politely |
| Success | `tone="success"` | Icon circle `--color-success-bg`, glyph `--color-success-icon` | `role="status"`: announced politely |
| Action hover / focus / active | the action's own states | See [button](button.md) | See [button](button.md) |
| Retrying | the consumer sets `busy` on "Try again" | The button shows its spinner; the empty state does not change | Button `aria-busy="true"`; focus stays on it |
| Retry failed | consumer re-renders with a new `reference` | Same error, new reference | Not re-announced unless the region is re-inserted (D-7) |
| Retry succeeded / first run ends | consumer removes the component | Replaced by [skeleton](skeleton.md), then content | Focus moves to the new item (page) |
| Offline | neutral tone, offline copy | Neutral icon circle with the wifi-off glyph, secondary "Try again" | No role; it is not an error |
| No image | both image slots empty | No `.empty__icon` / `.photo-row` element | — |
| No actions | actions slot empty | No `.empty__actions` element | — |
| Long text | text longer than 36ch per line | Wraps within 36ch; never truncates | — |
| On dialog surface | inside `.dialog` | Text keeps `--color-fg-muted` on `--color-bg-surface-raised` | — |

The empty state itself has no hover, focus, disabled or busy state; it is not
interactive.

## Markup

```html
<!-- rendered: full, neutral, icon, no results (listing) -->
<div class="empty">
  <div class="empty__icon" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></div>
  <h2 class="empty__title">No caterers match these filters</h2>
  <p class="empty__text">No Haitian caterers list Durham yet. Try a nearby area, or clear the filters.</p>
  <div class="empty__actions"><a class="btn btn--primary" href="/caterers">Clear filters</a></div>
</div>
```

```html
<!-- rendered: full, neutral, photo row, first run (Marcia's inbox) -->
<div class="empty">
  <div class="photo-row" aria-hidden="true">
    <span class="photo"><img src="cou-cou.jpg" alt="" width="72" height="72"></span>
    <span class="photo"><img src="pelau-house.jpg" alt="" width="104" height="104"></span>
    <span class="photo"><img src="black-cake-co.jpg" alt="" width="72" height="72"></span>
  </div>
  <h2 class="empty__title">No enquiries yet</h2>
  <p class="empty__text">When you send an enquiry to a caterer, the conversation lives here.</p>
  <div class="empty__actions"><a class="btn btn--primary" href="/caterers">Browse caterers</a></div>
</div>
```

```html
<!-- rendered: full, error, two actions, reference -->
<div class="empty empty--error" role="alert">
  <div class="empty__icon" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></div>
  <h2 class="empty__title">We couldn’t load caterers</h2>
  <p class="empty__text">Something went wrong on our side. Your filters are kept.</p>
  <div class="empty__actions">
    <button class="btn btn--primary" type="button"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Try again</button>
    <a class="btn" href="/occasions">Browse occasions</a>
  </div>
  <p class="text-caption">Reference <code>7f3k-92qd</code></p>
</div>
```

```html
<!-- rendered: first run with a file picker and its note -->
<div class="empty">
  <div class="photo-row" aria-hidden="true">
    <span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></span>
    <span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></span>
    <span class="photo photo--placeholder"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></span>
  </div>
  <h2 class="empty__title">Show people your food</h2>
  <p class="empty__text">Add at least 3 photos of dishes you cook. The first one becomes the round photo on your listing card.</p>
  <div class="empty__actions"><input class="file-input visually-hidden" id="photo-upload" type="file" accept="image/jpeg,image/png,image/webp,image/heic" multiple aria-describedby="upload-help"><label class="btn btn--primary btn--lg" for="photo-upload"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Add photos</label></div>
  <p class="field__help" id="upload-help">JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on the shorter side</p>
</div>
```

```html
<!-- rendered: compact, info, title as a paragraph, inside the report dialog -->
<div class="empty empty--compact empty--info" role="status">
  <div class="empty__icon" aria-hidden="true"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></div>
  <p class="empty__title">You’ve already reported this</p>
  <p class="empty__text">Your report from Thu 8 Oct is still with our team. We’ll email you when it’s been reviewed.</p>
</div>
```

The success tone differs only by `.empty--success` and the check glyph;
forbidden and offline are the neutral markup with the lock or wifi-off glyph.

```html
<!-- rendered: compact, no image, no actions -->
<div class="empty empty--compact">
  <h2 class="empty__title">No enquiries yet</h2>
  <p class="empty__text">Customers can find you now. New enquiries show up here and in your email.</p>
</div>
```

Consumer templates (binding syntax illustrative; strings come from the
resource files):

```html
<!-- consumer: listing, no results -->
<sh-empty-state [heading]="t('caterers.noResults.title')" [text]="noResultsText()">
  <svg slot="icon" class="icon" viewBox="0 0 24 24">…</svg>
  <sh-button-anchor slot="actions" variant="primary" href="/caterers">{{ t('caterers.clearFilters') }}</sh-button-anchor>
</sh-empty-state>

<!-- consumer: list failed to load -->
<sh-empty-state tone="error" [heading]="t('inbox.error.title')" [text]="t('inbox.error.text')" [reference]="correlationId()" [referenceLabel]="t('common.reference')">
  <svg slot="icon" class="icon" viewBox="0 0 24 24">…</svg>
  <sh-button slot="actions" variant="primary" [busy]="retrying()" (activated)="retry()">…{{ t('common.tryAgain') }}</sh-button>
  <sh-button-anchor slot="actions" href="/caterers">{{ t('inbox.browseCaterers') }}</sh-button-anchor>
</sh-empty-state>

<!-- consumer: dialog body after reporting twice -->
<sh-empty-state size="compact" tone="info" [headingLevel]="null" [heading]="t('report.duplicate.title')" [text]="duplicateText()">
  <svg slot="icon" class="icon" viewBox="0 0 24 24">…</svg>
</sh-empty-state>
```

The e2e page objects locate the state by `.empty`, its tone modifier, the
`role`, and the title by `.empty__title`; those are the contract. The glyph
paths are free to change.

## Design

- Layout: flex column, `align-items: center`, `text-align: center`, gap
  `--space-3`; padding `--space-12` / `--space-6` (full) or `--space-8` /
  `--space-4` (compact).
- Icon circle 4.5rem square, `--radius-full`, `--space-2` below it; glyph
  `--icon-size-xl`, stroked with `--icon-stroke`.
- Photo row: three photos 4.5rem / 6.5rem / 4.5rem with `--space-3` gaps
  (272 px in all), from `components.css` `.photo-row`.
- Title `--text-h3` in `--color-fg-default`; text `--text-body` in
  `--color-fg-muted`, `max-width: 36ch`.
- Actions: flex row, gap `--space-3`, `--space-2` above, `flex-wrap: wrap`,
  centred.
- Reference: `.text-caption` (`--text-caption`, `--color-fg-muted`), value in
  `<code>` (`--text-code`).
- Elevation none; no border, background or shadow of its own; layer none.
- Motion none: it appears without animation (design system, Motion).

The component declares no component tokens; the tone modifiers set the icon
circle's `background` and `color` from semantic tokens directly.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Icon circle (neutral) | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Icon glyph (neutral), title | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Text, reference | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Error circle / glyph | `--color-danger-bg` / `--color-danger-icon` | `--palette-sorrel-50` / `--palette-sorrel-500` | `--palette-sorrel-950` / `--palette-sorrel-300` |
| Info circle / glyph | `--color-info-bg` / `--color-info-icon` | `--palette-stone-50` / `--palette-stone-700` | `--palette-stone-900` / `--palette-stone-350` |
| Success circle / glyph | `--color-success-bg` / `--color-success-icon` | `--palette-callaloo-50` / `--palette-callaloo-500` | `--palette-callaloo-950` / `--palette-callaloo-300` |

Contrast pairs (from `tokens/contrast-pairs.json` and the design-system page;
L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-subtle` | 3:1 | Neutral glyph on its circle |
| `--color-danger-icon` | `--color-danger-bg` | 3:1 | Error glyph |
| `--color-info-icon` | `--color-info-bg` | 3:1 | Info glyph |
| `--color-success-icon` | `--color-success-bg` | 3:1 | Success glyph |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Title on the page |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Text on the page |
| `--color-fg-muted` | `--color-bg-surface` | 4.5:1 | Text on a card |
| `--color-fg-muted` | `--color-bg-surface-raised` | 4.5:1 | Text in a dialog |

The photos keep their colours in dark (never filtered). The tone is never the
only signal: the title says what happened ("We couldn't load…", "Enquiry
sent…") and the glyph differs per tone.

Forced colours: the circle background drops out and the glyph takes
`CanvasText`; the title and text stay readable. No component rule is needed.

## Responsive behaviour

- The layout does not change at any breakpoint. The column stays centred,
  the icon circle stays 4.5rem, the full padding is the same everywhere.
- Below 36rem the 272 px photo row still fits a 320 px screen inside the
  16 px margins. When two actions do not fit side by side they wrap onto two
  centred lines, primary first.
- From 48rem the listing places the empty state in the results column beside
  the filters, and the dashboard in `.work-main`; from 62rem the inbox's sits
  in the list column. Those are the pages' grids; the component fills
  whatever box it is given.
- Text and titles wrap, never truncate; at 320 px nothing scrolls
  horizontally; at 200 % zoom at 1280 px everything stays readable; actions
  are at least 44 px high with `--space-3` (12 px) between them (L2-065).

## Accessibility

### Role and pattern

Plain content: a heading, a paragraph and links or buttons, no widget role.
An error empty state that replaces content after a failed request is
`role="alert"` ([APG Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/));
info and success states in dialogs are `role="status"`. A no-results state is
not live; the listing's result count ("0 caterers") announces the change.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Reaches the actions in order: primary, then secondary. Nothing else in the empty state is focusable. |
| <kbd>Enter</kbd>, <kbd>Space</kbd> | Activate the actions as [button](button.md) defines. |

### Focus

- Focus is never moved to an empty state that appears on page load.
- After the person removes the last item (the last dish of a draft menu), the
  page calls `focusPrimaryAction()`, so focus lands on "Add your first dish"
  rather than on a deleted row.
- After a filter change empties the list, focus stays on the filter used.
- During a retry focus stays on "Try again"; when the retry fails and the error
  re-renders, the component keeps the same DOM node, so focus is not lost.

### Labelling

- The title is a real heading at `headingLevel`: `h2` in a page section, `h1`
  when the empty state is the page's main content (Tomas Reyes's audit-log
  forbidden state, a thread that failed to load), `<p>` inside a dialog whose
  title already names it.
- The icon circle and the photo row are `aria-hidden="true"`; every photo has
  `alt=""`.
- The reference is in `<code>`, so it is read character by character.

### Announcements

`role="alert"` (error) and `role="status"` (info, success) make the heading,
text and reference announce once when the component is inserted. Neutral
states announce nothing.

### Motion

None. The empty state appears without animation, and the photos in its row do
not zoom on hover. Nothing changes under `prefers-reduced-motion`.

## Content and internationalisation

The formula from the design system:

| Kind | Title | Text | Action |
|---|---|---|---|
| First run | What will be here, as an invitation: "What do you cook best?", "No enquiries yet" | What to add and the minimum: "Add at least 3 dishes…" | Create the first one: "Add your first dish", "Browse caterers" |
| No results | "No caterers match these filters" | Name the combination and suggest a change: "No Haitian caterers list Durham yet…" | "Clear filters", "Show all enquiries" |
| Error | "We couldn't load [things]" | Whose fault, what is safe: "Your filters are kept." | "Try again" + a way to keep going; reference |
| Offline | "You're offline" | What still works; nothing is lost | "Try again" (secondary) |
| Forbidden | "Only [role] can see [thing]" | Who they are signed in as and whom to ask, by name | "Back to the queue" |
| Nothing to do | "All caught up" | What would appear here and in what order | Optional secondary |

- Never "No data", "Nothing here" or "0 results"; name the things. Use the
  caterer's and customer's words: enquiries, dishes, caterers.
- No exclamation marks, no jokes about failure. Canadian English with curly
  apostrophes ("couldn’t").
- Dates in text per L2 formatting: "Thu 8 Oct", "between 3 Oct and 10 Oct
  2026"; the consumer formats them.
- References are lower-case and hyphenated, in `<code>`, in the caption line,
  never inside the sentence.
- Translatable inputs: `heading`, `text`, `referenceLabel`, action labels.
  Data inside them: caterer, cuisine and area names, people's names, dates,
  counts, the reference value.
- French runs about 30 % longer ("Aucun traiteur ne correspond à ces
  filtres"); the title and text wrap within the column; nothing truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the class list, the
  effective `role`, the heading tag) are computed once per input change, not
  in the template.
- No timers, observers or listeners.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/EmptyState.ts`
  renders Marcia's empty inbox (three photos, "No enquiries yet", "Browse
  caterers") and the listing's error state ("We couldn't load caterers" with
  two actions and reference `7f3k-92qd`), toggling between them; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CatererListing`, `Inbox`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: photos carry `width` and `height`; the empty state
  replaces skeletons in the same container, and the page reserves that
  container, so the swap adds no layout shift outside it.
- Weight: no dependencies beyond the framework; composes [photo](photo.md) and
  is composed with [button](button.md) through the slot. No icon library.

## Acceptance criteria

### Rendering

- **AC-1** Given the listing filtered to "Haitian" and "Durham" with no published caterers matching, when the page renders, then an `sh-empty-state` shows `.empty` with the heading "No caterers match these filters", the text "No Haitian caterers list Durham yet. Try a nearby area, or clear the filters." and a "Clear filters" link, and the response status is 200. (L2-001)
- **AC-2** Given `headingLevel` 2, 1 and `null`, when the empty state renders each, then the title is an `h2`, an `h1` and a `p` respectively, each with class `empty__title` and the same computed font as `--text-h3`, and axe-core reports 0 violations on the listing, the audit-log forbidden page and the report dialog. (L2-066)
- **AC-3** Given Marcia's empty inbox with three photos in the photos slot, when it renders, then `.photo-row` has `aria-hidden="true"`, each `img` has `alt=""`, and the accessibility tree contains only the heading "No enquiries yet", the text and the link "Browse caterers". (L2-068)
- **AC-4** Given an icon in the icon slot, when the empty state renders, then the icon is wrapped in `div.empty__icon` with `aria-hidden="true"` and the svg also has `aria-hidden="true"`. (L2-068)
- **AC-5** Given Auntie Bev's Kitchen's menu with no dishes, when the editor renders, then the empty state shows "What do you cook best?" as an `h2` and one large primary button "Add your first dish" with `aria-haspopup="dialog"`, which opens the dish dialog. (L2-043)
- **AC-6** Given Pelau House's caterer dashboard right after publishing, when the enquiries panel renders compact with no image and no actions, then the DOM contains `.empty.empty--compact`, the heading "No enquiries yet" and the text, and no `.empty__icon`, `.photo-row` or `.empty__actions` element. (L2-031)
- **AC-7** Given Marcia's inbox filtered to "Open" with none open, when the compact empty state renders, then it shows "No open enquiries" and a secondary link "Show all enquiries" whose activation returns the unfiltered inbox. (L2-031)
- **AC-8** Given the photo manager for a caterer with no photos, when the empty state renders with the file-upload trigger in the actions and the note in the note slot, then the "Add photos" label is the file input's visible label and the input's `aria-describedby` names the note "JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on the shorter side". (L2-068)

### Variants

- **AC-9** Given the caterer listing request fails, when the error empty state renders, then it is `.empty.empty--error` with `role="alert"`, an icon circle filled with `--color-danger-bg`, the heading "We couldn’t load caterers", "Try again" first and "Browse occasions" second, and the caption "Reference 7f3k-92qd" with the value in `<code>`. (L2-089)
- **AC-10** Given a screen reader on Marcia's inbox, when the list request fails and the error empty state is inserted, then "We couldn’t load your enquiries. Your messages are safe. Check your connection and try again." is announced once without focus moving. (L2-068)
- **AC-11** Given Marcia has already reported Pelau House and the report is open, when she reports it again, then the report dialog body is `.empty.empty--compact.empty--info` with `role="status"`, its title is a `p` reading "You’ve already reported this", and the info glyph meets 3:1 on `--color-info-bg`. (L2-054)
- **AC-12** Given Marcia sends a valid enquiry to Pelau House for Sat 21 Nov, when the dialog shows its finished state, then the body is `.empty.empty--compact.empty--success` with `role="status"` and the title "Enquiry sent to Pelau House". (L2-022)
- **AC-13** Given Jean-Robert's review of Pelau House contains "www.example.com", when he submits it, then the dialog body is a compact info empty state titled "Your review will appear after a quick check". (L2-050)
- **AC-14** Given Tomas Reyes, an operator without Admin, opens the audit log, when the page renders, then it shows a neutral empty state with the `h1` "Only Admins can see the audit log", the text naming Leah Mohammed and the primary link "Back to the queue", and no audit entry appears in the DOM. (L2-079)
- **AC-15** Given Leah Mohammed filters the audit log to Tomas Reyes and "Remove" between 3 Oct and 10 Oct 2026 with no matches, when it renders, then the empty state reads "No entries match" and "Clear filters" restores the unfiltered log. (L2-060)

### States

- **AC-16** Given keyboard focus on "Try again" in the inbox error state, when the retry is in flight and then fails again with a new reference, then "Try again" shows `aria-busy="true"` during the request, the error re-renders in place with the new reference, and focus is still on "Try again" afterwards. (L2-067)
- **AC-17** Given Auntie Bev's draft menu with one dish, when she removes it and the page calls `focusPrimaryAction()`, then "Add your first dish" is the active element and its focus ring is visible. (L2-067)
- **AC-18** Given a visitor narrows the listing until nothing matches, when the no-results empty state appears, then it has no `role` or `aria-live`, focus stays on the filter they changed, and the result count's polite region announces "0 caterers". (L2-067)
- **AC-19** Given Marcia's inbox has no cached content and the device goes offline, when the offline empty state renders, then it uses the neutral icon circle (no `.empty--error`) with a wifi-off glyph, and the meaning is carried by the heading "You’re offline", not by colour. (L2-069)

### Theming

- **AC-20** Given the dark theme, when a neutral empty state renders on the canvas, then its icon circle resolves to `--palette-stone-800`, the glyph to `--palette-stone-100` with at least 3:1, and the text `--color-fg-muted` has at least 4.5:1 against `--color-bg-canvas`. (L2-069)
- **AC-21** Given the light and dark themes, when the error, info and success tones render, then each glyph has at least 3:1 against its tinted circle and each tone also differs by glyph and title, not by colour alone. (L2-069)
- **AC-22** Given a compact empty state inside a dialog in both themes, when it renders on `--color-bg-surface-raised`, then its text keeps at least 4.5:1. (L2-069)

### Responsive

- **AC-23** Given a 320 px viewport, when Marcia's empty inbox renders with its 272 px photo row and the inbox error renders with two actions, then nothing scrolls horizontally or clips, and the two actions wrap onto separate centred lines with "Try again" first. (L2-064)
- **AC-24** Given a French resource file whose "No caterers match these filters" runs 30 % longer, when the empty state renders at 360 px, then the title and text wrap within the column and nothing is truncated. (L2-064)
- **AC-25** Given viewport XS, when the actions of any empty state are measured, then each is at least 44 × 44 CSS px with at least 8 px between them. (L2-065)
- **AC-26** Given a 1280 px window at 200 % zoom, when the listing error state renders, then the title, text, both actions and the reference are fully visible with no horizontal scrolling. (L2-069)

### Motion

- **AC-27** Given any empty state, with or without `prefers-reduced-motion: reduce`, when it is inserted and when its photos are hovered, then nothing animates or zooms. (L2-069)

### Performance

- **AC-28** Given the listing loading with skeletons in the results column, when the response is empty and the no-results state replaces them, then the cumulative layout shift caused outside the results column is 0, and the `EmptyState` perf-test scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/empty-state/`; files
  `empty-state.component.*`, class `EmptyStateComponent`, selector
  `sh-empty-state`.
- Styles: the `.empty` section of `docs/design-system/assets/components.css`
  moves into the component's stylesheet; class names reach the DOM unscoped
  because pages and e2e locators address `.empty` directly.
- `.empty--info` already exists in `components.css`; the design-system page
  still calls it planned and should drop that note.
- Design-system catch-up for D-3: add
  `.empty--success .empty__icon { background: var(--color-success-bg); color: var(--color-success-icon); }`
  beside `.empty--info`, and the success pair to the page's contrast list.
  The rendering shows it with a specimen-only style.
- Mock catch-up: the dialog mocks' inline icon-circle styles become
  `.empty--info` / `.empty--success`; error references move to `.text-caption`
  in lower case; listing and caterer error mocks get `aria-hidden` on the
  icon circle.
- Composes [photo](photo.md) (the photo row) and hosts [button](button.md),
  `sh-button-anchor` and [file upload](file-upload.md) in its slot. Composed
  by [dialog](dialog.md) bodies and most list pages. No CDK primitive.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *What is the host?* Layout-transparent (`display: contents`) with `div.empty` in the light DOM, as for [button](button.md): page grids place the `.empty` box, and `aria-labelledby="thread-title"` on the thread article reaches the title id.
- **D-3** *How are the success circles in the enquiry, report and review dialogs built?* With a `success` tone that adds `.empty--success`, mirroring `.empty--info`. Six dialog mocks tint the circle with inline success or info styles; the design system already replaced the info one with a modifier, and inline styles cannot be themed or tested.
- **D-4** *What if both image slots are filled?* Only the photos render. The design system allows one image; photos are the richer choice and the one the public screens use.
- **D-5** *May caterer screens use the photo row?* Yes, when the photos are the caterer's own food (Pelau House's empty enquiries and reviews use its own photos). The design system's rule "icon in caterer tools" is kept for operator screens and for caterer screens without photos (the empty photo manager uses placeholders).
- **D-6** *How is a reference rendered?* As a last `p.text-caption` with the label and `<code>` value, never in the sentence and never `.system-page__code`. The mocks used three formats; the design system fixed one. The value is rendered verbatim, because it is the response's correlation ID (L2-089).
- **D-7** *Is a repeated failure re-announced?* No. The error re-renders in place (same node, new reference) so focus on "Try again" survives; the busy button's return to idle is the cue. Re-inserting the node to force a second alert would drop focus.
- **D-8** *Can the consumer change the padding?* No. Only the two sizes exist; the caterer error mock's extra `--space-16` is drift, and the page's own spacing supplies any extra room.
- **D-9** *Does `live` default per tone?* Yes (`auto`): error is `alert`, info and success are `status`, neutral is none, matching every mock and the design system; `off` exists for an error shown on first page load where an alert would duplicate the page announcement.
- **D-10** *Does the component carry a "kind" (first run, no results, forbidden)?* No. Kind changes only copy and glyph, which the consumer supplies; tone and size are the only visual differences, so they are the only inputs.
