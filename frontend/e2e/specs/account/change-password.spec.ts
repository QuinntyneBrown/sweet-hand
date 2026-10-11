import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { cast, SEED_PASSWORD } from '../../support/cast';

const NEW_PASSWORD = 'pepperpot-sundays-21';

test.describe('Change password', () => {
  test.beforeEach(async ({ backend, page }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();
    await account.button('Change password').click();
  });

  test('the dialog asks for the current and new password and says other devices will be signed out', async ({ page }) => {
    const account = new AccountPage(page);
    const dialog = account.changePassword;

    await expect(dialog.description).toHaveText('Last changed Sat 14 Mar.');
    await expect(dialog.field('Current password')).toBeFocused();
    await expect(dialog.field('Current password')).toHaveAttribute('autocomplete', 'current-password');
    await expect(dialog.field('New password')).toHaveAttribute('autocomplete', 'new-password');
    await expect(dialog.field('New password')).toHaveAccessibleDescription('12 to 128 characters. Avoid common passwords.');
    await expect(dialog.field('Confirm new password')).toHaveAttribute('type', 'password');
    await expect(dialog.body).toContainText('You’ll stay signed in here. Your other devices will be signed out.');
    await account.expectNoAccessibilityViolations();
  });

  test('L2-068.3: a confirmation that does not match is caught before sending', async ({ page, backend }) => {
    const dialog = new AccountPage(page).changePassword;

    await dialog.field('Current password').fill(SEED_PASSWORD);
    await dialog.field('New password').fill('sunshine2026');
    await dialog.field('Confirm new password').fill('sunshine2025');
    await dialog.button('Change password').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to change your password');
    await expect(dialog.errorFor('confirm')).toHaveText('The passwords don’t match');
    await expect(dialog.field('Confirm new password')).toHaveAttribute('aria-invalid', 'true');
    await new AccountPage(page).expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path === '/api/me/password')).toHaveLength(0);
  });

  test('L2-076.1: a breached password is refused with the reason', async ({ page }) => {
    const dialog = new AccountPage(page).changePassword;

    await dialog.field('Current password').fill(SEED_PASSWORD);
    await dialog.field('New password').fill('sunshine2026');
    await dialog.field('Confirm new password').fill('sunshine2026');
    await dialog.button('Change password').click();

    await expect(dialog.errorSummary.getByRole('link')).toHaveText(['This password appears in lists of breached passwords. Choose a different one.']);
    await expect(dialog.errorFor('new')).toHaveText('This password appears in lists of breached passwords. Choose a different one.');
  });

  test('a wrong current password is refused', async ({ page }) => {
    const dialog = new AccountPage(page).changePassword;

    await dialog.field('Current password').fill('not-my-password');
    await dialog.field('New password').fill(NEW_PASSWORD);
    await dialog.field('Confirm new password').fill(NEW_PASSWORD);
    await dialog.button('Change password').click();

    await expect(dialog.errorFor('current')).toHaveText('That password isn’t right. Try again.');
  });

  test('while changing, the dialog is busy', async ({ page, backend }) => {
    await backend.hold('POST /api/me/password');
    const dialog = new AccountPage(page).changePassword;

    await dialog.field('Current password').fill(SEED_PASSWORD);
    await dialog.field('New password').fill(NEW_PASSWORD);
    await dialog.field('Confirm new password').fill(NEW_PASSWORD);
    await dialog.button('Change password').click();

    await expect(dialog.button('Change password')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('New password')).toHaveAttribute('readonly', '');
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Changing your password');
    await backend.release();
    await expect(dialog.root).toHaveCount(0);
  });

  test('when changing fails, the old password still works and the person can try again', async ({ page, backend }) => {
    await backend.fail('POST /api/me/password', { status: 500, times: 1 });
    const dialog = new AccountPage(page).changePassword;

    await dialog.field('Current password').fill(SEED_PASSWORD);
    await dialog.field('New password').fill(NEW_PASSWORD);
    await dialog.field('Confirm new password').fill(NEW_PASSWORD);
    await dialog.button('Change password').click();

    await expect(dialog.alert).toContainText('Your password wasn’t changed');
    await expect(dialog.alert).toContainText('Something went wrong on our side. Your old password still works; try again.');
    await new AccountPage(page).expectNoAccessibilityViolations();
  });

  test('a changed password keeps this device signed in, signs out the others and emails a confirmation', async ({ page, backend }) => {
    const account = new AccountPage(page);
    const dialog = account.changePassword;

    await dialog.field('Current password').fill(SEED_PASSWORD);
    await dialog.field('New password').fill(NEW_PASSWORD);
    await dialog.field('Confirm new password').fill(NEW_PASSWORD);
    await dialog.button('Change password').click();

    await expect(dialog.root).toHaveCount(0);
    await expect(account.toast).toContainText('Password changed');
    await expect(account.toast).toContainText('Your other devices were signed out.');
    await expect(account.detail('Password')).toContainText('Last changed Sat 10 Oct');
    await expect(account.deviceTitles).toHaveText(['Chrome on Windows']);
    await expect(account.button('Change password')).toBeFocused();
    const { account: state } = await backend.state();
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: cast.marcia.email, kind: 'password-changed' }));
  });
});
