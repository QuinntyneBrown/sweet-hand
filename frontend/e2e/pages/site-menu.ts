import type { Page } from '@playwright/test';

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
