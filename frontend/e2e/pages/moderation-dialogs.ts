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

