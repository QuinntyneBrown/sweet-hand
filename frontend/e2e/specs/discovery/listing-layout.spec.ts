import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: layout, access and order', () => {
  for (const [label, width, columns] of [
    ['XS', 360, 1],
    ['SM', 600, 2],
    ['MD', 800, 2],
    ['LG', 1000, 3],
    ['XL', 1440, 3],
  ] as const) {
    test(`L2-005: at ${label} (${width} px) the grid has ${columns} column${columns > 1 ? 's' : ''}`, async ({ page }) => {
      const listing = new ListingPage(page);
      await page.setViewportSize({ width, height: 900 });

      await listing.open();

      await expect(listing.cards).toHaveCount(24);
      expect(await listing.gridColumns()).toBe(columns);
      await listing.expectNoHorizontalScroll();
    });
  }

  test('L2-005.6 filter-trigger AC-16: at 320 px nothing scrolls sideways and the phone buttons are 44 px tall', async ({ page }) => {
    const listing = new ListingPage(page);
    await page.setViewportSize({ width: 320, height: 700 });

    await listing.open('?cuisine=jamaican&area=scarborough');

    await expect(listing.cards).toHaveCount(2);
    for (const button of [listing.filtersButton, listing.phoneAreaButton]) {
      const box = await button.boundingBox();
      expect(box!.height).toBeGreaterThanOrEqual(44);
    }
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-069.3 filter-list AC-18: at 200 % zoom on a 1280 px window the column gives way to the Filters button', async ({ page }) => {
    const listing = new ListingPage(page);
    // A 1280 px window at 200 % zoom lays out like a 640 px one.
    await page.setViewportSize({ width: 640, height: 450 });

    await listing.open();

    await expect(listing.filtersButton).toBeVisible();
    await expect(listing.filterColumn).toBeHidden();
    await listing.expectNoHorizontalScroll();
  });

  test('L2-013.1 L2-013.2: a visitor can filter and page the listing without being asked to sign in', async ({ page }) => {
    const listing = new ListingPage(page);

    const response = await page.goto('/caterers?region=city-of-toronto');

    expect(response?.status()).toBe(200);
    await expect(listing.resultCount).toHaveText('30 caterers');
    await listing.cuisineOption('Jamaican').click();
    await expect(listing.resultCount).toHaveText('6 caterers');
    await listing.allCuisines.click();
    await listing.pageLink(2).click();
    await expect(listing.paginationSummary).toHaveText('Showing 25–30 of 30');
    await expect(page).toHaveURL(/\/caterers\?region=city-of-toronto&page=2$/);
    await expect(page.getByRole('dialog')).toHaveCount(0);
  });

  test('L2-029 caterers signed-in: a signed-in customer browses and filters the same listing', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.header.link('Inbox, 1 unread enquiry')).toBeVisible();
    await expect(listing.resultCount).toHaveText('60 caterers');
    await listing.cuisineOption('Haitian').click();
    await expect(listing.resultCount).toHaveText('5 caterers');
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-002.3 L2-002.4: the order is the same all day and changes the next day', async ({ page, backend }) => {
    const listing = new ListingPage(page);
    await backend.setNow('2026-10-11T14:00:00.000Z');

    await listing.open();
    await expect(listing.cards).toHaveCount(24);
    const first = await listing.cardNames();
    await listing.open();
    await expect(listing.cards).toHaveCount(24);
    const again = await listing.cardNames();
    await backend.setNow('2026-10-12T14:00:00.000Z');
    await listing.open();
    await expect(listing.cards).toHaveCount(24);
    const nextDay = await listing.cardNames();

    expect(again).toEqual(first);
    expect(nextDay).not.toEqual(first);
  });
});
