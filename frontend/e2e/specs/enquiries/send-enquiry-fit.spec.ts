import { test, expect } from '../../support/test';
import { CatererPage } from '../../pages/caterer.page';
import { EnquiryFormDialog } from '../../pages/enquiry-form-dialog';
import { EnquiriesPage } from '../../pages/enquiries.page';

const MESSAGE =
  'Our church anniversary dinner, 500 guests at a hall in Oshawa. Pelau, curry chicken, buss up shut and callaloo, served buffet style around 5 p.m.';

test.describe('Fit warnings on the enquiry form', () => {
  test('L2-024.1 L2-024.2 form-field AC-12: 500 guests and Oshawa are flagged beside their fields without blocking', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();

    await form.fill({ date: '2027-06-05', guests: '500', area: 'Oshawa', postal: 'L1H 7K4', occasion: 'Religious and cultural celebrations', message: MESSAGE });

    await expect(form.warningFor('guests')).toHaveText('This caterer usually serves 20–300 guests');
    await expect(form.guests).toHaveAccessibleDescription('This caterer usually serves 20–300 guests Pelau House serves 20–300');
    await expect(form.guests).not.toHaveAttribute('aria-invalid', 'true');
    await expect(form.warningFor('area')).toHaveText('This caterer doesn’t list Oshawa as an area they serve');
    await expect(form.area).toHaveAccessibleDescription('This caterer doesn’t list Oshawa as an area they serve');
    await expect(form.area).not.toHaveAttribute('aria-invalid', 'true');
    await expect(form.dialog.getByRole('status').filter({ hasText: 'This caterer doesn’t list Oshawa as an area they serve' })).toHaveCount(1);
    await expect(form.summary).toHaveCount(0);
    await expect(form.send).toBeEnabled();
    await expect(form.counter).toHaveText('145 / 2,000');
    await caterer.expectNoAccessibilityViolations();

    await form.fill({ guests: '120', area: 'Scarborough' });
    await expect(form.warnings).toHaveCount(0);
  });

  test('L2-024.3: the enquiry is sent despite the warnings, and Pelau House sees the same warnings', async ({ page, backend }) => {
    await backend.signInAs('devon');
    const caterer = new CatererPage(page);
    const form = new EnquiryFormDialog(page);
    await caterer.open('pelau-house');
    await caterer.enquireButtonIn(caterer.panel).click();
    await form.fill({ date: '2027-06-05', guests: '500', area: 'Oshawa', postal: 'L1H 7K4', occasion: 'Religious and cultural celebrations', message: MESSAGE });

    await form.send.click();

    await expect(form.outcomeTitle).toHaveText('Enquiry sent to Pelau House');

    await backend.signInAs('kendra');
    const enquiries = new EnquiriesPage(page);
    await enquiries.open();
    await enquiries.enquiries.choose('Devon Walters');
    await expect(enquiries.thread.fitWarnings).toHaveText(['You usually serve 20–300 guests', 'You don’t list Oshawa as an area you serve']);
  });
});
