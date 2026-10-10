import type { Page } from '@playwright/test';

/** The site header on every page (docs/specs/components/site-header.md). */
export class SiteHeader {
  constructor(private readonly page: Page) {}

  get root() {
    return this.page.locator('header.site-header');
  }

  get wordmark() {
    return this.root.locator('a.wordmark');
  }

  get nav() {
    return this.root.getByRole('navigation', { name: 'Primary' });
  }

  link(name: string | RegExp) {
    return this.nav.getByRole('link', { name, exact: typeof name === 'string' });
  }

  /** The text links shown from MD up, in order. */
  get textLinks() {
    return this.nav.locator('a.site-nav__link');
  }

  get currentLink() {
    return this.nav.locator('a.site-nav__link[aria-current="page"]');
  }

  get searchButton() {
    return this.nav.getByRole('button', { name: 'Search by area or postal code' });
  }

  get menuButton() {
    return this.nav.getByRole('button', { name: 'Menu' });
  }

  get accountButton() {
    return this.nav.locator('button.avatar');
  }

  /** The phone-only inbox or enquiries shortcut. */
  get shortcut() {
    return this.nav.locator('a.icon-btn.site-nav__menu');
  }

  badgeOf(name: string | RegExp) {
    return this.link(name).locator('.badge--count');
  }
}

/** The site menu sheet opened from "Menu" on phones (docs/mocks/dialogs/site-menu). */
export class SiteMenu {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: 'Menu' });
  }

  link(name: string | RegExp) {
    return this.dialog.getByRole('navigation', { name: 'Menu' }).getByRole('link', { name });
  }

  get links() {
    return this.dialog.locator('.filter-list a');
  }

  get signedInAs() {
    return this.dialog.locator('.stack p.text-muted');
  }

  get closeButton() {
    return this.dialog.getByRole('button', { name: 'Close menu' });
  }

  async signOut() {
    await this.dialog.getByRole('button', { name: 'Sign out' }).click();
  }
}

/** The account menu opened from the avatar (docs/mocks/dialogs/account-menu). */
export class AccountMenu {
  constructor(private readonly page: Page) {}

  get menu() {
    return this.page.getByRole('menu');
  }

  get name() {
    return this.page.locator('.account-menu__name');
  }

  get email() {
    return this.page.locator('.account-menu__email');
  }

  item(name: string) {
    return this.menu.getByRole('menuitem', { name });
  }

  async signOut() {
    await this.item('Sign out').click();
  }
}

/** The site footer on every page (docs/specs/components/footer.md). */
export class SiteFooter {
  constructor(private readonly page: Page) {}

  get root() {
    return this.page.getByRole('contentinfo');
  }

  get line() {
    return this.root.locator('.site-footer__brand span');
  }

  get links() {
    return this.root.getByRole('navigation', { name: 'Footer' }).getByRole('link');
  }
}

/** The "Skip to main content" link (docs/specs/components/skip-link.md). */
export class SkipLink {
  constructor(private readonly page: Page) {}

  get link() {
    return this.page.getByRole('link', { name: 'Skip to main content' });
  }
}
