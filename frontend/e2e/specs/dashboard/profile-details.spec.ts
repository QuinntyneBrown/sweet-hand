import { test, expect } from '../../support/test';
import { ProfileDetailsPage } from '../../pages/profile-details.page';

const PELAU_DESCRIPTION =
  'Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva. Today she cooks the same one-pot pelau, curry goat and macaroni pie for weddings, christenings and big family Sundays across the east end.\n\nEverything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons. Doubles and aloo pie are made to order for groups of 40 or more.';

test.describe('Business details', () => {
  test('L2-045.3 L2-045.4: the name and description, saved, beside the live preview', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);

    await details.open();

    await expect(details.heading).toHaveText('Business details');
    await expect(details.saveStatus).toHaveText('Saved');
    await expect(details.name).toHaveValue('Pelau House');
    await expect(details.nameHelp).toHaveText('2–80 characters. A new name goes live after our team checks it.');
    await expect(details.description).toHaveValue(PELAU_DESCRIPTION);
    await expect(details.counter).toHaveText('395 / 2,000');
    await expect(details.navLink('Business details')).toHaveAttribute('aria-current', 'page');
    await expect(details.overviewLink).toBeHidden();
    await expect(details.previewLabel).toHaveText('Live preview');
    await expect(details.previewName).toHaveText('Pelau House');
    await expect(details.link('Done')).toHaveAttribute('href', '/dashboard');
    await details.expectNoAccessibilityViolations();
  });

  test('L2-038.1 L2-044.1: a change saves 2 seconds after typing stops, and a published edit goes live', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);
    await details.open();
    await backend.hold('PUT /api/caterer/profile/sections/details');

    await details.description.press('End');
    await details.description.pressSequentially(' Gluten-free on request.');
    await details.pause(1000);
    expect((await backend.requests()).filter((r) => r.method === 'PUT')).toHaveLength(0);
    await details.pause(1000);

    await expect(details.saveStatus).toHaveText('Saving…');
    await expect(details.counter).toHaveText('419 / 2,000');
    await expect(details.description).toBeEditable();
    await details.expectNoAccessibilityViolations();
    await backend.release();

    await expect(details.saveStatus).toHaveText('Saved at 10:00 a.m. · live on your page within a minute');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').description).toBe(`${PELAU_DESCRIPTION} Gluten-free on request.`);
  });

  test('L2-038.1 L2-038.2: leaving a field saves at once, and the value is there next time', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);
    await details.open();

    await details.description.fill(`${PELAU_DESCRIPTION} Gluten-free on request.`);
    await details.description.press('Tab');

    await expect(details.saveStatus).toHaveText(/^Saved at/);
    await details.open();
    await expect(details.description).toHaveValue(`${PELAU_DESCRIPTION} Gluten-free on request.`);
  });

  test('a refused save lists what to fix, keeps what was typed and sends nothing', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);
    await details.open();

    await details.name.fill('');
    await details.description.fill('Pelau, curry goat and macaroni pie.');
    await details.pause();

    await expect(details.saveStatus).toHaveText('Not saved: fix 2 things below');
    await expect(details.errorSummary).toBeFocused();
    await expect(details.errorSummary.getByRole('heading')).toHaveText('Fix 2 things so we can save');
    await expect(details.errorSummaryLinks).toHaveText(['Enter a business name of 2 to 80 characters', 'Write at least 50 characters (35 so far)']);
    await expect(details.name).toHaveAttribute('aria-invalid', 'true');
    await expect(details.nameError).toHaveText('Enter a business name of 2 to 80 characters');
    await expect(details.descriptionError).toHaveText('Write at least 50 characters (35 so far)');
    await expect(details.description).toHaveValue('Pelau, curry goat and macaroni pie.');
    expect((await backend.requests()).filter((r) => r.method === 'PUT')).toHaveLength(0);
    await details.expectNoAccessibilityViolations();

    await details.errorSummaryLinks.first().click();
    await expect(details.name).toBeFocused();
  });

  test('L2-044.2: a new name waits for review while the public name stays', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);
    await details.open();

    await details.name.fill('Pelau House by Kendra');
    await details.name.press('Tab');

    await expect(details.alertTitle).toHaveText('Name change waiting for review');
    await expect(details.alert).toContainText(
      'Your page shows “Pelau House” until our team approves “Pelau House by Kendra”. This usually takes up to 3 business days. Your page address changes when it’s approved.',
    );
    await expect(details.nameHelp).toHaveText('Waiting for review since Sat 10 Oct. Change it again to replace the request.');
    await expect(details.previewLabel).toHaveText('Live preview: current public name');
    await expect(details.previewName).toHaveText('Pelau House');
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house')).toMatchObject({ name: 'Pelau House', pendingName: 'Pelau House by Kendra' });
    await details.expectNoAccessibilityViolations();
  });

  test('L2-044.2: a name change asked for earlier shows when it was asked', async ({ page, backend }) => {
    await backend.scenario('pelau-name-change-pending');
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);

    await details.open();

    await expect(details.name).toHaveValue('Pelau House by Kendra');
    await expect(details.nameHelp).toHaveText('Waiting for review since Fri 9 Oct. Change it again to replace the request.');
    await expect(details.saveStatus).toHaveText('Saved');
  });

  test('L2-039.4: while in review the details are read-only, with Withdraw submission', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const details = new ProfileDetailsPage(page);

    await details.open();

    await expect(details.readOnlyNote).toHaveText('Read-only');
    await expect(details.alertTitle).toHaveText('Your profile is waiting for review');
    await expect(details.alert).toContainText('It can’t be changed while we look at it. Withdraw the submission if you need to edit something.');
    await expect(details.textboxes).toHaveCount(0);
    await expect(details.readOnlyValue('Business name')).toHaveText('Auntie Bev’s Kitchen');
    await expect(details.readOnlyValue('Description').locator('p')).toHaveCount(2);
    await expect(details.previewLabel).toHaveText('How you’ll appear');
    await details.expectNoAccessibilityViolations();

    await details.button('Withdraw submission').click();
    await expect(details.withdrawDialog.root).toBeVisible();
    await details.withdrawDialog.button('Withdraw submission').click();
    await expect(details.name).toHaveValue('Auntie Bev’s Kitchen');
    await expect(details.readOnlyNote).toHaveCount(0);
  });

  test('L2-044.4: a suspended profile is read-only with the reason', async ({ page, backend }) => {
    await backend.scenario('flying-fish-suspended');
    await backend.signInAs('sharon');
    const details = new ProfileDetailsPage(page);

    await details.open();

    await expect(details.alert).toHaveAttribute('role', 'alert');
    await expect(details.alertTitle).toHaveText('Your profile is suspended');
    await expect(details.alert).toContainText(
      '“Your food handler certificate expired on 30 Sep 2026. Upload a current certificate and we’ll review it within 3 business days.” Details can’t be edited until the suspension is lifted.',
    );
    await expect(details.alert.getByRole('link', { name: 'Upload a new certificate' })).toHaveAttribute('href', '/dashboard/profile/food-safety');
    await expect(details.readOnlyValue('Business name')).toHaveText('Flying Fish Kitchen');
    await expect(details.textboxes).toHaveCount(0);
    await expect(details.previewLabel).toHaveText('Hidden from the listing');
    await details.expectNoAccessibilityViolations();
  });

  test('loading and error: skeleton fields, then a way to try again', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.hold('GET /api/caterer/profile');
    const details = new ProfileDetailsPage(page);

    await details.open();

    await expect(details.loadingStatus).toHaveText('Loading your business details');
    await expect(details.skeletons.first()).toBeVisible();
    await details.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/profile', { status: 500, times: 1 });
    await backend.release();

    await details.open();
    await expect(details.loadError.locator('.empty__title')).toHaveText('We couldn’t load your business details');
    await expect(details.loadError).toContainText('Nothing you saved is lost. Try again, or go back to your overview.');
    await expect(details.link('Back to overview')).toHaveAttribute('href', '/dashboard');
    await details.expectNoAccessibilityViolations();
    await details.button('Try again').click();
    await expect(details.name).toHaveValue('Pelau House');
  });

  test('L2-045.2: on a phone the section opens on its own with a way back to the overview', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const details = new ProfileDetailsPage(page);
    await details.usePhone();

    await details.open();

    await expect(details.sideNav).toBeHidden();
    await expect(details.previewPane).toBeHidden();
    await expect(details.overviewLink).toHaveAttribute('href', '/dashboard');
    await details.expectNoHorizontalScroll();
    await details.expectNoAccessibilityViolations();
  });

  test('L2-058.5: a removed caterer cannot open the editor', async ({ page, backend }) => {
    await backend.signInAs('winston');
    const details = new ProfileDetailsPage(page);

    await details.open();

    await expect(page).toHaveURL(/\/dashboard$/);
  });
});
