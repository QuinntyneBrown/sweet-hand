import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';

const WINDOWS_CHROME = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/140.0.0.0 Safari/537.36';

describe('active sessions (L2-078.4, L2-078.5)', () => {
  it('Given a signed-in customer, when they list their sessions, then they see each device and last active time, theirs first, and never a cookie value', async () => {
    const api = await startApi();
    const marcia = api.client();
    await marcia.post('/api/identity/sign-in', { email: 'marcia.t@example.com', password: 'pepperpot-sunday-2026' }, { 'user-agent': WINDOWS_CHROME });

    const res = await marcia.get('/api/me/sessions');

    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.map((s: { device: string; lastActiveAt: string; current: boolean }) => [s.device, s.lastActiveAt, s.current]),
      [
        ['Chrome on Windows', '2026-10-10T14:00:00.000Z', true],
        ['Safari on iPhone', '2026-10-10T12:15:00Z', false],
        ['Samsung Internet on Android', '2026-09-28T22:40:00Z', false],
      ],
    );
    assert.deepEqual(Object.keys(res.body[0]).sort(), ['current', 'device', 'id', 'lastActiveAt']);
    assert.equal(JSON.stringify(res.body).includes(marcia.cookies.get('sh_session')!), false);
  });

  it('Given another of their devices, when they end its session, then it is gone and its cookie no longer works', async () => {
    const api = await startApi();
    const phone = await signedInClient(api, 'marcia.t@example.com');
    const laptop = await signedInClient(api, 'marcia.t@example.com');
    const phoneSession = (await phone.get('/api/me/sessions')).body.find((s: { current: boolean }) => s.current);

    const res = await laptop.delete(`/api/me/sessions/${phoneSession.id}`);

    assert.equal(res.status, 204);
    assert.equal((await phone.get('/api/session')).body.user, null);
    assert.equal((await laptop.get('/api/me/sessions')).body.some((s: { id: string }) => s.id === phoneSession.id), false);
    assert.ok((await documents(api, 'securityEvents')).some((e) => e.type === 'session-revoked' && e.userId === 'user-marcia'));
  });

  it('Given someone else’s session, when a user tries to end it, then it is not found and stays', async () => {
    const api = await startApi();
    const andre = await signedInClient(api, 'andre.c@example.com');

    const res = await andre.delete('/api/me/sessions/ses-marcia-iphone');

    assert.equal(res.status, 404);
    assert.ok((await documents(api, 'sessions')).some((s) => s.id === 'ses-marcia-iphone'));
  });
});
