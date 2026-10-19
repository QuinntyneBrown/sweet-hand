import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { testEnvironment } from '../../src/environment.ts';
import { queueEmail, type OutboxEmail } from '../../src/platform/outbox.ts';
import { PermanentFailure, dispatchDueEmails, type EmailGateway } from '../../src/platform/email-dispatch.ts';
import { AzureCommunicationEmailGateway } from '../../src/platform/azure-email.ts';

const HOUR = 60 * 60_000;

async function emails(env: Awaited<ReturnType<typeof testEnvironment>>): Promise<OutboxEmail[]> {
  return env.db.transaction((tx) => tx.collection<OutboxEmail>('outbox').all());
}

describe('email delivery (L2-030)', () => {
  it('Given a queued email and a working provider, when the worker runs, then it is sent once and its link is no longer stored', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) => queueEmail(tx, env.clock.now(), { to: 'marcia.t@example.com', kind: 'password-reset', link: '/reset-password/abc' }));
    const sent: OutboxEmail[] = [];
    const gateway: EmailGateway = { send: async (email) => void sent.push(email) };

    await dispatchDueEmails(env, gateway);
    await dispatchDueEmails(env, gateway);

    assert.deepEqual(sent.map((e) => [e.to, e.kind, e.link]), [['marcia.t@example.com', 'password-reset', '/reset-password/abc']]);
    const [stored] = await emails(env);
    assert.equal(stored.status, 'sent');
    assert.equal(stored.link, undefined);
  });

  it('Given the provider is down, when the worker runs, then the email waits and is retried with growing delays', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) => queueEmail(tx, env.clock.now(), { to: 'andre.c@example.com', kind: 'new-enquiry' }));
    let attempts = 0;
    let up = false;
    const gateway: EmailGateway = {
      send: async () => {
        attempts++;
        if (!up) throw new Error('provider unavailable');
      },
    };
    await dispatchDueEmails(env, gateway);
    assert.equal(attempts, 1);
    const [first] = await emails(env);
    assert.equal(first.status, 'queued');
    assert.equal(first.attempts, 1);
    await dispatchDueEmails(env, gateway);
    assert.equal(attempts, 1, 'not retried before its next attempt time');

    env.clock.advance(Date.parse(first.nextAttemptAt as string) - env.clock.now().getTime());
    await dispatchDueEmails(env, gateway);
    const [second] = await emails(env);
    assert.equal(attempts, 2);
    assert.ok(Date.parse(second.nextAttemptAt as string) - env.clock.now().getTime() > Date.parse(first.nextAttemptAt as string) - Date.parse(first.at));

    up = true;
    env.clock.advance(Date.parse(second.nextAttemptAt as string) - env.clock.now().getTime());
    await dispatchDueEmails(env, gateway);
    assert.equal((await emails(env))[0].status, 'sent');
  });

  it('Given an email that keeps failing for 24 hours, when the worker runs, then it is marked Failed and an operator alert is raised', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) => queueEmail(tx, env.clock.now(), { to: 'nadia.j@example.com', kind: 'new-message' }));
    const alerts: string[] = [];
    const gateway: EmailGateway = { send: async () => Promise.reject(new Error('down')) };
    for (let i = 0; i < 40 && (await emails(env))[0].status === 'queued'; i++) {
      await dispatchDueEmails(env, gateway, (message) => alerts.push(message));
      env.clock.advance(HOUR);
    }
    const [stored] = await emails(env);
    assert.equal(stored.status, 'failed');
    assert.ok(env.clock.now().getTime() - Date.parse(stored.at) >= 24 * HOUR);
    assert.equal(alerts.length, 1);
  });
});

describe('launch list email delivery (L2-101.5)', () => {
  it('Given a sent email with removal links, when it is sent, then the removal link and headers are no longer stored', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) =>
      queueEmail(tx, env.clock.now(), { to: 'marcia.t@example.com', kind: 'launch-confirm', link: '/?confirmed=a', removalLink: '/u?token=b', headers: { 'List-Unsubscribe': '<https://x/u?token=b>' } }),
    );
    await dispatchDueEmails(env, { send: async () => undefined });
    const [stored] = await emails(env);
    assert.equal(stored.status, 'sent');
    assert.equal(stored.removalLink, undefined);
    assert.equal(stored.headers, undefined);
  });

  it('Given a hard bounce, when the provider rejects the address, then the email fails at once and is not retried', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) => queueEmail(tx, env.clock.now(), { to: 'gone@example.com', kind: 'launch-day-customer' }));
    let attempts = 0;
    const gateway: EmailGateway = {
      send: async () => {
        attempts++;
        throw new PermanentFailure('hard bounce');
      },
    };
    await dispatchDueEmails(env, gateway);
    env.clock.advance(2 * HOUR);
    await dispatchDueEmails(env, gateway);
    assert.equal(attempts, 1);
    assert.equal((await emails(env))[0].status, 'failed');
  });

  it('Given more due emails than the provider allows per tick, when the worker runs, then it sends at most that many', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction(async (tx) => {
      for (let i = 0; i < 5; i++) await queueEmail(tx, env.clock.now(), { to: `p${i}@example.com`, kind: 'launch-day-customer' });
    });
    const sent: string[] = [];
    const gateway: EmailGateway = { send: async (e) => void sent.push(e.to) };
    assert.equal(await dispatchDueEmails(env, gateway, undefined, { maxPerTick: 2 }), 2);
    assert.equal(await dispatchDueEmails(env, gateway, undefined, { maxPerTick: 2 }), 2);
    assert.equal(await dispatchDueEmails(env, gateway, undefined, { maxPerTick: 2 }), 1);
    assert.equal(new Set(sent).size, 5);
  });

  it('Given two overlapping workers, when both claim the same due email, then the provider receives it once', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) => queueEmail(tx, env.clock.now(), { to: 'marcia.t@example.com', kind: 'launch-day-customer', link: 'https://sweethand.ca/caterers', mailingAddress: '309–2091 Hurontario Street, Mississauga, Ontario L5A 4E6', contactEmail: 'hello@sweethand.ca', askedOn: 'October 11, 2026', removalLink: 'https://sweethand.ca/u' }));
    let sends = 0;
    const gateway: EmailGateway = { send: async () => { sends++; await Promise.resolve(); } };

    await Promise.all([dispatchDueEmails(env, gateway), dispatchDueEmails(env, gateway)]);

    assert.equal(sends, 1);
  });
});

describe('branded confirmation email storage (L2-122.7)', () => {
  it('Given a launch confirmation sent through the Azure gateway, when it has been sent, then the provider got the HTML and the outbox keeps no HTML, link, removal link or headers', async () => {
    const env = await testEnvironment({ seed: false });
    await env.db.transaction((tx) =>
      queueEmail(tx, env.clock.now(), {
        to: 'marcia.t@example.com', kind: 'launch-confirm', link: 'https://sweethand.ca/?confirmed=a', removalLink: 'https://sweethand.ca/api/launch-list/unsubscribe?token=b',
        mailingAddress: 'Sweet Hand, 100 Example Street, Toronto ON M5V 0A1', contactEmail: 'hello@sweethand.ca', askedOn: 'October 10, 2026',
        headers: { 'List-Unsubscribe': '<https://sweethand.ca/api/launch-list/unsubscribe?token=b>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
      }),
    );
    const sent: { content: { html?: string } }[] = [];
    const gateway = new AzureCommunicationEmailGateway(
      { beginSend: async (message) => { sent.push(message as never); return { pollUntilDone: async () => ({ status: 'Succeeded' }) }; } },
      'hello@sweethand.ca',
    );

    await dispatchDueEmails(env, gateway);

    assert.match(sent[0]!.content.html ?? '', /Confirm my email/);
    const [stored] = await emails(env);
    assert.equal(stored.status, 'sent');
    for (const field of ['html', 'link', 'removalLink', 'headers']) assert.equal(stored[field], undefined, field);
    assert.doesNotMatch(JSON.stringify(stored), /confirmed=a|token=b|<html/);
  });
});
