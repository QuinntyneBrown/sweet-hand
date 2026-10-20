# 0016 — A static marketing site at www.sweethand.ca; the application moves to app.sweethand.ca

- Status: Accepted; amends ADRs 0011 and 0012
- Date: 2026-10-20

## Context

Until now `sweethand.ca` and `www.sweethand.ca` both served the launch
application (`frontend/projects/launch/`, L2-092): a prerendered Angular
page whose job is the launch list form. It is the only thing a visitor from
the flyer, a sticker, WhatsApp or YouTube sees, and it is built as an
application: it ships with the app's bundle, its Content-Security-Policy
admits Cloudflare's challenge, and it has no room for a brand video, a photo
collage or a page that simply invites someone in. After launch the product
application takes the same place, so the problem would only grow.

Saturdaze solved this with a static marketing page at `www.saturdaze.ca` and
its application at `app.saturdaze.ca` (its ADR-018). Sweet Hand follows the
same shape on its own delivery (ADRs 0011, 0012).

## Decision

- **Hosts.** `https://www.sweethand.ca` serves the marketing page. The apex
  `sweethand.ca` is bound to the same Static Web App and redirects to `www`.
  `https://app.sweethand.ca` serves the application: the launch site today,
  the product after launch. Staging and UAT keep `staging.sweethand.ca` and
  `uat.sweethand.ca` for the application and serve the marketing page on
  the marketing app's default hostname only.
- **A second Static Web App per environment.** `infra/main.bicep` declares
  `swa-sweethand-www-<env>` beside `swa-sweethand-launch-<env>`, on the Free
  tier (`marketingSkuName` moves it to Standard if the subscription runs out
  of Free quota), with no linked API and no password: the page is public
  everywhere. `deliver.yml` uploads `marketing/` to it in every environment,
  rewriting `https://app.sweethand.ca` to that environment's application
  origin, registers subdomain hostnames whose CNAME already points at it,
  and smoke-checks the page, its security headers and the video.
- **A static page outside the workspace.** `marketing/` is plain HTML, one
  stylesheet and one script, with no framework, build or test suite, in the
  design system's look. `assets/tokens.css` is a copy of
  `docs/design-system/tokens/tokens.css` that CI compares byte for byte.
  Its `staticwebapp.config.json` sets a strict Content-Security-Policy
  (`default-src 'self'`, no inline script or style) and redirects the
  application's paths (`/sign-in`, `/register`, `/join`, `/privacy`, …) to
  `app.sweethand.ca`. The page carries no requirement, design or test: it is
  a design artifact, like the mocks and the design system.
- **Calls to action.** Every button links to the application: sign up
  (`/register`), sign in (`/sign-in`) and join as a caterer (`/join`).
  Before launch the launch site answers those paths with its 404 rewrite,
  which is the launch page and its form, so a visitor still lands on the
  one thing they can do today.
- **A brand video.** `docs/videos/07-meet-sweet-hand` is a photo-led promo
  of about a minute, narrated with the free Edge voice
  `en-US-AvaMultilingualNeural`, and served by the page itself with a poster
  and the browser's controls. It does not autoplay.
- **Photographs.** The page and the video use the brand's own photographs
  (`assets/`) and photographs from Wikimedia Commons under CC0, CC BY and
  CC BY-SA licences. `marketing/credits.html` lists every photograph
  with its author, source and licence, and the page links to it.
- **One application origin.** The launch site's canonical URL, Open Graph
  URL, email links (`SITE_URL`), allowed origins and Turnstile hostnames all
  follow `siteHostnames`, now `app.sweethand.ca`. Nothing else changes in
  the application.

## Consequences

- A shareable, indexable page with Open Graph metadata, a video and
  photographs, that changes without an application release.
- Every printed and posted link to `https://sweethand.ca` keeps working: it
  now lands on the marketing page, one click from the launch form.
- Namecheap gains an `app` CNAME, and the `www` CNAME and apex ALIAS move
  to the marketing Static Web App; `docs/operations/azure-production.md`
  lists the records. Production hostnames are registered by hand (apex
  validation is by TXT token), as before.
- The Cloudflare Turnstile widget must allow `app.sweethand.ca`.
- The MP4 is committed twice (`docs/videos/07-meet-sweet-hand/` and
  `marketing/assets/video/`), a few megabytes each.
- `marketing/` is outside `frontend/`, so the pre-commit hook does not
  format it; CI runs Prettier on it explicitly.
- Azure allows ten Free static sites per subscription (ADR 0014). If
  `swa-sweethand-www-<env>` fails with `InvalidSkuName`, delete an unused
  Free site or pass `marketingSkuName=Standard` for that environment.
- The apex-to-`www` redirect relies on `www.sweethand.ca` being the default
  custom domain of the marketing Static Web App (Saturdaze verified this on
  2026-10-20). If it ever fails, Namecheap's URL redirect record for `@` is
  the fallback.
