import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { advanceClock, documents, outbox, startApi } from '../support/api.ts';
import { sendLaunchEmail } from '../../src/launch-list/send-launch-email.ts';
import { sweepLaunchList } from '../../src/launch-list/sweep.ts';
import { confirmed, HOUR, kendra, marcia, signUp } from './support.ts';

const launchMail = async (api: Awaited<ReturnType<typeof startApi>>) => (await outbox(api)).filter((m) => m.kind.startsWith('launch-day-'));

describe('the launch-day email (L2-101)', () => {
  it('Given confirmed and pending entries, when the command runs, then each confirmed address gets one role-specific email and pending ones get nothing (L2-101.1, L2-101.3, L2-099.6)', async () => {
    const api = await startApi();
    await confirmed(api);
    await confirmed(api, kendra);
    await signUp(api, { ...marcia, email: 'pending@example.com' });
    assert.deepEqual(await sendLaunchEmail(api.env), { queued: 2, alreadyQueued: 0 });
    const mails = await launchMail(api);
    assert.deepEqual(mails.map((m) => [m.to, m.kind]).sort(), [
      [kendra.email, 'launch-day-caterer'],
      [marcia.email, 'launch-day-customer'],
    ]);
    const customer = mails.find((m) => m.kind === 'launch-day-customer')!;
    const caterer = mails.find((m) => m.kind === 'launch-day-caterer')!;
    assert.match(String(customer.link), /\/caterers$/);
    assert.match(String(caterer.link), /\/join$/);
    assert.equal(caterer.mentionsFoodHandlerCertificate, true);
    for (const m of mails) {
      assert.equal(m.senderName, 'Sweet Hand');
      assert.ok(m.mailingAddress && m.contactEmail && m.askedOn, 'CASL identification (L2-101.4)');
      assert.match(String(m.removalLink), /\/api\/launch-list\/unsubscribe\?token=/);
    }
  });

  it('Given the command already ran, when it runs again, then nobody gets a second email (L2-101.2)', async () => {
    const api = await startApi();
    await confirmed(api);
    await sendLaunchEmail(api.env);
    assert.deepEqual(await sendLaunchEmail(api.env), { queued: 0, alreadyQueued: 1 });
    assert.equal((await launchMail(api)).length, 1);
  });

  it('Given launch day, when a sign-up arrives, then it is refused with 410 and nothing is stored, and the status reports closed (L2-102.1)', async () => {
    const api = await startApi();
    await sendLaunchEmail(api.env);
    const res = await api.client().post('/api/launch-list/sign-ups', marcia);
    assert.equal(res.status, 410);
    assert.equal((await documents(api, 'launchList')).length, 0);
    assert.deepEqual((await api.client().get('/api/public/launch-list')).body, { open: false });
  });

  it('Given launch day, when a confirmation link is used, then nothing is confirmed (L2-102.4)', async () => {
    const api = await startApi();
    const { confirm } = await signUp(api);
    await sendLaunchEmail(api.env);
    assert.equal((await api.client().post('/api/launch-list/confirmations', { token: confirm })).status, 410);
    assert.equal((await documents(api, 'launchList'))[0].status, 'Pending');
  });

  it('Given the product is live and the list remains, when a removal link is used, then the entry is still deleted; once the list is gone the reply names nobody (L2-102.3)', async () => {
    const api = await startApi();
    const token = await confirmed(api);
    await sendLaunchEmail(api.env);
    assert.deepEqual((await api.client().post('/api/launch-list/removals', { token })).body, { email: marcia.email });
    assert.deepEqual((await api.client().post('/api/launch-list/removals', { token })).body, {});
  });

  it('Given launch day was 30 days ago, when the sweep runs, then every launch list record and launch email is deleted (L2-101.6)', async () => {
    const api = await startApi();
    await confirmed(api);
    await confirmed(api, kendra);
    await sendLaunchEmail(api.env);
    advanceClock(api, 29 * 24 * HOUR);
    await sweepLaunchList(api.env);
    assert.equal((await documents(api, 'launchList')).length, 2);
    advanceClock(api, 24 * HOUR);
    assert.equal(await sweepLaunchList(api.env), 2);
    assert.equal((await documents(api, 'launchList')).length, 0);
    assert.equal((await documents(api, 'launchListTokens')).length, 0);
    assert.equal((await outbox(api)).filter((m) => m.kind.startsWith('launch-')).length, 0);
    assert.equal((await api.client().post('/api/launch-list/sign-ups', marcia)).status, 410, 'sign-ups stay closed');
  });
});
