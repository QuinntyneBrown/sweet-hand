import type { Page } from '@playwright/test';

/** The site-wide banner under the header (docs/mocks/notifications/site-banner). */
export class SiteBanner {
  constructor(private readonly page: Page) {}

  get root() {
    return this.page.locator('.alert.banner');
  }

  get title() {
    return this.root.locator('.alert__title');
  }

  get dismiss() {
    return this.root.locator('button.close');
  }

  action(name: string) {
    return this.root.getByRole('button', { name, exact: true });
  }
}
