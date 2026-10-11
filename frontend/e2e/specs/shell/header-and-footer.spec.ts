import { test, expect } from '../../support/test';
import { ListingPage } from '../../pages/listing.page';

test.describe('Site header and footer', () => {
  test('site-header AC-1, footer: a visitor sees the public header and footer', async ({ page }) => {
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.header.wordmark).toHaveText('Sweet Hand');
    await expect(listing.header.wordmark).toHaveAttribute('href', '/caterers');
    await expect(listing.header.textLinks).toHaveText(['Caterers', 'Occasions', 'Sign in']);
    await expect(listing.header.currentLink).toHaveText('Caterers');
    await expect(listing.header.searchButton).toBeVisible();
    await expect(listing.header.accountButton).toHaveCount(0);
    await expect(listing.footer.line).toHaveText('Caribbean caterers in Toronto and the GTA.');
    await expect(listing.footer.links).toHaveText(['About', 'Cater with us', 'Privacy', 'Terms']);
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-067.3: the first Tab shows the skip link, which moves focus to the main content', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.cards.first()).toBeVisible();

    await page.keyboard.press('Tab');
    await expect(listing.skipLink.link).toBeFocused();
    await page.keyboard.press('Enter');

    await expect(listing.main).toBeFocused();
  });

  test('L2-029.1 site-header AC-3: a signed-in customer sees their inbox with its unread count and the account menu', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.header.textLinks).toHaveText(['Caterers', 'Occasions', 'Inbox 1, 1 unread enquiry']);
    await expect(listing.header.link('Inbox, 1 unread enquiry')).toHaveAttribute('href', '/inbox');
    await expect(listing.header.badgeOf(/Inbox/)).toHaveAttribute('aria-hidden', 'true');
    await expect(listing.header.accountButton).toHaveText('MT');
    await expect(listing.header.accountButton).toHaveAccessibleName('Account menu for Marcia Thompson');
    await expect(listing.header.accountButton).toHaveAttribute('aria-expanded', 'false');
    await listing.expectNoAccessibilityViolations();
  });

  test('L2-029.1 site-header AC-4: a caterer sees the caterer header with unread enquiries', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.header.wordmark).toHaveAccessibleName('Sweet Hand for caterers');
    await expect(listing.header.wordmark).toHaveAttribute('href', '/dashboard');
    await expect(listing.header.link('Enquiries, 2 unread')).toHaveAttribute('href', '/dashboard/enquiries');
    await expect(listing.header.link('My page')).toHaveAttribute('href', '/caterers/pelau-house');
    await expect(listing.footer.links).toHaveText(['About', 'Privacy', 'Terms']);
  });

  test('site-header AC-6, L2-056.5: an operator sees the operator header; a non-Admin is not offered Admin-only items', async ({ page, backend }) => {
    await backend.signInAs('tomas');
    const listing = new ListingPage(page);
    await listing.open();

    await expect(listing.header.wordmark).toHaveAccessibleName('Sweet Hand Operator');
    await expect(listing.header.wordmark).toHaveAttribute('href', '/admin/queue');
    await expect(listing.header.link('Queue, 8 items waiting')).toBeVisible();
    await expect(listing.header.textLinks).toHaveText(['Queue 8, 8 items waiting', 'Caterers', 'Metrics']);
    await expect(listing.header.searchButton).toHaveCount(0);
    await expect(listing.footer.line).toHaveText('Operator console. Every action is written to the audit log.');

    await listing.usePhone();
    await listing.header.menuButton.click();
    await expect(listing.siteMenu.links).toHaveText(['Review queue 8, 8 items waiting', 'Recent changes', 'Caterers', 'Reviews', 'Metrics', 'Cuisines', 'Breach register']);
    await expect(listing.siteMenu.signedInAs).toHaveText('Signed in as Tomas Reyes');
  });

  test('L2-029.3: the unread badge updates within 60 seconds without a page reload', async ({ page, backend }) => {
    await backend.signInAs('kendra');
    const listing = new ListingPage(page);
    await listing.open();
    await expect(listing.header.link('Enquiries, 2 unread')).toBeVisible();

    await backend.scenario('set-unread', { email: 'kendra@pelauhouse.example', count: 3 });
    await page.clock.runFor(60_000);

    await expect(listing.header.link('Enquiries, 3 unread')).toBeVisible();
  });

  test('L2-029.4: no badge shows when nothing is unread', async ({ page, backend }) => {
    await backend.scenario('set-unread', { email: 'kendra@pelauhouse.example', count: 0 });
    await backend.signInAs('kendra');
    const listing = new ListingPage(page);

    await listing.open();

    await expect(listing.header.link('Enquiries')).toBeVisible();
    await expect(listing.header.root.locator('.badge--count')).toHaveCount(0);
  });
});

test.describe('Phone navigation', () => {
  test('site-header AC-14, AC-15: on a phone the menu sheet opens, closes with Escape and returns focus', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    await listing.usePhone();
    await listing.open();

    await expect(listing.header.textLinks.first()).toBeHidden();
    await expect(listing.header.shortcut).toHaveAccessibleName('Inbox, 1 unread');
    await listing.header.menuButton.click();

    await expect(listing.siteMenu.dialog).toBeVisible();
    await expect(listing.header.menuButton).toHaveAttribute('aria-expanded', 'true');
    await expect(listing.siteMenu.links).toHaveText(['Caterers', 'Occasions', 'Inbox 1, 1 unread enquiry', 'Account']);
    await expect(listing.siteMenu.signedInAs).toHaveText('Signed in as Marcia Thompson');
    await listing.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');

    await expect(listing.siteMenu.dialog).toBeHidden();
    await expect(listing.header.menuButton).toBeFocused();
    await expect(listing.header.menuButton).toHaveAttribute('aria-expanded', 'false');
  });

  test('a link in the site menu navigates and closes the sheet', async ({ page }) => {
    const listing = new ListingPage(page);
    await listing.usePhone();
    await listing.open();

    await listing.header.menuButton.click();
    await listing.siteMenu.link('Sign in').click();

    await expect(page).toHaveURL(/\/sign-in$/);
    await expect(listing.siteMenu.dialog).toBeHidden();
  });
});

test.describe('Account menu', () => {
  test('menu AC: the avatar opens the account menu; arrow keys move, Escape returns focus', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    await listing.open();

    await listing.header.accountButton.click();

    await expect(listing.accountMenu.menu).toBeVisible();
    await expect(listing.header.accountButton).toHaveAttribute('aria-expanded', 'true');
    await expect(listing.accountMenu.name).toHaveText('Marcia Thompson');
    await expect(listing.accountMenu.email).toHaveText('marcia.t@example.com');
    await expect(listing.accountMenu.item('Inbox')).toBeFocused();
    await page.keyboard.press('ArrowDown');
    await expect(listing.accountMenu.item('Account')).toBeFocused();
    await listing.expectNoAccessibilityViolations();

    await page.keyboard.press('Escape');

    await expect(listing.accountMenu.menu).toBeHidden();
    await expect(listing.header.accountButton).toBeFocused();
  });

  test('L2-078.4: signing out ends the session and lands on the listing as a visitor', async ({ page, backend }) => {
    await backend.signInAs('marcia');
    const listing = new ListingPage(page);
    await listing.open();

    await listing.header.accountButton.click();
    await listing.accountMenu.signOut();

    await expect(page).toHaveURL(/\/caterers$/);
    await expect(listing.header.link('Sign in')).toBeVisible();
    await expect(listing.header.accountButton).toHaveCount(0);
  });
});
