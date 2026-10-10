import { expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

/** Shared behaviour of every screen's page object. */
export abstract class BasePage {
  constructor(readonly page: Page) {}

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
    const overflow = await this.page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(overflow).toBeLessThanOrEqual(0);
  }
}
