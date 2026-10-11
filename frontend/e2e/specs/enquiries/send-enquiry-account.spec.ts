import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';
import { Toasts } from '../../pages/toasts';

const ENTRY = {
  date: '2026-12-12',
  guests: '120',
  area: 'Scarborough',
  postal: 'M1E 4R8',
  occasion: 'Family gatherings',
  message: 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.',
};

test.describe('Who can send an enquiry', () => {
  async function openForm(page: CatererPage['page'], slug = 'pelau-house') {
    const caterer = new CatererPage(page);
    await caterer.open(slug);
    await caterer.enquireButtonIn(caterer.panel).click();
    return caterer;
  }

  test('L2-023.2: an unverified customer is asked to verify, can resend the link, and the draft is saved', async ({ page, backend }) => {
    await backend.scenario('unverified-customer', { email: 'marcia.t@example.com' });
    await backend.signInAs('marcia');
    const caterer = await openForm(page);
    const form = new EnquiryFormDialog(page);
    const before = (await backend.state()).enquiries.length;
    await form.fill(ENTRY);

    await form.send.click();

    await expect(form.alert).toHaveClass(/alert--warning/);
    await expect(form.alert).toHaveAttribute('role', 'status');
    await expect(form.alertTitle).toHaveText('Verify your email to send enquiries');
    await expect(form.alertText).toHaveText('We sent a link to marcia.t@example.com. Your enquiry is saved for 24 hours.');
    await form.expectValues(ENTRY);
    await expect(form.send).toBeEnabled();
    expect((await backend.state()).enquiries).toHaveLength(before);
    await expect.poll(async () => (await backend.requests()).filter((r) => r.method === 'PUT' && r.path === '/api/enquiries/drafts/pelau-house').length).toBe(1);
    await caterer.expectNoAccessibilityViolations();

    await form.alertAction('Resend verification email').click();

    const toasts = new Toasts(page);
    await expect(toasts.withTitle('Verification email sent')).toBeVisible();
    await expect(toasts.textOf(toasts.withTitle('Verification email sent'))).toHaveText('Check marcia.t@example.com for the link.');
    expect((await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/identity/email-verifications/resend')).toHaveLength(1);
  });

  test('L2-023.3: verifying within 24 hours brings back the filled-in form, which then sends', async ({ page, backend }) => {
    await backend.scenario('unverified-customer', { email: 'marcia.t@example.com' });
    await backend.signInAs('marcia');
    await openForm(page);
    const form = new EnquiryFormDialog(page);
    await form.fill(ENTRY);
    await form.send.click();
    await expect(form.alertTitle).toHaveText('Verify your email to send enquiries');

    await backend.scenario('verify-email', { email: 'marcia.t@example.com' });
    await backend.setNow('2026-10-11T13:00:00.000Z');
    await openForm(page);

    await expect(form.alertTitle).toHaveText('Welcome back, Marcia');
    await form.expectValues(ENTRY);
    await form.send.click();
    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');

    await openForm(page);
    await expect(form.date).toHaveValue('');
    await expect(form.alert).toHaveCount(0);
  });

  test('L2-023.3: a draft older than 24 hours is gone', async ({ page, backend }) => {
    await backend.scenario('unverified-customer', { email: 'marcia.t@example.com' });
    await backend.signInAs('marcia');
    await openForm(page);
    const form = new EnquiryFormDialog(page);
    await form.fill(ENTRY);
    await form.send.click();
    await expect(form.alertTitle).toHaveText('Verify your email to send enquiries');

    await backend.setNow('2026-10-11T15:00:00.000Z');
    await openForm(page);

    await expect(form.date).toBeFocused();
    await expect(form.date).toHaveValue('');
    await expect(form.alert).toHaveCount(0);
  });

  test('L2-023.4: a caterer account sees "Sign in with a customer account to send enquiries" instead of the form', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const caterer = await openForm(page, 'cou-cou');
    const form = new EnquiryFormDialog(page);

    await expect(form.recipient).toHaveText('to Cou-Cou');
    await expect(form.outcomeTitle).toHaveText('Sign in with a customer account to send enquiries');
    await expect(form.outcomeText).toHaveText('You’re signed in as Kendra Baptiste for Pelau House. Caterer accounts can’t send enquiries to other caterers.');
    await expect(form.date).toHaveCount(0);
    await expect(form.send).toHaveCount(0);
    await expect(form.switchAccount).toHaveAttribute('href', '/sign-in?returnUrl=%2Fcaterers%2Fcou-cou');
    await caterer.expectNoAccessibilityViolations();

    await form.closeFooter.click();
    await expect(form.dialog).toHaveCount(0);
    await expect(caterer.enquireButtonIn(caterer.panel)).toBeFocused();
  });

  test('L2-023.4: an operator account is told the same, and the server refuses a send from any non-customer', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    await openForm(page, 'cou-cou');
    const form = new EnquiryFormDialog(page);

    await expect(form.outcomeTitle).toHaveText('Sign in with a customer account to send enquiries');
    await expect(form.outcomeText).toHaveText('You’re signed in as Tomas Reyes, a Sweet Hand operator. Operator accounts can’t send enquiries.');

    const response = await form.postDirectly({ catererSlug: 'cou-cou', eventDate: '2026-12-12', guests: '40', area: 'north-york', postalCode: '', occasion: 'birthdays', message: ENTRY.message, challengeToken: 'local:enquiry:e2e' });
    expect(response.status).toBe(403);
    expect(response.body.code).toBe('customer-only');
  });
});
