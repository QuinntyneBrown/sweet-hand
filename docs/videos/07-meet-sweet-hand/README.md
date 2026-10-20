# 07 · Meet Sweet Hand

> **Runtime:** ~1:05 · **Audience:** anyone hearing about Sweet Hand for the first time: eaters, cooks, and the people who know a cook · **Where it plays:** the marketing page, www.sweethand.ca (ADR 0016)

**Video:** [07-meet-sweet-hand.mp4](07-meet-sweet-hand.mp4) · [Slides](slides.html) · **Audio:** [07-meet-sweet-hand.mp3](07-meet-sweet-hand.mp3) · [Transcript](script.md)

## Why this video exists

The brand video on the marketing page. It is an invitation, not a walkthrough:
photographs of the food, a few words on each, and one ask at the end. It says
nothing about how Sweet Hand is built. If you know someone with a sweet hand,
if you have one, or if you just want good food, this is for you.

## Learning objectives

By the end, the viewer can:

- Say what Sweet Hand is in a sentence: Caribbean home cooks and small-batch makers of Toronto and the GTA, in one place
- Name the three people it is for: the cook, the eater, and whoever knows a cook
- Sign up at sweethand.ca

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who is it for? | Cooks get a page; eaters find them by dish, island and area; friends and family send cooks there (L1-006, L1-007) |
| Is a cook's address shown? | Never; the page shows the areas they serve (L2-039) |
| What does it cost? | Free to list, free to search, no fees (assumption A-3) |

## Code / assets on screen

| File | What to show |
|---|---|
| `marketing/assets/photos/` | Every photograph; the slides reference them in place, so the page and the video stay the same set (credits in `marketing/credits.html`) |
| `docs/videos/assets/slides.css` | `body.promo` photo slides: `photo-slide`, `split`, `cluster`, `mosaic` |

No screen recordings: the video shows no UI.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:14 | Somebody you know | Jerk on the grill; the cousin, the auntie, the friend; doubles |
| 00:14-00:28 | Find them | The eight dishes; the islands |
| 00:28-00:42 | For cooks | Have a sweet hand? Your own page, never your home address |
| 00:42-00:56 | For the hungry | Hungry? By dish, island and area; your date and guest count |
| 00:56-01:05 | Sign up | Know someone? Send them here; sweethand.ca |

## Demo commands

```sh
node tools/video-audio/generate-audio.mjs docs/videos/07-meet-sweet-hand --dry-run
EDGE_VOICE=en-US-AvaMultilingualNeural node tools/video-audio/generate-audio.mjs docs/videos/07-meet-sweet-hand
node tools/video-build/build-video.mjs docs/videos/07-meet-sweet-hand --check
node tools/video-build/build-video.mjs docs/videos/07-meet-sweet-hand --slides-only
node tools/video-build/build-video.mjs docs/videos/07-meet-sweet-hand --no-captions
cp docs/videos/07-meet-sweet-hand/07-meet-sweet-hand.mp4 marketing/assets/video/meet-sweet-hand.mp4
ffmpeg -y -ss 3 -i marketing/assets/video/meet-sweet-hand.mp4 -frames:v 1 -q:v 3 marketing/assets/video/meet-sweet-hand.jpg
```

The narrator is the free Edge voice `en-US-AvaMultilingualNeural`, warmer and
more upbeat than the walkthroughs' default voice; `EDGE_VOICE` selects it.
Unlike the walkthroughs, the video carries no burned-in captions
(`--no-captions`): the words on screen are the slides' own.

## Pitfalls

- Every photograph is either the brand's own (`assets/sweet-hand-5-plates.jpg`) or from Wikimedia Commons under a CC licence that needs attribution; add any new one to `marketing/credits.html` before it ships.
- Don't promise anything the first release doesn't do: no payments, no batches or pre-orders, enquiries only (L1 assumptions A-1 to A-3).
- The video says "sign up"; before launch, the application answers `/register` with the launch page and its form, so the promise still lands on something a visitor can do.

## References

- `docs/specs/L1.md` (assumptions A-1 to A-3; L1-006, L1-007)
- `docs/specs/L2.md` (L2-039)
- `docs/adr/0016-marketing-site-and-app-hostnames.md`
