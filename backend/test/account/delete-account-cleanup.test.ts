import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, outbox, signedInClient, startApi, type Api } from '../support/api.ts';
import { SEED_PASSWORD } from '../../src/seed/users.ts';
import { dispatchDueEmails, type EmailGateway } from '../../src/platform/email-dispatch.ts';

const put = (api: Api, collection: string, doc: Record<string, unknown>) => api.env.db.transaction((tx) => tx.collection<any>(collection).put(doc as any));
const sentTo: string[] = [];
const gateway: EmailGateway = { send: async (m) => void sentTo.push(m.to) };

describe('delete account clean-up (delete-account design, L2-072)', () => {
  it('Given a customer with an enquiry draft and past emails, when they delete their account, then the draft goes and no email keeps their address once the confirmation is sent', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, 'marcia.t@example.com');
    await put(api, 'enquiryDrafts', { id: 'user-marcia:cat-001', userId: 'user-marcia', catererId: 'cat-001', values: {}, savedAt: '2026-10-09T12:00:00Z' });
    await put(api, 'outbox', { id: 'mail-old', to: 'marcia.t@example.com', kind: 'verify-email', at: '2026-09-01T12:00:00Z', seq: 0, status: 'sent' });

    assert.equal((await marcia.post('/api/me/deletion', { password: SEED_PASSWORD })).status, 204);

    assert.equal((await documents(api, 'enquiryDrafts')).some((d) => d.userId === 'user-marcia'), false);
    assert.equal((await documents(api, 'outbox')).find((m) => m.id === 'mail-old').to, '');
    await dispatchDueEmails(api.env, gateway);
    assert.ok(sentTo.includes('marcia.t@example.com'), 'the confirmation is still sent');
    assert.equal((await outbox(api)).some((m) => m.to === 'marcia.t@example.com'), false);
  });

  it('Given a caterer with a photo waiting behind Undo, when they delete their account, then the removed photo and its file go too', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, 'kendra@pelauhouse.example');
    await api.env.media.put('upload-undo.jpg', { contentType: 'image/jpeg', bytes: Buffer.from([0xff, 0xd8, 0xff]) });
    await put(api, 'removedPhotos', { id: 'rp-1', catererId: 'cat-001', index: 0, removedAt: '2026-10-10T13:00:00Z', photo: { id: 'p-undo', file: 'upload-undo.jpg', fileName: 'tray.jpg', caption: '' } });

    assert.equal((await kendra.post('/api/me/deletion', { password: SEED_PASSWORD })).status, 204);

    assert.equal((await documents(api, 'removedPhotos')).some((r) => r.catererId === 'cat-001'), false);
    assert.equal(await api.env.media.get('upload-undo.jpg'), undefined);
  });
});
