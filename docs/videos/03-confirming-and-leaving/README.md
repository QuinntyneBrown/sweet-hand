# 03 · Confirming and leaving

> **Runtime:** ~5 min · **Audience:** the Sweet Hand team, contributors and reviewers · **Prerequisites:** video 02

**Video:** [03-confirming-and-leaving.mp4](03-confirming-and-leaving.mp4) · [Slides](slides.html) · **Audio:** [03-confirming-and-leaving.mp3](03-confirming-and-leaving.mp3) · [Transcript](script.md)

## Why this video exists

A sign-up only counts once confirmed, and leaving must be as easy as joining.
This follows the confirmation and removal links on the real app and API, and
shows what PostgreSQL actually stores.

## Learning objectives

By the end, the viewer can:

- Explain double opt-in and why the page posts tokens after it loads.
- Name the three ways to leave and what removal deletes.
- Describe what a record and its tokens hold.

## Key questions

| Question | What a strong answer includes |
|---|---|
| Why not confirm on a GET? | Email scanners fetch links; the page posts the token after load (L2-099.2) |
| What does a used or old link show? | "That link has expired" above an empty form; list unchanged (L2-099.4) |
| How does a mail client unsubscribe? | RFC 8058 `List-Unsubscribe-Post`; POST authorised by the token alone (L2-100.2, L2-104.3) |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/launch-list/leave.ts` | Removal by page, link and one-click POST |
| `backend/src/launch-list/tokens.ts`, `erase.ts` | Hashed tokens; what removal deletes |
| A `launchList` document | The consent record (real, fictional address) |

Recordings: `clips/confirm`, `confirm-phone`, `link-expired`, `remove-button`, `removal-link`.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:16 | Introduction | Confirm, then leave |
| 00:16-00:48 | Double opt-in | 48-hour single-use link; outbox records on screen |
| 00:48-01:35 | Confirming | Confirmation recording; POST after load, token cleared |
| 01:35-01:44 | The same thing on a phone | 390 px recording |
| 01:44-02:06 | Links that no longer work | Expired link recording |
| 02:06-03:00 | Leaving in one click | "Remove my email"; removal link, twice |
| 03:00-03:44 | One-click unsubscribe from the mail client | Headers; real GET and POST responses |
| 03:44-04:29 | What is stored | A confirmed record; hashed tokens |
| 04:29-04:58 | Recap | Three things to remember; next video |

## Demo commands

```sh
node tools/video-record/launch-stack.mjs up
node tools/video-record/record-clips.mjs docs/videos/03-confirming-and-leaving
```

## Pitfalls

- The recorder reads links from the outbox before the background worker sends the email (sent emails drop their links); if a clip reports the email was already sent, record it again.
- `link-expired` reuses the link opened by `confirm`, so record them together.

## References

- `docs/specs/L2.md` (L2-099, L2-100, L2-103, L2-104)
- `docs/detailed-designs/launch/confirm-launch-list-email/README.md`, `leave-launch-list/README.md`
- [RFC 8058](https://www.rfc-editor.org/rfc/rfc8058)
