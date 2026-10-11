import { BasePage } from './base.page';
import { EnquiryList } from './enquiry-list';
import { EnquiryDialog, EnquiryThread, Toasts } from './enquiry-thread';

/** A caterer's enquiries, /dashboard/enquiries (docs/mocks/pages/dashboard-enquiries). */
export class EnquiriesPage extends BasePage {
  readonly enquiries = new EnquiryList(this.page);
  /** The enquiry shown beside the list on large screens. */
  readonly thread = new EnquiryThread(this.page);
  readonly toasts = new Toasts(this.page);

  async open(query = '') {
    await this.page.goto(`/dashboard/enquiries${query}`);
  }

  get subtitle() {
    return this.page.locator('.page-intro .subtitle');
  }

  get loadingStatus() {
    return this.page.locator('.inbox-layout__list > [role="status"]');
  }

  get pane() {
    return this.page.locator('.inbox-layout__thread');
  }

  get alert() {
    return this.page.locator('.alert');
  }

  alertAction(name: string) {
    return this.alert.getByRole('link', { name }).or(this.alert.getByRole('button', { name }));
  }
}

/** One enquiry for the caterer, /dashboard/enquiries/:id (docs/mocks/pages/dashboard-enquiry). */
export class EnquiryPage extends BasePage {
  readonly thread = new EnquiryThread(this.page);
  readonly enquiries = new EnquiryList(this.page, this.page.locator('.inbox-layout__list'));
  readonly toasts = new Toasts(this.page);
  readonly shareDialog = new EnquiryDialog(this.page, 'Share your contact details?');
  readonly closeDialog = new EnquiryDialog(this.page, 'Close this enquiry?');
  readonly declineDialog = new EnquiryDialog(this.page, /^Decline .*’s enquiry\?$/);

  async open(id: string) {
    await this.page.goto(`/dashboard/enquiries/${id}`);
  }

  get list() {
    return this.page.locator('.inbox-layout__list');
  }

  get alert() {
    return this.page.locator('.alert');
  }

  alertAction(name: string) {
    return this.alert.getByRole('link', { name }).or(this.alert.getByRole('button', { name }));
  }
}
