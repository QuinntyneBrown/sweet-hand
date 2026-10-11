import type { Environment } from '../environment.ts';
import { torontoDate } from '../discovery/listing.ts';
import { caterers } from '../caterers/model.ts';
import { certificateExpiries } from '../moderation/model.ts';
import { ownerView } from '../moderation/views.ts';
import { queueEmail } from '../platform/outbox.ts';

const DAY = 24 * 60 * 60_000;
const daysUntil = (date: string, today: string) => Math.round((Date.parse(`${date}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / DAY);

/**
 * CertificateExpiryCheck for published profiles (L2-040.2–3): a reminder 30
 * days before expiry and a second 7 days before, each once; after expiry the
 * finding is recorded for the operator queue and the profile stays published.
 */
export async function checkCertificateExpiry(env: Environment): Promise<void> {
  const now = env.clock.now();
  const today = torontoDate(now);
  await env.db.transaction(async (tx) => {
    for (const c of await caterers(tx).find({ status: 'Published' })) {
      const expires = c.certificate?.expires;
      if (!expires) continue;
      const stored = await certificateExpiries(tx).get(c.id);
      // The reminder log belongs to one expiry date; a new certificate starts afresh.
      const log = stored && (stored.forExpiry ?? expires) === expires ? stored : { id: c.id, reminders: [] as string[], forExpiry: expires };
      const left = daysUntil(expires, today);
      if (left < 0) {
        if (!log.detectedAt) await certificateExpiries(tx).put({ ...log, forExpiry: expires, detectedAt: now.toISOString() });
        continue;
      }
      const due = left <= 7 ? 2 : left <= 30 ? 1 : 0;
      if (log.reminders.length >= due) continue;
      const owner = await ownerView(tx, c);
      if (owner.email) await queueEmail(tx, now, { to: owner.email, kind: 'certificate-reminder', caterer: c.name, expires, link: '/dashboard/profile/food-safety' });
      // A reminder found late (for example 5 days out) stands for both, so none is sent twice.
      await certificateExpiries(tx).put({ ...log, forExpiry: expires, reminders: [...log.reminders, ...Array(due - log.reminders.length).fill(now.toISOString())] });
    }
  });
}
