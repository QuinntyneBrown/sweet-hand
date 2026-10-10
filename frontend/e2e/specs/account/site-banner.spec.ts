import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';
import { AccountPage } from '../../pages/account.page';
import { VerifyEmailPage } from '../../pages/verify-email.page';
import { SiteBanner } from '../../pages/site-banner';
import { cast } from '../../support/cast';

const MAINTENANCE = { startsAt: '2026-10-18T05:00:00Z', endsAt: '2026-10-18T07:00:00Z' };

test.describe('Site banners', () => {
  test('L2-088: scheduled maintenance is announced under the header and can be dismissed on this device', async ({ page, backend }) => {
    await backend.scenario('schedule-maintenance', MAINTENANCE);
    const listing = new ListingPage(page);
    const banner = new SiteBanner(page);

    await listing.open();

    await expect(banner.root).toHaveAttribute('role', 'status');
    await expect(banner.title).toHaveText('Scheduled maintenance');
    await expect(banner.root).toContainText('Sunday 18 October, 1:00–3:00 a.m. Sweet Hand may be unavailable for up to two hours.');
    await expect(banner.dismiss).toHaveAccessibleName('Dismiss maintenance notice');
    await listing.expectNoAccessibilityViolations();

    await banner.dismiss.click();
    await expect(banner.root).toHaveCount(0);
    await expect(listing.main).toBeFocused();
    await listing.open();
    await expect(listing.cards.first()).toBeVisible();
    await expect(banner.root).toHaveCount(0);
  });

  test('L2-091: while a service is degraded a danger banner stays, and it outranks other notices', async ({ page, backend }) => {
    await backend.scenario('schedule-maintenance', MAINTENANCE);
    await backend.scenario('degrade-service');
    const listing = new ListingPage(page);
    const banner = new SiteBanner(page);

    await listing.open();

    await expect(banner.root).toHaveCount(1);
    await expect(banner.root).toHaveAttribute('role', 'alert');
    await expect(banner.root).toHaveClass(/alert--danger/);
    await expect(banner.title).toHaveText('Some things aren’t working right now');
    await expect(banner.root).toContainText('New messages may take a few minutes to appear. Nothing you send is lost.');
    await expect(banner.dismiss).toHaveCount(0);
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-030.3: after a bounce, a signed-in customer is asked to update their email', async ({ page, backend }) => {
    await backend.scenario('bounce-email', { email: cast.marcia.email });
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    const banner = new SiteBanner(page);

    await listing.open();

    await expect(banner.root).toHaveClass(/alert--warning/);
    await expect(banner.title).toHaveText(`We can’t deliver email to ${cast.marcia.email}`);
    await expect(banner.root).toContainText('Update your email so caterers’ replies reach you.');
    await listing.expectNoAccessibilityViolations();

    await banner.action('Update email').click();

    const account = new AccountPage(page);
    await expect(page).toHaveURL(/\/account/);
    await expect(account.editDetails.root).toBeVisible();
    await expect(banner.root).toHaveCount(0);
  });

  test('L2-023.2: an unverified customer sees a banner that cannot be dismissed, with a resend', async ({ page, backend }) => {
    await backend.scenario('unverify-email', { email: cast.marcia.email });
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    const banner = new SiteBanner(page);

    await listing.open();

    await expect(banner.title).toHaveText('Verify your email to send enquiries');
    await expect(banner.root).toContainText(`We sent a link to ${cast.marcia.email}.`);
    await expect(banner.dismiss).toHaveCount(0);
    await listing.expectNoAccessibilityViolations();

    await banner.action('Resend verification email').click();

    const verify = new VerifyEmailPage(page);
    await expect(verify.heading).toHaveText('Check your email');
  });

  test('once the email is verified elsewhere, a success banner says so and the reminder goes', async ({ page, backend }) => {
    await backend.scenario('unverify-email', { email: cast.marcia.email });
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    const banner = new SiteBanner(page);
    await listing.open();
    await expect(banner.title).toHaveText('Verify your email to send enquiries');

    await backend.scenario('verify-email-now', { email: cast.marcia.email });
    await page.clock.runFor(60_000);

    await expect(banner.root).toHaveClass(/alert--success/);
    await expect(banner.title).toHaveText('Email verified');
    await expect(banner.root).toContainText('You can now send enquiries to caterers.');
    await listing.expectNoAccessibilityViolations();
    await banner.dismiss.click();
    await expect(banner.root).toHaveCount(0);
  });
});
