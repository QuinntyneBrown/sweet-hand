import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Revert Pelau House's description?" (dialogs/revert-change). */
export class RevertDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Revert /);
  }

  get goesBackTo() {
    return this.dialog.locator('.well p').first();
  }

  get replaces() {
    return this.dialog.locator('.well p').nth(1);
  }
}
