import { test, expect } from '../../support/test';
import { LaunchPage } from '../../pages/launch.page';

test.describe('The launch page', () => {
  test('L2-093.1 L2-093.3: it shows the header, hero, sign-up, how it works, caterer call-out and footer with the mock’s copy', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();

    await expect(page).toHaveTitle('Sweet Hand · Opening soon in Toronto and the GTA');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en-CA');
    await expect(launch.wordmark).toHaveAttribute('href', '/');
    await expect(launch.headerButton).toHaveAttribute('href', '#notify');
    await expect(launch.overline).toHaveText('Opening soon · Toronto and the GTA');
    await expect(page.getByRole('heading', { level: 1 })).toHaveCount(1);
    await expect(launch.heading).toHaveText('Find someone with a sweet hand');
    await expect(launch.subtitle).toHaveText('Jamaican, Trini, Guyanese, Bajan and more: caterers across Toronto and the GTA, all in one place.');
    expect(await launch.partHeadings()).toEqual(['Find someone with a sweet hand', 'Get the launch email', 'How it works', 'Caterers: be there on day one']);
    await expect(launch.numberedSteps).toHaveText(['BrowseBy island, area and occasion.', 'EnquireSend your date and guest count.', 'AgreeDirectly with the caterer. No fees.']);
    await expect(launch.catererText).toHaveText('Listing is free. You’ll need a food handler certificate.');
    await expect(launch.footer).toContainText('Sweet Hand');
    await expect(launch.footerLink('Contact')).toHaveAttribute('href', /^mailto:.+@.+/);

    expect(await launch.metaContent('meta[name="description"]')).toBeTruthy();
    expect(await launch.metaContent('meta[property="og:title"]')).toBe('Sweet Hand · Opening soon in Toronto and the GTA');
    expect(await launch.metaContent('meta[property="og:description"]')).toBeTruthy();
    expect(await launch.metaContent('meta[property="og:image"]')).toBeTruthy();
    await expect(launch.canonical).toHaveAttribute('href', /\/$/);
  });

  test('L2-093.2: its only links are home, in-page anchors, the privacy notice and the contact address', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    for (const href of await launch.allLinkTargets()) {
      expect(href, href).toMatch(/^(\/|#[\w-]+|\/privacy|mailto:.+)$/);
    }
  });

  test('L2-105.5 L2-103.5: opening the page makes no API request and sets no cookie', async ({ page, backend, context }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    expect(await backend.requests()).toEqual([]);
    expect(await context.cookies()).toEqual([]);
  });

  test('L2-107.4: the photos are decorative and the hero row is hidden from assistive technology', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await expect(launch.heroPhotos).toHaveAttribute('aria-hidden', 'true');
    await expect(launch.heroPhotos.locator('img')).toHaveCount(3);
    for (const img of await page.locator('img').all()) await expect(img).toHaveAttribute('alt', '');
    await expect(launch.catererPhoto).toHaveAttribute('loading', 'lazy');
  });

  test('L2-094.1: the header button scrolls to the form and focuses its heading', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.headerButton.click();
    await expect(launch.signUpHeading).toBeFocused();
    await expect(launch.signUpHeading).toBeInViewport();
  });

  test('L2-094.2 L2-094.3: "Join as a caterer" selects the caterer role, shows the business name and keeps a typed email', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.fill({ role: 'Planning an event', email: 'kendra@pelauhouse.example' });
    await launch.joinAsCaterer.click();
    await expect(launch.role('A caterer')).toBeChecked();
    await expect(launch.businessName).toBeVisible();
    await expect(launch.email).toHaveValue('kendra@pelauhouse.example');
    await expect(launch.signUpHeading).toBeFocused();
  });

  test('L2-094.4: with reduced motion the page jumps to the form', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.headerButton.click();
    await expect(launch.signUpHeading).toBeInViewport();
    await expect(launch.signUpHeading).toBeFocused();
  });

  test('L2-094.5: opening /#notify lands on the sign-up section', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.usePhone();
    await launch.open('#notify');
    await expect(launch.signUpHeading).toBeInViewport();
  });

  test('L2-107.2: the first Tab shows the skip link, which moves focus to the main content', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await page.keyboard.press('Tab');
    await expect(launch.skipLink).toBeFocused();
    await expect(launch.skipLink).toBeVisible();
    await page.keyboard.press('Enter');
    await expect(launch.main).toBeFocused();
  });

  test('L2-106.1: no horizontal scrolling from 320 to 2560 pixels', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    for (const width of [320, 375, 575, 576, 767, 768, 991, 992, 1199, 1200, 2560]) {
      await page.setViewportSize({ width, height: 900 });
      await launch.expectNoHorizontalScroll();
    }
  });

  test('L2-106.8: from 1200 pixels the sign-up section sits beside the hero text; below, it follows it', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();

    await page.setViewportSize({ width: 1440, height: 900 });
    let heading = await launch.box(launch.heading);
    let signUp = await launch.box(launch.signUpSection);
    const howItWorks = await launch.box(launch.howItWorksHeading);
    expect(signUp.left).toBeGreaterThanOrEqual(heading.right);
    expect(signUp.top).toBeLessThan(heading.bottom);
    expect(heading.left).toBe(howItWorks.left);

    await page.setViewportSize({ width: 1199, height: 900 });
    heading = await launch.box(launch.heading);
    signUp = await launch.box(launch.signUpSection);
    expect(signUp.top).toBeGreaterThan(heading.bottom);
    expect(signUp.left).toBe(heading.left);
  });

  test('L2-106.9: the steps sit in one row from 768 pixels and in one column below', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();

    await page.setViewportSize({ width: 768, height: 900 });
    let steps = await Promise.all((await launch.numberedSteps.all()).map((step) => launch.box(step)));
    expect(new Set(steps.map((step) => step.top)).size).toBe(1);
    expect(steps[2].right).toBeCloseTo((await launch.box(launch.howItWorksHeading)).right, 0);

    await page.setViewportSize({ width: 767, height: 900 });
    steps = await Promise.all((await launch.numberedSteps.all()).map((step) => launch.box(step)));
    expect(new Set(steps.map((step) => step.left)).size).toBe(1);
    expect(steps[1].top).toBeGreaterThan(steps[0].bottom);
    expect(steps[2].top).toBeGreaterThan(steps[1].bottom);
  });

  test('L2-106.10: on a viewport taller than the page the content is centred between the header and the footer', async ({ page }) => {
    const launch = new LaunchPage(page);
    await page.setViewportSize({ width: 2560, height: 2160 });
    await launch.open();
    const space = await launch.spaceAroundContent();
    expect(Math.abs(space.above - space.below)).toBeLessThanOrEqual(64);
  });

  test('L2-107.1: the default state has no accessibility violations', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.expectNoAccessibilityViolations();
  });
});

test.describe('The privacy notice before launch', () => {
  test('L2-103.4: the "Privacy" links open a notice with a launch list section', async ({ page }) => {
    const launch = new LaunchPage(page);
    await launch.open();
    await launch.footerLink('Privacy').click();
    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page).toHaveTitle('Privacy · Sweet Hand');
    await expect(launch.heading).toHaveText('Privacy notice');
    await expect(page.getByRole('heading', { name: 'The launch list' })).toBeVisible();
    await expect(launch.main).toContainText('one email on the day Sweet Hand opens');
    await expect(launch.main).toContainText('48 hours after the last confirmation email');
    await expect(launch.main).toContainText('30 days after launch day');
    await expect(launch.main).toContainText('in Canada');
    await expect(page.getByRole('heading', { name: 'How to leave the list' })).toBeVisible();
    await expect(launch.main).toContainText('Write to hello@sweethand.example.');
    await launch.expectNoAccessibilityViolations();
  });
});
