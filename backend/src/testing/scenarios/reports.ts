import { hashIp } from '../../platform/secrets.ts';
import { setEvents } from '../../platform/throttle.ts';
import { reports } from '../../reports/model.ts';
import { nextReportId, REPORT_KIND } from '../../reports/submit.ts';
import { LOCAL_ADDRESSES, type Scenarios } from '../scenario.ts';

export const reportsScenarios: Scenarios = {
  /** Reports already sent from the browser's connection in the last hour: { count } (L2-054.3). */
  'reports-from-this-connection': async ({ tx, now }, { count }: { count: number }) => {
    const times: string[] = [];
    for (let i = count - 1; i >= 0; i--) {
      const at = new Date(now.getTime() - (10 + i) * 60_000).toISOString();
      times.push(at);
      await reports(tx).put({
        id: await nextReportId(tx),
        targetKind: 'CatererProfile',
        targetId: 'cat-002',
        reason: 'Fake or spam',
        connection: hashIp(LOCAL_ADDRESSES[0]),
        createdAt: at,
        status: 'Open',
      });
    }
    for (const ip of LOCAL_ADDRESSES) await setEvents(tx, REPORT_KIND, ip, times);
  },
};
