import { BasePage } from './base.page';
import { AdminToasts } from './admin-toasts';

/** Shared frame of every operator page: the "Operator" side navigation and the work area (docs/mocks/pages/admin-*). */
export class OperatorConsolePage extends BasePage {
  readonly toasts = new AdminToasts(this.page);

  async open(path: string) {
    await this.page.goto(path);
  }

  get sideNav() {
    return this.page.getByRole('navigation', { name: 'Operator' });
  }

  get sideNavLinks() {
    return this.sideNav.getByRole('link');
  }

  sideNavLink(name: string | RegExp) {
    return this.sideNav.getByRole('link', { name });
  }

  get currentSideNavLink() {
    return this.sideNav.locator('a[aria-current="page"]');
  }

  get workArea() {
    return this.page.locator('.work-main');
  }
}

