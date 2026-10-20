/** The template fields a `launch-confirm` outbox email carries (queueConfirmation, senderFooter). */
export interface ConfirmationEmailFields {
  link: string;
  removalLink: string;
  mailingAddress: string;
  contactEmail: string;
  askedOn: string;
}

/** `--font-family-sans` with its system fallbacks; no web font is loaded (ADR 0015). */
const FONT = "Figtree,'Instrument Sans','Avenir Next',Avenir,'Segoe UI Variable Display','Segoe UI',system-ui,-apple-system,Roboto,'Helvetica Neue',Arial,sans-serif";

/**
 * Fixed values read from the design tokens by role, because mail clients do
 * not support CSS custom properties (docs/design-system/patterns/notifications.html#email).
 * Light is the inline baseline; the dark block overrides it where supported.
 */
const STYLE = `<style>
  @media (max-width: 600px) {
    .sh-outer { padding: 16px 8px !important; }
    .sh-card { padding: 24px !important; }
  }
  @media (prefers-color-scheme: dark) {
    .sh-bg { background: #1a1917 !important; }
    .sh-card { background: #141312 !important; border-color: #2e2b28 !important; }
    .sh-text { color: #efece7 !important; }
    .sh-muted { color: #b8b2a8 !important; }
    .sh-subtle { color: #9a948a !important; }
    .sh-link { color: #efece7 !important; }
    .sh-btn { background: #efece7 !important; color: #141312 !important; }
  }
</style>`;

const ENTITIES: Record<string, string> = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Every dynamic value goes through this, in text and attributes, so it is shown as text (L2-122.6, L2-104.7). */
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (c) => ENTITIES[c]!);
}

/**
 * The confirmation email (L2-099.1, L2-122): an HTML part in the Sweet Hand
 * design and a plain-text part with the same facts, rendered at send time from
 * the outbox fields. The markup follows the mock in
 * docs/mocks/notifications/launch-confirm-email/; keep the two in step.
 */
export function confirmationEmail(fields: ConfirmationEmailFields): { subject: string; plainText: string; html: string } {
  const { link, removalLink, mailingAddress, contactEmail, askedOn } = fields;
  const subject = 'Confirm your Sweet Hand launch email';
  const why = 'You asked Sweet Hand to email you when the platform opens. Confirm this address and we’ll send you one email on launch day.';
  const ignore = 'If you didn’t ask for this, ignore this email and nothing happens.';
  const plainText = `${why}\n\nConfirm your email within 48 hours: ${link}\n\n${ignore}\n\nYou asked for this email on ${askedOn}.\nSweet Hand\n${mailingAddress}\n${contactEmail}\nRemove your email: ${removalLink}`;
  // The confirmation link is always on the site URL, so the logo is too.
  const logo = escapeHtml(new URL('/img/sweet-hand-email-logo.png', link).href);
  const [href, remove, address, contact, asked] = [link, removalLink, mailingAddress, contactEmail, askedOn].map(escapeHtml);
  const html = `<!doctype html>
<html lang="en-CA">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="color-scheme" content="light dark">
<meta name="supported-color-schemes" content="light dark">
<title>${subject}</title>
${STYLE}
</head>
<body class="sh-bg" style="margin:0;padding:0;background:#f7f5f2;">
<table role="presentation" class="sh-bg" width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f7f5f2;">
  <tr>
    <td class="sh-outer" align="center" style="padding:32px 16px;">
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;">
        <tr>
          <td class="sh-card" style="background:#ffffff;border:1px solid #e2ded7;border-radius:20px;padding:32px;font-family:${FONT};">
            <img src="${logo}" width="240" height="64" alt="Sweet Hand" style="display:block;width:240px;max-width:100%;height:auto;border:0;margin:0 0 24px;">
            <h1 class="sh-text" style="margin:0 0 16px;font-size:24px;line-height:1.3;font-weight:700;letter-spacing:-0.02em;color:#141312;">Confirm your email</h1>
            <p class="sh-muted" style="margin:0 0 24px;font-size:16px;line-height:1.5;color:#4d4b48;">${why}</p>
            <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
              <tr>
                <td class="sh-btn" style="border-radius:9999px;background:#141312;">
                  <a class="sh-btn" href="${href}" style="display:inline-block;padding:16px 28px;border-radius:9999px;background:#141312;color:#ffffff;font-size:16px;line-height:1.25;font-weight:600;text-decoration:none;">Confirm my email</a>
                </td>
              </tr>
            </table>
            <p class="sh-muted" style="margin:0 0 24px;font-size:14px;line-height:1.5;color:#4d4b48;">Or copy this link into your browser:<br><a class="sh-link" href="${href}" style="color:#141312;text-decoration:underline;word-break:break-all;">${href}</a></p>
            <p class="sh-muted" style="margin:0;font-size:16px;line-height:1.5;color:#4d4b48;">The link expires in 48 hours. ${ignore}</p>
          </td>
        </tr>
        <tr>
          <td class="sh-subtle" style="padding:24px 8px 0;font-family:${FONT};font-size:14px;line-height:1.5;color:#6b6863;">
            <p style="margin:0 0 8px;">You asked for this email on ${asked}.</p>
            <p style="margin:0 0 8px;">Sweet Hand<br>${address}<br><a class="sh-link" href="mailto:${contact}" style="color:#141312;text-decoration:underline;">${contact}</a></p>
            <p style="margin:0;"><a class="sh-link" href="${remove}" style="color:#141312;text-decoration:underline;">Remove your email</a> from the launch list.</p>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>
</body>
</html>
`;
  return { subject, plainText, html };
}
