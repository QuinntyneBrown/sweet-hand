# Message thread

| Field | Value |
|---|---|
| Selector | `sh-thread` (the conversation, renders `article.thread`), `sh-message-list` (renders `ol.messages`), `sh-message` (one message, renders `li.message`), `sh-reply-box` (renders `form.reply-box`), `sh-thread-placeholder` (renders `div.thread-placeholder`) |
| Library path | `frontend/projects/components/src/lib/message/` |
| Status | planned |
| Traces to | L2-032, L2-033, L2-035, L2-036, L2-064, L2-065, L2-066, L2-067, L2-068, L2-069, L2-072, L2-080, L2-085 |
| Design system | [`message.html`](../../design-system/components/message.html) |
| Source mocks | [`pages/thread/default`](../../mocks/pages/thread/default.html), [`pages/thread/open`](../../mocks/pages/thread/open.html), [`pages/thread/declined`](../../mocks/pages/thread/declined.html), [`pages/thread/closed`](../../mocks/pages/thread/closed.html), [`pages/thread/invalid`](../../mocks/pages/thread/invalid.html), [`pages/thread/submitting`](../../mocks/pages/thread/submitting.html), [`pages/thread/shared`](../../mocks/pages/thread/shared.html), [`pages/thread/long`](../../mocks/pages/thread/long.html), [`pages/thread/edge`](../../mocks/pages/thread/edge.html), [`pages/thread/loading`](../../mocks/pages/thread/loading.html), [`pages/dashboard-enquiry/default`](../../mocks/pages/dashboard-enquiry/default.html), [`pages/dashboard-enquiry/former-user`](../../mocks/pages/dashboard-enquiry/former-user.html), [`pages/dashboard-enquiries/default`](../../mocks/pages/dashboard-enquiries/default.html), [`pages/inbox/default`](../../mocks/pages/inbox/default.html), [`notifications/toast/danger`](../../mocks/notifications/toast/danger.html) |
| Rendering | [`message.html`](message.html) |

## Purpose and scope

The message thread is one enquiry's conversation between a customer and a
caterer: who it is with and where it stands, the messages in time order, and a
reply box pinned to the bottom. Marcia reads her thread with Pelau House at
`/inbox/:id`; Kendra reads the same thread in her dashboard. "Mine" and
"theirs" flip with the viewer; the markup does not. It is the only place on
Sweet Hand where contact details are ever exchanged, and only after someone
chooses to share them.

The folder holds five pieces: `sh-thread` (the article with its head, action
row and ending), `sh-message-list` and `sh-message` (the ordered messages:
theirs, mine and system events), `sh-reply-box` (the sticky reply form) and
`sh-thread-placeholder` (the empty thread column on large screens). Use
something else for a caterer's public answer to a review ([review](review.md)),
a history of who did what (timeline), a one-off "Enquiry sent"
([toast](toast.md)) and the list of threads ([inbox row](inbox-row.md)).

Out of scope:

- The enquiry details block at the top of the thread (`dl.enquiry-summary`):
  [description list](description-list.md), projected into the thread's
  `summary` slot.
- The closed note, the contact card and the privacy line (`.closed-note`,
  `.contact-card`, `.private-note`): [card](card.md), projected into the
  thread's `ending` slot or into a system message.
- The textarea inside the reply box: [textarea](textarea.md) with
  `variant="reply"`; the error summary and counter styles come from
  [form field](form-field.md).
- The thread actions' dialogs (share contact, close, decline):
  [dialog](dialog.md); the action buttons are [button](button.md)s projected
  by the page.
- Sending, polling for new messages, deciding the status and who may reply
  (L2-032, L2-033, L2-034): the page and the API.
- The two-column inbox layout (`.inbox-layout`) and the dashboard's
  `.work-layout`: page layout; the thread fills whatever column it is given.

## Usage

Inventory from `usage_inventory.py docs/mocks message "li|div"` (44 theirs, 14
mine, 9 system, 2 pending, 1 failed), `… thread "article|div"` (16),
`… reply-box "form"` (32), `… thread-placeholder "div"` (12) and
`… messages "ol"` (36).

| Where | Configuration | Slots / content | States seen | Surface |
|---|---|---|---|---|
| `pages/thread/default` (Marcia ↔ Pelau House) | customer view: photo, "Replied", "View caterer", Share / Close, summary, 1 message, private note, reply box (icon-only send) | "Hi Marcia, congratulations to your parents! …" · "Pelau House · Today, 9:42 a.m." | replied | canvas |
| `pages/thread/open` (Sugar Dumplin) | customer, "Open", waiting note above the reply box | "Sugar Dumplin hasn’t replied yet. We’ll email you when they do." | open, no reply yet | canvas |
| `pages/thread/declined` (Demerara Kitchen) | system message with the reason, closed note, no actions | "Demerara Kitchen can’t take on this event" + “Fully booked that weekend.” | declined | canvas |
| `pages/thread/closed` (Ti Kay) | theirs, mine, system "Marcia Thompson closed this enquiry", closed note | "Bonswa Marcia! …" | closed | canvas |
| `pages/thread/submitting`, `dashboard-enquiry/submitting` | pending mine, reply box read-only, send busy | "You · Sending…" | submitting | canvas |
| `notifications/toast/danger` | failed mine with "Try again" | "Not sent · Try again" | failed | canvas |
| `pages/thread/invalid`, `dashboard-enquiry/invalid` | reply box with summary, inline error, over-limit counter | "Your reply wasn’t sent", "Keep your reply under 2,000 characters. It’s 2,143 now.", "2,143 / 2,000" | invalid | canvas |
| `pages/thread/shared`, `dashboard-enquiry/shared` | system messages + contact cards; "Contact details shared" replaces Share | "You shared your contact details with Pelau House", "Pelau House shared their contact details" | shared | canvas |
| `pages/thread/long` | many messages | 14 messages over a week | long scroll | canvas |
| `pages/thread/edge` | message with a URL and markup shown literally | "Our full menu is at https://pelauhouse.example/menu …" | edge | canvas |
| `pages/thread/loading` | `busy`, skeleton head, summary block and one bubble | h1 "Loading enquiry" (hidden) | loading | canvas |
| `pages/dashboard-enquiry/default`, `replied`, `declined`, `closed` (Kendra ↔ Priya, Marcia, Nadia, Jean-Robert) | caterer view: initials, "Sent yesterday at 4:15 p.m.", Share / Decline, reply box "Reply to Priya" with "Send" text button | "Priya sees Pelau House, not your email or phone." | open, replied, declined, closed | work layout |
| `pages/dashboard-enquiry/former-user` | person glyph, "Former Sweet Hand user", no actions, closed note | "This person has left Sweet Hand, so replies can’t be delivered." | former user | work layout |
| `pages/dashboard-enquiries/*`, `dialogs/close-enquiry`, `decline-enquiry`, `share-contact` (page behind) | thread beside the list at LG, or behind a dialog | as above | as above | canvas |
| `pages/inbox/default`, `dialogs/account-menu`, `notifications/site-banner` | placeholder at LG | three photos (Sugar Dumplin, Pelau House, Ti Kay), "Choose an enquiry to read it here." | empty column | canvas |

## Anatomy

**Thread** (`sh-thread`):

1. **Article** — `article.thread` with `aria-labelledby` the title's id: a
   flex column, `--space-6` between parts; `aria-busy="true"` while loading.
2. **Back link (below LG)** — `a.eyebrow.until-lg` "Inbox" (D-10) with a
   chevron, 44 px tall.
3. **Head** — `div.thread__head`: wrapping row, `--space-4` gap.
   - **Party** — `span.photo` with a decorative 56 px `img` (customer view),
     `span.avatar` with initials (caterer view), or `span.avatar` with a person
     glyph (former user); 3.5rem.
   - **Title** — `div.thread__title`: the heading (`h1#thread-title`, styled
     `--text-h3`) and `p.thread__status`: a [status label](status.md) plus
     "View caterer" link or "Sent yesterday at 4:15 p.m.".
4. **Actions** — `div.thread__actions`: wrapping row of small buttons
   (projected). Absent when the thread is closed, declined or the other party
   is gone.
5. **Summary** — projected `dl.enquiry-summary`.
6. **Messages** — `sh-message-list`.
7. **Ending** — projected: waiting note + reply box, reply box, or closed note.

**Message list** (`sh-message-list`): `ol.messages` with `aria-label`
"Messages", `--space-5` between items.

**Message** (`sh-message`):

1. **Item** — `li.message` with `.message--theirs`, `.message--mine` or
   `.message--system`, plus `.message--pending` / `.message--failed`.
2. **Sender prefix** — `span.visually-hidden` "Pelau House:" or "You:" (not on
   system messages).
3. **Bubble** — `p.message__bubble`: `--space-3` × `--space-4` padding,
   `--radius-lg` with the sender-side bottom corner at `--radius-xs`,
   `white-space: pre-wrap`, wraps anywhere. System messages have no bubble.
4. **Meta** — `span.message__meta`: "Sender · When", or "You · Sending…"
   (`role="status"`), or "Not sent · " plus a link-style "Try again" button.

**Reply box** (`sh-reply-box`):

1. **Form** — `form.reply-box[novalidate]`: sticky to the bottom, canvas
   background, hairline top rule, safe-area padding, `--z-raised`.
2. **Error summary (invalid only)** — `div.form-summary[role="alert"][tabindex="-1"]`
   with an `h3` and a list of links to the field.
3. **Label** — `label.reply-box__label` for the textarea.
4. **Row** — `div.reply-box__row`: the `sh-textarea` (`variant="reply"`) and
   the send [button](button.md): icon-only `.btn.btn--primary.btn--icon`
   "Send reply", or `.btn.btn--primary` with icon and "Send".
5. **Under-row** — `span.cluster.cluster--between`: the error
   (`.field__error`, when invalid), else the help (`.field__help`), then the
   counter (`.field__counter`, `data-over` past the limit).

**Placeholder** (`sh-thread-placeholder`): `div.thread-placeholder` with an
`aria-hidden` [photo row](photo.md) of three photos and one `p`.

Hosts: all are `display: contents`, so `.inbox-layout__thread`, the
`.messages` flex column and the sticky positioning work on the real elements.

## API

### `sh-thread` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `title` | `string` | — | yes | The other party: "Pelau House", "Priya Ramdial", "Former Sweet Hand user". Rendered as text in the heading. |
| `titleId` | `string` | `'thread-title'` | no | Heading id and the article's `aria-labelledby`. |
| `headingLevel` | `1 \| 2` | `1` | no | `h1` on the thread page; `h2` where the page already has an `h1` (the LG inbox with an "Inbox" `h1`). Styled `--text-h3` either way. |
| `party` | `{ kind: 'photo'; src: string } \| { kind: 'initials'; text: string } \| { kind: 'gone' }` | — | yes | Photo (56 × 56, `alt=""`), initials avatar, or the person glyph for a deleted account. |
| `statusTone` | `StatusTone` | — | yes | Passed to `sh-status` (`open`, `replied`, `declined`, `closed`). |
| `statusLabel` | `string` | — | yes | "Open", "Replied", "Declined", "Closed". |
| `viewLink` | `{ href: string; label: string } \| null` | `null` | no | Customer view: "View caterer" to `/caterers/pelau-house`. |
| `subline` | `string \| null` | `null` | no | Caterer view: "Sent yesterday at 4:15 p.m." |
| `backLink` | `{ href: string; label: string } \| null` | `null` | no | "Inbox" (the destination only, D-10), rendered as `a.eyebrow.until-lg` above the head. |
| `busy` | `boolean` | `false` | no | Renders the loading skeleton (circle, title bar, status bar, the summary well with its own skeleton bars, one bubble; D-12, D-13) with `aria-busy="true"`, and the heading's visually hidden `loadingLabel`. Slots are not rendered. |
| `loadingLabel` | `string` | — | yes when `busy` | "Loading enquiry". |

### `sh-message` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `kind` | `'theirs' \| 'mine' \| 'system'` | — | yes | Adds `.message--{kind}`. |
| `sender` | `string \| null` | `null` | yes unless `system` | "Pelau House", "You", "Former Sweet Hand user". Rendered as the hidden prefix "Pelau House:" and at the start of the meta. |
| `text` | `string` | — | yes | The message as written, rendered as text only: no HTML, no links; line breaks kept (L2-032.3–4). For `system`, the sentence ("Marcia Thompson closed this enquiry"). |
| `time` | `string \| null` | `null` | yes unless pending or failed | Already formatted in `America/Toronto`: "Today, 9:42 a.m.", "Mon 3 Aug, 9:30 p.m.". |
| `datetime` | `string \| null` | `null` | no | ISO timestamp rendered in a `time[datetime]` around `time` (D-6). |
| `delivery` | `'sent' \| 'pending' \| 'failed'` | `'sent'` | no | `mine` only. Adds `.message--pending` / `.message--failed`. |
| `sendingLabel` | `string` | — | yes when pending | "Sending…" — the meta reads "You · Sending…" in a `role="status"` span. |
| `failedLabel` | `string` | — | yes when failed | "Not sent". |
| `retryLabel` | `string` | — | yes when failed | "Try again", rendered as `button.btn.btn--link.btn--sm`. |

### `sh-message-list` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | The `ol`'s `aria-label`: "Messages". |

### `sh-reply-box` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `label` | `string` | — | yes | "Your reply" (customer), "Reply to Priya" (caterer). |
| `fieldId` | `string` | `'reply'` | no | Textarea id; help, error and counter ids derive from it (`reply-help`, `reply-error`, `reply-count`). |
| `value` | `string` | `''` | no | Two-way with `valueChange`. |
| `maxLength` | `number` | `2000` | no | Used for the counter and the on-submit check. Never rendered as `maxlength` (D-11). |
| `help` | `string` | — | yes | "Pelau House gets an email. Links show as plain text." / "Priya sees Pelau House, not your email or phone." |
| `counterLabel` | `string` | — | yes | Formatted by the consumer: "0 / 2,000", "2,143 / 2,000". `data-over` is set when the length exceeds `maxLength`. |
| `error` | `string \| null` | `null` | no | Inline error ("Keep your reply under 2,000 characters. It’s 2,143 now.", "Write a reply before sending"). Replaces the help, sets `aria-invalid` and `aria-describedby="reply-error reply-count"`. |
| `summaryTitle` | `string \| null` | `null` | no | "Your reply wasn’t sent"; with `error`, renders the error summary whose single link points at `#reply`. |
| `sendLabel` | `string` | — | yes | "Send reply" (icon-only `aria-label`) or "Send" (visible). |
| `sendStyle` | `'icon' \| 'text'` | `'icon'` | no | Customer side `icon`, caterer side `text` (both with the send icon). |
| `busy` | `boolean` | `false` | no | Textarea `readonly`, send button `aria-busy="true"` and `aria-disabled="true"` (never `disabled`). |

### `sh-thread-placeholder` inputs

| Input | Type | Default | Required | Rule |
|---|---|---|---|---|
| `photos` | `Array<{ src: string; size: 72 \| 104 }>` | — | yes | Exactly three of the customer's (or caterer's) own threads' photos, middle one 104 px; decorative. |
| `text` | `string` | — | yes | "Choose an enquiry to read it here." |

### Outputs

| Output | Payload | Emitted when |
|---|---|---|
| `sh-message` `retried` | `void` | "Try again" is activated on a failed message. |
| `sh-reply-box` `valueChange` | `string` | The text changes (from the textarea). |
| `sh-reply-box` `submitted` | `string` | Send is pressed, or <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> in the field, while not busy. Carries the text; validation is the consumer's. |

### Methods

| Method | Rule |
|---|---|
| `sh-reply-box` `focusField()` | Focuses the textarea; called after a successful send. |
| `sh-reply-box` `focusSummary()` | Focuses the error summary; called after an invalid send. |
| `sh-thread` `focusTitle()` | Focuses the heading (`tabindex="-1"`); called when a thread is opened from the inbox. |

### Content slots

| Slot | Accepts | Rule |
|---|---|---|
| `sh-thread` `[slot=actions]` | small `sh-button`s, or a `sh-private-note` "Contact details shared" | Rendered in `div.thread__actions`; the row is omitted when empty. |
| `sh-thread` `[slot=summary]` | one `sh-description-list` enquiry summary | After the actions. |
| `sh-thread` default | one `sh-message-list` | The messages. |
| `sh-thread` `[slot=ending]` | `sh-private-note`, `sh-closed-note`, `sh-reply-box` | In this order after the messages. |
| `sh-message-list` default | `sh-message` elements, oldest first | The consumer orders them (L2-032.1). |
| `sh-message` default (`system` only) | one `sh-contact-card` | Rendered after the sentence, left-aligned. |

- Translation: every label, help, error, counter and system sentence arrives
  from the resource files (L2-064); `text` of normal messages, party names and
  contact details are data, shown exactly as written in any language.

## Variants and sizes

| Variant | Where |
|---|---|
| Customer view | `pages/thread/*`: party photo, "View caterer", Share / Close, icon-only "Send reply". |
| Caterer view | `pages/dashboard-enquiry/*`: initials, "Sent … at …", Share / Decline, "Reply to Priya" with "Send". |
| Former user | `dashboard-enquiry/former-user`: person glyph, no actions, closed note. |
| Placeholder | `pages/inbox/default` at LG with nothing selected. |

| Message kind | Class | Look |
|---|---|---|
| Theirs | `.message--theirs` | Left, `--color-bg-subtle` bubble, squared bottom-left corner |
| Mine | `.message--mine` | Right, ink bubble (`--color-action`), squared bottom-right corner |
| System | `.message--system` | Centred muted sentence, no bubble |

One size and density. Bubbles are at most `min(36rem, 88%)` of the column;
the party image is 3.5rem; the send button is 44 px.

## States

| State | Trigger | Visual | Assistive technology |
|---|---|---|---|
| Open, no reply yet | status `Open` | Status "Open"; waiting closed-note above the reply box (customer) | Status text |
| Replied | status `Replied` | Reply box | — |
| Submitting | reply box `busy` + pending message | Pending bubble at full contrast (D-5), meta "You · Sending…" in italics; field read-only and emptied; send spinner | "Sending…" announced once (`role="status"`); focus stays in the field |
| Sent | delivery `sent` | Meta "You · Today, 10:02 a.m." | — |
| Failed | delivery `failed` | Bubble kept; meta "Not sent · Try again" in `--color-danger-fg` | Danger toast announces the failure (`role="alert"`); "Try again" is a button |
| Invalid | reply box `error` + `summaryTitle` | Summary, inline error, counter `data-over`; text kept | Focus moves to the summary; field `aria-invalid="true"` |
| Contact shared | system message + contact card | "Contact details shared" note replaces "Share my contact details" | Sentence read in order |
| Declined | status `Declined` | System message with the reason; no actions; closed note "This enquiry is closed." | — |
| Closed | status `Closed` | System message; no actions; closed note | — |
| Former user | `party.kind` `gone` | Person glyph, no actions, closed note "This person has left Sweet Hand, so replies can’t be delivered." | — |
| Loading | `busy` | Skeletons in the final layout | Article `aria-busy`; heading "Loading enquiry" |
| Placeholder | nothing selected at LG | Three photos, one line | Photos hidden; text read |
| Reply field focus | `:focus-visible` | Field's focus ring (textarea) | — |

## Markup

```html
<!-- rendered: customer view, replied -->
<article class="thread" aria-labelledby="thread-title">
  <a class="eyebrow until-lg" href="/inbox"><svg class="icon icon--sm" aria-hidden="true" viewBox="0 0 24 24">…</svg>Inbox</a>
  <div class="thread__head">
    <span class="photo"><img src="…/pelau-house-112.avif" alt="" width="56" height="56"></span>
    <div class="thread__title"><h1 id="thread-title" tabindex="-1">Pelau House</h1>
      <p class="thread__status"><span class="status status--replied">Replied</span><a href="/caterers/pelau-house">View caterer</a></p></div>
  </div>
  <div class="thread__actions">…Share my contact details… …Close enquiry…</div>
  <dl class="enquiry-summary">…</dl>
  <ol class="messages" aria-label="Messages">
    <li class="message message--theirs"><span class="visually-hidden">Pelau House:</span><p class="message__bubble">Hi Marcia, congratulations to your parents! …</p><span class="message__meta">Pelau House · <time datetime="2026-10-10T09:42-04:00">Today, 9:42 a.m.</time></span></li>
  </ol>
  <p class="private-note">…Pelau House sees your name, not your email or phone.</p>
  <form class="reply-box" novalidate>…</form>
</article>
```

```html
<!-- rendered: mine, pending and failed; system with a contact card -->
<li class="message message--mine message--pending"><span class="visually-hidden">You:</span><p class="message__bubble">Hi Kendra, yes please hold the date! …</p><span class="message__meta" role="status">You · Sending…</span></li>
<li class="message message--mine message--failed"><span class="visually-hidden">You:</span><p class="message__bubble">Yes please hold the date! I’ll confirm the final count by 7 November.</p><span class="message__meta">Not sent · <button class="btn btn--link btn--sm" type="button">Try again</button></span></li>
<li class="message message--system">Pelau House shared their contact details<span class="message__meta"><time datetime="2026-10-10T10:20-04:00">Today, 10:20 a.m.</time></span></li>
<li class="message message--system"><div class="contact-card"><strong>Pelau House</strong><span>hello@pelauhouse.example</span><span>+1 416 555 0142</span></div></li>
```

```html
<!-- rendered: reply box, invalid -->
<form class="reply-box" novalidate>
  <div class="form-summary" role="alert" tabindex="-1" id="reply-summary"><h3>Your reply wasn’t sent</h3><ul><li><a href="#reply">Keep your reply under 2,000 characters</a></li></ul></div>
  <label class="reply-box__label" for="reply">Your reply</label>
  <div class="reply-box__row">
    <textarea class="textarea" id="reply" name="reply" rows="2" aria-invalid="true" aria-describedby="reply-error reply-count">Hi Kendra, yes please hold the date! …</textarea>
    <button class="btn btn--primary btn--icon" type="submit" aria-label="Send reply"><svg class="icon" aria-hidden="true" viewBox="0 0 24 24">…</svg></button>
  </div>
  <span class="cluster cluster--between"><span class="field__error" id="reply-error">Keep your reply under 2,000 characters. It’s 2,143 now.</span><span class="field__counter" id="reply-count" data-over>2,143 / 2,000</span></span>
</form>
```

```html
<!-- rendered: loading -->
<article class="thread" aria-labelledby="thread-title" aria-busy="true">
  <div class="thread__head"><span class="skeleton skeleton--circle" style="width: 3.5rem; height: 3.5rem" aria-hidden="true"></span>
    <div class="thread__title"><h1 id="thread-title"><span class="visually-hidden">Loading enquiry</span><span class="skeleton skeleton--text" style="width: 10rem" aria-hidden="true"></span></h1><span class="skeleton skeleton--text" style="width: 6rem" aria-hidden="true"></span></div></div>
  <div class="enquiry-summary" aria-hidden="true"><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span><span class="skeleton skeleton--text"></span></div>
  <div class="message" aria-hidden="true"><span class="skeleton skeleton--rect" style="height: 4.5rem; width: 22rem; max-width: 100%"></span></div>
</article>
```

The caterer view differs only in the party (`span.avatar` "PR"), the status
line ("Sent yesterday at 4:15 p.m." in a `span`) and the reply box label and
send style. The placeholder is the design system's `div.thread-placeholder`
with `div.photo-row[aria-hidden]` and one `p`.

Consumer templates (binding syntax illustrative):

```html
<sh-thread [title]="thread.caterer.name" [party]="{ kind: 'photo', src: thread.caterer.photo }" [statusTone]="tone(thread.status)" [statusLabel]="t('enquiry.status.' + thread.status)"
    [viewLink]="{ href: '/caterers/' + thread.caterer.slug, label: t('thread.viewCaterer') }" [backLink]="{ href: '/inbox', label: t('thread.backToInbox') }">
  <sh-button slot="actions" size="sm" haspopup="dialog">{{ t('thread.share') }}</sh-button>
  <sh-description-list slot="summary" variant="enquiry-summary" …></sh-description-list>
  <sh-message-list [label]="t('thread.messages')">
    @for (m of thread.messages; track m.id) { <sh-message [kind]="m.mine ? 'mine' : 'theirs'" [sender]="m.mine ? t('thread.you') : m.senderName" [text]="m.text" [time]="fmt(m.at)" [datetime]="m.at" [delivery]="m.delivery" … (retried)="resend(m)"></sh-message> }
  </sh-message-list>
  <sh-reply-box slot="ending" [label]="t('thread.yourReply')" [help]="t('thread.replyHelp', { name: thread.caterer.name })" [(value)]="draft" [counterLabel]="…" [busy]="sending()" (submitted)="send($event)"></sh-reply-box>
</sh-thread>
```

The e2e page objects locate threads by `.thread`, `.thread__head`,
`.thread__status`, `.thread__actions`, `.messages`, `.message--{kind}`,
`.message--pending`, `.message--failed`, `.message__meta`, `.reply-box`,
`.reply-box__label`, `.form-summary`, `.field__counter[data-over]` and
`.thread-placeholder`; those are part of the contract.

## Design

- Thread: flex column, `--space-6` gap, `min-width: 0`.
- Head: wrapping row, `--space-4` gap; party 3.5rem; title column `--space-1`
  gap, heading `--text-h3`; status line `--text-body-sm`, muted,
  `--space-1` × `--space-3` gaps.
- Actions: wrapping row, `--space-2` gap.
- Messages: `--space-5` apart; message column `--space-1` gap, max width
  `min(36rem, 88%)`; bubble `--space-3` × `--space-4`, `--radius-lg`, tail
  corner `--radius-xs`; meta `--text-caption`, `--color-fg-subtle`,
  `--space-1` inline padding; pending meta italic; system `--text-body-sm`
  muted, centred, full width.
- Reply box: `position: sticky; bottom: 0`, `--space-4` top padding,
  `--space-4` plus `env(safe-area-inset-bottom)` bottom padding,
  `--color-bg-canvas`, hairline `--color-border-default` top rule,
  `--z-raised`; `--space-2` gap; label `--text-label`; field minimum
  `--control-height-lg`, `--radius-lg`, grows to 33dvh.
- Placeholder: centred column, `--space-4` gap, `--space-16` block padding,
  muted; photo row 72 / 104 / 72 px.
- Motion: none on messages; send spinner from [spinner](spinner.md).

Component tokens: none. "Mine" reuses the action pair so your own words read
in ink; pepper never appears in a bubble.

## Colour

| Part | Token | Light | Dark |
|---|---|---|---|
| My bubble | `--color-action` | `--palette-stone-950` | `--palette-stone-100` |
| My bubble text | `--color-fg-on-action` | `--palette-white` | `--palette-stone-950` |
| Their bubble | `--color-bg-subtle` | `--palette-stone-100` | `--palette-stone-800` |
| Their bubble text | `--color-fg-default` | `--palette-stone-950` | `--palette-stone-100` |
| Meta | `--color-fg-subtle` | `--palette-stone-600` | `--palette-stone-400` |
| System message | `--color-fg-muted` | `--palette-stone-700` | `--palette-stone-350` |
| Failed meta | `--color-danger-fg` | `--palette-sorrel-600` | `--palette-sorrel-300` |
| Reply box | `--color-bg-canvas` | `--palette-white` | `--palette-stone-950` |
| Reply box rule | `--color-border-default` | `--palette-stone-200` | `--palette-stone-750` |

| Foreground | Background | Minimum | Use |
|---|---|---|---|
| `--color-fg-on-action` | `--color-action` | 4.5:1 | My bubble text |
| `--color-fg-default` | `--color-bg-subtle` | 4.5:1 | Their bubble text |
| `--color-fg-subtle` | `--color-bg-canvas` | 4.5:1 | Meta (sender and time) |
| `--color-fg-muted` | `--color-bg-canvas` | 4.5:1 | System message |
| `--color-danger-fg` | `--color-bg-canvas` | 4.5:1 | "Not sent" meta |
| `--color-border-strong` | `--color-bg-canvas` | 3:1 | Reply field border |
| `--color-focus-ring` | `--color-bg-canvas` | 3:1 | Focus on the field, Send and "Try again" |

Forced colours: bubbles lose their fills; sides and the hidden sender prefix
still tell the parties apart, and the textarea keeps its system border.

## Responsive behaviour

- Below LG (62rem) the inbox shows the list or the thread, never both, and
  the thread shows the back link "Inbox" (L2-036.2). From LG the thread sits beside
  the list; with nothing selected the column shows the placeholder (L2-036.1).
  The page layout does the switching; the thread fills its column.
- Bubbles are at most `min(36rem, 88%)`: about 290 px at 360 px, so "mine" and
  "theirs" still read as two sides. Text keeps the sender's line breaks and
  wraps anywhere, so a pasted URL wraps at 320 px.
- The head wraps; on phones the actions drop below the title. Small action
  buttons are 44 px tall below 48rem, 36 px with 8 px gaps from 48rem.
- The reply box stays at the bottom of the viewport with safe-area padding, so
  Send clears the home indicator and stays visible with the on-screen keyboard
  open (L2-036.3); the textarea grows to a third of the viewport, then
  scrolls.
- No breakpoint hides or reorders messages; a long thread scrolls.

## Accessibility

### Role and pattern

An `article` named by the party's heading; messages are an `ol` named
"Messages" because order matters (the spirit of the [APG Feed
pattern](https://www.w3.org/WAI/ARIA/apg/patterns/feed/) without its keyboard
model). The reply is a native `form`.

### Keyboard

| Key | Action |
|---|---|
| <kbd>Tab</kbd> | "Inbox" back link → View caterer → thread actions → "Try again" or links in the messages → reply field → Send. |
| <kbd>Enter</kbd> | In the reply field: a new line. It never sends. |
| <kbd>Ctrl</kbd>/<kbd>⌘</kbd>+<kbd>Enter</kbd> | Sends from the reply field. |
| <kbd>Enter</kbd> / <kbd>Space</kbd> | On Send or "Try again": sends. |

### Focus

- Opening a thread from the inbox moves focus to the thread heading.
- After a send, focus stays in the (now empty) reply field.
- After an invalid send, focus moves to the error summary, whose link returns
  to the field.
- After "Try again", focus stays on the failed message's position (the new
  pending meta); the button is replaced, so focus moves to the reply field.
- The sticky reply box never covers the focused element (WCAG 2.4.11): the
  thread adds bottom scroll padding equal to the reply box's height.

### Labelling

- Every message starts with a visually hidden sender ("Pelau House:", "You:")
  on both sides of the product; the meta repeats it for sighted users.
- The reply field has a visible label and `aria-describedby` pointing at the
  help (or the error) and the counter.
- Icon-only send is `aria-label="Send reply"`; "Try again" is a real button.
- The party image is decorative; the heading names the party.

### Announcements

"Sending…" is a `role="status"` meta, announced once. A failed send is
announced by the danger [toast](toast.md) (`role="alert"`). The invalid
summary is `role="alert"` and receives focus. New incoming messages are not
announced while the thread is open (D-7).

### Motion

New messages appear in place without sliding. The send spinner keeps turning
under reduced motion (it reports status). Scrolling to the newest message on
open uses `scroll-behavior`, which `prefers-reduced-motion: reduce` sets to
`auto`.

## Content and internationalisation

- Meta is "Sender · When": "Pelau House · Today, 9:42 a.m.", "Ti Kay · Mon 3
  Aug, 9:30 p.m." "Today" and weekdays in the current week, "Sat 21 Nov"
  otherwise; "a.m."/"p.m." lower case with periods; `America/Toronto`.
- System messages are one plain sentence naming who did what: "Demerara
  Kitchen can’t take on this event", "Marcia Thompson closed this enquiry",
  "Closed automatically 30 days after the event.", "Marcia Thompson shared
  their contact details". A decline quotes the reason: “Fully booked that
  weekend.”
- Help says who sees what: "Pelau House gets an email. Links show as plain
  text." / "Priya sees Pelau House, not your email or phone."
- Errors give the limit and the count: "Keep your reply under 2,000
  characters. It’s 2,143 now." Empty: "Write a reply before sending".
- Messages show exactly as written, with emoji, Kreyòl, French and Spanish
  intact ("Bonswa Marcia!"); links and markup are plain text.

## Performance

- Change detection: re-renders only when its inputs change (`OnPush` or the
  chosen framework's equivalent); derived values (meta strings, classes, the
  counter's `data-over`) are computed once, not in the template.
- A new message appends one `li`; existing messages are tracked by id and
  never re-rendered.
- Message text is set as text content, never through an HTML sink.
- Perf-test scenario: `frontend/projects/perf-test/src/scenarios/MessageThread.ts`
  renders Marcia's long thread with Pelau House (`pages/thread/long`, 14
  messages) and sends one reply; iterations in
  `e2e/perf-test/config/scenario-iterations.mjs` keep it at roughly
  100–300 ms.
- Composite scenarios: `Inbox` (LG, list beside thread), `DashboardEnquiry`,
  `DarkTheme`.
- Regression rule: a change to the template, inputs, styles or change
  detection is measured against the base branch with `--fail-on-regression`
  before it is pushed.
- Layout stability: the loading skeleton matches the head, summary and first
  bubble; the party image reserves 56 × 56; the reply box has a fixed minimum
  height, so the pending message appears without moving the box.
- Weight: composes [status label](status.md), [photo](photo.md), avatar,
  [button](button.md), [textarea](textarea.md), [card](card.md) pieces and
  [skeleton](skeleton.md); no date or chat library.

## Acceptance criteria

### Rendering

- **AC-1** Given Marcia's thread with Pelau House holding the enquiry and 4 replies, when she opens it, then the enquiry summary comes first and the 4 messages follow in an `ol.messages` from oldest to newest, each with a sender and a time such as "Pelau House · Today, 9:42 a.m.". (L2-032)
- **AC-2** Given Marcia's message and Pelau House's reply, when the customer view renders, then hers is `li.message--mine` on the right in an ink bubble and Pelau House's is `li.message--theirs` on the left, and each begins with a visually hidden "You:" or "Pelau House:". (L2-032)
- **AC-3** Given Kendra views the same thread, when the caterer view renders, then Kendra's own reply is `.message--mine`, Marcia's messages are `.message--theirs`, and each still begins with a hidden sender prefix. (L2-032)
- **AC-4** Given a message containing `<script>alert(1)</script>`, when the thread renders, then the text shows literally and no script runs. (L2-080)
- **AC-5** Given Pelau House's message "Our full menu is at https://pelauhouse.example/menu", when it renders, then the URL is plain text and not a link. (L2-032)
- **AC-6** Given the thread with Pelau House is `Replied`, when the head renders for Marcia, then it shows the 56 px photo with `alt=""`, the heading "Pelau House", the status "Replied" and the link "View caterer". (L2-033)
- **AC-7** Given Kendra's enquiry from Priya Ramdial is `Open`, when the caterer view renders, then the head shows the "PR" avatar, "Priya Ramdial", "Open" and "Sent yesterday at 4:15 p.m.", and the actions "Share my contact details" and "Decline". (L2-033)
- **AC-8** Given Demerara Kitchen declined Marcia's enquiry with "Fully booked that weekend", when she opens the thread, then a system message names the decline and quotes the reason, no thread actions appear, and no reply box is rendered. (L2-033)
- **AC-9** Given Marcia shared her contact details in the Pelau House thread, when Kendra views it, then a system message reads "Marcia Thompson shared their contact details" followed by a contact card with "marcia.t@example.com" and "+1 647 555 0187". (L2-035)
- **AC-10** Given Kendra's thread with a customer who deleted their account, when it renders, then the heading reads "Former Sweet Hand user" with the person glyph, there are no actions, and the thread ends with "This person has left Sweet Hand, so replies can’t be delivered." (L2-072)

### Reply states

- **AC-11** Given Marcia types a 120-character reply and presses Send, when the request is in flight, then her message appears at the end as `.message--pending` with meta "You · Sending…" in a `role="status"` element, the field is read-only and empty, and Send has `aria-busy="true"` and no `disabled` attribute. (L2-032)
- **AC-12** Given the pending reply is accepted, when the response arrives, then the message drops `.message--pending`, its meta reads "You · Today, 10:02 a.m.", and focus is in the empty reply field. (L2-032)
- **AC-13** Given a reply of 2,143 characters, when Marcia presses Send, then nothing is sent, the summary "Your reply wasn’t sent" receives focus, the field has `aria-invalid="true"` described by "Keep your reply under 2,000 characters. It’s 2,143 now." and the counter "2,143 / 2,000" has `data-over`, and her text is kept. (L2-068)
- **AC-14** Given an empty reply, when Marcia presses Send, then nothing is sent and the inline error "Write a reply before sending" is shown and linked from the summary. (L2-032)
- **AC-15** Given a reply fails to send, when the failure is reported, then the bubble stays with its text, the meta reads "Not sent · Try again" in `--color-danger-fg`, "Try again" is a `button`, and activating it emits `retried` once. (L2-068)
- **AC-16** Given the reply field has focus, when Marcia presses Enter, then a new line is inserted and nothing is sent; when she presses Ctrl+Enter (⌘+Enter on macOS), then `submitted` is emitted with her text. (L2-067)

### Keyboard and focus

- **AC-17** Given Marcia opens the Pelau House thread from her inbox at 360 px, when it renders, then focus is on the heading "Pelau House", Tab then reaches "View caterer", "Share my contact details", "Close enquiry", the reply field and "Send reply" in that order, and Shift+Tab from the heading reaches the back link "Inbox". (L2-067)
- **AC-18** Given keyboard focus on "Send reply" or "Try again" in either theme, when it is displayed, then a focus ring with at least 3:1 contrast is visible and is not covered by the sticky reply box. (L2-067)

### Screen readers

- **AC-19** Given a screen reader reads the thread, when it reaches the messages, then it announces a list named "Messages" with the correct item count, and each item starts with its sender ("Pelau House:", "You:"). (L2-068)
- **AC-20** Given the thread in each state (open, replied, submitting, invalid, shared, declined, closed, former user, loading), when axe-core runs with WCAG 2.1 A and AA rules, then it reports 0 violations. (L2-066)

### Theming

- **AC-21** Given the light and the dark theme, when "mine" and "theirs" bubbles render, then each bubble's text has at least 4.5:1 contrast against its fill, and no bubble uses `--color-accent`. (L2-069)
- **AC-22** Given the light and the dark theme, when the meta, system messages and "Not sent" render on the canvas, then each has at least 4.5:1 contrast. (L2-069)

### Responsive

- **AC-23** Given viewport LG or XL with Marcia's inbox open and no thread chosen, when the page renders, then the thread column shows the placeholder with three photos and "Choose an enquiry to read it here."; when she chooses Pelau House, then the thread replaces the placeholder beside the list. (L2-036)
- **AC-24** Given viewport XS with a thread open, when the on-screen keyboard is open in the reply field, then the reply box stays at the bottom of the visible area and "Send reply" remains visible and tappable. (L2-036)
- **AC-25** Given a 320 px viewport, when `pages/thread/edge` renders with a long unbroken URL, then the bubble wraps it inside the column and the page does not scroll horizontally. (L2-064)
- **AC-26** Given a 360 px viewport, when the thread actions and Send render, then each is at least 44 × 44 CSS px and neighbouring actions are at least 8 px apart. (L2-065)
- **AC-27** Given a 1280 px window at 200 % zoom, when the thread renders, then all messages, the actions and the reply box are usable without horizontal scrolling. (L2-069)

### Motion

- **AC-28** Given `prefers-reduced-motion: reduce`, when a thread opens and scrolls to its newest message and a new message is added, then the scroll is instant and nothing slides in. (L2-069)

### Performance

- **AC-29** Given the `MessageThread` perf-test scenario with 14 messages, when a reply is sent, then the pending message is painted within 200 ms of the press (Interaction to Next Paint), no existing message re-renders, and the scenario does not regress against the base branch with `--fail-on-regression`. (L2-085)

## Implementation notes

- Folder `frontend/projects/components/src/lib/message/`; files
  `thread.component.*` (`sh-thread`, `ThreadComponent`),
  `message-list.component.*` (`sh-message-list`), `message.component.*`
  (`sh-message`), `reply-box.component.*` (`sh-reply-box`) and
  `thread-placeholder.component.*` (`sh-thread-placeholder`).
- Composes [status label](status.md), [photo](photo.md) and avatar,
  [button](button.md) (Send, "Try again"), [textarea](textarea.md)
  (`variant="reply"`, its `submitRequested` drives `submitted`), the
  [card](card.md) pieces (`sh-closed-note`, `sh-contact-card`,
  `sh-private-note`) through slots, and [skeleton](skeleton.md).
- Styles: the "Message thread" section of `components.css` moves into the
  components, class names unscoped. Add `scroll-padding-bottom` for the sticky
  reply box (D-8).
- Mock drift to fix as screens are built: caterer-side messages lack the hidden
  sender prefix; the failed message lacks it and has "Try again" as text; the
  caterer side uses `.field__label` for the reply label and puts the status
  outside `.thread__title`; the over-limit counter uses an inline colour
  instead of `data-over`; the reply textarea has `maxlength="2000"` (D-11); the
  loading mock uses `skeleton--title` in the heading and one 12rem summary
  block (D-12, D-13); the caterer send button is both `disabled` and
  `aria-busy`; "Sending…" is a live region on the caterer side only.
- No CDK primitive is needed.

## Decisions

- **D-1** *Which framework does this API target?* Framework-neutral inputs, outputs and slots with the `sh-` prefix, because no stack ADR exists yet. The class names and attributes in *Markup* are the binding contract whatever the stack (AGENTS.md: BEM parity with the mocks).
- **D-2** *Which pieces does this CRD own?* The thread, message list, message, reply box and placeholder — everything on the design system's "Message thread" page except the enquiry summary ([description list](description-list.md)) and the closed note, contact card and private note ([card](card.md)), which those CRDs already own and this one composes through slots.
- **D-3** *Why one `sender` input rather than "mine" detection?* The API returns who sent each message and the page knows the viewer; the component only renders `kind` and `sender`, so the same markup serves both sides and a former user.
- **D-4** *Is the heading an `h1`?* Yes on the thread page, as the mocks do; `headingLevel` 2 serves the LG inbox where the page's `h1` is "Inbox". It is styled `--text-h3` either way.
- **D-5** *Is a pending bubble dimmed?* No. The design-system text says 60 % opacity, but `components.css` (the source of truth) keeps full contrast with the comment "the 'Sending…' meta line carries the state". Full contrast keeps text at 4.5:1 without depending on a composite.
- **D-6** *Is the time machine-readable?* Yes: `time[datetime]` around the formatted time when `datetime` is given. The mocks use plain text; a `time` element changes nothing visually and lets tests and assistive tools read the exact moment.
- **D-7** *Are incoming messages announced while the thread is open?* No. New messages arrive by polling (up to every 60 seconds, L2-029.3) and appear in place; announcing them would interrupt someone typing a reply. The unread count in the header updates instead.
- **D-8** *How does the sticky reply box avoid hiding focus?* The thread sets `scroll-padding-bottom` to the reply box's height, so a focused "Try again" or link scrolls clear of it (WCAG 2.4.11).
- **D-9** *What does "Try again" do with focus?* The failed meta becomes the pending meta, so the button disappears; focus moves to the reply field rather than being lost to the body.
- **D-10** *What does the back link say?* "Inbox", the destination only, with a chevron, by the user's decision of 10 Oct 2026 (the mocks say "Back to inbox"; the chevron already says "back"); L2-036.2 was amended on 10 Oct 2026 to match.
- **D-11** *Does the reply textarea carry `maxlength`?* No, aligned with [textarea](textarea.md) D-3: the limit is a visible counter and a check on submit, so a pasted draft over 2,000 characters is kept for trimming rather than cut off silently. `maxLength` only drives the counter and the error.
- **D-12** *How does the thread's summary load?* With the summary well's own skeleton bars (`div.enquiry-summary[aria-hidden]` holding four `skeleton--text` bars), aligned with [description list](description-list.md) D-8, rather than a single 12rem block.
- **D-13** *Which shape stands in for the loading heading?* `skeleton--text` inside the `h1`, aligned with [skeleton](skeleton.md) D-8; `skeleton--title` would draw a block twice the line's height and shift on load.
