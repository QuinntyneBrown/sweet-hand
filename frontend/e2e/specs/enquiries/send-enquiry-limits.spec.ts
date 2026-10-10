import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';
import { ThreadPage } from '../../pages/thread.page';

const MESSAGE = 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.';
const ENTRY = { date: '2026-11-21', guests: '120', area: 'Scarborough', postal: 'M1E 4R8', occasion: 'Family gatherings', message: MESSAGE };
const BODY = { eventDate: '2026-12-05', guests: '40', area: 'scarborough', postalCode: '', occasion: 'birthdays', message: MESSAGE, challengeToken: 'invisible-challenge-passed' };

test.describe('Enquiry limits', () => {
  async function openForm(page: CatererPage['page']) {
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();
    return caterer;
  }

  test('L2-025.1: an 11th enquiry in 24 hours is refused with HTTP 429; the message stays to copy and Send is off', async ({ page, backend }) => {
    await backend.signInAs('devon');
    await backend.scenario('daily-enquiry-limit-reached', { email: 'devon.w@example.com' });
    const caterer = await openForm(page);
    const form = new EnquiryFormDialog(page);
    await form.fill(ENTRY);

    await form.send.click();

    await expect(form.alert).toHaveAttribute('role', 'alert');
    await expect(form.alertTitle).toHaveText('You’ve reached today’s enquiry limit. Try again tomorrow.');
    await expect(form.alertText).toHaveText('Limits keep caterers’ inboxes free of spam. Your message is still here if you’d like to copy it.');
    await expect(form.send).toBeDisabled();
    await expect(form.message).toHaveValue(MESSAGE);
    await caterer.expectNoAccessibilityViolations();

    const direct = await form.postDirectly({ ...BODY, catererSlug: 'pelau-house' });
    expect(direct.status).toBe(429);
    expect(direct.body.code).toBe('daily-limit');
  });

  test('L2-025.2: a second open enquiry to the same caterer for the same date is refused with a link to the existing thread', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const { id } = await backend.scenario('enquiry-id', { customer: 'marcia.t@example.com', caterer: 'pelau-house' });
    const caterer = await openForm(page);
    const form = new EnquiryFormDialog(page);
    await form.fill(ENTRY);

    await form.send.click();

    await expect(form.alertTitle).toHaveText('You already have an open enquiry with this caterer for that date');
    await expect(form.alertAction('View your enquiry')).toHaveAttribute('href', `/inbox/${id}`);
    await form.expectValues(ENTRY);
    await caterer.expectNoAccessibilityViolations();

    await form.alertAction('View your enquiry').click();
    await expect(page).toHaveURL(`/inbox/${id}`);
    await expect(form.dialog).toHaveCount(0);
    await expect(new ThreadPage(page).thread.summaryValue('Guests')).toContainText('120');
  });

  test('L2-025.2: a different date with the same caterer is fine', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await openForm(page);
    const form = new EnquiryFormDialog(page);
    await form.fill({ ...ENTRY, date: '2026-12-19' });

    await form.send.click();

    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');
  });

  test('L2-025.3: an account less than an hour old can send 3 enquiries, and the 4th is refused', async ({ page, backend }) => {
    await backend.signInAs('devon');
    await backend.scenario('new-account', { email: 'devon.w@example.com' });
    const caterer = await openForm(page);
    const form = new EnquiryFormDialog(page);
    for (const slug of ['cou-cou', 'ti-kay', 'sunday-pot']) {
      expect((await form.postDirectly({ ...BODY, catererSlug: slug })).status).toBe(201);
    }
    await form.fill(ENTRY);

    await form.send.click();

    await expect(form.alertTitle).toHaveText('New accounts can send 3 enquiries in their first hour. Try again later.');
    await expect(form.alertText).toHaveText('Limits keep caterers’ inboxes free of spam. Your message is still here if you’d like to copy it.');
    await expect(form.send).toBeDisabled();
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-025.4: a request without a valid bot-protection token is refused with HTTP 400 and nothing is created', async ({ page, backend }) => {
    await backend.signInAs('devon');
    await openForm(page);
    const form = new EnquiryFormDialog(page);
    const before = (await backend.state()).enquiries.length;

    const missing = await form.postDirectly({ ...BODY, catererSlug: 'pelau-house', challengeToken: undefined });
    const forged = await form.postDirectly({ ...BODY, catererSlug: 'pelau-house', challengeToken: 'i-am-a-person' });

    expect(missing.status).toBe(400);
    expect(missing.body.code).toBe('challenge-failed');
    expect(forged.status).toBe(400);
    expect((await backend.state()).enquiries).toHaveLength(before);
  });
});
