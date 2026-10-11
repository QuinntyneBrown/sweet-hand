import { test, expect } from '../../support/test';
import { SignInPage } from '../../pages/sign-in.page';
import { TwoFactorPage } from '../../pages/two-factor.page';
import { ListingPage } from '../../pages/listing.page';
import { cast, OPERATOR_CODE, SEED_PASSWORD } from '../../support/cast';
import { operatorCodeAt } from '../../support/operator-code';

test.describe('Session timeouts', () => {
  test('L2-078.3: an operator idle for 30 minutes is signed out, told why, and returns to the page after signing in again', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await page.goto('/admin/queue');
    const signIn = new SignInPage(page);
    await expect(signIn.header.accountButton).toBeVisible();

    await backend.setNow('2026-10-10T14:31:00Z');
    await page.clock.runFor(60_000);

    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fadmin%2Fqueue$/);
    await expect(signIn.alert).toHaveAttribute('role', 'status');
    await expect(signIn.alertTitle).toHaveText('You were signed out');
    await expect(signIn.alert).toContainText('Operator sessions end after 30 minutes without activity. Sign in again to pick up where you left off.');
    await expect(signIn.subtitle).toHaveCount(0);
    await expect(signIn.email).toHaveValue(cast.leah.email);
    await expect(signIn.header.nav).toHaveCount(0);
    await expect(signIn.link('Browse caterers')).toHaveAttribute('href', '/caterers');
    await signIn.expectNoAccessibilityViolations();

    await signIn.password.fill(SEED_PASSWORD);
    await signIn.submit.click();
    // The authenticator's code changes with the clock, which is now 31 minutes on.
    await new TwoFactorPage(page).enter(operatorCodeAt('2026-10-10T14:31:00Z'));
    await expect(page).toHaveURL(/\/admin\/queue$/);
  });

  test('L2-078.3: opening an operator page after 30 idle minutes asks the operator to sign in again', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await page.goto('/admin/queue');
    await expect(new SignInPage(page).header.accountButton).toBeVisible();
    await backend.setNow('2026-10-10T14:45:00Z');

    await page.goto('/admin/caterers');

    const signIn = new SignInPage(page);
    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fadmin%2Fcaterers$/);
    await expect(signIn.alertTitle).toHaveText('You were signed out');
  });

  test('L2-078: a customer is not signed out after a few idle hours', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.header.accountButton).toBeVisible();

    await backend.setNow('2026-10-10T17:00:00Z');
    await page.clock.runFor(60_000);

    await expect(listing.header.accountButton).toBeVisible();
    await expect(page).toHaveURL(/\/caterers$/);
  });
});
