import { test, expect } from '../../support/test';
import { RegisterPage } from '../../pages/register.page';
import { cast } from '../../support/cast';

const priya = { name: 'Priya Singh', email: 'priya.singh@example.com', password: 'callaloo-and-dumplings' };

test.describe('Create a customer account', () => {
  test('L2-023 L2-070.2: the form asks for a name, email, password and an unticked consent with a short summary', async ({ page }) => {
    const register = new RegisterPage(page);

    await register.open();

    await expect(register.heading).toHaveText('Create an account');
    await expect(register.subtitle).toHaveText('Free. Send enquiries and keep every conversation in one inbox.');
    await expect(register.name).toBeFocused();
    await expect(register.name).toHaveAttribute('autocomplete', 'name');
    await expect(register.helpFor('name')).toHaveText('Caterers see this name. 2 to 50 characters.');
    await expect(register.email).toHaveAttribute('type', 'email');
    await expect(register.email).toHaveAttribute('autocomplete', 'email');
    await expect(register.password).toHaveAttribute('autocomplete', 'new-password');
    await expect(register.helpFor('password')).toHaveText('At least 12 characters. Avoid common passwords.');
    await expect(register.consent).not.toBeChecked();
    await expect(register.consent).toHaveAccessibleDescription(
      'We use your name and email to run your account and pass your enquiries to caterers. Caterers see your name, never your email or phone unless you share them. Everything is stored in Canada.',
    );
    await expect(register.privacyLink).toHaveAttribute('href', '/privacy');
    await expect(register.link('Sign in')).toHaveAttribute('href', '/sign-in');
    await expect(register.link('list your business')).toHaveAttribute('href', '/join');
    await register.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the form fits a phone without scrolling sideways', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.usePhone();

    await register.open();

    await expect(register.submit).toBeVisible();
    await register.expectNoHorizontalScroll();
    await register.expectNoAccessibilityViolations();
  });

  test('L2-068.3 L2-070.2 L2-076.1: problems are listed at the top, each linked to its field, and nothing is sent', async ({ page, backend }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.register({ name: 'Marcia Thompson', email: 'marcia.t@example', password: 'pepperpot', consent: false });

    await expect(register.errorSummary).toBeFocused();
    await expect(register.errorSummary.getByRole('heading')).toHaveText('Fix 3 things to create your account');
    await expect(register.errorSummary.getByRole('link')).toHaveText([
      'Enter an email address like name@example.com',
      'Use at least 12 characters. Yours has 9.',
      'Tick the box to agree to the privacy notice',
    ]);
    await expect(register.email).toHaveAttribute('aria-invalid', 'true');
    await expect(register.errorFor('password')).toHaveText('Use at least 12 characters. Yours has 9.');
    await expect(register.consent).toHaveAttribute('aria-invalid', 'true');
    await expect(register.consent).toHaveAttribute('aria-describedby', 'consent-error consent-summary');
    await expect(register.errorFor('consent')).toHaveText('Tick the box to agree to the privacy notice');
    await expect(register.name).toHaveValue('Marcia Thompson');
    await register.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path.startsWith('/api/identity/registrations'))).toHaveLength(0);

    await register.errorSummary.getByRole('link', { name: 'Tick the box to agree to the privacy notice' }).click();
    await expect(register.consent).toBeFocused();
  });

  test('a name must be 2 to 50 characters', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.register({ name: 'M', email: priya.email, password: priya.password });

    await expect(register.errorFor('name')).toHaveText('Enter a display name of 2 to 50 characters');
  });

  test('L2-076.1: a common password is refused by the server with the rule explained', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.register({ name: priya.name, email: priya.email, password: 'sunshine2026' });

    await expect(register.errorSummary.getByRole('link')).toHaveText(['This password is too common']);
    await expect(register.errorFor('password')).toHaveText('This password is too common. Choose one that’s harder to guess, at least 12 characters.');
    await expect(register.password).toHaveAttribute('aria-describedby', 'password-error password-help');
    await expect(register.email).toHaveValue(priya.email);
  });

  test('while the account is created the form is busy and read-only', async ({ page, backend }) => {
    await backend.hold('POST /api/identity/registrations');
    const register = new RegisterPage(page);
    await register.open();

    await register.register(priya);

    await expect(register.submit).toHaveAttribute('aria-busy', 'true');
    await expect(register.name).toHaveAttribute('readonly', '');
    await expect(register.email).toHaveAttribute('readonly', '');
    await expect(register.status).toHaveText('Creating your account');
    await backend.release();
    await expect(register.heading).toHaveText('Check your email');
  });

  test('when registration fails on our side the details are kept and the password is asked for again', async ({ page, backend }) => {
    await backend.fail('POST /api/identity/registrations', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '9d04be17' } });
    const register = new RegisterPage(page);
    await register.open();

    await register.register(priya);

    await expect(register.alert).toHaveAttribute('role', 'alert');
    await expect(register.alert).toContainText('We couldn’t create your account');
    await expect(register.alert).toContainText('Something went wrong on our side. Your details are still here; enter your password again and retry. Reference 9d04be17.');
    await expect(register.name).toHaveValue(priya.name);
    await expect(register.email).toHaveValue(priya.email);
    await expect(register.password).toHaveValue('');
    await expect(register.consent).toBeChecked();
    await register.expectNoAccessibilityViolations();

    await register.password.fill(priya.password);
    await register.submit.click();
    await expect(register.heading).toHaveText('Check your email');
  });

  test('L2-023 L2-070.3 L2-082.2: a new customer is asked to verify their email; consent and a bot check are recorded', async ({ page, backend }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.register(priya);

    await expect(register.heading).toHaveText('Check your email');
    await expect(register.subtitle).toHaveText(`We sent a link to ${priya.email}. Open it within 24 hours to verify your address.`);
    await expect(register.successText).toHaveText('You can browse caterers now. You’ll need a verified email to send an enquiry.');
    await expect(register.link('Browse caterers')).toHaveAttribute('href', '/caterers');
    await expect(register.button('Resend email')).toBeVisible();
    await register.expectNoAccessibilityViolations();

    const sent = (await backend.requests()).find((r) => r.path === '/api/identity/registrations');
    expect(sent?.body).toMatchObject({ displayName: priya.name, email: priya.email, consent: true, challengeToken: expect.any(String) });
    const { users, account } = await backend.state();
    const user = users.find((u: { email: string }) => u.email === priya.email);
    expect(user).toMatchObject({ role: 'Customer', emailVerified: false, acceptedPrivacyVersion: '2026-03', acceptedPrivacyAt: '2026-10-10T14:00:00.000Z' });
    expect(account.outbox).toContainEqual(expect.objectContaining({ to: priya.email, kind: 'verify-email' }));
  });

  test('L2-076: an email that already has an account gets the same screen, and its owner is told instead', async ({ page, backend }) => {
    const register = new RegisterPage(page);
    await register.open();

    await register.register({ ...priya, email: cast.marcia.email });

    await expect(register.heading).toHaveText('Check your email');
    await expect(register.subtitle).toHaveText(`We sent a link to ${cast.marcia.email}. Open it within 24 hours to verify your address.`);
    const { users, account } = await backend.state();
    expect(users.filter((u: { email: string }) => u.email === cast.marcia.email)).toHaveLength(1);
    expect(account.outbox).toContainEqual(expect.objectContaining({ to: cast.marcia.email, kind: 'registration-attempt' }));
  });

  test('"Start again" goes back to an empty form', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(priya);

    await register.link('Start again').click();

    await expect(register.heading).toHaveText('Create an account');
    await expect(register.email).toHaveValue('');
  });
});
