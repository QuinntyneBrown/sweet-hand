import type { Page } from '@playwright/test';
import { BasePage } from './base.page';

/** What every caterer dashboard screen shares: side navigation, page intro, banners and the listing-card preview. */
export abstract class DashboardScreen extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /** The dashboard's side navigation (from LG). */
  get sideNav() {
    return this.page.getByRole('navigation', { name: 'Dashboard' });
  }

  navLink(name: string | RegExp) {
    return this.sideNav.getByRole('link', { name, exact: typeof name === 'string' });
  }

  get navLinks() {
    return this.sideNav.getByRole('link');
  }

  /** "Overview": the way back from a section below LG. */
  get overviewLink() {
    return this.main.locator('a.eyebrow');
  }

  get intro() {
    return this.main.locator('.page-intro');
  }

  get subtitle() {
    return this.intro.locator('.subtitle');
  }

  get status() {
    return this.intro.locator('.status');
  }

  get statusCaption() {
    return this.intro.locator('.text-caption');
  }

  /** "Saved", "Saving…", "Not saved: fix 2 things below". */
  get saveStatus() {
    return this.main.locator('.save-status').first();
  }

  get readOnlyNote() {
    return this.intro.locator('.private-note');
  }

  /** The first alert in the work area (status, reason, read-only). */
  get alert() {
    return this.main.locator('.work-main .alert').first();
  }

  get alertTitle() {
    return this.alert.locator('.alert__title');
  }

  get loadError() {
    return this.main.locator('.empty--error');
  }

  get loadErrorReference() {
    return this.loadError.locator('.text-caption');
  }

  /** The listing card beside the work on XL (L2-045.4). */
  get previewPane() {
    return this.main.locator('aside.preview-pane');
  }

  get previewLabel() {
    return this.previewPane.locator('.preview-pane__label');
  }

  get previewCard() {
    return this.previewPane.locator('.caterer-card');
  }

  get previewName() {
    return this.previewCard.locator('.caterer-card__name');
  }

  get previewMeta() {
    return this.previewCard.locator('.caterer-card__meta');
  }

  get previewPhoto() {
    return this.previewCard.locator('img');
  }

  get skeletons() {
    return this.main.locator('.skeleton');
  }

  get loadingStatus() {
    return this.main.locator('[role="status"]', { hasText: /^Loading/ });
  }

  get errorSummary() {
    return this.main.locator('.form-summary');
  }

  get errorSummaryLinks() {
    return this.errorSummary.getByRole('link');
  }

  button(name: string | RegExp) {
    return this.main.getByRole('button', { name, exact: typeof name === 'string' });
  }

  link(name: string | RegExp) {
    return this.main.getByRole('link', { name, exact: typeof name === 'string' });
  }

  get toasts() {
    return this.page.locator('.toast-region .toast');
  }

  get toast() {
    return this.toasts.last();
  }

  /** The profile banner under the header (docs/mocks/notifications/profile-banner). */
  get banner() {
    return this.page.locator('.alert.banner');
  }
}

/** The caterer's overview, /dashboard (docs/mocks/pages/dashboard). */
export class DashboardPage extends DashboardScreen {
  async open() {
    await this.page.goto('/dashboard');
  }

  /** The value of the stat with this label ("Unread enquiries"). */
  stat(label: string) {
    return this.main.locator('.stat', { has: this.page.locator('.stat__label', { hasText: label }) }).locator('.stat__value');
  }

  get statLabels() {
    return this.main.locator('.stat__label');
  }

  get statGrid() {
    return this.main.locator('.stat-grid');
  }

  get latestEnquiries() {
    return this.page.getByRole('region', { name: 'Latest enquiries' });
  }

  get enquiryRows() {
    return this.latestEnquiries.locator('.inbox-row');
  }

  get enquiryNames() {
    return this.latestEnquiries.locator('.inbox-row__name');
  }

  get noEnquiries() {
    return this.main.locator('.empty--compact');
  }

  /** "Your profile" or the setup checklist: its linked rows with their spoken status. */
  get sections() {
    return this.main.locator('.section-list .section-link');
  }

  get sectionTitles() {
    return this.main.locator('.section-list .section-link__title');
  }

  get sectionMetas() {
    return this.main.locator('.section-list .section-link__meta');
  }

  section(title: string) {
    return this.sections.filter({ has: this.page.locator('.section-link__title', { hasText: title }) });
  }

  sectionMeta(title: string) {
    return this.section(title).locator('.section-link__meta');
  }

  /** "Ready to submit · 8 of 10 done". */
  get meter() {
    return this.main.getByRole('progressbar', { name: 'Ready to submit' });
  }

  get meterLabel() {
    return this.main.locator('.meter__label');
  }

  get welcome() {
    return this.page.getByRole('region', { name: /^Welcome/ });
  }

  /** The caption beside Submit or Withdraw ("2 sections left: photos and food safety"). */
  get actionCaption() {
    return this.main.locator('.work-main > section .cluster .text-caption');
  }

  get records() {
    return this.page.getByRole('region', { name: 'Your records' });
  }

  readonly submitDialog = new DashboardDialog(this.page, /^(Submit .* for review\?|Your profile isn’t ready yet|Thanks — we’ll review your profile within 3 business days)$/);
  readonly withdrawDialog = new DashboardDialog(this.page, 'Withdraw your submission?');
  readonly downloadDialog = new DashboardDialog(this.page, /^(Download your data|Export requested)$/);
}

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
