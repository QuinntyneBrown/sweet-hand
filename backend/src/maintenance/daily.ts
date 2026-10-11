import type { Environment } from '../environment.ts';
import { autoCloseEnquiries } from '../enquiries/auto-close.ts';
import { checkCertificateExpiry } from '../caterer-profile/certificate-expiry.ts';
import { enforceRetention } from '../privacy/retention.ts';
import { writeLog } from '../platform/log-redactor.ts';

/**
 * The daily maintenance job (DailyMaintenanceJob): time-based rules owned by
 * several features. One failing rule does not stop the others.
 */
export async function runDailyMaintenance(env: Environment): Promise<void> {
  const rules: [string, (env: Environment) => Promise<unknown>][] = [
    ['auto-close-enquiries', autoCloseEnquiries],
    ['certificate-expiry', checkCertificateExpiry],
    ['retention', enforceRetention],
  ];
  for (const [name, rule] of rules) {
    try {
      await rule(env);
    } catch (err) {
      writeLog({ level: 'error', event: 'maintenance-rule-failed', rule: name, message: (err as Error).message });
    }
  }
}
