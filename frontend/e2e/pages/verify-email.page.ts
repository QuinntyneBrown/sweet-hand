import { BasePage } from './base.page';

/** Verify email, /verify-email/:token, and "Check your email", /verify-email/sent (docs/mocks/pages/verify-email). */
export class VerifyEmailPage extends BasePage {
  async open(link: string) {
    await this.page.goto(link);
  }

  get subtitle() {
    return this.page.locator('.auth__head .subtitle');
  }

  get busyRegion() {
    return this.page.locator('.auth[aria-busy="true"]');
  }

  get skeletons() {
    return this.page.locator('.auth .skeleton');
  }

  get status() {
    return this.page.locator('.auth [role="status"]');
  }

  get alert() {
    return this.page.locator('.auth .alert');
  }

  /** The saved enquiry waiting to be finished. */
  get savedEnquiry() {
    return this.page.locator('.auth .dialog__caterer');
  }

  get resendHelp() {
    return this.page.locator('#resend-help');
  }

  link(name: string) {
    return this.main.getByRole('link', { name, exact: true });
  }

  button(name: string) {
    return this.main.getByRole('button', { name, exact: true });
  }
}
