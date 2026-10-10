import { test, expect } from '../../support/test';
import { SignInPage } from '../../pages/sign-in.page';
import { cast, SEED_PASSWORD } from '../../support/cast';

test.describe('Sign in', () => {
  test('a visitor sees the sign-in form with the email field focused', async ({ page }) => {
    const signIn = new SignInPage(page);

    await signIn.open();

    await expect(signIn.heading).toHaveText('Sign in');
    await expect(signIn.subtitle).toHaveText('Welcome back. Your inbox and saved enquiries are waiting.');
    await expect(signIn.email).toBeFocused();
    await expect(signIn.email).toHaveAttribute('type', 'email');
    await expect(signIn.email).toHaveAttribute('autocomplete', 'email');
    await expect(signIn.password).toHaveAttribute('autocomplete', 'current-password');
    await expect(signIn.link('Forgot your password?')).toHaveAttribute('href', '/forgot-password');
    await expect(signIn.link('Create an account')).toHaveAttribute('href', '/register');
    await expect(signIn.link('list your business')).toHaveAttribute('href', '/join');
    await expect(signIn.header.currentLink).toHaveText('Sign in');
    await signIn.expectNoAccessibilityViolations();
  });

  test('L2-068.3: an empty form lists what to fix, links each error to its field and sends nothing', async ({ page, backend }) => {
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.submit.click();

    await expect(signIn.errorSummary).toBeFocused();
    await expect(signIn.errorSummary.getByRole('heading')).toHaveText('Fix 2 things to sign in');
    await expect(signIn.errorSummary.getByRole('link')).toHaveText(['Enter your email address', 'Enter your password']);
    await expect(signIn.email).toHaveAttribute('aria-invalid', 'true');
    await expect(signIn.email).toHaveAttribute('aria-describedby', 'email-error');
    await expect(signIn.errorFor('email')).toHaveText('Enter your email address');
    await signIn.expectNoAccessibilityViolations();

    await signIn.errorSummary.getByRole('link', { name: 'Enter your password' }).click();
    await expect(signIn.password).toBeFocused();
    expect((await backend.requests()).filter((r) => r.path === '/api/identity/sign-in')).toHaveLength(0);
  });

  test('an email that is not an address is caught before sending', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn('marcia', 'whatever-it-is-123');

    await expect(signIn.errorFor('email')).toHaveText('Enter an email address like name@example.com');
  });

  test('L2-076.3: a wrong password and an unknown email get the same message; the email stays and the password clears', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.marcia.email, 'not-the-right-password');

    await expect(signIn.errorSummary).toBeFocused();
    await expect(signIn.errorSummary.getByRole('heading')).toHaveText('Fix 1 thing to sign in');
    await expect(signIn.errorSummary.getByRole('link')).toHaveText(['Email or password is incorrect']);
    await expect(signIn.password).toHaveAttribute('aria-invalid', 'true');
    await expect(signIn.errorFor('password')).toHaveText('Email or password is incorrect');
    await expect(signIn.email).toHaveValue(cast.marcia.email);
    await expect(signIn.password).toHaveValue('');

    await signIn.signIn('nobody@example.com', 'not-the-right-password');
    await expect(signIn.errorSummary.getByRole('link')).toHaveText(['Email or password is incorrect']);
  });

  test('the password can be shown and hidden again', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();
    await signIn.password.fill('pepperpot');

    await signIn.showPassword.click();

    await expect(signIn.showPassword).toHaveAttribute('aria-pressed', 'true');
    await expect(signIn.password).toHaveAttribute('type', 'text');
    await signIn.showPassword.click();
    await expect(signIn.password).toHaveAttribute('type', 'password');
  });

  test('while signing in the form is busy and says so', async ({ page, backend }) => {
    await backend.hold('POST /api/identity/sign-in');
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(signIn.submit).toHaveAttribute('aria-busy', 'true');
    await expect(signIn.email).toHaveAttribute('readonly', '');
    await expect(signIn.status).toHaveText('Signing in');
    await backend.release();
    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('a customer who signs in lands on their inbox, signed in', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(page).toHaveURL(/\/inbox$/);
    await expect(signIn.header.accountButton).toHaveAccessibleName('Account menu for Marcia Thompson');
  });

  test('a caterer who signs in lands on their dashboard', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.kendra.email, SEED_PASSWORD);

    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('L2-013.3: after signing in, a person returns to the page that asked them to', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open('?returnUrl=%2Fcaterers%2Fpelau-house');

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(page).toHaveURL(/\/caterers\/pelau-house$/);
  });

  test('a return address on another site is ignored', async ({ page }) => {
    const signIn = new SignInPage(page);
    await signIn.open('?returnUrl=https%3A%2F%2Fevil.example%2F');

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('when sign-in fails on our side the email is kept and the person can try again', async ({ page, backend }) => {
    await backend.fail('POST /api/identity/sign-in', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '7f3c2a91' } });
    const signIn = new SignInPage(page);
    await signIn.open();

    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);

    await expect(signIn.alert).toHaveAttribute('role', 'alert');
    await expect(signIn.alert).toContainText('We couldn’t sign you in just now');
    await expect(signIn.alert).toContainText('Something went wrong on our side. Your email is still here; try again in a moment. Reference 7f3c2a91.');
    await expect(signIn.email).toHaveValue(cast.marcia.email);
    await signIn.expectNoAccessibilityViolations();

    await signIn.password.fill(SEED_PASSWORD);
    await signIn.alert.getByRole('button', { name: 'Try again' }).click();
    await expect(page).toHaveURL(/\/inbox$/);
  });
});

test.describe('Pages that need an account', () => {
  test('L2-013: opening an account page while signed out asks the visitor to sign in, then returns them', async ({ page }) => {
    const signIn = new SignInPage(page);

    await page.goto('/inbox');

    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Finbox$/);
    await signIn.signIn(cast.marcia.email, SEED_PASSWORD);
    await expect(page).toHaveURL(/\/inbox$/);
  });

  test('L2-056.3: a customer who opens an operator page sees "No access"', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const signIn = new SignInPage(page);

    await page.goto('/admin/queue');

    await expect(signIn.heading).toHaveText('No access');
    await expect(page).toHaveURL(/\/admin\/queue$/);
  });
});
