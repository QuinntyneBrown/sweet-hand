import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Reinstate Pelau House?" (dialogs/reinstate-caterer). */
export class ReinstateDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Reinstate /);
  }

  get caption() {
    return this.dialog.locator('.dialog__body .text-caption');
  }
}
