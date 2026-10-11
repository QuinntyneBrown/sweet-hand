import type { Locator } from '@playwright/test';
import { OperatorConsolePage } from './operator-console.page';

/** What every operator settings screen shares: intro, states and toasts (docs/mocks/pages/admin-*). */
export abstract class OperatorScreen extends OperatorConsolePage {
  get subtitle() {
    return this.page.locator('.work-main .page-intro .subtitle');
  }

  /** The intro while the page loads. */
  get busyIntro() {
    return this.page.locator('.work-main .page-intro[aria-busy="true"]');
  }

  get loadingStatus() {
    return this.workArea.locator('p.visually-hidden[role="status"]').first();
  }

  get errorState() {
    return this.workArea.locator('.empty--error');
  }

  get emptyState() {
    return this.workArea.locator('.empty').first();
  }

  get emptyTitle() {
    return this.emptyState.locator('.empty__title');
  }

  get emptyText() {
    return this.emptyState.locator('.empty__text');
  }

  get reference() {
    return this.errorState.locator('.text-caption');
  }

  button(name: string | RegExp): Locator {
    return this.workArea.getByRole('button', { name, exact: typeof name === 'string' });
  }

  link(name: string | RegExp): Locator {
    return this.workArea.getByRole('link', { name, exact: typeof name === 'string' });
  }

  get toast() {
    return this.page.locator('.toast-region .toast').last();
  }
}
