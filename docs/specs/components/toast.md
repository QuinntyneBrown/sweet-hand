# Toast

| Field | Value |
|---|---|
| Selector | `sh-toast-region` (the fixed live region, one per page shell), `sh-toast` (one toast); `ToastNotifier` (the contract pages call to show a toast) |
| Library path | `frontend/projects/components/src/lib/toast/` |
| Status | planned |
| Traces to | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-078, L2-085, L2-091 |
| Design system | [`toast.html`](../../design-system/components/toast.html) |
| Source mocks | [`notifications/toast/success`](../../mocks/notifications/toast/success.html), [`notifications/toast/info`](../../mocks/notifications/toast/info.html), [`notifications/toast/warning`](../../mocks/notifications/toast/warning.html), [`notifications/toast/danger`](../../mocks/notifications/toast/danger.html), [`notifications/toast/with-action`](../../mocks/notifications/toast/with-action.html), [`notifications/toast/stacked`](../../mocks/notifications/toast/stacked.html), [`notifications/dashboard-toast/with-action`](../../mocks/notifications/dashboard-toast/with-action.html), [`notifications/dashboard-toast/stacked`](../../mocks/notifications/dashboard-toast/stacked.html), [`notifications/admin-toast/warning`](../../mocks/notifications/admin-toast/warning.html), [`notifications/admin-toast/stacked`](../../mocks/notifications/admin-toast/stacked.html), [`pages/account/saved`](../../mocks/pages/account/saved.html) |
| Rendering | [`toast.html`](toast.html) |

## Purpose and scope

A toast confirms what just happened, out of the way, on the dark inverse
surface: "Reply sent", "Photo removed · Undo", "Auntie Bev's Kitchen is
published". It appears in a fixed region at the bottom of the screen after an
action or a background event and leaves on its own after at least 8 seconds —
except failures ("Your reply wasn't sent · Try again") and time-critical
warnings ("Your session ends in 5 minutes"), which stay until dealt with. A
toast never blocks the page and never holds the only copy of anything: the sent
reply is in the thread, the "Processing" label is on the photo tile.

Use an [alert](alert.md) or banner for a condition that lasts (email
unverified, profile suspended), an [inline message](inline-message.md) for a
wrong field, the [dialog](dialog.md) success state when the result needs
reading, and an [empty state](empty-state.md) when a list failed to load.

Out of scope:

- Deciding when to show a toast and what it says: the page or feature, through
  `ToastNotifier`.
- What "Undo", "Retry" or "Show message" do: the consumer's action handler.
- Unread badges and in-app counts ([badge](badge.md)).

## Usage

Inventory from `usage_inventory.py docs/mocks toast "div"` (17 notification
mocks, plus the empty region on every account and caterer-editor page).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `notifications/toast/success`, `stacked`; `pages/account/saved` | success, auto | "Reply sent" / "Pelau House will get an email."; "Contact details shared"; "Details saved" | showing, stacked | thread, account |
| `notifications/toast/info` | info, auto | "Emails are running late" / "Your reply is saved. Pelau House will get the email as soon as our mail service catches up." | showing | thread |
| `notifications/toast/warning` | warning, auto | "This enquiry closes on Sun 20 Dec" | showing | thread |
| `notifications/toast/danger` | danger, persistent, action button | "Your reply wasn't sent" + "Try again" | persistent | thread |
| `notifications/toast/with-action` | info, auto, action button | "New message from Pelau House" / "“I'll call this afternoon to confirm the menu.”" + "Show message" | showing | inbox |
| `notifications/dashboard-toast/*` | success with "Undo" or link "View your page"; info "Photo order saved"; warning "Still processing"; danger "Upload failed" + "Retry"; stacked ×3 | file names and captions in text | showing, stacked, persistent | caterer dashboard |
| `notifications/admin-toast/*` | success + link "View page"; info + link "Open report", "Download CSV"; warning persistent + "Stay signed in"; danger + "Try again"; stacked ×3 | "Auntie Bev's Kitchen is published", "New in the queue", "Your session ends in 5 minutes", "Couldn't suspend Flying Fish Kitchen" | showing, persistent, stacked | operator console |
| Every page shell (`pages/account/*`, `pages/profile-*/*`) | empty region | — | empty | all |
| Caterer page below 62rem (design system) | region `placement="top"` | — | — | above the sticky "Send an enquiry" bar |

## Anatomy

1. **Region** — `div.toast-region` (`.toast-region--top`), rendered empty with
   the page shell, last in `<body>`, `role="status"`, `aria-live="polite"`,
   fixed at `--z-toast`. A column of toasts, newest last, `--space-3` apart.
2. **Toast** — `div.toast.toast--{tone}`: inverse surface, `--radius-md`,
   `--space-4` padding, `--shadow-3`. Danger adds `role="alert"`.
3. **Tone icon** — `svg.icon` (`aria-hidden="true"`) in `currentColor`; the
   shape carries the tone: circle-i (info), tick (success), triangle (warning),
   circle-! (danger).
4. **Body** — `.toast__body`: **title** `.toast__title` (the result) and
   optional **text** `.toast__text` (one sentence).
5. **Action (optional)** — `.toast__actions` > `.toast__action`, a `<button>`
   that does something or an `<a href>` that goes somewhere. At most one.
6. **Dismiss** — `button.close` named by `dismissLabel` ("Dismiss"), always
   present.
7. **Timer bar** — `span.toast__progress[aria-hidden]`, only on toasts that
   auto-dismiss; its width shrinks with the remaining time.

Host: `sh-toast-region` renders the region element itself; `sh-toast` is
`display: contents` with its classes on the inner `div.toast`.

## API

### `ToastNotifier` (the contract pages depend on)

| Member | Signature | Rule |
|---|---|---|
| `show` | `(toast: ToastOptions) => ToastRef` | Adds a toast to the region. Returns a handle. |
| `ToastRef.dismiss` | `() => void` | Removes it (for example once "Stay signed in" succeeded or the upload retried). |
| `ToastRef.dismissed` | `Promise<ToastDismissReason>` | Resolves once it has left: `'timeout' \| 'dismiss' \| 'escape' \| 'action' \| 'replaced' \| 'programmatic'`. |

`ToastOptions`:

| Field | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'success'` | no | `.toast--{tone}` and the icon. Danger is persistent and `role="alert"`. |
| `title` | `string` | — | yes | The result, meaningful alone: "Upload failed", not "Oops". |
| `text` | `string \| null` | `null` | no | One sentence of detail. |
| `action` | `{ label: string; href?: string; run?: () => void } \| null` | `null` | no | `href` renders `<a class="toast__action">`; `run` renders `<button>`. Activating it dismisses the toast with `'action'` after running. |
| `persistent` | `boolean` | `false` (`true` for danger) | no | No timer, no timer bar; stays until dismissed or `ToastRef.dismiss`. Time-critical warnings set it. |
| `durationMs` | `number` | `8000` | no | Values below 8000 are raised to 8000 (D-3). Ignored when persistent. |
| `restoreFocusTo` | `HTMLElement \| null` | `null` | no | Where the action moves focus (Undo → the restored photo tile). |

### `sh-toast-region` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `placement` | `'bottom' \| 'top'` | `'bottom'` | no | `top` adds `.toast-region--top`; the caterer page sets it below 62rem, where the sticky bar holds the bottom edge. |
| `max` | `number` | `3` | no | Visible toasts. A fourth replaces the oldest auto-dismissing toast (`'replaced'`); danger and persistent toasts are never replaced. |
| `dismissLabel` | `string` | — | yes | The dismiss button's name for every toast: "Dismiss". |

### `sh-toast` inputs and outputs

`sh-toast` is rendered by the region from `ToastOptions`; pages never place it
directly. Its inputs are the `ToastOptions` fields plus `dismissLabel`; its
outputs are `actionActivated` (`MouseEvent`) and `dismissed`
(`ToastDismissReason`).

### Content slots

None. Every string arrives as data, so the region can render toasts raised from
anywhere.

- Translation: `title`, `text`, `action.label` and `dismissLabel` come from the
  resource files (L2-064); file names and captions inside them are data.

## Variants and sizes

| Tone | Modifier | Icon | Behaviour | Example |
|---|---|---|---|---|
| Info | `.toast--info` | circle-i | auto, polite | "Emails are running late", "New in the queue" |
| Success | `.toast--success` | tick | auto, polite | "Reply sent", "Photo removed" + Undo |
| Warning | `.toast--warning` | triangle | auto, polite; persistent when time-critical | "Still processing"; "Your session ends in 5 minutes" + "Stay signed in" |
| Danger | `.toast--danger` | circle-! | persistent, `role="alert"` | "Upload failed" + Retry |

Tone changes no colour: every toast is the inverse surface with
`currentColor` icons (design system, Theming).

One size: 24rem from 36rem; below 36rem the full region width (the screen
less a `--space-4` gutter each side). Height from content; titles wrap,
never truncate.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Empty region | no toasts | Region present, nothing visible, `pointer-events: none` | Live region registered on page load |
| Entering | `show` | `slide-up` over `--duration-base`, `--ease-enter` | Title then text announced politely (danger: assertively) |
| Showing (auto) | default | Timer bar shrinking over `durationMs` | — |
| Paused | pointer over the toast, focus inside it, or `document.hidden` | Timer bar frozen | — |
| Persistent | danger or `persistent` | No timer bar | — |
| Action hover / focus | `:hover` / `:focus-visible` on the action | Thicker underline / ring in `--color-fg-inverse` | — |
| Dismiss hover / focus | `:hover` / `:focus-visible` | 12 % `currentColor` fill, full opacity / inverse ring | — |
| Leaving | timeout, dismiss, action, replace | `data-state="leaving"`: `fade-out` over `--duration-base`, `--ease-exit`, then removed | — |
| Stacked | up to 3 | Newest at the bottom, each with its own timer | Each announced once |
| Top placement | `placement="top"` | Region fixed at the top | — |

## Markup

```html
<!-- rendered: empty region, last in <body> on every page -->
<div class="toast-region" role="status" aria-live="polite"></div>
```

```html
<!-- rendered: success, auto-dismissing, no action -->
<div class="toast toast--success">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/></svg>
  <div class="toast__body">
    <div class="toast__title">Reply sent</div>
    <div class="toast__text">Pelau House will get an email.</div>
  </div>
  <button class="close" type="button" aria-label="Dismiss"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  <span class="toast__progress" aria-hidden="true" style="width: 100%"></span>
</div>
```

```html
<!-- rendered: danger, persistent, action button, no timer bar -->
<div class="toast toast--danger" role="alert">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <div class="toast__body">
    <div class="toast__title">Your reply wasn't sent</div>
    <div class="toast__text">Check your connection, then try again. Your message is still in the box.</div>
    <div class="toast__actions"><button class="toast__action" type="button">Try again</button></div>
  </div>
  <button class="close" type="button" aria-label="Dismiss">…</button>
</div>
```

```html
<!-- rendered: action that goes somewhere -->
<div class="toast__actions"><a class="toast__action" href="/caterers/auntie-bevs-kitchen">View page</a></div>
```

The timer bar's `width` is the only inline style, set by script from the
remaining time. Info and warning differ from success only by modifier and icon.

```ts
// consumer: after "Remove photo" succeeds on the photo manager
notifier.show({ tone: 'success', title: t('photos.removed'), text: t('photos.removedText', { caption }),
  action: { label: t('common.undo'), run: () => restore(photo) }, restoreFocusTo: tile });
```

```html
<!-- consumer: page shell -->
<sh-toast-region [placement]="stickyBarVisible() ? 'top' : 'bottom'" [dismissLabel]="t('common.dismiss')"></sh-toast-region>
```

The e2e page objects locate toasts inside `.toast-region` by `.toast` and
`.toast__title` text, and the action and dismiss by role and name.

## Design

- Toast padding `--space-4`, gap `--space-3`; body gap `--space-0-5`; actions
  gap `--space-4`.
- Title `--text-label` at `--font-size-md`; text `--text-body-sm` at 90 %
  opacity; action `--text-label`, underlined, thicker underline
  (`--border-width-thick`) on hover.
- Icon `--icon-size-md`, `currentColor`.
- Shape `--radius-md`; dismiss `--radius-sm`, 80 % opacity at rest.
- Elevation `--shadow-3` (a toast floats).
- Timer bar `--border-width-thick` high, `currentColor` at 40 %.
- Region: `--space-4` from the edges below 36rem, `--space-6` and 24rem wide at
  the bottom right from 36rem; `env(safe-area-inset-bottom)` padding; stack gap
  `--space-3`; layer `--z-toast` (above dialogs, sheets and popovers, below
  tooltips).
- Motion: enter `slide-up`, leave `fade-out`, both `--duration-base`.
- Component token: `--toast-tone` (aliases `--color-fg-inverse` on every tone);
  a theme may tint icons through it only if each tone keeps 3:1 on the inverse
  surface.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Surface | `--color-bg-inverse` | `--palette-stone-950` | `--palette-stone-50` |
| Title, text, icon, action, timer bar, focus ring | `--color-fg-inverse` | `--palette-white` | `--palette-stone-950` |
| Divider (decorative) | `--color-border-inverse` | `--palette-stone-700` | `--palette-stone-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-inverse` | `--color-bg-inverse` | 4.5:1 | Title, text, action, icon, focus ring |
| `--color-border-inverse` | `--color-bg-inverse` | 1:1 | Divider (decorative, exempt) |

Text at 90 % opacity stays well above 4.5:1 (the base pair is over 15:1).
Forced colours: the toast keeps a `CanvasText` border so it separates from the
page (D-6).

## Responsive behaviour

| Range | Region | Dismiss and action |
|---|---|---|
| XS (below 36rem) | Full width less `--space-4` each side, `--space-4` above the bottom plus the safe-area inset | 44 × 44 px dismiss (pulled into the corner), action at least 44 px tall |
| SM (36–48rem) | 24rem at the bottom right, `--space-6` from both edges | as XS |
| MD and up (48rem+) | as SM | compact: `--target-min` (24 px), 16 px apart |
| Caterer page below 62rem | `placement="top"` | — |

- Long titles and file names ("sweet-hand-metrics-2026-08-31-to-2026-10-10-weekly.csv")
  wrap (`overflow-wrap: anywhere`); nothing scrolls sideways at 320 px.
- The region never covers a focused element: when focus moves under a
  persistent toast, the page scrolls the element clear (WCAG 2.4.11).

## Accessibility

### Role and pattern

Live regions per WCAG 4.1.3 and the [APG Alert
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/alert/): the region is
`role="status" aria-live="polite"` and exists from page load; danger toasts add
`role="alert"`. If screen-reader testing shows a danger toast read twice, the
region renders danger toasts into a sibling `role="alert"` container in the same
stack (design system, Accessibility).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | The region is last in the DOM, so toasts are reached last; within a toast, action then dismiss. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the action or dismisses. |
| <kbd>Esc</kbd> | With focus inside a toast: dismisses it (`'escape'`) and returns focus to where it was before. Otherwise nothing, so it never fights a dialog. |

### Focus

- A toast never takes focus when it appears.
- The action moves focus to `restoreFocusTo` when given (Undo → the restored
  tile; "Show message" → the new message).
- Dismissing with focus inside returns focus to the element focused before
  focus entered the region.
- Focus inside pauses the timer. Ring in `--color-fg-inverse`.

### Labelling

- Announced text: title, then text. Icons `aria-hidden`.
- Dismiss: "Dismiss". Action: names its result ("Undo", "Retry",
  "Show message").

### Announcements

Each toast is announced once when inserted; updating or removing it announces
nothing. While a [dialog](dialog.md) or [sheet](sheet.md) is open the region is
excluded from `inert`, so announcements and pointer use still work (D-5).

### Motion

Entry and exit use `--duration-base`, which reduced motion zeroes; the timer
bar stops shrinking visually under reduced motion while the timer still runs.

### Timing

WCAG 2.2.1: at least 8 seconds, paused on hover, focus and hidden window;
nothing disappears on a timer that cannot be found elsewhere.

## Content and internationalisation

- Title: the result in the past tense, four words or fewer: "Reply sent",
  "Caption saved", "Photo removed", "Contact details shared". Name the thing
  when in doubt: "Couldn't suspend Flying Fish Kitchen".
- Text: one sentence of consequence: "Pelau House will get an email."
- Failures say what did not happen and what is safe: "Nothing was changed and
  the caterer wasn't emailed."
- Quote file names and captions exactly, captions in curly quotes:
  "IMG_2077.heic didn't upload."; "“Doubles with tamarind and cucumber chutney”
  is now on your page."
- Actions: one or two words, a verb: "Undo", "Retry", "Try again", "Show
  message", "View your page". Never "OK" or "Got it". No Undo for what cannot be
  undone ("Reply sent").
- Dates in copy per the cast ("Sun 20 Dec"). French runs about 30 % longer;
  toasts grow in height, never truncate.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (icon, role, persistence,
  effective duration) are computed once per toast, not in the template.
- One timer per toast (`setTimeout`; the bar shrinks by one CSS width
  transition, not per-frame script), cleared on leave; one `visibilitychange`
  listener for the region.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Toast.ts`
  shows the dashboard stack ("Photo order saved", "Caption saved", "Upload
  failed" + Retry) and adds a fourth to force a replacement; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Thread`, `PhotoManager`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the region is fixed and out of flow; toasts never shift
  page content (CLS 0).
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given any page, when it first renders, then it contains one empty `div.toast-region` with `role="status"` and `aria-live="polite"` as the last child of `<body>`. (L2-066)
- **AC-2** Given Marcia sends a reply to Pelau House, when `show` is called with success, "Reply sent" and "Pelau House will get an email.", then a `.toast.toast--success` appears in the region with a tick icon marked `aria-hidden="true"`, a dismiss button named "Dismiss", a timer bar, and the screen reader announces "Reply sent Pelau House will get an email." once. (L2-068)
- **AC-3** Given the email provider is down when Marcia replies, when the info toast "Emails are running late" is shown, then it appears without blocking the thread, the reply is already visible in the thread, and the toast leaves on its own after at least 8 seconds. (L2-091)
- **AC-4** Given Kendra's upload of IMG_2077.heic is still processing, when the warning toast "Still processing" is shown, then it auto-dismisses, and the photo tile keeps its "Processing" label after the toast has gone. (L2-091)
- **AC-5** Given the operator Leah Mohammed has been idle for 25 minutes, when the warning "Your session ends in 5 minutes" is shown with `persistent` and the action "Stay signed in", then it has no timer bar and does not auto-dismiss, and activating "Stay signed in" dismisses it with `'action'`. (L2-078)
- **AC-6** Given "Auntie Bev's Kitchen is published" with the action `{ label: "View page", href }`, when it renders, then the action is an `<a class="toast__action">` inside `.toast__actions`; given "Photo removed" with Undo, the action is a `<button class="toast__action" type="button">`. (L2-066)

### States

- **AC-7** Given "Your reply wasn't sent" with tone danger and "Try again", when it is shown, then it carries `role="alert"`, has no timer bar, and is still present 60 seconds later until dismissed. (L2-068)
- **AC-8** Given a success toast with 8 seconds left, when the pointer rests on it for 5 seconds, or focus is inside it, or the window is hidden, then its timer stops and resumes from where it stopped afterwards. (L2-069)
- **AC-9** Given `show` is called with `durationMs` 3000, when the toast runs, then it stays at least 8 seconds. (L2-069)
- **AC-10** Given the dashboard stack "Photo order saved", "Caption saved" and "Upload failed" (danger), when a fourth toast "Photo added" is shown, then "Photo order saved" leaves with `'replaced'`, "Upload failed" stays, and at most 3 toasts are visible, newest at the bottom. (L2-068)

### Keyboard and focus

- **AC-11** Given a toast appears while Marcia types in the reply box, when it is inserted, then focus stays in the reply box. (L2-067)
- **AC-12** Given focus inside "Photo removed", when Escape is pressed, then the toast is dismissed with `'escape'` and focus returns to the element focused before. (L2-067)
- **AC-13** Given "Photo removed" with Undo and `restoreFocusTo` set to the photo's tile, when Kendra activates Undo, then the `run` callback is called once, the toast leaves, and focus is on the restored tile. (L2-067)
- **AC-14** Given focus on a toast's action or dismiss button in each theme, when it is shown, then the focus ring is `--color-fg-inverse` with at least 3:1 contrast against the toast surface. (L2-067)

### Theming

- **AC-15** Given each tone in the light and the dark theme, when a toast renders, then title, text, icon and action meet 4.5:1 against `--color-bg-inverse`, which resolves to `--palette-stone-950` in light and `--palette-stone-50` in dark. (L2-069)
- **AC-16** Given any tone, when it renders, then the icon is `currentColor`, not a tone colour, and the tone is also given by the icon shape and the title words. (L2-069)

### Responsive

- **AC-17** Given a 360 px viewport, when "Upload failed" with Retry renders, then the region spans the width less 16 px each side, the dismiss button is 44 × 44 CSS px, and Retry is at least 44 CSS px tall. (L2-065)
- **AC-18** Given a 320 px viewport, when the admin toast "Metrics export ready" shows the file name "sweet-hand-metrics-2026-08-31-to-2026-10-10-weekly.csv", then the name wraps inside the toast and the page does not scroll horizontally. (L2-064)
- **AC-19** Given Pelau House's caterer page at 360 px with the sticky "Send an enquiry" bar visible, when a toast appears with `placement="top"`, then it sits at the top and does not cover "Send an enquiry". (L2-065)

### Motion

- **AC-20** Given `prefers-reduced-motion: reduce`, when a toast enters and leaves, then it appears and disappears without sliding or fading, and the timer bar does not animate. (L2-069)

### Performance

- **AC-21** Given the `Toast` perf-test scenario, when a toast is shown from a button press, then it is painted within 200 ms (Interaction to Next Paint), causes no layout shift on the page, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/toast/`; files
  `toast-region.component.*` (`sh-toast-region`, `ToastRegionComponent`),
  `toast.component.*` (`sh-toast`, `ToastComponent`), `toast-notifier.ts` (the
  `ToastNotifier` contract and its default implementation). Pages depend on the
  contract (AGENTS.md: contracts over concrete implementations).
- The region is rendered once by the app shell, outside any route outlet, so
  toasts survive navigation ("Show message" moves to the thread).
- Styles: the Toast section of `components.css`, the phone dismiss rule
  (`.toast-region .toast .close`) and `fade-out`.
- The dialog and sheet overlay helper excludes `.toast-region` from `inert`
  (see [dialog](dialog.md) D-12).
- Design-system catch-up: add `.toast__title, .toast__text { overflow-wrap: anywhere; }`
  (D-7) and `@media (forced-colors: active) { .toast { border: 1px solid CanvasText; } }` (D-6).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How do pages show a toast?* Through the `ToastNotifier` contract, not by placing `sh-toast`. A live region must exist before content is inserted for screen readers to announce it, so the region lives in the shell and toasts are data.
- **D-3** *Can a toast be shorter than 8 seconds?* No; shorter values are raised to 8000 ms. The design system sets 8 s as the minimum for WCAG 2.2.1.
- **D-4** *Which warnings are persistent?* Only those the consumer marks `persistent` because they are time-critical ("Your session ends in 5 minutes"); danger is always persistent. The rule was unwritten in the mocks; the design system wrote it.
- **D-5** *What happens to toasts while a dialog is open?* The region is excluded from the dialog's `inert`, so a toast raised by a background event is announced and clickable. The dialog's focus trap still holds keyboard focus; dialogs report their own failures in their body alert, so no action toast needs keyboard access while a dialog is open.
- **D-6** *How does a toast stay visible in forced colours?* A `CanvasText` 1 px border; the inverse background is replaced by `Canvas` there. The design system has no forced-colours rule for toasts.
- **D-7** *How do long file names behave?* They wrap anywhere. The admin export file name has no spaces and would otherwise overflow the 24rem toast.
- **D-8** *Is Escape global?* No. It dismisses only the toast that holds focus, so it never closes a toast when the person meant to close a dialog.
