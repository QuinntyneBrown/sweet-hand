import { outbox, type Api } from '../support/api.ts';

export const marcia = { role: 'customer', email: 'marcia.t@example.com', consent: true, challengeToken: 'local:launch-sign-up:1' };
export const kendra = { role: 'caterer', email: 'kendra@pelauhouse.example', businessName: 'Pelau House', consent: true, challengeToken: 'local:launch-sign-up:2' };
export const HOUR = 60 * 60_000;

export const tokenFrom = (link: unknown, name: string) => new URL(String(link), 'https://sweethand.example').searchParams.get(name)!;

/** Signs up and returns the tokens of the latest emails sent to that address. */
export async function signUp(api: Api, body: { email: string } & Record<string, unknown> = marcia) {
  const res = await api.client().post('/api/launch-list/sign-ups', body);
  if (res.status !== 202) throw new Error(`Sign-up failed: ${res.status}`);
  const mail = (await outbox(api)).filter((m) => m.to === body.email.trim()).at(-1)!;
  return { confirm: tokenFrom(mail.link, 'confirmed'), remove: tokenFrom(mail.removalLink, 'token') };
}

/** Signs up and confirms; returns the page's removal token. */
export async function confirmed(api: Api, body: { email: string } & Record<string, unknown> = marcia): Promise<string> {
  const { confirm } = await signUp(api, body);
  const res = await api.client().post('/api/launch-list/confirmations', { token: confirm });
  if (res.status !== 200) throw new Error(`Confirmation failed: ${res.status}`);
  return res.body.removalToken;
}
