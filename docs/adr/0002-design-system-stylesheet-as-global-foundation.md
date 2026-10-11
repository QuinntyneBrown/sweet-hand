# 0002 — The design-system stylesheet is the frontend's global foundation

- Status: Accepted
- Date: 2026-10-10

## Context

`docs/design-system/tokens/tokens.css` and
`docs/design-system/assets/components.css` are the single source of truth for
tokens and component styles. The mocks import those two files directly, and the
CRDs make the mocks' class names the binding contract for the product and its
end-to-end locators. AGENTS.md asks that component styles stay encapsulated and
that global styles be limited to shared foundations and utilities.

Copying the stylesheet into per-component files would fork it: every design
change would have to be made twice and the two copies would drift.

## Decision

- The web application loads `tokens.css` and `components.css` straight from
  `docs/design-system/` as its global styles (see `angular.json`). They are the
  shared foundation: tokens, base elements, utilities and the BEM-namespaced
  component classes the CRDs fix.
- Angular components use these classes in their templates and do not restyle
  them. Anything a component needs beyond the design system goes in that
  component's own encapsulated stylesheet (`styleUrl`), never in a global file.
- Changes to the look are made in `docs/design-system/` first, then picked up
  by the build.

## Consequences

- The product and the mocks can never drift apart on styling.
- Global CSS is limited to the design-system foundation; product code adds no
  global rules.
