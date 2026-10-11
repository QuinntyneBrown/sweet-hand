import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Open the linked enquiry?" (dialogs/open-enquiry). */
export class OpenEnquiryDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, 'Open the linked enquiry?');
  }

  get explanation() {
    return this.dialog.locator('.dialog__body > p').first();
  }
}
