import type { Page } from '@playwright/test';

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
