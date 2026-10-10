import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';
import { InboxPage } from '../../pages/inbox.page';

const ENTRY = {
  date: '2026-11-21',
  guests: '120',
  area: 'Scarborough',
  postal: 'M1E 4R8',
  occasion: 'Family gatherings',
  message: 'We’d love pelau, curry goat and macaroni pie for about 120 people, buffet style around 6 p.m.',
};

test.describe('Sending, failing and trying again', () => {
  test.beforeEach(async ({ backend, page }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();
    await new EnquiryFormDialog(page).fill(ENTRY);
  });

  const posts = async (backend: { requests(): Promise<{ method: string; path: string }[]> }) =>
    (await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/enquiries');

  test('dialog AC-10 form-layout busy: while sending, the fields are read-only, Cancel and Close are disabled, and Escape does nothing', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await backend.hold('POST /api/enquiries');

    await form.send.click();

    await expect(form.send).toHaveAttribute('aria-busy', 'true');
    await expect(form.send).toHaveAttribute('aria-disabled', 'true');
    await expect(form.status).toHaveText('Sending your enquiry');
    await expect(form.date).toHaveAttribute('readonly', '');
    await expect(form.guests).toHaveAttribute('readonly', '');
    await expect(form.postal).toHaveAttribute('readonly', '');
    await expect(form.message).toHaveAttribute('readonly', '');
    await expect(form.area).toBeDisabled();
    await expect(form.occasion).toBeDisabled();
    await expect(form.cancel).toBeDisabled();
    await expect(form.close).toBeDisabled();
    await page.keyboard.press('Escape');
    await form.guests.press('Enter');
    await expect(form.dialog).toBeVisible();
    await caterer.expectNoAccessibilityViolations();
    await backend.release();

    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');
    expect(await posts(backend)).toHaveLength(1);
  });

  test('L2-089 form-layout failed: a server error keeps every value, gives a reference and offers "Try again"', async ({ page, backend }) => {
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await backend.fail('POST /api/enquiries', { status: 500, times: 1, body: { title: 'Something went wrong', correlationId: '7f3k-92qd' } });

    await form.send.click();

    await expect(form.alert).toHaveAttribute('role', 'alert');
    await expect(form.alertTitle).toHaveText('Your enquiry wasn’t sent');
    await expect(form.alertText).toHaveText('Something went wrong on our side. Everything you typed is still here.');
    await expect(form.alertReference).toHaveText('7f3k-92qd');
    await form.expectValues(ENTRY);
    await expect(form.tryAgain).toBeVisible();
    await caterer.expectNoAccessibilityViolations();

    await form.tryAgain.click();

    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');
  });

  test('a dropped connection keeps the values and offers "Try again"', async ({ page, backend }) => {
    const form = new EnquiryFormDialog(page);
    await backend.fail('POST /api/enquiries', { network: true, times: 1 });

    await form.send.click();

    await expect(form.alertTitle).toHaveText('Your enquiry wasn’t sent');
    await expect(form.alertReference).toHaveCount(0);
    await form.expectValues(ENTRY);
    await expect(form.tryAgain).toBeVisible();
  });

  test('L2-030.1 L2-091.1: with the email provider down the enquiry is still created and confirmed, and the email waits in the queue', async ({ page, backend }) => {
    const form = new EnquiryFormDialog(page);
    await backend.scenario('email-provider-down');

    await form.send.click();

    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');
    await expect(form.outcomeText).toHaveText(
      'Kendra gets an email as soon as our mail service catches up. We’ll email you when they reply, and the conversation lives in your inbox.',
    );
    const inbox = new InboxPage(page);
    await inbox.open();
    await expect(inbox.enquiries.statusOf(inbox.enquiries.row('Pelau House'))).toHaveText('Open');
  });
});
