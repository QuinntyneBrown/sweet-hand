# 04 · Launch day

> **Runtime:** ~4.5 min · **Audience:** the Sweet Hand team, operators and reviewers · **Prerequisites:** video 03

**Video:** [04-launch-day.mp4](04-launch-day.mp4) · [Slides](slides.html) · **Audio:** [04-launch-day.mp3](04-launch-day.mp3) · [Transcript](script.md)

## Why this video exists

The list exists for one email. This shows the operator command that sends it,
what changes on the launch site at that moment, what is still to be built for
the hand-over to the product, and how the list is deleted.

## Learning objectives

By the end, the viewer can:

- Run the launch-day command and explain why a second run is harmless.
- Describe what visitors see after it runs.
- Explain the hourly sweep and what remains to be built.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Why a command and not a button? | No web UI can send it by accident (L2-101.1) |
| What if it runs twice? | Each record is marked in the same transaction as its email (L2-101.2) |
| What happens to old links after launch? | Removal keeps working; confirmations close; product-side redirect is designed but needs its mock (L2-102) |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/launch-list/send-launch-email.ts` | The command |
| `backend/src/launch-list/sweep.ts` | The 30-day deletion |
| `docs/detailed-designs/launch/retire-launch-site/README.md` | What is still to come |

Recordings: `clips/sign-ups-closed`, `confirmation-closed`, `launch-day-emails` (their setup runs the real `npm run launch-email`).

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:17 | Introduction | One email, then the list closes |
| 00:17-01:13 | One explicit command | `npm run launch-email`; real output of two runs |
| 01:13-01:51 | Two kinds of launch-day email | Customer and caterer; CASL details |
| 01:51-02:35 | The launch site after the command | 410 sign-up, closed confirmation, both emails, removal |
| 02:35-03:14 | What still has to happen | The swap at `/`; the product's link handling |
| 03:14-03:54 | Deleting the list | The hourly sweep; one use only |
| 03:54-04:19 | Recap | Three things to remember |

## Demo commands

```sh
node tools/video-record/launch-stack.mjs up
node tools/video-record/record-clips.mjs docs/videos/04-launch-day
# by hand, against the demo database only:
cd backend && DATABASE_URL=postgres://sweethand:sweethand@localhost:5432/sweethand npm run launch-email
```

## Pitfalls

- `npm run launch-email` closes sign-ups for good in that database; `launch-stack.mjs reset` reopens the demo database only.
- The 30-day deletion is not recorded live; it is shown from the code.

## References

- `docs/specs/L2.md` (L2-101, L2-102)
- `docs/detailed-designs/launch/send-launch-day-email/README.md`, `retire-launch-site/README.md`
