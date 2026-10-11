# 01 · The launch site

> **Runtime:** ~5.5 min · **Audience:** the Sweet Hand team, contributors and reviewers · **Prerequisites:** none

**Video:** [01-launch-site.mp4](01-launch-site.mp4) · [Slides](slides.html) · **Audio:** [01-launch-site.mp3](01-launch-site.mp3) · [Transcript](script.md)

## Why this video exists

Before launch, the flyer's QR code leads to one page. This shows that page
running for real (production build, real API on PostgreSQL) and what it
promises a visitor before they type anything.

## Learning objectives

By the end, the viewer can:

- Name the parts of the launch page and the links it deliberately leaves out.
- Explain how the header button and "Join as a caterer" reach the form.
- Describe how the page behaves on a phone, in dark mode, by keyboard and without JavaScript, and its first-load budget.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Why does the page link nowhere in the product? | The product isn't open; only `/`, anchors, `/privacy` and `mailto:` (L2-093.2) |
| What does "Join as a caterer" do that the header button doesn't? | Selects "A caterer", shows the business name field, keeps a typed email (L2-094) |
| Why does the page work without JavaScript? | `/` and `/privacy` are prerendered at build time (L2-105.1) |

## Code / assets on screen

| File | What to show |
|---|---|
| `frontend/projects/launch/src/app/launch-page/notify-scroller.ts` | Smooth or instant scroll, focus on the heading |
| `frontend/e2e/pages/launch.page.ts` | `expectNoAccessibilityViolations` (axe, XS/XL, light/dark) |
| `frontend/scripts/check-launch-size.mjs` | The first-load budget check |
| `frontend/projects/launch/src/app/privacy/launch-privacy-page.html` | The contact line fixed in this change |
| `docs/design-system/assets/components.css` | The last-row table border fixed in this change |

Recordings: `clips/page-tour`, `go-to-form`, `keyboard`, `phone-dark`, `no-javascript`, `privacy`.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:28 | Introduction | What the launch site is, what the video covers |
| 00:28-01:13 | What the page shows | Page tour; the only four kinds of link |
| 01:13-01:54 | Two ways to the form | Header button, "Join as a caterer", reduced motion, `/#notify` |
| 01:54-02:39 | Keyboard and screen readers | Skip link, radio group, axe in the suite |
| 02:39-03:14 | Phones, dark mode and no JavaScript | 390 px dark recording; JavaScript off |
| 03:14-04:00 | Small and fast | Budget table and real build output; no API call or cookie on load |
| 04:00-04:24 | A slim application of its own | `projects/launch` and `backend/src/launch-list` |
| 04:24-04:53 | The privacy notice | Notice recording; two fixes found while recording |
| 04:53-05:26 | Recap | Three things to remember; next video |

## Demo commands

```sh
cd frontend && npm run build:launch && cd ..
node tools/video-record/launch-stack.mjs up
node tools/video-record/record-clips.mjs docs/videos/01-launch-site
```

## Pitfalls

- The budget numbers are from this build (73.5 KB gzipped JavaScript, 141.9 KB first load); re-check them after changes.
- Figtree isn't installed in every recording environment, so text renders in the fallback sans-serif.

## References

- `docs/specs/L2.md` (L2-092 to L2-107)
- `docs/detailed-designs/launch/serve-launch-site/README.md`
- [WCAG 2.2](https://www.w3.org/TR/WCAG22/)
