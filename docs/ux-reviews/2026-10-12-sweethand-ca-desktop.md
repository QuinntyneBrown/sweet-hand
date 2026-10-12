# sweethand.ca desktop layout and UX review

Reviewed 12 October 2026 against captures of the live launch page at desktop and phone widths.

Reviewer: Codex.

## Verdict

The page is responsive. It reflows cleanly, preserves readable line lengths, keeps controls usable, and shows no visible horizontal overflow at a 390 CSS-pixel phone width.

It does **not make especially good use of a large desktop screen**. At 1920 px it feels deliberately minimal but somewhat sparse. At 2560 px and especially 3840 px, the hero, form and food photography occupy too little of the available canvas. The result is readable, but visually under-scaled: the primary experience feels like a narrow mobile-first column placed in the middle of a very large page.

The best next change would be a wide-screen hero composition at 1200 px and above, pairing the message and food imagery with the sign-up panel in two columns. The existing narrow layout should remain for smaller screens.

## Evidence reviewed

- [1920 px full-page capture](images/2026-10-12-launch-full-1920.png)
- [2560 × 1440 viewport capture](images/2026-10-12-launch-fold-2560.png)
- [3840 × 2160 viewport capture](images/2026-10-12-launch-fold-3840.png)
- [390 CSS-pixel phone full-page capture](images/2026-10-12-launch-full-390.png) (stored at 2× pixel density)

The page's design tokens and component CSS were also checked to distinguish intentional constraints from rendering defects.

## Layout

### Large desktop

The header and broad sections use a centred container capped at 90 rem (1440 px). That is a sensible maximum for the header, footer and three-column explanation. The hero and caterer call-out use a narrower 42 rem (672 px) container.

At 1920 px, the 1440 px container leaves approximately 240 px on each side. This is comfortable. The narrow hero has a clear reading order and the form is easy to scan, although it already feels modest relative to the viewport.

At 2560 px, the 1440 px container leaves approximately 560 px on each side. At 3840 px it leaves approximately 1200 px on each side. The cap prevents overly long lines, but the page has no visual element that uses the surrounding space. The food photographs remain small, the hero remains narrow, and the mostly black-and-white presentation makes the empty canvas more noticeable.

“How it works” is the strongest desktop section. Its three columns use the wide container, are easy to compare, and communicate the sequence quickly. The section could be more visually connected—numbers, a fine rule, or small icons would make the progression clearer—but its layout itself is effective.

The caterer call-out returns to the narrow centre column. That creates a left-to-centre-to-left eye path between the hero, wide explanation and call-out. On a large monitor, the sections feel more like separate islands than one composed page.

The footer correctly spans the wide container, but its large separation from the caterer call-out makes the bottom of the page feel unfinished rather than intentionally spacious.

### Phone

At 390 CSS px, the page becomes a coherent single column:

- the header remains on one line;
- the food images scale without clipping;
- the headline wraps naturally;
- the role choices stack vertically;
- the form controls use the available width;
- the three explanation steps stack in reading order; and
- the footer links fit without horizontal scrolling.

The mobile result is stronger than the large-desktop result. Spacing is generous without losing the relationship between each heading and its supporting copy. The header is close to its practical width limit, but remains usable at 390 px; the implementation also tightens the header button below 360 px.

## Typography and line spacing

The underlying type scale is sound:

| Text | Size | Line height | Assessment |
| --- | ---: | ---: | --- |
| Desktop H1 | 44 px | about 48 px (1.1) | Strong, compact display setting; the two-line break reads well. |
| Phone H1 | 36 px | about 40 px (1.1) | Clear and appropriately prominent. |
| H2 | 30 px | 33 px (1.1) | Good for short section headings. |
| H3 | 24 px | about 31 px (1.3) | Comfortable for the three steps. |
| Body | 16 px | 24 px (1.5) | Readable and not crowded. |
| Overline | 12 px | 18 px (1.5) | Legible, although visually quiet on a large screen. |

There are no obvious line-height problems. Headings are compact without collisions, and body copy has comfortable leading. Text measures are short, so the page avoids tiring line lengths.

The larger issue is vertical rhythm at desktop scale, not line spacing within text. The desktop tokens use 96 px between major sections and another 96 px before the footer. Those values are reasonable in isolation, but paired with very little content and small imagery they create large empty bands. The rhythm feels more natural on the phone, where the viewport narrows those bands and the content occupies a greater share of the screen.

## General UX feedback

### What works

- The primary action is unmistakable and repeated in the header.
- The sign-up form is short, with large targets and clear labels.
- “Planning an event” and “A caterer” establish the two audiences immediately.
- “One email, nothing else” is concise reassurance next to the consent control.
- The three-step explanation is brief and easy to scan.
- Food photography adds specificity and warmth without competing with the form.
- The page remains usable and visually stable from phone to large desktop.

### What could improve

1. **The wide-screen hero is under-composed.** On 2560 px and 3840 px displays, the main proposition and form are too small relative to the canvas. This is the highest-impact issue.

2. **The photography is too small on desktop.** The three hero circles are engaging at phone scale but look decorative and distant on large screens. They do not provide enough colour or appetite appeal to balance the white space.

3. **The value proposition is thin.** “Caribbean caterers, all in one place” says what the service is, but not why someone should join before launch. A short line about finding cooks by dish, island tradition and GTA area would make the benefit more concrete.

4. **The page lacks a visual preview of the coming product.** A small listing preview, dish collage, or neighbourhood/tradition cues would help visitors understand what they are signing up for and would use wide-screen space productively.

5. **The caterer path is easy to miss.** The call-out is well below the primary form and visually quiet. Selecting “A caterer” in the form helps, but the lower call-out could carry one specific benefit, such as free listing or early profile setup, more prominently.

6. **Section transitions feel disconnected.** The narrow hero, wide three-column section and narrow call-out have different alignments without a strong visual device tying them together.

7. **The form's requirements are implicit.** The page does not visibly state that role, email and consent are required before submission. Good inline error handling may cover this after submission, but a small up-front cue would reduce uncertainty.

## Recommendations

### High priority

- At 1200 px and above, use a two-column hero inside the main 1440 px container. Put the proposition and larger food imagery on one side and a 28–32 rem sign-up panel on the other.
- Increase the desktop visual weight of the food photography. A larger overlapping cluster or one strong hero image would work better than three small circles floating above the heading.
- Expand the supporting sentence by one line to explain the discovery value: dishes, island traditions and GTA areas are the platform's differentiators.

### Medium priority

- Visually connect the three “How it works” steps with numbers or a subtle directional treatment.
- Give the caterer call-out a wider or lightly tinted band so it reads as a distinct secondary conversion path, not another small content island.
- Reduce one of the 96 px vertical gaps on desktop if the content remains this sparse. Do not reduce the body line height.

### Lower priority

- Add a short “All fields are required” cue or mark the optional/required status consistently.
- Consider moving the privacy reassurance onto the same visual line as the checkbox at wider widths, while keeping the current stacked treatment on phones.
- Test the header specifically at 320 px with browser text enlarged to 200%; it is the most likely place for crowding even though the 390 px capture is sound.

## Direct answers

**Is the page responsive?** Yes. The layout changes appropriately between desktop and phone widths, controls reflow, text wraps cleanly, and no horizontal overflow is visible in the reviewed captures.

**Does it make good use of the space?** On phones, yes. At 1920 px, partly. At 2560 px and 3840 px, no: the readable maximum widths are appropriate, but the composition needs larger imagery or a two-column hero so the constrained text does not feel stranded in a mostly empty canvas.
