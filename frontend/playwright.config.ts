import { defineConfig, devices } from '@playwright/test';
import { API_PORT, API_URL, BOARD_PORT, BOARD_URL, LAUNCH_PORT, LAUNCH_URL, WEB_PORT, WEB_URL } from './e2e/support/ports';

/**
 * Frontend acceptance tests (ADRs 0004, 0009): Chromium only, against the backend in test mode.
 * `npm run e2e` starts both servers unless they are already running.
 */
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: 0,
  workers: process.env['E2E_WORKERS'] ? Number(process.env['E2E_WORKERS']) : process.env['CI'] ? 4 : undefined,
  reporter: process.env['CI'] ? [['list'], ['html', { open: 'never' }]] : 'list',
  timeout: 30_000,
  expect: { timeout: 7_000 },
  use: {
    baseURL: WEB_URL,
    locale: 'en-CA',
    timezoneId: 'America/Toronto',
    trace: 'retain-on-failure',
  },
  projects: [
    {
      name: 'chromium',
      testIgnore: ['launch/**', 'board/**'],
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 } },
    },
    {
      // The pre-launch site is its own application on its own port (L2-092.6).
      name: 'launch',
      testMatch: 'launch/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, baseURL: LAUNCH_URL },
    },
    {
      // The sprint board is internal tooling with no backend (ADR 0013).
      name: 'board',
      testMatch: 'board/**/*.spec.ts',
      use: { ...devices['Desktop Chrome'], viewport: { width: 1280, height: 900 }, baseURL: BOARD_URL },
    },
  ],
  webServer: [
    {
      // The backend in test mode (ADR 0009): in-memory database, one environment per test.
      command: `PORT=${API_PORT} TEST_CONTROL=1 npm --prefix ../backend start`,
      url: `${API_URL}/health/live`,
      reuseExistingServer: !process.env['CI'],
    },
    {
      command: `E2E_API_PORT=${API_PORT} npx ng serve sweet-hand --port ${WEB_PORT}`,
      url: WEB_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    {
      command: `E2E_API_PORT=${API_PORT} npx ng serve launch --port ${LAUNCH_PORT}`,
      url: LAUNCH_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
    {
      command: `node scripts/backlog-to-board.mjs && npx ng serve board --port ${BOARD_PORT}`,
      url: BOARD_URL,
      reuseExistingServer: !process.env['CI'],
      timeout: 180_000,
    },
  ],
});
