# Sweet Hand marketing page

The static page served at **https://www.sweethand.ca** (ADR 0016). Plain HTML, one stylesheet and one script, with no framework and no build. The application lives at https://app.sweethand.ca; every call to action here links there (`/register`, `/sign-in`, `/join`). The page is a design artifact, like the mocks and the design system: it carries no requirement and no tests.

| File                                        | What it is                                                                                                                  |
| ------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------- |
| `index.html`                                | The page. No inline script or style: the Content-Security-Policy forbids them.                                              |
| `credits.html`, `assets/credits.css`        | Every photograph with its author, source and licence.                                                                       |
| `assets/tokens.css`                         | A **copy** of `docs/design-system/tokens/tokens.css`; CI fails when the two differ. Copy it again after a token change.     |
| `assets/sweet-hand.css`                     | The layout, in the design system's look, reading tokens by role. `assets/fonts/` is Figtree (OFL), self-hosted for the CSP. |
| `assets/sweet-hand.js`                      | Header shadow, reveal on scroll, footer year. The page reads fine without it.                                               |
| `assets/photos/`                            | The round and wide photographs (see `credits.html`); the brand video's slides reference them in place.                      |
| `assets/video/`                             | `meet-sweet-hand.mp4` from `docs/videos/07-meet-sweet-hand`, and its poster.                                                |
| `assets/social-card.png`, `assets/icon.svg` | The Open Graph image (1200 × 630) and the tab icon (the logo mark).                                                         |
| `staticwebapp.config.json`                  | Security headers and the redirects of the application's paths to `app.sweethand.ca`.                                        |

## Preview locally

```sh
node tools/marketing-server.mjs marketing 4500
# http://localhost:4500, served with the production headers and redirects
```

## Change it

Edit the files here directly, preview, then run Prettier on the folder from the repository root (`npx --prefix frontend prettier --write marketing`); the pre-commit hook does not see it. Deployment is part of every environment's delivery (`.github/workflows/deliver.yml`): the folder is uploaded to `swa-sweethand-www-<env>` with `https://app.sweethand.ca` rewritten to that environment's application origin. Photographs are either the brand's own or CC-licensed from Wikimedia Commons; add any new one to `credits.html`.
