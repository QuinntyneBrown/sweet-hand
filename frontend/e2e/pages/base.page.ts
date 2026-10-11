import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { AccountMenu } from './account-menu';
import { SearchDialog } from './search-dialog';
import { SiteFooter } from './site-footer';
import { SiteHeader } from './shell';
import { SiteMenu } from './site-menu';
import { SkipLink } from './skip-link';

/** Shared behaviour of every screen's page object. */
export abstract class BasePage {
  readonly header: SiteHeader;
  readonly footer: SiteFooter;
  readonly siteMenu: SiteMenu;
  readonly accountMenu: AccountMenu;
  readonly skipLink: SkipLink;
  readonly search: SearchDialog;

  constructor(readonly page: Page) {
    this.header = new SiteHeader(page);
    this.footer = new SiteFooter(page);
    this.siteMenu = new SiteMenu(page);
    this.accountMenu = new AccountMenu(page);
    this.skipLink = new SkipLink(page);
    this.search = new SearchDialog(page);
  }

  /** Switch to a phone-sized viewport (XS). */
  async usePhone() {
    await this.page.setViewportSize({ width: 360, height: 780 });
  }

  get main() {
    return this.page.getByRole('main');
  }

  get heading() {
    return this.page.getByRole('heading', { level: 1 });
  }

  /** axe-core with WCAG 2.1 A and AA rules reports no violations (L2-066). */
  async expectNoAccessibilityViolations() {
    const results = await new AxeBuilder({ page: this.page })
      .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'])
      .analyze();
    const summary = results.violations.map((v) => `${v.id}: ${v.help}\n  ${v.nodes.map((n) => n.target.join(' ')).join('\n  ')}`);
    expect(summary, summary.join('\n')).toEqual([]);
  }

  /** The page does not scroll sideways (L2-005.6, L2-064.2). */
  async expectNoHorizontalScroll() {
    // Measured until layout settles: under a loaded CI runner the first frame after navigation or resize can still be unstyled.
    await expect
      .poll(() => this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth))
      .toBeLessThanOrEqual(0);
  }
}
