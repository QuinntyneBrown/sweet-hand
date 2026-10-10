import { BasePage } from './base.page';
import { EnquiryList } from './enquiry-list';

/** The customer's inbox, /inbox (docs/mocks/pages/inbox). */
export class InboxPage extends BasePage {
  readonly enquiries = new EnquiryList(this.page);

  async open(query = '') {
    await this.page.goto(`/inbox${query}`);
  }

  get subtitle() {
    return this.page.locator('.page-intro .subtitle');
  }

  get loadingStatus() {
    return this.page.locator('.page-intro [role="status"]');
  }

  get placeholder() {
    return this.page.locator('.thread-placeholder');
  }

  get placeholderPhotos() {
    return this.placeholder.locator('.photo img');
  }

  get offlineBanner() {
    return this.page.locator('.alert.banner');
  }
}
