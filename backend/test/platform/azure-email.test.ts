// Acceptance Test
// Traces to: L2-099, L2-100, L2-101, L2-108
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
