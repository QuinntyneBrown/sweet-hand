# 07 · The twenty-second pitch

> **Runtime:** ~6:48 · **Audience:** the founder, before the first day of maker recruiting · **Prerequisites:** the field plan in `docs/plans/maker-recruitment.md`

**Video:** [07-the-twenty-second-pitch.mp4](07-the-twenty-second-pitch.mp4) · [Slides](slides.html) · **Audio:** [07-the-twenty-second-pitch.mp3](07-the-twenty-second-pitch.mp3) · [Transcript](script.md)

## Why this video exists

The recruitment plan gives the founder 25 days to find 100 makers, and every
one of those conversations opens with the same twenty seconds. This video is
the rehearsal: the pitch in full, what each of its five lines is for, the two
questions that follow a yes, and how the pitch changes at the four doors the
plan sends the founder to (people they know, cooks already posting on
Instagram, the shop counter, and church).

## Learning objectives

By the end, the viewer can:

- Say the pitch from memory in about twenty seconds, in their own words.
- Explain what each of the five lines does and why the ask is a yes-or-no question.
- Ask the two follow-up questions after every yes, and ask permission to use the referrer's name.
- Name the three things never to say, and describe the product as it exists today.
- Adapt the pitch to a relative, an Instagram cook, a shop owner and a church kitchen committee.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What are the five lines? | What it is (free, find, neighbourhood); when (end of November, before Christmas orders); the three worries (free to list, own menu, batches and days, address never shows); the gift (free studio shoot for the first 100); the ask ("Can I put you on the list?") |
| What happens after a yes? | "Which dishes should I write down?" in the cook's own words and tradition; "Who else cooks that I should talk to?" and "Can I say you sent me?" |
| What is never said? | Certified, inspected or approved; a listing is a licence; guaranteed orders; "will" for anything not built yet |
| How does the pitch change by door? | Known people: ask about buying first, then one line; Instagram: three lines, then a call; the shop: pitch the owner, not the cook, with flyers, a sticker and the bulletin board; church: call the office, start with the kitchen committee |

## Code / assets on screen

| File | What to show |
|---|---|
| `docs/plans/maker-recruitment.md` | The pitch, the two questions, the "never say" list and the four channels, quoted on the slides |
| `docs/marketing/flyer/`, `docs/marketing/stickers/` | Named on the shop-counter slide as the print files to bring |
| `docs/videos/assets/mark.svg` | The Sweet Hand mark on the title and end slides |

There are no screen recordings: nothing in this video is the running app.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:20 | Introduction | 25 days, 100 cooks, four doors |
| 00:20-00:59 | The pitch | The pitch in full; seventy words, twenty seconds |
| 00:59-02:10 | Line by line | What it is; when; the three worries; the gift; the ask |
| 02:10-02:41 | After the yes | Which dishes; who else; can I say you sent me |
| 02:41-03:15 | What you never say | Certified, licensed, guaranteed; say what exists today |
| 03:15-03:56 | People you know | Ask about buying first; the one-line pitch; three names |
| 03:56-04:49 | Cooks already posting | The three-line DM; never close in Instagram; 20 to 30 a day |
| 04:49-05:38 | The shop counter | Pitch the owner; flyers, sticker, bulletin board; salons and barbershops |
| 05:38-06:15 | Church | Call the office; start with the kitchen; bazaar season |
| 06:15-06:48 | Things to remember | Recap; next, handling objections |

## Demo commands

```sh
node tools/video-audio/generate-audio.mjs docs/videos/07-the-twenty-second-pitch --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/07-the-twenty-second-pitch
node tools/video-build/build-video.mjs docs/videos/07-the-twenty-second-pitch --check
node tools/video-build/build-video.mjs docs/videos/07-the-twenty-second-pitch --slides-only
node tools/video-build/build-video.mjs docs/videos/07-the-twenty-second-pitch
```

The Edge read-aloud service refused the build machine's connection (HTTP 403
on the WebSocket handshake, `edge-tts` 7.2.8, with and without the proxy), so
the published narration was synthesized offline with the Kokoro `af_heart`
voice through the generator's `piper` engine slot, the same voice as videos 05
and 06, using the stand-in `piper` module described in video 06's README.

## Pitfalls

- The pitch on the slides must match `docs/plans/maker-recruitment.md` word for
  word; change the plan first, then the script and slides.
- The studio shoot is a real commitment of 25 to 30 studio days. The video says
  "about ninety minutes, they bring the food, they keep the photos"; do not
  promise more.
- The video says "will" for the directory. Until launch day the site is the
  launch list only.

## References

- `docs/plans/maker-recruitment.md`, "The pitch" and "Channels, ranked by yield"
- `docs/plans/business-plan.md`, "Go-to-market and marketing" (the free shoot for the first 100 makers)
