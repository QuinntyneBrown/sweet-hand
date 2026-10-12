# 05 · Cater with Sweet Hand

> **Runtime:** ~1:19 · **Audience:** Caribbean home cooks and small caterers in Toronto and the GTA · **Prerequisites:** none

**Video:** [05-cater-with-sweet-hand.mp4](05-cater-with-sweet-hand.mp4) · [Slides](slides.html) · **Audio:** [05-cater-with-sweet-hand.mp3](05-cater-with-sweet-hand.mp3) · [Transcript](script.md)

## Why this video exists

A short promo to share with home cooks (WhatsApp, social, and later the launch
page) that asks them to join the launch list as a caterer. Unlike videos 01 to
04 it is not a walkthrough for the team: it speaks to the cook, in plain words.

## Learning objectives

By the end, the viewer can:

- Say what Sweet Hand is and who it is for
- Picture their own caterer page and how people reach them
- Join the launch list as a caterer at sweethand.ca

## Key questions

| Question | What a strong answer includes |
|---|---|
| What do I get? | A page with photos, menu, cuisines, areas served, event sizes and occasions (L1-006, L1-007) |
| Is my address shown? | No. The profile has service areas, not an address (L2-039) |
| What does it cost? | Listing is free; no fees (assumption A-3, launch page copy) |
| What do I need? | A food handler certificate (A-4, L2-040); every page is approved before it goes live (L1-013) |
| How do I join? | Join as a caterer on the launch page; one email on launch day (L2-094, A-8) |

## Code / assets on screen

| File | What to show |
|---|---|
| `frontend/projects/launch/` | The launch page (large-desktop layout) and the caterer sign-up through confirmation |
| `frontend/projects/sweet-hand/src/app/features/discovery/` | Preview: the caterer listing filtered by cuisine and the Pelau House page (fictional seed cast) |

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:14 | Introduction | Word of mouth: a cousin, a church group, a WhatsApp chat |
| 00:14-00:28 | One place to be found | Launch page tour |
| 00:28-00:42 | Your own page | Pelau House page: photos, menu, areas served |
| 00:42-00:57 | How it works | Browse by cuisine, open a page, Send an enquiry |
| 00:57-01:19 | Be there on day one | Food handler certificate; Join as a caterer, confirm, “You’re on the list” |

## Demo commands

```sh
# Launch stack (PostgreSQL). Local-only settings for the API:
BOT_CHALLENGE=off ACS_EMAIL_ENDPOINT=http://127.0.0.1:9/ ACS_EMAIL_SENDER=hello@sweethand.example \
  node tools/video-record/launch-stack.mjs up
node tools/video-record/record-clips.mjs docs/videos/05-cater-with-sweet-hand --only launch-page --show-host sweethand.ca
node tools/video-record/record-clips.mjs docs/videos/05-cater-with-sweet-hand --only join --show-host sweethand.ca

# Product preview: a second API on the same database for the product dev server
(cd backend && DATABASE_URL=postgres://sweethand:sweethand@localhost:5432/sweethand PORT=4310 \
  ALLOWED_ORIGINS=http://localhost:4200 IP_HASH_SECRET=local-demo-only SECURE_COOKIES=0 BOT_CHALLENGE=off \
  ACS_EMAIL_ENDPOINT=http://127.0.0.1:9/ ACS_EMAIL_SENDER=hello@sweethand.example \
  node --import @swc-node/register/esm-register src/main.ts &)
(cd frontend && E2E_API_PORT=4310 npx ng serve sweet-hand --port 4200 &)
node tools/video-record/record-clips.mjs docs/videos/05-cater-with-sweet-hand --base http://localhost:4200 --only caterer-page --show-host sweethand.ca
node tools/video-record/record-clips.mjs docs/videos/05-cater-with-sweet-hand --base http://localhost:4200 --only browse --show-host sweethand.ca

node tools/video-audio/generate-audio.mjs docs/videos/05-cater-with-sweet-hand
node tools/video-build/build-video.mjs docs/videos/05-cater-with-sweet-hand
```

The published narration was synthesized offline with the Kokoro `af_heart`
voice, through the generator's `piper` engine slot, because the Edge read-aloud
service was unreachable from the build machine. The default Edge voice works
just as well.

## Pitfalls

- The address bar shows `sweethand.ca` (`--show-host`); the recordings ran locally.
- The caterer listing and caterer page are a preview of the product with fictional seed caterers; keep the “Preview” tag if the product UI changes before launch.
- Don't promise anything the first release doesn't do: no payments, no batches or pre-orders, enquiries only (L1 assumptions A-1 to A-3).

## Publishing

The YouTube thumbnail, captions, title, description and posting steps are in
`docs/marketing/youtube/README.md`.

## References

- `docs/specs/L1.md` (assumptions A-1 to A-4, A-8; L1-006, L1-007, L1-013)
- `docs/specs/L2.md` (L2-039, L2-040, L2-094)
- `docs/marketing/` (flyer copy: “You have a sweet hand. Let Toronto find it.”)
