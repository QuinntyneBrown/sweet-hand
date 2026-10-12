// Screen recordings for video 05 (tools/video-record/record-clips.mjs).
// The launch clips run against the real launch stack (`node tools/video-record/launch-stack.mjs up`,
// default base http://localhost:4201). The product preview clips run against the
// product app with the seeded fictional cast: `--base http://localhost:4200 --only caterer-page`
// and `--only browse` (ng serve sweet-hand, its API on the same database).
import { latestEmail, reset } from '../../../../tools/video-record/launch-stack.mjs';

const form = (app) => app.locator('#notify');
const smoothScroll = (app, y) => app.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);
const settle = (app) => app.evaluate(() => document.fonts.ready).then(() => app.waitForLoadState('networkidle'));

export default [
  {
    name: 'launch-page',
    async run(demo) {
      await reset();
      await demo.go('/');
      demo.mark();
      await demo.pause(3200);
      const app = demo.app();
      await smoothScroll(app, 520);
      await demo.pause(3000);
      await smoothScroll(app, 0);
      await demo.pause(2500);
    },
  },
  {
    name: 'caterer-page',
    async run(demo) {
      await demo.go('/caterers/pelau-house', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { name: 'Pelau House', level: 1 }).waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(2600);
      for (const y of [520, 1020]) {
        await smoothScroll(app, y);
        await demo.pause(2400);
      }
      await app.getByRole('heading', { name: 'Areas served' }).evaluate((h) => window.scrollTo({ top: h.getBoundingClientRect().top + window.scrollY - 220, behavior: 'smooth' }));
      await demo.pause(3200);
    },
  },
  {
    name: 'browse',
    async run(demo) {
      await demo.go('/caterers', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { name: 'Caterers', level: 1 }).waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(1600);
      await demo.click(app.locator('aside.browse__aside').getByText('Trinidadian & Tobagonian').first());
      await settle(app);
      await demo.pause(1600);
      await demo.click(app.getByRole('link', { name: /Pelau House/ }).first());
      await app.getByRole('heading', { name: 'Pelau House', level: 1 }).waitFor();
      await settle(app);
      await demo.pause(1200);
      await demo.moveTo(app.getByRole('button', { name: 'Send an enquiry' }).or(app.getByRole('link', { name: 'Send an enquiry' })).first());
      await demo.pause(2200);
    },
  },
  {
    name: 'join',
    async run(demo) {
      await reset();
      await demo.go('/');
      demo.mark();
      await demo.pause(300);
      const app = demo.app();
      await demo.click(app.getByRole('link', { name: 'Join as a caterer' }));
      await demo.pause(400);
      await demo.click(form(app).getByLabel('Business name (optional)'));
      await form(app).getByLabel('Business name (optional)').pressSequentially('Coal Pot Kitchen', { delay: 30 });
      await demo.click(form(app).getByLabel('Email', { exact: true }));
      await form(app).getByLabel('Email', { exact: true }).pressSequentially('winston@coalpot.example', { delay: 30 });
      await demo.click(form(app).getByRole('checkbox', { name: 'Email me when Sweet Hand opens' }));
      await demo.click(form(app).locator('button[type=submit]'));
      await form(app).getByRole('heading', { name: 'Check your email' }).waitFor();
      await demo.pause(1400);
      const confirm = await latestEmail('winston@coalpot.example');
      const link = new URL(confirm.link);
      await demo.go(link.pathname + link.search + link.hash);
      await form(app).getByRole('heading', { name: 'You’re on the list' }).waitFor();
      await app.evaluate(() => document.getElementById('notify').scrollIntoView({ block: 'center' }));
      await demo.pause(2000);
    },
  },
];
