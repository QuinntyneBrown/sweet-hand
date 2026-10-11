import { test, expect } from '../../support/test';
import { ProfilePhotosPage, fakeImage, jpegFile, pngFile } from '../../pages/profile-photos.page';

const PELAU_CAPTIONS = [
  'Chicken pelau in a steel pot with lime and cucumber chutney',
  'Curry chicken with rice and buss up shut in a steel karahi',
  'Spiced rice lifted from a blue cast-iron pot',
  'Curry chicken scattered with shado beni over white rice',
  'Rum-soaked black cake dusted with icing sugar',
  'Macaroni pie and rice with peas in a red serving pot',
];

const pelauPhotoIds = async (backend: { state(): Promise<any> }) =>
  (await backend.state()).caterers.find((c: { slug: string }) => c.slug === 'pelau-house').photos.map((p: { caption: string }) => p.caption);

test.describe('Photos', () => {
  test('L2-042 L2-045.1: photos in page order with the cover first, Move up and down, Edit and Add photos', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);

    await photos.open();

    await expect(photos.heading).toHaveText('Photos');
    await expect(photos.subtitle).toHaveText('6 of 30 · the first photo is your cover');
    await expect(photos.status).toHaveText('Published');
    await expect(photos.captions).toHaveText(PELAU_CAPTIONS);
    await expect(photos.coverTags).toHaveCount(1);
    await expect(photos.tile(1).locator('.photo-tile__cover')).toHaveText('Cover');
    await expect(photos.moveUp(1)).toHaveAttribute('aria-disabled', 'true');
    await expect(photos.moveDown(6)).toHaveAttribute('aria-disabled', 'true');
    await expect(photos.moveDown(1)).not.toHaveAttribute('aria-disabled', 'true');
    await expect(photos.edit(2)).toHaveAttribute('aria-haspopup', 'dialog');
    await expect(photos.addPhotos).toHaveAttribute('accept', 'image/jpeg,image/png,image/webp,image/heic');
    await expect(photos.addPhotos).toHaveAttribute('multiple', '');
    await expect(photos.uploadHelp).toHaveText('JPEG, PNG, WebP or HEIC · under 15 MB · at least 800 pixels on the shorter side');
    await expect(photos.previewLabel).toHaveText('Your listing card');
    await photos.expectNoAccessibilityViolations();
  });

  test('L2-042.1: Move up and Move down reorder and save, and moving to the top makes the cover', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();

    await photos.moveUp(5).click();
    await expect(photos.announcement).toHaveText('Photo 5 moved to position 4.');
    await expect(photos.moveUp(4)).toBeFocused();
    await expect(photos.toast).toContainText('Photo order saved');
    await expect(photos.toast).toContainText('Your page shows the new order within a minute.');
    await photos.moveUp(4).click();
    await expect(photos.moveUp(3)).toBeFocused();
    await photos.moveUp(3).click();
    await expect(photos.moveUp(2)).toBeFocused();
    await photos.moveUp(2).click();

    await expect(photos.announcement).toHaveText('Photo 2 moved to position 1. It is now your cover.');
    await expect(photos.captions.first()).toHaveText('Rum-soaked black cake dusted with icing sugar');
    await expect(photos.tile(1).locator('.photo-tile__cover')).toBeVisible();
    await expect(photos.previewPhoto).toHaveAttribute('alt', 'Rum-soaked black cake dusted with icing sugar');
    expect((await pelauPhotoIds(backend))[0]).toBe('Rum-soaked black cake dusted with icing sugar');

    // The last photo cannot move further down; its button keeps focus and does nothing.
    await photos.moveDown(6).press('Enter');
    await expect(photos.moveDown(6)).toBeFocused();
    expect((await backend.requests()).filter((r) => r.path === '/api/caterer/profile/photos/order')).toHaveLength(4);
  });

  test('L2-042.6: "Use as cover photo" moves a photo to the front', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();

    await photos.edit(3).click();

    await expect(photos.details.description).toHaveText('Photo 3 of 6');
    await expect(photos.caption).toHaveValue('Spiced rice lifted from a blue cast-iron pot');
    await expect(photos.caption).toBeFocused();
    await expect(photos.details.counter).toHaveText('44 / 125');
    await expect(photos.details.photo).toHaveAttribute('alt', 'Spiced rice lifted from a blue cast-iron pot');
    await photos.expectNoAccessibilityViolations();
    await photos.useAsCover.check();
    await photos.details.button('Save').click();

    await expect(photos.details.root).toBeHidden();
    await expect(photos.captions.first()).toHaveText('Spiced rice lifted from a blue cast-iron pot');
    await expect(photos.previewPhoto).toHaveAttribute('alt', 'Spiced rice lifted from a blue cast-iron pot');
    await expect(photos.toast).toContainText('Cover photo changed');
    expect((await pelauPhotoIds(backend))[0]).toBe('Spiced rice lifted from a blue cast-iron pot');
  });

  test('L2-042.3: a caption outside 5–125 characters is refused; a good one saves', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await photos.edit(2).click();

    await photos.caption.fill('Roti');
    await photos.details.button('Save').click();

    await expect(photos.details.summary).toBeFocused();
    await expect(photos.details.summaryHeading).toHaveText('Fix 1 thing to save');
    await expect(photos.details.summaryItems).toHaveText(['Captions describe the photo in 5–125 characters']);
    await expect(photos.caption).toHaveAttribute('aria-invalid', 'true');
    await expect(photos.details.counter).toHaveText('4 / 125');
    await photos.expectNoAccessibilityViolations();

    await backend.hold('PATCH /api/caterer/profile/photos/*');
    await photos.caption.fill('Curry chicken with rice and buss up shut');
    await photos.details.button('Save').click();
    await expect(photos.details.button('Save')).toHaveAttribute('aria-busy', 'true');
    await expect(photos.details.status).toHaveText('Saving the photo details');
    await expect(photos.caption).toHaveAttribute('readonly', '');
    await backend.release();

    await expect(photos.details.root).toBeHidden();
    await expect(photos.captions.nth(1)).toHaveText('Curry chicken with rice and buss up shut');
    await expect(photos.toast).toContainText('Caption saved');
    await expect(photos.toast).toContainText('Photo 2 has a new caption.');
    await expect(photos.edit(2)).toBeFocused();
  });

  test('a failed save keeps the caption and offers Try again', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await photos.edit(2).click();
    await backend.fail('PATCH /api/caterer/profile/photos/*', { network: true, times: 1 });

    await photos.caption.fill('Curry chicken with rice and roti');
    await photos.details.button('Save').click();

    await expect(photos.details.alert).toContainText('We couldn’t save this photo’s details');
    await expect(photos.details.alert).toContainText('Your caption is still here. Check your connection and try again.');
    await expect(photos.caption).toHaveValue('Curry chicken with rice and roti');
    await photos.details.button('Try again').click();
    await expect(photos.details.root).toBeHidden();
  });

  test('removing asks first, then offers Undo, which puts the photo back in place', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await photos.edit(2).click();

    await photos.details.button('Remove photo').click();

    await expect(photos.remove.title).toHaveText('Remove this photo?');
    await expect(photos.remove.description).toHaveText('“Curry chicken with rice and buss up shut in a steel karahi” leaves your page within a minute.');
    await expect(photos.remove.button('Cancel')).toBeFocused();
    await photos.expectNoAccessibilityViolations();
    await backend.hold('DELETE /api/caterer/profile/photos/*');
    await photos.remove.button('Remove photo').click();
    await expect(photos.remove.button('Remove photo')).toHaveAttribute('aria-busy', 'true');
    await expect(photos.remove.status).toHaveText('Removing the photo');
    await backend.release();

    await expect(photos.remove.root).toBeHidden();
    await expect(photos.tiles).toHaveCount(5);
    await expect(photos.toast).toContainText('Photo removed');
    await expect(photos.toast).toContainText('“Curry chicken with rice and buss up shut in a steel karahi” is off your page.');
    await photos.toast.getByRole('button', { name: 'Undo' }).click();

    await expect(photos.tiles).toHaveCount(6);
    await expect(photos.captions.nth(1)).toHaveText('Curry chicken with rice and buss up shut in a steel karahi');
  });

  test('L2-042.4: a published profile with exactly 3 photos cannot remove one', async ({ page, backend }) => {
    await backend.signInAs('paulette');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await photos.edit(2).click();

    await photos.details.button('Remove photo').click();

    await expect(photos.remove.title).toHaveText('Keep at least 3 photos');
    await expect(photos.remove.description).toHaveText('Published profiles need at least 3 photos. Add another photo before you remove this one.');
    await expect(photos.remove.button('Got it')).toBeFocused();
    await photos.expectNoAccessibilityViolations();
    await photos.remove.button('Got it').click();
    await expect(photos.tiles).toHaveCount(3);
  });

  test('L2-042.5: at 30 photos Add photos is unavailable with the limit explained', async ({ page, backend }) => {
    await backend.signInAs('vishnu');
    const photos = new ProfilePhotosPage(page);

    await photos.open();

    await expect(photos.subtitle).toHaveText('30 of 30 · the first photo is your cover');
    await expect(photos.addPhotos).toBeDisabled();
    await expect(photos.uploadHelp).toHaveText('You can have up to 30 photos. Remove one to add another.');
    await expect(photos.moveDown(30)).toHaveAttribute('aria-disabled', 'true');
    await photos.expectNoAccessibilityViolations();
  });

  test('L2-041.1: an accepted photo shows its progress, then appears and asks for a caption', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await backend.hold('POST /api/caterer/profile/photos');

    await photos.upload(pngFile('IMG_2076.png', 1600, 1200));

    await expect(photos.saveStatus).toHaveText('Uploading 1 photo…');
    await expect(photos.subtitle).toHaveText('6 of 30 · uploading 1 more');
    await expect(photos.progress('IMG_2076.png')).toBeVisible();
    await expect(photos.tiles.last().locator('.photo-tile__caption')).toHaveText('IMG_2076.png');
    await photos.expectNoAccessibilityViolations();
    await backend.release();

    await expect(photos.tiles).toHaveCount(7);
    await expect(photos.subtitle).toHaveText('7 of 30 · the first photo is your cover');
    await expect(photos.tile(7).locator('.photo-tile__caption')).toHaveText('Add a caption');
    await expect(photos.tile(7).locator('.photo-tile__caption')).toHaveClass(/photo-tile__caption--missing/);
    await expect(photos.saveStatus).toHaveText('Saved');
    await photos.edit(7).click();
    await expect(photos.details.description).toHaveText('Photo 7 of 7');
  });

  test('an upload can be cancelled before it finishes', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await backend.hold('POST /api/caterer/profile/photos');

    await photos.upload(pngFile('IMG_2077.png', 1600, 1200));
    await photos.cancelUpload('IMG_2077.png').click();

    await expect(photos.tiles).toHaveCount(6);
    await expect(photos.subtitle).toHaveText('6 of 30 · the first photo is your cover');
  });

  test('L2-041.2 L2-041.3: a photo too small and a file that is not an image are refused, and nothing is stored', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();

    await photos.upload(jpegFile('IMG_2041.jpg', 600, 400), fakeImage('menu-scan.jpg'));

    await expect(photos.uploadErrors).toBeFocused();
    await expect(photos.uploadErrors.getByRole('heading')).toHaveText('2 photos weren’t added');
    await expect(photos.uploadErrors.locator('li')).toHaveText([
      'IMG_2041.jpg: Photos must be under 15 MB and at least 800 pixels on the shorter side',
      'menu-scan.jpg: This file isn’t a JPEG, PNG, WebP or HEIC photo, so nothing was saved',
    ]);
    await expect(photos.tiles).toHaveCount(6);
    expect(await pelauPhotoIds(backend)).toHaveLength(6);
    await photos.expectNoAccessibilityViolations();
  });

  test('L2-041.2: a file over 15 MB is refused before it is sent', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    const big = pngFile('IMG_2090.png', 4000, 3000);

    await photos.upload({ ...big, buffer: Buffer.concat([big.buffer, Buffer.alloc(15 * 1024 * 1024)]) });

    await expect(photos.uploadErrors.locator('li')).toHaveText(['IMG_2090.png: Photos must be under 15 MB and at least 800 pixels on the shorter side']);
    expect((await backend.requests()).filter((r) => r.method === 'POST')).toHaveLength(0);
  });

  test('an upload that fails says so and can be retried', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await backend.fail('POST /api/caterer/profile/photos', { network: true, times: 1 });

    await photos.upload(pngFile('IMG_2077.png', 1600, 1200));

    await expect(photos.toast).toHaveAttribute('role', 'alert');
    await expect(photos.toast).toContainText('Upload failed');
    await expect(photos.toast).toContainText('IMG_2077.png didn’t upload. Check your connection and try again.');
    await expect(photos.tiles).toHaveCount(6);
    await photos.toast.getByRole('button', { name: 'Retry' }).click();
    await expect(photos.tiles).toHaveCount(7);
  });

  test('L2-091.2: while image processing is down an upload is kept as Processing and appears once ready', async ({ page, backend }) => {
    await backend.scenario('image-processing-down');
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();

    await photos.upload(pngFile('IMG_2077.png', 1600, 1200));

    await expect(photos.processing).toHaveText('Processing');
    await expect(photos.subtitle).toHaveText('7 of 30 · 1 processing');
    await expect(photos.alertTitle).toHaveText('Photos are taking longer than usual');
    await expect(photos.alert).toContainText('Your new photo is saved. It will appear on your page by itself as soon as it’s ready. You don’t need to upload it again.');
    await expect(photos.toast).toContainText('Still processing');
    await expect(photos.toast).toContainText('IMG_2077.png is taking longer than usual. It will appear on your page by itself when it’s ready.');
    await photos.expectNoAccessibilityViolations();

    await backend.scenario('image-processing-recovers');
    await page.clock.runFor(10_000);

    await expect(photos.processing).toHaveCount(0);
    await expect(photos.tiles).toHaveCount(7);
    await expect(photos.toast).toContainText('Photo added');
    await expect(photos.toast).toContainText('IMG_2077.png is now on your page.');
    await expect(photos.toast.getByRole('link', { name: 'View your page' })).toHaveAttribute('href', '/caterers/pelau-house');
  });

  test('L2-042.2: Replace keeps the photo’s place and caption', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const photos = new ProfilePhotosPage(page);
    await photos.open();
    await photos.edit(2).click();

    await photos.replaceInput.setInputFiles(pngFile('IMG_3001.png', 1600, 1200));

    await expect(photos.details.root).toBeHidden();
    await expect(photos.toast).toContainText('Photo replaced');
    await expect(photos.captions.nth(1)).toHaveText('Curry chicken with rice and buss up shut in a steel karahi');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').photos[1].fileName).toBe('IMG_3001.png');
  });

  test('first run: no photos yet, one way to add them', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'new' });
    await backend.signInAs('beverley');
    const photos = new ProfilePhotosPage(page);

    await photos.open();

    await expect(photos.subtitle).toHaveText('Photos lead your listing. Add 3 to 30, each with a caption.');
    await expect(photos.status).toHaveText('Draft');
    await expect(photos.empty.locator('.empty__title')).toHaveText('Show people your food');
    await expect(photos.empty).toContainText('Add at least 3 photos of dishes you cook. The first one becomes the round photo on your listing card.');
    await expect(photos.addPhotos).toBeEnabled();
    await photos.expectNoAccessibilityViolations();

    await photos.upload(pngFile('IMG_1001.png', 1200, 1200));
    await expect(photos.tiles).toHaveCount(1);
  });

  test('L2-039.4: in review the photos show without editing controls', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const photos = new ProfilePhotosPage(page);

    await photos.open();

    await expect(photos.subtitle).toHaveText('5 photos · the first photo is your cover');
    await expect(photos.status).toHaveText('Pending review');
    await expect(photos.alertTitle).toHaveText('Waiting for review');
    await expect(photos.alert).toContainText('Editing is paused while we review your profile, usually within 3 business days.');
    await expect(photos.tiles).toHaveCount(5);
    await expect(photos.main.getByRole('button', { name: /^Move photo/ })).toHaveCount(0);
    await expect(photos.addPhotos).toHaveCount(0);
    await photos.expectNoAccessibilityViolations();
    await photos.button('Withdraw submission').click();
    await expect(photos.withdrawDialog.root).toBeVisible();
  });

  test('loading, error and the phone layout', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.hold('GET /api/caterer/profile');
    const photos = new ProfilePhotosPage(page);
    await photos.usePhone();

    await photos.open();

    await expect(photos.loadingStatus).toHaveText('Loading your photos');
    await expect(photos.main.locator('.photo-tile--skeleton').first()).toBeVisible();
    await photos.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/profile', { status: 500, body: { title: 'Something went wrong', correlationId: '7f3a-21c9' }, times: 1 });
    await backend.release();
    await expect(photos.tiles).toHaveCount(6);
    await photos.expectNoHorizontalScroll();
    await expect(photos.moveDown(1)).toBeVisible();
    await photos.expectNoAccessibilityViolations();

    await photos.open();
    await expect(photos.loadError.locator('.empty__title')).toHaveText('We couldn’t load your photos');
    await expect(photos.loadErrorReference).toHaveText('Reference 7f3a-21c9');
    await expect(photos.link('Back to overview')).toHaveAttribute('href', '/dashboard');
    await photos.expectNoAccessibilityViolations();
  });
});
