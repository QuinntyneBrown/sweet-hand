import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Request changes to Auntie Bev's Kitchen" (dialogs/request-changes). */
export class RequestChangesDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Request changes to /);
  }
}
