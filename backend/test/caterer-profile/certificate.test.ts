import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { caterers, type Caterer } from '../../src/caterers/model.ts';

const KENDRA = 'kendra@pelauhouse.example';
const DETAILS = { holder: ' Kendra Baptiste ', issuer: 'Toronto Public Health', number: 'fh-2026-555001', expires: '2031-05-31' };
const NOT_A_COPY = 'This file isn’t a PDF, JPEG or PNG, so nothing was saved';

const pelau = async (api: Api) => (await documents<Caterer>(api, 'caterers')).find((c) => c.id === 'cat-001')!;
const upload = (fileName: string, bytes: Buffer) => ({ fileName, data: bytes.toString('base64') });
const JPEG = Buffer.from([0xff, 0xd8, 0xff, 0xe0, 0, 0x10, 0x4a, 0x46, 0x49, 0x46]);

async function change(api: Api, patch: Partial<Caterer>): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    const c = (await caterers(tx).get('cat-001'))!;
    await caterers(tx).put({ ...c, ...patch });
  });
}

describe('food handler certificate (provide-food-handler-certificate design, L2-040)', () => {
  it('Given complete details, when saved, then they are stored with the number in capitals and the copy kept', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/certificate', DETAILS);

    assert.equal(res.status, 200);
    const now = api.env.clock.now().toISOString();
    assert.deepEqual(res.body, {
      holder: 'Kendra Baptiste',
      issuer: 'Toronto Public Health',
      number: 'FH-2026-555001',
      expires: '2031-05-31',
      savedAt: now,
      file: { name: 'food-handler-certificate.pdf', size: 1258291, type: 'PDF', uploadedAt: '2026-09-02T14:00:00Z' },
    });
    assert.equal((await pelau(api)).certificate!.number, 'FH-2026-555001');
  });

  it('Given missing details or a date that is not a date, when saved, then each field says what is missing', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/certificate', { holder: ' ', expires: '31/05/2031' });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, {
      holder: ['Enter the name on the certificate'],
      issuer: ['Enter who issued the certificate'],
      number: ['Enter the certificate number'],
      expires: ['Enter the expiry date'],
    });
  });

  it('Given an expiry date before today in Toronto, when saved, then it is refused with "This certificate has expired" (L2-040.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/certificate', { ...DETAILS, expires: '2026-10-09' });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { expires: ['This certificate has expired'] });
    assert.equal((await pelau(api)).certificate!.number, 'FH-2024-118734');
  });

  it('Given a suspended profile, when the certificate is saved, then it is accepted; in review it is refused', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await change(api, { status: 'Suspended' });
    assert.equal((await kendra.put('/api/caterer/profile/certificate', DETAILS)).status, 200);
    await change(api, { status: 'Pending review' });
    assert.equal((await kendra.put('/api/caterer/profile/certificate', DETAILS)).status, 409);
  });

  it('Given a JPEG copy, when uploaded, then it is stored privately: never served publicly (L2-040.4)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/certificate/file', upload('bev-certificate.jpg', JPEG));

    assert.equal(res.status, 201);
    assert.deepEqual(res.body.file, { name: 'bev-certificate.jpg', size: JPEG.length, type: 'JPEG', uploadedAt: api.env.clock.now().toISOString() });
    const cert = (await pelau(api)).certificate!;
    assert.equal(cert.fileName, 'bev-certificate.jpg');
    assert.equal(cert.fileType, 'JPEG');
    assert.ok(cert.fileMediaId);
    assert.deepEqual((await api.env.media.get(cert.fileMediaId))?.bytes, JPEG);
    assert.equal((await fetch(`${api.url}/media/${cert.fileMediaId}`)).status, 404);
  });

  it('Given a WebP or a text file, when uploaded as the copy, then it is refused and the old copy stays (L2-040)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const webp = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);

    for (const file of [upload('scan.webp', webp), upload('scan-0412.png', Buffer.from('not a scan')), { fileName: 'x.pdf' }]) {
      const res = await kendra.post('/api/caterer/profile/certificate/file', file);
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { file: [NOT_A_COPY] });
    }
    assert.equal((await pelau(api)).certificate!.fileName, 'food-handler-certificate.pdf');
  });

  it('Given a PDF over 10 MB, when uploaded, then it is refused', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const pdf = Buffer.alloc(10 * 1024 * 1024 + 1, 0x20);
    pdf.write('%PDF-1.7\n', 0, 'latin1');

    const res = await kendra.post('/api/caterer/profile/certificate/file', upload('scan.pdf', pdf));

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { file: ['Certificate copies must be a PDF, JPEG or PNG of up to 10 MB'] });
  });

  it('Given no certificate details yet, when a copy is uploaded, then it is refused until the details are saved', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    await change(api, { certificate: undefined });

    const res = await kendra.post('/api/caterer/profile/certificate/file', upload('c.jpg', JPEG));

    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'Save the certificate details first');
  });

  it('Given an uploaded copy, when it is replaced and then removed, then each earlier copy is deleted from storage', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    await kendra.post('/api/caterer/profile/certificate/file', upload('first.jpg', JPEG));
    const first = (await pelau(api)).certificate!.fileMediaId!;

    await kendra.post('/api/caterer/profile/certificate/file', upload('second.jpg', JPEG));
    const second = (await pelau(api)).certificate!.fileMediaId!;
    assert.equal(await api.env.media.get(first), undefined);

    const res = await kendra.delete('/api/caterer/profile/certificate/file');
    assert.equal(res.status, 200);
    assert.equal(res.body.file, null);
    const cert = (await pelau(api)).certificate!;
    assert.equal(cert.fileName, undefined);
    assert.equal(cert.fileMediaId, undefined);
    assert.equal(await api.env.media.get(second), undefined);
    assert.equal((await kendra.delete('/api/caterer/profile/certificate/file')).status, 404);
  });
});
