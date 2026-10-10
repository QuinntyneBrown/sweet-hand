import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { ListingPage } from '../../pages/listing.page';
import { WEB_URL } from '../../support/ports';

test.describe('Caterer page', () => {
  test('L2-004.3: activating a card opens that caterer page', async ({ page }) => {
    const listing = new ListingPage(page);
    const caterer = new CatererPage(page);
    await listing.open();

    await listing.openCaterer('Island Pot');

    await expect(page).toHaveURL(/\/caterers\/island-pot$/);
    await expect(caterer.heading).toHaveText('Island Pot');
  });

  test('L2-013.1 L2-015: a visitor sees the name, cuisines with the primary first, and the description in paragraphs', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(caterer.heading).toHaveText('Pelau House');
    await expect(caterer.cuisines).toHaveText(['Trinidadian & Tobagonian', 'Guyanese']);
    await expect(caterer.description).toHaveCount(2);
    await expect(caterer.description.first()).toHaveText(/^Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva\./);
    await expect(caterer.description.last()).toHaveText(/^Everything is cooked the morning of your event and arrives hot/);
    await expect(caterer.backLink).toHaveText('Caterers');
    await expect(caterer.backLink).toHaveAttribute('href', '/caterers');
    await expect(page).toHaveURL(/\/caterers\/pelau-house$/);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-018.4: the page has a title, description, canonical link and Open Graph tags', async ({ page }) => {
    const caterer = new CatererPage(page);

    await caterer.open('pelau-house');

    await expect(page).toHaveTitle('Pelau House · Sweet Hand');
    await expect(caterer.metaContent('description')).toHaveAttribute('content', /^Kendra Baptiste learned to burn sugar for pelau/);
    await expect(caterer.canonical).toHaveAttribute('href', `${WEB_URL}/caterers/pelau-house`);
    await expect(caterer.metaContent('og:title')).toHaveAttribute('content', 'Pelau House');
    await expect(caterer.metaContent('og:description')).toHaveAttribute('content', /^Kendra Baptiste learned to burn sugar for pelau/);
    await expect(caterer.metaContent('og:image')).toHaveAttribute('content', `${WEB_URL}/media/pelau-house.jpg?w=1200&fm=jpeg`);
    await expect(caterer.metaContent('og:url')).toHaveAttribute('content', `${WEB_URL}/caterers/pelau-house`);
  });
});
