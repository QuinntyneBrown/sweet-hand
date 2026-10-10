# Component requirements documents

One CRD per design-system component: `<component>.md` holds the requirements,
ending in Given/When/Then acceptance criteria that trace to
[L2](../L2.md); `<component>.html` renders every variant, size and state in
light and dark with the real design-system stylesheets. Written with the
`writing-component-requirements-documents` skill; check with

```sh
python .claude/skills/writing-component-requirements-documents/scripts/check_crds.py docs/specs/components
```

Changing an L2 requirement? Search the *Traces to* column for its ID to find
every component it affects.

## Shared decisions

- **No frontend stack is chosen yet.** Every CRD states its API as framework-neutral
  inputs, outputs and content slots with the `sh-` selector prefix and the
  `frontend/projects/components/src/lib/<component>/` library path (each CRD's D-1).
  The class names and attributes in each *Markup* section are the binding
  contract whatever the stack. Status is `planned` for every component.
- **Decisions the user made on 10 Oct 2026** where L2 and the design system
  disagreed (each is cited in the CRDs that depend on it). Where L2 lost, it
  was amended on 10 Oct 2026 to match; where the design system loses, its page
  catches up:
  - Caterer listing keeps 3 columns at XL and the round 1:1 photo (L2-005.4,
    L2-005.5 amended); eager images follow the first viewport (XS 2,
    SM–MD 4, LG+ 6); grid skeletons XS 3, SM–MD 6, LG+ 9.
  - The phone Enquiries link is named "Enquiries, 2 unread" with the badge
    hidden (L2-029.1 amended).
  - The account menu is `role="menu"` with `aria-haspopup="menu"`.
  - Neighbouring touch targets are at least 8 px apart on phones, stacked
    full-row links included (L2-065.1; the design system catches up).
  - Back links name only the destination ("Inbox", "Overview"; L2-036.2
    amended).
  - The dashboard's listing-card preview shows only from XL (L2-045.3 and
    L2-045.4 amended).
  - A failed submit moves focus to the error summary (L2-022.7 amended).
  - The primary-area error reads "Choose your primary area" (L2-010.4
    amended).
  - Photos are reordered with buttons only, and the first photo is the cover
    (L2-042.1 and L2-042.6
    amended).
  - A deleted customer's reviews are removed (L2-072.3; the design-system
    specimen is dropped).
  - The phone filter sheet's button reads "Show 2 caterers" (L2-009.1
    amended).
  - The fit warning keeps L2-024's "This caterer usually serves 20–300 guests".
  - Metrics charts draw every bar for long ranges (366 bars, no gap).
  - A current inbox icon in the header is pepper, as `components.css` draws it.
  - Non-Admin operators do not see the Admin-only side-nav items ("Audit log",
    "Operators"); the app shell passes only what the role can use (L2-056.5
    added).

## Index

| Component | Selectors | Status | ACs | Traces to | CRD | Design system |
|---|---|---|---|---|---|---|
| Accordion | `sh-accordion`, `sh-accordion-item`, `sh-disclosure` | planned | 21 | L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 | [accordion.md](accordion.md) · [accordion.html](accordion.html) | [accordion](../../design-system/components/accordion.html) |
| Alert | `sh-alert` | planned | 20 | L2-023, L2-030, L2-044, L2-048, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-091 | [alert.md](alert.md) · [alert.html](alert.html) | [alert](../../design-system/components/alert.html) |
| Avatar | `sh-avatar`, `sh-avatar-group` | planned | 15 | L2-031, L2-047, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072 | [avatar.md](avatar.md) · [avatar.html](avatar.html) | [avatar](../../design-system/components/avatar.html) |
| Badge | `sh-badge` | planned | 21 | L2-007, L2-029, L2-053, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [badge.md](badge.md) · [badge.html](badge.html) | [badge](../../design-system/components/badge.html) |
| Bar chart | `sh-chart-grid`, `sh-chart-card`, `sh-bar-chart` | planned | 21 | L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-091 | [bar-chart.md](bar-chart.md) · [bar-chart.html](bar-chart.html) | [bar-chart](../../design-system/components/bar-chart.html) |
| Breadcrumb | `sh-breadcrumb` | planned | 13 | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [breadcrumb.md](breadcrumb.md) · [breadcrumb.html](breadcrumb.html) | [breadcrumb](../../design-system/components/breadcrumb.html) |
| Button | `sh-button`, `sh-button-anchor` | planned | 30 | L2-001, L2-015, L2-017, L2-018, L2-025, L2-043, L2-054, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-085 | [button.md](button.md) · [button.html](button.html) | [button](../../design-system/components/button.html) |
| Button group | `sh-segmented`, `sh-button-group` | planned | 23 | L2-031, L2-036, L2-047, L2-059, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [button-group.md](button-group.md) · [button-group.html](button-group.html) | [button-group](../../design-system/components/button-group.html) |
| Card | `sh-card`, `sh-well`, `sh-closed-note`, `sh-contact-card`, `sh-private-note`, `sh-enquiry-panel` | planned | 27 | L2-015, L2-019, L2-032, L2-033, L2-035, L2-040, L2-052, L2-054, L2-059, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072 | [card.md](card.md) · [card.html](card.html) | [card](../../design-system/components/card.html) |
| Caterer card | `sh-caterer-card`, `sh-caterer-grid` | planned | 32 | L2-004, L2-005, L2-006, L2-042, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [caterer-card.md](caterer-card.md) · [caterer-card.html](caterer-card.html) | [caterer-card](../../design-system/components/caterer-card.html) |
| Checkbox | `sh-checkbox`, `sh-checkbox-group` | planned | 29 | L2-007, L2-008, L2-009, L2-010, L2-017, L2-021, L2-037, L2-042, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-070, L2-076, L2-085 | [checkbox.md](checkbox.md) · [checkbox.html](checkbox.html) | [checkbox](../../design-system/components/checkbox.html) |
| Checklist | `sh-check`, `sh-checklist`, `sh-checklist-item` | planned | 18 | L2-037, L2-038, L2-039, L2-040, L2-048, L2-058, L2-064, L2-066, L2-067, L2-068, L2-069, L2-071, L2-085 | [checklist.md](checklist.md) · [checklist.html](checklist.html) | [checklist](../../design-system/components/checklist.html) |
| Chip | `sh-chip`, `sh-filter-chip`, `sh-chip-group` | planned | 21 | L2-008, L2-009, L2-011, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [chip.md](chip.md) · [chip.html](chip.html) | [chip](../../design-system/components/chip.html) |
| Combobox | `sh-combobox` | planned | 24 | L2-009, L2-011, L2-012, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 | [combobox.md](combobox.md) · [combobox.html](combobox.html) | [combobox](../../design-system/components/combobox.html) |
| Container and layout | `sh-container`, `sh-page`, `sh-page-intro`, `sh-browse-layout`, `sh-caterer-layout`, `sh-work-layout`, `sh-inbox-layout`, `sh-auth-layout` | planned | 28 | L2-009, L2-019, L2-036, L2-045, L2-064, L2-066, L2-067, L2-069, L2-085 | [container.md](container.md) · [container.html](container.html) | [container](../../design-system/components/container.html) |
| Description list | `sh-description-list`, `sh-description`, `sh-inline-list`, `sh-change-value`, `sh-changed-flag` | planned | 24 | L2-014, L2-015, L2-019, L2-020, L2-021, L2-032, L2-035, L2-040, L2-044, L2-047, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 | [description-list.md](description-list.md) · [description-list.html](description-list.html) | [description-list](../../design-system/components/description-list.html) |
| Dialog | `sh-dialog`, `sh-dialog-photo`, `sh-dialog-people` | planned | 30 | L2-022, L2-025, L2-026, L2-042, L2-054, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-085 | [dialog.md](dialog.md) · [dialog.html](dialog.html) | [dialog](../../design-system/components/dialog.html) |
| Dish | `sh-dish`, `sh-dish-list` | planned | 23 | L2-015, L2-017, L2-043, L2-045, L2-047, L2-064, L2-066, L2-067, L2-068, L2-069, L2-080, L2-085 | [dish.md](dish.md) · [dish.html](dish.html) | [dish](../../design-system/components/dish.html) |
| Divider | `sh-divider` | planned | 12 | L2-064, L2-066, L2-067, L2-068, L2-069 | [divider.md](divider.md) · [divider.html](divider.html) | [divider](../../design-system/components/divider.html) |
| Empty state | `sh-empty-state` | planned | 28 | L2-001, L2-022, L2-031, L2-043, L2-050, L2-054, L2-060, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-079, L2-085, L2-089 | [empty-state.md](empty-state.md) · [empty-state.html](empty-state.html) | [empty-state](../../design-system/components/empty-state.html) |
| Error page | `sh-error-page` | planned | 24 | L2-014, L2-018, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-082, L2-085, L2-088, L2-089, L2-091 | [error-page.md](error-page.md) · [error-page.html](error-page.html) | [error-page](../../design-system/components/error-page.html) |
| File upload | `sh-file-upload`, `sh-file-row` | planned | 23 | L2-040, L2-041, L2-042, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [file-upload.md](file-upload.md) · [file-upload.html](file-upload.html) | [file-upload](../../design-system/components/file-upload.html) |
| Filter list | `sh-filter-group`, `sh-filter-list`, `sh-active-filters` | planned | 21 | L2-007, L2-008, L2-009, L2-011, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 | [filter-list.md](filter-list.md) · [filter-list.html](filter-list.html) | [filter-list](../../design-system/components/filter-list.html) |
| Filter trigger | `sh-filter-trigger`, `sh-filter-dropdown` | planned | 19 | L2-008, L2-009, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 | [filter-trigger.md](filter-trigger.md) · [filter-trigger.html](filter-trigger.html) | [filter-trigger](../../design-system/components/filter-trigger.html) |
| Footer | `sh-footer` | planned | 17 | L2-037, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-070, L2-085, L2-091 | [footer.md](footer.md) · [footer.html](footer.html) | [footer](../../design-system/components/footer.html) |
| Form field | `sh-form-field` | planned | 27 | L2-022, L2-024, L2-039, L2-050, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-076, L2-085 | [form-field.md](form-field.md) · [form-field.html](form-field.html) | [form-field](../../design-system/components/form-field.html) |
| Form layout | `sh-form`, `sh-fieldset`, `sh-form-row`, `sh-form-summary`, `sh-form-actions`, `sh-save-status` | planned | 23 | L2-022, L2-026, L2-038, L2-039, L2-060, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [form-layout.md](form-layout.md) · [form-layout.html](form-layout.html) | [form-layout](../../design-system/components/form-layout.html) |
| Gallery and viewer | `sh-gallery`, `sh-photo-viewer` | planned | 23 | L2-015, L2-016, L2-019, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [gallery.md](gallery.md) · [gallery.html](gallery.html) | [gallery](../../design-system/components/gallery.html) |
| Icon button | `sh-icon-button`, `sh-icon-button-anchor` | planned | 27 | L2-016, L2-029, L2-042, L2-043, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [icon-button.md](icon-button.md) · [icon-button.html](icon-button.html) | [icon-button](../../design-system/components/icon-button.html) |
| Inbox row | `sh-inbox-row`, `sh-inbox-list` | planned | 21 | L2-029, L2-031, L2-036, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-085 | [inbox-row.md](inbox-row.md) · [inbox-row.html](inbox-row.html) | [inbox-row](../../design-system/components/inbox-row.html) |
| Inline message | `sh-field-message`, `sh-inline-status`, `sh-save-status` | planned | 15 | L2-012, L2-022, L2-024, L2-035, L2-038, L2-042, L2-064, L2-066, L2-068, L2-069 | [inline-message.md](inline-message.md) · [inline-message.html](inline-message.html) | [inline-message](../../design-system/components/inline-message.html) |
| Link | `sh-link`, `sh-back-link` | planned | 22 | L2-018, L2-036, L2-045, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-070, L2-085 | [link.md](link.md) · [link.html](link.html) | [link](../../design-system/components/link.html) |
| List rows | `sh-list`, `sh-list-item`, `sh-admin-row`, `sh-edit-row`, `sh-breach-record` | planned | 25 | L2-007, L2-043, L2-044, L2-045, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-075, L2-078 | [list.md](list.md) · [list.html](list.html) | [list](../../design-system/components/list.html) |
| Menu | `sh-menu`, `sh-account-menu` | planned | 20 | L2-045, L2-058, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-078, L2-085 | [menu.md](menu.md) · [menu.html](menu.html) | [menu](../../design-system/components/menu.html) |
| Message thread | `sh-thread`, `sh-message-list`, `sh-message`, `sh-reply-box`, `sh-thread-placeholder` | planned | 29 | L2-032, L2-033, L2-035, L2-036, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-080, L2-085 | [message.md](message.md) · [message.html](message.html) | [message](../../design-system/components/message.html) |
| Pagination | `sh-pagination` | planned | 22 | L2-002, L2-003, L2-031, L2-036, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 | [pagination.md](pagination.md) · [pagination.html](pagination.html) | [pagination](../../design-system/components/pagination.html) |
| Photo | `sh-photo`, `sh-photo-row` | planned | 19 | L2-006, L2-016, L2-042, L2-064, L2-066, L2-068, L2-069, L2-085, L2-091 | [photo.md](photo.md) · [photo.html](photo.html) | [photo](../../design-system/components/photo.html) |
| Photo tile | `sh-photo-tile`, `sh-photo-manager` | planned | 23 | L2-039, L2-041, L2-042, L2-045, L2-047, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-091 | [photo-tile.md](photo-tile.md) · [photo-tile.html](photo-tile.html) | [photo-tile](../../design-system/components/photo-tile.html) |
| Popover | `sh-popover` | planned | 17 | L2-008, L2-009, L2-011, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [popover.md](popover.md) · [popover.html](popover.html) | [popover](../../design-system/components/popover.html) |
| Progress | `sh-progress`, `sh-meter` | planned | 19 | L2-038, L2-039, L2-041, L2-045, L2-064, L2-066, L2-067, L2-068, L2-069, L2-085, L2-091 | [progress.md](progress.md) · [progress.html](progress.html) | [progress](../../design-system/components/progress.html) |
| Queue item | `sh-queue`, `sh-queue-item` | planned | 20 | L2-040, L2-044, L2-046, L2-047, L2-050, L2-055, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 | [queue-item.md](queue-item.md) · [queue-item.html](queue-item.html) | [queue-item](../../design-system/components/queue-item.html) |
| Radio group | `sh-radio-group`, `sh-radio` | planned | 24 | L2-007, L2-054, L2-055, L2-056, L2-059, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-075, L2-085 | [radio-group.md](radio-group.md) · [radio-group.html](radio-group.html) | [radio-group](../../design-system/components/radio-group.html) |
| Rating | `sh-rating-summary`, `sh-stars`, `sh-star-input` | planned | 24 | L2-050, L2-051, L2-053, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [rating.md](rating.md) · [rating.html](rating.html) | [rating](../../design-system/components/rating.html) |
| Review | `sh-review`, `sh-review-list` | planned | 24 | L2-050, L2-051, L2-052, L2-053, L2-055, L2-059, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-080, L2-085 | [review.md](review.md) · [review.html](review.html) | [review](../../design-system/components/review.html) |
| Select | `sh-select` | planned | 15 | L2-021, L2-022, L2-024, L2-060, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [select.md](select.md) · [select.html](select.html) | [select](../../design-system/components/select.html) |
| Sheet | `sh-sheet` | planned | 20 | L2-009, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [sheet.md](sheet.md) · [sheet.html](sheet.html) | [sheet](../../design-system/components/sheet.html) |
| Side navigation | `sh-side-nav`, `sh-section-list` | planned | 24 | L2-038, L2-039, L2-045, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [side-nav.md](side-nav.md) · [side-nav.html](side-nav.html) | [side-nav](../../design-system/components/side-nav.html) |
| Site header | `sh-site-header` | planned | 26 | L2-013, L2-029, L2-046, L2-056, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [site-header.md](site-header.md) · [site-header.html](site-header.html) | [site-header](../../design-system/components/site-header.html) |
| Skeleton | `sh-skeleton`, `sh-loading-status` | planned | 17 | L2-005, L2-051, L2-061, L2-064, L2-066, L2-067, L2-068, L2-069, L2-085 | [skeleton.md](skeleton.md) · [skeleton.html](skeleton.html) | [skeleton](../../design-system/components/skeleton.html) |
| Skip link | `sh-skip-link` | planned | 19 | L2-003, L2-064, L2-065, L2-066, L2-067, L2-069, L2-085 | [skip-link.md](skip-link.md) · [skip-link.html](skip-link.html) | [skip-link](../../design-system/components/skip-link.html) |
| Spinner | `sh-spinner` | planned | 17 | L2-012, L2-016, L2-064, L2-066, L2-067, L2-068, L2-069, L2-077, L2-085 | [spinner.md](spinner.md) · [spinner.html](spinner.html) | [spinner](../../design-system/components/spinner.html) |
| Stat | `sh-stat-grid`, `sh-stat` | planned | 18 | L2-045, L2-051, L2-061, L2-064, L2-066, L2-067, L2-068, L2-069, L2-091 | [stat.md](stat.md) · [stat.html](stat.html) | [stat](../../design-system/components/stat.html) |
| Status label | `sh-status` | planned | 21 | L2-031, L2-033, L2-040, L2-046, L2-050, L2-055, L2-059, L2-064, L2-066, L2-067, L2-069, L2-085, L2-091 | [status.md](status.md) · [status.html](status.html) | [status](../../design-system/components/status.html) |
| Sticky call to action | `sh-sticky-cta` | planned | 17 | L2-015, L2-064, L2-065, L2-066, L2-067, L2-069, L2-085, L2-091 | [sticky-cta.md](sticky-cta.md) · [sticky-cta.html](sticky-cta.html) | [sticky-cta](../../design-system/components/sticky-cta.html) |
| Switch | `sh-switch` | planned | 19 | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [switch.md](switch.md) · [switch.html](switch.html) | [switch](../../design-system/components/switch.html) |
| Table | `sh-table`, `sh-table-row-actions`, `sh-table-na` | planned | 26 | L2-060, L2-061, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069 | [table.md](table.md) · [table.html](table.html) | [table](../../design-system/components/table.html) |
| Tabs | `sh-tabs`, `sh-tab-panel`, `sh-link-tabs` | planned | 21 | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [tabs.md](tabs.md) · [tabs.html](tabs.html) | [tabs](../../design-system/components/tabs.html) |
| Tag | `sh-tags`, `sh-tag` | planned | 19 | L2-017, L2-043, L2-047, L2-064, L2-066, L2-067, L2-068, L2-069, L2-085 | [tag.md](tag.md) · [tag.html](tag.html) | [tag](../../design-system/components/tag.html) |
| Text field | `sh-text-field` | planned | 25 | L2-022, L2-026, L2-060, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-076, L2-080, L2-085 | [text-field.md](text-field.md) · [text-field.html](text-field.html) | [text-field](../../design-system/components/text-field.html) |
| Textarea | `sh-textarea` | planned | 21 | L2-022, L2-026, L2-032, L2-039, L2-050, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-080, L2-085 | [textarea.md](textarea.md) · [textarea.html](textarea.html) | [textarea](../../design-system/components/textarea.html) |
| Timeline | `sh-timeline`, `sh-timeline-entry` | planned | 15 | L2-039, L2-044, L2-046, L2-048, L2-058, L2-064, L2-066, L2-067, L2-068, L2-069 | [timeline.md](timeline.md) · [timeline.html](timeline.html) | [timeline](../../design-system/components/timeline.html) |
| Toast | `sh-toast-region`, `sh-toast` | planned | 21 | L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-078, L2-085, L2-091 | [toast.md](toast.md) · [toast.html](toast.html) | [toast](../../design-system/components/toast.html) |
| Tooltip | `sh-tooltip` | planned | 14 | L2-043, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-085 | [tooltip.md](tooltip.md) · [tooltip.html](tooltip.html) | [tooltip](../../design-system/components/tooltip.html) |
