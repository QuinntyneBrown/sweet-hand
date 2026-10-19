/** The template fields a `launch-confirm` outbox email carries (queueConfirmation, senderFooter). */
export interface ConfirmationEmailFields {
  link: string;
  removalLink: string;
  mailingAddress: string;
  contactEmail: string;
  askedOn: string;
}

/**
 * The confirmation email (L2-099.1, L2-122): an HTML part and a plain-text
 * part with the same facts, rendered at send time from the outbox fields.
 */
export function confirmationEmail(fields: ConfirmationEmailFields): { subject: string; plainText: string; html: string } {
  const { link, removalLink, mailingAddress, contactEmail, askedOn } = fields;
  const why = 'You asked Sweet Hand to email you when the platform opens. Confirm this address and we’ll send you one email on launch day.';
  const ignore = 'If you didn’t ask for this, ignore this email and nothing happens.';
  const plainText = `${why}\n\nConfirm your email within 48 hours: ${link}\n\n${ignore}\n\nYou asked for this email on ${askedOn}.\nSweet Hand\n${mailingAddress}\n${contactEmail}\nRemove your email: ${removalLink}`;
  const html = `<p>${why}</p><p><a href="${link}">${link}</a></p><p>The link expires in 48 hours. ${ignore}</p><p>You asked for this email on ${askedOn}.</p><p>Sweet Hand<br>${mailingAddress}<br>${contactEmail}</p><p><a href="${removalLink}">Remove your email</a> from the launch list.</p>`;
  return { subject: 'Confirm your Sweet Hand launch email', plainText, html };
}
