import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { documents, signedInClient, startApi } from '../support/api.ts';

const LEAH = 'leah@sweethand.example';
const TOMAS = 'tomas@sweethand.example';
const WHAT = 'A caterer’s export link was forwarded to a family member before it expired.';

const valid = {
  date: '2026-10-09',
  what: WHAT,
  information: ['Names', 'Email addresses', 'Event details', 'Messages'],
  people: '1',
  risk: 'low',
  riskNotes: 'The link expired after 7 days.',
  decision: 'not',
};

describe('breach register (L2-075.2)', () => {
  it('Given the register, when any operator reads it, then the records come newest first with every field', async () => {
    const api = await startApi();
    const tomas = await signedInClient(api, TOMAS);

    const res = await tomas.get('/api/operator/breaches');

    assert.equal(res.status, 200);
    assert.deepEqual(res.body.map((b: { title: string }) => b.title), ['Enquiry email sent to the wrong caterer', 'Team laptop stolen from a car']);
    assert.deepEqual(res.body[0], {
      id: 'br-2026-01',
      title: 'Enquiry email sent to the wrong caterer',
      confirmedOn: '2026-09-17',
      recordedAt: '2026-09-17T20:00:00.000Z',
      recordedBy: 'Leah Mohammed',
      information: 'A customer’s display name and event details (date, guests, area). No email or phone.',
      peopleAffected: 1,
      riskAssessment: 'Low. The other caterer confirmed they deleted the email the same day.',
      notificationDecision: 'Not reported to the Privacy Commissioner: no real risk of significant harm. The customer was told on Fri 18 Sep.',
    });
    assert.equal(res.body[1].peopleAffected, 0);
  });

  it('Given a confirmed breach, when an operator records it, then the record holds the date, description, data and people affected, risk and decision, and is audited', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/breaches', { ...valid, information: [...valid.information, 'Passwords'] });

    assert.equal(res.status, 201);
    assert.deepEqual({ ...res.body, id: undefined }, {
      id: undefined,
      title: WHAT,
      confirmedOn: '2026-10-09',
      recordedAt: '2026-10-10T14:00:00.000Z',
      recordedBy: 'Leah Mohammed',
      information: 'Names, email addresses, event details and messages.',
      peopleAffected: 1,
      riskAssessment: 'Low. The link expired after 7 days.',
      notificationDecision: 'Not reportable: no real risk of significant harm.',
    });
    const list = await leah.get('/api/operator/breaches');
    assert.equal(list.body.length, 3);
    assert.equal(list.body[0].id, res.body.id);
    const entry = (await documents(api, 'audit')).find((e) => e.action === 'RecordBreach');
    assert.equal(entry.operatorId, 'user-leah');
    assert.equal(entry.targetType, 'breach');
    assert.equal(entry.targetId, res.body.id);
    assert.equal(entry.after, WHAT);
  });

  it('Given a real risk reported to the Commissioner, when it is recorded, then the risk and decision read that way and a repeated risk label is not doubled', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/breaches', { ...valid, information: [], risk: 'real', riskNotes: 'Real risk of significant harm: phone numbers exposed.', decision: 'report' });

    assert.equal(res.status, 201);
    assert.equal(res.body.information, 'None identified.');
    assert.equal(res.body.riskAssessment, 'Real risk of significant harm. phone numbers exposed.');
    assert.equal(res.body.notificationDecision, 'Reported to the Privacy Commissioner; the people affected are being notified.');
  });

  it('Given missing or malformed entries, when the record is saved, then each is refused by field and nothing is stored (L2-068.3)', async () => {
    const api = await startApi();
    const leah = await signedInClient(api, LEAH);

    const res = await leah.post('/api/operator/breaches', { date: '2026-10-09', what: ' ', people: 'about 40', risk: 'low', decision: null });
    const future = await leah.post('/api/operator/breaches', { ...valid, date: '2026-10-11' });
    const blank = await leah.post('/api/operator/breaches', {});

    assert.equal(res.status, 400);
    assert.deepEqual(res.body.errors, {
      what: ['Describe what happened'],
      people: ['Enter the number of people affected as a whole number'],
      decision: ['Choose a notification decision'],
    });
    assert.deepEqual(future.body.errors, { date: ['The date can’t be in the future'] });
    assert.deepEqual(Object.keys(blank.body.errors), ['date', 'what', 'people', 'risk', 'decision']);
    assert.equal(blank.body.errors.risk[0], 'Choose the risk of significant harm');
    assert.equal(blank.body.errors.date[0], 'Enter the date the breach was confirmed');
    assert.equal((await documents(api, 'breaches')).length, 2);
  });
});
