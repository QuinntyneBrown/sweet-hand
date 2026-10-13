# Sweet Hand launch roadmap

**Status:** Founder's roadmap, 12 October 2026. Not a specification; every product change in it
still needs L1/L2 requirements, a detailed design and mocks before implementation (`AGENTS.md`).
Figures are approximate and in CAD. The work itself is in the [launch backlog](launch-backlog.md).

## Summary

Sweet Hand opens to the public on **Thursday 26 November 2026** with founding caterers live, their
pages built on studio photos, and a Christmas menus campaign running the same day.

Four two-week sprints get there:

| Sprint | Dates | Goal |
| --- | --- | --- |
| 1 | Mon 12 Oct – Fri 23 Oct | **Decide and start.** Launch scope locked in approved specs, designs and mocks. Staging and UAT running. Founding-maker offer out, 40 makers recruited, first 12 shot. Company and mailboxes set up. |
| 2 | Mon 26 Oct – Fri 6 Nov | **Founding caterers build their pages on production.** Founding access released to production by Wed 4 Nov. The product app deploys to staging and UAT. Uploaded photos are stripped of location data. 100 makers signed, 56 shot. |
| 3 | Mon 9 Nov – Fri 20 Nov | **The directory is full and the release is frozen.** v1.0.0-rc.1 passes UAT. The switch-over is rehearsed. Monitoring and the restore drill are done. At least 80 founding pages approved. Legal text final. Launch kit and press ready. Code freeze Fri 20 Nov. |
| 4 | Mon 23 Nov – Fri 4 Dec | **Launch and hold.** Go/no-go Tue 24 Nov. v1.0.0 opens the product Thu 26 Nov. Launch email sent. Hypercare. Christmas menus campaign live. Pre-orders and payments specified. |

Sprint 1 starts on Thanksgiving Monday, so it carries less engineering work than the others.

## Where we are on 12 October

The product is built, but nobody can use it yet.

**Built and tested:**

- The caterer listing, filters and caterer pages.
- Enquiries with notifications and history.
- Caterer registration, page building and photos.
- Operator approval, moderation and metrics.
- Reviews and reports.
- Privacy and security (L2-001 to L2-091).
- The launch site and launch list (L2-092 to L2-107).
- Azure delivery and environments (L2-108, L2-109).

**What stands between today and launch day:**

| Gap | Why it matters | Where it's fixed |
| --- | --- | --- |
| Production serves only the launch site. `deliver.yml` never builds the product app, and the product app has no static hosting config. | Nothing to switch to on launch day | SH-12, SH-13 |
| Photos are served at `/media/:id`, outside the `/api/*` link on Static Web Apps | No photo would load in production | SH-11 |
| Pre-launch mode blocks caterer registration on production | Launch day would open with zero caterers | SH-02 to SH-10 |
| The security-key stand-in accepts any `local-key:` value | Operator two-factor sign-in could be bypassed | SH-17, SH-23 |
| Uploaded photos keep their EXIF data | A phone photo's GPS tags could reveal a maker's home | SH-19 |
| No command creates the first Admin operator | Nobody can approve the first page | SH-18 |
| Staging and UAT don't exist | ADR 0012 requires UAT before any production release | SH-29 |
| Old launch links on the product aren't built (L2-102) | Launch-email links and removal links would break | SH-14 |
| No uptime monitor or restore drill; the product never counts visits | Blind on launch day; metrics read zero | SH-25, SH-26, SH-27 |
| The terms and privacy pages hold fictional processors, `@sweethand.example` addresses and a fictional date | They aren't true, and counsel hasn't seen them | SH-24, SH-63 |

## Launch scope

**In:** the product as specified (L1-001 to L1-023): a free directory of caterers that people can search
by island, area and occasion, with enquiries, reviews and operator moderation. Founding caterers build
and get approved before launch, through invites (a new requirement, SH-02).

**Out until after launch:**

- **Pre-orders and payments.** L1 assumptions A-2 and A-3 keep money off the platform. Pre-orders
  with batch limits, cut-offs and sold-out states, and Stripe, are specified in Sprint 4
  (SH-34, SH-35) and built from December.
- **Business-plan features that aren't specified.** That covers Maker Pro, featured listings, the
  verified badge, per-caterer analytics, the newsletter, sponsored placements and dish or
  neighbourhood SEO pages. Featured listings and the public verified badge conflict with L2-002 and
  A-4 as written, so each needs a requirements decision first.
- **The public preview** at `preview.sweethand.ca` ([plan](public-preview.md)). Founding caterers
  use the real product instead. Only the preview plan's photo move (slice 1) and product static
  config (slice 9) are pulled in, because launch needs them.
- **The operator directory mocks** (places, map, events, calendar), which have no requirements yet.
- **Most of the frontend technical debt** (`docs/technical-debt/frontend.md`). Only T-19 (admin
  route guard) and T-58 (WCAG 2.2 checks) are pulled in.
- **The ADR 0008 reconciliation** (object storage, a job queue, a separate worker). Launch runs one
  API replica, as built.

**The Christmas campaign runs through enquiries.** Makers add Christmas items to their menus: black
cake, sorrel, pastelles, ponche de crème, garlic pork, ham. People send an enquiry for their date
and quantity, and the maker agrees the details directly with them.

## Workstreams by sprint

The backlog groups the work into five initiatives. The engineering lane is the founder working with
coding agents; the business lane is the founder's own time.

| Initiative | Sprint 1 | Sprint 2 | Sprint 3 | Sprint 4 |
| --- | --- | --- | --- | --- |
| **I1 Launch-ready product** | Approve the launch drafts. Specify, design and mock founding access, the hand-over and hardening. Photos under `/api/media`. Staging and UAT up. | Invites, redemption and page building in pre-launch. Product delivery. Location data stripped. First Admin command. Stand-in keys refused. Founding access in production (v0.2.0). | "Live on launch day" status. Old launch links. Real legal text. Bot protection. Monitoring, restore drill, visits. Shareable pages. Rehearsal. v1.0.0-rc.1. Code freeze. | v1.0.0 and launch day. Hypercare. Real security keys. Asset budgets and WCAG 2.2. Retire launch hosting. |
| **I2 Founding makers** | Offer and agreement. 40 recruited. Shoot kit. Studio block 1 (3 days, 12 makers). | 100 signed. Studio block 2 (9 days, 44 makers). Profile clinics, wave 1. | Studio block 3 (8 days, 44 makers). Profile clinics, wave 2. At least 80 pages approved. | Remaining pages approved as they come in. |
| **I3 Launch marketing** | Finish YouTube, Facebook and Instagram. Content calendar. | Flyer drops with recruiting. Daily posting begins. | Launch-day kit for makers. Press under embargo. Christmas menus campaign set up. Daily maker story from 9 Nov. | Launch-day run of show. Google Business Profile. CAD 500 paid social test. |
| **I4 Legal and business** | Incorporate. Bank account. Mailboxes. | Insurance. Lawyer review of the terms, privacy, CASL wording and maker agreement. | Counsel's edits land in the product (SH-24). | Founder's food handler certificate. |
| **I5 Revenue and after launch** | — | Services price sheet, booking and invoicing. | First 3 paid shoots or portraits booked. | Sponsor conversations. January supper club planned. 90-day scorecard. Pre-orders and payments specified. |

## Milestones and key dates

| Date | Milestone |
| --- | --- |
| Mon 12 Oct | Sprint 1 starts (Thanksgiving) |
| Tue 20 Oct | First studio day |
| Fri 23 Oct | Sprint 1 review: launch specs approved, staging and UAT live, 40 makers signed |
| Mon 26 Oct | Insurance bound before studio block 2 |
| Wed 4 Nov | Founding access in production (v0.2.0); first invites sent |
| Fri 6 Nov | Sprint 2 review: 100 makers signed, 56 shot |
| Mon 9 Nov | Daily maker stories begin |
| Fri 13 Nov | Legal text final from counsel |
| Wed 18 Nov | v1.0.0-rc.1 in UAT |
| Fri 20 Nov | Code freeze, launch rehearsal on UAT, at least 80 pages approved |
| Mon 23 Nov | Launch-day kit sent to every approved maker |
| Tue 24 Nov | Go/no-go |
| Thu 26 Nov | **Launch day** |
| Fri 4 Dec | Sprint 4 review: hypercare closes |
| Sat 26 Dec | Launch list deleted, 30 days after launch day (L2-101) |
| About Sun 10 Jan 2027 | 90-day review |

## Launch day, Thursday 26 November

The launch email goes out only after production passes its smoke checks. A rollback before 10:00
is invisible to everyone on the list. SH-16 writes and rehearses the exact runbook; this is its shape.

| Time | Step |
| --- | --- |
| Wed 25 Nov, 16:00 | rc approved in UAT. Production approval ready. Posts scheduled. Makers reminded of their 10:30 post. |
| 07:00 | Tag `v1.0.0` from the approved rc. The MAJOR version ends pre-launch mode (`docs/operations/environments.md` §Versions). Production deployment approved. |
| 07:45 | Smoke checks pass:<br>• Deep links resolve.<br>• The listing shows the founding caterers.<br>• Photos load.<br>• A test enquiry goes through.<br>• The operator queue opens. |
| 08:30 | Founder walks the product on a phone as a customer, a caterer and an operator |
| 10:00 | `npm run launch-email` against production: one email per confirmed address. Outbox watched. |
| 10:00 | Press embargo lifts. Sweet Hand's launch posts go out. |
| 10:30 | Founding makers share their pages, using the launch-day kit |
| All day | App Insights, outbox, moderation queue (registration is now open to everyone), security log |
| 17:00 | Day-one numbers recorded. Hotfix list triaged. |

**Rollback:** redeploy the previous release (`docs/operations/environments.md` §Rollback). If
that happens before 10:00, the launch email simply waits.

## Go/no-go, Tuesday 24 November

Launch goes ahead on 26 November when all of these hold:

| Criterion | Minimum | Target |
| --- | --- | --- |
| Founding pages approved | 60 | 100 |
| v1.0.0 release candidate | Passed UAT and the switch-over rehearsal | No open high-severity defects |
| Restore drill | Done, with the time recorded | Under one hour |
| Terms and privacy | Counsel's edits in the product | — |
| Operator sign-in | Stand-in security keys refused in production | Real security keys (SH-23) |
| Uptime monitor | Alerting to the founder | — |

If fewer than 60 pages are approved, hold the date and open with what's live. A launch date set
in public is worth more than ten extra pages; the remaining makers go live in December as Christmas
content. Move the date only if the release itself fails a minimum.

## Risks and fallbacks

| Risk | Likelihood | Mitigation | Fallback |
| --- | --- | --- | --- |
| Founder hours: 20 studio days in six weeks, alongside engineering reviews | High | Five makers per studio day, Saturdays allowed. Coding agents carry the implementation. Business points capped at about 25 a sprint. | 60 live at launch; the remaining shoots run in December |
| Founding access is late: it is on the critical path to every live page | Medium | SH-06, SH-07, SH-12, SH-13 go first in Sprint 2 | Profile clinics compress into Sprint 3; operators help makers complete pages in person |
| Makers lack a food handler certificate | Medium | Ask at recruitment; point them to a course in week one | Shoot them now; their pages go live once a certificate is uploaded (L2-040) |
| Counsel is slow on the terms, privacy and CASL wording | Medium | Brief counsel in Sprint 2 with the pages and specific questions | Launch on the fixed text with counsel's must-fix items only |
| The first production run of the product delivery fails | Medium | Staging from Sprint 2, rehearsal on UAT in Sprint 3 | The image rollback already in `deliver.yml`; hold the launch email |
| Launch-day traffic on one API replica | Low | Asset budgets, image renditions (SH-19), the uptime monitor | Scale the Container App vertically; the in-process scheduler keeps it at one replica |
| Budget alerts once the product runs against the CAD 100 budget | High | Decide in SH-29 whether to raise `budgetAmount` | Accept and record the alerts in the runbook |
| Recruiting from the launch list | — | Not allowed: L2-101 limits the list to one launch-day email | Recruit through the founder's network, churches, grocers and seller groups |

## After launch, to the 90-day review

The business plan's 90-day targets carry over. One changes, because pre-orders aren't in the
launch:

| Target | Status |
| --- | --- |
| 100 makers live with studio photos | Unchanged |
| 500 customer accounts | Unchanged |
| CAD 5,000 Christmas pre-order GMV | **Replaced.** It can't be measured without pre-orders; SH-68 sets an enquiry target in its place |
| 10 paid shoots or portrait sessions | Unchanged |
| One sold-out supper club | Unchanged (January) |
| Three sponsor conversations | Unchanged |

Sprints 5 and 6 (7 Dec – 18 Dec; 4 Jan – 15 Jan) are planned at the Sprint 4 review. The likely
work is the pre-order and payment designs and mocks, the Christmas campaign's results, a second wave
of makers, and the technical-debt items that bite once real people use the product.
