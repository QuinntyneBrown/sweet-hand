import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { signedInClient, startApi } from '../support/api.ts';

const MARCIA = 'marcia.t@example.com';
const KENDRA = 'kendra@pelauhouse.example';

describe('enquiry inbox (L2-031, L2-029)', () => {
  it('Given Marcia’s enquiries, when she opens her inbox, then every one she is part of is listed newest activity first with the other party and status (L2-031)', async () => {
    const api = await startApi();
    const marcia = await signedInClient(api, MARCIA);
    const res = await marcia.get('/api/enquiries');
    assert.equal(res.status, 200);
    assert.deepEqual(
      res.body.items.map((r: any) => [r.otherParty.name, r.status, r.lastActivityAt]),
      [
        ['Pelau House', 'Replied', '2026-10-10T13:42:00.000Z'],
        ['Sugar Dumplin', 'Open', '2026-10-08T23:32:00.000Z'],
        ['Demerara Kitchen', 'Declined', '2026-10-06T15:20:00.000Z'],
        ['Ti Kay', 'Closed', '2026-09-05T12:00:00.000Z'],
      ],
    );
    const pelau = res.body.items[0];
    assert.match(pelau.id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
    assert.deepEqual(pelau.otherParty, { kind: 'caterer', name: 'Pelau House', slug: 'pelau-house', photo: '/media/pelau-house.jpg?w=400&fm=jpeg' });
    assert.deepEqual([pelau.eventDate, pelau.guests, pelau.occasion, pelau.unread], ['2026-11-21', 120, 'Family gatherings', true]);
    assert.deepEqual(res.body.counts, { all: 4, open: 1, replied: 1, declined: 1, closed: 1 });
    assert.deepEqual([res.body.total, res.body.page, res.body.pageSize, res.body.pageCount, res.body.unread], [4, 1, 20, 1, 1]);
  });

  it('Given Kendra’s enquiries, when she opens hers, then customers show by name and initials, and a deleted account as a former user (L2-031, L2-072.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const res = await kendra.get('/api/enquiries');
    const priya = res.body.items.find((r: any) => r.otherParty.name === 'Priya Ramdial');
    assert.deepEqual(priya.otherParty, { kind: 'customer', name: 'Priya Ramdial', firstName: 'Priya', initials: 'PR' });
    assert.equal(priya.unread, true);
    assert.equal(priya.occasion, 'Corporate events');
    assert.deepEqual(res.body.items.at(-1).otherParty, { kind: 'former' });
    const names = res.body.items.map((r: any) => r.otherParty.name ?? 'former');
    assert.deepEqual(names.slice(0, 3), ['Marcia Thompson', 'Priya Ramdial', 'Andre Clarke']);
    assert.equal(res.body.unread, 2);
  });

  it('Given a status filter, when the inbox is asked for it, then only that status is listed while the counts still cover every status (L2-031.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const res = await kendra.get('/api/enquiries?status=open');
    assert.deepEqual(res.body.items.map((r: any) => r.otherParty.name), ['Priya Ramdial', 'Andre Clarke']);
    assert.equal(res.body.total, 2);
    assert.equal(res.body.counts.open, 2);
    assert.ok(res.body.counts.all > 2);

    const unknown = await kendra.get('/api/enquiries?status=everything&page=99');
    assert.equal(unknown.status, 200);
    assert.equal(unknown.body.total, unknown.body.counts.all);
    assert.equal(unknown.body.page, 1);
  });

  it('Given an operator, when they ask for an inbox, then it is refused (L2-034)', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, 'tomas@sweethand.example');
    assert.equal((await tomas.get('/api/enquiries')).status, 403);
    assert.equal((await api.client().get('/api/enquiries')).status, 401);
  });

  it('Given unread threads, when the session is read, then it reports how many threads have something unread (L2-029.1)', async () => {
    const api = await startApi();
    assert.equal((await (await signedInClient(api, KENDRA)).get('/api/session')).body.unread, 2);
    assert.equal((await (await signedInClient(api, MARCIA)).get('/api/session')).body.unread, 1);
    assert.equal((await (await signedInClient(api, 'devon.w@example.com')).get('/api/session')).body.unread, 0);
  });
});
