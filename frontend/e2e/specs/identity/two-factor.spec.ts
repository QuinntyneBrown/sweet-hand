import { test, expect } from '../../support/test';
import type { Page } from '@playwright/test';
import { SignInPage } from '../../pages/sign-in.page';
import { TwoFactorPage } from '../../pages/two-factor.page';
import { cast, OPERATOR_CODE, SEED_PASSWORD } from '../../support/cast';

async function signInAsLeah(page: Page, query = '') {
  const signIn = new SignInPage(page);
  await signIn.open(query);
  await signIn.signIn(cast.leah.email, SEED_PASSWORD);
  await expect(page).toHaveURL(/\/sign-in\/verify/);
}

test.describe('Operator two-step verification', () => {
  test('L2-056.2: an operator with the right password is asked for the second step, on a page with only the wordmark', async ({ page }) => {
    const verify = new TwoFactorPage(page);

    await signInAsLeah(page);

    await expect(verify.heading).toHaveText('Two-step verification');
    await expect(verify.subtitle).toHaveText('Enter the 6-digit code from your authenticator app to open the operator console.');
    await expect(verify.code).toBeFocused();
    await expect(verify.code).toHaveAttribute('inputmode', 'numeric');
    await expect(verify.code).toHaveAttribute('autocomplete', 'one-time-code');
    await expect(verify.code).toHaveAttribute('maxlength', '6');
    await expect(verify.securityKey).toBeVisible();
    await expect(verify.signedInAs).toHaveText(`Signed in as ${cast.leah.email} · Not you?`);
    await expect(verify.header.nav).toHaveCount(0);
    await expect(verify.header.wordmark).toHaveText('Sweet Hand');
    await verify.expectNoAccessibilityViolations();
  });

  test('L2-056.2: until the second step passes, operator pages send the operator back to it', async ({ page }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);

    await page.goto('/admin/queue');

    await expect(page).toHaveURL(/\/sign-in\/verify\?returnUrl=%2Fadmin%2Fqueue$/);
    await expect(verify.heading).toHaveText('Two-step verification');
  });

  test('L2-068.3: a code that does not work is explained and kept', async ({ page }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);

    await verify.enter('418302');

    await expect(verify.errorSummary).toBeFocused();
    await expect(verify.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to continue signing in');
    await expect(verify.errorSummary.getByRole('link')).toHaveText(['That code didn’t work']);
    await expect(verify.codeError).toHaveText('That code didn’t work. Enter the newest code from your app.');
    await expect(verify.code).toHaveAttribute('aria-invalid', 'true');
    await expect(verify.code).toHaveValue('418302');
    await verify.expectNoAccessibilityViolations();
  });

  test('an empty code is caught before sending', async ({ page, backend }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);

    await verify.submit.click();

    await expect(verify.codeError).toHaveText('Enter the 6-digit code from your app');
    expect((await backend.requests()).filter((r) => r.path === '/api/identity/second-factor')).toHaveLength(0);
  });

  test('while the code is checked the form is busy', async ({ page, backend }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);
    await backend.hold('POST /api/identity/second-factor');

    await verify.enter(OPERATOR_CODE);

    await expect(verify.submit).toHaveAttribute('aria-busy', 'true');
    await expect(verify.code).toHaveAttribute('readonly', '');
    await expect(verify.status).toHaveText('Checking the code');
    await backend.release();
    await expect(page).toHaveURL(/\/admin\/queue$/);
  });

  test('when the check fails on our side the operator can try again', async ({ page, backend }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);
    await backend.fail('POST /api/identity/second-factor', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '0b6d4f88' } });

    await verify.enter(OPERATOR_CODE);

    await expect(verify.alert).toHaveAttribute('role', 'alert');
    await expect(verify.alert).toContainText('We couldn’t check your code');
    await expect(verify.alert).toContainText('Something went wrong on our side. Wait for a new code in your app and try again. Reference 0b6d4f88.');
    await verify.expectNoAccessibilityViolations();
  });

  test('L2-056.2: the right code opens the operator console', async ({ page }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);

    await verify.enter(OPERATOR_CODE);

    await expect(page).toHaveURL(/\/admin\/queue$/);
    await expect(verify.header.accountButton).toHaveAccessibleName('Account menu for Leah Mohammed');
  });

  test('L2-013.3: after the second step the operator returns to the page that asked them to sign in', async ({ page }) => {
    const verify = new TwoFactorPage(page);
    await page.goto('/admin/caterers');
    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fadmin%2Fcaterers$/);
    const signIn = new SignInPage(page);
    await signIn.signIn(cast.leah.email, SEED_PASSWORD);

    await verify.enter(OPERATOR_CODE);

    await expect(page).toHaveURL(/\/admin\/caterers$/);
  });

  test('a security key can be used instead of a code', async ({ page, backend }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);

    await verify.securityKey.click();

    await expect(page).toHaveURL(/\/admin\/queue$/);
    const sent = (await backend.requests()).find((r) => r.path === '/api/identity/second-factor');
    expect(sent?.body).toMatchObject({ method: 'security key', assertion: expect.any(String) });
  });

  test('"Not you?" signs out and goes back to sign in', async ({ page }) => {
    const verify = new TwoFactorPage(page);
    await signInAsLeah(page);

    await verify.notYou.click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await verify.open();
    await expect(page).toHaveURL(/\/sign-in$/);
  });

  test('L2-064.2: the second step fits a phone', async ({ page }) => {
    const verify = new TwoFactorPage(page);
    await verify.usePhone();

    await signInAsLeah(page);

    await expect(verify.submit).toBeVisible();
    await verify.expectNoHorizontalScroll();
    await verify.expectNoAccessibilityViolations();
  });
});
