import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';

test.describe('Caterer page photo viewer', () => {
  test('L2-016.2: activating a photo opens it full screen with its caption and position, focus on Close', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');

    await caterer.galleryPhoto(2).click();

    const viewer = caterer.viewer;
    await expect(viewer.dialog).toHaveAccessibleName('Pelau House photos');
    await expect(viewer.dialog).toHaveAttribute('aria-modal', 'true');
    await expect(viewer.count).toHaveText('2 of 6');
    await expect(viewer.caption).toHaveText('Curry chicken with rice and buss up shut in a steel karahi');
    await expect(viewer.dialog).toHaveAccessibleDescription('Curry chicken with rice and buss up shut in a steel karahi');
    await expect(viewer.image).toHaveAttribute('alt', 'Curry chicken with rice and buss up shut in a steel karahi');
    await expect(viewer.closeButton).toBeFocused();
    expect(await caterer.pageIsInert()).toBe(true);
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-016.3: arrow keys, Home, End, the buttons and swipes move between photos', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.galleryPhoto(2).click();
    const viewer = caterer.viewer;
    await expect(viewer.closeButton).toBeFocused();

    await viewer.press('ArrowRight');
    await expect(viewer.count).toHaveText('3 of 6');
    await expect(viewer.caption).toHaveText('Spiced rice lifted from a blue cast-iron pot');
    await viewer.nextButton.click();
    await expect(viewer.count).toHaveText('4 of 6');
    await viewer.press('ArrowLeft');
    await expect(viewer.count).toHaveText('3 of 6');
    await viewer.swipe('left');
    await expect(viewer.count).toHaveText('4 of 6');
    await viewer.swipe('right');
    await expect(viewer.count).toHaveText('3 of 6');
    await viewer.press('End');
    await expect(viewer.count).toHaveText('6 of 6');
    await viewer.press('Home');
    await expect(viewer.count).toHaveText('1 of 6');
  });

  test('gallery AC-14: at either end the arrow says it is unavailable, keeps focus and does not wrap', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.galleryPhoto(5).click();
    const viewer = caterer.viewer;
    await expect(viewer.count).toHaveText('5 of 6');

    await viewer.nextButton.click();
    await expect(viewer.count).toHaveText('6 of 6');
    await expect(viewer.nextButton).toHaveAttribute('aria-disabled', 'true');
    await expect(viewer.nextButton).toBeFocused();
    await viewer.nextButton.press('Enter');
    await expect(viewer.nextButton).toBeFocused();
    await expect(viewer.count).toHaveText('6 of 6');
    await expect(viewer.caption).toHaveText('Macaroni pie and rice with peas in a red serving pot');
    await expect(viewer.previousButton).not.toHaveAttribute('aria-disabled');

    await viewer.press('Home');
    await expect(viewer.previousButton).toHaveAttribute('aria-disabled', 'true');
  });

  test('L2-016.4 L2-016.5: Tab stays inside; Escape closes and focus returns to the photo that was showing', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.galleryPhoto(2).click();
    const viewer = caterer.viewer;
    await expect(viewer.closeButton).toBeFocused();
    await viewer.press('ArrowRight');
    await viewer.press('ArrowRight');
    await expect(viewer.count).toHaveText('4 of 6');

    for (let i = 0; i < 4; i++) {
      await viewer.press('Tab');
      expect(await viewer.holdsFocus()).toBe(true);
    }
    await viewer.press('Escape');

    await expect(viewer.dialog).toHaveCount(0);
    await expect(caterer.galleryPhoto(4)).toBeFocused();
    expect(await caterer.pageIsInert()).toBe(false);
  });

  test('L2-016.4: Close returns focus to the photo that opened the viewer', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.galleryPhoto(3).click();

    await caterer.viewer.closeButton.click();

    await expect(caterer.viewer.dialog).toHaveCount(0);
    await expect(caterer.galleryPhoto(3)).toBeFocused();
  });

  test('gallery D-5: closing on a photo the layout hides returns focus to the last visible thumbnail', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.open('maracas-bay');
    await caterer.galleryPhoto(5).click();
    await expect(caterer.viewer.closeButton).toBeFocused();

    await caterer.viewer.press('End');
    await expect(caterer.viewer.count).toHaveText('30 of 30');
    await caterer.viewer.press('Escape');

    await expect(caterer.galleryPhoto(5)).toBeFocused();
  });

  test('gallery AC-17: a photo slower than 300 ms shows a spinner named for it, with the caption already there', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.galleryImage(3)).toBeVisible();
    await backend.hold('GET /media/sunday-pot.jpg', 5);
    await caterer.galleryPhoto(2).click();
    const viewer = caterer.viewer;

    await viewer.nextButton.click();
    await page.clock.runFor(400);

    await expect(viewer.count).toHaveText('3 of 6');
    await expect(viewer.photo).toHaveAttribute('role', 'img');
    await expect(viewer.photo).toHaveAccessibleName('Loading photo 3 of 6');
    await expect(viewer.dialog).toHaveAttribute('aria-busy', 'true');
    await expect(viewer.caption).toHaveText('Spiced rice lifted from a blue cast-iron pot');
    await caterer.expectNoAccessibilityViolations();

    await backend.release();
    await expect(viewer.image).toHaveAttribute('alt', 'Spiced rice lifted from a blue cast-iron pot');
    await expect(viewer.dialog).not.toHaveAttribute('aria-busy');
  });

  test('gallery AC-18: a photo that fails to load says so, offers Try again, and the arrows still work', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(caterer.galleryImage(4)).toBeVisible();
    await backend.fail('GET /media/scotch-bonnet-social.jpg', { status: 404 });
    await caterer.galleryPhoto(4).click();
    const viewer = caterer.viewer;

    await expect(viewer.photo).toHaveAccessibleName('Photo 4 of 6 didn’t load');
    await expect(viewer.photo).toHaveRole('img');
    await expect(viewer.failedNote).toHaveText('This photo didn’t load.');
    await expect(viewer.caption).toContainText('Curry chicken scattered with shado beni over white rice');
    await caterer.expectNoAccessibilityViolations();

    await backend.clearFaults();
    await viewer.retryButton.click();
    await expect(viewer.image).toHaveAttribute('alt', 'Curry chicken scattered with shado beni over white rice');
    await expect(viewer.retryButton).toHaveCount(0);

    await viewer.nextButton.click();
    await expect(viewer.count).toHaveText('5 of 6');
  });

  test('gallery AC-11: on a phone the viewer buttons are at least 44 px with room between them', async ({ page }) => {
    const caterer = new CatererPage(page);
    await caterer.usePhone();
    await caterer.open('pelau-house');
    await caterer.galleryPhoto(1).click();
    const viewer = caterer.viewer;

    for (const button of [viewer.closeButton, viewer.previousButton, viewer.nextButton]) {
      const box = (await button.boundingBox())!;
      expect(box.width).toBeGreaterThanOrEqual(44);
      expect(box.height).toBeGreaterThanOrEqual(44);
    }
    await caterer.expectNoHorizontalScroll();
    await caterer.expectNoAccessibilityViolations();
  });
});
