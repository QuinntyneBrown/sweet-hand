# Detailed designs

Sweet Hand detailed designs, one folder per vertically sliced feature, grouped by subsystem. Each feature `README.md` holds an Overview, a Description, the level-2 (L2) requirements it realizes from `docs/specs/L2.md`, and rendered C4, class and sequence diagrams.

Technology choices follow the ADRs in `docs/adr/`: Angular 21 on the front end (ADR 0001); NestJS on Node.js, PostgreSQL through Drizzle ORM and S3-compatible object storage on the back end (ADR 0006); backend tests against in-memory repositories (ADR 0007). The code in `backend/` differs from these designs on data access: it persists JSON document collections in PostgreSQL, keeps files in PostgreSQL and has no separate worker yet (ADR 0008, reconciliation open). Hosting, CI, secret store, CDN and third-party providers remain `<TO SUPPLY>`. Diagram sources are the `.puml` files in each `diagrams/` folder, rendered to sibling `.png` files.

## discovery

Public browsing: the caterer listing, filters, postal-code search, caterer pages and the photo gallery.

| Feature | L2 requirements |
|---------|-----------------|
| [Browse the caterer listing](discovery/browse-listing/README.md) | `L2-001`, `L2-002`, `L2-003`, `L2-004`, `L2-005`, `L2-006`, `L2-013` |
| [Filter the listing by area](discovery/filter-by-area/README.md) | `L2-009`, `L2-010`, `L2-011` |
| [Filter the listing by cuisine](discovery/filter-by-cuisine/README.md) | `L2-007`, `L2-008`, `L2-009` |
| [Manage the cuisine list](discovery/manage-cuisine-list/README.md) | `L2-007` |
| [Search the listing by postal code](discovery/search-by-postal-code/README.md) | `L2-012` |
| [View a caterer page](discovery/view-caterer-page/README.md) | `L2-013`, `L2-014`, `L2-015`, `L2-017`, `L2-018`, `L2-019`, `L2-020`, `L2-021` |
| [View the photo gallery](discovery/view-photo-gallery/README.md) | `L2-016`, `L2-019` |

## enquiries

Event enquiries from customers to caterers: sending, abuse limits, notifications, inbox, threads, status lifecycle and contact sharing.

| Feature | L2 requirements |
|---------|-----------------|
| [Browse the inbox](enquiries/browse-inbox/README.md) | `L2-031`, `L2-036` |
| [Decline or close an enquiry](enquiries/decline-or-close-enquiry/README.md) | `L2-028`, `L2-033` |
| [Limit enquiry abuse](enquiries/limit-enquiry-abuse/README.md) | `L2-025`, `L2-082` |
| [Notify enquiry activity](enquiries/notify-enquiry-activity/README.md) | `L2-027`, `L2-028`, `L2-030` |
| [Reply in a thread](enquiries/reply-in-thread/README.md) | `L2-032`, `L2-034` |
| [Send an enquiry](enquiries/send-enquiry/README.md) | `L2-022`, `L2-023`, `L2-024`, `L2-026` |
| [Share contact details](enquiries/share-contact-details/README.md) | `L2-035` |
| [Show unread indicators](enquiries/show-unread-indicators/README.md) | `L2-029` |

## caterer-profiles

Caterer registration and self-service profile management: setup, submission, food handler certificate, photos, menu and published edits.

| Feature | L2 requirements |
|---------|-----------------|
| [Edit a published profile](caterer-profiles/edit-published-profile/README.md) | `L2-018`, `L2-044` |
| [Manage the menu](caterer-profiles/manage-menu/README.md) | `L2-017`, `L2-043` |
| [Manage photos](caterer-profiles/manage-photos/README.md) | `L2-041`, `L2-042`, `L2-091` |
| [Provide a food handler certificate](caterer-profiles/provide-food-handler-certificate/README.md) | `L2-040` |
| [Register a caterer](caterer-profiles/register-caterer/README.md) | `L2-037` |
| [Set up a caterer profile](caterer-profiles/set-up-profile/README.md) | `L2-007`, `L2-010`, `L2-020`, `L2-021`, `L2-038`, `L2-045` |
| [Submit a profile for review](caterer-profiles/submit-profile-for-review/README.md) | `L2-039`, `L2-046` |

## moderation

Operator work: review queue, approval decisions, operator edits, suspension and removal, reports, review moderation, operator accounts and the audit log.

| Feature | L2 requirements |
|---------|-----------------|
| [Decide profile approval](moderation/decide-profile-approval/README.md) | `L2-046`, `L2-048` |
| [Edit a caterer profile as an operator](moderation/edit-profile-as-operator/README.md) | `L2-057` |
| [Handle reports](moderation/handle-reports/README.md) | `L2-034`, `L2-055` |
| [Manage operator accounts](moderation/manage-operator-accounts/README.md) | `L2-056` |
| [Moderate reviews](moderation/moderate-reviews/README.md) | `L2-059` |
| [Query the audit log](moderation/query-audit-log/README.md) | `L2-060` |
| [Report a listing or review](moderation/report-content/README.md) | `L2-054` |
| [Suspend, reinstate or remove a profile](moderation/suspend-reinstate-remove-profile/README.md) | `L2-018`, `L2-046`, `L2-058` |
| [Work the review queue](moderation/work-review-queue/README.md) | `L2-047` |

## directory

The operators' internal directory of places and events (operators only, never public): places, the places map, events with repeats and skipped dates, and the events calendar.

| Feature | L2 requirements |
|---------|-----------------|
| [Manage places](directory/manage-places/README.md) | `L2-110`, `L2-111`, `L2-112`, `L2-113`, `L2-114` |
| [View the places map](directory/view-places-map/README.md) | `L2-115` |
| [Manage events](directory/manage-events/README.md) | `L2-110`, `L2-116`, `L2-117`, `L2-118`, `L2-119`, `L2-120` |
| [View the events calendar](directory/view-events-calendar/README.md) | `L2-121` |

## reviews

Customer reviews of caterers: eligibility, writing, display, caterer responses, editing and deletion.

| Feature | L2 requirements |
|---------|-----------------|
| [Edit or delete a review](reviews/edit-or-delete-review/README.md) | `L2-053` |
| [Respond to a review](reviews/respond-to-review/README.md) | `L2-052` |
| [Show reviews on the caterer page](reviews/show-reviews/README.md) | `L2-051` |
| [Write a review](reviews/write-review/README.md) | `L2-049`, `L2-050` |

## metrics

Privacy-preserving visit counting, the operator metrics dashboard and CSV export.

| Feature | L2 requirements |
|---------|-----------------|
| [Count visits](metrics/count-visits/README.md) | `L2-062` |
| [Export metrics as CSV](metrics/export-metrics/README.md) | `L2-063` |
| [View the metrics dashboard](metrics/view-metrics-dashboard/README.md) | `L2-061` |

## privacy

PIPEDA obligations: consent and privacy notice, cookies, data export, account deletion, retention, data location and breach records.

| Feature | L2 requirements |
|---------|-----------------|
| [Consent to the privacy notice](privacy/consent-to-privacy-notice/README.md) | `L2-070`, `L2-074` |
| [Delete an account](privacy/delete-account/README.md) | `L2-072` |
| [Enforce retention limits](privacy/enforce-retention/README.md) | `L2-073` |
| [Export personal data](privacy/export-personal-data/README.md) | `L2-071` |
| [Locate data in Canada and record breaches](privacy/locate-data-and-record-breaches/README.md) | `L2-075` |

## identity-and-security

Accounts and request security: registration, sign-in, tokens, sessions, authorisation, input and transport security, rate limits and security logging.

| Feature | L2 requirements |
|---------|-----------------|
| [Authorise requests](identity-and-security/authorise-requests/README.md) | `L2-079` |
| [Log security events](identity-and-security/log-security-events/README.md) | `L2-084` |
| [Manage sessions](identity-and-security/manage-sessions/README.md) | `L2-078` |
| [Rate limit requests and challenge abusive forms](identity-and-security/rate-limit-and-challenge/README.md) | `L2-082` |
| [Register a customer account](identity-and-security/register-customer/README.md) | `L2-023`, `L2-056`, `L2-070`, `L2-076`, `L2-082` |
| [Sign in](identity-and-security/sign-in/README.md) | `L2-056`, `L2-076`, `L2-078`, `L2-082` |
| [Validate input and secure transport](identity-and-security/validate-input-and-secure-transport/README.md) | `L2-080`, `L2-081` |
| [Verify an email address and reset a password](identity-and-security/verify-email-and-reset-password/README.md) | `L2-077`, `L2-082` |

## platform

Cross-cutting quality and operations: responsive pages, accessibility, performance, health and observability, backup, graceful degradation and the build pipeline.

| Feature | L2 requirements |
|---------|-----------------|
| [Back up and recover](platform/back-up-and-recover/README.md) | `L2-090` |
| [Degrade gracefully](platform/degrade-gracefully/README.md) | `L2-091` |
| [Deliver fast pages](platform/deliver-fast-pages/README.md) | `L2-085`, `L2-086`, `L2-087` |
| [Meet accessibility](platform/meet-accessibility/README.md) | `L2-066`, `L2-067`, `L2-068`, `L2-069` |
| [Monitor health](platform/monitor-health/README.md) | `L2-088`, `L2-089` |
| [Render responsive pages](platform/render-responsive-pages/README.md) | `L2-064`, `L2-065` |
| [Secure build pipeline](platform/secure-build-pipeline/README.md) | `L2-075`, `L2-083` |

## launch

The pre-launch site: a separate, prerendered `launch` application at `/` until launch day, the launch list with double opt-in and one-click removal, the single launch-day email, and the hand-over to the product.

| Feature | L2 requirements |
|---------|-----------------|
| [Confirm the launch list email](launch/confirm-launch-list-email/README.md) | `L2-099` |
| [Join the launch list](launch/join-launch-list/README.md) | `L2-095`, `L2-096`, `L2-097`, `L2-098`, `L2-103`, `L2-104` |
| [Leave the launch list](launch/leave-launch-list/README.md) | `L2-100` |
| [Retire the launch site](launch/retire-launch-site/README.md) | `L2-102` |
| [Send the launch-day email](launch/send-launch-day-email/README.md) | `L2-101` |
| [Serve the launch site](launch/serve-launch-site/README.md) | `L2-092`, `L2-093`, `L2-094`, `L2-105`, `L2-106`, `L2-107` |
