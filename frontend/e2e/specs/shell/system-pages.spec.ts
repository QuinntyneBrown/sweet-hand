import { test, expect } from '../../support/test';
import { SystemPage } from '../../pages/system.page';
import { ListingPage } from '../../pages/listing.page';

test.describe('System pages', () => {
  test('an unknown address shows "Page not found" with a way back to the listing', async ({ page }) => {
    const system = new SystemPage(page);

    await system.open('/no-such-page');

    await expect(system.heading).toHaveText('Page not found');
    await expect(system.text).toHaveText('We couldn’t find that page. It may have moved, or the caterer may no longer be listed.');
    await expect(system.code).toHaveText('Error 404');
    await expect(system.action('Browse caterers')).toHaveAttribute('href', '/caterers');
    await expect(system.footer.links).toHaveText(['About', 'Cater with us', 'Privacy', 'Terms']);
    await system.expectNoAccessibilityViolations();

    await system.action('Browse caterers').click();
    await expect(page).toHaveURL(/\/caterers$/);
  });

  test('the "No access" page offers Sweet Hand and another account', async ({ page }) => {
    const system = new SystemPage(page);

    await system.open('/403');

    await expect(system.heading).toHaveText('No access');
    await expect(system.code).toHaveText('Error 403');
    await expect(system.actions).toHaveText(['Go to Sweet Hand', 'Sign in with another account']);
    await system.expectNoAccessibilityViolations();
  });

  test('L2-089.4: the error page gives a reference that can be copied, and no internal details', async ({ page, context }) => {
    await context.grantPermissions(['clipboard-read', 'clipboard-write']);
    const system = new SystemPage(page);

    await system.open('/500?ref=4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90');

    await expect(system.heading).toHaveText('Something went wrong');
    await expect(system.code).toContainText('Reference 4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90');
    await expect(system.actions).toHaveText(['Try again', 'Browse caterers']);
    await system.expectNoAccessibilityViolations();

    await system.copyReference.click();

    await expect(system.status).toHaveText('Copied');
    expect(await page.evaluate(() => navigator.clipboard.readText())).toBe('4b7e9c21-0d3a-4f6e-9a41-2c5d8e7f1a90');
  });

  test('L2-082.1: too many requests shows "Slow down a little"', async ({ page, backend }) => {
    await backend.fail('GET /api/public/caterers*', { status: 429, headers: { 'retry-after': '60' } });
    const listing = new ListingPage(page);
    const system = new SystemPage(page);

    await listing.open();

    await expect(system.heading).toHaveText('Slow down a little');
    await expect(system.code).toHaveText('Error 429');
    await expect(system.action('Try again in 1 minute')).toHaveAttribute('aria-disabled', 'true');
    await expect(page).toHaveURL(/\/caterers$/);
    await system.expectNoAccessibilityViolations();
  });

  test('L2-088: during planned maintenance the page says when Sweet Hand is back', async ({ page, backend }) => {
    await backend.fail('GET /api/public/caterers*', {
      status: 503,
      body: { title: 'Planned maintenance', from: '2026-10-11T05:00:00Z', until: '2026-10-11T07:00:00Z' },
    });
    const listing = new ListingPage(page);
    const system = new SystemPage(page);

    await listing.open();

    await expect(system.heading).toHaveText('Back soon');
    await expect(system.text).toHaveText('Sweet Hand is down for planned maintenance until 3:00 a.m. Toronto time. Your enquiries and messages are safe.');
    await expect(system.code).toHaveText('Sunday 11 October 2026 · 1:00 to 3:00 a.m.');
    await expect(system.action('Check again')).toBeVisible();
  });

  test('the offline page offers to try again', async ({ page }) => {
    const system = new SystemPage(page);

    await system.open('/offline');

    await expect(system.heading).toHaveText('You’re offline');
    await expect(system.action('Try again')).toBeVisible();
  });
});
