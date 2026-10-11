import { test, expect } from '../../support/test';
import { LaunchPage } from '../../pages/launch.page';

const marcia = { role: 'Planning an event', email: 'marcia.t@example.com', consent: true } as const;

/** Signs up through the page and returns the tokens from the email the backend queued. */
async function signUp(launch: LaunchPage, backend: Parameters<Parameters<typeof test>[2]>[0]['backend']) {
  await launch.open();
  await launch.signUp(marcia);
  await expect(launch.resultTitle).toHaveText('Check your email');
  return backend.launchListTokens(marcia.email);
}

test.describe('Confirm the launch list email', () => {
  test('L2-099.2 L2-099.3 L2-107.6: a live confirmation link shows "You’re on the list", focuses it and cleans the address', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    const { confirm } = await signUp(launch, backend);
    await launch.openConfirmationLink(confirm!);
    await expect(launch.resultTitle).toHaveText('You’re on the list');
    await expect(launch.resultText).toHaveText('See you on launch day.');
    await expect(launch.resultTitle).toBeFocused();
    await page.keyboard.press('Tab');
    await expect(launch.removeMyEmail).toBeFocused();
    await expect(page).toHaveURL((url) => url.search === '');
    const state = await backend.state();
    expect(state.launchList[0].status).toBe('Confirmed');
    await launch.expectNoAccessibilityViolations();
  });

  test('L2-099.4 L2-103.3: a used or unknown link says it has expired above an empty form', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    const { confirm } = await signUp(launch, backend);
    await launch.openConfirmationLink(confirm!);
    await expect(launch.resultTitle).toHaveText('You’re on the list');
    await launch.openConfirmationLink(confirm!);
    await expect(launch.notice).toContainText('That link has expired');
    await expect(launch.notice).toContainText('Enter your email again for a new one.');
    await expect(launch.email).toHaveValue('');
    await expect(launch.consent).not.toBeChecked();
    await expect(page).toHaveURL((url) => url.search === '');
    await launch.expectNoAccessibilityViolations();
  });
});

test.describe('Leave the launch list', () => {
  test('L2-100.1 L2-103.3: "Remove my email" deletes the address and says so above an empty form', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    const { confirm } = await signUp(launch, backend);
    await launch.openConfirmationLink(confirm!);
    await launch.removeMyEmail.click();
    await expect(launch.notice).toContainText('You’re off the list');
    await expect(launch.notice).toContainText('We’ve deleted marcia.t@example.com.');
    await expect(launch.consent).not.toBeChecked();
    expect((await backend.state()).launchList ?? []).toEqual([]);
    await launch.expectNoAccessibilityViolations();
  });

  test('L2-100.3 L2-100.6: the removal link from an email deletes the address and cleans the address bar', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    const { remove } = await signUp(launch, backend);
    await launch.openRemovalLink(remove);
    await expect(launch.notice).toContainText('We’ve deleted marcia.t@example.com.');
    await expect(page).toHaveURL((url) => url.search === '');
    expect((await backend.state()).launchList ?? []).toEqual([]);
  });

  test('L2-100.5: a removal link for an address already gone says "You’re off the list" without naming anyone', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    const { remove } = await signUp(launch, backend);
    await launch.openRemovalLink(remove);
    await expect(launch.notice).toContainText('We’ve deleted');
    await launch.openRemovalLink(remove);
    await expect(launch.notice).toHaveText('You’re off the list');
  });
});
