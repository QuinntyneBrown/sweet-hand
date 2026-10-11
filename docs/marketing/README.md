# Pre-launch marketing: flyer and stickers

A two-sided flyer and three die-cut stickers, low on words, in the design
system's look (Figtree, stone and pepper). Everything points at
`https://sweethand.ca`.

| File | Purpose |
| --- | --- |
| `flyer/sweet-hand-pre-launch-flyer.pdf` | Flyer print file. Page 1 front (eaters), page 2 back (makers). |
| `flyer/flyer.html` | Source. Open in a browser to preview with trim (blue dashed) and safe-zone (pink dotted) guides. |
| `flyer/proof-front.png`, `proof-back.png` | 300 dpi proofs, full bleed, no guides. |
| `stickers/sticker-N-*.png` | Sticker print files: 900 × 900 px RGBA, transparent. The alpha edge is the die cut. |
| `stickers/sticker-N-*.svg` | Editable vector, font inlined, hidden magenta `#cutline` layer. Outline the text before sending to a printer that is not using the PNG. |
| `stickers/sticker-N-*-preview.png`, `contact-sheet.png` | Review only: on paper with a shadow. |
| `stickers/src/` | Sticker sources (`sticker-N-*.html`, `stickers.css`). Edit these, never the SVG. |
| `assets/` | Figtree (SIL Open Font License 1.1, `fonts/OFL.txt`), `print.css`, and the generated `qr-sweethand-ca.svg`. |
| `lib/qrcodegen.mjs` | Project Nayuki's QR Code generator (MIT), transpiled from its TypeScript. |
| `render.mjs` | Regenerates every file above. |

## Copy

- **Front** (eaters): "Someone with a sweet hand." is the About page headline. The dish
  list is a quiet filter list in the listing page's idiom; one item is pepper, because
  pepper means "selected".
- **Back** (makers): "Free to list", "You set the menu, the batches and the days" and
  "Your home address stays private" restate the domain rules (small scale, maker privacy).
  The call to action is the library string "Cater with Sweet Hand".
- "Coming soon." is the pre-launch line. Drop it from `flyer.html` once the site is live.
- Sticker 2 uses the standard phrase "You have a sweet hand." A dialect spelling is a
  one-line edit in `stickers/src/sticker-2-sweet-hand.html`; makers' own spelling wins.
- Under 40 words a side, excluding the dish list and URL. No claims about certified or
  inspected kitchens (see `docs/design-system/foundations/content.html`).

## Flyer print spec

- Trim size: 5 in × 7 in
- Bleed: 0.125 in on every side, so the PDF page is 5.25 in × 7.25 in
- Safe zone: all text sits at least 0.125 in inside the trim (the pepper band is the
  only element that runs into the bleed)
- Duplex: flip on the long edge. The band is on the right of the front and the left of
  the back, so it lines up on both sides.
- Colour: design-system palette (stone 950, pepper 500/600, white), sent as RGB. Ask the
  printer to convert to CMYK and send a proof, since pepper red shifts slightly. The
  dark back wants a rich black, so check the proof for banding.
- Fonts are embedded in the PDF. Smallest type is 10 pt.
- Suggested stock: 100 lb (270 gsm) gloss or matte text, or 14 pt card.
- The QR code is 1.2 in square with a 4-module quiet zone, version 2, error correction M.
  Both proofs were decoded and resolve to `https://sweethand.ca`.

## Sticker print spec

| | |
| --- | --- |
| Canvas | 900 × 900 px = 3 in × 3 in at 300 DPI |
| Cut size | 2.90 × 1.70 in (wordmark badge), 2.83 × 2.30 in (speech bubble), 2.75 × 2.75 in (dish ring) |
| Background | Fully transparent, RGBA |
| Colour | sRGB; the printer converts to CMYK and their proof is the check |
| Keyline | 65 px (0.217 in) of white outside the artwork on every edge |
| Cut line | The alpha edge of the PNG; the printer traces it |
| Finish | Super matte or matte vinyl |

Each silhouette is one connected piece (the renderer fails if not). The edge type
`SWEETHAND.CA` is Figtree 800, tracked, black, set in the white rim.

### Sending to a printer

1. Choose die cut, custom shape, 3 in × 3 in, matte vinyl.
2. Upload the print PNG, not the preview and not the SVG.
3. Check the free digital proof: the cut line should follow the outside of the white
   border and not clip the artwork.

## Regenerating

```bash
cd frontend && npm install        # once; borrows @playwright/test
node docs/marketing/render.mjs
```

Set `SWEET_HAND_MODULE_ROOT` to another folder whose `package.json` resolves
`@playwright/test` if `frontend/node_modules` is not installed. The renderer fails if
Figtree falls back to a system font, a PDF is not 2 pages of 5.25 × 7.25 in, a proof is
not 1575 × 2175 px, a sticker is not 900 × 900 RGBA with transparent corners, the
artwork touches the canvas edge, or a die cut is more than one piece.

## Licences

Figtree: SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). QR Code generator library:
MIT, Copyright Project Nayuki (header kept in `lib/qrcodegen.mjs`).
