/** The pages the launch site prerenders: the launch page and the privacy notice (L2-103.4). */
export const LAUNCH_PAGES = ['', 'privacy'] as const;

export const isPrivacyPath = (pathname: string): boolean => /^\/privacy\/?$/.test(pathname);
