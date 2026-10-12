# UX review: sweethand.ca launch page on large desktop screens

- **Date:** 2026-10-12
- **Page:** <https://sweethand.ca/> (pre-launch site, `frontend/projects/launch/`)
- **Method:** Headless Chromium (Playwright), viewports 3840×2160, 2560×1440,
  1920×1080, 1440×900, 1024×768, 768×1024 and 390×844 (2×). Screenshots were
  taken after a 2.5 s settle, and box metrics were read from the live DOM.

## Summary

The page is **responsive**: it never scrolls sideways, the layout reflows
at each breakpoint, and the phone layout is the strongest of all. It
**makes poor use of space on large desktops**, though. All the content sits
in a 512 px column, and from 1440 px wide upward the layout is the same
size in absolute pixels. On a 1920 px screen about 73 % of the width around
the hero is empty. On a 4K screen the page fills the top third, and a
footer floats in a blank field. Nothing scales up past 1024 px: the type,
the images and the form stay the same size. The page reads like a phone
layout centred on a large canvas.

| Viewport | Hero column | Share of width | Page height | Fits above the fold? |
| --- | --- | --- | --- | --- |
| 3840×2160 | 512 px | 13 % | 2160 (fills the viewport, with a large void above the footer) | Everything, with ~600 px of blank space |
| 2560×1440 | 512 px | 20 % | 1662 | Up to the caterer button |
| 1920×1080 | 512 px | 27 % | 1662 | Hero and form; "How it works" falls just below |
| 1440×900 | 512 px | 36 % | 1662 | Hero and most of the form |
| 1024×768 | 576 px | 56 % | 1765 | Hero only |
| 390×844 | 358 px | 92 % | 1794 | Hero and the start of the form |

![1920×1080, full page](images/2026-10-12-launch-full-1920.png)

## Is it responsive?

Yes, at the level of layout mechanics.

- No horizontal scroll at any width (`scrollWidth === innerWidth`
  everywhere).
- The header shrinks across breakpoints (96 → 80 → 64 px). Side gutters
  step down from 80 px to 48, 32 and 16 px.
- The h1 drops from 44 px to 36 px at the tablet breakpoint.
- "How it works" goes from 3 columns to 2 columns (1024 and 768) to
  1 column (390).
- The radio pair stacks on phones.

It is **not responsive upward**. Every rule seems to be a `max-width`
breakpoint that stops at 1440 px. From 1440 px to 3840 px the rendered
page is pixel-identical apart from the outer margins. There is no fluid
type (`clamp()`), no wider column and no larger imagery on big screens.

Two awkward in-between states:

- **1024 and 768 px:** "How it works" breaks 2 + 1, so "Agree" sits alone
  on a second row. Three short items fit in one row at 768 px, or they
  should drop straight to one column. A 2-up grid doesn't suit 3 items.
- **3840 px:** the main area has a minimum height, so the footer is pinned
  to the bottom of the viewport. That leaves ~600 px of white space between
  the caterer section and the footer. On a page this short, it reads as
  something failed to load.

![3840×2160, first viewport](images/2026-10-12-launch-fold-3840.png)

## Layout

1. **Three competing alignment axes.** On a 1920 px screen:
   - the header, "How it works" and the footer start at x = 320 (the
     1280 px container);
   - the hero, the form and the caterer block start at x = 704 (the
     512 px column);
   - the photo cluster is centred over the left-aligned hero text.

   The eye zig-zags between the left-aligned columns of "How it works" and
   the centred-but-left-aligned narrow blocks. Pick one axis. Either centre
   the hero and caterer text to match the photos, or left-align everything
   to the 1280 px container and use the width for a two-column hero (see
   recommendations).
2. **"How it works" doesn't fill its row.** The three columns are fixed at
   290 px with 40 px gaps. They span 950 of the 1280 px container, leaving
   a 330 px empty strip on the right. The section looks unfinished and
   doesn't line up with anything above or below it.
3. **The photo cluster is small for a food brand.** At 74 px, 107 px and
   74 px it is the same size on a 4K monitor as on a phone. Food photography
   is the strongest selling point here, and on desktop it is a thumbnail
   strip.
4. **The caterer section's image framing is off.** The 99 px circle crops
   a pale purple shape across the top of the dish photo. The cluster's left
   plate is also cropped off-centre. Both read as accidental at desktop
   size.
5. **The header CTA duplicates the form.** "Get the launch email" appears
   three times within 900 px: the header pill, the form heading and the
   submit button. On desktop, where the form is already above the fold,
   the header pill adds nothing. Consider hiding it while the form is in
   view, or changing it to "Join as a caterer" to reach the second audience.

## Line spacing and vertical rhythm

| Element | Size / line height | Ratio | Note |
| --- | --- | --- | --- |
| Overline | 12 / 18 px | 1.5 | Fine, but 12 px uppercase is small on a 27"+ screen |
| h1 | 44 / 48.4 px | 1.1 | Good for display; two lines balance well |
| Subtitle | 16 / 24 px | 1.5 | Too small to hold up a 44 px headline on desktop. The jump is 2.75×, with no step in between |
| Form h2 | 30 / 33 px | 1.1 | Fine |
| Body / muted | 16 / 24 px | 1.5 | Fine |
| Consent | 14 / 21 px | 1.5 | Fine |

Spacing problems, from the measured boxes:

- **The form heading sits on top of the "I'm…" label.** The h2 ends at
  y = 524 and the form begins at y = 524, so the gap is zero. "I'm…"
  reads as a subtitle of the heading rather than a field label. Add at
  least 16 px (`--space-4`) between the h2 and the first fieldset.
- **The overline is too close to the photos and the h1.** The photos end
  at y = 265, the overline starts at y = 272, and the h1 at y = 298. A 7 px
  gap under the photos looks cramped next to the ~48 px gaps between
  sections.
- **The subtitle is close to the h1 (8 px) and far from the form card
  (48 px).** This part is right: the subtitle groups with the headline.
  The 8 px gap is tight for 44 px type, though; 12–16 px reads better.
- **Gaps between sections are uneven.** Form card to "How it works" is
  96 px. "How it works" to the caterer section is 96 px. Caterer button to
  the footer is ~96 px at 1920, but ~600 px at 4K (see above). The heading
  for "How it works" sits 48 px above its items. The caterer heading sits
  only 14 px below its image.
- **The consent line is indented** to align with the checkbox label, at
  32 px from the card edge. Its first word therefore doesn't line up with
  anything else in the card. That's correct for association, but it adds
  a fourth left edge inside a 480 px card.

## General UX

What works:

- One clear primary action, visible above the fold at 1080 px and taller.
- Short, plain copy. "One email, nothing else" builds trust where it is
  needed most.
- Accessible patterns are in place: real labels, large hit areas on the
  radio cards, and visible checkbox and button outlines.
- The phone layout is close to ideal. It's tight and readable, with
  thumb-sized controls.

What to improve:

1. **The email checkbox is redundant with the submit button.** The user
   picks a role, types an email, ticks "Email me when Sweet Hand opens",
   then presses "Get the launch email". The tick restates the button. If
   it exists for consent (CASL), keep it. Otherwise it adds a step that
   will cost sign-ups.
2. **There is no sense of what's coming.** On a large screen there is
   plenty of room to show dishes, islands or neighbourhoods. One row of
   sample tiles (fictional, per the seed rules) would make "Caribbean
   caterers, all in one place" concrete. The page currently doesn't say
   which islands or dishes to expect.
3. **The subtitle undersells the name.** "Find someone with a sweet hand"
   is warm; "Caribbean caterers, all in one place" is generic. Desktop has
   room for one more sentence. For example: "Jamaican, Trini, Guyanese,
   Bajan and more — home cooks and caterers across Toronto and the GTA."
   This also follows the domain rule against flattening the islands into
   one label.
4. **"How it works" has no visual anchors.** Three short headings with
   muted one-liners are easy to skip. Step numbers or small icons would
   give the row weight and fill its width.
5. **The caterer section is easy to miss.** It's the second audience, but
   it gets an outline button and a small image below the fold. On desktop
   it could sit beside "How it works", or share a two-column row with the
   eater form.

## Recommendations (most effective first)

1. **Use the width in a two-column hero at ≥ 1200 px.** Put the headline,
   subtitle and photos on the left, with the photos enlarged into a
   collage 2–3× their current size. Put the form card on the right. This
   brings "How it works" above the fold at 1080 px and removes the narrow
   strip.
2. **Make type fluid between 1024 and 1920 px:** for example,
   `font-size: clamp(2.25rem, 1.5rem + 2vw, 3.5rem)` for the h1, and
   scale the subtitle to 18–20 px. Keep the existing tokens at the ends of
   the range.
3. **Use one alignment axis.** Put every section on the 1280 px container
   grid, and let "How it works" span it (`repeat(3, 1fr)`).
4. **Fix the vertical rhythm:** 16 px below the form h2, 16 px below the
   photo cluster, and 12–16 px between the h1 and the subtitle.
5. **Remove the 4K footer void.** Let the footer follow the content, or
   centre the content vertically when the page is shorter than the
   viewport.
6. **Fix the image crops** for the caterer section and the left plate in
   the cluster.
7. **Grid "How it works" as 3 → 1, not 3 → 2 → 1.**

Under `AGENTS.md`, layout and behaviour changes to the launch page need a
requirement (L2-092), a detailed design and an updated mock before
implementation. Recommendations 1–5 and 7 are production behaviour
changes. Recommendation 6 is an asset change.

## Screenshots

- [1920×1080, full page](images/2026-10-12-launch-full-1920.png)
- [2560×1440, first viewport](images/2026-10-12-launch-fold-2560.png)
- [3840×2160, first viewport](images/2026-10-12-launch-fold-3840.png)
- [390×844, full page](images/2026-10-12-launch-full-390.png)
