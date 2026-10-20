// Acceptance Test
// Traces to: L2-122
// Description: The launch site serves the PNG logo the branded confirmation email loads.
import { test, expect } from '../../support/test';
import { LaunchPage } from '../../pages/launch.page';

test.describe('The confirmation email logo', () => {
  test('L2-122.2: the launch site serves the email logo as a PNG at /img/sweet-hand-email-logo.png', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();

    const logo = await launch.fetchEmailLogo();

    expect(logo.status()).toBe(200);
    expect(logo.headers()['content-type']).toBe('image/png');
  });
});
