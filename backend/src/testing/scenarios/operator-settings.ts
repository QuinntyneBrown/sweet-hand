import { breaches, metricsState, METRICS_STATE_ID } from '../../operator-settings/model.ts';
import { audit } from '../../platform/audit.ts';
import { longAudit } from '../../seed/operator-settings.ts';
import type { Scenarios } from '../scenario.ts';

/** Named state changes for the operator settings specs (the fake's `operatorSettingsScenarios`). */
export const operatorSettingsScenarios: Scenarios = {
  /** docs/mocks/pages/admin-breaches/empty.html */
  'no-breaches': async ({ tx }) => {
    for (const b of await breaches(tx).all()) await breaches(tx).delete(b.id);
  },
  /** docs/mocks/pages/admin-audit/empty.html: a brand-new platform. */
  'audit-empty': async ({ tx }) => {
    for (const e of await audit(tx).all()) await audit(tx).delete(e.id);
  },
  /** docs/mocks/pages/admin-audit/long.html: 1,284 entries over the past year, in place of the history. */
  'audit-long': async ({ tx, now }) => {
    for (const e of await audit(tx).all()) await audit(tx).delete(e.id);
    for (const e of longAudit(now)) await audit(tx).put(e);
  },
  /** A stored label that spreadsheet software would run as a formula, for the export's guard (L2-063.2). */
  'metrics-formula-in-data': async ({ tx }) => {
    const state = await metricsState(tx).get(METRICS_STATE_ID);
    if (!state) return;
    const statuses = state.statuses.map((s, i) => (i === 1 ? { ...s, status: '=HYPERLINK("https://example.com","Pending review")' } : s));
    await metricsState(tx).put({ ...state, statuses });
  },
};
