import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';

test.describe('Caterer page offline', () => {
  test('L2-091: offline, the page stays readable, explains why, and holds enquiries and reports until the connection returns', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.heading).toHaveText('Pelau House');

    await caterer.setOnline(false);

    await expect(caterer.connectionBanner).toHaveAttribute('role', 'status');
    await expect(caterer.connectionBanner).toContainText('You’re offline');
    await expect(caterer.connectionBanner).toContainText('This is the copy saved from your last visit. Sending an enquiry or a report needs a connection.');
    const enquire = caterer.enquireButtonIn(caterer.panel);
    await expect(enquire).toBeDisabled();
    await expect(enquire).toHaveAccessibleDescription(/You’re offline/);
    await expect(caterer.panelNote).toHaveText('You’re offline. Send an enquiry as soon as you’re back online.');
    await expect(caterer.reportListing).toBeDisabled();
    await expect(caterer.dishes).toHaveCount(12);
    await caterer.expectNoAccessibilityViolations();

    await caterer.setOnline(true);

    await expect(caterer.connectionBanner).toContainText('Back online');
    await expect(enquire).toBeEnabled();
    await expect(caterer.reportListing).toBeEnabled();
    await expect(caterer.panelNote).toHaveText('Free to ask. Your email and phone stay private until you choose to share them.');
    await page.clock.runFor(4_000);
    await expect(caterer.connectionBanner).toHaveCount(0);
  });

  test('offline on a phone, the bar\'s "Send an enquiry" is disabled and explained', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.usePhone();
    await caterer.open('pelau-house');
    await expect(caterer.heading).toHaveText('Pelau House');

    await caterer.setOnline(false);

    const enquire = caterer.enquireButtonIn(caterer.stickyBar);
    await expect(enquire).toBeDisabled();
    await expect(enquire).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(enquire).toHaveAccessibleDescription(/You’re offline/);
    await caterer.expectNoHorizontalScroll();
    await caterer.setOnline(true);
  });
});
