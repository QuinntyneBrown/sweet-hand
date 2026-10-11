import type { Locator, Page } from '@playwright/test';

/** Toasts raised from enquiry screens (docs/mocks/notifications/toast). */
export class Toasts {
  constructor(private readonly page: Page) {}

  get all() {
    return this.page.locator('.toast-region .toast');
  }

  withTitle(title: string) {
    return this.all.filter({ has: this.page.locator('.toast__title', { hasText: title }) });
  }

  textOf(toast: Locator) {
    return toast.locator('.toast__text');
  }

  action(toast: Locator, name: string) {
    return toast.getByRole('button', { name }).or(toast.getByRole('link', { name }));
  }
}
