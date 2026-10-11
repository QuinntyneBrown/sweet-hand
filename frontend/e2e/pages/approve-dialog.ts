import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Approve Auntie Bev's Kitchen?" (dialogs/approve-profile). */
export class ApproveDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Approve /);
  }
}
