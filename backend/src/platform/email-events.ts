/**
 * Verifies that a delivery report came from the email provider. The provider
 * and its webhook authentication are still `<TO SUPPLY>`: until one is chosen
 * the stand-in accepts `local:email-events:<nonce>` tokens, like the bot
 * challenge stand-in (ADR 0009).
 */
export function validEmailEventsToken(token: unknown): boolean {
  return typeof token === 'string' && token.startsWith('local:email-events:') && token.length <= 200;
}
