import { test, expect } from '../../support/test';
import { RegisterCatererPage } from '../../pages/register-caterer.page';
import { cast } from '../../support/cast';

const beverley = {
  business: 'Auntie Bev’s Kitchen',
  contact: 'Beverley Campbell',
  email: 'beverley@auntiebevs.example',
  phone: '(905) 555 0164',
  password: 'oxtail-and-rice-on-sunday',
};

test.describe('Register as a caterer', () => {
  test('L2-037 L2-056.1: the form asks for the business, contact, phone and two unticked confirmations, and offers no role', async ({ page }) => {
    const join = new RegisterCatererPage(page);

    await join.open();

    await expect(join.heading).toHaveText('Cater with Sweet Hand');
    await expect(join.subtitle).toHaveText('Free to list. Customers find you by cuisine and area and send enquiries straight to you.');
    await expect(join.businessName).toBeFocused();
    await expect(join.businessName).toHaveAttribute('autocomplete', 'organization');
    await expect(join.helpFor('business')).toHaveText('As customers will see it. 2 to 80 characters.');
    await expect(join.contactName).toHaveAttribute('autocomplete', 'name');
    await expect(join.email).toHaveAttribute('type', 'email');
    await expect(join.phone).toHaveAttribute('type', 'tel');
    await expect(join.phone).toHaveAttribute('autocomplete', 'tel');
    await expect(join.helpFor('phone')).toHaveText('10-digit Canadian number');
    await expect(join.password).toHaveAttribute('autocomplete', 'new-password');
    await expect(join.sellsCaribbeanFood).not.toBeChecked();
    await expect(join.acceptsTerms).not.toBeChecked();
    await expect(join.acceptsTerms).toHaveAccessibleDescription(
      'We use your contact details to run your account and reach you about your listing. Customers never see your email or phone unless you share them in a conversation. Everything is stored in Canada.',
    );
    await expect(join.termsLink('caterer terms')).toHaveAttribute('href', '/terms');
    await expect(join.termsLink('privacy notice')).toHaveAttribute('href', '/privacy');
    await expect(join.roleChoices).toHaveCount(0);
    await expect(join.link('Sign in')).toHaveAttribute('href', '/sign-in');
    await expect(join.link('Create a customer account')).toHaveAttribute('href', '/register');
    await join.expectNoAccessibilityViolations();
  });

  test('L2-064.2: the form fits a phone without scrolling sideways', async ({ page }) => {
    const join = new RegisterCatererPage(page);
    await join.usePhone();

    await join.open();

    await expect(join.submit).toBeVisible();
    await join.expectNoHorizontalScroll();
    await join.expectNoAccessibilityViolations();
  });

  test('L2-037.2 L2-037.3: a short phone number and unticked boxes are refused and highlighted, and nothing is sent', async ({ page, backend }) => {
    const join = new RegisterCatererPage(page);
    await join.open();

    await join.register({ ...beverley, phone: '555-0199', confirm: false });

    await expect(join.errorSummary).toBeFocused();
    await expect(join.errorSummary.getByRole('heading')).toHaveText('Fix 3 things to create your caterer account');
    await expect(join.errorSummary.getByRole('link')).toHaveText([
      'Enter a 10-digit Canadian phone number',
      'Confirm that you sell Caribbean food in Toronto or the GTA',
      'Accept the caterer terms and privacy notice to continue',
    ]);
    await expect(join.phone).toHaveAttribute('aria-invalid', 'true');
    await expect(join.errorFor('phone')).toHaveText('Enter a 10-digit Canadian phone number');
    await expect(join.sellsCaribbeanFood).toHaveAttribute('aria-invalid', 'true');
    await expect(join.errorFor('sells')).toHaveText('Confirm that you sell Caribbean food in Toronto or the GTA');
    await expect(join.acceptsTerms).toHaveAttribute('aria-describedby', 'terms-error terms-summary');
    await expect(join.businessName).toHaveValue(beverley.business);
    await join.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path.startsWith('/api/identity/registrations'))).toHaveLength(0);
  });

  test('L2-037.2: a number outside North America is refused', async ({ page }) => {
    const join = new RegisterCatererPage(page);
    await join.open();

    await join.register({ ...beverley, phone: '+44 20 7946 0958' });

    await expect(join.errorFor('phone')).toHaveText('Enter a 10-digit Canadian phone number');
  });

  test('while the account is created the form is busy', async ({ page, backend }) => {
    await backend.hold('POST /api/identity/registrations/caterer');
    const join = new RegisterCatererPage(page);
    await join.open();

    await join.register(beverley);

    await expect(join.submit).toHaveAttribute('aria-busy', 'true');
    await expect(join.phone).toHaveAttribute('readonly', '');
    await expect(join.status).toHaveText('Creating your caterer account');
    await backend.release();
    await expect(join.heading).toHaveText('Welcome, Beverley');
  });

  test('when registration fails on our side the details are kept', async ({ page, backend }) => {
    await backend.fail('POST /api/identity/registrations/caterer', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '2c88f0a4' } });
    const join = new RegisterCatererPage(page);
    await join.open();

    await join.register(beverley);

    await expect(join.alert).toHaveAttribute('role', 'alert');
    await expect(join.alert).toContainText('We couldn’t create your account');
    await expect(join.alert).toContainText('Something went wrong on our side. Your details are still here; enter your password again and retry. Reference 2c88f0a4.');
    await expect(join.phone).toHaveValue(beverley.phone);
    await expect(join.password).toHaveValue('');
    await expect(join.acceptsTerms).toBeChecked();
    await join.expectNoAccessibilityViolations();
  });

  test('L2-037.1 L2-037.2 L2-070.3: a new caterer gets a draft profile, a verification email and the next steps, then sets up their profile', async ({ page, backend }) => {
    const join = new RegisterCatererPage(page);
    await join.open();

    await join.register(beverley);

    await expect(join.heading).toHaveText('Welcome, Beverley');
    await expect(join.subtitle).toHaveText(
      'Your account for Auntie Bev’s Kitchen is ready. We sent a link to beverley@auntiebevs.example; verify it before you submit your profile for review.',
    );
    await expect(join.steps).toHaveText([
      'Done: Account created',
      'To do: Verify your email',
      'To do: Add photos, menu and food safety certificate',
      'To do: Submit for review (about 3 business days)',
    ]);
    await expect(join.steps.nth(1)).toHaveAttribute('data-missing', '');
    await expect(join.header.accountButton).toHaveAccessibleName('Account menu for Beverley Campbell');
    await join.expectNoAccessibilityViolations();

    const { users, caterers } = await backend.state();
    const user = users.find((u: { email: string }) => u.email === beverley.email);
    expect(user).toMatchObject({ role: 'Caterer', displayName: 'Beverley Campbell', phone: '+19055550164', emailVerified: false, acceptedPrivacyVersion: '2026-03' });
    expect(caterers.find((c: { id: string }) => c.id === user.catererId)).toMatchObject({ name: 'Auntie Bev’s Kitchen', status: 'Draft' });
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: beverley.email, kind: 'verify-email' }));

    await join.link('Set up your profile').click();
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('L2-037.4: an email that is already registered gets the same welcome, and the owner is emailed instead', async ({ page, backend }) => {
    const join = new RegisterCatererPage(page);
    await join.open();

    await join.register({ ...beverley, email: cast.marcia.email });

    await expect(join.heading).toHaveText('Welcome, Beverley');
    await expect(join.subtitle).toContainText(`We sent a link to ${cast.marcia.email}`);
    const { users } = await backend.state();
    expect(users.filter((u: { email: string }) => u.email === cast.marcia.email)).toHaveLength(1);
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: cast.marcia.email, kind: 'registration-attempt' }));
  });
});
