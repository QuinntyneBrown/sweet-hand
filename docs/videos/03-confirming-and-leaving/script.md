# 03 · Confirming and leaving

Signing up only starts the process. An address counts once its owner confirms it from their own inbox, and leaving must be just as easy as joining. This video follows the confirmation email and the removal link on the real launch site and API, and looks at what is stored along the way.

## Double opt-in

Requirement L2-099 makes the launch list double opt-in. The confirmation email carries one link back to the launch site. It works once, and only for forty-eight hours. If the person ignores it, nothing happens, and an hourly job deletes the unconfirmed record after forty-eight hours.

There is no email provider chosen yet, so in these recordings the email appears as what the API really queued: its outbox record, with the sender, the address, the confirmation link, the removal link and the sender details. The wording of the emails still needs its mock.

## Confirming

Marcia has just signed up as a caterer. Here is the queued confirmation email, with a link carrying a long random token. Marcia follows it. For a moment the address bar shows the token. The page does not confirm anything just because it was opened: after it loads, it sends the token to the API in a POST request. That matters, because email security scanners fetch links to check them, and a scanner must never confirm someone by accident.

The API marks the record confirmed and records the time. The form is replaced by You're on the list, See you on launch day, and a Remove my email button. Focus moves to the heading so a screen reader hears it at once, and Remove my email is the next control. Then the page removes the token from the address bar with history dot replace state, so reloading or sharing the page shows the ordinary launch page.

## The same thing on a phone

The same flow on a phone. Devon opens the link from the queued email, and the confirmed state fits the narrow screen without any sideways scrolling.

## Links that no longer work

What if Marcia opens the same link again? Confirmation links are single-use, so the page shows a warning: That link has expired, Enter your email again for a new one, above an empty form. The same warning appears for a link more than forty-eight hours old, one replaced by a newer email, or a token the server has never seen. The list does not change, and the warning is announced as a status message.

## Leaving in one click

Requirement L2-100 says leaving takes one click, with no sign-in and no confirmation step, and that it deletes the record rather than hiding it.

From the confirmed page, Andre presses Remove my email. The record is deleted at once, and an alert reads You're off the list, We've deleted, followed by the address, above an empty form with the consent box unticked.

Every email the launch list sends also carries a removal link. Keisha follows the one in the queued email. The link points at the API, which answers with a redirect to the launch page carrying the removal token. Opening that link deletes nothing by itself, again because scanners fetch links. The page then posts the token, the record is deleted, and the token is cleared from the address bar.

If Keisha opens the same removal link a second time, there is nothing left to delete. The page still says You're off the list, but it no longer names any address, so an old link cannot reveal who was on the list.

## One-click unsubscribe from the mail client

Mail clients offer their own unsubscribe button, and requirement L2-100 asks for that too. Every launch list email carries a List-Unsubscribe header with the HTTPS removal address, and List-Unsubscribe-Post set to One-Click, as RFC 8058 describes. When the mail client posts to that address, the record is deleted with no page shown. This is the one request that skips the CSRF check: a mail client has no cookie, so the removal token is its only authority, and it can only ever delete.

Here are the real responses from the API. A plain GET of the removal link answers with a 303 redirect and the record is still there. The one-click POST answers 200 and the record is gone, along with its tokens.

## What is stored

Requirement L2-103 keeps the record small. Here is a confirmed record from PostgreSQL. It holds the role, the email address, the business name when given, a consent record, the status and timestamps. The consent record keeps the exact wording that was shown, Email me when Sweet Hand opens and One email, nothing else, the privacy notice version, the page address, and when the person signed up and confirmed.

Tokens are never stored as they are. Each one has two hundred and fifty-six bits from a secure random source, and only its SHA-256 hash is kept, so the token table never holds a working token. A used confirmation token is marked consumed. Removing an address deletes the record, its tokens and any email still queued for it, so nothing more can reach that inbox.

## Recap

Things to remember:

- A sign-up only counts once it is confirmed from the inbox, with a single-use link that lasts forty-eight hours.
- Pages post tokens after loading and then clear them from the address bar, so scanners and shared links do no harm.
- Leaving is one click from the page, the email, or the mail client, and it deletes the record.

Next, video four looks at launch day: the one email everyone confirmed asked for, and what happens to the launch site and the list afterwards.
