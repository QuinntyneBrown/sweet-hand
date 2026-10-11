import type { Transaction } from '../platform/database.ts';
import type { TestEnvironment } from '../environment.ts';

/** What a scenario sees: one transaction on the test session's environment. */
export interface ScenarioContext {
  tx: Transaction;
  now: Date;
  env: TestEnvironment;
}

/**
 * A named state change the Playwright suite asks for (`backend.scenario(name,
 * args)`), so tests state intent instead of poking data (ADR 0008). Each area
 * exports its own map from `src/testing/scenarios/<area>.ts`.
 */
export type Scenario = (ctx: ScenarioContext, args: any) => Promise<unknown> | unknown;
export type Scenarios = Record<string, Scenario>;

/** The addresses the Playwright browser reaches the API from, through the dev server proxy. */
export const LOCAL_ADDRESSES = ['127.0.0.1', '::1', '::ffff:127.0.0.1'];
