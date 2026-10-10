# Error page

| Field | Value |
|---|---|
| Selector | `sh-error-page` |
| Library path | `frontend/projects/components/src/lib/error-page/` |
| Status | planned |
| Traces to | L2-014, L2-018, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-082, L2-085, L2-088, L2-089, L2-091 |
| Design system | [`error-page.html`](../../design-system/components/error-page.html) |
| Source mocks | [`pages/not-found/default`](../../mocks/pages/not-found/default.html), [`pages/caterer/removed`](../../mocks/pages/caterer/removed.html), [`pages/forbidden/default`](../../mocks/pages/forbidden/default.html), [`pages/server-error/default`](../../mocks/pages/server-error/default.html), [`pages/rate-limited/default`](../../mocks/pages/rate-limited/default.html), [`pages/offline/default`](../../mocks/pages/offline/default.html), [`pages/maintenance/default`](../../mocks/pages/maintenance/default.html) |
| Rendering | [`error-page.html`](error-page.html) |

## Purpose and scope

An error page (the design system's "system page") replaces the whole
`<main>` when the requested page cannot be served: it does not exist or is
hidden (404), the caterer has left Sweet Hand (410), the account may not open
it (403), the server failed (500), the network sent too many requests (429),
the device is offline, or Sweet Hand is down for planned maintenance (503).
Under the normal header it shows three round food photos, a plain
display-size heading ("Page not found", "Something went wrong", "Back soon"),
one or two sentences, one or two large actions and a quiet code line ("Error
404", a copyable reference, or the maintenance window), so an error still
feels like Sweet Hand and always offers a way forward.

Use something else when only part of a page failed or is empty: a list that
did not load, an operator section the role cannot see, or an enquiry that
cannot be found inside the inbox is an [empty state](empty-state.md) in the
page. A problem that still lets people use the site (maintenance announced
for Sunday) is a site [banner](alert.md).

Out of scope:

- The HTTP status, `Retry-After` header and choosing which page to serve: the
  server and router decide; this component renders the body.
- The site header, footer, skip link and `<title>` ("Page not found — Sweet
  Hand"): the app shell renders them around the component.
- Retrying, reloading when the connection returns or the maintenance window
  ends early, and counting down `Retry-After`: the page does it and passes the
  results in (`statusMessage`, the action's `disabled` and label).
- Which cached page the offline secondary links to: the service worker's
  cache list.
- The about page's `.system-page` column (`pages/about/default`): it is a
  content page, not an error, and lays out its own prose (D-8).

## Usage

Inventory from a block extraction of every `class="system-page` in
`docs/mocks/` and `usage_inventory.py docs/mocks system-page`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/not-found/default` (404) | three photos, one action, code line | "Page not found", "We couldn't find that page. It may have moved, or the caterer may no longer be listed."; anchor primary lg "Browse caterers"; "Error 404" | default | canvas |
| `pages/caterer/removed` (410) | three photos, two actions, code line | "This caterer has left Sweet Hand", "The page you followed is no longer available. There are 60 other caterers cooking across Toronto and the GTA."; anchor primary lg "Browse caterers", anchor secondary lg "Browse by occasion"; "Error 410" (D-5) | default | canvas |
| `pages/forbidden/default` (403) | three photos, two actions, code line | "No access", "Your account can't open this page. If you think it should, ask a Sweet Hand admin."; anchor primary lg "Go to Sweet Hand", anchor secondary lg "Sign in with another account"; "Error 403" | default | canvas |
| `pages/server-error/default` (500) | three photos, two actions, reference with Copy | "Something went wrong", "That one's on us, not you…quote the reference below."; button primary lg with retry icon "Try again", anchor secondary lg "Browse caterers"; "Reference 4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90" + "Copy" | default, Try again busy, Copy → "Copied" | canvas |
| `pages/rate-limited/default` (429) | three photos, one action, status region, code line | "Slow down a little", "We've had a lot of requests from your network in the last minute. Wait a moment, then try again."; button primary lg "Try again in 1 minute" → "Try again"; "Error 429" | disabled-focusable, then default, busy | canvas |
| `pages/offline/default` (service worker) | three photos, two actions, no code line | "You're offline", "Check your connection. Caterer pages you opened recently still work; enquiries can be sent once you're back online."; button primary lg "Try again", anchor secondary lg "Pelau House (saved)" | default, busy | canvas |
| `pages/maintenance/default` (503) | three photos, one action, code line | "Back soon", "Sweet Hand is down for planned maintenance until 3:00 a.m. Toronto time. Your enquiries and messages are safe."; button primary lg "Check again"; "Sunday 11 October 2026 · 1:00 to 3:00 a.m." | default, busy | canvas |

Not built by this component:

- `pages/thread/not-found` borrows `.system-page` inside the inbox's thread
  column; the design system makes it a full [empty state](empty-state.md).
- `pages/about/default` uses `.system-page` with inline left alignment for a
  content page (D-8).
- Six mocks leave the photo row without `aria-hidden` and set every photo to
  104 × 104; the component renders the corrected markup.

## Anatomy

1. **Column** — `.system-page` (`div`): a centred column at most 34rem wide,
   `--space-4` gap, padding `--space-16` top and `--space-8` bottom, inside
   the page's `.container` (which supplies `--layout-margin`).
2. **Photo row** — `.photo-row` (`div`, `aria-hidden="true"`): three round
   [photos](photo.md), 72 / 104 / 72 px, `alt=""`, `--space-6` below. A
   different trio per page.
3. **Heading** — the page's only `h1`, `tabindex="-1"`, at `--text-display`.
4. **Explanation** — `p.prose`: `--text-body-lg` in `--color-fg-default`.
5. **Actions** — `.system-page__actions` (`div`): one large primary and an
   optional large secondary [button](button.md), centred and wrapping.
6. **Status (always present)** — `p.visually-hidden` with `role="status"`,
   empty until the page has news ("You can try again now").
7. **Code line (optional)** — `p.system-page__code`: plain text ("Error
   404", the maintenance window) or a reference: the label, the value in
   `<code>`, and a small link-styled "Copy" [button](button.md) that becomes
   an `.inline-status--success` "Copied" for 2 seconds.

Host: `sh-error-page` is layout-transparent (`display: contents`); the inner
`div.system-page` is in the light DOM, placed by the shell inside
`<main id="main"><div class="container">` (D-2).

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | The `h1` text: two or three plain words about the situation, never the status number. |
| `text` | `string` | — | yes | Rendered in `p.prose`. Plain text; escaped. |
| `code` | `string \| null` | `null` | no | Plain code-line text ("Error 404", "Sunday 11 October 2026 · 1:00 to 3:00 a.m."). Ignored when `reference` is set. |
| `reference` | `string \| null` | `null` | no | The failed request's correlation ID. Renders the reference code line with Copy instead of `code`. Rendered verbatim. |
| `referenceLabel` | `string \| null` | `null` | yes when `reference` | The word before the value ("Reference"). |
| `copyLabel` | `string \| null` | `null` | yes when `reference` | Visible Copy label ("Copy"). |
| `copyAriaLabel` | `string \| null` | `null` | yes when `reference` | Copy's accessible name; starts with `copyLabel` ("Copy reference"). |
| `copiedLabel` | `string \| null` | `null` | yes when `reference` | The status shown for 2 seconds after copying ("Copied"). |
| `statusMessage` | `string` | `''` | no | Written into the polite status region; changing it announces it once ("You can try again now"). |

- No input renders `"null"`, and no empty code line or actions wrapper is
  left in the DOM.

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `referenceCopied` | `string` (the reference) | Copy wrote the reference to the clipboard. Not emitted when the clipboard write is refused; the reference stays selectable instead (D-6). |

### Methods

| Method | Rule |
|---|---|
| `focusHeading()` | Focuses the `h1` (`tabindex="-1"`). The router calls it when it shows an error page after a client-side navigation (L2-067); never on a full page load. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `[slot=photos]` | Exactly three decorative [photo](photo.md) elements | Wrapped in `div.photo-row` with `aria-hidden="true"`; each image `alt=""`, sizes 72 / 104 / 72. |
| `[slot=actions]` | One or two large `sh-button` / `sh-button-anchor` | Wrapped in `div.system-page__actions`. Primary first; both `size="lg"`. |

- Each slot is declared once.
- Translation: every string (heading, text, code, labels, action labels)
  comes from the resource files through the consumer (L2-064); the component
  contains no copy. The maintenance window and reference are data.

## Variants and sizes

The variants are content, not modifiers: every page uses the same markup.

| Page | HTTP | Heading | Primary | Secondary | Code line |
|---|---|---|---|---|---|
| Not found | 404 | Page not found | Browse caterers (link) | — | Error 404 |
| Gone | 410 | This caterer has left Sweet Hand | Browse caterers (link) | Browse by occasion | Error 410 |
| No access | 403 | No access | Go to Sweet Hand (link) | Sign in with another account | Error 403 |
| Server error | 500 | Something went wrong | Try again (reloads) | Browse caterers | Reference + Copy |
| Rate limited | 429 | Slow down a little | Try again in 1 minute → Try again | — | Error 429 |
| Offline | service worker | You're offline | Try again | A cached page by name ("Pelau House (saved)") | — |
| Maintenance | 503 | Back soon | Check again | — | The window |

One size: the 34rem column with the display heading and large (52 px)
buttons. Width comes from the container; nothing else varies.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Photos, heading, explanation, actions, code line | `h1` is the page heading |
| Shown after client-side navigation | router calls `focusHeading()` | No focus ring on the heading (focused programmatically, not `:focus-visible`) | Focus on the `h1`; heading read first |
| Retrying | consumer sets `busy` on "Try again" / "Check again" | Button spinner ([button](button.md)) | `aria-busy`; focus kept |
| Rate limited, waiting | consumer sets `disabled` + `disabledFocusable` and the label "Try again in 1 minute" | Button at 50 % opacity | Focusable, announced dimmed with its label |
| Rate limited, ready | consumer clears `disabled`, sets "Try again" and `statusMessage` | Button enabled | "You can try again now" announced politely |
| Reference copied | Copy activated, clipboard write succeeds | Copy replaced by `.inline-status.inline-status--success` "Copied" for 2 s, then Copy returns | "Copied" announced politely (`role="status"`) |
| Copy refused | clipboard write rejected | Copy stays; the reference text is selected | Focus stays on Copy |
| Long reference | 36-character UUID at 320 px | Wraps at its hyphens; Copy moves to the next line | — |
| Two actions that do not fit | XS | Stack, centred, primary first | — |

The page itself is not interactive; hover, focus, active and disabled belong
to its buttons.

## Markup

```html
<!-- rendered: 404 inside the shell's main -->
<main id="main"><div class="container">
<div class="system-page">
  <div class="photo-row" aria-hidden="true">
    <span class="photo"><img src="demerara-kitchen.jpg" alt="" width="72" height="72"></span>
    <span class="photo"><img src="ti-kay.jpg" alt="" width="104" height="104"></span>
    <span class="photo"><img src="sugar-dumplin.jpg" alt="" width="72" height="72"></span>
  </div>
  <h1 tabindex="-1">Page not found</h1>
  <p class="prose">We couldn’t find that page. It may have moved, or the caterer may no longer be listed.</p>
  <div class="system-page__actions"><a class="btn btn--primary btn--lg" href="/caterers">Browse caterers</a></div>
  <p class="visually-hidden" role="status"></p>
  <p class="system-page__code">Error 404</p>
</div>
</div></main>
```

```html
<!-- rendered: 500, two actions, reference with Copy -->
<div class="system-page">
  <div class="photo-row" aria-hidden="true">…three .photo…</div>
  <h1 tabindex="-1">Something went wrong</h1>
  <p class="prose">That one’s on us, not you. Try again in a moment. If it keeps happening, email help@sweethand.example and quote the reference below.</p>
  <div class="system-page__actions">
    <button class="btn btn--primary btn--lg" type="button"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>Try again</button>
    <a class="btn btn--lg" href="/caterers">Browse caterers</a>
  </div>
  <p class="visually-hidden" role="status"></p>
  <p class="system-page__code">Reference <code>4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90</code> <button class="btn btn--link btn--sm" type="button" aria-label="Copy reference">Copy</button></p>
</div>
```

```html
<!-- rendered: reference just copied (2 seconds) -->
<p class="system-page__code">Reference <code>4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90</code> <span class="inline-status inline-status--success" role="status">Copied</span></p>
```

```html
<!-- rendered: 429 while waiting, then ready -->
<div class="system-page__actions"><button class="btn btn--primary btn--lg" type="button" aria-disabled="true">Try again in 1 minute</button></div>
<p class="visually-hidden" role="status"></p>
<!-- after Retry-After passes -->
<div class="system-page__actions"><button class="btn btn--primary btn--lg" type="button">Try again</button></div>
<p class="visually-hidden" role="status">You can try again now</p>
```

Not found, gone, no access, offline and maintenance differ only in the
copy, the photos, the actions and whether the code line is present.

Consumer templates (binding syntax illustrative):

```html
<!-- consumer: 500 -->
<sh-error-page [heading]="t('errors.server.title')" [text]="t('errors.server.text')"
  [reference]="correlationId" [referenceLabel]="t('common.reference')"
  [copyLabel]="t('common.copy')" [copyAriaLabel]="t('errors.copyReference')" [copiedLabel]="t('common.copied')">
  <sh-photo slot="photos" …></sh-photo><sh-photo slot="photos" …></sh-photo><sh-photo slot="photos" …></sh-photo>
  <sh-button slot="actions" variant="primary" size="lg" [busy]="reloading()" (activated)="reload()">…{{ t('common.tryAgain') }}</sh-button>
  <sh-button-anchor slot="actions" size="lg" href="/caterers">{{ t('errors.browseCaterers') }}</sh-button-anchor>
</sh-error-page>

<!-- consumer: 429 -->
<sh-error-page [heading]="t('errors.rate.title')" [text]="t('errors.rate.text')" [code]="t('errors.code', { status: 429 })" [statusMessage]="ready() ? t('errors.rate.ready') : ''">
  …
  <sh-button slot="actions" variant="primary" size="lg" [disabled]="!ready()" disabledFocusable (activated)="reload()">{{ ready() ? t('common.tryAgain') : t('errors.rate.wait', { minutes: 1 }) }}</sh-button>
</sh-error-page>
```

The e2e page objects locate the page by `.system-page`, the heading by
`h1`, the code line by `.system-page__code` and Copy by its name "Copy
reference"; those are the contract.

## Design

- Column: flex, `align-items: center`, `text-align: center`, gap
  `--space-4`, `max-width: 34rem`, centred, padding `--space-16` top and
  `--space-8` bottom; side margin `--layout-margin` from `.container`.
- Photo row 272 px (72 / 104 / 72 with `--space-3` gaps), `--space-6` below;
  `--color-bg-photo` behind a photo still loading.
- Heading `--text-display` (`--font-size-5xl`: 48 px below 62rem, 64 px from
  62rem) in `--color-fg-default`.
- Explanation `--text-body-lg` in `--color-fg-default`.
- Actions: flex, wrap, centred, gap `--space-3`, `--space-4` above; large
  buttons (`--control-height-lg`).
- Code line `--text-body-sm` in `--color-fg-subtle`; reference value in
  `<code>` (`--text-code`); Copy is a link-variant small button.
- No elevation, border or layer; no animation of its own.

There are no component tokens; the page reads semantic tokens only.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Page | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Heading, explanation | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Code line | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| Photo placeholder | `--color-bg-photo` | `--palette-stone-100` | `--palette-stone-800` |
| Primary fill / label | `--color-action` / `--color-fg-on-action` | `--palette-stone-950` / `--palette-white` | `--palette-stone-100` / `--palette-stone-950` |
| Copy | `--color-fg-link` | `--palette-stone-950` | `--palette-stone-100` |
| "Copied" | `--color-success-fg` | `--palette-callaloo-700` | `--palette-callaloo-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Heading and explanation |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Code line |
| `--color-fg-on-action` | `--color-action` | 4.5:1 | Primary label |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Secondary button edge |
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Copy |
| `--color-success-fg` | `--color-bg-canvas` | 4.5:1 | "Copied" |

Photos are never tinted or filtered by a theme. Forced colours: text takes
`CanvasText`; buttons follow [button](button.md).

## Responsive behaviour

- Below 36rem: the heading is 48 px, the 272 px photo row fits a 320 px
  screen inside the 16 px margins, and two large buttons stack when they
  cannot share a line, primary first.
- From 48rem the header shows its full navigation; the error page itself does
  not change. From 62rem the heading grows to 64 px (the token steps up).
- The 36-character reference wraps at its hyphens at 320 px, and Copy moves to
  the next line; nothing scrolls sideways.
- Text wraps, never truncates; at 200 % zoom at 1280 px everything stays
  visible; large buttons are 52 px and Copy is 44 px high below 48rem
  (L2-065).

## Accessibility

### Role and pattern

An ordinary document region: the `h1`, a paragraph, links or buttons, and a
visually hidden `role="status"` paragraph. No widget role. The real HTTP
status and the `<title>` come from the server and shell.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | After the skip link and header: primary action, secondary action, Copy, then the footer. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused action or Copy. |

### Focus

- Full page load: focus starts at the top; the first Tab shows the skip link.
- Client-side navigation to an error page: the router calls
  `focusHeading()`; the `h1` has `tabindex="-1"` and shows no ring.
- After Copy, the "Copied" status replaces the button for 2 seconds; focus
  moves to the code line's `<code>` element's paragraph and then back to Copy
  when it returns (D-7).
- Busy and waiting retries keep focus (they are never natively disabled).

### Labelling

- One `h1` per page, from `heading`.
- The photo row is `aria-hidden="true"`; every photo `alt=""`.
- Copy's name is `copyAriaLabel` ("Copy reference"), which begins with its
  visible "Copy" (WCAG 2.5.3).
- The reference is in `<code>`, read character by character.
- Icons in actions are `aria-hidden`; buttons keep their text ("Try again").

### Announcements

`statusMessage` changes are announced politely ("You can try again now").
"Copied" is announced politely through its own `role="status"`. Nothing is
announced on load.

### Motion

None of its own; the photos do not zoom. A busy "Try again" spinner keeps
turning under `prefers-reduced-motion` because it reports status.

## Content and internationalisation

- Heading: two or three plain words about the situation, not the code: "Page
  not found", "No access", "Something went wrong", "Slow down a little",
  "You're offline", "Back soon", "This caterer has left Sweet Hand".
- Explanation: what happened, whose fault, what to do, and reassurance about
  data where people might worry ("Your enquiries and messages are safe.").
- Never confirm a hidden record exists: a draft, suspended caterer or someone
  else's page gets the same 404 words as a page that never existed.
- Never show internals: no stack trace, server name or exception text; only
  the correlation ID.
- Times are Toronto time and say so: "until 3:00 a.m. Toronto time";
  windows "Sunday 11 October 2026 · 1:00 to 3:00 a.m."; waits "Try again in 1
  minute".
- The code line is secondary: "Error 404".
- Translatable inputs: `heading`, `text`, `code`, `referenceLabel`,
  `copyLabel`, `copyAriaLabel`, `copiedLabel`, `statusMessage`, action labels.
  Data: the reference, dates and times, the cached page's name, caterer counts
  ("60 other caterers").
- French runs about 30 % longer ("Quelque chose s'est mal passé"); the
  display heading wraps within the 34rem column and never truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (whether the reference or
  plain code line renders) are computed once, not in the template.
- The "Copied" timer (2 s) is the only timer; it is cleared when the
  component is destroyed.
- Error pages are rendered on the server with the status code and work
  without JavaScript, except Copy and the automatic recovery; the offline page
  is pre-cached by the service worker.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/ErrorPage.ts`
  renders the 500 page with reference
  `4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90`, three photos and two actions, and
  toggles Copy; iterations in `e2e/perf-test/config/scenario-iterations.mjs`
  keep it at roughly 100–300 ms.
- Composite scenarios: `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: photos carry `width` and `height`; the status region is
  always present, so filling it shifts nothing; "Copied" occupies Copy's line.
- Weight: no dependencies beyond the framework and the Clipboard API; composes
  [photo](photo.md) and [button](button.md).

## Acceptance criteria

### Rendering

- **AC-1** Given a visitor requests the URL of Auntie Bev's Kitchen while it is a draft, and another visitor requests `/caterers/no-such-caterer`, when each 404 page renders, then both bodies are identical: the `h1` "Page not found", the text "We couldn’t find that page. It may have moved, or the caterer may no longer be listed.", one large primary link "Browse caterers" to `/caterers` and the code line "Error 404". (L2-014)
- **AC-2** Given Coal Pot Kitchen was removed on Mon 28 Sep, when its URL is requested, then the response is HTTP 410 and the page shows the `h1` "This caterer has left Sweet Hand", a primary link "Browse caterers" to `/caterers`, a secondary link "Browse by occasion" and the code line "Error 410". (L2-018)
- **AC-3** Given Marcia Thompson, a customer, requests an operator page, when the 403 page renders, then it shows "No access", the primary link "Go to Sweet Hand", the secondary link "Sign in with another account" and "Error 403". (L2-056)
- **AC-4** Given an unhandled exception while loading Pelau House's page, when the 500 page renders, then the code line shows "Reference" and, in `<code>`, exactly the value of the response's `X-Correlation-ID` header, and the page text contains no exception name, stack frame or server name. (L2-089)
- **AC-5** Given planned maintenance on Sunday 11 October 2026, when a visitor arrives during it, then the response is HTTP 503 and the page shows "Back soon", the explanation ending "Your enquiries and messages are safe.", the button "Check again" and the code line "Sunday 11 October 2026 · 1:00 to 3:00 a.m.". (L2-088)
- **AC-6** Given Marcia opened Pelau House's page earlier and is now offline, when she opens a page that is not cached, then the offline page shows "You’re offline", a primary "Try again" and a secondary link "Pelau House (saved)" that opens the cached caterer page without a network request. (L2-091)
- **AC-7** Given any error page, when it renders, then `.photo-row` has `aria-hidden="true"`, it holds three photos rendered 72, 104 and 72 CSS px wide, and each `img` has `alt=""`. (L2-068)
- **AC-8** Given each of the seven pages, when axe-core runs at XS and XL in both themes, then it reports 0 violations and the page contains exactly one `h1`. (L2-066)

### States

- **AC-9** Given a 429 response with `Retry-After: 60`, when the page renders, then "Try again in 1 minute" has `aria-disabled="true"`, no `disabled` attribute, is reachable by Tab, and activating it does not reload; when 60 seconds have passed, then its label is "Try again", it is enabled, and "You can try again now" is announced once through the polite status region. (L2-082)
- **AC-10** Given the 500 page, when Copy is activated and the clipboard accepts the write, then the clipboard holds `4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90`, `referenceCopied` is emitted, "Copied" appears as `.inline-status--success` with `role="status"` for 2 seconds, and Copy then returns. (L2-068)
- **AC-11** Given the 500 page, when Copy is inspected, then its accessible name is "Copy reference" and starts with its visible label "Copy". (L2-068)
- **AC-12** Given keyboard focus on "Try again" on the 500 page, when it is activated and the reload is pending, then the button shows `aria-busy="true"`, keeps focus and ignores further presses. (L2-067)

### Keyboard and focus

- **AC-13** Given the 500 page loaded in full, when Tab is pressed repeatedly, then focus moves through the skip link, the header links, "Try again", "Browse caterers", Copy and then the footer, in that order. (L2-067)
- **AC-14** Given Marcia follows an in-app link to a caterer that no longer exists, when the router shows the 404 page without a full load and calls `focusHeading()`, then the `h1` "Page not found" is the active element and no focus ring is drawn on it. (L2-067)

### Theming

- **AC-15** Given the dark theme, when the 404 page renders, then the heading and explanation (`--color-fg-default`) have at least 4.5:1 and the code line (`--color-fg-subtle`, resolving to `--palette-stone-400`) has at least 4.5:1 against `--color-bg-canvas`. (L2-069)
- **AC-16** Given the light theme, when the 500 page renders, then the code line, Copy and the "Copied" status each have at least 4.5:1 against the canvas, and the secondary button's edge at least 3:1. (L2-069)

### Responsive

- **AC-17** Given a 320 px viewport, when the 410 page renders, then the 272 px photo row fits, "Browse caterers" and "Browse by occasion" stack on separate centred lines with the primary first, and the page does not scroll horizontally. (L2-064)
- **AC-18** Given a 320 px viewport, when the 500 page renders, then the reference wraps at its hyphens, Copy moves to the next line if needed, and nothing is clipped or scrolls sideways. (L2-064)
- **AC-19** Given widths of 991 and 992 px, when the 404 page renders, then the heading is 48 px at 991 and 64 px at 992, and it wraps within the 34rem column at both. (L2-064)
- **AC-20** Given viewport XS, when the actions and Copy are measured, then "Try again" and "Browse caterers" are 52 px high and Copy is at least 44 × 44 CSS px with at least 8 px to the nearest target. (L2-065)
- **AC-21** Given a 1280 px window at 200 % zoom, when the maintenance page renders, then the heading, explanation, "Check again" and the window are fully visible with no horizontal scrolling. (L2-069)

### Motion

- **AC-22** Given `prefers-reduced-motion: reduce`, when any error page renders and its photos are hovered, then nothing animates or zooms, while a busy "Try again" spinner keeps turning. (L2-069)

### Performance

- **AC-23** Given the 404 page served from the server on a mobile profile, when it loads, then its cumulative layout shift is 0.1 or less (photos reserve 72 / 104 / 72 px), and the `ErrorPage` perf-test scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

### Content

- **AC-24** Given the component's source, when it is scanned for user-facing string literals, then none are found; "Reference", "Copy", "Copy reference" and "Copied" all arrive as inputs from the resource files. (L2-064)

## Implementation notes

- Folder `frontend/projects/components/src/lib/error-page/`; files
  `error-page.component.*`, class `ErrorPageComponent`, selector
  `sh-error-page`.
- Styles: the `.system-page` section of `components.css` moves into the
  component's stylesheet; `.prose`, `.inline-status`, `.visually-hidden` and
  `.container` stay global foundations.
- Uses the asynchronous Clipboard API (`navigator.clipboard.writeText`); on
  rejection selects the `<code>` text (D-6).
- Mock catch-up: add `aria-hidden="true"` to the six photo rows and 72 / 104 /
  72 sizes; the 410 code line becomes "Error 410"; the rate-limited retry gets
  `aria-disabled`; Copy gets `aria-label="Copy reference"`.
- Composes [photo](photo.md) and [button](button.md) (Copy is an internal
  `sh-button variant="link" size="sm"`); the actions slot hosts consumer
  buttons. Rendered by the app shell's error routes and the service worker's
  offline fallback. No CDK primitive.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Does the component render `<main>` and `.container`?* No. The shell owns `<main id="main">` (the skip-link target) on every page; the component renders `.system-page` inside it, so error routes and normal routes share one landmark structure.
- **D-3** *Is there a `kind` input (404, 500…)?* No. The seven pages differ only in copy, photos, actions and code line, which arrive as inputs and slots; the HTTP status is the server's. A `kind` would hard-code copy into the component.
- **D-4** *Is the 410 "gone" page an error page?* Yes. L2-018.5 requires a 410 page linking to the listing, the `caterer/removed` mock uses `.system-page`, and the design system lists only six pages; the seventh uses the same markup.
- **D-5** *What is the 410 code line?* "Error 410", matching "Error 404" and "Error 403". The mock's "410 · Gone" leads with jargon the design system's content rules reject.
- **D-6** *What if the clipboard write is refused?* Copy stays, the `<code>` text is selected so the person can copy it by hand, and no "Copied" is shown; claiming a copy that did not happen would mislead support.
- **D-7** *Where does focus go while "Copied" replaces Copy?* The design system swaps the button for a status, which would drop focus to the body. The component moves focus to the code line paragraph (`tabindex="-1"` while "Copied" shows) and back to Copy when it returns, so keyboard users keep their place.
- **D-8** *Does the component support the about page's left-aligned `.system-page`?* No. The about page is content, not an error; it reuses the column with inline overrides in the mock and is laid out by its own page template.
- **D-9** *Does the rate-limited page count down?* No. The label says "Try again in 1 minute" and changes once, to "Try again", when `Retry-After` passes (design system, States); a per-second countdown would be noisy for screen readers. The page owns the timer and passes the state in.
