import { test, expect } from '../../support/test';
import { LaunchPage } from '../../pages/launch.page';

const kendra = { role: 'A caterer', businessName: 'Pelau House', email: 'kendra@pelauhouse.example', consent: true } as const;
const marcia = { role: 'Planning an event', email: 'marcia.t@example.com', consent: true } as const;

test.describe('Join the launch list', () => {
  test('L2-095.1 L2-095.5: the form asks for a role, an email and consent, with nothing chosen at first', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await expect(launch.roleGroup).toBeVisible();
    await expect(launch.role('Planning an event')).not.toBeChecked();
    await expect(launch.role('A caterer')).not.toBeChecked();
    await expect(launch.businessName).toHaveCount(0);
    await expect(launch.email).toHaveAttribute('type', 'email');
    await expect(launch.email).toHaveAttribute('autocomplete', 'email');
    await expect(launch.email).toHaveAttribute('spellcheck', 'false');
    await expect(launch.consent).not.toBeChecked();
    await expect(launch.consent).toHaveAccessibleDescription('One email, nothing else. Privacy');
    await expect(launch.consentPrivacyLink).toHaveAttribute('href', '/privacy');
    await expect(launch.submit).toHaveText('Get the launch email');
    await expect(launch.signUpSection.locator('input:not([type=radio]):not([type=checkbox])')).toHaveCount(1);
  });

  test('L2-095.2 L2-095.4 L2-107.3: choosing "A caterer" shows an optional business name of at most 60 characters, without moving focus', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.role('Planning an event').focus();
    await page.keyboard.press('ArrowRight');
    await expect(launch.role('A caterer')).toBeChecked();
    await expect(launch.role('A caterer')).toBeFocused();
    await expect(launch.businessName).toBeVisible();
    await expect(launch.businessName).toHaveAttribute('autocomplete', 'organization');
    await launch.businessName.fill('x'.repeat(61));
    await expect(launch.businessName).toHaveValue('x'.repeat(60));
    await launch.expectNoAccessibilityViolations();
  });

  test('L2-096.1 L2-096.3: submitting with three problems sends nothing and lists them all, linked to their fields', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.signUp({ email: 'marcia.t@example' });
    await expect(launch.errorSummary).toBeFocused();
    await expect(launch.errorSummaryTitle).toHaveText('Fix 3 things');
    await expect(launch.errorSummary.getByRole('link')).toHaveText(['Choose one', 'Enter an email like name@example.com', 'Tick the box to get the email']);
    await expect(launch.errorFor('role')).toHaveText('Choose one');
    await expect(launch.role('Planning an event')).toHaveAttribute('aria-invalid', 'true');
    await expect(launch.role('Planning an event')).toHaveAttribute('aria-describedby', 'role-error');
    await expect(launch.email).toHaveAttribute('aria-invalid', 'true');
    await expect(launch.email).toHaveAccessibleDescription('Enter an email like name@example.com');
    await expect(launch.consent).toHaveAttribute('aria-invalid', 'true');
    await expect(launch.consent).toHaveAccessibleDescription('Tick the box to get the email One email, nothing else. Privacy');
    expect(await backend.requests()).toEqual([]);

    await launch.summaryLink('Choose one').click();
    await expect(launch.role('Planning an event')).toBeFocused();
    await launch.summaryLink('Enter an email like name@example.com').click();
    await expect(launch.email).toBeFocused();
    await launch.expectNoAccessibilityViolations();
  });

  test('L2-096.2 L2-096.4: fixing a field removes its message at once; the summary counts what is left on the next submit', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.signUp({ email: 'marcia.t@example' });
    await launch.role('Planning an event').check();
    await expect(launch.errorFor('role')).toHaveCount(0);
    await expect(launch.errorSummaryTitle).toHaveText('Fix 3 things');
    await launch.submit.click();
    await expect(launch.errorSummaryTitle).toHaveText('Fix 2 things');
    await launch.consent.check();
    await launch.submit.click();
    await expect(launch.errorSummaryTitle).toHaveText('Fix 1 thing');
  });

  test('L2-097.1 L2-097.2: while sending, the form is locked, busy and announced, and a second submit sends nothing', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await backend.hold('POST /api/launch-list/sign-ups');
    await launch.signUp(kendra);
    await expect(launch.busyAnnouncement).toHaveText('Adding you to the list');
    await expect(launch.role('A caterer')).toBeDisabled();
    await expect(launch.consent).toBeDisabled();
    await expect(launch.email).toHaveAttribute('readonly', '');
    await expect(launch.businessName).toHaveAttribute('readonly', '');
    await expect(launch.submit).toHaveAttribute('aria-busy', 'true');
    await expect(launch.submit).toHaveAttribute('aria-disabled', 'true');
    await launch.activateSubmitWhileBusy();
    await launch.email.focus();
    await page.keyboard.press('Enter');
    expect((await backend.requests()).filter((r) => r.path === '/api/launch-list/sign-ups')).toHaveLength(1);
    await launch.expectNoAccessibilityViolations();
  });

  test('L2-098.1 L2-103.1: a valid sign-up shows "Check your email", moves focus there and queues a confirmation email', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.signUp(kendra);
    await expect(launch.resultTitle).toHaveText('Check your email');
    await expect(launch.resultText).toHaveText('Confirm the link we sent to kendra@pelauhouse.example.');
    await expect(launch.result).toBeFocused();
    await expect(launch.resultAnnouncement).toHaveText('Check your email. We sent a confirmation link.');
    const sent = (await backend.requests()).find((r) => r.path === '/api/launch-list/sign-ups');
    expect(sent?.body).toMatchObject({ role: 'caterer', email: 'kendra@pelauhouse.example', businessName: 'Pelau House', consent: true });
    const emails = await backend.emails();
    expect(emails.map((e) => [e.to, e.kind])).toEqual([['kendra@pelauhouse.example', 'launch-confirm']]);
    await launch.expectNoAccessibilityViolations();
  });

  test('L2-095.3: a business name typed before switching to "Planning an event" is hidden and not sent', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.fill({ role: 'A caterer', businessName: 'Pelau House' });
    await launch.signUp(marcia);
    await expect(launch.businessName).toHaveCount(0);
    await expect(launch.resultTitle).toHaveText('Check your email');
    const sent = (await backend.requests()).find((r) => r.path === '/api/launch-list/sign-ups');
    expect(sent?.body).not.toHaveProperty('businessName');
  });

  test('L2-098.3 L2-103.3: "Use a different address" brings back an empty form and focuses its heading', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.signUp(marcia);
    await launch.useDifferentAddress.click();
    await expect(launch.signUpHeading).toBeFocused();
    await expect(launch.role('Planning an event')).not.toBeChecked();
    await expect(launch.email).toHaveValue('');
    await expect(launch.consent).not.toBeChecked();
  });

  test('L2-097.3 L2-097.4: when the server fails, the details stay with a reference, and "Try again" sends them again', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await backend.fail('POST /api/launch-list/sign-ups', { status: 503, times: 1, headers: { 'x-correlation-id': '4b9e1d07-aaaa-bbbb-cccc-ddddeeeeffff' } });
    await launch.signUp(kendra);
    await expect(launch.failure).toContainText('We couldn’t add you just now');
    await expect(launch.failure).toContainText('Your details are still here. Reference 4b9e1d07.');
    await expect(launch.email).toHaveValue('kendra@pelauhouse.example');
    await expect(launch.businessName).toHaveValue('Pelau House');
    await expect(launch.consent).toBeChecked();
    await expect(launch.submit).toHaveText('Try again');
    await launch.expectNoAccessibilityViolations();

    await launch.submit.click();
    await expect(launch.resultTitle).toHaveText('Check your email');
    await expect(launch.failure).toHaveCount(0);
  });

  test('L2-097.3: when the network fails, the reference comes from the page itself', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await backend.fail('POST /api/launch-list/sign-ups', { network: true });
    await launch.signUp(marcia);
    await expect(launch.failure).toContainText(/Reference [0-9a-f]{8}\./);
  });

  test('L2-097.3: no answer within 15 seconds counts as a failure', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await backend.hold('POST /api/launch-list/sign-ups');
    await launch.signUp(marcia);
    await expect(launch.busyAnnouncement).toBeVisible();
    await launch.waitFor(15_000);
    await expect(launch.failure).toContainText(/Reference [0-9a-f]{8}\./);
    await expect(launch.email).toHaveValue('marcia.t@example.com');
  });

  test('L2-097.5: a rate-limited sign-up shows the error state and does not retry by itself', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await backend.fail('POST /api/launch-list/sign-ups', { status: 429, headers: { 'retry-after': '600' } });
    await launch.signUp(marcia);
    await expect(launch.failure).toBeVisible();
    expect((await backend.requests()).filter((r) => r.path === '/api/launch-list/sign-ups')).toHaveLength(1);
  });

  test('L2-096.6: field errors from the server show like the page’s own', async ({ page, backend }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await backend.fail('POST /api/launch-list/sign-ups', { status: 400, body: { title: 'Check the form', errors: { email: ['Enter an email like name@example.com'] } } });
    await launch.signUp(marcia);
    await expect(launch.errorSummaryTitle).toHaveText('Fix 1 thing');
    await expect(launch.errorFor('email')).toHaveText('Enter an email like name@example.com');
    await expect(launch.errorSummary).toBeFocused();
  });

  test('L2-106.4: a half-filled form keeps its values when the phone rotates', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.usePhone();
    await launch.open();
    await launch.fill({ role: 'A caterer', businessName: 'Pelau House', email: 'kendra@pelauhouse.example' });
    await page.setViewportSize({ width: 780, height: 375 });
    await expect(launch.role('A caterer')).toBeChecked();
    await expect(launch.businessName).toHaveValue('Pelau House');
    await expect(launch.email).toHaveValue('kendra@pelauhouse.example');
  });
});
