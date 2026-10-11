// Screen recordings for video 01 (tools/video-record/record-clips.mjs), against
// the real launch stack: `node tools/video-record/launch-stack.mjs up`.
import { reset } from '../../../../tools/video-record/launch-stack.mjs';

const form = (app) => app.locator('#notify');
const smoothScroll = (app, y) => app.evaluate((y) => window.scrollTo({ top: y, behavior: 'smooth' }), y);

export default [
  {
    name: 'page-tour',
    async run(demo) {
      await reset();
      await demo.go('/');
      demo.mark();
      await demo.pause(2200);
      const app = demo.app();
      for (const y of [420, 900, 1500, 2400]) {
        await smoothScroll(app, y);
        await demo.pause(2000);
      }
      await smoothScroll(app, 0);
      await demo.pause(1500);
    },
  },
  {
    name: 'go-to-form',
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.pause(800);
      const app = demo.app();
      await demo.note('Header button');
      await demo.click(app.locator('header').getByRole('link', { name: 'Get the launch email' }));
      await demo.pause(1500);
      await demo.note('Planning an event, email typed');
      await demo.click(form(app).getByRole('radio', { name: 'Planning an event' }));
      await demo.type(form(app).getByLabel('Email', { exact: true }), 'marcia.t@example.com');
      await demo.note('"Join as a caterer" keeps the email');
      await demo.click(app.getByRole('link', { name: 'Join as a caterer' }));
      await demo.pause(2600);
      await demo.note('');
    },
  },
  {
    name: 'keyboard',
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.pause(800);
      await demo.press('Tab');
      await demo.pause(700);
      await demo.press('Enter');
      await demo.press('Tab');
      await demo.press('Tab');
      await demo.pause(400);
      const app = demo.app();
      await form(app).getByRole('radio', { name: 'Planning an event' }).focus();
      await demo.press('Space');
      await demo.press('ArrowRight', '→');
      await demo.press('ArrowLeft', '←');
      await demo.press('Tab');
      await demo.pause(800);
    },
  },
  {
    name: 'phone-dark',
    phone: true,
    colorScheme: 'dark',
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.pause(1800);
      const app = demo.app();
      for (const y of [500, 1100, 1700]) {
        await smoothScroll(app, y);
        await demo.pause(1800);
      }
      await smoothScroll(app, 0);
      await demo.pause(1000);
    },
  },
  {
    name: 'no-javascript',
    javaScript: false,
    async run(demo) {
      await demo.go('/', { ready: false });
      demo.mark();
      await demo.note('JavaScript turned off');
      await demo.pause(2000);
      await smoothScroll(demo.app(), 700);
      await demo.pause(2000);
    },
  },
  {
    name: 'privacy',
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.pause(600);
      const app = demo.app();
      await demo.click(app.getByRole('contentinfo').getByRole('link', { name: 'Privacy' }));
      await app.locator('html[data-ready]').waitFor({ state: 'attached' });
      await demo.pause(2000);
      for (const y of [500, 1100]) {
        await smoothScroll(app, y);
        await demo.pause(2200);
      }
    },
  },
];
