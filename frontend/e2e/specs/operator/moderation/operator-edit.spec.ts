import { test, expect } from '../../../support/test';
import { CatererRecordPage } from '../../../pages/caterer-record.page';
import { OperatorEditDialog } from '../../../pages/operator-edit-dialog';
import { CatererPage } from '../../../pages/caterer.page';

const WITH_PHONE =
  'Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva. Call or text Kendra at 416-555-0142 to book.\n\nEverything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons.';
const WITHOUT_PHONE =
  'Kendra Baptiste learned to burn sugar for pelau in her grandmother’s kitchen in Couva.\n\nEverything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons.';

test.describe('Operator edits to caterer profiles', () => {
  test('L2-057.1 L2-057.4: an edit needs a reason, goes live and emails the caterer the reason', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new OperatorEditDialog(page);
    await record.goto('cat-001');
    const audit = await backend.watchAudit();

    await record.action('Edit').click();

    await expect(dialog.heading).toHaveText('Edit Pelau House');
    await expect(dialog.description).toHaveText('Live within a minute. Kendra is emailed your reason.');
    await expect(dialog.field).toHaveValue('description');
    await expect(dialog.value('Description')).toHaveValue(/^Kendra Baptiste learned to burn sugar/);
    await expect(dialog.reason).toBeFocused();
    await expect(dialog.reasonHelp).toHaveText('For example: Removed phone number from description');
    await record.expectNoAccessibilityViolations();

    await dialog.value('Description').fill(WITH_PHONE);
    await expect(dialog.counter).toHaveText('236 / 2,000');
    await dialog.value('Description').fill(WITHOUT_PHONE);
    await dialog.submit.click();

    await expect(dialog.summary.locator('h3')).toHaveText('Fix 1 thing to save the change');
    await expect(dialog.summaryLinks).toHaveText(['Add a reason for this change']);
    await expect(dialog.reasonError).toHaveText('Add a reason for this change');
    await expect(dialog.value('Description')).toHaveValue(WITHOUT_PHONE);
    await record.expectNoAccessibilityViolations();
    expect((await backend.requests()).filter((r) => r.method === 'PATCH')).toEqual([]);

    await dialog.reason.fill('Removed phone number from description');
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    const toast = record.toasts.titled('Change saved');
    await expect(record.toasts.textOf(toast)).toHaveText('Live within a minute. Kendra has been emailed your reason.');
    const state = await backend.state();
    expect(await audit.appended()).toEqual([
      expect.objectContaining({ action: 'Edit', targetId: 'cat-001', reason: 'Removed phone number from description', after: { description: WITHOUT_PHONE } }),
    ]);
    expect(state.operator.moderation.emails).toContainEqual(expect.objectContaining({ to: 'kendra@pelauhouse.example', kind: 'operator-edit', reason: 'Removed phone number from description' }));

    const caterer = new CatererPage(page);
    await caterer.open('pelau-house');
    await expect(page.getByText('Everything is cooked the morning of your event and arrives hot, with chafing dishes and serving spoons.', { exact: true })).toBeVisible();
  });

  test('L2-057: an operator can change the guest range', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const record = new CatererRecordPage(page);
    const dialog = new OperatorEditDialog(page);
    await record.goto('cat-001');
    await record.action('Edit').click();

    await dialog.choose('Guest range');
    await dialog.value('Fewest guests').fill('20');
    await dialog.value('Most guests').fill('10');
    await dialog.reason.fill('Guest range confirmed with Kendra by phone.');
    await dialog.submit.click();
    await expect(dialog.summaryLinks).toHaveText(['Make the most guests at least the fewest']);

    await dialog.value('Most guests').fill('250');
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(record.detail('Profile', 'Guests')).toHaveText('Serves 20–250 guests');
  });

  test('L2-057: a cuisine that isn’t on the list is refused by the server and explained', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new OperatorEditDialog(page);
    await record.goto('cat-001');
    await record.action('Edit').click();

    await dialog.choose('Cuisines');
    await expect(dialog.value('Cuisines')).toHaveValue('Trinidadian & Tobagonian, Guyanese');
    await dialog.value('Cuisines').fill('Trinidadian & Tobagonian, Martian');
    await dialog.reason.fill('Cuisine list corrected.');
    await dialog.submit.click();

    await expect(dialog.valueError).toHaveText('“Martian” isn’t on the cuisine list');
    await dialog.value('Cuisines').fill('Trinidadian & Tobagonian');
    await dialog.submit.click();
    await expect(record.detail('Profile', 'Cuisines')).toHaveText('Trinidadian & Tobagonian (primary)');
  });

  test('L2-057.2: removing a photo below the minimum still goes ahead, and the caterer has 14 days to replace it', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new OperatorEditDialog(page);
    await record.goto('cat-005');
    await expect(record.photos).toHaveCount(3);
    const audit = await backend.watchAudit();
    await record.action('Edit').click();

    await dialog.choose('A photo');
    await dialog.value('Photo to remove').selectOption({ index: 2 });
    await dialog.reason.fill('Photo shows another caterer’s logo.');
    await expect(dialog.submit).toHaveText('Remove photo');
    await dialog.submit.click();

    await expect(dialog.dialog).toBeHidden();
    await expect(record.photos).toHaveCount(2);
    const toast = record.toasts.titled('Photo removed');
    await expect(record.toasts.textOf(toast)).toHaveText('Black Cake Co. is below the minimum now. Paulette has until Sat 24 Oct to add a replacement.');
    const state = await backend.state();
    expect(state.caterers.find((c: { id: string }) => c.id === 'cat-005').status).toBe('Published');
    expect(state.operator.moderation.emails).toContainEqual(expect.objectContaining({ to: 'paulette@blackcakeco.example', kind: 'operator-removed-photo', reason: 'Photo shows another caterer’s logo.' }));
    expect(await audit.appended()).toEqual([expect.objectContaining({ action: 'Remove photo', targetId: 'cat-005' })]);
  });

  test('L2-057: removing a dish works the same way', async ({ page, backend }) => {
    await backend.signInAs('leah');
    const record = new CatererRecordPage(page);
    const dialog = new OperatorEditDialog(page);
    await record.goto('cat-001');
    await record.action('Edit').click();

    await dialog.choose('A menu item');
    await dialog.value('Dish to remove').selectOption({ label: 'Shrimp fried rice' });
    await dialog.reason.fill('Duplicate of the shrimp dish further down.');
    await dialog.submit.click();

    await expect(record.detail('Profile', 'Menu')).toHaveText('17 dishes');
    await expect(record.toasts.titled('Dish removed')).toBeVisible();
  });

  test('operator-edit busy and failed: the change and the reason are kept', async ({ page, backend }) => {
    await backend.signInAs('leah');
    await backend.fail('PATCH /api/operator/profiles/cat-001', { status: 500, times: 1 });
    const record = new CatererRecordPage(page);
    const dialog = new OperatorEditDialog(page);
    await record.goto('cat-001');
    await record.action('Edit').click();
    await dialog.value('Description').fill(WITHOUT_PHONE);
    await dialog.reason.fill('Removed phone number from description');

    await dialog.submit.click();

    await expect(dialog.alert).toContainText('We couldn’t save your change');
    await expect(dialog.alert).toContainText('Nothing has changed. Check your connection and try again; your reason is kept.');
    await expect(dialog.value('Description')).toHaveValue(WITHOUT_PHONE);
    await expect(dialog.reason).toHaveValue('Removed phone number from description');

    await backend.hold('PATCH /api/operator/profiles/cat-001');
    await dialog.submit.click();
    await expect(dialog.submit).toHaveAttribute('aria-busy', 'true');
    await expect(dialog.field).toBeDisabled();
    await expect(dialog.value('Description')).toHaveAttribute('readonly', '');
    await expect(dialog.status).toHaveText('Saving the change');
    await backend.release();
    await expect(dialog.dialog).toBeHidden();
  });
});
