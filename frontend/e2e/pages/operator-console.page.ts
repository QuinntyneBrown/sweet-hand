import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

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

/** Toasts raised on operator pages (docs/mocks/notifications/admin-toast). */
export class AdminToasts {
  constructor(private readonly page: Page) {}

  get all() {
    return this.page.locator('.toast-region .toast');
  }

  titled(title: string | RegExp) {
    return this.all.filter({ has: this.page.locator('.toast__title', { hasText: title }) });
  }

  textOf(toast: Locator) {
    return toast.locator('.toast__text');
  }

  action(toast: Locator, name: string) {
    return toast.getByRole('button', { name }).or(toast.getByRole('link', { name }));
  }

  dismiss(toast: Locator) {
    return toast.getByRole('button', { name: 'Dismiss' }).click();
  }
}
