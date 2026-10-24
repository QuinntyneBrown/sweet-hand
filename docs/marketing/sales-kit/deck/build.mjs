/**
 * Builds the caterer pitch deck: a PowerPoint file with speaker notes on every
 * slide, its PDF, and a contact sheet for review.
 *
 *   npm install --prefix .cache/deck pptxgenjs@3.12.0     # once; .cache/ is not committed
 *   node docs/marketing/sales-kit/deck/build.mjs
 *
 * Writes beside this file:
 *   sweet-hand-caterer-pitch.pptx   13 slides, 16:9, speaker notes on every slide
 *   sweet-hand-caterer-pitch.pdf    the same, exported by LibreOffice (soffice)
 *   contact-sheet.png               every slide in a grid, for review
 *
 * Needs LibreOffice (`soffice`, or SOFFICE=path) and Poppler (`pdftoppm`) for the
 * PDF and contact sheet, and Chromium through frontend/node_modules
 * (@playwright/test) to draw the logo and QR codes; SWEET_HAND_MODULE_ROOT and
 * PPTX_MODULE_ROOT point elsewhere if those are installed in other folders.
 *
 * The slides use Arial, not Figtree: a .pptx cannot carry its font, and Arial
 * looks the same on every machine that opens it. The logo is drawn in Figtree.
 * Colours are the design system's (docs/design-system/tokens/tokens.css).
 */
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { execFileSync } from 'node:child_process'
import { mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { qrcodegen } from '../../lib/qrcodegen.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const kit = path.resolve(here, '..')
const repoRoot = path.resolve(here, '..', '..', '..', '..')
const cache = path.join(repoRoot, '.cache', 'sales-kit-deck')
const requireFrom = (root) => createRequire(pathToFileURL(path.join(root, 'package.json')))
const { chromium } = requireFrom(process.env.SWEET_HAND_MODULE_ROOT ?? path.join(repoRoot, 'frontend'))('@playwright/test')
const PptxGenJS = requireFrom(process.env.PPTX_MODULE_ROOT ?? path.join(repoRoot, '.cache', 'deck'))('pptxgenjs')

const NAME = 'sweet-hand-caterer-pitch'
const SITE = 'https://sweethand.ca'
const FACEBOOK = 'https://www.facebook.com/profile.php?id=61595065212396'
const OFFER = 'The first 100 caterers who register get a free photoshoot: 10 of their dishes, shot in our studio. In return we ask for a complete profile and a launch-day post.'

// Design-system colours (tokens.css), by palette step.
const STONE_950 = '141312'
const STONE_700 = '4D4B48'
const STONE_600 = '6B6863'
const STONE_350 = 'B8B2A8'
const STONE_200 = 'E2DED7'
const STONE_50 = 'F7F5F2'
const WHITE = 'FFFFFF'
const PEPPER_600 = 'B5381F'
const PEPPER_500 = 'C94A2F'
const FONT = 'Arial'

mkdirSync(cache, { recursive: true })
const shot = (name) => path.join(kit, 'screenshots', `${name}.png`)

/** QR code as an SVG string: 4-module quiet zone, white background, stone 950 modules. */
function qrSvg(text) {
  const qr = qrcodegen.QrCode.encodeText(text, qrcodegen.QrCode.Ecc.MEDIUM)
  const size = qr.size + 8
  let d = ''
  for (let y = 0; y < qr.size; y += 1) for (let x = 0; x < qr.size; x += 1) if (qr.getModule(x, y)) d += `M${x + 4},${y + 4}h1v1h-1z`
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${size} ${size}" shape-rendering="crispEdges"><rect width="${size}" height="${size}" fill="#fff"/><path d="${d}" fill="#141312"/></svg>`
}

/** Draws the logo lockups (in Figtree) and the two QR codes to PNG with Chromium. */
async function drawArt() {
  const font = pathToFileURL(path.join(kit, '..', 'assets', 'fonts', 'figtree-700.ttf')).href
  const light = readFileSync(path.join(repoRoot, 'assets', 'logo', 'sweet-hand-logo-light.svg'), 'utf8')
  const dark = readFileSync(path.join(repoRoot, 'assets', 'logo', 'sweet-hand-logo-dark.svg'), 'utf8')
  const pieces = {
    'logo-light': { w: 540, h: 120, html: light },
    'logo-dark': { w: 540, h: 120, html: dark },
    'qr-site': { w: 480, h: 480, html: qrSvg(SITE) },
    'qr-facebook': { w: 480, h: 480, html: qrSvg(FACEBOOK) },
  }
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ deviceScaleFactor: 2 })
    for (const [name, { w, h, html }] of Object.entries(pieces)) {
      await page.setViewportSize({ width: w, height: h })
      await page.setContent(
        `<style>@font-face{font-family:Figtree;src:url("${font}");font-weight:500 800}html,body{margin:0;background:transparent}svg{display:block;width:${w}px;height:${h}px}</style>${html}`,
      )
      await page.evaluate(() => document.fonts.ready)
      await page.screenshot({ path: path.join(cache, `${name}.png`), omitBackground: true })
    }
  } finally {
    await browser.close()
  }
}

/** Contact sheet of the PDF's pages, 3 across, for checking overflow and contrast. */
async function contactSheet(pdf) {
  const pages = path.join(cache, 'pages')
  rmSync(pages, { recursive: true, force: true })
  mkdirSync(pages)
  execFileSync('pdftoppm', ['-png', '-r', '60', pdf, path.join(pages, 'slide')])
  const files = readdirSync(pages).filter((f) => f.endsWith('.png')).sort()
  const tiles = files
    .map((f, i) => `<figure><img src="data:image/png;base64,${readFileSync(path.join(pages, f)).toString('base64')}"><figcaption>${i + 1}</figcaption></figure>`)
    .join('')
  const browser = await chromium.launch()
  try {
    const page = await browser.newPage({ viewport: { width: 1800, height: 800 } })
    await page.setContent(
      `<body style="margin:0;padding:30px;background:#e2ded7;font:600 18px Arial;color:#141312"><style>main{display:grid;grid-template-columns:repeat(3,1fr);gap:24px}img{display:block;width:100%;box-shadow:0 2px 8px rgb(0 0 0 / .2)}figure{margin:0}figcaption{margin-top:6px}</style><main>${tiles}</main></body>`,
    )
    await page.locator('body').screenshot({ path: path.join(here, 'contact-sheet.png') })
  } finally {
    await browser.close()
  }
  return files.length
}

await drawArt()
const art = (name) => path.join(cache, `${name}.png`)

const pres = new PptxGenJS()
pres.layout = 'LAYOUT_WIDE' // 13.333 x 7.5 in
pres.author = 'Sweet Hand'
pres.company = 'Sweet Hand'
pres.title = 'Sweet Hand: a pitch for caterers'
pres.theme = { headFontFace: FONT, bodyFontFace: FONT }

const W = 13.333
const M = 0.6 // margin
pres.defineSlideMaster({
  title: 'LIGHT',
  background: { color: WHITE },
  objects: [
    { image: { path: art('logo-light'), x: M, y: 6.82, w: 1.62, h: 0.36 } },
    { text: { text: 'sweethand.ca', options: { x: W - M - 3.7, y: 6.8, w: 3, h: 0.4, align: 'right', fontFace: FONT, fontSize: 11, color: STONE_600, margin: 0 } } },
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.45, w: W - 2 * M, h: 0.9, fontFace: FONT, fontSize: 36, bold: true, color: STONE_950, align: 'left', valign: 'top', margin: 0 }, text: '' } },
  ],
  slideNumber: { x: W - M - 0.5, y: 6.8, w: 0.5, h: 0.4, align: 'right', fontFace: FONT, fontSize: 11, color: STONE_600 },
})
pres.defineSlideMaster({
  title: 'DARK',
  background: { color: STONE_950 },
  objects: [{ image: { path: art('logo-dark'), x: M, y: 0.55, w: 2.7, h: 0.6 } }],
})

const text = (slide, value, o) => slide.addText(value, { isTextBox: true, fontFace: FONT, margin: 0, valign: 'top', ...o })
const notes = (slide, value) => slide.addNotes(value.replace(/\s+/g, ' ').trim())

/** A phone screenshot (780 x 1688) in a rounded stone frame. */
function phone(slide, name, x, y, h) {
  const w = (h * 780) / 1688
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: x - 0.08, y: y - 0.08, w: w + 0.16, h: h + 0.16, rectRadius: 0.22, fill: { color: STONE_950 }, line: { color: STONE_950 }, shadow: { type: 'outer', blur: 8, offset: 3, angle: 90, color: '000000', opacity: 0.25 } })
  slide.addImage({ path: shot(name), x, y, w, h, altText: `Screenshot: ${name.replace(/-/g, ' ')}` })
  return w
}

/** A desktop screenshot cropped to w x h inches, starting `top` inches down the image. */
function desktop(slide, name, x, y, w, h, imgH = 900, top = 0) {
  const shownH = (w * imgH) / 1440
  slide.addShape(pres.shapes.RECTANGLE, { x, y, w, h, fill: { color: WHITE }, line: { color: STONE_200, width: 1 }, shadow: { type: 'outer', blur: 10, offset: 3, angle: 90, color: '000000', opacity: 0.18 } })
  slide.addImage({ path: shot(name), x, y, w, h: shownH, sizing: { type: 'crop', x: 0, y: top, w, h: Math.min(h, shownH - top) }, altText: `Screenshot: ${name.replace(/-/g, ' ')}` })
}

/** A tag in the design system's pill idiom. */
function pill(slide, label, x, y, { fill = STONE_50, color = STONE_950, w = Math.max(1.0, label.length * 0.105 + 0.5) } = {}) {
  slide.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y, w, h: 0.42, rectRadius: 0.21, fill: { color: fill }, line: { color: fill === WHITE ? STONE_200 : fill } })
  text(slide, label, { x, y, w, h: 0.42, fontSize: 14, bold: true, color, align: 'center', valign: 'middle' })
  return w
}

// 1 · Title
{
  const s = pres.addSlide({ masterName: 'DARK' })
  text(s, 'You have a sweet hand.', { x: M, y: 2.1, w: 8.5, h: 1.1, fontSize: 54, bold: true, color: WHITE })
  text(s, 'Let Toronto find it.', { x: M, y: 3.15, w: 8.5, h: 1.0, fontSize: 54, bold: true, color: STONE_350 })
  text(s, 'Sweet Hand for Caribbean caterers and home cooks in Toronto and the GTA. Opens Thursday 26 November 2026.', { x: M, y: 4.6, w: 7.2, h: 0.9, fontSize: 18, color: STONE_200 })
  phone(s, 'caterer-profile-jerk-phone', 9.75, 0.75, 6.0)
  notes(s, `Open warm. Thank them for the time and say who you are. "Sweet Hand is a new site where people in Toronto and the GTA find Caribbean caterers by dish, by island and by area. It opens on Thursday the 26th of November. I have two asks at the end: sign up, and follow us on Facebook." The phone shows a caterer's page: a fictional caterer from our demo data, Auntie Bev's Kitchen.`)
}

// 2 · The problem
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Right now, people find you by word of mouth', { placeholder: 'title' })
  const items = [['A cousin', 'who tells a friend'], ['A church group', 'and the next christening'], ['A WhatsApp chat', 'that scrolls away by Sunday']]
  items.forEach(([head, sub], i) => {
    const x = M + i * 4.1
    s.addShape(pres.shapes.OVAL, { x, y: 2.0, w: 1.0, h: 1.0, fill: { color: i === 2 ? PEPPER_600 : STONE_950 }, line: { color: WHITE } })
    text(s, String(i + 1), { x, y: 2.0, w: 1.0, h: 1.0, fontSize: 28, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    text(s, head, { x, y: 3.3, w: 3.7, h: 0.6, fontSize: 26, bold: true, color: STONE_950 })
    text(s, sub, { x, y: 3.9, w: 3.7, h: 0.6, fontSize: 16, color: STONE_600 })
  })
  text(s, 'Everybody asks who made the pelau. The black cake is gone before the speeches. But the people planning the next wedding have no way to find you.', { x: M, y: 5.0, w: 11.5, h: 1.0, fontSize: 18, color: STONE_700 })
  notes(s, `Ask how people find them today. Most will say family, church, WhatsApp, Instagram. Agree: it works, but it stops at the people who already know them. "Everybody asks who made the pelau. Your black cake is gone before the speeches. But someone planning a wedding in Brampton next spring has no way to find you."`)
}

// 3 · Sweet Hand
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('One place to find Caribbean caterers', { placeholder: 'title' })
  desktop(s, 'caterers-listing-desktop', M, 1.6, 7.6, 4.75)
  text(s, 'People search by tradition, by area and by occasion.', { x: 8.7, y: 1.6, w: 4.0, h: 1.0, fontSize: 18, color: STONE_950 })
  const traditions = ['Jamaican', 'Trinidadian and Tobagonian', 'Guyanese', 'Barbadian (Bajan)', 'Haitian', 'Grenadian', 'Vincentian', 'St. Lucian']
  traditions.forEach((t, i) => text(s, t, { x: 8.7, y: 2.75 + i * 0.42, w: 4.0, h: 0.4, fontSize: 16, bold: i === 0, color: i === 0 ? PEPPER_600 : STONE_700 }))
  text(s, 'Each tradition by name, never just "Caribbean".', { x: 8.7, y: 6.15, w: 4.0, h: 0.4, fontSize: 12, color: STONE_600 })
  notes(s, `This is the caterer listing. People pick a tradition, an area such as Scarborough or Brampton, and an occasion such as a wedding or a repast. Every tradition has its own name: Jamaican, Trinidadian and Tobagonian, Guyanese, Bajan, Haitian, Grenadian, Vincentian, Lucian and more. Ask them which they cook, and use their words. The caterers on screen are fictional demo data.`)
}

// 4 · Your page
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Your own page', { placeholder: 'title' })
  desktop(s, 'caterer-profile-jerk-desktop', M, 1.6, 7.6, 4.75, 2098, 3.3)
  const facts = ['Your photos and your story', 'The traditions you cook from', 'The event sizes and occasions you take', 'Your menu, with prices if you want them', 'Reviews from customers after their event', 'A "Send an enquiry" button']
  text(
    s,
    facts.map((f, i) => ({ text: f, options: { bullet: { indent: 18 }, breakLine: i < facts.length - 1, paraSpaceAfter: 8 } })),
    { x: 8.7, y: 1.6, w: 4.0, h: 4.6, fontSize: 18, color: STONE_950 },
  )
  notes(s, `Walk through the page from the top: photos, name, the traditions they cook from, their description in their own words, guest numbers and occasions, the menu, the areas they serve, reviews, and the "Send an enquiry" button. Reviews only come from customers whose enquiry got a reply and whose event has passed. People send an enquiry with their date and guest count; the caterer agrees the details directly. No money moves through Sweet Hand.`)
}

// 5 · Menu and dietary tags
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('A menu people can trust at a glance', { placeholder: 'title' })
  phone(s, 'caterer-profile-menu-phone', 9.6, 1.45, 5.15)
  text(s, 'Every dish can carry dietary and allergen tags from one fixed list, shown as labels, not buried in the description.', { x: M, y: 1.6, w: 8.2, h: 1.1, fontSize: 18, color: STONE_950 })
  const tags = ['Vegetarian', 'Vegan', 'Gluten-free', 'Dairy-free', 'Halal', 'Contains nuts', 'Contains shellfish', 'Spicy']
  let x = M
  let y = 3.0
  for (const t of tags) {
    const w = Math.max(1.2, t.length * 0.13 + 0.5)
    if (x + w > M + 8.2) {
      x = M
      y += 0.6
    }
    pill(s, t, x, y, { w, fill: t.startsWith('Contains') ? 'FBEBD0' : STONE_50, color: STONE_950 })
    x += w + 0.2
  }
  text(s, 'You choose the tags for your own dishes. Sweet Hand does not certify or inspect kitchens.', { x: M, y: 4.6, w: 8.2, h: 0.9, fontSize: 16, color: STONE_700 })
  notes(s, `Show the menu on the phone. Each dish has a name, an optional description, optional price guidance like "From $16 per person", and tags from a fixed list: vegetarian, vegan, gluten-free, dairy-free, halal, contains nuts, contains shellfish and spicy. Allergens are labels, so a parent with a nut allergy can see them straight away. Say clearly that the caterer chooses the tags and that Sweet Hand does not certify or inspect anyone's kitchen.`)
}

// 6 · Built on a phone
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Build it from your phone', { placeholder: 'title' })
  const shots = [['profile-menu-phone', 'Menu'], ['profile-photos-phone', 'Photos'], ['profile-cuisines-phone', 'Cuisines and areas']]
  shots.forEach(([name, label], i) => {
    const x = M + 0.2 + i * 2.75
    phone(s, name, x, 1.55, 4.55)
    text(s, label, { x: x - 0.1, y: 6.2, w: 2.3, h: 0.4, fontSize: 14, bold: true, color: STONE_950, align: 'center' })
  })
  text(s, 'Your page saves as you go. A checklist shows what is left. When it is complete, you send it in and our team reviews it within 3 business days.', { x: 9.0, y: 1.6, w: 3.7, h: 3.0, fontSize: 18, color: STONE_950 })
  notes(s, `Everything works on a phone: add dishes, reorder them, upload photos and pick your cover, and choose your traditions and the areas you serve. Changes save by themselves, and a checklist shows what is left. To send a page in you need a description, your traditions and areas, guest numbers, at least one occasion, 3 to 30 photos, 3 to 50 dishes and a current food handler certificate. Our team reviews every page within 3 business days. That review is not a kitchen inspection.`)
}

// 7 · Privacy and control
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Your kitchen, your rules', { placeholder: 'title' })
  const cards = [
    ['Free to list', 'No listing fee and no commission. You agree the price with your customer.'],
    ['You set the menu, the batches and the days', 'You decide what you cook, how much, and which enquiries you take.'],
    ['Your home address stays private', 'People see the areas you serve, never your address. Your phone and email stay private until you share them.'],
  ]
  cards.forEach(([head, body], i) => {
    const x = M + i * 4.1
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 1.7, w: 3.8, h: 3.9, rectRadius: 0.2, fill: { color: STONE_50 }, line: { color: STONE_50 } })
    text(s, head, { x: x + 0.35, y: 2.05, w: 3.1, h: 1.4, fontSize: 24, bold: true, color: STONE_950 })
    text(s, body, { x: x + 0.35, y: 3.55, w: 3.1, h: 1.9, fontSize: 16, color: STONE_700 })
  })
  text(s, 'Food handler details are your own statement: only you and the Sweet Hand team see your certificate.', { x: M, y: 5.9, w: 12.0, h: 0.5, fontSize: 14, color: STONE_600 })
  notes(s, `Three promises we can keep. Free to list, with no fees. You set the menu, the batches and the days. Your home address never shows: your page lists the areas you serve, like Ajax or Pickering, and your phone and email are only shared if you choose to share them with a customer in that conversation. The food handler certificate is required to be listed, but only you and the Sweet Hand team see it, and we never say a kitchen is certified.`)
}

// 8 · Free photoshoot
{
  const s = pres.addSlide({ masterName: 'DARK' })
  text(s, '100', { x: M, y: 1.6, w: 5.0, h: 2.2, fontSize: 150, bold: true, color: PEPPER_500 })
  text(s, 'A free photoshoot for the first 100 caterers who register', { x: M, y: 3.95, w: 5.2, h: 1.4, fontSize: 26, bold: true, color: WHITE })
  const terms = [
    ['What you get', '10 of your dishes, shot in our studio in downtown Toronto. About 90 minutes. You bring the food and keep the photos.'],
    ['What we ask', 'A complete profile on Sweet Hand, and a launch-day post on 26 November.'],
    ['To confirm', 'How "first 100" is counted, the last day to book, and how shoot days are booked. Ask your sales person.'],
  ]
  terms.forEach(([head, body], i) => {
    const y = 1.6 + i * 1.65
    text(s, head, { x: 6.6, y, w: 6.1, h: 0.45, fontSize: 16, bold: true, color: i === 2 ? STONE_350 : PEPPER_500 })
    text(s, body, { x: 6.6, y: y + 0.45, w: 6.1, h: 1.1, fontSize: 18, color: i === 2 ? STONE_350 : WHITE })
  })
  notes(s, `Say the offer word for word: "${OFFER}" The shoot is about 90 minutes in our downtown studio; they bring the food and keep the photos for their own Instagram. How "first 100" is counted, the last day to book and how shoot days are booked are still to confirm with the founder. Do not promise a place. Say: "Register today; the first 100 registrations get the shoot, and I'll confirm your place."`)
}

// 9 · What's coming next (exploring)
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Coming ideas we are exploring', { placeholder: 'title' })
  text(s, 'Not promised. Not at launch. No dates.', { x: M, y: 1.4, w: 8, h: 0.5, fontSize: 18, bold: true, color: PEPPER_600 })
  const ideas = [
    ['Delivery', 'We are exploring delivery through a courier partner. At launch, you agree pickup or delivery with each customer yourself.'],
    ['Awards', 'We are exploring awards, for example "GTA’s Best Jerk Chicken". No categories, rules or dates yet.'],
  ]
  ideas.forEach(([head, body], i) => {
    const x = M + i * 6.15
    s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x, y: 2.2, w: 5.85, h: 3.6, rectRadius: 0.2, fill: { color: WHITE }, line: { color: STONE_200, width: 1.5, dashType: 'dash' } })
    pill(s, 'Exploring', x + 0.4, 2.55, { w: 1.5, fill: STONE_50, color: PEPPER_600 })
    text(s, head, { x: x + 0.4, y: 3.2, w: 5.0, h: 0.7, fontSize: 28, bold: true, color: STONE_950 })
    text(s, body, { x: x + 0.4, y: 4.0, w: 5.0, h: 1.6, fontSize: 18, color: STONE_700 })
  })
  text(s, 'Follow the Facebook Page to hear first.', { x: M, y: 6.05, w: 8, h: 0.45, fontSize: 16, color: STONE_600 })
  notes(s, `Be careful on this slide. These are ideas we are exploring, not features and not promises. Delivery: at launch the caterer agrees pickup or delivery with each customer. We are exploring delivery through a courier partner for later; Sweet Hand will not run its own delivery fleet. Awards: we are exploring ideas like "GTA's Best Jerk Chicken"; there are no categories, rules or dates. If they ask when, say "We don't know yet. Follow the Facebook Page and you'll hear first."`)
}

// 10 · Launch date
{
  const s = pres.addSlide({ masterName: 'DARK' })
  text(s, 'Opens', { x: M, y: 2.5, w: 12, h: 0.7, fontSize: 28, color: STONE_350 })
  text(s, 'Thursday 26 November 2026', { x: M, y: 3.2, w: 12, h: 1.2, fontSize: 60, bold: true, color: WHITE })
  text(s, 'Toronto and the GTA, right before the Christmas orders. Black cake, sorrel, pastelles, ponche de crème: be listed before the rush.', { x: M, y: 4.8, w: 9.5, h: 1.2, fontSize: 20, color: STONE_200 })
  notes(s, `Sweet Hand opens to the public on Thursday 26 November 2026, in Toronto and the GTA. That is right before Christmas: black cake, sorrel, pastelles, ponche de crème, garlic pork. Makers add their Christmas items to their menu and people send an enquiry for their date and quantity. Signing up now means being there on day one.`)
}

// 11 · How to register
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Sign up now: two minutes', { placeholder: 'title' })
  s.addImage({ path: art('qr-site'), x: M, y: 1.6, w: 2.6, h: 2.6, altText: 'QR code for sweethand.ca' })
  text(s, 'sweethand.ca', { x: M, y: 4.3, w: 3.2, h: 0.5, fontSize: 22, bold: true, color: STONE_950 })
  const steps = [
    'Scan the code or go to sweethand.ca',
    'Press "Join as a caterer"',
    'Before 26 November: add your business name and email, then confirm the link we send. We email you once, on launch day.',
    'From 26 November: create your caterer account and build your page.',
  ]
  steps.forEach((t, i) => {
    const y = 1.6 + i * 1.12
    s.addShape(pres.shapes.OVAL, { x: 4.0, y, w: 0.55, h: 0.55, fill: { color: STONE_950 }, line: { color: STONE_950 } })
    text(s, String(i + 1), { x: 4.0, y, w: 0.55, h: 0.55, fontSize: 16, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    text(s, t, { x: 4.75, y: y + 0.03, w: 4.4, h: 1.05, fontSize: 16, color: STONE_950 })
  })
  phone(s, 'register-caterer-phone', 10.0, 1.45, 5.15)
  notes(s, `Do it with them now, on their phone. Scan the code or type sweethand.ca, then press "Join as a caterer". Until launch day that puts them on the launch list as a caterer: business name and email, then they confirm the link in the email, and we email them once, on launch day. From 26 November the same button opens caterer registration, shown on the phone: business name, their name, email, phone and a password. Founding caterers may be invited to build their page before launch; that is planned, not built, so don't promise it. Then log the lead.`)
}

// 12 · Facebook
{
  const s = pres.addSlide({ masterName: 'LIGHT' })
  s.addText('Follow Sweet Hand on Facebook', { placeholder: 'title' })
  s.addImage({ path: art('qr-facebook'), x: M, y: 1.6, w: 3.2, h: 3.2, altText: 'QR code for the Sweet Hand Facebook Page' })
  text(s, 'facebook.com/profile.php?id=61595065212396', { x: M, y: 4.95, w: 6, h: 0.45, fontSize: 14, color: STONE_600 })
  const why = ['The launch, first', 'Photoshoot days', 'The caterers who join', 'The ideas we are exploring']
  text(s, 'Where you hear it first:', { x: 4.6, y: 1.6, w: 8, h: 0.5, fontSize: 20, bold: true, color: STONE_950 })
  why.forEach((t, i) => text(s, t, { x: 4.6, y: 2.3 + i * 0.62, w: 8, h: 0.55, fontSize: 24, color: i === 0 ? PEPPER_600 : STONE_950, bold: i === 0 }))
  notes(s, `Second ask. Open the Facebook app with them and follow the Sweet Hand Page: scan the code, or search the link. That is where we announce the launch, the photoshoot days, the caterers who join and the ideas we are exploring, like delivery and awards. Note in the tracker whether they followed.`)
}

// 13 · Questions
{
  const s = pres.addSlide({ masterName: 'DARK' })
  text(s, 'Questions?', { x: M, y: 1.7, w: 12, h: 1.2, fontSize: 60, bold: true, color: WHITE })
  const asks = [
    ['1', 'Sign up', 'sweethand.ca → Join as a caterer'],
    ['2', 'Follow us', 'Sweet Hand on Facebook'],
  ]
  asks.forEach(([n, head, body], i) => {
    const y = 3.4 + i * 1.25
    s.addShape(pres.shapes.OVAL, { x: M, y, w: 0.8, h: 0.8, fill: { color: PEPPER_600 }, line: { color: PEPPER_600 } })
    text(s, n, { x: M, y, w: 0.8, h: 0.8, fontSize: 24, bold: true, color: WHITE, align: 'center', valign: 'middle' })
    text(s, head, { x: M + 1.1, y: y - 0.02, w: 5, h: 0.5, fontSize: 24, bold: true, color: WHITE })
    text(s, body, { x: M + 1.1, y: y + 0.45, w: 8, h: 0.45, fontSize: 18, color: STONE_350 })
  })
  text(s, 'Free to list. You set the menu, the batches and the days. Your home address stays private.', { x: M, y: 6.25, w: 12, h: 0.5, fontSize: 16, color: STONE_200 })
  notes(s, `Take questions. Answer from the FAQ; if it is not there, or the FAQ says "to confirm", say "I'll check and come back to you" and write it down. Never promise delivery, awards, orders or a photoshoot place. Close with both asks: "Let's get you signed up: sweethand.ca, Join as a caterer. And can you follow Sweet Hand on Facebook while we're here?"`)
}

const pptx = path.join(here, `${NAME}.pptx`)
await pres.writeFile({ fileName: pptx })
console.log(`✓ ${path.basename(pptx)}`)

const soffice = process.env.SOFFICE ?? 'soffice'
execFileSync(soffice, ['--headless', '--convert-to', 'pdf', '--outdir', here, pptx], { stdio: 'ignore', timeout: 180_000 })
const pdf = path.join(here, `${NAME}.pdf`)
console.log(`✓ ${path.basename(pdf)}`)
const count = await contactSheet(pdf)
writeFileSync(path.join(cache, 'built.txt'), new Date().toISOString())
console.log(`✓ contact-sheet.png (${count} slides)`)
