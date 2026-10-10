import { test, expect } from '../../support/test';
import { ForgotPasswordPage } from '../../pages/forgot-password.page';
import { SignInPage } from '../../pages/sign-in.page';
import { cast } from '../../support/cast';

test.describe('Forgot password', () => {
  test('"Forgot your password?" on sign in asks for the email to send a link to', async ({ page }) => {
    const signIn = new SignInPage(page);
    const forgot = new ForgotPasswordPage(page);
    await signIn.open();

    await signIn.link('Forgot your password?').click();

    await expect(forgot.heading).toHaveText('Forgot password');
    await expect(forgot.subtitle).toHaveText('Enter the email you signed up with and we’ll send a link to choose a new password.');
    await expect(forgot.email).toBeFocused();
    await expect(forgot.email).toHaveAttribute('autocomplete', 'email');
    await expect(forgot.link('Sign in')).toHaveAttribute('href', '/sign-in');
    await forgot.expectNoAccessibilityViolations();
  });

  test('L2-068.3: an email that is not an address is caught before sending', async ({ page, backend }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();

    await forgot.request('marcia.t@example');

    await expect(forgot.errorSummary).toBeFocused();
    await expect(forgot.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to send the reset link');
    await expect(forgot.errorSummary.getByRole('link')).toHaveText(['Enter an email address like name@example.com']);
    await expect(forgot.email).toHaveAttribute('aria-invalid', 'true');
    await expect(forgot.emailError).toHaveText('Enter an email address like name@example.com');
    await forgot.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path === '/api/identity/password-reset-requests')).toHaveLength(0);
  });

  test('while the link is requested the form is busy', async ({ page, backend }) => {
    await backend.hold('POST /api/identity/password-reset-requests');
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();

    await forgot.request(cast.marcia.email);

    await expect(forgot.submit).toHaveAttribute('aria-busy', 'true');
    await expect(forgot.email).toHaveAttribute('readonly', '');
    await expect(forgot.status).toHaveText('Sending the reset link');
    await backend.release();
    await expect(forgot.heading).toHaveText('Check your email');
  });

  test('when the request fails on our side the email is kept', async ({ page, backend }) => {
    await backend.fail('POST /api/identity/password-reset-requests', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '51ac30e2' } });
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();

    await forgot.request(cast.marcia.email);

    await expect(forgot.alert).toHaveAttribute('role', 'alert');
    await expect(forgot.alert).toContainText('We couldn’t send your request');
    await expect(forgot.alert).toContainText('Something went wrong on our side. Your email is still here; try again in a moment. Reference 51ac30e2.');
    await expect(forgot.email).toHaveValue(cast.marcia.email);
    await forgot.expectNoAccessibilityViolations();
  });

  test('L2-077.1 L2-082.2: a registered email gets a single-use link, with a bot check sent along', async ({ page, backend }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();

    await forgot.request(cast.marcia.email);

    await expect(forgot.heading).toHaveText('Check your email');
    await expect(forgot.subtitle).toHaveText('If an account exists, we’ve sent a reset link. It works once, for 30 minutes.');
    await expect(forgot.link('Back to sign in')).toHaveAttribute('href', '/sign-in');
    await expect(forgot.hint).toHaveText('Nothing after a few minutes? Check your spam folder, or try a different email.');
    await forgot.expectNoAccessibilityViolations();
    const sent = (await backend.requests()).find((r) => r.path === '/api/identity/password-reset-requests');
    expect(sent?.body).toMatchObject({ email: cast.marcia.email, challengeToken: expect.any(String) });
    const { account } = await backend.state();
    expect(account.outbox).toContainEqual(expect.objectContaining({ to: cast.marcia.email, kind: 'password-reset', link: expect.stringMatching(/^\/reset-password\//) }));
  });

  test('L2-077.1: an email without an account sees exactly the same message, and nothing is sent', async ({ page, backend }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();

    await forgot.request('nobody.here@example.com');

    await expect(forgot.heading).toHaveText('Check your email');
    await expect(forgot.subtitle).toHaveText('If an account exists, we’ve sent a reset link. It works once, for 30 minutes.');
    const { account } = await backend.state();
    expect(account.outbox).toHaveLength(0);
  });

  test('"try a different email" goes back to the form', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();
    await forgot.request(cast.marcia.email);

    await forgot.link('try a different email').click();

    await expect(forgot.heading).toHaveText('Forgot password');
    await expect(forgot.email).toHaveValue('');
  });

  test('L2-082.3: a sixth reset request from one network within an hour is refused', async ({ page }) => {
    const forgot = new ForgotPasswordPage(page);
    await forgot.open();
    for (let i = 0; i < 5; i++) {
      await forgot.request(cast.marcia.email);
      await expect(forgot.heading).toHaveText('Check your email');
      await forgot.link('try a different email').click();
    }

    await forgot.request(cast.marcia.email);

    await expect(forgot.alert).toContainText('Too many reset requests');
    await expect(forgot.alert).toContainText('We’ve had several requests from your network in the last hour. Try again in 60 minutes.');
    await expect(forgot.heading).toHaveText('Forgot password');
  });
});
