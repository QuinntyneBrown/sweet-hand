import { test, expect } from '../../support/test';
import { DashboardPage } from '../../pages/dashboard.page';
import { InboxPage } from '../../pages/inbox.page';
import { OperatorConsolePage } from '../../pages/operator-console.page';
import { RegisterCatererPage } from '../../pages/register-caterer.page';
import { SignInPage } from '../../pages/sign-in.page';
import { SystemPage } from '../../pages/system.page';

test.describe('Document titles', () => {
  test('a visitor’s pages are titled with the page name, then Sweet Hand', async ({ page }) => {
    await new SignInPage(page).open();
    await expect(page).toHaveTitle('Sign in · Sweet Hand');

    await new SystemPage(page).open('/no-such-page');
    await expect(page).toHaveTitle('Page not found · Sweet Hand');
  });

  test('the caterer sign-up page already names Sweet Hand, so its title has no suffix', async ({ page }) => {
    await new RegisterCatererPage(page).open();

    await expect(page).toHaveTitle('Cater with Sweet Hand');
  });

  test('each role’s landing page is titled for that role', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await new InboxPage(page).open();
    await expect(page).toHaveTitle('Inbox · Sweet Hand');

    await backend.signInAs('kendra');
    await new DashboardPage(page).open();
    await expect(page).toHaveTitle('Dashboard · Sweet Hand');

    await backend.signInAs('leah');
    await new OperatorConsolePage(page).open('/admin');
    await expect(page).toHaveTitle('Review queue · Sweet Hand');
  });
});
