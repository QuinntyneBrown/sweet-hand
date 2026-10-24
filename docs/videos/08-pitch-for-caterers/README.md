# 08 · A pitch for caterers

> **Runtime:** ~1:37 · **Audience:** Caribbean caterers and home cooks in Toronto and the GTA · **Prerequisites:** none

**Video:** [08-pitch-for-caterers.mp4](08-pitch-for-caterers.mp4) · [Slides](slides.html) · **Audio:** [08-pitch-for-caterers.mp3](08-pitch-for-caterers.mp3) · [Transcript](script.md) · **Captions:** [08-pitch-for-caterers.en-CA.srt](08-pitch-for-caterers.en-CA.srt)

## Why this video exists

The caterer sales kit's pitch as a video (`docs/marketing/sales-kit/`): sales
people send it by WhatsApp or play it on a phone. It carries the kit's two asks,
register and follow the Facebook Page, and the photoshoot offer word for word.
Like video 05 it speaks to the cook, not the team; unlike 05 it shows the
product's own pages and registration, not the launch list.

## Learning objectives

By the end, the viewer can:

- Say what Sweet Hand is and when it opens (Thursday 26 November 2026)
- Picture their own page: photos, menu with dietary tags, areas served
- Repeat the photoshoot offer and what it asks in return
- Tell the ideas being explored (delivery, awards) from what exists
- Sign up at sweethand.ca and follow the Facebook Page

## Key questions

| Question | What a strong answer includes |
|---|---|
| What do I get? | A page with photos, menu, traditions, areas served, event sizes (L2-015, L2-017) |
| Is my address shown? | No; the areas you serve only (L2-010, AGENTS.md domain rules) |
| What does it cost? | Free to list, no fees (L1 A-3) |
| What is the photoshoot? | The kit's offer sentence: first 100 who register, 10 dishes, a complete profile and a launch-day post in return (business plan, "Months 1–3") |
| Is there delivery, or awards? | Ideas being explored, not features (business plan "Stage 3"; awards are not in the plans) |
| What do I do now? | sweethand.ca, Join as a caterer; follow Sweet Hand on Facebook |

## Code / assets on screen

| File | What to show |
|---|---|
| `frontend/projects/sweet-hand/src/app/features/discovery/` | The caterer listing filtered to Jamaican; Auntie Bev's Kitchen with jerk chicken on the menu (fictional cast, `beverley` scenario) |
| `frontend/projects/sweet-hand/src/app/features/identity/register-caterer/` | "Cater with Sweet Hand" registration on a phone, the first two fields typed |
| `docs/marketing/assets/qr-facebook-page.svg` | The Facebook Page QR code |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:13 | Introduction | Word of mouth: a cousin, a church group, a WhatsApp chat |
| 00:13-00:32 | One place to be found | The listing by tradition; opens Thursday 26 November |
| 00:32-00:52 | Your own page | Auntie Bev's page and menu; free, your rules, address private |
| 00:52-01:04 | A free photoshoot | The offer, word for word |
| 01:04-01:15 | Ideas we're exploring | Delivery through a courier partner; awards; "ideas, not promises" |
| 01:15-01:37 | Two things to do today | Join as a caterer (phone); Facebook QR; end card |

## Demo commands

```sh
# The backend in test mode and the product app, as the e2e suite runs them
(cd backend && PORT=4300 TEST_CONTROL=1 npm start &)
(cd frontend && E2E_API_PORT=4300 npx ng serve sweet-hand --port 4200 &)
node tools/video-record/record-clips.mjs docs/videos/08-pitch-for-caterers --base http://localhost:4200 --show-host app.sweethand.ca

node tools/video-audio/generate-audio.mjs docs/videos/08-pitch-for-caterers
node tools/video-build/build-video.mjs docs/videos/08-pitch-for-caterers
```

Each clip resets the backend's default test environment, publishes Beverley
Campbell's Auntie Bev's Kitchen (the `beverley` scenario) and adds "Jerk
chicken" to her menu through the menu editor, because no cast caterer lists it.

The published narration was synthesized offline with the Kokoro `af_heart`
voice through the generator's `piper` engine slot (a local `piper` module that
calls `kokoro-onnx`), as for video 05: the Edge read-aloud service was blocked
from the build machine. The default Edge voice works just as well.

The captions file is cut from the narration's timing manifest
(`.cache/videos/08-pitch-for-caterers/timing.json`) the same way the builder
cuts the burned-in captions. If a line lands early or late on YouTube, use its
Auto-sync with the plain text of `script.md`.

## Pitfalls

- The address bar shows `app.sweethand.ca` (`--show-host`), where the product
  lives after launch (ADR 0016); the recordings ran locally.
- Before 26 November "Join as a caterer" puts a caterer on the launch list; the
  registration form on screen is what opens on launch day. The slide says so.
- Delivery and awards stay "exploring" in every line. Never cut "ideas, not promises".
- The photoshoot sentence is the kit's, word for word (`docs/marketing/sales-kit/elevator-pitch.md`).

## References

- `docs/marketing/sales-kit/` (elevator pitch, FAQ, deck, flyers)
- `docs/plans/business-plan.md` ("Months 1–3: seed the supply", "Stage 3", "Delivery")
- `docs/plans/launch-roadmap.md` (launch on Thursday 26 November 2026)
- `docs/specs/L1.md` (A-3), `docs/specs/L2.md` (L2-010, L2-015, L2-017, L2-037, L2-094)
