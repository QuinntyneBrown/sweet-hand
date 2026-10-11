import { test, expect } from '../../support/test';
import { ResetPasswordPage } from '../../pages/reset-password.page';
import { SignInPage } from '../../pages/sign-in.page';
import { cast } from '../../support/cast';

const NEW_PASSWORD = 'pepperpot-sundays-21';

test.describe('Choose a new password', () => {
  test('a valid link asks for a new password for that account', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    const reset = new ResetPasswordPage(page);

    await reset.open(link);

    await expect(reset.heading).toHaveText('Choose a new password');
    await expect(reset.subtitle).toHaveText(`Choose a new password for ${cast.marcia.email}.`);
    await expect(reset.username).toHaveValue(cast.marcia.email);
    await expect(reset.password).toBeFocused();
    await expect(reset.password).toHaveAttribute('autocomplete', 'new-password');
    await expect(reset.password).toHaveAccessibleDescription('At least 12 characters. Avoid common passwords.');
    await reset.expectNoAccessibilityViolations();
  });

  test('L2-076.1: a password under 12 characters is explained before sending', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    const reset = new ResetPasswordPage(page);
    await reset.open(link);

    await reset.choose('pelau1234');

    await expect(reset.errorSummary).toBeFocused();
    await expect(reset.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to save your new password');
    await expect(reset.errorSummary.getByRole('link')).toHaveText(['Use at least 12 characters']);
    await expect(reset.passwordError).toHaveText('Use at least 12 characters. Yours has 9.');
    await expect(reset.password).toHaveAttribute('aria-describedby', 'password-error password-help');
    await reset.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/identity/password-resets')).toHaveLength(0);
  });

  test('L2-076.1: a common password is refused by the server', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    const reset = new ResetPasswordPage(page);
    await reset.open(link);

    await reset.choose('sunshine2026');

    await expect(reset.passwordError).toHaveText('This password is too common. Choose one that’s harder to guess, at least 12 characters.');
  });

  test('while saving the form is busy', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    await backend.hold('POST /api/identity/password-resets');
    const reset = new ResetPasswordPage(page);
    await reset.open(link);

    await reset.choose(NEW_PASSWORD);

    await expect(reset.submit).toHaveAttribute('aria-busy', 'true');
    await expect(reset.password).toHaveAttribute('readonly', '');
    await expect(reset.status).toHaveText('Saving your new password');
    await backend.release();
    await expect(reset.heading).toHaveText('Password changed');
  });

  test('when saving fails on our side the link still works and the person can try again', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    await backend.fail('POST /api/identity/password-resets', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: 'c4e7192b' } });
    const reset = new ResetPasswordPage(page);
    await reset.open(link);

    await reset.choose(NEW_PASSWORD);

    await expect(reset.alert).toHaveAttribute('role', 'alert');
    await expect(reset.alert).toContainText('We couldn’t save your new password');
    await expect(reset.alert).toContainText('Something went wrong on our side. Your link still works for a few more minutes; try again. Reference c4e7192b.');
    await reset.expectNoAccessibilityViolations();

    await reset.choose(NEW_PASSWORD);
    await expect(reset.heading).toHaveText('Password changed');
  });

  test('L2-077.4: a new password signs the account out everywhere and a confirmation email is sent', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    const reset = new ResetPasswordPage(page);
    await reset.open(link);
    await expect(reset.header.accountButton).toBeVisible();

    await reset.choose(NEW_PASSWORD);

    await expect(reset.heading).toHaveText('Password changed');
    await expect(reset.subtitle).toHaveText('You’re signed out on every device for safety. Sign in with your new password.');
    await expect(reset.header.accountButton).toHaveCount(0);
    await reset.expectNoAccessibilityViolations();
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: cast.marcia.email, kind: 'password-changed' }));

    await reset.link('Sign in').click();
    const signIn = new SignInPage(page);
    await signIn.signIn(cast.marcia.email, NEW_PASSWORD);
    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('L2-077.2: a link older than 30 minutes is refused and a new one can be requested', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    await backend.setNow('2026-10-10T14:31:00Z');
    const reset = new ResetPasswordPage(page);

    await reset.open(link);

    await expect(reset.heading).toHaveText('This link has expired');
    await expect(reset.subtitle).toHaveText('Reset links work once, for 30 minutes. Request a new one and use it straight away.');
    await expect(reset.link('Request a new link')).toHaveAttribute('href', '/forgot-password');
    await expect(reset.link('Sign in')).toHaveAttribute('href', '/sign-in');
    await reset.expectNoAccessibilityViolations();
  });

  test('L2-077.2: a link that was already used is refused', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    const reset = new ResetPasswordPage(page);
    await reset.open(link);
    await reset.choose(NEW_PASSWORD);
    await expect(reset.heading).toHaveText('Password changed');

    await reset.open(link);

    await expect(reset.heading).toHaveText('This link has expired');
  });

  test('when the link cannot be checked the person can try again', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-password-reset', { email: cast.marcia.email });
    await backend.fail('GET /api/identity/password-resets/*', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: 'aa01bb02' } });
    const reset = new ResetPasswordPage(page);

    await reset.open(link);

    await expect(reset.alert).toContainText('We couldn’t check your link');
    await reset.button('Try again').click();
    await expect(reset.heading).toHaveText('Choose a new password');
  });
});
