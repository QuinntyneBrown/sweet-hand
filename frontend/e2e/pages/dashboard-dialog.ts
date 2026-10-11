import type { Page } from '@playwright/test';

/** A dialog opened from a dashboard screen (docs/mocks/dialogs/*). */
export class DashboardDialog {
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

  get icon() {
    return this.root.locator('.dialog__icon');
  }

  get body() {
    return this.root.locator('.dialog__body');
  }

  get panel() {
    return this.root.locator('.dialog__panel');
  }

  get summary() {
    return this.root.locator('.form-summary');
  }

  get summaryHeading() {
    return this.summary.locator('h2, h3');
  }

  get summaryItems() {
    return this.summary.locator('li');
  }

  get alert() {
    return this.root.locator('.alert');
  }

  get status() {
    return this.root.locator('.dialog__body > p[role="status"]');
  }

  /** "What happens next" after submitting. */
  get timeline() {
    return this.root.getByRole('list', { name: 'What happens next' });
  }

  get timelineItems() {
    return this.timeline.locator('li');
  }

  get close() {
    return this.root.getByRole('button', { name: 'Close' });
  }

  button(name: string | RegExp) {
    return this.root.getByRole('button', { name, exact: typeof name === 'string' });
  }

  link(name: string | RegExp) {
    return this.root.getByRole('link', { name, exact: typeof name === 'string' });
  }

  field(label: string) {
    return this.root.getByLabel(label, { exact: true });
  }

  errorFor(id: string) {
    return this.root.locator(`#${id}-error`);
  }

  checkbox(label: string) {
    return this.root.getByRole('checkbox', { name: label, exact: true });
  }

  get counter() {
    return this.root.locator('.field__counter');
  }

  get photo() {
    return this.root.locator('.dialog__photo img');
  }

  get quote() {
    return this.root.locator('figure.well');
  }
}
