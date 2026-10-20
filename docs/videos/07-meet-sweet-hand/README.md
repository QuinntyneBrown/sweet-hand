# 07 · Meet Sweet Hand

> **Runtime:** ~0:20 · **Audience:** anyone hearing about Sweet Hand for the first time: eaters, cooks, and the people who know a cook · **Where it plays:** the marketing page, www.sweethand.ca (ADR 0016)

**Video:** [07-meet-sweet-hand.mp4](07-meet-sweet-hand.mp4) · [Slides](slides.html) · **Audio:** [07-meet-sweet-hand.mp3](07-meet-sweet-hand.mp3) · [Transcript](script.md)

## Why this video exists

The brand video on the marketing page: twenty seconds, four slides, one
ask. Round photos on the white canvas, like the page and the launch site,
never a full-screen food shot; a few words on each slide and no burned-in
captions. It says nothing about how Sweet Hand is built.

## Learning objectives

By the end, the viewer can:

- Say what Sweet Hand is in a sentence: where Toronto and the GTA find someone with a sweet hand
- Name who it is for: the cook who gets a page, and whoever is hungry
- Sign up at sweethand.ca

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who is it for? | Cooks get a page; eaters find them (L1-006, L1-007) |
| Is a cook's address shown? | Never (L2-039) |
| What does it cost? | Free to sign up and free to list (assumption A-3) |

## Code / assets on screen

| File | What to show |
|---|---|
| `marketing/assets/photos/` | The round photographs; the slides reference them in place, so the page and the video stay the same set (credits in `marketing/credits.html`) |
| `docs/videos/assets/slides.css` | `body.promo` slides: `split`, `cluster`, `mosaic` |

No screen recordings: the video shows no UI.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:03 | Somebody you know | A cluster of round photos: somebody you know has a sweet hand |
| 00:03-00:10 | Somebody you know | The eight dishes, named as the narration lists them |
| 00:10-00:13 | Find them | Your own page, never your home address |
| 00:13-00:19 | Sign up | Hungry? Sign up free at sweethand.ca |

## Demo commands

```sh
node tools/video-audio/generate-audio.mjs docs/videos/07-meet-sweet-hand --dry-run
EDGE_VOICE=en-US-EmmaMultilingualNeural EDGE_RATE=+8% EDGE_PITCH=+2Hz node tools/video-audio/generate-audio.mjs docs/videos/07-meet-sweet-hand
node tools/video-build/build-video.mjs docs/videos/07-meet-sweet-hand --check
node tools/video-build/build-video.mjs docs/videos/07-meet-sweet-hand --slides-only
node tools/video-build/build-video.mjs docs/videos/07-meet-sweet-hand --no-captions
cp docs/videos/07-meet-sweet-hand/07-meet-sweet-hand.mp4 marketing/assets/video/meet-sweet-hand.mp4
ffmpeg -y -ss 1 -i marketing/assets/video/meet-sweet-hand.mp4 -frames:v 1 -q:v 3 marketing/assets/video/meet-sweet-hand.jpg
```

The narrator is the free Edge voice `en-US-EmmaMultilingualNeural`, bright
and friendly, a touch quicker and higher than its default (`EDGE_VOICE`,
`EDGE_RATE`, `EDGE_PITCH`). The video carries no burned-in captions
(`--no-captions`): the words on screen are the slides' own.

## Pitfalls

- Every photograph is either the brand's own (`assets/sweet-hand-5-plates.jpg`) or from Wikimedia Commons under a CC licence that needs attribution; add any new one to `marketing/credits.html` before it ships.
- Keep it to twenty seconds: about forty words of script, four slides, none shorter than four seconds.
- Don't promise anything the first release doesn't do: no payments, no batches or pre-orders, enquiries only (L1 assumptions A-1 to A-3).
- The video says "sign up"; before launch, the application answers `/register` with the launch page and its form, so the promise still lands on something a visitor can do.

## References

- `docs/specs/L1.md` (assumptions A-1 to A-3; L1-006, L1-007)
- `docs/specs/L2.md` (L2-039)
- `docs/adr/0016-marketing-site-and-app-hostnames.md`
