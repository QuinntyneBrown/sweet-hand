# Business card — Quinntyne Brown

Founder and Chief Product Officer, Sweet Hand. hello@sweethand.ca · sweethand.ca

| File | Purpose |
| --- | --- |
| `quinntyne-brown-business-card.pdf` | Print file for online printers: bleed, no marks. Page 1 front, page 2 back. |
| `quinntyne-brown-business-card-crop-marks.pdf` | The same on a 4.5 × 3 in page with crop marks and a slug label, for a print shop. |
| `quinntyne-brown-business-card-8up-letter.pdf` | 8-up on US Letter with crop marks, for a print shop or a desktop printer on card stock. |
| `card.html` | Source. Open in a browser to preview with trim (blue dashed) and safe-zone (pink dotted) guides. |
| `proof-front.png`, `proof-back.png` | 300 dpi proofs, full bleed, no guides. |
| `fonts/figtree-500/600/700.ttf` | Figtree (SIL Open Font License 1.1, `fonts/OFL.txt`): static weights of the design system's typeface. |

## Print spec

- Trim size: 3.5 in × 2 in (North American standard)
- Bleed: 0.125 in on every side, so the PDF page is 3.75 in × 2.25 in
- Safe zone: all text sits at least 0.125 in inside the trim
- Duplex: front and back, flip on the long edge
- Colour: design-system palette (stone 950, pepper 500/600, white), sent as RGB;
  ask the printer to convert to CMYK and send a proof, since pepper red shifts
  slightly. The black front wants a rich black, so check the proof for banding.
- Fonts are embedded as TrueType subsets. Static weights are used because a
  variable font embeds as Type 3, which print RIPs reject; the renderer checks.
- Crop marks: 0.25 pt registration black, 1/16 in outside the bleed
- Smallest type: 7.75 pt (the title line)
- Suggested stock: 14–16 pt matte or uncoated

## Which PDF to send

- Online printers (Vistaprint, Moo and the like): `quinntyne-brown-business-card.pdf`.
  Upload page 1 as the front and page 2 as the back.
- A print shop that asks for crop marks: `-crop-marks.pdf`.
- Printing and cutting yourself, or a shop that runs Letter sheets: `-8up-letter.pdf`.
  Print both pages duplex, flip on the long edge, at 100 % ("Actual size", never
  "Fit"), then cut on every mark: neighbouring cards share no bleed, so each gap
  between cards is two cuts.

## Regenerating

Edit `card.html`, then from the repository root:

```bash
cd frontend && npm install        # once; borrows @playwright/test
node docs/business-cards/render.mjs
```

The renderer fails if Figtree falls back to a system font, a PDF has the wrong page
count or size, any font embeds as Type 3, or a proof is not 1125 × 675 px. Crop
marks and gang-up sheets come from `docs/marketing/lib/press.mjs`.
