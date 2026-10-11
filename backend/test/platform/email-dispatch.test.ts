import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { testEnvironment } from '../../src/environment.ts';
import { queueEmail, type OutboxEmail } from '../../src/platform/outbox.ts';
import { dispatchDueEmails, type EmailGateway } from '../../src/platform/email-dispatch.ts';

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
