import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';

const VALID = {
  date: '2026-11-21',
  guests: '120',
  area: 'Scarborough',
  postal: 'M1E 4R8',
  occasion: 'Family gatherings',
  message: 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.',
};

test.describe('Checking the enquiry form', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('devon');
  });

  async function openForm(caterer: CatererPage) {
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();
  }

  const posts = async (backend: { requests(): Promise<{ method: string; path: string }[]> }) =>
    (await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/enquiries');

  test('L2-022.2 L2-022.4 L2-022.5 L2-022.7 form-layout AC-5: four problems are listed, linked and marked, focus moves to the summary and nothing is sent', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await openForm(caterer);

    await form.fill({ date: '2026-10-11', guests: 'fifty', area: 'Scarborough', message: 'Food for 120 please' });
    await form.send.click();

    await expect(form.summary).toBeFocused();
    await expect(form.summaryHeading).toHaveText('Fix 4 things to send your enquiry');
    await expect(form.summaryLinks).toHaveText([
      'Choose a date at least 2 days from today',
      'Enter a whole number of guests from 1 to 5,000',
      'Choose an occasion',
      'Tell the caterer a little more (at least 20 characters)',
    ]);
    await expect(form.errorFor('date')).toHaveText('Choose a date at least 2 days from today');
    await expect(form.date).toHaveAttribute('aria-invalid', 'true');
    await expect(form.date).toHaveAccessibleDescription('Choose a date at least 2 days from today At least 2 days from today');
    await expect(form.errorFor('guests')).toHaveText('Enter a whole number of guests from 1 to 5,000');
    await expect(form.guests).toHaveAttribute('aria-invalid', 'true');
    await expect(form.errorFor('occasion')).toHaveText('Choose an occasion');
    await expect(form.occasion).toHaveAttribute('aria-invalid', 'true');
    await expect(form.errorFor('message')).toHaveText('Tell the caterer a little more (at least 20 characters)');
    await expect(form.counter).toHaveText('19 / 2,000');
    await expect(form.area).not.toHaveAttribute('aria-invalid', 'true');
    await expect(form.guests).toHaveValue('fifty');
    expect(await posts(backend)).toHaveLength(0);
    await caterer.expectNoAccessibilityViolations();

    await form.summaryLink('Enter a whole number of guests from 1 to 5,000').click();
    await expect(form.guests).toBeFocused();
  });

  test('L2-022.7 form-layout AC-8: fixing a field clears its error, and the next send lists what is left', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await openForm(caterer);
    await form.fill({ date: '2026-10-11', guests: 'fifty', area: 'Scarborough', message: 'Food for 120 please' });
    await form.send.click();

    await form.fill({ guests: '120' });
    await expect(form.errorFor('guests')).toHaveCount(0);
    await expect(form.guests).not.toHaveAttribute('aria-invalid', 'true');
    await form.send.click();

    await expect(form.summary).toBeFocused();
    await expect(form.summaryHeading).toHaveText('Fix 3 things to send your enquiry');
  });

  test('L2-022.3: a date more than 24 months away is refused', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await openForm(caterer);

    await form.fill({ ...VALID, date: '2028-10-11' });
    await form.send.click();

    await expect(form.summaryLinks).toHaveText(['Choose a date within the next 24 months']);
    await expect(form.errorFor('date')).toHaveText('Choose a date within the next 24 months');
  });

  test('L2-022.4: 0, 5001 and 12.5 guests are refused like "fifty"', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await openForm(caterer);

    for (const guests of ['0', '5001', '12.5']) {
      await form.fill({ ...VALID, guests });
      await form.send.click();
      await expect(form.summaryLinks).toHaveText(['Enter a whole number of guests from 1 to 5,000']);
    }
    expect(await posts(backend)).toHaveLength(0);
  });

  test('L2-022.5 form-field AC-13: a message of 2,001 characters is over the limit and says so', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await openForm(caterer);

    await form.fill({ ...VALID, message: 'a'.repeat(2001) });
    await expect(form.counter).toHaveText('2,001 / 2,000');
    await expect(form.counter).toHaveAttribute('data-over', '');
    await form.send.click();

    await expect(form.errorFor('message')).toHaveText('Keep your message under 2,000 characters');
    await expect(form.message).toHaveAccessibleDescription('Keep your message under 2,000 characters What you’d like to eat, serving style, timing 2,001 / 2,000');
  });

  test('L2-022.7: errors the server finds are shown the same way', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await openForm(caterer);
    await backend.fail('POST /api/enquiries', { status: 400, times: 1, body: { title: 'Check the form', errors: { eventDate: ['Choose a date at least 2 days from today'] } } });

    await form.fill(VALID);
    await form.send.click();

    await expect(form.summary).toBeFocused();
    await expect(form.summaryLinks).toHaveText(['Choose a date at least 2 days from today']);
    await expect(form.errorFor('date')).toHaveText('Choose a date at least 2 days from today');
    await expect(form.date).toHaveValue('2026-11-21');
  });

  test('L2-022.6: a request that skips the form\'s checks gets HTTP 400 with an error for each failing field, and nothing is created', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');
    const before = (await backend.state()).enquiries.length;

    const response = await form.postDirectly({
      catererSlug: 'pelau-house',
      eventDate: '2026-10-11',
      guests: 'fifty',
      area: 'atlantis',
      postalCode: '12345',
      occasion: 'launch-party',
      message: 'Too short',
      challengeToken: 'invisible-challenge-passed',
    });

    expect(response.status).toBe(400);
    expect(response.body.errors).toEqual({
      eventDate: ['Choose a date at least 2 days from today'],
      guests: ['Enter a whole number of guests from 1 to 5,000'],
      area: ['Choose an area'],
      postalCode: ['Enter a valid postal code, like M1E 4R8'],
      occasion: ['Choose an occasion'],
      message: ['Tell the caterer a little more (at least 20 characters)'],
    });
    expect((await backend.state()).enquiries).toHaveLength(before);
  });

  test('form-layout AC-18: the invalid form has no accessibility violations on a phone', async ({ page }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.usePhone();
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.stickyBar).click();

    await form.fill({ date: '2026-10-11', guests: 'fifty', message: 'Food for 120 please' });
    await form.send.click();

    await expect(form.summary).toBeFocused();
    await expect(form.summaryLinks).toHaveCount(5);
    await caterer.expectNoHorizontalScroll();
    await caterer.expectNoAccessibilityViolations();
  });
});
