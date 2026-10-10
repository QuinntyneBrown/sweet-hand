import { BasePage } from './base.page';

/** The changed privacy notice to accept after signing in, /privacy/accept (docs/mocks/pages/privacy-update). */
export class PrivacyUpdatePage extends BasePage {
  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  /** "Our privacy notice changes on …" */
  get intro() {
    return this.page.locator('.auth > .stack > p').first();
  }

  get changes() {
    return this.page.locator('.auth > .stack li');
  }

  get noticeLink() {
    return this.main.getByRole('link', { name: 'Read the full privacy notice' });
  }

  get accept() {
    return this.page.getByRole('button', { name: 'Accept and continue' });
  }

  get signOut() {
    return this.main.getByRole('button', { name: 'Sign out' });
  }

  get alert() {
    return this.page.locator('.auth .alert');
  }

  get status() {
    return this.page.locator('form [role="status"]').last();
  }
}
