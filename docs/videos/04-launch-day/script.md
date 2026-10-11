# 04 · Launch day

Everyone on the launch list was promised one thing: one email when Sweet Hand opens. This video shows how that email goes out, what changes on the launch site the moment it does, and how the list is deleted afterwards. Everything here runs against the real API on PostgreSQL, using the real operator command.

## One explicit command

There is no button for this in any web page. On launch day an operator runs one command in the backend: `npm run launch-email`. Requirement L2-101 asks for exactly that, so the launch email can never be sent by a stray click.

The command does two things. First, it records the launch in the database, which closes sign-ups and stops confirmation links from confirming anything. Then it queues one launch-day email for each confirmed address, and marks each record in the same transaction as its email. Addresses still waiting for confirmation get nothing, and removed addresses no longer exist.

For this recording the list held three people. Andre and Marcia had confirmed; Keisha had signed up but never confirmed. The first run queued two emails. Running the command a second time queued nothing and reported the two as already queued. Because each record is marked as its email is queued, a second run, or a run resumed after a crash, can never send anyone a second launch-day email.

## Two kinds of launch-day email

The email depends on the role chosen at sign-up. Someone planning an event gets a link to the caterer listing. A caterer gets a link to caterer registration, and the email mentions the food handler certificate they will need. Like every launch list email, both name Sweet Hand as the sender, give the operator's mailing address and a contact address, say when the person asked for the email, and carry a removal link with the one-click unsubscribe headers. That is what Canada's anti-spam law, CASL, requires.

The emails go out through the same outbox as every other email, sent in the background at no more than the provider's rate limit. Failed sends are retried, and hard bounces are not.

## The launch site after the command

Here is the launch site right after the command ran. A visitor fills in the form and presses Get the launch email. The API now refuses sign-ups with HTTP 410 Gone and stores nothing, and until that message has its own mock, the page shows its usual failure alert.

Next, Keisha finally opens the confirmation link from days ago. Confirmations are closed too, so the API answers 410 and the page shows That link has expired. Nothing is confirmed.

Now the two queued launch-day emails. Marcia's is the caterer version, linking to registration and mentioning the food handler certificate. Andre's is the customer version, linking to the caterer listing. Leaving still works after launch: Andre follows the removal link and is off the list at once.

## What still has to happen

The command closes the list, but two parts of launch day are still waiting on decisions, and it is worth being honest about them.

First, swapping the launch site for the product at the root address is a hosting change, and the host and CDN are still to be chosen. Second, after the swap, old links in people's inboxes will arrive at the product rather than the launch site. The design gives the product a small redirect: a removal link goes to a removal page that still deletes the record, and a confirmation link quietly drops its token. That page needs its mock before it can be built, so it is not part of the app yet. Until the swap, the launch site itself handles every link correctly, as you just saw.

## Deleting the list

The list exists for one email, so it does not outlive it. Every hour, a background job sweeps the launch list. Before launch it deletes any unconfirmed record whose last confirmation email is more than forty-eight hours old. Thirty days after launch day it deletes every remaining record, every token and every queued launch email, and logs only how many it deleted. The launch record itself stays, so sign-ups remain closed.

Throughout, the list is never used for anything else. It is never linked to a Sweet Hand account and never shared with caterers or anyone but the email provider. Logs and metrics about it hold counts and hashed identifiers, never an email address, a business name or a token.

## Recap

Things to remember:

- Launch day is one explicit command, `npm run launch-email`, safe to run twice.
- It closes sign-ups and confirmations at once, sends confirmed addresses one email for their role, and leaves removal working.
- Thirty days later the hourly sweep deletes the whole list.

That completes the launch app: the page, joining, confirming and leaving, and launch day itself.
