import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { cast } from '../../support/cast';

test.describe('Account', () => {
  test('L2-078.5 L2-070.3: a customer sees their details, signed-in devices, data and deletion', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);

    await account.open();

    await expect(account.heading).toHaveText('Account');
    await expect(account.avatar).toHaveText('MT');
    await expect(account.subtitle).toHaveText('Marcia Thompson · Customer since March 2026');
    await expect(account.detail('Display name')).toHaveText('Marcia Thompson');
    await expect(account.detail('Email')).toContainText(cast.marcia.email);
    await expect(account.statusOf('Email')).toHaveText('Verified');
    await expect(account.detail('Phone')).toContainText('+1 647 555 0187');
    await expect(account.detail('Phone')).toContainText('Private until you share it in a thread');
    await expect(account.detail('Password')).toContainText('Last changed Sat 14 Mar');
    await expect(account.deviceTitles).toHaveText(['Chrome on Windows', 'Safari on iPhone', 'Samsung Internet on Android']);
    await expect(account.deviceMetas).toHaveText(['This device · active now', 'Last active today, 8:15 a.m.', 'Last active Mon 28 Sep']);
    await expect(account.device('Chrome on Windows').locator('.status')).toHaveText('Current');
    await expect(account.dataText.first()).toHaveText('Privacy notice version 2026-03, accepted Sat 14 Mar. Read the privacy notice');
    await expect(account.dataText.nth(1)).toHaveText(
      'Your profile, consent records, enquiries, messages, reviews and the reports you sent, as a JSON file. We email you a link within 24 hours; it works for 7 days.',
    );
    await expect(account.link('Read the privacy notice')).toHaveAttribute('href', '/privacy');
    await expect(account.deleteText).toHaveText('Removes your profile and reviews. Caterers keep your messages, signed “Former Sweet Hand user”. This can’t be undone.');
    await account.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the account page fits a phone', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.usePhone();

    await account.open();

    await expect(account.deviceRows).toHaveCount(3);
    await account.expectNoHorizontalScroll();
    await account.expectNoAccessibilityViolations();
  });

  test('while the account loads, skeletons hold its shape and the page says so', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.hold('GET /api/me/account');
    const account = new AccountPage(page);

    await account.open();

    await expect(account.heading).toHaveText('Account');
    await expect(account.busyIntro).toBeVisible();
    await expect(account.loadingStatus).toHaveText('Loading your account');
    await expect(account.loadingDevices).toHaveAttribute('aria-busy', 'true');
    await account.expectNoAccessibilityViolations();
    await backend.release();
    await expect(account.deviceRows).toHaveCount(3);
  });

  test('when the account cannot be loaded the page says so, with a reference and a way to try again', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.fail('GET /api/me/account', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '7f3c-91a2' } });
    const account = new AccountPage(page);

    await account.open();

    await expect(account.loadError).toHaveAttribute('role', 'alert');
    await expect(account.loadError).toContainText('We couldn’t load your account');
    await expect(account.loadError).toContainText('Your details are safe. This is a problem on our side; please try again in a moment.');
    await expect(account.loadErrorReference).toHaveText('Reference 7f3c-91a2');
    await expect(account.link('Back to caterers')).toHaveAttribute('href', '/caterers');
    await account.expectNoAccessibilityViolations();

    await account.button('Try again').click();
    await expect(account.detail('Display name')).toHaveText('Marcia Thompson');
  });

  test('L2-078.4: "Sign out" at the foot of the page ends the session', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();

    await account.button('Sign out').click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(account.header.link('Sign in')).toBeVisible();
    await page.goto('/account');
    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Faccount$/);
  });
});
