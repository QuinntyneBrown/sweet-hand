import { EmailClient, type EmailMessage } from '@azure/communication-email';
import { DefaultAzureCredential } from '@azure/identity';
import { PermanentFailure, type EmailGateway } from './email-dispatch.ts';
import type { OutboxEmail } from './outbox.ts';

export interface AzureEmailClient {
  beginSend(message: EmailMessage): Promise<{ pollUntilDone(): Promise<{ status: string; error?: { message?: string } }> }>;
}

function required(email: OutboxEmail, field: string): string {
  const value = email[field];
  if (typeof value !== 'string' || !value) throw new PermanentFailure(`Email ${email.kind} has no ${field}`);
  return value;
}

function launchContent(email: OutboxEmail): { subject: string; plainText: string } {
  const address = required(email, 'mailingAddress');
  const contact = required(email, 'contactEmail');
  const askedOn = required(email, 'askedOn');
  const remove = required(email, 'removalLink');
  const footer = `\n\nYou asked for this email on ${askedOn}.\nSweet Hand\n${address}\n${contact}\nRemove your email: ${remove}`;
  switch (email.kind) {
    case 'launch-confirm':
      return { subject: 'Confirm your Sweet Hand launch email', plainText: `Confirm your email within 48 hours: ${required(email, 'link')}\n\nIf you did not ask for this, nothing happens.${footer}` };
    case 'launch-already-listed':
      return { subject: 'You’re already on the Sweet Hand launch list', plainText: `You’re already confirmed. Sweet Hand will send one email when the platform opens.${footer}` };
    case 'launch-day-caterer':
      return { subject: 'Sweet Hand is open', plainText: `Sweet Hand is open. Create your caterer profile and have your food handler certificate ready: ${required(email, 'link')}${footer}` };
    case 'launch-day-customer':
      return { subject: 'Sweet Hand is open', plainText: `Sweet Hand is open. Browse Caribbean caterers in Toronto and the GTA: ${required(email, 'link')}${footer}` };
    default:
      throw new PermanentFailure(`Unsupported production email kind: ${email.kind}`);
  }
}

export class AzureCommunicationEmailGateway implements EmailGateway {
  constructor(private readonly client: AzureEmailClient, private readonly senderAddress: string) {}

  async send(email: OutboxEmail): Promise<void> {
    const content = launchContent(email);
    const message: EmailMessage = {
      senderAddress: this.senderAddress,
      recipients: { to: [{ address: email.to, displayName: undefined }] },
      content,
      headers: email.headers as Record<string, string> | undefined,
    };
    try {
      const poller = await this.client.beginSend(message);
      const result = await poller.pollUntilDone();
      if (result.status !== 'Succeeded') throw new Error(result.error?.message ?? `Azure email ended with ${result.status}`);
    } catch (error) {
      const status = (error as { statusCode?: number }).statusCode;
      if (status && status >= 400 && status < 500 && status !== 408 && status !== 429) throw new PermanentFailure('Azure rejected the email');
      throw error;
    }
  }
}

export function azureEmailGateway(endpoint: string, senderAddress: string): EmailGateway {
  return new AzureCommunicationEmailGateway(new EmailClient(endpoint, new DefaultAzureCredential()), senderAddress);
}
