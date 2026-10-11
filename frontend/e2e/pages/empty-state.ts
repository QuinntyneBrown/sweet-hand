import type { Locator } from '@playwright/test';

/** An empty, no-results or error state inside a region (docs/specs/components/empty-state.md). */
export class EmptyState {
  constructor(private readonly scope: Locator) {}

  get root() {
    return this.scope.locator('.empty');
  }

  get title() {
    return this.root.locator('.empty__title');
  }

  get text() {
    return this.root.locator('.empty__text');
  }

  get reference() {
    return this.root.locator('.text-caption code');
  }

  get photos() {
    return this.root.locator('.photo-row img');
  }

  action(name: string) {
    return this.root.locator('.empty__actions').getByRole('link', { name }).or(this.root.locator('.empty__actions').getByRole('button', { name }));
  }
}
