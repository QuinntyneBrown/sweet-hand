import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Remove Pelau House permanently?" (dialogs/remove-caterer). */
export class RemoveDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, /^Remove .* permanently\?$/);
  }

  get confirmName() {
    return this.dialog.getByRole('textbox', { name: /^Type .* to confirm$/ });
  }

  get confirmError() {
    return this.dialog.locator('#confirm-name-error');
  }

  /** Presses "Remove permanently" while it is still marked unavailable, to see what is missing. */
  async pressRemoveAnyway() {
    await this.submit.dispatchEvent('click');
  }
}
