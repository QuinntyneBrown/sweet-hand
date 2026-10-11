import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import type { Caterer } from '../../src/caterers/model.ts';
import { processWaitingPhotos } from '../../src/caterer-profile/processing.ts';

const KENDRA = 'kendra@pelauhouse.example';
const LEAH = 'leah@sweethand.example';
/** The industry-standard harmless test file every malware scanner flags. */
const EICAR = 'X5O!P%@AP[4\\PZX54(P^)7CC)7}$EICAR-STANDARD-ANTIVIRUS-TEST-FILE!$H+H*';

function png(width: number, height: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'latin1');
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
}

/** A lossless WebP (VP8L) header giving its size. */
function webp(width: number, height: number): Buffer {
  const b = Buffer.alloc(30);
  b.write('RIFF', 0, 'latin1');
  b.writeUInt32LE(22, 4);
  b.write('WEBPVP8L', 8, 'latin1');
  b.writeUInt32LE(10, 16);
  b[20] = 0x2f;
  const bits = (width - 1) | ((height - 1) << 14);
  b.writeUInt32LE(bits >>> 0, 21);
  return b;
}

const upload = (fileName: string, bytes: Buffer) => ({ fileName, data: bytes.toString('base64') });
const pelau = async (api: Api) => (await documents<Caterer>(api, 'caterers')).find((c) => c.id === 'cat-001')!;
const served = async (api: Api, file: string) => (await fetch(`${api.url}/media/${file}`)).status;

describe('photo lifecycle (manage-photos, degrade-gracefully and suspend-reinstate-remove designs)', () => {
  it('Given a photo still processing, when anyone views the caterer page or listing, then only ready photos appear (L2-041, L2-091.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const order = (await pelau(api)).photos.map((p) => p.id);
    api.env.images.available = false;
    const added = await kendra.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));
    await kendra.put('/api/caterer/profile/photos/order', { photoIds: [added.body.id, ...order] });
    const waiting = (await pelau(api)).photos[0];
    assert.equal(waiting.processing, true);

    const page = (await api.client().get('/api/public/caterers/pelau-house')).body;
    assert.equal(page.photos.length, 6);
    assert.ok(page.photos.every((p: { src: string }) => !p.src.includes(waiting.file)));
    const card = (await api.client().get('/api/public/caterers?area=scarborough')).body.items.find((c: { slug: string }) => c.slug === 'pelau-house');
    assert.ok(!card.cover.src.includes(waiting.file), 'the listing cover is the first ready photo');
  });

  it('Given the image service comes back, when the scheduled processing runs, then waiting photos publish without the caterer doing anything (L2-091.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    api.env.images.available = false;
    await kendra.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));
    api.env.images.available = true;
    await processWaitingPhotos(api.env);
    const photo = (await pelau(api)).photos[6];
    assert.equal(photo.processing, undefined);
    assert.equal(await served(api, photo.file), 200);
    assert.equal((await api.client().get('/api/public/caterers/pelau-house')).body.photos.length, 7);
  });

  it('Given the image service is down, when a published photo is replaced, then the old image stays on the page until the new one is ready (L2-042.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const added = await kendra.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));
    const before = (await pelau(api)).photos[6].file;
    api.env.images.available = false;
    const res = await kendra.post(`/api/caterer/profile/photos/${added.body.id}/replacement`, upload('IMG_2.png', png(1800, 1200)));
    assert.equal(res.status, 200);
    assert.equal(res.body.state, 'Processing');
    assert.equal((await pelau(api)).photos[6].file, before);
    assert.equal(await served(api, before), 200, 'the old image is still served');

    api.env.images.available = true;
    await processWaitingPhotos(api.env);
    const after = (await pelau(api)).photos[6];
    assert.notEqual(after.file, before);
    assert.equal(after.fileName, 'IMG_2.png');
    assert.equal(await served(api, after.file), 200);
    assert.equal(await served(api, before), 404, 'the old image is gone once the new one is ready');
  });

  it('Given a file the scanner flags, when it is uploaded, then nothing is stored, the caterer is told, and the event is logged (L2-041.6)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const res = await kendra.post('/api/caterer/profile/photos', upload('IMG_9.png', Buffer.concat([png(1600, 1200), Buffer.from(EICAR)])));
    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { file: ['This file can’t be used, so nothing was saved'] });
    assert.equal((await pelau(api)).photos.length, 6);
    const logged = (await documents(api, 'securityEvents')).filter((e) => e.type === 'upload-rejected');
    assert.equal(logged.length, 1);
    assert.equal(logged[0].userId, 'user-kendra');
  });

  it('Given a flagged certificate copy, when it is uploaded, then it is refused and logged (provide-food-handler-certificate design)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const pdf = Buffer.concat([Buffer.from('%PDF-1.7\n'), Buffer.from(EICAR)]);
    const res = await kendra.post('/api/caterer/profile/certificate/file', upload('cert.pdf', pdf));
    assert.equal(res.status, 400);
    assert.equal((await documents(api, 'securityEvents')).filter((e) => e.type === 'upload-rejected').length, 1);
  });

  it('Given a WebP under 800 pixels, or one whose size cannot be read, when it is uploaded, then it is refused (L2-041.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    assert.equal((await kendra.post('/api/caterer/profile/photos', upload('small.webp', webp(600, 400)))).status, 400);
    const unreadable = Buffer.concat([Buffer.from('RIFF'), Buffer.alloc(4), Buffer.from('WEBPVP8 ')]);
    assert.equal((await kendra.post('/api/caterer/profile/photos', upload('odd.webp', unreadable))).status, 400);
    assert.equal((await kendra.post('/api/caterer/profile/photos', upload('big.webp', webp(1600, 1200)))).status, 201);
  });

  it('Given a caterer removes an uploaded photo, when its address is requested, then it is no longer served; Undo brings it back', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const added = await kendra.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));
    const file = (await pelau(api)).photos[6].file;
    await kendra.delete(`/api/caterer/profile/photos/${added.body.id}`);
    assert.equal(await served(api, file), 404);
    await kendra.post(`/api/caterer/profile/photos/${added.body.id}/restoration`);
    assert.equal(await served(api, file), 200);
  });

  it('Given an operator removes a photo, or removes the caterer, when its photos are requested, then they are no longer served, and photos are cached for at most 60 s (L2-058.4, L2-057)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const leah = await signedInClient(api, LEAH);
    const first = await kendra.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));
    await kendra.post('/api/caterer/profile/photos', upload('IMG_2.png', png(1600, 1200)));
    const [a, b] = (await pelau(api)).photos.slice(6).map((p) => p.file);
    const cache = (await fetch(`${api.url}/media/${a}`)).headers.get('cache-control') ?? '';
    assert.ok(Number(/max-age=(\d+)/.exec(cache)?.[1]) <= 60, cache);

    assert.equal((await leah.delete(`/api/operator/profiles/cat-001/photos/${first.body.id}`, )).status, 400, 'a reason is required');
    await leah.request('DELETE', `/api/operator/profiles/cat-001/photos/${first.body.id}`, { reason: 'Shows a phone number' });
    assert.equal(await served(api, a), 404);
    assert.equal(await served(api, b), 200);

    assert.equal((await leah.post('/api/operator/profiles/cat-001/remove', { reason: 'Closed for good after repeated food safety reports.', confirm: 'Pelau House' })).status, 200);
    assert.equal(await served(api, b), 404);
  });
});
