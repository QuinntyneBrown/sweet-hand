# Sweet Hand design system

Extracted from [docs/mocks](../mocks/README.md) on Saturday 10 October 2026: 436 HTML mocks (90 screens: pages, dialogs and notifications in every state), their draft `tokens.css` and component kit `ui.css`. Open [index.html](index.html) in a browser; press <kbd>t</kbd> on any page to switch between light and dark.

The look comes from the reference design: a white canvas, a bold wordmark, a quiet text-only nav, a vertical text filter list with the selected item in pepper red, and round food photos with a name and a short line underneath. Three rules hold everywhere:

- **One ink-black primary button per screen** (`--color-action`).
- **Pepper red means "selected / you are here"** (`--color-accent`), never an action and never an error (errors are sorrel, deeper and cooler).
- **Flat surfaces**: white space separates things; borders and shadows only lift overlays.

## How to use it

1. Link `tokens/tokens.css`, then `assets/components.css`. (`assets/ds.css` and `assets/ds.js` are only for these documentation pages.)
2. Use the class names and attributes from each component page's **Code** section. State lives in real attributes (`disabled`, `aria-pressed`, `aria-current`, `aria-invalid`, `aria-expanded`, `aria-busy`); `data-state` exists only to show states in static pages. The mocks, the product and the e2e page objects share these class names (see `AGENTS.md`).
3. Read tokens by role (`var(--color-fg-muted)`), never by value. Other platforms consume `tokens/tokens.json`.
4. Theme with `data-theme="light|dark"` on `<html>`; without it the OS preference applies. A `[data-theme]` region can sit inside a page of the other theme.
5. The mocks now import this system (`docs/mocks/assets/tokens.css` and `ui.css` are one-line `@import`s), so a change here shows in every mock. Re-run both checkers below after any change.

## Foundations

| Page | Covers |
|---|---|
| [Color](foundations/color.html) | Stone, pepper, callaloo, mango and sorrel ramps; semantic roles; ink = action, pepper = selected, info is stone, sorrel vs pepper; statuses, stars, scrim; both themes; every contrast pair with live ratios; adding a brand theme. |
| [Typography](foundations/typography.html) | Figtree and fallbacks, mono; the 9-step scale and the 62rem display bump; weights, line heights, letter spacing; all 16 `--text-*` roles; measure and wrapping; tabular numbers; 12px minimum. |
| [Spacing](foundations/spacing.html) | The 4px scale, inside vs between, padding by component size, control heights (sm from 48rem), touch targets. |
| [Layout](foundations/layout.html) | L2 viewport classes XS–XL plus 2XL; columns, gutters, margins, top bar and section gap per breakpoint; live grid; container and measure; sidebar, panel, dialog and sheet widths; six page templates with mock views. |
| [Elevation](foundations/elevation.html) | Flat by default; four shadows plus focus; surface hierarchy; dark-theme elevation; z-order with a live layered example. |
| [Shape](foundations/shape.html) | Radius scale and which radius for which element, phone sheets, the round photo, border widths and rings. |
| [Motion](foundations/motion.html) | Durations and easings with replayable demos, loops and the tooltip delay, choreography (dialog scale-in, phone sheet slide-up, side sheet slide-in, toast, menu, viewer, photo zoom), reduced motion. |
| [Iconography](foundations/iconography.html) | 24-unit outline grid, 2px round stroke, `currentColor`, six sizes, colour and labelling rules, the sheet of 38 icons used in the mocks. |
| [Theming](foundations/theming.html) | `data-theme`, `prefers-color-scheme`, `color-scheme`, no-flash setup, the three token tiers, dark is not inverted, contrast preferences, adding a theme, consuming `tokens.json`. |
| [Responsive](foundations/responsive.html) | Mobile first at 360px with 320px reflow, L2 viewport classes, visibility utilities, per-component breakpoint table, phone views of mocks, touch, safe areas, testing matrix. |
| [Accessibility](foundations/accessibility.html) | WCAG 2.2 AA commitments by principle, per-screen checklist, focus ring, focus destinations, 44px targets (L2-065), automated and manual testing, the component contract. |
| [Content](foundations/content.html) | Canadian English, voice by moment, sentence case, verbs, numbers, dates, times, CAD, postal codes, island traditions and dish names, privacy, allergens, certificates, error and empty formulas, microcopy library. |

## Components

63 components. Every page has the same thirteen sections: overview, anatomy, variants, sizes, states, responsive, theming, accessibility, content, do and don't, tokens, code, sources.

### Actions

| Component | Variants | States | Source mocks |
|---|---|---|---|
| [Button](components/button.html) | primary (ink), secondary, ghost, link, danger; with icon, icon-only, block, wrap; sm, md, lg | default, hover, focus, active, disabled, loading | caterer, enquiry, suspend-caterer, profile-menu, not-found |
| [Icon button](components/icon-button.html) | ghost, outline, with count badge, as link | default, hover, focus, active, disabled, pressed, expanded, current | inbox, dashboard, search, suspend-caterer, photo-viewer, profile-photos, profile-menu |
| [Button group](components/button-group.html) | segmented text filter, button group md/sm, loading | default, hover, focus, active, disabled, selected | inbox, thread, dashboard-enquiries, admin-caterers, admin-queue, admin-reviews, admin-metrics |
| [Link](components/link.html) | inline, standalone, external, back link, in alerts, summaries and footers | default, hover, focus, visited (unstyled) | terms, privacy, caterer, profile-details, dashboard, sign-in, thread, profile-banner, caterers |
| [Menu](components/menu.html) | account menu per role, dropdown, section label, divider, checkable, danger, shortcut | default, hover, focus, disabled, checked, open | account-menu, site-menu, admin-caterer, filter-menu |

### Inputs

| Component | Variants | States | Source mocks |
|---|---|---|---|
| [Form field](components/form-field.html) | help, optional, counter, error, warning, over limit, read-only value | default, focus, invalid, warning, disabled, read-only | enquiry, profile-details, sign-in, thread, dish, admin-audit |
| [Text field](components/text-field.html) | text, email, password with Show, tel, date, numeric, search, input group, read-only; sm, md, lg | default, hover, focus, invalid, disabled, read-only | sign-in, register, register-caterer, two-factor, enquiry, profile-events, admin-caterers, admin-audit, profile-details |
| [Textarea](components/textarea.html) | form textarea with counter, reply box | default, hover, focus, invalid, over limit, disabled, read-only | thread, profile-details, enquiry, decline-enquiry, suspend-caterer, report, review-response |
| [Select](components/select.html) | placeholder option and optgroups, filter select | default, hover, focus, invalid, disabled, busy, warning | enquiry, profile-cuisines, admin-audit, admin-metrics |
| [Combobox](components/combobox.html) | search dialog, listing aside (inline suggestions) | empty, focus, suggestions, no match, invalid postal code, out of area, busy, disabled | search, caterers |
| [Checkbox](components/checkbox.html) | single with consent summary, with description or count, fieldset and option grid, nested region with indeterminate parent | unchecked, checked, indeterminate, hover, focus, disabled, invalid, group error | profile-cuisines, profile-events, dish, filters, register, photo-details, moderate-review, sign-in |
| [Radio group](components/radio-group.html) | vertical, horizontal, card, primary pick | unselected, selected, hover, focus, disabled, invalid, unanswered | report, add-operator, resolve-report, record-breach, profile-cuisines |
| [Switch](components/switch.html) | label right, label left in a settings row, with description | off, on, hover, focus, disabled (unused in the mocks) | none (base kit) |
| [File upload](components/file-upload.html) | label-as-button trigger, file row, upload tile | default, hover, focus, disabled/full, dragging, failed, uploading, processing, invalid, empty | profile-photos, profile-certificate, photo-details, dashboard-toast |
| [Form layout](components/form-layout.html) | fieldset, field row, actions, sticky actions, autosave status, toolbar, dialog form | default, submitting, invalid, saved, failed, read-only | register, sign-in, profile-details, profile-events, profile-certificate, enquiry, admin-metrics, admin-audit |

### Navigation

| Component | Variants | States | Source mocks |
|---|---|---|---|
| [Skip link](components/skip-link.html) | main content | hidden, focus, print | every page |
| [Site header](components/site-header.html) | visitor, customer, caterer, operator; legacy `.topbar` | default, hover, focus, current, expanded, with badge | caterers, inbox, dashboard, admin-queue, site-menu, account-menu |
| [Side navigation](components/side-nav.html) | caterer dashboard, operator console, phone section list; legacy nav-link/sidebar | default, hover, focus, current, with count; section rows done/to do/needs attention | dashboard, profile-cuisines, admin-queue, site-menu |
| [Tabs](components/tabs.html) | panel tabs (automatic activation), link tabs, counts, scrolling | default, hover, focus, selected, disabled (unused in the mocks) | none (base kit); segmented alternatives in inbox, admin-queue |
| [Breadcrumb](components/breadcrumb.html) | eyebrow back link, trail, collapsing trail | default, hover, focus, current | caterer, caterers/occasion, profile-details, profile-certificate, thread, dashboard-enquiry, admin-caterer, admin-report |
| [Pagination](components/pagination.html) | first, last, many pages with gaps, single page | default, hover, focus, disabled, current, loading, offline | caterers, inbox/long, admin-audit/long |
| [Footer](components/footer.html) | public, caterer, operator, legacy `.footer` | default, hover, focus, current | caterers, dashboard, admin-queue, about, privacy, caterer, server-error |
| [Filter list](components/filter-list.html) | cuisine group, area group with search, active filter chips, as navigation | default, hover, focus, disabled, pressed, current, expanded, loading | caterers, dialogs/filters, profile-certificate |
| [Filter trigger](components/filter-trigger.html) | phone Filters button and browse bar, tablet dropdown bar, phone sheet | default, hover, focus, active, disabled, open, with count, busy | caterers, dialogs/filter-menu, dialogs/filters |

### Containers and overlays

| Component | Variants | States | Source mocks |
|---|---|---|---|
| [Container and grid](components/container.html) | container, narrow, stack, cluster, grid, auto grid, page intro, prose, browse/caterer/work/inbox/auth layouts | default, loading, empty, variant | caterers, caterer, dashboard, inbox, thread, sign-in, admin-cuisines, about |
| [Card](components/card.html) | card, flush, interactive, selected, well, closed note, contact card, private note, enquiry panel, certificate | default, hover, focus, selected, loading | caterer, admin-caterer, review-response, admin-report, sign-in/challenge, thread, profile-certificate |
| [Photo](components/photo.html) | fluid, xs, sm, md, lg, placeholder, processing, failed, photo row | loading, loaded, hover in parent, placeholder, processing, failed | caterers, caterer, dashboard/empty, profile-photos, not-found, sign-in, admin-caterer, photo-viewer |
| [Caterer card](components/caterer-card.html) | listing, long name, failed photo, draft, occasion tile | default, hover, focus, loading | caterers, occasions, dashboard/empty, profile-certificate |
| [Gallery and viewer](components/gallery.html) | carousel, lead and thumbnails, more-photos scrim, viewer | default, hover, focus, active, disabled, loading, failed, first/last | caterer, dialogs/photo-viewer |
| [Accordion](components/accordion.html) | grouped, single-open, quiet disclosure | closed, hover, focus, expanded | admin-metrics, privacy, terms, about |
| [Dialog](components/dialog.html) | default, destructive, form, success; sm, default, form, lg; full screen | default, invalid, busy, failed, success | enquiry, suspend-caterer, approve-profile, remove-photo, remove-dish, retire-cuisine, download-data, add-cuisine, review-response, delete-review |
| [Sheet and drawer](components/sheet.html) | filters sheet, site menu sheet, drawer, drawer left | open, selected/current, focus on Close, busy | filters, site-menu, caterers |
| [Popover](components/popover.html) | popover with text/title/actions, filter dropdown, account menu | closed, trigger hover/focus, open, open with selection | filter-menu, account-menu, admin-metrics |
| [Tooltip](components/tooltip.html) | text, with shortcut | hidden, hover, focus, visible, dismissed (unused in the mocks) | none (base kit) |
| [Divider](components/divider.html) | horizontal, vertical, labelled, menu divider | on page, raised, sunken | account-menu, caterer, admin-cuisines, inbox |
| [Sticky call to action](components/sticky-cta.html) | default, offline, long name, static | default, hover, focus, active, disabled | caterer |

### Data display

| Component | Variants | States | Source mocks |
|---|---|---|---|
| [Table](components/table.html) | default, numeric, dense, sortable, row actions | row hover/focus/selected, sort asc/desc, loading, empty, no results, error | admin-audit, admin-metrics, privacy |
| [List rows](components/list.html) | list and device list, interactive item, settings rows, editable rows, breach records | default, hover, focus, selected, read-only, loading, full, empty | account, admin-cuisines, admin-operators, profile-menu, admin-breaches |
| [Inbox row](components/inbox-row.html) | customer (photo), caterer (avatar), former user | default, hover, focus, unread, current, loading | inbox, thread, dashboard-enquiries, dashboard-enquiry |
| [Queue item](components/queue-item.html) | waiting, late, icon media, record (`--stack`), placeholder photo | default, hover, focus, loading, empty, no results, long | admin-queue, admin-caterers, admin-toast |
| [Description list](components/description-list.html) | dl, facts and inline list, regions, kv, enquiry summary, certificate, change review | default, long, missing, loading, certificate valid/expiring/expired, changed | caterer, account, admin-caterer, thread, dashboard-enquiry, admin-profile-review, admin-changes, approve-profile, profile-certificate |
| [Avatar](components/avatar.html) | initials, icon, image, account trigger, group; round food photo for caterers | default, hover, focus, expanded, loading | admin-queue, dashboard-enquiries, inbox, account, account-menu, admin-operators |
| [Badge](components/badge.html) | neutral, info, success, warning, danger, solid, count | default, 99+, zero, in a hovered or current link | admin-queue, dashboard, inbox, admin-operators, add-cuisine, retire-cuisine, caterer |
| [Status label](components/status.html) | open, replied, published, pending, held, hidden, declined, suspended, changes, closed, removed, draft | on page, hovered row, current row, dialog, loading | inbox, dashboard-enquiries, admin-caterers, admin-reviews, admin-caterer, account, admin-changes |
| [Chip](components/chip.html) | active filter (removable), toggle, static | default, hover, focus, active, selected, selected hover, disabled | caterers, filters, admin-caterers |
| [Tag](components/tag.html) | dietary, allergen, with icon | default, with icon, hovered row, changed, loading, none | caterer, profile-menu, dish, admin-profile-review |
| [Stat](components/stat.html) | stat, delta up/down, stat grid | default, loading, not loaded, zero, large | dashboard, admin-metrics, profile-banner |
| [Bar chart](components/bar-chart.html) | count, percentage, current period accent, chart grid, table alternative | default, partial, empty, error, loading, invalid, summary hover/focus/expanded | admin-metrics |
| [Timeline](components/timeline.html) | status history, sentence history, next steps | default, long reason, one entry, loading, long | admin-caterer, admin-profile-review, suspend-caterer, submit-profile, admin-audit |
| [Message thread](components/message.html) | theirs, mine, system, shared contact; thread head; reply box; closed note; placeholder | pending, failed; reply default/focus/invalid/submitting; open, replied, shared, declined, closed, former user, loading | thread, dashboard-enquiry, inbox, toast |
| [Dish](components/dish.html) | full, per-item price, no price, tags, allergen, long name, menu-manager row | default, loading, action hover/focus, read-only; list collapsed/expanded/empty/full/error | caterer, profile-menu, dialogs/dish, dialogs/remove-dish |
| [Rating](components/rating.html) | summary, facts link, display stars, star input, no reviews | input default, hover preview, focus, selected, invalid, disabled | caterer, dialogs/review, dashboard-reviews, admin-reviews |
| [Review](components/review.html) | public, with response, own review, dashboard, moderation, former user | published, responded, awaiting response, held, hidden, removed, loading, empty | caterer, dashboard-reviews, admin-reviews, admin-report, review-response, delete-review, moderate-review, review |
| [Checklist](components/checklist.html) | setup checklist with meter, compact dialog checklist, single confirmation | to do, done, needs attention, highlighted, hover, focus | dashboard, submit-profile, approve-profile, profile-banner |
| [Photo tile](components/photo-tile.html) | editable tile with cover, missing caption, read-only, upload tile | default, uploading, processing, loading, read-only, dragging; manager invalid/full/empty/error | profile-photos, admin-profile-review, photo-details, remove-photo |

### Feedback

| Component | Variants | States | Source mocks |
|---|---|---|---|
| [Inline message](components/inline-message.html) | help, error, warning, counter; inline status; save status | help, warning, invalid, over limit, read-only; saving, saved, error | profile-details, profile-cuisines, profile-photos, enquiry, search, caterers, review, thread, dashboard-enquiry |
| [Alert and banner](components/alert.html) | info, success, warning, danger; inline and `.banner`; dismissible, persistent | default, with action, dismissible, close hover/focus, action focus, dismissed, busy action | site-banner, profile-banner, profile-certificate, sign-in, dashboard, profile-details, admin-metrics, caterers |
| [Toast](components/toast.html) | info, success, warning, danger; with action; stacked; region default, `--top`, `--static` | default, action hover/focus, close hover/focus, entering, paused, persistent, leaving, replaced | toast, dashboard-toast, admin-toast |
| [Progress and meter](components/progress.html) | determinate, indeterminate, success, danger, setup meter | empty, in progress, complete, indeterminate, succeeded, failed, paused offline | dashboard, submit-profile, withdraw-submission, profile-photos |
| [Spinner](components/spinner.html) | standalone, inline with text, in a button; sm, md, lg | per surface, delayed, done, taking long | photo-viewer, enquiry, profile-certificate, verify-email |
| [Skeleton](components/skeleton.html) | text, title, circle, rect; caterer card, inbox row, admin row, queue, table | loading (`aria-busy`), reduced motion, loaded, failed, paging | caterers, inbox, admin-queue, admin-caterers, admin-cuisines, admin-operators, admin-audit, verify-email, profile-photos |
| [Empty state](components/empty-state.html) | first run, no results, error, offline, forbidden, in a dialog; full and compact | action default/hover/focus/busy, retrying, recovering | profile-menu, profile-photos, dashboard, inbox, caterers, dashboard-reviews, dashboard-enquiries, admin-audit, admin-queue, admin-metrics, report |
| [Error page](components/error-page.html) | 404, 403, 500 with reference, 429, offline, maintenance | action default/hover/focus/disabled/busy, copied | not-found, forbidden, server-error, rate-limited, offline, maintenance, site-banner |

## Patterns

| Pattern | Covers |
|---|---|
| [Forms](patterns/forms.html) | One-column layout, field pairs from 36rem, labels above, "(optional)" without asterisks, validation timing, error summary with focus, busy/failed/conflict/success, autosave (open question 16), destructive-confirmation tiers; the enquiry form in its invalid state. |
| [Feedback and loading](patterns/feedback-and-loading.html) | Which feedback for which action, skeleton vs spinner vs progress vs meter, the 300ms threshold, optimistic vs confirmed actions, Undo, partial failure, offline. |
| [Empty and error states](patterns/empty-and-error-states.html) | First run, no results with Clear filters, empty segment, failed load with reference, partial failure, offline, forbidden, not found, removed caterer, 500/429/503; title, line and action formulas. |
| [Navigation and page structure](patterns/navigation.html) | Site header per role, phone site menu, side nav vs section list, segments vs tabs vs sub-pages, page intro and back link, layouts by breakpoint, back behaviour and URL state. |
| [Dialogs and overlays](patterns/dialogs-and-overlays.html) | Dialog vs full screen vs bottom sheet vs side sheet vs dropdown vs popover vs viewer vs page; success in a dialog vs a toast; no stacking; focus start and return; inert page. |
| [Data tables and lists](patterns/tables-and-lists.html) | Rows over tables and when a real table is right; density; filtering with segments, toolbar and search; fixed sort orders; numbered pages, no infinite scroll; loading/empty/error rows; phone strategy. |
| [Notifications](patterns/notifications.html) | Toast vs banner vs inline vs email and badges; priority; persistence (danger never auto-dismisses, 8s pausing); stacking (max 3); live regions; banner and toast families. |
| [Content and tone](patterns/content-and-tone.html) | Tone by moment, high-stakes message anatomy, copy through the enquiry, review, moderation and suspension flows, consistent nouns and verbs, flow strings for the library. |

## Tokens

- `tokens/tokens.css` is the single source of truth. It has three tiers:
  - primitives: `--palette-*` (stone, pepper, callaloo, mango, sorrel), `--font-*`;
  - semantic tokens: colour, text roles, space, layout, radius, shadow, motion, z-order, interaction, icon size;
  - component tokens, declared in `assets/components.css`.

  Light is `:root` (restated under `[data-theme="light"]`). Dark is `[data-theme="dark"]` plus an identical block under `prefers-color-scheme: dark`. Reduced motion, `prefers-contrast: more` and forced colours are handled in the tokens.
- `tokens/tokens.json` is the W3C DTCG export: aliases are preserved and theme overrides sit under `$extensions`. Regenerate it with `tokens_to_json.py` after editing `tokens.css`.
- `tokens/contrast-pairs.json` holds the 112 foreground/background pairings the components rely on, checked in both themes.
- Breakpoints are the L2 viewport classes: sm 36rem, md 48rem, lg 62rem, xl 75rem; 2xl 90rem is the container max. Below 48rem every control is at least 44 × 44px (L2-065.1).

## Drift found in the mocks

Each row is something the mocks did inconsistently or below the bar, and what the system does instead. Rows marked "flagged for the mocks" or "open" still need a change in the mocks or a product decision.

| Mock | Issue | Resolution |
|---|---|---|
| `assets/tokens.css` (dark theme) | Five dark-theme colours were raw hex outside the palette (`#f3efe8` ink/link/action/star, `#b8b2a8`, `#9a948a`, `#2e2b28`, `#e2ded7`). | Moved into the stone ramp (`stone-350`, `stone-400`, `stone-750`); `#e2ded7` was already `stone-200`; `#f3efe8` collapsed into `stone-100` (`#efece7`), a near-duplicate serving the same role. Ramp renumbered: old `stone-400/500` are now `stone-500/600`. |
| `pages/thread/default`, `pages/caterers/default` (`--color-fg-subtle`) | Subtle text `#76726c` measured 4.39:1 on the sunken enquiry summary and 4.06:1 on hovered filter rows (below 4.5:1). | `--palette-stone-600` darkened to `#6b6863` (the mocks' own unused stone-600): 5.1:1 on sunken, 4.7:1 on subtle, 5.6:1 on white. |
| `dialogs/review/default` (`--color-star-empty`) | Empty stars were `stone-300` (1.6:1), yet the star input is a control (WCAG 1.4.11). | Raised to `stone-500` light (3.6:1) / `stone-600` dark (3.4:1). |
| `assets/ui.css` (base kit) | Breakpoints `40rem` (dialog, toast region) and `64rem` (sidebar layout, topbar menu, sidebar) sat off the L2 viewport classes 36/48/62/75rem. | Normalised to `36rem` and `62rem`; `--layout-breakpoint-2xl: 90rem` added at the container max. |
| `assets/ui.css` (`.gallery__more`, `.photo-tile__progress`) | Components read the primitive `--palette-white`. | New semantic `--color-fg-on-scrim`, checked over the scrim composited on white. |
| `assets/ui.css` (spinner, skeleton, indeterminate, pulse) | Loop durations hard-coded as `0.8s`, `1.4s`, `1.6s`. | `--duration-loop-fast` (800ms) and `--duration-loop` (1400ms); pulse snapped from 1.6s to 1.4s. |
| `assets/ui.css` (reduced motion) | A global `!important` rule cut every animation to one 0.01ms iteration, freezing the busy spinner. | Tokens zero transition durations; only decorative loops (shimmer, pulse, indeterminate) stop; the spinner keeps turning because it reports status. |
| `assets/ui.css` (tooltip, tabs, select) | Raw `8px` tooltip offset, `2px` tab-underline radius, px chevron positions, no tooltip show delay. | Spacing, radius and border-width tokens; `--duration-hover-delay` (300ms) for the tooltip. |
| `assets/ui.css` (late override blocks) | Rules re-declared further down the file: `.alert` border 4px→1px, `.dialog__footer` border, `.form-summary` twice, `.inline-list` gap twice, `.banner` twice, `.pagination` radius with `!important`, toast icon colour. | Each merged into one rule in `components.css`. |
| `assets/ui.css` (state hooks) | No `data-state` hooks for select/textarea, checkbox hover/indeterminate/invalid, chip active/disabled, filter-trigger active/open, section and queue row hover, menu focus, pagination hover, accordion, upload tile dragging. | Hooks added alongside the real pseudo-classes and attributes. |
| `assets/ui.css` (`.spinner`) | The spinner arc was pepper (`--color-accent`), but pepper means "selected". | Ink (`--color-fg-default`) on a `--color-border-default` track. |
| `assets/ui.css` (`.badge--solid`) | Label used `--color-fg-on-accent` on the stone info solid, an unchecked pair. | `--color-bg-surface` on `--color-info-solid`, added to `contrast-pairs.json`. |
| `assets/ui.css` (`.switch`) | The switch label row was only 24px tall. | Row height raised to `--target-comfortable` (44px, L2-065). |
| `assets/ui.css` (`.stepper`) | Defined in the kit, used by no mock and not core. | Dropped. |
| `dialogs/suspend-caterer/busy`, `dialogs/remove-caterer/busy` and 4 more | Busy buttons swapped their label ("Suspending…", "Removing…", "Saving…"); others kept it ("Change password"). | The label stays; progress is announced in the dialog's live region (see Button). |
| `docs/mocks/README.md` open question 25 | Very long caterer names wrap to many lines at display size on phones. | Open: recorded for product; the system keeps `--text-display` and `overflow-wrap: anywhere` until L2 decides. |
| `assets/ui.css` (compact controls) | Below 48rem, `.btn--sm`, `.chip`, `.menu__item`, `.input--sm`, `.choice` rows, `.toast__action`, chip remove buttons, breadcrumb links and alert close buttons stayed under 44px, against L2-065.1. | A phone-target block grows every one to `--target-comfortable` below 48rem; compact sizes apply from 48rem. |
| `assets/ui.css` (`.gallery__btn`) | Gallery hover zoom was 1.07 while the caterer card used 1.08. | One zoom, 1.08, everywhere. |
| 48 icons in `pages/caterer/*`, `pages/dashboard/*`, `pages/admin-queue/default`, `notifications/admin-toast/*`, `dialogs/download-data/*`, `dialogs/submit-profile/*`, `pages/register-caterer/success` | `<svg class="icon">` without `aria-hidden`, relying on a hidden parent. | Rule: `aria-hidden="true"` on every decorative SVG (see Iconography); fix in the mocks when they are next edited. |
| `assets/tokens.css` (`--ease-spring`) | Defined but used nowhere. | Kept and documented as reserved. |
| `notifications/site-banner/*` vs `notifications/profile-banner/*` | Banner titles written as `.alert__title` in one family and `<p><strong>` in the other; info written as both `.alert` and `.alert--info`. | `.alert__title` everywhere; `.alert--info` added as an explicit alias of the default tone. |
| `pages/admin-metrics/partial` | Two identical `role="alert"` blocks at once. | One summarising alert (see Alert). |
| `notifications/dashboard-toast/*`, `notifications/admin-toast/*` | `.toast__action` placed without the `.toast__actions` wrapper. | Wrapper required. |
| `assets/ui.css` (`.progress__bar`) | Progress fill was pepper; only the setup meter overrode it to ink. | Every progress fill is ink (`--color-action`); fill-on-track pairs added to `contrast-pairs.json`. |
| `pages/profile-photos/uploading` | `--value` set on the track and no `aria-valuetext`. | `--value` on the fill; `aria-valuetext` required. |
| `dialogs/photo-viewer/busy` | Loading placeholder was `role="img" aria-label="Loading…"`. | `role="status"` with visually hidden text (see Spinner). |
| `pages/admin-cuisines/loading`, `admin-operators/loading`, `admin-breaches/loading`, `admin-caterers/loading` | Skeleton rows exposed to screen readers. | Skeletons `aria-hidden`; one status message on the busy container. |
| `pages/caterers/error`, `pages/inbox/error`, `pages/sign-in/error` | Three error reference formats (`7F3K-92QD`, `7f3c-91ad`, `7f3c2a91`). | One format: lower case, hyphenated, in `<code>`. |
| `dialogs/report/duplicate` | Inline style tinted the empty-state icon. | New `.empty--info` modifier. |
| `pages/rate-limited/default` | "Try again" enabled though the note says it enables when the window resets. | `aria-disabled` until `Retry-After` passes. |
| `pages/server-error/default` | Copy button named only "Copy". | "Copy reference". |
| `notifications/site-banner/info` vs `pages/maintenance/default` | Maintenance dates disagree (Sun 18 Oct vs Sun 11 Oct 2026). | Open: content to come from one source; flagged for the mocks. |
| empty-state mocks (various) | Title levels h1/h2/h3/p with no rule; some `.empty__icon` not hidden. | Heading level follows the page outline; icon always `aria-hidden`. |
| 24 mocks: `dialogs/*/invalid`, `pages/*/invalid` | Error-summary headings used 8 formulas ("There is a problem", "Fix 1 thing before you continue"…), some without a goal. | "Fix N thing(s) to <goal>", e.g. "Fix 1 thing to suspend Pelau House" (see Forms). |
| 124 mocks using `<label class="field">` (e.g. `dialogs/enquiry/invalid`) | The label wrapped help and error text, folding them into the control's accessible name. | `div.field` with `label.field__label for`; help and error linked with `aria-describedby`. |
| `pages/thread/invalid` vs `pages/dashboard-enquiry/invalid` | The same single-field reply error was a summary in one and inline in the other, with different copy. | Inline under the field, focus on the field, "Write a reply before sending". |
| `pages/dashboard/default` and caterer pages | The phone header's menu slot linked to Enquiries; nothing opened `dialogs/site-menu/caterer`. | A Menu button that opens the caterer site menu and carries the unread count. |
| `pages/admin-queue/default`, `pages/admin-caterers/default` | Segment counts typed into labels ("All 7"); a segment linked to another page. | Counts in `.filter-list__count`; segments only filter. |
| `notifications/{toast,dashboard-toast,admin-toast}/stacked`, `*/warning` | Three rules for which toast drops when a fourth arrives; warning toasts auto-dismissed in one family only. | Oldest auto-dismissing toast leaves first, danger never; a warning with an action stays. |
| `notifications/dashboard-toast/danger` | Action "Retry". | "Try again", the library string. |
| `pages/admin-audit/forbidden` vs `pages/admin-operators/forbidden` | "Back to the queue" vs "Back to review queue". | "Back to the queue". |
| `dialogs/search/default` (note) | Said the dialog centres from 640px; the CSS centres from 36rem. | 36rem. |
| `dialogs/remove-photo/blocked` | The only button was "Got it". | The action that resolves it ("Add a photo") plus Cancel. |
| all dialog mocks | Page behind carried both `inert` and `aria-hidden="true"`. | `inert` alone. |
| `pages/admin-caterer/certificate-expired` | An ink primary "Suspend" opened the suspend confirmation. | A secondary trigger repeating "Suspend caterer"; danger stays in the dialog. |
| `--palette-mango-700` (status on the current inbox row) | "Pending" text measured 4.45:1 on `--color-bg-subtle`. | Darkened `#946200` → `#8c5c00` (4.9:1 there, 5.8:1 on white). |
| header in 236 mocks (e.g. `pages/admin-queue/default`) | Count badge carried `aria-label` on a `<span>`, which is not reliably announced. | Number `aria-hidden` plus visually hidden ", 7 items waiting" (see Badge). |
| every signed-in header | `button.avatar` had `aria-haspopup="menu"` but no `aria-expanded`; it was 40px outside `.site-nav`. | `aria-expanded` required; `button.avatar` is 44px everywhere. |
| `dialogs/approve-profile/*`, `pages/admin-profile-review/default` | `.certificate` pairs wrapped in `<div>`, breaking the grid. | `dt`/`dd` are direct children. |
| `pages/admin-caterer/*` vs `pages/profile-certificate/default` | One caterer's certificate file named and sized two ways. | One file (1.2 MB); flagged for the mocks. |
| `pages/admin-profile-review/resubmitted`, `dialogs/moderate-review/*` | Struck-through value with no label; `.diff-new` used for a flagged (unchanged) phone number. | Visible "Was"/"Now" with `<del>`/`<ins>`; diff classes only for changes. |
| `pages/thread/*`, `pages/admin-queue/loading` | Inline `white-space: pre-wrap` and inline skeleton sizes. | `.enquiry-summary__message dd p` and `.queue-item--skeleton` rules. |
| `pages/admin-queue/default`, `long` | Name-change titles used a bare "→" (read as "right arrow"); the "Held reviews" filter was missing. | Arrow `aria-hidden` plus hidden "renamed to"; filter added in the docs. |
| `pages/caterers/filtered`, `admin-caterers/no-results`, `dialogs/filters/selected` | Chip remove buttons named four ways; active-filter row had no group label. | "Remove <value> filter"; `role="group"` with a label. |
| `pages/caterer/*` | Tag order varied; nothing said tags are the caterer's own statement. | Dietary, then allergens, then Spicy; note proposed (copy needs L2 adoption). |
| `pages/admin-metrics/*` | Percentage bars scaled to the best week; running week drawn as complete; 41 daily bars on phones; deltas without arrows; "–" read as "en dash"; "48 h" vs "48 hours". | 0–100% scale; current period uses `--accent` and "so far"; 14 bars max on phones; arrows; hidden "Not loaded"; "48 hours". |
| `pages/dashboard/loading` vs `pages/admin-metrics/loading` | `aria-hidden` vs `aria-busy`; skeleton heights 2.75rem vs 2.5rem. | `aria-busy` on the grid; `--space-10`. |
| `pages/admin-caterer/*` vs `pages/admin-profile-review/*` | Timeline times in `<span>`; two entry styles. | `<time datetime>`; one style per list. |
| `components.css` (`.dish__name`, introduced during extraction) | A global `flex: 1 1 12rem` became a 12rem height inside the column-direction menu-manager rows. | Scoped back to `.dish-list .dish__name`, as the mocks had it. |
| `assets/tokens.css` (theme blocks) | No `[data-theme="light"]` block, so a light region inside a dark page inherited dark values; the focus shadow was composed once on `:root`. | Light semantic tokens restated under `[data-theme="light"]`; `--color-focus-ring-offset` and `--shadow-focus` recomposed in every theme. Dark `--color-star-empty` raised to stone-500 (4.1:1 on a hovered star). |
| `assets/ui.css` (`.message--pending`) | A pending bubble was dimmed to 60% opacity, a contrast that cannot be verified as a token pair. | Full-strength bubble; the italic "Sending…" meta line carries the state. |
| `pages/profile-certificate/*` (5 mocks) | Every `.form-actions` overrode the kit's end alignment inline. | Start alignment is the default. |
| `pages/profile-cuisines/*`, `profile-events/*`, `dialogs/dish/*` | Legend headings styled inline; "(optional)" in legends used `.text-muted`. | `legend > h2` and `legend .optional` rules. |
| `pages/profile-cuisines/default` | "All of City of Toronto" stayed unchecked while 3 of its areas were ticked. | The parent shows indeterminate. |
| `dialogs/filters/*` vs `pages/caterers/default` | Region counts disagree (Durham 6/7, Halton 2/3). | The listing is canonical; flagged for the mocks. |
| 165 dialog and viewer mocks | The skip link targets the dialog title from outside the modal. | The product drops it; the dialog takes focus on open. |
| all signed-in headers | Avatar has `aria-haspopup="menu"` but opens a dialog popover; caterer and operator avatars show on phones; the caterer header has no phone Menu button; the dashboard avatar opens the customer menu. | `aria-haspopup="dialog"` plus `aria-expanded`; avatar hidden on phones; caterer Menu button opens `dialogs/site-menu/caterer` and its own account menu. |
| `pages/profile-photos/*` vs `profile-cuisines/*` and `profile-certificate`, `profile-menu` (37 mocks) | Back link says "Dashboard" on some, "Overview" on others; threads say "Back to inbox". | "Overview", "Inbox", "Enquiries": name the destination only. |
| `pages/caterers/default`, `long`, `edge`; `inbox/long`; `admin-audit/long` | Previous/Next arrows disappear at the ends; 1,284 results show only pages 1–3; 4px between page targets. | Both arrows always, `aria-disabled` at the ends; first, last, current ±1 and gaps; 8px gap (L2-065.1). |
| `pages/caterers/*`, `dialogs/filters/*` | Filter counts read as bare numbers; `aria-label` on a plain count span. | Visually hidden " caterers"; "Filters, 2 active" inside the button. |
| `pages/caterer/*` | Gallery `aria-label` overrode the alt so captions were never read; the "+N photos" scrim was never rendered. | "Open photo N of M: caption"; scrim on the last visible thumbnail per breakpoint. |
| `pages/caterers/edge` | Failed photos lacked "Photo unavailable"; alt text "Food from {name}" (L2-006.4). | Label always shown; alt describes the food. |
| `pages/caterers/default` | Listing is 3 columns at XL; L2-005.4 asks for 4. | Open (mocks README question 2). |
| `pages/dashboard-enquiry/*`, `notifications/toast/danger` | Messages lack a visually hidden sender prefix; reply uses `.field__label`; "Try again" plain text. | Sender prefix both sides; `.reply-box__label`; real button. |
| `dialogs/review/busy`, `pages/profile-menu/*`, `pages/profile-photos/*` | Star 5 left enabled while 1–4 disabled; first/last move buttons `disabled`, losing focus. | Disable the fieldset; `aria-disabled` on move buttons. |
| `pages/profile-details/invalid`, `dialogs/review/invalid`, `pages/thread/invalid` | Three orders of error, help and counter; "All changes saved" without `--saved` in 4 mocks. | Control → error → help → counter; "Saved" with `--saved`. |
| `dialogs/download-data`, `dialogs/suspend-caterer` | `.checklist` used for lists that are not checklists. | Plain lists. |
| `dialogs/*/busy` (37) | `aria-busy` on `.dialog`, the panel or nowhere; no progress announced; Cancel disabled but Close live in 10 dialogs. | `aria-busy` on the panel plus a hidden `role="status"`; Close, Cancel and Esc pause together. |
| `dialogs/delete-review/*` | `role="alertdialog"`, no Close button, Cancel labelled "Keep review". | `role="dialog"`, Close button, "Cancel". |
| `dialogs/*` (all) | Inline `flex: 1` around titles and inline description margins. | `.dialog__heading` and `.dialog__desc`. |
| `pages/caterer/*` | The fixed enquiry bar could cover the footer's last links and focused elements (WCAG 2.4.11). | Footer clearance and `scroll-padding-bottom` while the bar shows. |
| `pages/admin-metrics/*`, `pages/privacy/default` | `.table th` styled body row headers as column headers (sticky, nowrap, muted), forcing sideways scroll at 320px; "Show as a table" lost its disclosure marker. | `tbody th` rule; chart disclosure gets the "+" marker. |
| `assets/ui.css` (`.tooltip`) | `pointer-events: none` made the tooltip impossible to hover (WCAG 1.4.13). | Hoverable with a gap bridge; `data-dismissed` hook for Esc. |
| `pages/account/default` | Two identical "Sign out" buttons in device rows. | Named per device: "Sign out Safari on iPhone". |
| `pages/inbox/*`, `pages/thread/*` (24) | `aria-current="page"` on the phone inbox icon had no visual; pressed icon buttons changed fill only (about 1.1:1). | The glyph turns pepper (`--color-fg-accent`, 3:1 on its fill). |
| 279 fields, 34 with error/help order flipped; limits enforced three ways | `maxlength` silently truncating, counters missing from `aria-describedby`, help contradicting the limit (`dialogs/dish`). | Visible counter, no `maxlength`, validate on submit; message directly under the control. |
| `dialogs/account-menu/*` | `role="dialog" aria-modal="false"` around a `role="menu"`, `autofocus` on an item, `<h2>` in the popup. | Plain container; menu labelled by the name; script moves focus. |
| `dialogs/search/no-match` | "No matching areas" was a disabled option in an expanded listbox. | `role="status"` outside a collapsed listbox. |
| `pages/caterers/*` (aside) | Area input lacks the combobox wiring the search dialog has. | Same combobox, inline suggestions. |
| `pages/account/default`, `saved` | Privacy notice "version 2026-03, accepted Sat 14 Mar" contradicts the README (v1.0, Thu 1 Oct 2026). | README value; flagged for the mocks. |
| `pages/profile-details/read-only`, `suspended` | `aria-labelledby` on a `<p>`. | Plain label above `.read-only-value`. |
| (component kit) `.input--sm` | 14px text makes iOS zoom on focus. | 16px below 48rem. |

## Verification

Run on Saturday 10 October 2026 against this folder:

| Check | Command | Result |
|---|---|---|
| Contrast, both themes | `python .claude/skills/extracting-design-systems/scripts/check_contrast.py docs/design-system/tokens/tokens.css` | 224 pairs passed, 0 failed, 0 unresolved (light and dark) |
| Structure, sections, labels, links, raw colours | `python .claude/skills/extracting-design-systems/scripts/check_design_system.py docs/design-system` | 84 pages (12 foundations, 63 components, 8 patterns, index), 0 errors, 0 warnings |
| Token export | `python .claude/skills/extracting-design-systems/scripts/tokens_to_json.py docs/design-system/tokens/tokens.css` | 289 tokens written to `tokens.json` |
| Mocks after switching to this system | `python .claude/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks` | 90 screens, 436 mocks, 0 errors, 0 warnings |
| Reflow, live contrast, unresolved tokens | Headless Chromium over all 84 pages at 320px and 360px, light and dark: document `scrollWidth`, every `[data-contrast]` ratio, every `[data-token]` cell | No sideways scroll, no failing live ratio, no unresolved token |
| Screenshots | `screenshot_mocks.py docs/design-system` for the color, button, dialog and caterer-card pages at 360px and 1280px, in both themes | Reviewed: no overflow or clipped specimens, focus rings visible, dark surfaces read as raised |
| Mocks before vs after | 14 representative mocks at 360px and 1280px in both themes, compared pixel by pixel | Differences are the logged corrections only: colour steps, 44px phone targets, ink progress, the reply box sizing to its content, the pepper current-inbox icon |

