# Sweet Hand business plan

**Status:** Founder's plan, 12 October 2026. Not a specification; nothing here
is a requirement until it has L1/L2 requirements, a detailed design and mocks
(`AGENTS.md`). Figures are approximate and in CAD.

Explained in plain words in video [06 · The plan, in plain
words](../videos/06-the-plan-in-plain-words/README.md).

## Executive summary

Sweethand can reach roughly $100K revenue in year one and $300K in year two as a solo-founder business, with the free directory as the wedge and the founder's photography, studio and engineering skills as the early revenue.

[Sweethand](https://github.com/QuinntyneBrown/sweet-hand) is a directory and marketplace for the Caribbean home cooks, small-batch makers and caterers of Toronto and the GTA. It stays free to list and free to search. Money comes from four places: the platform (subscriptions, commissions, sponsors), media (food shoots, portraits, event photography), the downtown studio (supper clubs, workshops, content days) and professional services (hosted maker sites, custom builds, white-label licensing).

The thesis is sequencing. Services and media pay the bills in year one while the directory fills with makers and eaters. Platform revenue overtakes services in year two, once there are enough listings, orders and traffic to charge for. By year three the platform is the largest line and most of the founder's hours go into it rather than into shoots.

All figures are CAD, approximate, and assume the founder works on Sweethand full time from launch. A conservative case is about 55% of every number in this plan.

## The opportunity

The GTA has roughly 375,000 people of Caribbean heritage, about 2,500 home cooks selling food, and no directory that covers them.

| Segment | GTA estimate | Basis |
| --- | --- | --- |
| Caribbean-heritage population | 350,000–400,000 | [Statistics Canada](https://www.statcan.gc.ca/o1/en/plus/8342-toronto-caribbean-carnival-let-music-play-backed-data) counted 314,795 in the Toronto area in 2021; raised for growth, outer GTA and under-reporting |
| Caribbean-heritage households (eaters) | ~130,000 | Population at about 2.8 people per household |
| Home cooks and small-batch makers who sell | 2,000–3,000 (range 1,000–5,000) | Network scale-up: people know 1–2 sellers among ~200 Caribbean contacts |
| Seasonal sellers (Christmas, Easter, Carnival) | 4,000–6,000 | Roughly double the year-round count |
| Registered Caribbean caterers and takeouts | 300–500 (approximate) | Founder count to confirm from Google Maps and Yelp |
| Catering events per year (weddings, christenings, nine-nights, birthdays, church, corporate) | 15,000–25,000 | Diaspora households at 0.1–0.2 catered events per household per year |

Demand is not only diaspora. Jerk, roti, doubles and patties sell across the whole city, so the eater side is the GTA's 6.7 million people, with the diaspora as the first 130,000 households.

The supply side is fragmented across Instagram, WhatsApp groups and Facebook. Makers are found by word of mouth, which caps each one at the people who already know them. That is the gap Sweethand fills: a maker is found by dish, island and neighbourhood by people who have never heard of them.

## Product

Sweethand launches as a free directory and grows into a marketplace in three stages, each one unlocked by the stage before it.

**Stage 1 — Directory (launch to month 6).** Maker profiles searchable by dish, island tradition, neighbourhood, dietary need and availability. Approximate area only, never a home address. Allergens and dietary tags as structured data. Food handler and licensing shown as the maker's own statement. Every feature here is already modelled in the [repo](https://github.com/QuinntyneBrown/sweet-hand): Angular 21 frontend, NestJS 11 API, PostgreSQL, Playwright acceptance suite.

**Stage 2 — Orders and requests (months 4–12).** Pre-orders with batch limits, cut-offs and sold-out states (already modelled). Catering request form that routes a quote request to matching makers. Stripe for payment. Maker dashboard with views, saves and conversion.

**Stage 3 — Marketplace and network (year 2).** Reviews tied to completed orders. Maker Pro subscription. Sponsored placements. Seasonal campaigns (black cake and sorrel in December, bun and cheese at Easter, Carnival in July). Hosted maker websites on sweethand.ca subdomains. Delivery through a courier API, never a Sweethand fleet.

What Sweethand will not be: a ghost kitchen, a delivery company, a kitchen certifier or a restaurant listing site. Small scale is the point, and that is what keeps the supply side loyal.

## Founder advantages

The founder's three assets solve the three problems a food directory normally pays for: photos, a venue and software.

| Asset | What it replaces | How it earns |
| --- | --- | --- |
| Professional photography (events, food, weddings, portraits, headshots) | Agency shoots at $1,500+ per maker, or ugly phone photos that kill conversion | Food and menu shoots, headshots, reels, and wedding and event bookings referred by the directory |
| Downtown Toronto studio at $100 per day, with room to cook and host | Venue rental at $500–$1,500 per event | Supper clubs, pop-up markets, cooking workshops, content days; 3–4 maker shoots batched into one $100 day |
| Product engineering (web, apps, platforms) | $150K+ per year of contract development | Hosted maker sites, custom builds, ordering tools, white-label licensing of the platform to other cities and cuisines |

The compounding effect matters more than any one line. A maker who books a $350 shoot gets photos that make their listing convert, which brings orders the platform takes 10% of, which makes Maker Pro worth $29 a month, and which gives Sweethand a growing library of Caribbean food photography no competitor has. Every service sale feeds the platform; the platform feeds the next service sale.

## Revenue streams

Twenty-two streams across four groups; the directory and search stay free in every one of them.

**A. Platform** (scales without founder hours)

| Stream | Pricing | Who pays | GTA sizing | Start |
| --- | --- | --- | --- | --- |
| Maker Pro subscription | $29/month or $290/year: analytics, pre-orders, unlimited photos, priority in search, verified badge | Makers | 2,500 makers; 8% paying by year 3 = 200 | Month 6 |
| Featured and boosted listings | $49/month per neighbourhood or dish category, 5 slots each | Makers, caterers | 20 categories × 5 slots = 100 slots | Month 4 |
| Catering commission | 10% of booked catering routed through the quote form; $0 to request | Caterer | 20,000 events/year; 4% through Sweethand by year 3 = 800 at $900 | Month 4 |
| Pre-order fee | 10% on pre-orders, Stripe fees inside it | Maker (eater sees final price) | $500K GMV by year 3 | Month 6 |
| Sponsors and ads | $500–$2,500/month placements; newsletter sponsorship $300/send | Caribbean grocers, food brands, remittance, airlines, insurance brokers, Carnival bands | 6–8 sponsors at a time | Month 6 |
| Seasonal campaigns | Pre-order drive at 10% plus a $99 campaign slot | Makers | Christmas, Easter, Carnival, Mother's Day | Month 3 (Christmas 2026) |
| Verified badge bundle | $149 one time: profile review, food handler proof shown, 10 studio photos | Makers | Bundled with shoots | Month 2 |
| Affiliates | Food handler courses, home-food insurance, Square and Stripe, packaging suppliers; $10–$50 per referral | Suppliers | Every new maker needs all four | Month 1 |
| Insights reports | Annual State of Caribbean Food in the GTA, $2,000–$5,000 per brand | Brands, agencies, BIAs | 3–5 buyers | Year 2 |

**B. Media** (founder's camera)

| Stream | Pricing | Sizing |
| --- | --- | --- |
| Food and menu shoot | $249 for 10 dishes, $449 for 25, $599 full menu and profile; 3–4 makers per $100 studio day | 40 in year 1, 100 in year 3 |
| Business portraits and headshots | $175 per person; group days at $125 each | 40 in year 1, 100 in year 3 |
| Reels and short video | $350 per 3 reels; $800 for a brand story | 10 in year 1, 35 in year 3 |
| Wedding and event photography | $2,000–$4,500 per wedding, $600–$1,200 per event, referred from the catering flow | 4 weddings in year 1, 12 in year 3 |
| Photo licensing | Caribbean dish library licensed to grocers, brands and publishers at $50–$300 per image | Year 2 |

**C. Studio** (the $100 room)

| Stream | Pricing | Sizing |
| --- | --- | --- |
| Supper clubs | 30 seats at $45–$65; maker takes food cost plus a fee, Sweethand keeps the rest | Monthly from month 4; ~$900 net each |
| Sweet Hand Market pop-ups | 10 vendor tables at $100 plus $10 entry | Quarterly; ~$1,500 each |
| Cooking workshops | 12 seats at $75–$95, maker teaches, 60/40 split to Sweethand | Monthly from month 6 |
| Content days | Makers rent the kitchen and lights for $200 per half day; founder shoots as an add-on | 2 per month by year 2 |

**D. Professional services** (founder's engineering)

| Stream | Pricing | Sizing |
| --- | --- | --- |
| Hosted maker sites | $25/month on a sweethand.ca subdomain or the maker's own domain; built from a template once | 80 sites by year 2, 150 by year 3 |
| Custom websites | $800–$2,500 for caterers and restaurants | 10 per year |
| Ordering and menu tools | $500–$1,500: QR menus, order forms, WhatsApp order bots | 10 per year |
| Custom app development | $8,000–$20,000 for the largest caterers; limited to 1–2 per year | Cap at 2 |
| White-label licensing | $500–$2,000/month per instance; Sweethand's codebase for another diaspora cuisine or another city (Montreal Haitian, Brampton South Asian, Vancouver Filipino) | 1 in year 2, 3–5 in year 3 |

**Delivery.** Not a Sweethand fleet. Integrate a courier API (Uber Direct or DoorDash Drive) and pass the fee through with a $1.50 service charge. Pickup at the maker's chosen spot stays the default; the studio can be a weekend pickup hub for downtown orders.

## Go-to-market and marketing

Supply first: 100 photographed makers on the site before any eater-side spend, because a directory with great photos markets itself and one with empty profiles does not.

**Months 1–3: seed the supply.** Offer the first 100 makers a free 10-dish studio shoot in exchange for a complete profile and a launch-day post. That is 25–30 studio days at $100, or about $3,000, and it produces the best Caribbean food photo library in the city. Recruit through the founder's network, church and community groups, Caribbean grocers (flyer at the till), Facebook and WhatsApp seller groups, and the makers already selling on Instagram. Time it to the Christmas black cake and sorrel season, when every seller is looking for customers.

**Months 3–6: turn on demand.** Launch publicly in late November with the Christmas pre-order campaign. Channels, in order of expected return:

1. Instagram and TikTok: one maker story a day, shot in the studio; the photos are the ad.
2. SEO: a page per dish, island and neighbourhood ("Guyanese pepperpot Brampton", "doubles Scarborough"). Low competition, high intent, compounding.
3. Google Business Profile for Sweethand plus a free profile setup for every maker.
4. Email newsletter: weekly, what's cooking this weekend, sponsor slot from month 6.
5. Community: Carnival, Jerkfest, church events, Black-owned business directories, Caribbean radio and the Caribbean Camera and Share newspapers.
6. Referral: a maker who refers a maker gets a month of Pro; an eater who refers gets $5 off a first order.

**Months 6–12: make it a habit.** Monthly supper club at the studio, each one a content shoot. Seasonal drives on a fixed calendar. Press: the human story (home cooks, sweet hand) is what Toronto Life, blogTO, CBC Toronto and Toronto Star food writers cover.

**Paid spend.** Under $500 per month in year one, all of it on Meta ads promoting specific makers in specific neighbourhoods. Scale to $1,500 per month in year two once a pre-order converts at a known cost.

## Financial forecast

Revenue grows from about $98K in year one to $300K in year two and $565K in year three, with the founder's own work carrying year one and the platform carrying year three.

*Chart not exported (Plan case, typed from the stream assumptions above · years 1–3 from October 2026); the tables below hold the same figures.*

Platform revenue needs almost no founder hours per dollar, so its share rising from 22% to 49% is what makes year three possible for one person. A conservative case is about 55% of each figure.

**By stream (CAD)**

| Stream | Year 1 | Year 2 | Year 3 | Year 3 assumption |
| --- | --- | --- | --- | --- |
| Maker Pro and featured listings | 4,000 | 30,000 | 70,000 | 200 paying makers at $29/month |
| Catering commission (10%) | 5,000 | 27,000 | 72,000 | 800 bookings at $900 |
| Pre-order fee (10%) | 3,000 | 18,000 | 50,000 | $500K GMV |
| Sponsors, ads, newsletter | 9,000 | 36,000 | 72,000 | 6 sponsors at $1,000/month |
| Affiliates and insights | 1,000 | 5,000 | 12,000 | 2 reports plus referrals |
| Food and menu shoots | 14,000 | 30,000 | 40,000 | 100 shoots at $400 |
| Portraits and headshots | 7,000 | 14,000 | 18,000 | 100 at $180 |
| Weddings and events | 12,000 | 28,000 | 40,000 | 12 weddings at $3,300 |
| Reels and video | 5,000 | 12,000 | 18,000 | 35 at $500 |
| Supper clubs and markets | 9,000 | 27,000 | 40,000 | 16 supper clubs, 4 markets |
| Workshops | 5,000 | 14,000 | 20,000 | 20 at $1,000 |
| Content-day rentals | 2,000 | 8,000 | 12,000 | 60 half days at $200 |
| Hosted maker sites | 2,000 | 15,000 | 36,000 | 150 sites at $25/month, average 120 live |
| Custom websites and ordering tools | 12,000 | 18,000 | 20,000 | 12 projects |
| Custom app development | 8,000 | 12,000 | 15,000 | 1 project |
| White-label licensing | 0 | 6,000 | 30,000 | 3 instances at $800/month |

**Costs (CAD)**

| Cost | Year 1 | Year 2 | Year 3 |
| --- | --- | --- | --- |
| Hosting and infrastructure | 1,800 | 3,600 | 7,200 |
| Studio days at $100 | 4,000 | 8,000 | 10,000 |
| Payment processing | 1,500 | 7,000 | 15,000 |
| Insurance (liability, equipment, event) | 1,500 | 2,500 | 3,500 |
| Marketing | 5,000 | 18,000 | 30,000 |
| Software and tools | 2,400 | 3,600 | 4,800 |
| Contractors (photo editing, support, bookkeeping) | 0 | 12,000 | 36,000 |
| Event food and staff | 3,500 | 11,000 | 17,000 |
| Legal and accounting | 2,000 | 3,000 | 4,000 |
| Total | 21,700 | 68,700 | 127,500 |

Net before founder pay is roughly $76K, $231K and $437K. Fixed costs in year one are about $1,500 a month, which five food shoots cover, so the business is cash-positive from the first month the studio is booked.

## Operations as a solo founder

The plan fits one person only if delivery work is batched, the platform is automated, and the two expensive things, custom development and weddings, are capped.

| Work | Year 1 days | Year 2 days | How it stays small |
| --- | --- | --- | --- |
| Studio shoots (food, portraits, video) | 45 | 75 | 3–4 makers per studio day; a contract editor from year 2 |
| Weddings and events | 12 | 25 | Cap at 12 weddings a year; second shooter on contract |
| Studio events (supper clubs, markets, workshops) | 15 | 35 | Fixed monthly calendar; maker runs the kitchen, a part-time host runs the door |
| Web and app projects | 30 | 30 | Hosted sites from one template; custom app work capped at 2 a year |
| Platform engineering | 70 | 50 | Requirement-first, acceptance tests, coding agents already in the repo's workflow |
| Marketing, sales, support, admin | 60 | 45 | Templates, a shared inbox, a VA from year 2 |
| Total | 232 | 260 | About 240 working days in a year |
|  |  |  |  |

Automation that keeps it to one person: Stripe for every payment, a courier API for every delivery, a help centre and canned replies for support, scheduled posts from the studio photo library, invoices generated from bookings, and a weekly ops review rather than daily checks.

What the founder never does: cook, deliver, certify kitchens, chase payments by hand, build a feature a paying maker has not asked for, or take a custom build that does not also become a product.

## Risks and compliance

The biggest risk is regulatory: most Caribbean dishes are not low-risk foods under Ontario's rules, so Sweethand must stay a directory that shows the maker's own compliance statement rather than a seller that vouches for kitchens.

**Ontario home-food rules.** Since January 2020 the [Food Premises Regulation](https://www.ontario.ca/laws/regulation/170493) has exempted home businesses that make only low-risk foods (breads, most baked goods, jams, pickles, chocolate, granola) from food handler certification, separate hand-wash sinks and commercial dishwashing. Jerk, oxtail, roti with meat, curry, black cake with cream and anything needing refrigeration is not low-risk, so those makers must notify their public health unit, keep a certified food handler on site and expect periodic inspection ([Ontario guide](https://pickyourown.org/cottagefood/Canada-Ontario-Guide-Starting-Home-based-Food-Biz.pdf); [York Region](https://york.ca/media/113416/download)). Municipalities also set zoning rules for home businesses.

| Risk | Likelihood | Mitigation |
| --- | --- | --- |
| A maker sells unsafe food and Sweethand is blamed | Medium | Terms that make the maker the seller of record; compliance shown as the maker's own statement; allergens as structured data; food handler course affiliate so the path to compliance is one click; liability insurance |
| Makers list but never update, so the directory goes stale | High | Availability expires automatically; a sold-out state; a monthly "still cooking?" nudge; Pro makers get a calendar |
| Chicken-and-egg: eaters find no makers, makers see no eaters | High | Supply first with 100 photographed makers before launch; seasonal campaigns where demand already exists |
| Founder burnout | High | Day caps in the operations table; contractor budget from year 2; a 90-day review of which streams to drop |
| Uber Eats, DoorDash or a chain lists Caribbean home cooks | Low | They cannot handle approximate addresses, batch limits or island-specific taxonomy; stay small-scale by design |
| Platform revenue arrives slower than planned | Medium | Services and media are profitable on their own, so the directory can stay free for longer |
| Payment disputes and no-shows at pickup | Medium | Prepayment through Stripe; a no-show policy; makers rate eaters |
| Privacy: a maker's home address leaks | Low | Approximate area only in the product by design; pickup details sent per order |

**Legal setup.** Incorporate (an Ontario or federal corporation), register for HST once revenue passes $30,000, hold commercial general liability and equipment insurance, add event liability for studio nights, and get terms of service and a privacy policy reviewed by a lawyer once before launch.

## 90-day launch plan

The first 90 days are built around one date: a public launch on November 26, with 100 photographed makers live and the Christmas pre-order drive open the same day.

*Timeline not exported (90-day launch timeline · 9 milestones from Oct 12, 2026); the paragraphs below summarize it.*

Recruiting and free studio shoots run in parallel from week one; pre-orders and Stripe are built while the shoots fill the directory; Maker Pro turns on only after the Christmas season proves eaters will pay.

Targets for the 90-day review: 100 makers live with studio photos, 500 eater accounts, $5,000 in Christmas pre-order GMV, 10 paid shoots or portrait sessions booked, one supper club sold out, and three sponsor conversations open. Miss two or more and the review decides which streams to drop before year one spend grows.
