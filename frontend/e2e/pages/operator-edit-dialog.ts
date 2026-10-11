import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Edit Pelau House" (dialogs/operator-edit). */
export class OperatorEditDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Edit /);
  }

  get field() {
    return this.dialog.getByRole('combobox', { name: 'Field' });
  }

  async choose(field: string) {
    await this.field.selectOption({ label: field });
  }

  value(label: string) {
    return this.dialog.getByLabel(label, { exact: true });
  }

  get counter() {
    return this.dialog.locator('.field__counter');
  }

  get valueError() {
    return this.dialog.locator('.field__error').first();
  }
}
