# 01 · The launch site

Sweet Hand isn't open yet. Until launch day, the address people reach from the printed flyer shows one page: the launch site. This video walks through that page running for real, built for production and talking to the real Sweet Hand API on PostgreSQL, and shows what it promises a visitor before they type anything.

By the end you'll know what the page shows, how its two buttons take people to the form, and how it holds up on a phone, in dark mode, from the keyboard and even with JavaScript turned off.

## What the page shows

Here is the page as a visitor first sees it. At the top, the Sweet Hand wordmark and a Get the launch email button. Then the hero: three round food photos, the line Opening soon, Toronto and the GTA, and the heading Find someone with a sweet hand. Below that sits the sign-up form, then How it works in three steps, Browse, Enquire and Agree, then a call-out for caterers, and a footer with Privacy and Contact.

That order and that copy come straight from the launch mock, and requirement L2-093 pins them down. Notice what is missing: there is no sign-in, no registration and no caterer listing link, because the product is not open. The only places the page links to are the page itself, the privacy notice and a contact email address.

## Two ways to the form

There are two buttons that bring a visitor to the form, and requirement L2-094 says how each one behaves.

Watch the header button first. It scrolls the page down to the form and moves keyboard focus to the Get the launch email heading, so a screen reader user lands in the right place too. Next, the visitor picks Planning an event and types an email address. Then they change their mind and press Join as a caterer at the bottom of the page. The page scrolls back up, A caterer is now selected, the business name field appears, and the email they already typed is still there.

If the system asks for reduced motion, both buttons jump instead of scrolling smoothly. And a link straight to the notify anchor opens the page already scrolled to the form.

## Keyboard and screen readers

Accessibility is a requirement, not a polish step. The target is WCAG 2.2 AA in every state, in both themes. Here is what that looks like from the keyboard.

The first Tab shows a Skip to main content link. Enter follows it. The next Tabs move through the form in reading order with a visible focus ring. The two role cards are one radio group labelled I'm, so Space selects one and the arrow keys move between them, exactly like native radio buttons. The photos are decorative, with empty alternative text, and the hero photo row is hidden from assistive technology.

The Playwright suite runs axe-core with the WCAG 2.2 A and AA rules on the launch page states, at phone and desktop widths, in light and dark. A single violation fails the test.

## Phones, dark mode and no JavaScript

Most people will open this page from a QR code on a phone. Here it is at three hundred and ninety pixels wide, with the system in dark mode. The layout stacks, nothing scrolls sideways, and the colours switch to the design system's dark theme on their own, because the tokens follow the system colour scheme. The viewport covers the full screen and the content respects the safe areas around a notch.

Now the same page with JavaScript turned off. Every word and every photo is still there, because the page is prerendered at build time. The browser receives finished HTML first, and Angular only takes over afterwards.

## Small and fast

That prerendering is part of a performance budget in requirement L2-105. The JavaScript for the first load must stay at or under one hundred kilobytes gzipped, the whole first load at or under three hundred and fifty kilobytes, and no photo may be larger than twenty-five kilobytes. The build checks this itself: after `ng build launch`, the script `check-launch-size.mjs` measures the output and fails the build when a limit is crossed.

On the build used in this video, the initial JavaScript is seventy-three and a half kilobytes gzipped and the whole first load is about one hundred and forty-two kilobytes, with four photos.

Opening the page also makes no request to the API and sets no cookies. The first API call happens only when someone submits the form or opens a link from an email.

## A slim application of its own

Under the hood, the launch site is its own Angular application, `launch`, in `frontend/projects/launch`, beside the product. It shares the design system and the API library, but none of the product's pages, routes or services, so it can be deleted on launch day without touching the product. The launch list itself lives in the existing backend, in `backend/src/launch-list`.

## The privacy notice

Both Privacy links open a notice that is served before the product exists. It explains the launch list: why it is collected, what is kept, who processes it and that it stays in Canada, how long it is kept, and how to leave. While recording this video we found two small bugs on this page. The contact line read Write tohello, with the space missing, and the retention table drew a stray border under its last row. Both are fixed in the same pull request as these videos, and an end-to-end test now checks the contact sentence.

## Recap

Things to remember:

- The launch site is one prerendered page with the mock's content, and no links into the unopened product.
- The header button and Join as a caterer both take people to the form; the caterer button picks the caterer role and keeps what was typed.
- It works on phones, in dark mode, from the keyboard and without JavaScript, within a strict size budget.

Next, video two follows a visitor through the sign-up form itself: what it asks for, how it handles mistakes and failures, and why its answer never reveals who is already on the list.
