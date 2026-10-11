import { BasePage } from './base.page';
import { EnquiryDialog } from './enquiry-dialog';
import { EnquiryThread } from './enquiry-thread';
import { Toasts } from './toasts';
import { EnquiryList } from './enquiry-list';

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
