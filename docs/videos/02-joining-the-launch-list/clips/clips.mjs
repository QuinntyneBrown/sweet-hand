// Screen recordings for video 02 (tools/video-record/record-clips.mjs), against
// the real launch stack: `node tools/video-record/launch-stack.mjs up`.
import { apiStart, apiStop, latestEmail, reset } from '../../../../tools/video-record/launch-stack.mjs';

const form = (app) => app.locator('#notify');
const email = (app) => form(app).getByLabel('Email', { exact: true });
const role = (app, name) => form(app).getByRole('radio', { name });
const consent = (app) => form(app).getByRole('checkbox', { name: 'Email me when Sweet Hand opens' });
const submit = (app) => form(app).locator('button[type=submit]');
const toForm = (app) => app.evaluate(() => document.getElementById('notify').scrollIntoView({ block: 'start' }));

/** Signs up through the API, the way the page does, without recording it. */
async function signUpQuietly(app, address, roleName = 'customer') {
  return app.evaluate(async ([address, roleName]) => {
    await fetch('/api/public/launch-list');
    const xsrf = /XSRF-TOKEN=([^;]+)/.exec(document.cookie)[1];
    const r = await fetch('/api/launch-list/sign-ups', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-xsrf-token': xsrf },
      body: JSON.stringify({ role: roleName, email: address, consent: true, challengeToken: 'local:launch-sign-up:demo' }),
    });
    return r.status;
  }, [address, roleName]);
}

export default [
  {
    name: 'fields',
    async run(demo) {
      await reset();
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      demo.mark();
      await demo.pause(1200);
      await demo.click(role(app, 'A caterer'));
      await demo.pause(800);
      await demo.note('Business name: at most 60 characters');
      const name = form(app).getByLabel('Business name (optional)');
      await demo.click(name);
      await name.pressSequentially('Demerara Kitchen and Catering for Weddings, Christenings and Every Family Fete', { delay: 25 });
      await demo.pause(1400);
      await demo.note('Planning an event hides it');
      await demo.click(role(app, 'Planning an event'));
      await demo.pause(1600);
      await demo.note('');
    },
  },
  {
    name: 'invalid',
    async run(demo) {
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      demo.mark();
      await demo.pause(800);
      await demo.type(email(app), 'marcia.t@example');
      await demo.click(submit(app));
      await demo.pause(2600);
      await demo.click(form(app).locator('.form-summary').getByRole('link', { name: 'Enter an email like name@example.com' }));
      await demo.pause(600);
      await email(app).press('End');
      await email(app).pressSequentially('.com', { delay: 90 });
      await demo.pause(1800);
      await demo.click(form(app).locator('.form-summary').getByRole('link', { name: 'Choose one' }));
      await demo.pause(1200);
    },
  },
  {
    name: 'success',
    async run(demo) {
      await reset();
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      demo.mark();
      await demo.pause(800);
      await demo.click(role(app, 'A caterer'));
      await demo.type(form(app).getByLabel('Business name (optional)'), 'Demerara Kitchen');
      await demo.type(email(app), 'marcia.t@example.com');
      await demo.click(consent(app));
      await demo.click(submit(app));
      await demo.pause(3200);
      await demo.click(form(app).getByRole('link', { name: 'Use a different address' }));
      await demo.pause(2200);
    },
  },
  {
    name: 'failure',
    tail: 2000,
    async run(demo) {
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      await role(app, 'Planning an event').check();
      await email(app).fill('andre.p@example.com');
      await consent(app).check();
      await apiStop();
      demo.mark();
      await demo.note('The API is stopped');
      await demo.pause(1500);
      await demo.click(submit(app));
      await form(app).getByRole('alert').waitFor();
      await demo.pause(3000);
      await apiStart();
      await demo.note('The API is back');
      await demo.pause(1200);
      await demo.click(submit(app));
      await form(app).locator('.empty__title').waitFor();
      await demo.note('');
      await demo.pause(1500);
    },
  },
  {
    name: 'already-listed',
    async run(demo) {
      await reset();
      await demo.go('/');
      const app = demo.app();
      // keisha.b@example.com is already confirmed before the clip starts.
      await signUpQuietly(app, 'keisha.b@example.com');
      const confirm = await latestEmail('keisha.b@example.com');
      await demo.go(new URL(confirm.link).pathname + new URL(confirm.link).search);
      await form(app).getByRole('button', { name: 'Remove my email' }).waitFor();
      await demo.go('/');
      await toForm(app);
      demo.mark();
      await demo.note('keisha.b@example.com is already confirmed');
      await demo.pause(1200);
      await demo.click(role(app, 'Planning an event'));
      await demo.type(email(app), 'keisha.b@example.com');
      await demo.click(consent(app));
      await demo.click(submit(app));
      await form(app).locator('.empty__title').waitFor();
      await demo.pause(1500);
      await demo.note('The email says what the page cannot');
      await demo.showEmail(await latestEmail('keisha.b@example.com', 'launch-already-listed'));
      await demo.pause(3500);
    },
  },
  {
    name: 'rate-limited',
    async run(demo) {
      await reset();
      await demo.go('/');
      const app = demo.app();
      for (let i = 1; i <= 10; i++) await signUpQuietly(app, `guest${i}@example.com`);
      await toForm(app);
      demo.mark();
      await demo.note('10 sign-ups from this address in the last hour');
      await demo.pause(1200);
      await demo.click(role(app, 'Planning an event'));
      await demo.type(email(app), 'devon.r@example.com');
      await demo.click(consent(app));
      await demo.click(submit(app));
      await form(app).getByRole('alert').waitFor();
      await demo.pause(3000);
      await reset();
    },
  },
];
