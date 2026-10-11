import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { systemErrorsInterceptor } from './shell/system-errors.interceptor';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling, withRouterConfig } from '@angular/router';
import { routes } from './app.routes';
import { Session } from './core/session/session';
import { accountProviders } from './features/account/providers';
import { dashboardProviders } from './features/dashboard/providers';
import { discoveryProviders } from './features/discovery/providers';
import { enquiriesProviders } from './features/enquiries/providers';
import { identityProviders } from './features/identity/providers';
import { operatorProviders } from './features/operator/providers';
import { reviewsProviders } from './features/reviews/providers';
import { HttpSessionService, SessionService } from '@sweet-hand/api';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' }), withRouterConfig({ paramsInheritanceStrategy: 'always' })),
    provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }), withInterceptors([systemErrorsInterceptor])),
    { provide: SessionService, useClass: HttpSessionService },
    ...discoveryProviders,
    ...identityProviders,
    ...accountProviders,
    ...enquiriesProviders,
    ...dashboardProviders,
    ...operatorProviders,
    ...reviewsProviders,
    provideAppInitializer(() => inject(Session).load()),
  ],
};
