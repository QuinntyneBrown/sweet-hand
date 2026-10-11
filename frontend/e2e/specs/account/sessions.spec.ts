import { devices } from '@playwright/test';
import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { SignInPage } from '../../pages/sign-in.page';
import { cast, SEED_PASSWORD } from '../../support/cast';
import { WEB_URL } from '../../support/ports';
import { SESSION_HEADER } from '../../support/backend';

test.describe('Signed-in devices', () => {
  test('L2-078.5 list CRD AC-2: each other device has a "Sign out" that names it and opens a confirmation', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();

    await expect(account.signOutDevice('Safari on iPhone')).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(account.signOutDevice('Samsung Internet on Android')).toBeVisible();
    await expect(account.device('Chrome on Windows').getByRole('button')).toHaveCount(0);

    await account.signOutDevice('Safari on iPhone').click();

    const dialog = account.endSession('Safari on iPhone');
    await expect(dialog.root).toBeVisible();
    await expect(dialog.description).toHaveText('Anyone using Sweet Hand on that device will need to sign in again.');
    await expect(dialog.detail('Device')).toHaveText('Safari on iPhone');
    await expect(dialog.detail('Last active')).toHaveText('Today, 8:15 a.m.');
    await expect(dialog.button('Sign out device')).toBeFocused();
    await account.expectNoAccessibilityViolations();

    await dialog.cancel.click();
    await expect(dialog.root).toHaveCount(0);
    await expect(account.signOutDevice('Safari on iPhone')).toBeFocused();
  });

  test('L2-078.5: signing out a device removes it from the list and a toast confirms', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.hold('DELETE /api/me/sessions/*');
    const account = new AccountPage(page);
    await account.open();
    await account.signOutDevice('Safari on iPhone').click();
    const dialog = account.endSession('Safari on iPhone');

    await dialog.button('Sign out device').click();

    await expect(dialog.button('Sign out device')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Signing out Safari on iPhone');
    await backend.release();
    await expect(dialog.root).toHaveCount(0);
    await expect(account.deviceTitles).toHaveText(['Chrome on Windows', 'Samsung Internet on Android']);
    await expect(account.toast).toContainText('Device signed out');
    await expect(account.toast).toContainText('Safari on iPhone is signed out of Sweet Hand.');
    await expect(account.signOutDevice('Samsung Internet on Android')).toBeFocused();
  });

  test('when signing out a device fails, it stays signed in and the person can try again', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.fail('DELETE /api/me/sessions/*', { status: 500, times: 1 });
    const account = new AccountPage(page);
    await account.open();
    await account.signOutDevice('Safari on iPhone').click();
    const dialog = account.endSession('Safari on iPhone');

    await dialog.button('Sign out device').click();

    await expect(dialog.alert).toContainText('That device is still signed in');
    await account.expectNoAccessibilityViolations();
    await dialog.button('Sign out device').click();
    await expect(dialog.root).toHaveCount(0);
  });

  test('L2-078.4: a device signed out from the account page can no longer use its old session', async ({ page, backend, browser }) => {
    const phone = await browser.newContext({ ...devices['Desktop Chrome'], baseURL: WEB_URL, extraHTTPHeaders: { [SESSION_HEADER]: backend.session } });
    const otherPage = await phone.newPage();
    const otherSignIn = new SignInPage(otherPage);
    await otherSignIn.open();
    await otherSignIn.signIn(cast.marcia.email, SEED_PASSWORD);
    await expect(otherPage).toHaveURL(/\/inbox$/);
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();
    await expect(account.deviceTitles).toHaveText(['Chrome on Windows', 'Chrome on Windows', 'Safari on iPhone', 'Samsung Internet on Android']);

    await account.signOutDevice('Chrome on Windows').click();
    await account.endSession('Chrome on Windows').button('Sign out device').click();

    await expect(account.deviceRows).toHaveCount(3);
    await otherPage.goto('/account');
    await expect(otherPage).toHaveURL(/\/sign-in\?returnUrl=%2Faccount$/);
    await phone.close();
  });
});
