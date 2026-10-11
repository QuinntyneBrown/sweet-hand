import { randomUUID } from 'node:crypto';
import type { Request, Reply } from '../http/endpoint.ts';
import { created, invalid, ok } from '../http/problems.ts';
import { recordAudit } from '../platform/audit.ts';
import { currentUser } from '../identity/sessions.ts';
import { torontoDate } from '../discovery/listing.ts';
import type { BreachInformation } from '@contract/breach-information.ts';
import type { BreachRecord } from '@contract/breach-record.ts';
import type { RecordBreachRequest } from '@contract/record-breach-request.ts';
import { breaches, type Breach } from './model.ts';

/** locate-data-and-record-breaches: the PIPEDA breach register (L2-075.2). */

const INFORMATION: BreachInformation[] = ['Names', 'Email addresses', 'Phone numbers', 'Event details', 'Messages', 'Food handler certificates'];

/** "Names, email addresses and messages." */
function informationLine(info: BreachInformation[]): string {
  if (!info.length) return 'None identified.';
  const words = info.map((x, i) => (i === 0 ? x : x.charAt(0).toLowerCase() + x.slice(1)));
  return `${new Intl.ListFormat('en-CA', { style: 'long', type: 'conjunction' }).format(words)}.`;
}

const view = ({ recordedById: _by, ...record }: Breach): BreachRecord => record;

/** Newest confirmed first. */
export async function listBreaches(req: Request): Promise<Reply> {
  const all = await breaches(req.tx).all();
  return ok(all.sort((a, b) => b.confirmedOn.localeCompare(a.confirmedOn) || b.recordedAt.localeCompare(a.recordedAt)).map(view));
}

export async function recordBreach(req: Request): Promise<Reply> {
  const body = (req.body ?? {}) as Partial<RecordBreachRequest>;
  const errors: Record<string, string[]> = {};
  const date = String(body.date ?? '');
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || Number.isNaN(Date.parse(date))) errors['date'] = ['Enter the date the breach was confirmed'];
  else if (date > torontoDate(req.now)) errors['date'] = ['The date can’t be in the future'];
  const what = String(body.what ?? '').trim();
  if (!what) errors['what'] = ['Describe what happened'];
  const people = String(body.people ?? '').trim();
  if (!/^\d+$/.test(people)) errors['people'] = ['Enter the number of people affected as a whole number'];
  if (body.risk !== 'low' && body.risk !== 'real') errors['risk'] = ['Choose the risk of significant harm'];
  if (body.decision !== 'report' && body.decision !== 'not') errors['decision'] = ['Choose a notification decision'];
  if (Object.keys(errors).length) return invalid(errors);

  const me = currentUser(req);
  const info = INFORMATION.filter((x) => Array.isArray(body.information) && body.information.includes(x));
  const notes = String(body.riskNotes ?? '').trim().replace(/^(low|real risk of significant harm)[.:]?\s*/i, '');
  const record: Breach = {
    id: `br-${randomUUID()}`,
    title: what,
    confirmedOn: date,
    recordedAt: req.now.toISOString(),
    recordedBy: me.displayName,
    recordedById: me.id,
    information: informationLine(info),
    peopleAffected: Number(people),
    riskAssessment: `${body.risk === 'real' ? 'Real risk of significant harm.' : 'Low.'}${notes ? ` ${notes}` : ''}`,
    notificationDecision:
      body.decision === 'report' ? 'Reported to the Privacy Commissioner; the people affected are being notified.' : 'Not reportable: no real risk of significant harm.',
  };
  await breaches(req.tx).put(record);
  await recordAudit(req.tx, req.now, { operatorId: me.id, action: 'RecordBreach', targetType: 'breach', targetId: record.id, reason: 'Recorded in the breach register', before: null, after: record.title });
  return created(view(record));
}
