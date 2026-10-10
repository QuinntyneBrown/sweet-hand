import { expect, type Page } from '@playwright/test';

/** What a test types into the form; omitted fields are left as they are. */
export interface EnquiryEntry {
  date?: string;
  guests?: string;
  area?: string;
  postal?: string;
  occasion?: string;
  message?: string;
}

/** "Send an enquiry" to a caterer (docs/mocks/dialogs/enquiry, every state). */
export class EnquiryFormDialog {
  constructor(private readonly page: Page) {}

  get dialog() {
    return this.page.getByRole('dialog', { name: 'Send an enquiry' });
  }

  get panel() {
    return this.dialog.locator('.dialog__panel');
  }

  get form() {
    return this.dialog.locator('form.dialog__panel');
  }

  get recipient() {
    return this.dialog.locator('.dialog__caterer-name');
  }

  get coverPhoto() {
    return this.dialog.locator('.dialog__caterer .photo img');
  }

  get date() {
    return this.dialog.getByLabel('Event date');
  }

  get guests() {
    return this.dialog.getByLabel('Guests');
  }

  get area() {
    return this.dialog.getByLabel('Event area');
  }

  get postal() {
    return this.dialog.getByLabel('Postal code (optional)');
  }

  get occasion() {
    return this.dialog.getByLabel('Occasion');
  }

  get message() {
    return this.dialog.getByLabel('Message');
  }

  helpFor(field: 'date' | 'guests' | 'postal' | 'message') {
    return this.dialog.locator(`#${field}-help`);
  }

  errorFor(field: 'date' | 'guests' | 'area' | 'postal' | 'occasion' | 'message') {
    return this.dialog.locator(`#${field}-error`);
  }

  get warnings() {
    return this.dialog.locator('.field__warning');
  }

  warningFor(field: 'guests' | 'area') {
    return this.dialog.locator(`#${field}-warning`);
  }

  get counter() {
    return this.dialog.locator('.field__counter');
  }

  get privacyNote() {
    return this.dialog.locator('.private-note');
  }

  get summary() {
    return this.dialog.locator('.form-summary');
  }

  get summaryHeading() {
    return this.summary.getByRole('heading');
  }

  get summaryLinks() {
    return this.summary.getByRole('link');
  }

  summaryLink(name: string) {
    return this.summary.getByRole('link', { name });
  }

  get alert() {
    return this.dialog.locator('.alert');
  }

  get alertTitle() {
    return this.alert.locator('.alert__title');
  }

  get alertText() {
    return this.alert.locator('.alert__body > p:not(.alert__title)').first();
  }

  get alertReference() {
    return this.alert.locator('code');
  }

  alertAction(name: string) {
    return this.alert.getByRole('link', { name }).or(this.alert.getByRole('button', { name }));
  }

  /** The body's polite status line ("Sending your enquiry"). */
  get status() {
    return this.dialog.locator('.dialog__body > p[role="status"]');
  }

  get send() {
    return this.dialog.getByRole('button', { name: 'Send enquiry' });
  }

  get tryAgain() {
    return this.dialog.getByRole('button', { name: 'Try again' });
  }

  get cancel() {
    return this.dialog.getByRole('button', { name: 'Cancel' });
  }

  /** The header's Close icon button. */
  get close() {
    return this.dialog.locator('.dialog__header').getByRole('button', { name: 'Close' });
  }

  get closeFooter() {
    return this.dialog.locator('.dialog__footer').getByRole('button', { name: 'Close' });
  }

  /** The outcome panel: sent, or the wrong account. */
  get outcome() {
    return this.dialog.locator('.empty');
  }

  get outcomeTitle() {
    return this.outcome.locator('.empty__title');
  }

  get outcomeText() {
    return this.outcome.locator('.empty__text');
  }

  summaryValue(term: string) {
    return this.dialog.locator('.enquiry-summary > div').filter({ has: this.page.locator('dt', { hasText: term }) }).locator('dd');
  }

  get backToCaterer() {
    return this.dialog.getByRole('button', { name: /^Back to / });
  }

  get goToInbox() {
    return this.dialog.getByRole('link', { name: 'Go to your inbox' });
  }

  get switchAccount() {
    return this.dialog.getByRole('link', { name: 'Switch account' });
  }

  async fill(entry: EnquiryEntry) {
    if (entry.date !== undefined) await this.date.fill(entry.date);
    if (entry.guests !== undefined) await this.guests.fill(entry.guests);
    if (entry.area !== undefined) await this.area.selectOption({ label: entry.area });
    if (entry.postal !== undefined) await this.postal.fill(entry.postal);
    if (entry.occasion !== undefined) await this.occasion.selectOption({ label: entry.occasion });
    if (entry.message !== undefined) await this.message.fill(entry.message);
  }

  /** The values the form shows, for checking what was kept. */
  async expectValues(entry: Required<EnquiryEntry>) {
    await expect(this.date).toHaveValue(entry.date);
    await expect(this.guests).toHaveValue(entry.guests);
    await expect(this.area.locator('option:checked')).toHaveText(entry.area);
    await expect(this.postal).toHaveValue(entry.postal);
    await expect(this.occasion.locator('option:checked')).toHaveText(entry.occasion);
    await expect(this.message).toHaveValue(entry.message);
  }

  /** Sends a request straight to the API, skipping the form's checks (L2-022.6, L2-025.4). */
  async postDirectly(body: Record<string, unknown>) {
    // Any API response sets the CSRF cookie; make sure there is one before echoing it.
    await this.page.request.get('/api/session');
    const csrf = (await this.page.context().cookies()).find((c) => c.name === 'XSRF-TOKEN')?.value ?? '';
    const response = await this.page.request.post('/api/enquiries', { data: body, headers: { 'x-xsrf-token': csrf } });
    return { status: response.status(), body: await response.json().catch(() => null) };
  }
}
