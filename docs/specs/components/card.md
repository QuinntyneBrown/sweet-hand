# Card

| Field | Value |
|---|---|
| Selector | `sh-card` (bordered card), `sh-well` (sunken panel), `sh-closed-note` (end-of-thread note), `sh-contact-card` (shared contact details), `sh-private-note` (privacy line), `sh-enquiry-panel` (the caterer page's side panel) |
| Library path | `frontend/projects/components/src/lib/card/` |
| Status | planned |
| Traces to | L2-015, L2-019, L2-032, L2-033, L2-035, L2-040, L2-052, L2-054, L2-059, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072 |
| Design system | [`card.html`](../../design-system/components/card.html) |
| Source mocks | [`pages/caterer/default`](../../mocks/pages/caterer/default.html), [`pages/caterer/loading`](../../mocks/pages/caterer/loading.html), [`pages/thread/open`](../../mocks/pages/thread/open.html), [`pages/thread/closed`](../../mocks/pages/thread/closed.html), [`pages/thread/declined`](../../mocks/pages/thread/declined.html), [`pages/thread/shared`](../../mocks/pages/thread/shared.html), [`pages/dashboard-enquiry/former-user`](../../mocks/pages/dashboard-enquiry/former-user.html), [`dialogs/share-contact/default`](../../mocks/dialogs/share-contact/default.html), [`dialogs/enquiry/default`](../../mocks/dialogs/enquiry/default.html), [`dialogs/review-response/default`](../../mocks/dialogs/review-response/default.html), [`dialogs/moderate-review/default`](../../mocks/dialogs/moderate-review/default.html), [`dialogs/revert-change/default`](../../mocks/dialogs/revert-change/default.html), [`pages/admin-report/default`](../../mocks/pages/admin-report/default.html), [`pages/admin-report/loading`](../../mocks/pages/admin-report/loading.html), [`pages/sign-in/challenge`](../../mocks/pages/sign-in/challenge.html), [`pages/account/default`](../../mocks/pages/account/default.html), [`pages/admin-caterer/default`](../../mocks/pages/admin-caterer/default.html) |
| Rendering | [`card.html`](card.html) |

## Purpose and scope

Sweet Hand is flat: content sits on the canvas, separated by space and
headings, not boxes. This CRD covers the few surfaces that exist for content
that genuinely needs one. A **well** holds quoted or secondary content: the
review Kendra is replying to, the reported review an operator is judging, the
sign-in "Quick check". A **closed note** ends a thread nobody can reply to
("This enquiry is closed."). A **contact card** holds the email and phone one
party shared in a thread. A **private note** is a muted line with a lock or
shield that says exactly who sees something ("Pelau House sees your name, not
your email or phone."); it appears in more than 100 mocks. The **enquiry
panel** is the caterer page's bordered, sticky side column at LG and XL. The
**card** is the general bordered surface from the base kit: no screen uses it
today, and it is kept for a self-contained summary that must read as one object
among others, such as a pending name change an operator approves.

Use something else for a listing item (the borderless [caterer
card](caterer-card.md)), a row of data ([list](list.md)), a group of form
fields (headings and [form layout](form-layout.md)), a message bubble or system
line in a thread ([message](message.md)), the sticky enquiry bar below LG
([sticky CTA](sticky-cta.md)) or a status that needs colour and an icon
([inline message](inline-message.md), [alert](alert.md)). Overlays have their
own surfaces ([dialog](dialog.md), [sheet](sheet.md), [popover](popover.md)).

Out of scope:

- What sits inside a surface: the review head and stars ([review](review.md),
  [rating](rating.md)), the facts list in the enquiry panel and the food
  handler certificate `dl.certificate` ([description list](description-list.md),
  D-3), buttons ([button](button.md)), skeleton lines ([skeleton](skeleton.md)).
- Deciding when an enquiry is closed, who has shared details, or who can see a
  field (L2-033, L2-035, L2-014): the page decides and passes the copy.
- The thread's status region that announces a newly closed thread
  ([message](message.md) and the thread page).
- Hiding the enquiry panel below LG and showing the sticky bar instead: the
  panel hides itself with `.only-lg`; the bar is [sticky CTA](sticky-cta.md).

## Usage

Inventory from `usage_inventory.py docs/mocks` for `card`, `well`,
`closed-note`, `contact-card`, `private-note` and `enquiry-panel`, plus a search
of every `class="private-note` for its icons.

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| (no mock) design-system card page | card, header with title + [status](status.md), body, footer with two small buttons | "Name change" / "Pending" / "Pelau House → Pelau House by Kendra" / "Request changes", "Approve" | default, selected, interactive hover and focus | canvas |
| `dialogs/review-response/*` | well as `figure` | quoted review: "Andre C." · "Event in July 2026" · "Doubles for 60 at the office, hot and on time…" | default | dialog surface |
| `dialogs/moderate-review/*` | well as `figure`, stacked | review head with photo-xs, stars, `blockquote` | default | dialog surface |
| `pages/admin-report/*`, `dialogs/open-enquiry`, `resolve-report` | well as `div`, stacked | caterer chip "Maracas Bay", review by Devon W., status "Showing on Maracas Bay's page" | default | canvas, dialog surface |
| `pages/admin-report/loading` | well as `div`, stacked | photo skeleton + two text skeletons | loading | canvas |
| `dialogs/revert-change/*` | well as `div`, stacked | "Goes back to" / "Replaces" with the two texts | default | dialog surface |
| `pages/sign-in/challenge` | well as `fieldset`, legend visually hidden "Quick check" | checkbox "I'm a person, not a bot" + caption | default | canvas |
| `pages/thread/closed`, `declined`; `pages/dashboard-enquiry/closed`, `declined` | closed note in place of the reply box | "This enquiry is closed." | default | canvas |
| `pages/thread/open` | closed note above the reply box | "Sugar Dumplin hasn't replied yet. We'll email you when they do." | default | canvas |
| `pages/dashboard-enquiry/former-user` | closed note in place of the reply box | "This person has left Sweet Hand, so replies can't be delivered." | default | canvas |
| `pages/thread/shared`, `pages/dashboard-enquiry/*` | contact card inside a system message | "Your details, visible to Pelau House in this enquiry" / "marcia.t@example.com" / "+1 647 555 0187"; "Pelau House" / "hello@pelauhouse.example" / "+1 416 555 0142" | default | canvas (system message) |
| `dialogs/share-contact/*` | contact card in a dialog body | "Pelau House will see" / email / phone | default | dialog surface |
| `dialogs/enquiry/*`, `pages/thread/open`, `default` (21 screens) | private note, block (`p`), lock | "Pelau House sees your name, not your email or phone." | default | canvas, dialog surface |
| `pages/account/*`, `dialogs/edit-details`, `delete-account`, `download-data`, `change-password`, `end-session` | private note, inline (`span` inside a `dd`), lock | "Private until you share it in a thread" | default | canvas, dialog surface |
| `pages/admin-profile-review`, `dialogs/approve-profile`, `request-changes` | private note, inline, lock | "Only operators and the caterer see these" | default | canvas, dialog surface |
| `pages/profile-certificate/*` | private note, block, lock | "Only you and the Sweet Hand team see this. It never appears on your page." | default | canvas |
| `dialogs/resolve-report/*`, `pages/admin-report/*` | private note, block, shield | "Devon W. and Maracas Bay never see who reported this." | default | canvas, dialog surface |
| `dialogs/add-operator`, `operator-edit`, `open-enquiry`, `end-session` | private note, block, shield | "They set a password and a second step…", "This access is written to the audit log with your name, the time and your reason." | default | dialog surface |
| `dialogs/add-cuisine/*` | private note, block, info | "Caterers can choose it straight away, and the listing filter offers it." | default | dialog surface |
| `pages/caterer/default`, `can-review`, `edge`, `more-dishes`, `no-reviews`, `offline`, `own-review` | enquiry panel, `aside` "Enquire", `.only-lg` | facts (guests, occasions), "Send an enquiry" (primary, lg, block), note "Free to ask. Your email and phone stay private until you choose to share them." | default | canvas, sticky |
| `pages/caterer/loading` | enquiry panel, `aria-hidden`, skeletons | text and pill skeletons | loading | canvas |

Not product markup: the 32 `div.enquiry-panel` copies in `dialogs/enquiry`,
`photo-viewer`, `report`, `review` and `delete-review` are the mock's static
picture of the page behind the dialog (D-9). "Contact details shared" with a
check icon in `pages/thread` is an [inline message](inline-message.md)
(`.inline-status--success`), not a private note (design system, Sources).

## Anatomy

1. **Card** — `.card`: `--color-bg-surface`, hairline `--color-border-default`,
   `--radius-lg`, `--space-6` padding, no shadow at rest.
   - **Header** — `.card__header`: flex row, title at the start, meta (a
     [status](status.md) or [icon button](icon-button.md)) at the end,
     `--space-4` below.
   - **Title** — `.card__title` in `--text-h4`, rendered as the heading level
     the consumer gives.
   - **Body** — any content.
   - **Footer** — `.card__footer`: hairline divider, `--space-4` above and
     below the line, actions at the end with the one primary last, `--space-3`
     between them, wrapping.
2. **Well** — `.well`: `--color-bg-surface-sunken`, no border, `--radius-md`,
   `--space-4` padding. Its element is `div`, `figure` or `fieldset`.
3. **Closed note** — `p.closed-note`: centred, `--color-fg-muted`, sunken,
   `--radius-lg`, `--space-4` padding, full width.
4. **Contact card** — `div.contact-card`: hairline border, `--radius-md`,
   `--space-4` padding, a grid of `strong` (whose details) then one `span` per
   value, `--space-1` apart, `--text-body-sm`, always left-aligned.
5. **Private note** — `p.private-note` (block) or `span.private-note` (inline):
   a 16 px `.icon.icon--sm` (`aria-hidden`) then the sentence, `--space-2`
   apart, `--text-body-sm`, `--color-fg-muted`.
6. **Enquiry panel** — `aside.enquiry-panel.only-lg`: a flex column with
   `--space-6` gaps holding the facts, the button and
   `p.enquiry-panel__note`. From 62rem it is bordered (`--radius-lg`,
   `--space-8` padding) and sticky `--space-8` from the top.

Host: every `sh-*` element here is `display: block` (`sh-private-note` with
`inline` set is `display: inline`) and renders the classed element as its only
child; the classes sit on that child, never on the host.

## API

### `sh-card` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `flush` | `boolean` | `false` | no | Adds `.card--flush`: no padding, media clipped to the radius. |
| `href` | `string \| null` | `null` | no | A URL makes the card interactive: `.card--interactive`, and the title renders as `a[href]` inside `.card__title`, stretched over the card. Requires `heading`. |
| `heading` | `string \| null` | `null` | no | The title text, rendered in `.card__title`. `null` renders no header unless the `meta` slot is filled. |
| `headingLevel` | `2 \| 3 \| 4 \| 5 \| null` | `3` | no | Renders `h{n}.card__title`; `null` renders `p.card__title` for a card that is not a section. |
| `selected` | `boolean` | `false` | no | Adds `.card--selected`. Inside a `role="listbox"` the consumer also sets `aria-selected` through `selectedAttr` (D-6). |
| `selectedAttr` | `boolean` | `false` | no | When true, renders `aria-selected="true\|false"` mirroring `selected` and `role="option"`; only for cards inside a listbox. |

### `sh-well` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `as` | `'div' \| 'figure' \| 'fieldset'` | `'div'` | no | `figure` for quoted content (the review), `fieldset` for a group of controls. |
| `stack` | `boolean` | `true` | no | Adds `.stack.stack--sm` so children sit `--space-2` apart (every stacked mock does); `false` for a single child. |
| `legend` | `string` | — | yes for `fieldset` | Rendered as the first child `legend`. |
| `legendHidden` | `boolean` | `false` | no | Adds `.visually-hidden` to the legend ("Quick check"). |

### `sh-closed-note` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `text` | `string` | — | yes | One full sentence, already translated. Rendered as text. |

### `sh-contact-card` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `heading` | `string` | — | yes | Whose details or who will see them, rendered in `strong`: "Pelau House", "Your details, visible to Pelau House in this enquiry", "Pelau House will see". |
| `email` | `string \| null` | `null` | no | Rendered as a `span`, plain text (D-5). |
| `phone` | `string \| null` | `null` | no | Rendered as a `span` after the email, plain text, formatted "+1 416 555 0142". A `null` value renders nothing, no empty line. |

### `sh-private-note` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `icon` | `'lock' \| 'shield' \| 'info'` | `'lock'` | no | `lock` for who sees something, `shield` for anonymity and audit, `info` for a neutral consequence. |
| `inline` | `boolean` | `false` | no | `true` renders `span.private-note` for use inside a `dd` or a label row; `false` renders `p.private-note`. |
| `text` | `string` | — | yes | The sentence, naming the audience. Never "Private" alone (D-7). |

### `sh-enquiry-panel` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The `aria-label` of the `aside` ("Enquire"), the same as the sticky bar's region. |
| `note` | `string \| null` | `null` | no | Renders `p.enquiry-panel__note` after the action. |
| `skeleton` | `boolean` | `false` | no | Renders the loading panel: `aria-hidden="true"`, no label, skeleton lines and a pill in place of the slots. |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| None | — | Surfaces report nothing. The interactive card's activation is native link navigation; buttons in a footer or panel emit their own events ([button](button.md)). |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-card`: `[slot=meta]` | one [status](status.md) or [icon button](icon-button.md) | End of the header. Not allowed with `href` (one interactive element per interactive card). |
| `sh-card`: default | any content | The body. |
| `sh-card`: `[slot=footer]` | [button](button.md)s, primary last | Renders `.card__footer`; omitted when empty. Not allowed with `href`. |
| `sh-well`: default | any content (review, caterer chip, controls, skeletons) | Rendered after the legend. |
| `sh-enquiry-panel`: default | the facts `dl.facts` ([description list](description-list.md)) | First in the panel. |
| `sh-enquiry-panel`: `[slot=action]` | one primary, lg, block [button](button.md) "Send an enquiry" | After the facts. |
| `sh-closed-note`, `sh-contact-card`, `sh-private-note` | none | Everything is an input, so the copy stays a sentence and the icon set stays closed. |

- Translation: `heading` (card), `legend`, `text`, `contact-card.heading`,
  `label` and `note` arrive translated from the consumer (L2-064). Email,
  phone and business names are data.

## Variants and sizes

| Variant | Element and class | Use for |
|---|---|---|
| Card | `div.card` | A self-contained summary among others (pending change). |
| Card, flush | `div.card.card--flush` | Media to the edge. Avoid square food photos; photos are round elsewhere. |
| Card, interactive | `div.card.card--interactive` with one `a` | The whole card is one link. |
| Card, selected | `.card--selected` (+ `aria-selected` in a listbox) | The chosen card in a set. |
| Well | `div\|figure\|fieldset.well` | Quoted or secondary content. |
| Closed note | `p.closed-note` | The end of a thread, or a waiting note in its place. |
| Contact card | `div.contact-card` | Shared contact details. |
| Private note, block / inline | `p.private-note` / `span.private-note` | Who sees something. |
| Enquiry panel | `aside.enquiry-panel.only-lg` | The caterer page's side column at LG and XL. |

One size each; width comes from the layout. Padding: card `--space-6`, well,
closed note and contact card `--space-4`, enquiry panel `--space-8` (from
62rem). A denser card would invite boxes into lists, which the design system
avoids.

## States

| State | Applies to | Trigger | Visual | Assistive technology |
|---|---|---|---|---|
| Default | all | — | As anatomy | Content read in order |
| Hover | interactive card | `:hover` | Lifts 1 px, `--shadow-2`, edge `--color-border-strong`, over `--duration-fast` | — |
| Focus | interactive card | `:focus-within` (the inner link focused) | `--focus-ring-width` ring in `--color-focus-ring`, `--focus-ring-offset` out, around the whole card; the link's own ring is suppressed | Link name announced |
| Active | interactive card | `:active` | Same as hover | — |
| Selected | card | `selected` | Edge and a 1 px outer shadow in `--color-accent`, so the edge reads 2 px | `aria-selected="true"` inside a listbox |
| Selected + interactive | card | both | Pepper edge; hover still lifts | As both |
| Disabled | interactive card | — | Never: remove `href` instead | — |
| Loading | well, card, enquiry panel | consumer projects skeletons; panel `skeleton` | Same size and padding, skeleton lines inside | Hidden (`aria-hidden="true"`); the page's status says "Loading Pelau House" |
| Closed | closed note | rendered in place of the reply box | Sunken centred line | Read as text; the thread's status region announces a change while open (page) |
| Long value | contact card | long email | Wraps anywhere (`overflow-wrap: anywhere`, D-8) | Unchanged |
| Below LG | enquiry panel | viewport < 62rem | `display: none` (`.only-lg`) | Not in the accessibility tree; the sticky bar's region takes over |
| Static surfaces | well, closed note, contact card, private note | — | No hover, focus, active or disabled state: they are not interactive | — |

`data-state="hover|focus|selected"` exists in `components.css` for
documentation and mocks only; the components never render it.

## Markup

```html
<!-- rendered: card with header meta and footer -->
<div class="card">
  <div class="card__header"><h3 class="card__title">Name change</h3><span class="status status--pending">Pending</span></div>
  <p>Pelau House → Pelau House by Kendra</p>
  <div class="card__footer"><button class="btn btn--sm" type="button">Request changes</button><button class="btn btn--primary btn--sm" type="button">Approve</button></div>
</div>

<!-- rendered: interactive card (one link, stretched); add card--selected for selected -->
<div class="card card--interactive"><h3 class="card__title"><a href="/caterers/pelau-house">Pelau House</a></h3><p class="text-muted">Trinidadian &amp; Tobagonian · Scarborough</p></div>
```

`.card--flush` and `.card--selected` add only a modifier class.

```html
<!-- rendered: wells -->
<figure class="well"><div class="review__head"><span class="review__author">Andre C.</span><span class="review__date">Event in July 2026</span></div><blockquote class="review__body">Doubles for 60 at the office, hot and on time. Kendra answered every question the same day.</blockquote></figure>

<fieldset class="well stack stack--sm"><legend class="visually-hidden">Quick check</legend><label class="choice">…I'm a person, not a bot…</label><p class="text-caption" id="human-help">A privacy-friendly check. No tracking cookies, nothing shared with advertisers.</p></fieldset>

<div class="well stack stack--sm" aria-hidden="true"><span class="photo photo--sm"><span class="skeleton skeleton--circle"></span></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
```

```html
<!-- rendered: closed note, contact card, private notes -->
<p class="closed-note">This enquiry is closed.</p>
<li class="message message--system"><div class="contact-card"><strong>Pelau House</strong><span>hello@pelauhouse.example</span><span>+1 416 555 0142</span></div></li>
<p class="private-note"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Pelau House sees your name, not your email or phone.</p>
<dd><span>+1 647 555 0187</span><span class="private-note"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…lock…</svg>Private until you share it in a thread</span></dd>
<p class="private-note"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24"><path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/></svg>Devon W. and Maracas Bay never see who reported this.</p>
```

The `info` icon is `<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>`.
Icon path data is free to change; the `.icon.icon--sm` classes and
`aria-hidden` are not.

```html
<!-- rendered: enquiry panel, and its loading state -->
<aside class="enquiry-panel only-lg" aria-label="Enquire">
  <dl class="facts">…Guests: Serves 20–300 guests · Occasions…</dl>
  <button class="btn btn--primary btn--lg btn--block" type="button" aria-haspopup="dialog">Send an enquiry</button>
  <p class="enquiry-panel__note">Free to ask. Your email and phone stay private until you choose to share them.</p>
</aside>
<aside class="enquiry-panel only-lg" aria-hidden="true"><span class="skeleton skeleton--text"></span>…<span class="skeleton skeleton--rect"></span></aside>
```

Consumer templates (binding syntax illustrative):

```html
<sh-well as="figure"><sh-review …></sh-review></sh-well>
<sh-closed-note [text]="t('thread.closed')"></sh-closed-note>
<sh-contact-card [heading]="caterer.name" [email]="shared.email" [phone]="shared.phone"></sh-contact-card>
<sh-private-note icon="shield" [text]="t('report.anonymous', { author, caterer })"></sh-private-note>
<sh-enquiry-panel [label]="t('caterer.enquire')" [note]="t('caterer.enquireNote')" [skeleton]="loading()">
  <dl class="facts">…</dl>
  <sh-button slot="action" variant="primary" size="lg" block hasPopup="dialog">{{ t('caterer.sendEnquiry') }}</sh-button>
</sh-enquiry-panel>
```

The e2e page objects locate these by `.card`, `.card__title`, `.well`,
`.closed-note`, `.contact-card`, `.private-note`, `.enquiry-panel` and the
`aside`'s name "Enquire"; those are part of the contract.

## Design

- Card: `--color-bg-surface`, `--border-width-hairline` `--color-border-default`,
  `--radius-lg`, `--space-6` padding. Header gap `--space-4`, `--space-4` below.
  Title `--text-h4`. Footer `--space-4` above and below its hairline,
  `--space-3` between actions.
- Interactive card hover: `--shadow-2`, `--color-border-strong`, 1 px lift, over
  `--duration-fast` with `--ease-standard`. Focus ring `--focus-ring-width`,
  `--color-focus-ring`, `--focus-ring-offset`.
- Selected: `--color-accent` edge plus a `--border-width-hairline` outer shadow
  in `--color-accent`.
- Well: `--color-bg-surface-sunken`, `--radius-md`, `--space-4`.
- Closed note: `--color-bg-surface-sunken`, `--color-fg-muted`, `--radius-lg`,
  `--space-4`, centred.
- Contact card: hairline `--color-border-default`, `--radius-md`, `--space-4`
  padding, `--space-1` row gap, `--text-body-sm`.
- Private note: `--text-body-sm`, `--color-fg-muted`, `--icon-size-sm` icon,
  `--space-2` gap.
- Enquiry panel: `--space-6` gaps; from 62rem `--space-8` padding, hairline
  border, `--radius-lg`, sticky at `--space-8`, width `--layout-panel-width`
  (from the page grid). Note `--text-body-sm`, `--color-fg-muted`.
- Layer: none. The sticky panel stays in flow (`position: sticky`) and needs no
  z-index.

Component tokens: none. Every surface reads semantic tokens directly; a theme
that wants softer cards changes `--color-border-default` and never adds a
shadow to a resting card (design system, Theming).

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| Card, enquiry panel fill | `--color-bg-surface` | `--palette-white` | `--palette-stone-950` |
| Card, contact card, panel edge, footer rule | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |
| Interactive hover edge | `--color-border-strong` | `--palette-stone-500` | `--palette-stone-500` |
| Selected edge | `--color-accent` | `--palette-pepper-600` | `--palette-pepper-300` |
| Well, closed note | `--color-bg-surface-sunken` | `--palette-stone-50` | `--palette-stone-900` |
| Text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Closed note, private note, panel note | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Focus ring | `--color-focus-ring` | `--palette-pepper-600` | `--palette-pepper-300` |
| Page behind | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |

In light the surface and the canvas are both white, so a card is just its
hairline; in dark the surface equals the canvas and the sunken surface is a
step lighter, so wells stay visible and the border still carries the card.

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-default` | `--color-bg-surface` | 4.5:1 | Text on a card |
| `--color-fg-default` | `--color-bg-surface-sunken` | 4.5:1 | Text in a well |
| `--color-fg-muted` | `--color-bg-surface-sunken` | 4.5:1 | Closed note |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | Private note, panel note |
| `--color-accent` | `--color-bg-surface` | 3:1 | Selected edge |
| `--color-focus-ring` | `--color-bg-surface` | 3:1 | Focus ring around an interactive card |

The hairline `--color-border-default` is decorative: content, not the edge,
carries meaning, so it is exempt from WCAG 1.4.11. Forced colours: `.card`
draws a `CanvasText` hairline; the focus ring becomes `Highlight`; wells and
closed notes may lose their fill, which is acceptable because their text stays.

## Responsive behaviour

- Every surface is fluid, fills its column, and never sets a minimum width
  wider than 288 px (the content box at 320 px).
- Enquiry panel: not displayed below 62rem (`.only-lg`; the facts appear in the
  page and the button becomes the [sticky CTA](sticky-cta.md)). From 62rem it
  is the bordered side column, sticky `--space-8` from the top.
- Contact card values and long words in a well wrap anywhere; a private note
  wraps under its own text with the icon kept at the start of the first line.
- Card footer actions wrap onto a second row rather than overflow.
- At 320 px nothing scrolls horizontally; at 200 % zoom in a 1280 px window
  (a 640 px layout) the enquiry panel is hidden and the sticky bar is shown.
- The interactive card's whole area is the touch target, far above 44 × 44
  CSS px; footer buttons keep their own sizes and the `--space-3` (12 px) gap.

## Accessibility

### Role and pattern

Surfaces are presentational; the content sets the semantics. A quoted review is
a `figure` with a `blockquote`; a group of controls in a well is a `fieldset`
with a `legend`; the enquiry panel is an `aside` named "Enquire" (a
complementary landmark), and only one of it and the sticky bar is ever
displayed; a contact card sits in a list item of the thread. An interactive
card follows [APG Link](https://www.w3.org/WAI/ARIA/apg/patterns/link/) with
one real link stretched over the card.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | Reaches the interactive card's single link, or each control inside a static surface, in reading order. The surface element itself is never focusable. |
| <kbd>Enter</kbd> | Follows the interactive card's link. |

### Focus

An interactive card shows one ring around the whole card (`:focus-within`) and
suppresses the link's own ring, so there is one ring, not two. No second
interactive element goes inside an interactive card. Nothing here moves focus.

### Labelling

- The card title is a real heading at the level the consumer gives.
- The enquiry panel's name is `label` ("Enquire"); a loading panel has no name
  and is `aria-hidden`.
- The contact card's `strong` names whose details they are.
- A private note's icon is `aria-hidden="true"`; the sentence names exactly who
  sees what. The icon's meaning (private, anonymous) is always in the words.
- A selected card in a listbox exposes `aria-selected`; outside a listbox the
  selection is said by the surrounding copy, and the edge is thicker as well as
  pepper, so colour is never the only cue.

### Announcements

None from the surfaces. When a thread closes while open, the thread page
announces the closed note through its own status region.

### Motion

The interactive card's lift and shadow run over `--duration-fast`; under
`prefers-reduced-motion: reduce` the lift is removed and only the shadow and
edge change, instantly.

## Content and internationalisation

- Closed notes are full sentences ending in a full stop that say what happens
  next: "This enquiry is closed.", "Sugar Dumplin hasn't replied yet. We'll
  email you when they do.", "This person has left Sweet Hand, so replies can't
  be delivered." (D-4).
- Private notes name the audience: "Only you and the Sweet Hand team see this.
  It never appears on your page." Never "Private" or "Read-only" alone (D-7).
- Contact cards hold only what was shared: a heading, email, phone. No
  "Email:" labels; the formats speak for themselves. Phones read "+1 416 555
  0142".
- The enquiry panel's note: "Free to ask. Your email and phone stay private
  until you choose to share them."
- Business and person names are data, in their own spelling ("Pelau House",
  "Former Sweet Hand user").
- Translated strings run about 30 % longer in French; every surface grows in
  height and wraps, never truncates.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (the title element, the icon,
  the class list) are computed once, not in the template.
- No listeners, observers or scripts: the stretched link and the sticky panel
  are pure CSS.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/Card.ts`
  renders the shared-contact thread pieces: Pelau House's contact card
  ("Pelau House", "hello@pelauhouse.example", "+1 416 555 0142"), the private
  note "Pelau House sees your name, not your email or phone.", the closed note
  "This enquiry is closed." and Andre C.'s quoted review in a well; iterations
  in `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `CatererPage` (enquiry panel), `Thread`, `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: loading wells and the loading panel have the final padding
  and roughly the final height, so nothing shifts when data arrives.
- Weight: no dependencies beyond the icon set; composes nothing it must import
  except for the skeleton markup of the loading panel.

## Acceptance criteria

### Card

- **AC-1** Given an interactive card for Pelau House with `href="/caterers/pelau-house"`, when a keyboard user tabs to it, then exactly one tab stop is reached, a `--color-focus-ring` ring surrounds the whole card with at least 3:1 contrast against the surface, and no second ring shows on the link. (L2-067)
- **AC-2** Given the interactive card for Pelau House at 360 px, when a visitor taps anywhere on its surface, then the browser opens `/caterers/pelau-house`, and the tap target measures at least 44 × 44 CSS px. (L2-065)
- **AC-3** Given a selected card "Name change" in the dark theme, when it renders, then its edge is `--color-accent` and shows at least 3:1 contrast against `--color-bg-surface`, and the edge is visibly thicker than an unselected card's. (L2-069)
- **AC-4** Given a card inside a `role="listbox"` with `selectedAttr` and `selected`, when it is inspected, then it has `role="option"` and `aria-selected="true"`, and a sibling that is not selected has `aria-selected="false"`. (L2-066)

### Well

- **AC-5** Given Kendra opens the dialog "Respond to Andre C.", when it renders, then the review sits in a `figure.well` whose `blockquote.review__body` reads "Doubles for 60 at the office, hot and on time. Kendra answered every question the same day." (L2-052)
- **AC-6** Given an operator opens "Keep Priya R.'s review hidden?" for her review of Sugar Dumplin, when it renders, then the review is in a `figure.well` above the "Reason" field. (L2-059)
- **AC-7** Given the sign-in quick check, when a screen reader enters the `fieldset.well`, then it announces the group name "Quick check" although the legend is visually hidden. (L2-068)
- **AC-8** Given the light and dark themes, when Andre C.'s quoted review renders in a well, then its text has at least 4.5:1 contrast against `--color-bg-surface-sunken`. (L2-069)

### Closed note

- **AC-9** Given Marcia's thread with Pelau House has status `Closed`, when she opens it, then no reply box is rendered and a `p.closed-note` reads "This enquiry is closed." (L2-032)
- **AC-10** Given Marcia's thread with Demerara Kitchen has status `Declined`, when she opens it, then a `p.closed-note` reads "This enquiry is closed." in place of the reply box. (L2-032)
- **AC-11** Given Marcia's enquiry to Sugar Dumplin has status `Open`, when she opens the thread, then a closed note above the reply box reads "Sugar Dumplin hasn't replied yet. We'll email you when they do." (L2-033)
- **AC-12** Given a thread whose customer deleted their account, when Kendra opens it in her dashboard, then the closed note reads "This person has left Sweet Hand, so replies can't be delivered." and the messages show "Former Sweet Hand user". (L2-072)
- **AC-13** Given the dark theme, when "This enquiry is closed." renders, then its text has at least 4.5:1 contrast against `--color-bg-surface-sunken`. (L2-069)

### Contact card

- **AC-14** Given Pelau House shared its details in Marcia's thread, when she views the thread, then a system message holds a `div.contact-card` with `strong` "Pelau House", then "hello@pelauhouse.example", then "+1 416 555 0142", left-aligned and without "Email:" or "Phone:" labels. (L2-035)
- **AC-15** Given Marcia opens "Share your contact details?" in her thread with Pelau House, when the dialog renders, then the contact card reads "Pelau House will see", "marcia.t@example.com", "+1 647 555 0187". (L2-035)
- **AC-16** Given a customer with no phone on file shares their details, when the contact card renders, then it shows the heading and the email only, with no empty line. (L2-035)
- **AC-17** Given a contact card with a 60-character email address at 320 px, when it renders, then the address wraps inside the card and the page does not scroll horizontally. (L2-064)

### Private note

- **AC-18** Given Marcia fills in the enquiry form to Pelau House, when the dialog renders, then a `p.private-note` with a lock icon reads "Pelau House sees your name, not your email or phone.", and the icon has `aria-hidden="true"`. (L2-035)
- **AC-19** Given an operator resolves Devon W.'s reported review, when the dialog renders, then a private note with the shield icon reads "Devon W. and Maracas Bay never see who reported this." (L2-054)
- **AC-20** Given an operator views Pelau House's food handler certificate in profile review, when the section renders, then an inline `span.private-note` reads "Only operators and the caterer see these". (L2-040)
- **AC-21** Given both themes, when "Private until you share it in a thread" renders on the account page, then it has at least 4.5:1 contrast against the canvas, and the screen reader reads the sentence with no icon name. (L2-069)

### Enquiry panel

- **AC-22** Given Pelau House's page at 1280 px, when it renders, then an `aside.enquiry-panel` named "Enquire" holds "Serves 20–300 guests", the occasions, the "Send an enquiry" button and the note "Free to ask. Your email and phone stay private until you choose to share them.", in that order. (L2-019)
- **AC-23** Given Pelau House's page at 1280 px, when the visitor scrolls to the reviews, then the enquiry panel stays in view `--space-8` from the top of the viewport. (L2-015)
- **AC-24** Given Pelau House's page at 360 px and at 800 px, when it renders, then the enquiry panel is not displayed and not in the accessibility tree, and exactly one "Enquire" region (the sticky bar) is exposed. (L2-019)
- **AC-25** Given Pelau House's page is loading at 1280 px, when the panel renders, then it has `aria-hidden="true"`, no accessible name, skeleton lines and a pill skeleton, and keeps the bordered panel's padding. (L2-066)

### Responsive and motion

- **AC-26** Given a 1280 px window at 200 % zoom, when Pelau House's thread renders with a contact card, a private note and a closed note, then all their text is visible and the page does not scroll horizontally. (L2-069)
- **AC-27** Given `prefers-reduced-motion: reduce`, when a visitor hovers the interactive Pelau House card, then the card does not move and the shadow and edge change with no visible transition. (L2-069)

## Implementation notes

- Folder `frontend/projects/components/src/lib/card/`; files
  `card.component.*` (`sh-card`, `CardComponent`), `well.component.*`
  (`sh-well`), `closed-note.component.*`, `contact-card.component.*`,
  `private-note.component.*` (with the three icon paths) and
  `enquiry-panel.component.*`.
- Styles: the "Card and well" section of `components.css` and the
  `.enquiry-panel` rules move into the components, class names unscoped;
  `.only-lg`, `.stack` and `.visually-hidden` stay global utilities.
- Design-system catch-up: the closed-note copy ends in a full stop (D-4); the
  inline `text-align: left` on contact cards in five mocks is replaced by the
  existing `.message--system .contact-card` rule; inline top margins on private
  notes belong to the parent stack. Add `overflow-wrap: anywhere` to the
  contact card's values (D-8); the rendering applies it with a specimen-only
  style.
- `.card__title` with `href` wraps the link; the stretched `::after` makes the
  card the target. Do not add `tabindex` to the card.
- No CDK primitive is needed. Composes [button](button.md) (footer, panel
  action), [status](status.md) (header meta) and [skeleton](skeleton.md)
  (loading panel).

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *One component or several?* Six small components in one library folder. The design-system page documents them together and they share tokens, but their markup and inputs differ (an `aside` landmark, a `fieldset`, a contact grid), so one `sh-card` with a `kind` input would carry inputs most uses ignore.
- **D-3** *Who owns the food handler certificate `dl.certificate`?* [Description list](description-list.md), whose design-system page lists `.certificate` among its layouts. The card page shows it only as one of the two "bordered exceptions".
- **D-4** *Does "This enquiry is closed" end in a full stop?* Yes. The design system ends it with one to match every other closed note; L2-032.5 quotes the words, and acceptance tests match the sentence including the stop.
- **D-5** *Are shared email and phone links (`mailto:`, `tel:`)?* No, plain text as in the mocks. L2-032.4 shows URLs in threads as plain text, and the design system says the formats speak for themselves; people can still copy them.
- **D-6** *How is selection exposed?* `.card--selected` always; `role="option"` with `aria-selected` only when the consumer says the card is in a listbox, because an `aria-selected` outside a composite widget is invalid ARIA.
- **D-7** *Is "Read-only" (four operator mocks) an acceptable private note?* Kept as an existing string, but new private notes name the audience. The design system's Don't forbids a privacy line without its audience; "Read-only" states a permission, not an audience, so it is the consumer's copy to improve, not a component rule.
- **D-8** *Do contact-card values wrap anywhere?* Yes, `overflow-wrap: anywhere`, like certificate numbers, so a long email cannot widen a 320 px thread. The design system is silent for contact cards; L2-064 forbids horizontal scrolling.
- **D-9** *Must the component render the `div.enquiry-panel` copies in dialog mocks?* No. They are the static picture of the caterer page behind the dialog; the product renders the real page there.
- **D-10** *Does the loading enquiry panel keep the `.only-lg` class?* Yes. It is part of the same column, and showing a skeleton panel below LG would put a box where the sticky bar belongs.
