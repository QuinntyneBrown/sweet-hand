/**
 * Renders the Sweet Hand business cards.
 *
 *   node docs/business-cards/render.mjs
 *
 * For each card folder, from its card.html (page 1 front, page 2 back), writes:
 *   <slug>-business-card.pdf             3.75 x 2.25 in with bleed (online printers)
 *   <slug>-business-card-crop-marks.pdf  same, centred on 4.5 x 3 in with crop marks
 *   <slug>-business-card-8up-letter.pdf  8-up on US Letter with crop marks (print shop or desktop)
 *   proof-front.png, proof-back.png      300 dpi, full bleed, no guides
 *
 * Playwright is borrowed from frontend/node_modules, as in docs/marketing/render.mjs.
 */
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { assertPdf, pressPdf } from '../marketing/lib/press.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')
const moduleRoot = process.env.SWEET_HAND_MODULE_ROOT ?? path.join(repoRoot, 'frontend')

const require = createRequire(pathToFileURL(path.join(moduleRoot, 'package.json')))
const { chromium } = require('@playwright/test')

const CARDS = [{ slug: 'quinntyne-brown', name: 'Quinntyne Brown' }]
const TRIM = { w: 3.5, h: 2 }
const BLEED = 0.125

async function requireFigtree(page, label) {
  const ok = await page.evaluate(async () => {
    await Promise.all(['500 20px "Figtree"', '600 20px "Figtree"', '700 20px "Figtree"'].map((s) => document.fonts.load(s).catch(() => {})))
    await document.fonts.ready
    return [...document.fonts].filter((f) => f.family.includes('Figtree') && f.status === 'loaded').length >= 3
  })
  if (!ok) throw new Error(`${label}: Figtree did not load (system font fallback)`)
}

const browser = await chromium.launch({
  args: ['--allow-file-access-from-files', '--font-render-hinting=none'],
})

async function renderCard({ slug, name }) {
  const dir = path.join(here, slug)
  const src = pathToFileURL(path.join(dir, 'card.html')).href
  const base = `${slug}-business-card`

  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(src, { waitUntil: 'load' })
  await requireFigtree(page, slug)
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true })
  await ctx.close()
  assertPdf(`${slug} PDF`, pdf, { pages: 2, w: 3.75, h: 2.25 })
  await writeFile(path.join(dir, `${base}.pdf`), pdf)

  const press = { src, selector: '.card', trim: TRIM, bleed: BLEED, ready: (p) => requireFigtree(p, `${slug} press`) }
  const labels = (layout) => ['front', 'back'].map((side) => `${name} business card · ${side} · trim 3.5 × 2 in · ${layout}`)
  const crop = await pressPdf(browser, { ...press, labels: labels('crop marks') })
  assertPdf(`${slug} crop marks`, crop.pdf, { pages: 2, w: 4.5, h: 3 })
  await writeFile(path.join(dir, `${base}-crop-marks.pdf`), crop.pdf)
  const gang = await pressPdf(browser, {
    ...press,
    sheet: { w: 8.5, h: 11 },
    cols: 2,
    rows: 4,
    labels: labels('8-up Letter · flip on long edge'),
  })
  assertPdf(`${slug} 8-up`, gang.pdf, { pages: 2, w: 8.5, h: 11 })
  await writeFile(path.join(dir, `${base}-8up-letter.pdf`), gang.pdf)

  // Proofs: 3.75 x 2.25 in at 300 dpi = 1125 x 675, no guides.
  const proofCtx = await browser.newContext({ viewport: { width: 420, height: 520 }, deviceScaleFactor: 300 / 96 })
  const proof = await proofCtx.newPage()
  await proof.goto(src, { waitUntil: 'load' })
  await proof.evaluate(() => document.body.classList.add('proof'))
  await requireFigtree(proof, `${slug} proof`)
  for (const side of ['front', 'back']) {
    const out = path.join(dir, `proof-${side}.png`)
    await proof.locator(`.${side}`).screenshot({ path: out, animations: 'disabled' })
    const png = await readFile(out)
    const [w, h] = [png.readUInt32BE(16), png.readUInt32BE(20)]
    if (w !== 1125 || h !== 675) throw new Error(`${slug} proof-${side}: expected 1125x675, got ${w}x${h}`)
  }
  await proofCtx.close()
  console.log(`✓ ${slug}: ${base}.pdf, -crop-marks.pdf, -8up-letter.pdf, proof-front.png, proof-back.png`)
}

try {
  for (const card of CARDS) await renderCard(card)
} finally {
  await browser.close()
}
