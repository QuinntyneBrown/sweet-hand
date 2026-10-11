import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { ListingPage } from '../../pages/listing.page';

test.describe('Caterer page addresses and states', () => {
  for (const status of ['Suspended', 'Draft', 'Pending review', 'Changes requested']) {
    test(`L2-014.2 L2-018.5: a ${status} caterer's page is "Page not found" at the same address`, async ({ page, backend }) => {
      await backend.scenario('set-caterer-status', { slug: 'pelau-house', status });
      const caterer = new CatererPage(page);

      await caterer.open('pelau-house');

      await expect(caterer.heading).toHaveText('Page not found');
      await expect(page).toHaveURL(/\/caterers\/pelau-house$/);
    });
  }

  test('L2-018.5: a removed caterer\'s page says they have left, with no trace of the profile, and links back', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('coal-pot-kitchen');

    await expect(caterer.heading).toHaveText('This caterer has left Sweet Hand');
    await expect(caterer.systemText).toHaveText('The page you followed is no longer available. There are 60 other caterers cooking across Toronto and the GTA.');
    await expect(caterer.systemCode).toHaveText('Error 410');
    await expect(caterer.systemAction('Browse caterers')).toHaveAttribute('href', '/caterers');
    await expect(caterer.systemAction('Browse by occasion')).toHaveAttribute('href', '/occasions');
    expect(await caterer.pageMarkup()).not.toContain('Coal Pot Kitchen');
    await expect(page).toHaveURL(/\/caterers\/coal-pot-kitchen$/);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-018.3: after an approved name change the old address moves to the new one', async ({ page, backend }) => {
    await backend.scenario('rename-caterer', { slug: 'pelau-house', name: 'Pelau House by Kendra' });
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(page).toHaveURL(/\/caterers\/pelau-house-by-kendra$/);
    await expect(caterer.heading).toHaveText('Pelau House by Kendra');
  });

  test('L2-014.1 L2-014.3: contact details, the certificate and unapproved edits never reach the page or its API responses', async ({ page, backend }) => {
    await backend.scenario('request-name-change', { slug: 'pelau-house', name: 'Pelau House by Kendra' });
    const caterer = new CatererPage(page);

    const responses = await caterer.openCollectingResponses('pelau-house');

    await expect(caterer.heading).toHaveText('Pelau House');
    const everything = [await caterer.pageMarkup(), ...responses].join('\n');
    for (const secret of ['hello@pelauhouse.example', '416 555 0142', 'kendra@pelauhouse.example', 'FH-2024-118734', 'Toronto Public Health', 'Pelau House by Kendra', 'Published']) {
      expect(everything).not.toContain(secret);
    }
  });

  test('loading: after an in-app navigation the page shows skeletons in its final layout until the caterer arrives', async ({ page, backend }) => {
    const listing = new ListingPage(page);
    const caterer = new CatererPage(page);
    await listing.open();
    await backend.hold('GET /api/public/caterers/pelau-house');

    await listing.openCaterer('Pelau House');

    await expect(caterer.heading).toHaveText('Loading caterer');
    await expect(caterer.layout).toHaveAttribute('aria-busy', 'true');
    await expect(caterer.galleryBusy).toHaveCount(1);
    await expect(caterer.menuSkeleton).toHaveCount(6);
    await expect(caterer.loadingStatus).toHaveText('Loading caterer');
    await expect(caterer.stickyBar).toHaveCount(0);
    await caterer.expectNoAccessibilityViolations();

    await backend.release();
    await expect(caterer.heading).toHaveText('Pelau House');
    await expect(caterer.layout).not.toHaveAttribute('aria-busy');
  });

  test('error: when the caterer fails to load the page explains, gives a reference and can try again', async ({ page, backend }) => {
    await backend.fail('GET /api/public/caterers/pelau-house', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '7f3k-92qd' } });
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.heading).toHaveText('We couldn’t load this caterer');
    await expect(caterer.loadErrorText).toHaveText('Something went wrong on our side. Try again in a moment — the rest of Sweet Hand still works.');
    await expect(caterer.loadErrorReference).toHaveText('7f3k-92qd');
    await expect(caterer.loadErrorAction('Back to caterers')).toHaveAttribute('href', '/caterers');
    await expect(caterer.stickyBar).toHaveCount(0);
    await caterer.expectNoAccessibilityViolations();

    await caterer.loadErrorAction('Try again').click();
    await expect(caterer.heading).toHaveText('Pelau House');
  });
});
