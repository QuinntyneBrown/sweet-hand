import { test, expect } from '../../support/test';
import { AccountPage } from '../../pages/account.page';
import { cast } from '../../support/cast';

test.describe('Edit your details', () => {
  test.beforeEach(async ({ backend }) => {
    await backend.signInAs('marcia');
  });

  test('L2-067.4: "Edit details" opens a dialog with the current values and focus on the name; Escape returns focus', async ({ page }) => {
    const account = new AccountPage(page);
    await account.open();

    await account.button('Edit details').click();

    const dialog = account.editDetails;
    await expect(dialog.root).toBeVisible();
    await expect(dialog.description).toHaveText('Name, email and phone for your Sweet Hand account.');
    await expect(dialog.field('Display name')).toBeFocused();
    await expect(dialog.field('Display name')).toHaveValue('Marcia Thompson');
    await expect(dialog.field('Display name')).toHaveAccessibleDescription('2 to 50 characters. Caterers see this name.');
    await expect(dialog.field('Email')).toHaveValue(cast.marcia.email);
    await expect(dialog.field('Email')).toHaveAttribute('type', 'email');
    await expect(dialog.field('Email')).toHaveAccessibleDescription('Changing it sends a verification link to the new address.');
    await expect(dialog.field('Phone (optional)')).toHaveValue('+1 647 555 0187');
    await expect(dialog.field('Phone (optional)')).toHaveAttribute('type', 'tel');
    await expect(dialog.field('Phone (optional)')).toHaveAccessibleDescription('Private. Shared only in a thread when you choose.');
    await account.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');
    await expect(dialog.root).toHaveCount(0);
    await expect(account.button('Edit details')).toBeFocused();
  });

  test('L2-068.3: problems are summarised at the top of the dialog and nothing is sent', async ({ page, backend }) => {
    const account = new AccountPage(page);
    await account.open();
    await account.button('Edit details').click();
    const dialog = account.editDetails;

    await dialog.field('Display name').fill('M');
    await dialog.field('Email').fill('marcia.t@example');
    await dialog.button('Save details').click();

    await expect(dialog.errorSummary).toBeFocused();
    await expect(dialog.errorSummary.getByRole('heading', { level: 3 })).toHaveText('Fix 2 things to save your details');
    await expect(dialog.errorSummary.getByRole('link')).toHaveText(['Enter a display name of 2 to 50 characters', 'Enter an email address like name@example.com']);
    await expect(dialog.field('Display name')).toHaveAttribute('aria-invalid', 'true');
    await expect(dialog.errorFor('email')).toHaveText('Enter an email address like name@example.com');
    await account.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.path === '/api/me/details')).toHaveLength(0);
  });

  test('while saving, the fields are read-only and the dialog cannot be closed', async ({ page, backend }) => {
    await backend.hold('PUT /api/me/details');
    const account = new AccountPage(page);
    await account.open();
    await account.button('Edit details').click();
    const dialog = account.editDetails;

    await dialog.field('Phone (optional)').fill('+1 647 555 0123');
    await dialog.button('Save details').click();

    await expect(dialog.panel).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.button('Save details')).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field('Display name')).toHaveAttribute('readonly', '');
    await expect(dialog.close).toBeDisabled();
    await expect(dialog.cancel).toBeDisabled();
    await expect(dialog.status).toHaveText('Saving your details');
    await backend.release();
    await expect(dialog.root).toHaveCount(0);
  });

  test('when saving fails the changes stay in the dialog to try again', async ({ page, backend }) => {
    await backend.fail('PUT /api/me/details', { status: 500, times: 1 });
    const account = new AccountPage(page);
    await account.open();
    await account.button('Edit details').click();
    const dialog = account.editDetails;

    await dialog.field('Phone (optional)').fill('+1 647 555 0123');
    await dialog.button('Save details').click();

    await expect(dialog.alert).toHaveAttribute('role', 'alert');
    await expect(dialog.alert).toContainText('Your details weren’t saved');
    await expect(dialog.alert).toContainText('We couldn’t reach Sweet Hand. Your changes are still here; try again.');
    await expect(dialog.field('Phone (optional)')).toHaveValue('+1 647 555 0123');
    await account.expectNoAccessibilityViolations();

    await dialog.button('Save details').click();
    await expect(dialog.root).toHaveCount(0);
  });

  test('saved details update in place and a toast confirms', async ({ page, backend }) => {
    const account = new AccountPage(page);
    await account.open();
    await account.button('Edit details').click();

    await account.editDetails.field('Phone (optional)').fill('647-555-0123');
    await account.editDetails.button('Save details').click();

    await expect(account.editDetails.root).toHaveCount(0);
    await expect(account.detail('Phone')).toContainText('+1 647 555 0123');
    await expect(account.toast).toContainText('Details saved');
    await expect(account.toast).toContainText('Your phone number is now +1 647 555 0123.');
    await expect(account.button('Edit details')).toBeFocused();
    const { users } = await backend.state();
    expect(users.find((u: { id: string }) => u.id === 'user-marcia').phone).toBe('+1 647 555 0123');
  });

  test('L2-077.3: a new email address must be verified, and a link goes to it', async ({ page, backend }) => {
    const account = new AccountPage(page);
    await account.open();
    await account.button('Edit details').click();

    await account.editDetails.field('Email').fill('marcia.thompson@example.com');
    await account.editDetails.button('Save details').click();

    await expect(account.detail('Email')).toContainText('marcia.thompson@example.com');
    await expect(account.statusOf('Email')).toHaveText('Not verified');
    await expect(account.toast).toContainText('We sent a verification link to marcia.thompson@example.com.');
    const { account: state } = await backend.state();
    expect(await backend.emails()).toContainEqual(expect.objectContaining({ to: 'marcia.thompson@example.com', kind: 'verify-email' }));
  });
});
