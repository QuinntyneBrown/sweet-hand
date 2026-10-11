import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';

test.describe('From enquiry to review', () => {
  test('L2-049.1: once the caterer has replied and the event has passed, the customer who sent the enquiry is invited to review', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('ti-kay');
    await expect(caterer.writeReview).toHaveCount(0);
    await caterer.enquireButtonIn(caterer.panel).click();
    await form.fill({ date: '2026-10-17', guests: '40', area: 'Etobicoke', occasion: 'Birthdays', message: 'Griot, pikliz and diri ak djon djon for my mother’s 70th, about 40 people.' });
    await form.send.click();
    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Ti Kay');

    await backend.setNow('2026-10-20T15:00:00Z');
    await caterer.open('ti-kay');
    await expect(caterer.heading).toHaveText('Ti Kay');
    await expect(caterer.writeReview).toHaveCount(0);

    await backend.scenario('add-message', { customer: 'devon.w@example.com', caterer: 'ti-kay', from: 'caterer', text: 'Bonswa Devon! Yes, we can do that for 40.' });
    await caterer.open('ti-kay');

    await expect(caterer.writePrompt).toHaveText('How was Sat 17 Oct? Your review helps the next family decide.');
  });
});
