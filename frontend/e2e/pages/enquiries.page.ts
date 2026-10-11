import { BasePage } from './base.page';
import { EnquiryList } from './enquiry-list';
import { EnquiryThread } from './enquiry-thread';
import { Toasts } from './toasts';

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

