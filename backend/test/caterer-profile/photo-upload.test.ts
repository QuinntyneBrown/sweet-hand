import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { caterers, type Caterer } from '../../src/caterers/model.ts';
import { CAST_NOW } from '../../src/platform/clock.ts';

const KENDRA = 'kendra@pelauhouse.example';
const PHOTO_SIZE = 'Photos must be under 15 MB and at least 800 pixels on the shorter side';
const PHOTO_TYPE = 'This file isn’t a JPEG, PNG, WebP or HEIC photo, so nothing was saved';

/** A PNG whose header gives its size (the server reads the size from the content, L2-041.2). */
function png(width: number, height: number): Buffer {
  const b = Buffer.alloc(33);
  Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a]).copy(b, 0);
  b.writeUInt32BE(13, 8);
  b.write('IHDR', 12, 'latin1');
  b.writeUInt32BE(width, 16);
  b.writeUInt32BE(height, 20);
  return b;
}

/** A JPEG with a start-of-frame marker giving its size. */
function jpeg(width: number, height: number): Buffer {
  const sof = Buffer.from([0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 0xff, width >> 8, width & 0xff, 0x03, 0, 0, 0, 0, 0, 0, 0, 0, 0]);
  return Buffer.concat([Buffer.from([0xff, 0xd8]), sof]);
}

const upload = (fileName: string, bytes: Buffer) => ({ fileName, data: bytes.toString('base64') });
const pelau = async (api: Api) => (await documents<Caterer>(api, 'caterers')).find((c) => c.id === 'cat-001')!;
const media = (api: Api, file: string) => fetch(`${api.url}/media/${file}`);

describe('photo upload (manage-photos design, L2-041)', () => {
  it('Given a PNG of 1600 × 1200, when Kendra uploads it, then it is added last without a caption, and its image is served (L2-041.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const bytes = png(1600, 1200);

    const res = await kendra.post('/api/caterer/profile/photos', upload('IMG_2076.png', bytes));

    assert.equal(res.status, 201);
    assert.equal(res.body.caption, '');
    assert.equal(res.body.fileName, 'IMG_2076.png');
    assert.equal(res.body.state, 'Ready');
    const stored = (await pelau(api)).photos;
    assert.equal(stored.length, 7);
    const photo = stored[6];
    assert.equal(photo.id, res.body.id);
    assert.equal(res.body.image.src, `/media/${photo.file}?w=400&fm=jpeg`);
    const served = await media(api, photo.file);
    assert.equal(served.status, 200);
    assert.equal(served.headers.get('content-type'), 'image/png');
    assert.deepEqual(Buffer.from(await served.arrayBuffer()), bytes);
  });

  it('Given a photo under 800 pixels on the shorter side, or over 15 MB, when uploaded, then it is refused with the size message and nothing is stored (L2-041.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const small = await kendra.post('/api/caterer/profile/photos', upload('IMG_2041.jpg', jpeg(600, 400)));
    const big = await kendra.post('/api/caterer/profile/photos', upload('IMG_2090.png', Buffer.concat([png(4000, 3000), Buffer.alloc(15 * 1024 * 1024)])));

    assert.equal(small.status, 400);
    assert.deepEqual(small.body.errors, { file: [PHOTO_SIZE] });
    assert.equal(big.status, 400);
    assert.deepEqual(big.body.errors, { file: [PHOTO_SIZE] });
    assert.equal((await pelau(api)).photos.length, 6);
  });

  it('Given a file named .jpg whose content is not an image, or a PDF, when uploaded, then it is refused and nothing is stored (L2-041.3)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const text = await kendra.post('/api/caterer/profile/photos', upload('menu-scan.jpg', Buffer.from('Menu: pelau, curry goat, macaroni pie')));
    const pdf = await kendra.post('/api/caterer/profile/photos', upload('menu.jpg', Buffer.from('%PDF-1.7\n')));
    const garbled = await kendra.post('/api/caterer/profile/photos', { fileName: 'x.jpg' });

    for (const res of [text, pdf, garbled]) {
      assert.equal(res.status, 400);
      assert.deepEqual(res.body.errors, { file: [PHOTO_TYPE] });
    }
    assert.equal((await pelau(api)).photos.length, 6);
  });

  it('Given a caterer with 30 photos, when they upload another, then it is refused (L2-042.5)', async () => {
    const api = await startApi();
    const vishnu = await signedInClient(api, 'vishnu@maracasbay.example');

    const res = await vishnu.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));

    assert.equal(res.status, 409);
    assert.equal(res.body.title, 'You can have up to 30 photos');
  });

  it('Given image processing is down, when a photo is uploaded, then it is kept as Processing, not served, and appears once processing is back (L2-091.2, L2-041.5)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    api.env.images.available = false;

    const res = await kendra.post('/api/caterer/profile/photos', upload('IMG_2077.png', png(1600, 1200)));

    assert.equal(res.status, 201);
    assert.equal(res.body.state, 'Processing');
    assert.equal(res.body.image, null);
    const photo = (await pelau(api)).photos[6];
    assert.equal(photo.processing, true);
    assert.equal((await media(api, photo.file)).status, 404, 'the unprocessed upload is not public');
    assert.equal((await kendra.get('/api/caterer/profile')).body.photos[6].state, 'Processing');

    api.env.images.available = true;
    const profile = await kendra.get('/api/caterer/profile');

    assert.equal(profile.body.photos[6].state, 'Ready');
    assert.equal((await pelau(api)).photos[6].processing, undefined);
    assert.equal((await media(api, photo.file)).status, 200);
  });

  it('Given an uploaded photo, when it is replaced, then the new image takes its place and caption and the old image is no longer served (L2-042.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const added = await kendra.post('/api/caterer/profile/photos', upload('IMG_1.png', png(1600, 1200)));
    await api.env.db.transaction(async (tx) => {
      const c = (await caterers(tx).get('cat-001'))!;
      c.photos[6].caption = 'Doubles in wax paper';
      await caterers(tx).put(c);
    });
    const before = (await pelau(api)).photos[6];

    const res = await kendra.post(`/api/caterer/profile/photos/${added.body.id}/replacement`, upload('IMG_3001.png', png(1200, 1600)));

    assert.equal(res.status, 200);
    assert.equal(res.body.id, added.body.id);
    assert.equal(res.body.caption, 'Doubles in wax paper');
    assert.equal(res.body.fileName, 'IMG_3001.png');
    const after = (await pelau(api)).photos[6];
    assert.notEqual(after.file, before.file);
    assert.equal((await media(api, before.file)).status, 404);
    assert.equal((await media(api, after.file)).status, 200);
  });

  it('Given a replacement that is not an image, when sent, then it is refused and the photo is unchanged', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.post('/api/caterer/profile/photos/pelau-house-photo-2/replacement', upload('x.jpg', Buffer.from('nope')));

    assert.equal(res.status, 400);
    assert.equal((await pelau(api)).photos[1].file, 'maracas-bay.jpg');
  });

  it('Given another caterer’s photo, when Kendra replaces it, then it is not found (L2-079.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    assert.equal((await kendra.post('/api/caterer/profile/photos/black-cake-co-photo-1/replacement', upload('a.png', png(1600, 1200)))).status, 404);
  });

  it('Given a published profile, when the cover photo is replaced, then the recent-changes feed records the old and new cover (L2-044.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.post('/api/caterer/profile/photos/pelau-house-photo-1/replacement', upload('IMG_9.png', png(1600, 1200)));

    const cover = (await pelau(api)).photos[0];
    const [edit] = (await documents(api, 'profileEdits')).filter((e) => e.catererId === 'cat-001' && e.at >= CAST_NOW);
    assert.equal(edit.field, 'cover-photo');
    assert.deepEqual(edit.old, { kind: 'photo', src: '/media/pelau-house.jpg?w=400&fm=jpeg', alt: 'Chicken pelau in a steel pot with lime and cucumber chutney' });
    assert.deepEqual(edit.new, { kind: 'photo', src: `/media/${cover.file}?w=400&fm=jpeg`, alt: 'Chicken pelau in a steel pot with lime and cucumber chutney' });
  });
});
