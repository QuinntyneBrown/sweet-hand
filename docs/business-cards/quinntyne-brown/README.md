# Business card — Quinntyne Brown

CEO, Founder and Principal Product Engineer, Sweet Hand.

| File | Purpose |
| --- | --- |
| `quinntyne-brown-business-card.pdf` | Print file. Page 1 front, page 2 back. |
| `card.html` | Source. Open in a browser to preview with trim (blue dashed) and safe-zone (pink dotted) guides. |
| `proof-front.png`, `proof-back.png` | 300 dpi proofs, full bleed, no guides. |
| `fonts/figtree-latin.woff2` | Figtree (SIL Open Font License 1.1), the design system's typeface. |

## Print spec

- Trim size: 3.5 in × 2 in (North American standard)
- Bleed: 0.125 in on every side, so the PDF page is 3.75 in × 2.25 in
- Safe zone: all text sits at least 0.125 in inside the trim
- Duplex: front and back, flip on the long edge
- Colour: design-system palette (stone 950, pepper 500/600, white), sent as RGB;
  ask the printer to convert to CMYK and send a proof, since pepper red shifts slightly
- Fonts are embedded in the PDF
- Suggested stock: 14–16 pt matte or uncoated

## Regenerating

Edit `card.html`, then print it from Chromium to PDF with paper size 3.75 × 2.25 in,
no margins and background graphics on (or use Playwright's `page.pdf` with
`preferCSSPageSize: true` and `printBackground: true`).
