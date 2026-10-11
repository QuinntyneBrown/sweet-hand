import { type Role } from '@sweet-hand/api';

const segment = (value: string | number) => encodeURIComponent(String(value));

/**
 * Every address in the app, in one place. Pages link and navigate through
 * these instead of typing paths; templates read them through a `paths` field.
 * The `routes.ts` files hold the matching route paths.
 */
export const paths = {
  caterers: '/caterers',
  caterer: (slug: string) => `/caterers/${segment(slug)}`,
  occasions: '/occasions',
  about: '/about',
  privacy: '/privacy',
  terms: '/terms',

  signIn: '/sign-in',
  signInVerify: '/sign-in/verify',
  register: '/register',
  join: '/join',
  forgotPassword: '/forgot-password',
  privacyAccept: '/privacy/accept',
  verifyEmail: '/verify-email',
  verifyEmailSent: '/verify-email/sent',

  account: '/account',
  inbox: '/inbox',
  inboxThread: (id: string) => `/inbox/${segment(id)}`,

  dashboard: {
    overview: '/dashboard',
    enquiries: '/dashboard/enquiries',
    enquiry: (id: string) => `/dashboard/enquiries/${segment(id)}`,
    reviews: '/dashboard/reviews',
    details: '/dashboard/profile/details',
    cuisines: '/dashboard/profile/cuisines',
    events: '/dashboard/profile/events',
    photos: '/dashboard/profile/photos',
    menu: '/dashboard/profile/menu',
    foodSafety: '/dashboard/profile/food-safety',
  },

  admin: {
    queue: '/admin/queue',
    review: (id: string) => `/admin/review/${segment(id)}`,
    caterers: '/admin/caterers',
    caterer: (id: string) => `/admin/caterers/${segment(id)}`,
    report: (id: string) => `/admin/reports/${segment(id)}`,
    reviews: '/admin/reviews',
    changes: '/admin/changes',
    metrics: '/admin/metrics',
    audit: '/admin/audit',
    cuisines: '/admin/cuisines',
    operators: '/admin/operators',
    breaches: '/admin/breaches',
  },

  system: {
    forbidden: '/403',
    notFound: '/404',
    rateLimited: '/429',
    maintenance: '/maintenance',
  },
} as const;

/** Where a role starts after signing in (L2-056). */
export function landingFor(role: Role): string {
  return role === 'Caterer' ? paths.dashboard.overview : role === 'Operator' ? paths.admin.queue : paths.inbox;
}

/** Where the wordmark leads: the role's own area, or the listing for customers and visitors. */
export function homeFor(role: Role | null | undefined): string {
  return role === 'Caterer' || role === 'Operator' ? landingFor(role) : paths.caterers;
}

/** The slug of a caterer page address such as `/caterers/pelau-house?enquiry=resume`, or null. */
export function catererSlugOf(url: string): string | null {
  const match = new RegExp(`^${paths.caterers}/([^/?#]+)(?:[?#]|$)`).exec(url);
  return match ? decodeURIComponent(match[1]) : null;
}
