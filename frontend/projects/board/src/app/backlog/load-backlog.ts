import type { Backlog } from './backlog';

/** Fetches `backlog.json`, which `npm run board:data` writes before every serve and build. */
export async function loadBacklog(): Promise<Backlog> {
  const response = await fetch('backlog.json', { cache: 'no-store' });
  if (!response.ok) throw new Error(`backlog.json: ${response.status}`);
  return response.json();
}
