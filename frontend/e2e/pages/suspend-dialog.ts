import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Suspend Pelau House?" (dialogs/suspend-caterer). */
export class SuspendDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Suspend /);
  }
}
