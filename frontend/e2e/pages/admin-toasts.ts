import type { Locator, Page } from '@playwright/test';

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
