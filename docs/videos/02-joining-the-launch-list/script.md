# 02 · Joining the launch list

The launch page has one job: let someone ask for a single email when Sweet Hand opens. This video follows a visitor through that sign-up form on the real launch site and the real API: what the form asks for, how it handles mistakes, what happens when the server is down or busy, and why its answer never reveals who is already on the list.

## What the form asks for

The form asks for four things and nothing else. First, I'm, with two cards: Planning an event, or A caterer. Neither is selected at first. Second, an email address. Third, a business name, but only for caterers, and it is optional. Fourth, a consent box, Email me when Sweet Hand opens, with the promise One email, nothing else, and a link to the privacy notice. The box starts unticked, every time.

Here it is in action. Choosing A caterer shows the business name field right after the role cards. The field stops at sixty characters, so a long name is simply cut off at the limit. Switch back to Planning an event and the field disappears, and the business name is not sent at all.

## Mistakes, all at once

Requirement L2-096 says the form checks everything before sending and shows every problem together, instead of one at a time.

Watch what happens with no role chosen, an email with no top-level domain, and the consent box left empty. Nothing is sent to the server. An error summary titled Fix 3 things lists the three messages in field order, and focus moves to it. Each message is a link: following one puts focus on that field. Fixing the email removes its inline message at once, and the summary catches up on the next submit. The Choose one link focuses the first role card.

The three messages are Choose one, Enter an email like name at example dot com, and Tick the box to get the email. With one problem the title reads Fix 1 thing, with two, Fix 2 things.

## The server checks again

The page is a convenience; the server is the authority. Anything sent straight to the API is validated again in the backend, in `backend/src/launch-list/rules.ts`. An unknown role, a malformed email, a business name over sixty characters or sent with the wrong role, control characters, or consent that is not true all get an HTTP 400 with a field-by-field problem. Nothing is stored and no email is sent. A body over four kilobytes is refused with 413. A request without the CSRF token, or from an origin that is not allowed, is refused with 403. And every sign-up must carry a bot-protection token; until a provider is chosen, a local stand-in issues and checks it.

If the page ever gets a 400 back, it shows the server's field errors with the same messages, the same way as its own.

## A successful sign-up

Here is the happy path. Marcia picks A caterer, gives a business name and email, ticks the box and presses Get the launch email. While it sends, the form locks: the cards and box are disabled, the text fields become read-only, the button reports itself busy, and screen readers hear Adding you to the list. A second click or Enter sends nothing more.

Then the form is replaced by Check your email, naming the address the link went to. Focus moves to the result, and a screen reader hears Check your email. We sent a confirmation link. Use a different address brings back an empty form, with no role selected and the box unticked again.

## When sending fails

Networks fail and servers restart, so requirement L2-097 says what happens then. In this recording the API process is really stopped before the visitor presses the button.

The request fails, and a danger alert reads We couldn't add you just now, then Your details are still here, with a short reference. The reference is the first eight characters of the response's correlation ID, or of an ID the page makes up when there is no response at all, so support can find the request in the logs. Every field keeps its value, and the button now reads Try again. Once the API is back, Try again sends the same details and the sign-up goes through. A request that takes longer than fifteen seconds is treated the same way.

## Never revealing who signed up

A sign-up form can leak who is on a list just by answering differently. This one never does. Whether the address is new, waiting for confirmation, or already confirmed, the API answers with the same status, the same headers and the same empty body, and the page shows the same Check your email.

What happens next is decided by email alone. A new address gets a pending record and a confirmation email. A pending address gets its details updated and a fresh confirmation link, which makes every earlier link stop working. A confirmed address changes nothing, and gets at most one short email a day saying it is already on the list, with a removal link.

Here Keisha, who confirmed earlier, signs up again. The page says exactly what it said to everyone else. The queued email, shown here straight from the outbox because no email provider has been chosen yet, is the already on the list message, and only Keisha's inbox will ever see it.

## Rate limits

An open form invites abuse, so the API counts. More than ten sign-ups from one IP address in an hour, and the next one gets HTTP 429 with a Retry-After header. The page shows the same error state as any other failure and does not retry by itself. Separately, one address that signs up more than three times in a day still gets the normal answer, but no further email is sent to it that day, so nobody can flood someone else's inbox.

The rate-limited message that names the wait still needs its mock, so for now the page reuses the failure alert.

## Recap

Things to remember:

- The form asks for a role, an email, an optional business name for caterers and ticked consent, and nothing else.
- Every problem shows at once, on the page and again from the server, and failures keep what was typed.
- The answer is always Check your email, so the page never reveals who is on the list.

Next, video three opens the confirmation email, confirms the address, and leaves the list again in one click.
