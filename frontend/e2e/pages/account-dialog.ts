import type { Page } from '@playwright/test';

/** A dialog opened from the account page (docs/mocks/dialogs/*). */
export class AccountDialog {
  constructor(
    private readonly page: Page,
    private readonly name: string | RegExp,
  ) {}

  get root() {
    return this.page.getByRole('dialog', { name: this.name });
  }

  get title() {
    return this.root.locator('.dialog__title');
  }

  get description() {
    return this.root.locator('.dialog__desc');
  }

  get body() {
    return this.root.locator('.dialog__body');
  }

  get panel() {
    return this.root.locator('.dialog__panel');
  }

  get errorSummary() {
    return this.root.locator('.form-summary');
  }

  get alert() {
    return this.root.locator('.alert');
  }

  get status() {
    return this.root.locator('.dialog__body > [role="status"]');
  }

  get close() {
    return this.root.getByRole('button', { name: 'Close' });
  }

  get cancel() {
    return this.root.getByRole('button', { name: 'Cancel' });
  }

  field(label: string) {
    return this.root.getByLabel(label, { exact: true });
  }

  errorFor(id: string) {
    return this.root.locator(`#${id}-error`);
  }

  button(name: string) {
    return this.root.getByRole('button', { name, exact: true });
  }

  /** Items of the dialog's list ("What’s deleted", the export's contents). */
  get listItems() {
    return this.root.locator('.dialog__body ul > li');
  }

  /** Term and value pairs in the dialog's key-value list. */
  detail(term: string) {
    return this.root.locator('dl.kv dt', { hasText: term }).locator('xpath=following-sibling::dd[1]');
  }
}
