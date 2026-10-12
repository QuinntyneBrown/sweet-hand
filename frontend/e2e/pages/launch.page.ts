import { expect, type Locator, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

type Role = 'Planning an event' | 'A caterer';

/** The pre-launch page (docs/mocks/pages/launch/), served by the `launch` application. */
export class LaunchPage {
  constructor(readonly page: Page) {}

  /** Opens `/`, optionally with a query string or fragment, and waits for the app to take over. */
  async open(suffix = '') {
    await this.page.goto(`/${suffix}`);
    await expect(this.page.locator('html[data-ready]')).toBeAttached();
  }

  async openConfirmationLink(token: string) {
    await this.open(`?confirmed=${token}`);
  }

  async openRemovalLink(token: string) {
    await this.open(`?remove=${token}`);
  }

  usePhone(width = 375) {
    return this.page.setViewportSize({ width, height: 780 });
  }

  // Page structure

  get skipLink() {
    return this.page.getByRole('link', { name: 'Skip to main content' });
  }

  get main() {
    return this.page.getByRole('main');
  }

  get header() {
    return this.page.locator('header.site-header');
  }

  get wordmark() {
    return this.header.getByRole('link', { name: 'Sweet Hand' });
  }

  get headerButton() {
    return this.header.getByRole('link', { name: 'Get the launch email' });
  }

  get heroPhotos() {
    return this.page.locator('.launch-hero__intro .launch-collage');
  }

  get overline() {
    return this.page.locator('.launch-hero__intro .overline');
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  get subtitle() {
    return this.page.locator('.launch-hero__intro .subtitle');
  }

  get signUpSection() {
    return this.page.locator('#notify');
  }

  get signUpHeading() {
    return this.signUpSection.getByRole('heading', { level: 2 });
  }

  get howItWorksHeading() {
    return this.page.getByRole('heading', { name: 'How it works' });
  }

  /** The "How it works" steps, as the items of an ordered (numbered) list. */
  get numberedSteps() {
    return this.page.locator('#how ol').getByRole('listitem');
  }

  get catererCallout() {
    return this.page.locator('#caterers');
  }

  get catererHeading() {
    return this.page.getByRole('heading', { name: 'Caterers: be there on day one' });
  }

  get catererText() {
    return this.page.locator('#caterers p');
  }

  get catererPhoto() {
    return this.page.locator('#caterers img');
  }

  get joinAsCaterer() {
    return this.page.getByRole('link', { name: 'Join as a caterer' });
  }

  get footer() {
    return this.page.getByRole('contentinfo');
  }

  footerLink(name: 'Privacy' | 'Contact') {
    return this.footer.getByRole('link', { name });
  }

  /** The visible headings of the page's parts, in document order. */
  partHeadings() {
    return this.page.locator('h1, main h2:visible').allTextContents();
  }

  allLinkTargets() {
    return this.page.locator('a[href]').evaluateAll((links) => links.map((a) => a.getAttribute('href') ?? ''));
  }

  metaContent(selector: string) {
    return this.page.locator(selector).getAttribute('content');
  }

  get canonical() {
    return this.page.locator('link[rel="canonical"]');
  }

  // Layout

  /** The rendered box of a part of the page, in CSS pixels from the top left of the page. */
  async box(part: Locator) {
    const box = await part.boundingBox();
    if (!box) throw new Error('The part is not rendered');
    return { left: box.x, top: box.y, right: box.x + box.width, bottom: box.y + box.height, width: box.width };
  }

  /** The empty space between the header and the hero, and between the caterer call-out and the footer. */
  async spaceAroundContent() {
    const header = await this.box(this.header);
    const footer = await this.box(this.footer);
    const firstPart = await this.box(this.heroPhotos);
    const lastPart = await this.box(this.catererCallout);
    return { above: firstPart.top - header.bottom, below: footer.top - lastPart.bottom };
  }

  // The form

  role(name: Role) {
    return this.signUpSection.getByRole('radio', { name });
  }

  get roleGroup() {
    return this.signUpSection.getByRole('group', { name: 'I’m…' });
  }

  get email() {
    return this.signUpSection.getByLabel('Email', { exact: true });
  }

  get businessName() {
    return this.signUpSection.getByLabel('Business name (optional)');
  }

  get consent() {
    return this.signUpSection.getByRole('checkbox', { name: 'Email me when Sweet Hand opens' });
  }

  get consentPrivacyLink() {
    return this.signUpSection.getByRole('link', { name: 'Privacy' });
  }

  get submit() {
    return this.signUpSection.locator('button[type=submit]');
  }

  get errorSummary() {
    return this.signUpSection.locator('.form-summary');
  }

  get errorSummaryTitle() {
    return this.errorSummary.getByRole('heading');
  }

  summaryLink(message: string) {
    return this.errorSummary.getByRole('link', { name: message });
  }

  errorFor(field: 'role' | 'email' | 'consent') {
    return this.signUpSection.locator(`#${field}-error`);
  }

  get busyAnnouncement() {
    return this.signUpSection.getByRole('status').filter({ hasText: 'Adding you to the list' });
  }

  get failure() {
    return this.signUpSection.getByRole('alert').filter({ hasText: 'We couldn’t add you just now' });
  }

  get notice() {
    return this.page.locator('.alert[role=status]');
  }

  get result() {
    return this.signUpSection.locator('.empty');
  }

  get resultTitle() {
    return this.result.locator('.empty__title');
  }

  get resultText() {
    return this.result.locator('.empty__text');
  }

  get resultAnnouncement() {
    return this.result.locator('[role=status]');
  }

  get useDifferentAddress() {
    return this.signUpSection.getByRole('link', { name: 'Use a different address' });
  }

  get removeMyEmail() {
    return this.signUpSection.getByRole('button', { name: 'Remove my email' });
  }

  async fill(details: { role?: Role; email?: string; businessName?: string; consent?: boolean }) {
    if (details.role) await this.role(details.role).check();
    if (details.businessName !== undefined) await this.businessName.fill(details.businessName);
    if (details.email !== undefined) await this.email.fill(details.email);
    if (details.consent) await this.consent.check();
  }

  async signUp(details: { role?: Role; email?: string; businessName?: string; consent?: boolean }) {
    await this.fill(details);
    await this.submit.click();
  }

  /** Lets `ms` pass on the page's clock. */
  waitFor(ms: number) {
    return this.page.clock.runFor(ms);
  }

  /** Activates the submit button even while it reports itself busy (`aria-disabled`), as a visitor can. */
  async activateSubmitWhileBusy() {
    await this.submit.click({ force: true });
  }

  // Checks

  async expectNoHorizontalScroll() {
    const overflow = await this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }

  /** axe-core with WCAG 2.2 A and AA rules, at XS and XL, in the light and dark themes (L2-107.1). */
  async expectNoAccessibilityViolations() {
    const size = this.page.viewportSize();
    for (const width of [375, 1280]) {
      for (const colorScheme of ['light', 'dark'] as const) {
        await this.page.setViewportSize({ width, height: 900 });
        await this.page.emulateMedia({ colorScheme });
        const results = await new AxeBuilder({ page: this.page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22a', 'wcag22aa']).analyze();
        const summary = results.violations.map((v) => `${width}px ${colorScheme} ${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`);
        expect(summary, summary.join('\n')).toEqual([]);
      }
    }
    await this.page.emulateMedia({ colorScheme: null });
    if (size) await this.page.setViewportSize(size);
  }
}
