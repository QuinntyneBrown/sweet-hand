import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { SignInPage } from '../../pages/sign-in.page';
import { cast, SEED_PASSWORD } from '../../support/cast';

test.describe('Delete my account', () => {
  test('L2-072: the dialog says what is deleted and what stays, and starts on the password, never the danger button', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();

    await account.button('Delete my account').click();

    const dialog = account.deleteAccount;
    await expect(dialog.title).toHaveText('Delete your account?');
    await expect(dialog.description).toHaveText('This can’t be undone. You’ll be signed out and get a confirmation email.');
    await expect(dialog.listItems).toHaveText(['Your name, email and phone', 'Your review (the caterer’s rating is recalculated)', 'Your sign-in and saved devices']);
    await expect(dialog.body).toContainText('Caterers keep your messages in their threads, signed “Former Sweet Hand user”. Everything is gone from our systems within 30 days and from backups within 35.');
    await expect(dialog.field(`Enter your password for ${cast.marcia.email}`)).toBeFocused();
    await expect(dialog.field(`Enter your password for ${cast.marcia.email}`)).toHaveAttribute('autocomplete', 'current-password');
    await account.expectNoAccessibilityViolations();
  });

  test('L2-068.3: without a password nothing is sent; a wrong password is refused and nothing is deleted', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();
    await account.button('Delete my account').click();
    const dialog = account.deleteAccount;
    const password = dialog.field(`Enter your password for ${cast.marcia.email}`);

    await password.press('Enter');
    await expect(dialog.errorFor('delete-password')).toHaveText('Enter your password');
    expect((await backend.requests()).filter((r) => r.path === '/api/me/deletion')).toHaveLength(0);

    await password.fill('pelau1234');
    await dialog.button('Delete my account').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to delete your account');
    await expect(dialog.errorSummary.getByRole('link')).toHaveText(['That password isn’t right. Try again.']);
    await expect(password).toHaveAttribute('aria-invalid', 'true');
    await account.expectNoAccessibilityViolations();
    const { users } = await backend.state();
    expect(users.find((u: { id: string }) => u.id === 'user-marcia').deleted).toBeFalsy();
  });

  test('while deleting, the dialog is busy and cannot be closed', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.hold('POST /api/me/deletion');
    const account = new AccountPage(page);
    await account.open();
    await account.button('Delete my account').click();
    const dialog = account.deleteAccount;

    await dialog.field(`Enter your password for ${cast.marcia.email}`).fill(SEED_PASSWORD);
    await dialog.button('Delete my account').click();

    await expect(dialog.button('Delete my account')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Deleting your account');
    await backend.release();
    await expect(page).toHaveURL(/\/caterers$/);
  });

  test('when deleting fails, nothing is deleted and the dialog says so', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.fail('POST /api/me/deletion', { status: 500, times: 1 });
    const account = new AccountPage(page);
    await account.open();
    await account.button('Delete my account').click();
    const dialog = account.deleteAccount;

    await dialog.field(`Enter your password for ${cast.marcia.email}`).fill(SEED_PASSWORD);
    await dialog.button('Delete my account').click();

    await expect(dialog.alert).toContainText('Your account wasn’t deleted');
    await expect(dialog.alert).toContainText('Nothing has been deleted. Try again, or email privacy@sweethand.example.');
    await account.expectNoAccessibilityViolations();
  });

  test('L2-072.1: a deleted customer is signed out, told, emailed, and cannot sign in again', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();
    await account.button('Delete my account').click();

    await account.deleteAccount.field(`Enter your password for ${cast.marcia.email}`).fill(SEED_PASSWORD);
    await account.deleteAccount.button('Delete my account').click();

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(account.header.link('Sign in')).toBeVisible();
    await expect(account.toast).toContainText('Your account is deleted');
    await expect(account.toast).toContainText('We’ve sent a confirmation email. Thank you for using Sweet Hand.');
    const { account: state } = await backend.state();
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: cast.marcia.email, kind: 'account-deleted' }));

    const signIn = new SignInPage(page);
    await signIn.open();
    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);
    await expect(signIn.errorFor('password')).toHaveText('Email or password is incorrect');
  });

  test('L2-072.4: a caterer is told their page comes down and their open enquiries are closed', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const account = new AccountPage(page);
    await account.open();

    await account.button('Delete my account').click();

    const dialog = account.deleteAccount;
    await expect(dialog.title).toHaveText('Delete Pelau House and your account?');
    await expect(dialog.description).toHaveText('This can’t be undone. You’ll be signed out.');
    await expect(dialog.listItems).toHaveText([
      'Pelau House comes off Sweet Hand straight away',
      'Your photos, menu and food handler certificate are deleted within 30 days',
      'Your 4 open enquiries are closed, and Priya, Marcia and Andre are told',
      'Your 23 reviews and your responses are removed',
    ]);
    await expect(dialog.body).toContainText('Customers keep the messages in their threads. Backups age out within 35 days.');
    await account.expectNoAccessibilityViolations();

    await dialog.field(`Enter your password for ${cast.kendra.email}`).fill(SEED_PASSWORD);
    await dialog.button('Delete my account').click();
    await expect(page).toHaveURL(/\/caterers$/);
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').status).not.toBe('Published');
  });
});
