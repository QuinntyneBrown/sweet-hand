/**
 * Prepress layouts for print pieces authored as HTML (the flyer, business cards).
 *
 * Each source page is a full-bleed element (`.sheet`, `.card`) that prints
 * edge to edge. `pressPdf` reloads the source and lays its pages out on a
 * larger press page with crop marks outside the bleed, optionally ganged up
 * N-up on a press sheet, then prints that to PDF. The artwork is the same
 * DOM, so the PDF stays vector with live, embedded type.
 *
 * Crop marks follow the usual convention: 0.25 pt registration black,
 * starting 1/16 in outside the bleed so they never print on a trimmed piece.
 */

const MARK_GAP = 0.0625 // in, between the bleed edge and the start of a mark
const MARK_LENGTH = 0.25 // in, longest mark
const SLUG = 0.375 // in, paper outside the bleed on a single-up page

/**
 * @param {import('@playwright/test').Browser} browser
 * @param {object} o
 * @param {string} o.src           file URL of the source HTML
 * @param {string} o.selector      one element per source page (front, back...)
 * @param {{w:number,h:number}} o.trim  trim size in inches
 * @param {number} o.bleed         bleed in inches
 * @param {{w:number,h:number}} [o.sheet] press sheet in inches; omit for single-up
 * @param {number} [o.cols]        gang-up columns (default 1)
 * @param {number} [o.rows]        gang-up rows (default 1)
 * @param {string[]} o.labels      slug label per source page
 * @param {(page: import('@playwright/test').Page) => Promise<void>} o.ready  waits for fonts
 * @returns {Promise<{pdf: Buffer, sheet: {w:number,h:number}}>}
 */
export async function pressPdf(browser, o) {
  const cols = o.cols ?? 1
  const rows = o.rows ?? 1
  const cell = { w: o.trim.w + 2 * o.bleed, h: o.trim.h + 2 * o.bleed }
  const sheet = o.sheet ?? { w: cell.w + 2 * SLUG, h: cell.h + 2 * SLUG }
  const margin = { x: (sheet.w - cols * cell.w) / 2, y: (sheet.h - rows * cell.h) / 2 }
  const markLength = Math.min(MARK_LENGTH, margin.x - MARK_GAP * 2, margin.y - MARK_GAP * 2)
  if (markLength < 0.125) throw new Error(`press sheet ${sheet.w} x ${sheet.h} in leaves no room for crop marks`)

  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  await page.goto(o.src, { waitUntil: 'load' })
  await o.ready(page)
  await page.evaluate(
    ({ selector, trim, bleed, sheet, cols, rows, cell, margin, markLength, gap, labels }) => {
      const sources = [...document.querySelectorAll(selector)]
      const press = document.createElement('div')
      const style = document.createElement('style')
      style.textContent = `
        @page { size: ${sheet.w}in ${sheet.h}in; margin: 0; }
        html, body { background: #fff !important; }
        body { display: block !important; padding: 0 !important; min-height: 0 !important; }
        .press-page { position: relative; width: ${sheet.w}in; height: ${sheet.h}in; overflow: hidden;
          break-after: page; page-break-after: always; background: #fff; }
        .press-page:last-child { break-after: auto; page-break-after: auto; }
        .press-cell { position: absolute; width: ${cell.w}in; height: ${cell.h}in; overflow: hidden; }
        .press-cell > * { position: absolute !important; inset: 0; margin: 0 !important;
          box-shadow: none !important; break-after: auto !important; page-break-after: auto !important; }
        .press-cell > *::before, .press-cell > *::after { content: none !important; }
        .press-mark { position: absolute; background: #000; }
        .press-label { position: absolute; left: ${margin.x + bleed + 0.12}in; bottom: ${Math.min(0.12, margin.y / 2)}in;
          font: 500 6pt/1 "Figtree", sans-serif; color: #000; white-space: nowrap; }
      `
      const hair = '0.25pt'
      const mark = (parent, x, y, w, h) => {
        const m = document.createElement('div')
        m.className = 'press-mark'
        Object.assign(m.style, { left: `${x}in`, top: `${y}in`, width: w, height: h })
        parent.append(m)
      }
      sources.forEach((source, i) => {
        const p = document.createElement('section')
        p.className = 'press-page'
        for (let r = 0; r < rows; r += 1) {
          for (let c = 0; c < cols; c += 1) {
            const box = document.createElement('div')
            box.className = 'press-cell'
            Object.assign(box.style, { left: `${margin.x + c * cell.w}in`, top: `${margin.y + r * cell.h}in` })
            box.append(source.cloneNode(true))
            p.append(box)
          }
        }
        // Vertical marks above and below the grid at every trim line.
        const top = margin.y - gap - markLength
        const bottom = margin.y + rows * cell.h + gap
        for (let c = 0; c < cols; c += 1) {
          for (const x of [margin.x + c * cell.w + bleed, margin.x + c * cell.w + bleed + trim.w]) {
            mark(p, x, top, hair, `${markLength}in`)
            mark(p, x, bottom, hair, `${markLength}in`)
          }
        }
        // Horizontal marks left and right of the grid.
        const left = margin.x - gap - markLength
        const right = margin.x + cols * cell.w + gap
        for (let r = 0; r < rows; r += 1) {
          for (const y of [margin.y + r * cell.h + bleed, margin.y + r * cell.h + bleed + trim.h]) {
            mark(p, left, y, `${markLength}in`, hair)
            mark(p, right, y, `${markLength}in`, hair)
          }
        }
        const label = document.createElement('div')
        label.className = 'press-label'
        label.textContent = labels[i] ?? ''
        p.append(label)
        press.append(p)
      })
      document.body.replaceChildren(press)
      document.head.append(style)
    },
    { selector: o.selector, trim: o.trim, bleed: o.bleed, sheet, cols, rows, cell, margin, markLength, gap: MARK_GAP, labels: o.labels },
  )
  await o.ready(page)
  const pdf = await page.pdf({ preferCSSPageSize: true, printBackground: true })
  await ctx.close()
  return { pdf, sheet }
}

/** Page count, first MediaBox in inches, and whether any font is embedded as Type 3. */
export function inspectPdf(pdf) {
  const text = pdf.toString('latin1')
  const pages = (text.match(/\/Type\s*\/Page[^s]/g) ?? []).length
  const box = text.match(/\/MediaBox\s*\[\s*0\s+0\s+([\d.]+)\s+([\d.]+)\s*\]/)
  return {
    pages,
    w: box ? Number(box[1]) / 72 : NaN,
    h: box ? Number(box[2]) / 72 : NaN,
    type3: /\/Subtype\s*\/Type3/.test(text),
    figtree: /Figtree/.test(text),
  }
}

/** Throws unless the PDF has the expected pages and size, Figtree embedded, and no Type 3 fonts. */
export function assertPdf(label, pdf, { pages, w, h }) {
  const got = inspectPdf(pdf)
  if (got.pages !== pages) throw new Error(`${label}: expected ${pages} pages, got ${got.pages}`)
  if (Math.abs(got.w - w) > 0.01 || Math.abs(got.h - h) > 0.01) {
    throw new Error(`${label}: expected ${w} x ${h} in, got ${got.w} x ${got.h}`)
  }
  if (!got.figtree) throw new Error(`${label}: Figtree is not embedded`)
  if (got.type3) throw new Error(`${label}: has Type 3 fonts (a variable font slipped in); print RIPs reject these`)
  return got
}
