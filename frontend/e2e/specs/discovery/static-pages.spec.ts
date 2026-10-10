import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';
import { StaticPage } from '../../pages/static.page';

test.describe('About, privacy notice and terms', () => {
  test('about: why Sweet Hand exists, with ways to browse or join', async ({ page }) => {
    const about = new StaticPage(page);

    await about.open('/about');

    await expect(page).toHaveTitle('About · Sweet Hand');
    await expect(about.heading).toHaveText('Someone with a sweet hand');
    await expect(about.sectionHeadings).toHaveText(['Free, and only enquiries', 'Every caterer is reviewed']);
    await expect(about.text).toContainText('Food safety statements are the caterer’s own; Sweet Hand does not inspect or certify kitchens.');
    await expect(about.link('Browse caterers')).toHaveAttribute('href', '/caterers');
    await expect(about.link('Cater with Sweet Hand')).toHaveAttribute('href', '/join');
    await expect(about.decorativePhotos).toHaveCount(3);
    for (const alt of await about.decorativePhotos.evaluateAll((imgs) => imgs.map((i) => i.getAttribute('alt')))) expect(alt).toBe('');
    await about.expectNoAccessibilityViolations();
  });

  test('L2-070.1: every page links to the privacy notice, which names the privacy officer’s address', async ({ page }) => {
    const listing = new ListingPage(page);
    const privacy = new StaticPage(page);
    await listing.open();

    await listing.footer.links.filter({ hasText: 'Privacy' }).click();

    await expect(page).toHaveURL(/\/privacy$/);
    await expect(page).toHaveTitle('Privacy notice · Sweet Hand');
    await expect(privacy.heading).toHaveText('Privacy notice');
    await expect(privacy.subtitle).toHaveText('Version 1.0 · in effect from Thursday 1 October 2026');
    await expect(privacy.link('privacy@sweethand.example')).toHaveAttribute('href', 'mailto:privacy@sweethand.example');
    await expect(privacy.sectionHeadings).toHaveText([
      'What we collect, and why',
      'Who sees it',
      'Cookies',
      'How long we keep it',
      'Your choices',
      'Contact our privacy officer',
    ]);
    await privacy.expectNoAccessibilityViolations();
  });

  test('L2-074.1 L2-075.3 L2-073: the notice lists each cookie, where processors handle data and how long data is kept', async ({ page }) => {
    const privacy = new StaticPage(page);

    await privacy.open('/privacy');

    await expect(privacy.tableRows('Cookies Sweet Hand sets')).toHaveText(['Session', 'Security token', 'Bot check']);
    await expect(privacy.text).toContainText('Northbound Mail Inc. sends our emails and processes them in Canada.');
    await expect(privacy.tableRows('How long Sweet Hand keeps personal information')).toHaveText([
      'Enquiries and messages',
      'Accounts nobody signs in to',
      'Security and access logs',
      'Food handler certificate files',
      'Operator audit log',
      'Visit counts (anonymous)',
    ]);
    await expect(privacy.text).toContainText('we keep only the first three characters');
  });

  test('terms: the rules for everyone, customers and caterers, linking to the privacy notice', async ({ page }) => {
    const terms = new StaticPage(page);

    await terms.open('/terms');

    await expect(page).toHaveTitle('Terms · Sweet Hand');
    await expect(terms.heading).toHaveText('Terms');
    await expect(terms.subtitle).toHaveText('Version 1.0 · in effect from Thursday 1 October 2026');
    await expect(terms.sectionHeadings).toHaveText(['For everyone', 'For customers', 'For caterers', 'Questions']);
    await expect(terms.link('privacy notice')).toHaveAttribute('href', '/privacy');
    await expect(terms.link('hello@sweethand.example')).toHaveAttribute('href', 'mailto:hello@sweethand.example');
    await terms.expectNoAccessibilityViolations();
  });

  for (const [path, heading] of [
    ['/about', 'Someone with a sweet hand'],
    ['/privacy', 'Privacy notice'],
    ['/terms', 'Terms'],
  ] as const) {
    test(`${path} reads at phone width without sideways scrolling`, async ({ page }) => {
      const content = new StaticPage(page);
      await content.usePhone();

      await content.open(path);

      await expect(content.heading).toHaveText(heading);
      await content.expectNoHorizontalScroll();
      await content.expectNoAccessibilityViolations();
    });
  }
});
