import { ModerationDialog } from './moderation-dialogs';
import type { Page } from '@playwright/test';

/** "Resolve report" (dialogs/resolve-report). */
export class ResolveReportDialog extends ModerationDialog {
  constructor(page: Page) {
    super(page, 'Resolve report');
  }

  get decisions() {
    return this.dialog.getByRole('group', { name: 'Decision' }).getByRole('radio');
  }

  decision(name: 'Dismiss' | 'Take action') {
    return this.dialog.getByRole('group', { name: 'Decision' }).getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  action(name: string) {
    return this.dialog.getByRole('group', { name: 'Action' }).getByRole('radio', { name: new RegExp(`^${name}`) });
  }

  get actions() {
    return this.dialog.getByRole('group', { name: 'Action' }).getByRole('radio');
  }

  get note() {
    return this.dialog.locator('#note');
  }

  get noteLabel() {
    return this.dialog.locator('label[for="note"]');
  }

  get caption() {
    return this.dialog.locator('.dialog__body > .text-caption');
  }
}
