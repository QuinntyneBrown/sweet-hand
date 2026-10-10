import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';

const ENTRY = {
  date: '2026-12-12',
  guests: '120',
  area: 'Scarborough',
  postal: 'M1E 4R8',
  occasion: 'Family gatherings',
  message: 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.',
};

test.describe('Sending an enquiry before signing in', () => {
  test('L2-013.3: a visitor fills in the form, sends it, and is taken to sign in with the way back to the form', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');

    await caterer.enquireButtonIn(caterer.panel).click();
    await form.fill(ENTRY);
    await form.send.click();

    await expect(page).toHaveURL(/\/sign-in\?returnUrl=%2Fcaterers%2Fpelau-house%3Fenquiry%3Dresume$/);
    await expect(form.dialog).toHaveCount(0);
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/enquiries')).toHaveLength(0);
  });
});
