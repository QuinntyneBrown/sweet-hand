import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi, type Api } from '../support/api.ts';
import { caterers, type Caterer } from '../../src/caterers/model.ts';
import { CAST_NOW } from '../../src/platform/clock.ts';

const KENDRA = 'kendra@pelauhouse.example';
const PELAU = 'cat-001';

async function pelau(api: Api): Promise<Caterer> {
  return (await documents<Caterer>(api, 'caterers')).find((c) => c.id === PELAU)!;
}

/** Given: Pelau House in another status. */
async function setStatus(api: Api, status: Caterer['status']): Promise<void> {
  await api.env.db.transaction(async (tx) => {
    const c = (await caterers(tx).get(PELAU))!;
    await caterers(tx).put({ ...c, status });
  });
}

const edits = async (api: Api) => (await documents(api, 'profileEdits')).filter((e) => e.catererId === PELAU && e.at >= CAST_NOW).sort((a, b) => a.seq - b.seq);

const LONG = 'Pelau, curry goat and macaroni pie for weddings and big family Sundays across the east end.';

describe('profile sections: details (set-up-profile, edit-published-profile designs)', () => {
  it('Given a draft, when the caterer saves the details, then the name and description are stored as typed, trimmed (L2-038.1)', async () => {
    const api = await startApi();
    await setStatus(api, 'Draft');
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/details', { name: '  Pelau House Kitchen ', description: ' Short for now. ' });

    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'Pelau House Kitchen');
    assert.equal(res.body.description, 'Short for now.');
    const c = await pelau(api);
    assert.equal(c.name, 'Pelau House Kitchen');
    assert.equal(c.pendingName, undefined);
    assert.deepEqual(await edits(api), [], 'drafts are not in the recent-changes feed');
  });

  it('Given a name of 1 character and a description over 2,000, when saved, then both are refused and nothing changes', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const before = await pelau(api);

    const res = await kendra.put('/api/caterer/profile/sections/details', { name: 'P', description: 'x'.repeat(2001) });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { name: ['Enter a business name of 2 to 80 characters'], description: ['Write no more than 2,000 characters'] });
    assert.equal((await pelau(api)).description, before.description);
  });

  it('Given a published profile, when the description is shorter than 50 characters, then it is refused', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House', description: 'Pelau.' });

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, { description: ['Write at least 50 characters'] });
  });

  it('Given a published profile, when the description changes, then it goes live and the recent-changes feed records the old and new text (L2-044.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const before = await pelau(api);

    const res = await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House', description: LONG });

    assert.equal(res.status, 200);
    assert.equal((await pelau(api)).description, LONG);
    const [edit, ...more] = await edits(api);
    assert.deepEqual(more, []);
    assert.equal(edit.field, 'description');
    assert.equal(edit.by, 'user-kendra');
    assert.equal(edit.at, api.env.clock.now().toISOString());
    assert.deepEqual(edit.old, { kind: 'text', text: before.description });
    assert.deepEqual(edit.new, { kind: 'text', text: LONG });
  });

  it('Given a published profile, when the details are saved unchanged, then nothing is added to the feed', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const before = await pelau(api);

    await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House', description: before.description });

    assert.deepEqual(await edits(api), []);
  });

  it('Given a published profile, when the business name changes, then the old name stays live and the new one waits for review (L2-044.2)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const before = await pelau(api);

    const res = await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House by Kendra', description: before.description });

    assert.equal(res.status, 200);
    assert.equal(res.body.name, 'Pelau House');
    assert.deepEqual(res.body.pendingName, { name: 'Pelau House by Kendra', requestedAt: api.env.clock.now().toISOString() });
    const c = await pelau(api);
    assert.equal(c.name, 'Pelau House');
    assert.equal(c.slug, 'pelau-house');
    assert.equal(c.pendingName, 'Pelau House by Kendra');
    assert.equal(c.pendingNameAt, api.env.clock.now().toISOString());
  });

  it('Given a pending name change, when the same name is saved again later, then the request keeps its time; when the current name is saved, then the request is withdrawn', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const { description } = await pelau(api);
    await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House by Kendra', description });
    const askedAt = api.env.clock.now().toISOString();
    api.env.clock.advance(60_000);

    await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House by Kendra', description });
    assert.equal((await pelau(api)).pendingNameAt, askedAt);

    await kendra.put('/api/caterer/profile/sections/details', { name: 'Pelau House', description });
    const c = await pelau(api);
    assert.equal(c.pendingName, undefined);
    assert.equal(c.pendingNameAt, undefined);
  });

  it('Given a suspended profile, when any section is saved, then the answer is 409 and nothing changes (L2-044.4)', async () => {
    const api = await startApi();
    await setStatus(api, 'Suspended');
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/details', { name: 'Flying Fish', description: 'x'.repeat(60) });

    assert.equal(res.status, 409);
    assert.equal((await pelau(api)).name, 'Pelau House');
  });

  it('Given a profile in review, when a section is saved, then the answer is 409 (L2-039.4)', async () => {
    const api = await startApi();
    await setStatus(api, 'Pending review');
    const kendra = await signedInClient(api, KENDRA);

    assert.equal((await kendra.put('/api/caterer/profile/sections/events', { minGuests: 10, maxGuests: 20, occasions: ['weddings'] })).status, 409);
  });

  it('Given an unknown section, when it is saved, then it is not found', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    assert.equal((await kendra.put('/api/caterer/profile/sections/prices', {})).status, 404);
  });
});

describe('profile sections: cuisines and areas (L2-007, L2-010)', () => {
  it('Given cuisines and areas with a primary, when saved, then the primary comes first and duplicates go', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/cuisines', {
      cuisines: ['guyanese', 'trinidadian-and-tobagonian', 'guyanese'],
      primaryCuisine: 'guyanese',
      areas: ['scarborough', 'ajax'],
      primaryArea: 'ajax',
    });

    assert.equal(res.status, 200);
    const c = await pelau(api);
    assert.deepEqual(c.cuisines, ['guyanese', 'trinidadian-and-tobagonian']);
    assert.deepEqual(c.areas, ['ajax', 'scarborough']);
    assert.equal(res.body.primaryArea, 'ajax');
  });

  it('Given no cuisine, six cuisines, or a primary that is not chosen, when saved, then each is refused with its message', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const save = (body: object) => kendra.put('/api/caterer/profile/sections/cuisines', body);

    assert.deepEqual((await save({ cuisines: [], areas: [] })).body.errors, { cuisines: ['Choose between 1 and 5 cuisines'], areas: ['Choose at least one area you serve'] });
    const six = ['jamaican', 'guyanese', 'haitian', 'grenadian', 'vincentian', 'bahamian'];
    assert.deepEqual((await save({ cuisines: six, primaryCuisine: 'jamaican', areas: ['ajax'], primaryArea: 'ajax' })).body.errors, { cuisines: ['Choose between 1 and 5 cuisines'] });
    assert.deepEqual((await save({ cuisines: ['jamaican'], primaryCuisine: 'haitian', areas: ['ajax'], primaryArea: 'york' })).body.errors, {
      primaryCuisine: ['Mark one cuisine as primary'],
      primaryArea: ['Choose your primary area'],
    });
  });

  it('Given a cuisine or area off the list, when saved, then it is a bad request and nothing is stored', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/cuisines', { cuisines: ['martian'], primaryCuisine: 'martian', areas: ['ajax'], primaryArea: 'ajax' });

    assert.equal(res.status, 400);
    assert.equal(res.body.title, 'Unknown cuisine or area');
    assert.deepEqual((await pelau(api)).cuisines, ['trinidadian-and-tobagonian', 'guyanese']);
  });

  it('Given a published profile, when the areas change, then the feed records the old and new areas by name (L2-044.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.put('/api/caterer/profile/sections/cuisines', {
      cuisines: ['trinidadian-and-tobagonian', 'guyanese'],
      primaryCuisine: 'trinidadian-and-tobagonian',
      areas: ['scarborough', 'ajax'],
      primaryArea: 'scarborough',
    });

    const [edit, ...more] = await edits(api);
    assert.deepEqual(more, [], 'unchanged cuisines add nothing');
    assert.equal(edit.field, 'areas');
    assert.deepEqual(edit.old, { kind: 'list', items: ['Scarborough', 'East York', 'North York', 'Pickering', 'Ajax'] });
    assert.deepEqual(edit.new, { kind: 'list', items: ['Scarborough', 'Ajax'] });
  });
});

describe('profile sections: guests and occasions (L2-020, L2-021)', () => {
  it('Given guests and occasions, when saved, then they are stored, occasions in list order', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/events', { minGuests: '25', maxGuests: 250, occasions: ['family-gatherings', 'weddings'] });

    assert.equal(res.status, 200);
    const c = await pelau(api);
    assert.equal(c.minGuests, 25);
    assert.equal(c.maxGuests, 250);
    assert.deepEqual(c.occasions, ['weddings', 'family-gatherings']);
  });

  it('Given guests that are not whole numbers from 1 to 5,000, or a minimum above the maximum, or no occasion, when saved, then each is refused', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);
    const save = (body: object) => kendra.put('/api/caterer/profile/sections/events', body);

    assert.deepEqual((await save({ minGuests: '2.5', maxGuests: '5001', occasions: [] })).body.errors, {
      minGuests: ['Enter a whole number from 1 to 5,000'],
      maxGuests: ['Enter a whole number from 1 to 5,000'],
      occasions: ['Choose at least one occasion'],
    });
    assert.deepEqual((await save({ minGuests: '300', maxGuests: '20', occasions: ['weddings'] })).body.errors, { minGuests: ['Minimum guests can’t be more than maximum guests'] });
  });

  it('Given an occasion off the fixed list, when saved, then it is a bad request and nothing is stored (L2-021.3)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    const res = await kendra.put('/api/caterer/profile/sections/events', { minGuests: '20', maxGuests: '300', occasions: ['weddings', 'bar-crawls'] });

    assert.equal(res.status, 400);
    assert.ok(!(await pelau(api)).occasions.includes('bar-crawls'));
  });

  it('Given a published profile, when the guest range and occasions change, then the feed records both (L2-044.1)', async () => {
    const api = await startApi();
    const kendra = await signedInClient(api, KENDRA);

    await kendra.put('/api/caterer/profile/sections/events', { minGuests: 20, maxGuests: 350, occasions: ['weddings', 'birthdays'] });

    const list = await edits(api);
    assert.deepEqual(
      list.map((e) => [e.field, e.old, e.new]),
      [
        ['guests', { kind: 'guests', min: 20, max: 300 }, { kind: 'guests', min: 20, max: 350 }],
        [
          'occasions',
          { kind: 'list', items: ['Weddings', 'Birthdays', 'Family gatherings', 'Corporate events', 'Religious and cultural celebrations'] },
          { kind: 'list', items: ['Weddings', 'Birthdays'] },
        ],
      ],
    );
  });
});
