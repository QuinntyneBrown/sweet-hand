import { DashboardScreen } from './dashboard-screen';
import { DashboardDialog } from './dashboard-dialog';


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

