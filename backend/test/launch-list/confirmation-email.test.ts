// Acceptance Test
// Traces to: L2-122
// Description: The confirmation email's HTML part follows the design system and the mock, and loads nothing remote but the logo.
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { confirmationEmail } from '../../src/launch-list/confirmation-email.ts';

const fields = {
  link: 'https://sweethand.ca/?confirmed=abc',
  removalLink: 'https://sweethand.ca/api/launch-list/unsubscribe?token=def',
  mailingAddress: 'Sweet Hand, 100 Example Street, Toronto ON M5V 0A1',
  contactEmail: 'hello@sweethand.ca',
  askedOn: 'October 10, 2026',
};

describe('Branded confirmation email (L2-122)', () => {
  it('Given the confirmation fields, when the HTML part is composed, then it is an en-CA document with a real heading and presentation tables (L2-122.5)', () => {
    const { html } = confirmationEmail(fields);
    assert.match(html, /^<!doctype html>/i);
    assert.match(html, /<html lang="en-CA">/);
    assert.match(html, /<h1[^>]*>Confirm your email<\/h1>/);
    const tables = html.match(/<table\b[^>]*>/g) ?? [];
    assert.ok(tables.length >= 2);
    for (const table of tables) assert.match(table, /role="presentation"/);
  });

  it('Given the HTML part, when its images are listed, then the only one is the logo from the site URL with alt "Sweet Hand" (L2-122.2)', () => {
    const { html } = confirmationEmail(fields);
    const images = html.match(/<img\b[^>]*>/g) ?? [];
    assert.equal(images.length, 1);
    assert.match(images[0]!, /src="https:\/\/sweethand\.ca\/img\/sweet-hand-email-logo\.png"/);
    assert.match(images[0]!, /alt="Sweet Hand"/);
  });

  it('Given the HTML part, when it is inspected, then it loads no stylesheet, script, web font or other remote resource (L2-122.2)', () => {
    const { html } = confirmationEmail(fields);
    assert.doesNotMatch(html, /<link\b/i);
    assert.doesNotMatch(html, /<script\b/i);
    assert.doesNotMatch(html, /@import|@font-face|url\(/i);
    assert.doesNotMatch(html, /var\(--/);
    const remote = [...html.matchAll(/\b(?:src|background)=["']([^"']+)["']/g)].map((m) => m[1]);
    assert.deepEqual(remote, ['https://sweethand.ca/img/sweet-hand-email-logo.png']);
  });

  it('Given the HTML part, when it is inspected, then it uses the design system values inline with the sans stack and its system fallbacks (L2-122.2)', () => {
    const { html } = confirmationEmail(fields);
    assert.match(html, /font-family:Figtree,[^;"]*system-ui[^;"]*sans-serif/);
    assert.match(html, /background:#ffffff/); // --color-bg-surface
    assert.match(html, /background:#f7f5f2/); // --color-bg-surface-sunken
    assert.match(html, /color:#141312/); // --color-fg-default
    assert.match(html, /color:#4d4b48/); // --color-fg-muted
  });

  it('Given the HTML part, when the confirmation link is shown, then it is a button and also written out as visible text (L2-122.3)', () => {
    const { html } = confirmationEmail(fields);
    assert.match(html, /<a class="sh-btn" href="https:\/\/sweethand\.ca\/\?confirmed=abc"[^>]*>Confirm my email<\/a>/);
    assert.match(html, /<a [^>]*href="https:\/\/sweethand\.ca\/\?confirmed=abc"[^>]*>https:\/\/sweethand\.ca\/\?confirmed=abc<\/a>/);
  });

  it('Given the HTML part, when it is shown on a phone or in dark mode, then a 600px rule and a dark-mode block apply with light as the inline baseline (L2-122.4)', () => {
    const { html } = confirmationEmail(fields);
    assert.match(html, /<meta name="color-scheme" content="light dark">/);
    assert.match(html, /@media \(max-width: 600px\)/);
    assert.match(html, /@media \(prefers-color-scheme: dark\)\s*\{[^}]*\.sh-bg \{ background: #1a1917 !important; \}/);
    assert.match(html, /max-width:600px/);
  });
});
