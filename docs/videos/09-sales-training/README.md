# 09 · Sales training: signing up caterers

> **Runtime:** ~4:53 · **Audience:** Sweet Hand sales people · **Prerequisites:** none; the kit is in `docs/marketing/sales-kit/`

**Video:** [09-sales-training.mp4](09-sales-training.mp4) · [Slides](slides.html) · **Audio:** [09-sales-training.mp3](09-sales-training.mp3) · [Transcript](script.md)

## Why this video exists

New sales people need one walkthrough of the caterer sales kit before their
first conversation: who qualifies, the pitch in order, the objections, how to
register a caterer on their phone, how to get the Facebook follow, and the
promises they must never make. It is internal: it is not for caterers.

## Learning objectives

By the end, the viewer can:

- Find each piece of the kit and say when to use it
- Tell who qualifies for the first release (caterers only, L1 A-1)
- Run the pitch in order and say the photoshoot offer word for word
- Answer the five common objections
- Help a caterer register on the spot, before and after 26 November
- Ask for the Facebook follow and log the lead the same day
- List what never to promise

## Key questions

| Question | What a strong answer includes |
|---|---|
| Who do I approach? | Caribbean caterers at home or small scale in Toronto or the GTA who take event orders; not restaurants or food trucks yet (L1 A-1) |
| What exactly is the offer? | The kit's sentence, word for word; how "first 100" is counted and the deadline are to confirm |
| What happens when they press Join as a caterer? | Before 26 November the launch list (L2-094); from 26 November caterer registration (L2-037) |
| What may I never say? | Certified or inspected kitchens, orders, delivery or awards as features, a photoshoot place, any date but the launch |
| What do I record? | The tracker columns from the maker recruitment plan, plus the Facebook follow; areas, never addresses |

## Code / assets on screen

| File | What to show |
|---|---|
| `docs/marketing/sales-kit/` | The kit's pieces, named on the slide |
| `frontend/projects/sweet-hand/src/app/features/identity/register-caterer/` | Caterer registration on a phone, through "Welcome, Andrea" (fictional) |
| `frontend/projects/sweet-hand/src/app/features/dashboard/menu/` | Auntie Bev's menu editor: add a dish with tags and a price (fictional cast) |
| `docs/marketing/assets/qr-facebook-page.svg` | The Facebook Page QR code |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:22 | Introduction | What the video covers; the two asks |
| 00:22-00:53 | The kit | Pitch, FAQ, deck, flyers, video 08 |
| 00:53-01:31 | Who to approach | Who qualifies; where they sell; ask for names |
| 01:31-02:20 | Running the pitch | The order; the offer word for word; "to confirm" |
| 02:20-02:54 | The objections | Instagram, time, cost, address, delivery |
| 02:54-03:38 | Registering on the spot | Registration on a phone; adding a dish |
| 03:38-03:53 | The Facebook follow | Scan the code, follow, say why |
| 03:53-04:16 | What never to promise | Certification, orders, delivery, awards, places, dates |
| 04:16-04:32 | Log the lead | The tracker, the same day |
| 04:32-04:53 | Things to remember | Recap and end card |

## Demo commands

```sh
# The backend in test mode and the product app, as for video 08
(cd backend && PORT=4300 TEST_CONTROL=1 npm start &)
(cd frontend && E2E_API_PORT=4300 npx ng serve sweet-hand --port 4200 &)
node tools/video-record/record-clips.mjs docs/videos/09-sales-training --base http://localhost:4200 --show-host app.sweethand.ca

node tools/video-audio/generate-audio.mjs docs/videos/09-sales-training
node tools/video-build/build-video.mjs docs/videos/09-sales-training
```

The clips reuse video 08's `prepare()` (`../08-pitch-for-caterers/clips/clips.mjs`):
a fresh test environment with Auntie Bev's Kitchen published and jerk chicken on
its menu. The registration clip creates a fictional caterer, Mango Chow Kitchen,
with an `.example` address, in that throwaway environment only.

The narration was synthesized offline with the Kokoro `af_heart` voice through
the generator's `piper` engine slot, as for videos 05 and 08.

## Pitfalls

- The registration on screen is what opens on 26 November. Before then the same
  button puts a caterer on the launch list; the slide and narration say both.
- Keep "exploring" on every mention of delivery and awards.
- Keep the photoshoot offer identical to `docs/marketing/sales-kit/elevator-pitch.md`.

## References

- `docs/marketing/sales-kit/` (README, elevator pitch, FAQ with "For sales people")
- `docs/plans/maker-recruitment.md` (who to approach, the tracker, what never to say)
- `docs/plans/business-plan.md`, `docs/plans/launch-roadmap.md`
- `docs/specs/L1.md` (A-1, A-3, A-4), `docs/specs/L2.md` (L2-037, L2-039, L2-040, L2-094)
