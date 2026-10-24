/**
 * Screenshots of the product app for the caterer sales kit, at phone (390 px)
 * and desktop (1440 px) widths, light theme, with the fictional seeded cast only.
 *
 *   # the backend in test mode and the product app (as the e2e suite runs them)
 *   (cd backend && PORT=4300 TEST_CONTROL=1 npm start &)
 *   (cd frontend && E2E_API_PORT=4300 npx ng serve sweet-hand --port 4200 &)
 *   node docs/marketing/sales-kit/screenshots/capture.mjs [--base http://localhost:4200] [--only register-caterer]
 *
 * Every run uses its own test-mode environment (x-test-session), seeded with
 * the cast and the mocks' clock (Sat 10 Oct 2026). No cast caterer lists jerk
 * chicken, so the run signs in as Beverley Campbell (Auntie Bev's Kitchen,
 * Jamaican, the 'beverley' scenario) and adds it through the menu editor, the
 * way a caterer would. Nothing is written to a real database.
 *
 * Writes <name>-phone.png (780 x 1688, 2x) and <name>-desktop.png (1440 wide)
 * beside this file; the two caterer pages are full length on desktop.
 */
import { createRequire } from 'node:module'
import { fileURLToPath, pathToFileURL } from 'node:url'
import path from 'node:path'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..', '..', '..')
const moduleRoot = process.env.SWEET_HAND_MODULE_ROOT ?? path.join(repoRoot, 'frontend')
const require = createRequire(pathToFileURL(path.join(moduleRoot, 'package.json')))
const { chromium, request } = require('@playwright/test')

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`)
  return i === -1 ? fallback : process.argv[i + 1]
}
const BASE = arg('base', 'http://localhost:4200')
const API = arg('api', 'http://localhost:4300')
const ONLY = arg('only', null)
const SESSION = `sales-kit-${Date.now()}`
const TODAY = new Date('2026-10-10T10:00:00-04:00')
const WIDTHS = { phone: { width: 390, height: 844 }, desktop: { width: 1440, height: 900 } }

const api = await request.newContext({ baseURL: API, extraHTTPHeaders: { 'x-test-session': SESSION } })
const control = async (route, data) => {
  const res = await api.post(`/__test${route}`, { data })
  if (!res.ok()) throw new Error(`${route}: ${res.status()} ${await res.text()}`)
  return res.status() === 204 ? undefined : res.json()
}

await control('/reset')
// The seed's moderation cast already holds a pending "Auntie Bev's Kitchen" with the same slug;
// rename that one first so the published page of the 'beverley' scenario resolves.
await control('/scenario', { name: 'rename-caterer', args: { slug: 'auntie-bevs-kitchen', name: 'Auntie Bev’s Kitchen (pending)' } })
await control('/scenario', { name: 'beverley', args: { state: 'published' } })
const { cookie } = await control('/sign-in', { email: 'beverley@auntiebevs.example' })

const browser = await chromium.launch()

async function open(width, { signedIn = false } = {}) {
  const ctx = await browser.newContext({
    viewport: WIDTHS[width],
    deviceScaleFactor: width === 'phone' ? 2 : 1,
    colorScheme: 'light',
    reducedMotion: 'reduce',
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
    extraHTTPHeaders: { 'x-test-session': SESSION },
  })
  if (signedIn) await ctx.addCookies([{ name: 'sh_session', value: cookie, url: BASE, httpOnly: true, sameSite: 'Lax' }])
  const page = await ctx.newPage()
  await page.clock.install({ time: TODAY })
  return page
}

async function settle(page) {
  await page.waitForLoadState('networkidle')
  await page.evaluate(() => document.fonts.ready)
  // Lazy images below the fold load once scrolled to.
  await page.evaluate(async () => {
    for (let y = 0; y < document.body.scrollHeight; y += 600) {
      window.scrollTo(0, y)
      await new Promise((r) => setTimeout(r, 60))
    }
    window.scrollTo(0, 0)
  })
  await page.waitForLoadState('networkidle')
  await page.evaluate(() =>
    Promise.race([
      Promise.all([...document.images].map((i) => (i.complete ? null : i.decode().catch(() => null)))),
      new Promise((r) => setTimeout(r, 4000)),
    ]),
  )
}

/** Adds jerk chicken to Auntie Bev's menu through the menu editor. */
async function addJerkChicken() {
  const page = await open('desktop', { signedIn: true })
  await page.goto(`${BASE}/dashboard/profile/menu`)
  await page.getByRole('heading', { name: 'Menu', level: 1 }).waitFor()
  await page.getByRole('button', { name: 'Add dish' }).click()
  const dialog = page.getByRole('dialog')
  await dialog.getByLabel('Dish name').fill('Jerk chicken')
  await dialog.getByLabel('Description').fill('Marinated overnight in scallion, thyme, pimento and scotch bonnet, then smoked over pimento wood.')
  await dialog.getByRole('checkbox', { name: 'Gluten-free' }).check()
  await dialog.getByRole('checkbox', { name: 'Spicy' }).check()
  await dialog.getByLabel('Price guidance').fill('From $17 per person')
  await dialog.getByRole('button', { name: 'Add dish' }).click()
  await dialog.waitFor({ state: 'hidden' })
  // Move it to the top of the menu, where people see it first.
  for (let i = 0; i < 5; i += 1) {
    const up = page.getByRole('button', { name: /Move Jerk chicken up/ })
    if (!(await up.count()) || (await up.isDisabled())) break
    await up.click()
    await page.waitForLoadState('networkidle')
  }
  await page.context().close()
}

const SHOTS = [
  { name: 'caterers-listing', path: '/caterers', heading: 'Caterers' },
  { name: 'caterer-profile', path: '/caterers/pelau-house', heading: 'Pelau House', fullPage: true },
  { name: 'caterer-profile-menu', path: '/caterers/pelau-house', heading: 'Pelau House', scrollTo: 'Menu' },
  { name: 'caterer-profile-jerk', path: '/caterers/auntie-bevs-kitchen', heading: 'Auntie Bev’s Kitchen', fullPage: true },
  { name: 'register-caterer', path: '/join', heading: null },
  { name: 'dashboard', path: '/dashboard', heading: null, signedIn: true },
  { name: 'profile-menu', path: '/dashboard/profile/menu', heading: 'Menu', signedIn: true },
  { name: 'profile-photos', path: '/dashboard/profile/photos', heading: 'Photos', signedIn: true },
  { name: 'profile-cuisines', path: '/dashboard/profile/cuisines', heading: null, signedIn: true },
]

/** Text no screenshot may show: e-mail addresses, phone numbers and street addresses. */
const PRIVATE = [/[\w.+-]+@[\w-]+\.[\w.]+/, /\+?1?[ (]*\d{3}[) ]*\d{3}[ -]\d{4}/, /\b\d{1,5} [A-Z][a-z]+ (Street|St\.|Avenue|Ave\.|Road|Rd\.|Drive|Dr\.|Crescent|Cres\.)\b/]

try {
  await addJerkChicken()
  for (const shot of SHOTS.filter((s) => !ONLY || s.name === ONLY)) {
    for (const width of Object.keys(WIDTHS)) {
      const page = await open(width, { signedIn: shot.signedIn })
      await page.goto(`${BASE}${shot.path}`)
      if (shot.heading) await page.getByRole('heading', { name: shot.heading, level: 1 }).waitFor()
      else await page.locator('h1').first().waitFor()
      await settle(page)
      const text = await page.evaluate(() => document.body.innerText)
      for (const pattern of PRIVATE) {
        const hit = text.match(pattern)
        if (hit) throw new Error(`${shot.name} (${width}) shows private-looking text: "${hit[0]}"`)
      }
      // A focused field draws its focus ring; screenshots show the page at rest.
      await page.evaluate(() => document.activeElement instanceof HTMLElement && document.activeElement.blur())
      if (shot.scrollTo) await page.getByRole('heading', { name: shot.scrollTo, level: 2 }).evaluate((h) => window.scrollTo(0, h.getBoundingClientRect().top + window.scrollY - 88))
      const out = path.join(here, `${shot.name}-${width}.png`)
      // Long pages are full length on desktop only; on a phone the first screen is what people see.
      await page.screenshot({ path: out, fullPage: !!shot.fullPage && width === 'desktop', animations: 'disabled' })
      console.log(`✓ ${path.basename(out)}`)
      await page.context().close()
    }
  }
} finally {
  await browser.close()
  await api.dispose()
}
