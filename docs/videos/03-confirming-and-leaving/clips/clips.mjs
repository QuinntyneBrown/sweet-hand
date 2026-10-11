// Screen recordings for video 03 (tools/video-record/record-clips.mjs), against
// the real launch stack: `node tools/video-record/launch-stack.mjs up`.
import { latestEmail, reset } from '../../../../tools/video-record/launch-stack.mjs';

const form = (app) => app.locator('#notify');
const toForm = (app) => app.evaluate(() => document.getElementById('notify').scrollIntoView({ block: 'start' }));
const toTop = (app) => app.evaluate(() => window.scrollTo(0, 0));

async function signUp(demo, address, roleName = 'Planning an event') {
  const app = demo.app();
  await form(app).getByRole('radio', { name: roleName }).check();
  await form(app).getByLabel('Email', { exact: true }).fill(address);
  await form(app).getByRole('checkbox', { name: 'Email me when Sweet Hand opens' }).check();
  await form(app).locator('button[type=submit]').click();
  await form(app).locator('.empty__title').waitFor();
}

/** The confirmation link this clip opens, shared with the next clip ("link-expired"). */
let usedConfirmation;

export default [
  {
    name: 'confirm',
    async run(demo) {
      await reset();
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      await signUp(demo, 'marcia.t@example.com', 'A caterer');
      demo.mark();
      await demo.pause(1500);
      usedConfirmation = await latestEmail('marcia.t@example.com');
      await demo.note('Marcia opens the confirmation email');
      await demo.showEmail(usedConfirmation);
      await demo.pause(3500);
      await demo.note('');
      await demo.openEmailLink('link');
      await form(app).getByRole('button', { name: 'Remove my email' }).waitFor();
      await demo.pause(3000);
    },
  },
  {
    name: 'link-expired',
    async run(demo) {
      await demo.go('/');
      demo.mark();
      await demo.note('The same link, opened a second time');
      await demo.pause(1000);
      await demo.go(new URL(usedConfirmation.link).pathname + new URL(usedConfirmation.link).search);
      await demo.app().locator('.alert').waitFor();
      await demo.pause(3500);
      await demo.note('');
    },
  },
  {
    name: 'remove-button',
    async run(demo) {
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      await signUp(demo, 'andre.p@example.com');
      const email = await latestEmail('andre.p@example.com');
      await demo.go(new URL(email.link).pathname + new URL(email.link).search);
      await form(app).getByRole('button', { name: 'Remove my email' }).waitFor();
      await toTop(app);
      demo.mark();
      await demo.pause(1500);
      await demo.click(form(app).getByRole('button', { name: 'Remove my email' }));
      await app.locator('.alert').waitFor();
      await toTop(app);
      await demo.pause(3500);
    },
  },
  {
    name: 'removal-link',
    async run(demo) {
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      await signUp(demo, 'keisha.b@example.com');
      const email = await latestEmail('keisha.b@example.com');
      await demo.go('/');
      demo.mark();
      await demo.note('Keisha uses the removal link in her email');
      await demo.showEmail(email);
      await demo.pause(3000);
      await demo.openEmailLink('remove');
      await app.locator('.alert').waitFor();
      await demo.pause(2500);
      await demo.note('Opened again: nothing left to name');
      await demo.go(new URL(email.removalLink).pathname + new URL(email.removalLink).search);
      await app.locator('.alert').waitFor();
      await demo.pause(3000);
      await demo.note('');
    },
  },
  {
    name: 'confirm-phone',
    phone: true,
    async run(demo) {
      await demo.go('/');
      const app = demo.app();
      await toForm(app);
      await signUp(demo, 'devon.r@example.com');
      const email = await latestEmail('devon.r@example.com');
      await demo.go('/');
      demo.mark();
      await demo.pause(800);
      await demo.showEmail(email);
      await demo.pause(2500);
      await demo.openEmailLink('link');
      await form(app).getByRole('button', { name: 'Remove my email' }).waitFor();
      await demo.pause(3000);
      await reset();
    },
  },
];
