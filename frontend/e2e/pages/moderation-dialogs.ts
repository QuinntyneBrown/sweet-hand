import type { Page } from '@playwright/test';

/**
 * The operator's decision dialogs (docs/mocks/dialogs/{approve-profile,
 * request-changes,suspend-caterer,reinstate-caterer,remove-caterer,
 * operator-edit,revert-change,resolve-report,open-enquiry}). One object per
 * dialog, sharing the parts every decision dialog has.
 */
export class ModerationDialog {
  constructor(
    protected readonly page: Page,
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

  get checklist() {
    return this.dialog.locator('.dialog__body .checklist li');
  }

  get alert() {
    return this.dialog.locator('.dialog__body .alert');
  }

  get summary() {
    return this.dialog.locator('.form-summary');
  }

  get summaryLinks() {
    return this.summary.getByRole('link');
  }

  get status() {
    return this.dialog.locator('.dialog__body > p[role="status"]');
  }

  get reason() {
    return this.dialog.getByRole('textbox', { name: /^(Reason|What needs to change|Note)/ });
  }

  get reasonError() {
    return this.dialog.locator('#reason-error, #note-error');
  }

  get reasonHelp() {
    return this.dialog.locator('#reason-help, #note-help');
  }

  button(name: string | RegExp) {
    return this.dialog.getByRole('button', { name });
  }

  get cancel() {
    return this.button('Cancel');
  }

  get close() {
    return this.button('Close');
  }

  get submit() {
    return this.dialog.locator('.dialog__footer button[type="submit"]');
  }

  get backToQueue() {
    return this.dialog.getByRole('link', { name: 'Back to review queue' });
  }
}

/** "Approve Auntie Bev's Kitchen?" (dialogs/approve-profile). */
export class ApproveDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Approve /);
  }
}

/** "Suspend Pelau House?" (dialogs/suspend-caterer). */
export class SuspendDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Suspend /);
  }
}

/** "Reinstate Pelau House?" (dialogs/reinstate-caterer). */
export class ReinstateDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Reinstate /);
  }

  get caption() {
    return this.dialog.locator('.dialog__body .text-caption');
  }
}

/** "Remove Pelau House permanently?" (dialogs/remove-caterer). */
export class RemoveDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Remove .* permanently\?$/);
  }

  get confirmName() {
    return this.dialog.getByRole('textbox', { name: /^Type .* to confirm$/ });
  }

  get confirmError() {
    return this.dialog.locator('#confirm-name-error');
  }

  /** Presses "Remove permanently" while it is still marked unavailable, to see what is missing. */
  async pressRemoveAnyway() {
    await this.submit.dispatchEvent('click');
  }
}

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

/** "Revert Pelau House's description?" (dialogs/revert-change). */
export class RevertDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Revert /);
  }

  get goesBackTo() {
    return this.dialog.locator('.well p').first();
  }

  get replaces() {
    return this.dialog.locator('.well p').nth(1);
  }
}

/** "Request changes to Auntie Bev's Kitchen" (dialogs/request-changes). */
export class RequestChangesDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Request changes to /);
  }
}
