# 0001 — Frontend stack: Angular workspace with a `sh-` component library

- Status: Accepted
- Date: 2026-10-10

## Context

The component requirements documents (`docs/specs/components/`) already fix a
`sh-` selector prefix, a `frontend/projects/components/src/lib/<component>/`
library path, standalone components and Angular CDK primitives for overlays,
focus trapping and live announcements. AGENTS.md asks for the UI framework's
accessible dialog and overlay primitives rather than hand-rolled modals, and for
API clients behind contracts. The backend is not built yet.

## Decision

- The frontend is an Angular workspace in `frontend/` (Angular 21, the current
  LTS line that runs on the project's Node 22 toolchain).
- Two projects:
  - `projects/components` — the design-system component library. Every
    component is standalone, uses the `sh-` prefix, keeps the mocks' class
    names and ARIA semantics, and has no knowledge of the Sweet Hand API.
  - `projects/web` — the product application. It imports the library from
    source through the `@sweet-hand/components` path alias (no separate
    library build step).
- Application structure in `projects/web/src/app/`:
  - `core/` — API contracts and their HTTP implementations, session state,
    formatting (en-CA, CAD, `America/Toronto`), validation rules shared by
    several features.
  - `shell/` — header, footer, site and account menus, toasts, error pages.
  - `features/<subsystem>/` — one folder per subsystem of
    `docs/detailed-designs/`, lazy-loaded through its own `routes.ts`.
    Each feature keeps its business rules (validation, eligibility, view
    models) in plain TypeScript files beside the page, never in templates.
- Signals and standalone components throughout, zoneless change detection,
  reactive forms, Angular CDK for dialogs, overlays, focus trap and
  `LiveAnnouncer`.
- The first release is a client-rendered single-page application. Server
  rendering (L2-018.4) needs the real API and is deferred to the backend work;
  pages already set `<title>`, meta description, canonical and Open Graph tags
  through Angular's `Title` and `Meta` services so SSR can be switched on
  without page changes.

## Consequences

- Contributors need Node 22.12+ and run everything from `frontend/`.
- Server-rendered HTML for crawlers (L2-018.4) is not delivered until SSR is
  enabled together with the backend.
