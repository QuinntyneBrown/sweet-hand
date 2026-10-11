import type { Page } from '@playwright/test';

/** The "Skip to main content" link (docs/specs/components/skip-link.md). */
export class SkipLink {
  constructor(private readonly page: Page) {}

  get link() {
    return this.page.getByRole('link', { name: 'Skip to main content' });
  }
}
