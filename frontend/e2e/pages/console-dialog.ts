import type { Page } from '@playwright/test';

/** A dialog opened from an operator settings screen (docs/mocks/dialogs/*). */
export class ConsoleDialog {
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

  get summaryLinks() {
    return this.errorSummary.getByRole('link');
  }

  /** The failure alert at the top of the dialog. */
  get failure() {
    return this.root.locator('.alert--danger');
  }

  get warning() {
    return this.root.locator('.alert--warning');
  }

  get status() {
    return this.root.locator('.dialog__body > [role="status"]').last();
  }

  get close() {
    return this.root.getByRole('button', { name: 'Close' });
  }

  get cancel() {
    return this.root.getByRole('button', { name: 'Cancel' });
  }

  field(label: string | RegExp) {
    return this.root.getByLabel(label, { exact: typeof label === 'string' });
  }

  radio(name: string) {
    return this.root.getByRole('radio', { name, exact: true });
  }

  checkbox(name: string) {
    return this.root.getByRole('checkbox', { name, exact: true });
  }

  errorFor(id: string) {
    return this.root.locator(`#${id}-error`);
  }

  button(name: string) {
    return this.root.getByRole('button', { name, exact: true });
  }

  /** Names in the dialog's people list ("Caterers using Pan-Caribbean"). */
  people(name: string) {
    return this.root.getByRole('list', { name }).locator('li');
  }
}
