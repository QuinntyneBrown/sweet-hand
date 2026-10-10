# Link

| Field | Value |
|---|---|
| Selector | `sh-link` (inline, standalone or external `<a href>`), `sh-back-link` (the `.eyebrow` back link) |
| Library path | `frontend/projects/components/src/lib/link/` |
| Status | planned |
| Traces to | L2-018, L2-036, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-070, L2-085 |
| Design system | [`link.html`](../../design-system/components/link.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html), [`pages/two-factor/default`](../../mocks/pages/two-factor/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/profile-details/invalid`](../../mocks/pages/profile-details/invalid.html), [`pages/account/default`](../../mocks/pages/account/default.html), [`pages/privacy/default`](../../mocks/pages/privacy/default.html), [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html), [`pages/admin-queue/error`](../../mocks/pages/admin-queue/error.html), [`notifications/profile-banner/warning`](../../mocks/notifications/profile-banner/warning.html), [`pages/caterers/default`](../../mocks/pages/caterers/default.html) |
| Rendering | [`link.html`](link.html) |

## Purpose and scope

A link takes people somewhere: to a caterer, the privacy notice, a field with
an error, the page above this one. Sweet Hand links are ink and underlined and
turn pepper on hover. `sh-link` draws the three text links — **inline** inside
a sentence ("Read the privacy notice"), **standalone** on its own line with a
44 px target ("Forgot your password?", "All enquiries", "View caterer") and
**external** when it leaves Sweet Hand ("Office of the Privacy Commissioner of
Canada"). `sh-back-link` draws the quiet chevron link above a page title
("Caterers", "Review queue", "Dashboard", "Inbox").

Use something else when activating it changes something (sends, saves,
removes, opens a dialog): a [button](button.md), even one that looks like a
link (`.btn--link`, "Clear filters"). A link that looks like a button
("Browse caterers") is `sh-button-anchor` from [button](button.md). Lists of
destinations with a current-page style are the [site header](site-header.md),
[side nav](side-nav.md), [filter list](filter-list.md), [button
group](button-group.md) (segmented) and [pagination](pagination.md); the icon
link in the phone header is [icon button](icon-button.md).

Out of scope:

- The tone of links inside an [alert](alert.md), the error summary
  ([form layout](form-layout.md)) and the [footer](footer.md): those
  containers set `color: inherit` and their own hover; the link renders a plain
  `<a>` and keeps its underline (D-5).
- Moving focus to a field from an error-summary link: native fragment
  navigation does it; the summary owns the list.
- Routing: the consumer may intercept `followed` for client-side navigation.

## Usage

Inventory from `usage_inventory.py docs/mocks eyebrow "a"` (157 back links)
and a search of every `<a href` without a component class in `docs/mocks/`
(mock-bar links excluded).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/caterer/*` | back link, every width | "Caterers" | default, hover, focus | canvas |
| Operator records (`admin-caterer`, `admin-profile-review`, `admin-report` … 26 screens) | back link, every width | "Review queue" | default | canvas |
| Caterer editor pages (43 screens) | back link, `untilLg` | "Dashboard" | default | canvas |
| `pages/thread/*`, `pages/dashboard-enquiry/*` (34 screens) | back link, `untilLg` | "Back to inbox", "Back to enquiries" in the mocks; "Inbox", "Enquiries" required (D-3) | default | canvas |
| Operator console pages (21) | back link, `untilLg` | "Overview" | default | canvas |
| `pages/occasion` | back link | "Occasions" | default | canvas |
| `pages/sign-in/*` | standalone (bare `<a>` in the mocks, D-4) | "Forgot your password?", "Create an account", "list your business" (inline) | default | canvas |
| `pages/two-factor/*` | standalone in a status line | "Not you?" | default | canvas |
| `pages/dashboard/default`, `name-pending` | standalone beside a section heading, trailing chevron | "All enquiries", "View your page", "See the change" | default | canvas |
| `pages/thread/*` | standalone in `.thread__status` | "View caterer" | default | canvas |
| `pages/admin-caterer/*`, `dialogs/suspend-caterer` | standalone in a `.cluster` | "Public page", "Review the name change", "Audit log" | default | canvas |
| `pages/account/*`, `pages/register/*` | inline in a sentence | "Read the privacy notice", "privacy notice", "caterer terms", "try a different email" | default | canvas |
| `pages/privacy/default`, `dialogs/delete-account/failed` | inline, `mailto:` | "privacy@sweethand.example", "hello@sweethand.example" | default | canvas, prose |
| `pages/privacy/default` | external, standalone | "Office of the Privacy Commissioner of Canada" (named, not linked, in the mock; D-6) | default | prose |
| `notifications/profile-banner/warning`, `dashboard/changes-requested` | inline in `.alert__actions` (tone inherited) | "Go to photos" | default | warning alert |
| `pages/admin-queue/error`, `admin-profile-review/error`, `dashboard-enquiries/error`, `notifications/dashboard-toast/danger` | inline in `.alert__actions` | "Retry", "Back to review queue", "Go to recent changes" | default | danger alert, toast |
| Error summaries (`profile-details/invalid`, `register/invalid`, `reset-password/invalid` …) | inline, `href="#field-id"` | "Enter a business name of 2 to 80 characters", "Write at least 50 characters (35 so far)" | default | danger summary |
| Site footer (every page) | inline in `.site-footer` | "About", "Cater with us", "Privacy", "Terms" | default, current page | canvas footer |

## Anatomy

1. **Anchor** — a native `<a href>`, always with an `href`. Inline: no class.
   Standalone: `.link--standalone` (`inline-flex`, centred, `--space-1` gap,
   min-height `--target-comfortable`, `--text-label` at `--font-size-md`).
   External adds `.link--external`.
2. **Label** — the projected text; says where it goes; is the accessible name.
3. **Underline** — `text-decoration: underline`, `--border-width-hairline`
   thick at 0.15em offset; `--border-width-thick` on hover.
4. **Hidden suffix (external)** — `span.visually-hidden` " (another website)"
   after the label.
5. **Icon (optional)** — trailing `svg.icon` (`.icon--sm` chevron for "All
   enquiries"; the external arrow at 0.9em), `aria-hidden="true"`.
6. **Back link** — `a.eyebrow`: leading `svg.icon.icon--sm` left chevron, then
   the destination name; `--text-body-sm` in `--color-fg-muted`, no underline
   until hover, min-height `--target-comfortable`; `.until-lg` hides it from
   62rem.

Host: `sh-link` is `display: contents` so an inline link flows inside its
sentence and parent rules (`.alert__actions a`, `.form-summary a`,
`.site-footer a`) style the real `<a>`. `sh-back-link` is `display: contents`
as well.

## API

### `sh-link` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `href` | `string` | — | yes | Rendered on the `<a>`. Paths, fragments (`#business-name`) and `mailto:` addresses are allowed. |
| `variant` | `'inline' \| 'standalone'` | `'inline'` | no | `standalone` adds `.link--standalone`. A link alone on its line is standalone (D-4). |
| `external` | `boolean` | `false` | no | Adds `.link--external` (and implies `standalone` unless `variant` is set), the hidden suffix and the trailing arrow icon. Never opens a new tab (D-7). |
| `externalLabel` | `string` | — | yes when `external` | The hidden suffix text, " (another website)", from the resource files. |
| `current` | `boolean` | `false` | no | Renders `aria-current="page"`; used only by containers that mark the current page (footer). The link itself adds no style. |

### `sh-back-link` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `href` | `string` | — | yes | The destination page. |
| `untilLg` | `boolean` | `false` | no | Adds `.until-lg` (hidden from 62rem, where the side nav or list column gives the same route). |

### Outputs

| Output | Selector | Payload | Emitted when |
|---|---|---|---|
| `followed` | both | `MouseEvent` | The link is activated by click, tap or <kbd>Enter</kbd>. Navigation follows unless the consumer calls `preventDefault()` (client-side routing); modified clicks (Ctrl, Cmd, Shift, middle button) are never intercepted. |

### Content slots

| Slot | Selector | Accepts | Rule |
|---|---|---|---|
| default | both | Text | The label; the destination's name. No `title`, no `aria-label` (D-8). |
| `[slot=icon]` | `sh-link` | One `svg.icon` | Trailing icon for standalone links ("All enquiries" chevron). Ignored when `external` (the arrow is built in). |

- Translation: labels and `externalLabel` come from the resource files
  (L2-064.4); the component contains no words. The back link's chevron is
  drawn by the component.

## Variants and sizes

| Variant | Class | Use for |
|---|---|---|
| Inline | — (bare `a`) | Inside a sentence: "I agree to the privacy notice", email addresses, error-summary items, alert actions, footer links. |
| Standalone | `.link--standalone` | On its own line or beside a heading: "Forgot your password?", "All enquiries", "View caterer", "Public page". |
| External | `.link--standalone.link--external` | Leaves Sweet Hand: "Office of the Privacy Commissioner of Canada". |
| Back link | `.eyebrow` | Above a page title, naming the page above: "Caterers", "Review queue", "Dashboard", "Inbox". |

Sizes: inline links take their sentence's text style (`--text-body` in forms,
`--text-prose` on the about, privacy and terms pages, `--text-body-sm` in help
and status lines). Standalone links use `--text-label` at `--font-size-md`;
back links `--text-body-sm`. Every standalone and back link is at least 44 px
tall whatever its text size.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Default | — | `--color-fg-link`, hairline underline (back link: `--color-fg-muted`, no underline) | Link role, name from the text |
| Hover | `:hover` | `--color-fg-link-hover` and `--border-width-thick` underline (back link: `--color-fg-default`, underlined) | — |
| Focus | `:focus-visible` | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out, `--radius-sm` corners; wraps the 44 px box on standalone and back links | Focused |
| Visited | `:visited` | No change (D-2) | — |
| Active | `:active` | No separate look; navigation follows | — |
| In a toned container | inside `.alert__actions`, `.form-summary`, `.site-footer` | Container's colour; underline kept (footer: none until hover) | — |
| Current page | `current` → `aria-current="page"` | Only where the container styles it (footer: `--color-fg-default`, medium weight) | "Current page" |
| Disabled | — | Does not exist: a link that cannot go anywhere is plain text (D-9) | — |

`data-state="hover|focus|visited"` in the design system is for documentation
only; the component never renders it.

## Markup

```html
<!-- rendered: inline -->
<p>Privacy notice version 1.0, accepted Thu 1 Oct. <a href="/privacy">Read the privacy notice</a></p>
<p>Write to <a href="mailto:privacy@sweethand.example">privacy@sweethand.example</a>.</p>
```

```html
<!-- rendered: standalone, with and without a trailing icon -->
<p><a class="link--standalone" href="/forgot-password">Forgot your password?</a></p>
<a class="link--standalone" href="/dashboard/enquiries">All enquiries<svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="m9 18 6-6-6-6"/></svg></a>
```

```html
<!-- rendered: external -->
<a class="link--standalone link--external" href="https://www.priv.gc.ca/">Office of the Privacy Commissioner of Canada<span class="visually-hidden"> (another website)</span><svg class="icon" aria-hidden="true" viewBox="0 0 24 24"><path d="M14 5h5v5M19 5l-8 8M17 14v5H5V7h5"/></svg></a>
```

```html
<!-- rendered: back links -->
<a class="eyebrow" href="/caterers"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>Caterers</a>
<a class="eyebrow until-lg" href="/inbox"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>Inbox</a>
```

```html
<!-- rendered: error-summary item (inside .form-summary) -->
<li><a href="#business-name">Enter a business name of 2 to 80 characters</a></li>
```

```html
<!-- consumer -->
<sh-back-link href="/inbox" untilLg>{{ t('nav.inbox') }}</sh-back-link>
<sh-link variant="standalone" href="/forgot-password">{{ t('signIn.forgot') }}</sh-link>
<sh-link external href="https://www.priv.gc.ca/" [externalLabel]="t('common.anotherWebsite')">{{ t('privacy.opc') }}</sh-link>
```

The classes, `href`, the hidden suffix and `aria-hidden` icons are the
contract; icon path data is free to change.

## Design

- Underline `text-underline-offset: 0.15em`, thickness `--border-width-hairline`,
  hover `--border-width-thick`.
- Standalone: `inline-flex`, `align-items: center`, gap `--space-1`,
  min-height `--target-comfortable`, `--text-label`, `--font-size-md`.
- External icon 0.9em square; back-link icon `.icon--sm`.
- Back link: `--text-body-sm`, `--color-fg-muted`, gap `--space-1`,
  min-height `--target-comfortable`.
- Focus ring `--focus-ring-width`, `--focus-ring-offset`, `--radius-sm`.
- Motion: none; hover changes colour and underline instantly. In-page
  fragment scrolling is smooth only without `prefers-reduced-motion`.
- No component tokens; a theme re-skins links through `--color-fg-link` and
  `--color-fg-link-hover` only.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Link | `--color-fg-link` | `--palette-stone-950` | `--palette-stone-100` |
| Link, hover | `--color-fg-link-hover` | `--palette-pepper-600` | `--palette-pepper-300` |
| Back link | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Back link, hover | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Link in a warning alert | `--color-warning-fg` | `--palette-mango-700` | `--palette-mango-300` |
| Link in the error summary | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-link` | `--color-bg-canvas` | 4.5:1 | Link |
| `--color-fg-link-hover` | `--color-bg-canvas` | 4.5:1 | Link, hover |
| `--color-fg-link-hover` | `--color-bg-surface` | 4.5:1 | Link, hover on a surface |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Back link, footer link |
| `--color-warning-fg` | `--color-warning-bg` | 4.5:1 | Link in a warning banner |
| `--color-danger-fg` | `--color-danger-bg` | 4.5:1 | Link in the error summary |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

Inline links are ink like their sentence, so the underline, not colour,
identifies them (WCAG 1.4.1; L2-069.5): it is never removed in running text.
Forced colours: links take `LinkText` from the browser; the underline stays.

## Responsive behaviour

- Inline links wrap with their sentence. Long unbroken strings (email
  addresses such as kendra@pelauhouse.example) wrap through
  `overflow-wrap: anywhere` on the container; the link adds nothing.
- Back links with `untilLg` show below 62rem only; without it they show at
  every width.
- Standalone links beside a heading wrap under it when space runs out and
  keep their 44 px height.
- At 320 px nothing scrolls horizontally; at 200 % zoom every link stays
  readable and usable.

## Accessibility

### Role and pattern

A native `<a href>` ([APG Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/)).
Never a `span` with a click handler, never an `<a>` without `href`, never
`role="button"`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Moves to and from the link in DOM order. |
| <kbd>Enter</kbd> | Follows the link. <kbd>Space</kbd> scrolls the page. |
| Browser shortcuts | Open in a new tab, copy the address: work because it is a real link. |

### Focus

- The ring shows on `:focus-visible` only; on standalone and back links it
  wraps the whole 44 px box.
- An error-summary link with `href="#business-name"` moves focus to that field,
  so its label and error are read next.

### Labelling

- The link text is the name and makes sense alone (WCAG 2.4.4): "Read the
  privacy notice", "Go to photos", "Review the name change".
- External links add the hidden " (another website)".
- No `title`, no `aria-label` that differs from the visible words.
- The back link's name is the destination ("Inbox"); its chevron is hidden.

### Announcements

None.

### Motion

None; `scroll-behavior` falls back to `auto` under reduced motion.

## Content and internationalisation

- Say where it goes, in sentence case: "Read the privacy notice", "Go to
  photos", "View your page", "Upload a new certificate". Never "Click here",
  "Learn more" or a bare URL.
- Error-summary links repeat the field's error exactly.
- Back links name the destination only: "Caterers", "Dashboard", "Inbox", not
  "Back to inbox" (D-3).
- Questions are fine when they are the task: "Forgot your password?", "Not
  you?".
- Name external organisations in full the first time.
- Translatable: the label, `externalLabel`. Data: email addresses, caterer
  names inside labels. French runs about 30 % longer; links wrap with their
  sentence.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); the class list is computed once per input
  change, not in the template.
- No timers or global listeners; one click listener for `followed`.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Link.ts`
  renders the privacy notice page's prose (inline links, two `mailto:`
  addresses, the external link to the Office of the Privacy Commissioner of
  Canada) plus Pelau House's back link "Caterers"; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CatererPage`, `Thread`, `SignIn`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the hover underline thickens within the text box; nothing
  shifts.
- Weight: no dependencies beyond the framework (and its router, if the
  consumer intercepts `followed`).

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia's account page, when "Read the privacy notice" renders through `sh-link` inline with `href="/privacy"`, then it is a bare `<a href="/privacy">` in `--color-fg-link` with a `--border-width-hairline` underline. (L2-070)
- **AC-2** Given the sign-in page, when "Forgot your password?" renders with `variant="standalone"`, then it has class `link--standalone`, a box at least 44 CSS px tall, and the label "Forgot your password?". (L2-065)
- **AC-3** Given the privacy notice, when the external link to "Office of the Privacy Commissioner of Canada" renders, then it has classes `link--standalone link--external`, no `target` attribute, a trailing arrow with `aria-hidden="true"`, and its accessible name is "Office of the Privacy Commissioner of Canada (another website)". (L2-068)
- **AC-4** Given Pelau House's caterer page at any width, when `sh-back-link` renders with `href="/caterers"`, then it is `<a class="eyebrow" href="/caterers">` with a left chevron that has `aria-hidden="true"`, its name is "Caterers", and following it opens the listing. (L2-018)
- **AC-5** Given Marcia's thread with Pelau House at 360 px, when the back link renders with `untilLg`, then it reads "Inbox", has classes `eyebrow until-lg`, and following it shows the inbox list. (L2-036)
- **AC-6** Given the same thread at 1280 px, when the page renders, then the back link is not displayed and the inbox list column is visible beside the thread. (L2-036)
- **AC-7** Given Kendra's profile details with two errors, when the error summary's "Enter a business name of 2 to 80 characters" link with `href="#business-name"` is activated, then focus moves to the business name field. (L2-068)
- **AC-8** Given the site footer on the listing, when its "Privacy" link renders, then it is a plain `<a>` to the privacy notice that takes the footer's muted colour through `color: inherit` and underlines on hover. (L2-070)
- **AC-9** Given Kendra's dashboard, when "All enquiries" renders as a standalone link with a chevron in `[slot=icon]`, then the chevron follows the label, has `aria-hidden="true"`, and the accessible name is exactly "All enquiries". (L2-068)

### States

- **AC-10** Given an inline link in the light theme, when it is hovered, then its colour becomes `--color-fg-link-hover` with at least 4.5:1 contrast against the canvas and the underline thickens to `--border-width-thick`. (L2-069)
- **AC-11** Given the "Caterers" back link, when it renders at rest and on hover, then it is `--color-fg-muted` without underline and then `--color-fg-default` underlined, each at least 4.5:1 against the canvas. (L2-069)
- **AC-12** Given an inline link inside a sentence of `--color-fg-default` text, when the page renders, then the link carries an underline, so it is distinguishable without colour. (L2-069)
- **AC-13** Given a visited "Read the privacy notice", when the account page renders again, then its colour is still `--color-fg-link`. (L2-069)
- **AC-14** Given "Go to photos" inside the changes-requested warning banner, when it renders, then it inherits `--color-warning-fg`, keeps its underline, and has at least 4.5:1 contrast against `--color-warning-bg`. (L2-069)

### Keyboard and focus

- **AC-15** Given focus on "View caterer" in Marcia's thread, when she presses Enter, then `followed` is emitted once and Pelau House's page opens; when she presses Space, then nothing is followed. (L2-067)
- **AC-16** Given a standalone or back link, when it receives keyboard focus, then a `--color-focus-ring` ring of at least 3:1 wraps its whole 44 px box, and a mouse click shows no ring. (L2-067)
- **AC-17** Given the account, sign-in and privacy pages, when axe-core runs, then it reports 0 violations for every link, and no link has an empty `href`, a `title` or an `aria-label`. (L2-066)

### Theming

- **AC-18** Given the dark theme, when an inline link renders, then it resolves to `--palette-stone-100` and on hover to `--palette-pepper-300`, each at least 4.5:1 against the canvas. (L2-069)

### Responsive

- **AC-19** Given a 320 px viewport, when the privacy notice renders "privacy@sweethand.example" and the external link, then they wrap within the column with no horizontal scrolling. (L2-064)
- **AC-20** Given Kendra's dashboard at 360 px, when the editor page's back link "Dashboard" renders, then it is at least 44 CSS px tall. (L2-045)
- **AC-21** Given a 1280 px window at 200 % zoom, when the sign-in page renders, then "Forgot your password?" and "Create an account" are visible and operable with no horizontal scrolling. (L2-069)

### Performance

- **AC-22** Given the `Link` perf-test scenario on the privacy notice, when it renders, then it adds no layout shift (CLS contribution 0), and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/link/`; files
  `link.component.*` (selector `sh-link`, `LinkComponent`) and
  `back-link.component.*` (selector `sh-back-link`, `BackLinkComponent`).
- Styles: the base `a` rule, `.link--standalone`, `.link--external` and
  `.eyebrow` from `components.css`. The base `a` rule stays global (it styles
  prose links rendered from content too); the component adds nothing that
  would fight `.alert__actions a`, `.form-summary a` or `.site-footer a`.
- Mock drift to drop when building: bare `<a>` standalone links ("Forgot your
  password?", "All enquiries", "View caterer", "Public page", "Not you?")
  become `.link--standalone` (D-4); "Back to inbox" and "Back to enquiries"
  become "Inbox" and "Enquiries" (D-3).
- Composes nothing. Composed by [alert](alert.md), [form layout](form-layout.md)
  (error summary), [footer](footer.md), [dialog](dialog.md) bodies and most pages.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Are visited links styled?* No (design system, States): the ink look stays, and pages that need "seen" use real state such as the inbox's unread dot.
- **D-3** *Does the thread's back link say "Back to inbox"?* No, it says "Inbox". The design system names the destination only (117 mocks do; 28 say "Back to …"), because the chevron already says "back". L2-036.2 asks for a "Back to inbox" control; this CRD reads that as the control's purpose, not its label, and raises the wording with the user as a conflict.
- **D-4** *When is a link standalone?* Whenever it is alone on its line or beside a heading, so it gets the 44 px target the mocks' bare links lacked (design system, Do and don't).
- **D-5** *Does the link handle tone inheritance itself?* No. The alert, error summary and footer set `color: inherit` on their links; a plain `<a>` keeps the underline and wording, which is all the link must guarantee.
- **D-6** *Is the external variant needed when no mock links out?* Yes. The privacy notice names the Office of the Privacy Commissioner of Canada without linking it; the design system documents the external link as the fix, and the API must be ready for it.
- **D-7** *Do external links open a new tab?* No. Sweet Hand does not open new tabs; there is no `target` input, so "(opens in a new tab)" is never needed.
- **D-8** *Can a link take an `aria-label`?* No; the design system forbids names that differ from the visible words, so there is no input for it.
- **D-9** *Is there a disabled link?* No. A destination that is not available is rendered as plain text by the consumer.
