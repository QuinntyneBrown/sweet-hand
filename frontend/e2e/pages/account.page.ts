import type { Locator, Page } from '@playwright/test';
import { BasePage } from './base.page';

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

/** Account settings, /account (docs/mocks/pages/account). */
export class AccountPage extends BasePage {
  readonly editDetails = new AccountDialog(this.page, 'Edit your details');
  readonly changePassword = new AccountDialog(this.page, 'Change password');
  readonly downloadData = new AccountDialog(this.page, /^(Download your data|Export requested)$/);
  readonly deleteAccount = new AccountDialog(this.page, /^Delete .* account\?$/);

  constructor(page: Page) {
    super(page);
  }

  async open(query = '') {
    await this.page.goto(`/account${query}`);
  }

  endSession(device: string) {
    return new AccountDialog(this.page, `Sign out of ${device}?`);
  }

  get avatar() {
    return this.page.locator('.page-intro .avatar');
  }

  get subtitle() {
    return this.page.locator('.page-intro .subtitle');
  }

  get busyIntro() {
    return this.page.locator('.page-intro[aria-busy="true"]');
  }

  get loadingStatus() {
    return this.main.locator('p[role="status"]').first();
  }

  section(name: string) {
    return this.page.getByRole('region', { name });
  }

  /** The value next to a term in "Your details". */
  detail(term: string): Locator {
    return this.section('Your details').locator('dl.kv dt', { hasText: term }).locator('xpath=following-sibling::dd[1]');
  }

  statusOf(term: string) {
    return this.detail(term).locator('.status');
  }

  get devices() {
    return this.page.getByRole('list', { name: 'Signed-in devices' });
  }

  get loadingDevices() {
    return this.page.getByRole('list', { name: 'Loading your devices' });
  }

  get deviceRows() {
    return this.devices.locator(':scope > li');
  }

  device(name: string) {
    return this.deviceRows.filter({ has: this.page.locator('.list__title', { hasText: name }) });
  }

  get deviceTitles() {
    return this.devices.locator('.list__title');
  }

  get deviceMetas() {
    return this.devices.locator('.list__meta');
  }

  /** "Sign out Safari on iPhone" in the device list. */
  signOutDevice(device: string) {
    return this.devices.getByRole('button', { name: `Sign out ${device}` });
  }

  /** Paragraphs in "Your data". */
  get dataText() {
    return this.section('Your data').locator('p.text-muted');
  }

  get deleteText() {
    return this.section('Delete account').locator('p.text-muted');
  }

  get alert() {
    return this.main.locator('.alert').first();
  }

  /** The error state that replaces the page when it cannot load. */
  get loadError() {
    return this.page.locator('.empty--error');
  }

  get loadErrorReference() {
    return this.loadError.locator('.text-caption');
  }

  button(name: string) {
    return this.main.getByRole('button', { name, exact: true });
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  /** The side navigation of the caterer dashboard. */
  get sideNav() {
    return this.page.getByRole('navigation', { name: 'Dashboard' });
  }

  get toast() {
    return this.page.locator('.toast-region .toast').last();
  }
}
