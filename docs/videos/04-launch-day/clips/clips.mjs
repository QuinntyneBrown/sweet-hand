// Screen recordings for video 04 (tools/video-record/record-clips.mjs), against
// the real launch stack: `node tools/video-record/launch-stack.mjs up`.
// The setup runs the real launch-day command, `npm run launch-email`.
import { latestEmail, reset, runLaunchEmail } from '../../../../tools/video-record/launch-stack.mjs';

const form = (app) => app.locator('#notify');
const toForm = (app) => app.evaluate(() => document.getElementById('notify').scrollIntoView({ block: 'start' }));

/** Calls the API the way the page does, without recording it. */
const api = (app, path, body) =>
  app.evaluate(async ([path, body]) => {
    await fetch('/api/public/launch-list');
    const xsrf = /XSRF-TOKEN=([^;]+)/.exec(document.cookie)[1];
    const r = await fetch(path, { method: 'POST', headers: { 'content-type': 'application/json', 'x-xsrf-token': xsrf }, body: JSON.stringify(body) });
    return r.status;
  }, [path, body]);

const signUp = (app, email, role, businessName) =>
  api(app, '/api/launch-list/sign-ups', { role, email, ...(businessName ? { businessName } : {}), consent: true, challengeToken: 'local:launch-sign-up:demo' });

/** Emails captured by the first clip's setup, used by the later clips. */
let pending;
let caterer;
let customer;

export default [
  {
    name: 'sign-ups-closed',
    async run(demo) {
      await reset();
      await demo.go('/');
      const app = demo.app();
      await signUp(app, 'andre.p@example.com', 'customer');
      await signUp(app, 'marcia.t@example.com', 'caterer', 'Demerara Kitchen');
      await signUp(app, 'keisha.b@example.com', 'customer');
      for (const address of ['andre.p@example.com', 'marcia.t@example.com']) {
        const token = new URL((await latestEmail(address)).link).searchParams.get('confirmed');
        await api(app, '/api/launch-list/confirmations', { token });
      }
      pending = await latestEmail('keisha.b@example.com');
      const first = runLaunchEmail();
      caterer = await latestEmail('marcia.t@example.com', 'launch-day-caterer');
      customer = await latestEmail('andre.p@example.com', 'launch-day-customer');
      const second = runLaunchEmail();
      console.log(`\n  npm run launch-email: ${first}, then ${second}`);

      await demo.go('/');
      await toForm(app);
      demo.mark();
      await demo.note('After npm run launch-email: sign-ups are closed');
      await demo.pause(1000);
      await demo.click(form(app).getByRole('radio', { name: 'Planning an event' }));
      await demo.type(form(app).getByLabel('Email', { exact: true }), 'devon.r@example.com');
      await demo.click(form(app).getByRole('checkbox', { name: 'Email me when Sweet Hand opens' }));
      await demo.click(form(app).locator('button[type=submit]'));
      await form(app).getByRole('alert').waitFor();
      await demo.pause(2500);
    },
  },
  {
    name: 'confirmation-closed',
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.note('A pending address’s confirmation link');
      await demo.pause(1000);
      await demo.go(new URL(pending.link).pathname + new URL(pending.link).search);
      await demo.app().locator('.alert').waitFor();
      await demo.pause(3000);
    },
  },
  {
    name: 'launch-day-emails',
    tail: 1500,
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.note('The caterer’s launch-day email');
      await demo.showEmail(caterer);
      await demo.pause(4000);
      await demo.note('The customer’s launch-day email, and its removal link');
      await demo.showEmail(customer);
      await demo.pause(3500);
      await demo.openEmailLink('remove');
      await demo.app().locator('.alert').waitFor();
      await demo.pause(3000);
      await demo.note('');
    },
  },
];
