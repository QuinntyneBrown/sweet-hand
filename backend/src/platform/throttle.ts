import type { Document, Transaction } from './database.ts';
import { hashIp } from './secrets.ts';

/** Recent events of one kind from one client, for sliding-window limits (L2-076.5, L2-082). */
interface ThrottleRecord extends Document {
  times: string[];
}

const throttles = (tx: Transaction) => tx.collection<ThrottleRecord>('throttles');
const key = (kind: string, ip: string) => `${kind}:${hashIp(ip)}`;

/** Events of `kind` from `ip` within the last `windowMs`, oldest first. */
export async function recentEvents(tx: Transaction, kind: string, ip: string, now: Date, windowMs: number): Promise<string[]> {
  const record = await throttles(tx).get(key(kind, ip));
  return (record?.times ?? []).filter((t) => now.getTime() - Date.parse(t) < windowMs);
}

export async function recordEvent(tx: Transaction, kind: string, ip: string, now: Date, windowMs: number): Promise<void> {
  const times = [...(await recentEvents(tx, kind, ip, now, windowMs)), now.toISOString()];
  await throttles(tx).put({ id: key(kind, ip), times });
}

/** Replaces the window outright (test arrangement through the test-control API). */
export async function setEvents(tx: Transaction, kind: string, ip: string, times: string[]): Promise<void> {
  await throttles(tx).put({ id: key(kind, ip), times });
}
