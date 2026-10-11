/**
 * Where the site lives and how to reach the team, from the build's `define`
 * configuration (L2-093.4). The defaults in `angular.json` are fictional
 * placeholders; a deployment overrides them.
 */
export const launchSiteConfig = {
  siteUrl: LAUNCH_SITE_URL,
  contactEmail: LAUNCH_CONTACT_EMAIL,
  privacyPath: '/privacy',
} as const;
