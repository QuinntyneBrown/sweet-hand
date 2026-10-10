import type { Page } from '@playwright/test';

/** "Report this listing" (docs/mocks/dialogs/report). */
export class ReportDialog {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: 'Report this listing' });
  }

  get description() {
    return this.dialog.locator('.dialog__desc');
  }

  get reasons() {
    return this.dialog.getByRole('group', { name: 'Reason' }).getByRole('radio');
  }

  reason(name: string) {
    return this.dialog.getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  get reasonError() {
    return this.dialog.locator('fieldset .field__error');
  }

  get details() {
    return this.dialog.getByRole('textbox', { name: /^Details/ });
  }

  get detailsLabel() {
    return this.dialog.locator('label[for="details"]');
  }

  get detailsError() {
    return this.dialog.locator('#details-error');
  }

  get counter() {
    return this.dialog.locator('.field__counter');
  }

  get alert() {
    return this.dialog.getByRole('alert');
  }

  get status() {
    return this.dialog.locator('.dialog__body > p[role="status"]');
  }

  get send() {
    return this.dialog.getByRole('button', { name: 'Send report' });
  }

  get tryAgain() {
    return this.dialog.getByRole('button', { name: 'Try again' });
  }

  get cancel() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  get close() {
    return this.dialog.getByRole('button', { name: 'Close' });
  }

  get done() {
    return this.dialog.getByRole('button', { name: 'Done' });
  }

  /** The confirmation that replaces the form: success or "already reported". */
  get outcomeTitle() {
    return this.dialog.locator('.empty__title');
  }

  get outcomeText() {
    return this.dialog.locator('.empty__text');
  }

  async report(reason: string, details = '') {
    await this.reason(reason).check();
    if (details) await this.details.fill(details);
    await this.send.click();
  }
}
