/**
 * Keeps personal and secret values out of the logs (log-security-events
 * design, L2-084.2): drops fields by name, keeps only the FSA of any postal
 * code and blanks token-shaped strings, even inside an exception message.
 */
const DROPPED = new Set(['password', 'newpassword', 'currentpassword', 'sessionid', 'session', 'token', 'resettoken', 'text', 'message_text', 'certificatenumber', 'number', 'link', 'cookie', 'email', 'to']);
const POSTAL_CODE = /\b([ABCEGHJ-NPRSTVXY]\d[ABCEGHJ-NPRSTV-Z])\s?\d[ABCEGHJ-NPRSTV-Z]\d\b/gi;
const TOKEN = /\b[0-9a-f]{40,}\b/gi;

function redactString(value: string): string {
  return value.replace(POSTAL_CODE, '$1').replace(TOKEN, '[redacted]');
}

function redact(value: unknown): unknown {
  if (typeof value === 'string') return redactString(value);
  if (Array.isArray(value)) return value.map(redact);
  if (value && typeof value === 'object') {
    const out: Record<string, unknown> = {};
    for (const [k, v] of Object.entries(value)) if (!DROPPED.has(k.toLowerCase().replace(/[-_]/g, ''))) out[k] = redact(v);
    return out;
  }
  return value;
}

export function redactLogEntry<T extends Record<string, unknown>>(entry: T): Partial<T> {
  return redact(entry) as Partial<T>;
}

/** Writes one structured log line, redacted. Errors and alerts go to stderr. */
export function writeLog(entry: { level: string } & Record<string, unknown>): void {
  const line = JSON.stringify(redactLogEntry(entry));
  if (entry.level === 'error' || entry.level === 'alert') console.error(line);
  else console.log(line);
}
