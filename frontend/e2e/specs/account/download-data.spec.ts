import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { cast } from '../../support/cast';

test.describe('Download my data', () => {
  test('L2-071.1: the dialog lists what the export holds and how it arrives', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const account = new AccountPage(page);
    await account.open();

    await account.button('Download my data').click();

    const dialog = account.downloadData;
    await expect(dialog.title).toHaveText('Download your data');
    await expect(dialog.description).toHaveText('A JSON file with everything Sweet Hand holds about you.');
    await expect(dialog.listItems).toHaveText(['Your profile and consent records', '4 enquiries and every message in them', '2 reviews you wrote', '1 report you sent']);
    await expect(dialog.body).toContainText('Caterers’ contact details are included only where they shared them with you.');
    await expect(dialog.button('Request export')).toBeFocused();
    await account.expectNoAccessibilityViolations();
  });

  test('L2-071: requesting an export confirms where the link will go, then the page shows it in progress', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.hold('POST /api/me/data-exports');
    const account = new AccountPage(page);
    await account.open();
    await account.button('Download my data').click();
    const dialog = account.downloadData;

    await dialog.button('Request export').click();

    await expect(dialog.button('Request export')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.status).toHaveText('Requesting your export');
    await expect(dialog.cancel).toBeDisabled();
    await backend.release();
    await expect(dialog.title).toHaveText('Export requested');
    await expect(dialog.description).toHaveText('Nothing else to do for now.');
    await expect(dialog.body).toContainText(`We’re preparing your file. We’ll email a download link to ${cast.marcia.email} within 24 hours.`);
    await expect(dialog.body).toContainText('The link works for 7 days, and only when you’re signed in as Marcia.');
    await expect(dialog.button('Done')).toBeFocused();
    await account.expectNoAccessibilityViolations();

    await dialog.button('Done').click();

    await expect(dialog.root).toHaveCount(0);
    await expect(account.alert).toHaveAttribute('role', 'status');
    await expect(account.alert).toContainText('Export requested today at 10:00 a.m.');
    await expect(account.alert).toContainText(`We’ll email a download link to ${cast.marcia.email} within 24 hours. It works for 7 days, only when you’re signed in.`);
    await expect(account.button('Export in progress')).toBeDisabled();
    await account.expectNoAccessibilityViolations();

    await account.open();
    await expect(account.button('Export in progress')).toBeDisabled();
  });

  test('when the request fails, nothing is requested and the person can try again', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    await backend.fail('POST /api/me/data-exports', { status: 500, times: 1 });
    const account = new AccountPage(page);
    await account.open();
    await account.button('Download my data').click();

    await account.downloadData.button('Request export').click();

    await expect(account.downloadData.alert).toContainText('Your export wasn’t requested');
    await account.downloadData.button('Request export').click();
    await expect(account.downloadData.title).toHaveText('Export requested');
  });

  test('L2-071.2: a caterer’s export holds their profile, full-size photos, menu and enquiries', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const account = new AccountPage(page);
    await account.open();

    await account.button('Download my data').click();

    await expect(account.downloadData.listItems).toHaveText([
      'Your account, profile and consent records',
      '6 full-size photos',
      '18 dishes and your food handler certificate details',
      '5 enquiries and every message in them',
      '1 response to a review',
    ]);
    await expect(account.downloadData.body).toContainText('Customers’ contact details are included only where they shared them with you.');
  });
});
