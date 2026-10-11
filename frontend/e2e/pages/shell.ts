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

