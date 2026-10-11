import { test, expect } from '../../support/test';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { RegisterPage } from '../../pages/register.page';
import { RegisterCatererPage } from '../../pages/register-caterer.page';
import { cast } from '../../support/cast';

test.describe('Verify email', () => {
  test('L2-077.3: while the link is checked the page shows its shape and says so, then confirms', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-verification', { email: cast.marcia.email });
    await backend.hold('POST /api/identity/email-verifications');
    const verify = new VerifyEmailPage(page);

    await verify.open(link);

    await expect(verify.busyRegion).toBeVisible();
    await expect(verify.heading).toHaveText('Verifying your email');
    await expect(verify.status).toHaveText('Verifying your email…');
    await expect(verify.skeletons.first()).toBeVisible();
    await verify.expectNoAccessibilityViolations();

    await backend.release();
    await expect(verify.heading).toHaveText('Your email is verified');
    await expect(verify.subtitle).toHaveText('Thanks, Marcia. You can send enquiries now.');
    await expect(verify.link('Browse caterers')).toHaveAttribute('href', '/caterers');
    await verify.expectNoAccessibilityViolations();
    const { users } = await backend.state();
    expect(users.find((u: { email: string }) => u.email === cast.marcia.email).emailVerified).toBe(true);
  });

  test('L2-023.3: an enquiry saved before verifying is one tap away', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-verification', { email: cast.marcia.email });
    await backend.scenario('save-enquiry-draft', { email: cast.marcia.email, catererSlug: 'pelau-house', eventDate: '2026-11-21', guests: 120 });
    const verify = new VerifyEmailPage(page);

    await verify.open(link);

    await expect(verify.savedEnquiry).toContainText('Your enquiry to Pelau House is still saved');
    await expect(verify.savedEnquiry).toContainText('Sat 21 Nov · 120 guests');
    await expect(verify.link('Finish your enquiry')).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(verify.link('Browse caterers')).toBeVisible();
    await verify.expectNoAccessibilityViolations();
  });

  test('L2-077.3: a link older than 24 hours is refused and a new one can be sent', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-verification', { email: cast.marcia.email });
    await backend.setNow('2026-10-11T14:01:00Z');
    const verify = new VerifyEmailPage(page);

    await verify.open(link);

    await expect(verify.heading).toHaveText('This link has expired');
    await expect(verify.subtitle).toHaveText('Verification links work for 24 hours. We can send you a new one.');
    await expect(verify.link('Check your account')).toHaveAttribute('href', '/account');
    await verify.expectNoAccessibilityViolations();

    await verify.button('Resend verification email').click();

    await expect(page).toHaveURL(/\/verify-email\/sent$/);
    await expect(verify.heading).toHaveText('Check your email');
    await expect(verify.subtitle).toHaveText(`We sent a new link to ${cast.marcia.email}. It works for 24 hours.`);
    expect((await backend.emails()).filter((m: { kind: string }) => m.kind === 'verify-email')).toHaveLength(2);
  });

  test('when verifying fails on our side the link still works and can be tried again', async ({ page, backend }) => {
    const { link } = await backend.scenario('issue-verification', { email: cast.marcia.email });
    await backend.fail('POST /api/identity/email-verifications', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: 'e2190d5c' } });
    const verify = new VerifyEmailPage(page);

    await verify.open(link);

    await expect(verify.heading).toHaveText('Verify email');
    await expect(verify.alert).toHaveAttribute('role', 'alert');
    await expect(verify.alert).toContainText('We couldn’t verify your email just now');
    await expect(verify.alert).toContainText('Something went wrong on our side. Your link still works; try again in a moment. Reference e2190d5c.');
    await expect(verify.link('Keep browsing')).toHaveAttribute('href', '/caterers');
    await verify.expectNoAccessibilityViolations();

    await verify.button('Try again').click();
    await expect(verify.heading).toHaveText('Your email is verified');
  });

  test('L2-023.2: after sending a new link, sending again is paused for 60 seconds', async ({ page, backend }) => {
    const register = new RegisterPage(page);
    const verify = new VerifyEmailPage(page);
    await register.open();
    await register.register({ name: 'Priya Singh', email: 'priya.singh@example.com', password: 'callaloo-and-dumplings' });

    await register.button('Resend email').click();

    await expect(page).toHaveURL(/\/verify-email\/sent$/);
    await expect(verify.subtitle).toHaveText('We sent a new link to priya.singh@example.com. It works for 24 hours.');
    await expect(verify.link('Browse caterers')).toHaveAttribute('href', '/caterers');
    await expect(verify.button('Resend email')).toBeDisabled();
    await expect(verify.button('Resend email')).toHaveAccessibleDescription('You can resend in 60 seconds. Check your spam folder too.');
    await verify.expectNoAccessibilityViolations();
    expect((await backend.emails()).filter((m: { to: string; kind: string }) => m.to === 'priya.singh@example.com' && m.kind === 'verify-email')).toHaveLength(2);

    await page.clock.runFor(60_000);
    await expect(verify.button('Resend email')).toBeEnabled();
    await verify.button('Resend email').click();
    await expect(verify.button('Resend email')).toBeDisabled();
    expect((await backend.emails()).filter((m: { to: string; kind: string }) => m.to === 'priya.singh@example.com' && m.kind === 'verify-email')).toHaveLength(3);
  });

  test('a new caterer can have the link sent again from the welcome screen', async ({ page }) => {
    const join = new RegisterCatererPage(page);
    const verify = new VerifyEmailPage(page);
    await join.open();
    await join.register({ business: 'Auntie Bev’s Kitchen', contact: 'Beverley Campbell', email: 'beverley@auntiebevs.example', phone: '905-555-0164', password: 'oxtail-and-rice-on-sunday' });

    await join.link('Resend it').click();

    await expect(verify.heading).toHaveText('Check your email');
    await expect(verify.subtitle).toHaveText('We sent a new link to beverley@auntiebevs.example. It works for 24 hours.');
  });
});
