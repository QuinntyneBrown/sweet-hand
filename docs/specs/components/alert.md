# Alert

| Field | Value |
|---|---|
| Selector | `sh-alert` (inline alert, and the page banner with `banner`) |
| Library path | `frontend/projects/components/src/lib/alert/` |
| Status | planned |
| Traces to | L2-023, L2-030, L2-044, L2-048, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-091 |
| Design system | [`alert.html`](../../design-system/components/alert.html) |
| Source mocks | [`notifications/site-banner/info`](../../mocks/notifications/site-banner/info.html), [`notifications/site-banner/success`](../../mocks/notifications/site-banner/success.html), [`notifications/site-banner/warning`](../../mocks/notifications/site-banner/warning.html), [`notifications/site-banner/danger`](../../mocks/notifications/site-banner/danger.html), [`notifications/site-banner/persistent`](../../mocks/notifications/site-banner/persistent.html), [`notifications/profile-banner/warning`](../../mocks/notifications/profile-banner/warning.html), [`notifications/profile-banner/danger`](../../mocks/notifications/profile-banner/danger.html), [`notifications/profile-banner/persistent`](../../mocks/notifications/profile-banner/persistent.html), [`pages/sign-in/error`](../../mocks/pages/sign-in/error.html), [`pages/profile-certificate/expiring`](../../mocks/pages/profile-certificate/expiring.html), [`pages/admin-metrics/partial`](../../mocks/pages/admin-metrics/partial.html), [`pages/caterers/offline`](../../mocks/pages/caterers/offline.html), [`dialogs/suspend-caterer/failed`](../../mocks/dialogs/suspend-caterer/failed.html) |
| Rendering | [`alert.html`](alert.html) |

## Purpose and scope

An alert tells people about a condition that holds right now: Cou-Cou's
certificate expires on Monday 9 November 2026, Auntie Bev's Kitchen is in
review, a sign-in failed on our side, a dialog's save did not go through. It
is a tinted block with a tone icon, a short title, one or two sentences and at
most two actions, and it stays for as long as the condition is true. With
`banner` the same block spans the page under the site header for conditions
about the whole account or service: "Verify your email to send enquiries",
"Some things aren't working right now", "Your profile is suspended and hidden
from customers."

Use a [toast](toast.md) for a result people only need to glimpse ("Reply
sent"), an [inline message](inline-message.md) under a field for one field's
problem (several go in the form's error summary, [form
layout](form-layout.md)), an [empty state](empty-state.md) or [error
page](error-page.md) when content failed to load, and a [dialog](dialog.md)
when a confirmation must be answered.

Out of scope:

- Deciding when a condition holds and when it ends (the page), and
  remembering a dismissal per device (the consumer, D-4).
- The buttons and links in the actions slot: [button](button.md) and
  [link](link.md).
- The form error summary (`.form-summary`): [form layout](form-layout.md).

## Usage

Inventory from `usage_inventory.py docs/mocks alert "div"` (107 alerts across
64 screens) and a read of the banner mocks.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Every form dialog's failed state (44 dialogs: `suspend-caterer`, `enquiry`, `report`, `add-cuisine`…) | danger, inline, `live="assertive"` | "We couldn't suspend Pelau House" / "Nothing has changed. Check your connection and try again; your reason is kept." | failed | dialog body (`--color-bg-surface-raised`) |
| `pages/sign-in/error`, `pages/register/*` error | danger, inline, assertive, title focused after submit | "We couldn't sign you in just now"; actions "Try again" (secondary sm button) + "Keep browsing" (link) | default, busy action | canvas |
| `pages/admin-metrics/partial` | page summary: danger, inline, assertive, one per screen (D-5) | "2 charts didn't load" / "The other figures are up to date." + "Try again" | default | canvas, above the chart grid |
| `pages/admin-metrics/partial`, inside each failed [chart card](bar-chart.md) | danger, inline, `live="off"` (D-5) | "This chart didn't load" / "The other figures are up to date." + "Try again" | default | chart card |
| `pages/profile-certificate/expiring`, `dashboard`, `admin-caterer`, `admin-report`, `account` | warning, inline, polite or none | "Your certificate expires on Monday 9 November 2026"; "Sign-in is paused for this account"; "You've already replied to Priya" | default | canvas |
| `dialogs/retire-cuisine`, `dialogs/decline-enquiry/conflict`, `dialogs/enquiry/unverified` | warning, inline in a dialog | "2 published caterers use Pan-Caribbean"; "Verify your email to send enquiries" + "Resend verification email" | default | dialog body |
| `pages/dashboard/pending`, `profile-*` read-only, `admin-profile-review`, `sign-in` (rate-limit info), `dialogs/suspend-caterer`, `remove-caterer`, `operator-edit` | info (base `.alert`), inline, none or polite | "Your profile is waiting for review", "Name change waiting for review", "Welcome back, Marcia", "One quick check first" | default | canvas, dialog |
| `pages/account`, `pages/admin-report` | success, inline, polite | "Export requested today at 10:14 a.m.", "Resolved at 10:52 a.m. by Leah Mohammed" | default | canvas |
| `notifications/site-banner/*` | `banner`, info (dismissible), success (dismissible), warning (dismissible with action; persistent with action), danger (persistent, assertive) | "Scheduled maintenance", "Email verified", "We can't deliver email to marcia.t@example.com" + "Update email", "Verify your email to send enquiries" + "Resend verification email", "Some things aren't working right now" | default, dismissible, persistent | under the site header |
| `notifications/profile-banner/*` | `banner`, info, success, warning, danger; links in actions | "Your profile is in review.", "Auntie Bev's Kitchen is live." + "View your page", "Changes requested: “Photos 2 and 5 look like stock images…”" + "Go to photos", "Your profile is suspended and hidden from customers." + "Upload a new certificate", "Name change waiting for review." + "See the change" | default, dismissible, persistent | under the dashboard header |
| `pages/caterers/offline`, `pages/caterer/offline`, `pages/inbox/offline` | `banner`, warning, persistent | "You're offline" / "Showing caterers from your last visit. Filters work again when you reconnect." | default | under the site header |

## Anatomy

1. **Container** — `div.alert` with an optional tone modifier and `.banner`.
   Tone background and hairline tone border, `--radius-md` (square and
   bottom-border only as a banner), padding `--space-4`, gap `--space-3`. Carries
   the live role when `live` is set.
2. **Tone icon** — `svg.icon`, `aria-hidden="true"`, `--icon-size-md`, in
   `--alert-icon`; one fixed glyph per tone (circle-i, tick, triangle,
   circle-!).
3. **Body** — `.alert__body`: a column (a wrapping centred row in a banner).
   - **Title** — `.alert__title`, the condition, `--text-label` at
     `--font-size-md`. `<p>` inline, `<span>` in a banner.
   - **Text (optional)** — the default slot: one or two sentences in a `<p>`
     (inline) or `<span>` (banner); may hold `<strong>`, quotes and data.
   - **Actions (optional)** — `.alert__actions` (`<div>` inline, `<span>` in a
     banner): up to two links or link/secondary small buttons in the alert's
     colour.
4. **Dismiss (optional)** — `button.close`, named by `dismissLabel`, 44 × 44
   below 48rem, `--target-min` from 48rem. Never on danger.

Host: `sh-alert` is `display: contents`; classes go on the inner `div.alert`,
so a parent's `.stack` gap and `.dialog__body` rules apply to it directly.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `tone` | `'info' \| 'success' \| 'warning' \| 'danger'` | `'info'` | no | `info` adds no modifier (base `.alert`, canonical); others add `.alert--{tone}` and set the icon. |
| `title` | `string` | — | yes | The condition, one line: "Your certificate expires on Monday 9 November 2026". |
| `banner` | `boolean` | `false` | no | Adds `.banner`; body parts render as `<span>`. At most one banner per screen (consumer rule). |
| `live` | `'assertive' \| 'polite' \| 'off'` | `'off'` | no | `assertive` → `role="alert"` (danger caused by what the person just did, or an incident in progress); `polite` → `role="status"`; `off` → no role (content present on first load that never changes). |
| `dismissible` | `boolean` | `false` | no | Renders the dismiss button. Ignored for `tone="danger"` (D-3). |
| `dismissLabel` | `string \| null` | `null` | yes when `dismissible` | Names what is dismissed: "Dismiss maintenance notice"; bare "Dismiss" only when it is the screen's one dismissible alert. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `dismissed` | `void` | The dismiss button is activated. The component removes itself from the DOM and moves focus to the start of `#main` (`focusAfterDismiss`). The consumer records the dismissal. |

### Methods

| Method | Rule |
|---|---|
| `focusTitle()` | Gives the title `tabindex="-1"` and focuses it. Used after a failed submit ("We couldn't sign you in just now") so the explanation is read first (L2-068). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| default | Phrasing content: text, `<strong>`, quoted reasons, data | The sentence(s) after the title. Wrapped in `<p>` or, in a banner, `<span>`. |
| `actions` | Up to two [links](link.md) or `sh-button` with `variant="link"` (or `variant="secondary"` `size="sm"` for "Try again") | Rendered in `.alert__actions` after the text. Never a primary button. |

- Translation: `title`, `dismissLabel` and slot text come from the resource
  files (L2-064); email addresses, names and quoted operator reasons are data.

## Variants and sizes

| Tone | Modifier | Icon | Use for |
|---|---|---|---|
| Info | — (base `.alert`; `.alert--info` accepted as an alias) | circle-i | Neutral conditions: in review, name change waiting, maintenance. |
| Success | `.alert--success` | tick | Positive standing conditions: "Email verified", "Auntie Bev's Kitchen is live". |
| Warning | `.alert--warning` | triangle | Needs attention soon: expiring certificate, unverified or bouncing email, changes requested, offline. |
| Danger | `.alert--danger` | circle-! | Something failed or is blocked now: failed save, sign-in failure, suspended, incident. Never dismissible. |

| Layout | Modifier | Rule |
|---|---|---|
| Inline | — | Fills its column inside the content it is about. |
| Banner | `.banner` | Full-bleed under the header, square, bottom border only, centred, side padding `--layout-margin`; one row from 48rem when it fits. |

One size. Padding, icon and type are fixed; only the dismiss button and small
action buttons change with the breakpoint (see Responsive).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | Tone tint, border, icon | Announced if `live` is set and the alert was inserted after load |
| With actions | `actions` slot filled | Actions row under the text, wrapping | Links and buttons in reading order |
| Dismissible | `dismissible` (not danger) | Close icon at the end | "Dismiss maintenance notice" button |
| Dismiss hover | `:hover` | 8 % `currentColor` fill | — |
| Dismiss / action focus | `:focus-visible` | Shared `--color-focus-ring` ring, `--focus-ring-offset` out | — |
| Dismissed | dismiss activated | Removed from the DOM | Focus to the start of `#main` |
| Busy action | the action's own `busy` | The [button](button.md)'s busy state; alert unchanged | Button `aria-busy` |
| Title focused | `focusTitle()` | Focus ring on the title | Title read first, then the text |
| Resolved | consumer replaces it on the next page load | A dismissible success banner replaces the warning | — |

## Markup

```html
<!-- rendered: inline danger after a failed submit, assertive, title focused -->
<div class="alert alert--danger" role="alert">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/></svg>
  <div class="alert__body">
    <p class="alert__title" tabindex="-1">We couldn't sign you in just now</p>
    <p>Something went wrong on our side. Your email is still here; try again in a moment. Reference 7f3c2a91.</p>
    <div class="alert__actions"><button class="btn btn--sm" type="button">Try again</button><a href="/caterers">Keep browsing</a></div>
  </div>
</div>
```

```html
<!-- rendered: inline warning, no live role (static content) -->
<div class="alert alert--warning">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/></svg>
  <div class="alert__body">
    <p class="alert__title">Your certificate expires on Monday 9 November 2026</p>
    <p>That's 30 days from today. Add your renewed certificate here to keep your profile published.</p>
  </div>
</div>
```

```html
<!-- rendered: dismissible info banner (maintenance) -->
<div class="alert banner" role="status">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <div class="alert__body">
    <span class="alert__title">Scheduled maintenance</span>
    <span>Sunday 18 October, 1:00–3:00 a.m. Sweet Hand may be unavailable for up to two hours.</span>
  </div>
  <button class="close" type="button" aria-label="Dismiss maintenance notice"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="M6 6l12 12M18 6 6 18"/></svg></button>
</div>
```

```html
<!-- rendered: persistent warning banner with an action (unverified email) -->
<div class="alert alert--warning banner" role="status">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <div class="alert__body">
    <span class="alert__title">Verify your email to send enquiries</span>
    <span>We sent a link to marcia.t@example.com.</span>
    <span class="alert__actions"><button class="btn btn--link btn--sm" type="button">Resend verification email</button></span>
  </div>
</div>
```

```html
<!-- rendered: profile banner quoting the operator's reason (title + text, D-6) -->
<div class="alert alert--warning banner" role="status">
  <svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg>
  <div class="alert__body">
    <span class="alert__title">Changes requested</span>
    <span>“Photos 2 and 5 look like stock images. Please upload photos of your own food.”</span>
    <span class="alert__actions"><a href="/dashboard/photos">Go to photos</a></span>
  </div>
</div>
```

Success differs from warning only by modifier and icon.

```html
<!-- consumer: failed dialog save -->
<sh-alert tone="danger" live="assertive" [title]="t('admin.suspend.failedTitle', { name })">{{ t('admin.suspend.failedText') }}</sh-alert>

<!-- consumer: unverified-email banner -->
<sh-alert banner tone="warning" live="polite" [title]="t('banner.verify.title')">
  {{ t('banner.verify.text', { email }) }}
  <sh-button slot="actions" variant="link" size="sm" [busy]="resending()" (activated)="resend()">{{ t('banner.verify.resend') }}</sh-button>
</sh-alert>
```

The e2e page objects locate alerts by `.alert`, tone modifier and
`.alert__title` text; actions and dismiss by role and name.

## Design

- Padding `--space-4`; gap `--space-3`; body gap `--space-1`; actions gap
  `--space-3` with `--space-1` above. Banner: side padding `--layout-margin`,
  body row gap `--space-4`.
- Title `--text-label` at `--font-size-md`; text `--text-body`; actions
  `--text-label`, inheriting the alert's colour.
- Icon `--icon-size-md`, `--alert-icon`.
- Shape `--radius-md` and `--border-width-hairline` in `--alert-border`;
  banner square, bottom border only.
- Elevation none. Motion none: alerts appear and disappear without animation;
  the dismiss hover is a colour change.
- Banners are never sticky.

Component tokens (declared on `.alert`, overridden per tone):

| Token | Info aliases | Success | Warning | Danger |
|---|---|---|---|---|
| `--alert-bg` | `--color-info-bg` | `--color-success-bg` | `--color-warning-bg` | `--color-danger-bg` |
| `--alert-fg` | `--color-info-fg` | `--color-success-fg` | `--color-warning-fg` | `--color-danger-fg` |
| `--alert-border` | `--color-info-border` | `--color-success-border` | `--color-warning-border` | `--color-danger-border` |
| `--alert-icon` | `--color-info-icon` | `--color-success-icon` | `--color-warning-icon` | `--color-danger-icon` |

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Info background / text | `--color-info-bg` / `--color-info-fg` | `--palette-stone-50` / `--palette-stone-800` | `--palette-stone-900` / `--palette-stone-200` |
| Info icon / border | `--color-info-icon` / `--color-info-border` | `--palette-stone-700` / `--palette-stone-300` | `--palette-stone-350` / `--palette-stone-700` |
| Success background / text | `--color-success-bg` / `--color-success-fg` | `--palette-callaloo-50` / `--palette-callaloo-700` | `--palette-callaloo-950` / `--palette-callaloo-300` |
| Success icon | `--color-success-icon` | `--palette-callaloo-500` | `--palette-callaloo-300` |
| Warning background / text | `--color-warning-bg` / `--color-warning-fg` | `--palette-mango-50` / `--palette-mango-700` | `--palette-mango-950` / `--palette-mango-300` |
| Warning icon | `--color-warning-icon` | `--palette-mango-500` | `--palette-mango-300` |
| Danger background / text | `--color-danger-bg` / `--color-danger-fg` | `--palette-sorrel-50` / `--palette-sorrel-600` | `--palette-sorrel-950` / `--palette-sorrel-300` |
| Danger icon | `--color-danger-icon` | `--palette-sorrel-500` | `--palette-sorrel-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-info-fg` | `--color-info-bg` | 4.5:1 | Info text and actions |
| `--color-info-icon` | `--color-info-bg` | 3:1 | Info icon |
| `--color-success-fg` | `--color-success-bg` | 4.5:1 | Success text |
| `--color-success-icon` | `--color-success-bg` | 3:1 | Success icon |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Warning text |
| `--color-warning-icon` | `--color-warning-bg` | 3:1 | Warning icon |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Danger text |
| `--color-danger-icon` | `--color-danger-bg` | 3:1 | Danger icon |
| `--color-focus-ring` | `--color-info-bg`, `--color-success-bg`, `--color-warning-bg`, `--color-danger-bg` | 3:1 | Focus ring over each tint |
| `--color-info-border` | `--color-bg-surface` | 1:1 | Border (decorative, exempt) |

Pepper never appears in an alert. The tone is also carried by the icon shape
and the words (L2-069.5). Forced colours: the border becomes `CanvasText` and
icons `CanvasText`, so the block stays outlined.

## Responsive behaviour

| Range | Behaviour |
|---|---|
| All | Inline alerts fill their column; text wraps (`overflow-wrap: anywhere` for addresses), never truncates; actions wrap under the text. |
| Below 48rem | Banner title, text and actions stack as wrapped lines. The dismiss button is 44 × 44 (`--target-comfortable`; the banner close pulls into the corner with a negative margin) and `.btn--sm` actions grow to 44 px. |
| From 48rem | Banner body is one centred row when it fits; dismiss `--target-min` (24 px), small buttons 36 px, at least 8 px apart. |
| From 62rem | In the dashboard and console, inline alerts sit in the main column, never across the side navigation; the profile banner spans above both. |

Banners scroll away with the page, so they never cover a focused field and
never stack with the sticky enquiry bar.

## Accessibility

### Role and pattern

A `div` with an optional live role ([APG
Alert](https://www.w3.org/WAI/ARIA/apg/patterns/alert/)): `role="alert"` for
assertive danger, at most one per screen; `role="status"` for anything that
appears or changes while the page is open; no role for static content. The
live container must be in the DOM before its text is inserted: when an alert
appears after load, the component renders the container first and fills it in
the next frame (D-2).

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Through the actions, then the dismiss button. The container is not focusable. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | Activates the focused action or dismisses. |
| <kbd>Esc</kbd> | No effect; alerts are not modal. |

### Focus

- Alerts never take focus on appearing, except through `focusTitle()` after a
  failed form submit.
- After dismissing, focus moves to the start of `#main` (never the top of the
  document).

### Labelling

- Icons are `aria-hidden`; the title words carry the tone ("Your profile is
  suspended"), never colour alone.
- Dismiss names what it dismisses ("Dismiss maintenance notice").

### Announcements

The title then the text, once, when an alert with `live` appears or its text
changes. Static alerts (`live="off"`) are read in document order.

### Motion

None.

## Content and internationalisation

- Title states the condition, not the category: "Your certificate expires on
  Monday 9 November 2026", not "Warning". No "Error:" or "Note:" prefix.
- Text says what it means and what happens next in one or two sentences;
  reassure when nothing is lost ("Nothing you send is lost."); say honestly
  whose fault it is ("Something went wrong on our side.").
- Quote the operator's reason verbatim in curly quotes in "Changes requested"
  banners.
- Actions are verb phrases naming the destination: "Upload a new certificate",
  "Go to photos", "Resend verification email". Never "Click here".
- Dates in full on detail screens ("Monday 9 November 2026"), short in banners
  ("Sunday 18 October, 1:00–3:00 a.m."), Toronto time.
- French runs about 30 % longer; banners wrap onto more lines.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (modifier classes, role,
  icon, element names for banner or inline) are computed once, not in the
  template.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Alert.ts`
  renders the four profile banners for Pelau House and Auntie Bev's Kitchen and
  the sign-in danger alert with "Try again"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Dashboard`, `SignIn`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: banners are rendered with the page (server-side), never
  slid in, so nothing shifts after load (L2-085 CLS).
- Weight: no dependencies beyond the framework.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia's unverified account, when she submits an enquiry to Pelau House, then a warning alert titled "Verify your email to send enquiries" appears with a "Resend verification email" control in `.alert__actions`. (L2-023)
- **AC-2** Given Marcia's email bounced permanently, when she next signs in, then a warning banner `div.alert.alert--warning.banner` titled "We can't deliver email to marcia.t@example.com" appears under the site header with the action "Update email". (L2-030)
- **AC-3** Given Pelau House's pending name change to "Pelau House by Kendra", when Kendra opens her dashboard, then an info banner (base `.alert`, no tone modifier) titled "Name change waiting for review" shows with the link "See the change". (L2-044)
- **AC-4** Given Tomas Reyes requested changes to Auntie Bev's Kitchen with "Photos 2 and 5 look like stock images. Please upload photos of your own food.", when Beverley opens her profile editor, then a warning banner titled "Changes requested" quotes that reason verbatim in curly quotes and links "Go to photos". (L2-048)
- **AC-5** Given Flying Fish Kitchen is suspended, when Sharon Best opens her profile editor, then a danger banner "Your profile is suspended and hidden from customers." shows the reason, has no dismiss button even if `dismissible` is set, and links "Upload a new certificate". (L2-044)
- **AC-6** Given the mail service is degraded, when any page renders, then a persistent danger banner with `role="alert"` reads "Some things aren't working right now" / "New messages may take a few minutes to appear. Nothing you send is lost." and has no dismiss button. (L2-091)
- **AC-7** Given any alert, when it renders, then its icon has `aria-hidden="true"`, and its tone is stated in the title's words as well as by colour. (L2-069)

### States

- **AC-8** Given a failed sign-in for marcia.t@example.com, when the danger alert appears and `focusTitle()` is called, then the alert has `role="alert"`, its title has `tabindex="-1"` and focus, and the screen reader reads "We couldn't sign you in just now" first. (L2-068)
- **AC-9** Given the dismissible maintenance banner with `dismissLabel` "Dismiss maintenance notice", when Marcia activates it, then `dismissed` is emitted, the banner is removed from the DOM, and focus is at the start of `#main`. (L2-067)
- **AC-10** Given the metrics page where two charts failed, when it renders, then exactly one `role="alert"` alert titled "2 charts didn't load" appears with "Try again", and each failed chart card's alert "This chart didn't load" has no live role. (L2-066)
- **AC-11** Given the "Resend verification email" action is busy, when the request is pending, then the button shows its busy state and the banner's title, text and live role are unchanged. (L2-023)
- **AC-12** Given an alert inserted after page load with `live="polite"`, when it appears, then "Export requested today at 10:14 a.m." is announced once without moving focus. (L2-068)

### Keyboard and focus

- **AC-13** Given the "We can't deliver email" banner, when Marcia tabs through it, then focus reaches "Update email" and then "Dismiss", the container itself is never focused, and Escape does nothing. (L2-067)
- **AC-14** Given each tone in each theme, when an action or the dismiss button inside it has keyboard focus, then the focus ring has at least 3:1 contrast against the alert's tint. (L2-067)
- **AC-15** Given axe-core with WCAG 2.1 A and AA rules, when it runs on the sign-in error page and the four site banners at 360 and 1280 px, then it reports 0 violations. (L2-066)

### Theming

- **AC-16** Given each of the four tones in the light and the dark theme, when the alert renders, then the title and text meet 4.5:1 and the icon meets 3:1 against `--alert-bg`. (L2-069)
- **AC-17** Given the dark theme, when the danger alert "We couldn't suspend Pelau House" renders in the dialog body, then its background resolves to `--palette-sorrel-950` and its text to `--palette-sorrel-300`. (L2-069)

### Responsive

- **AC-18** Given a 360 px viewport, when the dismissible "We can't deliver email to marcia.t@example.com" banner renders, then the dismiss button and "Update email" are each at least 44 × 44 CSS px, and the email address wraps instead of overflowing. (L2-065)
- **AC-19** Given a 320 px viewport, when the "Changes requested" banner renders with its quoted reason, then title, text and action wrap onto separate lines and the page does not scroll horizontally. (L2-064)
- **AC-20** Given a 1280 px window, when the maintenance banner renders, then title, text and dismiss sit on one centred row and the dismiss button is 24 CSS px. (L2-065)

## Implementation notes

- Folder `frontend/projects/components/src/lib/alert/`; `alert.component.*`,
  selector `sh-alert`, class `AlertComponent`.
- Composes nothing itself; the `actions` slot hosts [button](button.md) and
  [link](link.md). Composed by [dialog](dialog.md) (failed, conflict),
  [form layout](form-layout.md), pages and the shell (banners).
- Styles: the Alert and banner section of `components.css` with the phone
  dismiss rule.
- Design-system catch-up: the profile-banner mocks wrote `<p><strong>`;
  the component always renders `.alert__title` (D-6). The four
  `--color-focus-ring` over tone-tint pairs are already in
  `tokens/contrast-pairs.json`; the design-system page's note asking for them
  is out of date.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *How is a late-appearing live alert announced reliably?* The component renders the container with its role first and inserts the title and text in the next frame, as the design system requires ("the live region must exist before its text is inserted").
- **D-3** *Can a danger alert be dismissed?* No; `dismissible` is ignored for danger. A condition that still holds must not lose its only way back (design system, Do and don't).
- **D-4** *Who remembers a dismissed banner?* The consumer, per device and per condition (a maintenance notice returns on the day). The component only emits `dismissed`; how long a condition lasts is page knowledge.
- **D-5** *What if several parts fail at once?* The consumer renders one assertive danger alert that summarises them ("2 charts didn't load"). Two assertive alerts interrupt each other; the metrics partial mock had two and the design system fixed it. Each failed part may still show its own alert ("This chart didn't load") with `live="off"`, so it is seen in place but not announced (D-8).
- **D-6** *How are profile-banner titles marked up?* As `.alert__title` with the rest in the text slot ("Changes requested" then the quoted reason). The profile-banner mocks used `<p><strong>`; the design system unified them.
- **D-7** *Which live role does each mock alert get?* Dialog failures, sign-in failures and the incident banner: `assertive`. Every banner and any alert that appears after load: `polite`. Inline alerts present on first load that never change (expiring certificate, in review): `off`. The mocks set roles inconsistently (46 `alert`, 18 info alerts with none); this follows the design system's rule.
- **D-8** *Do the failed chart cards keep their own alerts?* Yes, with no live role, aligned with [bar chart](bar-chart.md) D-10: each failed card shows "This chart didn't load" (`live="off"`) and the page has the one assertive summary "2 charts didn't load" (D-5).
