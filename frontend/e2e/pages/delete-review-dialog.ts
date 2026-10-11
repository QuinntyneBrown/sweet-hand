import type { Page } from '@playwright/test';

/** "Delete your review?" (docs/mocks/dialogs/delete-review). */
export class DeleteReviewDialog {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: 'Delete your review?' });
  }

  get description() {
    return this.dialog.locator('.dialog__desc');
  }

  get keep() {
    return this.dialog.getByRole('button', { name: 'Keep review' });
  }

  get confirm() {
    return this.dialog.getByRole('button', { name: 'Delete review' });
  }

  get tryAgain() {
    return this.dialog.getByRole('button', { name: 'Try again' });
  }

  get close() {
    return this.dialog.getByRole('button', { name: 'Close' });
  }

  get alert() {
    return this.dialog.getByRole('alert');
  }

  get status() {
    return this.dialog.locator('.dialog__body > p[role="status"]');
  }
}
