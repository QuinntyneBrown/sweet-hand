import { BasePage } from './base.page';
import type { Page } from '@playwright/test';

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
