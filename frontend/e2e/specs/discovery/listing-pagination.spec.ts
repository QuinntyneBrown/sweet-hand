import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer listing: pages', () => {
  test('pagination AC-1: page 1 of 3 says what it shows and offers the other pages', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.paginationSummary).toHaveText('Showing 1–24 of 60');
    await expect(listing.previousPage).toHaveAttribute('aria-disabled', 'true');
    await expect(listing.previousPage).not.toHaveAttribute('href');
    await expect(listing.pageLink(1)).toHaveAttribute('aria-current', 'page');
    await expect(listing.pageLinks).toHaveText(['1', '2', '3']);
    await expect(listing.nextPage).toHaveAttribute('href', '/caterers?page=2');
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-002.1 L2-002.2: page 1 shows 24, page 2 shows 24 and page 3 shows 12, each caterer exactly once', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    const seen: string[] = [];

    await expect(listing.cards).toHaveCount(24);
    seen.push(...(await listing.cardNames()));
    await listing.pageLink(2).click();
    await expect(page).toHaveURL(/\/caterers\?page=2$/);
    await expect(listing.paginationSummary).toHaveText('Showing 25–48 of 60');
    await expect(listing.cards).toHaveCount(24);
    seen.push(...(await listing.cardNames()));
    await listing.nextPage.click();
    await expect(listing.paginationSummary).toHaveText('Showing 49–60 of 60');
    await expect(listing.cards).toHaveCount(12);
    seen.push(...(await listing.cardNames()));

    expect(seen).toHaveLength(60);
    expect(new Set(seen).size).toBe(60);
    await expect(listing.nextPage).toHaveAttribute('aria-disabled', 'true');
    await expect(listing.previousPage).toHaveAttribute('href', '/caterers?page=2');
    await expect(listing.pageLink(3)).toHaveAttribute('aria-current', 'page');
  });

  test('pagination D-7: after a page change focus moves to the results', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();

    await listing.pageLink(2).click();

    await expect(listing.paginationSummary).toHaveText('Showing 25–48 of 60');
    await expect(listing.resultsHeading).toBeFocused();
  });

  test('L2-003.2: Back returns to the previous page of results', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open('?page=2');
    await expect(listing.paginationSummary).toHaveText('Showing 25–48 of 60');

    await listing.pageLink(3).click();
    await expect(listing.paginationSummary).toHaveText('Showing 49–60 of 60');
    await page.goBack();

    await expect(page).toHaveURL(/\/caterers\?page=2$/);
    await expect(listing.paginationSummary).toHaveText('Showing 25–48 of 60');
    await expect(listing.pageLink(2)).toHaveAttribute('aria-current', 'page');
  });

  for (const bad of ['0', '-1', '1.5', 'two', '9']) {
    test(`L2-002.5: page "${bad}" shows page 1 without an error`, async ({ page }) => {
      const listing = new ListingPage(page);

      await listing.open(`?page=${bad}`);

      await expect(listing.paginationSummary).toHaveText('Showing 1–24 of 60');
      await expect(listing.pageLink(1)).toHaveAttribute('aria-current', 'page');
      await expect(listing.cards).toHaveCount(24);
    });
  }

  test('pagination D-2: a single page of results shows no pagination', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open('?cuisine=haitian');

    await expect(listing.resultCount).toHaveText('5 caterers');
    await expect(listing.pagination).toHaveCount(0);
  });

  test('pagination AC-19: at phone width page links are large enough to tap and nothing scrolls sideways', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.usePhone();

    await listing.open();

    await expect(listing.paginationSummary).toHaveText('Showing 1–24 of 60');
    const box = await listing.pageLink(2).boundingBox();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);
    await listing.expectNoHorizontalScroll();
    await listing.expectNoAccessibilityViolations();
  });
});
