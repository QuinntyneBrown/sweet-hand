// Acceptance Test
// Traces to: L2-099, L2-100, L2-101, L2-108, L2-122
// Description: Azure email preserves sender identity, CASL footer and one-click unsubscribe headers.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { AzureCommunicationEmailGateway, type AzureEmailClient } from '../../src/platform/azure-email.ts';
import type { OutboxEmail } from '../../src/platform/outbox.ts';

test('the Azure gateway composes a launch confirmation with required sender details', async () => {
  const messages: unknown[] = [];
  const client: AzureEmailClient = {
    beginSend: async (message) => {
      messages.push(message);
      return { pollUntilDone: async () => ({ status: 'Succeeded' }) };
    },
  };
  const gateway = new AzureCommunicationEmailGateway(client, 'hello@sweethand.ca');
  const email = {
    id: 'mail-1', to: 'marcia.t@example.com', kind: 'launch-confirm', at: '2026-10-11T12:00:00Z', seq: 1, status: 'queued',
    link: 'https://sweethand.ca/?confirmed=abc', removalLink: 'https://sweethand.ca/api/launch-list/unsubscribe?token=def',
    mailingAddress: '309–2091 Hurontario Street, Mississauga, Ontario L5A 4E6', contactEmail: 'hello@sweethand.ca', askedOn: 'October 11, 2026',
    headers: { 'List-Unsubscribe': '<https://sweethand.ca/api/launch-list/unsubscribe?token=def>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  } satisfies OutboxEmail;

  await gateway.send(email);

  const message = messages[0] as any;
  assert.equal(message.senderAddress, 'hello@sweethand.ca');
  assert.deepEqual(message.recipients.to, [{ address: 'marcia.t@example.com', displayName: undefined }]);
  assert.match(message.content.subject, /Confirm/);
  assert.match(message.content.plainText, /309–2091 Hurontario Street/);
  assert.match(message.content.plainText, /nothing happens/i);
  assert.deepEqual(message.headers, email.headers);
});

test('Given a launch confirmation, when the Azure gateway sends it, then it has an HTML part and a plain-text part with the same facts (L2-122.1)', async () => {
  const messages: any[] = [];
  const client: AzureEmailClient = {
    beginSend: async (message) => {
      messages.push(message);
      return { pollUntilDone: async () => ({ status: 'Succeeded' }) };
    },
  };
  const email = {
    id: 'mail-2', to: 'marcia.t@example.com', kind: 'launch-confirm', at: '2026-10-11T12:00:00Z', seq: 1, status: 'queued',
    link: 'https://sweethand.ca/?confirmed=abc', removalLink: 'https://sweethand.ca/api/launch-list/unsubscribe?token=def',
    mailingAddress: '309–2091 Hurontario Street, Mississauga, Ontario L5A 4E6', contactEmail: 'hello@sweethand.ca', askedOn: 'October 11, 2026',
    headers: { 'List-Unsubscribe': '<https://sweethand.ca/api/launch-list/unsubscribe?token=def>', 'List-Unsubscribe-Post': 'List-Unsubscribe=One-Click' },
  } satisfies OutboxEmail;

  await new AzureCommunicationEmailGateway(client, 'hello@sweethand.ca').send(email);

  const { content, headers } = messages[0];
  for (const part of [content.html, content.plainText]) {
    assert.equal(typeof part, 'string');
    assert.match(part, /https:\/\/sweethand\.ca\/\?confirmed=abc/);
    assert.match(part, /48 hours/);
    assert.match(part, /nothing happens/i);
    assert.match(part, /You asked for this email on October 11, 2026\./);
    assert.match(part, /309–2091 Hurontario Street/);
    assert.match(part, /hello@sweethand\.ca/);
    assert.match(part, /https:\/\/sweethand\.ca\/api\/launch-list\/unsubscribe\?token=def/);
  }
  assert.deepEqual(headers, email.headers);
});
