import { type ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideClientHydration } from '@angular/platform-browser';
import { provideHttpClient, withFetch, withXsrfConfiguration } from '@angular/common/http';
import { BotChallengeService, HttpLaunchListService, LaunchListService, LocalBotChallengeService } from '@sweet-hand/api';
import { TurnstileBotChallengeService } from './turnstile-bot-challenge.service';

/**
 * The browser's providers. There is no router: each page is a prerendered file
 * and links between them are ordinary links, which keeps the first load small
 * (L2-105.2). `LaunchApp` picks the page from the address.
 */
export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideClientHydration(),
    provideHttpClient(withFetch(), withXsrfConfiguration({ cookieName: 'XSRF-TOKEN', headerName: 'X-XSRF-TOKEN' })),
    { provide: LaunchListService, useClass: HttpLaunchListService },
    {
      provide: BotChallengeService,
      useFactory: () => LAUNCH_TURNSTILE_SITE_KEY ? new TurnstileBotChallengeService() : new LocalBotChallengeService(),
    },
  ],
};
