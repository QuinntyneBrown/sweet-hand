# 08 · Handling objections

> **Runtime:** ~4:44 · **Audience:** the founder, before the first day of maker recruiting · **Prerequisites:** video 07 and the field plan in `docs/plans/maker-recruitment.md`

**Video:** [08-handling-objections.mp4](08-handling-objections.mp4) · [Slides](slides.html) · **Audio:** [08-handling-objections.mp3](08-handling-objections.mp3) · [Transcript](script.md)

## Why this video exists

Video 07 gives the pitch. This one gives the eight replies the founder will
hear most often at the four doors, role-played with a second voice as the
cook, each with where it comes up and the one- or two-sentence answer. It
also states the one rule that governs the whole campaign: never tell a cook
they are allowed to sell, and never tell them they are not.

## Learning objectives

By the end, the viewer can:

- Answer each of the eight objections in one or two sentences, then return to the ask.
- Apply the food-safety rule: no "allowed", no "not allowed", two links, and leave it with the cook.
- Recognize "send me something" as a maybe, record it as replied, and put a date on the follow-up.
- Redirect a church office that declines announcements to the kitchen committee or a table after the service.
- Turn a one-minute window with a busy cook into a launch-list sign-up on the spot.

## Key questions

| Question | What a strong answer includes |
|---|---|
| "I don't have a licence" | The site never says anyone is certified; the cook writes their own note or nothing; then the rule, two links, and stop |
| "My address" | Never shown; neighbourhood or intersection only; pickup details go only to the chosen customer |
| "I only cook for people I know" | Batches and days are the cook's; "by pre-order, Fridays only" is what the site is for; ask for the dishes |
| "What does it cost?" | Nothing; an optional paid tier later; for the shop owner, the cooks are their best customers |
| "Who are you?" | Photographer and engineer, own work; show the preview and video 05; "will", not "is" |
| "Send me something" | A maybe; send the image and link; date the follow-up; call after 48 hours |
| "Not at church" | The kitchen committee, a table after the service, or help at the bazaar |
| "I'm too busy" | One minute for the list now, ninety minutes for the shoot whenever; do the minute with them |

## Code / assets on screen

| File | What to show |
|---|---|
| `docs/plans/maker-recruitment.md` | The objection table and the campaign rules, quoted on the slides |
| `docs/marketing/whatsapp/status-2-makers.png` | The image sent after "send me something" |
| `docs/videos/05-cater-with-sweet-hand/` | The video shown after "who are you?" |
| `docs/videos/assets/mark.svg` | The Sweet Hand mark on the title slide |

The second voice (the cook) speaks the `**Maker:**` paragraphs in `script.md`.
There are no screen recordings.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:13 | Introduction | A worry is not a no; the eight objections and where they come up |
| 00:13-00:59 | I don't have a licence | The answer; the rule: never allowed, never not allowed; two links |
| 00:59-01:25 | My address | Never shown; the line people repeat |
| 01:25-01:53 | I only cook for people I know | Small is the point; ask for the dishes |
| 01:53-02:22 | What does it cost | Nothing; the optional tier; the shop owner's version |
| 02:22-02:53 | Who are you | Own work; the preview and video 05; "will", not "is" |
| 02:53-03:19 | Send me something | A maybe; date the follow-up; call after 48 hours |
| 03:19-03:48 | Not at church | The kitchen committee, a table, the bazaar |
| 03:48-04:21 | I'm too busy | One minute for the list; do it with them |
| 04:21-04:44 | Things to remember | Recap |

## Demo commands

```sh
node tools/video-audio/generate-audio.mjs docs/videos/08-handling-objections --dry-run
node tools/video-audio/generate-audio.mjs docs/videos/08-handling-objections
node tools/video-build/build-video.mjs docs/videos/08-handling-objections --check
node tools/video-build/build-video.mjs docs/videos/08-handling-objections --slides-only
node tools/video-build/build-video.mjs docs/videos/08-handling-objections
```

The Edge read-aloud service refused the build machine's connection (HTTP 403
on the WebSocket handshake, `edge-tts` 7.2.8), so the published narration was
synthesized offline with Kokoro through the generator's `piper` engine slot:
`af_heart` for the narrator, as in videos 05 to 07, and `am_michael` for the
cook (`PIPER_MODEL_2`), using the stand-in `piper` module described in video
06's README.

## Pitfalls

- Slide cues must not quote the cook's line: each objection appears twice in
  the script (heading and quote), so the cues use the narrator's opening
  sentence of each section instead.
- The licence answer ends after "It's your call." Adding reassurance on the
  slide or in the script would break the campaign rule.
- Keep the answers at one or two sentences. The point of every answer is to
  get back to "which dishes?"

## References

- `docs/plans/maker-recruitment.md`, "Objections you will hear" and "Rules while you do this"
- `docs/plans/business-plan.md`, "Risks and compliance" (Ontario's low-risk food rule)
