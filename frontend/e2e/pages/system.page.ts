import { BasePage } from './base.page';

/** System pages: 404, 403, 500, 429, offline and maintenance (docs/mocks/pages/not-found …). */
export class SystemPage extends BasePage {
  async open(path: string) {
    await this.page.goto(path);
  }

  get text() {
    return this.page.locator('.system-page .prose');
  }

  get code() {
    return this.page.locator('.system-page__code');
  }

  get actions() {
    return this.page.locator('.system-page__actions').getByRole('link').or(this.page.locator('.system-page__actions').getByRole('button'));
  }

  action(name: string) {
    return this.page.locator('.system-page__actions').getByRole('link', { name }).or(this.page.locator('.system-page__actions').getByRole('button', { name }));
  }

  get copyReference() {
    return this.page.getByRole('button', { name: 'Copy reference' });
  }

  get status() {
    return this.page.locator('.system-page [role="status"]');
  }
}
