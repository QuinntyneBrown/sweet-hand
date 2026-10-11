// Acceptance Test
// Traces to: L2-104, L2-108
// Description: Production verifies Turnstile tokens and never accepts local development tokens.
import assert from 'node:assert/strict';
import { test } from 'node:test';
import { LocalChallengeVerifier, TurnstileChallengeVerifier } from '../../src/platform/bot-challenge.ts';

test('the local verifier accepts only the requested local action', async () => {
  const verifier = new LocalChallengeVerifier();
  assert.equal(await verifier.verify('local:launch-sign-up:nonce', 'launch-sign-up'), true);
  assert.equal(await verifier.verify('local:sign-in:nonce', 'launch-sign-up'), false);
  assert.equal(await verifier.verify('forged', 'launch-sign-up'), false);
});

test('Turnstile accepts only a successful response for the action and production hostname', async () => {
  const calls: Array<{ url: string; body: string }> = [];
  const fetcher: typeof fetch = async (input, init) => {
    calls.push({ url: String(input), body: String(init?.body) });
    return new Response(JSON.stringify({ success: true, action: 'launch-sign-up', hostname: 'sweethand.ca' }), { status: 200 });
  };
  const verifier = new TurnstileChallengeVerifier('secret', ['sweethand.ca', 'www.sweethand.ca'], fetcher);

  assert.equal(await verifier.verify('provider-token', 'launch-sign-up'), true);
  assert.equal(calls[0]?.url, 'https://challenges.cloudflare.com/turnstile/v0/siteverify');
  assert.match(calls[0]?.body ?? '', /secret=secret/);
  assert.match(calls[0]?.body ?? '', /response=provider-token/);
});

test('Turnstile rejects provider errors, wrong actions, wrong hosts and local tokens', async () => {
  for (const response of [
    { success: false, action: 'launch-sign-up', hostname: 'sweethand.ca' },
    { success: true, action: 'sign-in', hostname: 'sweethand.ca' },
    { success: true, action: 'launch-sign-up', hostname: 'attacker.example' },
  ]) {
    const verifier = new TurnstileChallengeVerifier('secret', ['sweethand.ca'], async () => new Response(JSON.stringify(response)));
    assert.equal(await verifier.verify('provider-token', 'launch-sign-up'), false);
  }
  const production = new TurnstileChallengeVerifier('secret', ['sweethand.ca'], async () => {
    throw new Error('local tokens must not reach Cloudflare');
  });
  assert.equal(await production.verify('local:launch-sign-up:nonce', 'launch-sign-up'), false);
});

test('Turnstile fails closed when the provider cannot be reached', async () => {
  const verifier = new TurnstileChallengeVerifier('secret', ['sweethand.ca'], async () => {
    throw new Error('network unavailable');
  });
  assert.equal(await verifier.verify('provider-token', 'launch-sign-up'), false);
});
