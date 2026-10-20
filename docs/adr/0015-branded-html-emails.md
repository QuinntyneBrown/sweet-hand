# 0015 — Branded HTML emails are hand-written inline-CSS templates

- Status: Accepted
- Date: 2026-10-19

## Context

The launch list confirmation email went out as plain text: a bare paragraph
with a link (`backend/src/platform/azure-email.ts`). L2-122 asks for it in the
Sweet Hand design, with a plain-text part beside it. Mail clients support a
narrow slice of HTML and CSS: no CSS custom properties, no external
stylesheets, unreliable `<style>` blocks and web fonts, and most block inline
SVG and `data:` images. The design system's tokens (ADR 0002) are CSS custom
properties, so the email cannot use them directly.

Email frameworks (MJML, React Email, Handlebars or other templating engines)
would solve markup portability for many emails. Sweet Hand sends one branded
email today.

## Decision

- Each branded email is a plain TypeScript function that returns
  `{ subject, plainText, html }` from the outbox fields
  (`backend/src/launch-list/confirmation-email.ts` for `launch-confirm`). No
  email framework, templating engine or new library.
- The HTML is one 600px column of `role="presentation"` tables with inline
  styles. Every colour, size and spacing is a fixed value read from a token by
  role; the table in `docs/design-system/patterns/notifications.html#email`
  records which token each value came from. No CSS variable is added for
  email.
- Light is the inline baseline; a `prefers-color-scheme: dark` block in
  `<style>` overrides it where the client supports it.
- The font is the `--font-family-sans` stack with its system fallbacks, with
  no web-font link.
- The logo is a hosted 2x PNG served by the site at
  `/img/sweet-hand-email-logo.png`, not inline SVG or a data URI. It is the
  only remote resource: no tracking pixel, stylesheet or script.
- Every dynamic value is HTML-escaped in the template.
- The plain-text part is kept and carries the same facts.
- The email renders at send time from outbox fields, so no HTML is stored.
- The mock in `docs/mocks/notifications/launch-confirm-email/` is the
  reference; the template copies its markup by hand.

## Consequences

- Fixed values can drift from the tokens. A token change that touches a role
  in the table updates the template and the mock in the same pull request.
- The template and the mock are kept in step by hand; a build step that
  generates one from the other is deferred until more emails are branded.
- The other launch list emails and the product emails stay plain text until
  each has a mock; each then follows this decision.
- The logo's URL must keep working while sent emails are read; when the
  product replaces the launch site at `/`, it serves the same path.
