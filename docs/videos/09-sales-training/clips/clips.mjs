// Screen recordings for video 09 (tools/video-record/record-clips.mjs), against the
// product app and the backend in test mode, set up as in video 08:
//   node tools/video-record/record-clips.mjs docs/videos/09-sales-training --base http://localhost:4200 --show-host app.sweethand.ca
// Everyone on screen is fictional; the new caterer uses an .example address.
import { prepare, settle, signInAsBeverley, smoothScroll } from '../../08-pitch-for-caterers/clips/clips.mjs';

export default [
  {
    name: 'register',
    phone: true,
    async run(demo) {
      await prepare(demo);
      await demo.go('/join', { ready: false });
      const app = demo.app();
      await app.getByLabel('Business name').waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(1000);
      const fill = async (label, text) => {
        const field = app.getByLabel(label, { exact: true });
        await demo.click(field);
        await field.pressSequentially(text, { delay: 30 });
      };
      await fill('Business name', 'Mango Chow Kitchen');
      await fill('Your name', 'Andrea Joseph');
      await fill('Email', 'andrea@mangochow.example');
      await fill('Phone', '416 555 0123');
      await fill('Password', 'tamarind-balls-2026'); // gitleaks:allow: a fictional password, typed only into a throwaway test environment
      await demo.click(app.getByRole('checkbox', { name: 'I sell Caribbean food in Toronto or the GTA' }));
      await demo.click(app.getByRole('checkbox', { name: /I accept the caterer terms/ }));
      await demo.pause(600);
      await demo.click(app.getByRole('button', { name: 'Create caterer account' }));
      await app.getByRole('heading', { name: /Welcome, Andrea/ }).waitFor();
      await settle(app);
      await demo.pause(3200);
    },
  },
  {
    name: 'menu-editor',
    async run(demo) {
      await signInAsBeverley(demo, await prepare(demo));
      await demo.go('/dashboard/profile/menu', { ready: false });
      const app = demo.app();
      await app.getByRole('heading', { name: 'Menu', level: 1 }).waitFor();
      await settle(app);
      demo.mark();
      await demo.pause(1400);
      await demo.click(app.getByRole('button', { name: 'Add dish' }));
      const dialog = app.getByRole('dialog');
      await dialog.getByLabel('Dish name').pressSequentially('Ackee and saltfish', { delay: 35 });
      await demo.click(dialog.getByLabel('Description'));
      await dialog.getByLabel('Description').pressSequentially('With fried dumplings and callaloo.', { delay: 25 });
      await demo.click(dialog.getByRole('checkbox', { name: 'Dairy-free' }));
      await demo.click(dialog.getByRole('checkbox', { name: 'Gluten-free' }));
      await demo.click(dialog.getByLabel('Price guidance'));
      await dialog.getByLabel('Price guidance').pressSequentially('From $16 per person', { delay: 30 });
      await demo.pause(500);
      await demo.click(dialog.getByRole('button', { name: 'Add dish' }));
      await dialog.waitFor({ state: 'hidden' });
      await settle(app);
      await smoothScroll(app, 2000);
      await demo.pause(2600);
    },
  },
];
