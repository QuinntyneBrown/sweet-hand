import { test, expect } from '../../support/test';
import { ProfileMenuPage } from '../../pages/profile-menu.page';

const pelauDishes = async (backend: { state(): Promise<any> }) =>
  (await backend.state()).caterers.find((c: { slug: string }) => c.slug === 'pelau-house').dishes as { name: string; description?: string; tags: string[]; price?: string }[];

test.describe('Menu', () => {
  test('L2-043 L2-017: dishes in page order with their details and Move, Edit and Remove', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const menu = new ProfileMenuPage(page);

    await menu.open();

    await expect(menu.heading).toHaveText('Menu');
    await expect(menu.subtitle).toHaveText('18 dishes · shown in this order on your page');
    await expect(menu.rows).toHaveCount(18);
    await expect(menu.row('Chicken pelau').locator('.dish__price')).toHaveText('From $16 per person');
    await expect(menu.row('Chicken pelau').locator('.dish__desc')).toHaveText('Browned in burnt sugar, cooked down with pigeon peas, rice and coconut milk.');
    await expect(menu.row('Chicken pelau').locator('.tag')).toHaveText(['Gluten-free', 'Dairy-free']);
    await expect(menu.row('Shrimp fried rice').locator('.tag')).toHaveClass(/tag--allergen/);
    await expect(menu.moveUp('Chicken pelau')).toHaveAttribute('aria-disabled', 'true');
    await expect(menu.moveDown('Paw paw chow')).toHaveAttribute('aria-disabled', 'true');
    await expect(menu.edit('Curry goat')).toHaveAttribute('aria-haspopup', 'dialog');
    await menu.expectNoAccessibilityViolations();
  });

  test('L2-043.1: a new dish is added at the end and can be moved into place', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const menu = new ProfileMenuPage(page);
    await menu.open();

    await menu.addDish.click();

    await expect(menu.dish.title).toHaveText('Add a dish');
    await expect(menu.dish.description).toHaveText('It goes to the end of your menu. You can move it after.');
    await expect(menu.dishName).toBeFocused();
    await menu.expectNoAccessibilityViolations();
    await menu.dishName.fill('Pepperpot');
    await menu.dishDescription.fill('Beef and oxtail stewed black with cassareep, cinnamon and orange peel.');
    await expect(menu.dish.counter).toHaveText('70 / 300');
    await menu.tag('Gluten-free').check();
    await menu.tag('Dairy-free').check();
    await menu.dishPrice.fill('From $20 per person');
    await backend.hold('POST /api/caterer/profile/menu-items');
    await menu.dish.button('Add dish').click();

    await expect(menu.dish.button('Add dish')).toHaveAttribute('aria-busy', 'true');
    await expect(menu.dish.button('Cancel')).toBeDisabled();
    await expect(menu.dishName).toHaveAttribute('readonly', '');
    await expect(menu.dish.status).toHaveText('Adding the dish');
    await menu.expectNoAccessibilityViolations();
    await backend.release();

    await expect(menu.dish.root).toBeHidden();
    await expect(menu.names.last()).toHaveText('Pepperpot');
    await expect(menu.subtitle).toHaveText('19 dishes · shown in this order on your page');
    expect((await pelauDishes(backend)).at(-1)).toMatchObject({
      name: 'Pepperpot',
      description: 'Beef and oxtail stewed black with cassareep, cinnamon and orange peel.',
      tags: ['gluten-free', 'dairy-free'],
      price: 'From $20 per person',
    });

    await menu.moveUp('Pepperpot').click();
    await expect(menu.names.nth(17)).toHaveText('Pepperpot');
    await expect(menu.moveUp('Pepperpot')).toBeFocused();
    expect((await pelauDishes(backend))[17].name).toBe('Pepperpot');
  });

  test('L2-043.4: a one-character name and long price guidance are refused inline', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const menu = new ProfileMenuPage(page);
    await menu.open();
    await menu.addDish.click();

    await menu.dishName.fill('P');
    await menu.dishPrice.fill('From $20 per person for parties of 20 or more, delivered hot.');
    await menu.dish.button('Add dish').click();

    await expect(menu.dish.summary).toBeFocused();
    await expect(menu.dish.summaryHeading).toHaveText('Fix 2 things to add this dish');
    await expect(menu.dish.summaryItems).toHaveText(['Dish names are 2–80 characters', 'Keep price guidance to 60 characters']);
    await expect(menu.dish.errorFor('dish-name')).toHaveText('Dish names are 2–80 characters');
    await expect(menu.dish.errorFor('dish-price')).toHaveText('Keep price guidance to 60 characters (this is 61)');
    await expect(menu.dishName).toHaveAttribute('aria-invalid', 'true');
    await menu.expectNoAccessibilityViolations();

    // The field takes no more than 80 characters; the API refuses 81 (profile-api.spec.ts).
    await menu.dishName.fill('P'.repeat(81));
    await expect(menu.dishName).toHaveValue('P'.repeat(80));
    expect((await backend.requests()).filter((r) => r.method === 'POST')).toHaveLength(0);
  });

  test('a failed add keeps the entries and offers Try again', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const menu = new ProfileMenuPage(page);
    await menu.open();
    await menu.addDish.click();
    await backend.fail('POST /api/caterer/profile/menu-items', { network: true, times: 1 });

    await menu.dishName.fill('Pepperpot');
    await menu.dish.button('Add dish').click();

    await expect(menu.dish.alert).toContainText('We couldn’t add “Pepperpot”');
    await expect(menu.dish.alert).toContainText('Your entries are still here. Check your connection and try again.');
    await menu.dish.button('Try again').click();
    await expect(menu.dish.root).toBeHidden();
    await expect(menu.names.last()).toHaveText('Pepperpot');
  });

  test('editing a dish starts from its saved values', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const menu = new ProfileMenuPage(page);
    await menu.open();

    await menu.edit('Curry goat').click();

    await expect(menu.dish.title).toHaveText('Edit dish');
    await expect(menu.dish.description).toHaveText('Curry goat · dish 2 of 18');
    await expect(menu.dishName).toHaveValue('Curry goat');
    await expect(menu.dishDescription).toHaveValue('Slow-cooked with scotch bonnet.');
    await expect(menu.dish.counter).toHaveText('31 / 300');
    await expect(menu.tag('Halal')).toBeChecked();
    await expect(menu.dishPrice).toHaveValue('From $18 per person');
    await menu.expectNoAccessibilityViolations();
    await menu.dishPrice.fill('From $19 per person');
    await menu.dish.button('Save changes').click();

    await expect(menu.dish.root).toBeHidden();
    await expect(menu.row('Curry goat').locator('.dish__price')).toHaveText('From $19 per person');
    await expect(menu.edit('Curry goat')).toBeFocused();
  });

  test('removing a dish asks first and is busy while it goes', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const menu = new ProfileMenuPage(page);
    await menu.open();

    await menu.removeButton('Curry goat').click();

    await expect(menu.remove.title).toHaveText('Remove “Curry goat”?');
    await expect(menu.remove.description).toHaveText('It comes off your page within a minute. You can add it again later.');
    await expect(menu.remove.button('Cancel')).toBeFocused();
    await menu.expectNoAccessibilityViolations();
    await backend.hold('DELETE /api/caterer/profile/menu-items/*');
    await menu.remove.button('Remove dish').click();
    await expect(menu.remove.button('Remove dish')).toHaveAttribute('aria-busy', 'true');
    await expect(menu.remove.status).toHaveText('Removing Curry goat');
    await backend.release();

    await expect(menu.remove.root).toBeHidden();
    await expect(menu.rows).toHaveCount(17);
    await expect(menu.row('Curry goat')).toHaveCount(0);
  });

  test('L2-043.2: a published profile with exactly 3 dishes cannot remove one', async ({ page, backend }) => {
    await backend.signInAs('paulette');
    const menu = new ProfileMenuPage(page);
    await menu.open();

    await menu.removeButton('Sorrel').click();

    await expect(menu.remove.title).toHaveText('Keep at least 3 dishes');
    await expect(menu.remove.description).toHaveText('Published profiles need at least 3 dishes. Add another dish before you remove “Sorrel”.');
    await expect(menu.remove.button('Add a dish')).toBeFocused();
    await menu.expectNoAccessibilityViolations();
    await menu.remove.button('Add a dish').click();
    await expect(menu.dish.title).toHaveText('Add a dish');
  });

  test('L2-043.3: at 50 dishes Add dish is unavailable with the limit explained', async ({ page, backend }) => {
    await backend.signInAs('vishnu');
    const menu = new ProfileMenuPage(page);

    await menu.open();

    await expect(menu.subtitle).toHaveText('50 of 50 dishes · shown in this order on your page');
    await expect(menu.addDish).toBeDisabled();
    await expect(menu.limitHelp).toHaveText('You can list up to 50 dishes. Remove one to add another.');
    await menu.expectNoAccessibilityViolations();
  });

  test('first run, read-only in review, loading and error', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'new' });
    await backend.signInAs('beverley');
    const menu = new ProfileMenuPage(page);

    await menu.open();
    await expect(menu.subtitle).toHaveText('List 3 to 50 dishes, in the order you want them shown.');
    await expect(menu.empty.locator('.empty__title')).toHaveText('What do you cook best?');
    await expect(menu.empty).toContainText('Add at least 3 dishes. A name is enough; descriptions, dietary tags and prices help people choose.');
    await expect(menu.addDish).toHaveText('Add your first dish');
    await menu.expectNoAccessibilityViolations();

    await backend.scenario('beverley', { state: 'pending' });
    await menu.open();
    await expect(menu.subtitle).toHaveText('5 dishes · shown in this order on your page');
    await expect(menu.alertTitle).toHaveText('Waiting for review');
    await expect(menu.rows).toHaveCount(5);
    await expect(menu.main.getByRole('button', { name: /^(Move|Edit|Remove) / })).toHaveCount(0);
    await expect(menu.addDish).toHaveCount(0);
    await menu.expectNoAccessibilityViolations();

    await backend.hold('GET /api/caterer/profile');
    await menu.open();
    await expect(menu.loadingStatus.first()).toHaveText('Loading your menu');
    await menu.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/profile', { status: 500, times: 1 });
    await backend.release();
    await menu.open();
    await expect(menu.loadError.locator('.empty__title')).toHaveText('We couldn’t load your menu');
    await menu.expectNoAccessibilityViolations();
  });
});
