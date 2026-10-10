# Sweet Hand — HTML mocks

Static HTML mocks for every page, dialog and notification of Sweet Hand, in
every state, light and dark, from 320px to 2560px. They are the design
reference that `docs/design-system/` is extracted from and that the frontend
must match (class names and accessible state semantics; see `AGENTS.md`).

The look comes from the reference design `assets/sweet-hand-5-plates.jpg`: a
white canvas, a bold wordmark, a quiet text-only nav, a vertical text filter
list with the selected item in pepper red, and round food photos with a name and
a short line underneath. **Minimal text, lots of photos, generous white space.**
Every screen keeps to that: one ink-black primary button per screen, pepper red
only for "selected / you are here", no card borders or shadows unless an overlay
needs lifting, and food photos wherever a person or caterer is represented.

## Open the mocks

- Open `index.html` from disk. Every screen and state is linked from there.
- Each mock has a mock bar at the bottom: sibling states, theme toggle, and ×
  to hide the bar and notes. Press `t` to toggle the theme.
- `?theme=dark` or `?theme=light` forces a theme; `?chrome=0` hides the mock bar
  and notes (screenshots use both).
- Buttons that open a dialog carry `data-mock-href` so you can click through.
  That attribute is mock-only; the product uses real buttons that open dialogs.

## Re-check and re-screenshot

```sh
python .claude/skills/writing-html-mocks/scripts/check_mocks.py docs/mocks --write
python .claude/skills/writing-html-mocks/scripts/screenshot_mocks.py docs/mocks
```

`--write` regenerates `index.html` and the coverage section below from
`manifest.json`. Screenshots land in `docs/mocks/.cache/` (never committed).

## Files

```
docs/mocks/
  index.html          gallery (generated)
  manifest.json       every screen, state, route and L2 requirement
  assets/tokens.css   colour, type, space, radius, elevation, motion, layout
  assets/ui.css       the component kit (base kit + "Sweet Hand components")
  assets/mock.css     mock bar and notes (not product UI)
  assets/mock.js      theme, ?chrome=0, data-mock-href click-through
  assets/img/         36 round food photos, one per caterer, cut from the reference
  pages/<id>/<state>.html
  dialogs/<id>/<state>.html
  notifications/<id>/<state>.html
```

<!-- Cast and catalog: reuse these exact names, numbers and dates in every mock. -->
## Cast and catalog

All people, businesses and addresses are fictional.

**Today** is **Saturday 10 October 2026**, `America/Toronto`. Dates are written
"Sat 21 Nov" in lists (add the year when it isn't 2026), "Saturday 21 November 2026"
on detail screens, times "9:42 a.m.". Money is CAD ("From $18 per person").
Language is Canadian English.

### Caterers (60 published; 36 have photos)

The listing is 60 caterers, 24 per page. These 36 appear on pages 1–3 in this
order (page 3 shows the last 12 of 60, so pages 1–2 use #1–24 and page 3 uses
#25–36). Image file = `assets/img/<slug>.jpg`. Card line = `primary cuisine · primary area`.

| # | Slug | Name | Primary cuisine | Primary area | Photo alt (the caterer's caption) |
|---|---|---|---|---|---|
| 1 | pelau-house | Pelau House | Trinidadian & Tobagonian | Scarborough | Chicken pelau in a steel pot with lime and cucumber chutney |
| 2 | cou-cou | Cou-Cou | Barbadian (Bajan) | North York | Sesame chicken with sweet peppers and broccoli over brown rice |
| 3 | scotch-bonnet-social | Scotch Bonnet Social | Jamaican | Pickering | Curry chicken scattered with coriander over white rice |
| 4 | ti-kay | Ti Kay | Haitian | Etobicoke | Shrimp arranged in a heart on a mound of tomato rice |
| 5 | black-cake-co | Black Cake Co. | Jamaican | Ajax | Dark rum cake dusted with icing sugar and topped with a raspberry |
| 6 | demerara-kitchen | Demerara Kitchen | Guyanese | Brampton | Fried rice with chicken, peas, carrots and egg in a serving dish |
| 7 | pimento-and-thyme | Pimento & Thyme | Jamaican | York | Chicken curry with white rice and roti |
| 8 | sugar-dumplin | Sugar Dumplin | Antiguan & Barbudan | Vaughan | Sugar-dusted dumplings, one split open to show a jam centre |
| 9 | maracas-bay | Maracas Bay | Trinidadian & Tobagonian | Mississauga | Chicken curry with rice and roti in a steel karahi |
| 10 | cook-up | Cook-Up | Guyanese | Etobicoke | Cook-up rice with chicken, peas and carrots in a red pot |
| 11 | sorrel-and-spice | Sorrel & Spice | Grenadian | Downtown Toronto | Sponge-finger cake crowned with strawberries and berries |
| 12 | sunday-pot | Sunday Pot | St. Lucian | Mississauga | Spiced rice with chicken lifted from a blue cast-iron pot |
| 13 | green-fig-catering | Green Fig Catering | St. Lucian | Pickering | Rice and stewed meat in a steel pot, seen from above |
| 14 | auntie-merles-table | Auntie Merle's Table | Jamaican | Markham | Peppers, broccoli and chicken over rice on a white plate |
| 15 | pepperpot-parlour | Pepperpot Parlour | Guyanese | Scarborough | Curry chicken with coriander over rice |
| 16 | lakay-kitchen | Lakay Kitchen | Haitian | Richmond Hill | Shrimp on tomato rice |
| 17 | bajan-breeze | Bajan Breeze | Barbadian (Bajan) | Whitby | Chocolate rum cake dusted with icing sugar |
| 18 | island-pot | Island Pot | Jamaican | Scarborough | Chicken fried rice with mixed vegetables |
| 19 | belmopan-kitchen | Belmopan Kitchen | Belizean | Milton | Stewed chicken with white rice and flatbread |
| 20 | coconut-drops-bakery | Coconut Drops Bakery | Jamaican | Oakville | Sugared dumplings with a jam filling |
| 21 | roti-road | Roti Road | Trinidadian & Tobagonian | Brampton | Curry chicken and rice beside folded roti |
| 22 | oil-down-kitchen | Oil Down Kitchen | Grenadian | Ajax | Rice with chicken and vegetables in a red pot |
| 23 | mauby-and-co | Mauby & Co. | Pan-Caribbean | Downtown Toronto | Berry-topped celebration cake tied with ribbon |
| 24 | flying-fish-kitchen | Flying Fish Kitchen | Barbadian (Bajan) | Oshawa | Golden rice served from a cast-iron pot |
| 25 | brown-stew-kitchen | Brown Stew Kitchen | Jamaican | Brampton | Rice and stewed meat in a steel pot |
| 26 | fungee-and-pepperpot | Fungee & Pepperpot | Antiguan & Barbudan | Scarborough | Chicken and vegetables over rice |
| 27 | bammy-bros | Bammy Bros. | Jamaican | North York | Curry chicken over white rice |
| 28 | garlic-pork-co | Garlic Pork Co. | Guyanese | Markham | Shrimp and red rice |
| 29 | lambie-lane | Lambie Lane | Grenadian | Etobicoke | Rum cake with a raspberry on top |
| 30 | griot-and-pikliz | Griot & Pikliz | Haitian | Downtown Toronto | Fried rice with egg and vegetables |
| 31 | conkie-corner | Conkie Corner | Barbadian (Bajan) | Mississauga | Curry with rice and flatbread |
| 32 | paramaribo-pot | Paramaribo Pot | Surinamese | Vaughan | Sugared dumplings on a board |
| 33 | souse-and-sorrel | Souse & Sorrel | Vincentian | York | Curry and rice in a steel pot |
| 34 | sea-moss-and-spice | Sea Moss & Spice | Pan-Caribbean | Whitby | Rice with peas and chicken |
| 35 | cassava-pone-co | Cassava Pone Co. | Guyanese | Richmond Hill | Strawberry and berry sponge cake |
| 36 | accra-and-floats | Accra & Floats | Trinidadian & Tobagonian | Oakville | Spiced rice from a blue pot |

**Listing counts** (all 60 published): Jamaican 14, Trinidadian & Tobagonian 11,
Guyanese 9, Barbadian (Bajan) 6, Haitian 5, Grenadian 4, St. Lucian 3,
Antiguan & Barbudan 2, Pan-Caribbean 2, Vincentian 2, Belizean 1, Surinamese 1,
Cuban 0, Bahamian 0, Dominican (Dominica) 0, Dominican (Dominican Republic) 0,
Kittitian & Nevisian 0, Puerto Rican 0 (zero-count options show disabled).
Regions: City of Toronto 31, Peel 13, York Region 8, Durham 6, Halton 2.
**Jamaican + Scarborough** (the `filtered` state) = 2 caterers: *Island Pot*
(Jamaican, Scarborough) and *Auntie Merle's Table* (Jamaican, Markham, also serves
Scarborough). Result count "2 caterers".
**Weddings** (the `occasion` state) = 23 caterers.
Postal code **M1B 2K3** → Scarborough. **K1A 0B1** → outside the GTA.

### Pelau House (the caterer we follow)

- Owner and contact: **Kendra Baptiste** (initials KB). Account email kendra@pelauhouse.example, phone +1 416 555 0142 (private).
- Status **Published**. URL `/caterers/pelau-house`.
- Cuisines: Trinidadian & Tobagonian (primary), Guyanese.
- Areas: City of Toronto — Scarborough (primary), East York, North York; Durham — Pickering, Ajax.
- **Serves 20–300 guests.** Occasions: Weddings, Birthdays, Family gatherings, Corporate events, Religious and cultural celebrations.
- 6 photos, in order: `pelau-house` (cover, "Chicken pelau in a steel pot with lime and cucumber chutney"), `maracas-bay` ("Curry chicken with rice and buss up shut in a steel karahi"), `sunday-pot` ("Spiced rice lifted from a blue cast-iron pot"), `scotch-bonnet-social` ("Curry chicken scattered with shado beni over white rice"), `black-cake-co` ("Rum-soaked black cake dusted with icing sugar"), `cook-up` ("Macaroni pie and rice with peas in a red serving pot").
- 18 dishes. The first 12 are on `pages/caterer/default.html`; dishes 13–18: Coconut bake ($2 each, Vegan), Sweet bread (Contains nuts), Sorrel ($14 per litre, Vegan), Saltfish buljol (Dairy-free), Fried bake (Vegan), Paw paw chow (Vegan, Gluten-free, Spicy).
- **4.7 · 23 reviews.** Reviewers: Marcia T. (5, Aug 2026, with a response), Andre C. (5, Jul 2026), Nadia J. (4, Jun 2026), then Jean-Robert P., Devon W., Simone A., Kwame O., Rhea M., Leon B., Tara S.
- Food handler certificate: holder Kendra Baptiste, issued by Toronto Public Health, number FH-2024-118734, expires 14 Mar 2029 (only Kendra and operators see it).
- Pending name change (state `name-pending`): "Pelau House" → "Pelau House by Kendra".

### Customers

| Name | Initials | Shown on reviews | Notes |
|---|---|---|---|
| **Marcia Thompson** | MT | Marcia T. | The customer we follow. Verified. marcia.t@example.com |
| Andre Clarke | AC | Andre C. | Wedding, Sat 12 Jun 2027, 250 guests, Brampton |
| Priya Ramdial | PR | Priya R. | Corporate lunch, Thu 5 Nov, 60 guests, Downtown Toronto |
| Nadia Joseph | NJ | Nadia J. | Birthday, Sat 17 Oct, 40 guests, Pickering |
| Jean-Robert Pierre | JP | Jean-Robert P. | Can review Pelau House (event Sun 6 Sep, replied) |
| Devon Walters | DW | Devon W. | Wrote the reported review of Maracas Bay |
| — | — | Former Sweet Hand user | A deleted customer (L2-072) |

### Enquiries

Marcia's inbox (customer view):

| With | Event | Guests | Area | Occasion | Status | Last activity |
|---|---|---|---|---|---|---|
| Pelau House | Sat 21 Nov | 120 | Scarborough | Family gatherings | Replied (1 unread) | Today 9:42 a.m. |
| Sugar Dumplin | Sat 21 Nov | 120 | Scarborough | Family gatherings | Open | Thu 8 Oct |
| Demerara Kitchen | Sat 21 Nov | 120 | Scarborough | Family gatherings | Declined ("Fully booked that weekend") | Tue 6 Oct |
| Ti Kay | Sun 23 Aug | 45 | Etobicoke | Birthdays | Closed | Sat 5 Sep |

Marcia's first message to Pelau House: "Hi Kendra, we're planning my parents' 40th
anniversary at a hall on Ellesmere Road. We'd love pelau, curry goat, macaroni pie
and callaloo for about 120 people, served buffet style around 6 p.m. Do you bring
chafing dishes?" Kendra's reply (today 9:42 a.m.): "Hi Marcia, congratulations to
your parents! Yes, chafing dishes and serving spoons are included. For 120 the
four dishes come to about $2,600 before tax. Shall I hold the date?"

Pelau House inbox (caterer view): Priya Ramdial (Open, unread, yesterday,
Downtown Toronto — outside Kendra's areas so the fit warning shows), Andre
Clarke (Open, unread, Thu, 250 guests), Marcia Thompson (Replied, today),
Nadia Joseph (Declined, "Fully booked that weekend"), Jean-Robert Pierre
(Closed, event Sun 6 Sep, 80 guests). Unread badge: **2**.

### Other caterer accounts

- **Beverley Campbell — Auntie Bev's Kitchen** (BC), Jamaican, Oshawa. A new
  draft in setup (`empty`, `draft`), then `pending`, then `changes-requested`
  with the reason "Photos 2 and 5 look like stock images. Please upload photos of
  your own food."
- **Flying Fish Kitchen** — the suspended example: "Your food handler certificate
  expired on 30 Sep 2026. Upload a current certificate and we'll review it within
  3 business days."
- **Breadfruit & Butter** — Vincentian, Brampton; resubmitted after changes.

### Operators

- **Leah Mohammed** (LM), Admin. The operator we follow.
- **Tomas Reyes** (TR), Operator (not Admin; sees `forbidden` on admin-only pages).

## Shared patterns

Copy these from the reference mocks rather than inventing new ones:

| Pattern | Reference file |
|---|---|
| Public header, footer, listing grid, filter list, round photo card | `pages/caterers/default.html` |
| Caterer page: gallery, facts, menu, areas, reviews, sticky enquiry bar | `pages/caterer/default.html` |
| Caterer dashboard header ("for caterers" tag), side nav, preview pane | `pages/dashboard/default.html` |
| Operator header ("Operator" tag), side nav, queue rows | `pages/admin-queue/default.html` |
| Dialog over an inert page, form fields, full-screen on phones | `dialogs/enquiry/default.html` |

**Signed-in customer header:** Caterers · Occasions · Inbox (with
`<span class="badge badge--count" aria-label="1 unread enquiry">1</span>`) · search
icon · avatar button "MT" (opens `dialogs/account-menu`). No "Sign in" link.

**Icons** are inline SVG, `class="icon"`, `viewBox="0 0 24 24"`, `aria-hidden="true"`:

| Icon | Inner markup |
|---|---|
| search | `<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>` |
| menu | `<path d="M4 8h16M4 16h16"/>` |
| close | `<path d="M6 6l12 12M18 6 6 18"/>` |
| chevron left / right / down | `<path d="m15 18-6-6 6-6"/>` · `<path d="m9 18 6-6-6-6"/>` · `<path d="m6 9 6 6 6-6"/>` |
| filters | `<path d="M4 7h10M18 7h2M4 17h4M12 17h8"/><circle cx="16" cy="7" r="2"/><circle cx="10" cy="17" r="2"/>` |
| pin (area) | `<path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>` |
| check | `<path d="m5 12 5 5 9-10"/>` |
| star (filled; `.stars .icon`) | `<path d="M12 3.5l2.6 5.3 5.9.9-4.2 4.1 1 5.8L12 16.9l-5.3 2.7 1-5.8-4.2-4.1 5.9-.9z"/>` |
| flag (report) | `<path d="M5 21V4m0 0h11l-2 4 2 4H5"/>` |
| info | `<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>` |
| success | `<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>` |
| warning | `<path d="M12 4 2.5 20h19z"/><path d="M12 10v4M12 17v.5"/>` |
| danger | `<circle cx="12" cy="12" r="9"/><path d="M12 7v6M12 16.5v.5"/>` |
| mail / inbox | `<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>` |
| send | `<path d="M4 12 20 4l-6 16-3-7z"/>` |
| calendar | `<rect x="3.5" y="5" width="17" height="15" rx="2"/><path d="M3.5 10h17M8 3v4M16 3v4"/>` |
| guests | `<circle cx="9" cy="8" r="3.5"/><path d="M2.5 20a6.5 6.5 0 0 1 13 0M16 4.5a3.5 3.5 0 0 1 0 7M18 14a6 6 0 0 1 3.5 6"/>` |
| upload | `<path d="M12 16V4m0 0-4 4m4-4 4 4M4 16v4h16v-4"/>` |
| camera | `<path d="M4 8h3l2-3h6l2 3h3v11H4z"/><circle cx="12" cy="13" r="3.5"/>` |
| trash | `<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>` |
| edit | `<path d="M4 20h4L19 9l-4-4L4 16z"/>` |
| arrow up / down | `<path d="M12 19V5m-6 6 6-6 6 6"/>` · `<path d="M12 5v14m-6-6 6 6 6-6"/>` |
| lock (private) | `<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>` |
| shield | `<path d="M12 3 4 6v6c0 5 3.5 8 8 9 4.5-1 8-4 8-9V6z"/>` |
| clock | `<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>` |
| download | `<path d="M12 4v12m0 0-4-4m4 4 4-4M4 20h16"/>` |
| refresh (retry) | `<path d="M20 12a8 8 0 1 1-2.3-5.7M20 4v5h-5"/>` |
| offline | `<path d="M3 3l18 18M8.5 16.5a5 5 0 0 1 7 0M5 13a10 10 0 0 1 5-2.7M2 9.5a15 15 0 0 1 4.5-2.8M22 9.5A15 15 0 0 0 11 5.1"/>` |
| plate (photo placeholder) | `<circle cx="12" cy="12" r="8"/><circle cx="12" cy="12" r="4"/>` |
| plus | `<path d="M12 5v14M5 12h14"/>` |
| sign out | `<path d="M15 4h4v16h-4M10 8l-4 4 4 4M6 12h11"/>` |

## Design decisions and open questions

The mocks follow the reference design where it speaks and the L2 requirements
everywhere else. Where the two disagree, the mock follows the design and the
conflict is listed here for a decision; the affected L2 should be revised or
the mock changed.

1. **Round photos vs 4:3 (L2-005.5).** The design crops every listing photo to a
   circle; L2-005.5 asks for a 4:3 photo filling ≥60% of the card. The mocks use
   circles (the photo still fills well over 60% of the card height). *Decision
   needed: amend L2-005.5 to "a 1:1 photo shown as a circle".*
2. **Three columns at XL (L2-005.4).** The design shows 3 columns beside the filter
   column at 1440px; L2-005.4 asks for 4 at XL. The mocks use 1 / 2 / 2 / 3 / 3
   columns across XS / SM / MD / LG / XL. *Decision needed.*
3. **Cuisine on the card (L2-004).** The design shows name and area only; L2-004
   requires name, primary cuisine and primary area. The mocks follow L2-004 with one
   quiet line, "Jamaican · Pickering".
4. **Neighbourhoods vs service areas (L2-010).** The design shows neighbourhoods
   (Eglinton West, Malton, Rexdale, Leslieville) that are not in the L2-010 list. The
   mocks use L2-010 areas (York, Mississauga, Etobicoke, Downtown Toronto).
   *Question: should a caterer be able to show a neighbourhood label within their primary area?*
5. **"Sweets" in the filter list.** The design lists "Sweets" beside cuisines. Desserts
   and bakers are not a cuisine in L2-007. The mocks leave it out. *Question: add a
   "Bakers and desserts" speciality filter?*
6. **Short cuisine names.** The design uses "Trinidadian" and "Bajan"; L2-007 names
   are "Trinidadian & Tobagonian" and "Barbadian (Bajan)". The mocks use the L2-007
   names everywhere. *Question: allow a short display label per cuisine?*
7. **Occasions in the nav.** The design has an "Occasions" nav item; L2 has no
   occasion filter on the listing (only on caterer pages, L2-021). The mocks add
   `/occasions` (8 photo tiles) leading to the listing filtered by occasion
   (`pages/caterers/occasion.html`). *Needs an L2 for filtering by occasion.*
8. **Search icon.** The design's search icon opens the area / postal code search
   (L2-011, L2-012). There is no free-text search by caterer or dish name in L2.
   *Question: add name/dish search?*
9. **Sign in in the header.** Not in the design; added as a quiet text link for
   visitors (customers need a way back to their inbox). It never interrupts browsing (L2-013).
10. **Enquiry form as a dialog.** L2-026 allows a dialog or side panel from MD up and a
    full screen below; the mocks use one dialog that fills the screen below 768px.
11. **Brand typeface.** The reference type is a geometric grotesque. The mocks name
    "Figtree" first and fall back to the system UI font, because mocks open from disk
    without web fonts. *Decision needed on the licensed web font.*
12. **Photos.** Mock photos are the 12 crops from the reference, plus rotated and
    mirrored copies so 36 caterers look distinct. Real caterers upload their own photos.
13. **No cookie banner.** L2-074 sets only strictly necessary cookies, so no consent
    banner exists. If non-essential cookies are ever added, a banner mock is needed.
14. **No notification centre.** L2 has unread counts on the inbox only (L2-029); the
    inbox is the notification centre. Emails are out of scope for these mocks.
15. **Accessibility target.** L1-019 says WCAG 2.1 AA; `AGENTS.md` says 2.2 AA. The
    mocks meet 2.2 AA (target size, focus not obscured, accessible authentication).

## Coverage

<!-- coverage:start -->
<!-- coverage:end -->
