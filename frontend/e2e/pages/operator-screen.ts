import type { Locator, Page } from '@playwright/test';
import { OperatorConsolePage } from './operator-console.page';

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

/** What every operator settings screen shares: intro, states and toasts (docs/mocks/pages/admin-*). */
export abstract class OperatorScreen extends OperatorConsolePage {
  get subtitle() {
    return this.page.locator('.work-main .page-intro .subtitle');
  }

  /** The intro while the page loads. */
  get busyIntro() {
    return this.page.locator('.work-main .page-intro[aria-busy="true"]');
  }

  get loadingStatus() {
    return this.workArea.locator('p.visually-hidden[role="status"]').first();
  }

  get errorState() {
    return this.workArea.locator('.empty--error');
  }

  get emptyState() {
    return this.workArea.locator('.empty').first();
  }

  get emptyTitle() {
    return this.emptyState.locator('.empty__title');
  }

  get emptyText() {
    return this.emptyState.locator('.empty__text');
  }

  get reference() {
    return this.errorState.locator('.text-caption');
  }

  button(name: string | RegExp): Locator {
    return this.workArea.getByRole('button', { name, exact: typeof name === 'string' });
  }

  link(name: string | RegExp): Locator {
    return this.workArea.getByRole('link', { name, exact: typeof name === 'string' });
  }

  get toast() {
    return this.page.locator('.toast-region .toast').last();
  }
}
