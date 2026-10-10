# 0003 — Pages depend on API contracts; HTTP clients implement them

- Status: Accepted
- Date: 2026-10-10

## Context

AGENTS.md requires that pages depend on an API client contract rather than a
concrete implementation. The detailed designs name the endpoints (for example
`GET /api/public/caterers`) but the backend does not exist yet.

## Decision

- Each API area has an abstract class in `projects/web/src/app/core/api/`
  (for example `ListingApi`) that is also its dependency-injection token, plus
  one `Http…` implementation registered in `app.config.ts`.
- All endpoints live under `/api`. Public browsing uses `/api/public/…`,
  signed-in users `/api/me/…`, `/api/enquiries/…`, caterers `/api/caterer/…`,
  operators `/api/operator/…`, identity `/api/identity/…`.
- Validation failures come back as HTTP 400 or 422 with an RFC 9457 problem
  body `{ "title": "...", "errors": { "<field>": ["<message>"] } }`; field
  names match the form control names. Clients map them onto forms.
- Sessions are HttpOnly cookies set by the server. State-changing requests
  carry the CSRF token: Angular reads the `XSRF-TOKEN` cookie and sends it as
  `X-XSRF-TOKEN`.
- Bot protection is behind a `BotChallenge` contract; the token it returns is
  sent as `challengeToken` in protected form bodies.

## Consequences

- The fake backend (ADR 0004) and the real backend implement the same HTTP
  contract; the frontend does not change when the real one arrives.
