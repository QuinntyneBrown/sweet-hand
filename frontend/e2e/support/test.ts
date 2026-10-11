import { test as base, expect } from '@playwright/test';
import { Backend, SESSION_HEADER } from './backend';

/** Saturday 10 October 2026, 10:00 a.m. in Toronto: "today" in the mocks and the fake backend. */
export const TODAY = new Date('2026-10-10T10:00:00-04:00');

export const test = base.extend<{ backend: Backend; isolation: void }>({
  backend: async ({ request, context }, use, testInfo) => {
    const session = `${testInfo.testId}-${testInfo.repeatEachIndex}-${testInfo.retry}`;
    await context.setExtraHTTPHeaders({ [SESSION_HEADER]: session });
    const backend = new Backend(request, context, session);
    await backend.reset();
    await use(backend);
    await backend.release().catch(() => undefined);
  },
  // Every test gets its own backend and the mocks' clock, even if it never names them.
  isolation: [
    async ({ backend, page }, use) => {
      void backend;
      await page.clock.install({ time: TODAY });
      await use();
    },
    { auto: true },
  ],
});

export { expect };
