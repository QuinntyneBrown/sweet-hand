# 02 · Joining the launch list

> **Runtime:** ~7 min · **Audience:** the Sweet Hand team, contributors and reviewers · **Prerequisites:** video 01

**Video:** [02-joining-the-launch-list.mp4](02-joining-the-launch-list.mp4) · [Slides](slides.html) · **Audio:** [02-joining-the-launch-list.mp3](02-joining-the-launch-list.mp3) · [Transcript](script.md)

## Why this video exists

The sign-up form is the launch site's only interaction. This shows every path
through it on the real app and API: fields, validation, sending, failure, the
answer that never reveals who is listed, and rate limits.

## Learning objectives

By the end, the viewer can:

- List the four fields and their rules.
- Describe the error summary and the server's own validation.
- Explain why new, pending and confirmed addresses get identical answers, and what each gets by email.

## Key questions

| Question | What a strong answer includes |
|---|---|
| What happens with three mistakes? | Nothing sent, "Fix 3 things", links focus fields, inline `aria-invalid` (L2-096) |
| What does a visitor see if the API is down? | "We couldn't add you just now", a reference, values kept, "Try again" (L2-097) |
| How does the form avoid leaking membership? | Same status, headers and body for every address; differences only by email (L2-098) |

## Code / assets on screen

| File | What to show |
|---|---|
| `backend/src/launch-list/rules.ts` | Server-side validation |
| `frontend/projects/launch/src/app/sign-up/launch-form.ts` | `failureReference` |
| `backend/test/launch-list/sign-up.test.ts` | Identical replies (L2-098.2) |

Recordings: `clips/fields`, `invalid`, `success`, `failure` (the API process is really stopped), `already-listed`, `rate-limited`.

## Run sheet

| Time | Segment | Content |
|---|---|---|
| 00:00-00:20 | Introduction | What the form is for |
| 00:20-01:00 | What the form asks for | Field table; business name recording |
| 01:00-01:46 | Mistakes, all at once | "Fix 3 things" recording; messages |
| 01:46-02:37 | The server checks again | Real 400, 413, 403 responses |
| 02:37-03:12 | A successful sign-up | Busy state, "Check your email", announcements |
| 03:12-03:54 | When sending fails | API stopped and restarted; the reference |
| 03:54-04:46 | Never revealing who signed up | Identical replies; already-listed email |
| 04:46-05:19 | Rate limits | 429 recording; per-IP and per-address limits |
| 05:19-05:47 | Recap | Three things to remember; next video |

## Demo commands

```sh
node tools/video-record/launch-stack.mjs up
node tools/video-record/record-clips.mjs docs/videos/02-joining-the-launch-list
```

## Pitfalls

- The `failure` clip stops and restarts the API; run it only against the local launch stack.
- The rate-limited and closed messages still need mocks, so the page reuses the failure alert.

## References

- `docs/specs/L2.md` (L2-095 to L2-098, L2-104)
- `docs/detailed-designs/launch/join-launch-list/README.md`
