/*
 * Public API surface of @sweet-hand/api: every service that talks to the
 * backend, its contract, and the wire models they exchange.
 *
 * Each service has a contract (`ICatererProfileService` and its DI token
 * `CATERER_PROFILE_SERVICE`) and one implementation (`CatererProfileService`).
 * The application registers `{ provide: CATERER_PROFILE_SERVICE, useClass:
 * CatererProfileService }`; pages inject only the token. Models are shared
 * with the fake backend.
 */

export * from './lib/models/account.models';
export * from './lib/models/caterer-page.models';
export * from './lib/models/caterer-profile.models';
export * from './lib/models/discovery.models';
export * from './lib/models/enquiries.models';
export * from './lib/models/identity.models';
export * from './lib/models/metrics.models';
export * from './lib/models/notices.models';
export * from './lib/models/operator-moderation.models';
export * from './lib/models/operator-settings.models';
export * from './lib/models/privacy.models';
export * from './lib/models/reports.models';
export * from './lib/models/reviews.models';
export * from './lib/models/session.models';
export * from './lib/services/account.service.contract';
export * from './lib/services/account.service';
export * from './lib/services/bot-challenge.service.contract';
export * from './lib/services/bot-challenge.service';
export * from './lib/services/caterer-page.service.contract';
export * from './lib/services/caterer-page.service';
export * from './lib/services/caterer-profile.service.contract';
export * from './lib/services/caterer-profile.service';
export * from './lib/services/discovery.service.contract';
export * from './lib/services/discovery.service';
export * from './lib/services/enquiries.service.contract';
export * from './lib/services/enquiries.service';
export * from './lib/services/identity.service.contract';
export * from './lib/services/identity.service';
export * from './lib/services/metrics.service.contract';
export * from './lib/services/metrics.service';
export * from './lib/services/notices.service.contract';
export * from './lib/services/notices.service';
export * from './lib/services/operator-moderation.service.contract';
export * from './lib/services/operator-moderation.service';
export * from './lib/services/operator-settings.service.contract';
export * from './lib/services/operator-settings.service';
export * from './lib/services/privacy.service.contract';
export * from './lib/services/privacy.service';
export * from './lib/services/reports.service.contract';
export * from './lib/services/reports.service';
export * from './lib/services/reviews.service.contract';
export * from './lib/services/reviews.service';
export * from './lib/services/security-key.service.contract';
export * from './lib/services/security-key.service';
export * from './lib/services/session.service.contract';
export * from './lib/services/session.service';

// Declared identically in more than one area; export one.
export type { ProfileStatus } from './lib/models/session.models';
export type { ReportReason } from './lib/models/reports.models';
