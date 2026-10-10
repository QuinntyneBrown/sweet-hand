import { ApplicationConfig, inject, provideAppInitializer, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideHttpClient, withFetch, withInterceptors, withXsrfConfiguration } from '@angular/common/http';
import { systemErrorsInterceptor } from './shell/system-errors.interceptor';
import { provideRouter, withComponentInputBinding, withInMemoryScrolling } from '@angular/router';
import { routes } from './app.routes';
import { DiscoveryApi, HttpDiscoveryApi } from './core/api/discovery-api';
import { HttpSessionApi, SessionApi } from './core/session/session-api';
import { Session } from './core/session/session';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withComponentInputBinding(), withInMemoryScrolling({ scrollPositionRestoration: 'enabled', anchorScrolling: 'enabled' })),
    provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' }), withInterceptors([systemErrorsInterceptor])),
    { provide: SessionApi, useClass: HttpSessionApi },
    { provide: DiscoveryApi, useClass: HttpDiscoveryApi },
    provideAppInitializer(() => inject(Session).load()),
  ],
};
