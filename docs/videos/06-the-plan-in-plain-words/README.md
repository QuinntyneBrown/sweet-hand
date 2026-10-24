# 06 · The plan, in plain words

> **Runtime:** ~7:11 · **Audience:** the founder's family, friends, community partners and anyone who asks how a free directory makes money · **Prerequisites:** none

**Video:** [06-the-plan-in-plain-words.mp4](06-the-plan-in-plain-words.mp4) · [Slides](slides.html) · **Audio:** [06-the-plan-in-plain-words.mp3](06-the-plan-in-plain-words.mp3) · [Transcript](script.md)

## Why this video exists

The business plan in [`docs/plans/business-plan.md`](../../plans/business-plan.md)
is written for someone who reads forecasts. This video explains it the way you
would to a five-year-old: one picture per idea, few words, no jargon. It ends
with a what-if the plan does not cover: the founder gets a food handler
certificate and lists a kitchen on Sweet Hand as cook number 101, even though
the plan says the founder never cooks.

## Learning objectives

By the end, the viewer can:

- Say what Sweet Hand is and why it stays free to list and free to search.
- Name the four jars the money comes from and which pays first.
- Explain why Sweet Hand is a directory, not a seller, and why Ontario's food rules make that matter.
- Weigh what the founder gains and gives up by cooking on the platform.

## Key questions

| Question | What a strong answer includes |
|---|---|
| How does a free directory make money? | Four jars: the website (Maker Pro $29 a month, featured spots, 10% of orders and catering, sponsors), the camera, the $100-a-day studio and the computer (plan, "Revenue streams") |
| Which jar pays first? | The camera and computer in year one (~$98K); the website is about half of ~$565K by year three (plan, "Financial forecast") |
| What happens in the first 90 days? | 100 free studio shoots, launch on November 26 with the Christmas pre-orders, six targets at the review (plan, "Go-to-market", "90-day launch plan") |
| What is the biggest risk? | Ontario's food rules; Sweet Hand shows the cook's own statement and never vouches for a kitchen (plan, "Risks and compliance") |
| What changes if the founder cooks? | Certificate and public health first; gains in product insight, stories and trust; costs in time, fairness and liability; keep it small, labelled and in its own business |

## Code / assets on screen

| File | What to show |
|---|---|
| `docs/plans/business-plan.md` | Every figure on screen, except the cooking chapter's rough guess |
| `docs/videos/assets/mark.svg` | The Sweet Hand mark on the title and end slides |

The pictures are inline SVG in `slides.html`, drawn with design-system colour
roles. There are no screen recordings: nothing in this video is the running app.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:35 | Introduction | A picture book of home cooks, free to be in and free to look; how does free pay? |
| 00:35-01:10 | The problem | 375,000 people with Caribbean roots, 2,500 cooks, no book; word of mouth only goes so far |
| 01:10-02:24 | Four jars | The website, the camera, the room, the computer; the jars feed each other |
| 02:24-03:01 | Year by year | ~$98K, ~$300K, ~$565K; the website grows to about half; ~$22K costs; careful case 0.55 |
| 03:01-03:42 | The first ninety days | Launch on November 26; 100 free shoots; the six 90-day targets |
| 03:42-04:11 | One person | 232 of about 240 days; the never list |
| 04:11-04:41 | The biggest risk | Ontario's low-risk rule; a book, not a seller |
| 04:41-06:42 | What if the founder cooks too? | What it takes, what it adds, what it costs, the verdict |
| 06:42-07:08 | Things to remember | Five-point recap; next, the 90-day review |

## Demo commands

```sh
node tools/video-audio/generate-audio.mjs docs/videos/06-the-plan-in-plain-words --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/06-the-plan-in-plain-words
node tools/video-build/build-video.mjs docs/videos/06-the-plan-in-plain-words --check
node tools/video-build/build-video.mjs docs/videos/06-the-plan-in-plain-words --slides-only
node tools/video-build/build-video.mjs docs/videos/06-the-plan-in-plain-words
```

The Edge read-aloud service refused connections from the build machine (HTTP
403, with the latest `edge-tts`), so the published narration was synthesized
offline with the Kokoro `af_heart` voice through the generator's `piper` engine
slot, the same voice as video 05. A small stand-in `piper` module ran Kokoro
ONNX:

```sh
python -m pip install kokoro-onnx soundfile   # plus kokoro-v1.0.onnx and voices-v1.0.bin
PYTHONPATH=path/to/shim KOKORO_DIR=path/to/model PIPER_MODEL=af_heart \
  node tools/video-audio/generate-audio.mjs docs/videos/06-the-plan-in-plain-words --engine piper
```

The default Edge voice works just as well once the service answers.

## Pitfalls

- The cooking chapter's income figure, two to five thousand dollars a year after ingredients, is this video's own rough guess, not the plan's. The slide labels it.
- Food handler course details were checked as of October 2026 against George Brown College and Ontario public health pages. Prices change, and each health unit sets its own process.
- The narration says "the founder" rather than the name, so the voice never mispronounces it. The name appears on the cooking chapter's title slide.
- Nothing here is a requirement. Any product change the plan implies still needs L1/L2 requirements, a detailed design and mocks (`AGENTS.md`).

## References

- `docs/plans/business-plan.md` (every figure in the video)
- Ontario Regulation 493/17, Food Premises: <https://www.ontario.ca/laws/regulation/170493>
- City of Toronto, regulations and licensing for food businesses: <https://www.toronto.ca/community-people/health-wellness-care/health-programs-advice/food-safety/food-safety-for-businesses/starting-a-food-business/regulations-and-licensing-requirements/>
- George Brown College, Basic Sanitation Training (HOST 9082): <https://coned.georgebrown.ca/courses-and-programs/basic-sanitation-training-online>
- York Region, home-based food businesses: <https://york.ca/media/113416/download>
