# Videos

Narrated walkthroughs made with the `creating-videos` skill
(`.claude/skills/creating-videos/SKILL.md`). Each folder holds the text the
video is built from (`script.md`, `slides.html`, `README.md` outline), the
screen recordings it plays (`clips/`, recorded from `clips/clips.mjs`) and the
generated `NN-topic.mp3` and `NN-topic.mp4`.

| # | Video | Runtime | Covers |
|---|---|---|---|
| 01 | [The launch site](01-launch-site/README.md) | 5:26 | L2-092 to L2-094, L2-103.4, L2-105 to L2-107 |
| 02 | [Joining the launch list](02-joining-the-launch-list/README.md) | 5:47 | L2-095 to L2-098, L2-104 |
| 03 | [Confirming and leaving](03-confirming-and-leaving/README.md) | 4:59 | L2-099, L2-100, L2-103, L2-104.2 |
| 04 | [Launch day](04-launch-day/README.md) | 4:20 | L2-101, L2-102 |
| 05 | [Cater with Sweet Hand](05-cater-with-sweet-hand/README.md) | 1:19 | Promo for home cooks: join the launch list as a caterer |
| 06 | [The plan, in plain words](06-the-plan-in-plain-words/README.md) | 7:08 | The business plan explained simply, and what changes if the founder cooks on Sweet Hand |
| 07 | [Meet Sweet Hand](07-meet-sweet-hand/README.md) | 0:20 | The brand video on www.sweethand.ca (ADR 0016): round photos, few words, one ask |

## Making or updating a video

Run from the repository root. Generated timing, slide renders and recordings go
to `.cache/` (ignored by git).

```sh
# 1. Narration: script.md → NN-topic.mp3 and .cache/videos/NN-topic/timing.json
python3 -m pip install edge-tts                       # free Edge read-aloud, needs internet
node tools/video-audio/generate-audio.mjs docs/videos/NN-topic --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/NN-topic
#    Offline alternative: a Piper voice (python3 -m pip install piper-tts)
PIPER_MODEL=path/to/en-us-ryan-high.onnx node tools/video-audio/generate-audio.mjs docs/videos/NN-topic --engine piper

# 2. Screen recordings of the real app (see "The launch stack" below)
node tools/video-record/record-clips.mjs docs/videos/NN-topic [--only clip-name] [--show-host sweethand.ca]

# 3. Video: check cues, look at the slides, then encode
node tools/video-build/build-video.mjs docs/videos/NN-topic --check
node tools/video-build/build-video.mjs docs/videos/NN-topic --slides-only
node tools/video-build/build-video.mjs docs/videos/NN-topic        # --no-captions for a promo without burned-in captions
```

The tools need Node 22, Python 3 with the speech engine, ffmpeg with libx264
and libass, and the Chromium that Playwright installs for `frontend/`
(`EDGE_PATH`, `FFMPEG_PATH` and `PYTHON` override them). Acronyms are spoken
through `tools/video-audio/pronunciations.json`; a folder can add its own
`pronunciations.json`.

### Slides

`slides.html` uses the shared `assets/slides.css` and `assets/slides.js`. Every
slide after the first has a `data-cue` copied verbatim from `script.md`; it
appears when the narration reaches that phrase. A slide with
`data-clip="clips/x.mp4"` and a `<video class="clip">` (or `class="clip phone"`)
plays that recording in the box; the builder speeds a clip up when the
narration is shorter than the clip, and holds its last frame when it is longer.

### The launch stack

Videos 01 to 04 record the production launch build against the real API on
PostgreSQL:

```sh
cd frontend && npm run build:launch && cd ..
node tools/video-record/launch-stack.mjs up      # migrate, seed, API on :4300, site on :4201
node tools/video-record/record-clips.mjs docs/videos/01-launch-site
node tools/video-record/launch-stack.mjs down
```

`DATABASE_URL` names the database (default
`postgres://sweethand:sweethand@localhost:5432/sweethand`). The clips reset the
launch list between recordings, so never point it at a real database. No email
provider is chosen yet, so the recordings show queued emails as their outbox
records.
