import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';
import { InboxPage } from '../../pages/inbox.page';
import { EnquiriesPage } from '../../pages/enquiries.page';

const MESSAGE =
  'Hi Kendra, we’re planning my parents’ 40th anniversary at a hall on Ellesmere Road. We’d love pelau, curry goat, macaroni pie and callaloo for about 120 people, served buffet style around 6 p.m. Do you bring chafing dishes?';

const ENTRY = { date: '2026-11-21', guests: '120', area: 'Scarborough', postal: 'M1E 4R8', occasion: 'Family gatherings', message: MESSAGE };

test.describe('Sending an enquiry', () => {
  test('L2-026.2 L2-026.3 dialog AC-5 AC-15: a customer opens the form for Pelau House in a 640px dialog with the right keyboards', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');

    await caterer.enquireButtonIn(caterer.panel).click();

    await expect(form.dialog).toBeVisible();
    await expect(form.recipient).toHaveText('to Pelau House');
    await expect(form.dialog).toHaveAccessibleDescription('to Pelau House');
    await expect(form.coverPhoto).toHaveAttribute('alt', '');
    await expect(form.coverPhoto).toHaveAttribute('src', /pelau-house/);
    expect((await form.panel.boundingBox())!.width).toBeLessThanOrEqual(640);
    await expect(form.date).toBeFocused();
    await expect(form.date).toHaveAttribute('type', 'date');
    await expect(form.date).toHaveAttribute('min', '2026-10-12');
    await expect(form.date).toHaveAttribute('max', '2028-10-10');
    await expect(form.date).toHaveAccessibleDescription('At least 2 days from today');
    await expect(form.guests).toHaveAttribute('inputmode', 'numeric');
    await expect(form.guests).toHaveAccessibleDescription('Pelau House serves 20–300');
    await expect(form.postal).toHaveAttribute('autocomplete', 'postal-code');
    await expect(form.postal).toHaveAccessibleDescription('We keep only the first 3 characters');
    await expect(form.area.locator('optgroup')).toHaveCount(5);
    await expect(form.occasion.locator('option')).toHaveText([
      'Choose an occasion',
      'Weddings',
      'Birthdays',
      'Corporate events',
      'Funerals and repasts',
      'Religious and cultural celebrations',
      'Family gatherings',
      'Private dinners',
      'Community events',
    ]);
    await expect(form.message).toHaveAccessibleDescription('What you’d like to eat, serving style, timing 0 / 2,000');
    await expect(form.privacyNote).toHaveText('Pelau House sees your name, not your email or phone.');
    await caterer.expectNoAccessibilityViolations();
  });

  test('L2-022.1 dialog AC-12: a verified customer sends the enquiry, sees it confirmed by name, and it reaches both inboxes', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();

    await form.fill(ENTRY);
    await expect(form.counter).toHaveText('223 / 2,000');
    await form.send.click();

    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');
    await expect(form.outcome).toHaveAttribute('role', 'status');
    await expect(form.outcomeText).toHaveText('Kendra gets an email now. We’ll email you when they reply, and the conversation lives in your inbox.');
    await expect(form.summaryValue('Date')).toHaveText('Sat 21 Nov');
    await expect(form.summaryValue('Guests')).toHaveText('120');
    await expect(form.summaryValue('Area')).toHaveText('Scarborough');
    await expect(form.summaryValue('Occasion')).toHaveText('Family gatherings');
    await expect(form.dialog).toHaveAccessibleName('Send an enquiry');
    await expect(form.goToInbox).toBeFocused();
    await expect(form.backToCaterer).toHaveText('Back to Pelau House');
    await caterer.expectNoAccessibilityViolations();

    const sent = (await backend.requests()).filter((r) => r.method === 'POST' && r.path === '/api/enquiries');
    expect(sent).toHaveLength(1);
    expect(sent[0].body).toMatchObject({ catererSlug: 'pelau-house', eventDate: '2026-11-21', guests: '120', area: 'scarborough', occasion: 'family-gatherings', challengeToken: expect.any(String) });

    await form.goToInbox.click();
    await expect(page).toHaveURL(/\/inbox\/[0-9a-f-]{36}$/);
    await expect(form.dialog).toHaveCount(0);

    const inbox = new InboxPage(page);
    await inbox.open();
    const row = inbox.enquiries.row('Pelau House');
    await expect(inbox.enquiries.summaryOf(row)).toHaveText('Sat 21 Nov · 120 guests');
    await expect(inbox.enquiries.statusOf(row)).toHaveText('Open');

    await backend.signInAs('kendra');
    const enquiries = new EnquiriesPage(page);
    await enquiries.open();
    const received = enquiries.enquiries.row('Devon Walters');
    await expect(enquiries.enquiries.statusOf(received)).toHaveText('Open');
    await expect(enquiries.enquiries.summaryOf(received)).toHaveText('Sat 21 Nov · 120 guests · Family gatherings');
  });

  test('"Back to Pelau House" closes the confirmation and returns focus to the button that opened the form', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');
    const trigger = caterer.enquireButtonIn(caterer.panel);
    await trigger.click();
    await form.fill(ENTRY);
    await form.send.click();

    await form.backToCaterer.click();

    await expect(form.dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('L2-067.4: Escape and Cancel close the form and return focus to the button that opened it', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');
    const trigger = caterer.enquireButtonIn(caterer.panel);

    await trigger.click();
    await expect(form.date).toBeFocused();
    await page.keyboard.press('Escape');
    await expect(form.dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();

    await trigger.click();
    await expect(form.date).toBeFocused();
    await form.cancel.click();
    await expect(form.dialog).toHaveCount(0);
    await expect(trigger).toBeFocused();
  });

  test('L2-026.1 dialog AC-25: on a phone the form fills the screen in one column and "Send enquiry" stays visible', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.usePhone();
    await caterer.open('pelau-house');

    await caterer.enquireButtonIn(caterer.stickyBar).click();

    await expect(form.dialog).toBeVisible();
    const box = (await form.panel.boundingBox())!;
    expect(box.x).toBe(0);
    expect(box.width).toBe(360);
    expect(box.height).toBeCloseTo(780, 0);
    await expect(form.send).toBeInViewport();
    const date = (await form.date.boundingBox())!;
    const guests = (await form.guests.boundingBox())!;
    expect(guests.y).toBeGreaterThan(date.y);
    await form.message.focus();
    await expect(form.message).toBeInViewport();
    await expect(form.send).toBeInViewport();
    await caterer.expectNoHorizontalScroll();
    await caterer.expectNoAccessibilityViolations();
  });
});
