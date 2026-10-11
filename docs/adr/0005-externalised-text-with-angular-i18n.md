# 0005 — User-facing text is externalised with Angular i18n

- Status: Accepted
- Date: 2026-10-10

## Context

L2-064 and assumption A-6 require all user-facing text to come from
externalised resource files so French can be added without code changes.

## Decision

- Use Angular's built-in internationalisation (`@angular/localize`). Templates
  mark text with `i18n` / `i18n-<attr>` and TypeScript uses `$localize`.
  Plurals use ICU expressions (`{count, plural, =1 {1 caterer} other {...}}`).
- The source locale is `en-CA`. `npm run extract-i18n` writes the resource file
  `projects/sweet-hand/src/locale/messages.xlf`; a French build adds
  `messages.fr-CA.xlf` and a locale entry in `angular.json`, with no code change.
- Data that comes from the API (caterer names, cuisines, areas, user text) is
  not marked.
- The `@angular-eslint/template/i18n` lint rule reports unmarked template text.

## Consequences

- Every template text node and accessible-name attribute needs an `i18n`
  marker; lint catches the ones that are missed.
