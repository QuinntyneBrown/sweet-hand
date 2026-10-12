# Pre-launch marketing: flyer, stickers, WhatsApp Status and YouTube

A two-sided flyer, three die-cut stickers, two WhatsApp Status images and the
YouTube channel kit, low on words, in the design system's look (Figtree, stone
and pepper). Everything points at `https://sweethand.ca`.

| File | Purpose |
| --- | --- |
| `flyer/sweet-hand-pre-launch-flyer.pdf` | Flyer print file for online printers: bleed, no marks. Page 1 front (eaters), page 2 back (makers). |
| `flyer/sweet-hand-pre-launch-flyer-crop-marks.pdf` | The same on a 6 × 8 in page with crop marks and a slug label, for a print shop. |
| `flyer/sweet-hand-pre-launch-flyer-4up-12x18.pdf` | 4-up on a 12 × 18 in press sheet with crop marks; the back page backs up on a long-edge flip. |
| `flyer/flyer.html` | Source. Open in a browser to preview with trim (blue dashed) and safe-zone (pink dotted) guides. |
| `flyer/proof-front.png`, `proof-back.png` | 300 dpi proofs, full bleed, no guides. |
| `stickers/sticker-N-*.png` | Sticker print files: 900 × 900 px RGBA, transparent. The alpha edge is the die cut. |
| `stickers/sticker-N-*.svg` | Editable vector, font inlined, hidden magenta `#cutline` layer. Outline the text before sending to a printer that is not using the PNG. |
| `stickers/sticker-N-*-preview.png`, `contact-sheet.png` | Review only: on paper with a shadow. |
| `stickers/src/` | Sticker sources (`sticker-N-*.html`, `stickers.css`). Edit these, never the SVG. |
| `assets/` | Figtree (SIL Open Font License 1.1, `fonts/OFL.txt`), `print.css`, and the generated `qr-sweethand-ca.svg`. `figtree-500/600/700.ttf` are static instances of the variable `figtree-latin.woff2`, used by the flyer (see the print spec). |
| `whatsapp/status-1-eaters.png`, `status-2-makers.png` | WhatsApp Status (Update) images, 1080 × 1920 px. Post them in this order. |
| `whatsapp/status.html` | Source for both. Open in a browser to preview with WhatsApp's overlay zones shaded pink. |
| `youtube/channel-avatar.png`, `channel-banner.png` | YouTube profile picture (800 × 800 px) and banner (2560 × 1440 px, copy inside the 1546 × 423 px safe area). |
| `youtube/thumbnail-05-cater-with-sweet-hand.png`, `05-cater-with-sweet-hand.en-CA.srt` | Thumbnail (1280 × 720 px) and captions for the promo video. |
| `youtube/channel.html`, `youtube/README.md` | Source for the three images, and the channel settings, video copy and posting steps (see [youtube/README.md](youtube/README.md)). |
| `lib/press.mjs` | Prepress layouts shared with `docs/business-cards/`: crop marks, gang-up sheets, PDF checks. |
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
- Fonts are embedded in the PDF as TrueType subsets. The flyer uses static weights
  because Chromium embeds a variable font as Type 3, which many print RIPs and
  preflight checks reject; the renderer fails if a Type 3 font appears.
- Smallest type is 10 pt.
- Crop marks are 0.25 pt registration black, starting 1/16 in outside the bleed.
- Suggested stock: 100 lb (270 gsm) gloss or matte text, or 14 pt card.
- The QR code is 1.2 in square with a 4-module quiet zone, version 2, error correction M.
  Both proofs were decoded and resolve to `https://sweethand.ca`.

### Which flyer PDF to send

- Online printers (they impose it themselves): `sweet-hand-pre-launch-flyer.pdf`.
- A print shop that asks for crop marks: `-crop-marks.pdf`.
- A print shop running 12 × 18 in digital press sheets: `-4up-12x18.pdf`. Cut on
  every mark; neighbouring flyers share no bleed.

## WhatsApp Status

- 1080 × 1920 px (9:16), sRGB PNG; WhatsApp recompresses on upload.
- WhatsApp draws its progress bar and name over the top ~220 px and the reply bar
  over the bottom ~220 px. All copy sits at least 260 px from the top and bottom
  and 96 px from the sides.
- Same copy as the flyer: image 1 for eaters, image 2 for makers. Drop "Coming soon."
  from `whatsapp/status.html` once the site is live.
- Add `https://sweethand.ca` as the Status caption: WhatsApp makes a typed link
  tappable, but not text in an image.

## YouTube

- Channel art and the promo video's thumbnail, with the channel description,
  video title, description with chapters, tags, captions and the posting steps,
  are in [`youtube/`](youtube/README.md). Opening the channel and uploading
  are done by the person whose Google account owns the channel.
- The banner keeps every word inside YouTube's 1546 × 423 px safe area, the
  only part shown on phones; the pepper band on the left shows on desktops and
  TVs only.

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

`--only flyer`, `--only stickers`, `--only whatsapp` or `--only youtube`
renders one group (the flyer PDFs carry a creation date, so rendering only the
group you changed keeps the diff to that group).

Set `SWEET_HAND_MODULE_ROOT` to another folder whose `package.json` resolves
`@playwright/test` if `frontend/node_modules` is not installed. The renderer fails if
Figtree falls back to a system font, a PDF is not 2 pages of 5.25 × 7.25 in, a proof is
not 1575 × 2175 px, a sticker is not 900 × 900 RGBA with transparent corners, the
artwork touches the canvas edge, a die cut is more than one piece, any flyer PDF
has a Type 3 font, or a YouTube image is not its exact size or over YouTube's file limit.

To regenerate the static weights after changing the variable font:

```bash
python -m pip install fonttools brotli
python -c "from fontTools.ttLib import TTFont; from fontTools.varLib import instancer
for w in (500, 600, 700):
    f = instancer.instantiateVariableFont(TTFont('docs/marketing/assets/fonts/figtree-latin.woff2'), {'wght': w}, updateFontNames=True)
    f.flavor = None; f.save(f'docs/marketing/assets/fonts/figtree-{w}.ttf')"
```

## Licences

Figtree: SIL Open Font License 1.1 (`assets/fonts/OFL.txt`). QR Code generator library:
MIT, Copyright Project Nayuki (header kept in `lib/qrcodegen.mjs`).
