// Screen recordings for video 08 (tools/video-record/record-clips.mjs), also used by video 09.
// They run against the product app with the seeded fictional cast, the backend in
// test mode (ADR 0009), as the e2e suite runs them:
//   (cd backend && PORT=4300 TEST_CONTROL=1 npm start &)
//   (cd frontend && E2E_API_PORT=4300 npx ng serve sweet-hand --port 4200 &)
//   node tools/video-record/record-clips.mjs docs/videos/08-pitch-for-caterers --base http://localhost:4200 --show-host app.sweethand.ca
// Each clip resets the backend's default test environment first. No cast caterer
// lists jerk chicken, so prepare() adds it to Auntie Bev's Kitchen (the 'beverley'
// scenario, Jamaican) through the menu editor, as the caterer would.

const API = process.env.DEMO_API_URL ?? 'http://localhost:4300';
const BEV = 'beverley@auntiebevs.example';

async function control(route, data = {}) {
  const res = await fetch(`${API}/__test${route}`, { method: 'POST', headers: { 'content-type': 'application/json' }, body: JSON.stringify(data) });
  if (!res.ok) throw new Error(`${route}: ${res.status} ${await res.text()}`);
  return res.status === 204 ? undefined : res.json();
}

/** Fonts, network and every image already in the page decoded, so a clip never opens on empty photo circles. */
export const settle = (app) =>
  app
    .evaluate(() => document.fonts.ready)
    .then(() => app.waitForLoadState('networkidle'))
    .then(() => app.evaluate(() => Promise.race([Promise.all([...document.images].map((i) => i.decode().catch(() => null))), new Promise((r) => setTimeout(r, 4000))])));
export const smoothScroll = (app, y) => app.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);
export const scrollToHeading = (app, name, offset = 120) =>
  app.getByRole('heading', { name, level: 2 }).evaluate((h, offset) => window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - offset, behavior: 'smooth' }), offset);

/** Fresh cast, Beverley's published page, and jerk chicken at the top of her menu. Returns her session cookie. */
export async function prepare(demo) {
  await control('/reset');
  // The moderation cast holds a pending "Auntie Bev's Kitchen" on the same slug; move it aside.
  await control('/scenario', { name: 'rename-caterer', args: { slug: 'auntie-bevs-kitchen', name: 'Auntie Bev’s Kitchen (pending)' } });
  await control('/scenario', { name: 'beverley', args: { state: 'published' } });
  const { cookie } = await control('/sign-in', { email: BEV });
  const ctx = await demo.page.context().browser().newContext({ viewport: { width: 1280, height: 900 } });
  await ctx.addCookies([{ name: 'sh_session', value: cookie, url: demo.base, httpOnly: true, sameSite: 'Lax' }]);
  const page = await ctx.newPage();
  await page.goto(new URL('/dashboard/profile/menu', demo.base).href);
  await page.getByRole('button', { name: 'Add dish' }).click();
  const dialog = page.getByRole('dialog');
  await dialog.getByLabel('Dish name').fill('Jerk chicken');
  await dialog.getByLabel('Description').fill('Marinated overnight in scallion, thyme, pimento and scotch bonnet, then smoked over pimento wood.');
  await dialog.getByRole('checkbox', { name: 'Gluten-free' }).check();
  await dialog.getByRole('checkbox', { name: 'Spicy' }).check();
  await dialog.getByLabel('Price guidance').fill('From $17 per person');
  await dialog.getByRole('button', { name: 'Add dish' }).click();
  await dialog.waitFor({ state: 'hidden' });
  for (let i = 0; i < 5; i += 1) {
    const up = page.getByRole('button', { name: /Move Jerk chicken up/ });
    if (!(await up.count()) || (await up.isDisabled())) break;
    await up.click();
    await page.waitForLoadState('networkidle');
  }
  await ctx.close();
  return cookie;
}

/** Signs the clip's own browser in as Beverley. */
export async function signInAsBeverley(demo, cookie) {
  await demo.page.context().addCookies([{ name: 'sh_session', value: cookie, url: demo.base, httpOnly: true, sameSite: 'Lax' }]);
}

export default [
  {
    name: 'browse',
    async run(demo) {
      await prepare(demo);
      await demo.go('/caterers', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { name: 'Caterers', level: 1 }).waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(1800);
      await demo.click(app.locator('aside.browse__aside').getByText('Jamaican').first());
      await settle(app);
      await demo.pause(1800);
      await smoothScroll(app, 420);
      await demo.pause(3000);
      await smoothScroll(app, 900);
      await demo.pause(3000);
      await smoothScroll(app, 0);
      await demo.pause(2600);
    },
  },
  {
    name: 'caterer-page',
    async run(demo) {
      await prepare(demo);
      await demo.go('/caterers/auntie-bevs-kitchen', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { name: 'Auntie Bev’s Kitchen', level: 1 }).waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(2600);
      await scrollToHeading(app, 'Menu');
      await demo.pause(1200);
      await demo.moveTo(app.getByText('Jerk chicken', { exact: true }).first());
      await demo.pause(2800);
      await scrollToHeading(app, 'Areas served', 260);
      await demo.pause(3000);
    },
  },
  {
    name: 'join',
    phone: true,
    async run(demo) {
      await prepare(demo);
      await demo.go('/join', { ready: false });
      const app = demo.app();
      await app.getByLabel('Business name').waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(1200);
      await demo.click(app.getByLabel('Business name'));
      await app.getByLabel('Business name').pressSequentially('Mango Chow Kitchen', { delay: 35 });
      await demo.click(app.getByLabel('Your name'));
      await app.getByLabel('Your name').pressSequentially('Andrea Joseph', { delay: 35 });
      await demo.pause(1600);
    },
  },
];
