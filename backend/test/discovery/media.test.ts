import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { startApi } from '../support/api.ts';

describe('media (L2-006)', async () => {
  const api = await startApi();

  it('Given a seeded photo, when it is requested, then the image is served with a long cache lifetime', async () => {
    const res = await fetch(`${api.url}/media/pelau-house.jpg?w=800&fm=jpeg`);
    assert.equal(res.status, 200);
    assert.equal(res.headers.get('content-type'), 'image/jpeg');
    assert.match(res.headers.get('cache-control') ?? '', /public, max-age=\d+/);
    const bytes = Buffer.from(await res.arrayBuffer());
    assert.deepEqual([...bytes.subarray(0, 3)], [0xff, 0xd8, 0xff]);
  });

  it('Given a file that does not exist, or a path that tries to leave the media store, when it is requested, then it is not found', async () => {
    assert.equal((await fetch(`${api.url}/media/missing-photo.jpg`)).status, 404);
    assert.equal((await fetch(`${api.url}/media/..%2F..%2Fpackage.json`)).status, 404);
  });
});
