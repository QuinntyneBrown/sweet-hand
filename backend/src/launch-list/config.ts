/**
 * Sender details every launch list email carries (L2-101.4) and the site its
 * links point to. They come from configuration, never source code (L2-093.4);
 * the defaults are fictional placeholders for local development and tests.
 */
export interface LaunchListConfig {
  /** The public HTTPS origin of the site, for links in emails and `List-Unsubscribe`. */
  siteUrl: string;
  contactEmail: string;
  mailingAddress: string;
}

export function launchListConfig(): LaunchListConfig {
  return {
    siteUrl: (process.env['SITE_URL'] ?? 'https://sweethand.example').replace(/\/$/, ''),
    contactEmail: process.env['CONTACT_EMAIL'] ?? 'hello@sweethand.example',
    mailingAddress: process.env['OPERATOR_MAILING_ADDRESS'] ?? 'Sweet Hand, 100 Example Street, Toronto ON M5V 0A1',
  };
}
