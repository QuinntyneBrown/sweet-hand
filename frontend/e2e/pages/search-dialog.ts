import type { Page } from '@playwright/test';

/** "Where’s your event?": area or postal code search from the header (docs/mocks/dialogs/search). */
export class SearchDialog {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: 'Where’s your event?' });
  }

  get input() {
    return this.dialog.getByRole('combobox', { name: 'Area or postal code' });
  }

  get suggestions() {
    return this.dialog.getByRole('listbox', { name: 'Matching areas' }).getByRole('option');
  }

  get noMatch() {
    return this.dialog.locator('.suggestions__empty');
  }

  get error() {
    return this.dialog.locator('.field__error');
  }

  get warning() {
    return this.dialog.locator('.field__warning');
  }

  get matchStatus() {
    return this.dialog.locator('.field [role="status"]').first();
  }

  get busyStatus() {
    return this.dialog.locator('.dialog__body > [role="status"]');
  }

  get submit() {
    return this.dialog.getByRole('button', { name: 'Show caterers' });
  }

  get cancel() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  get close() {
    return this.dialog.getByRole('button', { name: 'Close' });
  }

  region(name: string) {
    return this.dialog.getByRole('group', { name: 'Or choose a whole region' }).getByRole('link', { name });
  }

  async search(text: string) {
    await this.input.fill(text);
    await this.submit.click();
  }
}
