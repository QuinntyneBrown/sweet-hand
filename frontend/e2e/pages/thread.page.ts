import { BasePage } from './base.page';
import { EnquiryList } from './enquiry-list';
import { EnquiryDialog, EnquiryThread, Toasts } from './enquiry-thread';

/** A customer's enquiry thread, /inbox/:id (docs/mocks/pages/thread). */
export class ThreadPage extends BasePage {
  readonly thread = new EnquiryThread(this.page);
  readonly enquiries = new EnquiryList(this.page, this.page.locator('.inbox-layout__list'));
  readonly toasts = new Toasts(this.page);
  readonly shareDialog = new EnquiryDialog(this.page, 'Share your contact details?');
  readonly closeDialog = new EnquiryDialog(this.page, 'Close this enquiry?');

  async open(id: string) {
    await this.page.goto(`/inbox/${id}`);
  }

  get listHeading() {
    return this.page.locator('.inbox-layout__list').getByRole('heading', { level: 2 });
  }

  get list() {
    return this.page.locator('.inbox-layout__list');
  }
}
