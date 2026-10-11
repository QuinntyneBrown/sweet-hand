import { test, expect } from '../../support/test';
import { ProfileEventsPage } from '../../pages/profile-events-page';

test.describe('Guests and occasions', () => {
  test('L2-020 L2-021 L2-065.2: the guest range with numeric keypads and the chosen occasions', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileEventsPage(page);

    await section.open();

    await expect(section.heading).toHaveText('Guests and occasions');
    await expect(section.subtitle).toHaveText('20–300 guests · 5 occasions');
    await expect(section.saveStatus).toHaveText('Saved');
    await expect(section.smallest).toHaveValue('20');
    await expect(section.smallest).toHaveAttribute('inputmode', 'numeric');
    await expect(section.largest).toHaveValue('300');
    await expect(section.largest).toHaveAttribute('inputmode', 'numeric');
    await expect(section.guestsHelp).toHaveText('Whole numbers from 1 to 5,000. Your page says “Serves 20–300 guests”.');
    await expect(section.checkedOccasions).toHaveText(['Weddings', 'Birthdays', 'Corporate events', 'Religious and cultural celebrations', 'Family gatherings']);
    await expect(section.facts).toHaveText(/On your page\s*Serves 20–300 guests/);
    await section.expectNoAccessibilityViolations();
  });

  test('L2-021.1 L2-038.1: ticking an occasion saves it', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileEventsPage(page);
    await section.open();
    await backend.hold('PUT /api/caterer/profile/sections/events');

    await section.occasion('Community events').check();
    await section.pause();

    await expect(section.saveStatus).toHaveText('Saving…');
    await expect(section.subtitle).toHaveText('20–300 guests · 6 occasions');
    await backend.release();
    await expect(section.saveStatus).toHaveText(/^Saved at/);
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').occasions).toContain('community-events');
  });

  test('L2-020.3 L2-021.2: a minimum above the maximum and no occasion are refused', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileEventsPage(page);
    await section.open();

    await section.smallest.fill('400');
    await section.largest.fill('100');
    for (const name of ['Weddings', 'Birthdays', 'Corporate events', 'Religious and cultural celebrations', 'Family gatherings']) await section.occasion(name).uncheck();
    await section.pause();

    await expect(section.saveStatus).toHaveText('Not saved: fix 2 things below');
    await expect(section.errorSummaryLinks).toHaveText(['Minimum guests can’t be more than maximum guests', 'Choose at least one occasion']);
    await expect(section.errorFor('min-guests')).toHaveText('Minimum guests can’t be more than maximum guests');
    await expect(section.smallest).toHaveAttribute('aria-invalid', 'true');
    await expect(section.errorFor('occasions')).toHaveText('Choose at least one occasion');
    await expect(section.guestsHelp).toHaveText('Whole numbers from 1 to 5,000. Your page keeps showing “Serves 20–300 guests” until this is fixed.');
    await section.expectNoAccessibilityViolations();

    await section.errorSummaryLinks.nth(1).click();
    await expect(section.occasion('Weddings')).toBeFocused();
  });

  for (const value of ['0', '5001', '-3', '2.5', 'forty']) {
    test(`L2-020.4: "${value}" is not a guest count`, async ({ page, backend }) => {
      await backend.signInAs('kendra');
      const section = new ProfileEventsPage(page);
      await section.open();

      await section.largest.fill(value);
      await section.largest.press('Tab');

      await expect(section.errorFor('max-guests')).toHaveText('Enter a whole number from 1 to 5,000');
      expect((await backend.requests()).filter((r) => r.method === 'PUT')).toHaveLength(0);
    });
  }

  test('L2-020.2: the same smallest and largest event reads as one number', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileEventsPage(page);
    await section.open();

    await section.smallest.fill('50');
    await section.largest.fill('50');
    await section.largest.press('Tab');

    await expect(section.saveStatus).toHaveText(/^Saved at/);
    await expect(section.guestsHelp).toHaveText('Whole numbers from 1 to 5,000. Your page says “Serves 50 guests”.');
    await expect(section.facts).toHaveText(/Serves 50 guests/);
  });

  test('L2-039.4: while in review the range and occasions are text', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const section = new ProfileEventsPage(page);

    await section.open();

    await expect(section.readOnlyNote).toHaveText('Read-only');
    await expect(section.readOnly('Guests')).toHaveText('Serves 10–150 guests');
    await expect(section.readOnly('Occasions')).toHaveText('Birthdays, Funerals and repasts, Religious and cultural celebrations, Family gatherings');
    await expect(section.checkboxes).toHaveCount(0);
    await expect(section.facts).toHaveText(/Serves 10–150 guests/);
    await section.expectNoAccessibilityViolations();
  });

  test('loading and error', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.hold('GET /api/caterer/profile');
    const section = new ProfileEventsPage(page);

    await section.open();

    await expect(section.loadingStatus).toHaveText('Loading guests and occasions');
    await section.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/profile', { status: 500, times: 1 });
    await backend.release();
    await section.open();

    await expect(section.loadError.locator('.empty__title')).toHaveText('We couldn’t load guests and occasions');
    await expect(section.loadError).toContainText('Your answers are safe. Try again in a moment.');
    await section.expectNoAccessibilityViolations();
  });
});
