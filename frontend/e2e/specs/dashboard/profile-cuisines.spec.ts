import { test, expect } from '../../support/test';
import { ProfileCuisinesPage } from '../../pages/profile-cuisines-page';

const CUISINES = [
  'Antiguan & Barbudan',
  'Bahamian',
  'Barbadian (Bajan)',
  'Belizean',
  'Cuban',
  'Dominican (Dominica)',
  'Dominican (Dominican Republic)',
  'Grenadian',
  'Guyanese',
  'Haitian',
  'Jamaican',
  'Kittitian & Nevisian',
  'Pan-Caribbean',
  'Puerto Rican',
  'St. Lucian',
  'Surinamese',
  'Trinidadian & Tobagonian',
  'Vincentian',
];

test.describe('Cuisines and areas', () => {
  test('L2-007.1 L2-010.1: every cuisine and the 30 areas by region, with the caterer’s picks and primaries', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileCuisinesPage(page);

    await section.open();

    await expect(section.heading).toHaveText('Cuisines and areas');
    await expect(section.subtitle).toHaveText('2 cuisines · 5 areas');
    await expect(section.saveStatus).toHaveText('Saved');
    await expect(section.cuisineLabels).toHaveText(CUISINES);
    await expect(section.checkedCuisines).toHaveText(['Guyanese', 'Trinidadian & Tobagonian']);
    await expect(section.primaryCuisines).toHaveCount(2);
    await expect(section.primaryCuisine('Trinidadian & Tobagonian')).toBeChecked();
    await expect(section.regionCount('City of Toronto')).toHaveText('3 of 6 areas');
    await expect(section.region('City of Toronto')).not.toBeChecked();
    await expect(section.regionCount('Durham')).toHaveText('2 of 8 areas');
    await expect(section.area('Scarborough')).toBeChecked();
    await expect(section.area('York')).not.toBeChecked();
    await expect(section.primaryAreaOptions).toHaveText(['Choose your primary area', 'East York', 'North York', 'Scarborough', 'Ajax', 'Pickering']);
    await expect(section.primaryArea).toHaveValue('scarborough');
    await expect(section.previewMeta).toHaveText('Trinidadian & Tobagonian · Scarborough');
    await section.expectNoAccessibilityViolations();
  });

  test('L2-010.3 L2-038.1: ticking a whole region stores every area in it, and saves', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileCuisinesPage(page);
    await section.open();
    await backend.hold('PUT /api/caterer/profile/sections/cuisines');

    await section.region('Peel').check();

    await expect(section.area('Brampton')).toBeChecked();
    await expect(section.area('Caledon')).toBeChecked();
    await expect(section.area('Mississauga')).toBeChecked();
    await expect(section.regionCount('Peel')).toHaveText('3 of 3 areas');
    await expect(section.subtitle).toHaveText('2 cuisines · 8 areas');
    await section.pause();
    await expect(section.saveStatus).toHaveText('Saving…');
    await section.expectNoAccessibilityViolations();
    await backend.release();

    await expect(section.saveStatus).toHaveText(/^Saved at/);
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').areas).toEqual(
      expect.arrayContaining(['scarborough', 'brampton', 'caledon', 'mississauga', 'east-york', 'north-york', 'pickering', 'ajax']),
    );
  });

  test('a newly ticked area can become the primary area', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileCuisinesPage(page);
    await section.open();

    await section.area('Whitby').check();

    await expect(section.regionCount('Durham')).toHaveText('3 of 8 areas');
    await expect(section.primaryAreaOptions).toHaveText(['Choose your primary area', 'East York', 'North York', 'Scarborough', 'Ajax', 'Pickering', 'Whitby']);
    await section.primaryArea.selectOption('Whitby');
    await section.primaryArea.press('Tab');
    await expect(section.saveStatus).toHaveText(/^Saved at/);
    await expect(section.previewMeta).toHaveText('Trinidadian & Tobagonian · Whitby');
  });

  test('L2-007.2 L2-010.4: more than 5 cuisines and no primary area are refused, with both messages', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileCuisinesPage(page);
    await section.open();

    for (const name of ['Grenadian', 'Jamaican', 'St. Lucian', 'Vincentian']) await section.cuisine(name).check();
    await section.primaryArea.selectOption('');
    await section.pause();

    await expect(section.saveStatus).toHaveText('Not saved: fix 2 things below');
    await expect(section.errorSummary).toBeFocused();
    await expect(section.errorSummaryLinks).toHaveText(['Choose between 1 and 5 cuisines', 'Choose your primary area']);
    await expect(section.errorFor('cuisines')).toHaveText('Choose between 1 and 5 cuisines');
    await expect(section.cuisine('Jamaican')).toHaveAttribute('aria-invalid', 'true');
    await expect(section.primaryArea).toHaveAttribute('aria-invalid', 'true');
    await expect(section.errorFor('primary-area')).toHaveText('Choose your primary area');
    await expect(section.subtitle).toHaveText('6 cuisines · 5 areas');
    expect((await backend.requests()).filter((r) => r.method === 'PUT')).toHaveLength(0);
    await section.expectNoAccessibilityViolations();

    await section.errorSummaryLinks.first().click();
    await expect(section.cuisine('Grenadian')).toBeFocused();
  });

  test('L2-007.3: several cuisines need one marked as primary', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const section = new ProfileCuisinesPage(page);
    await section.open();

    await section.cuisine('Trinidadian & Tobagonian').uncheck();
    await section.cuisine('Jamaican').check();
    await section.cuisine('Haitian').check();
    await section.pause();

    await expect(section.errorSummaryLinks).toHaveText(['Mark one cuisine as primary']);
    await section.primaryCuisine('Jamaican').check();
    await section.pause();

    await expect(section.saveStatus).toHaveText(/^Saved at/);
    const { caterers } = await backend.state();
    expect(caterers.find((c: { slug: string }) => c.slug === 'pelau-house').cuisines).toEqual(['jamaican', 'guyanese', 'haitian']);
  });

  test('L2-007.4: a cuisine an operator adds can be chosen', async ({ page, backend }) => {
    await backend.scenario('cuisine-added', { name: 'Caymanian' });
    await backend.signInAs('kendra');
    const section = new ProfileCuisinesPage(page);

    await section.open();

    await expect(section.cuisine('Caymanian')).toBeVisible();
  });

  test('L2-039.4: while in review, cuisines and areas are listed as text', async ({ page, backend }) => {
    await backend.scenario('beverley', { state: 'pending' });
    await backend.signInAs('beverley');
    const section = new ProfileCuisinesPage(page);

    await section.open();

    await expect(section.subtitle).toHaveText('1 cuisine · 5 areas');
    await expect(section.readOnlyNote).toHaveText('Read-only');
    await expect(section.alertTitle).toHaveText('Your profile is waiting for review');
    await expect(section.checkboxes).toHaveCount(0);
    await expect(section.readOnlyTerms).toHaveText(['Cuisines', 'Durham', 'Also in Durham']);
    await expect(section.readOnly('Cuisines')).toHaveText('Jamaican Primary');
    await expect(section.readOnly('Durham')).toHaveText('Oshawa Primary');
    await expect(section.readOnly('Also in Durham')).toHaveText('Ajax, Clarington, Pickering, Whitby');
    await expect(section.button('Withdraw submission')).toBeVisible();
    await section.expectNoAccessibilityViolations();
  });

  test('loading and error', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    await backend.hold('GET /api/caterer/profile/reference-data');
    const section = new ProfileCuisinesPage(page);

    await section.open();

    await expect(section.loadingStatus).toHaveText('Loading cuisines and areas');
    await section.expectNoAccessibilityViolations();
    await backend.fail('GET /api/caterer/profile/reference-data', { status: 500, times: 1 });
    await backend.release();
    await section.open();

    await expect(section.loadError.locator('.empty__title')).toHaveText('We couldn’t load cuisines and areas');
    await expect(section.loadError).toContainText('Your choices are safe. Try again in a moment.');
    await section.expectNoAccessibilityViolations();
    await section.button('Try again').click();
    await expect(section.subtitle).toHaveText('2 cuisines · 5 areas');
  });
});
