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
  assets/tokens.css   @import of docs/design-system/tokens/tokens.css (edit tokens there)
  assets/ui.css       @import of docs/design-system/assets/components.css (edit components there)
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
Regions (caterers serving at least one area there): City of Toronto 31, Peel 13, York Region 8, Durham 7, Halton 3.
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

- **Beverley Campbell — Auntie Bev's Kitchen** (BC), Jamaican, Oshawa,
  beverley@auntiebevs.example, +1 905 555 0164, 10–150 guests. A new draft in
  setup (`empty`, `draft`: 8 of 10 checklist items, 2 photos, 5 dishes), then
  `pending`, then `changes-requested` with the reason "Photos 2 and 5 look like
  stock images. Please upload photos of your own food." Cover photo
  `green-fig-catering.jpg`. Certificate: Durham Region Health Department,
  FH-2025-204517, expires 22 Jan 2030 (an expired one, FH-2021-076412, expired
  30 Jun 2026, drives the certificate `invalid` state).
- **Sharon Best — Flying Fish Kitchen** (SB): the suspended example and the expired
  certificate in the queue (FH-2021-337102, Durham Region Health, expired 30 Sep 2026):
  "Your food handler certificate expired on 30 Sep 2026. Upload a current
  certificate and we'll review it within 3 business days."
- **Jolene Ollivierre — Breadfruit & Butter**, Vincentian, Brampton; resubmitted after
  Tomas Reyes asked for changes ("The description lists a phone number, and photo 3
  is a stock image").
- **Winston Daley — Coal Pot Kitchen** (WD), Jamaican, Brampton: the removed example,
  removed Mon 28 Sep for "Repeated food safety concerns from customers, confirmed by our team."
- **Marie-Claire Augustin — Green Fig Catering**, St. Lucian, Pickering, 15–120 guests,
  3 photos, 8 dishes, no reviews yet (`caterer/no-reviews`).
- **Vishnu Ramlogan — Maracas Bay** (VR): the "full" example, 30 photos and 50 dishes.
- **Paulette Morgan — Black Cake Co.** (PM): exactly 3 photos and 3 dishes, for the
  "keep at least 3" blocked dialogs.
- **Desmond Greaves — Cou-Cou** (DG): certificate FH-2021-093317 expires Mon 9 Nov 2026
  (the `expiring` state).
- **Garfield Brown — Island Pot**: certificate FH-2023-552019, Toronto Public Health,
  expires 2 Feb 2027; subject of food safety report R-2047.
- Operator-only totals: 68 caterers, 60 published, plus Hibiscus Hut (Suspended),
  Tamarind Tree (Changes requested), Callaloo Corner, Doubles Duo, Plantain Plate
  (Drafts) and Rum Shop Catering (Removed).

Other fixed details: Marcia's phone +1 647 555 0187; Pelau House business email
hello@pelauhouse.example; report R-2041 is about Devon W.'s review of Maracas Bay;
help address help@sweethand.example; privacy officer privacy@sweethand.example.

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

1. **Round photos (L2-005.5).** *Decided 10 Oct 2026:* listing photos are a 1:1
   circle that fills at least 60% of the card height, as the design and the mocks
   show. L2-005.5 was amended to match.
2. **Three columns at XL (L2-005.4).** *Decided 10 Oct 2026:* the grid keeps 3
   columns at XL beside the filter column, with the extra width going to white
   space. The mocks use 1 / 2 / 2 / 3 / 3 columns across XS / SM / MD / LG / XL.
   L2-005.4 was amended to match.
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

16. **Published edits: autosave or Save?** L2-038 autosaves during setup; L2-044 says
    published edits apply "when they save". The mocks autosave everywhere. *Decision needed.*
17. **Offline replies.** L2 doesn't say whether a reply typed offline is queued or blocked.
    The mocks block it with an explanation.
18. **Customer deleted their account mid-enquiry.** The caterer sees "This person has left
    Sweet Hand, so replies can't be delivered". Should such enquiries close automatically?
19. **Operator view of a linked enquiry.** "Open linked enquiry" (L2-034.3) assumes the
    thread layout, read-only. It may need its own page.
20. **Reporter identity for operators.** Operators see only "Signed-in customer" or
    "Visitor, not signed in". Confirm operators should not see the reporter's name.
21. **Admin-only nav items.** *Decided 10 Oct 2026:* non-Admin operators do not see
    "Audit log" and "Operators" in the side nav; the server still returns `forbidden`
    (HTTP 403) if they reach those routes. L2-056.5 was added to match. Any mock that
    shows those items to a non-Admin operator is drift.
22. **Retiring a cuisine** is treated as permanent; breach records are read-only once
    saved; operator invites expire after 24 hours. All three are assumptions.
23. **Copy written where L2 gives none:** "This file isn't a JPEG, PNG, WebP or HEIC photo,
    so nothing was saved" (L2-041.3); "Choose a rating from 1 to 5 stars"; "Too many reports
    from this connection"; "Write a reply before sending". Adopt or replace in L2.
24. **Locked accounts.** L2-076.4 only emails the owner; the mock doesn't offer a support
    route. Should it?
25. **Very long caterer names on phones** wrap to many lines at display size. Step the
    heading down a size below 36rem?
26. **Invented placeholders to replace:** the email processor ("Northbound Mail Inc.",
    Canada), privacy notice version 1.0 dated Thu 1 Oct 2026, cookie lifetimes, the metrics
    start date (3 Aug 2026) and the occasion counts (Weddings 23, Birthdays 41, Corporate
    events 28, Funerals and repasts 17, Religious and cultural celebrations 26, Family
    gatherings 47, Private dinners 12, Community events 19).
27. **Mock-only shortcuts:** every caterer card links to the Pelau House page and operator
    dialogs always name Pelau House, because only one caterer page is mocked.
28. **Pre-launch site (`pages/launch/`).** A one-page marketing app (its own Angular
    project, served at `/` until launch) that collects launch-day sign-ups. It has no
    L1/L2 yet, and L1 puts "Marketing email and newsletters" out of scope. The mocks
    assume a single launch-day email with express consent, a confirmation link (48 hours),
    one-click removal without sign-in, deletion 30 days after launch, and one extra
    early profile link for caterers. The success message is the same for a new or an
    existing address, so the page never reveals who signed up. *Needs an L1/L2 and a
    detailed design before implementation; confirm the email rules against CASL.*
    `privacy@sweethand.example` is a placeholder.

## Coverage

<!-- coverage:start -->

Legend: ✅ mock exists · ➖ not applicable (reason in manifest) · ❌ missing

### Pages

| Screen | default | loading | empty | error | no-results | filtered | occasion | long | edge | offline | postal-invalid | out-of-area | signed-in | no-reviews | more-dishes | can-review | own-review | removed | invalid | submitting | locked | challenge | return | expired | success | sent | open | declined | closed | shared | not-found | saved | unverified | bounced | export-requested | caterer | draft | pending | changes-requested | name-pending | suspended | saving | read-only | uploading | processing | full | expiring | replied | former-user | resubmitted | name-change | auto-hidden | caterer-report | resolved | certificate-expired | hidden | partial | forbidden | confirmed | link-expired | unsubscribed | Requirements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Caterers (`caterers`) | [✅](pages/caterers/default.html) | [✅](pages/caterers/loading.html) | [✅](pages/caterers/empty.html) | [✅](pages/caterers/error.html) | [✅](pages/caterers/no-results.html) | [✅](pages/caterers/filtered.html) | [✅](pages/caterers/occasion.html) | [✅](pages/caterers/long.html) | [✅](pages/caterers/edge.html) | [✅](pages/caterers/offline.html) | [✅](pages/caterers/postal-invalid.html) | [✅](pages/caterers/out-of-area.html) | [✅](pages/caterers/signed-in.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-001`, `L2-002`, `L2-003`, `L2-004`, `L2-005`, `L2-006`, `L2-008`, `L2-009`, `L2-011`, `L2-012`, `L2-013`, `L2-029`, `L2-067`, `L2-091` |
| Occasions (`occasions`) | [✅](pages/occasions/default.html) | [✅](pages/occasions/loading.html) | ➖ | [✅](pages/occasions/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-021`, `L2-013` |
| Caterer page (`caterer`) | [✅](pages/caterer/default.html) | [✅](pages/caterer/loading.html) | ➖ | [✅](pages/caterer/error.html) |  |  |  |  | [✅](pages/caterer/edge.html) | [✅](pages/caterer/offline.html) |  |  |  | [✅](pages/caterer/no-reviews.html) | [✅](pages/caterer/more-dishes.html) | [✅](pages/caterer/can-review.html) | [✅](pages/caterer/own-review.html) | [✅](pages/caterer/removed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-013`, `L2-014`, `L2-015`, `L2-016`, `L2-017`, `L2-018`, `L2-019`, `L2-020`, `L2-021`, `L2-049`, `L2-051`, `L2-053`, `L2-054` |
| About (`about`) | [✅](pages/about/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-070` |
| Privacy notice (`privacy`) | [✅](pages/privacy/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-070`, `L2-074`, `L2-075` |
| Terms (`terms`) | [✅](pages/terms/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-037` |
| Sign in (`sign-in`) | [✅](pages/sign-in/default.html) | ➖ | ➖ | [✅](pages/sign-in/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/sign-in/invalid.html) | [✅](pages/sign-in/submitting.html) | [✅](pages/sign-in/locked.html) | [✅](pages/sign-in/challenge.html) | [✅](pages/sign-in/return.html) | [✅](pages/sign-in/expired.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-013`, `L2-023`, `L2-076`, `L2-078`, `L2-082` |
| Create an account (`register`) | [✅](pages/register/default.html) | ➖ | ➖ | [✅](pages/register/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/register/invalid.html) | [✅](pages/register/submitting.html) |  |  |  |  | [✅](pages/register/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-023`, `L2-056`, `L2-070`, `L2-076`, `L2-082` |
| Cater with Sweet Hand (`register-caterer`) | [✅](pages/register-caterer/default.html) | ➖ | ➖ | [✅](pages/register-caterer/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/register-caterer/invalid.html) | [✅](pages/register-caterer/submitting.html) |  |  |  |  | [✅](pages/register-caterer/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-037`, `L2-056`, `L2-070`, `L2-076` |
| Forgot password (`forgot-password`) | [✅](pages/forgot-password/default.html) | ➖ | ➖ | [✅](pages/forgot-password/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/forgot-password/invalid.html) | [✅](pages/forgot-password/submitting.html) |  |  |  |  | [✅](pages/forgot-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-077`, `L2-082` |
| Reset password (`reset-password`) | [✅](pages/reset-password/default.html) | ➖ | ➖ | [✅](pages/reset-password/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/reset-password/invalid.html) | [✅](pages/reset-password/submitting.html) |  |  |  | [✅](pages/reset-password/expired.html) | [✅](pages/reset-password/success.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-076`, `L2-077` |
| Verify email (`verify-email`) | [✅](pages/verify-email/default.html) | [✅](pages/verify-email/loading.html) | ➖ | [✅](pages/verify-email/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/verify-email/expired.html) |  | [✅](pages/verify-email/sent.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-023`, `L2-077` |
| Two-step verification (`two-factor`) | [✅](pages/two-factor/default.html) | ➖ | ➖ | [✅](pages/two-factor/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/two-factor/invalid.html) | [✅](pages/two-factor/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-056`, `L2-078` |
| Privacy notice update (`privacy-update`) | [✅](pages/privacy-update/default.html) | ➖ | ➖ | [✅](pages/privacy-update/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/privacy-update/submitting.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-070` |
| Inbox (`inbox`) | [✅](pages/inbox/default.html) | [✅](pages/inbox/loading.html) | [✅](pages/inbox/empty.html) | [✅](pages/inbox/error.html) | [✅](pages/inbox/no-results.html) | [✅](pages/inbox/filtered.html) |  | [✅](pages/inbox/long.html) |  | [✅](pages/inbox/offline.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-029`, `L2-031`, `L2-036`, `L2-067` |
| Enquiry thread (`thread`) | [✅](pages/thread/default.html) | [✅](pages/thread/loading.html) | ➖ | [✅](pages/thread/error.html) |  |  |  | [✅](pages/thread/long.html) | [✅](pages/thread/edge.html) |  |  |  |  |  |  |  |  |  | [✅](pages/thread/invalid.html) | [✅](pages/thread/submitting.html) |  |  |  |  |  |  | [✅](pages/thread/open.html) | [✅](pages/thread/declined.html) | [✅](pages/thread/closed.html) | [✅](pages/thread/shared.html) | [✅](pages/thread/not-found.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-022`, `L2-028`, `L2-032`, `L2-033`, `L2-034`, `L2-035`, `L2-036`, `L2-080` |
| Account (`account`) | [✅](pages/account/default.html) | [✅](pages/account/loading.html) | ➖ | [✅](pages/account/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/account/saved.html) | [✅](pages/account/unverified.html) | [✅](pages/account/bounced.html) | [✅](pages/account/export-requested.html) | [✅](pages/account/caterer.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-030`, `L2-071`, `L2-072`, `L2-078` |
| Dashboard (`dashboard`) | [✅](pages/dashboard/default.html) | [✅](pages/dashboard/loading.html) | [✅](pages/dashboard/empty.html) | [✅](pages/dashboard/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/dashboard/removed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/dashboard/draft.html) | [✅](pages/dashboard/pending.html) | [✅](pages/dashboard/changes-requested.html) | [✅](pages/dashboard/name-pending.html) | [✅](pages/dashboard/suspended.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-029`, `L2-031`, `L2-038`, `L2-039`, `L2-044`, `L2-045`, `L2-046`, `L2-048`, `L2-058` |
| Business details (`profile-details`) | [✅](pages/profile-details/default.html) | [✅](pages/profile-details/loading.html) | ➖ | [✅](pages/profile-details/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-details/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-details/saved.html) |  |  |  |  |  |  |  | [✅](pages/profile-details/name-pending.html) | [✅](pages/profile-details/suspended.html) | [✅](pages/profile-details/saving.html) | [✅](pages/profile-details/read-only.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-018`, `L2-038`, `L2-039`, `L2-044`, `L2-045` |
| Cuisines and areas (`profile-cuisines`) | [✅](pages/profile-cuisines/default.html) | [✅](pages/profile-cuisines/loading.html) | ➖ | [✅](pages/profile-cuisines/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-cuisines/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-cuisines/saving.html) | [✅](pages/profile-cuisines/read-only.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007`, `L2-010`, `L2-038`, `L2-045` |
| Guests and occasions (`profile-events`) | [✅](pages/profile-events/default.html) | [✅](pages/profile-events/loading.html) | ➖ | [✅](pages/profile-events/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-events/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-events/saving.html) | [✅](pages/profile-events/read-only.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-020`, `L2-021`, `L2-038`, `L2-045` |
| Photos (`profile-photos`) | [✅](pages/profile-photos/default.html) | [✅](pages/profile-photos/loading.html) | [✅](pages/profile-photos/empty.html) | [✅](pages/profile-photos/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-photos/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-photos/read-only.html) | [✅](pages/profile-photos/uploading.html) | [✅](pages/profile-photos/processing.html) | [✅](pages/profile-photos/full.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-006`, `L2-039`, `L2-041`, `L2-042`, `L2-045`, `L2-091` |
| Menu (`profile-menu`) | [✅](pages/profile-menu/default.html) | [✅](pages/profile-menu/loading.html) | [✅](pages/profile-menu/empty.html) | [✅](pages/profile-menu/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-menu/read-only.html) |  |  | [✅](pages/profile-menu/full.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-017`, `L2-039`, `L2-043`, `L2-045` |
| Food safety (`profile-certificate`) | [✅](pages/profile-certificate/default.html) | [✅](pages/profile-certificate/loading.html) | [✅](pages/profile-certificate/empty.html) | [✅](pages/profile-certificate/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-certificate/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/profile-certificate/saving.html) |  |  |  |  | [✅](pages/profile-certificate/expiring.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-014`, `L2-039`, `L2-040` |
| Enquiries (`dashboard-enquiries`) | [✅](pages/dashboard-enquiries/default.html) | [✅](pages/dashboard-enquiries/loading.html) | [✅](pages/dashboard-enquiries/empty.html) | [✅](pages/dashboard-enquiries/error.html) | [✅](pages/dashboard-enquiries/no-results.html) | [✅](pages/dashboard-enquiries/filtered.html) |  | [✅](pages/dashboard-enquiries/long.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-024`, `L2-029`, `L2-031`, `L2-036` |
| Enquiry (`dashboard-enquiry`) | [✅](pages/dashboard-enquiry/default.html) | [✅](pages/dashboard-enquiry/loading.html) | ➖ | [✅](pages/dashboard-enquiry/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/dashboard-enquiry/invalid.html) | [✅](pages/dashboard-enquiry/submitting.html) |  |  |  |  |  |  |  | [✅](pages/dashboard-enquiry/declined.html) | [✅](pages/dashboard-enquiry/closed.html) | [✅](pages/dashboard-enquiry/shared.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/dashboard-enquiry/replied.html) | [✅](pages/dashboard-enquiry/former-user.html) |  |  |  |  |  |  |  |  |  |  |  |  | `L2-024`, `L2-027`, `L2-032`, `L2-033`, `L2-034`, `L2-035`, `L2-036`, `L2-072` |
| Reviews (`dashboard-reviews`) | [✅](pages/dashboard-reviews/default.html) | [✅](pages/dashboard-reviews/loading.html) | [✅](pages/dashboard-reviews/empty.html) | [✅](pages/dashboard-reviews/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-051`, `L2-052` |
| Review queue (`admin-queue`) | [✅](pages/admin-queue/default.html) | [✅](pages/admin-queue/loading.html) | [✅](pages/admin-queue/empty.html) | [✅](pages/admin-queue/error.html) |  | [✅](pages/admin-queue/filtered.html) |  | [✅](pages/admin-queue/long.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-040`, `L2-044`, `L2-047`, `L2-050`, `L2-055`, `L2-056` |
| Profile review (`admin-profile-review`) | [✅](pages/admin-profile-review/default.html) | [✅](pages/admin-profile-review/loading.html) | ➖ | [✅](pages/admin-profile-review/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-profile-review/resubmitted.html) | [✅](pages/admin-profile-review/name-change.html) |  |  |  |  |  |  |  |  |  |  | `L2-014`, `L2-040`, `L2-044`, `L2-046`, `L2-047`, `L2-048` |
| Report (`admin-report`) | [✅](pages/admin-report/default.html) | [✅](pages/admin-report/loading.html) | ➖ | [✅](pages/admin-report/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-report/auto-hidden.html) | [✅](pages/admin-report/caterer-report.html) | [✅](pages/admin-report/resolved.html) |  |  |  |  |  |  |  | `L2-034`, `L2-054`, `L2-055`, `L2-060` |
| Caterers (operator) (`admin-caterers`) | [✅](pages/admin-caterers/default.html) | [✅](pages/admin-caterers/loading.html) | [✅](pages/admin-caterers/empty.html) | [✅](pages/admin-caterers/error.html) | [✅](pages/admin-caterers/no-results.html) |  |  | [✅](pages/admin-caterers/long.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-046`, `L2-058` |
| Caterer record (`admin-caterer`) | [✅](pages/admin-caterer/default.html) | [✅](pages/admin-caterer/loading.html) | ➖ | [✅](pages/admin-caterer/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-caterer/removed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-caterer/suspended.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-caterer/certificate-expired.html) |  |  |  |  |  |  | `L2-040`, `L2-046`, `L2-057`, `L2-058`, `L2-060` |
| Recent changes (`admin-changes`) | [✅](pages/admin-changes/default.html) | [✅](pages/admin-changes/loading.html) | [✅](pages/admin-changes/empty.html) | [✅](pages/admin-changes/error.html) |  |  |  | [✅](pages/admin-changes/long.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-044`, `L2-047`, `L2-057` |
| Reviews (operator) (`admin-reviews`) | [✅](pages/admin-reviews/default.html) | [✅](pages/admin-reviews/loading.html) | [✅](pages/admin-reviews/empty.html) | [✅](pages/admin-reviews/error.html) | [✅](pages/admin-reviews/no-results.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-reviews/hidden.html) |  |  |  |  |  | `L2-050`, `L2-055`, `L2-059` |
| Metrics (`admin-metrics`) | [✅](pages/admin-metrics/default.html) | [✅](pages/admin-metrics/loading.html) | [✅](pages/admin-metrics/empty.html) | [✅](pages/admin-metrics/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-metrics/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-metrics/partial.html) |  |  |  |  | `L2-061`, `L2-062`, `L2-063` |
| Audit log (`admin-audit`) | [✅](pages/admin-audit/default.html) | [✅](pages/admin-audit/loading.html) | [✅](pages/admin-audit/empty.html) | [✅](pages/admin-audit/error.html) | [✅](pages/admin-audit/no-results.html) |  |  | [✅](pages/admin-audit/long.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-audit/forbidden.html) |  |  |  | `L2-034`, `L2-060` |
| Cuisines (`admin-cuisines`) | [✅](pages/admin-cuisines/default.html) | [✅](pages/admin-cuisines/loading.html) | ➖ | [✅](pages/admin-cuisines/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007` |
| Operators (`admin-operators`) | [✅](pages/admin-operators/default.html) | [✅](pages/admin-operators/loading.html) | ➖ | [✅](pages/admin-operators/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/admin-operators/forbidden.html) |  |  |  | `L2-056`, `L2-060` |
| Breach register (`admin-breaches`) | [✅](pages/admin-breaches/default.html) | [✅](pages/admin-breaches/loading.html) | [✅](pages/admin-breaches/empty.html) | [✅](pages/admin-breaches/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-075` |
| Page not found (`not-found`) | [✅](pages/not-found/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-014`, `L2-018`, `L2-034` |
| No access (`forbidden`) | [✅](pages/forbidden/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-056`, `L2-079` |
| Something went wrong (`server-error`) | [✅](pages/server-error/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-089` |
| Too many requests (`rate-limited`) | [✅](pages/rate-limited/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-082` |
| Offline (`offline`) | [✅](pages/offline/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-091` |
| Maintenance (`maintenance`) | [✅](pages/maintenance/default.html) | ➖ | ➖ | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-088` |
| Launch (pre-launch site) (`launch`) | [✅](pages/launch/default.html) | ➖ | ➖ | [✅](pages/launch/error.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/launch/invalid.html) | [✅](pages/launch/submitting.html) |  |  |  |  | [✅](pages/launch/success.html) |  |  |  |  |  |  |  |  |  |  | [✅](pages/launch/caterer.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](pages/launch/confirmed.html) | [✅](pages/launch/link-expired.html) | [✅](pages/launch/unsubscribed.html) |  |

### Dialogs

| Screen | default | busy | invalid | signed-in | caterer | operator | suggestions | no-match | out-of-area | selected | area | failed | last | warning | restored | duplicate | limit | unverified | wrong-account | success | held | edit | confirm | conflict | blocked | approve | remove | take-action | Requirements |
|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|---|
| Menu (`site-menu`) | [✅](dialogs/site-menu/default.html) | ➖ | ➖ | [✅](dialogs/site-menu/signed-in.html) | [✅](dialogs/site-menu/caterer.html) | [✅](dialogs/site-menu/operator.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-064`, `L2-067` |
| Account menu (`account-menu`) | [✅](dialogs/account-menu/default.html) | ➖ | ➖ |  | [✅](dialogs/account-menu/caterer.html) | [✅](dialogs/account-menu/operator.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-078` |
| Area or postal code search (`search`) | [✅](dialogs/search/default.html) | [✅](dialogs/search/busy.html) | [✅](dialogs/search/invalid.html) |  |  |  | [✅](dialogs/search/suggestions.html) | [✅](dialogs/search/no-match.html) | [✅](dialogs/search/out-of-area.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-011`, `L2-012`, `L2-065`, `L2-067` |
| Filters (phone) (`filters`) | [✅](dialogs/filters/default.html) | [✅](dialogs/filters/busy.html) | ➖ |  |  |  |  |  |  | [✅](dialogs/filters/selected.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-008`, `L2-009`, `L2-011`, `L2-067` |
| Filter dropdown (tablet) (`filter-menu`) | [✅](dialogs/filter-menu/default.html) | ➖ | ➖ |  |  |  |  |  |  |  | [✅](dialogs/filter-menu/area.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-008`, `L2-009`, `L2-011` |
| Photo viewer (`photo-viewer`) | [✅](dialogs/photo-viewer/default.html) | [✅](dialogs/photo-viewer/busy.html) | ➖ |  |  |  |  |  |  |  |  | [✅](dialogs/photo-viewer/failed.html) | [✅](dialogs/photo-viewer/last.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-016`, `L2-067`, `L2-069` |
| Send an enquiry (`enquiry`) | [✅](dialogs/enquiry/default.html) | [✅](dialogs/enquiry/busy.html) | [✅](dialogs/enquiry/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/enquiry/failed.html) |  | [✅](dialogs/enquiry/warning.html) | [✅](dialogs/enquiry/restored.html) | [✅](dialogs/enquiry/duplicate.html) | [✅](dialogs/enquiry/limit.html) | [✅](dialogs/enquiry/unverified.html) | [✅](dialogs/enquiry/wrong-account.html) | [✅](dialogs/enquiry/success.html) |  |  |  |  |  |  |  |  | `L2-022`, `L2-023`, `L2-024`, `L2-025`, `L2-026`, `L2-030`, `L2-035`, `L2-065`, `L2-067`, `L2-068` |
| Report (`report`) | [✅](dialogs/report/default.html) | [✅](dialogs/report/busy.html) | [✅](dialogs/report/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/report/failed.html) |  |  |  | [✅](dialogs/report/duplicate.html) | [✅](dialogs/report/limit.html) |  |  | [✅](dialogs/report/success.html) |  |  |  |  |  |  |  |  | `L2-054`, `L2-082` |
| Write a review (`review`) | [✅](dialogs/review/default.html) | [✅](dialogs/review/busy.html) | [✅](dialogs/review/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/review/failed.html) |  |  |  |  |  |  |  | [✅](dialogs/review/success.html) | [✅](dialogs/review/held.html) | [✅](dialogs/review/edit.html) |  |  |  |  |  |  | `L2-049`, `L2-050`, `L2-053` |
| Delete review (`delete-review`) | [✅](dialogs/delete-review/default.html) | [✅](dialogs/delete-review/busy.html) | ➖ |  |  |  |  |  |  |  |  | [✅](dialogs/delete-review/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-053` |
| Share contact details (`share-contact`) | [✅](dialogs/share-contact/default.html) | [✅](dialogs/share-contact/busy.html) | ➖ |  |  |  |  |  |  |  |  | [✅](dialogs/share-contact/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-035` |
| Close enquiry (`close-enquiry`) | [✅](dialogs/close-enquiry/default.html) | [✅](dialogs/close-enquiry/busy.html) | ➖ |  |  |  |  |  |  |  |  | [✅](dialogs/close-enquiry/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-033` |
| Edit your details (`edit-details`) | [✅](dialogs/edit-details/default.html) | [✅](dialogs/edit-details/busy.html) | [✅](dialogs/edit-details/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/edit-details/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-023`, `L2-030`, `L2-065` |
| Change password (`change-password`) | [✅](dialogs/change-password/default.html) | [✅](dialogs/change-password/busy.html) | [✅](dialogs/change-password/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/change-password/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-076`, `L2-078` |
| Sign out a device (`end-session`) | [✅](dialogs/end-session/default.html) | [✅](dialogs/end-session/busy.html) | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-078` |
| Download my data (`download-data`) | [✅](dialogs/download-data/default.html) | [✅](dialogs/download-data/busy.html) | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/download-data/success.html) |  |  |  |  |  |  |  |  | `L2-071` |
| Delete account (`delete-account`) | [✅](dialogs/delete-account/default.html) | [✅](dialogs/delete-account/busy.html) | [✅](dialogs/delete-account/invalid.html) |  | [✅](dialogs/delete-account/caterer.html) |  |  |  |  |  |  | [✅](dialogs/delete-account/failed.html) |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/delete-account/confirm.html) |  |  |  |  |  | `L2-072` |
| Decline enquiry (`decline-enquiry`) | [✅](dialogs/decline-enquiry/default.html) | [✅](dialogs/decline-enquiry/busy.html) | [✅](dialogs/decline-enquiry/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/decline-enquiry/failed.html) |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/decline-enquiry/conflict.html) |  |  |  |  | `L2-028`, `L2-033` |
| Add or edit a dish (`dish`) | [✅](dialogs/dish/default.html) | [✅](dialogs/dish/busy.html) | [✅](dialogs/dish/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/dish/failed.html) |  |  |  |  |  |  |  |  |  | [✅](dialogs/dish/edit.html) |  |  |  |  |  |  | `L2-017`, `L2-043` |
| Remove dish (`remove-dish`) | [✅](dialogs/remove-dish/default.html) | [✅](dialogs/remove-dish/busy.html) | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/remove-dish/blocked.html) |  |  |  | `L2-043` |
| Photo details (`photo-details`) | [✅](dialogs/photo-details/default.html) | [✅](dialogs/photo-details/busy.html) | [✅](dialogs/photo-details/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/photo-details/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-042`, `L2-068` |
| Remove photo (`remove-photo`) | [✅](dialogs/remove-photo/default.html) | [✅](dialogs/remove-photo/busy.html) | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/remove-photo/blocked.html) |  |  |  | `L2-042` |
| Submit for review (`submit-profile`) | [✅](dialogs/submit-profile/default.html) | [✅](dialogs/submit-profile/busy.html) | [✅](dialogs/submit-profile/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/submit-profile/failed.html) |  |  |  |  |  |  |  | [✅](dialogs/submit-profile/success.html) |  |  |  |  |  |  |  |  | `L2-039`, `L2-046` |
| Withdraw submission (`withdraw-submission`) | [✅](dialogs/withdraw-submission/default.html) | [✅](dialogs/withdraw-submission/busy.html) | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-039`, `L2-046` |
| Respond to a review (`review-response`) | [✅](dialogs/review-response/default.html) | [✅](dialogs/review-response/busy.html) | [✅](dialogs/review-response/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/review-response/failed.html) |  |  |  |  |  |  |  |  |  | [✅](dialogs/review-response/edit.html) |  |  |  |  |  |  | `L2-052` |
| Approve profile (`approve-profile`) | [✅](dialogs/approve-profile/default.html) | [✅](dialogs/approve-profile/busy.html) | ➖ |  |  |  |  |  |  |  |  | [✅](dialogs/approve-profile/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-046`, `L2-048`, `L2-060` |
| Request changes (`request-changes`) | [✅](dialogs/request-changes/default.html) | [✅](dialogs/request-changes/busy.html) | [✅](dialogs/request-changes/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/request-changes/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-046`, `L2-048` |
| Suspend caterer (`suspend-caterer`) | [✅](dialogs/suspend-caterer/default.html) | [✅](dialogs/suspend-caterer/busy.html) | [✅](dialogs/suspend-caterer/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/suspend-caterer/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-058`, `L2-060` |
| Reinstate caterer (`reinstate-caterer`) | [✅](dialogs/reinstate-caterer/default.html) | [✅](dialogs/reinstate-caterer/busy.html) | [✅](dialogs/reinstate-caterer/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/reinstate-caterer/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-058` |
| Remove caterer (`remove-caterer`) | [✅](dialogs/remove-caterer/default.html) | [✅](dialogs/remove-caterer/busy.html) | [✅](dialogs/remove-caterer/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/remove-caterer/failed.html) |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/remove-caterer/confirm.html) |  |  |  |  |  | `L2-046`, `L2-058` |
| Edit as operator (`operator-edit`) | [✅](dialogs/operator-edit/default.html) | [✅](dialogs/operator-edit/busy.html) | [✅](dialogs/operator-edit/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/operator-edit/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-057` |
| Revert change (`revert-change`) | [✅](dialogs/revert-change/default.html) | [✅](dialogs/revert-change/busy.html) | [✅](dialogs/revert-change/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/revert-change/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-057` |
| Moderate review (`moderate-review`) | [✅](dialogs/moderate-review/default.html) | [✅](dialogs/moderate-review/busy.html) | [✅](dialogs/moderate-review/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/moderate-review/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/moderate-review/approve.html) | [✅](dialogs/moderate-review/remove.html) |  | `L2-059`, `L2-060` |
| Resolve report (`resolve-report`) | [✅](dialogs/resolve-report/default.html) | [✅](dialogs/resolve-report/busy.html) | [✅](dialogs/resolve-report/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/resolve-report/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/resolve-report/take-action.html) | `L2-055`, `L2-060` |
| Open linked enquiry (`open-enquiry`) | [✅](dialogs/open-enquiry/default.html) | [✅](dialogs/open-enquiry/busy.html) | [✅](dialogs/open-enquiry/invalid.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-034`, `L2-060` |
| Add cuisine (`add-cuisine`) | [✅](dialogs/add-cuisine/default.html) | [✅](dialogs/add-cuisine/busy.html) | [✅](dialogs/add-cuisine/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/add-cuisine/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007` |
| Retire cuisine (`retire-cuisine`) | [✅](dialogs/retire-cuisine/default.html) | [✅](dialogs/retire-cuisine/busy.html) | ➖ |  |  |  |  |  |  |  |  | [✅](dialogs/retire-cuisine/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-007` |
| Add operator (`add-operator`) | [✅](dialogs/add-operator/default.html) | [✅](dialogs/add-operator/busy.html) | [✅](dialogs/add-operator/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/add-operator/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-056`, `L2-060` |
| Deactivate operator (`deactivate-operator`) | [✅](dialogs/deactivate-operator/default.html) | [✅](dialogs/deactivate-operator/busy.html) | ➖ |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | [✅](dialogs/deactivate-operator/confirm.html) |  |  |  |  |  | `L2-056` |
| Record a breach (`record-breach`) | [✅](dialogs/record-breach/default.html) | [✅](dialogs/record-breach/busy.html) | [✅](dialogs/record-breach/invalid.html) |  |  |  |  |  |  |  |  | [✅](dialogs/record-breach/failed.html) |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  |  | `L2-075` |

### Notifications

| Screen | info | success | warning | danger | with-action | stacked | persistent | Requirements |
|---|---|---|---|---|---|---|---|---|
| Toast (`toast`) | [✅](notifications/toast/info.html) | [✅](notifications/toast/success.html) | [✅](notifications/toast/warning.html) | [✅](notifications/toast/danger.html) | [✅](notifications/toast/with-action.html) | [✅](notifications/toast/stacked.html) |  | `L2-028`, `L2-030`, `L2-032`, `L2-035`, `L2-091` |
| Site banner (`site-banner`) | [✅](notifications/site-banner/info.html) | [✅](notifications/site-banner/success.html) | [✅](notifications/site-banner/warning.html) | [✅](notifications/site-banner/danger.html) |  |  | [✅](notifications/site-banner/persistent.html) | `L2-023`, `L2-030`, `L2-070`, `L2-088`, `L2-091` |
| Dashboard toast (`dashboard-toast`) | [✅](notifications/dashboard-toast/info.html) | [✅](notifications/dashboard-toast/success.html) | [✅](notifications/dashboard-toast/warning.html) | [✅](notifications/dashboard-toast/danger.html) | [✅](notifications/dashboard-toast/with-action.html) | [✅](notifications/dashboard-toast/stacked.html) |  | `L2-038`, `L2-041`, `L2-042`, `L2-043` |
| Profile status banner (`profile-banner`) | [✅](notifications/profile-banner/info.html) | [✅](notifications/profile-banner/success.html) | [✅](notifications/profile-banner/warning.html) | [✅](notifications/profile-banner/danger.html) |  |  | [✅](notifications/profile-banner/persistent.html) | `L2-039`, `L2-040`, `L2-044`, `L2-048`, `L2-058` |
| Operator toast (`admin-toast`) | [✅](notifications/admin-toast/info.html) | [✅](notifications/admin-toast/success.html) | [✅](notifications/admin-toast/warning.html) | [✅](notifications/admin-toast/danger.html) |  | [✅](notifications/admin-toast/stacked.html) |  | `L2-048`, `L2-055`, `L2-058`, `L2-059`, `L2-063` |

<!-- coverage:end -->
