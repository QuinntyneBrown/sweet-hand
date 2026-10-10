# Footer

| Field | Value |
|---|---|
| Selector | `sh-footer` (renders `<footer class="site-footer">`) |
| Library path | `frontend/projects/components/src/lib/footer/` |
| Status | planned |
| Traces to | L2-037, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-070, L2-085, L2-091 |
| Design system | [`footer.html`](../../design-system/components/footer.html) |
| Source mocks | [`pages/caterers/default`](../../mocks/pages/caterers/default.html), [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/about/default`](../../mocks/pages/about/default.html), [`pages/privacy/default`](../../mocks/pages/privacy/default.html), [`pages/dashboard/default`](../../mocks/pages/dashboard/default.html), [`pages/admin-queue/default`](../../mocks/pages/admin-queue/default.html), [`pages/server-error/default`](../../mocks/pages/server-error/default.html), [`pages/sign-in/default`](../../mocks/pages/sign-in/default.html) |
| Rendering | [`footer.html`](footer.html) |

## Purpose and scope

Every Sweet Hand page ends with the footer, system pages included: the
"Sweet Hand" wordmark as plain text, one sentence that says who it is for, and
a short row of links people look for last — About, Cater with us, Privacy,
Terms. It sits straight on the page canvas, like the header: no band, no
border. Three audiences get three link sets and the layout never changes:

- Public (listing, caterer page, inbox, auth, legal and system pages):
  "Caribbean caterers in Toronto and the GTA." · About · Cater with us ·
  Privacy · Terms.
- Caterer dashboard: the same line · About · Privacy · Terms (a signed-in
  caterer is not asked to cater with us).
- Operator console: "Operator console. Every action is written to the audit
  log." · Privacy · Terms — a standing reminder.

Every footer links to the privacy notice (L2-070.1). The footer is not
navigation for the task at hand: account actions are in the account
[menu](menu.md), sections in the [site header](site-header.md) or [side
nav](side-nav.md).

Out of scope:

- The page shell that pushes the footer to the bottom of short pages (`.page`
  flex column, `main` growing) and the padding that keeps it clear of the
  sticky enquiry bar (`main.has-sticky-cta`, [sticky CTA](sticky-cta.md)).
- Which audience a page belongs to: the app shell passes the line and links.
- The legacy bordered `.footer` from the base kit: unused, not built (D-4).

## Usage

Inventory from a parse of every `<footer class="site-footer">` in
`docs/mocks/` (3 distinct configurations, 344 uses) and
`usage_inventory.py docs/mocks site-footer "footer"`.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| Public pages, auth, legal, system and error pages, customer pages (`caterers/*`, `caterer/*`, `occasions/*`, `inbox/*`, `thread/*`, `account`, `sign-in/*`, `register*/*`, `not-found`, `server-error`, `offline`, `maintenance` …), `notifications/site-banner/*`, `notifications/toast/*` — 114 | public line; 4 links | "Caribbean caterers in Toronto and the GTA."; "About", "Cater with us", "Privacy", "Terms" | default, hover, focus; current on About, Privacy, Terms (D-2) | canvas |
| Caterer pages (`dashboard/*`, `dashboard-*/*`, `profile-*/*`, `account/caterer`), `notifications/dashboard-toast/*`, `profile-banner/*`, caterer dialogs (page behind) — 101 | public line; 3 links | "About", "Privacy", "Terms" | default | canvas |
| Operator pages (`admin-*/*`), `notifications/admin-toast/*`, operator dialogs (page behind) — 129 | operator line; 2 links | "Operator console. Every action is written to the audit log."; "Privacy", "Terms" | default | canvas |

The footers in dialog mocks belong to the page behind the dialog, which is
inert while it is open.

## Anatomy

1. **Container** — `footer.site-footer`: a wrapping flex row, brand and links
   `space-between`, top-aligned; `--layout-container-max` wide, centred;
   `--space-24` above; `--space-10` block padding (plus
   `env(safe-area-inset-bottom)` at the bottom) and `--layout-margin` inline;
   `--text-body-sm`, `--color-fg-muted`; gap `--space-4` by `--space-8`.
2. **Brand** — `div.site-footer__brand`: a column, `--space-1` gap, at most
   22rem wide.
3. **Wordmark** — `strong` inside the brand: "Sweet Hand" in `--text-h4`,
   `--color-fg-default`. Plain text, not a link.
4. **Line** — `span` inside the brand: one sentence, muted.
5. **Footer navigation** — `nav[aria-label="Footer"] > ul`: a wrapping row,
   no bullets, `--space-6` between links.
6. **Link** — `li > a`: muted, no underline, 44 px (`--target-comfortable`)
   high; hover ink with an underline; current ink at `--font-weight-medium`
   with `aria-current="page"`.

Host: `sh-footer` is layout-transparent (`display: contents`) and renders
`<footer>` in the light DOM, so it is a direct child of `.page` and the
page's `contentinfo` landmark, and the print rules apply.

## API

### Inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `brandName` | `string` | — | yes | "Sweet Hand", rendered in `strong`. |
| `line` | `string` | — | yes | The one sentence under the wordmark: the public or the operator line. |
| `label` | `string` | — | yes | `aria-label` of the `nav`: "Footer". |
| `links` | `FooterLink[]` | — | yes | 2 to 4 links, in order. One of them must be the privacy notice (L2-070.1); the component does not know which, so the shell's link sets are the guarantee and the criteria test every page template. |

```ts
interface FooterLink {
  label: string;      // "Privacy", from the resource files
  href: string;       // "/privacy" — root-relative
  current?: boolean;  // renders aria-current="page" on the page it points to
}
```

### Outputs

None.

### Content slots

None. The design system allows exactly a wordmark, a line and a few links; no
copyright line, social icons, newsletter form or app badges (D-3).

- Translation: `brandName`, `line`, `label` and link labels arrive from the
  consumer, who takes them from the resource files (L2-064.4). The component
  contains no user-facing strings.

## Variants and sizes

| Variant | `line` | `links` |
|---|---|---|
| Public | "Caribbean caterers in Toronto and the GTA." | About, Cater with us, Privacy, Terms |
| Caterer | the same | About, Privacy, Terms |
| Operator | "Operator console. Every action is written to the audit log." | Privacy, Terms |

One size. Spacing comes from the layout tokens, which grow with the viewport
(`--layout-margin` 16 px on phones to 80 px from 75rem).

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Link default | — | `--color-fg-muted`, no underline | Link in navigation "Footer" |
| Link hover / active | `:hover`, `:active` | `--color-fg-default`, underlined; instant | — |
| Link focus | `:focus-visible` | Shared ring (`--focus-ring-width`, `--color-focus-ring`, `--focus-ring-offset`) | Focused |
| Link current | `current` → `aria-current="page"` | `--color-fg-default`, `--font-weight-medium` | "current page" |
| Disabled | — | Never | — |
| Page error | main content failed | The footer still renders with the shell | Privacy link still available |
| Above a sticky bar | caterer page XS–MD | Never covered: the page pads `main` | Focused links stay fully visible |
| Print | `@media print` | Printed as plain text and links | — |

`data-state="hover|focus"` exists in `components.css` only for documentation
and mocks. The component never renders it.

## Markup

```html
<!-- rendered: public footer on the Privacy page -->
<footer class="site-footer">
  <div class="site-footer__brand"><strong>Sweet Hand</strong><span>Caribbean caterers in Toronto and the GTA.</span></div>
  <nav aria-label="Footer">
    <ul>
      <li><a href="/about">About</a></li>
      <li><a href="/cater-with-us">Cater with us</a></li>
      <li><a href="/privacy" aria-current="page">Privacy</a></li>
      <li><a href="/terms">Terms</a></li>
    </ul>
  </nav>
</footer>
```

The caterer footer drops the "Cater with us" item; the operator footer has the
operator line and only "Privacy" and "Terms".

Consumer template (binding syntax illustrative):

```html
<!-- consumer: app shell -->
<sh-footer [brandName]="t('brand')" [line]="footerLine()" [label]="t('footer.label')" [links]="footerLinks()"></sh-footer>
```

The e2e page objects locate the footer by the `contentinfo` landmark and
`footer.site-footer`, links by name inside `nav[aria-label="Footer"]`, and the
current link by `aria-current="page"`, so these are part of the contract.

## Design

- Container: `--layout-container-max`, centred; `--space-24` margin above;
  `--space-10` block padding plus `env(safe-area-inset-bottom)`;
  `--layout-margin` inline padding; gap `--space-4` (rows) by `--space-8`
  (columns).
- Brand: column, `--space-1` gap, at most 22rem; wordmark `--text-h4`.
- Text `--text-body-sm`.
- Links: row with `--space-6` between, wrapping; each 44 px high
  (`--target-comfortable`), inline-flex, centred; current
  `--font-weight-medium`.
- No background, border, elevation or layer.
- Motion: none; hover changes colour and underline instantly.

No component tokens.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Background (the page) | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Wordmark, hovered and current link | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Line, links | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |

Contrast pairs (from `tokens/contrast-pairs.json`; L2-067, L2-069):

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Line and links |
| `--color-fg-default` | `--color-bg-canvas` | 4.5:1 | Wordmark, hovered and current link |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus ring |

The current link differs by weight as well as colour, and by
`aria-current` (L2-069.5). Because the footer has no background, a theme never
needs a footer override.

## Responsive behaviour

- No breakpoints of its own: a wrapping flex row, so the width decides.
- Phone widths (XS): the brand and the links do not fit side by side, so the
  brand stacks above the links, which wrap two or three to a row with
  `--space-6` between; the bottom padding adds the safe area so the last row
  clears the home indicator.
- Wider (from about 40rem, decided by the content, not a breakpoint): brand on
  the left, links on the right, top-aligned.
- From 90rem the footer stops growing and centres with the header.
- Every link is 44 px high with 24 px between neighbours in a row (L2-065.1);
  wrapped rows sit directly above one another, which is allowed because each
  target is already 44 px (WCAG 2.5.8 spacing exception).
- At 320 px nothing scrolls horizontally; at 200 % zoom at a 1280 px window
  everything is readable and every link usable.

## Accessibility

### Role and pattern

A top-level `<footer>` outside `<main>`, so it is the page's `contentinfo`
landmark ([APG contentinfo](https://www.w3.org/WAI/ARIA/apg/patterns/landmarks/examples/contentinfo.html)).
Links sit in `<nav aria-label="Footer">`, distinct from the header's
"Primary".

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> / <kbd>Shift</kbd>+<kbd>Tab</kbd> | Reaches the footer links last, after the page content and [pagination](pagination.md). |
| <kbd>Enter</kbd> | Follows the link. |

### Focus

The shared ring wraps each 44 px link. The footer is never under a sticky bar,
so a focused link is always fully visible (WCAG 2.4.11).

### Labelling

- Link text is the destination: "Privacy", "Terms", "Cater with us".
- The wordmark is plain text, so it is not announced as a second home link.

### Announcements

None.

### Motion

None.

## Content and internationalisation

- The line is one sentence that says who it is for: "Caribbean caterers in
  Toronto and the GTA." No slogan or founding story; About has that.
- Links: one or two words, sentence case: "About", "Cater with us",
  "Privacy", "Terms". "Cater with us" invites caterers; never "For business"
  or "Partners".
- No copyright line, social icons, newsletter form or app badges.
- Operators always see the audit reminder.
- Translatable inputs: `brandName`, `line`, `label`, link labels. French runs
  about 30 % longer ("Cuisinez avec nous", "Confidentialité"); the links wrap.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values are computed once, not in the
  template.
- No listeners, timers or observers.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Footer.ts`
  renders the public footer with "Privacy" current; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Listing`, `CatererPage`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: server-rendered with the shell; nothing in it loads later,
  so it never shifts.
- Weight: no dependencies beyond the framework; no images or icons.

## Acceptance criteria

### Rendering

- **AC-1** Given the listing, when the page renders, then it ends with `footer.site-footer` outside `main` holding "Sweet Hand" as plain text (not a link), the line "Caribbean caterers in Toronto and the GTA." and a `nav` named "Footer" with the links "About", "Cater with us", "Privacy" and "Terms". (L2-070)
- **AC-2** Given every page template of L2-064 (listing, caterer page, enquiry form, inbox, thread, caterer editor, operator queue, metrics dashboard, sign-in, registration) and the error pages, when each renders, then its footer contains a link named "Privacy" to the privacy notice. (L2-070)
- **AC-3** Given Kendra on her dashboard, when the footer renders, then its links are "About", "Privacy" and "Terms", with no "Cater with us". (L2-037)
- **AC-4** Given a visitor on Pelau House's page, when they follow "Cater with us" in the footer, then the caterer registration page opens. (L2-037)
- **AC-5** Given Leah Mohammed on the operator queue, when the footer renders, then its line reads "Operator console. Every action is written to the audit log." and its links are "Privacy" and "Terms". (L2-070)
- **AC-6** Given the server-error page "Something went wrong", when it renders, then the footer renders in full with its privacy link even though the main content failed. (L2-091)
- **AC-7** Given the component source, when it is scanned for user-facing string literals, then none are found. (L2-064)

### States

- **AC-8** Given the Privacy page, when the footer renders, then the "Privacy" link has `aria-current="page"` and is drawn in `--color-fg-default` at `--font-weight-medium` while the other links are `--color-fg-muted` at regular weight. (L2-069)

### Keyboard and focus

- **AC-9** Given Pelau House's page at 360 px with the sticky enquiry bar, when Marcia tabs to the last footer link "Terms", then it is the last element in the tab order and its focus ring is fully visible, not covered by the bar. (L2-067)
- **AC-10** Given any footer link with keyboard focus in the light or dark theme, when it is drawn, then the ring has at least 3:1 contrast against the canvas. (L2-067)

### Screen readers

- **AC-11** Given any page, when its landmarks are listed, then the footer is the single `contentinfo` landmark and its navigation is named "Footer", distinct from "Primary". (L2-068)
- **AC-12** Given the public, caterer and operator footers at XS and XL, when axe-core runs, then it reports 0 violations. (L2-066)

### Theming

- **AC-13** Given the dark theme, when the footer renders, then the line and links resolve to `--palette-stone-350` and the wordmark to `--palette-stone-100`, each with at least 4.5:1 against the canvas, and no background or border appears. (L2-069)

### Responsive

- **AC-14** Given a 360 px viewport, when the public footer renders, then the brand stacks above the links, each link is at least 44 CSS px high with at least 8 px to its neighbour in the row, and nothing scrolls horizontally. (L2-065)
- **AC-15** Given a 320 px viewport, when the public footer renders, then no text is clipped and the page does not scroll horizontally. (L2-064)
- **AC-16** Given a 1280 px window at 200 % zoom, when the public footer renders, then every link is visible and usable with no horizontal scrolling. (L2-069)

### Performance

- **AC-17** Given the `Footer` perf-test scenario, when the footer renders, then it causes no layout shift and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/footer/`; files
  `footer.component.*` (selector `sh-footer`, class `FooterComponent`);
  `FooterLink` exported.
- Styles: the `.site-footer` rules of the "Footer" section of `components.css`
  move into the component, class names unscoped. `.footer` (legacy) is not
  built (D-4).
- The design-system page calls the current-link style "proposed";
  `components.css` already has `.site-footer a[aria-current="page"]`. This CRD
  requires it.
- Mocks catch-up for D-2: the About, Privacy and Terms mocks add
  `aria-current="page"` to the matching footer link; links become
  root-relative.
- Composes nothing. No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Is the link to the current page marked?* Yes, with `aria-current="page"` and ink at medium weight. No mock marks it; the design system adds it, and `components.css` already styles it.
- **D-3** *Does the footer take slots for extra content?* No. The design system rules out copyright lines, social icons, newsletter forms and app badges, none of which any requirement asks for; data inputs keep the footer to its three parts.
- **D-4** *Is the legacy `.footer` built?* No. No screen uses it and its band breaks the flat-surface rule; it stays in `components.css` for parity only.
- **D-5** *Is the wordmark a link?* No. The header's wordmark already goes home; a second home link at the bottom is a redundant Tab stop and announcement.
