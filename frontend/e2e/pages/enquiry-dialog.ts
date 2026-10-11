import type { Page } from '@playwright/test';

/** A thread's confirmation dialogs: share contact, close and decline (docs/mocks/dialogs). */
export class EnquiryDialog {
  constructor(
    private readonly page: Page,
    private readonly title: string | RegExp,
  ) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: this.title });
  }

  get heading() {
    return this.dialog.locator('.dialog__title');
  }

  get description() {
    return this.dialog.locator('.dialog__desc');
  }

  get icon() {
    return this.dialog.locator('.dialog__icon');
  }

  get panel() {
    return this.dialog.locator('.dialog__panel');
  }

  get closeButton() {
    return this.dialog.locator('.dialog__header').getByRole('button', { name: 'Close' });
  }

  button(name: string) {
    return this.dialog.locator('.dialog__footer').getByRole('button', { name, exact: true });
  }

  get card() {
    return this.dialog.locator('.contact-card');
  }

  get alert() {
    return this.dialog.locator('.alert');
  }

  get busyStatus() {
    return this.dialog.locator('.dialog__body > [role="status"]');
  }

  get note() {
    return this.dialog.getByRole('textbox', { name: /^Note to/ });
  }

  get noteHelp() {
    return this.dialog.locator('.field__help');
  }

  get noteError() {
    return this.dialog.locator('.field__error');
  }

  get noteCounter() {
    return this.dialog.locator('.field__counter');
  }

  get summary() {
    return this.dialog.locator('.form-summary');
  }
}
