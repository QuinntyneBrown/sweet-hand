import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withXsrfConfiguration } from '@angular/common/http';
import { provideRouter, withInMemoryScrolling } from '@angular/router';
import { BotChallengeService, HttpLaunchListService, LaunchListService, LocalBotChallengeService } from '@sweet-hand/api';
import { routes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes, withInMemoryScrolling({ anchorScrolling: 'enabled', scrollPositionRestoration: 'enabled' })),
    provideClientHydration(),
    provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })),
    { provide: LaunchListService, useClass: HttpLaunchListService },
    // Until a bot-protection provider is chosen (rate-limit-and-challenge design, `<TO SUPPLY>`).
    { provide: BotChallengeService, useClass: LocalBotChallengeService },
  ],
};
