import type { Page } from '@playwright/test';

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
